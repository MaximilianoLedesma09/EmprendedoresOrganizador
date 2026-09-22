import { auth, db } from '../services/firebase-init.js';
import { getDocument, setDocument } from '../services/firestore-service.js';
import { uploadFile } from '../services/storage-service.js';
import { applyTheme } from '../utils/theme.js';
import { doc, getDoc } from 'firebase/firestore';
import { createAppLayout } from '../components/app-layout.js';

export default function settingsView() {
  const container = document.createElement('div');
  container.className = 'settings-container';

  let currentSettings = {
    theme: {
      primary: '#6200ea',
      secondary: '#03dac6',
      background: '#ffffff',
      surface: '#f5f5f5'
    },
    logoURL: ''
  };

  const render = async () => {
    // Cargar configuración actual del usuario
    const user = auth.currentUser;
    if (!user) {
      container.innerHTML = '<p>Debes iniciar sesión para ver esta página.</p>';
      return;
    }

    // Obtener settings de Firestore
    const userDoc = await getDocument('users', user.uid);
    if (userDoc && userDoc.settings) {
      currentSettings = userDoc.settings;
    }

    // Aplicar tema
    applyTheme(currentSettings.theme);

    // Renderizar formulario
    container.innerHTML = `
      <h2>Configuración de la aplicación</h2>
      <form id="settings-form">
        <h3>Colores</h3>
        <div>
          <label for="color-primary">Color primario</label>
          <input type="color" id="color-primary" value="${currentSettings.theme.primary || '#6200ea'}" />
        </div>
        <div>
          <label for="color-secondary">Color secundario</label>
          <input type="color" id="color-secondary" value="${currentSettings.theme.secondary || '#03dac6'}" />
        </div>
        <div>
          <label for="color-background">Color de fondo</label>
          <input type="color" id="color-background" value="${currentSettings.theme.background || '#ffffff'}" />
        </div>
        <div>
          <label for="color-surface">Color de superficie</label>
          <input type="color" id="color-surface" value="${currentSettings.theme.surface || '#f5f5f5'}" />
        </div>

        <h3>Logo de la marca</h3>
        <div>
          <label for="logo-upload">Subir logo</label>
          <input type="file" id="logo-upload" accept="image/*" />
          <div id="logo-preview">
            ${currentSettings.logoURL ? `<img src="${currentSettings.logoURL}" alt="Logo" style="max-width: 100px; max-height: 100px;" />` : 'No hay logo aún.'}
          </div>
        </div>

        <button type="submit">Guardar configuración</button>
        <div id="settings-message"></div>
      </form>
    `;

    // Evento para subir logo
    const fileInput = container.querySelector('#logo-upload');
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const path = `logos/${auth.currentUser.uid}/${file.name}`;
        const url = await uploadFile(path, file);
        currentSettings.logoURL = url;
        // Actualizar preview
        const preview = container.querySelector('#logo-preview');
        preview.innerHTML = `<img src="${url}" alt="Logo" style="max-width: 100px; max-height: 100px;" />`;
        document.getElementById('settings-message').textContent = 'Logo subido correctamente. Guarda los cambios.';
      } catch (error) {
        console.error('Error al subir logo:', error);
        document.getElementById('settings-message').textContent = 'Error al subir el logo.';
      }
    });

    // Evento para guardar configuración
    const form = container.querySelector('#settings-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        // Recoger colores
        const theme = {
          primary: document.getElementById('color-primary').value,
          secondary: document.getElementById('color-secondary').value,
          background: document.getElementById('color-background').value,
          surface: document.getElementById('color-surface').value
        };
        currentSettings.theme = theme;

        // Guardar en Firestore
        await setDocument('users', auth.currentUser.uid, {
          settings: currentSettings
        });

        // Aplicar tema
        applyTheme(theme);

        document.getElementById('settings-message').textContent = 'Configuración guardada correctamente.';
        document.getElementById('settings-message').style.color = 'green';
      } catch (error) {
        console.error('Error guardando configuración:', error);
        document.getElementById('settings-message').textContent = 'Error al guardar configuración.';
        document.getElementById('settings-message').style.color = 'red';
      }
    });
  };

  const destroy = () => {};

  render();
const layout = createAppLayout(container, '#settings');

return {
  render,
  destroy,
  element: layout.element
};
}