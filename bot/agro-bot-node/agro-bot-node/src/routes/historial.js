const express = require('express');
const sheets = require('../services/sheets');

const router = express.Router();

// Rama 4: GET /bot-web-historial?tabla=... -> ultimos 8 registros
// (equivalente a "Webhook - Historial (GET)" -> "Elegir tabla historial" -> "Leer historial" -> "Ultimos registros").
router.get('/bot-web-historial', async (req, res) => {
  try {
    const TABLAS_VALIDAS = ['reporte_campo', 'actividades_diarias', 'maquinaria', 'insumos'];
    const tabla = TABLAS_VALIDAS.includes(req.query.tabla) ? req.query.tabla : 'actividades_diarias';
    const filas = await sheets.leerHoja(tabla);
    const ultimos = filas.slice(-8).reverse();
    res.json({ ok: true, tabla, registros: ultimos });
  } catch (e) {
    console.error('Error leyendo historial:', e.message);
    res.status(200).json({ ok: false, registros: [] });
  }
});

module.exports = router;
