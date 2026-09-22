// Aplica los colores del tema al documento usando variables CSS
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme.primary) root.style.setProperty('--color-primary', theme.primary);
  if (theme.secondary) root.style.setProperty('--color-secondary', theme.secondary);
  if (theme.background) root.style.setProperty('--color-background', theme.background);
  if (theme.surface) root.style.setProperty('--color-surface', theme.surface);
  // También guardamos en localStorage para que persista entre recargas sin esperar Firestore
  localStorage.setItem('theme', JSON.stringify(theme));
}

// Cargar tema desde localStorage (para inicio rápido)
export function loadThemeFromStorage() {
  const stored = localStorage.getItem('theme');
  if (stored) {
    try {
      const theme = JSON.parse(stored);
      applyTheme(theme);
      return theme;
    } catch (e) {
      return null;
    }
  }
  return null;
}