const express = require('express');
const path = require('path');
const config = require('../config');
const sheets = require('../services/sheets');
const { filas2DAXlsxBuffer } = require('../services/xlsx');

const router = express.Router();

// Rama 1: GET /bot-web -> sirve la pagina HTML (equivalente a "Webhook - Pagina del bot (GET)").
router.get('/bot-web', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// GET /documentos -> arma los links a los Google Sheets configurados (ver una hoja de
// calculo, o descargarla directo como Excel/PDF) para el menu "Documentos" del header.
// Se arma aqui (y no hardcodeado en index.html) para que siempre use los IDs reales de
// tu .env -- si cambias de hoja de calculo, este menu se actualiza solo.
function linksHoja(id) {
  return {
    ver: `https://docs.google.com/spreadsheets/d/${id}/edit`,
    excel: `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`,
    pdf: `https://docs.google.com/spreadsheets/d/${id}/export?format=pdf`,
  };
}
function documentosConfigurados() {
  const { reporteCampo, actividadesDiarias } = config.google.sheets;
  const lista = [];
  if (reporteCampo.id) lista.push({ nombre: 'Reporte de Campo', id: reporteCampo.id });
  if (actividadesDiarias.id) lista.push({ nombre: 'Actividades Diarias', id: actividadesDiarias.id });
  return lista;
}

// Solo se permite trabajar con los IDs que estan en el .env. Sin esta validacion, el
// parametro "id" convertiria estas rutas en un proxy para descargar CUALQUIER hoja a la
// que tenga acceso la cuenta de servicio, con solo adivinar un ID.
function idPermitido(id) {
  return documentosConfigurados().some((d) => d.id === id);
}

router.get('/documentos', (req, res) => {
  const documentos = documentosConfigurados().map((d) => ({
    nombre: d.nombre,
    id: d.id,
    ...linksHoja(d.id),
  }));
  res.json({ ok: true, documentos });
});

// GET /documentos/hojas?id=... -> las pestañas de ese archivo, para poder elegir cual
// descargar en vez de bajar el libro completo (Google exporta SIEMPRE todas las pestañas
// cuando se pide format=xlsx, el parametro gid solo lo respeta en csv/pdf).
router.get('/documentos/hojas', async (req, res) => {
  const { id } = req.query;
  if (!idPermitido(id)) {
    return res.status(200).json({ ok: false, mensaje: 'Documento no valido.' });
  }
  try {
    const hojas = await sheets.listarPestanas(id);
    res.json({ ok: true, hojas });
  } catch (e) {
    console.error('Error listando pestañas:', e.response?.data || e.message);
    res.status(200).json({
      ok: false,
      mensaje: e.response?.data?.error?.message || 'No se pudieron leer las hojas del documento.',
    });
  }
});

// GET /documentos/descargar?id=...&tab=...&formato=xlsx|csv -> descarga UNA sola pestaña.
// El .xlsx se arma aqui con exceljs (Google no sabe exportar una sola pestaña a xlsx);
// el csv se arma aqui tambien para que el nombre del archivo salga con el de la pestaña.
router.get('/documentos/descargar', async (req, res) => {
  const { id, tab, formato = 'xlsx' } = req.query;
  if (!idPermitido(id)) return res.status(400).send('Documento no valido.');
  if (!tab) return res.status(400).send('Falta la hoja a descargar.');

  try {
    const filas = await sheets.leerHojaCruda(id, tab);
    // Nombre de archivo seguro para el header Content-Disposition. Los acentos se
    // TRANSLITERAN (Catálogos -> Catalogos), no se borran: si solo se filtraran los
    // caracteres no-ASCII saldria "Catlogos.xlsx".
    const base = String(tab)
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes dejando la letra
      .replace(/ñ/g, 'n').replace(/Ñ/g, 'N')
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .trim()
      .replace(/\s+/g, '-') || 'hoja';

    if (formato === 'csv') {
      const csv = filas
        .map((fila) => (fila || [])
          .map((celda) => {
            const v = celda === undefined || celda === null ? '' : String(celda);
            return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
          })
          .join(','))
        .join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${base}.csv"`);
      return res.send('﻿' + csv); // BOM para que Excel respete los acentos
    }

    const buffer = await filas2DAXlsxBuffer(filas, tab);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${base}.xlsx"`);
    return res.send(Buffer.from(buffer));
  } catch (e) {
    console.error('Error descargando hoja:', e.response?.data || e.message);
    const motivo = e.response?.data?.error?.message || e.message || 'error desconocido';
    return res.status(200).send(`No se pudo descargar la hoja "${tab}": ${motivo}`);
  }
});

// GET /catalogos-datos -> listas reales de la pestaña "Catálogos" (huertas, equipos,
// actividades, responsables, etc.) para alimentar los desplegables de "Captura rápida"
// y del formulario de revisión en el frontend (ver frontend/js/pages/index.js). Se lee
// por POSICION de columna (0 = A, 1 = B...), no por nombre de encabezado, porque la
// columna de Equipos en la hoja real no trae texto de encabezado. Layout real (archivo
// 4.1, pestaña Catálogos): A Equipos, B Operadores, C Actividades, D Ubicacion,
// E Responsables, F Tipo de Combustible, G Motivo de Incidencia, H Implementos,
// I Huerta, J Precio Diésel ref. ($/L), K Umbral de alerta (%).
router.get('/catalogos-datos', async (req, res) => {
  try {
    const { id, tab } = config.google.sheets.catalogos;
    const filas = await sheets.leerHojaCruda(id, tab);
    const cuerpo = filas.slice(1); // sin la fila de encabezados
    const columna = (i) => cuerpo
      .map((fila) => fila[i])
      .filter((v) => v !== undefined && v !== null && String(v).trim() !== '');

    const primeraFila = cuerpo[0] || [];
    res.json({
      ok: true,
      catalogos: {
        equipos: columna(0),
        operadores: columna(1),
        actividades: columna(2),
        ubicaciones: columna(3),
        responsables: columna(4),
        tiposCombustible: columna(5),
        motivosIncidencia: columna(6),
        implementos: columna(7),
        huertas: columna(8),
        precioDieselRef: primeraFila[9] !== undefined && primeraFila[9] !== '' ? primeraFila[9] : null,
        umbralAlertaPct: primeraFila[10] !== undefined && primeraFila[10] !== '' ? primeraFila[10] : null,
      },
    });
  } catch (e) {
    console.error('Error leyendo catalogos:', e.response?.data || e.message);
    res.status(200).json({ ok: false, mensaje: 'No se pudieron cargar los catalogos.' });
  }
});

module.exports = router;
