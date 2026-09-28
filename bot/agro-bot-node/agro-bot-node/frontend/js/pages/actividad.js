// Logica de la pagina "Actividad en vivo" (antes vivia inline en public/actividad.html).

import { initToggleTema } from '../tema.js';
initToggleTema('btnTema');

const puntoEstado = document.getElementById('puntoEstado');
const textoEstado = document.getElementById('textoEstado');
const contPersonas = document.getElementById('listaPersonas');
const totalPersonas = document.getElementById('totalPersonas');

const socket = io();

function esc(v) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hace(iso) {
  const seg = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seg < 60) return 'hace ' + Math.max(seg, 0) + 's';
  if (seg < 3600) return 'hace ' + Math.round(seg / 60) + ' min';
  if (seg < 86400) return 'hace ' + Math.round(seg / 3600) + ' h';
  return 'hace ' + Math.round(seg / 86400) + ' d';
}

// Se presenta con el nombre que la persona escribio en "Tu nombre" en el bot. Es lo mas
// cercano a una identidad que hay: el login es uno solo compartido por todo el equipo.
function presentarse() {
  let nombre = '';
  try { nombre = localStorage.getItem('agro_bot_nombre') || ''; } catch (e) {}
  socket.emit('presentarse', { nombre, pagina: 'Actividad en vivo' });
}

socket.on('connect', () => {
  puntoEstado.className = 'w-2.5 h-2.5 rounded-full bg-green-500';
  textoEstado.textContent = 'Conectado \u2713';
  presentarse();
});
socket.on('disconnect', () => {
  puntoEstado.className = 'w-2.5 h-2.5 rounded-full bg-red-500';
  textoEstado.textContent = 'Desconectado';
});
socket.on('connect_error', (err) => {
  puntoEstado.className = 'w-2.5 h-2.5 rounded-full bg-amber-500';
  textoEstado.textContent = 'Error de conexion: ' + err.message;
});

// Quien esta usando la app ahora mismo. El servidor manda la lista completa cada vez
// que alguien entra o sale (ver services/socket.js).
socket.on('personas', (datos) => {
  if (!contPersonas) return;
  const personas = datos.personas || [];
  totalPersonas.textContent = datos.total === 1 ? '1 persona' : datos.total + ' personas';

  if (!personas.length) {
    contPersonas.innerHTML = '<p class="text-xs text-stone-400">Nadie conectado ahora mismo.</p>';
    return;
  }

  // Una persona puede tener varias pestañas abiertas: se agrupan por nombre para no
  // contar la misma persona tres veces en la lista visible.
  const porNombre = new Map();
  personas.forEach((p) => {
    const clave = p.nombre + '|' + p.ip;
    if (!porNombre.has(clave)) porNombre.set(clave, { ...p, pestanas: 0, paginas: new Set() });
    const g = porNombre.get(clave);
    g.pestanas += 1;
    if (p.pagina) g.paginas.add(p.pagina);
    if (new Date(p.desde) < new Date(g.desde)) g.desde = p.desde;
  });

  contPersonas.innerHTML = [...porNombre.values()].map((p) => (
    '<div class="border border-stone-100 rounded-2xl p-3 flex items-start justify-between gap-3 flex-wrap">' +
      '<div class="min-w-0">' +
        '<p class="font-semibold text-sm text-stone-800 truncate">' + esc(p.nombre) + '</p>' +
        '<p class="text-xs text-stone-400">' + esc(p.dispositivo) + ' &middot; ' + esc(p.ip) + '</p>' +
        (p.paginas.size ? '<p class="text-[11px] text-stone-400 mt-0.5">En: ' + esc([...p.paginas].join(', ')) + '</p>' : '') +
      '</div>' +
      '<div class="text-right shrink-0">' +
        '<span class="inline-block text-[11px] font-semibold rounded-full border border-green-200 bg-green-50 text-green-700 px-2 py-0.5">en linea</span>' +
        '<p class="text-[11px] text-stone-400 mt-1">Entro ' + esc(hace(p.desde)) + '</p>' +
        (p.pestanas > 1 ? '<p class="text-[11px] text-stone-400">' + p.pestanas + ' pestanas</p>' : '') +
      '</div>' +
    '</div>'
  )).join('');
});

// Señal de vida cada minuto, para que "ultima señal" refleje quien sigue realmente ahi.
setInterval(() => socket.emit('sigo-aqui'), 60000);
