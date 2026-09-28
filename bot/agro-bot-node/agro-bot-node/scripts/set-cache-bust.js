// Hostinger/LiteSpeed cachea los archivos estaticos (css/js) IGNORANDO el query string
// -- probamos "main.css?v=hash" y siguio sirviendo la copia vieja. La unica forma
// confiable de que el cache SIEMPRE detecte un archivo distinto cuando cambia el
// contenido es que el NOMBRE del archivo cambie de verdad. Este script:
//   1. tailwindcss siempre escribe "main.css" a secas (nombre fijo) -- aqui se renombra
//      a "main.<hash>.css" y se borran los "main.<hash-viejo>.css" que hayan quedado de
//      un build anterior.
//   2. Los bundles de JS ya salen con hash en el nombre gracias a webpack.config.js
//      ("[contenthash]" + "clean: true") -- aqui solo se detecta el archivo real de cada
//      entrada (index/login/actividad) en src/public/js/dist.
//   3. Actualiza los <link>/<script> de index.html, login.html y actividad.html para que
//      apunten exactamente al archivo de hoy (venga del nombre fijo de antes, de un hash
//      viejo, o de un intento anterior con "?v=..." -- las 3 variantes se reconocen).
// Se corre solo, como parte de "npm run build" (ver package.json).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAIZ = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(RAIZ, 'src', 'public');
const CSS_DIR = path.join(PUBLIC_DIR, 'css');
const JS_DIST_DIR = path.join(PUBLIC_DIR, 'js', 'dist');

function hashArchivo(rutaAbsoluta) {
  return crypto.createHash('md5').update(fs.readFileSync(rutaAbsoluta)).digest('hex').slice(0, 8);
}

// tailwindcss siempre deja el resultado en "main.css" (nombre fijo) -- lo renombramos a
// "main.<hash>.css" y limpiamos cualquier hash viejo que haya quedado de un build
// anterior, para no ir acumulando archivos sueltos.
function procesarCss() {
  const rutaFija = path.join(CSS_DIR, 'main.css');
  if (!fs.existsSync(rutaFija)) {
    console.warn('[cache-bust] no existe src/public/css/main.css, se omite CSS');
    return null;
  }
  const nombreFinal = `main.${hashArchivo(rutaFija)}.css`;

  for (const archivo of fs.readdirSync(CSS_DIR)) {
    if (/^main\.[0-9a-f]{8}\.css$/.test(archivo)) {
      // Se borra SIEMPRE (incluso si coincide con nombreFinal): un despliegue en
      // Hostinger puede dejar este archivo de un build anterior con permisos de
      // solo lectura, y copyFileSync trunca/sobrescribe (falla con EACCES) en vez
      // de crear un archivo nuevo. unlink si borra un archivo de solo lectura
      // mientras el directorio sea escribible, asi que quitamos el viejo primero
      // y dejamos que la copia de abajo cree uno nuevo siempre.
      fs.unlinkSync(path.join(CSS_DIR, archivo));
    }
  }

  fs.copyFileSync(rutaFija, path.join(CSS_DIR, nombreFinal));
  fs.unlinkSync(rutaFija); // no dejamos el "main.css" fijo, para que nada lo siga pidiendo por esa ruta vieja.
  return `/css/${nombreFinal}`;
}

// webpack.config.js ya genera "<entrada>.<hash>.bundle.js" con "clean: true" (ya no
// quedan sueltos los de builds anteriores) -- solo hay que encontrar el archivo real de
// cada entrada para saber a que apuntar desde el HTML.
function procesarJs(nombreEntrada) {
  if (!fs.existsSync(JS_DIST_DIR)) {
    console.warn('[cache-bust] no existe src/public/js/dist, se omite JS');
    return null;
  }
  const patron = new RegExp(`^${nombreEntrada}\\.[0-9a-f]{8,}\\.bundle\\.js$`);
  const encontrado = fs.readdirSync(JS_DIST_DIR).find((archivo) => patron.test(archivo));
  if (!encontrado) {
    console.warn(`[cache-bust] no se encontro el bundle con hash de "${nombreEntrada}" en src/public/js/dist (¿webpack.config.js tiene "[contenthash]" en el filename?)`);
    return null;
  }
  return `/js/dist/${encontrado}`;
}

const rutaCssNueva = procesarCss();
const rutasJsNuevas = {
  index: procesarJs('index'),
  login: procesarJs('login'),
  actividad: procesarJs('actividad'),
  monitoreo: procesarJs('monitoreo'),
};

// Reconoce las 3 variantes que puede tener hoy el HTML: el nombre fijo de siempre, un
// hash viejo de un build anterior, o un "?v=..." del intento anterior con query string.
const PATRON_CSS = /\/css\/main(\.[0-9a-f]+)?\.css(\?v=[a-f0-9]+)?/g;
function patronJs(nombreEntrada) {
  return new RegExp(`\\/js\\/dist\\/${nombreEntrada}(\\.[0-9a-f]+)?\\.bundle\\.js(\\?v=[a-f0-9]+)?`, 'g');
}

const PAGINA_POR_ENTRADA = {
  'index.html': 'index',
  'login.html': 'login',
  'actividad.html': 'actividad',
  'monitoreo.html': 'monitoreo',
};

for (const [nombreHtml, nombreEntrada] of Object.entries(PAGINA_POR_ENTRADA)) {
  const rutaHtml = path.join(PUBLIC_DIR, nombreHtml);
  if (!fs.existsSync(rutaHtml)) {
    console.warn(`[cache-bust] no existe ${rutaHtml}, se omite`);
    continue;
  }
  let html = fs.readFileSync(rutaHtml, 'utf8');
  const htmlOriginal = html;

  if (rutaCssNueva) {
    html = html.replace(PATRON_CSS, () => rutaCssNueva);
  }
  const rutaJsNueva = rutasJsNuevas[nombreEntrada];
  if (rutaJsNueva) {
    html = html.replace(patronJs(nombreEntrada), () => rutaJsNueva);
  }

  if (html !== htmlOriginal) {
    fs.writeFileSync(rutaHtml, html);
    console.log(`[cache-bust] ${nombreHtml} -> css=${rutaCssNueva || '(sin cambio)'} js=${rutaJsNueva || '(sin cambio)'}`);
  } else {
    console.log(`[cache-bust] ${nombreHtml} sin cambios`);
  }
}

console.log('[cache-bust] listo');
