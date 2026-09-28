// Diagnostico de la autenticacion con Google (service account) -- para el error
// "invalid_grant: Invalid JWT Signature." al enviar una pestana por correo.
//
// Este script NO imprime tu clave privada en ningun momento -- solo revisa su
// FORMA (longitud, si tiene los marcadores BEGIN/END, si el reemplazo de \n
// funciono) y, al final, intenta autenticarse de verdad contra Google para ver
// el error real con mas detalle.
//
// Como correrlo:
//   cd a la carpeta del proyecto (donde esta tu .env real)
//   node diagnostico-google-auth.js

require('dotenv').config();

function enmascarar(email) {
  if (!email) return '(vacio)';
  const [usuario, dominio] = email.split('@');
  if (!dominio) return email;
  const usuarioCorto = usuario.length > 6 ? usuario.slice(0, 6) + '...' : usuario;
  return usuarioCorto + '@' + dominio;
}

console.log('--- 1. Variables presentes ---');
const emailRaw = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const keyRaw = process.env.GOOGLE_PRIVATE_KEY || '';
console.log('GOOGLE_SERVICE_ACCOUNT_EMAIL:', emailRaw ? enmascarar(emailRaw) : '*** FALTA ***');
console.log('GOOGLE_PRIVATE_KEY presente:', keyRaw ? 'si (' + keyRaw.length + ' caracteres)' : '*** FALTA ***');

console.log('\n--- 2. Forma de la clave (sin mostrar el contenido) ---');
const key = keyRaw.replace(/\\n/g, '\n');
const tieneBegin = key.includes('-----BEGIN PRIVATE KEY-----');
const tieneEnd = key.includes('-----END PRIVATE KEY-----');
const numLineas = key.split('\n').length;
const contieneBackslashN = keyRaw.includes('\\n');
console.log('Contiene "-----BEGIN PRIVATE KEY-----":', tieneBegin);
console.log('Contiene "-----END PRIVATE KEY-----":', tieneEnd);
console.log('El .env SI tenia "\\n" literales (esto es lo correcto):', contieneBackslashN);
console.log('Numero de lineas despues de convertir \\n -> salto de linea real:', numLineas, '(lo normal son 27-30)');

console.log('\n--- 3. Hora del sistema ---');
const ahora = new Date();
console.log('Fecha/hora de esta compu ahorita:', ahora.toString());
console.log('(Compara esto con la hora real de tu telefono/reloj -- si esta mal, Google rechaza el JWT)');

console.log('\n--- 4. Intentando autenticarse de verdad contra Google ---');
const { google } = require('googleapis');

async function probar() {
  const auth = new google.auth.JWT({
    email: emailRaw,
    key: key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  try {
    const token = await auth.authorize();
    console.log('EXITO: se pudo obtener un access_token. La autenticacion SI funciona.');
    console.log('Expira:', new Date(token.expiry_date).toString());
  } catch (e) {
    console.log('FALLO al autenticarse. Detalle completo del error:');
    console.log(JSON.stringify({
      message: e.message,
      response_data: e.response && e.response.data,
    }, null, 2));
  }
}

probar();
