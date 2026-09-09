const express = require('express');
const config = require('../config');
const gmail = require('../services/gmail');
const drive = require('../services/drive');

const router = express.Router();

// Las 5 pestañas (Catalogos, Rendimiento Diario Jornal, Maquinaria, Insumos, Resumen
// Semanal) viven en el MISMO documento de Reporte de Campo -- por eso los 5 botones
// mandan el mismo archivo original completo (integro, ver services/drive.js), solo que
// el correo queda etiquetado/dirigido a la pestaña que se pidio especificamente.
const NOMBRES_TAB = {
  catalogos: 'Catálogos',
  reporte_campo: 'Rendimiento Diario Jornal',
  maquinaria: 'Maquinaria',
  insumos: 'Insumos',
  resumen_semanal: 'Resumen Semanal',
};

router.post('/enviar-tab-correo', async (req, res) => {
  try {
    const { tab } = req.body || {};
    const nombre = NOMBRES_TAB[tab];
    if (!nombre) {
      return res.status(400).json({ ok: false, error: 'Pestaña no reconocida.' });
    }

    const { buffer, nombreArchivo } = await drive.exportarComoXlsx(config.google.sheets.reporteCampo.id);

    await gmail.enviarCorreoConAdjunto({
      asunto: `Reporte de Campo - ${nombre}`,
      html:
        `<p>Se adjunta el documento completo de <b>Reporte de Campo</b> ` +
        `(incluye Catálogos, Rendimiento Diario Jornal, Maquinaria, Insumos y Resumen Semanal).</p>` +
        `<p>Se solicitó especialmente la pestaña: <b>${nombre}</b>.</p>`,
      texto:
        `Se adjunta el documento completo de Reporte de Campo. ` +
        `Se solicito especialmente la pestaña: ${nombre}.`,
      adjuntoBuffer: buffer,
      nombreArchivo,
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('Error enviando pestaña por correo:', e.response?.data || e.message);
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
