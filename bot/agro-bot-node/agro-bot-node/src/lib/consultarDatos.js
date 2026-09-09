// Modo "consulta": cuando el mensaje es una PREGUNTA sobre datos ya guardados
// (ej. "que actividades se hicieron el 31 de agosto?") en vez de un reporte nuevo.
// No usa una segunda llamada a Gemini -- junta las filas que coinciden y arma una
// respuesta en texto con lo que encontro, tabla por tabla.

const sheets = require('../services/sheets');
const config = require('../config');

const NOMBRE_TABLA = {
  reporte_campo: 'Rendimiento Diario Jornal',
  actividades_diarias: 'Actividades Diarias',
  maquinaria: 'Maquinaria',
  insumos: 'Insumos',
  catalogos: 'Catálogos',
  resumen_semanal: 'Resumen Semanal',
  resumen_dia: 'Resumen del Día',
};

const TODAS_LAS_TABLAS = ['reporte_campo', 'actividades_diarias', 'maquinaria', 'insumos'];
// Catalogos y Resumen Semanal NO son listados de registros por fecha -- son de solo
// lectura y se tratan aparte (ver TABLAS_CRUDAS mas abajo), nunca entran al "todas".
const TABLAS_CRUDAS = ['catalogos', 'resumen_semanal'];

function numero(v) {
  return Number(v) || 0;
}

function enRango(fecha, desde, hasta) {
  const f = String(fecha || '').slice(0, 10);
  if (desde && f < desde) return false;
  if (hasta && f > hasta) return false;
  return true;
}

function coincideConPalabrasClave(fila, palabrasClave) {
  if (!palabrasClave) return true;
  const texto = Object.values(fila).join(' ').toLowerCase();
  return texto.includes(String(palabrasClave).toLowerCase());
}

// Une el estilo de linea de cada tabla usando los mismos nombres de columna reales
// que quedan en la hoja (leerHoja regresa objetos con el encabezado tal cual).
function resumirFila(tabla, r) {
  if (tabla === 'reporte_campo') {
    return `${r.Fecha || '-'} - ${r.Actividad || '-'} en ${r.Huerta || '-'} (${r.Ubicacion || '-'}), ` +
      `${r['Cantidad Realizada'] || '-'} ${r['Unidad de Medida'] || ''} (meta ${r['Meta de Rendimiento (jornal)'] || '-'}), ` +
      `resp. ${r.Responsable || '-'}${String(r['¿Incidencia?'] || '').toLowerCase().startsWith('si') ? ' [INCIDENCIA: ' + (r['Motivo de Incidencia'] || '-') + ']' : ''}`;
  }
  if (tabla === 'actividades_diarias') {
    return `${r.Fecha || '-'} - ${r.Actividad || '-'} en ${r.Campo || '-'}/${r.Lote || '-'}, ` +
      `${r['N° Jornaleros'] || '-'} jornaleros, resp. ${r.Responsable || '-'}`;
  }
  if (tabla === 'maquinaria') {
    return `${r.Fecha || '-'} - ${r.Equipo || '-'} (${r.Actividad || '-'}) en ${r.Huerta || '-'}, ` +
      `operador ${r.Responsable || '-'}, ${r.Litros || '-'} L, ${r.Horas || '-'} hrs`;
  }
  if (tabla === 'insumos') {
    return `${r.Fecha || '-'} - ${r['Recurso / Insumo'] || '-'} (${r.Cantidad || '-'} ${r['Unidad de Medida'] || ''}) ` +
      `para ${r['Motivo de Uso'] || '-'}, resp. ${r.Responsable || '-'}`;
  }
  return JSON.stringify(r);
}

// Catalogos: columnas independientes, cada una con su propia lista de valores (no hay
// "un registro por fila" como en las demas tablas). Se arma "Columna: valor1, valor2...".
function formatearCatalogos(filas) {
  if (filas.length === 0) return 'Catálogos: (la pestaña está vacía)';
  const [encabezados, ...resto] = filas;
  const lineas = encabezados.map((h, i) => {
    const valores = resto.map((f) => f[i]).filter((v) => v !== undefined && v !== null && v !== '');
    return `${h || '(sin nombre)'}: ${valores.join(', ') || '(sin valores)'}`;
  });
  return 'Catálogos:\n' + lineas.join('\n');
}

// Resumen Semanal: cuadricula fija de "etiqueta, valor" (ver armarCuadricula en
// cron/resumenSemanal.js) -- se imprime tal cual, solo se saltan las filas en blanco.
function formatearResumenSemanal(filas) {
  const lineas = filas
    .filter((f) => f[0] && String(f[0]).trim() !== '')
    .map((f) => `${f[0]}${f[1] !== undefined && f[1] !== '' ? ': ' + f[1] : ''}`);
  if (lineas.length === 0) return 'Resumen Semanal: (todavia no se ha generado ninguno)';
  return 'Resumen Semanal:\n' + lineas.join('\n');
}

