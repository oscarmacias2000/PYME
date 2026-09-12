import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import multer from 'multer';
import { join, extname, dirname } from 'path';
import { mkdirSync, unlinkSync, readdirSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { processExcel, generateResultExcel, appendToFieldReport } from './excel.js';
import { guardarFila, inicializarHojas } from './sheets.js';
import ExcelJS from 'exceljs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Directorios — declarados aquí para que las funciones de abajo los usen
const UPLOAD_DIR = join(__dirname, 'uploads');
const OUTPUT_DIR = join(__dirname, 'outputs');
[UPLOAD_DIR, OUTPUT_DIR].forEach(d => mkdirSync(d, { recursive: true }));

const app    = express();
const server = createServer(app);
const io     = new Server(server);

const anthropic    = new Anthropic({
  apiKey: (process.env.ANTHROPIC_API_KEY || '').trim(),
  defaultHeaders: process.env.ANTHROPIC_WORKSPACE_ID
    ? { 'anthropic-workspace-id': process.env.ANTHROPIC_WORKSPACE_ID }
    : {},
});
const CLAUDE_MODEL = 'claude-opus-5';
const PORT         = process.env.PORT || 3000;

function getSystemPrompt() {
  const hoy = new Date().toISOString().slice(0, 10);
  const hoyLargo = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return `# Rol y Contexto
Eres un asistente especializado en la gestión de reportes de campo para una empresa agrícola. Tu función principal es procesar las solicitudes de los usuarios (clientes o supervisores) para **actualizar o generar nuevos reportes en un archivo de Excel**, basándote en la estructura del archivo maestro.

La información del cliente puede llegar por **texto o voz** (transcrita a texto). Tu tarea es interpretar la solicitud y transformarla en una acción sobre el libro de Excel.

FECHA ACTUAL DEL SISTEMA: ${hoy} (${hoyLargo}). Usa SIEMPRE esta fecha cuando el usuario no especifique una diferente. NUNCA uses fechas de tu entrenamiento.

# Estructura del Archivo Maestro "Reporte campo 3.0.xlsx"

## Hoja 1: Catálogos (Datos Maestros — no modificar salvo indicación explícita)
| Columna | Descripción |
| :--- | :--- |
| A (Maquinaria) | JD 5076E, MF 285… |
| B (Operadores) | Nombres de operadores |
| C (Actividades) | Riego, Poda, Fertilización… |
| D (Ubicacion) | Pedregoza, Villa Unión… |
| E (Responsables) | Nombres de responsables |
| F (Tipo de Combustible) | Diésel, Gasolina |
| G (Motivo de Incidencia) | Clima, Falta de personal, Falla de maquinaria |
| H (Implementos) | Rastra, Subsolador, Aspersora… |
| I (Huerta) | La Adulta, Arroyo 1… |

## Hoja 2: Rendimiento Diario Jornal (más frecuente)
| Columna | Descripción |
| :--- | :--- |
| A (Fecha) | YYYY-MM-DD |
| B (Actividad) | Poda, Riego, Fertilización… |
| C (Ubicacion) | Pedregoza, Villa Unión… |
| D (Huerta) | Los Tamarindos, Arroyo 1… |
| E (Responsable) | Nombre |
| F (N° de Personas) | Número de trabajadores |
| G (Cantidad Realizada) | Ej. 492 |
| H (Unidad de Medida) | Árboles, Hectáreas… |
| I (Meta de Rendimiento jornal) | Meta esperada |
| J (Margen) | **Calculado**: G - I (no llenar) |
| K (% Cumplimiento) | **Calculado**: G / I (no llenar) |
| L (¿Incidencia?) | Sí / No |
| M (Motivo de Incidencia) | Si aplica |
| N (Observaciones) | Notas |

## Hoja 3: Maquinaria
| Columna | Descripción |
| :--- | :--- |
| A (Fecha) | YYYY-MM-DD |
| B (Equipo) | Tractor 01… |
| C (Implemento) | Desvaradora… |
| D (Tipo Comb.) | Diésel, Gasolina |
| E (Actividad) | Desbarado… |
| F (Ubicación) | Pedregoza… |
| G (Huerta) | Arroyo 1… |
| H (Responsable) | Nombre |
| I (Litros) | Combustible cargado |
| J (Precio/L) | Precio por litro |
| K (Costo Total) | **Calculado**: I * J (no llenar) |
| L (Avance ha) | Rendimiento en hectáreas |
| M (Observaciones) | Notas |

## Hoja 4: Insumos
| Columna | Descripción |
| :--- | :--- |
| A (Fecha) | YYYY-MM-DD |
| B (Recurso/Insumo) | fertilizante granulado… |
| C (Cantidad) | Ej. 1175 |
| D (Unidad de Medida) | kg, L, pza |
| E (Motivo de Uso) | Fertilización programada… |
| F (Actividad) | Fertilización… |
| G (Huerta) | Los Tamarindos… |
| H (Costo por Unidad) | Precio unitario |
| I (Costo Total) | **Calculado**: C * H (no llenar) |
| J (Responsable) | Nombre |

## Hoja 5: Resumen Semanal
No escribir en esta hoja; sus fórmulas se actualizan solas.

# Reglas de Actuación
1. **Interpretación**: Analiza la solicitud para determinar qué acción tomar y en qué hoja.
2. **Validación**: Verifica los valores contra los Catálogos. Si algo no existe, pregunta si desea agregarlo o si fue un error.
3. **Acciones permitidas**:
   - **Agregar registro** en Rendimiento, Maquinaria o Insumos.
   - **Consultar** datos (responder en texto, sin generar Excel).
   - **Generar archivo Excel** solo si el usuario lo pide explícitamente.
4. **Fechas**: siempre en formato YYYY-MM-DD. Usa la FECHA ACTUAL DEL SISTEMA si no se menciona otra.
5. **Confirmación**: al finalizar, confirma al usuario qué registró, con los datos clave en formato tabla markdown.

# Formato de respuesta al registrar
**Hoja: [Nombre de la hoja] (Nuevo Registro)**
| A (Fecha) | B (Actividad) | … |
| 2026-08-28 | Poda | … |

Responde siempre en español, de forma concisa.

# Ejemplos de Solicitudes y Cómo Actuar

**Ejemplo 1 — Rendimiento:**
Usuario: "Agrega un registro de hoy para la poda en Los Tamarindos, con Carlos Verde, 10 personas, 530 árboles realizados y sin incidencias."
Acción: Agregar fila en Rendimiento Diario Jornal. Fecha = hoy. Meta estándar de poda = 500 árboles (contexto). Dejar J y K en blanco (calculadas).
Confirmación:
| A (Fecha) | B (Actividad) | C (Ubicacion) | D (Huerta) | E (Responsable) | F (N° Personas) | G (Cantidad) | H (Unidad) | I (Meta) | L (Incidencia) |
| ${hoy} | Poda | — | Los Tamarindos | Carlos Verde | 10 | 530 | Árboles | 500 | No |

**Ejemplo 2 — Generar Excel semanal:**
Usuario: "Genera un reporte nuevo en Excel para la semana del 24 al 30 de agosto de 2026, con todos los registros de poda."
Acción: Crear nuevo archivo con las 5 hojas. Agregar a Rendimiento Diario Jornal los registros de poda de esa semana. Hoja Resumen Semanal se deja con fórmulas (no editar).

**Ejemplo 3 — Maquinaria:**
Usuario: "Reporta que el tractor 01 consumió 50 litros de diésel hoy, en el desbarado de Arroyo 1, responsable Victor Manuel."
Acción: Agregar fila en Maquinaria. Implemento = Desvaradora (catálogo). Dejar K (Costo Total) en blanco, es calculada.
| A (Fecha) | B (Equipo) | C (Implemento) | D (Tipo Comb.) | E (Actividad) | F (Ubicación) | G (Huerta) | H (Responsable) | I (Litros) |
| ${hoy} | Tractor 01 | Desvaradora | Diésel | Desbarado | — | Arroyo 1 | Victor Manuel Jara Peinado | 50 |`;
}

// ─── OpenAI-compatible API (para Open WebUI) ─────────────────────────────
app.use(express.json());

app.get('/v1/models', (_, res) => {
  res.json({
    object: 'list',
    data: [{ id: CLAUDE_MODEL, object: 'model', owned_by: 'anthropic' }],
  });
});

app.post('/v1/chat/completions', async (req, res) => {
  const { messages = [], stream = false } = req.body;

  // Guardar en Excel diario sin depender de Ollama
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  if (lastUser && KEYWORDS_SHEETS.test(lastUser)) {
    registrarEnExcel(lastUser).catch(e => console.error('[Excel]', e.message));
  }

  try {
    const result = await claudeChat(messages);

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      const id = `chatcmpl-${Date.now()}`;
      for (const char of result) {
        res.write(`data: ${JSON.stringify({ id, object: 'chat.completion.chunk', choices: [{ index: 0, delta: { content: char }, finish_reason: null }] })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      res.json({ id: `chatcmpl-${Date.now()}`, object: 'chat.completion', model: MODEL, choices: [{ index: 0, message: { role: 'assistant', content: result }, finish_reason: 'stop' }] });
    }
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// ─── Claude chat (non-streaming, para /v1/chat/completions de OpenWebUI) ─
async function claudeChat(messages) {
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  if (KEYWORDS_SHEETS.test(lastUser)) {
    detectarYGuardar(lastUser).catch(() => {});
  }

  const userMessages = messages.filter(m => m.role !== 'system');
  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: getSystemPrompt(),
    messages: userMessages,
  });

  return response.content.find(b => b.type === 'text')?.text || '';
}

// Keywords que indican intención de registrar datos — evita llamada extra al modelo
const KEYWORDS_SHEETS = /registr|anot|guard|diesel|gasolina|combustible|litros?|lts?|tractor|maquinaria|implemento|huerta|poda|riego|cosecha|fumigaci|fertiliz|insumo|rendimiento|jornal|personas?|árboles?|avance|incidencia|responsable|ubicaci/i;

// Registro directo en Excel sin usar Ollama
async function registrarEnExcel(texto) {
  const hoy = new Date().toISOString().slice(0, 10);

  // ── Categoría ──────────────────────────────────────────────────────────
  let categoria = 'maquinaria';
  if (/poda|riego|cosecha|fumigaci|jornal|personas?|rendimiento|personal|deschuponado|aclareo/i.test(texto)) categoria = 'rendimiento';
  else if (/fertiliz|insumo|agroquim|herbicida|fungicida|insecticida|nutriente/i.test(texto)) categoria = 'insumos';
  else if (/semana|resumen\s+semanal/i.test(texto)) categoria = 'resumen';

  // ── Extraer actividad ──────────────────────────────────────────────────
  const actividadMatch = texto.match(/\b(poda(?:do|dos)?|riego|cosecha|fumigaci[oó]n|desbarado|deschuponado|aclareo|fertilizaci[oó]n|transplante|siembra|limpieza|deshierbe|aplicaci[oó]n)\b/i);

  // ── Extraer huerta (después de "huerta", "en huerta", "bloque", etc.) ──
  const huertaMatch = texto.match(/(?:huerta|bloque|lote|predio|parcela|rancho)\s+([A-Za-z0-9áéíóúÁÉÍÓÚñÑ\s\-]+?)(?:\s*,|\s+con|\s+de|\s+responsable|\s+\d|$)/i);

  // ── Extraer responsable (nombre propio después de "responsable:", "cargo:", etc.) ──
  const responsableMatch = texto.match(/(?:responsable|cargo|encargado|operador)[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i)
    || texto.match(/(?:lo hizo|operó|trabajó)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i);

  // ── Extraer equipo/tractor ─────────────────────────────────────────────
  const equipoMatch = texto.match(/\b(JD|John\s+Deere|Massey|Case|NH|tractor|excavadora|retroexcavadora)\s*([A-Z0-9\s\-]*)/i);

  // ── Extraer implemento ────────────────────────────────────────────────
  const implementoMatch = texto.match(/\b(desvaradora|rastra|arado|fumigadora|aspersora|podadora|cortadora|sembradora)\b/i);

  // ── Números ────────────────────────────────────────────────────────────
  const litrosMatch   = texto.match(/(\d+(?:\.\d+)?)\s*(?:litros?|lts?)/i);
  const precioMatch   = texto.match(/\$?\s*(\d+(?:\.\d+)?)\s*(?:por litro|\/litro|por\s+lt)/i);
  const haMatch       = texto.match(/(\d+(?:\.\d+)?)\s*(?:ha|hectáreas?)/i);
  const personasMatch = texto.match(/(\d+)\s*(?:personas?|jornaleros?|trabajadores?)/i);
  const cantidadMatch = texto.match(/(\d+(?:\.\d+)?)\s*(?:á?rboles?|plants?|kg|toneladas?)/i);
  const unidadMatch   = cantidadMatch?.[0]?.match(/(?:árboles?|plants?|kg|toneladas?)/i);

  // ── Incidencia ─────────────────────────────────────────────────────────
  const incidencia = /incidencia|falt[oó]|ausent|accidente|lluvia|problem|avería|falla/i.test(texto) ? 'Sí' : 'No';
  const motivoMatch = texto.match(/(?:por|debido a|causa)\s+(.{5,60}?)(?:\.|,|$)/i);

  // ── Tipo combustible ───────────────────────────────────────────────────
  const combMatch = texto.match(/\b(di[eé]sel|gasolina|gas|magna|premium)\b/i);

  const datos = {
    fecha: hoy,
    observaciones: texto.slice(0, 250),
    ...(actividadMatch  ? { actividad: actividadMatch[1].toLowerCase() } : {}),
    ...(huertaMatch     ? { huerta: huertaMatch[1].trim() } : {}),
    ...(responsableMatch ? { responsable: responsableMatch[1].trim() } : {}),
    ...(litrosMatch     ? { litros: parseFloat(litrosMatch[1]) } : {}),
    ...(precioMatch     ? { precio_litro: parseFloat(precioMatch[1]) } : {}),
    ...(haMatch         ? { avance_ha: parseFloat(haMatch[1]) } : {}),
    ...(personasMatch   ? { num_personas: parseInt(personasMatch[1]) } : {}),
    ...(cantidadMatch   ? { cantidad_realizada: parseFloat(cantidadMatch[1]) } : {}),
    ...(unidadMatch     ? { unidad_medida: unidadMatch[0] } : {}),
    ...(equipoMatch     ? { equipo: equipoMatch[0].trim() } : {}),
    ...(implementoMatch ? { implemento: implementoMatch[1] } : {}),
    ...(combMatch       ? { tipo_combustible: combMatch[1] } : {}),
    ...(categoria === 'rendimiento' ? { incidencia, ...(incidencia === 'Sí' && motivoMatch ? { motivo_incidencia: motivoMatch[1].trim() } : {}) } : {}),
  };

  if (datos.litros && datos.precio_litro) {
    datos.costo_total = +(datos.litros * datos.precio_litro).toFixed(2);
  }

  const outPath = join(OUTPUT_DIR, `reporte_campo_${hoy}.xlsx`);
  console.log(`[Excel] guardando categoria="${categoria}" en ${outPath}`, JSON.stringify(datos).slice(0, 120));
  await appendToFieldReport(categoria, datos, outPath);
  console.log('[Excel] OK');
}

// Detecta y guarda datos solo si hay keywords — una sola llamada al modelo
async function detectarYGuardar(texto) {
  if (!KEYWORDS_SHEETS.test(texto)) return null;

  const hoy = new Date().toLocaleDateString('es-MX');
  const extractPrompt = `Extrae datos del siguiente mensaje para registrar en Google Sheets de operaciones agrícolas.
Responde SOLO con JSON válido o con null si no hay datos para registrar.

Categorías y sus campos:
- "maquinaria": {"fecha","equipo","implemento","tipo_combustible","actividad","ubicacion","huerta","responsable","litros","precio_litro","costo_total","avance_ha","observaciones"}
- "rendimiento": {"fecha","actividad","ubicacion","huerta","responsable","num_personas","cantidad_realizada","unidad_medida","meta_jornal","margen","pct_cumplimiento","incidencia","motivo_incidencia","observaciones"}
- "insumos": {"fecha","recurso","cantidad","unidad_medida","motivo_uso","actividad","huerta","costo_unitario","costo_total","responsable"}
- "resumen": {"semana_del","al","actividad","huerta","responsable","total_personas","total_cantidad","unidad","observaciones"}

Fecha de hoy: ${hoy}. Usa hoy si no se menciona fecha.
Ejemplo: {"categoria":"maquinaria","datos":{"fecha":"${hoy}","equipo":"JD 5076E","tipo_combustible":"Diésel","actividad":"Desbarado","litros":50}}

Mensaje: "${texto}"`;

  try {
    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content: extractPrompt }],
    });
    const content = res.content.find(b => b.type === 'text')?.text || '';
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) return null;

    const parsed = JSON.parse(match[0]);
    const { tab, fila } = await guardarFila(parsed.categoria, parsed.datos);

    // Acumula en Excel diario en outputs/
    try {
      const hoyISO = new Date().toISOString().slice(0, 10);
      const outPath = join(OUTPUT_DIR, `reporte_campo_${hoyISO}.xlsx`);
      await appendToFieldReport(parsed.categoria, parsed.datos, outPath);
    } catch {}

    return `"${tab}": ${fila.filter(Boolean).join(' | ')}`;
  } catch {
    return null;
  }
}

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

// ─── CORS para el frontend Expo ───────────────────────────────────────────
function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
app.options('/api/*', (_, res) => { corsHeaders(res); res.sendStatus(204); });


// GET /api/reportes/lista — archivos xlsx disponibles
app.get('/api/reportes/lista', (_, res) => {
  corsHeaders(res);
  try {
    const archivos = readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.xlsx'))
      .map(f => {
        const stat = statSync(join(OUTPUT_DIR, f));
        return { nombre: f, fecha: stat.mtime.toISOString(), url: `/outputs/${f}` };
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    res.json({ ok: true, archivos });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/reportes/sheets?nombre=reporte_campo_xxx.xlsx
// Devuelve { ok, hojas: { [nombre]: { columnas, filas } } }
app.get('/api/reportes/sheets', async (req, res) => {
  corsHeaders(res);
  const nombre = req.query.nombre;
  if (!nombre) return res.status(400).json({ ok: false, error: 'Falta ?nombre=' });

  const filepath = join(OUTPUT_DIR, nombre);
  try {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(filepath);

    const hojas = {};
    wb.eachSheet((ws) => {
      const filas = [];
      let columnas = [];
      ws.eachRow({ includeEmpty: false }, (row, idx) => {
        const vals = row.values.slice(1).map(v => {
          if (v === null || v === undefined) return null;
          if (typeof v === 'object' && v.result !== undefined) return v.result ?? null;
          if (typeof v === 'object' && v instanceof Date) return v.toISOString().slice(0, 10);
          return v;
        });
        if (idx === 1) { columnas = vals.map(v => String(v ?? '')); }
        else { filas.push(vals); }
      });
      // Filtrar filas completamente vacías
      const filasFiltradas = filas.filter(f => f.some(v => v !== null && v !== ''));
      hojas[ws.name] = { columnas, filas: filasFiltradas };
    });

    res.json({ ok: true, nombre, hojas });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Lista de reportes generados
app.get('/reportes', (_, res) => {
  try {
    const archivos = readdirSync(OUTPUT_DIR)
      .filter(f => f.endsWith('.xlsx'))
      .map(f => {
        const stat = statSync(`${OUTPUT_DIR}/${f}`);
        return { nombre: f, fecha: stat.mtime.toLocaleString('es-MX'), url: `/outputs/${f}` };
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const dlIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 -960 960 960" width="14" fill="currentColor"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>`;
    const filas = archivos.map(a => {
      const tipo = a.nombre.startsWith('reporte_campo')
        ? `<span class="badge badge-campo">Campo</span>`
        : `<span class="badge badge-result">Análisis</span>`;
      return `<tr><td>${a.nombre}</td><td>${tipo}</td><td>${a.fecha}</td><td><a class="dl-btn" href="${a.url}" download>${dlIcon} Descargar</a></td></tr>`;
    }).join('');

    res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Reportes — PYME Agrícola</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
  <style>
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Inter',system-ui,sans-serif;background:#0D1117;color:#E6EDF3;min-height:100vh;padding:0}
    .header{background:linear-gradient(135deg,#145A32,#1F6FEB);padding:32px 40px;display:flex;align-items:center;gap:18px}
    .header-icon{font-size:2.4rem}
    .header-text h1{font-size:1.4rem;font-weight:700;color:#fff}
    .header-text p{font-size:0.85rem;color:rgba(255,255,255,.75);margin-top:3px}
    .content{padding:32px 40px}
    .stats{display:flex;gap:16px;margin-bottom:28px;flex-wrap:wrap}
    .stat{background:#161B22;border:1px solid #21262D;border-radius:12px;padding:16px 22px;flex:1;min-width:140px}
    .stat .n{font-size:1.8rem;font-weight:700;color:#3FB950}
    .stat .l{font-size:0.78rem;color:#7D8590;margin-top:2px}
    table{width:100%;border-collapse:collapse;background:#161B22;border-radius:12px;overflow:hidden;border:1px solid #21262D}
    thead tr{background:#1C2128}
    th{padding:13px 18px;text-align:left;font-size:0.8rem;font-weight:600;color:#7D8590;text-transform:uppercase;letter-spacing:.05em}
    td{padding:13px 18px;font-size:0.875rem;border-top:1px solid #21262D;color:#E6EDF3}
    tr:hover td{background:#1C2128}
    .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:0.75rem;font-weight:500}
    .badge-campo{background:#0D2318;color:#3FB950;border:1px solid #1A4731}
    .badge-result{background:#0D1B30;color:#3B82F6;border:1px solid #1A2F52}
    .dl-btn{display:inline-flex;align-items:center;gap:6px;background:#2EA043;color:#fff;padding:6px 14px;border-radius:8px;text-decoration:none;font-size:0.8rem;font-weight:600;transition:background .15s}
    .dl-btn:hover{background:#3FB950}
    .dl-btn svg{flex-shrink:0}
    .empty{text-align:center;padding:60px 20px;color:#7D8590}
    .empty p{margin-top:8px;font-size:0.875rem}
    .back{display:inline-flex;align-items:center;gap:6px;color:#7D8590;text-decoration:none;font-size:0.82rem;margin-bottom:20px;transition:color .15s}
    .back:hover{color:#E6EDF3}
  </style>
</head>
<body>
<div class="header">
  <div class="header-icon">🌾</div>
  <div class="header-text">
    <h1>PYME Agrícola — Reportes de Campo</h1>
    <p>Archivos Excel generados por el asistente · ${new Date().toLocaleDateString('es-MX',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
  </div>
</div>
<div class="content">
  <a href="/" class="back">← Volver al chat</a>
  <div class="stats">
    <div class="stat"><div class="n">${archivos.length}</div><div class="l">Reportes generados</div></div>
    <div class="stat"><div class="n">${archivos.filter(a=>a.nombre.startsWith('reporte_campo')).length}</div><div class="l">Reportes de campo</div></div>
    <div class="stat"><div class="n">${archivos.filter(a=>a.nombre.startsWith('resultado')).length}</div><div class="l">Análisis de Excel</div></div>
  </div>
  ${archivos.length
    ? `<table>
        <thead><tr><th>Archivo</th><th>Tipo</th><th>Modificado</th><th>Descargar</th></tr></thead>
        <tbody>${filas}</tbody>
       </table>`
    : `<div class="empty"><div style="font-size:3rem">📂</div><p>No hay reportes aún.<br>Envía datos por el chat para generar el primer reporte.</p></div>`}
</div>
</body>
</html>`);
  } catch {
    res.status(500).send('Error leyendo reportes');
  }
});

// ─── Upload Excel ─────────────────────────────────────────────────────────
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Archivo no válido' });
  try {
    const data = processExcel(req.file.path);
    if (!data) return res.status(422).json({ error: 'No se pudo leer el archivo' });
    const outName = `resultado_${Date.now()}.xlsx`;
    generateResultExcel(data, join(OUTPUT_DIR, outName));
    unlinkSync(req.file.path);
    res.json({ success: true, data, downloadFile: outName });
  } catch (err) {
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
    const { summary, dailySummary, weeklySummary, vehicleSummary } = data;
    const dayStr  = dailySummary.slice(0, 5).map(d => `  ${d.Fecha}: ${d['Litros']} lts / $${d['Gasto ($)']}`).join('\n');
    const weekStr = weeklySummary.map(w => `  ${w.Semana}: ${w['Litros']} lts / $${w['Gasto ($)']}`).join('\n');
    const vehStr  = vehicleSummary.map(v => `  ${v['Vehículo/Unidad']}: ${v['Litros']} lts / $${v['Gasto ($)']}`).join('\n');
    const prompt  = `Archivo "${filename}" procesado. Gasto total $${summary.grandTotal} | ${summary.totalLitros} lts | Promedio diario $${summary.promedioDiario} | Semanal $${summary.promedioSemanal}\nDÍA:${dayStr}\nSEMANA:${weekStr}\nVEHÍCULO:${vehStr}\nExplica y da una recomendación.`;
    await chat(socket, history, prompt);
  });

  socket.on('disconnect', () => console.log('Desconectado:', socket.id));
});

// ─── Chat Socket.io con Claude streaming ─────────────────────────────────
async function chat(socket, history, userText) {
  history.push({ role: 'user', content: userText });

  // Guardado en Sheets + Excel diario en paralelo — no bloquea la respuesta del chat
  if (KEYWORDS_SHEETS.test(userText)) {
    registrarEnExcel(userText).catch(e => console.error('[Excel]', e.message));
    detectarYGuardar(userText).then(resultado => {
      if (resultado) socket.emit('saved', { confirmacion: resultado });
    }).catch(() => {});
  }

  try {
    let fullResponse = '';

    const stream = anthropic.messages.stream({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: getSystemPrompt(),
      messages: history,
    });

    stream.on('text', (text) => {
      fullResponse += text;
      socket.emit('token', { text });
    });

    await stream.finalMessage();
    socket.emit('done', { fullText: fullResponse });
    history.push({ role: 'assistant', content: fullResponse });
  } catch (err) {
    console.error('Claude error:', err.message);
    socket.emit('error', { message: `Error: ${err.message}` });
  }
}

// ─── Arranque ─────────────────────────────────────────────────────────────
await inicializarHojas();

server.listen(PORT, async () => {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  console.log(`Chatbot → http://localhost:${PORT}  |  Modelo: ${CLAUDE_MODEL}`);
  console.log(`ANTHROPIC_API_KEY: ${apiKey ? 'SÍ ✓' : 'NO ✗ — agrega la key en .env'}`);
  try {
    const r = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 5,
      messages: [{ role: 'user', content: 'hola' }],
    });
    console.log('Claude test: OK ✓');
  } catch (e) {
    console.error('Claude test FALLÓ:', e.message);
  }
});
