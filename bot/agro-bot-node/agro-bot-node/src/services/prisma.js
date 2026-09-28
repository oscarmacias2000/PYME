// Cliente unico de Prisma compartido en todo el proyecto -- crear una sola instancia
// evita agotar las conexiones a MySQL cuando el servidor recarga codigo.
//
// IMPORTANTE: la base de datos es OPCIONAL. El bot nacio con un login unico compartido
// (config.auth) y sigue funcionando asi mientras no exista DATABASE_URL. Por eso el
// cliente se crea de forma perezosa y tolera fallar: si no hay DATABASE_URL, o si
// @prisma/client todavia no se ha generado (`npx prisma generate`), esto regresa null
// en vez de tronar y tumbar el servidor entero al arrancar.
//
// Asi, subir esta version a un servidor que todavia no tiene base de datos no rompe nada:
// el login sigue usando el usuario/contraseña compartidos hasta que se configure MySQL.

let cliente = null;
let yaSeIntento = false;
let motivoFalla = null;

function obtenerPrisma() {
  if (yaSeIntento) return cliente;
  yaSeIntento = true;

  if (!process.env.DATABASE_URL) {
    motivoFalla = 'No hay DATABASE_URL en el .env (la base de datos no esta configurada).';
    return null;
  }

  try {
    // require() dentro del try a proposito: si el paquete no esta instalado o el cliente
    // no se ha generado, esto avienta y se atrapa aqui en vez de matar el arranque.
    const { PrismaClient } = require('@prisma/client');
    cliente = global.__prismaClient || new PrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      global.__prismaClient = cliente;
    }
  } catch (e) {
    motivoFalla = 'No se pudo iniciar Prisma: ' + e.message +
      ' (¿falta `npm install` o `npx prisma generate`?)';
    console.warn('[base de datos] ' + motivoFalla);
    cliente = null;
  }

  return cliente;
}

function hayBaseDeDatos() {
  return obtenerPrisma() !== null;
}

// Para poder explicarle al usuario POR QUE no hay base, en vez de un error generico.
function porQueNoHayBase() {
  obtenerPrisma();
  return motivoFalla;
}

module.exports = { obtenerPrisma, hayBaseDeDatos, porQueNoHayBase };
