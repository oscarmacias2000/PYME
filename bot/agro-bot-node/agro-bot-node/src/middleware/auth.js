// Protege las paginas/rutas del bot con una sesion.
//
// Hay DOS modos conviviendo a proposito:
//   1) Sin base de datos: login unico compartido por el equipo (config.auth). Es como
//      nacio el bot y sigue funcionando asi mientras no exista DATABASE_URL.
//   2) Con base de datos: cada quien tiene su cuenta y su rol (ver services/usuarios.js).
// La sesion guarda "rol" en los dos casos -- en el modo compartido es "admin", porque el
// unico acceso que existe es el del dueño del bot.
function requerirSesion(req, res, next) {
  if (req.session && req.session.autenticado) return next();

  // Si es una llamada de API hecha desde el frontend (fetch), regresa 401 en JSON en
  // vez de redirigir a /login (el JS del frontend decide que hacer con eso).
  const esLlamadaApi = req.path.startsWith('/bot-web-') || req.path.startsWith('/probar-resumen') ||
    req.path.startsWith('/enviar-tab-correo') || req.path === '/perfil' || req.path.startsWith('/admin/');
  if (esLlamadaApi) {
    return res.status(401).json({ ok: false, mensaje: 'Sesion expirada, vuelve a iniciar sesion.' });
  }

  return res.redirect('/login');
}

// Solo para la administracion de usuarios (/usuarios y /admin/usuarios*). Va SIEMPRE
// despues de requerirSesion en server.js, nunca sola.
function requerirAdmin(req, res, next) {
  if (!req.session || !req.session.autenticado) {
    return res.status(401).json({ ok: false, mensaje: 'Inicia sesion primero.' });
  }
  if (req.session.rol !== 'admin') {
    // Respuesta distinta segun si es una pagina o una llamada de API, igual que arriba.
    if (req.path.startsWith('/admin/')) {
      return res.status(403).json({ ok: false, mensaje: 'Necesitas permisos de administrador.' });
    }
    return res.status(403).send('Necesitas permisos de administrador para ver esta pagina.');
  }
  return next();
}

module.exports = { requerirSesion, requerirAdmin };
