const express = require('express');
const http = require('http');
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

const app = express();

// Socket.io necesita el servidor HTTP "de verdad" (no solo la app de Express) para
// poder mantener las conexiones abiertas -- por eso de aqui para abajo se usa
// "servidorHttp.listen(...)" en vez de "app.listen(...)".
const servidorHttp = http.createServer(app);
socketService.inicializar(servidorHttp);

// Limite alto porque el audio grabado en el navegador llega como base64 dentro del JSON.
app.use(express.json({ limit: '25mb' }));

app.use(session({
  secret: config.auth.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 12 }, // 12 horas
}));

// /login, /logout, /perfil -- publicas (sin sesion requerida para poder iniciar sesion).
app.use(authRoute);

// El webhook de WhatsApp (Meta) NO lleva cookie de sesion -- tiene que quedar afuera
// del login, si no Meta nunca podria mandarle mensajes al bot.
app.use(whatsappWebhookRoute);

// De aqui para abajo, todo requiere sesion iniciada.
app.use(requerirSesion);

app.use(botWebRoute);
app.use(mensajeRoute);
app.use(guardarRoute);
app.use(historialRoute);
app.use(enviarTabCorreoRoute);
app.use(actividadEnVivoRoute);

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

servidorHttp.listen(config.port, () => {
  console.log(`Agro PYME bot corriendo en http://localhost:${config.port}/bot-web`);
  programarResumenDiario();
  programarResumenSemanal();
});
