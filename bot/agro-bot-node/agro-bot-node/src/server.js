const express = require('express');
const http = require('http');
const path = require('path');
const session = require('express-session');
const config = require('./config');
const { programarResumenDiario, ejecutarResumenDiario } = require('./cron/resumenDiario');
const { programarResumenSemanal, ejecutarResumenSemanal } = require('./cron/resumenSemanal');
const { requerirSesion } = require('./middleware/auth');
const socketService = require('./services/socket');

const authRoute = require('./routes/auth');
const botWebRoute = require('./routes/botWeb');
const mensajeRoute = require('./routes/mensaje');
const guardarRoute = require('./routes/guardar');
const historialRoute = require('./routes/historial');
const whatsappWebhookRoute = require('./routes/whatsappWebhook');
const enviarTabCorreoRoute = require('./routes/enviarTabCorreo');
const actividadEnVivoRoute = require('./routes/actividadEnVivo');
const monitoreoRoute = require('./routes/monitoreo');
const usuariosRoute = require('./routes/usuarios');

const app = express();

// Socket.io necesita el servidor HTTP "de verdad" (no solo la app de Express) para
// poder mantener las conexiones abiertas -- por eso de aqui para abajo se usa
// "servidorHttp.listen(...)" en vez de "app.listen(...)".
const servidorHttp = http.createServer(app);

// Limite alto porque el audio grabado en el navegador llega como base64 dentro del JSON.
app.use(express.json({ limit: '25mb' }));

// La sesion se guarda en una variable (en vez de pasarla suelta a app.use) para poder
// compartirla con Socket.io: asi el servidor sabe QUIEN abrio cada socket y puede
// rechazar los que no tengan sesion iniciada (ver services/socket.js).
const middlewareSesion = session({
  secret: config.auth.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 12 }, // 12 horas
});
app.use(middlewareSesion);

socketService.inicializar(servidorHttp, middlewareSesion);

// /login, /logout, /perfil -- publicas (sin sesion requerida para poder iniciar sesion).
app.use(authRoute);

// El webhook de WhatsApp (Meta) NO lleva cookie de sesion -- tiene que quedar afuera
// del login, si no Meta nunca podria mandarle mensajes al bot.
app.use(whatsappWebhookRoute);

// Assets publicos (imagenes, CSS compilado de Tailwind, JS empaquetado con Webpack) --
// publico a proposito, sin sesion, porque tanto /login como /bot-web los necesitan
// antes de saber si hay sesion iniciada o no. El CSS/JS se generan con `npm run build`
// (ver package.json) a partir de frontend/styles y frontend/js -- nunca se editan
// src/public/css o src/public/js/dist a mano, se vuelven a generar solos.
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));

// El navegador siempre pide "/favicon.ico" solo (sin importar el <link rel="icon"> de
// cada pagina) -- como no hay static mount en la raiz, antes esto daba 404 en la consola.
// Se sirve aparte, apuntando al mismo ícono del mango que ya se usa en el <link> de abajo.
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'img', 'favicon.ico'));
});

// De aqui para abajo, todo requiere sesion iniciada.
app.use(requerirSesion);

app.use(botWebRoute);
app.use(mensajeRoute);
app.use(guardarRoute);
app.use(historialRoute);
app.use(enviarTabCorreoRoute);
app.use(actividadEnVivoRoute);
// Panel de monitoreo de los modelos de IA (queda detras de requerirSesion, como todo
// lo de arriba: expone el modelo configurado y contadores, no es para publico).
app.use(monitoreoRoute);
// Administracion de usuarios (/usuarios y /admin/usuarios*). Cada ruta de adentro
// exige rol admin (requerirAdmin); si no hay base de datos configurada, responden con
// un mensaje claro en vez de tronar.
app.use(usuariosRoute);

app.get('/', (req, res) => res.redirect('/bot-web'));

// Endpoints manuales para probar los resumenes sin esperar al cron (solo para el prototipo).
app.post('/probar-resumen-diario', async (req, res) => {
  try {
    await ejecutarResumenDiario();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/probar-resumen-semanal', async (req, res) => {
  try {
    await ejecutarResumenSemanal();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Aviso al arrancar si falta alguna variable critica. Sin esto, una API key vacia no se
// nota hasta que alguien manda un mensaje y Gemini contesta 403 "unregistered callers"
// -- un error que parece de permisos de Google pero en realidad es un .env que no cargo.
function avisarVariablesFaltantes() {
  const criticas = {
    GEMINI_API_KEY: config.gemini.apiKey,
    GOOGLE_SERVICE_ACCOUNT_EMAIL: config.google.serviceAccountEmail,
  };
  const faltantes = Object.entries(criticas)
    .filter(([, valor]) => !valor || String(valor).trim() === '')
    .map(([nombre]) => nombre);

  if (faltantes.length > 0) {
    console.warn('====================================================================');
    console.warn(' ATENCION: estas variables estan VACIAS y el bot fallara al usarlas:');
    faltantes.forEach((n) => console.warn(`   - ${n}`));
    console.warn(' Revisa el .env en la raiz del proyecto o, en Hostinger,');
    console.warn(' hbuilds/config/.env. Sintoma tipico: Gemini responde HTTP 403');
    console.warn(' "Method doesn\'t allow unregistered callers".');
    console.warn('====================================================================');
  } else {
    console.log('Variables criticas cargadas correctamente (.env encontrado).');
  }
}

servidorHttp.listen(config.port, () => {
  console.log(`Agro PYME bot corriendo en http://localhost:${config.port}/bot-web`);
  avisarVariablesFaltantes();
  programarResumenDiario();
  programarResumenSemanal();
});
