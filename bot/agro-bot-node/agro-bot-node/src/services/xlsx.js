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

module.exports = { filasAXlsxBuffer };
