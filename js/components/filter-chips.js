/**
 * GovCareer Compass
 * ============================================================
 * Active Filter Chips Component
 * ============================================================
 *
 * Displays the currently active filters as removable chips.
 *
 * Example:
 *
 *   [West Bengal ×]
 *   [Graduate ×]
 *   [Directly Eligible ×]
 *
 * The component is purely presentational and emits changes.
 */

import {
  FILTER_DEFINITIONS,
  cloneFilters,
  getActiveFilterCount
} from './filter-panel.js';

/* ============================================================
 * UTILITIES
 * ============================================================
 */

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

function getFilterLabel(
  field,
  value,
  labelMap = {}
) {
  const explicit =
    labelMap?.[
      field
    ]?.[
      value
    ];

  if (
    explicit
  ) {
    return String(
      explicit
    );
  }

  const definition =
    FILTER_DEFINITIONS.find(
      (item) =>
        item.id ===
        field
    );

  const option =
    definition?.options?.find(
      (item) =>
        String(
          item.value
        ) ===
        String(
          value
        )
    );

  return (
    option?.label ||
    value
  );
}

/* ============================================================
 * MARKUP
 * ============================================================
 */

function createFilterChipsMarkup(
  {
    filters = {},
    labelMap = {},
    showClearAll = true,
    emptyText =
      'No filters selected'
  } = {}
) {
  const normalized =
    cloneFilters(
      filters
    );

  const chips = [];

  Object.entries(
    normalized
  ).forEach(
    ([
      field,
      values
    ]) => {
      values.forEach(
        (value) => {
          chips.push(`
            <button
              type="button"
              class="filter-chip"
              data-filter-chip
              data-filter-field="${escapeHtml(
                field
              )}"
              data-filter-value="${escapeHtml(
                value
              )}"
              aria-label="Remove ${escapeHtml(
                getFilterLabel(
                  field,
                  value,
                  labelMap
                )
              )} filter"
            >
              <span
                class="filter-chip__label"
              >
                ${escapeHtml(
                  getFilterLabel(
                    field,
                    value,
                    labelMap
                  )
                )}
              </span>

              <span
                class="filter-chip__remove"
                aria-hidden="true"
              >
                ×
              </span>
            </button>
          `);
        }
      );
    }
  );

  if (
    chips.length ===
    0
  ) {
    return `
      <div
        class="filter-chips filter-chips--empty"
        data-filter-chips
        aria-live="polite"
      >
        <span
          class="filter-chips__empty"
        >
          ${escapeHtml(
            emptyText
          )}
        </span>
      </div>
    `;
  }

  return `
    <div
      class="filter-chips"
      data-filter-chips
      aria-label="Active filters"
    >

      <div
        class="filter-chips__list"
      >
        ${chips.join(
          ''
        )}
      </div>

      ${
        showClearAll
          ? `
            <button
              type="button"
              class="filter-chips__clear"
              data-filter-chip-clear
            >
              Clear all
            </button>
          `
          : ''
      }

      <span
        class="filter-chips__count"
        aria-live="polite"
      >
        ${getActiveFilterCount(
          normalized
        )}
      </span>

    </div>
  `;
}

/* ============================================================
 * COMPONENT
 * ============================================================
 */

function createFilterChips(
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createFilterChipsMarkup(
      options
    );

  const element =
    wrapper.firstElementChild;

  if (
    !element
  ) {
    throw new Error(
      'Unable to create filter chips.'
    );
  }

  bindFilterChipEvents(
    element
  );

  return element;
}

function mountFilterChips(
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

  const chips =
    createFilterChips(
      options
    );

  mount.append(
    chips
  );

  return chips;
}

function updateFilterChips(
  root,
  filters,
  options = {}
) {
  if (
    !root
  ) {
    return false;
  }

  root.innerHTML =
    createFilterChipsMarkup({
      ...options,
      filters
    });

  bindFilterChipEvents(
    root
  );

  return true;
}

/* ============================================================
 * EVENTS
 * ============================================================
 */

function emitUpdatedFilters(
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
      'govcareer:filter-chip-change',
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

function bindFilterChipEvents(
  root
) {
  root.addEventListener(
    'click',
    (event) => {
      const removeButton =
        event.target.closest(
          '[data-filter-chip]'
        );

      if (
        removeButton
      ) {
        const field =
          removeButton.dataset
            .filterField;

        const value =
          removeButton.dataset
            .filterValue;

        if (
          !field ||
          !value
        ) {
          return;
        }

        document.dispatchEvent(
          new CustomEvent(
            'govcareer:filter-remove',
            {
              detail: {
                field,
                value
              }
            }
          )
        );

        root.dispatchEvent(
          new CustomEvent(
            'govcareer:filter-chip-change',
            {
              bubbles:
                true,

              detail: {
                field,
                value,
                action:
                  'remove'
              }
            }
          )
        );

        return;
      }

      const clear =
        event.target.closest(
          '[data-filter-chip-clear]'
        );

      if (
        clear
      ) {
        document.dispatchEvent(
          new CustomEvent(
            'govcareer:filters-clear',
            {
              detail: {
                reason:
                  'chip-clear-all'
              }
            }
          )
        );

        root.dispatchEvent(
          new CustomEvent(
            'govcareer:filter-chip-change',
            {
              bubbles:
                true,

              detail: {
                action:
                  'clear'
              }
            }
          )
        );
      }
    }
  );
}

function initializeFilterChips() {
  document
    .querySelectorAll(
      '[data-filter-chips]'
    )
    .forEach(
      (root) => {
        /*
         * Event delegation is already attached to each root only
         * when created. Existing server/static markup can opt in
         * here as well.
         */
        if (
          root.dataset
            .filterChipsBound ===
          'true'
        ) {
          return;
        }

        root.dataset
          .filterChipsBound =
          'true';

        bindFilterChipEvents(
          root
        );
      }
    );
}

export {
  createFilterChipsMarkup,
  createFilterChips,
  mountFilterChips,
  updateFilterChips,
  initializeFilterChips
};

export default {
  createFilterChips,
  mountFilterChips,
  updateFilterChips,
  initializeFilterChips
};
