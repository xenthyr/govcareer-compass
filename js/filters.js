/**
 * GovCareer Compass
 * ============================================================
 * Career Filter State
 * ============================================================
 *
 * Filters are presentation/discovery controls.
 *
 * They NEVER replace the eligibility engine.
 */

import {
  getItem,
  setItem
} from './storage.js';

import {
  STORAGE_KEYS
} from './config.js';

const DEFAULT_FILTERS =
  Object.freeze({
    government:
      [],

    state:
      [],

    educationalLevel:
      [],

    eligibility:
      [],

    category:
      [],

    department:
      [],

    organisation:
      [],

    serviceCadre:
      [],

    paySystem:
      [],

    payLevel:
      [],

    location:
      [],

    workStyle:
      [],

    physical:
      [],

    family:
      [],

    stress:
      [],

    housing:
      [],

    recruitmentStatus:
      [],

    employmentStatus:
      []
  });

let activeFilters =
  {
    ...DEFAULT_FILTERS
  };

function normalizeFilterValues(
  values
) {
  if (
    values ===
      undefined ||
    values ===
      null
  ) {
    return [];
  }

  const array =
    Array.isArray(
      values
    )
      ? values
      : [
          values
        ];

  return [
    ...new Set(
      array
        .map(
          (value) =>
            String(
              value
            ).trim()
        )
        .filter(Boolean)
    )
  ];
}

function normalizeFilters(
  filters = {}
) {
  const normalized = {};

  Object.keys(
    DEFAULT_FILTERS
  ).forEach(
    (key) => {
      normalized[
        key
      ] =
        normalizeFilterValues(
          filters[
            key
          ]
        );
    }
  );

  return normalized;
}

function getFilters() {
  return {
    ...normalizeFilters(
      activeFilters
    )
  };
}

function setFilters(
  filters,
  {
    persist = true
  } = {}
) {
  activeFilters =
    normalizeFilters(
      {
        ...activeFilters,
        ...(filters || {})
      }
    );

  if (
    persist
  ) {
    setItem(
      STORAGE_KEYS.filters,
      activeFilters
    );
  }

  document.dispatchEvent(
    new CustomEvent(
      'govcareer:filterschange',
      {
        detail: {
          filters:
            getFilters()
        }
      }
    )
  );

  return getFilters();
}

function resetFilters(
  {
    persist = true
  } = {}
) {
  activeFilters =
    normalizeFilters(
      DEFAULT_FILTERS
    );

  if (
    persist
  ) {
    setItem(
      STORAGE_KEYS.filters,
      activeFilters
    );
  }

  document.dispatchEvent(
    new CustomEvent(
      'govcareer:filterschange',
      {
        detail: {
          filters:
            getFilters()
        }
      }
    )
  );

  return getFilters();
}

function addFilter(
  category,
  value
) {
  const current =
    activeFilters[
      category
    ] || [];

  return setFilters({
    [category]:
      [
        ...current,
        value
      ]
  });
}

function removeFilter(
  category,
  value
) {
  const current =
    activeFilters[
      category
    ] || [];

  return setFilters({
    [category]:
      current.filter(
        (item) =>
          item !==
          String(
            value
          )
      )
  });
}

function getActiveFilterChips() {
  const chips = [];

  Object.entries(
    activeFilters
  ).forEach(
    ([
      category,
      values
    ]) => {
      values.forEach(
        (value) => {
          chips.push({
            category,
            value
          });
        }
      );
    }
  );

  return chips;
}

function recordMatchesFilter(
  record,
  category,
  allowedValues
) {
  if (
    !allowedValues?.length
  ) {
    return true;
  }

  const fieldMap = {
    government:
      'governmentId',

    state:
      'stateId',

    educationalLevel:
      'qualificationLevelIds',

    eligibility:
      'eligibilityStatus',

    category:
      'categoryIds',

    department:
      'departmentId',

    organisation:
      'organisationId',

    serviceCadre:
      'serviceCadreId',

    paySystem:
      'paySystemId',

    payLevel:
      'payLevel',

    location:
      'locationIds',

    workStyle:
      'workStyle',

    physical:
      'physicalRequirement',

    family:
      'familyCategory',

    stress:
      'stressCategory',

    housing:
      'housingCategory',

    recruitmentStatus:
      'currentStatus',

    employmentStatus:
      'employmentStatus'
  };

  const field =
    fieldMap[
      category
    ];

  if (
    !field
  ) {
    return true;
  }

  let actual =
    record[
      field
    ];

  /*
   * Some records use alternative field names while the canonical
   * schema is being populated. These fallbacks improve resilience.
   */
  if (
    actual ===
      undefined &&
    category ===
      'eligibility'
  ) {
    actual =
      record.baEligibility;
  }

  if (
    actual ===
      undefined &&
    category ===
      'physical'
  ) {
    actual =
      record.physicalTest;
  }

  if (
    actual ===
      undefined &&
    category ===
      'housing'
  ) {
    actual =
      record.housingType;
  }

  const actualValues =
    Array.isArray(
      actual
    )
      ? actual
      : [
          actual
        ];

  return allowedValues.some(
    (allowed) =>
      actualValues.some(
        (value) =>
          String(
            value
          ).toLowerCase() ===
          String(
            allowed
          ).toLowerCase()
      )
  );
}

function applyFilters(
  records,
  filters =
    activeFilters
) {
  if (
    !Array.isArray(
      records
    )
  ) {
    return [];
  }

  const normalized =
    normalizeFilters(
      filters
    );

  return records.filter(
    (record) =>
      Object.entries(
        normalized
      ).every(
        ([
          category,
          values
        ]) =>
          recordMatchesFilter(
            record,
            category,
            values
          )
      )
  );
}

function getFilterCount() {
  return getActiveFilterChips()
    .length;
}

function initializeFilters() {
  const persisted =
    getItem(
      STORAGE_KEYS.filters,
      DEFAULT_FILTERS
    );

  activeFilters =
    normalizeFilters(
      persisted
    );

  document.dispatchEvent(
    new CustomEvent(
      'govcareer:filtersready',
      {
        detail: {
          filters:
            getFilters()
        }
      }
    )
  );
}

export {
  DEFAULT_FILTERS,

  getFilters,
  setFilters,
  resetFilters,

  addFilter,
  removeFilter,

  getActiveFilterChips,
  getFilterCount,

  recordMatchesFilter,
  applyFilters,

  initializeFilters
};

export default {
  getFilters,
  setFilters,
  resetFilters,
  applyFilters,
  initializeFilters
};
