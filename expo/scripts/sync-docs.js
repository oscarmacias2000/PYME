// Sincroniza la documentacion propia (E:\PYME\md y E:\PYME\commands) con la
// app: genera src/constants/ownDocs.js para que la web la muestre dentro del
// sitio (ver OwnDocScreen). Ejecutar despues de editar un .md:
//   npm run docs:sync
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.resolve(__dirname, '..', 'src', 'constants', 'ownDocs.js');

// Carpetas de origen. En "commands" los archivos son listas de comandos, no
// Markdown: se envuelven en un bloque de codigo.
const SOURCES = [
  { dir: 'md', code: null },
  { dir: 'commands', code: 'powershell' },
];

// Titulos para archivos sin encabezado propio.
const FALLBACK_TITLES = {
  deploy: 'Comandos de despliegue',
  emex: 'Integración con eMex',
};

const slug = (file) => path.basename(file, '.md').toLowerCase();
const firstHeading = (md) => {
  const m = md.match(/^#{1,3}\s+(.+)$/m);
  return m ? m[1].trim() : null;
};
// Temas = encabezados de seccion (##/###), sin numeracion ni emojis.
const headings = (md) =>
  [...md.matchAll(/^#{2,3}\s+(.+)$/gm)]
    .map((m) => m[1].replace(/^\d+\.\s*/, '').replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\uFE0F]/gu, '').trim())
    .filter(Boolean);

const docs = {};
for (const { dir, code } of SOURCES) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const file of fs.readdirSync(abs).filter((f) => f.endsWith('.md')).sort()) {
    const raw = fs.readFileSync(path.join(abs, file), 'utf8').replace(/\r\n/g, '\n').trim();
    const id = slug(file);
    const content = code ? '```' + code + '\n' + raw + '\n```' : raw;
    docs[id] = {
      id,
      file: `${dir}/${file}`,
      title: (code ? null : firstHeading(raw)) || FALLBACK_TITLES[id] || id,
      topics: headings(code ? '' : raw),
      content,
    };
  }
}

const out =
  '// ARCHIVO GENERADO por scripts/sync-docs.js a partir de md/ y commands/.\n' +
  '// No editar a mano: edita el .md y ejecuta `npm run docs:sync`.\n' +
  `export const OWN_DOCS = ${JSON.stringify(docs, null, 2)};\n`;
fs.writeFileSync(OUT, out, 'utf8');
console.log(`ownDocs.js: ${Object.keys(docs).length} documentos -> ${path.relative(process.cwd(), OUT)}`);
