// Diagnostico: al guardar un reporte de Maquinaria salio el mismo error que antes daba
// agregar_tabs_maquinaria_insumos.js ("...debe no ser un archivo de Office"). Eso antes
// pasaba con operaciones ESTRUCTURALES (crear una pestaña nueva); guardarFila() en
// cambio solo hace values.get + values.update (no deberia disparar ese error) -- A MENOS
// que la fila donde se quiere escribir quede FUERA del tamaño actual de la pestaña
// (numero de filas/columnas), porque entonces Google necesitaria "agrandar" la hoja
// primero, y eso SI es una operacion estructural que un archivo en modo Office bloquea.
//
// Este script solo LEE (no escribe nada): lista todas las pestañas del documento de
// Reporte de Campo con su tamaño real (filas x columnas), para ver si "Maquinaria" o
// "Insumos" ya existen y que tan grandes son.
//
// Uso: node scripts/diagnosticar_reporte_campo.js
require('dotenv').config();
const { google } = require('googleapis');
const config = require('../src/config');

async function main() {
  const auth = new google.auth.JWT({
    email: config.google.serviceAccountEmail,
    key: config.google.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const id = config.google.sheets.reporteCampo.id;

  console.log(`Documento (Reporte de Campo): ${id}\n`);

  const meta = await sheets.spreadsheets.get({ spreadsheetId: id });
  console.log(`Nombre del documento: ${meta.data.properties?.title}`);
  console.log(`Tipo (locale): ${meta.data.properties?.locale}\n`);

  console.log('Pestañas encontradas:');
  meta.data.sheets.forEach((s) => {
    const p = s.properties;
    console.log(`  - "${p.title}" (sheetId ${p.sheetId}) -> ${p.gridProperties?.rowCount} filas x ${p.gridProperties?.columnCount} columnas`);
  });

  const nombresEsperados = ['Rendimiento Diario Jornal', 'Maquinaria', 'Insumos', 'Resumen Semanal'];
  console.log('\nRevision de las pestañas que usa el bot:');
  nombresEsperados.forEach((nombre) => {
    const existe = meta.data.sheets.some((s) => s.properties.title === nombre);
    console.log(`  ${existe ? '✓' : '✗ FALTA'} "${nombre}"`);
  });
}

main().catch((e) => {
  console.error('Error:', e.response?.data || e.message);
  process.exit(1);
});
