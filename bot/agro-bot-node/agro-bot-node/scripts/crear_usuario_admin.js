// Crea (o actualiza) un usuario administrador -- corre esto UNA vez despues de crear
// las tablas con `npx prisma migrate dev`, porque la tabla de usuarios empieza vacia
// (a proposito ya no hay una pagina publica que autocree o muestre accesos).
//
// Uso:
//   npm run db:seed-admin -- "Tu Nombre" tu_usuario tu_password_segura
// o directo:
//   node scripts/crear_usuario_admin.js "Tu Nombre" tu_usuario tu_password_segura
//
// Si el usuario ya existe, actualiza su contraseña y lo deja como admin activo.
require('dotenv').config();
const { obtenerPrisma, porQueNoHayBase } = require('../src/services/prisma');
const { crearUsuario, buscarPorUsuario, cambiarPassword, cambiarRol, cambiarActivo } = require('../src/services/usuarios');

async function main() {
  // Aviso claro y temprano si la base no esta lista, en vez de un error de Prisma.
  if (!obtenerPrisma()) {
    console.log('No hay base de datos disponible: ' + porQueNoHayBase());
    console.log('Configura DATABASE_URL en el .env y corre `npx prisma generate` y `npm run db:migrate`.');
    process.exitCode = 1;
    return;
  }

  const [, , nombre, usuario, password] = process.argv;
  if (!nombre || !usuario || !password) {
    console.log('Uso: node scripts/crear_usuario_admin.js "Tu Nombre" tu_usuario tu_password_segura');
    process.exitCode = 1;
    return;
  }
  if (String(password).length < 6) {
    console.log('La contraseña debe tener al menos 6 caracteres.');
    process.exitCode = 1;
    return;
  }

  const existente = await buscarPorUsuario(usuario);
  if (existente) {
    await cambiarPassword(existente.id, password);
    await cambiarRol(existente.id, 'admin');
    await cambiarActivo(existente.id, true);
    console.log(`Ya existia "${usuario}" -- se actualizo su contraseña y quedo como admin activo.`);
  } else {
    await crearUsuario({ nombre, usuario, password, rol: 'admin' });
    console.log(`Usuario admin "${usuario}" creado correctamente. Ya puedes entrar en /login.`);
  }
}

main()
  .catch((e) => {
    console.error('Error creando el usuario admin:', e.message);
    process.exitCode = 1;
  })
  .finally(() => {
    const cliente = obtenerPrisma();
    if (cliente) cliente.$disconnect();
  });
