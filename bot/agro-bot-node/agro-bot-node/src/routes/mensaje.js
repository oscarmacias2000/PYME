const express = require('express');
const { clasificarMensaje } = require('../lib/clasificar');
const { consultarDatos, armarRespuestaConsulta } = require('../lib/consultarDatos');

const router = express.Router();

// Rama 2: POST /bot-web-mensaje -> clasifica con Gemini.
// Si es un reporte nuevo, regresa el preview para confirmar y guardar (equivalente a
// "Webhook - Mensaje del bot (POST)" -> ... -> "Responder Preview").
// Si es una PREGUNTA sobre datos ya guardados (tabla === "consulta"), no abre el
// preview de guardado -- busca en las hojas y regresa la respuesta directo como texto.
router.post('/bot-web-mensaje', async (req, res) => {
  try {
    const {
      tipo, texto, audio_base64: audioBase64, mime_type: mimeType,
      modo, tabla,
    } = req.body || {};
    const resultado = await clasificarMensaje({
      tipo,
      textoBody: texto,
      audioBase64,
      mimeType,
      modo,
      tabla,
    });

    if (resultado.tabla === 'consulta') {
      const resultadosPorTabla = await consultarDatos(resultado.campos || {});
      const respuesta = armarRespuestaConsulta(resultadosPorTabla);
      return res.json({
        ok: true,
        modo: 'consulta',
        respuesta,
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
      console.error(`Limite de Gemini alcanzado, esperar ~${segundos}s`);
      return res.status(200).json({
        ok: false,
        mensaje: `Se alcanzo el limite de mensajes del plan de Gemini por ahora. Espera unos ${segundos} segundos e intenta de nuevo.`,
      });
    }
    console.error('Error procesando mensaje:', e.response?.data || e.message);
    res.status(200).json({ ok: false, mensaje: 'No se pudo procesar el mensaje con la IA.' });
  }
});

module.exports = router;
