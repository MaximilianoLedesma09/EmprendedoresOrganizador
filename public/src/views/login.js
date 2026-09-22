// login.js
import { auth, setAuthPersistence } from '../services/firebase-init.js';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function loginView() {
  const container = document.createElement('div');
  container.className = 'auth-container';

  const render = () => {
    container.innerHTML = `
      <h2>Iniciar Sesión</h2>
      <form id="login-form">
        <div>
          <label for="email">Correo electrónico</label>
          <input type="email" id="email" placeholder="ejemplo@correo.com" required />
        </div>
        <div>
          <label for="password">Contraseña</label>
          <input type="password" id="password" placeholder="••••••••" required />
        </div>
        <div>
          <label>
            <input type="checkbox" id="remember" checked /> Recordarme
          </label>
        </div>
        <button type="submit">Iniciar Sesión</button>
        <div id="login-error" class="error-message"></div>
        <p>¿No tienes cuenta? <a href="#register">Regístrate aquí</a></p>
      </form>
    `;

    const form = container.querySelector('#login-form');
    const errorDiv = container.querySelector('#login-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const remember = document.getElementById('remember').checked;

      try {
        // Configurar persistencia antes de iniciar sesión
        await setAuthPersistence(remember);
        await signInWithEmailAndPassword(auth, email, password);
        // El onAuthStateChanged en main.js redirigirá a home
        window.location.hash = '#dashboard';
      } catch (error) {
        console.error('Error en login:', error);
        let mensaje = 'Error al iniciar sesión. ';
        switch (error.code) {
          case 'auth/user-not-found':
            mensaje += 'Usuario no encontrado.';
            break;
          case 'auth/wrong-password':
            mensaje += 'Contraseña incorrecta.';
            break;
          case 'auth/invalid-email':
            mensaje += 'Correo inválido.';
            break;
          default:
            mensaje += error.message;
        }
        errorDiv.textContent = mensaje;
      }
    });
  };

  const destroy = () => {
    // Limpieza de eventos si es necesario
  };

  render();
  return { render, destroy, element: container };
}