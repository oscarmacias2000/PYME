const sheets = require('../services/sheets');
const gmail = require('../services/gmail');
const whatsapp = require('../services/whatsapp');
const config = require('../config');
const excelLocal = require('../services/excelLocal');
const { armarCuerpo: armarCuerpoResumenSemanal, armarCuadricula: armarCuadriculaResumenSemanal } = require('../cron/resumenSemanal');

// --- Equivalentes a "Armar confirmacion (Reporte Campo / Actividades Diarias)" ---

function armarConfirmacionReporteCampo(c) {
  return (
    `Registro guardado en Reporte de Campo\n` +
    `Fecha: ${c.Fecha || '-'}\n` +
    `Actividad: ${c.Actividad || '-'}\n` +
    `Huerta: ${c.Huerta || '-'} (${c.Ubicacion || '-'})\n` +
    `Responsable: ${c.Responsable || '-'}\n` +
    `Personas: ${c.NumeroDePersonas ?? '-'}\n` +
    `Realizado: ${c.CantidadRealizada ?? '-'} ${c.UnidadDeMedida || ''} (meta: ${c.MetaDeRendimiento ?? '-'})\n` +
    `Incidencia: ${c.Incidencia || 'No'}${c.MotivoDeIncidencia ? ' - ' + c.MotivoDeIncidencia : ''}\n` +
    `Obs: ${c.Observaciones || '-'}`
  );
}

function armarConfirmacionActividades(c) {
  return (
    `Registro guardado en Actividades Diarias\n` +
    `Fecha: ${c.Fecha || '-'}\n` +
    `Campo/Lote: ${c.Campo || '-'} / ${c.Lote || '-'}\n` +
    `Actividad: ${c.Actividad || '-'}\n` +
    `Responsable: ${c.Responsable || '-'}\n` +
    `Jornaleros: ${c.NumeroJornaleros ?? '-'} (${c.ProcedenciaCuadrilla || '-'})\n` +
    `Recursos: ${c.RecursosMaquinaria || '-'}\n` +
    `Costo/jornal: ${c.CostoPorJornal ?? '-'} | Nomina: ${c.NominaTotal ?? '-'}\n` +
    `Obs: ${c.Observaciones || '-'}`
  );
}

function armarConfirmacionMaquinaria(c) {
  return (
    `Registro guardado en Maquinaria\n` +
    `Fecha: ${c.Fecha || '-'}\n` +
    `Equipo: ${c.Equipo || '-'} (${c.Implemento || '-'})\n` +
    `Actividad: ${c.Actividad || '-'} en ${c.Huerta || '-'} (${c.Ubicacion || '-'})\n` +
    `Operador: ${c.Responsable || '-'}\n` +
    `Combustible: ${c.Litros ?? '-'} L (${c.TipoCombustible || '-'}) | ¿Tanque lleno?: ${c.TanqueLleno || '-'}\n` +
    `Horómetro actual: ${c.HorometroActual ?? '-'} | Precio Diésel: ${c.PrecioDiesel ?? '-'}\n` +
    `Avance: ${c.AvanceRendimiento ?? '-'}\n` +
    `Obs: ${c.Observaciones || '-'}`
  );
}

function armarConfirmacionInsumos(c) {
  return (
    `Registro guardado en Insumos\n` +
    `Fecha: ${c.Fecha || '-'}\n` +
    `Insumo: ${c.RecursoInsumo || '-'}\n` +
    `Cantidad: ${c.Cantidad ?? '-'} ${c.UnidadDeMedida || ''}\n` +
    `Motivo: ${c.MotivoDeUso || '-'} (${c.Actividad || '-'} en ${c.Huerta || '-'})\n` +
    `Costo: ${c.CostoPorUnidad ?? '-'} c/u | Total: ${c.CostoTotal ?? '-'}\n` +
    `Responsable: ${c.Responsable || '-'}`
  );
}

