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
 * - Load locale dictionaries from config/data/i18n.
 * - Support nested translation keys.
 * - Resolve missing active-language keys through a fallback language.
 * - Persist the selected locale.
 * - Update <html lang=""> and <html dir="">.
 * - Update DOM translation bindings.
 * - Handle missing translation keys without breaking UI rendering.
 * - Emit language-change lifecycle events.
 * - Support future language expansion without changing stable record IDs.
 *
 * Important architecture rule:
 * UI components must not hard-code translations that belong in
 * data/i18n dictionaries. Components should use translation keys.
 */

import config, {
  STORAGE_KEYS
} from './config.js';

import {
  getItem,
  setItem
} from './storage.js';


/* --------------------------------------------------------------------------
 * Internal state
 * -------------------------------------------------------------------------- */

let translations = {};

let activeLanguage =
  resolveConfiguredDefaultLanguage();

let activeFallbackLanguage =
  resolveConfiguredFallbackLanguage();

const loadedLanguages =
  new Map();

let controlsBound =
  false;


/* --------------------------------------------------------------------------
 * Configuration helpers
 * -------------------------------------------------------------------------- */

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

  const configuredFallback =
    normalizeLanguageCode(
      config?.app?.fallbackLanguage
    );

  if (
    configuredFallback &&
    supported.includes(
      configuredFallback
    )
  ) {
    return configuredFallback;
  }

  /*
   * The default application language is the natural fallback when a separate
   * fallbackLanguage is not configured.
   */
  return resolveConfiguredDefaultLanguage();
}


/**
 * Resolve locale metadata from config.
 *
 * Supported future shapes include:
 *
 * config.app.languages = {
 *   en: {
 *     direction: 'ltr'
 *   },
 *   bn: {
 *     direction: 'ltr'
 *   }
 * }
 *
 * or:
 *
 * config.app.languageMeta = {
 *   en: {
 *     direction: 'ltr'
 *   }
 * }
 *
 * or:
 *
 * config.app.languageDirections = {
 *   en: 'ltr'
 * }
 *
 * LTR remains the safe default for unsupported/missing metadata.
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
      typeof entry === 'string'
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
      typeof entry === 'object'
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


/* --------------------------------------------------------------------------
 * Persistence
 * -------------------------------------------------------------------------- */

function getStoredLanguage() {
  const stored =
    normalizeLanguageCode(
      getItem(
        STORAGE_KEYS.language,
        null
      )
    );

  const supported =
    getConfiguredLanguages();

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


/* --------------------------------------------------------------------------
 * Translation resource loading
 * -------------------------------------------------------------------------- */

function getLanguagePath(
  language
) {
  const normalized =
    normalizeLanguageCode(
      language
    );

  /*
   * Current canonical config:
   * config.data.i18n[language]
   *
   * Additional supported future structures are intentionally feature-detected
   * so the service does not have to be rewritten when config is reorganized.
   */
  const configuredMaps = [
    config?.data?.i18n,
    config?.data?.locales,
    config?.data?.languages
  ];

  for (
    const map of configuredMaps
  ) {
    if (
      map &&
      typeof map === 'object' &&
      map[
        normalized
      ]
    ) {
      return map[
        normalized
      ];
    }
  }

  return '';
}


/**
 * Validate that the supplied locale is actually configured.
 */
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


/**
 * Load one locale dictionary.
 *
 * Loading is cached by locale. Concurrent callers share the same Promise
 * through the cache entry rather than issuing duplicate requests.
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
    /*
     * A cached Promise is supported during loading; after resolution the
     * dictionary itself is retained.
     */
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
          /*
           * A rejected Promise must not poison the cache permanently.
           */
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


/**
 * Preload multiple languages.
 *
 * Useful when the application wants instant language switching after startup.
 */
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
      (
        language
      ) =>
        loadLanguage(
          language
        )
    )
  );
}


