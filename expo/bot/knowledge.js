// Conocimiento del mini bot de BuildWise Labs: palabras clave, sinonimos y
// textos fijos. Edita este archivo para ensenarle al bot nuevas preguntas.
// Las palabras clave se comparan contra el mensaje en minusculas y sin
// acentos (p. ej. "automatizacion", no "automatización").
//
// El contenido "largo" (servicios, proceso, preguntas frecuentes y
// documentacion) se toma directo del sitio: src/constants/services.js,
// src/constants/home.js y src/constants/ownDocs.js.

// Respuestas rapidas que se ofrecen como botones.
export const QUICK = ['Servicios', '¿Cuánto cuesta?', 'Cómo trabajan', 'Hablar con alguien'];

// Mensaje de bienvenida al abrir el chat.
export const WELCOME = {
  text: '¡Hola! Soy el asistente de BuildWise Labs 👋\nPregúntame por nuestros servicios, precios, tiempos o cómo trabajamos.',
  chips: QUICK,
};

// Palabras que no aportan significado al comparar preguntas.
export const STOP_WORDS =
  'a al algo como con cual cuales de del el en es esta este esto hay la las lo los me mi mis no o para pero por que se si sin su sus te tu tus un una uno unos y ya yo';

// Intenciones generales: palabras clave y respuesta.
export const INTENTS = {
  greeting: {
    keys: [' hola', ' buenas', ' hey', ' buen dia', ' que tal'],
    text: '¡Hola! Soy el asistente de BuildWise Labs. Te ayudo con nuestros servicios de IA y automatización para PyMEs. ¿Qué te gustaría saber?',
  },
  contact: {
    keys: ['humano', 'persona', 'hablar con', 'asesor', 'contact', 'llamar', 'cotizar', 'agendar'],
    text: 'Con gusto te ponemos en contacto con el equipo. Déjanos tu mensaje en el formulario y te respondemos pronto.',
  },
  services: {
    keys: ['servicio', 'ofrecen', 'hacen', 'que venden', 'soluciones'],
    text: 'Esto es lo que hacemos:',
  },
  process: {
    keys: ['proceso', 'pasos', 'como trabaj', 'metodologia', 'etapas', 'empezar', 'comenzar'],
    text: 'Trabajamos en cuatro pasos:',
    outro: 'Todo empieza con un diagnóstico de tu operación.',
  },
  docs: {
    keys: ['doc', 'guia', 'prompt', 'tutorial', 'manual'],
    found: 'Encontré esta documentación del equipo:',
    all: 'Tenemos guías y prompts del equipo. Algunas de ellas:',
  },
  thanks: {
    keys: [' gracias', ' genial', ' perfecto', ' excelente'],
    text: '¡Con gusto! Si necesitas algo más, aquí estoy.',
  },
  fallback: {
    text: 'No estoy seguro de entenderte. Puedo contarte de nuestros servicios, precios, tiempos o cómo trabajamos. Si prefieres, te ponemos en contacto con el equipo.',
  },
};

// Palabras clave de cada servicio (por id de SERVICES).
export const SERVICE_KEYS = {
  chatbot: ['chatbot', 'bot', 'whatsapp', 'asistente', 'voz'],
  automatizacion: ['automatiz', 'n8n', 'flujo', 'tarea repetitiva', 'integracion', 'integrar'],
  // ' app' con espacio: evita que "whatsapp" cuente como app.
  apps: [' app', 'aplicacion', 'pagina', ' web', 'sitio', 'desarrollo', 'software', 'movil'],
  redes: ['seguridad', 'red ', 'redes', 'firewall', 'ciber', 'cisco', 'wifi', 'auditoria'],
  'visor-reportes': ['reporte', 'excel', 'campo', 'dashboard', 'visor', 'tablero'],
  consultoria: ['consultor', 'estrategia', 'asesor', 'capacitacion', 'transformacion'],
};

// Sinonimos por pregunta frecuente (mismo orden que FAQS en home.js).
export const FAQ_SYNONYMS = [
  ['precio', 'costo', 'cuesta', 'cobran', 'cotizacion', 'presupuesto', 'tarifa'],
  ['tiempo', 'tarda', 'demora', 'semanas', 'cuanto tiempo', 'rapido'],
  ['mexico', 'pais', 'extranjero', 'fuera', 'internacional', 'remoto'],
  ['seguro', 'datos', 'privacidad', 'confidencial', 'nda'],
  ['entrega', 'despues', 'soporte', 'mantenimiento', 'garantia'],
  ['tecnico', 'conocimientos', 'programar', 'experiencia', 'dificil'],
];

// Botones de accion reutilizables (rutas del RootNavigator).
export const ACTIONS = {
  contact: { label: 'Ir a Contacto', route: 'Contacto', params: { prefill: true } },
  contactHome: {label: 'Ir a home', route: 'Home'},
  support: { label: 'Solicitar soporte', route: 'Soporte' },
  feedback: { label: 'Dar feedback', route: 'Feedback' },
  // `open: 'full'` abre el panel grande con el chatbot IA completo (no navega).
  fullBot: { label: 'Abrir chatbot completo', open: 'full' },
  allDocs: { label: 'Ver toda la documentación', route: 'Docs' },
};
