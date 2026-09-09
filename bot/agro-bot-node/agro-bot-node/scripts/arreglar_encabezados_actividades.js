// Arregla SOLO la fila 1 (encabezados) de la pestaña "Actividades Diarias" en tu
// documento original -- no crea pestañas, no toca Catalogos ni Resumen del Dia,
// no renombra nada. Es el arreglo minimo para el problema de encabezados corridos
// que se vio en "Ver ultimos registros".
//
// Uso:
//   node scripts/arreglar_encabezados_actividades.js

require('dotenv').config();
const { google } = require('googleapis');
const config = require('../src/config');

const ENCABEZADOS = [
  'Fecha', 'Campo', 'Lote', 'Actividad', 'Responsable', 'N° Jornaleros',
  'Procedencia / Cuadrilla', 'Recursos / Maquinaria', 'Costo por Jornal',
  'Nómina Total', 'Observaciones', 'Reportado por',
];

async function main() {
  const spreadsheetId = config.google.sheets.actividadesDiarias.id;
  const tab = config.google.sheets.actividadesDiarias.tab;

  const auth = new google.auth.JWT({
    email: config.google.serviceAccountEmail,
    key: config.google.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log(`Escribiendo encabezados en '${tab}'!A1:L1 del documento ${spreadsheetId}...`);
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${tab}'!A1:L1`,
    valueInputOption: 'RAW',
    requestBody: { values: [ENCABEZADOS] },
  });

  console.log('Listo. Solo se toco la fila 1 de la pestaña "' + tab + '".');
  console.log('Reinicia el servidor (Ctrl+C y "npm start" de nuevo) y prueba "Ver ultimos registros" otra vez.');
}

main().catch((e) => {
  console.error('Error:', e.response ? JSON.stringify(e.response.data) : e.message);
  process.exit(1);
});
