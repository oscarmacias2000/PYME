// Logica de la pagina principal del bot (antes vivia inline en public/index.html).
// Se mueve tal cual a un modulo para poder empaquetarla con Webpack + Babel -- el
// comportamiento es identico al de antes, nada mas se movio de lugar.

import { initToggleTema } from '../tema.js';
initToggleTema('btnTema');

const baseUrl = window.location.origin;
const mensajeUrl = baseUrl + '/bot-web-mensaje';
const guardarUrl = baseUrl + '/bot-web-guardar';
const enviarUrl = baseUrl + '/bot-web-enviar';
const historialUrl = baseUrl + '/bot-web-historial';

// --- Perfil / sesion ---
(async () => {
  try {
    const res = await fetch('/perfil');
    if (res.status === 401) { window.location.href = '/login'; return; }
    const data = await res.json();
    if (data.ok) {
      document.getElementById('nombrePerfil').textContent = data.nombre || data.usuario;
      // El enlace a la administracion de usuarios solo tiene sentido si el bot ya usa
      // cuentas individuales Y quien mira es administrador.
      const enlaceUsuarios = document.getElementById('enlaceUsuarios');
      if (enlaceUsuarios && data.multiusuario && data.rol === 'admin') enlaceUsuarios.hidden = false;
      document.getElementById('avatarPerfil').textContent = (data.usuario || '?').charAt(0).toUpperCase();
    }
  } catch (e) { /* si falla, se queda el "..." -- no es critico para usar la pagina */
  } finally {
    // Quita el splash de carga (logo + skeleton) una vez que ya sabemos si hay sesion
    // o no -- si nos vamos a /login la pagina va a navegar de todos modos. Se le agregan
    // 2s extra de margen antes de empezar a desvanecerlo (antes desaparecia apenas
    // respondia /perfil, casi instantaneo, y el skeleton casi ni se alcanzaba a ver).
    const splash = document.getElementById('splashCarga');
    if (splash) {
      setTimeout(() => {
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 250);
      }, 2000);
    }
  }
})();

document.getElementById('btnPerfil').addEventListener('click', () => {
  document.getElementById('menuPerfil').hidden = !document.getElementById('menuPerfil').hidden;
  document.getElementById('menuDocumentos').hidden = true;
});

// --- Documentos: Excel/PDF de tus Google Sheets (ver routes/botWeb.js -> GET /documentos) ---
async function cargarDocumentos() {
  const cont = document.getElementById('listaDocumentos');
  try {
    const res = await fetch('/documentos');
    const data = await res.json();
    if (!data.ok || !data.documentos || !data.documentos.length) {
      cont.innerHTML = '<p class="text-xs text-stone-400 px-2">No hay documentos configurados.</p>';
      return;
    }
    cont.innerHTML = data.documentos.map((doc) => `
      <div class="px-2 py-1.5" data-doc-id="${doc.id || ''}">
        <p class="text-xs font-semibold text-stone-700 mb-1.5">${doc.nombre}</p>
        <div class="flex gap-1">
          <a href="${doc.ver}" target="_blank" rel="noopener" class="flex-1 flex items-center justify-center gap-1 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-full py-1.5 text-xs transition">
            <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>
            Ver
          </a>
          <button type="button" class="btnExcelHojas flex-1 flex items-center justify-center gap-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-full py-1.5 text-xs transition">
            <img src="/img/excel.webp" alt="" class="w-3.5 h-3.5 shrink-0">
            Excel
            <span class="text-[10px]">&#9662;</span>
          </button>
          <a href="${doc.pdf}" target="_blank" rel="noopener" class="flex-1 flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-full py-1.5 text-xs transition">
            <img src="/img/pdf.svg" alt="" class="w-3.5 h-3.5 shrink-0">
            PDF
          </a>
        </div>
        <div class="listaHojas mt-1.5 border border-stone-100 rounded-2xl p-1 bg-stone-50" hidden></div>
      </div>
    `).join('');

    // Excel ya no descarga directo: primero pregunta QUE hoja. Google exporta siempre el
    // libro completo en xlsx, asi que la hoja suelta la arma el backend (ver
    // /documentos/descargar en routes/botWeb.js).
    cont.querySelectorAll('.btnExcelHojas').forEach((btn) => {
      btn.addEventListener('click', () => {
        const caja = btn.closest('[data-doc-id]');
        const panel = caja.querySelector('.listaHojas');
        if (!panel.hidden) { panel.hidden = true; return; }
        panel.hidden = false;
        mostrarHojasDelDocumento(caja.dataset.docId, panel, data.documentos.find((d) => d.id === caja.dataset.docId));
      });
    });
  } catch (e) {
    cont.innerHTML = '<p class="text-xs text-red-500 px-2">Error: ' + e.message + '</p>';
  }
}

// Pinta la lista de pestañas de un documento dentro del menu de Documentos. Se pide al
// vuelo (no al cargar el menu) para no gastar una llamada a la API de Google por cada
// documento cada vez que se abre el menu.
async function mostrarHojasDelDocumento(id, panel, doc) {
  panel.innerHTML = '<div class="px-2 py-1.5 space-y-1.5"><div class="skeleton-line w-2/3"></div><div class="skeleton-line w-1/2"></div></div>';
  try {
    const res = await fetch('/documentos/hojas?id=' + encodeURIComponent(id));
    const data = await res.json();
    if (!data.ok) {
      panel.innerHTML = '<p class="text-[11px] text-red-500 px-2 py-1">' + (data.mensaje || 'No se pudieron leer las hojas.') + '</p>';
      return;
    }
    const filas = data.hojas.map((h) => `
      <div class="flex items-center gap-1">
        <a href="/documentos/descargar?id=${encodeURIComponent(id)}&tab=${encodeURIComponent(h.titulo)}&formato=xlsx"
           class="flex-1 min-w-0 truncate text-left text-[11px] text-stone-700 hover:bg-white rounded-full px-2.5 py-1.5 transition" title="Descargar &quot;${h.titulo}&quot; como Excel">
          ${h.titulo}
        </a>
        <a href="/documentos/descargar?id=${encodeURIComponent(id)}&tab=${encodeURIComponent(h.titulo)}&formato=csv"
           class="shrink-0 text-[10px] text-stone-400 hover:text-stone-700 rounded-full px-2 py-1.5 transition" title="Descargar como CSV">CSV</a>
      </div>
    `).join('');
    panel.innerHTML =
      '<p class="text-[10px] font-semibold text-stone-400 uppercase tracking-wide px-2 pt-1 pb-1">Descargar una hoja</p>' +
      filas +
      (doc && doc.excel
        ? '<div class="border-t border-stone-200 mt-1 pt-1">' +
          '<a href="' + doc.excel + '" target="_blank" rel="noopener" class="block text-[11px] text-stone-500 hover:bg-white rounded-full px-2.5 py-1.5 transition">Todo el archivo (todas las hojas)</a>' +
          '</div>'
        : '');
  } catch (e) {
    panel.innerHTML = '<p class="text-[11px] text-red-500 px-2 py-1">Error: ' + e.message + '</p>';
  }
}
cargarDocumentos();

document.getElementById('btnDocumentos').addEventListener('click', () => {
  document.getElementById('menuDocumentos').hidden = !document.getElementById('menuDocumentos').hidden;
  document.getElementById('menuPerfil').hidden = true;
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('#btnDocumentos') && !e.target.closest('#menuDocumentos')) {
    document.getElementById('menuDocumentos').hidden = true;
  }
});

