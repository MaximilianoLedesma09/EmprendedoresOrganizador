import {
  createNavigation,
  createMobileNavigationButton
} from './app-navigation.js';

export function createAppLayout(contentElement, activeRoute = '') {

  const layout = document.createElement('div');

  layout.className = 'app-layout';

  const navigation = createNavigation(activeRoute);

  const mainContent = document.createElement('main');

  mainContent.className = 'app-main-content';

  const mobileButton = createMobileNavigationButton();

  mainContent.appendChild(mobileButton);
  mainContent.appendChild(contentElement);

  layout.appendChild(navigation);
  layout.appendChild(mainContent);

  return {
    element: layout,
    navigation,
    mainContent
  };
}