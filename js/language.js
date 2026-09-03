/**
 * GovCareer Compass
 * ============================================================
 * Internationalization Manager
 * ============================================================
 *
 * Canonical application language service.
 *
 * Current languages:
 * - English
 * - Bengali
 *
 * Responsibilities:
 * - Load locale dictionaries from config.data.i18n.
 * - Support nested translation keys.
 * - Resolve active-language values before configured fallback-language values.
 * - Preserve explicit caller fallback and key fallback behavior.
 * - Persist the selected locale through STORAGE_KEYS.
 * - Update <html lang=""> and <html dir="">.
 * - Maintain language/direction data attributes.
 * - Update DOM translation bindings safely.
 * - Support interpolation.
 * - Handle missing translations non-fatally while emitting diagnostics.
 * - Emit canonical language lifecycle events.
 * - Prevent duplicate listeners during repeated initialization.
 * - Support future configured languages without component rewrites.
 *
 * Architectural boundaries:
 * - config.js owns public locale configuration.
 * - storage.js owns persistence.
 * - data/i18n/*.json owns translation content.
 * - UI components consume this service; they do not own translations.
 *
 * This module contains no career, eligibility, scoring, ranking,
 * database or AI business logic.
 */

import config, {
  STORAGE_KEYS
} from './config.js';

import {
  getItem,
  setItem
} from './storage.js';


/* ============================================================
 * INTERNAL STATE
 * ============================================================ */

let translations =
  {};

let activeLanguage =
  resolveConfiguredDefaultLanguage();

let activeFallbackLanguage =
  resolveConfiguredFallbackLanguage();

const loadedLanguages =
  new Map();

let controlsBound =
  false;


/* ============================================================
 * CONSTANTS
 * ============================================================ */

const LANGUAGE_ATTRIBUTE =
  'data-language';

const DIRECTION_ATTRIBUTE =
  'data-direction';

const ACTIVE_LANGUAGE_EVENT =
  'gcc:languagechange';

const COMPATIBILITY_LANGUAGE_EVENT =
  'govcareer:languagechange';

const READY_EVENT =
  'govcareer:i18n-ready';

const MISSING_KEY_EVENT =
  'govcareer:i18n-missing';

const LANGUAGE_ERROR_EVENT =
  'govcareer:languageerror';


/* ============================================================
 * CONFIGURATION HELPERS
 * ============================================================ */

function getConfiguredLanguages() {
  const configured =
    config?.app?.supportedLanguages;

  if (
    !Array.isArray(
      configured
    )
  ) {
    return [];
  }

  return [
    ...new Set(
      configured
        .map(
          normalizeLanguageCode
        )
        .filter(Boolean)
    )
  ];
}


function normalizeLanguageCode(
  language
) {
  return String(
    language ?? ''
  )
    .trim()
    .toLowerCase()
    .replace(
      /_/g,
      '-'
    );
}


function resolveConfiguredDefaultLanguage() {
  const supported =
    getConfiguredLanguages();

  const configured =
    normalizeLanguageCode(
      config?.app?.defaultLanguage
    );

  if (
    configured &&
    supported.includes(
      configured
    )
  ) {
    return configured;
  }

  return (
    supported[0] ||
    'en'
  );
}


function resolveConfiguredFallbackLanguage() {
  const supported =
    getConfiguredLanguages();

  const configured =
    normalizeLanguageCode(
      config?.app?.fallbackLanguage
    );

  if (
    configured &&
    supported.includes(
      configured
    )
  ) {
    return configured;
  }

  /*
   * A configured fallback is preferred. When it is omitted or invalid,
   * the configured default language becomes the deterministic fallback.
   */
  return resolveConfiguredDefaultLanguage();
}


/* ============================================================
 * LANGUAGE METADATA
 * ============================================================ */

/**
 * Read locale metadata from config without embedding translation content.
 *
 * Canonical config.js currently exposes:
 *
 *   config.app.languages
 *   config.app.languageMeta
 *   config.app.languageMetadata
 *   config.app.languageDirections
 *
 * The feature-detection order keeps this service extensible while still
 * using one configuration source.
 */
