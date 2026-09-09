// Crea un Google Sheet NUEVO para Actividades Diarias (separado del que ya tenias),
// le pone los encabezados correctos, lo comparte contigo, y actualiza el .env solo.
//
// Uso:
//   node scripts/crear_sheet_actividades.js tu_correo@gmail.com
//
// El correo que le pases es con el que vas a poder abrir/ver el archivo en tu Google Drive
// (el archivo lo crea la cuenta de servicio, asi que sin compartirlo no lo verias en tu Drive).

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const config = require('../src/config');

const NOMBRE_HOJA = 'Actividades Diarias';
const TITULO_ARCHIVO = 'Actividades Diarias - Bot';
const ENCABEZADOS = [
  'Fecha', 'Campo', 'Lote', 'Actividad', 'Responsable', 'N° Jornaleros',
  'Procedencia / Cuadrilla', 'Recursos / Maquinaria', 'Costo por Jornal',
  'Nómina Total', 'Observaciones', 'Reportado por',
];

async function main() {
  const correoCompartir = process.argv[2];
  if (!correoCompartir) {
    console.error('Falta el correo. Uso: node scripts/crear_sheet_actividades.js tu_correo@gmail.com');
    process.exit(1);
  }

  if (!config.google.serviceAccountEmail || !config.google.privateKey) {
    console.error('Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY en tu .env');
    process.exit(1);
  }

  const auth = new google.auth.JWT({
    email: config.google.serviceAccountEmail,
    key: config.google.privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const drive = google.drive({ version: 'v3', auth });

  console.log('Creando el archivo de Google Sheets...');
  const creado = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: TITULO_ARCHIVO },
      sheets: [{ properties: { title: NOMBRE_HOJA } }],
    },
  });
  const spreadsheetId = creado.data.spreadsheetId;
  const sheetId = creado.data.sheets[0].properties.sheetId;
  console.log('Archivo creado:', spreadsheetId);

  console.log('Escribiendo encabezados...');
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `'${NOMBRE_HOJA}'!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [ENCABEZADOS] },
  });

  // Detalle opcional: deja la fila 1 en negritas (si falla no es grave, se ignora).
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
    console.log('(no se pudo poner en negritas la fila 1, no pasa nada:', e.message, ')');
  }

  console.log('Compartiendo con', correoCompartir, '...');
  try {
    await drive.permissions.create({
      fileId: spreadsheetId,
      sendNotificationEmail: true,
      requestBody: { type: 'user', role: 'writer', emailAddress: correoCompartir },
    });
    console.log('Compartido correctamente.');
  } catch (e) {
    console.log('No se pudo compartir automaticamente:', e.message);
    console.log('Es probable que falte activar la "Google Drive API" en tu proyecto de Google Cloud.');
    console.log('El archivo ya funciona para el bot de todas formas; solo no lo veras en tu Drive hasta compartirlo a mano.');
  }

  // Actualiza el .env local con el ID nuevo, para no tener que copiarlo/pegarlo a mano.
  const envPath = path.join(__dirname, '..', '.env');
  let contenido = fs.readFileSync(envPath, 'utf-8');
  contenido = contenido.replace(/^SHEET_ACTIVIDADES_ID=.*$/m, () => 'SHEET_ACTIVIDADES_ID=' + spreadsheetId);
  contenido = contenido.replace(/^SHEET_ACTIVIDADES_TAB=.*$/m, () => 'SHEET_ACTIVIDADES_TAB=' + NOMBRE_HOJA);
  fs.writeFileSync(envPath, contenido, 'utf-8');

  console.log('');
  console.log('Listo. .env actualizado automaticamente.');
  console.log('URL del archivo nuevo: https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/edit');
  console.log('Reinicia el servidor (Ctrl+C y "npm start" de nuevo) para que tome el cambio.');
}

main().catch((e) => {
  console.error('Error:', e.response ? JSON.stringify(e.response.data) : e.message);
  process.exit(1);
});