// Convierte los campos que llena a mano el formulario de "Resumen Semanal" al mismo
// formato {desde, hasta, litrosTotales, ...} que ya usa resumenSemanal.js (tanto para el
// correo como para la cuadricula que se escribe en la hoja/archivo) -- asi un resumen
// capturado a mano se ve y se guarda exactamente igual que el automatico del cron.
function camposAResumenSemanal(c) {
  const costoCombustible = Number(c.CostoCombustible) || 0;
  const costoInsumos = Number(c.CostoInsumos) || 0;
  return {
    desde: c.FechaDesde || '',
    hasta: c.FechaHasta || '',
    litrosTotales: Number(c.LitrosTotales) || 0,
    costoCombustible,
    registrosActividad: Number(c.RegistrosActividad) || 0,
    incidenciasReportadas: Number(c.IncidenciasReportadas) || 0,
    costoInsumos,
    // Si no se escribe a mano, se calcula igual que el automatico (combustible + insumos).
    costoTotalSemana: c.CostoTotalSemana !== undefined && c.CostoTotalSemana !== ''
      ? Number(c.CostoTotalSemana) || 0
      : costoCombustible + costoInsumos,
  };
}

// Guarda tambien en el archivo local excel/Reporte_campo 4.1.xlsx -- SIEMPRE ademas de
// Google Sheets, nunca en su lugar (ver aclaracion del usuario: "en ambos lados"). Si
// falla (archivo abierto en Excel, permisos, etc.) se registra en consola pero no se
// tumba el guardado real, que ya quedo bien en la hoja de Google.
async function guardarTambienEnArchivoLocal(tabla, campos, reportadoPor) {
  if (!['reporte_campo', 'insumos'].includes(tabla)) return;
  try {
    await excelLocal.guardarFilaLocal(tabla, campos, reportadoPor);
  } catch (e) {
    console.error(`No se pudo guardar en el archivo local (${tabla}):`, e.message);
  }
}

function armarMensajeNoEntendido(textoTranscrito) {
  return (
    'No pude identificar a que reporte pertenece tu mensaje. Intenta mencionar si es rendimiento/meta de una actividad, o jornaleros/nomina del dia.\n\n' +
    'Entendi: ' + (textoTranscrito || '(sin texto)')
  );
}

// --- Equivalente a "Hay incidencia?" + "Armar alerta incidencia" + "Enviar alerta incidencia" ---

async function revisarYAvisarIncidencia(campos, reportadoPor) {
  const incidencia = String(campos.Incidencia || '').trim().toLowerCase();
  if (!incidencia.startsWith('si')) return;

  const asunto = 'Incidencia reportada - ' + (campos.Fecha || new Date().toISOString().slice(0, 10));
  const cuerpo =
    'Se reporto una incidencia en campo.\n\n' +
    'Fecha: ' + (campos.Fecha || '-') + '\n' +
    'Huerta: ' + (campos.Huerta || '-') + ' (' + (campos.Ubicacion || '-') + ')\n' +
    'Actividad: ' + (campos.Actividad || '-') + '\n' +
    'Responsable: ' + (campos.Responsable || '-') + '\n' +
    'Motivo: ' + (campos.MotivoDeIncidencia || '-') + '\n' +
    'Observaciones: ' + (campos.Observaciones || '-') + '\n' +
    'Reportado por: ' + (reportadoPor || '-');

  try {
    await gmail.enviarCorreo({ asunto, texto: cuerpo, html: cuerpo.replace(/\n/g, '<br>') });
  } catch (e) {
    console.error('No se pudo enviar la alerta de incidencia por correo:', e.message);
  }
}

// --- Funcion principal: equivalente al tramo "Es Reporte de Campo? / Es Actividades Diarias?"
// en adelante, compartido por la rama web (bot-web-guardar) y la rama WhatsApp (auto-guardado). ---

