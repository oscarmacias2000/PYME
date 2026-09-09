// Prepara un Google Sheet que TU YA CREASTE y compartiste con la cuenta de servicio:
// le renombra la primera pestaña a "Actividades Diarias" y le pone los encabezados
// correctos en la fila 1. No crea archivos nuevos (eso lo bloquea Google para cuentas
// de servicio normales), solo edita uno que ya existe.
//
// Uso:
//   node scripts/preparar_sheet_actividades.js

require('dotenv').config();
const { google } = require('googleapis');
const config = require('../src/config');

const NOMBRE_HOJA = 'Actividades Diarias';
const ENCABEZADOS = [
  'Fecha', 'Campo', 'Lote', 'Actividad', 'Responsable', 'N° Jornaleros',
  'Procedencia / Cuadrilla', 'Recursos / Maquinaria', 'Costo por Jornal',
  'Nómina Total', 'Observaciones', 'Reportado por',
];

async function main() {
  const spreadsheetId = config.google.sheets.actividadesDiarias.id;
  if (!spreadsheetId) {
    console.error('No hay SHEET_ACTIVIDADES_ID en tu .env');
    process.exit(1);
  }

  const auth = new google.auth.JWT({
    email: config.google.serviceAccountEmail,
    key: config.google.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('Leyendo el archivo', spreadsheetId, '...');
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const primeraHoja = meta.data.sheets[0];
  const sheetId = primeraHoja.properties.sheetId;
  const tituloActual = primeraHoja.properties.title;
  console.log('Pestaña actual:', tituloActual);

  if (tituloActual !== NOMBRE_HOJA) {
    console.log('Renombrando pestaña a "' + NOMBRE_HOJA + '"...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          updateSheetProperties: {
            properties: { sheetId, title: NOMBRE_HOJA },
            fields: 'title',
          },
        }],
      },
    });
  }

  console.log('Escribiendo encabezados...');
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${NOMBRE_HOJA}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [ENCABEZADOS] },
  });

  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          repeatCell: {
            range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: { userEnteredFormat: { textFormat: { bold: true } } },
            fields: 'userEnteredFormat.textFormat.bold',
          },
        }],
      },
    });
  } catch (e) {
    console.log('(no se pudo poner en negritas, no pasa nada)');
  }

  console.log('');
  console.log('Listo. El archivo ya quedo listo para que el bot guarde ahi.');
  console.log('URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/edit');
  console.log('Reinicia el servidor (Ctrl+C y "npm start" de nuevo) para que tome el .env actualizado.');
}

main().catch((e) => {
  console.error('Error:', e.response ? JSON.stringify(e.response.data) : e.message);
  process.exit(1);
});
