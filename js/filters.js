/**
 * GovCareer Compass
 * ============================================================
 * Career Filter State
 * ============================================================
 *
 * Filters are presentation / discovery controls.
 *
 * IMPORTANT:
 * - Filters NEVER replace the eligibility engine.
 * - Filters NEVER calculate eligibility.
 * - Filters NEVER mutate canonical records.
 * - Filters operate against normalized canonical career/result models.
 *
 * Composition:
 * - OR within one filter category.
 * - AND across different filter categories.
 *
 * Supported filter categories:
 * - government
 * - state
 * - educationLevel
 * - qualification
 * - eligibilityStatus
 * - serviceCadre
 * - exam
 * - department
 * - organisation
 * - salary
 * - payLevel
 * - authority
 * - workLife
 * - familyCompatibility
 * - parentCareCompatibility
 * - kolkataStability
 * - ruralPosting
 * - transferBurden
 * - nightDuty
 * - shiftDuty
 * - physicalRisk
 * - stress
 * - housing
 * - recruitmentStatus
 */

import {
  getItem,
  setItem
} from './storage.js';

import {
  STORAGE_KEYS
} from './config.js';


/* --------------------------------------------------------------------------
 * Default filter state
 * -------------------------------------------------------------------------- */

const DEFAULT_FILTERS =
  Object.freeze({
    government:
      [],

    state:
      [],

    educationLevel:
      [],

    qualification:
      [],

    eligibilityStatus:
      [],

    serviceCadre:
      [],

    exam:
      [],

    department:
      [],

    organisation:
      [],

    salary:
      [],

    payLevel:
      [],

    authority:
      [],

    workLife:
      [],

    familyCompatibility:
      [],

    parentCareCompatibility:
      [],

    kolkataStability:
      [],

    ruralPosting:
      [],

    transferBurden:
      [],

    nightDuty:
      [],

    shiftDuty:
      [],

    physicalRisk:
      [],

    stress:
      [],

    housing:
      [],

    recruitmentStatus:
      []
  });


/*
 * Compatibility aliases for code/UI that may still use names from the
 * previous filter contract.
 *
 * They are normalized to the canonical keys and are not persisted as
 * separate filter categories.
 */
const FILTER_ALIASES =
  Object.freeze({
    educationalLevel:
      'educationLevel',

    eligibility:
      'eligibilityStatus',

    category:
      'qualification',

    paySystem:
      'salary',

    location:
      'state',

    workStyle:
      'workLife',

    physical:
      'physicalRisk',

    family:
      'familyCompatibility',

    parentCare:
      'parentCareCompatibility',

    kolkata:
      'kolkataStability',

    rural:
      'ruralPosting',

    transfer:
      'transferBurden',

    night:
      'nightDuty',

    shift:
      'shiftDuty'
  });


const FILTER_KEYS =
  Object.freeze(
    Object.keys(
      DEFAULT_FILTERS
    )
  );


let activeFilters =
  createEmptyFilters();


/* --------------------------------------------------------------------------
 * Generic helpers
 * -------------------------------------------------------------------------- */

function createEmptyFilters() {
  return Object.keys(
    DEFAULT_FILTERS
  ).reduce(
    (
      result,
      key
    ) => {
      result[key] = [];
      return result;
    },
    {}
  );
}


function canonicalizeFilterCategory(
  category
) {
  const normalized =
    String(
      category ?? ''
    )
      .trim()
      .replace(
        /[\s-]+/g,
        ''
      );

  if (
    !normalized
  ) {
    return '';
  }

  const direct =
    FILTER_KEYS.find(
      (key) =>
        key.toLowerCase() ===
        normalized.toLowerCase()
    );

  if (
    direct
  ) {
    return direct;
  }

  const alias =
    Object.keys(
      FILTER_ALIASES
    ).find(
      (key) =>
        key.toLowerCase() ===
        normalized.toLowerCase()
    );

  return alias
    ? FILTER_ALIASES[
        alias
      ]
    : '';
}