function getLanguageMetadata(
  language
) {
  const normalized =
    normalizeLanguageCode(
      language
    );

  const collections = [
    config?.app?.languages,
    config?.app?.languageMeta,
    config?.app?.languageMetadata
  ];

  for (
    const collection of collections
  ) {
    if (
      !collection ||
      typeof collection !==
        'object'
    ) {
      continue;
    }

    const entry =
      collection[
        normalized
      ];

    if (
      typeof entry ===
        'string'
    ) {
      return {
        direction:
          normalizeDirection(
            entry
          )
      };
    }

    if (
      entry &&
      typeof entry ===
        'object'
    ) {
      return {
        ...entry,
        direction:
          normalizeDirection(
            entry.direction ||
            entry.dir
          )
      };
    }
  }

  const directions =
    config?.app?.languageDirections;

  if (
    directions &&
    typeof directions ===
      'object'
  ) {
    return {
      direction:
        normalizeDirection(
          directions[
            normalized
          ]
        )
    };
  }

  return {
    direction:
      'ltr'
  };
}


function normalizeDirection(
  direction
) {
  const normalized =
    String(
      direction ?? ''
    )
      .trim()
      .toLowerCase();

  return normalized ===
    'rtl'
    ? 'rtl'
    : 'ltr';
}


/* ============================================================
 * PERSISTENCE
 * ============================================================ */

function getStoredLanguage() {
  const supported =
    getConfiguredLanguages();

  const stored =
    normalizeLanguageCode(
      getItem(
        STORAGE_KEYS.language,
        null
      )
    );

  if (
    stored &&
    supported.includes(
      stored
    )
  ) {
    return stored;
  }

  return resolveConfiguredDefaultLanguage();
}


/* ============================================================
 * TRANSLATION RESOURCE PATHS
 * ============================================================ */

function getLanguagePath(
  language
) {
  const normalized =
    normalizeLanguageCode(
      language
    );

  const i18n =
    config?.data?.i18n;

  if (
    i18n &&
    typeof i18n ===
      'object'
  ) {
    const path =
      i18n[
        normalized
      ];

    if (
      typeof path ===
        'string' &&
      path.trim()
    ) {
      return path;
    }
  }

  /*
   * Compatibility with future configuration structures.
   *
   * These do not introduce additional configuration sources at runtime;
   * they merely allow the service to consume the same configured map if
   * the shape is reorganized later.
   */
  const alternateMaps = [
    config?.data?.locales,
    config?.data?.languages
  ];

  for (
    const map of alternateMaps
  ) {
    if (
      map &&
      typeof map ===
        'object'
    ) {
      const path =
        map[
          normalized
        ];

      if (
        typeof path ===
          'string' &&
        path.trim()
      ) {
        return path;
      }
    }
  }

  return '';
}


function assertSupportedLanguage(
  language
) {
  const normalized =
    normalizeLanguageCode(
      language
    );

  const supported =
    getConfiguredLanguages();

  if (
    !normalized ||
    !supported.includes(
      normalized
    )
  ) {
    throw new Error(
      `Unsupported language: ${language}`
    );
  }

  return normalized;
}


/* ============================================================
 * LOCALE LOADING / CACHING
 * ============================================================ */

/**
 * Load a locale dictionary.
 *
 * loadedLanguages may contain either:
 *
 *   Promise<object>
 *
 * while the locale is loading, or:
 *
 *   object
 *
 * after resolution.
 *
 * Failed loads are removed from the cache so a later retry remains possible.
 */
