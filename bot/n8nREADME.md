# Agro PYME - Bot Web (texto/audio) -> Google Sheets + Reporte diario por Gmail

Flujo de n8n para una PYME agricola: captura reportes de campo hablando o escribiendo en una
pagina web sencilla (sin depender de WhatsApp/Meta), los guarda automaticamente en Google Sheets,
y cada dia envia un resumen por Gmail con un Excel adjunto.

> Nota de version: la version original de este flujo usaba WhatsApp Business Cloud API (Meta).
> Meta bloqueo la cuenta del negocio para generar tokens (restriccion de "dispositivo no habitual"
> que persistio incluso en el celular), asi que el flujo se movio a un canal 100% propio: una
> pagina web servida por el mismo n8n, con boton de grabar audio. Ya no depende de Meta para nada.

## Contenido de esta carpeta

| Archivo | Que es |
|---|---|
| `agro_whatsapp_workflow.json` | El flujo de n8n (version Bot Web), listo para importar. |
| `docker-compose.yml` | Levanta n8n en tu PC con Docker. |
| `Reporte campo 3.0 (1).xlsx` | Origen de las columnas/catalogos de la tabla "Reporte de Campo" (Agente 1). |
| `Actividades Agricolas Diarias.xlsx` | Origen de las columnas/catalogos de la tabla "Actividades Diarias" (Agente 2). |
| `README.md` | Este archivo. |

## Como funciona el flujo

1. **Pagina del bot (GET)**: abres la URL del webhook en el navegador (celular o PC) y ves una
   pagina con un cuadro de texto y un boton para grabar audio.
2. **Mensaje entrante (texto o audio)**: escribes una nota o grabas un audio describiendo la
   actividad. El audio se graba y se manda como base64 directo desde el navegador, sin pasar por
   WhatsApp.
3. **Clasificacion e interpretacion con IA**: un mismo prompt le pide a Gemini 2.0 Flash decidir a
   cual de las 2 tablas pertenece el mensaje (y transcribir el audio si aplica) y extraer los
   campos, usando los valores reales de tus catalogos (huertas, actividades, responsables, campos,
   lotes, etc.) para que reconozca lo que la gente dice de forma natural.
4. **Guardado en Google Sheets**:
   - **Agente 1 - Reporte de Campo** -> hoja "Rendimiento Diario Jornal" (rendimiento vs. meta, incidencias).
   - **Agente 2 - Actividades Diarias** -> hoja "Actividades Diarias" (jornaleros, cuadrillas, nomina).
5. **Confirmacion en la pagina**: la misma pagina muestra un mensaje confirmando que se guardo (y que).
6. **Reporte diario**: todos los dias a las 8:00 PM (hora Mazatlan) se lee lo capturado ese dia en
   "Actividades Diarias", se arma un resumen y se manda por **Gmail** con un **Excel adjunto**.

## Tablas y columnas

### Reporte de Campo -> hoja "Rendimiento Diario Jornal"
Fecha, Actividad, Ubicacion, Huerta, Responsable, N° de Personas, Cantidad Realizada, Unidad de Medida,
Meta de Rendimiento (jornal), Incidencia, Motivo de Incidencia, Observaciones.
*(Margen y % Cumplimiento se dejan como formulas de la propia hoja, no las escribe n8n.)*

### Actividades Diarias -> hoja "Actividades Diarias"
Fecha, Campo, Lote, Actividad, Responsable, N° Jornaleros, Procedencia / Cuadrilla,
Recursos / Maquinaria, Costo por Jornal, Nomina Total, Observaciones.

## Requisitos previos

