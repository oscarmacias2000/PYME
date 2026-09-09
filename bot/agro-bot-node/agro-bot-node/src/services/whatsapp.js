const axios = require('axios');
const config = require('../config');

function graphUrl(path) {
  return `https://graph.facebook.com/${config.whatsapp.graphVersion}/${path}`;
}

function headers() {
  return { Authorization: `Bearer ${config.whatsapp.token}` };
}

// Equivalente a los nodos "WhatsApp: confirmar (...)" / "WhatsApp: no entendido" / "WhatsApp: enviar resumen".
async function enviarTexto(phoneNumberId, to, mensaje) {
  const url = graphUrl(`${phoneNumberId}/messages`);
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: mensaje },
  };
  await axios.post(url, body, { headers: headers() });
}

// Equivalente a "Obtener URL de audio (Graph API)": el id de audio que manda Meta
// no es una URL directa, primero hay que pedirle a Graph la URL real.
async function obtenerUrlAudio(audioId) {
  const url = graphUrl(audioId);
  const { data } = await axios.get(url, { headers: headers() });
  return data.url;
}

// Equivalente a "Descargar audio" + "Audio a Base64": baja el binario y lo pasa a base64.
async function descargarAudioBase64(mediaUrl) {
  const { data, headers: resHeaders } = await axios.get(mediaUrl, {
    headers: headers(),
    responseType: 'arraybuffer',
  });
  const mimeType = resHeaders['content-type'] || 'audio/ogg';
  return { audioBase64: Buffer.from(data).toString('base64'), mimeType };
}

module.exports = { enviarTexto, obtenerUrlAudio, descargarAudioBase64 };
