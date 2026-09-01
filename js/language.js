/**
 * GovCareer Compass
 * ============================================================
 * Internationalization Manager
 * ============================================================
 *
 * Supported now:
 * - English
 * - Bengali
 *
 * Future languages can be added to config/data without changing
 * stable record IDs.
 */

import config, {
  STORAGE_KEYS
} from './config.js';

import {
  getItem,
  setItem
} from './storage.js';

let translations = {};
let activeLanguage =
  config.app.defaultLanguage;

const loadedLanguages =
  new Map();

function getStoredLanguage() {
  const stored =
    getItem(
      STORAGE_KEYS.language,
      null
    );

  if (
    config.app.supportedLanguages.includes(
      stored
    )
  ) {
    return stored;
  }

  return config.app.defaultLanguage;
}

async function loadLanguage(
  language
) {
  if (
    loadedLanguages.has(
      language
    )
  ) {
    return loadedLanguages.get(
      language
    );
  }

  const path =
    config.data.i18n[
      language
    ];

  if (
    !path
  ) {
    throw new Error(
      `No translation file configured for language "${language}".`
    );
  }

  const response =
    await fetch(
      path,
      {
        cache:
          'default'
      }
    );

  if (
    !response.ok
  ) {
    throw new Error(
      `Unable to load language "${language}". HTTP ${response.status}.`
    );
  }

  const data =
    await response.json();

  loadedLanguages.set(
    language,
    data
  );

  return data;
}

function deepGet(
  object,
  path
) {
  if (
    !path
  ) {
    return undefined;
  }

  return String(
    path
  )
    .split('.')
    .reduce(
      (
        current,
        key
      ) => {
        if (
          current === null ||
          current === undefined
        ) {
          return undefined;
        }

        return current[
          key
        ];
      },
      object
    );
}

function interpolate(
  text,
  variables = {}
) {
  if (
    typeof text !==
    'string'
  ) {
    return text;
  }

  return text.replace(
    /\{\{\s*([^}]+?)\s*\}\}/g,
    (
      _match,
      key
    ) => {
      const value =
        deepGet(
          variables,
          key.trim()
        );

      return value === undefined ||
        value === null
        ? ''
        : String(
            value
          );
    }
  );
}

function translate(
  key,
  variables = {},
  fallback = ''
) {
  const value =
    deepGet(
      translations,
      key
    );

  if (
    value === undefined ||
    value === null
  ) {
    return fallback ||
      key;
  }

  return interpolate(
    value,
    variables
  );
}

function updateTranslatedElements() {
  document
    .querySelectorAll(
      '[data-i18n]'
    )
    .forEach(
      (element) => {
        const key =
          element.dataset.i18n;

        if (
          !key
        ) {
          return;
        }

        const fallback =
          element.dataset.i18nFallback ||
          element.textContent ||
          key;

        element.textContent =
          translate(
            key,
            {},
            fallback
          );
      }
    );

  document
    .querySelectorAll(
      '[data-i18n-placeholder]'
    )
    .forEach(
      (element) => {
        const key =
          element.dataset.i18nPlaceholder;

        if (
          !key
        ) {
          return;
        }

        element.setAttribute(
          'placeholder',
          translate(
            key,
            {},
            element.getAttribute(
              'placeholder'
            ) || key
          )
        );
      }
    );

  document
    .querySelectorAll(
      '[data-i18n-aria-label]'
    )
    .forEach(
      (element) => {
        const key =
          element.dataset.i18nAriaLabel;

        if (
          !key
        ) {
          return;
        }

        element.setAttribute(
          'aria-label',
          translate(
            key,
            {},
            element.getAttribute(
              'aria-label'
            ) || key
          )
        );
      }
    );

  document
    .querySelectorAll(
      '[data-i18n-title]'
    )
    .forEach(
      (element) => {
        const key =
          element.dataset.i18nTitle;

        if (
          !key
        ) {
          return;
        }

        element.setAttribute(
          'title',
          translate(
            key,
            {},
            element.getAttribute(
              'title'
            ) || key
          )
        );
      }
    );
}

function updateLanguageControls() {
  document
    .querySelectorAll(
      '[data-language-value]'
    )
    .forEach(
      (control) => {
        const active =
          control.dataset.languageValue ===
          activeLanguage;

        control.classList.toggle(
          'is-active',
          active
        );

        if (
          control.matches(
            'button, [role="button"]'
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
      '[data-language-select]'
    )
    .forEach(
      (select) => {
        select.value =
          activeLanguage;
      }
    );
}

async function setLanguage(
  language,
  {
    persist = true,
    announce = true
  } = {}
) {
  const normalized =
    String(
      language || ''
    )
      .trim()
      .toLowerCase();

  if (
    !config.app.supportedLanguages.includes(
      normalized
    )
  ) {
    throw new Error(
      `Unsupported language: ${language}`
    );
  }

  const dictionary =
    await loadLanguage(
      normalized
    );

  translations =
    dictionary;

  activeLanguage =
    normalized;

  document.documentElement.lang =
    normalized;

  if (
    persist
  ) {
    setItem(
      STORAGE_KEYS.language,
      normalized
    );
  }

  updateTranslatedElements();

  updateLanguageControls();

  document.dispatchEvent(
    new CustomEvent(
      'govcareer:languagechange',
      {
        detail: {
          language:
            normalized
        }
      }
    )
  );

  if (
    announce
  ) {
    const event =
      new CustomEvent(
        'govcareer:i18n-ready',
        {
          detail: {
            language:
              normalized
          }
        }
      );

    document.dispatchEvent(
      event
    );
  }

  return normalized;
}

function bindLanguageControls() {
  document.addEventListener(
    'click',
    (event) => {
      const control =
        event.target.closest(
          '[data-language-value]'
        );

      if (
        !control
      ) {
        return;
      }

      const language =
        control.dataset.languageValue;

      if (
        language
      ) {
        void setLanguage(
          language
        ).catch(
          (error) => {
            console.error(
              'Language change failed:',
              error
            );
          }
        );
      }
    }
  );

  document.addEventListener(
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

      void setLanguage(
        select.value
      ).catch(
        (error) => {
          console.error(
            'Language change failed:',
            error
          );
        }
      );
    }
  );
}

async function initializeLanguage() {
  bindLanguageControls();

  const preferred =
    getStoredLanguage();

  try {
    await setLanguage(
      preferred,
      {
        persist: false,
        announce: false
      }
    );
  } catch {
    if (
      preferred !==
      config.app.defaultLanguage
    ) {
      await setLanguage(
        config.app.defaultLanguage,
        {
          persist: false,
          announce: false
        }
      );
    }
  }
}

function getCurrentLanguage() {
  return activeLanguage;
}

function getTranslations() {
  return translations;
}

export {
  loadLanguage,
  translate,
  setLanguage,
  getCurrentLanguage,
  getTranslations,
  initializeLanguage
};

export default {
  translate,
  setLanguage,
  getCurrentLanguage,
  initializeLanguage
};
