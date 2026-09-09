const express = require('express');
const path = require('path');

const router = express.Router();

// GET /actividad-en-vivo -> panel con el feed de eventos en tiempo real (Socket.io).
// Se monta despues de requerirSesion en server.js, igual que el resto del bot -- no es
// publica.
router.get('/actividad-en-vivo', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'actividad.html'));
});

module.exports = router;