// --- Foto de perfil (unica y compartida, ver comentario en routes/auth.js) ---
const avatarPerfil = document.getElementById('avatarPerfil');
const avatarFoto = document.getElementById('avatarFoto');
// Si /img/perfil.jpg no existe todavia (nadie ha subido foto), el <img> tira error y se
// queda el circulo con la inicial -- si carga bien, se muestra la foto en su lugar.
avatarFoto.addEventListener('load', () => { avatarFoto.hidden = false; avatarPerfil.hidden = true; });
avatarFoto.addEventListener('error', () => { avatarFoto.hidden = true; avatarPerfil.hidden = false; });

// Recorta la imagen a cuadro (desde el centro) y la comprime a JPEG en el navegador --
// asi no importa si suben un PNG/HEIC/lo-que-sea gigante, siempre se manda liviano y en
// un formato que el servidor puede guardar tal cual (ver POST /perfil-foto).
function recortarYComprimirFoto(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const TAMANO = 256;
      const canvas = document.createElement('canvas');
      canvas.width = TAMANO;
      canvas.height = TAMANO;
      const ctx = canvas.getContext('2d');
      const lado = Math.min(img.width, img.height);
      const sx = (img.width - lado) / 2;
      const sy = (img.height - lado) / 2;
      ctx.drawImage(img, sx, sy, lado, lado, 0, 0, TAMANO, TAMANO);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen.')); };
    img.src = url;
  });
}

const inputFotoPerfil = document.getElementById('inputFotoPerfil');
document.getElementById('btnCambiarFoto').addEventListener('click', () => {
  document.getElementById('menuPerfil').hidden = true;
  inputFotoPerfil.click();
});
inputFotoPerfil.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const dataUrl = await recortarYComprimirFoto(file);
    const res = await fetch('/perfil-foto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ foto_base64: dataUrl.split(',')[1] }),
    });
    const data = await res.json();
    if (!data.ok) { alert(data.mensaje || 'No se pudo guardar la foto.'); return; }
    avatarFoto.src = dataUrl;
    avatarFoto.hidden = false;
    avatarPerfil.hidden = true;
  } catch (err) {
    alert('No se pudo procesar la imagen: ' + err.message);
  }
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('#btnPerfil') && !e.target.closest('#menuPerfil')) {
    document.getElementById('menuPerfil').hidden = true;
  }
});
document.getElementById('btnCerrarSesion').addEventListener('click', async () => {
  try { await fetch('/logout', { method: 'POST' }); } catch (e) {}
  window.location.href = '/login';
});

const NOMBRES_TABLA = {
  reporte_campo: 'Rendimiento Diario Jornal',
  actividades_diarias: 'Actividades Diarias',
  maquinaria: 'Maquinaria',
  insumos: 'Insumos',
  catalogos: 'Catálogos',
  resumen_semanal: 'Resumen Semanal',
  resumen_dia: 'Resumen del Día',
};
// Estas son de solo lectura -- no tienen "campos" que llenar para agregar un
// registro nuevo, solo se pueden preguntar/consultar (ver actualizarDisponibilidadModo).
// "resumen_semanal" YA NO esta aqui -- ahora se puede capturar a mano (ver Captura
// rapida), sobreescribiendo el mismo bloque de resumen que llena el cron automatico.
const TABLAS_SOLO_LECTURA = ['catalogos', 'resumen_dia'];

const CAMPOS_REPORTE_CAMPO = [
  ['Fecha','Fecha'], ['Actividad','Actividad'], ['Ubicacion','Ubicacion'], ['Huerta','Huerta'],
  ['Responsable','Responsable'], ['NumeroDePersonas','N de personas'], ['CantidadRealizada','Cantidad realizada'],
  ['UnidadDeMedida','Unidad de medida'], ['MetaDeRendimiento','Meta de rendimiento'], ['Incidencia','Incidencia (Si/No)'],
  ['MotivoDeIncidencia','Motivo de incidencia'], ['Observaciones','Observaciones']
];
const CAMPOS_ACTIVIDADES = [
  ['Fecha','Fecha'], ['Campo','Campo'], ['Lote','Lote'], ['Actividad','Actividad'], ['Responsable','Responsable'],
  ['NumeroJornaleros','N de jornaleros'], ['ProcedenciaCuadrilla','Procedencia / cuadrilla'],
  ['RecursosMaquinaria','Recursos / maquinaria'], ['CostoPorJornal','Costo por jornal'], ['NominaTotal','Nomina total'],
  ['Observaciones','Observaciones']
];
// OJO: estos campos deben ser EXACTAMENTE los que sheets.js (CAMPOS_A_COLUMNAS_MAQUINARIA)
// sabe mapear a columnas reales de la hoja 'Maquinaria' del archivo 4.1 -- esa hoja tiene
// columnas de formula (Horometro anterior, Horas trabajadas, Consumo real, Costo real/hora,
// Consumo prom., Estatus/Alerta, Costo Total) intercaladas entre las de captura manual, asi
// que aqui NO se pide "Horas" ni "CostoTotal" (se calculan solos en la hoja a partir de
// Horometro actual y Precio Diesel) -- en su lugar se captura el dato crudo real.
const CAMPOS_MAQUINARIA = [
  ['Fecha','Fecha'], ['Equipo','Equipo'], ['Implemento','Implemento'], ['TipoCombustible','Tipo de combustible'],
  ['Actividad','Actividad'], ['Ubicacion','Ubicacion'], ['Huerta','Huerta'], ['Responsable','Responsable (operador)'],
  ['Litros','Litros cargados'], ['TanqueLleno','¿Tanque lleno? (Si/No)'], ['HorometroActual','Horometro actual'],
  ['PrecioDiesel','Precio diesel ($/L)'], ['AvanceRendimiento','Avance (ha)'], ['Observaciones','Observaciones']
];
// OJO: "Costo total" ya NO se pide aqui -- en la hoja real 'Insumos' esa columna es una
// formula (Cantidad x Costo por Unidad, ver sheets.js/CAMPOS_A_COLUMNAS_INSUMOS), asi que
// pedirsela al usuario y guardarla pisaria la formula. Se quito de este arreglo para que
// coincida con lo que sheets.js realmente escribe.
const CAMPOS_INSUMOS = [
  ['Fecha','Fecha'], ['RecursoInsumo','Recurso / insumo'], ['Cantidad','Cantidad'], ['UnidadDeMedida','Unidad de medida'],
  ['MotivoDeUso','Motivo de uso'], ['Actividad','Actividad'], ['Huerta','Huerta'], ['CostoPorUnidad','Costo por unidad'],
  ['Responsable','Responsable']
];
// "Resumen Semanal" no es una fila que se agrega -- es el mismo bloque de tamaño fijo
// (Semana del/Al + 6 numeros) que llena solo el cron automatico cada domingo (ver
// src/cron/resumenSemanal.js). Capturarlo aqui sobreescribe ese mismo bloque a mano,
// tanto en Google Sheets como en el archivo local excel/Reporte_campo 4.1.xlsx (ver
// src/lib/guardarRegistro.js). CostoTotalSemana se puede dejar en blanco -- si no se
// escribe, el backend lo calcula solo (combustible + insumos), igual que el automatico.
const CAMPOS_RESUMEN_SEMANAL = [
  ['FechaDesde','Semana del'], ['FechaHasta','Al'],
  ['LitrosTotales','Litros totales cargados'], ['CostoCombustible','Costo total de combustible'],
  ['RegistrosActividad','Registros de actividad capturados'], ['IncidenciasReportadas','Incidencias reportadas'],
  ['CostoInsumos','Costo total de insumos'], ['CostoTotalSemana','Costo total de la semana (opcional)'],
];

