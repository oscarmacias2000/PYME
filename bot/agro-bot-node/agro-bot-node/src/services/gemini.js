const axios = require('axios');
const config = require('../config');
const metricas = require('./metricas');
const {
  construirPromptTexto,
  construirPromptAudio,
  construirPromptTablaForzada,
  construirPromptTablaForzadaAudio,
  construirPromptConsultaForzada,
  construirPromptConsultaForzadaAudio,
} = require('../prompt');
const {
  parsearRespuestaAuto,
  parsearRespuestaForzada,
  parsearRespuestaConsulta,
} = require('../lib/parsearRespuestaIA');

// El modelo puede venir por llamada (el usuario lo elige en el compositor de la pagina);
// si no viene, se usa el del .env. Asi se puede probar otro modelo sin reiniciar nada.
const modeloDe = (modelo) => modelo || config.gemini.model;
const GEMINI_URL = (modelo) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${modeloDe(modelo)}:generateContent`;

// Nota: las API keys nuevas de Google AI Studio empiezan con "AQ." (en vez de "AIzaSy...")
// y no funcionan bien como query param (?key=...). Por eso se manda como header,
// igual que se configuro en el flujo de n8n (httpHeaderAuth con "x-goog-api-key").
function headers() {
  return {
    'Content-Type': 'application/json',
    'x-goog-api-key': config.gemini.apiKey,
  };
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gemini a veces regresa 503 "high demand" o 429 "rate limit" cuando el modelo esta
// saturado por trafico de Google (no es un error nuestro). Se reintenta unas veces
// con espera progresiva antes de rendirse, para que no le salga error al usuario del
// bot por una saturacion pasajera de unos segundos. Ver llamarGeminiCrudo() mas abajo.

function limpiarYParsear(raw) {
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    return null;
  }
}

// Nota: parsearRespuestaAuto/Forzada/Consulta ahora viven en lib/parsearRespuestaIA.js
// (compartidas con services/claude.js) -- si el JSON viene invalido/vacio, caen en un
// resultado "no_identificada" en vez de tronar, igual que antes.

// --- Automatico (WhatsApp): Gemini decide la tabla o si es consulta ---

async function clasificarTexto(textoBody, modelo) {
  const prompt = construirPromptTexto(textoBody);
  const { data, raw } = await llamarGeminiCrudo([{ text: prompt }], modelo);
  return parsearRespuestaAuto(data, raw);
}

async function clasificarAudio(audioBase64, mimeType, modelo) {
  const prompt = construirPromptAudio();
  const { data, raw } = await llamarGeminiCrudo([
    { text: prompt },
    { inline_data: { mime_type: mimeType || 'audio/ogg', data: audioBase64 } },
  ], modelo);
  return parsearRespuestaAuto(data, raw);
}

// --- Forzado (pagina web, botones "Agregar Datos" por tabla) ---

async function extraerCamposTablaForzada(tabla, textoBody, modelo) {
  const prompt = construirPromptTablaForzada(tabla, textoBody);
  const { data, raw } = await llamarGeminiCrudo([{ text: prompt }], modelo);
  return parsearRespuestaForzada(data, raw);
}

async function extraerCamposTablaForzadaAudio(tabla, audioBase64, mimeType, modelo) {
  const prompt = construirPromptTablaForzadaAudio(tabla);
  const { data, raw } = await llamarGeminiCrudo([
    { text: prompt },
    { inline_data: { mime_type: mimeType || 'audio/ogg', data: audioBase64 } },
  ], modelo);
  return parsearRespuestaForzada(data, raw);
}

// --- Forzado (pagina web, botones "Leer / Preguntar" por tabla) ---

async function extraerConsultaForzada(tabla, textoBody, modelo) {
  const prompt = construirPromptConsultaForzada(tabla, textoBody);
  const { data, raw } = await llamarGeminiCrudo([{ text: prompt }], modelo);
  return parsearRespuestaConsulta(data, raw);
}

async function extraerConsultaForzadaAudio(tabla, audioBase64, mimeType, modelo) {
  const prompt = construirPromptConsultaForzadaAudio(tabla);
  const { data, raw } = await llamarGeminiCrudo([
    { text: prompt },
    { inline_data: { mime_type: mimeType || 'audio/ogg', data: audioBase64 } },
  ], modelo);
  return parsearRespuestaConsulta(data, raw);
}

// Variante de llamarGemini que regresa el JSON crudo (o null si no se pudo parsear)
// junto con el texto original, para que cada parseador de arriba decida el formato.
async function llamarGeminiCrudo(parts, modelo, intento = 1) {
  const MAX_INTENTOS = 3;
  const body = { contents: [{ parts }] };
  // Se mide cada intento por separado (un 503 con reintento cuenta como 2 llamadas),
  // que es justo lo que interesa ver en el panel de monitoreo.
  const t0 = Date.now();
  try {
    const { data: respuesta } = await axios.post(GEMINI_URL(modelo), body, { headers: headers() });
    metricas.registrarLlamada({
      proveedor: 'gemini', modelo: modeloDe(modelo), ok: true, ms: Date.now() - t0,
    });
    const raw = respuesta?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return { data: limpiarYParsear(raw), raw };
  } catch (e) {
    const status = e.response?.status;
    metricas.registrarLlamada({
      proveedor: 'gemini',
      modelo: modeloDe(modelo),
      ok: false,
      ms: Date.now() - t0,
      estado: status,
      mensaje: e.response?.data?.error?.message || e.message,
    });

    // 429 = se acabo la cuota del plan (por minuto o por dia). Reintentar de inmediato
    // no sirve: la cuenta regresiva de Google tarda decenas de segundos en resetear, asi
    // que reintentar rapido solo gasta otra peticion contra la misma cuota agotada. En
    // vez de eso se avienta un error especial (con el tiempo de espera si Google lo manda)
    // para que el que llama le muestre al usuario un mensaje claro en vez del JSON crudo.
    if (status === 429) {
      const detalles = e.response?.data?.error?.details || [];
      const retryInfo = detalles.find((d) => String(d['@type'] || '').includes('RetryInfo'));
      const segundosEspera = retryInfo?.retryDelay ? parseFloat(retryInfo.retryDelay) : null;
      const errorCuota = new Error('Limite de uso de Gemini alcanzado (cuota del plan).');
      errorCuota.esCuotaExcedida = true;
      errorCuota.segundosEspera = segundosEspera;
      throw errorCuota;
    }

    // 503 = el modelo esta saturado por trafico de Google en ese momento (no es cuota
    // nuestra) -- aqui si vale la pena reintentar un par de veces con espera corta.
    const esTemporal = status === 503;
    if (esTemporal && intento < MAX_INTENTOS) {
      const espera = 1500 * intento;
      console.log(`Gemini ocupado (${status}), reintentando en ${espera}ms... (intento ${intento + 1}/${MAX_INTENTOS})`);
      await esperar(espera);
      return llamarGeminiCrudo(parts, modelo, intento + 1);
    }
    throw e;
  }
}

module.exports = {
  clasificarTexto,
  clasificarAudio,
  extraerCamposTablaForzada,
  extraerCamposTablaForzadaAudio,
  extraerConsultaForzada,
  extraerConsultaForzadaAudio,
};