async function loadLanguage(
  language
) {
  const normalized =
    assertSupportedLanguage(
      language
    );

  const cached =
    loadedLanguages.get(
      normalized
    );

  if (
    cached
  ) {
    return await cached;
  }

  const path =
    getLanguagePath(
      normalized
    );

  if (
    !path
  ) {
    throw new Error(
      `No translation file configured for language "${normalized}".`
    );
  }

  const loadPromise =
    fetch(
      path,
      {
        method:
          'GET',

        headers: {
          Accept:
            'application/json'
        },

        cache:
          'default'
      }
    )
      .then(
        async (
          response
        ) => {
          if (
            !response.ok
          ) {
            throw new Error(
              `Unable to load language "${normalized}". HTTP ${response.status}.`
            );
          }

          const data =
            await response.json();

          if (
            !data ||
            typeof data !==
              'object' ||
            Array.isArray(
              data
            )
          ) {
            throw new Error(
              `Translation file for "${normalized}" must contain a JSON object.`
            );
          }

          return data;
        }
      )
      .catch(
        (
          error
        ) => {
          loadedLanguages.delete(
            normalized
          );

          throw error;
        }
      );

  loadedLanguages.set(
    normalized,
    loadPromise
  );

  return await loadPromise;
}


async function ensureLanguageDictionary(
  language
) {
  const normalized =
    assertSupportedLanguage(
      language
    );

  const cached =
    loadedLanguages.get(
      normalized
    );

  if (
    cached &&
    typeof cached.then !==
      'function'
  ) {
    return cached;
  }

  const dictionary =
    await loadLanguage(
      normalized
    );

  loadedLanguages.set(
    normalized,
    dictionary
  );

  return dictionary;
}


async function preloadLanguages(
  languages = []
) {
  const requested =
    Array.isArray(
      languages
    )
      ? languages
      : [
          languages
        ];

  const normalized =
    [
      ...new Set(
        requested
          .map(
            normalizeLanguageCode
          )
          .filter(Boolean)
      )
    ];

  return Promise.all(
    normalized.map(
      language =>
        ensureLanguageDictionary(
          language
        )
    )
  );
}


function getCachedDictionary(
  language
) {
  const normalized =
    normalizeLanguageCode(
      language
    );

  const cached =
    loadedLanguages.get(
      normalized
    );

  if (
    !cached
  ) {
    return null;
  }

  if (
    typeof cached.then ===
      'function'
  ) {
    return null;
  }

  if (
    typeof cached !==
      'object' ||
    Array.isArray(
      cached
    )
  ) {
    return null;
  }

  return cached;
}


/* ============================================================
 * NESTED LOOKUP
 * ============================================================ */

