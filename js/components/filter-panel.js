/**
 * GovCareer Compass
 * ============================================================
 * Filter Panel Component
 * ============================================================
 *
 * FILE:
 *   /js/components/filter-panel.js
 *
 * PURPOSE:
 *   Reusable advanced filtering interface for the Government
 *   Career Database.
 *
 * IMPORTANT ARCHITECTURAL RULE:
 * ------------------------------------------------------------
 * Filters are discovery controls.
 *
 * They must NOT replace the eligibility engine.
 *
 * HARD ELIGIBILITY:
 *   eligibility-engine.js
 *
 * SOFT PREFERENCES:
 *   preference-engine.js
 *
 * PRESENTATION FILTERS:
 *   filters.js + this component
 *
 * The component therefore emits filter state rather than
 * deciding legal eligibility itself.
 */

/* ============================================================
 * FILTER DEFINITIONS
 * ============================================================
 *
 * The values are intentionally controlled vocabulary identifiers.
 * Human-readable labels can later be localized through i18n.
 */

const FILTER_DEFINITIONS = Object.freeze([
  {
    id: 'government',
    label: 'Government',
    type: 'multi',
    options: [
      {
        value: 'WEST_BENGAL',
        label: 'West Bengal Government'
      },
      {
        value: 'CENTRAL',
        label: 'Central Government'
      },
      {
        value: 'LOCAL',
        label: 'Local / Panchayat'
      },
      {
        value: 'OTHER',
        label: 'Other Government'
      }
    ]
  },

  {
    id: 'state',
    label: 'State',
    type: 'multi',
    options: []
  },

  {
    id: 'educationalLevel',
    label: 'Minimum Educational Level',
    type: 'multi',
    options: [
      {
        value: 'CLASS_8',
        label: 'Class 8'
      },
      {
        value: 'CLASS_10',
        label: 'Class 10'
      },
      {
        value: 'CLASS_12',
        label: 'Class 12'
      },
      {
        value: 'GRADUATE',
        label: 'Graduate'
      },
      {
        value: 'POSTGRADUATE',
        label: 'Postgraduate'
      },
      {
        value: 'PROFESSIONAL',
        label: 'Professional qualification'
      }
    ]
  },

  {
    id: 'eligibility',
    label: 'B.A. English Eligibility',
    type: 'multi',
    options: [
      {
        value: 'DIRECTLY_ELIGIBLE',
        label: 'Directly eligible'
      },
      {
        value: 'CONDITIONALLY_ELIGIBLE',
        label: 'Conditionally eligible'
      },
      {
        value: 'NOT_ELIGIBLE',
        label: 'Not eligible'
      },
      {
        value: 'MANUAL_VERIFICATION',
        label: 'Verification required'
      },
      {
        value: 'INSUFFICIENT_INFORMATION',
        label: 'Insufficient information'
      }
    ]
  },

  {
    id: 'category',
    label: 'Career Category',
    type: 'multi',
    options: [
      {
        value: 'ADMINISTRATIVE',
        label: 'Administrative'
      },
      {
        value: 'EXECUTIVE',
        label: 'Executive'
      },
      {
        value: 'POLICE',
        label: 'Police'
      },
      {
        value: 'INVESTIGATION',
        label: 'Investigation'
      },
      {
        value: 'INTELLIGENCE',
        label: 'Intelligence'
      },
      {
        value: 'ENFORCEMENT',
        label: 'Enforcement'
      },
      {
        value: 'REVENUE',
        label: 'Revenue'
      },
      {
        value: 'TAX',
        label: 'Tax'
      },
      {
        value: 'AUDIT',
        label: 'Audit'
      },
      {
        value: 'ACCOUNTS',
        label: 'Accounts'
      },
      {
        value: 'CLERICAL',
        label: 'Clerical'
      },
      {
        value: 'RAILWAY',
        label: 'Railway operations'
      },
      {
        value: 'SECURITY',
        label: 'Security'
      },
      {
        value: 'PANCHAYAT',
        label: 'Panchayat'
      },
      {
        value: 'CORRECTIONS',
        label: 'Corrections'
      },
      {
        value: 'WELFARE',
        label: 'Social welfare'
      },
      {
        value: 'DISASTER_MANAGEMENT',
        label: 'Disaster management'
      },
      {
        value: 'POSTAL',
        label: 'Postal'
      },
      {
        value: 'SECRETARIAT',
        label: 'Secretariat'
      },
      {
        value: 'FIELD_DEVELOPMENT',
        label: 'Field development'
      },
      {
        value: 'EDUCATION',
        label: 'Education / non-teaching'
      },
      {
        value: 'OTHER',
        label: 'Other'
      }
    ]
  },

  {
    id: 'department',
    label: 'Department',
    type: 'multi',
    options: []
  },

  {
    id: 'serviceCadre',
    label: 'Service / Cadre',
    type: 'multi',
    options: []
  },

  {
    id: 'paySystem',
    label: 'Pay System',
    type: 'multi',
    options: [
      {
        value: 'WEST_BENGAL_ROPA',
        label: 'West Bengal Pay Structure'
      },
      {
        value: 'CENTRAL_7TH_CPC',
        label: 'Central 7th Central Pay Commission'
      },
      {
        value: 'OTHER',
        label: 'Other / not specified'
      }
    ]
  },

  {
    id: 'payLevel',
    label: 'Pay Level',
    type: 'multi',
    options: []
  },

  {
    id: 'location',
    label: 'Location / Posting',
    type: 'multi',
    options: [
      {
        value: 'KOLKATA_CENTRIC',
        label: 'Kolkata-centric'
      },
      {
        value: 'WEST_BENGAL_WIDE',
        label: 'West Bengal-wide'
      },
      {
        value: 'DISTRICT_BASED',
        label: 'District-based'
      },
      {
        value: 'RURAL_HEAVY',
        label: 'Rural-heavy'
      },
      {
        value: 'REMOTE',
        label: 'Remote / difficult-area possibility'
      },
      {
        value: 'ALL_INDIA',
        label: 'All-India'
      },
      {
        value: 'DELHI_HEAVY',
        label: 'Delhi-heavy'
      },
      {
        value: 'LOCATION_UNCERTAIN',
        label: 'Location uncertain'
      }
    ]
  },

  {
    id: 'workStyle',
    label: 'Work Style',
    type: 'multi',
    options: [
      {
        value: 'MOSTLY_OFFICE',
        label: 'Mostly office'
      },
      {
        value: 'OFFICE_FIELD',
        label: 'Office + field'
      },
      {
        value: 'MOSTLY_FIELD',
        label: 'Mostly field'
      },
      {
        value: 'SHIFT_OPERATIONAL',
        label: 'Shift / operational'
      }
    ]
  },

  {
    id: 'physical',
    label: 'Physical Requirement',
    type: 'multi',
    options: [
      {
        value: 'NO_PHYSICAL_TEST',
        label: 'No physical test'
      },
      {
        value: 'PHYSICAL_TEST',
        label: 'Physical test'
      },
      {
        value: 'MEDICAL_REQUIRED',
        label: 'Medical requirement'
      },
      {
        value: 'PHYSICAL_AND_MEDICAL',
        label: 'Physical + medical'
      },
      {
        value: 'NOT_VERIFIED',
        label: 'Not verified'
      }
    ]
  },

  {
    id: 'family',
    label: 'Family Compatibility',
    type: 'multi',
    options: [
      {
        value: 'FAMILY_FRIENDLY',
        label: 'Family-friendly'
      },
      {
        value: 'MODERATE',
        label: 'Moderate'
      },
      {
        value: 'DIFFICULT',
        label: 'Difficult'
      }
    ]
  },

  {
    id: 'stress',
    label: 'Stress',
    type: 'multi',
    options: [
      {
        value: 'LOW',
        label: 'Lower stress'
      },
      {
        value: 'MODERATE',
        label: 'Moderate stress'
      },
      {
        value: 'HIGH',
        label: 'High stress'
      }
    ]
  },

  {
    id: 'housing',
    label: 'Housing',
    type: 'multi',
    options: [
      {
        value: 'GOVERNMENT_QUARTER',
        label: 'Government quarter'
      },
      {
        value: 'DEPARTMENTAL_ACCOMMODATION',
        label: 'Departmental accommodation'
      },
      {
        value: 'VACANCY_DEPENDENT',
        label: 'Vacancy-dependent'
      },
      {
        value: 'NO_MEANINGFUL_ADVANTAGE',
        label: 'No meaningful accommodation advantage'
      },
      {
        value: 'NOT_VERIFIED',
        label: 'Not verified'
      }
    ]
  },

  {
    id: 'recruitmentStatus',
    label: 'Current / Recruitment Status',
    type: 'multi',
    options: [
      {
        value: 'OPEN',
        label: 'Open'
      },
      {
        value: 'ACTIVE',
        label: 'Active'
      },
      {
        value: 'CURRENT',
        label: 'Current'
      },
      {
        value: 'UNDER_PROCESS',
        label: 'Under process'
      },
      {
        value: 'RECENTLY_COMPLETED',
        label: 'Recently completed'
      },
      {
        value: 'PERIODIC',
        label: 'Periodic'
      },
      {
        value: 'IRREGULAR',
        label: 'Irregular'
      },
      {
        value: 'HISTORICAL',
        label: 'Historical'
      }
    ]
  },

  {
    id: 'employmentStatus',
    label: 'Employment Type',
    type: 'multi',
    options: [
      {
        value: 'REGULAR',
        label: 'Regular'
      },
      {
        value: 'PROBATIONARY',
        label: 'Probationary'
      },
      {
        value: 'TEMPORARY',
        label: 'Temporary'
      },
      {
        value: 'CONTRACT',
        label: 'Contract'
      },
      {
        value: 'OUTSOURCED',
        label: 'Outsourced'
      }
    ]
  }
]);

