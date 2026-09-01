/**
 * GovCareer Compass
 * ============================================================
 * Language Selector Component
 * ============================================================
 *
 * Current languages:
 *   English
 *   Bengali
 *
 * Future languages are controlled by config.js and the
 * /data/i18n/ directory.
 */

import config from '../config.js';

import {
  setLanguage,
  getCurrentLanguage
} from '../language.js';

const LANGUAGE_LABELS =
  Object.freeze({
    en:
      'English',

    bn:
      'বাংলা',

    hi:
      'हिन्दी',

    mr:
      'मराठी',

    ta:
      'தமிழ்',

    te:
      'తెలుగు',

    gu:
      'ગુજરાતી',

    or:
      'ଓଡ଼ିଆ',

    as:
      'অসমীয়া'
  });

function createLanguageSelector({
  compact = false
} = {}) {
  const supported =
    config?.app?.supportedLanguages || [
      'en',
      'bn'
    ];

  const active =
    getCurrentLanguage();

  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.className =
    compact
      ? 'language-selector language-selector--compact'
      : 'language-selector';

  wrapper.dataset.languageSelector =
    'true';

  const select =
    document.createElement(
      'select'
    );

  select.className =
    'language-selector__select';

  select.dataset.languageSelect =
    'true';

  select.setAttribute(
    'aria-label',
    'Choose language'
  );

  supported.forEach(
    (language) => {
      const option =
        document.createElement(
          'option'
        );

      option.value =
        language;

      option.textContent =
        LANGUAGE_LABELS[
          language
        ] ||
        language.toUpperCase();

      option.selected =
        language ===
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

function mountLanguageSelector(
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
    createLanguageSelector(
      options
    );

  mount.append(
    selector
  );

  return selector;
}

function bindLanguageSelector(
  root = document
) {
  root.addEventListener(
    'change',
    (event) => {
      const select =
        event.target.closest(
          '[data-language-select]'
        );

      if (
        !select
      ) {
        return;
      }

      const language =
        select.value;

      if (
        !language
      ) {
        return;
      }

      void setLanguage(
        language
      ).catch(
        (error) => {
          document.dispatchEvent(
            new CustomEvent(
              'govcareer:languageerror',
              {
                detail: {
                  error,
                  language
                }
              }
            )
          );
        }
      );
    }
  );
}

function syncLanguageSelector() {
  const current =
    getCurrentLanguage();

  document
    .querySelectorAll(
      '[data-language-select]'
    )
    .forEach(
      (select) => {
        if (
          select.value !==
          current
        ) {
          select.value =
            current;
        }
      }
    );
}

function initializeLanguageSelector() {
  bindLanguageSelector();

  document.addEventListener(
    'govcareer:languagechange',
    () => {
      syncLanguageSelector();
    }
  );

  syncLanguageSelector();
}

export {
  LANGUAGE_LABELS,
  createLanguageSelector,
  mountLanguageSelector,
  bindLanguageSelector,
  syncLanguageSelector,
  initializeLanguageSelector
};

export default {
  createLanguageSelector,
  mountLanguageSelector,
  initializeLanguageSelector
};
