/**
 * GovCareer Compass
 * Theme manager
 *
 * Supported values:
 * - light
 * - dark
 * - system
 */

import config from './config.js';
import storage from './storage.js';

const STORAGE_KEY = config.storageKeys.theme;
const THEMES = ['light', 'dark', 'system'];

function getSystemTheme() {
  if (
    typeof window === 'undefined' ||
    !window.matchMedia
  ) {
    return 'light';
  }

  return window.matchMedia(
    '(prefers-color-scheme: dark)'
  ).matches
    ? 'dark'
    : 'light';
}

function getEffectiveTheme(theme) {
  return theme === 'system'
    ? getSystemTheme()
    : theme;
}

function normalizeTheme(theme) {
  return THEMES.includes(theme)
    ? theme
    : config.app.defaultTheme;
}

function applyTheme(theme, { persist = true } = {}) {
  const normalized = normalizeTheme(theme);
  const effective = getEffectiveTheme(normalized);

  document.documentElement.dataset.theme = effective;
  document.documentElement.dataset.themePreference =
    normalized;

  document.documentElement.style.colorScheme = effective;

  updateThemeControls(normalized);

  if (persist) {
    storage.set(STORAGE_KEY, normalized);
  }

  window.dispatchEvent(
    new CustomEvent('gcc:themechange', {
      detail: {
        preference: normalized,
        effective
      }
    })
  );

  return {
    preference: normalized,
    effective
  };
}

function getTheme() {
  return normalizeTheme(
    storage.get(STORAGE_KEY, config.app.defaultTheme)
  );
}

function toggleTheme() {
  const current = getEffectiveTheme(getTheme());
  return applyTheme(
    current === 'dark'
      ? 'light'
      : 'dark'
  );
}

function updateThemeControls(theme) {
  const controls = document.querySelectorAll(
    '[data-theme-control]'
  );

  controls.forEach((control) => {
    const value = control.dataset.themeControl;

    control.setAttribute(
      'aria-pressed',
      String(value === theme)
    );

    if (
      control instanceof HTMLSelectElement ||
      control instanceof HTMLInputElement
    ) {
      if (control.type === 'radio') {
        control.checked = value === theme;
      } else if (control.tagName === 'SELECT') {
        control.value = theme;
      }
    }
  });

  document.querySelectorAll(
    '[data-theme-label]'
  ).forEach((element) => {
    element.textContent = theme;
  });
}

function bindThemeControls(root = document) {
  root
    .querySelectorAll('[data-theme-control]')
    .forEach((control) => {
      if (control.dataset.themeBound === 'true') {
        return;
      }

      control.dataset.themeBound = 'true';

      control.addEventListener('click', () => {
        const theme = control.dataset.themeControl;

        if (THEMES.includes(theme)) {
          applyTheme(theme);
        }
      });

      if (
        control instanceof HTMLSelectElement
      ) {
        control.addEventListener(
          'change',
          () => {
            applyTheme(control.value);
          }
        );
      }
    });

  root
    .querySelectorAll('[data-theme-toggle]')
    .forEach((control) => {
      if (control.dataset.themeBound === 'true') {
        return;
      }

      control.dataset.themeBound = 'true';

      control.addEventListener(
        'click',
        toggleTheme
      );
    });
}

function watchSystemTheme() {
  if (!window.matchMedia) {
    return;
  }

  const media = window.matchMedia(
    '(prefers-color-scheme: dark)'
  );

  const handler = () => {
    const currentPreference = getTheme();

    if (currentPreference === 'system') {
      applyTheme('system', {
        persist: false
      });
    }
  };

  if (typeof media.addEventListener === 'function') {
    media.addEventListener(
      'change',
      handler
    );
  } else if (
    typeof media.addListener === 'function'
  ) {
    media.addListener(handler);
  }
}

function initTheme() {
  applyTheme(getTheme(), {
    persist: false
  });

  bindThemeControls();
  watchSystemTheme();
}

export {
  initTheme,
  applyTheme,
  getTheme,
  toggleTheme,
  bindThemeControls,
  getEffectiveTheme
};

export default {
  initTheme,
  applyTheme,
  getTheme,
  toggleTheme,
  bindThemeControls,
  getEffectiveTheme
};