async function guardarRegistro({ tabla, campos, reportadoPor, textoTranscrito, canal, whatsappFrom, whatsappPhoneNumberId }) {
  let ok = true;
  let mensaje;

  if (tabla === 'reporte_campo') {
    await sheets.guardarFila('reporte_campo', campos, reportadoPor);
    await guardarTambienEnArchivoLocal('reporte_campo', campos, reportadoPor);
    mensaje = armarConfirmacionReporteCampo(campos);
    await revisarYAvisarIncidencia(campos, reportadoPor);
  } else if (tabla === 'actividades_diarias') {
    await sheets.guardarFila('actividades_diarias', campos, reportadoPor);
    mensaje = armarConfirmacionActividades(campos);
  } else if (tabla === 'maquinaria') {
    await sheets.guardarFila('maquinaria', campos, reportadoPor);
    mensaje = armarConfirmacionMaquinaria(campos);
  } else if (tabla === 'insumos') {
    await sheets.guardarFila('insumos', campos, reportadoPor);
    await guardarTambienEnArchivoLocal('insumos', campos, reportadoPor);
    mensaje = armarConfirmacionInsumos(campos);
  } else if (tabla === 'resumen_semanal') {
    // No es una fila que se "agrega" -- es el mismo bloque de tamaño fijo que llena el
    // cron automatico cada domingo (ver src/cron/resumenSemanal.js). Capturarlo a mano
    // sobreescribe ese bloque, tanto en Google Sheets como en el archivo local.
    const r = camposAResumenSemanal(campos);
    const cuadricula = armarCuadriculaResumenSemanal(r);
    await sheets.escribirResumenSemanal(cuadricula);
    try {
      await excelLocal.escribirResumenSemanalLocal(cuadricula);
    } catch (e) {
      console.error('No se pudo guardar el Resumen Semanal en el archivo local:', e.message);
    }
    mensaje = armarCuerpoResumenSemanal(r).cuerpoTexto;
  } else {
    ok = false;
    mensaje = armarMensajeNoEntendido(textoTranscrito);
  }

  // Si el mensaje vino de WhatsApp, ademas de guardar le contestamos por ese mismo canal
  // (equivalente a los nodos "Enviar por WhatsApp? (...)" -> "WhatsApp: confirmar (...)").
  if (canal === 'whatsapp' && whatsappPhoneNumberId && whatsappFrom) {
    try {
      await whatsapp.enviarTexto(whatsappPhoneNumberId, whatsappFrom, mensaje);
    } catch (e) {
      console.error('No se pudo responder por WhatsApp:', e.response?.data || e.message);
    }
  }

  return { ok, mensaje };
}

// --- Boton "Enviar" de la bandeja del archivo 4.1: manda por correo lo capturado en el
// formulario, sin depender de que ya se haya guardado (el usuario puede usar Guardar,
// Enviar, o ambos, en cualquier orden). ---

const ASUNTOS_POR_TABLA = {
  reporte_campo: 'Reporte de Campo',
  insumos: 'Insumos',
  resumen_semanal: 'Resumen Semanal',
};

async function enviarRegistroPorCorreo({ tabla, campos }) {
  let asunto;
  let texto;
  let html;

  if (tabla === 'reporte_campo') {
    texto = armarConfirmacionReporteCampo(campos);
  } else if (tabla === 'insumos') {
    texto = armarConfirmacionInsumos(campos);
  } else if (tabla === 'resumen_semanal') {
    const r = camposAResumenSemanal(campos);
    const cuerpo = armarCuerpoResumenSemanal(r);
    asunto = cuerpo.asunto;
    texto = cuerpo.cuerpoTexto;
    html = cuerpo.cuerpoHtml;
  } else {
    throw new Error(`No se sabe como enviar por correo la tabla "${tabla}".`);
  }

  asunto = asunto || `${ASUNTOS_POR_TABLA[tabla] || tabla} - ${campos.Fecha || new Date().toISOString().slice(0, 10)}`;
  html = html || texto.replace(/\n/g, '<br>');

  await gmail.enviarCorreo({ asunto, texto, html });
}

module.exports = { guardarRegistro, enviarRegistroPorCorreo };
