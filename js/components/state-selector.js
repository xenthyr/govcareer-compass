/**
 * GovCareer Compass
 * ============================================================
 * Government / State Selector Component
 * ============================================================
 *
 * CURRENT PRODUCT:
 *   West Bengal state-government data
 *   + Central Government
 *
 * FUTURE PRODUCT:
 *   Additional Indian states and union territories.
 *
 * ARCHITECTURAL ROLE:
 *   Presentation and interaction layer only.
 *
 * CANONICAL STATE SOURCE:
 *   config.data.common.states
 *
 *   The underlying registry is:
 *
 *   /data/common/states.json
 *
 * IMPORTANT:
 *   This component does not own the state database.
 *   It does not create a second state registry.
 *   It does not implement state-specific business logic.
 *
 * CANONICAL IDENTITIES:
 *
 *   State:
 *     west-bengal
 *
 *   West Bengal Government:
 *     west-bengal-government
 *
 * These are intentionally different identifiers.
 */


/* --------------------------------------------------------------------------
 * Dependencies
 * -------------------------------------------------------------------------- */

import config from '../config.js';

import {
  getCurrentLanguage
} from '../language.js';


/* ============================================================
 * CONSTANTS
 * ============================================================
 */

const STATE_STATUS =
  Object.freeze({
    AVAILABLE:
      'AVAILABLE',

    PLANNED:
      'PLANNED',

    DISABLED:
      'DISABLED'
  });


const CENTRAL_GOVERNMENT_ID =
  'CENTRAL';


const CANONICAL_WEST_BENGAL_STATE_ID =
  'west-bengal';


const STATE_VOCABULARY_READY_EVENT =
  'govcareer:state-vocabulary-ready';


const STATE_CHANGE_EVENT =
  'govcareer:statechange';


/*
 * This fallback is intentionally tiny and canonical.
 *
 * It exists only to keep the selector usable if the common state
 * registry cannot be loaded. It must never introduce an alternate
 * or legacy state identifier.
 *
 * The canonical registry remains the source of truth whenever it loads.
 */
const INITIAL_FALLBACK_STATES =
  Object.freeze([
    Object.freeze({
      id:
        CANONICAL_WEST_BENGAL_STATE_ID,

      name:
        Object.freeze({
          en:
            'West Bengal',

          bn:
            'পশ্চিমবঙ্গ'
        }),

      shortName:
        'WB',

      status:
        STATE_STATUS.AVAILABLE
    })
  ]);


/* --------------------------------------------------------------------------
 * Internal state
 * -------------------------------------------------------------------------- */

/*
 * Presentation-normalized state vocabulary.
 *
 * This is a runtime cache, not a canonical database.
 */
let configuredStates = [
  ...INITIAL_FALLBACK_STATES
];


/*
 * Only one canonical registry load may be active at a time.
 *
 * A Promise cache prevents repeated fetches if more than one selector
 * or initialization path requests the vocabulary concurrently.
 */
let stateVocabularyPromise =
  null;


/*
 * Prevent duplicate document-level lifecycle listeners when initialization
 * is called more than once.
 */
let stateEventsBound =
  false;


/*
 * Track whether the canonical registry has successfully replaced
 * the temporary fallback vocabulary.
 */
let canonicalVocabularyLoaded =
  false;


/* ============================================================
 * GENERIC HELPERS
 * ============================================================
 */

function safeString(
  value,
  fallback = ''
) {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return fallback;
  }

  const result =
    String(
      value
    ).trim();

  return (
    result ||
    fallback
  );
}


function normalizeLanguageCode(
  language
) {
  return safeString(
    language,
    'en'
  )
    .toLowerCase()
    .replace(
      /_/g,
      '-'
    );
}


/* ============================================================
 * CANONICAL REGISTRY ACCESS
 * ============================================================
 */

function getConfiguredStatePath() {
  const configuredPath =
    config?.data?.common?.states;

  if (
    typeof configuredPath ===
      'string' &&
    configuredPath.trim()
  ) {
    return configuredPath;
  }

  throw new Error(
    'No canonical state-registry path is configured.'
  );
}


/* ============================================================
 * LOCALIZED NAME RESOLUTION
 * ============================================================
 */