function normalizeScalar(
  value
) {
  if (
    value ===
      undefined ||
    value ===
      null
  ) {
    return '';
  }

  return String(
    value
  )
    .trim();
}


function normalizeComparable(
  value
) {
  return normalizeScalar(
    value
  ).toLowerCase();
}


function isFilterDescriptor(
  value
) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}


/**
 * Supports both normal filter values and declarative numeric/range filters.
 *
 * Examples:
 *
 * 'HIGH'
 * 'L7'
 * 50000
 *
 * { min: 40000, max: 70000 }
 * { gte: 50000 }
 * { lte: 100000 }
 * { eq: 7 }
 * { in: ['HIGH', 'MEDIUM'] }
 */
function normalizeFilterValue(
  value
) {
  if (
    isFilterDescriptor(
      value
    )
  ) {
    const descriptor = {};

    Object.entries(
      value
    ).forEach(
      ([
        key,
        descriptorValue
      ]) => {
        if (
          descriptorValue ===
            undefined ||
          descriptorValue ===
            null ||
          (
            Array.isArray(
              descriptorValue
            ) &&
            descriptorValue.length ===
              0
          )
        ) {
          return;
        }

        if (
          Array.isArray(
            descriptorValue
          )
        ) {
          descriptor[key] =
            descriptorValue
              .map(
                normalizeScalar
              )
              .filter(Boolean);

          return;
        }

        descriptor[key] =
          normalizeScalar(
            descriptorValue
          );
      }
    );

    return descriptor;
  }

  const normalized =
    normalizeScalar(
      value
    );

  return normalized;
}


function filterValuesEqual(
  a,
  b
) {
  if (
    isFilterDescriptor(a) ||
    isFilterDescriptor(b)
  ) {
    return (
      isFilterDescriptor(a) &&
      isFilterDescriptor(b) &&
      JSON.stringify(a) ===
        JSON.stringify(b)
    );
  }

  return (
    normalizeComparable(
      a
    ) ===
    normalizeComparable(
      b
    )
  );
}


/* --------------------------------------------------------------------------
 * Filter-state normalization
 * -------------------------------------------------------------------------- */

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

  const normalized =
    [];

  array.forEach(
    (value) => {
      const item =
        normalizeFilterValue(
          value
        );

      if (
        item === '' ||
        (
          isFilterDescriptor(
            item
          ) &&
          Object.keys(
            item
          ).length ===
            0
        )
      ) {
        return;
      }

      const alreadyExists =
        normalized.some(
          (
            existing
          ) =>
            filterValuesEqual(
              existing,
              item
            )
        );

      if (
        !alreadyExists
      ) {
        normalized.push(
          item
        );
      }
    }
  );

  return normalized;
}


function normalizeFilters(
  filters = {}
) {
  const source =
    filters &&
    typeof filters === 'object'
      ? filters
      : {};

  const normalized =
    createEmptyFilters();


  FILTER_KEYS.forEach(
    (key) => {
      const direct =
        source[
          key
        ];

      normalized[key] =
        normalizeFilterValues(
          direct
        );
    }
  );


  /*
   * Read legacy aliases only when their canonical key is absent/empty.
   */
  Object.entries(
    FILTER_ALIASES
  ).forEach(
    ([
      alias,
      canonicalKey
    ]) => {
      if (
        normalized[
          canonicalKey
        ].length > 0
      ) {
        return;
      }

      if (
        source[
          alias
        ] ===
          undefined
      ) {
        return;
      }

      normalized[
        canonicalKey
      ] =
        normalizeFilterValues(
          source[
            alias
          ]
        );
    }
  );


  return normalized;
}


function getFilters() {
  return normalizeFilters(
    activeFilters
  );
}


/* --------------------------------------------------------------------------
 * Filter-state mutation
 * -------------------------------------------------------------------------- */

