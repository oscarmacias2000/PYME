const express = require('express');
const path = require('path');

const router = express.Router();

// Rama 1: GET /bot-web -> sirve la pagina HTML (equivalente a "Webhook - Pagina del bot (GET)").
router.get('/bot-web', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
  console.log('GET /bot-web -> Sirviendo index.html');
});

function requerirSesion(req, res, next) {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.status(401).json({ ok: false, error: 'Sesion no iniciada' });
  }
}

router.use(requerirSesion);


module.exports = router;
