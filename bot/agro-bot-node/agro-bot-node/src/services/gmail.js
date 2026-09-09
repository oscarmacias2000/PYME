const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.gmail.user,
      pass: config.gmail.appPassword,
    },
  });
  return transporter;
}

// Equivalente al nodo "Enviar alerta incidencia" (sin adjunto).
async function enviarCorreo({ asunto, html, texto }) {
  const t = getTransporter();
  await t.sendMail({
    from: config.gmail.user,
    to: config.gmail.correoDestino,
    subject: asunto,
    text: texto,
    html,
  });
}

// Equivalente al nodo "Enviar resumen por correo" (con el xlsx adjunto).
async function enviarCorreoConAdjunto({ asunto, html, texto, adjuntoBuffer, nombreArchivo }) {
  const t = getTransporter();
  await t.sendMail({
    from: config.gmail.user,
    to: config.gmail.correoDestino,
    subject: asunto,
    text: texto,
    html,
    attachments: [
      {
        filename: nombreArchivo,
        content: adjuntoBuffer,
      },
    ],
  });
}

module.exports = { enviarCorreo, enviarCorreoConAdjunto };
