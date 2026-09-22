import { auth } from '../services/firebase-init.js';
import { signOut } from 'firebase/auth';

export function createNavigation(activeRoute = '') {
  const navigation = document.createElement('aside');
  navigation.className = 'app-navigation';

  const user = auth.currentUser;

  navigation.innerHTML = `
    <div class="navigation-header">

      <div class="navigation-logo">
        <img
          id="navigation-logo-img"
          src=""
          alt="Logo"
          style="display: none;"
        />

        <h3>Mi Organizador</h3>
      </div>

      <button
        type="button"
        class="navigation-close"
        id="navigation-close"
        aria-label="Cerrar menú"
      >
        ✕
      </button>

    </div>

    <nav class="navigation-menu">

      <a href="#dashboard"class="navigation-link ${activeRoute === '#dashboard' ? 'active' : ''}">
        <span class="navigation-icon">🏠</span>
        <span>Inicio</span>
      </a>

      <a href="#calendar" class="navigation-link ${activeRoute === '#calendar' ? 'active' : ''}">
        <span class="navigation-icon">📅</span>
        <span>Calendario</span>
      </a>

      <a href="#metrics" class="navigation-link ${activeRoute === '#metrics' ? 'active' : ''}">
        <span class="navigation-icon">📊</span>
        <span>Métricas</span>
      </a>

      <a href="#inventory" class="navigation-link ${activeRoute === '#inventory' ? 'active' : ''}">
        <span class="navigation-icon">📦</span>
        <span>Inventario</span>
      </a>

      <a href="#prices" class="navigation-link ${activeRoute === '#prices' ? 'active' : ''}">
        <span class="navigation-icon">💰</span>
        <span>Precios</span>
      </a>

      <a href="#sales" class="navigation-link ${activeRoute === '#sales' ? 'active' : ''}">
        <span class="navigation-icon">🛒</span>
        <span>Ventas</span>
      </a>

      <a href="#reminders" class="navigation-link ${activeRoute === '#reminders' ? 'active' : ''}">
        <span class="navigation-icon">🔔</span>
        <span>Recordatorios</span>
      </a>

      <a href="#settings" class="navigation-link ${activeRoute === '#settings' ? 'active' : ''}">
        <span class="navigation-icon">⚙️</span>
        <span>Configuración</span>
      </a>

    </nav>

    <div class="navigation-footer">

      <div class="navigation-user">
        <span class="navigation-user-icon">👤</span>
        <span class="navigation-user-email">
          ${user?.email || 'Usuario'}
        </span>
      </div>

      <button
        type="button"
        id="navigation-logout"
        class="navigation-logout"
      >
        🚪 Cerrar sesión
      </button>

    </div>
  `;

  // Logo guardado
  const storedLogo = localStorage.getItem('logoURL');

  if (storedLogo) {
    const logo = navigation.querySelector('#navigation-logo-img');

    if (logo) {
      logo.src = storedLogo;
      logo.style.display = 'block';
    }
  }

  // Cerrar menú en mobile
  const closeButton = navigation.querySelector('#navigation-close');

  closeButton.addEventListener('click', () => {
    navigation.classList.remove('mobile-open');
  });

  // Navegación
  const links = navigation.querySelectorAll('.navigation-link');

  links.forEach(link => {
    link.addEventListener('click', () => {

      // En mobile cerramos el menú después de seleccionar
      navigation.classList.remove('mobile-open');

    });
  });

  // Logout
  const logoutButton = navigation.querySelector('#navigation-logout');

  logoutButton.addEventListener('click', async () => {

    try {
      await signOut(auth);
      window.location.hash = '#login';
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }

  });

  return navigation;
}

export function createMobileNavigationButton() {

  const button = document.createElement('button');

  button.type = 'button';
  button.className = 'mobile-navigation-button';

  button.innerHTML = '☰';

  button.setAttribute('aria-label', 'Abrir menú');

  button.addEventListener('click', () => {

    const navigation = document.querySelector('.app-navigation');

    if (navigation) {
      navigation.classList.toggle('mobile-open');
    }

  });

  return button;
}