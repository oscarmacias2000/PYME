// Llena la base de documentacion de servicios con DATOS DE EJEMPLO (faker).
// Uso:  npm run db:seed        (requiere `docker compose up -d` y DOCS_DATABASE_URL)
// Es idempotente: borra y vuelve a crear el contenido cada vez.
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';
import { fakerES_MX as faker } from '@faker-js/faker';

const __dirname = dirname(fileURLToPath(import.meta.url));
faker.seed(2026); // mismos datos en cada ejecucion

const SERVICES = [
  { id: 'chatbot', title: 'Chatbot Inteligente para PYMES' },
  { id: 'automatizacion', title: 'Automatizacion Inteligente' },
  { id: 'apps', title: 'Desarrollo Web / Apps con IA' },
  { id: 'redes', title: 'Seguridad y Redes' },
  { id: 'visor-reportes', title: 'Visor de Reportes de Campo' },
  { id: 'consultoria', title: 'Consultoria y Estrategia' },
];

// Herramientas reales por servicio (las cifras y estados son de ejemplo).
const TOOLS = {
  chatbot: ['Claude API', 'Groq', 'Ollama', 'Whisper (voz)', 'n8n', 'Google Sheets'],
  automatizacion: ['n8n', 'Claude API', 'Gmail API', 'Google Sheets', 'Webhooks', 'WhatsApp Business'],
  apps: ['React Native', 'Expo', 'Node.js', 'Express', 'Vercel', 'PostgreSQL'],
  redes: ['Cisco IOS', 'GNS3', 'Wireshark', 'Nmap', 'pfSense', 'Juniper Junos'],
  'visor-reportes': ['Excel / SheetJS', 'Node.js', 'Electron', 'SQLite', 'Google Sheets'],
  consultoria: ['Miro', 'Notion', 'Power BI', 'Jira', 'Google Workspace'],
};

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
const pick = (arr) => faker.helpers.arrayElement(arr);
const recent = () => faker.date.recent({ days: 60 });
const fecha = (d) => d.toISOString().slice(0, 10);
const persona = () => `${faker.person.firstName()} ${faker.person.lastName()}`;
const empresa = () => faker.company.name();

// ── Generadores por tipo de pagina ─────────────────────────────────────────────
const article = (svc, title) => ({
  kind: 'article',
  summary: `${title} de ${svc.title}.`,
  body: [
    `## ${title}`,
    `${svc.title} ayuda a equipos como **${empresa()}** a reducir trabajo manual. Esta sección resume lo esencial para empezar.`,
    `### Puntos clave`,
    `- Implementación típica en **${faker.number.int({ min: 2, max: 6 })} semanas**.`,
    `- Compatible con las herramientas que ya usa tu equipo.`,
    `- Soporte en español con respuesta en menos de **${faker.number.int({ min: 4, max: 24 })} horas**.`,
    `> Nota: contenido de ejemplo generado automáticamente para demostración.`,
  ].join('\n\n'),
});

const steps = (svc, title) => {
  const pasos = ['Revisar requisitos', 'Crear cuenta y accesos', 'Instalar dependencias', 'Configurar variables', 'Probar en ambiente de pruebas', 'Pasar a producción'];
  return {
    kind: 'steps',
    summary: `Pasos para ${title.toLowerCase()} en ${svc.title}.`,
    body: `Sigue estos pasos en orden. Tiempo total estimado: **${faker.number.int({ min: 1, max: 5 })} días hábiles**.`,
    columns: [
      { key: 'paso', label: 'Paso' },
      { key: 'titulo', label: 'Actividad' },
      { key: 'responsable', label: 'Responsable' },
      { key: 'tiempo', label: 'Tiempo' },
    ],
    rows: pasos.slice(0, faker.number.int({ min: 4, max: 6 })).map((p, i) => ({
      paso: i + 1,
      titulo: p,
      responsable: pick(['BuildWise', 'Cliente', 'Ambos']),
      tiempo: `${faker.number.int({ min: 1, max: 8 })} h`,
    })),
  };
};

