// Catalogo y contenido de la plataforma (estructura estilo IBM).
// Iconos del set Ionicons (incluido en @expo/vector-icons).
import { IMAGES } from './images';

export const SERVICES = [
  {
    id: 'chatbot',
    icon: 'chatbubbles-outline',
    title: 'Chatbot Inteligente para PYMES',
    tagline: 'Asistente con voz, texto y analisis de datos',
    description:
      'Asistente conversacional local con IA que atiende a tus clientes, analiza archivos Excel y automatiza consultas sin depender de servicios externos.',
    image: IMAGES.chatbot,
    intro:
      'Despliega un asistente de IA completamente local que corre en tu infraestructura. Tus clientes o equipo pueden comunicarse por texto o voz, subir hojas de calculo y obtener analisis instantaneos, todo sin enviar datos a terceros.',
    features: [
      { icon: 'mic-outline', title: 'Voz y texto', text: 'Interaccion natural por texto o microfono con respuesta en tiempo real.' },
      { icon: 'document-text-outline', title: 'Analisis de Excel', text: 'Sube archivos de combustible, gastos o ventas y recibe calculos diarios, semanales y totales automaticamente.' },
      { icon: 'server-outline', title: '100% local con Ollama', text: 'El modelo de lenguaje corre en tu propio servidor. Sin costos por token, sin datos en la nube.' },
    ],
    deliverables: [
      'Chatbot desplegado en Docker listo para produccion',
      'Interfaz Open WebUI personalizable',
      'Procesamiento de Excel: combustible, gastos, ventas',
      'Reporte descargable con resumen diario, semanal y por unidad',
      'Modelo de lenguaje local (llama3, mistral u otro)',
      'Capacitacion para tu equipo',
    ],
    bullets: ['Voz y texto', 'Analisis de Excel', 'IA 100% local'],
  },
  {
    id: 'automatizacion',
    icon: 'git-network-outline',
    title: 'Automatizacion Inteligente',
    tagline: 'Flujos autonomos con n8n + IA',
    description:
      'Flujos de trabajo que conectan tus herramientas y ejecutan tareas repetitivas sin intervencion humana.',
    image: IMAGES.automation,
    intro:
      'Conectamos las herramientas que ya usas y disenamos flujos que trabajan por ti las 24 horas. Cuando una tarea necesita criterio, un agente de IA toma la decision siguiendo tus reglas.',
    features: [
      { icon: 'sync-outline', title: 'Integraciones', text: 'Conecta CRM, correo, hojas de calculo, ERP y mas con n8n.' },
      { icon: 'sparkles-outline', title: 'Agentes de IA', text: 'Automatiza decisiones y respuestas con modelos de lenguaje.' },
      { icon: 'time-outline', title: 'Ahorro real', text: 'Recupera horas cada semana eliminando el trabajo manual.' },
    ],
    deliverables: [
      'Diagnostico de procesos automatizables',
      'Flujos configurados y documentados',
      'Monitoreo y alertas',
      'Capacitacion a tu equipo',
    ],
    bullets: ['Integraciones con n8n', 'Agentes con IA', 'Ahorro de horas/mes'],
  },
  {
    id: 'apps',
    icon: 'phone-portrait-outline',
    title: 'Desarrollo Web / Apps con IA',
    tagline: 'React Native + Claude API',
    description:
      'Aplicaciones moviles y web inteligentes, listas para escalar y desplegar en la nube.',
    image: IMAGES.apps,
    intro:
      'Construimos productos digitales a medida: apps moviles, plataformas web y paneles internos, con IA integrada y listos para desplegar en la nube.',
    features: [
      { icon: 'logo-react', title: 'Multiplataforma', text: 'Una base de codigo para iOS, Android y web con Expo.' },
      { icon: 'server-outline', title: 'Backend a medida', text: 'APIs, bases de datos y autenticacion seguras.' },
      { icon: 'cloud-upload-outline', title: 'Despliegue', text: 'Publicacion continua en Vercel y tiendas de apps.' },
    ],
    deliverables: [
      'Diseno de interfaz y prototipo',
      'App multiplataforma (iOS / Android / web)',
      'Backend e integraciones',
      'Despliegue y mantenimiento',
    ],
    bullets: ['Expo / React Native', 'Backend a medida', 'Despliegue en Vercel'],
  },
  {
    id: 'redes',
    icon: 'shield-checkmark-outline',
    title: 'Seguridad y Redes',
    tagline: 'Auditoria y proteccion',
    description:
      'Servicios de red y evaluacion de seguridad para mantener tu infraestructura protegida.',
    image: IMAGES.security,
    intro:
      'Evaluamos y fortalecemos tu infraestructura: identificamos vulnerabilidades, aplicamos buenas practicas y monitoreamos tus sistemas para reducir riesgos.',
    features: [
      { icon: 'search-outline', title: 'Auditoria', text: 'Analisis de vulnerabilidades y superficie de ataque.' },
      { icon: 'lock-closed-outline', title: 'Proteccion', text: 'Endurecimiento de servidores, DNS y TCP.' },
      { icon: 'pulse-outline', title: 'Monitoreo', text: 'Deteccion temprana de incidentes y respuesta.' },
    ],
    deliverables: [
      'Informe de auditoria de seguridad',
      'Plan de remediacion priorizado',
      'Configuracion de red segura',
      'Monitoreo continuo',
    ],
    bullets: ['Auditoria de seguridad', 'DNS y TCP', 'Buenas practicas'],
  },
  {
    id: 'consultoria',
    icon: 'bulb-outline',
    title: 'Consultoria y Estrategia',
    tagline: 'Implementacion y entrenamiento',
    description:
      'Diagnostico, implementacion y capacitacion para tu adopcion tecnologica.',
    image: IMAGES.aboutMeeting,
    intro:
      'Te acompanamos en la adopcion tecnologica de principio a fin: entendemos tu negocio, definimos un roadmap realista y capacitamos a tu equipo para sostener el cambio.',
    features: [
      { icon: 'clipboard-outline', title: 'Diagnostico', text: 'Analisis de tu operacion y oportunidades.' },
      { icon: 'map-outline', title: 'Roadmap', text: 'Plan tecnologico por etapas con prioridades claras.' },
      { icon: 'people-outline', title: 'Entrenamiento', text: 'Capacitacion practica para tu equipo.' },
    ],
    deliverables: [
      'Diagnostico y oportunidades',
      'Roadmap tecnologico',
      'Acompanamiento en la implementacion',
      'Capacitacion del equipo',
    ],
    bullets: ['Diagnostico inicial', 'Roadmap tecnologico', 'Entrenamiento'],
  },
];

