// Backend API de Sync Labs.
// Auth (JWT), contacto y contenido publico (servicios / docs).
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './src/auth.js';
import contactRoutes from './src/contact.js';
import { SERVICES, DOCS } from './src/content.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: origenes permitidos desde .env (coma-separados) o * por defecto.
const origins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim());
app.use(
  cors({
    origin: origins.includes('*') ? true : origins,
  })
);
app.use(express.json());

// Salud del servicio.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'synclabs-backend', time: new Date().toISOString() });
});

// Contenido publico.
app.get('/api/services', (req, res) => res.json({ services: SERVICES }));
app.get('/api/services/:id', (req, res) => {
  const service = SERVICES.find((s) => s.id === req.params.id);
  if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
  res.json({ service });
});
app.get('/api/docs', (req, res) => res.json({ docs: DOCS }));

// Auth y contacto.
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);

// 404 para rutas de API no encontradas.
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

app.listen(PORT, () => {
  console.log(`Sync Labs backend escuchando en http://localhost:${PORT}`);
});