function emitFilterChange(
  eventName,
  filters
) {
  if (
    typeof document ===
    'undefined'
  ) {
    return;
  }

  document.dispatchEvent(
    new CustomEvent(
      eventName,
      {
        detail: {
          filters:
            normalizeFilters(
              filters
            )
        }
      }
    )
  );
}


function setFilters(
  filters,
  {
    persist = true
  } = {}
) {
  const normalizedInput =
    normalizeFilters(
      filters || {}
    );

  activeFilters =
    normalizeFilters({
      ...activeFilters,
      ...normalizedInput
    });


  if (
    persist
  ) {
    setItem(
      STORAGE_KEYS.filters,
      activeFilters
    );
  }


  const current =
    getFilters();

  emitFilterChange(
    'govcareer:filterschange',
    current
  );

  return current;
}


function resetFilters(
  {
    persist = true
  } = {}
) {
  activeFilters =
    createEmptyFilters();


  if (
    persist
  ) {
    setItem(
      STORAGE_KEYS.filters,
      activeFilters
    );
  }


  const current =
    getFilters();

  emitFilterChange(
    'govcareer:filterschange',
    current
  );

  return current;
}


/**
 * Add one value without mutating the current filter array.
 */
function addFilter(
  category,
  value
) {
  const canonicalCategory =
    canonicalizeFilterCategory(
      category
    );

  if (
    !canonicalCategory
  ) {
    return getFilters();
  }


  const current =
    activeFilters[
      canonicalCategory
    ] || [];


  return setFilters({
    [canonicalCategory]:
      [
        ...current,
        value
      ]
  });
}


/**
 * Remove one value without mutating the current filter array.
 */
function removeFilter(
  category,
  value
) {
  const canonicalCategory =
    canonicalizeFilterCategory(
      category
    );

  if (
    !canonicalCategory
  ) {
    return getFilters();
  }


  const current =
    activeFilters[
      canonicalCategory
    ] || [];


  return setFilters({
    [canonicalCategory]:
      current.filter(
        (item) =>
          !filterValuesEqual(
            item,
            value
          )
      )
  });
}


/**
 * Remove every value from one filter category.
 */
function clearFilter(
  category,
  {
    persist = true
  } = {}
) {
  const canonicalCategory =
    canonicalizeFilterCategory(
      category
    );

  if (
    !canonicalCategory
  ) {
    return getFilters();
  }


  return setFilters(
    {
      [canonicalCategory]:
        []
    },
    {
      persist
    }
  );
}


/* --------------------------------------------------------------------------
 * Active filter presentation helpers
 * -------------------------------------------------------------------------- */

function serializeFilterValue(
  value
) {
  if (
    isFilterDescriptor(
      value
    )
  ) {
    return Object.entries(
      value
    )
      .map(
        ([
          operator,
          operatorValue
        ]) =>
          `${operator}:${Array.isArray(operatorValue) ? operatorValue.join(',') : operatorValue}`
      )
      .join(' ');
  }

  return String(
    value
  );
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
            value,
            displayValue:
              serializeFilterValue(
                value
              )
          });
        }
      );
    }
  );


  return chips;
}


function getFilterCount() {
  return getActiveFilterChips()
    .length;
}


/* --------------------------------------------------------------------------
 * Canonical record access
 * -------------------------------------------------------------------------- */

function getPathValue(
  record,
  path
) {
  return path
    .split('.')
    .reduce(
      (
        current,
        key
      ) =>
        current &&
        typeof current === 'object'
          ? current[key]
          : undefined,
      record
    );
}


