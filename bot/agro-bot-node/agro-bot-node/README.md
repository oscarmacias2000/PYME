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

Se abre en `http://localhost:3000/bot-web`.

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