/* --------------------------------------------------------------------------
 * Nested translation lookup
 * -------------------------------------------------------------------------- */

function deepGet(
  object,
  path
) {
  if (
    !object ||
    typeof object !==
      'object' ||
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


/**
 * Resolve either a leaf value or a localized object.
 *
 * Translation dictionaries normally contain leaf strings, but returning an
 * object unchanged is useful for structured translation resources and keeps
 * lookup generic.
 */
function resolveTranslationValue(
  dictionary,
  key
) {
  return deepGet(
    dictionary,
    key
  );
}


/* --------------------------------------------------------------------------
 * Interpolation
 * -------------------------------------------------------------------------- */

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
    typeof variables === 'object'
      ? variables
      : {};


  return text.replace(
    /\{\{\s*([^}]+?)\s*\}\}/g,
    (
      _match,
      variablePath
    ) => {
      const value =
        deepGet(
          values,
          String(
            variablePath
          ).trim()
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


/* --------------------------------------------------------------------------
 * Missing-key handling
 * -------------------------------------------------------------------------- */

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
  const explicitFallback =
    fallback !== undefined &&
    fallback !== null &&
    String(
      fallback
    ) !== ''
      ? String(
          fallback
        )
      : '';


  if (
    explicitFallback
  ) {
    return explicitFallback;
  }


  /*
   * Missing keys should remain diagnosable during development. Returning the
   * key is preferable to rendering "undefined" or throwing a runtime error.
   */
  return String(
    key
  );
}


/**
 * Emit a diagnostic event for missing keys.
 *
 * This is intentionally non-fatal. Production UI must continue to render.
 */
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


  document.dispatchEvent(
    new CustomEvent(
      'govcareer:i18n-missing',
      {
        detail: {
          key,
          language
        }
      }
    )
  );
}


/* --------------------------------------------------------------------------
 * Translation API
 * -------------------------------------------------------------------------- */

/**
 * Translate a nested key.
 *
 * Resolution order:
 *
 * 1. Active language
 * 2. Configured fallback language
 * 3. Explicit caller fallback
 * 4. Translation key itself
 *
 * The fallback dictionary is loaded lazily only when needed and only when
 * possible.
 *
 * IMPORTANT:
 * translate() is intentionally synchronous to preserve the existing API.
 * It therefore uses dictionaries that have already been loaded.
 *
 * For guaranteed fallback availability before synchronous translation calls,
 * initializeLanguage() loads both the preferred and fallback dictionaries.
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


  /*
   * Fallback dictionary is represented separately in the cache and is loaded
   * during initialization/setLanguage where possible.
   */
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


/**
 * Asynchronous translation lookup.
 *
 * Useful when a caller needs fallback resolution even though the fallback
 * locale has not yet been loaded.
 */
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
      const dictionary =
        await loadLanguage(
          fallbackLanguage
        );


      value =
        resolveTranslationValue(
          dictionary,
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
       * Caller fallback/key is still returned below.
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


  /*
   * During normal initialization the Promise resolves before translations
   * are exposed. This helper deliberately only returns already-resolved
   * dictionaries.
   */
  if (
    cached &&
    typeof cached.then ===
      'function'
  ) {
    return null;
  }


  if (
    cached &&
    typeof cached ===
      'object'
  ) {
    return cached;
  }


  return null;
}


/* --------------------------------------------------------------------------
 * Dictionary cache finalization
 * -------------------------------------------------------------------------- */

/**
 * Replace cached Promise values with resolved dictionaries.
 *
 * This keeps synchronous translate() useful after initialization.
 */
async function cacheDictionary(
  language,
  dictionary
) {
  const normalized =
    normalizeLanguageCode(
      language
    );

  loadedLanguages.set(
    normalized,
    dictionary
  );

  return dictionary;
}


/**
 * Because loadLanguage() supports concurrent Promise caching, this helper
 * retrieves the dictionary and converts its cache entry into the resolved
 * dictionary representation.
 */
async function ensureLanguageDictionary(
  language
) {
  const normalized =
    assertSupportedLanguage(
      language
    );

  const dictionary =
    await loadLanguage(
      normalized
    );

  await cacheDictionary(
    normalized,
    dictionary
  );

  return dictionary;
}


/* --------------------------------------------------------------------------
 * DOM translation updates
 * -------------------------------------------------------------------------- */

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
      (element) => {
        const key =
          element.dataset.i18n;

        if (
          !key
        ) {
          return;
        }


        const fallback =
          element.dataset.i18nFallback ??
          element.textContent ??
          key;


        const translated =
          translate(
            key,
            getElementTranslationVariables(
              element
            ),
            fallback
          );


        /*
         * textContent is intentionally used rather than innerHTML.
         * Translation data must not become executable HTML.
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
      (element) => {
        const key =
          element.dataset.i18nPlaceholder;

        if (
          !key
        ) {
          return;
        }


        const fallback =
          element.getAttribute(
            'placeholder'
          ) || key;


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
      (element) => {
        const key =
          element.dataset.i18nAriaLabel;

        if (
          !key
        ) {
          return;
        }


        const fallback =
          element.getAttribute(
            'aria-label'
          ) || key;


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
      (element) => {
        const key =
          element.dataset.i18nTitle;

        if (
          !key
        ) {
          return;
        }


        const fallback =
          element.getAttribute(
            'title'
          ) || key;


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


/**
 * Optional per-element interpolation variables.
 *
 * Example:
 *
 * <span
 *   data-i18n="welcome.user"
 *   data-i18n-vars='{"name":"Abhijit"}'
 * ></span>
 *
 * Invalid JSON is ignored safely.
 */
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
        'object'
        ? parsed
        : {}
    );
  } catch {
    return {};
  }
}