function flattenValues(
  value
) {
  if (
    value ===
      undefined ||
    value ===
      null
  ) {
    return [];
  }


  if (
    Array.isArray(
      value
    )
  ) {
    return value.flatMap(
      flattenValues
    );
  }


  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return [
      value
    ];
  }


  if (
    typeof value === 'object'
  ) {
    /*
     * Localized value:
     * { en: '...', bn: '...' }
     *
     * Both languages are searchable/filterable when such a field is used.
     */
    if (
      typeof value.en === 'string' ||
      typeof value.bn === 'string'
    ) {
      return Object.values(
        value
      ).filter(
        (
          item
        ) =>
          typeof item === 'string' ||
          typeof item === 'number'
      );
    }


    return Object.values(
      value
    ).flatMap(
      flattenValues
    );
  }


  return [];
}


function getValuesAtPaths(
  record,
  paths
) {
  return paths.flatMap(
    (path) =>
      flattenValues(
        getPathValue(
          record,
          path
        )
      )
  );
}


/**
 * A filter can be applied to:
 *
 * 1. A raw canonical career record.
 * 2. A scored career result containing the canonical record.
 * 3. A result with an attached eligibility result.
 *
 * The canonical record itself is never modified.
 */
function getCareerRecord(
  value
) {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return null;
  }


  if (
    value.record &&
    typeof value.record === 'object'
  ) {
    return value.record;
  }


  if (
    value.career &&
    typeof value.career === 'object'
  ) {
    return value.career;
  }


  if (
    value.job &&
    typeof value.job === 'object'
  ) {
    return value.job;
  }


  return value;
}


/* --------------------------------------------------------------------------
 * Eligibility result access
 * -------------------------------------------------------------------------- */

function getEligibilityStatusValues(
  value
) {
  const record =
    getCareerRecord(
      value
    );


  /*
   * Runtime eligibility is authoritative only when it has already been
   * produced by the eligibility engine and attached to the result.
   *
   * No eligibility calculation is performed here.
   */
  const candidates = [
    value?.eligibilityResult?.status,

    value?.eligibility?.status,

    record?.eligibilityStatus,

    record?.eligibility?.status
  ];


  return candidates
    .flatMap(
      flattenValues
    )
    .filter(
      Boolean
    );
}


/* --------------------------------------------------------------------------
 * Canonical field extraction
 * -------------------------------------------------------------------------- */

const FILTER_FIELD_PATHS =
  Object.freeze({
    government:
      [
        'governmentId',
        'identity.governmentId'
      ],

    state:
      [
        'stateId',
        'identity.stateId',
        'cadreScope.stateIds'
      ],

    educationLevel:
      [
        'eligibility.educationLevel',
        'eligibility.minimumEducationLevel',
        'eligibility.educationLevelIds',
        'qualificationLevelIds'
      ],

    qualification:
      [
        'eligibility.qualificationIds',
        'eligibility.requiredQualificationIds',
        'eligibility.minimumQualificationId',
        'qualificationIds'
      ],

    serviceCadre:
      [
        'identity.serviceCadreId',
        'serviceCadreId'
      ],

    exam:
      [
        'recruitment.examIds',
        'examIds'
      ],

    department:
      [
        'identity.departmentId',
        'departmentId'
      ],

    organisation:
      [
        'identity.organisationId',
        'organisationId'
      ],

    salary:
      [
        'salary',
        'startingBasic',
        'pay.startingBasic',
        'pay.basicPay',
        'payProfile.startingBasic',
        'payProfile.basicPay',
        'pay.salary',
        'payProfile.salary',
        'analysis.startingBasic',
        'analysis.salaryScore'
      ],

    payLevel:
      [
        'payLevel',
        'pay.level',
        'pay.payLevel',
        'payProfile.level',
        'payProfile.payLevel',
        'analysis.payLevel'
      ],

    authority:
      [
        'analysis.authority',
        'analysis.authorityScore'
      ],

    workLife:
      [
        'analysis.workLife',
        'analysis.workLifeScore',
        'lifestyle.workLife',
        'lifestyle.workLifeScore',
        'lifestyle.predictability'
      ],

    familyCompatibility:
      [
        'analysis.familyCompatibility',
        'analysis.familyCompatibilityScore'
      ],

    parentCareCompatibility:
      [
        'analysis.parentCareCompatibility',
        'analysis.parentCareCompatibilityScore'
      ],

    kolkataStability:
      [
        'analysis.kolkataStability',
        'analysis.kolkataStabilityScore'
      ],

    ruralPosting:
      [
        'analysis.ruralPosting',
        'analysis.ruralPostingBurden',
        'analysis.ruralPostingScore',
        'analysis.ruralPostingStatus'
      ],

    transferBurden:
      [
        'analysis.transferBurden',
        'analysis.transferBurdenScore',
        'analysis.transferControl',
        'analysis.transferFrequency',
        'transferBurden'
      ],

    nightDuty:
      [
        'lifestyle.nightDutyStatus',
        'lifestyle.nightDuty',
        'lifestyle.nightDutyScore',
        'analysis.nightDuty',
        'analysis.nightDutyBurden',
        'nightDutyStatus'
      ],

    shiftDuty:
      [
        'lifestyle.shiftDutyStatus',
        'lifestyle.shiftDuty',
        'lifestyle.shiftDutyScore',
        'analysis.shiftDuty',
        'analysis.shiftDutyBurden',
        'shiftDutyStatus'
      ],

    physicalRisk:
      [
        'analysis.physicalRisk',
        'analysis.physicalRiskScore',
        'lifestyle.physicalRisk',
        'lifestyle.physicalRiskScore',
        'physicalRisk'
      ],

    stress:
      [
        'analysis.stress',
        'analysis.stressScore',
        'lifestyle.stress',
        'lifestyle.stressScore',
        'stress'
      ],

    housing:
      [
        'housing',
        'housingCategory',
        'housingProfileId',
        'housingAdvantage',
        'analysis.housingAdvantage',
        'analysis.housingCategory'
      ],

    recruitmentStatus:
      [
        'recruitment.currentStatus',
        'recruitment.currentRecruitmentStatus',
        'recruitmentStatus',
        'currentRecruitmentStatus'
      ]
  });


