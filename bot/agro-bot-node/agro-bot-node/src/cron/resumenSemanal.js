// Resumen Semanal, sacado de la estructura real de la pestaña "Resumen Semanal" en
// "Reporte campo 3.0.xlsx": combustible (litros/costo de Maquinaria), rendimiento de
// personal (registros e incidencias de Reporte de Campo), insumos (costo de Insumos),
// y el costo total de la semana. No es un tipo de reporte que se llene por chat -- se
// calcula solo, juntando lo que ya se guardo en las otras tablas durante la semana.

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const config = require('../config');
const sheets = require('../services/sheets');
const gmail = require('../services/gmail');
const whatsapp = require('../services/whatsapp');
const drive = require('../services/drive');

const CARPETA_RESUMENES = path.join(__dirname, '..', '..', 'resumenes');
if (!fs.existsSync(CARPETA_RESUMENES)) fs.mkdirSync(CARPETA_RESUMENES, { recursive: true });

function aISO(d) {
  return d.toISOString().slice(0, 10);
}

// Ultimos 7 dias (hoy incluido), sin importar en que dia de la semana se dispare el cron.
function rangoSemana() {
  const hoy = new Date();
  const inicio = new Date(hoy);
  inicio.setDate(inicio.getDate() - 6);
  return { desde: aISO(inicio), hasta: aISO(hoy) };
}

function enRango(fecha, desde, hasta) {
  const f = String(fecha || '').slice(0, 10);
  return f >= desde && f <= hasta;
}

function numero(v) {
  return Number(v) || 0;
}

async function calcularResumenSemanal() {
  const { desde, hasta } = rangoSemana();

  const [filasMaquinaria, filasReporteCampo, filasInsumos] = await Promise.all([
    sheets.leerHoja('maquinaria').catch(() => []),
    sheets.leerHoja('reporte_campo').catch(() => []),
    sheets.leerHoja('insumos').catch(() => []),
  ]);

  const maquinariaSemana = filasMaquinaria.filter((r) => enRango(r.Fecha, desde, hasta));
  const reporteCampoSemana = filasReporteCampo.filter((r) => enRango(r.Fecha, desde, hasta));
  const insumosSemana = filasInsumos.filter((r) => enRango(r.Fecha, desde, hasta));

  const litrosTotales = maquinariaSemana.reduce((sum, r) => sum + numero(r.Litros), 0);
  const costoCombustible = maquinariaSemana.reduce((sum, r) => sum + numero(r['Costo Total']), 0);

  const registrosActividad = reporteCampoSemana.length;
  const incidenciasReportadas = reporteCampoSemana.filter((r) =>
    String(r['¿Incidencia?'] || '').trim().toLowerCase().startsWith('si')
  ).length;

  const costoInsumos = insumosSemana.reduce((sum, r) => sum + numero(r['Costo Total']), 0);

  const costoTotalSemana = costoCombustible + costoInsumos;

  return {
    desde, hasta,
    litrosTotales, costoCombustible,
    registrosActividad, incidenciasReportadas,
    costoInsumos,
    costoTotalSemana,
  };
}

function armarCuerpo(r) {
  const cuerpoTexto =
    `Resumen Semanal de Reportes de Campo\n` +
    `Semana del ${r.desde} al ${r.hasta}\n\n` +
    `COMBUSTIBLE\n` +
    `Litros totales cargados: ${r.litrosTotales}\n` +
    `Costo total de combustible: $${r.costoCombustible.toFixed(2)}\n\n` +
    `RENDIMIENTO DE PERSONAL\n` +
    `Registros de actividad capturados: ${r.registrosActividad}\n` +
    `Incidencias reportadas: ${r.incidenciasReportadas}\n\n` +
    `INSUMOS Y HERRAMIENTA\n` +
    `Costo total de insumos: $${r.costoInsumos.toFixed(2)}\n\n` +
    `COSTO TOTAL DE LA SEMANA: $${r.costoTotalSemana.toFixed(2)}`;

  const cuerpoHtml =
    `<h2>Resumen Semanal de Reportes de Campo</h2>` +
    `<p>Semana del <b>${r.desde}</b> al <b>${r.hasta}</b></p>` +
    `<h3>Combustible</h3>` +
    `<p>Litros totales cargados: ${r.litrosTotales}<br>Costo total de combustible: $${r.costoCombustible.toFixed(2)}</p>` +
    `<h3>Rendimiento de personal</h3>` +
    `<p>Registros de actividad capturados: ${r.registrosActividad}<br>Incidencias reportadas: ${r.incidenciasReportadas}</p>` +
    `<h3>Insumos y herramienta</h3>` +
    `<p>Costo total de insumos: $${r.costoInsumos.toFixed(2)}</p>` +
    `<h3>Costo total de la semana: $${r.costoTotalSemana.toFixed(2)}</h3>`;

  return { asunto: `Resumen semanal - ${r.desde} al ${r.hasta}`, cuerpoTexto, cuerpoHtml };
}