/* ============================================================
 * FILTER UTILITIES
 * ============================================================
 */

function cloneFilters(
  filters = {}
) {
  const result = {};

  FILTER_DEFINITIONS.forEach(
    (definition) => {
      const value =
        filters[
          definition.id
        ];

      result[
        definition.id
      ] =
        Array.isArray(
          value
        )
          ? [
              ...new Set(
                value.map(
                  (item) =>
                    String(
                      item
                    )
                )
              )
            ]
          : [];
    }
  );

  return result;
}

function createEmptyFilters() {
  return cloneFilters({});
}

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

function getDefinition(
  filterId
) {
  return FILTER_DEFINITIONS.find(
    (definition) =>
      definition.id ===
      filterId
  );
}

function normalizeOptions(
  options
) {
  if (
    !Array.isArray(
      options
    )
  ) {
    return [];
  }

  return options
    .filter(
      (option) =>
        option &&
        option.value !==
          undefined
    )
    .map(
      (option) => ({
        value:
          String(
            option.value
          ),

        label:
          String(
            option.label ??
              option.value
          ),

        disabled:
          option.disabled ===
          true
      })
    );
}

function getFilterDefinitions(
  optionSources = {}
) {
  return FILTER_DEFINITIONS.map(
    (definition) => ({
      ...definition,

      options:
        definition.options
          .length
          ? normalizeOptions(
              definition.options
            )
          : normalizeOptions(
              optionSources[
                definition.id
              ]
            )
    })
  );
}

