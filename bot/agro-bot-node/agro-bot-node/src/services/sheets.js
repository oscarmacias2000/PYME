const { google } = require('googleapis');
const config = require('../config');
const { getAuth } = require('./googleAuth');

let sheetsClient = null;

function getClient() {
  if (sheetsClient) return sheetsClient;
  sheetsClient = google.sheets({ version: 'v4', auth: getAuth() });
  return sheetsClient;
}

// Encabezados exactos de cada hoja (mismo orden que los nodos "Guardar en ..." de n8n,
// mas "maquinaria" e "insumos" agregados despues, sacados de "Reporte campo 3.0.xlsx").
const COLUMNAS_REPORTE_CAMPO = [
  'Fecha', 'Actividad', 'Ubicacion', 'Huerta', 'Responsable', 'N° de Personas',
  'Cantidad Realizada', 'Unidad de Medida', 'Meta de Rendimiento (jornal)',
  '¿Incidencia?', 'Motivo de Incidencia', 'Observaciones', 'Reportado por',
];

const COLUMNAS_ACTIVIDADES = [
  'Fecha', 'Campo', 'Lote', 'Actividad', 'Responsable', 'N° Jornaleros',
  'Procedencia / Cuadrilla', 'Recursos / Maquinaria', 'Costo por Jornal',
  'Nómina Total', 'Observaciones', 'Reportado por',
];

const COLUMNAS_MAQUINARIA = [
  'Fecha', 'Equipo', 'Implemento', 'Tipo de Combustible', 'Actividad', 'Ubicacion',
  'Huerta', 'Responsable', 'Litros', 'Horas', 'Costo Total', 'Avance/Rendimiento (ha)',
  'Observaciones', 'Reportado por',
];

const COLUMNAS_INSUMOS = [
  'Fecha', 'Recurso / Insumo', 'Cantidad', 'Unidad de Medida', 'Motivo de Uso',
  'Actividad', 'Huerta', 'Costo por Unidad', 'Costo Total', 'Responsable', 'Reportado por',
];

const CAMPOS_A_COLUMNAS_REPORTE_CAMPO = {
  Fecha: 'Fecha', Actividad: 'Actividad', Ubicacion: 'Ubicacion', Huerta: 'Huerta',
  Responsable: 'Responsable', NumeroDePersonas: 'N° de Personas', CantidadRealizada: 'Cantidad Realizada',
  UnidadDeMedida: 'Unidad de Medida', MetaDeRendimiento: 'Meta de Rendimiento (jornal)',
  Incidencia: '¿Incidencia?', MotivoDeIncidencia: 'Motivo de Incidencia', Observaciones: 'Observaciones',
};

const CAMPOS_A_COLUMNAS_ACTIVIDADES = {
  Fecha: 'Fecha', Campo: 'Campo', Lote: 'Lote', Actividad: 'Actividad', Responsable: 'Responsable',
  NumeroJornaleros: 'N° Jornaleros', ProcedenciaCuadrilla: 'Procedencia / Cuadrilla',
  RecursosMaquinaria: 'Recursos / Maquinaria', CostoPorJornal: 'Costo por Jornal',
  NominaTotal: 'Nómina Total', Observaciones: 'Observaciones',
};

const CAMPOS_A_COLUMNAS_MAQUINARIA = {
  Fecha: 'Fecha', Equipo: 'Equipo', Implemento: 'Implemento', TipoCombustible: 'Tipo de Combustible',
  Actividad: 'Actividad', Ubicacion: 'Ubicacion', Huerta: 'Huerta', Responsable: 'Responsable',
  Litros: 'Litros', Horas: 'Horas', CostoTotal: 'Costo Total', AvanceRendimiento: 'Avance/Rendimiento (ha)',
  Observaciones: 'Observaciones',
};

const CAMPOS_A_COLUMNAS_INSUMOS = {
  Fecha: 'Fecha', RecursoInsumo: 'Recurso / Insumo', Cantidad: 'Cantidad', UnidadDeMedida: 'Unidad de Medida',
  MotivoDeUso: 'Motivo de Uso', Actividad: 'Actividad', Huerta: 'Huerta', CostoPorUnidad: 'Costo por Unidad',
  CostoTotal: 'Costo Total', Responsable: 'Responsable',
};

const TABLAS = {
  reporte_campo: {
    config: () => config.google.sheets.reporteCampo,
    columnas: COLUMNAS_REPORTE_CAMPO,
    mapaCampos: CAMPOS_A_COLUMNAS_REPORTE_CAMPO,
  },
  actividades_diarias: {
    config: () => config.google.sheets.actividadesDiarias,
    columnas: COLUMNAS_ACTIVIDADES,
    mapaCampos: CAMPOS_A_COLUMNAS_ACTIVIDADES,
  },
  maquinaria: {
    config: () => config.google.sheets.maquinaria,
    columnas: COLUMNAS_MAQUINARIA,
    mapaCampos: CAMPOS_A_COLUMNAS_MAQUINARIA,
  },
  insumos: {
    config: () => config.google.sheets.insumos,
    columnas: COLUMNAS_INSUMOS,
    mapaCampos: CAMPOS_A_COLUMNAS_INSUMOS,
  },
};

function configDeTabla(tabla) {
  const def = TABLAS[tabla] || TABLAS.actividades_diarias;
  return { ...def.config(), columnas: def.columnas, mapaCampos: def.mapaCampos };
}

// Convierte un numero de columna (1, 2, 3... 26, 27) a su letra de Sheets (A, B, ... Z, AA).
function columnaLetra(n) {
  let letra = '';
  let resto = n;
  while (resto > 0) {
    const mod = (resto - 1) % 26;
    letra = String.fromCharCode(65 + mod) + letra;
    resto = Math.floor((resto - 1) / 26);
  }
  return letra;
}

