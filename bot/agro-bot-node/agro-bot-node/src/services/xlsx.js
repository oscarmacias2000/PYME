const ExcelJS = require('exceljs');

// Equivalente al nodo "Convert to File" (operation: xlsx): arma un Excel en memoria
// a partir de una lista de objetos {columna: valor}.
async function filasAXlsxBuffer(filas, nombreHoja = 'Resumen') {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(nombreHoja);

  if (filas.length > 0) {
    const columnas = Object.keys(filas[0]);
    ws.columns = columnas.map((c) => ({ header: c, key: c, width: Math.max(12, c.length + 2) }));
    filas.forEach((fila) => ws.addRow(fila));
    ws.getRow(1).font = { bold: true };
  } else {
    ws.addRow(['Sin registros']);
  }

  return wb.xlsx.writeBuffer();
}

// Variante para filas "crudas" (array de arrays, como las regresa sheets.leerHojaCruda):
// la fila 0 son los encabezados tal cual estan en la pestaña. Se usa para descargar UNA
// hoja del archivo de Google Sheets en vez del libro completo (ver routes/botWeb.js ->
// /documentos/descargar). A diferencia de filasAXlsxBuffer, no reordena ni renombra nada:
// respeta el layout exacto de la pestaña, incluso columnas con encabezado vacio.
async function filas2DAXlsxBuffer(filas2D, nombreHoja = 'Hoja1') {
  const wb = new ExcelJS.Workbook();
  // Excel no admite : \ / ? * [ ] en el nombre de la hoja, ni mas de 31 caracteres.
  const nombreSeguro = String(nombreHoja).replace(/[:\\/?*[\]]/g, '-').slice(0, 31) || 'Hoja1';
  const ws = wb.addWorksheet(nombreSeguro);

  if (!filas2D || filas2D.length === 0) {
    ws.addRow(['Sin registros']);
    return wb.xlsx.writeBuffer();
  }

  filas2D.forEach((fila) => ws.addRow(Array.isArray(fila) ? fila : [fila]));
  ws.getRow(1).font = { bold: true };

  // Ancho por columna segun el contenido mas largo (con tope, para que no queden
  // columnas gigantes por una sola celda con mucho texto).
  const numColumnas = filas2D.reduce((max, f) => Math.max(max, (f || []).length), 0);
  for (let i = 0; i < numColumnas; i++) {
    const largo = filas2D.reduce((max, f) => Math.max(max, String((f || [])[i] ?? '').length), 0);
    ws.getColumn(i + 1).width = Math.min(50, Math.max(12, largo + 2));
  }

  return wb.xlsx.writeBuffer();
}

module.exports = { filasAXlsxBuffer, filas2DAXlsxBuffer };
