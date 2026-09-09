// Agrega las pestañas "Maquinaria" e "Insumos" al archivo de Reporte de Campo que YA
// EXISTE (el mismo que usa "Rendimiento Diario Jornal"), con los encabezados correctos.
// No crea ningun archivo nuevo -- solo le agrega pestañas a uno que ya esta compartido
// con la cuenta de servicio, asi que si funciona (crear archivos SI esta bloqueado,
// agregar pestañas a uno existente NO).
//
// Uso:
//   node scripts/agregar_tabs_maquinaria_insumos.js

require('dotenv').config();
const { google } = require('googleapis');
const config = require('../src/config');

const PESTAÑAS = [
  {
    titulo: config.google.sheets.maquinaria.tab,
    encabezados: [
      'Fecha', 'Equipo', 'Implemento', 'Tipo de Combustible', 'Actividad', 'Ubicacion',
      'Huerta', 'Responsable', 'Litros', 'Horas', 'Costo Total', 'Avance/Rendimiento (ha)',
      'Observaciones', 'Reportado por',
    ],
  },
  {
    titulo: config.google.sheets.insumos.tab,
    encabezados: [
      'Fecha', 'Recurso / Insumo', 'Cantidad', 'Unidad de Medida', 'Motivo de Uso',
      'Actividad', 'Huerta', 'Costo por Unidad', 'Costo Total', 'Responsable', 'Reportado por',
    ],
  },
];

async function main() {
  const spreadsheetId = config.google.sheets.reporteCampo.id;

  const auth = new google.auth.JWT({
    email: config.google.serviceAccountEmail,
    key: config.google.privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('Leyendo el archivo de Reporte de Campo...');
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const yaExisten = meta.data.sheets.map((s) => s.properties.title);
  console.log('Pestañas actuales:', yaExisten.join(', '));

  const faltantes = PESTAÑAS.filter((p) => !yaExisten.includes(p.titulo));

  if (faltantes.length > 0) {
    console.log('Agregando pestañas nuevas:', faltantes.map((p) => p.titulo).join(', '));
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: faltantes.map((p) => ({ addSheet: { properties: { title: p.titulo } } })),
      },
    });
  } else {
    console.log('Las pestañas ya existian, solo se van a (re)escribir los encabezados.');
  }

  for (const p of PESTAÑAS) {
    console.log('Escribiendo encabezados en "' + p.titulo + '"...');
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${p.titulo}'!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [p.encabezados] },
    });
  }

  // Negritas en la fila 1 de cada pestaña nueva (si falla no es grave).
  try {
    const metaActualizada = await sheets.spreadsheets.get({ spreadsheetId });
    const requests = PESTAÑAS.map((p) => {
      const hoja = metaActualizada.data.sheets.find((s) => s.properties.title === p.titulo);
      return {
        repeatCell: {
          range: { sheetId: hoja.properties.sheetId, startRowIndex: 0, endRowIndex: 1 },
          cell: { userEnteredFormat: { textFormat: { bold: true } } },
          fields: 'userEnteredFormat.textFormat.bold',
        },
      };
    });
    await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody: { requests } });
  } catch (e) {
    console.log('(no se pudo poner en negritas, no pasa nada)');
  }

  console.log('');
  console.log('Listo. "Maquinaria" e "Insumos" ya estan listas para que el bot guarde ahi.');
  console.log('URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId + '/edit');
  console.log('Reinicia el servidor (Ctrl+C y "npm start" de nuevo) para que tome el codigo nuevo.');
}

main().catch((e) => {
  console.error('Error:', e.response ? JSON.stringify(e.response.data) : e.message);
  process.exit(1);
});