/* --------------------------------------------------------------------------
 * Filter comparison
 * -------------------------------------------------------------------------- */

function toFiniteNumber(
  value
) {
  if (
    typeof value === 'number' &&
    Number.isFinite(
      value
    )
  ) {
    return value;
  }


  if (
    typeof value !== 'string'
  ) {
    return null;
  }


  const normalized =
    value
      .trim()
      .replace(
        /,/g,
        ''
      )
      .replace(
        /₹/g,
        ''
      )
      .replace(
        /%$/g,
        ''
      );


  if (
    normalized === ''
  ) {
    return null;
  }


  const parsed =
    Number(
      normalized
    );


  return Number.isFinite(
    parsed
  )
    ? parsed
    : null;
}


function valuesContainComparable(
  actualValues,
  targetValue
) {
  return actualValues.some(
    (actual) =>
      filterValuesEqual(
        actual,
        targetValue
      )
  );
}


function compareNumeric(
  actual,
  target,
  operator
) {
  const actualNumber =
    toFiniteNumber(
      actual
    );

  const targetNumber =
    toFiniteNumber(
      target
    );

  if (
    actualNumber === null ||
    targetNumber === null
  ) {
    return false;
  }


  switch (
    operator
  ) {
    case 'gt':
      return actualNumber >
        targetNumber;

    case 'gte':
      return actualNumber >=
        targetNumber;

    case 'lt':
      return actualNumber <
        targetNumber;

    case 'lte':
      return actualNumber <=
        targetNumber;

    case 'eq':
      return actualNumber ===
        targetNumber;

    default:
      return false;
  }
}