const toolsTable = (svc, title) => ({
  kind: 'table',
  summary: `Herramientas e integraciones de ${svc.title}.`,
  body: 'Versiones y estado de las herramientas que usamos en este servicio.',
  columns: [
    { key: 'herramienta', label: 'Herramienta' },
    { key: 'version', label: 'Versión' },
    { key: 'uso', label: 'Uso' },
    { key: 'estado', label: 'Estado', status: true },
  ],
  rows: TOOLS[svc.id].map((t) => ({
    herramienta: t,
    version: faker.system.semver(),
    uso: pick(['Producción', 'Integración', 'Pruebas', 'Automatización', 'Monitoreo']),
    estado: pick(['Estable', 'Estable', 'Estable', 'Beta', 'En evaluación']),
  })),
});

const sla = (svc) => ({
  kind: 'table',
  summary: 'Canales de soporte y tiempos de respuesta.',
  body: `Horario de atención para ${svc.title}. Los tiempos son de primera respuesta.`,
  columns: [
    { key: 'canal', label: 'Canal' },
    { key: 'horario', label: 'Horario' },
    { key: 'respuesta', label: 'Primera respuesta' },
    { key: 'prioridad', label: 'Prioridad', status: true },
  ],
  rows: [
    { canal: 'WhatsApp', horario: 'L-V 9:00–18:00', respuesta: `${faker.number.int({ min: 15, max: 60 })} min`, prioridad: 'Alta' },
    { canal: 'Correo', horario: 'L-V 9:00–18:00', respuesta: `${faker.number.int({ min: 2, max: 8 })} h`, prioridad: 'Media' },
    { canal: 'Portal de tickets', horario: '24/7', respuesta: `${faker.number.int({ min: 4, max: 24 })} h`, prioridad: 'Media' },
    { canal: 'Videollamada', horario: 'Con cita', respuesta: `${faker.number.int({ min: 1, max: 3 })} días`, prioridad: 'Baja' },
  ],
});

const tickets = (svc) => ({
  kind: 'table',
  summary: 'Tickets de soporte recientes (ejemplo).',
  body: `Últimos tickets registrados para ${svc.title}.`,
  columns: [
    { key: 'folio', label: 'Folio' },
    { key: 'asunto', label: 'Asunto' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'estado', label: 'Estado', status: true },
    { key: 'abierto', label: 'Abierto' },
  ],
  rows: faker.helpers.shuffle(['Error al iniciar sesión', 'Duda de configuración', 'Solicitud de nueva función', 'Lentitud en respuestas', 'Actualización de datos', 'Alta de usuario']).map((asunto) => ({
    folio: `BW-${faker.number.int({ min: 1000, max: 9999 })}`,
    asunto,
    cliente: empresa(),
    estado: pick(['Resuelto', 'Resuelto', 'En progreso', 'Abierto']),
    abierto: fecha(recent()),
  })),
});

const threads = (svc, title) => ({
  kind: 'thread',
  summary: `${title}: conversaciones de la comunidad.`,
  body: 'Temas recientes de usuarios del servicio.',
  columns: [
    { key: 'tema', label: 'Tema' },
    { key: 'autor', label: 'Autor' },
    { key: 'respuestas', label: 'Respuestas' },
    { key: 'votos', label: 'Votos' },
    { key: 'actividad', label: 'Última actividad' },
  ],
  // Temas sin repetir (6 de 8 posibles).
  rows: faker.helpers.arrayElements([
    `¿Cómo integraron ${pick(TOOLS[svc.id])} con su sistema?`,
    'Comparto mi flujo de trabajo',
    'Mejores prácticas para empezar',
    'Resultados después de 3 meses',
    'Problema resuelto: tiempos de respuesta',
    `Caso de uso en ${faker.location.city()}`,
    `Tips para sacarle provecho a ${pick(TOOLS[svc.id])}`,
    '¿Qué métricas están midiendo?',
  ], 6).map((tema) => ({
    tema,
    autor: persona(),
    respuestas: faker.number.int({ min: 0, max: 48 }),
    votos: faker.number.int({ min: 1, max: 120 }),
    actividad: fecha(recent()),
  })),
});