const CAMPOS_POR_TABLA = {
  reporte_campo: CAMPOS_REPORTE_CAMPO,
  actividades_diarias: CAMPOS_ACTIVIDADES,
  maquinaria: CAMPOS_MAQUINARIA,
  insumos: CAMPOS_INSUMOS,
  resumen_semanal: CAMPOS_RESUMEN_SEMANAL,
};

// Tablas que se pueden llenar desde "Captura rapida" (formulario en blanco, guardado
// directo). Rendimiento Diario Jornal/Maquinaria/Insumos comparten ademas la pestaña real
// "Catálogos" del archivo 4.1 (huertas, equipos, actividades, responsables, etc.);
// Resumen Semanal no usa catalogo (todos sus campos son fecha/numero libres) pero encaja
// igual en este mismo formulario en blanco. Actividades Diarias vive en otro Google Sheet
// sin catalogo compartido, asi que se queda fuera.
const TABLAS_CAPTURA_RAPIDA = ['reporte_campo', 'maquinaria', 'insumos', 'resumen_semanal'];

// Tablas que ademas de "Guardar" muestran el boton "Enviar por correo" -- las 3 que
// viven en el archivo 4.1 (Rendimiento Diario Jornal, Insumos, Resumen Semanal). Se deja
// fuera Maquinaria porque no se pidio, y Actividades Diarias porque vive en otra hoja.
const TABLAS_CON_ENVIAR = ['reporte_campo', 'insumos', 'resumen_semanal'];

const OPCIONES_SI_NO = ['Si', 'No'];

// Campo (por tabla) -> de donde saca sus opciones: un string es una llave de
// catalogosCache (ver cargarCatalogos), un arreglo es una lista fija (Si/No).
// IMPORTANTE: "Responsable" no es el mismo catalogo en todas las tablas -- en Maquinaria
// e Insumos el responsable real es quien opera/carga (catalogo "Operadores"), mientras
// que en Rendimiento Diario Jornal es el ingeniero a cargo (catalogo "Responsables");
// se verifico contra datos reales de la hoja antes de mapear esto.
const CATALOGO_POR_CAMPO = {
  reporte_campo: {
    Actividad: 'actividades', Ubicacion: 'ubicaciones', Huerta: 'huertas', Responsable: 'responsables',
    Incidencia: OPCIONES_SI_NO, MotivoDeIncidencia: 'motivosIncidencia',
  },
  maquinaria: {
    Equipo: 'equipos', Implemento: 'implementos', TipoCombustible: 'tiposCombustible',
    Actividad: 'actividades', Ubicacion: 'ubicaciones', Huerta: 'huertas', Responsable: 'operadores',
    TanqueLleno: OPCIONES_SI_NO,
  },
  insumos: {
    Actividad: 'actividades', Huerta: 'huertas', Responsable: 'operadores',
  },
};

// Campos numericos -- solo se les pone type="number" en la Captura rapida (formulario en
// blanco, sin datos de IA de por medio); el formulario de revision de arriba se deja tal
// cual (texto) para no arriesgar nada con valores que la IA ya haya llenado distinto.
const CAMPOS_NUMERICOS = new Set([
  'NumeroDePersonas', 'CantidadRealizada', 'MetaDeRendimiento',
  'Litros', 'HorometroActual', 'PrecioDiesel', 'AvanceRendimiento',
  'Cantidad', 'CostoPorUnidad',
  'LitrosTotales', 'CostoCombustible', 'RegistrosActividad', 'IncidenciasReportadas',
  'CostoInsumos', 'CostoTotalSemana',
]);

// Campos de tipo fecha (ademas del generico "Fecha") -- Resumen Semanal usa un rango
// (Semana del / Al) en vez de una fecha unica.
const CAMPOS_FECHA = new Set(['Fecha', 'FechaDesde', 'FechaHasta']);

let catalogosCache = null; // se llena con /catalogos-datos (ver cargarCatalogos)

async function cargarCatalogos() {
  try {
    const res = await fetch('/catalogos-datos');
    const data = await res.json();
    if (data.ok) {
      catalogosCache = data.catalogos;
      // Si la Captura rapida ya estaba abierta cuando esto termino de cargar, se vuelve a
      // pintar para que los campos con catalogo pasen de texto libre a desplegable sin
      // que el usuario tenga que cerrarla y abrirla de nuevo.
      if (typeof panelCapturaRapida !== 'undefined' && panelCapturaRapida && !panelCapturaRapida.hidden) {
        renderCamposRapidos(tablaSeleccionada);
      }
    }
  } catch (e) {
    // Si falla, los campos con catalogo simplemente se quedan como texto libre (ver
    // crearCampoElemento) -- no bloquea el resto de la pagina.
  }
}
cargarCatalogos();

// Crea el <label> + <input>/<select> de un campo. Usa una lista desplegable del catalogo
// real cuando el campo/tabla la tiene mapeada (CATALOGO_POR_CAMPO) y ya cargo
// (catalogosCache); si no, cae de vuelta a una caja de texto libre (o type="date" para
// Fecha, o type="number" para campos numericos en modo Captura rapida) igual que antes.
function crearCampoElemento(clave, etiqueta, tabla, valorActual, opts = {}) {
  const wrap = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = etiqueta;
  label.className = 'block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1';
  wrap.appendChild(label);

  const claseCampo = 'w-full border border-stone-200 rounded-full px-4 py-2.5 text-sm bg-stone-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white';
  const opciones = CATALOGO_POR_CAMPO[tabla]?.[clave];
  const lista = Array.isArray(opciones) ? opciones : (opciones && catalogosCache ? catalogosCache[opciones] : null);

  let campo;
  if (lista && lista.length) {
    campo = document.createElement('select');
    campo.className = claseCampo;
    const vacia = document.createElement('option');
    vacia.value = '';
    vacia.textContent = 'Selecciona...';
    campo.appendChild(vacia);
    let hayMatch = false;
    lista.forEach((valorLista) => {
      const opt = document.createElement('option');
      // OJO: el value se deja EXACTO como viene del catalogo (sin recortar espacios) --
      // asi sigue haciendo match con filas viejas y con las formulas de LOOKUP de la hoja
      // real, que comparan el texto igual-a-igual. Solo la etiqueta visible se recorta.
      opt.value = valorLista;
      opt.textContent = String(valorLista).trim();
      if (valorActual && String(valorActual).trim() === String(valorLista).trim()) {
        opt.selected = true;
        hayMatch = true;
      }
      campo.appendChild(opt);
    });
    // Si el valor actual no esta en el catalogo (dato viejo, error de captura, etc.), se
    // agrega como opcion extra para no perderlo silenciosamente al abrir el formulario.
    if (valorActual && !hayMatch) {
      const opt = document.createElement('option');
      opt.value = valorActual;
      opt.textContent = valorActual + ' (no esta en el catalogo)';
      opt.selected = true;
      campo.appendChild(opt);
    }
  } else if (CAMPOS_FECHA.has(clave)) {
    campo = document.createElement('input');
    campo.type = 'date';
    campo.className = claseCampo;
    campo.value = valorActual || '';
  } else {
    campo = document.createElement('input');
    campo.type = (opts.rapido && CAMPOS_NUMERICOS.has(clave)) ? 'number' : 'text';
    if (campo.type === 'number') { campo.step = 'any'; campo.min = '0'; }
    if (opts.placeholder) campo.placeholder = opts.placeholder;
    campo.className = claseCampo;
    campo.value = (valorActual !== undefined && valorActual !== null) ? valorActual : '';
  }
  campo.dataset.clave = clave;
  wrap.appendChild(campo);
  return wrap;
}

