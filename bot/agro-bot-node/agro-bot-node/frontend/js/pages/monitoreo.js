// Panel de monitoreo de los modelos de IA (ver src/public/monitoreo.html y
// src/routes/monitoreo.js). Nada de dependencias nuevas: JS plano + las clases de
// Tailwind que ya usa el resto del proyecto.

import { initToggleTema } from '../tema.js';
initToggleTema('btnTema');

function esc(v) {
  return String(v === undefined || v === null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hace(iso) {
  if (!iso) return 'nunca';
  const seg = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seg < 60) return 'hace ' + seg + 's';
  if (seg < 3600) return 'hace ' + Math.round(seg / 60) + ' min';
  if (seg < 86400) return 'hace ' + Math.round(seg / 3600) + ' h';
  return 'hace ' + Math.round(seg / 86400) + ' d';
}

function duracion(seg) {
  if (seg < 60) return seg + 's';
  if (seg < 3600) return Math.floor(seg / 60) + ' min';
  if (seg < 86400) return Math.floor(seg / 3600) + ' h ' + Math.floor((seg % 3600) / 60) + ' min';
  return Math.floor(seg / 86400) + ' d ' + Math.floor((seg % 86400) / 3600) + ' h';
}

function pastilla(texto, tono) {
  const tonos = {
    ok: 'bg-green-50 text-green-700 border-green-200',
    mal: 'bg-red-50 text-red-700 border-red-200',
    tibio: 'bg-amber-50 text-amber-800 border-amber-200',
    gris: 'bg-stone-50 text-stone-500 border-stone-200',
  };
  return '<span class="inline-block text-[11px] font-semibold rounded-full border px-2 py-0.5 ' +
    (tonos[tono] || tonos.gris) + '">' + esc(texto) + '</span>';
}

// --- Configuracion + contadores ---

async function cargarDatos() {
  try {
    const data = await fetch('/monitoreo/datos').then((r) => r.json());
    if (!data.ok) return;

    document.getElementById('uptime').textContent =
      'Servidor arriba desde hace ' + duracion(data.uptimeSegundos);

    document.getElementById('configurados').innerHTML = data.configurados.map((c) => {
      const usos = [];
      if (c.activo) usos.push('texto');
      if (c.usoAudio) usos.push('audio');
      return '<div data-tarjeta-modelo class="border border-stone-100 rounded-2xl p-3 ' +
          (c.activo ? 'bg-green-50/40 border-green-200' : 'bg-stone-50') + '">' +
        '<div class="flex items-center justify-between gap-2 flex-wrap">' +
          '<div class="min-w-0">' +
            '<p class="font-semibold text-sm text-stone-800 truncate">' + esc(c.modelo) + '</p>' +
            '<p class="text-xs text-stone-400">' + esc(c.proveedor) + '</p>' +
          '</div>' +
          '<div class="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">' +
            (usos.length ? pastilla('en uso: ' + usos.join(' + '), 'ok') : pastilla('inactivo', 'gris')) +
            (c.llave.presente
              ? pastilla('llave ' + c.llave.pista + ' (' + c.llave.longitud + ')', 'gris')
              : pastilla('SIN API KEY', 'mal')) +
            (c.llave.presente
              ? '<button type="button" class="btnProbar btn-tactile text-[11px] font-semibold rounded-full border border-stone-300 bg-white hover:bg-stone-100 px-3 py-1 transition" data-proveedor="' + esc(c.proveedor) + '">Probar</button>'
              : '') +
          '</div>' +
        '</div>' +
        '<div class="resultadoProbar mt-2" hidden></div>' +
      '</div>';
    }).join('');

    document.querySelectorAll('.btnProbar').forEach((btn) => {
      btn.addEventListener('click', () => probarProveedor(btn));
    });

    const cont = document.getElementById('contadores');
    if (!data.modelos.length) {
      cont.innerHTML = '<p class="text-xs text-stone-400">Todavia no se ha llamado a ningun modelo desde que arranco el servidor.</p>';
      return;
    }

    cont.innerHTML = data.modelos.map((m) => {
      const tono = m.tasaExito === null ? 'gris' : (m.tasaExito >= 95 ? 'ok' : (m.tasaExito >= 70 ? 'tibio' : 'mal'));
      const estados = Object.entries(m.porEstado || {});
      return '<div class="border border-stone-100 rounded-2xl p-3 mb-2">' +
        '<div class="flex items-center justify-between gap-2 flex-wrap mb-2">' +
          '<p class="font-semibold text-sm text-stone-800 truncate min-w-0">' + esc(m.modelo) + '</p>' +
          pastilla(m.tasaExito + '% exito', tono) +
        '</div>' +
        '<div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">' +
          tile('Llamadas', m.llamadas) +
          tile('Errores', m.errores) +
          tile('Latencia prom.', m.latenciaPromedioMs !== null ? m.latenciaPromedioMs + ' ms' : '—') +
          tile('Latencia max.', m.latenciaMaxMs !== null ? m.latenciaMaxMs + ' ms' : '—') +
        '</div>' +
        (estados.length
          ? '<p class="text-[11px] text-stone-500 mt-2">Errores por codigo: ' +
            estados.map(([k, v]) => '<span class="font-semibold">' + esc(k) + '</span>&times;' + v).join(', ') + '</p>'
          : '') +
        '<p class="text-[11px] text-stone-400 mt-1">Ultima respuesta buena: ' + hace(m.ultimoOk) + '</p>' +
        (m.ultimoError
          ? '<p class="text-[11px] text-red-600 mt-1 break-words">Ultimo error (' + esc(m.ultimoError.estado) + ', ' +
            hace(m.ultimoError.ts) + '): ' + esc(m.ultimoError.mensaje) + '</p>'
          : '') +
      '</div>';
    }).join('');
  } catch (e) {
    document.getElementById('contadores').innerHTML =
      '<p class="text-xs text-red-500">No se pudieron cargar los datos: ' + esc(e.message) + '</p>';
  }
}

// Prueba un proveedor concreto. Desde que se puede elegir modelo en el compositor,
// "¿responde?" dejo de ser una sola pregunta -- cada proveedor tiene su llave y su cuota.
async function probarProveedor(btn) {
  const proveedor = btn.dataset.proveedor;
  const caja = btn.closest('[data-tarjeta-modelo]').querySelector('.resultadoProbar');
  const textoOriginal = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Probando...';
  caja.hidden = false;
  caja.innerHTML = '<div class="skeleton-line w-1/2"></div>';
  try {
    const r = await fetch('/monitoreo/ping?proveedor=' + encodeURIComponent(proveedor)).then((x) => x.json());
    caja.innerHTML = r.ok
      ? '<p class="text-xs text-green-700"><span class="font-semibold">Responde</span> &middot; ' + r.ms + ' ms &middot; contesto: "' + esc(r.respuesta) + '"</p>'
      : '<p class="text-xs text-red-600 break-words"><span class="font-semibold">No responde (' + esc(r.estado) + ')</span>: ' + esc(r.mensaje) + '</p>';
  } catch (e) {
    caja.innerHTML = '<p class="text-xs text-red-500">Error: ' + esc(e.message) + '</p>';
  } finally {
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
}

function tile(etiqueta, valor) {
  return '<div class="bg-stone-50 rounded-xl py-2">' +
    '<p class="text-sm font-bold text-stone-800">' + esc(valor) + '</p>' +
    '<p class="text-[10px] text-stone-400 uppercase tracking-wide">' + esc(etiqueta) + '</p>' +
  '</div>';
}

// --- Ping en vivo ---

document.getElementById('btnPing').addEventListener('click', async () => {
  const btn = document.getElementById('btnPing');
  const caja = document.getElementById('resultadoPing');
  btn.disabled = true;
  const textoOriginal = btn.textContent;
  btn.textContent = 'Probando...';
  caja.hidden = false;
  caja.innerHTML = '<div class="space-y-1.5"><div class="skeleton-line w-2/3"></div><div class="skeleton-line w-1/3"></div></div>';

  try {
    const r = await fetch('/monitoreo/ping').then((x) => x.json());
    caja.innerHTML = r.ok
      ? '<div class="rounded-2xl border border-green-200 bg-green-50 p-3">' +
          '<p class="text-sm font-semibold text-green-800">Responde correctamente</p>' +
          '<p class="text-xs text-green-800/80 mt-1">Modelo <span class="font-semibold">' + esc(r.modelo) + '</span> &middot; ' + r.ms + ' ms</p>' +
          '<p class="text-xs text-green-800/70 mt-1">Contesto: "' + esc(r.respuesta) + '"</p>' +
        '</div>'
      : '<div class="rounded-2xl border border-red-200 bg-red-50 p-3">' +
          '<p class="text-sm font-semibold text-red-700">No responde (' + esc(r.estado) + ')</p>' +
          '<p class="text-xs text-red-700/90 mt-1 break-words">' + esc(r.mensaje) + '</p>' +
          (String(r.estado) === '403' || r.estado === 'sin-llave'
            ? '<p class="text-xs text-red-700/70 mt-2">Pista: esto casi siempre es la API key vacia (el .env no cargo), no un permiso de Google.</p>'
            : '') +
        '</div>';
    cargarDatos();
  } catch (e) {
    caja.innerHTML = '<p class="text-xs text-red-500">Error: ' + esc(e.message) + '</p>';
  } finally {
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
});

// --- Modelos disponibles ---

document.getElementById('btnModelos').addEventListener('click', async () => {
  const btn = document.getElementById('btnModelos');
  const caja = document.getElementById('listaModelos');
  btn.disabled = true;
  caja.hidden = false;
  caja.innerHTML = '<div class="space-y-1.5"><div class="skeleton-line w-1/2"></div><div class="skeleton-line w-2/3"></div></div>';

  try {
    const r = await fetch('/monitoreo/modelos').then((x) => x.json());
    if (!r.ok) {
      caja.innerHTML = '<div class="rounded-2xl border border-red-200 bg-red-50 p-3">' +
        '<p class="text-xs text-red-700 break-words">' + esc(r.mensaje) + '</p></div>';
      return;
    }
    caja.innerHTML =
      '<div class="rounded-2xl border ' + (r.configuradoDisponible ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50') + ' p-3 mb-3">' +
        '<p class="text-sm font-semibold ' + (r.configuradoDisponible ? 'text-green-800' : 'text-red-700') + '">' +
          esc(r.configurado) + (r.configuradoDisponible ? ' esta disponible' : ' NO aparece en la lista') +
        '</p>' +
        (r.configuradoDisponible ? '' : '<p class="text-xs text-red-700/80 mt-1">Cambia GEMINI_MODEL en el .env por uno de los de abajo.</p>') +
      '</div>' +
      '<div class="flex flex-wrap gap-1.5">' +
        r.modelos.map((m) => '<span class="text-[11px] rounded-full border px-2 py-0.5 ' +
          (m === r.configurado ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 text-stone-600 border-stone-200') +
          '">' + esc(m) + '</span>').join('') +
      '</div>';
  } catch (e) {
    caja.innerHTML = '<p class="text-xs text-red-500">Error: ' + esc(e.message) + '</p>';
  } finally {
    btn.disabled = false;
  }
});

cargarDatos();
setInterval(cargarDatos, 15000); // refresco suave; no llama a los modelos, solo lee contadores
