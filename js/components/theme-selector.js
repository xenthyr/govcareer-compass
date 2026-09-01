/**
 * GovCareer Compass
 * ============================================================
 * Theme Selector Component
 * ============================================================
 *
 * Supported application themes:
 *
 *   light
 *   dark
 *   system
 *
 * The actual state management belongs to /js/theme.js.
 * This component only provides the UI.
 */

import config from '../config.js';

import {
  applyTheme,
  getStoredTheme
} from '../theme.js';

function createThemeSelector({
  compact = false
} = {}) {
  const supported =
    config?.app?.supportedThemes || [
      'light',
      'dark',
      'system'
    ];

  const active =
    getStoredTheme();

  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.className =
    compact
      ? 'theme-selector theme-selector--compact'
      : 'theme-selector';

  wrapper.dataset.themeSelector =
    'true';

  const select =
    document.createElement(
      'select'
    );

  select.className =
    'theme-selector__select';

  select.dataset.themeSelect =
    'true';

  select.setAttribute(
    'aria-label',
    'Choose colour theme'
  );

  const labels = {
    light:
      'Light',

    dark:
      'Dark',

    system:
      'System'
  };

  supported.forEach(
    (theme) => {
      const option =
        document.createElement(
          'option'
        );

      option.value =
        theme;

      option.textContent =
        labels[
          theme
        ] ||
        theme;

      option.selected =
        theme ===
        active;

      select.append(
        option
      );
    }
  );

  wrapper.append(
    select
  );

  return wrapper;
}

function mountThemeSelector(
  container,
  options = {}
) {
  const mount =
    typeof container ===
      'string'
      ? document.querySelector(
          container
        )
      : container;

  if (
    !mount
  ) {
    return null;
  }

  mount.innerHTML =
    '';

  const selector =
    createThemeSelector(
      options
    );

  mount.append(
    selector
  );

  return selector;
}

function bindThemeSelector(
  root = document
) {
  root.addEventListener(
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

      const theme =
        select.value;

      try {
        applyTheme(
          theme
        );
      } catch (
        error
      ) {
        document.dispatchEvent(
          new CustomEvent(
            'govcareer:themeerror',
            {
              detail: {
                error
              }
            }
          )
        );
      }
    }
  );
}

function syncThemeSelector() {
  const preference =
    document.documentElement
      .dataset
      .themePreference ||
    getStoredTheme();

  document
    .querySelectorAll(
      '[data-theme-select]'
    )
    .forEach(
      (select) => {
        if (
          select.value !==
          preference
        ) {
          select.value =
            preference;
        }
      }
    );
}

function initializeThemeSelector() {
  bindThemeSelector();

  document.addEventListener(
    'govcareer:themechange',
    () => {
      syncThemeSelector();
    }
  );

  syncThemeSelector();
}

export {
  createThemeSelector,
  mountThemeSelector,
  bindThemeSelector,
  syncThemeSelector,
  initializeThemeSelector
};

export default {
  createThemeSelector,
  mountThemeSelector,
  initializeThemeSelector
};