const estado = document.getElementById('estado');
const capturaCard = document.getElementById('captura');
const previewCard = document.getElementById('preview');
const camposDiv = document.getElementById('campos');
const previewTablaTexto = document.getElementById('previewTablaTexto');
const nombreInput = document.getElementById('nombre');
const tituloMensaje = document.getElementById('tituloMensaje');
const textoInput = document.getElementById('texto');
const btnTexto = document.getElementById('btnTexto');

try {
  const guardado = localStorage.getItem('agro_bot_nombre');
  if (guardado) nombreInput.value = guardado;
} catch (e) {}
nombreInput.addEventListener('change', () => {
  try { localStorage.setItem('agro_bot_nombre', nombreInput.value); } catch (e) {}
});

function mostrar(clase, texto) {
  estado.hidden = false;
  const base = 'mt-4 rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap flex items-center gap-2';
  const estilos = {
    ok: base + ' bg-green-50 text-green-800 border border-green-200',
    err: base + ' bg-red-50 text-red-700 border border-red-200',
    wait: base + ' bg-amber-50 text-amber-800 border border-amber-200',
  };
  estado.className = estilos[clase] || base;
  estado.innerHTML = '';
  if (clase === 'wait') {
    const img = document.createElement('img');
    img.src = '/img/mark.png';
    img.alt = '';
    img.className = 'w-4 h-4 logo-pulse shrink-0';
    estado.appendChild(img);
  }
  const span = document.createElement('span');
  span.textContent = texto;
  estado.appendChild(span);
}
function ocultarEstado() { estado.hidden = true; }

let camposActuales = {};
let textoTranscritoActual = '';
let tablaSeleccionada = 'actividades_diarias';
let modoSeleccionado = 'agregar';

const btnTablaDesplegable = document.getElementById('btnTablaDesplegable');
const listaTablas = document.getElementById('listaTablas');
const tablaSeleccionadaTexto = document.getElementById('tablaSeleccionadaTexto');
const notaSoloLectura = document.getElementById('notaSoloLectura');

function actualizarTablaSeleccionada() {
  tablaSeleccionadaTexto.textContent = NOMBRES_TABLA[tablaSeleccionada] || tablaSeleccionada;
  document.querySelectorAll('.opcionTabla').forEach((btn) => {
    btn.classList.toggle('bg-stone-50', btn.dataset.tabla === tablaSeleccionada);
  });
}

// Catalogos, Resumen Semanal y Resumen del Dia son de solo lectura -- si se eligen, se
// apaga el modo "Agregar Datos" y se fuerza "Leer / Preguntar" (no tiene sentido
// "agregar" un dato a una lista de catalogos o a un resumen que se calcula solo).
function actualizarDisponibilidadModo() {
  const soloLectura = TABLAS_SOLO_LECTURA.includes(tablaSeleccionada);
  const btnAgregar = document.querySelector('#pillsModo button[data-modo="agregar"]');
  btnAgregar.disabled = soloLectura;
  btnAgregar.classList.toggle('opacity-30', soloLectura);
  btnAgregar.classList.toggle('cursor-not-allowed', soloLectura);
  notaSoloLectura.hidden = !soloLectura;
  if (soloLectura && modoSeleccionado !== 'leer') {
    modoSeleccionado = 'leer';
  }
  actualizarPillsModo();
}

// --- Captura rapida: formulario aparte (desplegable) con solo listas del catalogo,
// para guardar un registro sin escribir ni grabar un mensaje. Solo disponible para las
// tablas que comparten la pestaña real "Catalogos" del archivo 4.1. ---
const btnCapturaRapidaToggle = document.getElementById('btnCapturaRapidaToggle');
const panelCapturaRapida = document.getElementById('panelCapturaRapida');
const iconoCapturaRapida = document.getElementById('iconoCapturaRapida');
const camposRapidosDiv = document.getElementById('camposRapidos');
const notaCapturaRapidaNoDisponible = document.getElementById('notaCapturaRapidaNoDisponible');
const btnGuardarRapido = document.getElementById('btnGuardarRapido');
const btnEnviarRapido = document.getElementById('btnEnviarRapido');
const estadoCapturaRapida = document.getElementById('estadoCapturaRapida');

function renderCamposRapidos(tabla) {
  const lista = CAMPOS_POR_TABLA[tabla];
  camposRapidosDiv.innerHTML = '';
  if (!lista) return;
  const hoy = new Date().toISOString().slice(0, 10);
  const hace6Dias = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  lista.forEach(([clave, etiqueta]) => {
    const opts = { rapido: true };
    let valorInicial = '';
    if (clave === 'Fecha' || clave === 'FechaHasta') valorInicial = hoy;
    if (clave === 'FechaDesde') valorInicial = hace6Dias;
    if (clave === 'PrecioDiesel' && catalogosCache && catalogosCache.precioDieselRef) {
      opts.placeholder = 'Ref: ' + catalogosCache.precioDieselRef;
    }
    camposRapidosDiv.appendChild(crearCampoElemento(clave, etiqueta, tabla, valorInicial, opts));
  });
}

function leerCamposDesde(contenedor) {
  const campos = {};
  contenedor.querySelectorAll('[data-clave]').forEach((el) => { campos[el.dataset.clave] = el.value; });
  return campos;
}

function mostrarEstadoCapturaRapida(clase, texto) {
  const estilos = {
    ok: 'text-xs rounded-2xl px-3 py-2 bg-green-50 text-green-800 border border-green-200',
    err: 'text-xs rounded-2xl px-3 py-2 bg-red-50 text-red-700 border border-red-200',
    wait: 'text-xs rounded-2xl px-3 py-2 bg-amber-50 text-amber-800 border border-amber-200',
  };
  estadoCapturaRapida.hidden = false;
  estadoCapturaRapida.className = estilos[clase] || estilos.wait;
  estadoCapturaRapida.textContent = texto;
}

function actualizarDisponibilidadCapturaRapida() {
  const disponible = TABLAS_CAPTURA_RAPIDA.includes(tablaSeleccionada);
  btnCapturaRapidaToggle.hidden = !disponible;
  notaCapturaRapidaNoDisponible.hidden = disponible;
  estadoCapturaRapida.hidden = true;

  const puedeEnviar = TABLAS_CON_ENVIAR.includes(tablaSeleccionada);
  btnEnviarRapido.hidden = !puedeEnviar;
  btnGuardarRapido.classList.toggle('col-span-2', !puedeEnviar);

  if (!disponible) {
    panelCapturaRapida.hidden = true;
    iconoCapturaRapida.textContent = '▾';
  } else if (!panelCapturaRapida.hidden) {
    renderCamposRapidos(tablaSeleccionada);
  }
}

btnCapturaRapidaToggle.addEventListener('click', () => {
  panelCapturaRapida.hidden = !panelCapturaRapida.hidden;
  iconoCapturaRapida.textContent = panelCapturaRapida.hidden ? '▾' : '▴';
  if (!panelCapturaRapida.hidden) renderCamposRapidos(tablaSeleccionada);
});

btnGuardarRapido.addEventListener('click', async () => {
  const campos = leerCamposDesde(camposRapidosDiv);
  mostrarEstadoCapturaRapida('wait', 'Guardando...');
  btnGuardarRapido.disabled = true;
  try {
    const res = await fetch(guardarUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tabla: tablaSeleccionada,
        campos,
        reportado_por: nombreInput.value || '',
        texto_transcrito: '(Captura rapida -- sin mensaje de texto/voz)',
      }),
    });
    const data = await res.json();
    const ok = data.ok !== false;
    mostrarEstadoCapturaRapida(ok ? 'ok' : 'err', data.mensaje || (ok ? 'Guardado.' : 'No se pudo guardar.'));
    if (ok) renderCamposRapidos(tablaSeleccionada); // deja el formulario listo para el siguiente registro
  } catch (e) {
    mostrarEstadoCapturaRapida('err', 'No se pudo guardar: ' + e.message);
  } finally {
    btnGuardarRapido.disabled = false;
  }
});

