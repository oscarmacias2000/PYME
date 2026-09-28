// Portada de cada tarjeta de "Documentacion propia y prompts" (DocsScreen):
// logotipos de techIcons.js por id de OWN_DOCS. Sin logos se usa el de BuildWise.
// Va aparte de ownDocs.js porque ese archivo lo genera scripts/sync-docs.js.

// Logotipos propios (imagen) por id de documento.
export const DOC_COVER_IMAGES = {
  typefish: require('../../assets/typefish-logo.jpg'),
};

export const DOC_COVERS = {
  babel: ['babel'],
  cloudeflare: ['cloudflare'],
  deepseek_markdown_20260823_b251ef: ['deepseek', 'n8n'],
  dominio: ['claude', 'nginx'],
  expo: ['expo', 'react'],
  nginx: ['nginx'],
  nodejs: ['nodedotjs'],
  'prompts-tailwind': ['tailwindcss'],
  vercel: ['vercel', 'react'],
  deploy: ['gnubash', 'hostinger'],
  'plataforma-labs-red': ['docker', 'linux', 'postgresql'],
};
