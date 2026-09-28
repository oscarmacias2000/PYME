const path = require('path');

// dotenv sin "path" busca el .env en el CWD (la carpeta desde donde se lanzo node), NO
// donde vive este archivo. Si se arranca desde otra carpeta, no lo encuentra y TODAS las
// variables quedan vacias -- que es justo lo que produce el 403 de Gemini
// ("Method doesn't allow unregistered callers"): la API key viaja en blanco.
// Apuntandolo a la raiz del proyecto funciona sin importar desde donde se arranque.
//
// Importante: dotenv NO pisa variables que ya existen en el entorno. En Hostinger las
// variables vienen de hbuilds/config/.env inyectadas al proceso, asi que esas siguen
// mandando y esta linea no les afecta (si no hay archivo, simplemente no hace nada).
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function req(name, fallback = '') {
  return process.env[name] !== undefined ? process.env[name] : fallback;
}

module.exports = {
  port: Number(req('PORT', 3000)),
  timezone: req('TIMEZONE', 'America/Mazatlan'),
  resumenCron: req('RESUMEN_CRON', '0 20 * * *'),
  // Domingo a las 8:00 PM por defecto (mismo dia/hora que el resumen diario, pero una vez a la semana).
  resumenSemanalCron: req('RESUMEN_SEMANAL_CRON', '0 20 * * 0'),

  gemini: {
    apiKey: req('GEMINI_API_KEY'),
    model: req('GEMINI_MODEL', 'gemini-3.6-flash'),
  },

  // Alternativa a Gemini solo para clasificar/extraer TEXTO (ver services/claude.js).
  // Claude no acepta audio nativo -- el audio de WhatsApp siempre usa Gemini sin
  // importar este valor, solo cambia el "cerebro" para los mensajes de texto.
  claude: {
    apiKey: req('ANTHROPIC_API_KEY'),
    model: req('ANTHROPIC_MODEL', 'claude-haiku-4-5-20251001'),
  },
  // "gemini" (por defecto) o "claude".
  textAiProvider: req('TEXT_AI_PROVIDER', 'gemini'),

  google: {
    serviceAccountEmail: req('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
    // Los .env casi siempre traen los saltos de linea como "\n" literales; hay que convertirlos.
    privateKey: req('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    sheets: {
      reporteCampo: {
        id: req('SHEET_REPORTE_CAMPO_ID'),
        tab: req('SHEET_REPORTE_CAMPO_TAB', 'Rendimiento Diario Jornal'),
      },
      actividadesDiarias: {
        id: req('SHEET_ACTIVIDADES_ID'),
        tab: req('SHEET_ACTIVIDADES_TAB', 'Actividades Diarias'),
        // Arriba de esta fila hay filas viejas que el usuario prefiere NO tocar/borrar
        // (instrucciones de la plantilla + basura vieja de pruebas con n8n). Los
        // registros nuevos siempre se escriben en esta fila para abajo, sin importar
        // que tan abajo detecte datos existentes.
        filaInicial: Number(req('SHEET_ACTIVIDADES_FILA_INICIAL', '18')) || 1,
      },
      // Maquinaria e Insumos viven como pestañas nuevas dentro del MISMO archivo de
      // Reporte de Campo (igual que en tu plantilla "Reporte campo 3.0.xlsx").
      maquinaria: {
        id: req('SHEET_REPORTE_CAMPO_ID'),
        tab: req('SHEET_MAQUINARIA_TAB', 'Maquinaria'),
      },
      insumos: {
        id: req('SHEET_REPORTE_CAMPO_ID'),
        tab: req('SHEET_INSUMOS_TAB', 'Insumos'),
      },
      // El resumen semanal tambien se escribe en su propia pestaña dentro del mismo
      // archivo, ademas de mandarse por correo (igual que en la plantilla original).
      resumenSemanal: {
        id: req('SHEET_REPORTE_CAMPO_ID'),
        tab: req('SHEET_RESUMEN_SEMANAL_TAB', 'Resumen Semanal'),
      },
      // Catalogos = listas de valores (huertas, actividades, responsables, etc.) que
      // vienen en la plantilla original. Es de solo lectura -- no se le "agregan
      // reportes" por chat, solo se puede preguntar/consultar que hay ahi.
      catalogos: {
        id: req('SHEET_REPORTE_CAMPO_ID'),
        tab: req('SHEET_CATALOGOS_TAB', 'Catálogos'),
      },
    },
  },

  gmail: {
    user: req('GMAIL_USER'),
    appPassword: req('GMAIL_APP_PASSWORD'),
    correoDestino: req('CORREO_DESTINO'),
  },

  whatsapp: {
    token: req('WHATSAPP_TOKEN'),
    verifyToken: req('WHATSAPP_VERIFY_TOKEN', 'agroPYME2026secreto'),
    graphVersion: req('WHATSAPP_GRAPH_VERSION', 'v20.0'),
    resumenPhoneNumberId: req('WHATSAPP_RESUMEN_PHONE_NUMBER_ID'),
    resumenNumeroDestino: req('WHATSAPP_RESUMEN_NUMERO_DESTINO'),
  },

  // Login simple (usuario+contraseña fijos) para que no cualquiera que entre a la
  // direccion del bot pueda ver o capturar datos. No es un sistema de usuarios
  // completo -- IMPORTANTE: cambia estos valores en tu .env, no los dejes por defecto.
  auth: {
    usuario: req('APP_LOGIN_USER', 'admin'),
    password: req('APP_LOGIN_PASSWORD', 'cambiame123'),
    sessionSecret: req('SESSION_SECRET', 'agro-bot-cambia-este-secreto'),
  },
};