// "Enviar por correo" de la Captura rapida -- manda lo que este en el formulario ahorita
// mismo por correo (independiente de si ya se guardo o no, ver POST /bot-web-enviar).
btnEnviarRapido.addEventListener('click', async () => {
  const campos = leerCamposDesde(camposRapidosDiv);
  mostrarEstadoCapturaRapida('wait', 'Enviando correo...');
  btnEnviarRapido.disabled = true;
  try {
    const res = await fetch(enviarUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabla: tablaSeleccionada, campos }),
    });
    const data = await res.json();
    const ok = data.ok !== false;
    mostrarEstadoCapturaRapida(ok ? 'ok' : 'err', data.mensaje || (ok ? 'Correo enviado.' : 'No se pudo enviar.'));
  } catch (e) {
    mostrarEstadoCapturaRapida('err', 'No se pudo enviar: ' + e.message);
  } finally {
    btnEnviarRapido.disabled = false;
  }
});

function actualizarPillsModo() {
  document.querySelectorAll('#pillsModo .pill').forEach((btn) => {
    btn.classList.toggle('activa', btn.dataset.modo === modoSeleccionado);
  });
  const esLeer = modoSeleccionado === 'leer';
  tituloMensaje.textContent = esLeer ? '3. Escribe o pregunta en voz' : '3. Escribe o graba tu mensaje';
  textoInput.placeholder = esLeer
    ? 'Ej: ¿Que actividades se hicieron el 31 de agosto?'
    : 'Ej: Hoy en Pedregoza cortamos 40 arboles de mango con 6 jornaleros, meta eran 50...';
  btnTexto.title = esLeer ? 'Preguntar' : 'Enviar texto';
}

btnTablaDesplegable.addEventListener('click', () => {
  listaTablas.hidden = !listaTablas.hidden;
});
listaTablas.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-tabla]');
  if (!btn) return;
  tablaSeleccionada = btn.dataset.tabla;
  actualizarTablaSeleccionada();
  actualizarDisponibilidadModo();
  actualizarDisponibilidadCapturaRapida();
  listaTablas.hidden = true;
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('#btnTablaDesplegable') && !e.target.closest('#listaTablas')) {
    listaTablas.hidden = true;
  }
});
document.getElementById('pillsModo').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-modo]');
  if (!btn || btn.disabled) return;
  modoSeleccionado = btn.dataset.modo;
  actualizarPillsModo();
});
actualizarTablaSeleccionada();
actualizarDisponibilidadModo();
actualizarDisponibilidadCapturaRapida();

const btnEnviarPreview = document.getElementById('btnEnviarPreview');
const btnGuardarPreview = document.getElementById('btnGuardar');

function renderCampos(tabla) {
  const lista = CAMPOS_POR_TABLA[tabla] || CAMPOS_ACTIVIDADES;
  camposDiv.innerHTML = '';
  lista.forEach(([clave, etiqueta]) => {
    const valorActual = (camposActuales[clave] !== undefined && camposActuales[clave] !== null) ? camposActuales[clave] : '';
    camposDiv.appendChild(crearCampoElemento(clave, etiqueta, tabla, valorActual));
  });
  const puedeEnviar = TABLAS_CON_ENVIAR.includes(tabla);
  btnEnviarPreview.hidden = !puedeEnviar;
  btnGuardarPreview.classList.toggle('col-span-2', !puedeEnviar);
}

// --- Selector del modelo de IA que procesa el mensaje (ver /modelos-para-elegir) ---
// La eleccion se guarda por navegador. Mandarla en cada envio (en vez de cambiar un
// ajuste global del servidor) evita tener que reiniciar nada y deja que cada quien
// pruebe un modelo distinto sin afectar a los demas.
const selectorModelo = document.getElementById('selectorModelo');
let opcionesModelo = [];

function claveOpcion(o) { return o.proveedor + '|' + o.modelo; }

async function cargarModelos() {
  if (!selectorModelo) return;
  try {
    const data = await fetch('/modelos-para-elegir').then((r) => r.json());
    if (!data.ok || !data.opciones.length) return;
    opcionesModelo = data.opciones;

    let guardado = '';
    try { guardado = localStorage.getItem('agro_bot_modelo') || ''; } catch (e) {}
    const sigueExistiendo = opcionesModelo.some((o) => claveOpcion(o) === guardado);

    selectorModelo.innerHTML = opcionesModelo.map((o) => {
      const etiqueta = (o.proveedor === 'claude' ? 'Claude: ' : 'Gemini: ') + o.modelo +
        (o.predeterminado ? ' (predeterminado)' : '');
      return '<option value="' + claveOpcion(o) + '">' + etiqueta + '</option>';
    }).join('');

    selectorModelo.value = sigueExistiendo
      ? guardado
      : claveOpcion(opcionesModelo.find((o) => o.predeterminado) || opcionesModelo[0]);
    selectorModelo.title = data.notaAudio || 'Que IA procesa este mensaje';
  } catch (e) {
    // Si falla, el selector se queda en "Predeterminado" y el servidor usa el del .env.
  }
}

selectorModelo && selectorModelo.addEventListener('change', () => {
  try { localStorage.setItem('agro_bot_modelo', selectorModelo.value); } catch (e) {}
});

// Lo que se manda al backend junto con el mensaje.
function modeloElegido() {
  const valor = selectorModelo ? selectorModelo.value : '';
  if (!valor) return {};
  const [proveedor, modelo] = valor.split('|');
  return { proveedor, modelo };
}

cargarModelos();

async function enviarMensaje(payload) {
  mostrar('wait', 'Procesando con IA, un momento...');
  try {
    const res = await fetch(mensajeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, ...modeloElegido(), modo: modoSeleccionado, tabla: tablaSeleccionada })
    });
    const data = await res.json();
    if (!data.ok) { mostrar('err', data.mensaje || 'No se pudo procesar.'); return; }

    // Modo "leer": no se abre el formulario de guardar. Antes se mostraba data.respuesta
    // (texto plano) tal cual en el banner de estado -- ahora se pinta como tabla real
    // usando data.resultadosPorTabla (ver renderRespuestaConsulta), con el texto plano
    // como respaldo si el backend no lo manda.
    if (data.modo === 'consulta') {
      renderRespuestaConsulta(data.resultadosPorTabla, data.respuesta);
      return;
    }

    camposActuales = data.campos || {};
    textoTranscritoActual = data.texto_transcrito || '';
    const tablaDetectada = CAMPOS_POR_TABLA[data.tabla] ? data.tabla : tablaSeleccionada;
    tablaSeleccionada = tablaDetectada;
    actualizarTablaSeleccionada();
    previewTablaTexto.textContent = NOMBRES_TABLA[tablaDetectada] || tablaDetectada;
    renderCampos(tablaDetectada);
    capturaCard.hidden = true;
    previewCard.hidden = false;
    ocultarEstado();
    mostrarTabSidebar('acciones');
    abrirSidebar();
    if (data.tabla === 'no_identificada') {
      mostrar('wait', 'No se identifico bien el mensaje, revisa/completa los campos.');
    }
  } catch (e) {
    mostrar('err', 'No se pudo enviar: ' + e.message);
  }
}

// Estilo ChatGPT/Claude: el textarea crece solo conforme escribes (hasta un maximo).
function ajustarAlturaTexto() {
  textoInput.style.height = 'auto';
  textoInput.style.height = Math.min(textoInput.scrollHeight, 160) + 'px';
}
textoInput.addEventListener('input', ajustarAlturaTexto);