/* --------------------------------------------------------------------------
 * Document language/direction
 * -------------------------------------------------------------------------- */

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


  document.documentElement.lang =
    normalized;


  document.documentElement.dir =
    metadata.direction;


  /*
   * Useful for CSS/layout systems that want a language-specific hook without
   * hard-coding language assumptions into individual components.
   */
  document.documentElement.dataset.language =
    normalized;


  document.documentElement.dataset.direction =
    metadata.direction;
}


/* --------------------------------------------------------------------------
 * Language controls
 * -------------------------------------------------------------------------- */

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
      (control) => {
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


        /*
         * Keep a canonical language marker available for styling/accessibility
         * while preserving existing data attributes.
         */
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
      (select) => {
        select.value =
          activeLanguage;
      }
    );
}


/* --------------------------------------------------------------------------
 * Language change events
 * -------------------------------------------------------------------------- */

function emitLanguageChange(
  language
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
    direction:
      metadata.direction,
    fallbackLanguage:
      activeFallbackLanguage
  };


  /*
   * REQUIRED compatibility event.
   *
   * Compass AI and other global components depend on exactly:
   * gcc:languagechange
   */
  document.dispatchEvent(
    new CustomEvent(
      'gcc:languagechange',
      {
        detail
      }
    )
  );


  /*
   * Existing application event is retained for compatibility with components
   * already listening to the previous namespace.
   */
  document.dispatchEvent(
    new CustomEvent(
      'govcareer:languagechange',
      {
        detail
      }
    )
  );
}


/* --------------------------------------------------------------------------
 * Set language
 * -------------------------------------------------------------------------- */