function descriptorMatches(
  actualValues,
  descriptor
) {
  if (
    !isFilterDescriptor(
      descriptor
    )
  ) {
    return false;
  }


  /*
   * Explicit membership.
   */
  if (
    Array.isArray(
      descriptor.in
    )
  ) {
    const matches =
      descriptor.in.some(
        (
          value
        ) =>
          valuesContainComparable(
            actualValues,
            value
          )
      );

    if (
      !matches
    ) {
      return false;
    }
  }


  if (
    Array.isArray(
      descriptor.notIn
    ) &&
    descriptor.notIn.some(
      (
        value
      ) =>
        valuesContainComparable(
          actualValues,
          value
        )
    )
  ) {
    return false;
  }


  /*
   * Equality.
   */
  if (
    descriptor.eq !==
      undefined
  ) {
    const equal =
      valuesContainComparable(
        actualValues,
        descriptor.eq
      );


    if (
      !equal
    ) {
      /*
       * Numeric equality is also supported when one side is serialized.
       */
      const numericEqual =
        actualValues.some(
          (
            actual
          ) =>
            compareNumeric(
              actual,
              descriptor.eq,
              'eq'
            )
        );


      if (
        !numericEqual
      ) {
        return false;
      }
    }
  }


  /*
   * Numeric comparisons.
   *
   * A career record containing multiple numeric values matches when at least
   * one actual value satisfies the complete descriptor.
   */
  const comparisonKeys =
    [
      'gt',
      'gte',
      'lt',
      'lte'
    ];


  if (
    comparisonKeys.some(
      (
        key
      ) =>
        descriptor[key] !==
          undefined
    )
  ) {
    const numericMatch =
      actualValues.some(
        (
          actual
        ) =>
          comparisonKeys.every(
            (
              operator
            ) =>
              descriptor[operator] ===
                undefined ||
              compareNumeric(
                actual,
                descriptor[operator],
                operator
              )
          )
      );


    if (
      !numericMatch
    ) {
      return false;
    }
  }


  /*
   * Inclusive range shorthand.
   */
  if (
    descriptor.min !==
      undefined ||
    descriptor.max !==
      undefined
  ) {
    const rangeMatch =
      actualValues.some(
        (
          actual
        ) => {
          const numeric =
            toFiniteNumber(
              actual
            );

          if (
            numeric === null
          ) {
            return false;
          }

          const min =
            descriptor.min !==
              undefined
              ? toFiniteNumber(
                  descriptor.min
                )
              : null;

          const max =
            descriptor.max !==
              undefined
              ? toFiniteNumber(
                  descriptor.max
                )
              : null;


          if (
            min !== null &&
            numeric < min
          ) {
            return false;
          }


          if (
            max !== null &&
            numeric > max
          ) {
            return false;
          }


          return true;
        }
      );


    if (
      !rangeMatch
    ) {
      return false;
    }
  }


  return true;
}


function filterValueMatches(
  actualValues,
  allowedValue
) {
  if (
    !actualValues.length
  ) {
    return false;
  }


  if (
    isFilterDescriptor(
      allowedValue
    )
  ) {
    return descriptorMatches(
      actualValues,
      allowedValue
    );
  }


  /*
   * Normal equality first.
   */
  if (
    valuesContainComparable(
      actualValues,
      allowedValue
    )
  ) {
    return true;
  }


  /*
   * Numeric strings and numbers should compare consistently.
   */
  return actualValues.some(
    (
      actual
    ) =>
      compareNumeric(
        actual,
        allowedValue,
        'eq'
      )
  );
}


/* --------------------------------------------------------------------------
 * Category-specific record matching
 * -------------------------------------------------------------------------- */

function getFilterActualValues(
  value,
  category
) {
  const record =
    getCareerRecord(
      value
    );


  if (
    !record
  ) {
    return [];
  }


  if (
    category ===
    'eligibilityStatus'
  ) {
    return getEligibilityStatusValues(
      value
    );
  }


  const paths =
    FILTER_FIELD_PATHS[
      category
    ] || [];


  return getValuesAtPaths(
    record,
    paths
  );
}


/**
 * Match one category.
 *
 * Semantics:
 * - No active values → category passes.
 * - Multiple active values → OR.
 */
