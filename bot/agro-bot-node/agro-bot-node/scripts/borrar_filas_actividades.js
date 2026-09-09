// Borra las filas 2, 3 y 4 de la pestaña "Actividades Diarias" (la leyenda de
// instrucciones y las 2 capturas de prueba del 1 y 2 de septiembre), pedido explicito
// del usuario. Las filas de abajo se recorren hacia arriba automaticamente (asi es como
// funciona un borrado de filas real en Sheets), y como el bot escribe siempre a partir
// de la fila 18 para abajo (ver SHEET_ACTIVIDADES_FILA_INICIAL en config.js), este
// borrado no afecta donde se van a seguir guardando los registros nuevos.
//
// Uso: node scripts/borrar_filas_actividades.js
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
  const { id, tab } = config.google.sheets.actividadesDiarias;

  const meta = await sheets.spreadsheets.get({ spreadsheetId: id });
  const hoja = meta.data.sheets.find((s) => s.properties.title === tab);
  if (!hoja) {
    console.error(`No se encontro la pestaña "${tab}" en el documento.`);
    process.exit(1);
  }
  const sheetId = hoja.properties.sheetId;

  // La API de Sheets usa indices desde 0 y el rango es [startIndex, endIndex) -- por eso
  // para borrar las filas 2, 3 y 4 (numeracion normal, como se ve en pantalla) se manda
  // startIndex=1 (fila 2) y endIndex=4 (hasta la fila 4 incluida).
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: id,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId, dimension: 'ROWS', startIndex: 1, endIndex: 4 },
          },
        },
      ],
    },
  });

  console.log(`Listo -- se borraron las filas 2, 3 y 4 de "${tab}". Todo lo de abajo se recorrio hacia arriba.`);
}

main().catch((e) => {
  console.error('Error:', e.response?.data || e.message);
  process.exit(1);
});
