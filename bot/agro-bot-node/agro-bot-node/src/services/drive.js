// Descarga/exporta el documento ORIGINAL completo (todas las pestañas, con todo lo
// integrado) tal como esta en Drive, para mandarlo por correo integro -- en vez de
// armar un Excel nuevo desde cero solo con un resumen (que es lo que se hacia antes).
const { google } = require('googleapis');
const { getAuth } = require('./googleAuth');

let driveClient = null;

function getClient() {
  if (driveClient) return driveClient;
  driveClient = google.drive({ version: 'v3', auth: getAuth() });
  return driveClient;
}

// Hay 2 casos segun como haya quedado guardado el archivo en Drive:
// 1) Hoja de calculo NATIVA de Google (mimeType "application/vnd.google-apps.spreadsheet")
//    -> hay que "exportarla" (convertirla) a .xlsx con drive.files.export.
// 2) Un .xlsx SUBIDO que Drive dejo "en modo Office" (mimeType de Excel de una vez)
//    -> ya es un archivo .xlsx de verdad, no se exporta/convierte, se descarga tal cual
//    con drive.files.get({ alt: 'media' }).
// Los documentos de este proyecto (Reporte de Campo, Actividades Diarias) vienen de
// archivos .xlsx subidos, asi que normalmente cae en el caso 2 -- pero se checa el
// mimeType real por si acaso, para que esto no truene si algun dia cambia.
async function exportarComoXlsx(fileId) {
  const drive = getClient();
  const meta = await drive.files.get({ fileId, fields: 'mimeType,name' });
  const mimeType = meta.data.mimeType;
  const nombreBase = (meta.data.name || 'documento').replace(/[\\/:*?"<>|]/g, '-');

  let buffer;
  if (mimeType === 'application/vnd.google-apps.spreadsheet') {
    const { data } = await drive.files.export(
      { fileId, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      { responseType: 'arraybuffer' }
    );
    buffer = Buffer.from(data);
  } else {
    const { data } = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });
    buffer = Buffer.from(data);
  }

  const nombreArchivo = nombreBase.toLowerCase().endsWith('.xlsx') ? nombreBase : `${nombreBase}.xlsx`;
  return { buffer, nombreArchivo };
}

module.exports = { exportarComoXlsx };
