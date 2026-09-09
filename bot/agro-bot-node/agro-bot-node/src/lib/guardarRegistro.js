const sheets = require('../services/sheets');
const gmail = require('../services/gmail');
const whatsapp = require('../services/whatsapp');
const config = require('../config');

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
    `Combustible: ${c.Litros ?? '-'} L (${c.TipoCombustible || '-'}) | Horas: ${c.Horas ?? '-'}\n` +
    `Costo: ${c.CostoTotal ?? '-'} | Avance: ${c.AvanceRendimiento ?? '-'}\n` +
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
    mensaje = armarConfirmacionInsumos(campos);
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

module.exports = { guardarRegistro };
