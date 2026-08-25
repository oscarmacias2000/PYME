// Ruta del formulario de contacto: guarda el mensaje en el almacen.
import { Router } from 'express';

import { read, update } from './db.js';
import { requireAuth } from './auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const router = Router();

// POST /api/contact  (publico)
router.post('/', (req, res) => {
  const { nombre, email, mensaje } = req.body || {};
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'Nombre requerido' });
  if (!EMAIL_RE.test(email || '')) return res.status(400).json({ error: 'Email no valido' });
  if (!mensaje || mensaje.trim().length < 10)
    return res.status(400).json({ error: 'El mensaje es demasiado corto' });

  const message = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    nombre: nombre.trim(),
    email: email.toLowerCase(),
    mensaje: mensaje.trim(),
    createdAt: new Date().toISOString(),
  };
  update((db) => {
    db.messages.push(message);
    return db;
  });

  // Aqui podrias enviar un correo/notificacion (n8n, SMTP, etc.).
  res.status(201).json({ ok: true, id: message.id });
});

// GET /api/contact  (protegido: listar mensajes recibidos)
router.get('/', requireAuth, (req, res) => {
  res.json({ messages: read().messages });
});

export default router;
