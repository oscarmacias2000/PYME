// Rutas y utilidades de autenticacion (JWT + bcrypt).
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { read, update } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-cambiame';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Datos publicos del usuario (nunca exponemos el hash).
function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    photo: u.photo || null,
    avatarColor: u.avatarColor || null,
    createdAt: u.createdAt,
  };
}

function sign(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
}

// Middleware: exige un Bearer token valido y adjunta req.user.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = read().users.find((u) => u.id === payload.sub);
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
}

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !name.trim()) return res.status(400).json({ error: 'Nombre requerido' });
  if (!EMAIL_RE.test(email || '')) return res.status(400).json({ error: 'Email no valido' });
  if (!password || password.length < 4)
    return res.status(400).json({ error: 'La contrasena debe tener al menos 4 caracteres' });

  const exists = read().users.some((u) => u.email === email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'Ese email ya esta registrado' });

  const user = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    createdAt: new Date().toISOString(),
  };
  update((db) => {
    db.users.push(user);
    return db;
  });

  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = read().users.find((u) => u.email === (email || '').toLowerCase());
  if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const ok = await bcrypt.compare(password || '', user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });

  res.json({ token: sign(user), user: publicUser(user) });
});

// GET /api/auth/me  (protegido)
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// PATCH /api/auth/me  (protegido): actualiza nombre, foto y color de avatar.
router.patch('/me', requireAuth, (req, res) => {
  const { name, photo, avatarColor } = req.body || {};
  if (name !== undefined && !String(name).trim())
    return res.status(400).json({ error: 'El nombre no puede estar vacio' });

  update((db) => {
    const u = db.users.find((x) => x.id === req.user.id);
    if (!u) return db;
    if (name !== undefined) u.name = String(name).trim();
    if (photo !== undefined) u.photo = photo || null;
    if (avatarColor !== undefined) u.avatarColor = avatarColor || null;
    return db;
  });

  const fresh = read().users.find((x) => x.id === req.user.id);
  res.json({ user: publicUser(fresh) });
});

export default router;