function deepGet(
  object,
  path
) {
  if (
    object === null ||
    object === undefined ||
    !path
  ) {
    return undefined;
  }

  const segments =
    Array.isArray(
      path
    )
      ? path
      : String(
          path
        )
          .split('.')
          .filter(Boolean);

  return segments.reduce(
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

      if (
        typeof current !==
          'object'
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


function resolveTranslationValue(
  dictionary,
  key
) {
  return deepGet(
    dictionary,
    key
  );
}


/* ============================================================
 * INTERPOLATION
 * ============================================================ */

/**
 * Supports both interpolation conventions used by the project:
 *
 *   {name}
 *
 * and:
 *
 *   {{name}}
 *
 * Nested variable paths are supported:
 *
 *   {user.name}
 *   {{user.name}}
 */
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

  const values =
    variables &&
    typeof variables ===
      'object'
      ? variables
      : {};

  return text.replace(
    /\{\{\s*([^{}]+?)\s*\}\}|\{\s*([A-Za-z0-9_$.-]+)\s*\}/g,
    (
      _match,
      doubleBraceVariable,
      singleBraceVariable
    ) => {
      const variablePath =
        (
          doubleBraceVariable ??
          singleBraceVariable ??
          ''
        ).trim();

      const value =
        deepGet(
          values,
          variablePath
        );

      return (
        value === undefined ||
        value === null
      )
        ? ''
        : String(
            value
          );
    }
  );
}


/* ============================================================
 * TRANSLATION FALLBACKS
 * ============================================================ */

function isTranslationLeaf(
  value
) {
  return (
    typeof value ===
      'string' ||
    typeof value ===
      'number'
  );
}


function resolveMissingTranslation(
  key,
  fallback
) {
  if (
    fallback !==
      undefined &&
    fallback !==
      null
  ) {
    const explicit =
      String(
        fallback
      );

    if (
      explicit !==
      ''
    ) {
      return explicit;
    }
  }

  return String(
    key
  );
}


function emitMissingKey(
  key,
  language
) {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }

  const detail = {
    key,
    language,
    fallbackLanguage:
      activeFallbackLanguage
  };

  document.dispatchEvent(
    new CustomEvent(
      MISSING_KEY_EVENT,
      {
        detail
      }
    )
  );
}


/* ============================================================
 * SYNCHRONOUS TRANSLATION API
 * ============================================================ */

/**
 * Synchronous translation API.
 *
 * Resolution:
 *
 *   1. active language
 *   2. configured fallback language
 *   3. explicit caller fallback
 *   4. translation key
 *
 * The fallback dictionary must already be cached for synchronous fallback
 * resolution. initializeLanguage() and setLanguage() guarantee that under
 * normal application startup/change flows.
 */
function translate(
  key,
  variables = {},
  fallback = ''
) {
  const normalizedKey =
    String(
      key ?? ''
    ).trim();

  if (
    !normalizedKey
  ) {
    return (
      fallback ||
      ''
    );
  }

  let value =
    resolveTranslationValue(
      translations,
      normalizedKey
    );

  if (
    isTranslationLeaf(
      value
    )
  ) {
    return interpolate(
      String(
        value
      ),
      variables
    );
  }

  const fallbackDictionary =
    getCachedDictionary(
      activeFallbackLanguage
    );

  if (
    fallbackDictionary
  ) {
    value =
      resolveTranslationValue(
        fallbackDictionary,
        normalizedKey
      );

    if (
      isTranslationLeaf(
        value
      )
    ) {
      return interpolate(
        String(
          value
        ),
        variables
      );
    }
  }

  emitMissingKey(
    normalizedKey,
    activeLanguage
  );

  return interpolate(
    resolveMissingTranslation(
      normalizedKey,
      fallback
    ),
    variables
  );
}


/* ============================================================
 * ASYNCHRONOUS TRANSLATION API
 * ============================================================ */

async function translateAsync(
  key,
  variables = {},
  fallback = ''
) {
  const normalizedKey =
    String(
      key ?? ''
    ).trim();

  if (
    !normalizedKey
  ) {
    return (
      fallback ||
      ''
    );
  }

  let value =
    resolveTranslationValue(
      translations,
      normalizedKey
    );

  if (
    isTranslationLeaf(
      value
    )
  ) {
    return interpolate(
      String(
        value
      ),
      variables
    );
  }

  const fallbackLanguage =
    activeFallbackLanguage;

  if (
    fallbackLanguage &&
    fallbackLanguage !==
      activeLanguage
  ) {
    try {
      const fallbackDictionary =
        await ensureLanguageDictionary(
          fallbackLanguage
        );

      value =
        resolveTranslationValue(
          fallbackDictionary,
          normalizedKey
        );

      if (
        isTranslationLeaf(
          value
        )
      ) {
        return interpolate(
          String(
            value
          ),
          variables
        );
      }
    } catch {
      /*
       * Explicit fallback/key fallback remains available below.
       */
    }
  }

  emitMissingKey(
    normalizedKey,
    activeLanguage
  );

  return interpolate(
    resolveMissingTranslation(
      normalizedKey,
      fallback
    ),
    variables
  );
}


/* ============================================================
 * DOM TRANSLATION VARIABLES
 * ============================================================ */

function getElementTranslationVariables(
  element
) {
  const raw =
    element?.dataset
      ?.i18nVars;

  if (
    !raw
  ) {
    return {};
  }

  try {
    const parsed =
      JSON.parse(
        raw
      );

    return (
      parsed &&
      typeof parsed ===
        'object' &&
      !Array.isArray(
        parsed
      )
        ? parsed
        : {}
    );
  } catch {
    return {};
  }
}


/**
 * Preserve the original DOM fallback instead of allowing translated
 * content from a previous language to become the next fallback.
 */
function getElementFallback(
  element
) {
  const existing =
    element.dataset
      .i18nFallback;

  if (
    existing !==
      undefined
  ) {
    return existing;
  }

  const fallback =
    element.textContent ??
    '';

  element.dataset.i18nFallback =
    fallback;

  return fallback;
}


/* ============================================================
 * DOM TRANSLATION
 * ============================================================ */

function updateTranslatedElements() {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }

  document
    .querySelectorAll(
      '[data-i18n]'
    )
    .forEach(
      element => {
        const key =
          element.dataset.i18n;

        if (
          !key
        ) {
          return;
        }

        const translated =
          translate(
            key,
            getElementTranslationVariables(
              element
            ),
            getElementFallback(
              element
            )
          );

        /*
         * Translation data is inserted as text rather than HTML.
         */
        element.textContent =
          String(
            translated ?? ''
          );
      }
    );


  document
    .querySelectorAll(
      '[data-i18n-placeholder]'
    )
    .forEach(
      element => {
        const key =
          element.dataset.i18nPlaceholder;

        if (
          !key
        ) {
          return;
        }

        const fallback =
          getAttributeFallback(
            element,
            'placeholder'
          );

        element.setAttribute(
          'placeholder',
          String(
            translate(
              key,
              getElementTranslationVariables(
                element
              ),
              fallback
            ) ?? ''
          )
        );
      }
    );


  document
    .querySelectorAll(
      '[data-i18n-aria-label]'
    )
    .forEach(
      element => {
        const key =
          element.dataset.i18nAriaLabel;

        if (
          !key
        ) {
          return;
        }

        const fallback =
          getAttributeFallback(
            element,
            'aria-label'
          );

        element.setAttribute(
          'aria-label',
          String(
            translate(
              key,
              getElementTranslationVariables(
                element
              ),
              fallback
            ) ?? ''
          )
        );
      }
    );


  document
    .querySelectorAll(
      '[data-i18n-title]'
    )
    .forEach(
      element => {
        const key =
          element.dataset.i18nTitle;

        if (
          !key
        ) {
          return;
        }

        const fallback =
          getAttributeFallback(
            element,
            'title'
          );

        element.setAttribute(
          'title',
          String(
            translate(
              key,
              getElementTranslationVariables(
                element
              ),
              fallback
            ) ?? ''
          )
        );
      }
    );
}


