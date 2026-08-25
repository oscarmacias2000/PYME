// Contenido publico (servicios y docs) que la app puede consumir por API.
// Espejo del contenido del frontend; centralizado aqui para poder editarlo
// sin recompilar la app.

export const SERVICES = [
  {
    id: 'automatizacion',
    title: 'Automatizacion Inteligente',
    tagline: 'Flujos autonomos con n8n + IA',
    description:
      'Flujos de trabajo que conectan tus herramientas y ejecutan tareas repetitivas sin intervencion humana.',
  },
  {
    id: 'apps',
    title: 'Desarrollo Web / Apps con IA',
    tagline: 'React Native + Claude API',
    description:
      'Aplicaciones moviles y web inteligentes, listas para escalar y desplegar en la nube.',
  },
  {
    id: 'redes',
    title: 'Seguridad y Redes',
    tagline: 'Auditoria y proteccion',
    description:
      'Servicios de red y evaluacion de seguridad para mantener tu infraestructura protegida.',
  },
  {
    id: 'consultoria',
    title: 'Consultoria y Estrategia',
    tagline: 'Implementacion y entrenamiento',
    description:
      'Diagnostico, implementacion y capacitacion para tu adopcion tecnologica.',
  },
];

export const DOCS = [
  { id: 'intro', title: 'Introduccion', description: 'Que es BuildWise Labs y como puede ayudar a tu negocio.' },
  { id: 'inicio', title: 'Primeros pasos', description: 'Crea tu cuenta y conecta tus primeras herramientas.' },
  { id: 'automatizacion', title: 'Automatizaciones', description: 'Disena flujos que trabajan por ti con n8n e IA.' },
  { id: 'api', title: 'API y integraciones', description: 'Conecta BuildWise Labs con tus sistemas via API REST.' },
  { id: 'faq', title: 'Preguntas frecuentes', description: 'Dudas comunes sobre seguridad, precios y soporte.' },
];
