import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import { join, extname, dirname } from 'path';
import { mkdirSync, unlinkSync } from 'fs';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import { processExcel, generateResultExcel } from './excel.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const PORT = process.env.PORT || 3000;

const SYSTEM_PROMPT = `Eres un asistente de negocios para una PYME mexicana.
Tu especialidad es ayudar con análisis de datos, hojas de cálculo Excel, costos de operación de flota vehicular y combustibles.
Cuando el usuario suba un archivo Excel con datos de diesel o combustible, el sistema lo procesará automáticamente y te dará un resumen con los datos calculados.
Con ese resumen debes explicar los resultados de forma clara, mencionar si hay algo llamativo (por ejemplo un día con gasto muy alto) y dar recomendaciones si aplica.
Responde siempre en español, de forma concisa y amigable.`;

// ─── Directorios ──────────────────────────────────────────────────────────
const UPLOAD_DIR = join(__dirname, 'uploads');
const OUTPUT_DIR = join(__dirname, 'outputs');
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
  const history = [];

  socket.on('message', async ({ text }) => {
    if (!text?.trim()) return;
    await chat(socket, history, text);
  });

  socket.on('analyze', async ({ data, filename }) => {
    const { summary, dailySummary, weeklySummary, vehicleSummary, cols } = data;

    const colsDetected = Object.entries(cols).map(([k, v]) => `${k}: "${v}"`).join(', ');

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
Resultados del procesamiento automático:

COLUMNAS DETECTADAS: ${colsDetected}

RESUMEN:
- Gasto total: $${summary.grandTotal}
- Litros totales: ${summary.totalLitros}
- Días registrados: ${summary.totalDias}
- Promedio diario: $${summary.promedioDiario}
- Promedio semanal: $${summary.promedioSemanal}

POR DÍA (primeros 5):
${dayStr || '  (sin fechas)'}

POR SEMANA:
${weekStr || '  (sin datos)'}

POR VEHÍCULO:
${vehStr || '  (sin distinción)'}

Explica estos resultados al usuario de forma clara y da una recomendación práctica.`;

    await chat(socket, history, prompt);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// ─── Chat con Groq (streaming) ────────────────────────────────────────────
async function chat(socket, history, userText) {
  history.push({ role: 'user', content: userText });

  try {
    const stream = await groq.chat.completions.create({
      model: MODEL,
      stream: true,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history,
      ],
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || '';
      if (token) {
        fullResponse += token;
        socket.emit('token', { text: token });
      }
    }

    socket.emit('done', { fullText: fullResponse });
    history.push({ role: 'assistant', content: fullResponse });

  } catch (err) {
    console.error('Groq error:', err.message);
    socket.emit('error', { message: 'Error al conectar con Groq. Verifica tu API key.' });
  }
}

server.listen(PORT, () => {
  console.log(`Chatbot → http://localhost:${PORT}  |  Modelo: ${MODEL}`);
});
