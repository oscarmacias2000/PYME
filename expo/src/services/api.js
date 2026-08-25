import { storage } from './storage';

// URL base del backend. En desarrollo apunta a localhost:3000; en produccion
// define EXPO_PUBLIC_API_URL (p. ej. https://api.TUSUB.duckdns.org).
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const TOKEN_KEY = 'synclabs_token';

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = await storage.get(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

export const api = {
  saveToken: (t) => storage.set(TOKEN_KEY, t),
  clearToken: () => storage.del(TOKEN_KEY),
  getToken: () => storage.get(TOKEN_KEY),

  register: (body) => request('/api/auth/register', { method: 'POST', body }),
  login: (body) => request('/api/auth/login', { method: 'POST', body }),
  me: () => request('/api/auth/me', { auth: true }),
  updateProfile: (body) =>
    request('/api/auth/me', { method: 'PATCH', body, auth: true }),
  contact: (body) => request('/api/contact', { method: 'POST', body }),
  services: () => request('/api/services'),
  docs: () => request('/api/docs'),
};
