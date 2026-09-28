const express = require('express');
const { clasificarMensaje } = require('../lib/clasificar');
const { consultarDatos, armarRespuestaConsulta } = require('../lib/consultarDatos');
const config = require('../config');

const router = express.Router();

// Tope de filas que se le mandan al navegador para pintar la tabla. Una pregunta amplia
// puede traer miles de filas (ej. 12,451 en "Rendimiento Diario Jornal"): mandarlas todas
// infla la respuesta a varios MB y la pagina se traba armando la tabla. Se manda un
// recorte + el total real, para que la UI pueda decir "mostrando 200 de 12451".
// (El texto plano de armarRespuestaConsulta ya hacia su propio recorte a 15.)
const MAX_FILAS_UI = 200;

function recortarParaUI(resultadosPorTabla) {
  return resultadosPorTabla.map((r) => {
    // Catalogos / Resumen Semanal / Resumen del Dia no son listados por fecha (vienen
    // como "crudo" o "textoListo") y ya son chicos -- se dejan intactos.
    if (!Array.isArray(r.filas)) return r;
    return { ...r, total: r.filas.length, filas: r.filas.slice(0, MAX_FILAS_UI) };
  });
}

// Rama 2: POST /bot-web-mensaje -> clasifica con Gemini.
// Si es un reporte nuevo, regresa el preview para confirmar y guardar (equivalente a
// "Webhook - Mensaje del bot (POST)" -> ... -> "Responder Preview").
// Si es una PREGUNTA sobre datos ya guardados (tabla === "consulta"), no abre el
// preview de guardado -- busca en las hojas y regresa la respuesta directo como texto.
router.post('/bot-web-mensaje', async (req, res) => {
  // En que paso vamos: este mismo try cubre DOS cosas muy distintas (la llamada a la IA
  // y la lectura de Google Sheets). Antes el catch siempre decia "no se pudo procesar el
  // mensaje con la IA", aunque lo que hubiera fallado fuera la hoja de calculo -- lo que
  // mandaba a buscar el problema al lugar equivocado. Ahora se marca el paso.
  let paso = 'ia';
  try {
    const {
      tipo, texto, audio_base64: audioBase64, mime_type: mimeType,
      modo, tabla, proveedor, modelo,
    } = req.body || {};

    // El proveedor/modelo los elige el usuario en el compositor, asi que llegan del
    // navegador: se validan aqui antes de usarlos. Si piden Claude sin ANTHROPIC_API_KEY,
    // mas vale decirlo claro ahora que dejar que truene con un error del SDK.
    if (proveedor && !['gemini', 'claude'].includes(proveedor)) {
      return res.status(200).json({ ok: false, mensaje: `Proveedor de IA no valido: ${proveedor}.` });
    }
    if (proveedor === 'claude' && !config.claude.apiKey) {
      return res.status(200).json({
        ok: false,
        mensaje: 'Para usar Claude falta ANTHROPIC_API_KEY en el .env del servidor.',
      });
    }
    if (proveedor === 'gemini' && !config.gemini.apiKey) {
      return res.status(200).json({
        ok: false,
        mensaje: 'Para usar Gemini falta GEMINI_API_KEY en el .env del servidor.',
      });
    }

    const resultado = await clasificarMensaje({
      tipo,
      textoBody: texto,
      audioBase64,
      mimeType,
      modo,
      tabla,
      proveedor,
      modelo,
    });

    if (resultado.tabla === 'consulta') {
      paso = 'sheets';
      const resultadosPorTabla = await consultarDatos(resultado.campos || {});
      const respuesta = armarRespuestaConsulta(resultadosPorTabla);
      return res.json({
        ok: true,
        modo: 'consulta',
        respuesta,
        // "respuesta" (texto plano, arriba) se conserva como respaldo -- "resultadosPorTabla"
        // es la misma info sin aplanar a texto, para que la web la pinte como tabla real (ver
        // renderRespuestaConsulta en index.js) en vez del bloque de texto "Campo: valor" de
        // siempre. WhatsApp sigue usando solo "respuesta" (armarRespuestaConsulta), asi que
        // esto no le afecta en nada.
        resultadosPorTabla: recortarParaUI(resultadosPorTabla),
        texto_transcrito: resultado.texto_transcrito,
      });
    }

    res.json({
      ok: true,
      modo: 'guardar',
      tabla: resultado.tabla,
      confianza: resultado.confianza,
      texto_transcrito: resultado.texto_transcrito,
      campos: resultado.campos,
    });
  } catch (e) {
    if (e.esCuotaExcedida) {
      const segundos = e.segundosEspera ? Math.ceil(e.segundosEspera) : 30;
      console.error(`Limite de la IA alcanzado, esperar ~${segundos}s`);
      return res.status(200).json({
        ok: false,
        mensaje: `Se alcanzo el limite de mensajes del plan de IA por ahora. Espera unos ${segundos} segundos e intenta de nuevo.`,
      });
    }
    // Detalle real del fallo: si viene de una API HTTP (Gemini, Google Sheets) el motivo
    // util esta en e.response.data.error.message, no en e.message (que suele ser un seco
    // "Request failed with status code 400").
    const estado = e.response?.status;
    const detalle =
      e.response?.data?.error?.message ||
      e.response?.data?.error_description ||
      e.message ||
      'error desconocido';

    console.error(
      `Error procesando mensaje (paso: ${paso}${estado ? `, HTTP ${estado}` : ''}):`,
      e.response?.data || e.stack || e.message
    );

    // Caso especifico y muy confuso: un 403 "unregistered callers" NO es un problema de
    // permisos en Google, es que la API key viajo vacia (el .env no cargo). Se traduce a
    // algo accionable en vez de repetir el mensaje de Google.
    if (estado === 403 && /unregistered callers|without established identity/i.test(detalle)) {
      return res.status(200).json({
        ok: false,
        mensaje: 'Falta la API key de Gemini: el servidor la esta mandando vacia. ' +
          'Revisa que GEMINI_API_KEY este en el .env (o en hbuilds/config/.env en Hostinger) ' +
          'y reinicia el bot.',
      });
    }

    const prefijo = paso === 'ia'
      ? 'La IA no pudo procesar el mensaje'
      : 'La IA entendio la pregunta, pero fallo la lectura de Google Sheets';

    res.status(200).json({
      ok: false,
      mensaje: `${prefijo}${estado ? ` (HTTP ${estado})` : ''}: ${detalle}`,
    });
  }
});

module.exports = router;
