// Modo oscuro compartido por las 3 paginas (index/login/actividad). La primera
// aplicacion del tema (para no "parpadear" con el tema equivocado antes de que este
// bundle cargue) vive en un <script> chiquito al principio de cada <head> -- este
// modulo solo conecta el boton visible "Cambiar tema" con la clase .dark en <html> y
// guarda la preferencia para la proxima visita.
const CLAVE_TEMA = 'agro_bot_tema';

// Iconos (Material Symbols "light_mode" / "dark_mode", src original en svg/lightmode.svg
// y svg/modenight.svg) inlineados aqui -- con fill="currentColor" para heredar el color
// de texto del boton y verse bien tanto en modo claro como oscuro, sin depender de una
// ruta estatica aparte.
const ICONO_SOL = '<svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true" class="w-[18px] h-[18px]"><path d="M565-395q35-35 35-85t-35-85q-35-35-85-35t-85 35q-35 35-35 85t35 85q35 35 85 35t85-35Zm-226.5 56.5Q280-397 280-480t58.5-141.5Q397-680 480-680t141.5 58.5Q680-563 680-480t-58.5 141.5Q563-280 480-280t-141.5-58.5ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Zm326-268Z"/></svg>';
const ICONO_LUNA = '<svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true" class="w-[18px] h-[18px]"><path d="M380-160q133 0 226.5-93.5T700-480q0-133-93.5-226.5T380-800h-21q-10 0-19 2 57 66 88.5 147.5T460-480q0 89-31.5 170.5T340-162q9 2 19 2h21Zm0 80q-53 0-103.5-13.5T180-134q93-54 146.5-146T380-480q0-108-53.5-200T180-826q46-27 96.5-40.5T380-880q83 0 156 31.5T663-763q54 54 85.5 127T780-480q0 83-31.5 156T663-197q-54 54-127 85.5T380-80Zm80-400Z"/></svg>';

function esOscuro() {
  return document.documentElement.classList.contains('dark');
}

function actualizarBoton(boton) {
  // El icono que se muestra es la ACCION del boton (a que modo cambia si haces click),
  // igual que antes con los emojis 🌙/☀️: en modo oscuro se ofrece el sol (volver a claro),
  // en modo claro se ofrece la luna (pasar a oscuro).
  boton.innerHTML = esOscuro() ? ICONO_SOL : ICONO_LUNA;
  const etiqueta = esOscuro() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  boton.title = etiqueta;
  boton.setAttribute('aria-label', etiqueta);
}

export function initToggleTema(idBoton) {
  const boton = document.getElementById(idBoton);
  if (!boton) return;
  actualizarBoton(boton);
  boton.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    try { localStorage.setItem(CLAVE_TEMA, esOscuro() ? 'oscuro' : 'claro'); } catch (e) {}
    actualizarBoton(boton);
  });
}