function getAttributeFallback(
  element,
  attribute
) {
  const datasetKey =
    `i18nFallback${toDatasetSuffix(
      attribute
    )}`;

  const existing =
    element.dataset[
      datasetKey
    ];

  if (
    existing !==
      undefined
  ) {
    return existing;
  }

  const fallback =
    element.getAttribute(
      attribute
    ) || '';

  element.dataset[
    datasetKey
  ] =
    fallback;

  return fallback;
}


function toDatasetSuffix(
  attribute
) {
  return String(
    attribute
  )
    .split('-')
    .map(
      (part, index) =>
        index === 0
          ? part
          : part
              .charAt(0)
              .toUpperCase() +
            part.slice(1)
    )
    .join('');
}


/* ============================================================
 * DOCUMENT LANGUAGE / DIRECTION
 * ============================================================ */

function updateDocumentLocale(
  language
) {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }

  const normalized =
    normalizeLanguageCode(
      language
    );

  const metadata =
    getLanguageMetadata(
      normalized
    );

  const direction =
    metadata.direction;

  document.documentElement.lang =
    normalized;

  document.documentElement.dir =
    direction;

  document.documentElement.setAttribute(
    LANGUAGE_ATTRIBUTE,
    normalized
  );

  document.documentElement.setAttribute(
    DIRECTION_ATTRIBUTE,
    direction
  );

  /*
   * Dataset mirrors are intentionally kept because they are convenient for
   * CSS, diagnostics and components that already use data attributes.
   */
  document.documentElement.dataset.language =
    normalized;

  document.documentElement.dataset.direction =
    direction;
}


/* ============================================================
 * LANGUAGE CONTROL STATE
 * ============================================================ */

