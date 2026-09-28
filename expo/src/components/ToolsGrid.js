import { View, Text, Pressable, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useColorScheme } from 'nativewind';
import { useNavigation } from '@react-navigation/native';

import { OWN_DOCS } from '../constants/ownDocs';

const _TOOLS = [
  {
    name: 'Git',
    category: 'Control de versiones',
    description: 'Sistema de control de versiones distribuido: guarda el historial de cada cambio del código.',
    use: 'Versionamos todo el código de la web, los bots y las automatizaciones.',
    docs: [{ label: 'Documentación de Git', url: 'https://git-scm.com/doc' }, { label: 'Libro Pro Git', url: 'https://git-scm.com/book/es/v2' }],
    topics: ['Commits y ramas', 'Merge y rebase', 'Etiquetas y versiones', 'Flujo de trabajo en equipo'],
    color: '#F05032',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 92 92"><path fill="#F05032" d="M90.156 41.965L50.036 1.85a5.918 5.918 0 0 0-8.372 0l-8.328 8.331 10.566 10.567a7.03 7.03 0 0 1 7.259 1.73 7.04 7.04 0 0 1 1.72 7.299l10.184 10.184a7.028 7.028 0 0 1 7.297 1.72 7.05 7.05 0 0 1 0 9.957 7.05 7.05 0 0 1-9.953 0 7.066 7.066 0 0 1-1.536-7.66l-9.5-9.499v24.997a7.05 7.05 0 0 1 1.86 11.29 7.05 7.05 0 0 1-9.953 0 7.05 7.05 0 0 1 0-9.957 7.055 7.055 0 0 1 2.304-1.539V33.926a7.035 7.035 0 0 1-3.82-9.234L29.244 14.163 1.734 41.67a5.918 5.918 0 0 0 0 8.373L41.855 90.16a5.92 5.92 0 0 0 8.37 0l39.93-39.924a5.925 5.925 0 0 0 0-8.271"/></svg>`,
  },
  {
    name: 'GitHub',
    category: 'Repositorios',
    description: 'Plataforma para alojar repositorios Git, revisar código y automatizar despliegues.',
    use: 'Alojamos los repositorios y revisamos cada cambio con pull requests.',
    docs: [{ label: 'GitHub Docs', url: 'https://docs.github.com/es' }, { label: 'GitHub Actions', url: 'https://docs.github.com/es/actions' }],
    topics: ['Repositorios y pull requests', 'GitHub Actions (CI/CD)', 'Issues y proyectos', 'Revisión de código'],
    color: '#ffffff',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#ffffff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
  },
  {
    name: 'Node.js',
    own: ['nodejs'],
    category: 'Runtime',
    description: 'Entorno de ejecución de JavaScript en el servidor.',
    use: 'Corre nuestro backend con Express y los bots de WhatsApp con IA.',
    docs: [{ label: 'Documentación de Node.js', url: 'https://nodejs.org/docs/latest/api/' }, { label: 'Guías de Node.js', url: 'https://nodejs.org/en/learn' }],
    topics: ['APIs REST con Express', 'Bots de WhatsApp', 'Integración con modelos de IA', 'Tareas programadas (cron)'],
    color: '#5FA04E',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#5FA04E" d="M16 30a2.151 2.151 0 0 1-1.076-.288L11.5 27.685c-.511-.286-.262-.387-.093-.446a6.8 6.8 0 0 0 1.538-.7.263.263 0 0 1 .254.019l2.637 1.563a.34.34 0 0 0 .318 0l10.26-5.922a.323.323 0 0 0 .159-.278V10.075a.331.331 0 0 0-.162-.281L16.158 3.875a.323.323 0 0 0-.317 0L5.581 9.794a.33.33 0 0 0-.162.281v11.843a.315.315 0 0 0 .161.274l2.814 1.624c1.526.763 2.459-.136 2.459-1.038V11.085a.3.3 0 0 1 .3-.3h1.3a.3.3 0 0 1 .3.3v11.693c0 2.031-1.107 3.195-3.031 3.195a4.392 4.392 0 0 1-2.363-.642L4.733 23.82a2.166 2.166 0 0 1-1.076-1.875V10.075a2.166 2.166 0 0 1 1.076-1.872l10.26-5.924a2.246 2.246 0 0 1 2.154 0L27.407 8.2a2.166 2.166 0 0 1 1.076 1.872v11.869a2.176 2.176 0 0 1-1.076 1.875l-10.26 5.922A2.152 2.152 0 0 1 16 30zm3.093-8.01c-4.493 0-5.427-2.062-5.427-3.792a.3.3 0 0 1 .3-.3h1.327a.3.3 0 0 1 .3.256c.2 1.377.8 2.073 3.5 2.073 2.156 0 3.073-.488 3.073-1.629 0-.658-.261-1.148-3.612-1.476-2.8-.278-4.532-.9-4.532-3.14 0-2.07 1.745-3.305 4.67-3.305 3.287 0 4.914 1.141 5.12 3.589a.3.3 0 0 1-.3.323H22.19a.3.3 0 0 1-.295-.249c-.32-1.42-1.1-1.875-3.07-1.875-2.263 0-2.527.787-2.527 1.378 0 .717.311.926 3.5 1.329 3.157.4 4.636 1.008 4.636 3.272 0 2.236-1.864 3.546-5.341 3.546z"/></svg>`,
  },
  {
    name: 'Linux',
    own: ['dominio', 'deploy'],
    category: 'Sistema operativo',
    description: 'Sistema operativo de código abierto en el que corren la mayoría de los servidores.',
    use: 'Nuestros servidores y despliegues corren sobre Linux.',
    docs: [{ label: 'Páginas man de Linux', url: 'https://man7.org/linux/man-pages/' }, { label: 'Documentación del kernel', url: 'https://docs.kernel.org/' }],
    topics: ['Servidores (VPS)', 'Usuarios y permisos', 'Servicios con systemd', 'Nginx y despliegues'],
    color: '#FCC624',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#FCC624" d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489.117.779.567 1.564 1.182 2.114.623.554 1.535.954 2.774.954 1.248 0 2.15-.266 2.779-.785 1.088-.9 1.324-2.2 1.324-3.396 0-.84-.15-1.655-.213-2.453-.064-.801.016-1.553.348-2.118.656-1.104 2.02-1.734 3.176-1.734.916 0 1.822.39 2.438 1.104.617.713.938 1.682.938 2.704 0 1.219-.449 2.309-.756 3.018a14.73 14.73 0 0 0-.531 1.509c-.104.393-.149.766-.149 1.106 0 .633.187 1.22.553 1.643.362.421.915.654 1.524.654.73 0 1.356-.34 1.813-.953.455-.611.697-1.469.697-2.338 0-.564-.106-1.174-.313-1.774-.207-.6-.52-1.201-.859-1.764-.34-.564-.707-1.093-1.012-1.578-.305-.485-.549-.924-.635-1.298-.152-.665-.168-1.337-.168-2.015 0-.641.008-1.289.008-1.942 0-2.074-.283-3.977-1.148-5.244C16.51.473 14.734 0 12.504 0zM9.77 7.246c.386-.107.726-.001.978.317.252.318.315.81.117 1.222-.198.411-.606.625-1.022.558-.416-.067-.748-.386-.83-.779-.083-.393.038-.836.31-1.103.12-.117.278-.185.448-.215zm4.9 0c.39.105.622.47.603.9-.019.432-.261.786-.613.905-.352.118-.74-.033-.952-.377-.212-.343-.19-.81.054-1.162.244-.353.619-.47.908-.266zm-2.38 1.564c.31.066.548.273.548.273s.106.142.106.389c0 .246-.142.49-.427.617-.286.128-.621.105-.861-.059-.24-.164-.371-.445-.321-.715.05-.27.274-.48.568-.513.119-.013.247-.004.388.008zm-6.207 9.032c.12.437.24.816.35 1.128.219.617.477 1.092.785 1.454.309.362.674.622 1.098.745.425.122.92.109 1.481-.05.56-.159 1.099-.504 1.536-1.034.438-.531.773-1.249.894-2.115.121-.867-.019-1.744-.37-2.526-.352-.782-.913-1.466-1.57-1.964-.657-.499-1.407-.815-2.13-.881-.722-.066-1.414.106-1.966.542-.553.435-.95 1.134-1.003 1.985-.053.852.116 1.849.895 2.716zm12.27.002c.78-.864.955-1.86.904-2.713-.051-.853-.451-1.553-1.006-1.988-.554-.434-1.244-.607-1.966-.54-.722.066-1.472.383-2.128.882-.656.499-1.217 1.183-1.57 1.964-.35.781-.49 1.659-.37 2.526.121.866.456 1.584.895 2.115.438.53.977.875 1.536 1.034.56.159 1.056.172 1.481.05.424-.123.788-.383 1.097-.745.31-.362.567-.837.786-1.454.11-.312.23-.691.35-1.128l-.01-.003z"/></svg>`,
  },
  {
    name: 'Fish Shell',
    category: 'Terminal',
    description: 'Terminal amigable con autocompletado y resaltado de sintaxis listos para usar.',
    use: 'Terminal del equipo para administrar servidores y scripts.',
    docs: [{ label: 'Documentación de fish', url: 'https://fishshell.com/docs/current/' }, { label: 'Tutorial de fish', url: 'https://fishshell.com/docs/current/tutorial.html' }],
    topics: ['Autocompletado', 'Funciones y alias', 'Configuración (config.fish)', 'Scripts'],
    color: '#41C0FF',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><text x="50" y="22" text-anchor="middle" font-size="11" font-family="monospace" fill="#41C0FF" font-weight="bold">$ fish</text><text x="50" y="40" text-anchor="middle" font-size="10" font-family="monospace" fill="#41C0FF" opacity="0.6">~&gt; _</text><rect x="8" y="4" width="84" height="50" rx="8" fill="none" stroke="#41C0FF" stroke-width="2" opacity="0.4"/></svg>`,
  },
  {
    name: 'Python',
    category: 'Lenguaje',
    description: 'Lenguaje de programación versátil, muy usado en datos, automatización e IA.',
    use: 'Scripts de automatización, procesamiento de Excel y análisis de datos.',
    docs: [{ label: 'Documentación de Python', url: 'https://docs.python.org/es/3/' }, { label: 'Tutorial oficial', url: 'https://docs.python.org/es/3/tutorial/' }],
    topics: ['Automatización de archivos', 'Análisis de datos', 'Scripts con IA', 'APIs y web scraping'],
    color: '#3776AB',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#3776AB" d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.898S0 5.789 0 11.969c0 6.18 3.403 5.963 3.403 5.963h2.031v-2.868s-.109-3.402 3.35-3.402h5.769s3.24.052 3.24-3.131V3.129S18.316 0 11.914 0zm-3.2 1.812a1.038 1.038 0 1 1 0 2.077 1.038 1.038 0 0 1 0-2.077z"/><path fill="#FFD43B" d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.123S24 18.211 24 12.031c0-6.18-3.403-5.963-3.403-5.963h-2.031v2.868s.109 3.402-3.35 3.402H9.447s-3.24-.052-3.24 3.131v5.271S5.684 24 12.086 24zm3.2-1.812a1.038 1.038 0 1 1 0-2.077 1.038 1.038 0 0 1 0 2.077z"/></svg>`,
  },
  {
    name: 'Cisco',
    category: 'Redes',
    description: 'Equipos y sistema IOS para redes empresariales: routers, switches y firewalls.',
    use: 'Diseñamos y configuramos redes de oficina en el servicio de Seguridad y Redes.',
    docs: [{ label: 'Soporte y documentación de Cisco', url: 'https://www.cisco.com/c/es_mx/support/index.html' }, { label: 'Cisco DevNet', url: 'https://developer.cisco.com/docs/' }],
    topics: ['Routing y switching', 'VLANs', 'Firewalls y ACLs', 'CLI de IOS'],
    color: '#1BA0D7',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><g fill="#1BA0D7"><rect x="46" y="0" width="8" height="14" rx="2"/><rect x="46" y="36" width="8" height="14" rx="2"/><rect x="14" y="12" width="8" height="10" rx="2"/><rect x="78" y="12" width="8" height="10" rx="2"/><rect x="22" y="6" width="8" height="10" rx="2"/><rect x="70" y="6" width="8" height="10" rx="2"/><rect x="30" y="2" width="8" height="10" rx="2"/><rect x="62" y="2" width="8" height="10" rx="2"/><rect x="14" y="28" width="8" height="10" rx="2"/><rect x="78" y="28" width="8" height="10" rx="2"/><rect x="22" y="34" width="8" height="10" rx="2"/><rect x="70" y="34" width="8" height="10" rx="2"/><rect x="30" y="38" width="8" height="10" rx="2"/><rect x="62" y="38" width="8" height="10" rx="2"/></g></svg>`,
  },
  {
    name: 'Juniper',
    category: 'Redes',
    description: 'Equipos de red con el sistema Junos OS para routing y seguridad.',
    use: 'Alternativa para redes que requieren routing y seguridad avanzados.',
    docs: [{ label: 'Documentación de Juniper', url: 'https://www.juniper.net/documentation/' }],
    topics: ['Junos OS', 'Routing', 'Seguridad (SRX)', 'Automatización de red'],
    color: '#84B135',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><text x="60" y="34" text-anchor="middle" font-size="15" font-weight="800" font-family="sans-serif" fill="#84B135" letter-spacing="-0.5">JUNIPER</text><text x="60" y="48" text-anchor="middle" font-size="8" font-family="sans-serif" fill="#84B135" opacity="0.6" letter-spacing="2">NETWORKS</text></svg>`,
  },
  {
    name: 'GNS3',
    category: 'Simulacion de redes',
    description: 'Simulador de redes para montar topologías virtuales con equipos reales.',
    use: 'Probamos cada diseño de red antes de instalarlo en el cliente.',
    docs: [{ label: 'Documentación de GNS3', url: 'https://docs.gns3.com/' }],
    topics: ['Laboratorios de red', 'Topologías virtuales', 'Pruebas antes de producción', 'Equipos Cisco y Juniper'],
    color: '#00ADEF',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 60"><text x="50" y="38" text-anchor="middle" font-size="28" font-weight="900" font-family="sans-serif" fill="#00ADEF" letter-spacing="1">GNS3</text><rect x="4" y="4" width="92" height="52" rx="6" fill="none" stroke="#00ADEF" stroke-width="2" opacity="0.35"/></svg>`,
  },
  {
    name: 'Expo',
    own: ['expo'],
    category: 'Apps web y móviles',
    description: 'Framework de React Native para crear apps web, iOS y Android con el mismo código.',
    use: 'Esta misma web de BuildWise está hecha con Expo y React Native Web.',
    docs: [{ label: 'Documentación de Expo', url: 'https://docs.expo.dev/' }],
    topics: ['Configuración inicial', 'Navegación', 'Despliegue web'],
    color: '#6f63f6',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 60"><text x="90" y="42" text-anchor="middle" font-size="36" font-weight="900" font-family="sans-serif" fill="#6f63f6" letter-spacing="-1">expo</text></svg>`,
  },
  {
    name: 'Nginx',
    own: ['nginx', 'dominio'],
    category: 'Servidor web',
    description: 'Servidor web y proxy inverso de alto rendimiento.',
    use: 'Publica la web y el backend en el servidor, con dominio propio y HTTPS.',
    docs: [{ label: 'Documentación de Nginx', url: 'https://nginx.org/en/docs/' }],
    topics: ['Configuración básica', 'Proxy inverso', 'SSL/HTTPS'],
    color: '#009639',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><text x="60" y="40" text-anchor="middle" font-size="26" font-weight="800" font-family="sans-serif" fill="#009639" letter-spacing="1">NGINX</text></svg>`,
  },
  {
    name: 'Cloudflare',
    own: ['cloudeflare'],
    category: 'DNS y seguridad',
    description: 'Red global para DNS, certificados SSL, caché y protección de sitios.',
    use: 'Guía del equipo para configurar DNS, SSL y caché de los dominios.',
    docs: [{ label: 'Documentación de Cloudflare', url: 'https://developers.cloudflare.com/' }],
    topics: ['DNS', 'SSL/TLS', 'Caché'],
    color: '#F38020',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><g fill="#F38020"><circle cx="24" cy="22" r="12"/><circle cx="38" cy="18" r="14"/><circle cx="50" cy="26" r="9"/><rect x="12" y="24" width="46" height="11" rx="5.5"/></g></svg>`,
  },
  {
    name: 'Vercel',
    own: ['vercel'],
    category: 'Despliegue',
    description: 'Plataforma para desplegar sitios y apps web con cada cambio en el repositorio.',
    use: 'Desplegamos la web con el script vercel-build del proyecto.',
    docs: [{ label: 'Documentación de Vercel', url: 'https://vercel.com/docs' }],
    topics: ['Despliegue inicial', 'Dominios', 'Variables de entorno'],
    color: '#ffffff',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60"><polygon points="80,8 140,52 20,52" fill="#ffffff"/></svg>`,
  },
  {
    name: 'Tailwind CSS',
    own: ['prompts-tailwind'],
    category: 'Estilos',
    description: 'Framework de CSS con clases utilitarias para diseñar directo en el marcado.',
    use: 'Estilos de toda la web mediante NativeWind (Tailwind para React Native).',
    docs: [{ label: 'Documentación de Tailwind CSS', url: 'https://tailwindcss.com/docs' }],
    topics: ['Componentes', 'Layouts', 'Animaciones'],
    color: '#38BDF8',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 33"><path fill="#38BDF8" fill-rule="evenodd" d="M27 0C19.8 0 15.3 3.6 13.5 10.8c2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 12.672 33.808 15.98 40.5 15.98c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C37.256 3.308 34.192 0 27 0zM13.5 15.98C6.3 15.98 1.8 19.58 0 26.78c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C16.744 28.652 19.808 31.96 26.5 31.96c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.003-5.147-3.653C23.756 19.288 20.692 15.98 13.5 15.98z" clip-rule="evenodd"/></svg>`,
  },
  {
    name: 'Babel',
    own: ['babel'],
    category: 'Compilador JS',
    description: 'Compilador de JavaScript que convierte código moderno en código compatible.',
    use: 'Transpila el código de la app (babel-preset-expo y NativeWind).',
    docs: [{ label: 'Documentación de Babel', url: 'https://babeljs.io/docs/' }],
    topics: ['Configuración básica', 'Presets y plugins'],
    color: '#F9DC3E',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><text x="60" y="40" text-anchor="middle" font-size="26" font-weight="800" font-family="sans-serif" fill="#F9DC3E" letter-spacing="1">BABEL</text></svg>`,
  },
];

// Documentos propios de una herramienta (los que existan en ownDocs.js).
const ownDocs = (tool) => (tool.own || []).map((id) => OWN_DOCS[id]).filter(Boolean);
// Temas: los encabezados de la documentacion propia; si no hay, los del catalogo.
const topicsOf = (tool) => {
  const docs = ownDocs(tool);
  if (!docs.length) return tool.topics.map((t) => ({ label: t }));
  return docs.flatMap((d) => d.topics.slice(0, 5).map((t) => ({ label: t, doc: d.id }))).slice(0, 8);
};

const svgUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
// Logos blancos (GitHub) se oscurecen en modo claro para que se vean sobre fondo blanco.
const themed = (tool, dark) =>
  dark || tool.color !== '#ffffff'
    ? tool
    : { ...tool, color: '#161616', svg: tool.svg.replace(/#ffffff/g, '#161616') };

function ToolCard({ tool: raw, active, onPress }) {
  const [hovered, setHovered] = useState(false);
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  const tool = themed(raw, dark);
  const lit = hovered || active;
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={`${tool.name}: ver documentación y temas`}
      style={{
        width: 160,
        backgroundColor: lit
          ? dark ? '#1a1a2e' : '#f0f4ff'
          : dark ? '#1c1c1e' : '#ffffff',
        borderWidth: 1.5,
        borderColor: lit ? tool.color : dark ? '#2c2c2e' : '#e0e0e0',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        gap: 10,
        shadowColor: lit ? tool.color : '#000',
        shadowOpacity: lit ? 0.28 : 0.06,
        shadowRadius: lit ? 16 : 4,
        shadowOffset: { width: 0, height: lit ? 6 : 2 },
        elevation: lit ? 8 : 2,
        transform: [{ scale: hovered ? 1.045 : 1 }],
      }}
    >
      {ownDocs(tool).length ? (
        <View style={{ position: 'absolute', top: 8, right: 8 }} accessibilityLabel="Con documentación propia">
          <Ionicons name="book" size={13} color={dark ? '#c49bc0' : '#9d6b99'} />
        </View>
      ) : null}
      <Image source={{ uri: svgUri(tool.svg) }} style={{ width: 54, height: 40 }} resizeMode="contain" />
      <Text style={{ color: dark ? '#f0f6fc' : '#161616', fontSize: 13, fontWeight: '700', textAlign: 'center' }}>
        {tool.name}
      </Text>
      <Text style={{ color: dark ? '#8b949e' : '#525252', fontSize: 10, textAlign: 'center', lineHeight: 14 }}>
        {tool.category}
      </Text>
      <View style={{ height: 2, width: active ? 44 : 28, borderRadius: 1, backgroundColor: lit ? tool.color : dark ? '#333' : '#e0e0e0' }} />
    </Pressable>
  );
}

/**
 * Panel de la herramienta elegida: que es, como la usamos, documentacion
 * propia del equipo (md/ -> ownDocs.js), referencia oficial y temas.
 */
function ToolDetail({ tool: raw }) {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  const navigation = useNavigation();
  const tool = themed(raw, dark);
  const link = dark ? '#c49bc0' : '#9d6b99';
  const mine = ownDocs(tool);
  const open = (id) => navigation.navigate('Documento', { id });
  return (
    <View
      className="mx-auto mt-8 w-full max-w-4xl flex-row flex-wrap gap-8 rounded-2xl border border-carbon-gray20 bg-white p-7 dark:border-carbon-gray90 dark:bg-carbon-black"
      style={{ borderTopWidth: 3, borderTopColor: tool.color }}
    >
      <View className="min-w-[240px] flex-1">
        <View className="flex-row items-center gap-4">
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-carbon-gray10 dark:bg-carbon-gray90">
            <Image source={{ uri: svgUri(tool.svg) }} style={{ width: 36, height: 28 }} resizeMode="contain" />
          </View>
          <View>
            <Text className="font-plexsemibold text-xl text-carbon-black dark:text-white">{tool.name}</Text>
            <Text className="font-plex text-xs uppercase tracking-wider text-carbon-gray50">{tool.category}</Text>
          </View>
        </View>
        <Text className="mt-5 font-plex text-base leading-6 text-carbon-gray70 dark:text-carbon-gray20">
          {tool.description}
        </Text>
        <View className="mt-4 flex-row items-start gap-2">
          <Ionicons name="construct-outline" size={16} color={link} style={{ marginTop: 3 }} />
          <Text className="flex-1 font-plex text-sm leading-6 text-carbon-black dark:text-white">
            <Text className="font-plexsemibold">Cómo lo usamos: </Text>
            {tool.use}
          </Text>
        </View>
      </View>

      <View className="min-w-[240px] flex-1">
        <Text className="mb-3 font-plexsemibold text-xs uppercase tracking-[2px] text-carbon-gray50">
          Documentación del equipo
        </Text>
        {mine.length ? (
          <View className="gap-2">
            {mine.map((d) => (
              <Pressable
                key={d.id}
                onPress={() => open(d.id)}
                accessibilityRole="link"
                className="flex-row items-center justify-between rounded-lg border border-carbon-blue/40 bg-carbon-blue/5 px-4 py-3 hover:bg-carbon-blue/10"
              >
                <View className="flex-1 flex-row items-center gap-2.5">
                  <Ionicons name="document-text-outline" size={16} color={link} />
                  <View className="flex-1">
                    <Text className="font-plexsemibold text-sm text-carbon-black dark:text-white">{d.title}</Text>
                    <Text className="font-plex text-xs text-carbon-gray50">
                      {d.file}
                      {d.topics.length ? ` · ${d.topics.length} secciones` : ''}
                    </Text>
                  </View>
                </View>
                <Ionicons name="arrow-forward" size={15} color={link} />
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="rounded-lg border border-dashed border-carbon-gray20 px-4 py-3 dark:border-carbon-gray90">
            <Text className="font-plex text-sm text-carbon-gray70 dark:text-carbon-gray20">
              Aún no hay documentación propia de {tool.name}.
            </Text>
          </View>
        )}

        <Text className="mb-2 mt-6 font-plexsemibold text-xs uppercase tracking-[2px] text-carbon-gray50">
          Referencia oficial
        </Text>
        <View className="flex-row flex-wrap gap-x-4 gap-y-1">
          {tool.docs.map((d) => (
            <Pressable
              key={d.url}
              onPress={() => Linking.openURL(d.url)}
              accessibilityRole="link"
              className="flex-row items-center gap-1.5 py-1"
            >
              <Text className="font-plex text-sm text-carbon-gray70 underline dark:text-carbon-gray20">{d.label}</Text>
              <Ionicons name="open-outline" size={13} color="#8d8d8d" />
            </Pressable>
          ))}
        </View>

        <Text className="mb-3 mt-6 font-plexsemibold text-xs uppercase tracking-[2px] text-carbon-gray50">
          Temas
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {topicsOf(tool).map((t) => (
            <Pressable
              key={`${t.doc || ''}${t.label}`}
              disabled={!t.doc}
              onPress={() => t.doc && open(t.doc)}
              className="rounded-full border px-3 py-1.5"
              style={{ borderColor: `${tool.color}66`, backgroundColor: `${tool.color}14` }}
            >
              <Text className="font-plex text-xs text-carbon-black dark:text-carbon-gray20">{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function ToolsGrid() {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';
  const [active, setActive] = useState(_TOOLS[0].name);
  const tool = _TOOLS.find((t) => t.name === active) || _TOOLS[0];
  return (
    <View style={{ paddingVertical: 48, marginBottom: 16 }}>
      <Text style={{ color: dark ? '#6b7280' : '#8d8d8d', fontSize: 11, fontWeight: '600', textAlign: 'center', letterSpacing: 3, marginBottom: 8, textTransform: 'uppercase' }}>
        Tecnologias y herramientas
      </Text>
      <Text style={{ color: dark ? '#f0f6fc' : '#161616', fontSize: 22, fontWeight: '300', textAlign: 'center', marginBottom: 8 }}>
        Stack de infraestructura y desarrollo
      </Text>
      <Text style={{ color: dark ? '#8b949e' : '#525252', fontSize: 13, textAlign: 'center', marginBottom: 36 }}>
        Elige una herramienta para ver la documentación del equipo y sus temas.
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
        {_TOOLS.map((t) => (
          <ToolCard key={t.name} tool={t} active={t.name === active} onPress={() => setActive(t.name)} />
        ))}
      </View>
      <ToolDetail tool={tool} />
    </View>
  );
}
