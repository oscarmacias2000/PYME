const express = require('express');
const config = require('../config');
const { clasificarMensaje } = require('../lib/clasificar');
const { guardarRegistro } = require('../lib/guardarRegistro');
const { consultarDatos, armarRespuestaConsulta } = require('../lib/consultarDatos');
const whatsapp = require('../services/whatsapp');

const router = express.Router();

// Rama 5: GET /whatsapp-agro -> handshake de verificacion que pide Meta al configurar
// el webhook (equivalente a "Webhook - Verificacion Meta (GET)" -> "Token valido?").
router.get('/whatsapp-agro', (req, res) => {
  const modo = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (modo === 'subscribe' && token === config.whatsapp.verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Token invalido');
  }
});

// Rama 6: POST /whatsapp-agro -> mensajes reales de WhatsApp.
// A diferencia del bot web, aqui NO se pide confirmacion: se clasifica y se guarda
// directo, y la respuesta se manda de vuelta por WhatsApp (equivalente a
// "Webhook - Mensajes WhatsApp (POST)" -> "Extraer mensaje WhatsApp" -> ... -> "Es Reporte de Campo?").
router.post('/whatsapp-agro', async (req, res) => {
  // Meta espera un 200 rapido; el procesamiento real no debe bloquear la respuesta.
  res.sendStatus(200);

  let from, phoneNumberId;
  try {
    const msg = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const metadata = req.body?.entry?.[0]?.changes?.[0]?.value?.metadata;
    if (!msg) return; // Puede ser un evento de "status" (entregado/leido), no un mensaje.

    const tipo = msg.type;
    const textoBody = msg.text?.body || '';
    const audioId = msg.audio?.id || '';
    from = msg.from;
    phoneNumberId = metadata?.phone_number_id;

    let audioBase64 = '';
    let mimeType = '';
    if (tipo === 'audio' && audioId) {
      const mediaUrl = await whatsapp.obtenerUrlAudio(audioId);
      const descarga = await whatsapp.descargarAudioBase64(mediaUrl);
      audioBase64 = descarga.audioBase64;
      mimeType = descarga.mimeType;
    }

    const clasificado = await clasificarMensaje({ tipo, textoBody, audioBase64, mimeType });

    // Si es una PREGUNTA sobre datos ya guardados, no se guarda nada: se busca en las
    // hojas y se responde directo por WhatsApp con lo que se encontro.
    if (clasificado.tabla === 'consulta') {
      const resultadosPorTabla = await consultarDatos(clasificado.campos || {});
      const respuesta = armarRespuestaConsulta(resultadosPorTabla);
      if (phoneNumberId && from) {
        await whatsapp.enviarTexto(phoneNumberId, from, respuesta);
      }
      return;
    }

    await guardarRegistro({
      tabla: clasificado.tabla,
      campos: clasificado.campos,
      reportadoPor: 'WhatsApp ' + (from || ''),
      textoTranscrito: clasificado.texto_transcrito,
      canal: 'whatsapp',
      whatsappFrom: from,
      whatsappPhoneNumberId: phoneNumberId,
    });
  } catch (e) {
    if (e.esCuotaExcedida) {
      const segundos = e.segundosEspera ? Math.ceil(e.segundosEspera) : 30;
      console.error(`Limite de la IA alcanzado (WhatsApp), esperar ~${segundos}s`);
      if (phoneNumberId && from) {
        try {
          await whatsapp.enviarTexto(phoneNumberId, from, `Se alcanzo el limite de mensajes del plan de IA por ahora. Intenta de nuevo en ${segundos} segundos.`);
        } catch (e2) {
          console.error('No se pudo avisar por WhatsApp del limite de la IA:', e2.response?.data || e2.message);
        }
      }
      return;
    }
    console.error('Error procesando mensaje de WhatsApp:', e.response?.data || e.message);
  }
});

module.exports = router;
