/**
 * GovCareer Compass
 * Global application bootstrap
 *
 * This file initializes the common application layer used
 * across all static pages.
 */

import config from './config.js';

import storage from './storage.js';

import {
  initTheme
} from './theme.js';

import {
  initLanguage
} from './language.js';

import {
  initRouter
} from './router.js';

import {
  initNavigation
} from './navigation.js';

import {
  initSearch
} from './search.js';

import {
  initModal
} from './modal.js';

import {
  initShare
} from './share.js';

import {
  initExport
} from './export.js';

const appState = {
  initialized: false,
  ready: false,
  currentPage: null,
  language: config.app.defaultLanguage,
  errors: []
};

function getCurrentPageName() {
  const page =
    document.body.dataset.page;

  if (page) {
    return page;
  }

  const path =
    window.location.pathname;

  const file =
    path
      .split('/')
      .filter(Boolean)
      .pop();

  if (!file) {
    return 'home';
  }

  return file
    .replace(
      /\.html?$/i,
      ''
    )
    .replace(
      /[-_]/g,
      '-'
    );
}

function setCurrentPage() {
  appState.currentPage =
    getCurrentPageName();

  document.body.dataset
    .currentPage =
    appState.currentPage;
}

function announceReady() {
  window.dispatchEvent(
    new CustomEvent(
      'gcc:appready',
      {
        detail: {
          config,
          state: appState
        }
      }
    )
  );
}

function createGlobalToastRoot() {
  if (
    document.querySelector(
      '[data-toast-root]'
    )
  ) {
    return;
  }

  const root =
    document.createElement(
      'div'
    );

  root.dataset.toastRoot =
    'true';

  root.className =
    'toast-region';

  root.setAttribute(
    'aria-live',
    'polite'
  );

  root.setAttribute(
    'aria-atomic',
    'true'
  );

  document.body.appendChild(
    root
  );
}

function showToast(
  message,
  {
    type = 'info',
    duration =
      config.ui.toastDuration
  } = {}
) {
  createGlobalToastRoot();

  const root =
    document.querySelector(
      '[data-toast-root]'
    );

  if (!root) {
    return;
  }

  const toast =
    document.createElement(
      'div'
    );

  toast.className =
    `toast toast--${type}`;

  toast.setAttribute(
    'role',
    'status'
  );

  toast.innerHTML = `
    <span class="toast__message">
      ${escapeHtml(message)}
    </span>

    <button
      type="button"
      class="toast__close"
      aria-label="Dismiss notification"
    >
      ×
    </button>
  `;

  const closeButton =
    toast.querySelector(
      '.toast__close'
    );

  closeButton.addEventListener(
    'click',
    () => removeToast(toast)
  );

  root.appendChild(
    toast
  );

  requestAnimationFrame(() => {
    toast.classList.add(
      'is-visible'
    );
  });

  window.setTimeout(
    () => removeToast(toast),
    duration
  );
}

function removeToast(
  toast
) {
  if (!toast) {
    return;
  }

  toast.classList.remove(
    'is-visible'
  );

  window.setTimeout(
    () => toast.remove(),
    220
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function installGlobalAPI() {
  window.gcc = Object.freeze({
    config,

    state: appState,

    storage,

    toast: showToast
  });
}

function bindGlobalBehaviors() {
  document.addEventListener(
    'click',
    (event) => {
      const anchor =
        event.target.closest(
          'a[href]'
        );

      if (!anchor) {
        return;
      }

      const href =
        anchor.getAttribute(
          'href'
        );

      if (
        !href ||
        href.startsWith(
          '#'
        ) ||
        href.startsWith(
          'mailto:'
        ) ||
        href.startsWith(
          'tel:'
        ) ||
        href.startsWith(
          'javascript:'
        ) ||
        anchor.target ===
          '_blank'
      ) {
        return;
      }

      const isExternal =
        (() => {
          try {
            const url =
              new URL(
                href,
                window.location.href
              );

            return (
              url.origin !==
              window.location.origin
            );
          } catch {
            return false;
          }
        })();

      if (isExternal) {
        return;
      }

      anchor.classList.add(
        'is-navigating'
      );
    }
  );

  window.addEventListener(
    'error',
    (event) => {
      appState.errors.push({
        type: 'runtime',
        message:
          event.message ||
          'Unknown runtime error'
      });

      console.error(
        'GovCareer Compass runtime error:',
        event.error ||
          event.message
      );
    }
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      appState.errors.push({
        type: 'promise',
        message: String(
          event.reason
        )
      });

      console.error(
        'GovCareer Compass promise error:',
        event.reason
      );
    }
  );
}

async function initializeCore() {
  if (
    appState.initialized
  ) {
    return appState;
  }

  appState.initialized =
    true;

  setCurrentPage();

  installGlobalAPI();

  createGlobalToastRoot();

  bindGlobalBehaviors();

  /*
   * Theme is initialized first because
   * we want to prevent visual inconsistency.
   */
  initTheme();

  /*
   * Localization must be ready before
   * page modules render localized UI.
   */
  try {
    await initLanguage();
  } catch (error) {
    appState.errors.push({
      type: 'language',
      message:
        String(error)
    });

    console.error(
      'Language initialization failed:',
      error
    );
  }

  initRouter();

  initNavigation();

  initModal();

  initShare();

  initExport();

  /*
   * Search is optional on individual pages.
   * A failed search index must not prevent
   * the rest of the website from loading.
   */
  try {
    await initSearch();
  } catch (error) {
    appState.errors.push({
      type: 'search',
      message:
        String(error)
    });

    console.error(
      'Search initialization failed:',
      error
    );
  }

  appState.language =
    storage.get(
      config.storageKeys.language,
      config.app.defaultLanguage
    );

  appState.ready =
    true;

  announceReady();

  return appState;
}

async function initApp() {
  try {
    await initializeCore();

    /*
     * Individual page controllers can listen
     * for gcc:appready and initialize themselves.
     *
     * Example:
     *
     * window.addEventListener(
     *   'gcc:appready',
     *   () => initCareerFinder()
     * );
     */
    return appState;
  } catch (error) {
    appState.errors.push({
      type: 'fatal',
      message:
        String(error)
    });

    console.error(
      'GovCareer Compass failed to initialize:',
      error
    );

    showToast(
      'Some application features could not be initialized.',
      {
        type: 'error'
      }
    );

    return appState;
  }
}

function getAppState() {
  return {
    ...appState,
    errors: [
      ...appState.errors
    ]
  };
}

if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      initApp();
    },
    {
      once: true
    }
  );
} else {
  initApp();
}

export {
  initApp,
  initializeCore,
  getAppState,
  showToast
};

export default {
  initApp,
  initializeCore,
  getAppState,
  showToast
};
