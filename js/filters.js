/**
 * GovCareer Compass
 * Generic multi-filter engine
 *
 * Filters are intentionally separate from recommendation scoring.
 *
 * Eligibility:
 *   hard rules
 *
 * Filtering:
 *   user-selected data constraints
 *
 * Recommendation:
 *   preference/scoring engine
 */

import storage from './storage.js';
import config from './config.js';

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return [];
  }

  return [value];
}

function getNestedValue(
  object,
  path
) {
  return String(path)
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

function matchesValue(
  itemValue,
  expected
) {
  const expectedValues =
    normalizeArray(expected);

  if (
    expectedValues.length === 0
  ) {
    return true;
  }

  const itemValues =
    normalizeArray(
      itemValue
    );

  return expectedValues.some(
    (expectedValue) =>
      itemValues.some(
        (actualValue) =>
          String(
            actualValue
          ) ===
          String(
            expectedValue
          )
      )
  );
}

function matchesText(
  item,
  query,
  fields = []
) {
  if (!query) {
    return true;
  }

  const normalized =
    String(query)
      .toLowerCase()
      .trim();

  if (!normalized) {
    return true;
  }

  const searchable =
    fields
      .map((field) =>
        getNestedValue(
          item,
          field
        )
      )
      .flatMap((value) =>
        Array.isArray(value)
          ? value
          : [value]
      )
      .filter(
        (value) =>
          value !== undefined &&
          value !== null
      )
      .join(' ')
      .toLowerCase();

  return searchable.includes(
    normalized
  );
}

function compareNumeric(
  value,
  operator,
  target
) {
  const actual =
    Number(value);
  const expected =
    Number(target);

  if (
    !Number.isFinite(actual) ||
    !Number.isFinite(expected)
  ) {
    return false;
  }

  switch (operator) {
    case 'gte':
      return actual >= expected;

    case 'gt':
      return actual > expected;

    case 'lte':
      return actual <= expected;

    case 'lt':
      return actual < expected;

    case 'eq':
      return actual === expected;

    default:
      return false;
  }
}

function applyFilterSet(
  items,
  filters = {},
  schema = {}
) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter(
    (item) => {
      if (
        filters.search &&
        !matchesText(
          item,
          filters.search,
          schema.searchFields || []
        )
      ) {
        return false;
      }

      for (const [
        filterKey,
        filterConfig
      ] of Object.entries(
        schema.fields || {}
      )) {
        const selected =
          filters[
            filterKey
          ];

        if (
          selected === undefined ||
          selected === null ||
          selected === '' ||
          (
            Array.isArray(
              selected
            ) &&
            selected.length === 0
          )
        ) {
          continue;
        }

        const actual =
          getNestedValue(
            item,
            filterConfig.path ||
              filterKey
          );

        switch (
          filterConfig.type
        ) {
          case 'select':
          case 'multi-select':
            if (
              !matchesValue(
                actual,
                selected
              )
            ) {
              return false;
            }
            break;

          case 'boolean':
            if (
              Boolean(actual) !==
              Boolean(selected)
            ) {
              return false;
            }
            break;

          case 'number':
            if (
              !compareNumeric(
                actual,
                filterConfig.operator ||
                  'eq',
                selected
              )
            ) {
              return false;
            }
            break;

          case 'range': {
            const min =
              selected.min;
            const max =
              selected.max;

            if (
              min !== undefined &&
              !compareNumeric(
                actual,
                'gte',
                min
              )
            ) {
              return false;
            }

            if (
              max !== undefined &&
              !compareNumeric(
                actual,
                'lte',
                max
              )
            ) {
              return false;
            }

            break;
          }

          case 'text':
            if (
              !matchesText(
                item,
                selected,
                [
                  filterConfig.path ||
                    filterKey
                ]
              )
            ) {
              return false;
            }
            break;

          case 'custom':
            if (
              typeof filterConfig.test ===
              'function' &&
              !filterConfig.test(
                actual,
                item,
                selected
              )
            ) {
              return false;
            }
            break;

          default:
            break;
        }
      }

      return true;
    }
  );
}

function getFilterState(
  storageKey = config.storageKeys.filters
) {
  return storage.get(
    storageKey,
    {}
  );
}

function saveFilterState(
  filters,
  storageKey = config.storageKeys.filters
) {
  storage.set(
    storageKey,
    filters
  );
}

function clearFilterState(
  storageKey = config.storageKeys.filters
) {
  storage.remove(
    storageKey
  );
}

function collectFormFilters(
  form
) {
  const filters = {};

  if (!form) {
    return filters;
  }

  const elements =
    form.querySelectorAll(
      'input[name], select[name], textarea[name]'
    );

  elements.forEach(
    (element) => {
      const {
        name,
        type
      } = element;

      if (!name) {
        return;
      }

      if (
        type === 'checkbox'
      ) {
        const group =
          form.querySelectorAll(
            `input[name="${CSS.escape(
              name
            )}"][type="checkbox"]:checked`
          );

        filters[name] =
          [...group].map(
            (input) =>
              input.value
          );

        return;
      }

      if (
        type === 'radio'
      ) {
        if (!element.checked) {
          return;
        }
      }

      filters[name] =
        element.value;
    }
  );

  return filters;
}

function populateFormFromFilters(
  form,
  filters = {}
) {
  if (!form) {
    return;
  }

  Object.entries(
    filters
  ).forEach(
    ([name, value]) => {
      const elements =
        form.querySelectorAll(
          `[name="${CSS.escape(
            name
          )}"]`
        );

      elements.forEach(
        (element) => {
          if (
            element.type ===
            'checkbox'
          ) {
            element.checked =
              normalizeArray(
                value
              ).includes(
                element.value
              );
          } else if (
            element.type ===
            'radio'
          ) {
            element.checked =
              String(
                value
              ) ===
              String(
                element.value
              );
          } else {
            element.value =
              value ?? '';
          }
        }
      );
    }
  );
}

function renderFilterChips(
  filters,
  container,
  labels = {}
) {
  if (!container) {
    return;
  }

  const entries =
    Object.entries(
      filters || {}
    ).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(
          Array.isArray(
            value
          ) &&
          value.length === 0
        )
    );

  container.innerHTML =
    entries
      .map(
        ([key, value]) => {
          const label =
            labels[key] ||
            key;

          const display =
            Array.isArray(value)
              ? value.join(', ')
              : typeof value ===
                'object'
              ? JSON.stringify(
                  value
                )
              : value;

          return `
            <button
              type="button"
              class="filter-chip"
              data-remove-filter="${escapeHtml(
                key
              )}"
              title="Remove ${escapeHtml(
                label
              )}"
            >
              <span>
                ${escapeHtml(
                  label
                )}: ${escapeHtml(
                  display
                )}
              </span>
              <span
                aria-hidden="true"
              >
                ×
              </span>
            </button>
          `;
        }
      )
      .join('');
}

function removeFilter(
  filters,
  key
) {
  const next = {
    ...filters
  };

  delete next[key];

  return next;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export {
  applyFilterSet,
  getFilterState,
  saveFilterState,
  clearFilterState,
  collectFormFilters,
  populateFormFromFilters,
  renderFilterChips,
  removeFilter,
  matchesValue,
  matchesText,
  compareNumeric
};

export default {
  applyFilterSet,
  getFilterState,
  saveFilterState,
  clearFilterState,
  collectFormFilters,
  populateFormFromFilters,
  renderFilterChips,
  removeFilter
};