function resolveLocalizedName(
  name,
  language =
    getCurrentLanguage()
) {
  const normalizedLanguage =
    normalizeLanguageCode(
      language
    );

  if (
    typeof name ===
      'string'
  ) {
    return safeString(
      name
    );
  }

  if (
    !name ||
    typeof name !==
      'object'
  ) {
    return '';
  }

  const candidates = [
    normalizedLanguage,
    normalizedLanguage.split(
      '-',
      1
    )[0],
    'en',
    'bn'
  ];

  for (
    const candidate of
      candidates
  ) {
    const value =
      name[
        candidate
      ];

    if (
      typeof value ===
        'string' &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  /*
   * Do not invent a localized value.
   *
   * If the canonical record does not provide one of the expected
   * locale values, use the first non-empty string actually present
   * in that canonical name object.
   */
  for (
    const value of
      Object.values(
        name
      )
  ) {
    if (
      typeof value ===
        'string' &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  return '';
}


/* ============================================================
 * STATUS NORMALIZATION
 * ============================================================
 *
 * Canonical registry records currently express availability through:
 *
 *   enabled: true / false
 *   coverage: ACTIVE / PLANNED
 *
 * The UI component retains its existing presentation vocabulary:
 *
 *   AVAILABLE
 *   PLANNED
 *   DISABLED
 */

function normalizeStateStatus(
  state
) {
  const coverage =
    safeString(
      state?.coverage
    ).toUpperCase();

  if (
    coverage ===
      'ACTIVE' &&
    state?.enabled !==
      false
  ) {
    return STATE_STATUS.AVAILABLE;
  }

  if (
    coverage ===
      'PLANNED'
  ) {
    return STATE_STATUS.PLANNED;
  }

  if (
    state?.enabled ===
      false
  ) {
    return STATE_STATUS.DISABLED;
  }

  /*
   * Unknown/incomplete canonical records should never become
   * selectable merely because data happened to be malformed.
   */
  return STATE_STATUS.DISABLED;
}


/* ============================================================
 * STATE NORMALIZATION
 * ============================================================
 */

function normalizeState(
  state,
  language =
    getCurrentLanguage()
) {
  if (
    !state ||
    typeof state !==
      'object'
  ) {
    return null;
  }

  const id =
    safeString(
      state.id
    );

  if (
    !id
  ) {
    return null;
  }

  const localizedName =
    resolveLocalizedName(
      state.name,
      language
    );

  if (
    !localizedName
  ) {
    return null;
  }

  const status =
    normalizeStateStatus(
      state
    );

  return {
    id,

    name:
      localizedName,

    shortName:
      safeString(
        state.shortName,
        ''
      ),

    status,

    /*
     * Preserve canonical government relationship as metadata.
     *
     * This is not used as the select value.
     */
    governmentId:
      safeString(
        state.governmentId,
        ''
      ),

    /*
     * Preserve registry type for future state / UT expansion.
     */
    type:
      safeString(
        state.type,
        'STATE'
      )
  };
}


/* ============================================================
 * CANONICAL REGISTRY EXTRACTION
 * ============================================================
 */

function getCanonicalRegistryRecords(
  data
) {
  if (
    !data ||
    typeof data !==
      'object'
  ) {
    return [];
  }

  const records = [];

  if (
    Array.isArray(
      data.states
    )
  ) {
    records.push(
      ...data.states
    );
  }

  if (
    Array.isArray(
      data.unionTerritories
    )
  ) {
    records.push(
      ...data.unionTerritories
    );
  }

  return records;
}


/* ============================================================
 * CANONICAL VOCABULARY LOADING
 * ============================================================
 */

async function loadStateVocabulary() {
  if (
    canonicalVocabularyLoaded
  ) {
    return getConfiguredStates();
  }

  if (
    stateVocabularyPromise
  ) {
    return stateVocabularyPromise;
  }

  stateVocabularyPromise =
    (async () => {
      const path =
        getConfiguredStatePath();

      const response =
        await fetch(
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
        );

      if (
        !response.ok
      ) {
        throw new Error(
          `Unable to load the canonical state registry. HTTP ${response.status}.`
        );
      }

      const data =
        await response.json();

      const canonicalRecords =
        getCanonicalRegistryRecords(
          data
        );

      if (
        canonicalRecords.length ===
        0
      ) {
        throw new Error(
          'The canonical state registry contains no state or union-territory records.'
        );
      }

      const language =
        getCurrentLanguage();

      const normalized =
        canonicalRecords
          .map(
            state =>
              normalizeState(
                state,
                language
              )
          )
          .filter(Boolean);

      if (
        normalized.length ===
        0
      ) {
        throw new Error(
          'The canonical state registry contains no usable state records.'
        );
      }

      configuredStates =
        normalized;

      canonicalVocabularyLoaded =
        true;

      document.dispatchEvent(
        new CustomEvent(
          STATE_VOCABULARY_READY_EVENT,
          {
            detail: {
              states:
                getConfiguredStates(),

              canonical:
                true
            }
          }
        )
      );

      return getConfiguredStates();
    })()
      .catch(
        error => {
          /*
           * Clear the Promise cache so a later explicit retry remains
           * possible.
           */
          stateVocabularyPromise =
            null;

          throw error;
        }
      );

  return stateVocabularyPromise;
}


/*
 * Begin canonical loading without blocking shell initialization.
 *
 * Any failure is deliberately handled as a non-fatal selector concern:
 * the canonical fallback remains available.
 */
function requestStateVocabularyLoad() {
  void loadStateVocabulary()
    .catch(
      error => {
        /*
         * Keep the temporary fallback rather than inventing state data.
         *
         * The error is observable through a standard application event,
         * but it does not block the rest of the application shell.
         */
        document.dispatchEvent(
          new CustomEvent(
            'govcareer:state-vocabulary-error',
            {
              detail: {
                error
              }
            }
          )
        );
      }
    );
}


/* ============================================================
 * PUBLIC VOCABULARY API
 * ============================================================
 */

function setStateVocabulary(
  states
) {
  if (
    !Array.isArray(
      states
    )
  ) {
    return false;
  }

  const normalized =
    states
      .map(
        state =>
          normalizeState(
            state
          )
      )
      .filter(Boolean);

  if (
    normalized.length ===
    0
  ) {
    return false;
  }

  configuredStates =
    normalized;

  canonicalVocabularyLoaded =
    true;

  document.dispatchEvent(
    new CustomEvent(
      STATE_VOCABULARY_READY_EVENT,
      {
        detail: {
          states:
            getConfiguredStates(),

          canonical:
            true
        }
      }
    )
  );

  return true;
}


function getConfiguredStates() {
  return configuredStates.map(
    state => ({
      ...state
    })
  );
}


function getAvailableStates() {
  return getConfiguredStates().filter(
    state =>
      state.status ===
      STATE_STATUS.AVAILABLE
  );
}


/* ============================================================
 * CURRENT STATE DEFAULT
 * ============================================================
 */

function resolveDefaultStateId(
  currentStateId
) {
  const requested =
    safeString(
      currentStateId
    );

  if (
    requested &&
    (
      requested ===
        CENTRAL_GOVERNMENT_ID ||
      getConfiguredStates().some(
        state =>
          state.id ===
          requested
      )
    )
  ) {
    return requested;
  }

  /*
   * Canonical application default.
   *
   * This is intentionally not read from a second hard-coded state
   * vocabulary.
   */
  const configuredDefault =
    safeString(
      config?.app?.defaultState
    );

  if (
    configuredDefault &&
    (
      configuredDefault ===
        CENTRAL_GOVERNMENT_ID ||
      getConfiguredStates().some(
        state =>
          state.id ===
          configuredDefault
      )
    )
  ) {
    return configuredDefault;
  }

  /*
   * Preserve the canonical West Bengal fallback only when it is actually
   * present in the configured vocabulary.
   */
  if (
    getConfiguredStates().some(
      state =>
        state.id ===
        CANONICAL_WEST_BENGAL_STATE_ID
    )
  ) {
    return CANONICAL_WEST_BENGAL_STATE_ID;
  }

  return CENTRAL_GOVERNMENT_ID;
}


/* ============================================================
 * SELECTOR CREATION
 * ============================================================
 */

function createStateSelector({
  includeCentral =
    true,

  showPlanned =
    true,

  availableOnly =
    false,

  currentStateId =
    null
} = {}) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.className =
    'state-selector';

  wrapper.dataset.stateSelector =
    'true';

  const labelId =
    `state-selector-label-${Math.random()
      .toString(
        36
      )
      .slice(
        2,
        10
      )}`;

  const selectId =
    `state-selector-${Math.random()
      .toString(
        36
      )
      .slice(
        2,
        10
      )}`;

  const label =
    document.createElement(
      'label'
    );

  label.className =
    'state-selector__label';

  label.id =
    labelId;

  label.htmlFor =
    selectId;

  label.textContent =
    'Government jurisdiction';

  const select =
    document.createElement(
      'select'
    );

  select.className =
    'state-selector__select';

  select.id =
    selectId;

  select.dataset.stateSelect =
    'true';

  select.setAttribute(
    'aria-labelledby',
    labelId
  );

  /*
   * Keep the current behavior: Central Government is a jurisdiction
   * option, but it is NOT represented as a state record.
   */
  if (
    includeCentral
  ) {
    const option =
      document.createElement(
        'option'
      );

    option.value =
      CENTRAL_GOVERNMENT_ID;

    option.textContent =
      'Central Government';

    select.append(
      option
    );
  }

  const states =
    getConfiguredStates();

  states
    .filter(
      state => {
        if (
          availableOnly &&
          state.status !==
            STATE_STATUS.AVAILABLE
        ) {
          return false;
        }

        if (
          !showPlanned &&
          state.status ===
            STATE_STATUS.PLANNED
        ) {
          return false;
        }

        return true;
      }
    )
    .forEach(
      state => {
        const option =
          document.createElement(
            'option'
          );

        option.value =
          state.id;

        option.textContent =
          state.status ===
            STATE_STATUS.PLANNED
            ? `${state.name} — Coming later`
            : state.name;

        option.disabled =
          state.status !==
          STATE_STATUS.AVAILABLE;

        /*
         * Preserve the canonical government distinction as metadata
         * without changing the state ID emitted by the selector.
         */
        if (
          state.governmentId
        ) {
          option.dataset.governmentId =
            state.governmentId;
        }

        if (
          state.type
        ) {
          option.dataset.jurisdictionType =
            state.type;
        }

        select.append(
          option
        );
      }
    );

  const allowedValues =
    [
      ...(includeCentral
        ? [
            CENTRAL_GOVERNMENT_ID
          ]
        : []),

      ...states
        .filter(
          state =>
            state.status ===
            STATE_STATUS.AVAILABLE
        )
        .map(
          state =>
            state.id
        )
    ];

  const resolvedCurrentState =
    resolveDefaultStateId(
      currentStateId
    );

  if (
    allowedValues.includes(
      resolvedCurrentState
    )
  ) {
    select.value =
      resolvedCurrentState;
  } else if (
    includeCentral
  ) {
    select.value =
      CENTRAL_GOVERNMENT_ID;
  } else {
    select.value =
      allowedValues[0] ||
      '';
  }

  /*
   * Keep enough information on the selector itself for future refreshes
   * after the canonical registry finishes loading.
   */
  wrapper.dataset.includeCentral =
    String(
      includeCentral
    );

  wrapper.dataset.showPlanned =
    String(
      showPlanned
    );

  wrapper.dataset.availableOnly =
    String(
      availableOnly
    );

  wrapper.dataset.currentStateId =
    select.value;

  wrapper.append(
    label,
    select
  );

  return wrapper;
}


/* ============================================================
 * SELECTOR REFRESH
 * ============================================================
 *
 * When canonical data replaces the temporary fallback, existing header
 * selectors must refresh automatically rather than waiting for a page
 * rerender.
 */

function refreshStateSelectors() {
  document
    .querySelectorAll(
      '[data-state-selector="true"]'
    )
    .forEach(
      wrapper => {
        const existingSelect =
          wrapper.querySelector(
            '[data-state-select]'
          );

        if (
          !existingSelect
        ) {
          return;
        }

        const previousValue =
          existingSelect.value;

        const replacement =
          createStateSelector({
            includeCentral:
              wrapper.dataset.includeCentral !==
              'false',

            showPlanned:
              wrapper.dataset.showPlanned !==
              'false',

            availableOnly:
              wrapper.dataset.availableOnly ===
              'true',

            currentStateId:
              previousValue
          });

        /*
         * Preserve the outer mount and replace only the selector content.
         */
        wrapper.replaceWith(
          replacement
        );
      }
    );
}


/* ============================================================
 * MOUNTING
 * ============================================================
 */

function mountStateSelector(
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

  const selector =
    createStateSelector(
      options
    );

  mount.innerHTML =
    '';

  mount.append(
    selector
  );

  /*
   * Canonical loading is intentionally asynchronous and non-blocking.
   *
   * The selector immediately renders from the safe canonical fallback,
   * then refreshes after states.json has been successfully loaded.
   */
  requestStateVocabularyLoad();

  return selector;
}


/* ============================================================
 * EVENT BINDING
 * ============================================================
 */

function bindStateSelector(
  root = document
) {
  if (
    !root ||
    typeof root.addEventListener !==
      'function'
  ) {
    return;
  }

  /*
   * Document-level binding is intentionally idempotent.
   */
  if (
    root === document
  ) {
    if (
      document.documentElement
        .dataset
        .stateSelectorBound ===
      'true'
    ) {
      return;
    }

    document.documentElement
      .dataset
      .stateSelectorBound =
      'true';
  }

  root.addEventListener(
    'change',
    event => {
      const target =
        event.target;

      if (
        !target ||
        typeof target.closest !==
          'function'
      ) {
        return;
      }

      const select =
        target.closest(
          '[data-state-select]'
        );

      if (
        !select
      ) {
        return;
      }

      const stateId =
        safeString(
          select.value
        );

      if (
        !stateId
      ) {
        return;
      }

      /*
       * Emit only the canonical state identifier.
       *
       * For Central Government this is the existing CENTRAL jurisdiction
       * identifier, not a state ID.
       *
       * For West Bengal this is always:
       *
       *   west-bengal
       *
       * Never emit:
       *   IN-WB
       */
      document.dispatchEvent(
        new CustomEvent(
          STATE_CHANGE_EVENT,
          {
            detail: {
              stateId
            }
          }
        )
      );
    }
  );
}


/* ============================================================
 * SELECTOR SYNCHRONIZATION
 * ============================================================
 */

function syncStateSelector(
  stateId
) {
  const normalizedStateId =
    safeString(
      stateId
    );

  if (
    !normalizedStateId
  ) {
    return;
  }

  document
    .querySelectorAll(
      '[data-state-select]'
    )
    .forEach(
      select => {
        const option =
          [
            ...select.options
          ].find(
            item =>
              item.value ===
              normalizedStateId
          );

        if (
          option &&
          !option.disabled
        ) {
          select.value =
            normalizedStateId;

          const wrapper =
            select.closest(
              '[data-state-selector="true"]'
            );

          if (
            wrapper
          ) {
            wrapper.dataset.currentStateId =
              normalizedStateId;
          }
        }
      }
    );
}


/* ============================================================
 * CANONICAL VOCABULARY EVENT HANDLING
 * ============================================================
 */

function bindVocabularyLifecycle() {
  if (
    stateEventsBound
  ) {
    return;
  }

  stateEventsBound =
    true;

  document.addEventListener(
    STATE_VOCABULARY_READY_EVENT,
    () => {
      refreshStateSelectors();
    }
  );
}


/* ============================================================
 * INITIALIZATION
 * ============================================================
 */

function initializeStateSelector() {
  bindStateSelector();

  bindVocabularyLifecycle();

  document.addEventListener(
    STATE_CHANGE_EVENT,
    event => {
      syncStateSelector(
        event.detail?.stateId
      );
    }
  );

  /*
   * Request the canonical registry as part of initialization,
   * but never block the application shell on the network operation.
   */
  requestStateVocabularyLoad();
}


/* ============================================================
 * EXPORTS
 * ============================================================
 */

export {
  STATE_STATUS,

  INITIAL_FALLBACK_STATES,

  setStateVocabulary,
  loadStateVocabulary,

  getConfiguredStates,
  getAvailableStates,

  createStateSelector,
  mountStateSelector,

  bindStateSelector,
  syncStateSelector,

  initializeStateSelector
};


export default {
  setStateVocabulary,
  loadStateVocabulary,

  getConfiguredStates,
  getAvailableStates,

  createStateSelector,
  mountStateSelector,

  initializeStateSelector
};
