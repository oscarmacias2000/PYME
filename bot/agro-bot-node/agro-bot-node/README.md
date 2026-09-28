# Agro PYME - Bot (prototipo en Node.js)

Es el mismo flujo de 7 ramas que ya tienes corriendo en n8n, pero escrito directo en
Node.js/Express en vez de nodos visuales. Sirve como prototipo para decidir si quieres
migrar del todo o seguir con n8n.

## Las 7 ramas

| # | Ruta | Que hace |
|---|------|----------|
| 1 | `GET /bot-web` | Sirve la pagina HTML del bot (formulario de texto/audio). |
| 2 | `POST /bot-web-mensaje` | Manda el mensaje a Gemini, clasifica y regresa el preview (todavia no guarda). |
| 3 | `POST /bot-web-guardar` | Guarda en la hoja de Sheets que corresponda, arma la confirmacion y avisa por correo si hay incidencia. |
| 4 | `GET /bot-web-historial?tabla=...` | Regresa los ultimos 8 registros de una de las dos hojas. |
| 5 | `GET /whatsapp-agro` | Verificacion del webhook que pide Meta al configurarlo. |
| 6 | `POST /whatsapp-agro` | Mensajes reales de WhatsApp: clasifica y guarda automatico (sin preview), y responde por WhatsApp. |
| 7 | Cron interno (`node-cron`) | Todos los dias a las 8:00 PM (America/Mazatlan) arma el resumen del dia, lo manda por correo con Excel adjunto y opcionalmente por WhatsApp. |

La rama 2/6 comparten el mismo clasificador de Gemini (`src/lib/clasificar.js`) y las ramas
3/6 comparten el mismo guardado (`src/lib/guardarRegistro.js`) — es el mismo diseño de "un
solo punto de convergencia" que usamos en n8n, nada mas que aqui es una funcion normal de
JavaScript en vez de tener que hacer trucos con `$('NodeName')`.

## Como correrlo

```bash
npm install
cp .env.example .env
# llena .env con tus datos reales (ver abajo)
npm start
```

`npm start` primero compila el CSS/JS del frontend (`npm run build`, ver seccion de
abajo) y despues arranca el servidor. Se abre en `http://localhost:3000/bot-web`.

## Que necesitas llenar en `.env`

- **GEMINI_API_KEY**: tu key de https://aistudio.google.com/apikey. Si empieza con `AQ.`
  no hay problema, el codigo ya la manda como header `x-goog-api-key` (el mismo workaround
  que usamos en n8n).
- **GOOGLE_SERVICE_ACCOUNT_EMAIL** y **GOOGLE_PRIVATE_KEY**: crea una cuenta de servicio en
  Google Cloud Console con la API de Sheets activada, descarga el JSON y copia esos dos
  valores. Luego **comparte las dos hojas de calculo** (Reporte de Campo y Actividades
  Diarias) con el correo de esa cuenta de servicio, como Editor — si no, el bot no va a
  poder leer ni escribir.
- **GMAIL_USER** / **GMAIL_APP_PASSWORD**: activa verificacion en 2 pasos en la cuenta de
  Gmail y genera una "contraseña de aplicacion" en https://myaccount.google.com/apppasswords.
- **WHATSAPP_TOKEN**: el token permanente de tu app de WhatsApp Business en Meta for
  Developers.
- **WHATSAPP_VERIFY_TOKEN**: el mismo valor (`agroPYME2026secreto` por defecto) que pones
  en el campo "Verify token" al configurar el webhook en Meta.
- **WHATSAPP_RESUMEN_PHONE_NUMBER_ID** / **WHATSAPP_RESUMEN_NUMERO_DESTINO**: solo si
  quieres que el resumen de las 8PM tambien se mande por WhatsApp.

Los IDs y nombres de pestaña de tus dos Google Sheets ya vienen precargados en
`.env.example` (son los mismos que usa tu flujo de n8n); solo cambialos si algun dia
mueves los datos a otra hoja.

## Frontend: Tailwind CSS + Webpack/Babel

Antes cada pagina (`public/index.html`, `login.html`, `actividad.html`) cargaba Tailwind
por CDN (`<script src="https://cdn.tailwindcss.com">`, el "Play CDN") y traia todo su
JavaScript metido inline en un `<script>` gigante. Eso funciona para probar, pero el
propio Tailwind avisa en consola que ese CDN "no deberia usarse en produccion" (no
purga clases sin usar, no permite un tema personalizado de verdad, y es mas pesado).

Ahora hay un build de verdad:

- **`frontend/styles/main.css`** — el CSS fuente (directivas `@tailwind` + un tema
  personalizado en `tailwind.config.js`: sombras propias `shadow-soft`/`shadow-soft-lg`,
  animaciones del logo/skeleton, etc). Se compila a `src/public/css/main.css` (purgado y
  minificado) con **Tailwind CLI**.
- **`frontend/js/pages/*.js`** — el JavaScript de cada pagina, movido tal cual desde los
  `<script>` inline (mismo comportamiento, nada de logica reescrita) a modulos
  separados. Se empaquetan con **Webpack** (un bundle por pagina) pasando por **Babel**
  (`@babel/preset-env`) para asegurar compatibilidad, y quedan en `src/public/js/dist/`.

Ninguno de los archivos generados (`src/public/css/`, `src/public/js/dist/`) se edita a
mano ni se sube a git — se regeneran solos.

