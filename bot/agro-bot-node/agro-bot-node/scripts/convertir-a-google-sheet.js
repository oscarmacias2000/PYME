// Uso UNA SOLA VEZ: convierte un archivo Office (.xlsx subido tal cual a Drive) en un
// Google Sheet nativo de verdad -- lo unico que puede leer/escribir la API de Sheets
// (values.get/append). Ver src/services/googleAuth.js: la cuenta de servicio necesita
// scope completo de Drive (no solo lectura) para poder hacer esto.
//
// Que hace:
//   1. drive.files.copy(...) con mimeType de Google Sheets -> Drive convierte el
//      contenido de una vez, sin tocar el archivo original (que se queda intacto, por
//      si algo sale mal).
//   2. Comparte esa copia nueva con tu cuenta (para que la veas en tu propio Drive).
//   3. Imprime el ID y el link nuevos -- hay que poner ese ID en SHEET_REPORTE_CAMPO_ID
//      dentro de tu .env (a mano, o pideselo a Claude).
//
// Correr con: node scripts/convertir-a-google-sheet.js
const { google } = require('googleapis');
const { getAuth } = require('../src/services/googleAuth');

// ID del archivo actual (Office, el que da el error) -- viene del link que compartiste.
const ID_ARCHIVO_ACTUAL = '1QZ57AIrmRkF9wgOZPe5QP-ON3SCdUjRb';

// A quien compartirle la copia nueva (para que la veas en tu Google Drive normal).
const COMPARTIR_CON = 'oscarmaciascto@buildwiselabs.net';

async function main() {
  const drive = google.drive({ version: 'v3', auth: getAuth() });

  const original = await drive.files.get({ fileId: ID_ARCHIVO_ACTUAL, fields: 'name,mimeType' });
  console.log(`Archivo actual: "${original.data.name}" (mimeType: ${original.data.mimeType})`);

  const copia = await drive.files.copy({
    fileId: ID_ARCHIVO_ACTUAL,
    requestBody: {
      name: `${original.data.name} (Google Sheet)`,
      mimeType: 'application/vnd.google-apps.spreadsheet',
    },
  });
  const nuevoId = copia.data.id;
  console.log(`Copia creada como Google Sheet nativo. ID nuevo: ${nuevoId}`);

  await drive.permissions.create({
    fileId: nuevoId,
    sendNotificationEmail: true,
    requestBody: { role: 'writer', type: 'user', emailAddress: COMPARTIR_CON },
  });
  console.log(`Compartido con ${COMPARTIR_CON} (deberia llegarte un correo de Google Drive).`);

  console.log('\n--- LISTO ---');
  console.log(`ID nuevo (pon esto en SHEET_REPORTE_CAMPO_ID de tu .env): ${nuevoId}`);
  console.log(`Abrir: https://docs.google.com/spreadsheets/d/${nuevoId}/edit`);
  console.log('\nEl archivo original (Office) no se toco -- se queda como estaba, por si acaso.');
}

main().catch((e) => {
  console.error('Error en la conversion:', e.response?.data || e.message);
  process.exit(1);
});
