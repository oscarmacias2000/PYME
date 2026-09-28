const { google } = require('googleapis');
const config = require('../config');
const { getAuth } = require('./googleAuth');

let sheetsClient = null;

function getClient() {
  if (sheetsClient) return sheetsClient;
  sheetsClient = google.sheets({ version: 'v4', auth: getAuth() });
  return sheetsClient;
}

// Encabezados exactos de cada hoja. IMPORTANTE (corregido -- ver nota mas abajo):
// 'reporte_campo' y 'maquinaria' viven en el archivo "Reporte_campo 4.1.xlsx" y esa
// version 4.1 metio columnas de FORMULA intercaladas entre las columnas de captura
// manual (Margen/% Cumplimiento en Rendimiento Diario Jornal; Horometro
// anterior/Horas trabajadas/Dias desde ultima carga/Consumo real/Costo real por
// hora/Consumo prom. movil/Estatus-Alerta/Costo Total en Maquinaria). Estas listas
// tienen que ser la posicion EXACTA de cada columna real de la hoja (de la A en
// adelante, sin saltarse ninguna), aunque no vayamos a escribir en todas -- guardarFila
// arma la fila completa y las columnas de formula simplemente se dejan '' (en blanco,
// para que Sheets siga calculando ahi si alguien arrastra la formula hacia abajo a mano).
// Ninguna de las dos hojas tiene una columna real "Reportado por" -- antes se escribia
// esa info en la siguiente columna en secuencia, que en la hoja real ya es una columna
// de formula (o de captura manual) distinta, corrompiendola. Se deja de escribir
// "Reportado por" en estas dos hojas hasta que se decida un lugar seguro para ella
// (agregar una columna nueva en la hoja real, fuera del alcance de este arreglo).
const COLUMNAS_REPORTE_CAMPO = [
  'Fecha', 'Actividad', 'Ubicacion', 'Huerta', 'Responsable', 'N° de Personas',
  'Cantidad Realizada', 'Unidad de Medida', 'Meta de Rendimiento (jornal)',
  'Margen (Real - Meta)', '% Cumplimiento', // formula -- no se escribe, queda ''
  '¿Incidencia?', 'Motivo de Incidencia', 'Observaciones',
];

const COLUMNAS_ACTIVIDADES = [
  'Fecha', 'Campo', 'Lote', 'Actividad', 'Responsable', 'N° Jornaleros',
  'Procedencia / Cuadrilla', 'Recursos / Maquinaria', 'Costo por Jornal',
  'Nómina Total', 'Observaciones', 'Reportado por',
];

const COLUMNAS_MAQUINARIA = [
  'Fecha', 'Equipo', 'Implemento', 'Tipo Comb.', 'Actividad (informativo)',
  'Ubicación (informativo)', 'Huerta (informativo)', 'Responsable de la carga',
  'Litros cargados', '¿Tanque lleno?',
  'Horómetro anterior', // formula (lookup del ultimo horometro del equipo) -- no se escribe
  'Horómetro actual',
  'Horas trabajadas', 'Días desde última carga', 'Consumo real (L/h)', // formula -- no se escribe
  'Precio Diésel ($/L)',
  'Costo real por hora', 'Consumo prom. móvil (L/h)', 'Estatus / Alerta', // formula -- no se escribe
  'Costo Total (Carga)', // formula (Litros x Precio) -- no se escribe, ver nota abajo
  'Avance/Rendim. (ha)', 'Observaciones',
];

const COLUMNAS_INSUMOS = [
  'Fecha', 'Recurso / Insumo', 'Cantidad', 'Unidad de Medida', 'Motivo de Uso',
  'Actividad', 'Huerta', 'Costo por Unidad',
  'Costo Total', // formula (Cantidad x Costo por Unidad) -- no se escribe, ver nota abajo
  'Responsable', 'Reportado por',
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

// Nota sobre las columnas de formula que se dejan en blanco (Margen, % Cumplimiento,
// Horometro anterior, Horas trabajadas, Dias desde ultima carga, Consumo real, Costo
// real por hora, Consumo prom. movil, Estatus/Alerta, Costo Total (Carga), Costo Total
// de Insumos): por ahora esas celdas quedan vacias en las filas que agrega el bot -- no
// se recalculan solas via API. Hay que arrastrar la formula de la fila de arriba a mano
// en Sheets/Excel (o resolverlo en una siguiente pasada calculando el valor en el
// backend). AvanceRendimiento/Observaciones en Maquinaria SI se escriben normal: esas
// dos columnas tenian pegada por error la formula de Estatus/Alerta y Costo Total en
// las filas viejas (bug del archivo original, no del bot) -- en las filas nuevas que
// agregue el bot quedan como columnas libres de texto/numero, como deberia ser.
const CAMPOS_A_COLUMNAS_MAQUINARIA = {
  Fecha: 'Fecha', Equipo: 'Equipo', Implemento: 'Implemento', TipoCombustible: 'Tipo Comb.',
  Actividad: 'Actividad (informativo)', Ubicacion: 'Ubicación (informativo)', Huerta: 'Huerta (informativo)',
  Responsable: 'Responsable de la carga', Litros: 'Litros cargados', TanqueLleno: '¿Tanque lleno?',
  HorometroActual: 'Horómetro actual', PrecioDiesel: 'Precio Diésel ($/L)',
  AvanceRendimiento: 'Avance/Rendim. (ha)', Observaciones: 'Observaciones',
};

const CAMPOS_A_COLUMNAS_INSUMOS = {
  Fecha: 'Fecha', RecursoInsumo: 'Recurso / Insumo', Cantidad: 'Cantidad', UnidadDeMedida: 'Unidad de Medida',
  MotivoDeUso: 'Motivo de Uso', Actividad: 'Actividad', Huerta: 'Huerta', CostoPorUnidad: 'Costo por Unidad',
  Responsable: 'Responsable',
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
  // Busca el primer hueco real en la columna A a partir de "filaInicial" -- NO se puede
  // usar simplemente "filasExistentes.length + 1", porque esa columna se lee completa
  // hasta la ULTIMA celda con algo escrito, y algunas hojas (ej. Actividades Diarias)
  // tienen basura vieja de pruebas con n8n mucho mas abajo, con un monton de filas vacias
  // en medio. Si se usara el largo total, el registro nuevo se iria hasta despues de esa
  // basura en vez de seguir la secuencia justo despues del ultimo dato real.
  const inicio = filaInicial || 1;
  let siguienteFila = inicio;
  for (let i = inicio - 1; i < filasExistentes.length; i++) {
    const valor = (filasExistentes[i] && filasExistentes[i][0]) || '';
    if (String(valor).trim() === '') {
      siguienteFila = i + 1;
      break;
    }
    siguienteFila = i + 2;
  }

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

// Lista las pestañas de un archivo de Google Sheets: [{ gid, titulo }]. Se usa en el
// menu "Documentos" para poder elegir QUE hoja descargar, en vez de bajar el archivo
// completo con todas sus pestañas (ver routes/botWeb.js -> /documentos/hojas).
// Solo pide las propiedades que se ocupan (fields), no el contenido de las celdas.
async function listarPestanas(id) {
  const sheets = getClient();
  const { data } = await sheets.spreadsheets.get({
    spreadsheetId: id,
    fields: 'sheets.properties(sheetId,title,index)',
  });
  return (data.sheets || [])
    .map((h) => h.properties || {})
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((p) => ({ gid: p.sheetId, titulo: p.title }));
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
  listarPestanas,
  escribirResumenSemanal,
  configDeTabla,
  normalizarFecha,
};
