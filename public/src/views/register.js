// register.js
import { auth, setAuthPersistence, db } from '../services/firebase-init.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function registerView() {
  const container = document.createElement('div');
  container.className = 'auth-container';

  const render = () => {
    container.innerHTML = `<h2>Crear Cuenta</h2>
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
        <div class="business-type-section" style="border: 2px dashed #6200ea; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; background: #fafaff;">
          <h3 style="margin: 0 0 1rem 0; color: #6200ea; font-size: 1.2rem;">📌 Tipo de negocio</h3>
          <p style="margin: 0 0 1rem 0; font-size: 0.9rem; color: #666;">Esta elección define cómo se calcularán tus costos y precios sugeridos.</p>
          <div style="display: flex; gap: 1rem; justify-content: center;">
            <button type="button" id="btn-business-revendedor" class="business-choice-btn" data-value="revendedor" style="flex: 1; background: #e3f2fd; border: 2px solid #6200ea; color: #6200ea; padding: 1.2rem 1rem; font-size: 1rem; font-weight: 700; border-radius: 10px; cursor: pointer; transition: all 0.2s;">🛒 Revendedor</button>
            <button type="button" id="btn-business-fabricante" class="business-choice-btn" data-value="fabricante" style="flex: 1; background: #fff3e0; border: 2px solid #fb8c00; color: #fb8c00; padding: 1.2rem 1rem; font-size: 1rem; font-weight: 700; border-radius: 10px; cursor: pointer; transition: all 0.2s;">🧵 Fabricante</button>
          </div>
          <div id="business-type-error" style="margin-top: 0.75rem; color: #d32f2f; font-size: 0.85rem; display: none;">⚠️ Debés elegir un tipo de negocio antes de continuar.</div>
        </div>
        <button type="submit" style="width: 100%; padding: 1rem; font-size: 1rem; font-weight: 600; border-radius: 8px; margin-top: 1rem;">Registrarse</button>
        <input type="hidden" id="reg-business-type" value="" />
        <div id="register-error" class="error-message"></div>
        <p>¿Ya tienes cuenta? <a href="#login">Inicia sesión</a></p>
      </form>
    `;
    const form = container.querySelector('#register-form');
    const errorDiv = container.querySelector('#register-error');
    const businessError = container.querySelector('#business-type-error');
    const businessInputs = container.querySelectorAll('.business-choice-btn');
    const hiddenInput = container.querySelector('#reg-business-type');

    let selectedBusinessType = null;

    businessInputs.forEach(btn => {
      btn.addEventListener('click', () => {
        businessInputs.forEach(b => {
          b.style.background = b.dataset.value === 'revendedor' ? '#e3f2fd' : '#fff3e0';
          b.style.borderColor = b.dataset.value === 'revendedor' ? '#6200ea' : '#fb8c00';
          b.style.color = b.dataset.value === 'revendedor' ? '#6200ea' : '#fb8c00';
        });
        btn.style.background = btn.dataset.value === 'revendedor' ? '#bbdefb' : '#ffe0b2';
        btn.style.borderColor = btn.dataset.value === 'revendedor' ? '#3700b3' : '#ef6c00';
        btn.style.color = btn.dataset.value === 'revendedor' ? '#3700b3' : '#ef6c00';
        btn.style.transform = 'translateY(-2px)';
        selectedBusinessType = btn.dataset.value;
        hiddenInput.value = selectedBusinessType;
        businessError.style.display = 'none';
      });
    });

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

      if (!selectedBusinessType) {
        businessError.style.display = 'block';
        errorDiv.textContent = '';
        return;
      }

      try {
        await setAuthPersistence(remember);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

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

        await setDoc(doc(db, 'users', user.uid, 'config', 'business'), {
          businessType: selectedBusinessType,
          currency: 'ARS',
          defaultMargin: 30,
          pricingConfig: {
            multiplier: 2.30,
            threshold: 7000,
            fixedAdditionBelow: 1000,
            fixedAdditionAbove: 1500,
          },
          createdAt: new Date()
        });

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