// Mismo acomodo de filas que tiene la pestaña "Resumen Semanal" en la plantilla original
// (Reporte campo 3.0.xlsx): titulo en A1, fechas en A3/A4, y 3 secciones con blancos
// entre medio. Se sobreescribe cada vez que corre, asi siempre queda con lo mas reciente.
function armarCuadricula(r) {
  const filas = Array.from({ length: 19 }, () => ['', '']);
  filas[0] = ['Resumen Semanal de Reportes de Campo', ''];
  filas[2] = ['Semana del:', r.desde];
  filas[3] = ['Al:', r.hasta];
  filas[7] = ['COMBUSTIBLE', ''];
  filas[8] = ['Litros totales cargados', r.litrosTotales];
  filas[9] = ['Costo total de combustible', r.costoCombustible];
  filas[11] = ['RENDIMIENTO DE PERSONAL', ''];
  filas[12] = ['Registros de actividad capturados', r.registrosActividad];
  filas[13] = ['Incidencias reportadas', r.incidenciasReportadas];
  filas[15] = ['INSUMOS Y HERRAMIENTA', ''];
  filas[16] = ['Costo total de insumos', r.costoInsumos];
  filas[18] = ['COSTO TOTAL DE LA SEMANA', r.costoTotalSemana];
  return filas;
}

async function ejecutarResumenSemanal() {
  console.log('[resumen semanal] generando...');
  const r = await calcularResumenSemanal();
  const { asunto, cuerpoTexto, cuerpoHtml } = armarCuerpo(r);

  // Ademas de mandarlo por correo, deja el resultado escrito en la pestaña "Resumen
  // Semanal" del documento (si la pestaña no existe todavia esto falla solo, sin tumbar
  // el correo/WhatsApp -- hay que crearla a mano una vez, ver README).
  try {
    await sheets.escribirResumenSemanal(armarCuadricula(r));
    console.log('[resumen semanal] pestaña "Resumen Semanal" actualizada');
  } catch (e) {
    console.error('[resumen semanal] no se pudo escribir en la pestaña (¿ya la creaste?):', e.message);
  }

  // El correo lleva adjunto el documento ORIGINAL de Reporte de Campo (con Rendimiento
  // Diario Jornal, Maquinaria, Insumos y la pestaña "Resumen Semanal" que se acaba de
  // actualizar arriba), exportado tal cual esta en Drive -- ya no se arma un Excel nuevo.
  try {
    const { buffer, nombreArchivo: nombreOriginal } = await drive.exportarComoXlsx(config.google.sheets.resumenSemanal.id);
    const marcaTiempo = new Date().toISOString().replace(/[:.]/g, '-');
    const nombreArchivo = `${marcaTiempo}-${nombreOriginal}`;
    fs.writeFileSync(path.join(CARPETA_RESUMENES, nombreArchivo), buffer);

    await gmail.enviarCorreoConAdjunto({
      asunto, html: cuerpoHtml, texto: cuerpoTexto, adjuntoBuffer: buffer, nombreArchivo,
    });
    console.log('[resumen semanal] correo enviado con el documento original, copia guardada en resumenes/' + nombreArchivo);
  } catch (e) {
    console.error('[resumen semanal] error enviando correo:', e.response?.data || e.message);
  }

  if (config.whatsapp.resumenPhoneNumberId && config.whatsapp.resumenNumeroDestino) {
    try {
      await whatsapp.enviarTexto(config.whatsapp.resumenPhoneNumberId, config.whatsapp.resumenNumeroDestino, cuerpoTexto);
      console.log('[resumen semanal] WhatsApp enviado');
    } catch (e) {
      console.error('[resumen semanal] error enviando WhatsApp:', e.response?.data || e.message);
    }
  }
}

function programarResumenSemanal() {
  cron.schedule(config.resumenSemanalCron, ejecutarResumenSemanal, { timezone: config.timezone });
  console.log(`[resumen semanal] programado con cron "${config.resumenSemanalCron}" (${config.timezone})`);
}

module.exports = { programarResumenSemanal, ejecutarResumenSemanal };
