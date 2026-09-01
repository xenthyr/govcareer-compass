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
 *   Additional Indian states.
 *
 * IMPORTANT:
 *   State records should ultimately come from:
 *
 *   /data/common/states.json
 *
 *   This component is only the UI layer.
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

const INITIAL_FALLBACK_STATES =
  Object.freeze([
    {
      id:
        'IN-WB',

      name:
        'West Bengal',

      shortName:
        'WB',

      status:
        STATE_STATUS.AVAILABLE
    }
  ]);

let configuredStates =
  [
    ...INITIAL_FALLBACK_STATES
  ];

function escapeHtml(
  value
) {
  return String(
    value ?? ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}

function normalizeState(
  state
) {
  if (
    !state ||
    typeof state !==
      'object'
  ) {
    return null;
  }

  const id =
    String(
      state.id ||
        ''
    ).trim();

  const name =
    String(
      state.name ||
        ''
    ).trim();

  if (
    !id ||
    !name
  ) {
    return null;
  }

  const status =
    Object.values(
      STATE_STATUS
    ).includes(
      String(
        state.status ||
          ''
      ).toUpperCase()
    )
      ? String(
          state.status
        ).toUpperCase()
      : STATE_STATUS.PLANNED;

  return {
    id,

    name,

    shortName:
      String(
        state.shortName ||
          ''
      ).trim(),

    status
  };
}

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
        normalizeState
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

  document.dispatchEvent(
    new CustomEvent(
      'govcareer:state-vocabulary-ready',
      {
        detail: {
          states:
            getConfiguredStates()
        }
      }
    )
  );

  return true;
}

function getConfiguredStates() {
  return configuredStates.map(
    (
      state
    ) => ({
      ...state
    })
  );
}

function getAvailableStates() {
  return getConfiguredStates().filter(
    (
      state
    ) =>
      state.status ===
      STATE_STATUS.AVAILABLE
  );
}

function createStateSelector({
  includeCentral =
    true,

  showPlanned =
    true,

  availableOnly =
    false,

  currentStateId =
    'IN-WB'
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

  if (
    includeCentral
  ) {
    const option =
      document.createElement(
        'option'
      );

    option.value =
      'CENTRAL';

    option.textContent =
      'Central Government';

    select.append(
      option
    );
  }

  getConfiguredStates()
    .filter(
      (
        state
      ) => {
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
      (
        state
      ) => {
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

        select.append(
          option
        );
      }
    );

  const allowedValues =
    [
      ...(includeCentral
        ? ['CENTRAL']
        : []),

      ...getConfiguredStates()
        .filter(
          (
            state
          ) =>
            state.status ===
            STATE_STATUS.AVAILABLE
        )
        .map(
          (
            state
          ) =>
            state.id
        )
    ];

  if (
    allowedValues.includes(
      currentStateId
    )
  ) {
    select.value =
      currentStateId;
  } else if (
    includeCentral
  ) {
    select.value =
      'CENTRAL';
  } else {
    select.value =
      allowedValues[0] ||
      '';
  }

  wrapper.append(
    label,
    select
  );

  return wrapper;
}

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

  mount.innerHTML =
    '';

  const selector =
    createStateSelector(
      options
    );

  mount.append(
    selector
  );

  return selector;
}

function bindStateSelector(
  root = document
) {
  if (
    root ===
      document &&
    document.documentElement
      .dataset
      .stateSelectorBound ===
      'true'
  ) {
    return;
  }

  if (
    root ===
    document
  ) {
    document.documentElement
      .dataset
      .stateSelectorBound =
      'true';
  }

  root.addEventListener(
    'change',
    (event) => {
      const select =
        event.target.closest(
          '[data-state-select]'
        );

      if (
        !select
      ) {
        return;
      }

      const stateId =
        select.value;

      document.dispatchEvent(
        new CustomEvent(
          'govcareer:statechange',
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

function syncStateSelector(
  stateId
) {
  if (
    !stateId
  ) {
    return;
  }

  document
    .querySelectorAll(
      '[data-state-select]'
    )
    .forEach(
      (
        select
      ) => {
        const option =
          [
            ...select.options
          ].find(
            (
              item
            ) =>
              item.value ===
              stateId
          );

        if (
          option &&
          !option.disabled
        ) {
          select.value =
            stateId;
        }
      }
    );
}

function initializeStateSelector() {
  bindStateSelector();

  document.addEventListener(
    'govcareer:state-vocabulary-ready',
    () => {
      /*
       * Existing selectors are refreshed by the page layer
       * when the canonical vocabulary becomes available.
       */
    }
  );

  document.addEventListener(
    'govcareer:statechange',
    (
      event
    ) => {
      syncStateSelector(
        event.detail?.stateId
      );
    }
  );
}

export {
  STATE_STATUS,

  INITIAL_FALLBACK_STATES,

  setStateVocabulary,
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
  getConfiguredStates,
  createStateSelector,
  mountStateSelector,
  initializeStateSelector
};