// Busca un servicio por id (para la pagina de detalle).
export const getService = (id) => SERVICES.find((s) => s.id === id);

// Seccion "Recomendado para usted" (tarjetas con etiqueta de tipo).
export const RECOMMENDED = [
  {
    id: 'r1',
    tag: 'Prueba gratuita',
    title: 'Experimenta el poder de la automatizacion con IA durante 30 dias',
  },
  {
    id: 'r2',
    tag: 'Webinar',
    title: 'Como elegir la nube adecuada sin sacrificar control ni rendimiento',
  },
  {
    id: 'r3',
    tag: 'Informe',
    title: 'Transformacion digital para PYMES: metricas que importan en 2026',
  },
];

// Lista de "productos".
export const PRODUCTS = [
  'BuildWise Flows',
  'BuildWise Assistant',
  'BuildWise Chat',
  'BuildWise Analytics',
  'BuildWise Secure',
  'BuildWise Connect',
  'BuildWise Consulting',
];

// Casos de exito con metrica destacada.
export const CASES = [
  {
    id: 'c1',
    metric: '~90%',
    text: 'de entrega mas rapida automatizando procesos manuales.',
  },
  {
    id: 'c2',
    metric: '10x',
    text: 'mas rapido en el despliegue de nuevas aplicaciones.',
  },
  {
    id: 'c3',
    metric: '+40',
    text: 'proyectos entregados para PYMES en Latinoamerica.',
  },
];