/**
 * Activate a language.
 *
 * The active locale is only changed after the requested dictionary loads
 * successfully. This prevents a failed network request from leaving the
 * application claiming to be in a locale whose dictionary was not loaded.
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


  /*
   * Load active dictionary first.
   */
  const dictionary =
    await ensureLanguageDictionary(
      normalized
    );


  /*
   * Ensure the configured fallback dictionary is available whenever it is
   * different from the active locale. This makes synchronous translate()
   * fallback deterministic after initialization/switching.
   */
  const fallbackLanguage =
    resolveConfiguredFallbackLanguage();


  if (
    fallbackLanguage &&
    fallbackLanguage !==
      normalized
  ) {
    try {
      await ensureLanguageDictionary(
        fallbackLanguage
      );
    } catch (
      error
    ) {
      /*
       * Active language remains usable. Missing keys will fall back to the
       * explicit caller fallback or the key itself.
       */
      console.warn(
        `Unable to preload fallback language "${fallbackLanguage}".`,
        error
      );
    }
  }


  /*
   * Commit state only after the requested dictionary is available.
   */
  translations =
    dictionary;

  activeLanguage =
    normalized;

  activeFallbackLanguage =
    fallbackLanguage;


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
      normalized
    );


    if (
      typeof document !==
      'undefined'
    ) {
      document.dispatchEvent(
        new CustomEvent(
          'govcareer:i18n-ready',
          {
            detail: {
              language:
                normalized,
              direction:
                getLanguageMetadata(
                  normalized
                ).direction,
              fallbackLanguage:
                activeFallbackLanguage
            }
          }
        )
      );
    }
  }


  return normalized;
}


/* --------------------------------------------------------------------------
 * Language controls binding
 * -------------------------------------------------------------------------- */

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
    (
      error
    ) => {
      console.error(
        'Language change failed:',
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


  void setLanguage(
    select.value
  ).catch(
    (
      error
    ) => {
      console.error(
        'Language change failed:',
        error
      );
    }
  );
}


/* --------------------------------------------------------------------------
 * Initialization
 * -------------------------------------------------------------------------- */

async function initializeLanguage() {
  bindLanguageControls();


  const preferred =
    getStoredLanguage();


  const fallback =
    resolveConfiguredFallbackLanguage();


  try {
    /*
     * Load preferred language and fallback together before exposing the
     * application as initialized.
     */
    await ensureLanguageDictionary(
      preferred
    );


    if (
      fallback &&
      fallback !==
        preferred
    ) {
      try {
        await ensureLanguageDictionary(
          fallback
        );
      } catch (
        error
      ) {
        console.warn(
          `Unable to load fallback language "${fallback}".`,
          error
        );
      }
    }


    await setLanguage(
      preferred,
      {
        persist: false,
        announce: false
      }
    );


    /*
     * Emit ready separately from language-change because initialization is
     * not a user-requested language switch.
     */
    if (
      typeof document !==
      'undefined'
    ) {
      document.dispatchEvent(
        new CustomEvent(
          'govcareer:i18n-ready',
          {
            detail: {
              language:
                activeLanguage,
              direction:
                getLanguageMetadata(
                  activeLanguage
                ).direction,
              fallbackLanguage:
                activeFallbackLanguage
            }
          }
        )
      );
    }


    return activeLanguage;
  } catch (
    preferredError
  ) {
    /*
     * Preferred locale failed. Try configured fallback/default locale before
     * giving up.
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
          persist: false,
          announce: false
        }
      );


      if (
        typeof document !==
        'undefined'
      ) {
        document.dispatchEvent(
          new CustomEvent(
            'govcareer:i18n-ready',
            {
              detail: {
                language:
                  activeLanguage,
                direction:
                  getLanguageMetadata(
                    activeLanguage
                  ).direction,
                fallbackLanguage:
                  activeFallbackLanguage
              }
            }
          )
        );
      }


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


/* --------------------------------------------------------------------------
 * Public state/config APIs
 * -------------------------------------------------------------------------- */

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
 * Clear locale caches.
 *
 * Useful for tests or explicit data refresh workflows.
 */
function clearLanguageCache(
  language = null
) {
  if (
    language
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


/* --------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

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
  getLanguageDirection,

  initializeLanguage
};
