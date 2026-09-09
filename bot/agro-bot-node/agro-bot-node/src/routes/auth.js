const express = require('express');
const path = require('path');
const config = require('../config');

const router = express.Router();

// GET /login -> sirve la pagina de inicio de sesion (publica, sin sesion requerida).
router.get('/login', (req, res) => {
  if (req.session && req.session.autenticado) return res.redirect('/bot-web');
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// POST /login -> valida usuario+contraseña (fijos, ver config.auth) y arranca la sesion.
router.post('/login', (req, res) => {
  const { usuario, password } = req.body || {};
  if (usuario === config.auth.usuario && password === config.auth.password) {
    req.session.autenticado = true;
    req.session.usuario = usuario;
    return res.json({ ok: true });
  }
  res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos.' });
});

// POST /logout -> cierra la sesion.
router.post('/logout', (req, res) => {
  if (!req.session) return res.json({ ok: true });
  req.session.destroy(() => res.json({ ok: true }));
});

// GET /perfil -> datos minimos del usuario con sesion iniciada (para el chip de perfil).
router.get('/perfil', (req, res) => {
  if (!req.session || !req.session.autenticado) return res.status(401).json({ ok: false });
  res.json({ ok: true, usuario: req.session.usuario });
});

function escapeHtml(v) {
  return String(v || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// GET /register -> pagina publica (a proposito, sin sesion) que muestra el usuario y
// contraseña configurados (login unico y compartido, ver config.auth). Es para cuando
// alguien del equipo no tiene o no recuerda el acceso -- OJO: como es publica, cualquiera
// con el link del bot puede ver estas credenciales. Si mas adelante quieres que solo la
// vea alguien que ya tenga sesion, se puede mover debajo de "requerirSesion" en server.js.
router.get('/register', (req, res) => {
  res.send(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Usuario y contraseña - Agro PYME</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; }
</style>
</head>
<body class="min-h-screen bg-stone-50 flex items-center justify-center px-4">

<div class="w-full max-w-sm">
  <div class="flex items-center gap-2 justify-center mb-8">
    <span class="text-2xl">🌱</span>
    <span class="font-semibold text-stone-700 tracking-tight">Agro PYME</span>
  </div>

  <div class="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
    <h1 class="text-xl font-bold text-stone-800 text-center">Usuario y contraseña</h1>
    <p class="text-sm text-stone-400 text-center mt-1 mb-6">Este es el acceso compartido del equipo para entrar al bot.</p>

    <div class="space-y-3">
      <div class="bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3">
        <p class="text-xs font-semibold text-stone-400 uppercase tracking-wide">Usuario</p>
        <p class="text-sm font-semibold text-stone-800 mt-0.5">${escapeHtml(config.auth.usuario)}</p>
      </div>
      <div class="bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3">
        <p class="text-xs font-semibold text-stone-400 uppercase tracking-wide">Contraseña</p>
        <p class="text-sm font-semibold text-stone-800 mt-0.5">${escapeHtml(config.auth.password)}</p>
      </div>
    </div>

    <button type="button" onclick="window.location.href='/login'"
      class="w-full bg-stone-900 hover:bg-black text-white font-semibold rounded-full py-3 text-sm transition mt-6">
      Ir a iniciar sesión
    </button>
  </div>

  <p class="text-xs text-stone-400 text-center mt-6">No compartas esta pagina fuera del equipo.</p>
</div>
</body>
</html>`);
});

module.exports = router;
