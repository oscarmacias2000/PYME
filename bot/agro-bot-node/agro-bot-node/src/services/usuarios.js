// CRUD de usuarios + verificacion de contraseña (bcryptjs, sin dependencias nativas --
// mas facil de instalar en Windows y en un hosting compartido como Hostinger).
// bcryptjs se carga de forma perezosa a proposito: este modulo lo importa routes/auth.js
// al arrancar, y si el paquete faltara (un `npm install` incompleto en el servidor) un
// require en el tope tumbaria el bot ENTERO al iniciar. Asi, mientras se use el login
// compartido -- que no toca bcrypt -- ni se carga.
let bcryptCache = null;
function bcrypt() {
  if (!bcryptCache) bcryptCache = require('bcryptjs');
  return bcryptCache;
}
const { obtenerPrisma, porQueNoHayBase } = require('./prisma');

const RONDAS_SAL = 10;

// La base es opcional (ver services/prisma.js). Todas las funciones de abajo la
// necesitan, asi que se pide por aqui y se avienta un error entendible si no esta,
// en vez de un "cannot read property of null".
function db() {
  const cliente = obtenerPrisma();
  if (!cliente) {
    const e = new Error('La base de datos de usuarios no esta configurada. ' + porQueNoHayBase());
    e.sinBaseDeDatos = true;
    throw e;
  }
  return cliente;
}

async function buscarPorUsuario(usuario) {
  return db().usuario.findUnique({ where: { usuario } });
}

// Regresa el usuario si el usuario/password son correctos y la cuenta esta activa,
// o null si no (sin distinguir "no existe" de "password incorrecto", para no dar pistas).
async function verificarCredenciales(usuario, password) {
  const u = await buscarPorUsuario(usuario);
  if (!u || !u.activo) return null;
  const coincide = await bcrypt().compare(password || '', u.passwordHash);
  return coincide ? u : null;
}

async function crearUsuario({ nombre, usuario, email, password, rol = 'usuario' }) {
  const passwordHash = await bcrypt().hash(password, RONDAS_SAL);
  return db().usuario.create({
    data: { nombre, usuario, email: email || null, passwordHash, rol },
  });
}

// Nunca regresa passwordHash -- esta lista puede llegar directo a la pantalla de /usuarios.
async function listarUsuarios() {
  return db().usuario.findMany({
    select: {
      id: true, nombre: true, usuario: true, email: true,
      rol: true, activo: true, creadoEn: true,
    },
    orderBy: { creadoEn: 'asc' },
  });
}

async function cambiarPassword(id, passwordNuevo) {
  const passwordHash = await bcrypt().hash(passwordNuevo, RONDAS_SAL);
  return db().usuario.update({ where: { id }, data: { passwordHash } });
}

async function cambiarActivo(id, activo) {
  return db().usuario.update({ where: { id }, data: { activo: Boolean(activo) } });
}

async function cambiarRol(id, rol) {
  return db().usuario.update({ where: { id }, data: { rol } });
}

module.exports = {
  buscarPorUsuario,
  verificarCredenciales,
  crearUsuario,
  listarUsuarios,
  cambiarPassword,
  cambiarActivo,
  cambiarRol,
};