/* ============================================================
 * MARKUP
 * ============================================================
 */

function createFilterPanelMarkup(
  {
    filters = {},
    optionSources = {},
    collapsible = true,
    title =
      'Filter government careers',
    showReset =
      true,
    mobileOnly =
      false
  } = {}
) {
  const current =
    cloneFilters(
      filters
    );

  const definitions =
    getFilterDefinitions(
      optionSources
    );

  const classes = [
    'filter-panel',
    mobileOnly
      ? 'filter-panel--mobile'
      : ''
  ]
    .filter(Boolean)
    .join(' ');

  const groups =
    definitions
      .map(
        (definition) => {
          const selected =
            current[
              definition.id
            ] || [];

          const options =
            normalizeOptions(
              definition.options
            );

          if (
            options.length ===
            0
          ) {
            return `
              <section
                class="filter-group filter-group--empty"
                data-filter-group="${escapeHtml(
                  definition.id
                )}"
                hidden
              >
                <h3>
                  ${escapeHtml(
                    definition.label
                  )}
                </h3>

                <p>
                  No filter values are currently indexed.
                </p>
              </section>
            `;
          }

          return `
            <fieldset
              class="filter-group"
              data-filter-group="${escapeHtml(
                definition.id
              )}"
            >
              <legend
                class="filter-group__legend"
              >
                ${escapeHtml(
                  definition.label
                )}
              </legend>

              <div
                class="filter-group__options"
              >
                ${options
                  .map(
                    (option) => {
                      const checked =
                        selected.includes(
                          option.value
                        );

                      const inputId =
                        `filter-${definition.id}-${option.value}`
                          .replace(
                            /[^a-zA-Z0-9_-]/g,
                            '-'
                          );

                      return `
                        <label
                          class="filter-option"
                          for="${escapeHtml(
                            inputId
                          )}"
                        >
                          <input
                            id="${escapeHtml(
                              inputId
                            )}"
                            type="checkbox"
                            name="${escapeHtml(
                              definition.id
                            )}"
                            value="${escapeHtml(
                              option.value
                            )}"
                            data-filter-field="${escapeHtml(
                              definition.id
                            )}"
                            data-filter-value="${escapeHtml(
                              option.value
                            )}"
                            ${
                              checked
                                ? 'checked'
                                : ''
                            }
                            ${
                              option.disabled
                                ? 'disabled'
                                : ''
                            }
                          />

                          <span
                            class="filter-option__box"
                            aria-hidden="true"
                          ></span>

                          <span
                            class="filter-option__label"
                          >
                            ${escapeHtml(
                              option.label
                            )}
                          </span>
                        </label>
                      `;
                    }
                  )
                  .join('')}
              </div>
            </fieldset>
          `;
        }
      )
      .join('');

  return `
    <aside
      class="${classes}"
      data-filter-panel
      aria-label="${escapeHtml(
        title
      )}"
    >

      <div
        class="filter-panel__header"
      >
        <div>
          <span
            class="filter-panel__eyebrow"
          >
            Career explorer
          </span>

          <h2
            class="filter-panel__title"
          >
            ${escapeHtml(
              title
            )}
          </h2>
        </div>

        ${
          showReset
            ? `
              <button
                type="button"
                class="button button--ghost button--small"
                data-filter-reset
              >
                Reset
              </button>
            `
            : ''
        }
      </div>

      <div
        class="filter-panel__summary"
        data-filter-summary
        aria-live="polite"
      >
        No active filters
      </div>

      ${
        collapsible
          ? `
            <button
              type="button"
              class="filter-panel__toggle"
              data-filter-toggle
              aria-expanded="true"
              aria-controls="filter-panel-groups"
            >
              <span>
                Filter categories
              </span>

              <span
                aria-hidden="true"
              >
               ⌄
              </span>
            </button>
          `
          : ''
      }

      <div
        id="filter-panel-groups"
        class="filter-panel__groups"
        data-filter-groups
      >
        ${groups}
      </div>

      <div
        class="filter-panel__footer"
      >
        <button
          type="button"
          class="button button--primary"
          data-filter-apply
        >
          Apply Filters
        </button>
      </div>

    </aside>
  `;
}

