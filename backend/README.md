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
