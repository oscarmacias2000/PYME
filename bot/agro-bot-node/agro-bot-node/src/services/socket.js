// Envoltura chiquita sobre Socket.io para que el resto del proyecto pueda "avisar"
// eventos en tiempo real sin tener que importar server.js directamente (evita
// dependencias circulares). Se inicializa una sola vez desde server.js, con el servidor
// HTTP ya armado.
//
// Ademas lleva el registro de QUIEN esta usando la app ahora mismo: cada pestaña abierta
// (del bot o de "Actividad en vivo") mantiene un socket, y aqui se guarda quien es, desde
// cuando y que tan reciente fue su ultima señal. La lista se manda a los clientes cada
// vez que alguien entra o sale (evento "personas").
const { Server } = require('socket.io');

let io = null;

// socket.id -> datos de esa pestaña. Se limpia solo al desconectar.
const conectados = new Map();

// La pagina manda "presentarse" con el nombre que la persona escribio en "Tu nombre".
// Es lo mas cercano a una identidad que hay hoy: el login es UNO SOLO compartido por todo
// el equipo (ver config.auth), asi que req.session.usuario siempre dice lo mismo.
const SIN_NOMBRE = '(sin nombre)';

function ipDe(socket) {
  // Detras de un proxy (Hostinger/LiteSpeed) la IP real viene en X-Forwarded-For; el
  // address del socket seria la del proxy. Se toma la primera de la cadena.
  const reenviada = socket.handshake.headers['x-forwarded-for'];
  if (reenviada) return String(reenviada).split(',')[0].trim();
  return socket.handshake.address || '';
}

// Navegador/sistema en corto, para distinguir dispositivos sin volcar el user-agent entero.
function dispositivoDe(userAgent) {
  const ua = String(userAgent || '');
  const movil = /Android|iPhone|iPad|Mobile/i.test(ua);
  let navegador = 'otro';
  if (/Edg\//.test(ua)) navegador = 'Edge';
  else if (/OPR\//.test(ua)) navegador = 'Opera';
  else if (/Chrome\//.test(ua)) navegador = 'Chrome';
  else if (/Safari\//.test(ua)) navegador = 'Safari';
  else if (/Firefox\//.test(ua)) navegador = 'Firefox';
  return (movil ? 'Movil' : 'Escritorio') + ' / ' + navegador;
}

function listaPersonas() {
  return [...conectados.values()]
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      usuario: c.usuario,
      pagina: c.pagina,
      dispositivo: c.dispositivo,
      ip: c.ip,
      desde: c.desde,
      ultimaSenal: c.ultimaSenal,
    }))
    .sort((a, b) => new Date(a.desde) - new Date(b.desde));
}

function avisarPersonas() {
  if (!io) return;
  io.emit('personas', { total: conectados.size, personas: listaPersonas() });
}

function inicializar(servidorHttp, sessionMiddleware) {
  io = new Server(servidorHttp);

  // Comparte la sesion de Express con Socket.io. Sirve para dos cosas: saber quien se
  // conecta, y -- mas importante -- poder RECHAZAR sockets sin sesion. Antes cualquiera
  // que supiera la direccion podia abrir un socket sin haber iniciado sesion, porque
  // socket.io NO pasa por el middleware requerirSesion de Express.
  if (sessionMiddleware) {
    io.engine.use(sessionMiddleware);
    io.use((socket, next) => {
      const sesion = socket.request.session;
      if (sesion && sesion.autenticado) return next();
      next(new Error('sin sesion'));
    });
  }

  io.on('connection', (socket) => {
    const sesion = socket.request.session || {};
    // Si la sesion viene de una cuenta individual (hay usuarioId), su nombre es el bueno
    // y manda sobre lo que escriba la pagina. En el login compartido no sirve (todos
    // serian "admin"), asi que ahi se espera al nombre que la persona teclea en el bot.
    const nombreDeCuenta = sesion.usuarioId ? (sesion.nombre || sesion.usuario) : null;
    conectados.set(socket.id, {
      id: socket.id,
      nombreDeCuenta,
      nombre: nombreDeCuenta || SIN_NOMBRE,
      usuario: sesion.usuario || '(desconocido)',
      pagina: '',
      dispositivo: dispositivoDe(socket.handshake.headers['user-agent']),
      ip: ipDe(socket),
      desde: new Date().toISOString(),
      ultimaSenal: new Date().toISOString(),
    });
    avisarPersonas();

    // La pagina se identifica al conectar y cada vez que cambia el nombre.
    socket.on('presentarse', (datos) => {
      const c = conectados.get(socket.id);
      if (!c) return;
      const nombre = String((datos && datos.nombre) || '').trim();
      // El nombre de la cuenta no se pisa con el campo manual: es identidad verificada.
      c.nombre = c.nombreDeCuenta || (nombre ? nombre.slice(0, 40) : SIN_NOMBRE);
      c.pagina = String((datos && datos.pagina) || '').slice(0, 30);
      c.ultimaSenal = new Date().toISOString();
      avisarPersonas();
    });

    // Señal de vida: la manda la pagina cada tanto para que se note quien sigue ahi.
    socket.on('sigo-aqui', () => {
      const c = conectados.get(socket.id);
      if (c) c.ultimaSenal = new Date().toISOString();
    });

    socket.on('disconnect', () => {
      conectados.delete(socket.id);
      avisarPersonas();
    });
  });

  return io;
}

// Manda un evento a todos los que tengan abierta la pantalla de "Actividad en vivo".
// Si el socket todavia no se inicializo (o se llama antes de tiempo), no truena --
// simplemente no avisa nada.
function emitirEvento(nombre, datos) {
  if (!io) return;
  io.emit(nombre, datos);
}

// Para que otras partes (por ejemplo el panel de monitoreo) puedan preguntar quien esta
// conectado sin depender de Socket.io directamente.
function personasConectadas() {
  return { total: conectados.size, personas: listaPersonas() };
}

module.exports = { inicializar, emitirEvento, personasConectadas };
