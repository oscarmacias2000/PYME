// Un solo cliente de autenticacion (cuenta de servicio) compartido entre Sheets y
// Drive, para no repetir la key/scopes en cada archivo.
//
// Scope de Drive completo (no solo "readonly") porque, ademas de exportar el documento
// original para mandarlo por correo, la cuenta de servicio tambien necesita poder crear
// una copia (drive.files.copy) y compartirla (drive.permissions.create) -- se uso una
// vez para convertir "Reporte de Campo 4.1" de archivo Office subido a Google Sheet
// nativo (ver scripts/convertir-a-google-sheet.js), que es lo unico que puede leer/
// escribir la API de Sheets (values.get/append). Un archivo Office subido tal cual a
// Drive truena con "FAILED_PRECONDITION: document must not be an Office file".
const { google } = require('googleapis');
const config = require('../config');

let auth = null;

function getAuth() {
  if (auth) return auth;
  auth = new google.auth.JWT({
    email: config.google.serviceAccountEmail,
    key: config.google.privateKey,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive',
    ],
  });
  return auth;
}

module.exports = { getAuth };
