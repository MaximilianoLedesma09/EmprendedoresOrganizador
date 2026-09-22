// home.js
import { auth } from '../services/firebase-init.js';
import { signOut } from 'firebase/auth';
import { getUserData } from '../services/firestore-service.js';
import { applyTheme } from '../utils/theme.js';
import { createAppLayout } from '../components/app-layout.js';

export default async function homeView() {
  const container = document.createElement('div');
  container.className = 'home-view';

  let currentSection = 'dashboard';

  const render = async () => {
    try {
      const userData = await getUserData();
      const settings = userData.settings || {};
      const logoURL = settings.logoURL || '';
      const theme = settings.theme || {};

      applyTheme(theme);

      container.innerHTML = `
        <div class="dashboard-layout">
          <aside class="sidebar">
            <div class="sidebar-header">
              ${logoURL ? `<img src="${logoURL}" alt="Logo" class="sidebar-logo" />` : '<h3>Mi Organizador</h3>'}
            </div>
            <nav class="sidebar-nav">
              <a href="#" data-section="dashboard" class="active">📊 Panel</a>
              <a href="#" data-section="calendar">📅 Calendario</a>
              <a href="#" data-section="metrics">📈 Métricas</a>
              <a href="#" data-section="inventory">📦 Inventario</a>
              <a href="#" data-section="prices">💰 Precios</a>
              <a href="#" data-section="sales">🛒 Ventas</a>
              <a href="#" data-section="reminders">⏰ Recordatorios</a>
              <a href="#" data-section="settings">⚙️ Configuración</a>
            </nav>
            <div class="sidebar-footer">
              <button id="logout-btn" class="logout-btn">🚪 Cerrar sesión</button>
            </div>
          </aside>
          <main class="main-content">
            <div id="section-content">
              <h2>Cargando...</h2>
            </div>
          </main>
        </div>
      `;

      // Manejar navegación del sidebar
      const navLinks = container.querySelectorAll('.sidebar-nav a');
      const contentDiv = container.querySelector('#section-content');

      navLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
          e.preventDefault();
          navLinks.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          const section = link.dataset.section;
          await loadSection(section, contentDiv);
        });
      });

      // Cargar sección por defecto
      await loadSection('dashboard', contentDiv);

      // Logout
      const logoutBtn = container.querySelector('#logout-btn');
      logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.hash = '#login';
      });

    } catch (error) {
      console.error('Error cargando home:', error);
      container.innerHTML = `<p>Error al cargar el dashboard: ${error.message}</p>`;
    }
  };

  // Función para cargar dinámicamente las secciones
  const loadSection = async (section, target) => {
    try {
      switch (section) {
        case 'dashboard':
          target.innerHTML = `
            <h2>Panel de Control</h2>
            <p>Bienvenido a tu organizador. Aquí verás un resumen de tu actividad.</p>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap:1rem; margin-top:1rem;">
              <div class="card">📅 Calendario</div>
              <div class="card">📈 Métricas</div>
              <div class="card">📦 Inventario</div>
              <div class="card">💰 Precios</div>
              <div class="card">🛒 Ventas</div>
              <div class="card">⏰ Recordatorios</div>
            </div>
          `;
          break;

        case 'calendar':
          try {
            const { default: calendarView } = await import('./calendar.js');
            const calendarInstance = calendarView();
            target.innerHTML = '';
            target.appendChild(calendarInstance.element);
          } catch (error) {
            console.error('Error cargando calendario:', error);
            target.innerHTML = `<p>Error al cargar el calendario: ${error.message}</p>`;
          }
          break;

        case 'settings':
          const { default: settingsView } = await import('./settings.js');
          const settingsInstance = settingsView();
          target.innerHTML = '';
          target.appendChild(settingsInstance.element);
          break;

        default:
          target.innerHTML = `
            <h2>${section.charAt(0).toUpperCase() + section.slice(1)}</h2>
            <p>Esta sección estará disponible próximamente.</p>
          `;
      }
    } catch (error) {
      console.error('Error cargando sección:', error);
      target.innerHTML = `<p>Error al cargar la sección: ${error.message}</p>`;
    }
  };

  const destroy = () => {
    // limpieza
  };

  await render();
  const layout = createAppLayout(container, '#settings');
  return { render, destroy, element: layout.element };
}