const express = require('express');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const { hayBaseDeDatos } = require('../services/prisma');
const usuariosService = require('../services/usuarios');

const router = express.Router();

// GET /login -> sirve la pagina de inicio de sesion (publica, sin sesion requerida).
router.get('/login', (req, res) => {
  if (req.session && req.session.autenticado) return res.redirect('/bot-web');
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// POST /login -> arranca la sesion. Dos caminos, en este orden:
//   1) Si HAY base de datos configurada, valida contra la tabla de usuarios (cada quien
//      con su cuenta, su nombre y su rol).
//   2) Si NO la hay, cae al acceso unico compartido de siempre (config.auth). Esto es a
//      proposito: permite subir esta version a un servidor que todavia no tiene MySQL
//      sin dejar a nadie fuera.
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body || {};

  if (hayBaseDeDatos()) {
    try {
      const u = await usuariosService.verificarCredenciales(usuario, password);
      if (u) {
        req.session.autenticado = true;
        req.session.usuarioId = u.id;
        req.session.usuario = u.usuario;
        req.session.nombre = u.nombre;
        req.session.rol = u.rol;
        return res.json({ ok: true });
      }
      return res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrectos.' });
    } catch (e) {
      // La base esta configurada pero no responde (credenciales malas, servidor caido,
      // tablas sin migrar...). Se avisa claro en vez de dejar entrar por la puerta de
      // atras sin querer.
      console.error('Error validando usuario contra la base:', e.message);
      return res.status(500).json({
        ok: false,
        mensaje: 'No se pudo validar el acceso contra la base de datos: ' + e.message,
      });
    }
  }

  // Modo compartido (sin base de datos). El unico acceso que existe es el del dueño,
  // por eso su rol es "admin".
  if (usuario === config.auth.usuario && password === config.auth.password) {
    req.session.autenticado = true;
    req.session.usuario = usuario;
    req.session.nombre = usuario;
    req.session.rol = 'admin';
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
  res.json({
    ok: true,
    usuario: req.session.usuario,
    nombre: req.session.nombre || req.session.usuario,
    rol: req.session.rol || 'usuario',
    // La UI usa esto para mostrar u ocultar el acceso a /usuarios.
    multiusuario: hayBaseDeDatos(),
  });
});

// POST /perfil-foto -> guarda la foto de perfil. Como el login es unico y compartido
// (no hay un sistema de multiples usuarios, ver config.auth), es UNA sola foto para
// todo el equipo -- se sobreescribe siempre el mismo archivo. El navegador ya la manda
// recortada a cuadro y comprimida a JPEG (ver recortarYComprimirFoto en index.html), asi
// que aqui solo se decodifica el base64 y se escribe tal cual.
router.post('/perfil-foto', (req, res) => {
  if (!req.session || !req.session.autenticado) return res.status(401).json({ ok: false });
  const { foto_base64: fotoBase64 } = req.body || {};
  if (!fotoBase64) return res.status(400).json({ ok: false, mensaje: 'Falta la foto.' });
  try {
    const buffer = Buffer.from(fotoBase64, 'base64');
    const destino = path.join(__dirname, '..', 'public', 'img', 'perfil.jpg');
    fs.writeFileSync(destino, buffer);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, mensaje: 'No se pudo guardar la foto: ' + e.message });
  }
});

// Pagina minima reutilizable (mismo estilo del resto) para avisos sin credenciales.
function paginaSimple(titulo, texto) {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(titulo)} - La Pedregoza</title>
<link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32.png?v=2">
<script src="https://cdn.tailwindcss.com"></script>
<style>body { font-family: 'Segoe UI', system-ui, sans-serif; }</style>
</head>
<body class="min-h-screen bg-stone-50 flex items-center justify-center px-4">
  <div class="w-full max-w-sm bg-white rounded-3xl shadow-sm border border-stone-100 p-8 text-center">
    <img src="/img/pedregoza-logo.png" alt="La Pedregoza" class="h-8 w-auto mx-auto mb-5">
    <h1 class="text-xl font-bold text-stone-800">${escapeHtml(titulo)}</h1>
    <p class="text-sm text-stone-500 mt-3">${escapeHtml(texto)}</p>
    <button type="button" onclick="window.location.href='/login'"
      class="w-full bg-stone-900 hover:bg-black text-white font-semibold rounded-full py-3 text-sm transition mt-6">
      Ir a iniciar sesion
    </button>
  </div>
</body>
</html>`;
}

function escapeHtml(v) {
  return String(v || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// GET /register -> "Ver usuario y contraseña" del login.
//
// En modo compartido muestra el acceso del equipo, como siempre. En cuanto haya base de
// datos NO muestra ninguna credencial: con cuentas individuales seria un agujero enorme
// (esta pagina es publica), asi que en ese modo solo explica que hay que pedirle acceso
// a un administrador.
router.get('/register', (req, res) => {
  if (hayBaseDeDatos()) {
    return res.send(paginaSimple(
      'Acceso individual',
      'Este bot ya usa cuentas individuales: cada persona tiene su propio usuario y contraseña. ' +
      'Si todavia no tienes acceso, pideselo a un administrador del equipo, que puede crearte una ' +
      'cuenta desde la pantalla de Usuarios.'
    ));
  }
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
    <span class="text-2xl"></span>
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