// Agrega una fila nueva. OJO: aqui NO se usa values.append con insertDataOption, porque
// en documentos que vienen de un .xlsx subido (formato Office) o con huecos/formato en
// filas de abajo, el auto-deteccion de "tabla" de esa API a veces se confunde y termina
// insertando la fila nueva arriba (encima de filas 2, 3, 4...) en vez de al final. Para
// que siempre quede seguida, se calcula a mano cual es la siguiente fila vacia (leyendo
// solo la columna A, que siempre trae la Fecha) y se escribe ahi con values.update.
async function guardarFila(tabla, campos, reportadoPor) {
  const { id, tab, columnas, mapaCampos, filaInicial } = configDeTabla(tabla);
  const porColumna = {};
  Object.entries(mapaCampos).forEach(([campo, columna]) => {
    porColumna[columna] = campos?.[campo] ?? '';
  });
  porColumna['Reportado por'] = reportadoPor || '';

  const fila = columnas.map((c) => porColumna[c] ?? '');
  const sheets = getClient();

  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: `'${tab}'!A:A`,
  });
  const filasExistentes = data.values || [];
  // +1 = despues de la ultima fila con datos en A, pero nunca antes de "filaInicial" --
  // algunas hojas (ej. Actividades Diarias) tienen filas viejas arriba (instrucciones de
  // la plantilla, basura de pruebas con n8n) que el usuario prefiere no tocar ni borrar,
  // asi que los registros nuevos siempre se escriben de esa fila para abajo.
  const siguienteFila = Math.max(filasExistentes.length + 1, filaInicial || 1);

  const ultimaColumna = columnaLetra(columnas.length);
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `'${tab}'!A${siguienteFila}:${ultimaColumna}${siguienteFila}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [fila] },
  });
}

// Cuando guardamos la Fecha con USER_ENTERED, Sheets la reconoce como fecha de verdad
// (no como texto) para que quede bien ordenable/formateada igual que las demas filas.
// El problema: al leerla de vuelta, la API regresa el texto YA FORMATEADO segun el
// idioma/formato de la hoja (ej. "31/08/2026" en vez de "2026-08-31"), y todo el resto
// del codigo (busquedas por rango de fechas en consultas y en el resumen semanal)
// compara fechas como texto ISO "YYYY-MM-DD". Sin normalizar, esa comparacion casi
// nunca da match aunque el dato si exista -- por eso una pregunta como "que paso el 31
// de agosto" regresaba "no encontre registros" aunque la fila si estuviera guardada.
function normalizarFecha(valor) {
  const v = String(valor || '').trim();
  if (!v) return '';

  // Ya viene en ISO (YYYY-MM-DD, con o sin hora pegada).
  const iso = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;

  // Formato con separador "/" o "-": DD/MM/YYYY (formato tipico de Sheets en español).
  const conSeparador = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (conSeparador) {
    let [, a, b, anio] = conSeparador;
    let dia = Number(a), mes = Number(b);
    // Si el primer numero no puede ser dia de mes (>12) pero el segundo si, en realidad
    // veniamos en MM/DD/YYYY -- se voltean para no interpretar mal.
    if (dia > 12 && mes <= 12) { /* ya esta bien como DD/MM */ }
    else if (mes > 12 && dia <= 12) { [dia, mes] = [mes, dia]; }
    return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  return v; // No se reconoce el formato -- se deja tal cual.
}

// Lee toda la hoja y la regresa como lista de objetos {columna: valor}, usando la
// primera fila como encabezados (igual que el nodo "Leer historial" / "Leer Actividades Diarias").
// La columna "Fecha" siempre se regresa normalizada a YYYY-MM-DD.
async function leerHoja(tabla) {
  const { id, tab } = configDeTabla(tabla);
  const sheets = getClient();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: `'${tab}'`,
  });
  const filas = data.values || [];
  if (filas.length === 0) return [];
  const [encabezados, ...resto] = filas;
  return resto.map((fila) => {
    const obj = {};
    encabezados.forEach((h, i) => {
      const valor = fila[i] !== undefined ? fila[i] : '';
      obj[h] = h === 'Fecha' ? normalizarFecha(valor) : valor;
    });
    return obj;
  });
}

async function leerActividadesDiarias() {
  return leerHoja('actividades_diarias');
}

// Lectura "cruda" (2D, sin asumir header+Fecha por fila) para pestañas que no son un
// listado de registros -- Catalogos (columnas independientes de listas desplegables) y
// Resumen Semanal (cuadricula de etiqueta:valor). Solo lectura, para el modo "consulta".
async function leerHojaCruda(id, tab) {
  const sheets = getClient();
  const { data } = await sheets.spreadsheets.values.get({
    spreadsheetId: id,
    range: `'${tab}'`,
  });
  return data.values || [];
}

// Escribe la cuadricula del resumen semanal en su propia pestaña (dentro del mismo
// archivo de Reporte de Campo), igual que en la plantilla original. La pestaña debe
// existir de antemano (se crea a mano una vez, ver README).
async function escribirResumenSemanal(filas2D) {
  const { id, tab } = config.google.sheets.resumenSemanal;
  const sheets = getClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: id,
    range: `'${tab}'!A1:B19`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: filas2D },
  });
}

module.exports = {
  guardarFila,
  leerHoja,
  leerHojaCruda,
  leerActividadesDiarias,
  escribirResumenSemanal,
  configDeTabla,
  normalizarFecha,
};