function updateLanguageControls() {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }

  document
    .querySelectorAll(
      '[data-language-value]'
    )
    .forEach(
      control => {
        const controlLanguage =
          normalizeLanguageCode(
            control.dataset.languageValue
          );

        const active =
          controlLanguage ===
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

        control.toggleAttribute(
          'data-language-active',
          active
        );
      }
    );


  document
    .querySelectorAll(
      '[data-language-select]'
    )
    .forEach(
      select => {
        if (
          select.value !==
          activeLanguage
        ) {
          select.value =
            activeLanguage;
        }
      }
    );
}


/* ============================================================
 * EVENTS
 * ============================================================ */

/**
 * Emit one consistent detail object for both event namespaces.
 *
 * Canonical:
 *   gcc:languagechange
 *
 * Compatibility:
 *   govcareer:languagechange
 */
function emitLanguageChange(
  language,
  previousLanguage =
    null
) {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }

  const metadata =
    getLanguageMetadata(
      language
    );

  const detail = {
    language,

    previousLanguage,

    direction:
      metadata.direction,

    fallbackLanguage:
      activeFallbackLanguage
  };

  document.dispatchEvent(
    new CustomEvent(
      ACTIVE_LANGUAGE_EVENT,
      {
        detail
      }
    )
  );

  document.dispatchEvent(
    new CustomEvent(
      COMPATIBILITY_LANGUAGE_EVENT,
      {
        detail
      }
    )
  );
}


function emitLanguageReady() {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }

  const metadata =
    getLanguageMetadata(
      activeLanguage
    );

  document.dispatchEvent(
    new CustomEvent(
      READY_EVENT,
      {
        detail: {
          language:
            activeLanguage,

          direction:
            metadata.direction,

          fallbackLanguage:
            activeFallbackLanguage
        }
      }
    )
  );
}


function emitLanguageError(
  language,
  error
) {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }

  document.dispatchEvent(
    new CustomEvent(
      LANGUAGE_ERROR_EVENT,
      {
        detail: {
          language,
          error
        }
      }
    )
  );
}


/* ============================================================
 * SET LANGUAGE
 * ============================================================ */

/**
 * Activate a language only after its dictionary is available.
 *
 * The configured fallback dictionary is also loaded before the language
 * state is committed. This makes synchronous translate() deterministic
 * following initialization or an explicit language switch.
 */
async function setLanguage(
  language,
  {
    persist = true,
    announce = true
  } = {}
) {
  const normalized =
    assertSupportedLanguage(
      language
    );

  const previousLanguage =
    activeLanguage;

  /*
   * Load requested language first. A failed requested locale must not replace
   * a currently working locale.
   */
  const dictionary =
    await ensureLanguageDictionary(
      normalized
    );

  const configuredFallback =
    resolveConfiguredFallbackLanguage();

  /*
   * The fallback may equal the active language. In that case the active
   * dictionary already fulfills both roles.
   */
  if (
    configuredFallback &&
    configuredFallback !==
      normalized
  ) {
    await ensureLanguageDictionary(
      configuredFallback
    );
  }

  /*
   * Commit state after successful loading.
   */
  translations =
    dictionary;

  activeLanguage =
    normalized;

  activeFallbackLanguage =
    configuredFallback;

  updateDocumentLocale(
    normalized
  );

  updateTranslatedElements();

  updateLanguageControls();

  if (
    persist
  ) {
    setItem(
      STORAGE_KEYS.language,
      normalized
    );
  }

  if (
    announce
  ) {
    emitLanguageChange(
      normalized,
      previousLanguage
    );
  }

  return normalized;
}


/* ============================================================
 * LANGUAGE CONTROLS
 * ============================================================ */

function bindLanguageControls() {
  if (
    controlsBound ||
    typeof document ===
      'undefined'
  ) {
    return;
  }

  controlsBound =
    true;

  document.addEventListener(
    'click',
    handleLanguageControlClick
  );

  document.addEventListener(
    'change',
    handleLanguageControlChange
  );
}


function handleLanguageControlClick(
  event
) {
  const control =
    event.target?.closest?.(
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
    !language
  ) {
    return;
  }

  void setLanguage(
    language
  ).catch(
    error => {
      console.error(
        'Language change failed:',
        error
      );

      emitLanguageError(
        language,
        error
      );
    }
  );
}


