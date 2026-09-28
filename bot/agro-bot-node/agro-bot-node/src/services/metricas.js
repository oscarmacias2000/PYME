// Registro en memoria de las llamadas a los modelos de IA (Gemini / Claude), para el
// panel de monitoreo (/monitoreo -> routes/monitoreo.js).
//
// Por que en memoria y no en una base de datos: esto es un termometro operativo ("¿el
// modelo esta respondiendo?", "¿cuantos 429 llevamos hoy?"), no un historico contable.
// Se reinicia cuando se reinicia el servidor, y eso esta bien -- a cambio no agrega
// dependencias, ni escrituras a disco, ni otra cosa que se pueda romper.
//
// El costo es acotado a proposito: un objeto por modelo usado y una ventana corta de
// tiempos de respuesta. Nunca crece con el numero de llamadas.

const INICIO = Date.now();
const MAX_TIEMPOS = 50; // ventana para promedio/maximo de latencia
const MAX_ERRORES = 10; // ultimos errores que se conservan para diagnostico

// clave: "proveedor:modelo" -> estadisticas
const porModelo = new Map();

function claveDe(proveedor, modelo) {
  return `${proveedor}:${modelo}`;
}

function nuevoRegistro(proveedor, modelo) {
  return {
    proveedor,
    modelo,
    llamadas: 0,
    ok: 0,
    errores: 0,
    porEstado: {},      // { '429': 3, '403': 1, 'sin-respuesta': 2 }
    tiempos: [],        // ventana de los ultimos MAX_TIEMPOS en ms
    ultimoOk: null,     // timestamp ISO
    ultimoError: null,  // { ts, estado, mensaje }
    ultimosErrores: [], // los MAX_ERRORES mas recientes
  };
}

function obtener(proveedor, modelo) {
  const clave = claveDe(proveedor, modelo);
  if (!porModelo.has(clave)) porModelo.set(clave, nuevoRegistro(proveedor, modelo));
  return porModelo.get(clave);
}

// Se llama desde services/gemini.js y services/claude.js despues de cada intento.
function registrarLlamada({ proveedor, modelo, ok, ms, estado, mensaje }) {
  const r = obtener(proveedor, modelo || '(sin modelo)');
  r.llamadas += 1;

  if (typeof ms === 'number') {
    r.tiempos.push(ms);
    if (r.tiempos.length > MAX_TIEMPOS) r.tiempos.shift();
  }

  if (ok) {
    r.ok += 1;
    r.ultimoOk = new Date().toISOString();
    return;
  }

  r.errores += 1;
  const claveEstado = estado ? String(estado) : 'sin-respuesta';
  r.porEstado[claveEstado] = (r.porEstado[claveEstado] || 0) + 1;

  const detalle = { ts: new Date().toISOString(), estado: claveEstado, mensaje: String(mensaje || '').slice(0, 300) };
  r.ultimoError = detalle;
  r.ultimosErrores.unshift(detalle);
  if (r.ultimosErrores.length > MAX_ERRORES) r.ultimosErrores.pop();
}

function promedio(lista) {
  if (!lista.length) return null;
  return Math.round(lista.reduce((a, b) => a + b, 0) / lista.length);
}

function resumen() {
  const modelos = [...porModelo.values()].map((r) => ({
    proveedor: r.proveedor,
    modelo: r.modelo,
    llamadas: r.llamadas,
    ok: r.ok,
    errores: r.errores,
    tasaExito: r.llamadas > 0 ? Math.round((r.ok / r.llamadas) * 100) : null,
    latenciaPromedioMs: promedio(r.tiempos),
    latenciaMaxMs: r.tiempos.length ? Math.max(...r.tiempos) : null,
    porEstado: r.porEstado,
    ultimoOk: r.ultimoOk,
    ultimoError: r.ultimoError,
    ultimosErrores: r.ultimosErrores,
  }));

  // El que mas se ha usado primero -- normalmente es el que esta "corriendo".
  modelos.sort((a, b) => b.llamadas - a.llamadas);

  return {
    desde: new Date(INICIO).toISOString(),
    uptimeSegundos: Math.round((Date.now() - INICIO) / 1000),
    modelos,
  };
}

module.exports = { registrarLlamada, resumen };