- **Docker Desktop** instalado y corriendo en tu PC.
- Una **API key de Gemini** (gratis en https://aistudio.google.com/app/apikey).
- Una cuenta de **Google** con acceso a Google Sheets y Gmail (para las credenciales OAuth de n8n).
- Los 2 Google Sheets ya existen:
  - Reporte de Campo: ID `1rledplnYjPDTT_OgLTyNaXvSQS7Cn43v`
  - Actividades Diarias: ID `1pfSx99JEkGRDC9sRLdu6CkYjeS-SczwjlVrpc9bqATA`

## Paso a paso

### 1. Levantar n8n con Docker
En PowerShell, dentro de esta carpeta:
```
cd E:\PYME\bot
docker compose up -d
```
Abre `http://localhost:5678` en tu navegador. La primera vez te pedira crear un usuario admin de n8n
(solo para ti, no tiene que ver con el bot).

> Si usas Docker Desktop con backend Hyper-V (no WSL2), puede que necesites habilitar compartir la
> unidad `E:` en Settings -> Resources -> File Sharing.

### 2. Importar el flujo
En n8n: **Workflows -> Import from File** -> selecciona `agro_whatsapp_workflow.json`.

> Si ya tenias importada la version anterior (con WhatsApp), puedes reimportar este archivo sobre el
> mismo workflow: las credenciales que ya conectaste (Gemini, Google Sheets, Gmail) se vuelven a
> asignar solas porque los nodos conservan el mismo nombre e ID de credencial.

### 3. Revisar las credenciales en n8n
Solo se necesitan 3 credenciales (ya no hay nada de Meta/WhatsApp):

- **Gemini API Key (Query Auth)**: nombre del parametro `key`, valor = tu API key de Gemini. Se usa
  en los nodos "Gemini (audio): clasificar y extraer" y "Gemini (texto): clasificar y extraer".
- **Google Sheets account** (OAuth2): se usa en "Guardar en Reporte de Campo", "Guardar en
  Actividades Diarias" y "Leer Actividades Diarias".
- **Gmail account** (OAuth2): se usa en "Enviar resumen por correo".

### 4. Activar el flujo y abrir la pagina del bot
- Activa el flujo (interruptor arriba a la derecha en n8n).
- Abre el nodo **"Webhook - Pagina del bot (GET)"** y copia su **Production URL** (termina en
  `/webhook/bot-web`). Esa es la direccion de la pagina del bot.
- Abrela en el navegador (celular o PC, en la misma red o publicada si usas un tunel como ngrok/
  Cloudflare Tunnel) y prueba escribiendo o grabando un audio.
- Revisa que aparezca el mensaje de confirmacion en la pagina y que se agregue la fila en el Google
  Sheet correspondiente.

### 5. Probar el reporte diario
- Espera al reporte diario (8:00 PM hora Mazatlan), o ejecuta manualmente el nodo "Cada dia 8:00 PM
  (Mazatlan)" para probarlo antes.
- Revisa que llegue el correo con el resumen y el Excel adjunto.

## Notas y limitaciones conocidas

- El servidor MCP de n8n de esta sesion no pudo conectarse (error 502), por eso el flujo se entrega
  como archivo para importar manualmente en vez de crearse directamente en tu instancia.
- Docker no se puede "levantar" de forma remota en tu PC desde esta sesion de Claude - los archivos
  quedan listos aqui, pero el comando `docker compose up -d` lo debes ejecutar tu en tu propia maquina.
- La grabacion de audio en el navegador (`MediaRecorder`) requiere un "contexto seguro": funciona
  sin problema en `localhost`, pero si accedes desde el celular por IP (`http://192.168.x.x:5678/...`)
  la mayoria de navegadores bloquean el microfono salvo que sea HTTPS. Para probar desde el celular
  en la misma red, usa un tunel (ngrok, Cloudflare Tunnel) que te de una URL HTTPS.
- Si Google Sheets muestra una advertencia de "columnas no reconocidas" al abrir el nodo, da clic en
  "Refresh List" - los valores que ya estan mapeados no deberian borrarse.
- Si mas adelante Meta desbloquea la cuenta y quieres agregar WhatsApp de vuelta como canal
  adicional, se puede volver a conectar reutilizando los mismos nodos de Gemini/Sheets/Gmail; solo
  habria que anadir de nuevo el webhook de verificacion y los nodos de envio a la Graph API.
