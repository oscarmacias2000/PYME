-- Esquema de la documentacion de servicios (sidebar de cada servicio).
-- Se ejecuta automaticamente la primera vez que arranca el contenedor.
-- `npm run db:seed` lo vuelve a aplicar y llena las tablas con faker.

CREATE TABLE IF NOT EXISTS services (
  id         TEXT PRIMARY KEY,           -- mismo id que en el frontend
  title      TEXT NOT NULL
);

-- Grupos del sidebar: Documentacion, Tools, Soporte, Comunidad...
CREATE TABLE IF NOT EXISTS doc_groups (
  id          SERIAL PRIMARY KEY,
  service_id  TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  title       TEXT NOT NULL,
  icon        TEXT NOT NULL,              -- nombre de Ionicons
  position    INT  NOT NULL DEFAULT 0,
  UNIQUE (service_id, slug)
);

-- Paginas de cada grupo. `kind` indica como se presenta:
--   article | steps | table | thread | checklist
-- `columns`/`rows` (JSON) alimentan la tabla de datos de la pagina.
CREATE TABLE IF NOT EXISTS doc_items (
  id          SERIAL PRIMARY KEY,
  group_id    INT  NOT NULL REFERENCES doc_groups(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL,
  title       TEXT NOT NULL,
  kind        TEXT NOT NULL DEFAULT 'article',
  summary     TEXT,
  body        TEXT,                       -- Markdown
  columns     JSONB NOT NULL DEFAULT '[]'::jsonb,
  rows        JSONB NOT NULL DEFAULT '[]'::jsonb,
  author      TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  position    INT  NOT NULL DEFAULT 0,
  UNIQUE (group_id, slug)
);

CREATE INDEX IF NOT EXISTS doc_items_group_idx ON doc_items (group_id, position);
