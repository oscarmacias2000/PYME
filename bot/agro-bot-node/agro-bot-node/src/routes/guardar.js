const express = require('express');
const { guardarRegistro, enviarRegistroPorCorreo } = require('../lib/guardarRegistro');

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

// Boton "Enviar" de la bandeja del archivo 4.1 (Rendimiento Diario Jornal, Insumos,
// Resumen Semanal) -- manda por correo lo que este en el formulario, independiente de
// si ya se guardo o no.
router.post('/bot-web-enviar', async (req, res) => {
  try {
    const { tabla, campos } = req.body || {};
    await enviarRegistroPorCorreo({ tabla, campos: campos || {} });
    res.json({ ok: true, mensaje: 'Correo enviado.' });
  } catch (e) {
    console.error('Error enviando registro por correo:', e.response?.data || e.message);
    res.status(200).json({ ok: false, mensaje: 'No se pudo enviar el correo.' });
  }
});

module.exports = router;
