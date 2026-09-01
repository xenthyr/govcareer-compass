/**
 * GovCareer Compass
 * Localization manager
 *
 * UI translations are loaded from:
 * /data/i18n/en.json
 * /data/i18n/bn.json
 *
 * Canonical IDs remain language-independent.
 */

import config from './config.js';
import storage from './storage.js';

const LANGUAGE_KEY = config.storageKeys.language;

let currentLanguage =
  config.app.defaultLanguage;

const dictionaryCache = new Map();

function normalizeLanguage(language) {
  return config.app.supportedLanguages.includes(
    language
  )
    ? language
    : config.app.defaultLanguage;
}

function getLanguage() {
  return currentLanguage;
}

async function loadDictionary(language) {
  const normalized =
    normalizeLanguage(language);

  if (dictionaryCache.has(normalized)) {
    return dictionaryCache.get(normalized);
  }

  const url =
    config.data.i18n[normalized];

  if (!url) {
    throw new Error(
      `No translation file configured for "${normalized}".`
    );
  }

  const response = await fetch(url, {
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error(
      `Failed to load language "${normalized}" (${response.status}).`
    );
  }

  const dictionary = await response.json();

  dictionaryCache.set(
    normalized,
    dictionary
  );

  return dictionary;
}

function resolvePath(object, path) {
  return path
    .split('.')
    .reduce(
      (current, key) =>
        current !== undefined &&
        current !== null
          ? current[key]
          : undefined,
      object
    );
}

function interpolate(text, variables = {}) {
  if (typeof text !== 'string') {
    return text;
  }

  return text.replace(
    /\{\{\s*([\w.-]+)\s*\}\}/g,
    (match, key) => {
      const value =
        resolvePath(variables, key);

      return value === undefined ||
        value === null
        ? match
        : String(value);
    }
  );
}

function translate(
  key,
  variables = {},
  fallback = key
) {
  const dictionary =
    dictionaryCache.get(currentLanguage);

  if (!dictionary) {
    return fallback;
  }

  const value =
    resolvePath(dictionary, key);

  if (
    typeof value !== 'string' &&
    typeof value !== 'number'
  ) {
    return fallback;
  }

  return interpolate(
    String(value),
    variables
  );
}

function translateElement(
  element,
  dictionary
) {
  const key =
    element.dataset.i18n;

  if (!key) {
    return;
  }

  const value =
    resolvePath(dictionary, key);

  if (
    value !== undefined &&
    value !== null
  ) {
    element.textContent =
      String(value);
  }

  if (element.dataset.i18nHtml === 'true') {
    element.innerHTML =
      String(value ?? '');
  }

  const attribute =
    element.dataset.i18nAttr;

  if (attribute) {
    const keys =
      attribute
        .split(',')
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);

    keys.forEach((attributeName) => {
      const attributeKey =
        element.dataset[
          `i18nAttr${capitalize(
            attributeName
          )}`
        ];

      if (!attributeKey) {
        return;
      }

      const translated =
        resolvePath(
          dictionary,
          attributeKey
        );

      if (
        translated !== undefined
      ) {
        element.setAttribute(
          attributeName,
          String(translated)
        );
      }
    });
  }
}

function capitalize(value) {
  return value
    ? value.charAt(0).toUpperCase() +
        value.slice(1)
    : value;
}

function applyTranslations(
  dictionary
) {
  document
    .querySelectorAll(
      '[data-i18n]'
    )
    .forEach((element) =>
      translateElement(
        element,
        dictionary
      )
    );

  document
    .querySelectorAll(
      '[data-i18n-placeholder]'
    )
    .forEach((element) => {
      const key =
        element.dataset.i18nPlaceholder;

      const value =
        resolvePath(
          dictionary,
          key
        );

      if (
        value !== undefined
      ) {
        element.setAttribute(
          'placeholder',
          String(value)
        );
      }
    });

  document
    .querySelectorAll(
      '[data-i18n-aria-label]'
    )
    .forEach((element) => {
      const key =
        element.dataset.i18nAriaLabel;

      const value =
        resolvePath(
          dictionary,
          key
        );

      if (
        value !== undefined
      ) {
        element.setAttribute(
          'aria-label',
          String(value)
        );
      }
    });

  document.documentElement.lang =
    currentLanguage === 'bn'
      ? 'bn'
      : 'en';
}

async function setLanguage(
  language,
  {
    persist = true,
    announce = true
  } = {}
) {
  const normalized =
    normalizeLanguage(language);

  const dictionary =
    await loadDictionary(
      normalized
    );

  currentLanguage =
    normalized;

  applyTranslations(
    dictionary
  );

  if (persist) {
    storage.set(
      LANGUAGE_KEY,
      normalized
    );
  }

  updateLanguageControls(
    normalized
  );

  window.dispatchEvent(
    new CustomEvent(
      'gcc:languagechange',
      {
        detail: {
          language: normalized
        }
      }
    )
  );

  if (
    announce &&
    window.gcc?.toast
  ) {
    const message =
      normalized === 'bn'
        ? 'ভাষা বাংলা করা হয়েছে।'
        : 'Language changed to English.';

    window.gcc.toast(
      message
    );
  }

  return normalized;
}

function updateLanguageControls(
  language
) {
  document
    .querySelectorAll(
      '[data-language-control]'
    )
    .forEach((control) => {
      const value =
        control.dataset.languageControl;

      control.setAttribute(
        'aria-pressed',
        String(
          value === language
        )
      );

      if (
        control instanceof HTMLSelectElement
      ) {
        control.value =
          language;
      }
    });

  document
    .querySelectorAll(
      '[data-current-language]'
    )
    .forEach((element) => {
      element.textContent =
        language === 'bn'
          ? 'বাংলা'
          : 'English';
    });
}

function bindLanguageControls(
  root = document
) {
  root
    .querySelectorAll(
      '[data-language-control]'
    )
    .forEach((control) => {
      if (
        control.dataset.languageBound ===
        'true'
      ) {
        return;
      }

      control.dataset.languageBound =
        'true';

      control.addEventListener(
        'click',
        async () => {
          const language =
            control.dataset
              .languageControl;

          try {
            await setLanguage(
              language
            );
          } catch (error) {
            console.error(
              'Language change failed:',
              error
            );
          }
        }
      );

      if (
        control instanceof HTMLSelectElement
      ) {
        control.addEventListener(
          'change',
          async () => {
            try {
              await setLanguage(
                control.value
              );
            } catch (error) {
              console.error(
                'Language change failed:',
                error
              );
            }
          }
        );
      }
    });
}

async function initLanguage() {
  const saved =
    normalizeLanguage(
      storage.get(
        LANGUAGE_KEY,
        config.app.defaultLanguage
      )
    );

  await setLanguage(
    saved,
    {
      persist: false,
      announce: false
    }
  );

  bindLanguageControls();
}

export {
  initLanguage,
  setLanguage,
  getLanguage,
  translate,
  loadDictionary,
  applyTranslations,
  bindLanguageControls
};

export default {
  initLanguage,
  setLanguage,
  getLanguage,
  translate,
  loadDictionary,
  applyTranslations,
  bindLanguageControls
};
