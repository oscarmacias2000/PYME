// Protege las paginas/rutas del bot con una sesion simple (usuario+contraseña fijos,
// ver config.auth) -- no es un sistema de usuarios completo, es un login basico para
// que no cualquiera que entre a la direccion del bot pueda ver o capturar datos.
function requerirSesion(req, res, next) {
  if (req.session && req.session.autenticado) return next();

  // Si es una llamada de API hecha desde el frontend (fetch), regresa 401 en JSON en
  // vez de redirigir a /login (el JS del frontend decide que hacer con eso).
  const esLlamadaApi = req.path.startsWith('/bot-web-') || req.path.startsWith('/probar-resumen') ||
    req.path.startsWith('/enviar-tab-correo') || req.path === '/perfil';
  if (esLlamadaApi) {
    return res.status(401).json({ ok: false, mensaje: 'Sesion expirada, vuelve a iniciar sesion.' });
  }

  return res.redirect('/login');
}

module.exports = { requerirSesion };
