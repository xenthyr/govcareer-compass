/**
 * GovCareer Compass
 * ============================================================
 * Theme Manager
 * ============================================================
 */

import config, {
  STORAGE_KEYS
} from './config.js';

import {
  getItem,
  setItem
} from './storage.js';

const THEME_ATTRIBUTE =
  'data-theme';

const SYSTEM_THEME =
  'system';

function getSystemTheme() {
  return window.matchMedia?.(
    '(prefers-color-scheme: dark)'
  ).matches
    ? 'dark'
    : 'light';
}

function getStoredTheme() {
  const stored =
    getItem(
      STORAGE_KEYS.theme,
      null
    );

  if (
    config.app.supportedThemes.includes(
      stored
    )
  ) {
    return stored;
  }

  return config.app.defaultTheme;
}

function resolveTheme(
  preference
) {
  if (
    preference ===
    SYSTEM_THEME
  ) {
    return getSystemTheme();
  }

  if (
    preference ===
      'dark' ||
    preference ===
      'light'
  ) {
    return preference;
  }

  return getSystemTheme();
}

function applyTheme(
  preference,
  {
    persist = true,
    announce = true
  } = {}
) {
  const normalized =
    config.app.supportedThemes.includes(
      preference
    )
      ? preference
      : config.app.defaultTheme;

  const resolved =
    resolveTheme(
      normalized
    );

  document.documentElement.setAttribute(
    THEME_ATTRIBUTE,
    resolved
  );

  document.documentElement.dataset.themePreference =
    normalized;

  if (
    persist
  ) {
    setItem(
      STORAGE_KEYS.theme,
      normalized
    );
  }

  updateThemeControls(
    normalized
  );

  if (
    announce
  ) {
    document.dispatchEvent(
      new CustomEvent(
        'govcareer:themechange',
        {
          detail: {
            preference:
              normalized,
            resolved
          }
        }
      )
    );
  }

  return {
    preference:
      normalized,
    resolved
  };
}

function updateThemeControls(
  activeTheme
) {
  document
    .querySelectorAll(
      '[data-theme-value]'
    )
    .forEach(
      (control) => {
        const value =
          control.dataset.themeValue;

        const active =
          value ===
          activeTheme;

        control.classList.toggle(
          'is-active',
          active
        );

        if (
          control.matches(
            'button, [role="button"], input, option'
          )
        ) {
          control.setAttribute(
            'aria-pressed',
            String(
              active
            )
          );
        }
      }
    );

  document
    .querySelectorAll(
      '[data-theme-select]'
    )
    .forEach(
      (select) => {
        if (
          select.value !==
          activeTheme
        ) {
          select.value =
            activeTheme;
        }
      }
    );
}

function bindThemeControls() {
  document.addEventListener(
    'click',
    (event) => {
      const control =
        event.target.closest(
          '[data-theme-value]'
        );

      if (
        !control
      ) {
        return;
      }

      const value =
        control.dataset.themeValue;

      if (
        !value
      ) {
        return;
      }

      applyTheme(
        value
      );
    }
  );

  document.addEventListener(
    'change',
    (event) => {
      const select =
        event.target.closest(
          '[data-theme-select]'
        );

      if (
        !select
      ) {
        return;
      }

      applyTheme(
        select.value
      );
    }
  );
}

function bindSystemThemeChanges() {
  const mediaQuery =
    window.matchMedia?.(
      '(prefers-color-scheme: dark)'
    );

  if (
    !mediaQuery
  ) {
    return;
  }

  const handler =
    () => {
      const preference =
        document.documentElement
          .dataset
          .themePreference;

      if (
        preference ===
        SYSTEM_THEME
      ) {
        applyTheme(
          SYSTEM_THEME,
          {
            persist: false
          }
        );
      }
    };

  if (
    typeof mediaQuery.addEventListener ===
    'function'
  ) {
    mediaQuery.addEventListener(
      'change',
      handler
    );
  } else if (
    typeof mediaQuery.addListener ===
    'function'
  ) {
    mediaQuery.addListener(
      handler
    );
  }
}

function initializeTheme() {
  const preference =
    getStoredTheme();

  applyTheme(
    preference,
    {
      persist: false,
      announce: false
    }
  );

  bindThemeControls();

  bindSystemThemeChanges();
}

export {
  getSystemTheme,
  getStoredTheme,
  resolveTheme,
  applyTheme,
  initializeTheme
};

export default {
  applyTheme,
  initializeTheme,
  getStoredTheme
};
