// Diagnostico: el bot dice "Registro guardado" pero el usuario no lo ve en el Sheet.
// Esto revisa exactamente que hay en la columna A (Fecha) de "Actividades Diarias",
// para detectar si hay algun valor "fantasma" muy abajo (basura vieja de pruebas de
// n8n) que este haciendo que guardarFila() calcule mal cual es "la siguiente fila
// vacia" y termine escribiendo muy por debajo de lo que se ve a simple vista.
//
// Uso: node scripts/diagnosticar_actividades.js
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

  console.log(`Documento: ${id}`);
  console.log(`Pestaña: ${tab}\n`);

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: `'${tab}'!A:A`,
  });
  const columnaA = data.values || [];
  console.log(`Total de filas detectadas en la columna A (incluye encabezado): ${columnaA.length}`);
  console.log(`--> El bot escribiría el próximo registro nuevo en la fila ${columnaA.length + 1}\n`);

  console.log('Ultimas 20 filas de la columna A (fila real : valor):');
  const desde = Math.max(0, columnaA.length - 20);
  for (let i = desde; i < columnaA.length; i++) {
    const valor = (columnaA[i] && columnaA[i][0]) || '(vacio)';
    console.log(`  fila ${i + 1}: "${valor}"`);
  }

  const vacias = columnaA.filter((c) => !c[0] || String(c[0]).trim() === '').length;
  if (vacias > 0) {
    console.log(`\n⚠ Hay ${vacias} filas "vacías" dentro del rango detectado -- si alguna de ellas`);
    console.log('  tiene basura invisible o formato pero sin texto, puede estar corriendo el calculo.');
  }

  // Trae tambien las ultimas 5 filas COMPLETAS (todas las columnas), para confirmar que
  // el ultimo registro que se guardo si tiene los datos correctos.
  const { data: dataCompleta } = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: `'${tab}'`,
  });
  const filas = dataCompleta.values || [];
  console.log(`\nTotal de filas con datos en TODA la hoja (values.get sin rango de columna): ${filas.length}`);
  console.log('Ultimas 3 filas completas:');
  filas.slice(-3).forEach((f, idx) => {
    console.log(`  [${filas.length - 3 + idx + 1}]`, JSON.stringify(f));
  });
}

main().catch((e) => {
  console.error('Error:', e.response?.data || e.message);
  process.exit(1);
});
