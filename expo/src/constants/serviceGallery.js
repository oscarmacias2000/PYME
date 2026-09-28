// Galeria "En accion" de cada servicio: escenas de marca de ServiceArt (por
// id de escena) con su descripcion. Sustituye a las fotos de stock.
// stack: logotipos de las tecnologias de cada escena (claves de techIcons.js).
export const SERVICE_GALLERY = {
  chatbot: [
    { scene: 'chatbot', caption: 'Conversación por texto y voz', stack: ['nodedotjs', 'anthropic', 'ollama', 'tailwindcss'] },
    { scene: 'visor-reportes', caption: 'Análisis de tus archivos de Excel', stack: ['excel', 'nodedotjs', 'googlesheets'] },
    { scene: 'automatizacion', caption: 'Conectado a WhatsApp y a tus sistemas', stack: ['whatsapp', 'n8n', 'cloudflare', 'nginx'] },
  ],
  automatizacion: [
    { scene: 'automatizacion', caption: 'Flujos n8n con IA en el centro', stack: ['n8n', 'anthropic', 'nodedotjs'] },
    { scene: 'chatbot', caption: 'Respuestas automáticas a clientes', stack: ['whatsapp', 'googlegemini', 'nodedotjs'] },
    { scene: 'visor-reportes', caption: 'Reportes que se generan solos', stack: ['googlesheets', 'excel', 'n8n'] },
  ],
  apps: [
    { scene: 'apps', caption: 'Web y móvil con el mismo código', stack: ['react', 'expo', 'tailwindcss', 'nodedotjs'] },
    { scene: 'chatbot', caption: 'Asistentes de IA integrados', stack: ['anthropic', 'ollama', 'express'] },
    { scene: 'visor-reportes', caption: 'Paneles de datos para tu equipo', stack: ['react', 'postgresql', 'grafana'] },
  ],
  redes: [
    { scene: 'redes', caption: 'Red protegida y monitoreada', stack: ['cloudflare', 'nginx', 'wireguard', 'linux'] },
    { scene: 'consultoria', caption: 'Auditoría y plan de mejora', stack: ['ubuntu', 'docker', 'grafana'] },
    { scene: 'automatizacion', caption: 'Alertas automáticas ante incidentes', stack: ['n8n', 'whatsapp', 'grafana'] },
  ],
  'visor-reportes': [
    { scene: 'visor-reportes', caption: 'Tablero semanal de campo', stack: ['python', 'excel', 'googlesheets'] },
    { scene: 'chatbot', caption: 'Consulta tus datos por chat', stack: ['whatsapp', 'anthropic', 'nodedotjs'] },
    { scene: 'apps', caption: 'Disponible en web y en Windows', stack: ['react', 'python', 'nginx'] },
  ],
  consultoria: [
    { scene: 'consultoria', caption: 'Ruta de transformación por etapas', stack: ['github', 'docker', 'cloudflare'] },
    { scene: 'automatizacion', caption: 'Automatizaciones priorizadas', stack: ['n8n', 'nodedotjs', 'postgresql'] },
    { scene: 'visor-reportes', caption: 'Métricas para medir el avance', stack: ['grafana', 'googlesheets', 'postgresql'] },
  ],
};