// Resumen del Dia: a diferencia de Catalogos/Resumen Semanal, esta NO es una pestaña
// que se lea tal cual -- no existe una hoja "Resumen del Dia" en el documento. Se
// calcula al vuelo cada vez que se pregunta, juntando lo que ya se guardo HOY en
// Rendimiento Diario Jornal, Maquinaria e Insumos (mismo criterio que usa el resumen
// semanal, solo que acotado a un solo dia en vez de los ultimos 7).
async function calcularResumenDelDia() {
  const hoy = new Date().toISOString().slice(0, 10);

  const [filasMaquinaria, filasReporteCampo, filasInsumos] = await Promise.all([
    sheets.leerHoja('maquinaria').catch(() => []),
    sheets.leerHoja('reporte_campo').catch(() => []),
    sheets.leerHoja('insumos').catch(() => []),
  ]);

  const maquinariaHoy = filasMaquinaria.filter((r) => String(r.Fecha || '').slice(0, 10) === hoy);
  const reporteCampoHoy = filasReporteCampo.filter((r) => String(r.Fecha || '').slice(0, 10) === hoy);
  const insumosHoy = filasInsumos.filter((r) => String(r.Fecha || '').slice(0, 10) === hoy);

  const litrosTotales = maquinariaHoy.reduce((sum, r) => sum + numero(r.Litros), 0);
  const costoCombustible = maquinariaHoy.reduce((sum, r) => sum + numero(r['Costo Total']), 0);

  const registrosActividad = reporteCampoHoy.length;
  const incidenciasReportadas = reporteCampoHoy.filter((r) =>
    String(r['¿Incidencia?'] || '').trim().toLowerCase().startsWith('si')
  ).length;

  const costoInsumos = insumosHoy.reduce((sum, r) => sum + numero(r['Costo Total']), 0);
  const costoTotalDia = costoCombustible + costoInsumos;

  return { hoy, litrosTotales, costoCombustible, registrosActividad, incidenciasReportadas, costoInsumos, costoTotalDia };
}

function formatearResumenDelDia(r) {
  return (
    `Resumen del Día - ${r.hoy}\n\n` +
    `COMBUSTIBLE\nLitros cargados: ${r.litrosTotales}\nCosto de combustible: $${r.costoCombustible.toFixed(2)}\n\n` +
    `RENDIMIENTO DE PERSONAL\nRegistros de actividad: ${r.registrosActividad}\nIncidencias reportadas: ${r.incidenciasReportadas}\n\n` +
    `INSUMOS Y HERRAMIENTA\nCosto de insumos: $${r.costoInsumos.toFixed(2)}\n\n` +
    `COSTO TOTAL DEL DÍA: $${r.costoTotalDia.toFixed(2)}`
  );
}

async function consultarDatos({ TablaObjetivo, FechaDesde, FechaHasta, PalabrasClave }) {
  // Catalogos / Resumen Semanal: solo lectura, se ignoran fechas/palabras clave (no
  // aplican) y se regresa el contenido completo tal cual.
  if (TABLAS_CRUDAS.includes(TablaObjetivo)) {
    const { id, tab } = config.google.sheets[TablaObjetivo === 'catalogos' ? 'catalogos' : 'resumenSemanal'];
    const filas = await sheets.leerHojaCruda(id, tab).catch(() => []);
    return [{ tabla: TablaObjetivo, crudo: filas }];
  }

  // Resumen del Dia: calculado, no leido de una pestaña -- ver calcularResumenDelDia.
  if (TablaObjetivo === 'resumen_dia') {
    const r = await calcularResumenDelDia().catch(() => null);
    return [{ tabla: 'resumen_dia', textoListo: r ? formatearResumenDelDia(r) : 'No se pudo calcular el resumen del día.' }];
  }

  const tablas = TablaObjetivo && TABLAS_VALIDAS_INCLUYE(TablaObjetivo) ? [TablaObjetivo] : TODAS_LAS_TABLAS;

  const resultadosPorTabla = await Promise.all(
    tablas.map(async (tabla) => {
      const filas = await sheets.leerHoja(tabla).catch(() => []);
      const filtradas = filas.filter(
        (r) => enRango(r.Fecha, FechaDesde, FechaHasta) && coincideConPalabrasClave(r, PalabrasClave)
      );
      return { tabla, filas: filtradas };
    })
  );

  return resultadosPorTabla;
}

function TABLAS_VALIDAS_INCLUYE(tabla) {
  return TODAS_LAS_TABLAS.includes(tabla);
}

function armarRespuestaConsulta(resultadosPorTabla) {
  const partes = [];
  let totalEncontrados = 0;

  resultadosPorTabla.forEach((r) => {
    if (r.textoListo) {
      totalEncontrados += 1;
      partes.push(r.textoListo);
      return;
    }
    if (r.crudo) {
      totalEncontrados += r.crudo.length > 0 ? 1 : 0;
      partes.push(r.tabla === 'catalogos' ? formatearCatalogos(r.crudo) : formatearResumenSemanal(r.crudo));
      return;
    }
    const { tabla, filas } = r;
    if (filas.length === 0) return;
    totalEncontrados += filas.length;
    partes.push(`${NOMBRE_TABLA[tabla] || tabla} (${filas.length}):`);
    filas.slice(0, 15).forEach((f) => partes.push('- ' + resumirFila(tabla, f)));
    if (filas.length > 15) partes.push(`... y ${filas.length - 15} mas.`);
  });

  if (totalEncontrados === 0) {
    return 'No encontre registros que coincidan con tu pregunta.';
  }
  return partes.join('\n');
}

module.exports = { consultarDatos, armarRespuestaConsulta };
