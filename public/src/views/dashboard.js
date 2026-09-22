import { auth } from '../services/firebase-init.js';
import { createAppLayout } from '../components/app-layout.js';

export default function dashboardView() {
  const container = document.createElement('div');
  container.className = 'dashboard-container';

  const render = () => {
    const user = auth.currentUser;

    container.innerHTML = `
      <div class="dashboard-welcome">
        <h1>Bienvenido a Mi Organizador</h1>

        <p class="dashboard-user">
          Hola, <strong>${user?.email || 'Usuario'}</strong>
        </p>

        <p>
          Selecciona una opción del menú para comenzar.
        </p>

        <div class="dashboard-cards">

          <a href="#calendar" class="dashboard-card">
            <span class="dashboard-card-icon">📅</span>
            <h3>Calendario</h3>
            <p>Organiza tus eventos y actividades.</p>
          </a>

          <a href="#metrics" class="dashboard-card">
            <span class="dashboard-card-icon">📊</span>
            <h3>Métricas</h3>
            <p>Consulta información y estadísticas.</p>
          </a>

          <a href="#inventory" class="dashboard-card">
            <span class="dashboard-card-icon">📦</span>
            <h3>Inventario</h3>
            <p>Administra tus productos.</p>
          </a>

          <a href="#sales" class="dashboard-card">
            <span class="dashboard-card-icon">🛒</span>
            <h3>Ventas</h3>
            <p>Gestiona tus ventas.</p>
          </a>

          <a href="#reminders" class="dashboard-card">
            <span class="dashboard-card-icon">🔔</span>
            <h3>Recordatorios</h3>
            <p>No olvides tus tareas importantes.</p>
          </a>

          <a href="#settings" class="dashboard-card">
            <span class="dashboard-card-icon">⚙️</span>
            <h3>Configuración</h3>
            <p>Personaliza tu aplicación.</p>
          </a>

        </div>
      </div>
    `;
  };

  render();

  const layout = createAppLayout(container, '#dashboard');

  const destroy = () => {
    // Limpieza futura si es necesaria
  };

  return {
    render,
    destroy,
    element: layout.element
  };
}