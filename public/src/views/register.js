// register.js
import { auth, setAuthPersistence, db } from '../services/firebase-init.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function registerView() {
  const container = document.createElement('div');
  container.className = 'auth-container';

  const render = () => {
    container.innerHTML = `
      <h2>Crear Cuenta</h2>
      <form id="register-form">
        <div>
          <label for="reg-email">Correo electrónico</label>
          <input type="email" id="reg-email" placeholder="ejemplo@correo.com" required />
        </div>
        <div>
          <label for="reg-password">Contraseña</label>
          <input type="password" id="reg-password" placeholder="Mínimo 6 caracteres" required />
        </div>
        <div>
          <label for="reg-confirm">Confirmar contraseña</label>
          <input type="password" id="reg-confirm" placeholder="Repite la contraseña" required />
        </div>
        <div>
          <label>
            <input type="checkbox" id="reg-remember" checked /> Recordarme
          </label>
        </div>
        <button type="submit">Registrarse</button>
        <div id="register-error" class="error-message"></div>
        <p>¿Ya tienes cuenta? <a href="#login">Inicia sesión</a></p>
      </form>
    `;

    const form = container.querySelector('#register-form');
    const errorDiv = container.querySelector('#register-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;
      const confirm = document.getElementById('reg-confirm').value;
      const remember = document.getElementById('reg-remember').checked;

      if (password !== confirm) {
        errorDiv.textContent = 'Las contraseñas no coinciden.';
        return;
      }
      if (password.length < 6) {
        errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        return;
      }

      try {
        // Configurar persistencia antes de crear usuario
        await setAuthPersistence(remember);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Crear documento en Firestore para el usuario con configuración por defecto
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: '',
          createdAt: new Date(),
          settings: {
            theme: {
              primary: '#6200ea',
              secondary: '#03dac6',
              background: '#ffffff',
              surface: '#f5f5f5',
            },
            logoURL: ''
          }
        });

        // Redirigir a home
        window.location.hash = '#dashboard';
      } catch (error) {
        console.error('Error en registro:', error);
        let mensaje = 'Error al registrarse. ';
        switch (error.code) {
          case 'auth/email-already-in-use':
            mensaje += 'El correo ya está registrado.';
            break;
          case 'auth/invalid-email':
            mensaje += 'Correo inválido.';
            break;
          case 'auth/weak-password':
            mensaje += 'Contraseña muy débil.';
            break;
          default:
            mensaje += error.message;
        }
        errorDiv.textContent = mensaje;
      }
    });
  };

  const destroy = () => {};

  render();
  return { render, destroy, element: container };
}