btnTexto.addEventListener('click', () => {
  const texto = textoInput.value.trim();
  if (!texto) { mostrar('err', 'Escribe algo primero.'); return; }
  enviarMensaje({ tipo: 'texto', texto });
  textoInput.value = '';
  ajustarAlturaTexto();
});

const CLASE_BTN_AUDIO_NORMAL = 'w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-white border border-stone-300 hover:bg-stone-100 text-stone-600 transition';
const CLASE_BTN_AUDIO_GRABANDO = 'w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white transition';
const ICONO_MIC = '<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
const ICONO_STOP = '<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>';

function actualizarBtnAudio(grabando) {
  btnAudio.className = grabando ? CLASE_BTN_AUDIO_GRABANDO : CLASE_BTN_AUDIO_NORMAL;
  btnAudio.innerHTML = grabando ? ICONO_STOP : ICONO_MIC;
  btnAudio.title = grabando ? 'Detener y enviar' : 'Grabar audio';
}

let mediaRecorder, chunks = [];
const btnAudio = document.getElementById('btnAudio');
btnAudio.addEventListener('click', async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      actualizarBtnAudio(false);
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        enviarMensaje({ tipo: 'audio', audio_base64: base64, mime_type: blob.type || 'audio/webm' });
      };
      reader.readAsDataURL(blob);
    };
    mediaRecorder.start();
    actualizarBtnAudio(true);
    mostrar('wait', 'Grabando... presiona de nuevo para enviar.');
  } catch (e) {
    mostrar('err', 'No se pudo acceder al microfono: ' + e.message);
  }
});

document.getElementById('btnCancelar').addEventListener('click', () => {
  previewCard.hidden = true;
  capturaCard.hidden = false;
  ocultarEstado();
});

btnGuardarPreview.addEventListener('click', async () => {
  // OJO: se lee por "[data-clave]" y no por "input" -- los campos con catalogo
  // (Actividad, Huerta, Responsable, etc.) se renderizan como <select>, y con solo
  // "input" esos valores se perdian silenciosamente al guardar desde aqui.
  const camposEditados = leerCamposDesde(camposDiv);
  mostrar('wait', 'Guardando...');
  try {
    const res = await fetch(guardarUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tabla: tablaSeleccionada,
        campos: camposEditados,
        reportado_por: nombreInput.value || '',
        texto_transcrito: textoTranscritoActual
      })
    });
    const data = await res.json();
    previewCard.hidden = true;
    capturaCard.hidden = false;
    mostrar(data.ok === false ? 'err' : 'ok', data.mensaje || 'Guardado.');
  } catch (e) {
    mostrar('err', 'No se pudo guardar: ' + e.message);
  }
});

// "Enviar por correo" de la bandeja de revision -- manda lo que este en el formulario
// ahorita mismo por correo, sin cerrar el preview ni depender de que ya se haya guardado.
btnEnviarPreview.addEventListener('click', async () => {
  const campos = leerCamposDesde(camposDiv);
  mostrar('wait', 'Enviando correo...');
  btnEnviarPreview.disabled = true;
  try {
    const res = await fetch(enviarUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabla: tablaSeleccionada, campos }),
    });
    const data = await res.json();
    mostrar(data.ok === false ? 'err' : 'ok', data.mensaje || 'Correo enviado.');
  } catch (e) {
    mostrar('err', 'No se pudo enviar: ' + e.message);
  } finally {
    btnEnviarPreview.disabled = false;
  }
});