function recordMatchesFilter(
  value,
  category,
  allowedValues
) {
  const canonicalCategory =
    canonicalizeFilterCategory(
      category
    );


  if (
    !canonicalCategory
  ) {
    return true;
  }


  const normalizedAllowedValues =
    normalizeFilterValues(
      allowedValues
    );


  if (
    normalizedAllowedValues.length ===
      0
  ) {
    return true;
  }


  const actualValues =
    getFilterActualValues(
      value,
      canonicalCategory
    );


  /*
   * Never treat missing canonical data as a positive match.
   *
   * This is especially important for eligibility and analytical metrics:
   * absence means "unknown", not "matches".
   */
  if (
    actualValues.length ===
    0
  ) {
    return false;
  }


  return normalizedAllowedValues.some(
    (
      allowed
    ) =>
      filterValueMatches(
        actualValues,
        allowed
      )
  );
}


/* --------------------------------------------------------------------------
 * Composable filtering
 * -------------------------------------------------------------------------- */

/**
 * Apply all active filters.
 *
 * Composition:
 *
 *          Category A
 *             OR
 *          Category A
 *
 *             AND
 *
 *          Category B
 *             OR
 *          Category B
 *
 *             AND ...
 *
 * Canonical records are returned unchanged by reference.
 */
function applyFilters(
  records,
  filters = activeFilters
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
      FILTER_KEYS.every(
        (
          category
        ) =>
          recordMatchesFilter(
            record,
            category,
            normalized[
              category
            ]
          )
      )
  );
}


/**
 * Test whether a record satisfies only the supplied subset of filters.
 *
 * Useful for filter previews/counts without changing global filter state.
 */
function matchesFilters(
  record,
  filters = activeFilters
) {
  const normalized =
    normalizeFilters(
      filters
    );


  return FILTER_KEYS.every(
    (
      category
    ) =>
      recordMatchesFilter(
        record,
        category,
        normalized[
          category
        ]
      )
  );
}


/**
 * Return the records that fail at least one filter.
 *
 * Primarily useful for diagnostics and testing.
 */
function getFilterFailures(
  record,
  filters = activeFilters
) {
  const normalized =
    normalizeFilters(
      filters
    );

  const failures = [];


  FILTER_KEYS.forEach(
    (
      category
    ) => {
      if (
        !recordMatchesFilter(
          record,
          category,
          normalized[
            category
          ]
        )
      ) {
        if (
          normalized[
            category
          ].length
        ) {
          failures.push({
            category,
            values:
              [
                ...normalized[
                  category
                ]
              ]
          });
        }
      }
    }
  );


  return failures;
}


/* --------------------------------------------------------------------------
 * Filter-state initialization
 * -------------------------------------------------------------------------- */

function initializeFilters() {
  let persisted =
    getItem(
      STORAGE_KEYS.filters,
      DEFAULT_FILTERS
    );


  /*
   * Malformed persisted data must never poison the active filter state.
   */
  if (
    !persisted ||
    typeof persisted !== 'object' ||
    Array.isArray(
      persisted
    )
  ) {
    persisted =
      DEFAULT_FILTERS;
  }


  activeFilters =
    normalizeFilters(
      persisted
    );


  emitFilterChange(
    'govcareer:filtersready',
    activeFilters
  );


  return getFilters();
}


/* --------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
  DEFAULT_FILTERS,

  FILTER_ALIASES,

  FILTER_KEYS,

  canonicalizeFilterCategory,

  normalizeFilterValues,
  normalizeFilters,

  getFilters,
  setFilters,
  resetFilters,

  addFilter,
  removeFilter,
  clearFilter,

  getActiveFilterChips,
  getFilterCount,

  recordMatchesFilter,
  applyFilters,
  matchesFilters,
  getFilterFailures,

  initializeFilters
};


export default {
  getFilters,
  setFilters,
  resetFilters,

  addFilter,
  removeFilter,
  clearFilter,

  applyFilters,
  matchesFilters,

  initializeFilters
};
