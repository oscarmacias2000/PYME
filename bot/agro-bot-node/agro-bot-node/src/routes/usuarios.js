const express = require('express');
const path = require('path');
const { requerirAdmin } = require('../middleware/auth');
const usuariosService = require('../services/usuarios');

// Cuando la base todavia no esta configurada, estas rutas no deben contestar un 500
// generico ("no se pudo leer la lista") -- eso manda a buscar un bug donde no lo hay.
// Se distingue ese caso y se dice exactamente que falta.
function responderError(res, e, mensajeGenerico) {
  if (e && e.sinBaseDeDatos) {
    return res.status(503).json({
      ok: false,
      sinBaseDeDatos: true,
      mensaje: 'Las cuentas individuales necesitan una base de datos MySQL, y todavia no esta ' +
        'configurada. Mientras tanto el bot sigue con el acceso unico compartido. ' +
        '(Detalle: ' + e.message + ')',
    });
  }
  console.error(mensajeGenerico + ':', e.message);
  return res.status(500).json({ ok: false, mensaje: mensajeGenerico + '.' });
}

const router = express.Router();

// GET /usuarios -> pagina de administracion (solo admins, ver middleware/auth.js).
router.get('/usuarios', requerirAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'usuarios.html'));
});

// GET /admin/usuarios -> lista de usuarios (sin password) para pintar la tabla.
router.get('/admin/usuarios', requerirAdmin, async (req, res) => {
  try {
    const usuarios = await usuariosService.listarUsuarios();
    res.json({ ok: true, usuarios });
  } catch (e) {
    responderError(res, e, 'No se pudo leer la lista de usuarios');
  }
});

// POST /admin/usuarios -> crea un usuario nuevo.
router.post('/admin/usuarios', requerirAdmin, async (req, res) => {
  try {
    const { nombre, usuario, email, password, rol } = req.body || {};
    if (!nombre || !usuario || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Faltan nombre, usuario o contraseña.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    const nuevo = await usuariosService.crearUsuario({
      nombre: String(nombre).trim(),
      usuario: String(usuario).trim(),
      email: email ? String(email).trim() : null,
      password: String(password),
      rol: rol === 'admin' ? 'admin' : 'usuario',
    });
    res.json({ ok: true, usuario: { id: nuevo.id, usuario: nuevo.usuario } });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ ok: false, mensaje: 'Ese nombre de usuario o correo ya existe.' });
    }
    responderError(res, e, 'No se pudo crear el usuario');
  }
});

// POST /admin/usuarios/:id/password -> resetea la contraseña de alguien (p.ej. si la olvido).
router.post('/admin/usuarios/:id/password', requerirAdmin, async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password || String(password).length < 6) {
      return res.status(400).json({ ok: false, mensaje: 'La contraseña debe tener al menos 6 caracteres.' });
    }
    await usuariosService.cambiarPassword(Number(req.params.id), String(password));
    res.json({ ok: true });
  } catch (e) {
    responderError(res, e, 'No se pudo cambiar la contraseña');
  }
});

// POST /admin/usuarios/:id/activo -> activa/desactiva una cuenta (no la borra, por si
// se necesita revisar su historial de registros mas adelante).
router.post('/admin/usuarios/:id/activo', requerirAdmin, async (req, res) => {
  try {
    const { activo } = req.body || {};
    await usuariosService.cambiarActivo(Number(req.params.id), Boolean(activo));
    res.json({ ok: true });
  } catch (e) {
    responderError(res, e, 'No se pudo actualizar el usuario');
  }
});

module.exports = router;