const checklist = (svc, title) => {
  const recos = {
    'Buenas prácticas': ['Documentar cada flujo', 'Revisar métricas cada semana', 'Capacitar a un responsable interno', 'Probar cambios antes de producción'],
    'Seguridad y privacidad': ['Usar contraseñas únicas y 2FA', 'Limitar accesos por rol', 'Cifrar datos sensibles', 'Revisar bitácoras de acceso'],
    'Limitaciones conocidas': ['Archivos mayores a 25 MB se procesan por partes', 'Sin soporte offline en la versión web', 'Los modelos pueden cometer errores: validar datos críticos'],
    'Hoja de ruta': ['Panel de métricas en tiempo real', 'Nuevas integraciones', 'Modo multiempresa', 'App móvil nativa'],
  };
  const list = recos[title] || recos['Buenas prácticas'];
  return {
    kind: 'checklist',
    summary: `${title} para ${svc.title}.`,
    body: `Recomendaciones del equipo para ${svc.title}.`,
    columns: [
      { key: 'recomendacion', label: title === 'Hoja de ruta' ? 'Iniciativa' : 'Recomendación' },
      { key: 'nivel', label: title === 'Hoja de ruta' ? 'Trimestre' : 'Nivel', status: title !== 'Hoja de ruta' },
    ],
    rows: list.map((r, i) => ({
      recomendacion: r,
      nivel: title === 'Hoja de ruta' ? `Q${((i + 3) % 4) + 1} 2026` : pick(['Obligatorio', 'Recomendado', 'Recomendado']),
    })),
  };
};

const courses = (svc, title) => ({
  kind: 'table',
  summary: `${title} de ${svc.title}.`,
  body: 'Material de aprendizaje para tu equipo.',
  columns: [
    { key: 'curso', label: 'Curso' },
    { key: 'nivel', label: 'Nivel', status: true },
    { key: 'duracion', label: 'Duración' },
    { key: 'lecciones', label: 'Lecciones' },
    { key: 'calificacion', label: 'Calificación' },
  ],
  rows: Array.from({ length: 5 }, (_, i) => ({
    curso: `${['Introducción a', 'Primeros pasos con', 'Dominando', 'Casos prácticos de', 'Certificación en'][i]} ${pick(TOOLS[svc.id])}`,
    nivel: ['Básico', 'Básico', 'Intermedio', 'Intermedio', 'Avanzado'][i],
    duracion: `${faker.number.int({ min: 1, max: 12 })} h`,
    lecciones: faker.number.int({ min: 4, max: 30 }),
    calificacion: `${faker.number.float({ min: 4, max: 5, fractionDigits: 1 })} ★`,
  })),
});

const compat = {
  'Sistemas operativos': () => ({
    columns: [
      { key: 'sistema', label: 'Sistema' },
      { key: 'version', label: 'Versión' },
      { key: 'arquitectura', label: 'Arquitectura' },
      { key: 'estado', label: 'Estado', status: true },
    ],
    rows: [
      ['Windows', '11 / 10 (22H2+)', 'x86-64'],
      ['Ubuntu', '22.04 / 24.04 LTS', 'x86-64, ARM64'],
      ['macOS', '13 Ventura o superior', 'Apple Silicon, Intel'],
      ['Debian', '12', 'x86-64'],
      ['Android', '12 o superior', 'ARM64'],
      ['iOS', '16 o superior', 'ARM64'],
    ].map(([sistema, version, arquitectura]) => ({
      sistema,
      version,
      arquitectura,
      estado: pick(['Compatible', 'Compatible', 'Compatible', 'Parcial']),
    })),
  }),
  Navegadores: () => ({
    columns: [
      { key: 'navegador', label: 'Navegador' },
      { key: 'minima', label: 'Versión mínima' },
      { key: 'estado', label: 'Estado', status: true },
    ],
    rows: ['Chrome', 'Edge', 'Firefox', 'Safari', 'Opera'].map((n) => ({
      navegador: n,
      minima: String(faker.number.int({ min: 100, max: 128 })),
      estado: n === 'Opera' ? 'Parcial' : 'Compatible',
    })),
  }),
  'Hardware recomendado': () => ({
    columns: [
      { key: 'componente', label: 'Componente' },
      { key: 'minimo', label: 'Mínimo' },
      { key: 'recomendado', label: 'Recomendado' },
    ],
    rows: [
      { componente: 'Procesador', minimo: '4 núcleos', recomendado: '8 núcleos' },
      { componente: 'Memoria RAM', minimo: `${pick([4, 8])} GB`, recomendado: `${pick([16, 32])} GB` },
      { componente: 'Almacenamiento', minimo: '20 GB SSD', recomendado: '100 GB SSD' },
      { componente: 'GPU (IA local)', minimo: 'Opcional', recomendado: 'NVIDIA 8 GB VRAM' },
    ],
  }),
  'Requisitos de red': () => ({
    columns: [
      { key: 'requisito', label: 'Requisito' },
      { key: 'valor', label: 'Valor' },
    ],
    rows: [
      { requisito: 'Ancho de banda', valor: `${faker.number.int({ min: 10, max: 50 })} Mbps` },
      { requisito: 'Latencia máxima', valor: `${faker.number.int({ min: 80, max: 200 })} ms` },
      { requisito: 'Puertos de salida', valor: '443 (HTTPS)' },
      { requisito: 'Dominio propio', valor: 'Opcional (recomendado)' },
    ],
  }),
};
const compatItem = (svc, title) => ({
  kind: 'table',
  summary: `${title} compatibles con ${svc.title}.`,
  body: 'Probado por el equipo de BuildWise Labs.',
  ...compat[title](),
});

