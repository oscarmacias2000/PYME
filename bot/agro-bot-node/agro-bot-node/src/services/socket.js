// Envoltura chiquita sobre Socket.io para que el resto del proyecto pueda "avisar"
// eventos en tiempo real sin tener que importar server.js directamente (evita
// dependencias circulares). Se inicializa una sola vez desde server.js, con el servidor
// HTTP ya armado.
//
// Paso 1 (base): solo se conecta y no emite ningun evento real todavia. Los pasos
// siguientes (WhatsApp, guardados desde la web, Gemini, Sheets, correos...) van a usar
// emitirEvento() para mandar avisos que la pantalla "Actividad en vivo" mostrara.
const { Server } = require('socket.io');

let io = null;

function inicializar(servidorHttp) {
  io = new Server(servidorHttp);

  io.on('connection', (socket) => {
    console.log('[socket] cliente conectado:', socket.id);
    socket.on('disconnect', () => {
      console.log('[socket] cliente desconectado:', socket.id);
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

module.exports = { inicializar, emitirEvento };
