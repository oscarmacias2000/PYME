// Logica de la pagina de login (antes vivia inline en public/login.html).

import { initToggleTema } from '../tema.js';
initToggleTema('btnTema');

// Splash de carga (logo + skeleton) unos ~7s al abrir la pagina, antes de dejar ver el
// formulario de login -- puramente de presentacion, no espera ningun dato del servidor.
setTimeout(() => {
  const splash = document.getElementById('splashCarga');
  if (splash) {
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 300);
  }
}, 7000);

const form = document.getElementById('formLogin');
const errorDiv = document.getElementById('error');
const btnEntrar = document.getElementById('btnEntrar');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorDiv.hidden = true;
  btnEntrar.disabled = true;
  btnEntrar.textContent = 'Entrando...';
  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: document.getElementById('usuario').value,
        password: document.getElementById('password').value,
      }),
    });
    const data = await res.json();
    if (data.ok) {
      window.location.href = '/bot-web';
    } else {
      errorDiv.textContent = data.mensaje || 'No se pudo iniciar sesion.';
      errorDiv.hidden = false;
    }
  } catch (err) {
    errorDiv.textContent = 'Error de conexion: ' + err.message;
    errorDiv.hidden = false;
  } finally {
    btnEntrar.disabled = false;
    btnEntrar.textContent = 'Entrar';
  }
});