// Grupos del sidebar (mismo orden y nombres para todos los servicios).
const GROUPS = [
  { title: 'Documentación', icon: 'document-text-outline', items: [['Descripción general', article], ['Arquitectura del sistema', article], ['Glosario de términos', article]] },
  { title: 'Iniciar proyecto', icon: 'rocket-outline', items: [['Requisitos previos', steps], ['Instalación paso a paso', steps], ['Configuración inicial', steps]] },
  { title: 'Tools', icon: 'construct-outline', items: [['Herramientas e integraciones', toolsTable], ['APIs disponibles', toolsTable]] },
  { title: 'Soporte', icon: 'help-circle-outline', items: [['Canales y tiempos de respuesta', sla], ['Tickets recientes', tickets], ['Reportar un problema', steps]] },
  { title: 'Comunidad', icon: 'people-outline', items: [['Foro de usuarios', threads], ['Casos de uso compartidos', threads]] },
  { title: 'Orientaciones', icon: 'compass-outline', items: [['Buenas prácticas', checklist], ['Seguridad y privacidad', checklist], ['Limitaciones conocidas', checklist], ['Hoja de ruta', checklist]] },
  { title: 'Educación', icon: 'school-outline', items: [['Cursos y tutoriales', courses], ['Certificación', courses]] },
  { title: 'Compatibilidad', icon: 'hardware-chip-outline', items: [['Sistemas operativos', compatItem], ['Navegadores', compatItem], ['Hardware recomendado', compatItem], ['Requisitos de red', compatItem]] },
];

async function main() {
  const url = process.env.DOCS_DATABASE_URL;
  if (!url) throw new Error('Falta DOCS_DATABASE_URL en backend/.env');
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(readFileSync(join(__dirname, 'schema.sql'), 'utf8'));
    await client.query('BEGIN');
    await client.query('TRUNCATE doc_items, doc_groups, services RESTART IDENTITY CASCADE');
    let total = 0;
    for (const svc of SERVICES) {
      await client.query('INSERT INTO services (id, title) VALUES ($1, $2)', [svc.id, svc.title]);
      for (const [gi, g] of GROUPS.entries()) {
        const { rows } = await client.query(
          'INSERT INTO doc_groups (service_id, slug, title, icon, position) VALUES ($1,$2,$3,$4,$5) RETURNING id',
          [svc.id, slugify(g.title), g.title, g.icon, gi]
        );
        for (const [ii, [title, make]] of g.items.entries()) {
          const d = make(svc, title);
          await client.query(
            `INSERT INTO doc_items (group_id, slug, title, kind, summary, body, columns, rows, author, updated_at, position)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
            [rows[0].id, slugify(title), title, d.kind, d.summary, d.body || '', JSON.stringify(d.columns || []),
              JSON.stringify(d.rows || []), persona(), recent(), ii]
          );
          total += 1;
        }
      }
    }
    await client.query('COMMIT');
    console.log(`Listo: ${SERVICES.length} servicios, ${GROUPS.length} grupos c/u, ${total} paginas.`);
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error('Error al sembrar la base:', e.message);
  process.exit(1);
});
