const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const config = require('../config');
const sheets = require('../services/sheets');
const gmail = require('../services/gmail');
const whatsapp = require('../services/whatsapp');
const drive = require('../services/drive');

// Carpeta donde se guarda una copia de cada resumen generado (ademas de mandarse por correo).
const CARPETA_RESUMENES = path.join(__dirname, '..', '..', 'resumenes');
if (!fs.existsSync(CARPETA_RESUMENES)) fs.mkdirSync(CARPETA_RESUMENES, { recursive: true });

// Equivalente a "Filtrar hoy y armar resumen": deja solo las filas de la fecha de hoy
// y calcula los totales (esto solo arma el TEXTO del correo -- el archivo adjunto es el
// documento original completo, exportado tal cual, ver ejecutarResumenDiario).
function filtrarHoyYArmarResumen(filas) {
  const hoy = new Date().toISOString().slice(0, 10);
  const deHoy = filas.filter((r) => String(r.Fecha || '').slice(0, 10) === hoy);

  let totalJornaleros = 0;
  let totalNomina = 0;
  const lineas = deHoy.map((r) => {
    totalJornaleros += Number(r['N° Jornaleros']) || 0;
    totalNomina += Number(r['Nómina Total']) || 0;
    return `- ${r.Campo || '-'} / ${r.Lote || '-'} - ${r.Actividad || '-'} (${r['N° Jornaleros'] || 0} jornaleros, resp. ${r.Responsable || '-'})`;
  });

  const cuerpoTexto =
    `Resumen de Actividades Agricolas - ${hoy}\n\n` +
    `Actividades registradas: ${deHoy.length}\n` +
    `Total jornaleros: ${totalJornaleros}\n` +
    `Nomina total estimada: $${totalNomina.toFixed(2)}\n\n` +
    (lineas.join('\n') || 'Sin registros para hoy.') +
    `\n\n(Se adjunta el documento original de Actividades Diarias completo.)`;

  const filasHtml = deHoy
    .map(
      (r) =>
        `<tr><td>${r.Campo || ''}</td><td>${r.Lote || ''}</td><td>${r.Actividad || ''}</td>` +
        `<td>${r.Responsable || ''}</td><td>${r['N° Jornaleros'] || ''}</td><td>${r['Nómina Total'] || ''}</td></tr>`
    )
    .join('');
  const cuerpoHtml =
    `<h2>Resumen de Actividades Agricolas - ${hoy}</h2>` +
    `<p>Actividades registradas: ${deHoy.length}<br>Total jornaleros: ${totalJornaleros}<br>Nomina total estimada: $${totalNomina.toFixed(2)}</p>` +
    `<table border="1" cellpadding="6" cellspacing="0"><tr><th>Campo</th><th>Lote</th><th>Actividad</th><th>Responsable</th><th>Jornaleros</th><th>Nomina</th></tr>${filasHtml}</table>` +
    `<p><i>Se adjunta el documento original de Actividades Diarias completo.</i></p>`;

  return { asunto: `Resumen diario de actividades agricolas - ${hoy}`, cuerpoTexto, cuerpoHtml };
}

async function ejecutarResumenDiario() {
  console.log('[resumen diario] generando...');
  const filas = await sheets.leerActividadesDiarias();
  const { asunto, cuerpoTexto, cuerpoHtml } = filtrarHoyYArmarResumen(filas);

  // El correo lleva adjunto el documento ORIGINAL de Actividades Diarias, exportado tal
  // cual esta en Drive (con todo lo integrado) -- ya no se arma un Excel nuevo desde cero.
  try {
    const { buffer, nombreArchivo: nombreOriginal } = await drive.exportarComoXlsx(config.google.sheets.actividadesDiarias.id);
    const marcaTiempo = new Date().toISOString().replace(/[:.]/g, '-');
    const nombreArchivo = `${marcaTiempo}-${nombreOriginal}`;

    // Guarda una copia en disco, ademas de mandarla por correo.
    fs.writeFileSync(path.join(CARPETA_RESUMENES, nombreArchivo), buffer);

    await gmail.enviarCorreoConAdjunto({
      asunto,
      html: cuerpoHtml,
      texto: cuerpoTexto,
      adjuntoBuffer: buffer,
      nombreArchivo,
    });
    console.log('[resumen diario] correo enviado con el documento original, copia guardada en resumenes/' + nombreArchivo);
  } catch (e) {
    console.error('[resumen diario] error enviando correo:', e.response?.data || e.message);
  }

  // Resumen por WhatsApp en paralelo (equivalente a "WhatsApp: enviar resumen").
  if (config.whatsapp.resumenPhoneNumberId && config.whatsapp.resumenNumeroDestino) {
    try {
      await whatsapp.enviarTexto(config.whatsapp.resumenPhoneNumberId, config.whatsapp.resumenNumeroDestino, cuerpoTexto);
      console.log('[resumen diario] WhatsApp enviado');
    } catch (e) {
      console.error('[resumen diario] error enviando WhatsApp:', e.response?.data || e.message);
    }
  }
}

function programarResumenDiario() {
  // Por defecto "0 20 * * *" (8:00 PM) en la zona horaria configurada (America/Mazatlan).
  cron.schedule(config.resumenCron, ejecutarResumenDiario, { timezone: config.timezone });
  console.log(`[resumen diario] programado con cron "${config.resumenCron}" (${config.timezone})`);
}

module.exports = { programarResumenDiario, ejecutarResumenDiario };