/* ============================================================
 * COMPONENT STATE
 * ============================================================
 */

const componentState =
  new WeakMap();

function getComponentState(
  root
) {
  if (
    !componentState.has(
      root
    )
  ) {
    componentState.set(
      root,
      {
        filters:
          createEmptyFilters(),
        open:
          true
      }
    );
  }

  return componentState.get(
    root
  );
}

function readFiltersFromDOM(
  root
) {
  const filters =
    createEmptyFilters();

  root
    .querySelectorAll(
      '[data-filter-field][data-filter-value]:checked'
    )
    .forEach(
      (input) => {
        const field =
          input.dataset
            .filterField;

        const value =
          input.dataset
            .filterValue;

        if (
          !field ||
          !value
        ) {
          return;
        }

        if (
          !filters[
            field
          ]
        ) {
          filters[
            field
          ] = [];
        }

        filters[
          field
        ].push(
          value
        );
      }
    );

  return cloneFilters(
    filters
  );
}

function getActiveFilterCount(
  filters
) {
  return Object.values(
    cloneFilters(
      filters
    )
  ).reduce(
    (
      total,
      values
    ) =>
      total +
      values.length,
    0
  );
}

function updateFilterSummary(
  root,
  filters
) {
  const summary =
    root.querySelector(
      '[data-filter-summary]'
    );

  if (
    !summary
  ) {
    return;
  }

  const count =
    getActiveFilterCount(
      filters
    );

  summary.textContent =
    count === 0
      ? 'No active filters'
      : `${count} active filter${
          count === 1
            ? ''
            : 's'
        }`;
}

/* ============================================================
 * EVENTS
 * ============================================================
 */

function emitFilterChange(
  root,
  filters,
  reason
) {
  const detail = {
    filters:
      cloneFilters(
        filters
      ),

    count:
      getActiveFilterCount(
        filters
      ),

    reason
  };

  root.dispatchEvent(
    new CustomEvent(
      'govcareer:filter-change',
      {
        bubbles:
          true,
        detail
      }
    )
  );

  document.dispatchEvent(
    new CustomEvent(
      'govcareer:filters-ui-change',
      {
        detail
      }
    )
  );
}

function applyCurrentFilters(
  root,
  reason =
    'apply'
) {
  const state =
    getComponentState(
      root
    );

  state.filters =
    readFiltersFromDOM(
      root
    );

  updateFilterSummary(
    root,
    state.filters
  );

  emitFilterChange(
    root,
    state.filters,
    reason
  );

  return cloneFilters(
    state.filters
  );
}

