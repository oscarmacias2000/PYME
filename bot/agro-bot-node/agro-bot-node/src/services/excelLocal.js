const path = require('path');
const ExcelJS = require('exceljs');
const { configDeTabla } = require('./sheets');

// Archivo de referencia "Reporte_campo 4.1.xlsx" que vive dentro del proyecto (carpeta
// excel/). A diferencia de sheets.js (que lee/escribe la hoja de Google en la nube, la
// fuente de verdad de los resumenes automaticos y el dashboard), este modulo lee y
// escribe DIRECTO sobre ese archivo local, como copia ADICIONAL de lo que ya se guarda
// en Google Sheets -- nunca en lugar de. Ver guardarRegistro.js, que llama a ambos.
const RUTA_ARCHIVO_LOCAL = path.join(__dirname, '..', '..', 'excel', 'Reporte_campo 4.1.xlsx');

// Pestañas del archivo local que corresponden 1 a 1 con tablas ya definidas en
// sheets.js -- mismas columnas y mismo orden, asi que reutilizamos su configDeTabla()
// en vez de duplicar las listas de columnas.
const TAB_LOCAL_POR_TABLA = {
  reporte_campo: 'Rendimiento Diario Jornal',
  insumos: 'Insumos',
};

async function abrirLibro() {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(RUTA_ARCHIVO_LOCAL);
  return wb;
}

// Igual criterio que se corrigio en sheets.js: busca el primer hueco real en la columna A
// a partir de la fila 2 (la 1 es encabezado), en vez de asumir que "la ultima fila usada"
// del archivo es el final -- este .xlsx trae miles de filas de formato/formulas
// arrastradas hacia abajo sin datos reales, y usar esa como referencia haria que los
// registros nuevos cayeran hasta el fondo del archivo en vez de seguir la secuencia.
function siguienteFilaLibre(ws) {
  let fila = 2;
  for (let r = 2; r <= ws.rowCount + 1; r++) {
    const valor = ws.getCell(r, 1).value;
    const vacio = valor === null || valor === undefined || String(valor).trim() === '';
    if (vacio) {
      fila = r;
      break;
    }
    fila = r + 1;
  }
  return fila;
}

// Agrega una fila nueva en la pestaña local correspondiente a "reporte_campo" o
// "insumos" (las unicas con capa 1-a-1 de columnas via configDeTabla).
async function guardarFilaLocal(tabla, campos, reportadoPor) {
  const tabNombre = TAB_LOCAL_POR_TABLA[tabla];
  if (!tabNombre) {
    throw new Error(`La tabla "${tabla}" no tiene pestaña definida en el archivo local.`);
  }

  const { columnas, mapaCampos } = configDeTabla(tabla);
  const porColumna = {};
  Object.entries(mapaCampos).forEach(([campo, columna]) => {
    porColumna[columna] = campos?.[campo] ?? '';
  });
  porColumna['Reportado por'] = reportadoPor || '';
  const fila = columnas.map((c) => porColumna[c] ?? '');

  const wb = await abrirLibro();
  const ws = wb.getWorksheet(tabNombre);
  if (!ws) {
    throw new Error(`No se encontro la pestaña "${tabNombre}" en el archivo local.`);
  }

  const filaDestino = siguienteFilaLibre(ws);
  fila.forEach((valor, i) => {
    ws.getCell(filaDestino, i + 1).value = valor === '' ? null : valor;
  });

  await wb.xlsx.writeFile(RUTA_ARCHIVO_LOCAL);
  return filaDestino;
}

// cuadricula: mismo formato que arma resumenSemanal.js/armarCuadricula (array de 19 filas
// [etiqueta, valor], empezando en A1) -- se reutiliza tal cual para que el bloque local
// quede identico al que se escribe en Google Sheets.
async function escribirResumenSemanalLocal(cuadricula) {
  const wb = await abrirLibro();
  const ws = wb.getWorksheet('Resumen Semanal');
  if (!ws) {
    throw new Error('No se encontro la pestaña "Resumen Semanal" en el archivo local.');
  }

  cuadricula.forEach((fila, i) => {
    ws.getCell(i + 1, 1).value = fila[0] === '' ? null : fila[0];
    ws.getCell(i + 1, 2).value = fila[1] === '' ? null : fila[1];
  });

  await wb.xlsx.writeFile(RUTA_ARCHIVO_LOCAL);
}

module.exports = { guardarFilaLocal, escribirResumenSemanalLocal, RUTA_ARCHIVO_LOCAL };
