// Almacen de datos simple en archivo JSON (sin base de datos externa).
// Suficiente para un backend pequeno; facil de migrar a Postgres despues.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DB_FILE = join(DATA_DIR, 'db.json');

const EMPTY = { users: [], messages: [] };

function ensure() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) writeFileSync(DB_FILE, JSON.stringify(EMPTY, null, 2));
}

export function read() {
  ensure();
  try {
    return JSON.parse(readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { ...EMPTY };
  }
}

export function write(data) {
  ensure();
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Actualiza el almacen con una funcion que recibe y devuelve el estado.
export function update(fn) {
  const data = read();
  const next = fn(data) || data;
  write(next);
  return next;
}
