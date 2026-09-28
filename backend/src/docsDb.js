// Documentacion de servicios (sidebar) desde el Postgres aislado en Docker.
// Si DOCS_DATABASE_URL no esta definido o la base no responde, las rutas
// devuelven 503 y el frontend usa su contenido fijo.
import { Router } from 'express';

// pg se carga en la primera consulta y solo si hay base configurada: si el paquete
// no esta instalado en el servidor (npm install sin correr), el sitio sigue arriba y
// solo estas rutas responden 503. Sin await de nivel superior: LiteSpeed (lsnode.js)
// carga server.js con require() y Node no lo permite en modulos con top-level await.
const url = process.env.DOCS_DATABASE_URL;
let poolPromise = null;
function getPool() {
  if (!url) return Promise.resolve(null);
  poolPromise ||= import('pg')
    .then(({ default: pg }) => {
      const pool = new pg.Pool({ connectionString: url, max: 5, connectionTimeoutMillis: 3000 });
      pool.on('error', (e) => console.error('[docs-db]', e.message));
      return pool;
    })
    .catch((e) => {
      console.error('[docs-db] no se pudo cargar pg:', e.message);
      return null;
    });
  return poolPromise;
}

const router = Router();

// Sin base configurada o caida: 503 con mensaje claro.
async function query(res, sql, params) {
  const pool = await getPool();
  if (!pool) {
    res.status(503).json({ error: 'Base de documentación no configurada (DOCS_DATABASE_URL)' });
    return null;
  }
  try {
    return (await pool.query(sql, params)).rows;
  } catch (e) {
    console.error('[docs-db]', e.message);
    res.status(503).json({ error: 'Base de documentación no disponible' });
    return null;
  }
}

// GET /api/service-docs  → arbol del sidebar de todos los servicios.
router.get('/', async (req, res) => {
  const rows = await query(
    res,
    `SELECT g.service_id, g.slug AS group_slug, g.title AS group_title, g.icon, g.position AS gpos,
            i.slug, i.title, i.kind, i.position
       FROM doc_groups g JOIN doc_items i ON i.group_id = g.id
      ORDER BY g.service_id, g.position, i.position`
  );
  if (!rows) return;
  const services = {};
  for (const r of rows) {
    const svc = (services[r.service_id] ||= { id: r.service_id, groups: [] });
    let grp = svc.groups.find((g) => g.slug === r.group_slug);
    if (!grp) {
      grp = { slug: r.group_slug, title: r.group_title, icon: r.icon, items: [] };
      svc.groups.push(grp);
    }
    grp.items.push({ slug: r.slug, title: r.title, kind: r.kind });
  }
  res.json({ services: Object.values(services) });
});

// GET /api/service-docs/:serviceId/:slug  → pagina completa.
router.get('/:serviceId/:slug', async (req, res) => {
  const rows = await query(
    res,
    `SELECT i.slug, i.title, i.kind, i.summary, i.body, i.columns, i.rows, i.author, i.updated_at,
            g.slug AS group_slug, g.title AS group_title, g.icon AS group_icon,
            s.id AS service_id, s.title AS service_title
       FROM doc_items i
       JOIN doc_groups g ON g.id = i.group_id
       JOIN services s ON s.id = g.service_id
      WHERE s.id = $1 AND i.slug = $2
      LIMIT 1`,
    [req.params.serviceId, req.params.slug]
  );
  if (!rows) return;
  if (!rows.length) return res.status(404).json({ error: 'Página no encontrada' });
  res.json({ item: rows[0] });
});

export default router;
