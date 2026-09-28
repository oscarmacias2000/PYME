const config = require('../config');
const gemini = require('../services/gemini');
const claude = require('../services/claude');

// El "cerebro" de TEXTO es Gemini o Claude. Por defecto manda TEXT_AI_PROVIDER del .env,
// pero cada mensaje puede pedir otro (el usuario lo elige en el compositor de la pagina),
// y por eso se resuelve POR LLAMADA y no una sola vez al cargar el modulo.
// El AUDIO SIEMPRE pasa por Gemini sin importar lo que se elija -- Claude todavia no
// acepta audio como entrada nativa en su API.
function resolverProveedorTexto(proveedor) {
  const elegido = proveedor || config.textAiProvider;
  return elegido === 'claude' ? claude : gemini;
}

// Catalogos, Resumen Semanal y Resumen del Dia son de solo lectura y no tienen
// fechas/palabras clave que buscar (son una lista de valores, una cuadricula fija, o un
// calculo del dia -- no registros por fecha) -- no hace falta gastar una llamada a
// Gemini para "extraer" nada, se lee/calcula tal cual.
const TABLAS_SOLO_LECTURA_SIN_FILTRO = ['catalogos', 'resumen_semanal', 'resumen_dia'];

// Equivalente al nodo "Es audio?" + los caminos de Gemini. Tiene 3 formas de trabajar:
//
// 1) Automatico (sin "modo" ni "tabla"): Gemini decide solo si es un reporte nuevo
//    (y de que tabla) o una pregunta sobre datos ya guardados. Se usa en WhatsApp.
// 2) modo "agregar" + tabla: el usuario ya eligio la tabla con los botones de la
//    pagina web -- Gemini solo extrae los campos de esa tabla, no adivina cual es.
// 3) modo "leer" + tabla: el usuario ya eligio que quiere PREGUNTAR sobre esa tabla
//    -- Gemini solo saca fechas/palabras clave, no se abre el formulario de guardar.
async function clasificarMensaje({ tipo, textoBody, audioBase64, mimeType, modo, tabla, proveedor, modelo }) {
  const esAudio = tipo === 'audio';
  const proveedorTexto = resolverProveedorTexto(proveedor);
  // El modelo elegido solo aplica al proveedor al que pertenece: si alguien pide el
  // modelo de Claude pero la peticion termina yendo a Gemini (audio), se ignora y se
  // usa el del .env, en vez de mandarle a Google un nombre de modelo que no conoce.
  const modeloTexto = modelo || undefined;
  const modeloAudio = (proveedor || config.textAiProvider) === 'claude' ? undefined : modeloTexto;

  if (modo === 'agregar' && tabla) {
    const r = esAudio
      ? await gemini.extraerCamposTablaForzadaAudio(tabla, audioBase64, mimeType, modeloAudio)
      : await proveedorTexto.extraerCamposTablaForzada(tabla, textoBody || '', modeloTexto);
    return { tabla, confianza: r.confianza, texto_transcrito: r.texto_transcrito, campos: r.campos };
  }

  if (modo === 'leer') {
    if (TABLAS_SOLO_LECTURA_SIN_FILTRO.includes(tabla)) {
      return {
        tabla: 'consulta',
        confianza: 'alta',
        texto_transcrito: textoBody || '(audio)',
        campos: { TablaObjetivo: tabla },
      };
    }
    const r = esAudio
      ? await gemini.extraerConsultaForzadaAudio(tabla, audioBase64, mimeType, modeloAudio)
      : await proveedorTexto.extraerConsultaForzada(tabla, textoBody || '', modeloTexto);
    return {
      tabla: 'consulta',
      confianza: 'alta',
      texto_transcrito: r.texto_transcrito,
      campos: { TablaObjetivo: tabla || 'todas', ...r.campos },
    };
  }

  return esAudio
    ? gemini.clasificarAudio(audioBase64, mimeType, modeloAudio)
    : proveedorTexto.clasificarTexto(textoBody || '', modeloTexto);
}

module.exports = { clasificarMensaje };
