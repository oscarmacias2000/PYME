// Un solo cliente de autenticacion (cuenta de servicio) compartido entre Sheets y
// Drive, para no repetir la key/scopes en cada archivo. Incluye scope de Drive (de solo
// lectura) ademas del de Sheets, porque mandar "el documento original" por correo
// requiere descargarlo/exportarlo via la API de Drive, no solo leer/escribir celdas.
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
      'https://www.googleapis.com/auth/drive.readonly',
    ],
  });
  return auth;
}

module.exports = { getAuth };
