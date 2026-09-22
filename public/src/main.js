// main.js
import { auth } from './services/firebase-init.js';
import { onAuthStateChanged } from 'firebase/auth';
import { initRouter, navigateTo } from './router.js';

console.log('Aplicación iniciada');

// Inicializar el router (escucha cambios de hash)
initRouter();
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Usuario logueado:', user.email);
    const hash = window.location.hash;
    if (hash === '#login' || hash === '#register' || !hash) {
      window.location.hash = '#dashboard';
    } else {
      navigateTo(window.location.hash);
    }
  } else {
    console.log('Usuario no logueado');
    window.location.hash = '#login';
  }
});
// Registrar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('Service Worker registrado', reg))
    .catch(err => console.error('Error al registrar SW', err));
}