// Tabla real (columnas + encabezados ordenables) en vez del texto plano "campo: valor" de
// antes -- sin agregar ninguna libreria nueva (nada de React/KendoReact/etc.), solo JS
// plano + las clases de Tailwind que ya existen en el proyecto. El estado de orden vive en
// el closure de esta funcion, asi que darle click de nuevo a la misma columna invierte el
// orden en vez de resetearlo.
//
// Se armo como funcion reutilizable (regresa un <div> ya armado, no pinta directo un
// contenedor por id) porque el historial del sidebar (renderHistorial, abajo) y la
// respuesta de una pregunta en el chat (renderRespuestaConsulta, mas abajo) necesitan
// exactamente la misma tabla -- antes solo existia para el historial.
function construirTablaRegistros(registros) {
  const wrapper = document.createElement('div');
  if (!registros || registros.length === 0) {
    wrapper.innerHTML = '<p class="text-xs text-stone-400">Sin registros.</p>';
    return wrapper;
  }

  // Columnas: la union de llaves de todos los registros, en el orden en que aparecen (por
  // si algun registro viene incompleto), quitando las que salen vacias en TODOS.
  const columnas = [];
  for (const r of registros) {
    for (const k of Object.keys(r)) {
      if (!columnas.includes(k)) columnas.push(k);
    }
  }
  const columnasConDatos = columnas.filter((k) =>
    registros.some((r) => r[k] !== '' && r[k] !== null && r[k] !== undefined)
  );

  let columnaOrden = null;
  let ordenAsc = true;

  function dibujar() {
    let filas = registros;
    if (columnaOrden) {
      filas = [...registros].sort((a, b) => {
        const va = a[columnaOrden] ?? '';
        const vb = b[columnaOrden] ?? '';
        const cmp = String(va).localeCompare(String(vb), 'es', { numeric: true, sensitivity: 'base' });
        return ordenAsc ? cmp : -cmp;
      });
    }

    const encabezados = columnasConDatos.map((col) => {
      const activa = col === columnaOrden;
      const flecha = activa ? (ordenAsc ? ' &uarr;' : ' &darr;') : '';
      return '<th data-col="' + col + '" class="th-ordenable sticky top-0 z-10 bg-stone-50 text-left text-[11px] font-semibold ' +
        (activa ? 'text-stone-800' : 'text-stone-500') +
        ' uppercase tracking-wide px-3 py-2 border-b border-stone-100 cursor-pointer select-none whitespace-nowrap hover:text-stone-800">' +
        col + '<span class="inline-block ' + (activa ? 'animate-fade-in-up' : '') + '">' + flecha + '</span></th>';
    }).join('');

    const filasHtml = filas.map((r) => {
      const celdas = columnasConDatos.map((col) => {
        const valor = r[col];
        const vacio = valor === '' || valor === null || valor === undefined;
        const texto = vacio ? '<span class="text-stone-300">&mdash;</span>' : String(valor);
        return '<td class="px-3 py-2 text-xs text-stone-600 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis" title="' +
          (vacio ? '' : String(valor).replace(/"/g, '&quot;')) + '">' + texto + '</td>';
      }).join('');
      return '<tr class="border-b border-stone-50 last:border-0 hover:bg-stone-50/70">' + celdas + '</tr>';
    }).join('');

    wrapper.innerHTML =
      '<div class="border border-stone-100 rounded-2xl overflow-auto max-h-96">' +
        '<table class="w-full border-collapse">' +
          '<thead><tr>' + encabezados + '</tr></thead>' +
          '<tbody>' + filasHtml + '</tbody>' +
        '</table>' +
      '</div>';

    wrapper.querySelectorAll('th[data-col]').forEach((th) => {
      th.addEventListener('click', () => {
        const col = th.dataset.col;
        ordenAsc = columnaOrden === col ? !ordenAsc : true;
        columnaOrden = col;
        dibujar();
      });
    });
  }

  dibujar();
  return wrapper;
}

// Igual que construirTablaRegistros, pero para filas "crudas" (array de arrays, como se
// leen directo de una hoja de Catalogos: la fila 0 son los encabezados). No es ordenable
// porque estas tablas no representan "un registro por fila", sino columnas independientes.
function construirTablaCruda(filas2D) {
  const wrapper = document.createElement('div');
  if (!filas2D || filas2D.length === 0) {
    wrapper.innerHTML = '<p class="text-xs text-stone-400">Sin datos.</p>';
    return wrapper;
  }
  const [encabezados, ...resto] = filas2D;
  const encabezadosHtml = encabezados.map((h) =>
    '<th class="sticky top-0 z-10 bg-stone-50 text-left text-[11px] font-semibold text-stone-500 uppercase tracking-wide px-3 py-2 border-b border-stone-100 whitespace-nowrap">' +
      (h || '(sin nombre)') + '</th>'
  ).join('');
  const filasHtml = resto.map((fila) => {
    const celdas = encabezados.map((_, i) => {
      const valor = fila[i];
      const vacio = valor === '' || valor === null || valor === undefined;
      return '<td class="px-3 py-2 text-xs text-stone-600 whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis">' +
        (vacio ? '<span class="text-stone-300">&mdash;</span>' : String(valor)) + '</td>';
    }).join('');
    return '<tr class="border-b border-stone-50 last:border-0 hover:bg-stone-50/70">' + celdas + '</tr>';
  }).join('');
  wrapper.innerHTML =
    '<div class="border border-stone-100 rounded-2xl overflow-auto max-h-96">' +
      '<table class="w-full border-collapse">' +
        '<thead><tr>' + encabezadosHtml + '</tr></thead>' +
        '<tbody>' + filasHtml + '</tbody>' +
      '</table>' +
    '</div>';
  return wrapper;
}

// Resumen Semanal viene como pares "etiqueta, valor" (sin fila de encabezado) -- una
// mini tabla de 2 columnas en vez de un renglon de texto suelto por metrica.
function construirTablaEtiquetaValor(filas2D) {
  const wrapper = document.createElement('div');
  const filtradas = (filas2D || []).filter((f) => f[0] && String(f[0]).trim() !== '');
  if (filtradas.length === 0) {
    wrapper.innerHTML = '<p class="text-xs text-stone-400">Sin datos.</p>';
    return wrapper;
  }
  const filasHtml = filtradas.map((f) =>
    '<tr class="border-b border-stone-50 last:border-0 hover:bg-stone-50/70">' +
      '<td class="px-3 py-2 text-xs font-medium text-stone-600 whitespace-nowrap">' + (f[0] ?? '') + '</td>' +
      '<td class="px-3 py-2 text-xs text-stone-600">' +
        (f[1] !== undefined && f[1] !== '' ? String(f[1]) : '<span class="text-stone-300">&mdash;</span>') +
      '</td>' +
    '</tr>'
  ).join('');
  wrapper.innerHTML =
    '<div class="border border-stone-100 rounded-2xl overflow-auto max-h-96">' +
      '<table class="w-full border-collapse">' +
        '<tbody>' + filasHtml + '</tbody>' +
      '</table>' +
    '</div>';
  return wrapper;
}

function renderHistorial(registros) {
  const cont = document.getElementById('histResultado');
  cont.innerHTML = '';
  cont.appendChild(construirTablaRegistros(registros));
}

// Respuesta de una pregunta en el chat ("¿que actividades se hicieron el 31 de agosto?")
// -- antes se mostraba el texto plano de armarRespuestaConsulta (backend) metido tal cual
// en el banner de "estado". Ahora, si el backend mando "resultadosPorTabla" (los mismos
// datos sin aplanar a texto -- ver /bot-web-mensaje en mensaje.js), se pinta una tabla real
// por cada tabla con resultados, igual que el historial. Si por lo que sea no hay datos
// estructurados (respuesta vieja del backend, o cero resultados), cae de vuelta al texto
// plano de siempre en vez de romperse.
function renderRespuestaConsulta(resultadosPorTabla, respuestaTexto) {
  if (!Array.isArray(resultadosPorTabla) || resultadosPorTabla.length === 0) {
    mostrar('ok', respuestaTexto || 'Sin respuesta.');
    return;
  }

  estado.hidden = false;
  estado.className = 'mt-4 space-y-3';
  estado.innerHTML = '';

  let algo = false;
  resultadosPorTabla.forEach((r) => {
    const bloque = document.createElement('div');
    bloque.className = 'rounded-2xl border border-green-200 bg-green-50 p-3';
    const titulo = document.createElement('p');
    titulo.className = 'text-xs font-semibold text-green-800 mb-2';

    if (r.textoListo) {
      titulo.textContent = NOMBRES_TABLA[r.tabla] || r.tabla;
      const parrafo = document.createElement('p');
      parrafo.className = 'whitespace-pre-line text-sm text-green-800';
      parrafo.textContent = r.textoListo;
      bloque.appendChild(titulo);
      bloque.appendChild(parrafo);
      estado.appendChild(bloque);
      algo = true;
      return;
    }
    if (r.crudo) {
      if (!r.crudo.length) return;
      titulo.textContent = NOMBRES_TABLA[r.tabla] || r.tabla;
      bloque.appendChild(titulo);
      bloque.appendChild(
        r.tabla === 'resumen_semanal' ? construirTablaEtiquetaValor(r.crudo) : construirTablaCruda(r.crudo)
      );
      estado.appendChild(bloque);
      algo = true;
      return;
    }
    const filas = r.filas || [];
    if (filas.length === 0) return;
    // "total" lo manda el backend cuando recorto las filas (ver MAX_FILAS_UI en
    // routes/mensaje.js) -- el encabezado muestra el total REAL, no lo que alcanzo a venir.
    const total = typeof r.total === 'number' ? r.total : filas.length;
    titulo.textContent = (NOMBRES_TABLA[r.tabla] || r.tabla) + ' (' + total + ')';
    bloque.appendChild(titulo);
    bloque.appendChild(construirTablaRegistros(filas));
    if (total > filas.length) {
      const nota = document.createElement('p');
      nota.className = 'text-[11px] text-stone-500 mt-2';
      nota.textContent = 'Mostrando las primeras ' + filas.length + ' de ' + total +
        ' filas. Acota la pregunta (por fecha, campo o actividad) para ver menos.';
      bloque.appendChild(nota);
    }
    estado.appendChild(bloque);
    algo = true;
  });

  if (!algo) {
    mostrar('ok', 'No encontre registros que coincidan con tu pregunta.');
  }
}

let tablaHistorialActual = null;
const btnActualizarHistorial = document.getElementById('btnActualizarHistorial');

async function verHistorial(tabla) {
  tablaHistorialActual = tabla;
  if (btnActualizarHistorial) btnActualizarHistorial.disabled = false;
  const cont = document.getElementById('histResultado');
  // Placeholder tipo "skeleton" (mismo shimmer que el splash de carga) mientras llega la
  // respuesta, en vez de un simple texto "Cargando...".
  cont.innerHTML = `
    <div class="border border-stone-100 rounded-2xl px-3 py-2.5 bg-stone-50 space-y-1.5">
      <div class="skeleton-line w-3/4"></div>
      <div class="skeleton-line w-1/2"></div>
    </div>
    <div class="border border-stone-100 rounded-2xl px-3 py-2.5 bg-stone-50 space-y-1.5">
      <div class="skeleton-line w-2/3"></div>
      <div class="skeleton-line w-1/3"></div>
    </div>
  `;
  try {
    const res = await fetch(historialUrl + '?tabla=' + tabla);
    const data = await res.json();
    renderHistorial(data.registros);
  } catch (e) {
    cont.innerHTML = '<p class="text-xs text-red-500">Error: ' + e.message + '</p>';
  }
}

document.querySelectorAll('.histBtn').forEach((btn) => {
  btn.addEventListener('click', () => verHistorial(btn.dataset.tabla));
});
if (btnActualizarHistorial) {
  btnActualizarHistorial.addEventListener('click', () => {
    if (tablaHistorialActual) verHistorial(tablaHistorialActual);
  });
}

// --- Acciones rapidas: copiar el enlace del bot al portapapeles ---
const btnCopiarEnlace = document.getElementById('btnCopiarEnlace');
if (btnCopiarEnlace) {
  const textoOriginalCopiar = btnCopiarEnlace.innerHTML;
  btnCopiarEnlace.addEventListener('click', async () => {
    const enlace = window.location.origin + '/bot-web';
    try {
      await navigator.clipboard.writeText(enlace);
      btnCopiarEnlace.textContent = '✅ Enlace copiado';
    } catch (e) {
      btnCopiarEnlace.textContent = 'No se pudo copiar -- copialo tu: ' + enlace;
    }
    setTimeout(() => { btnCopiarEnlace.innerHTML = textoOriginalCopiar; }, 2000);
  });
}

async function enviarResumenAhora(ruta, boton, nombre) {
  const cont = document.getElementById('correoResultado');
  const textoOriginal = boton.textContent;
  boton.disabled = true;
  boton.textContent = 'Enviando...';
  cont.innerHTML = '<p>Armando y mandando el ' + nombre + ', un momento...</p>';
  try {
    const res = await fetch(baseUrl + ruta, { method: 'POST' });
    const data = await res.json();
    cont.innerHTML = data.ok
      ? '<p class="text-green-700">Listo, se mando el ' + nombre + ' al correo.</p>'
      : '<p class="text-red-600">No se pudo mandar: ' + (data.error || 'error desconocido') + '</p>';
  } catch (e) {
    cont.innerHTML = '<p class="text-red-600">Error: ' + e.message + '</p>';
  } finally {
    boton.disabled = false;
    boton.textContent = textoOriginal;
  }
}

document.getElementById('btnEnviarResumenDiario').addEventListener('click', (e) =>
  enviarResumenAhora('/probar-resumen-diario', e.target, 'resumen diario'));
document.getElementById('btnEnviarResumenSemanal').addEventListener('click', (e) =>
  enviarResumenAhora('/probar-resumen-semanal', e.target, 'resumen semanal'));

async function enviarTabPorCorreo(tab, boton, etiqueta) {
  const cont = document.getElementById('correoResultado');
  const textoOriginal = boton.textContent;
  boton.disabled = true;
  boton.textContent = 'Enviando...';
  cont.innerHTML = '<p>Mandando el documento (pestaña ' + etiqueta + '), un momento...</p>';
  try {
    const res = await fetch(baseUrl + '/enviar-tab-correo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tab }),
    });
    const data = await res.json();
    cont.innerHTML = data.ok
      ? '<p class="text-green-700">Listo, se mando el documento (pestaña ' + etiqueta + ') al correo.</p>'
      : '<p class="text-red-600">No se pudo mandar: ' + (data.error || 'error desconocido') + '</p>';
  } catch (e) {
    cont.innerHTML = '<p class="text-red-600">Error: ' + e.message + '</p>';
  } finally {
    boton.disabled = false;
    boton.textContent = textoOriginal;
  }
}

document.querySelectorAll('.tabCorreoBtn').forEach((btn) => {
  btn.addEventListener('click', () => enviarTabPorCorreo(btn.dataset.tab, btn, btn.textContent));
});

// --- Sidebar: abrir/cerrar en movil ---
const sidebar = document.getElementById('sidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

function abrirSidebar() {
  sidebar.classList.add('abierto');
  sidebarBackdrop.classList.remove('opacity-0', 'pointer-events-none');
}
function cerrarSidebar() {
  sidebar.classList.remove('abierto');
  sidebarBackdrop.classList.add('opacity-0', 'pointer-events-none');
}
document.getElementById('btnAbrirSidebar').addEventListener('click', abrirSidebar);
document.getElementById('btnCerrarSidebar').addEventListener('click', cerrarSidebar);
sidebarBackdrop.addEventListener('click', cerrarSidebar);

// --- Sidebar: pestañas Historial / Acciones / Actividad en vivo ---
const tabHistorialBtn = document.getElementById('tabHistorialBtn');
const tabAccionesBtn = document.getElementById('tabAccionesBtn');
const tabNoticiasBtn = document.getElementById('tabNoticiasBtn');
const tabActividadBtn = document.getElementById('tabActividadBtn');
const panelHistorial = document.getElementById('panelHistorial');
const panelAcciones = document.getElementById('panelAcciones');
const panelNoticias = document.getElementById('panelNoticias');
const panelActividad = document.getElementById('panelActividad');

function mostrarTabSidebar(tab) {
  tabHistorialBtn.classList.toggle('activa', tab === 'historial');
  tabAccionesBtn.classList.toggle('activa', tab === 'acciones');
  tabNoticiasBtn.classList.toggle('activa', tab === 'noticias');
  tabActividadBtn.classList.toggle('activa', tab === 'actividad');
  panelHistorial.hidden = tab !== 'historial';
  panelAcciones.hidden = tab !== 'acciones';
  panelNoticias.hidden = tab !== 'noticias';
  panelActividad.hidden = tab !== 'actividad';
}
tabHistorialBtn.addEventListener('click', () => mostrarTabSidebar('historial'));
tabAccionesBtn.addEventListener('click', () => mostrarTabSidebar('acciones'));
tabNoticiasBtn.addEventListener('click', () => mostrarTabSidebar('noticias'));
tabActividadBtn.addEventListener('click', () => mostrarTabSidebar('actividad'));

// --- Sidebar: Actividad en vivo (misma conexion Socket.io que /actividad-en-vivo) ---
const puntoEstadoSidebar = document.getElementById('puntoEstadoSidebar');
const textoEstadoSidebar = document.getElementById('textoEstadoSidebar');

const socket = io();

// Presentarse ante el servidor para aparecer en "Quien esta usando la app" (ver
// services/socket.js). Sin esto, en esa lista solo se verian las personas que tienen
// abierta la pantalla de Actividad en vivo, no las que realmente estan usando el bot.
function presentarseEnSocket() {
  let nombre = '';
  try { nombre = localStorage.getItem('agro_bot_nombre') || ''; } catch (e) {}
  socket.emit('presentarse', { nombre, pagina: 'Bot de captura' });
}
// Si cambia el nombre en el campo "Tu nombre", se vuelve a avisar.
nombreInput.addEventListener('change', presentarseEnSocket);
setInterval(() => socket.emit('sigo-aqui'), 60000);

socket.on('connect', () => {
  presentarseEnSocket();
  puntoEstadoSidebar.className = 'w-2 h-2 rounded-full bg-green-500 shrink-0';
  textoEstadoSidebar.textContent = 'Conectado';
});
socket.on('disconnect', () => {
  puntoEstadoSidebar.className = 'w-2 h-2 rounded-full bg-red-500 shrink-0';
  textoEstadoSidebar.textContent = 'Desconectado';
});
socket.on('connect_error', (err) => {
  puntoEstadoSidebar.className = 'w-2 h-2 rounded-full bg-amber-500 shrink-0';
  textoEstadoSidebar.textContent = 'Error de conexion: ' + err.message;
});
// Nota: por ahora solo se ve el estado de conexion -- los eventos reales (mensaje
// recibido, clasificando con IA, guardando en Sheets, etc.) se agregan en un siguiente
// paso, emitidos desde el backend con socketService.emitirEvento(...).
