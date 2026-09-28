const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');
const metricas = require('./metricas');
const {
  construirPromptTexto,
  construirPromptTablaForzada,
  construirPromptConsultaForzada,
} = require('../prompt');
const {
  parsearRespuestaAuto,
  parsearRespuestaForzada,
  parsearRespuestaConsulta,
} = require('../lib/parsearRespuestaIA');

// IMPORTANTE: Claude (a diferencia de Gemini) todavia no acepta audio como entrada
// nativa en su API -- por eso este servicio SOLO tiene las 3 funciones de TEXTO. El
// audio de WhatsApp siempre pasa por services/gemini.js sin importar el valor de
// TEXT_AI_PROVIDER (ver la logica del switch en lib/clasificar.js).

const client = new Anthropic({ apiKey: config.claude.apiKey });

// En vez del truco de Gemini (pedir JSON en texto y limpiarlo con regex), aqui se usa
// "tool use" forzado: se le da a Claude una herramienta con el formato de salida exacto
// y se le obliga a llamarla (tool_choice), asi el SDK ya regresa el objeto parseado en
// vez de texto crudo que hay que interpretar.
//
// El contenido de "campos" no se limita aqui a proposito (queda como objeto libre) --
// las llaves exactas por tabla ya estan descritas en las instrucciones del prompt
// (ver prompt.js), y duplicarlas tambien en el schema de la herramienta seria una
// segunda fuente de verdad que se puede desalinear con el tiempo.

const TOOL_AUTO = {
  name: 'reportar_clasificacion',
  description: 'Reporta la tabla detectada (o si el mensaje es una consulta) y los campos extraidos.',
  input_schema: {
    type: 'object',
    properties: {
      tabla: {
        type: 'string',
        enum: ['reporte_campo', 'actividades_diarias', 'maquinaria', 'insumos', 'consulta', 'no_identificada'],
      },
      confianza: { type: 'string', enum: ['alta', 'media', 'baja'] },
      texto_transcrito: { type: 'string' },
      campos: {
        type: 'object',
        description: 'Unicamente los campos de la tabla elegida (o de "consulta"), con las llaves EXACTAS indicadas en las instrucciones.',
      },
    },
    required: ['tabla', 'confianza', 'texto_transcrito', 'campos'],
  },
};

const TOOL_FORZADA = {
  name: 'reportar_campos',
  description: 'Reporta los campos extraidos para la tabla que el usuario ya eligio de antemano.',
  input_schema: {
    type: 'object',
    properties: {
      confianza: { type: 'string', enum: ['alta', 'media', 'baja'] },
      texto_transcrito: { type: 'string' },
      campos: {
        type: 'object',
        description: 'Unicamente los campos listados en las instrucciones, con las llaves EXACTAS.',
      },
    },
    required: ['confianza', 'texto_transcrito', 'campos'],
  },
};

const TOOL_CONSULTA = {
  name: 'reportar_consulta',
  description: 'Reporta los parametros de busqueda extraidos de la pregunta.',
  input_schema: {
    type: 'object',
    properties: {
      texto_transcrito: { type: 'string' },
      campos: {
        type: 'object',
        properties: {
          FechaDesde: { type: 'string', description: 'Formato YYYY-MM-DD, o "null" si no se menciona.' },
          FechaHasta: { type: 'string', description: 'Formato YYYY-MM-DD, o "null" si no se menciona.' },
          PalabrasClave: { type: 'string', description: 'Texto libre, o "null" si no aplica.' },
        },
      },
    },
    required: ['texto_transcrito', 'campos'],
  },
};

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Misma idea que llamarGeminiCrudo() en services/gemini.js: reintenta ante saturacion
// temporal del modelo, y convierte el 429 (cuota agotada) en un error con la MISMA
// forma (esCuotaExcedida / segundosEspera) que ya usa el resto del codigo -- asi
// routes/mensaje.js no necesita saber cual de los dos proveedores fallo.
// Igual que en gemini.js: el modelo puede venir por llamada (elegido en el compositor).
const modeloDe = (modelo) => modelo || config.claude.model;

async function llamarClaudeConTool(prompt, tool, modelo, intento = 1) {
  const MAX_INTENTOS = 3;
  const t0 = Date.now(); // ver nota en gemini.js: se mide cada intento por separado
  try {
    const respuesta = await client.messages.create({
      model: modeloDe(modelo),
      max_tokens: 1024,
      tools: [tool],
      tool_choice: { type: 'tool', name: tool.name },
      messages: [{ role: 'user', content: prompt }],
    });
    metricas.registrarLlamada({
      proveedor: 'claude', modelo: modeloDe(modelo), ok: true, ms: Date.now() - t0,
    });
    const bloque = respuesta.content.find((b) => b.type === 'tool_use');
    const data = bloque ? bloque.input : null;
    return { data, raw: data ? JSON.stringify(data) : '' };
  } catch (e) {
    const status = e.status;
    metricas.registrarLlamada({
      proveedor: 'claude',
      modelo: modeloDe(modelo),
      ok: false,
      ms: Date.now() - t0,
      estado: status,
      mensaje: e.error?.error?.message || e.message,
    });

    // 429 = limite de la cuenta/plan alcanzado. Igual que con Gemini, no vale la pena
    // reintentar de inmediato -- se avienta el error especial para que el que llama le
    // muestre al usuario un mensaje claro con el tiempo de espera (si Anthropic lo manda
    // en el header "retry-after").
    if (status === 429) {
      const retryAfter = e.headers?.['retry-after'];
      const errorCuota = new Error('Limite de uso de Claude alcanzado (cuota del plan).');
      errorCuota.esCuotaExcedida = true;
      errorCuota.segundosEspera = retryAfter ? Number(retryAfter) : null;
      throw errorCuota;
    }

    // 529 = "overloaded_error", el equivalente de Anthropic al 503 de Gemini (trafico
    // alto en sus servidores, no es cuota nuestra) -- aqui si vale la pena reintentar un
    // par de veces con espera corta.
    const esTemporal = status === 529 || status === 503;
    if (esTemporal && intento < MAX_INTENTOS) {
      const espera = 1500 * intento;
      console.log(`Claude ocupado (${status}), reintentando en ${espera}ms... (intento ${intento + 1}/${MAX_INTENTOS})`);
      await esperar(espera);
      return llamarClaudeConTool(prompt, tool, modelo, intento + 1);
    }
    throw e;
  }
}

// --- Automatico (WhatsApp, solo texto): Claude decide la tabla o si es consulta ---

async function clasificarTexto(textoBody, modelo) {
  const prompt = construirPromptTexto(textoBody);
  const { data, raw } = await llamarClaudeConTool(prompt, TOOL_AUTO, modelo);
  return parsearRespuestaAuto(data, raw);
}

// --- Forzado (pagina web, botones "Agregar Datos") ---

async function extraerCamposTablaForzada(tabla, textoBody, modelo) {
  const prompt = construirPromptTablaForzada(tabla, textoBody);
  const { data, raw } = await llamarClaudeConTool(prompt, TOOL_FORZADA, modelo);
  return parsearRespuestaForzada(data, raw);
}

// --- Forzado (pagina web, botones "Leer / Preguntar") ---

async function extraerConsultaForzada(tabla, textoBody, modelo) {
  const prompt = construirPromptConsultaForzada(tabla, textoBody);
  const { data, raw } = await llamarClaudeConTool(prompt, TOOL_CONSULTA, modelo);
  return parsearRespuestaConsulta(data, raw);
}

module.exports = {
  clasificarTexto,
  extraerCamposTablaForzada,
  extraerConsultaForzada,
};
