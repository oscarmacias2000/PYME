// Secciones de documentacion. Alimentan la pagina Docs y el menu
// desplegable "Docs" del header.
//
// Cada seccion admite `sections`: bloques con `heading`, `text`, `list`
// (vinetas) y `code` (ejemplo en bloque monoespaciado). `faq: true` muestra
// las preguntas de constants/home.js y `process: true` los pasos de trabajo.
export const DOCS = [
  {
    id: 'intro',
    icon: 'book-outline',
    title: 'Introducción',
    description: 'Qué es BuildWise Labs y cómo puede ayudar a tu negocio.',
    body: 'BuildWise Labs es un laboratorio tecnológico mexicano que diseña software a medida y automatizaciones con IA para PyMEs. Esta documentación explica qué ofrecemos, cómo trabajamos y cómo conectar tus sistemas con nuestra plataforma.',
    sections: [
      {
        heading: 'Qué puedes hacer',
        list: [
          'Atender clientes 24/7 con un chatbot por web o WhatsApp.',
          'Automatizar tareas repetitivas conectando tus apps con n8n e IA.',
          'Crear sitios y apps web con funciones de IA integradas.',
          'Asegurar tu red e infraestructura.',
          'Consultar reportes de campo desde un visor centralizado.',
          'Definir una estrategia de transformación digital con consultoría.',
        ],
      },
      {
        heading: 'Para quién es',
        text: 'Para empresas pequeñas y medianas que quieren ahorrar horas de trabajo manual y tomar decisiones con datos, sin necesidad de un equipo técnico propio.',
      },
    ],
  },
  {
    id: 'servicios',
    icon: 'grid-outline',
    title: 'Servicios',
    description: 'Las seis capacidades de la plataforma.',
    body: 'Cada servicio tiene su propia página con ejemplos y detalles técnicos en la sección Servicios.',
    sections: [
      {
        heading: 'Chatbot inteligente',
        text: 'Asistente con voz y texto que también analiza archivos de Excel (ventas, gastos, combustible). Funciona con distintos proveedores de modelos: Claude (Anthropic), Groq, Gemini o Ollama en tu propio servidor.',
      },
      {
        heading: 'Automatización inteligente',
        text: 'Flujos autónomos con n8n que conectan CRM, correo, hojas de cálculo y ERP, con agentes de IA para los pasos que requieren criterio (por ejemplo, clasificar correos).',
      },
      {
        heading: 'Desarrollo web y apps con IA',
        text: 'Sitios y aplicaciones como esta, construidos con React, Expo y Node.js.',
      },
      {
        heading: 'Seguridad y redes',
        text: 'Diseño y protección de la infraestructura de red de tu negocio.',
      },
      {
        heading: 'Visor de reportes de campo',
        text: 'Captura y consulta de reportes de campo en un solo lugar.',
      },
      {
        heading: 'Consultoría y estrategia',
        text: 'Acompañamiento para decidir qué digitalizar primero y medir el impacto.',
      },
    ],
  },
  {
    id: 'proceso',
    icon: 'trail-sign-outline',
    title: 'Cómo trabajamos',
    description: 'De la idea al resultado en cuatro pasos.',
    body: 'Cada proyecto sigue el mismo proceso, con entregables claros en cada etapa.',
    process: true,
  },
  {
    id: 'inicio',
    icon: 'rocket-outline',
    title: 'Primeros pasos',
    description: 'Crea tu cuenta y conecta tus primeras herramientas.',
    body: 'Regístrate, inicia sesión y cuéntanos qué quieres automatizar.',
    sections: [
      {
        heading: '1. Crea tu cuenta',
        text: 'Entra a "Iniciar sesión" y elige registrarte con tu nombre, correo y contraseña. Desde tu perfil puedes cambiar tu nombre, foto y color de avatar.',
      },
      {
        heading: '2. Explora los servicios',
        text: 'Revisa la sección Servicios para ver ejemplos de cada solución y elegir la que se ajusta a tu caso.',
      },
      {
        heading: '3. Cuéntanos tu reto',
        text: 'Escríbenos desde la página Contacto. Con esa información agendamos el diagnóstico, el primer paso del proceso.',
      },
    ],
  },
  {
    id: 'automatizacion',
    icon: 'git-network-outline',
    title: 'Automatizaciones',
    description: 'Diseña flujos que trabajan por ti con n8n e IA.',
    body: 'Crea flujos que conectan tus apps y ejecutan tareas repetitivas de forma autónoma, con agentes de IA cuando se necesita criterio.',
    sections: [
      {
        heading: 'Cómo funciona un flujo',
        list: [
          'Disparador: un evento inicia el flujo (llega un correo, se llena un formulario, una hora programada).',
          'Procesamiento: n8n transforma los datos y, si hace falta, un modelo de IA clasifica, resume o decide.',
          'Acción: el resultado se guarda o se envía (CRM, hoja de cálculo, WhatsApp, correo).',
        ],
      },
      {
        heading: 'Elegir el modelo de IA',
        text: 'Los bots pueden cambiar de proveedor con una variable de entorno, sin tocar la lógica:',
        code: '# .env\nLLM_PROVIDER=claude   # o groq, gemini, ollama',
      },
    ],
  },
  {
    id: 'api',
    icon: 'code-slash-outline',
    title: 'API y integraciones',
    description: 'Conecta BuildWise Labs con tus sistemas vía API REST.',
    body: 'La API responde en JSON. Las rutas protegidas requieren el token que devuelven el registro y el inicio de sesión, enviado en el encabezado Authorization.',
    sections: [
      {
        heading: 'Autenticación',
        text: 'Registra un usuario o inicia sesión para obtener un token:',
        code: 'POST /api/auth/register  { "name", "email", "password" }\nPOST /api/auth/login     { "email", "password" }\n\n→ { "token": "...", "user": { ... } }',
      },
      {
        heading: 'Usar el token',
        code: 'GET /api/auth/me\nAuthorization: Bearer <token>',
      },
      {
        heading: 'Rutas disponibles',
        list: [
          'GET /api/services — lista de servicios.',
          'GET /api/services/:id — detalle de un servicio.',
          'GET /api/docs — secciones de documentación.',
          'POST /api/contact — envía un mensaje { nombre, email, mensaje }.',
          'PATCH /api/auth/me — actualiza nombre, foto o color de avatar (protegida).',
          'GET /health — estado del servidor.',
        ],
      },
      {
        heading: 'Errores',
        text: 'Si algo falla, la respuesta trae un código HTTP (400, 401, 409…) y un cuerpo { "error": "mensaje" } que puedes mostrar tal cual al usuario.',
      },
    ],
  },
  {
    id: 'faq',
    icon: 'help-circle-outline',
    title: 'Preguntas frecuentes',
    description: 'Dudas comunes sobre seguridad, precios y soporte.',
    body: 'Las dudas más frecuentes sobre costos, tiempos, seguridad y soporte.',
    faq: true,
  },
];
