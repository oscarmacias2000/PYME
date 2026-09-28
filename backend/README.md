# Sync Labs — Backend API

API en Node.js + Express para la app Sync Labs: autenticacion (JWT), formulario
de contacto y contenido publico (servicios / docs). Persistencia en archivo JSON
(`data/db.json`), sin base de datos externa.

## Uso

```bash
npm install
cp .env.example .env   # y edita JWT_SECRET
npm run dev            # desarrollo (recarga automatica)
npm start              # produccion
```

Escucha en `http://localhost:3000` (configurable con `PORT`).

## Endpoints

| Metodo | Ruta | Auth | Descripcion |
|--------|------|------|-------------|
| GET  | `/health` | — | Estado del servicio |
| POST | `/api/auth/register` | — | Registro `{ name, email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | — | Login `{ email, password }` → `{ token, user }` |
| GET  | `/api/auth/me` | Bearer | Usuario autenticado |
| POST | `/api/contact` | — | Enviar mensaje `{ nombre, email, mensaje }` |
| GET  | `/api/contact` | Bearer | Listar mensajes recibidos |
| GET  | `/api/services` | — | Lista de servicios |
| GET  | `/api/services/:id` | — | Detalle de un servicio |
| GET  | `/api/docs` | — | Lista de documentacion |
| GET  | `/api/service-docs` | — | Arbol del sidebar de todos los servicios (Postgres) |
| GET  | `/api/service-docs/:serviceId/:slug` | — | Pagina de documentacion de un servicio (Postgres) |

## Despliegue

Corre en el puerto 3000, que coincide con la config de Nginx/DuckDNS en
`../deploy/`. Recomendado mantenerlo vivo con PM2:

```bash
pm2 start server.js --name synclabs-backend
pm2 startup && pm2 save
```

## Migrar a base de datos

`src/db.js` encapsula toda la persistencia. Para pasar a Postgres/SQLite,
reimplementa `read/write/update` ahi sin tocar el resto del codigo.

## Base de documentacion de servicios (Postgres en Docker)

El sidebar de cada servicio (Documentacion, Iniciar proyecto, Tools, Soporte,
Comunidad, Orientaciones, Educacion, Compatibilidad) se lee de un Postgres
**aislado**: red y volumen propios, solo en `127.0.0.1:5433`.

```bash
npm run db:up     # docker compose up -d (postgres:16-alpine)
npm run db:seed   # esquema + datos de ejemplo con faker (idempotente)
npm run db:down   # detener (los datos quedan en el volumen)
```

Variables en `.env` (ver `.env.example`): `DOCS_DB_*` para el contenedor y
`DOCS_DATABASE_URL` para el backend. Sin `DOCS_DATABASE_URL` (p. ej. en
produccion) las rutas `/api/service-docs` responden 503 y el sitio usa su
contenido fijo. Los datos son **de ejemplo** (faker, semilla fija).
