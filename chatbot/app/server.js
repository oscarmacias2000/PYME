import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import { join, extname, dirname } from 'path';
import { mkdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import { processExcel, generateResultExcel } from './excel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `Eres un asistente de negocios para una PYME mexicana.
Tu especialidad es ayudar con análisis de datos, hojas de cálculo Excel, costos de operación de flota vehicular y combustibles.
Cuando el usuario suba un archivo Excel con datos de diesel o combustible, el sistema lo procesará automáticamente y te dará un resumen con los datos calculados.
Con ese resumen debes explicar los resultados de forma clara, mencionar si hay algo llamativo (por ejemplo un día con gasto muy alto) y dar recomendaciones si aplica.
Responde siempre en español, de forma concisa y amigable. Si el usuario hace preguntas de seguimiento sobre los datos, responde basándote en la información que ya te dieron.
Si no tienes datos suficientes para responder algo con precisión, dilo claramente.`;

// ─── Directorios ──────────────────────────────────────────────────────────
const UPLOAD_DIR  = join(__dirname, 'uploads');
const OUTPUT_DIR  = join(__dirname, 'outputs');
[UPLOAD_DIR, OUTPUT_DIR].forEach(d => mkdirSync(d, { recursive: true }));

// ─── Multer ───────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const allowed = ['.xlsx', '.xls', '.csv'];
    cb(null, allowed.includes(extname(file.originalname).toLowerCase()));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

app.use(express.static('public'));
app.use('/outputs', express.static(OUTPUT_DIR));

// ─── Upload endpoint ──────────────────────────────────────────────────────
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo no válido' });

  try {
    const data = processExcel(req.file.path);
    if (!data) return res.status(422).json({ error: 'No se pudo leer el archivo' });

    const outName = `resultado_${Date.now()}.xlsx`;
    const outPath = join(OUTPUT_DIR, outName);
    generateResultExcel(data, outPath);

    // Limpia el archivo subido
    unlinkSync(req.file.path);

    res.json({ success: true, data, downloadFile: outName });
  } catch (err) {
    console.error('Error procesando Excel:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Socket.io ────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Historial de conversación por sesión
  const history = [];

  socket.on('message', async ({ text }) => {
    if (!text?.trim()) return;
    await chat(socket, history, text);
  });

  // Cuando el frontend sube un Excel y quiere que el bot lo analice
  socket.on('analyze', async ({ data, filename }) => {
    const { summary, dailySummary, weeklySummary, vehicleSummary, cols } = data;

    const colsDetected = Object.entries(cols)
      .map(([k, v]) => `${k}: "${v}"`)
      .join(', ');

    const dayStr = dailySummary.slice(0, 5)
      .map(d => `  ${d.Fecha}: ${d['Litros']} lts / $${d['Gasto ($)']}`)
      .join('\n');

    const weekStr = weeklySummary
      .map(w => `  ${w.Semana}: ${w['Litros']} lts / $${w['Gasto ($)']}`)
      .join('\n');

    const vehStr = vehicleSummary
      .map(v => `  ${v['Vehículo/Unidad']}: ${v['Litros']} lts / $${v['Gasto ($)']}`)
      .join('\n');

    const prompt = `El usuario subió el archivo "${filename}" con datos de combustible/diesel.
El sistema lo procesó automáticamente con estos resultados:

COLUMNAS DETECTADAS: ${colsDetected}

RESUMEN GENERAL:
- Gasto total: $${summary.grandTotal}
- Litros totales: ${summary.totalLitros}
- Días registrados: ${summary.totalDias}
- Promedio diario: $${summary.promedioDiario}
- Promedio semanal: $${summary.promedioSemanal}

DETALLE POR DÍA (primeros 5):
${dayStr || '  (sin datos de fecha)'}

DETALLE POR SEMANA:
${weekStr || '  (sin datos)'}

DETALLE POR VEHÍCULO:
${vehStr || '  (sin distinción de vehículos)'}

Explica estos resultados al usuario de forma clara. Destaca si hay algo notable y da alguna recomendación práctica.`;

    await chat(socket, history, prompt);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// ─── LLM chat (streaming) ─────────────────────────────────────────────────
async function chat(socket, history, userText) {
  history.push({ role: 'user', content: userText });

  try {
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
        ],
      }),
    });

    if (!response.ok) throw new Error(`Ollama ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n').filter(Boolean)) {
        try {
          const d = JSON.parse(line);
          const token = d.message?.content;
          if (token) {
            fullResponse += token;
            socket.emit('token', { text: token });
          }
          if (d.done) socket.emit('done', { fullText: fullResponse });
        } catch {}
      }
    }

    history.push({ role: 'assistant', content: fullResponse });
  } catch (err) {
    console.error('Ollama error:', err.message);
    socket.emit('error', { message: 'Error al conectar con el modelo. ¿Está Ollama corriendo?' });
  }
}

server.listen(PORT, () => {
  console.log(`Chatbot → http://localhost:${PORT}  |  Modelo: ${MODEL}`);
});
