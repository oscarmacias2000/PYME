const express = require('express');
const { guardarRegistro } = require('../lib/guardarRegistro');

const router = express.Router();

// Rama 3: POST /bot-web-guardar -> se dispara cuando el usuario confirma en el preview
// (equivalente a "Webhook - Guardar confirmado (POST)" -> "Preparar guardado confirmado" -> ...).
router.post('/bot-web-guardar', async (req, res) => {
  try {
    const { tabla, campos, reportado_por: reportadoPor, texto_transcrito: textoTranscrito } = req.body || {};
    const resultado = await guardarRegistro({
      tabla,
      campos: campos || {},
      reportadoPor: reportadoPor || '',
      textoTranscrito: textoTranscrito || '',
      canal: 'web',
    });
    res.json({ ok: resultado.ok, mensaje: resultado.mensaje });
  } catch (e) {
    console.error('Error guardando registro:', e.response?.data || e.message);
    res.status(200).json({ ok: false, mensaje: 'No se pudo guardar el registro.' });
  }
});

module.exports = router;
