/**
 * GovCareer Compass
 * ============================================================
 * State Selector Component
 * ============================================================
 *
 * Purpose
 * -------
 * Provides the state-selection UI for the application.
 *
 * CURRENT PRODUCT SCOPE
 * ---------------------
 * - West Bengal state data is implemented first.
 * - Central Government remains available independently.
 * - Other Indian states may be displayed in the selector as
 *   future/planned states until their datasets are actually
 *   implemented.
 *
 * IMPORTANT
 * ---------
 * A state appearing in the selector does NOT mean that its
 * government-job database is already available.
 *
 * The component exposes:
 * - available
 * - planned
 * - disabled
 *
 * Future state expansion should therefore not require a
 * component rewrite.
 */

import config from '../config.js';

const STATE_STATUS =
  Object.freeze({
    AVAILABLE:
      'AVAILABLE',

    PLANNED:
      'PLANNED',

    DISABLED:
      'DISABLED'
  });

const DEFAULT_STATES =
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
    },

    {
      id:
        'IN-AP',

      name:
        'Andhra Pradesh',

      shortName:
        'AP',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-AR',

      name:
        'Arunachal Pradesh',

      shortName:
        'AR',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-AS',

      name:
        'Assam',

      shortName:
        'AS',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-BR',

      name:
        'Bihar',

      shortName:
        'BR',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-CG',

      name:
        'Chhattisgarh',

      shortName:
        'CG',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-GA',

      name:
        'Goa',

      shortName:
        'GA',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-GJ',

      name:
        'Gujarat',

      shortName:
        'GJ',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-HR',

      name:
        'Haryana',

      shortName:
        'HR',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-HP',

      name:
        'Himachal Pradesh',

      shortName:
        'HP',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-JH',

      name:
        'Jharkhand',

      shortName:
        'JH',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-KA',

      name:
        'Karnataka',

      shortName:
        'KA',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-KL',

      name:
        'Kerala',

      shortName:
        'KL',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-MP',

      name:
        'Madhya Pradesh',

      shortName:
        'MP',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-MH',

      name:
        'Maharashtra',

      shortName:
        'MH',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-MN',

      name:
        'Manipur',

      shortName:
        'MN',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-ML',

      name:
        'Meghalaya',

      shortName:
        'ML',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-MZ',

      name:
        'Mizoram',

      shortName:
        'MZ',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-NL',

      name:
        'Nagaland',

      shortName:
        'NL',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-OD',

      name:
        'Odisha',

      shortName:
        'OD',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-PB',

      name:
        'Punjab',

      shortName:
        'PB',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-RJ',

      name:
        'Rajasthan',

      shortName:
        'RJ',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-SK',

      name:
        'Sikkim',

      shortName:
        'SK',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-TN',

      name:
        'Tamil Nadu',

      shortName:
        'TN',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-TS',

      name:
        'Telangana',

      shortName:
        'TS',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-TR',

      name:
        'Tripura',

      shortName:
        'TR',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-UP',

      name:
        'Uttar Pradesh',

      shortName:
        'UP',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-UK',

      name:
        'Uttarakhand',

      shortName:
        'UK',

      status:
        STATE_STATUS.PLANNED
    },

    {
      id:
        'IN-LD',

      name:
        'Ladakh',

      shortName:
        'LA',

      status:
        STATE_STATUS.PLANNED
    }
  ]);

function getConfiguredStates() {
  /*
   * If config.js eventually exposes a canonical state list,
   * use it. Otherwise use the current controlled fallback.
   */
  const configured =
    config?.states;

  if (
    Array.isArray(
      configured
    ) &&
    configured.length
  ) {
    return configured;
  }

  return [
    ...DEFAULT_STATES
  ];
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

  const label =
    document.createElement(
      'label'
    );

  label.className =
    'state-selector__label';

  label.textContent =
    'Government jurisdiction';

  const select =
    document.createElement(
      'select'
    );

  select.className =
    'state-selector__select';

  select.dataset.stateSelect =
    'true';

  select.setAttribute(
    'aria-label',
    'Choose government jurisdiction'
  );

  if (
    includeCentral
  ) {
    const centralOption =
      document.createElement(
        'option'
      );

    centralOption.value =
      'CENTRAL';

    centralOption.textContent =
      'Central Government';

    select.append(
      centralOption
    );
  }

  const states =
    getConfiguredStates();

  states.forEach(
    (state) => {
      if (
        availableOnly &&
        state.status !==
          STATE_STATUS.AVAILABLE
      ) {
        return;
      }

      if (
        !showPlanned &&
        state.status ===
          STATE_STATUS.PLANNED
      ) {
        return;
      }

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

  const validCurrent =
    [
      'CENTRAL',
      ...states
        .filter(
          (state) =>
            state.status ===
            STATE_STATUS.AVAILABLE
        )
        .map(
          (state) =>
            state.id
        )
    ].includes(
      currentStateId
    );

  select.value =
    validCurrent
      ? currentStateId
      : includeCentral
        ? 'CENTRAL'
        : 'IN-WB';

  label.htmlFor =
    `state-selector-${Math.random()
      .toString(36)
      .slice(
        2,
        9
      )}`;

  select.id =
    label.htmlFor;

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
      (select) => {
        const matchingOption =
          [
            ...select.options
          ].find(
            (option) =>
              option.value ===
              stateId
          );

        if (
          matchingOption &&
          !matchingOption.disabled
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
    'govcareer:statechange',
    (event) => {
      const stateId =
        event.detail?.stateId;

      if (
        stateId
      ) {
        syncStateSelector(
          stateId
        );
      }
    }
  );
}

export {
  STATE_STATUS,
  DEFAULT_STATES,
  getConfiguredStates,
  createStateSelector,
  mountStateSelector,
  bindStateSelector,
  syncStateSelector,
  initializeStateSelector
};

export default {
  createStateSelector,
  mountStateSelector,
  initializeStateSelector
};
