// Diagnostico SIN usar spreadsheets.get() (esa llamada resulto estar bloqueada por
// completo en este documento -- "debe no ser un archivo de Office" -- asi que no sirve
// para ver el tamaño/lista de pestañas aqui). En vez de eso, esto solo usa
// values.get() con rangos explicitos, que es la misma operacion que ya funciona bien
// para "Rendimiento Diario Jornal" en el resto del bot.
//
// Revisa, una por una: si la pestaña existe, cuantas filas/columnas tiene contenido,
// y muestra las primeras filas -- para las pestañas "Maquinaria" e "Insumos".
//
// Uso: node scripts/diagnosticar_maquinaria_insumos.js
require('dotenv').config();
const { google } = require('googleapis');
const config = require('../src/config');

async function revisarPestana(sheetsApi, id, tab) {
  console.log(`\n=== "${tab}" ===`);
  try {
    const { data } = await sheetsApi.spreadsheets.values.get({
      spreadsheetId: id,
      range: `'${tab}'!A1:Z50`,
    });
    const filas = data.values || [];
    console.log(`OK -- la pestaña existe. Filas con datos en A1:Z50: ${filas.length}`);
    filas.forEach((f, i) => console.log(`  fila ${i + 1}:`, JSON.stringify(f)));
    if (filas.length === 0) console.log('  (la pestaña existe pero esta completamente vacia, ni siquiera tiene encabezado)');
  } catch (e) {
    console.log('ERROR al leer esta pestaña:');
    console.log(' ', JSON.stringify(e.response?.data || e.message));
  }
}

async function probarEscritura(sheetsApi, id, tab, fila) {
  console.log(`\n--- Prueba de escritura en "${tab}"!A${fila} (una celda de prueba) ---`);
  try {
    await sheetsApi.spreadsheets.values.update({
      spreadsheetId: id,
      range: `'${tab}'!A${fila}`,
      valueInputOption: 'RAW',
      requestBody: { values: [['prueba-diagnostico']] },
    });
    console.log(`OK -- se pudo escribir en la fila ${fila}.`);
  } catch (e) {
    console.log(`ERROR al escribir en la fila ${fila}:`);
    console.log(' ', JSON.stringify(e.response?.data || e.message));
  }
}

async function main() {
  const auth = new google.auth.JWT({
    email: config.google.serviceAccountEmail,
    key: config.google.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheetsApi = google.sheets({ version: 'v4', auth });
  const id = config.google.sheets.reporteCampo.id;

  await revisarPestana(sheetsApi, id, config.google.sheets.maquinaria.tab);
  await revisarPestana(sheetsApi, id, config.google.sheets.insumos.tab);

  // Prueba de escritura en una celda lejos de cualquier dato real (fila 500), para ver
  // si el problema es "la hoja no tiene tantas filas todavia".
  await probarEscritura(sheetsApi, id, config.google.sheets.maquinaria.tab, 500);
  // Y una prueba en una fila cercana/normal (fila 2), para comparar.
  await probarEscritura(sheetsApi, id, config.google.sheets.maquinaria.tab, 2);
}

main().catch((e) => {
  console.error('Error inesperado:', e.response?.data || e.message);
  process.exit(1);
});