function resetFilterPanel(
  root
) {
  const state =
    getComponentState(
      root
    );

  state.filters =
    createEmptyFilters();

  root
    .querySelectorAll(
      'input[data-filter-field]'
    )
    .forEach(
      (input) => {
        input.checked =
          false;
      }
    );

  updateFilterSummary(
    root,
    state.filters
  );

  emitFilterChange(
    root,
    state.filters,
    'reset'
  );

  return cloneFilters(
    state.filters
  );
}

function setFilterPanelFilters(
  root,
  filters
) {
  const normalized =
    cloneFilters(
      filters
    );

  const selection =
    new Set();

  Object.entries(
    normalized
  ).forEach(
    ([
      field,
      values
    ]) => {
      values.forEach(
        (value) => {
          selection.add(
            `${field}::${value}`
          );
        }
      );
    }
  );

  root
    .querySelectorAll(
      'input[data-filter-field]'
    )
    .forEach(
      (input) => {
        const key =
          `${input.dataset.filterField}::${input.dataset.filterValue}`;

        input.checked =
          selection.has(
            key
          );
      }
    );

  const state =
    getComponentState(
      root
    );

  state.filters =
    normalized;

  updateFilterSummary(
    root,
    normalized
  );

  return normalized;
}

function bindFilterPanel(
  root
) {
  if (
    root.dataset
      .filterBound ===
    'true'
  ) {
    return;
  }

  root.dataset
    .filterBound =
    'true';

  const state =
    getComponentState(
      root
    );

  root.addEventListener(
    'change',
    (event) => {
      const input =
        event.target.closest(
          '[data-filter-field]'
        );

      if (
        !input
      ) {
        return;
      }

      state.filters =
        readFiltersFromDOM(
          root
        );

      updateFilterSummary(
        root,
        state.filters
      );

      /*
       * Changes are emitted immediately for live UIs.
       * The Apply button also emits an explicit `apply` event.
       */
      emitFilterChange(
        root,
        state.filters,
        'change'
      );
    }
  );

  root
    .querySelector(
      '[data-filter-apply]'
    )
    ?.addEventListener(
      'click',
      () => {
        applyCurrentFilters(
          root,
          'apply'
        );
      }
    );

  root
    .querySelector(
      '[data-filter-reset]'
    )
    ?.addEventListener(
      'click',
      () => {
        resetFilterPanel(
          root
        );
      }
    );

  root
    .querySelector(
      '[data-filter-toggle]'
    )
    ?.addEventListener(
      'click',
      () => {
        const toggle =
          root.querySelector(
            '[data-filter-toggle]'
          );

        const groups =
          root.querySelector(
            '[data-filter-groups]'
          );

        if (
          !toggle ||
          !groups
        ) {
          return;
        }

        const expanded =
          toggle.getAttribute(
            'aria-expanded'
          ) !==
          'false';

        toggle.setAttribute(
          'aria-expanded',
          String(
            !expanded
          )
        );

        groups.hidden =
          expanded;

        state.open =
          !expanded;
      }
    );

  updateFilterSummary(
    root,
    state.filters
  );
}

/* ============================================================
 * PUBLIC API
 * ============================================================
 */

function createFilterPanel(
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createFilterPanelMarkup(
      options
    );

  const root =
    wrapper.firstElementChild;

  if (
    !root
  ) {
    throw new Error(
      'Unable to create filter panel.'
    );
  }

  bindFilterPanel(
    root
  );

  const state =
    getComponentState(
      root
    );

  state.filters =
    cloneFilters(
      options.filters ||
        {}
    );

  setFilterPanelFilters(
    root,
    state.filters
  );

  return root;
}

function mountFilterPanel(
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

  const panel =
    createFilterPanel(
      options
    );

  mount.append(
    panel
  );

  return panel;
}

function initializeFilterPanels() {
  document
    .querySelectorAll(
      '[data-filter-panel]'
    )
    .forEach(
      (root) => {
        bindFilterPanel(
          root
        );

        const state =
          getComponentState(
            root
          );

        state.filters =
          readFiltersFromDOM(
            root
          );

        updateFilterSummary(
          root,
          state.filters
        );
      }
    );
}

export {
  FILTER_DEFINITIONS,

  createEmptyFilters,
  cloneFilters,
  getFilterDefinitions,
  getActiveFilterCount,

  createFilterPanelMarkup,
  createFilterPanel,
  mountFilterPanel,

  readFiltersFromDOM,
  applyCurrentFilters,
  resetFilterPanel,
  setFilterPanelFilters,

  initializeFilterPanels
};

export default {
  createFilterPanel,
  mountFilterPanel,
  initializeFilterPanels
};