function handleLanguageControlChange(
  event
) {
  const select =
    event.target?.closest?.(
      '[data-language-select]'
    );

  if (
    !select
  ) {
    return;
  }

  /*
   * language-selector.js also owns generated selector controls.
   *
   * It listens for the same change event and calls setLanguage() itself.
   * Avoid handling those generated selectors twice while retaining support
   * for data-language-select controls outside the component.
   */
  if (
    select.closest?.(
      '[data-language-selector]'
    )
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
    error => {
      console.error(
        'Language change failed:',
        error
      );

      emitLanguageError(
        language,
        error
      );
    }
  );
}


/* ============================================================
 * INITIALIZATION
 * ============================================================ */

async function initializeLanguage() {
  bindLanguageControls();

  const preferred =
    getStoredLanguage();

  const fallback =
    resolveConfiguredFallbackLanguage();

  try {
    /*
     * Load preferred locale first.
     */
    await ensureLanguageDictionary(
      preferred
    );

    /*
     * Load fallback before synchronous translation calls become active.
     */
    if (
      fallback &&
      fallback !==
        preferred
    ) {
      await ensureLanguageDictionary(
        fallback
      );
    }

    /*
     * setLanguage() will reuse both already-resolved dictionary entries.
     * It does not announce a user language change during bootstrap.
     */
    await setLanguage(
      preferred,
      {
        persist:
          false,

        announce:
          false
      }
    );

    emitLanguageReady();

    return activeLanguage;
  } catch (
    preferredError
  ) {
    /*
     * The preferred stored locale may be temporarily unavailable. Attempt
     * the configured fallback before failing application initialization.
     */
    const rescue =
      fallback ||
      resolveConfiguredDefaultLanguage();

    if (
      rescue ===
      preferred
    ) {
      throw preferredError;
    }

    try {
      await setLanguage(
        rescue,
        {
          persist:
            false,

          announce:
            false
        }
      );

      emitLanguageReady();

      return activeLanguage;
    } catch (
      rescueError
    ) {
      throw new Error(
        `Unable to initialize i18n. Preferred language "${preferred}" failed and fallback "${rescue}" also failed.`,
        {
          cause:
            rescueError
        }
      );
    }
  }
}


/* ============================================================
 * PUBLIC STATE / CONFIG APIs
 * ============================================================ */

function getCurrentLanguage() {
  return activeLanguage;
}


function getFallbackLanguage() {
  return activeFallbackLanguage;
}


function getSupportedLanguages() {
  return [
    ...getConfiguredLanguages()
  ];
}


function getLanguageDirection(
  language = activeLanguage
) {
  return getLanguageMetadata(
    language
  ).direction;
}


function getTranslations() {
  return translations;
}


/**
 * Clear one or all locale dictionary caches.
 *
 * This does not change the active language or persisted locale.
 * Intended for tests and explicit refresh workflows.
 */
function clearLanguageCache(
  language = null
) {
  if (
    language !==
      null &&
    language !==
      undefined
  ) {
    loadedLanguages.delete(
      normalizeLanguageCode(
        language
      )
    );

    return;
  }

  loadedLanguages.clear();
}


/* ============================================================
 * EXPORTS
 * ============================================================ */

export {
  loadLanguage,
  preloadLanguages,

  deepGet,
  translate,
  translateAsync,

  setLanguage,

  getCurrentLanguage,
  getFallbackLanguage,
  getSupportedLanguages,
  getLanguageMetadata,
  getLanguageDirection,
  getTranslations,

  updateTranslatedElements,
  updateLanguageControls,
  updateDocumentLocale,

  bindLanguageControls,
  initializeLanguage,

  clearLanguageCache
};


export default {
  translate,
  translateAsync,

  setLanguage,

  getCurrentLanguage,
  getFallbackLanguage,
  getSupportedLanguages,
  getLanguageMetadata,
  getLanguageDirection,

  initializeLanguage
};
