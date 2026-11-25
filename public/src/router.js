// router.js

const routes = {

  // Autenticación
  '#login': () => import('./views/login.js'),
  '#register': () => import('./views/register.js'),

  // Aplicación
  '#dashboard': () => import('./views/dashboard.js'),
  '#calendar': () => import('./views/calendar.js'),
  '#settings': () => import('./views/settings.js'),
  '#metrics': () => import('./views/metrics.js'),
  '#sales': () => import('./views/sales.js'),
  '#inventory': () => import('./views/inventory.js'),
  '#materials': () => import('./views/materials.js'),
  '#prices': () => import('./views/prices.js'),

};

let currentView = null;

export async function navigateTo(hash) {

  const route = hash || '#login';

  const loadView = routes[route];

  // Ruta inexistente
  if (!loadView) {
    console.warn('Ruta no encontrada:', route);
    window.location.hash = '#login';
    return;
  }

  // Limpiar vista anterior
  if (
    currentView &&
    typeof currentView.destroy === 'function'
  ) {
    currentView.destroy();
  }

  try {

    const module = await loadView();

    const viewFactory = module.default;

    if (typeof viewFactory !== 'function') {
      console.error(
        'La vista no exporta una función por defecto'
      );
      return;
    }

    // Crear vista
    currentView = await viewFactory();

    const app = document.getElementById('app');

    app.innerHTML = '';

    if (currentView.element) {
      app.appendChild(currentView.element);
    } else {
      console.warn('La vista no tiene elemento');
    }

  } catch (error) {

    console.error(
      'Error cargando la vista:',
      error
    );

  }
}


// Escuchar cambios de ruta
window.addEventListener('hashchange', () => {
  navigateTo(window.location.hash);
});


// Inicializar router
export function initRouter() {
  navigateTo(window.location.hash || '#login');
}