Comandos:

```bash
npm run build       # compila CSS + JS una sola vez (produccion, minificado)
npm run watch:css    # recompila el CSS cada vez que cambias frontend/styles/main.css
npm run watch:js     # recompila el JS cada vez que cambias algo en frontend/js/
```

Para desarrollar el frontend con recarga en vivo, corre `npm run watch:css` y
`npm run watch:js` cada uno en su propia terminal, y en una tercera `npm run dev`
(recarga el servidor si tocas algo de `src/`, pero no observa `frontend/` -- por eso
los watchers van aparte). `npm start` y `npm run dev` siempre corren `npm run build`
una vez antes de arrancar (scripts `prestart`/`predev`), asi que nunca vas a servir un
CSS/JS viejo por olvidarte de compilar.

Si quieres tocar el look (colores, sombras, animaciones), edita `tailwind.config.js` y
`frontend/styles/main.css` — ahi viven `.card`, `.card-elevated`, `.pill`, `.sidebar-tab`,
etc., las clases reutilizables que antes vivian repetidas o sueltas en cada `<style>`.

Segunda pasada de diseño (sobre el mismo estilo, un poco mas pulido):

- Tipografia **Inter** (Google Fonts, con el mismo stack de antes como respaldo si el
  link tarda o falla) en las 3 paginas.
- `.card-enter` — entrada suave (fade + slide) para las tarjetas protagonistas
  (login, estado de "Actividad en vivo").
- `.btn-tactile` — un pequeño "hundido" (`active:scale-95`) en los botones principales
  (Entrar, enviar texto/audio, Confirmar y guardar) para que se sientan mas responsivos.
- `.skeleton-line` — placeholder tipo shimmer (reutiliza `.skeleton-bar` del splash) para
  los estados de carga de Documentos e Historial, en vez de un texto plano "Cargando...".
- La pastilla activa (`.pill.activa`, modo Agregar/Leer) ahora tambien escala un poco
  (`scale-[1.02]`) para remarcar la seleccion.

Tercera pasada (modo oscuro + mas botones + Noticias):

- **Modo oscuro** -- boton "🌙/☀️" en el header de las 3 paginas (login lo trae flotando
  arriba a la derecha). Togglea la clase `.dark` en `<html>` y guarda la preferencia en
  `localStorage` (`agro_bot_tema`) para la siguiente visita -- la logica compartida vive
  en `frontend/js/tema.js`, y el `<script>` chiquito al principio de cada `<head>` aplica
  el tema ANTES de pintar la pagina (para no "parpadear"). El recoloreado en si vive al
  final de `frontend/styles/main.css`: en vez de agregar `dark:` a cada clase suelta de
  cada `.html`, se recolorean por selector (`.dark .bg-white`, `.dark .text-stone-600`,
  etc.) los mismos tonos que el HTML ya usa. Si agregas una pantalla nueva con colores
  que no esten ya en esa lista, es ahi donde se agrega el nuevo `.dark .algo { ... }`.
- **Pestaña "Noticias"** en el sidebar (junto a Historial/Acciones/Actividad en vivo) --
  es texto fijo que se edita directo en `src/public/index.html` (busca `panelNoticias`),
  no jala de internet ni tiene backend propio.
- **Mas botones**: "🔄 Actualizar" en Historial (re-consulta la ultima tabla que viste) y
  "🔗 Copiar enlace del bot" en Acciones (copia `/bot-web` al portapapeles, util para
  compartirlo con el equipo).
- Los chips repetidos de Historial y "enviar por correo" ahora usan una sola clase
  `.chip` (antes era una tira larga de utilidades repetida en cada boton) con un hover
  en negro solido, para que se sientan mas "con peso".

## Exponer el servidor a internet (para que Meta le pueda pegar al webhook)

Igual que con n8n, Meta necesita una URL publica con HTTPS. Para pruebas, la forma mas
rapida es `ngrok`:

```bash
npx ngrok http 3000
```

Y en Meta for Developers, en la configuracion del webhook de WhatsApp:
- Callback URL: `https://TU-URL-DE-NGROK/whatsapp-agro`
- Verify token: el mismo que pusiste en `WHATSAPP_VERIFY_TOKEN`

Para produccion real, lo normal es desplegar esto en un servicio como Railway, Render o un
VPS con un dominio propio (ahi la URL ya es fija y no cambia cada vez que reinicias, a
diferencia de ngrok).

## Diferencias a proposito con la version de n8n

- El HTML del bot ahora usa `window.location.origin` en vez del truco de recortar la URL
  del webhook de n8n — es mas simple porque aqui todas las rutas viven en el mismo servidor
  y puerto.
- No hace falta configurar CORS (`allowedOrigins`) porque la pagina y las rutas del API
  viven en el mismo origen — el problema de CORS que tuvimos en n8n era justo por eso, por
  separar el origen de la pagina del origen del webhook.
- Se agrego una ruta extra `POST /probar-resumen-diario` solo para este prototipo, para
  poder probar el correo/WhatsApp del resumen sin tener que esperar a las 8PM.

## Que le falta para no ser "solo" un prototipo

- Manejo de errores mas fino y reintentos si Gemini o WhatsApp fallan.
- Guardar un registro de cada mensaje recibido (logs / base de datos) para poder auditar.
- Autenticacion en la pagina web (ahorita cualquiera con la URL puede mandar reportes).
- Tests automatizados.
