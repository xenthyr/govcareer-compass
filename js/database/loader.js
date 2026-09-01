/**
 * GovCareer Compass
 * Database Loader
 *
 * Responsibilities:
 * - load canonical JSON datasets;
 * - resolve government-specific dataset paths;
 * - normalize loaded data;
 * - validate records;
 * - populate the central registry;
 * - expose one unified database snapshot.
 *
 * The loader does NOT:
 * - calculate recommendations;
 * - determine soft preferences;
 * - alter canonical IDs;
 * - fetch research Markdown;
 * - expose secrets.
 */

import config from '../config.js';

import cache from './cache.js';

import registry from './registry.js';

import {
  normalizeByType
} from './normalizer.js';

import {
  validateDatabase
} from './validators.js';

const DATASET_DEFINITIONS = Object.freeze({
  COMMON: Object.freeze({
    qualifications: {
      path:
        config.data.common
          .qualifications,
      type:
        'QUALIFICATION'
    },
    categories: {
      path:
        config.data.common
          .categories,
      type:
        'CATEGORY'
    },
    glossary: {
      path:
        config.data.common
          .glossary,
      type:
        'GLOSSARY'
    },
    scoringRules: {
      path:
        config.data.common
          .scoringRules,
      type:
        'SCORING_RULE'
    },
    governments: {
      path:
        config.data.common
          .governments,
      type:
        'GOVERNMENT'
    },
    states: {
      path:
        config.data.common
          .states,
      type:
        'STATE'
    },
    locations: {
      path:
        config.data.common
          .locations,
      type:
        'LOCATION'
    },
    statuses: {
      path:
        config.data.common
          .statuses,
      type:
        'STATUS'
    },
    confidenceLevels: {
      path:
        config.data.common
          .confidenceLevels,
      type:
        'CONFIDENCE_LEVEL'
    },
    sourceTypes: {
      path:
        config.data.common
          .sourceTypes,
      type:
        'SOURCE_TYPE'
    }
  }),

  ASSESSMENT: Object.freeze({
    questions: {
      path:
        config.data.assessment
          .questions,
      type:
        'ASSESSMENT_QUESTION'
    },
    options: {
      path:
        config.data.assessment
          .options,
      type:
        'ASSESSMENT_OPTION'
    },
    branching: {
      path:
        config.data.assessment
          .branching,
      type:
        'ASSESSMENT_BRANCHING'
    },
    profileFields: {
      path:
        config.data.assessment
          .profileFields,
      type:
        'ASSESSMENT_PROFILE_FIELD'
    },
    responseScoring: {
      path:
        config.data.assessment
          .responseScoring,
      type:
        'ASSESSMENT_RESPONSE_SCORING'
    }
  }),

  CENTRAL: Object.freeze({
    exams: {
      path:
        config.data.central
          .exams,
      type:
        'EXAM'
    },
    jobs: {
      path:
        config.data.central
          .jobs,
      type:
        'JOB'
    },
    departments: {
      path:
        config.data.central
          .departments,
      type:
        'DEPARTMENT'
    },
    organisations: {
      path:
        config.data.central
          .organisations,
      type:
        'ORGANISATION'
    },
    serviceCadres: {
      path:
        config.data.central
          .serviceCadres,
      type:
        'SERVICE_CADRE'
    },
    eligibilityRules: {
      path:
        config.data.central
          .eligibilityRules,
      type:
        'ELIGIBILITY_RULE'
    },
    recruitment: {
      path:
        config.data.central
          .recruitment,
      type:
        'RECRUITMENT'
    },
    pay: {
      path:
        config.data.central
          .pay,
      type:
        'PAY'
    },
    locations: {
      path:
        config.data.central
          .locations,
      type:
        'LOCATION'
    },
    housing: {
      path:
        config.data.central
          .housing,
      type:
        'HOUSING'
    },
    promotion: {
      path:
        config.data.central
          .promotion,
      type:
        'PROMOTION'
    },
    benefits: {
      path:
        config.data.central
          .benefits,
      type:
        'BENEFIT'
    },
    sources: {
      path:
        config.data.central
          .sources,
      type:
        'SOURCE'
    }
  }),

  WEST_BENGAL: Object.freeze({
    exams: {
      path:
        config.data.westBengal
          .exams,
      type:
        'EXAM'
    },
    jobs: {
      path:
        config.data.westBengal
          .jobs,
      type:
        'JOB'
    },
    departments: {
      path:
        config.data.westBengal
          .departments,
      type:
        'DEPARTMENT'
    },
    organisations: {
      path:
        config.data.westBengal
          .organisations,
      type:
        'ORGANISATION'
    },
    serviceCadres: {
      path:
        config.data.westBengal
          .serviceCadres,
      type:
        'SERVICE_CADRE'
    },
    eligibilityRules: {
      path:
        config.data.westBengal
          .eligibilityRules,
      type:
        'ELIGIBILITY_RULE'
    },
    recruitment: {
      path:
        config.data.westBengal
          .recruitment,
      type:
        'RECRUITMENT'
    },
    pay: {
      path:
        config.data.westBengal
          .pay,
      type:
        'PAY'
    },
    locations: {
      path:
        config.data.westBengal
          .locations,
      type:
        'LOCATION'
    },
    housing: {
      path:
        config.data.westBengal
          .housing,
      type:
        'HOUSING'
    },
    promotion: {
      path:
        config.data.westBengal
          .promotion,
      type:
        'PROMOTION'
    },
    benefits: {
      path:
        config.data.westBengal
          .benefits,
      type:
        'BENEFIT'
    },
    sources: {
      path:
        config.data.westBengal
          .sources,
      type:
        'SOURCE'
    }
  })
});

const loadPromises =
  new Map();

function assertJsonResponse(
  response,
  path
) {
  if (
    !response.ok
  ) {
    throw new Error(
      `Failed to load ${path}: HTTP ${response.status}`
    );
  }

  const contentType =
    response.headers.get(
      'content-type'
    ) || '';

  /*
   * Some static servers omit application/json or return generic
   * content types. Do not reject solely on content type.
   */
  return contentType;
}

async function fetchJson(
  path,
  {
    signal = undefined,
    cacheMode = 'no-store'
  } = {}
) {
  const response =
    await fetch(
      path,
      {
        method: 'GET',
        headers: {
          Accept:
            'application/json'
        },
        cache: cacheMode,
        signal
      }
    );

  assertJsonResponse(
    response,
    path
  );

  try {
    return await response.json();
  } catch {
    throw new Error(
      `Invalid JSON returned by ${path}.`
    );
  }
}

function definitionKey(
  scope,
  dataset
) {
  return `${scope}:${dataset}`;
}

async function loadDataset(
  scope,
  dataset,
  {
    forceReload = false,
    signal = undefined,
    persistSession = false
  } = {}
) {
  const definitions =
    DATASET_DEFINITIONS[
      scope
    ];

  if (!definitions) {
    throw new Error(
      `Unknown dataset scope "${scope}".`
    );
  }

  const definition =
    definitions[
      dataset
    ];

  if (!definition) {
    throw new Error(
      `Unknown dataset "${scope}.${dataset}".`
    );
  }

  const key =
    definitionKey(
      scope,
      dataset
    );

  if (
    !forceReload &&
    loadPromises.has(
      key
    )
  ) {
    return loadPromises.get(
      key
    );
  }

  const loader =
    async () => {
      const raw =
        await fetchJson(
          definition.path,
          {
            signal
          }
        );

      return normalizeByType(
        raw,
        definition.type
      );
    };

  const promise =
    (async () => {
      try {
        return await cache.getOrLoad(
          key,
          loader,
          {
            allowSession:
              persistSession,
            persistSession,
            forceReload
          }
        );
      } finally {
        loadPromises.delete(
          key
        );
      }
    })();

  loadPromises.set(
    key,
    promise
  );

  return promise;
}

async function loadScope(
  scope,
  options = {}
) {
  const definitions =
    DATASET_DEFINITIONS[
      scope
    ];

  if (!definitions) {
    throw new Error(
      `Unknown dataset scope "${scope}".`
    );
  }

  const entries =
    Object.entries(
      definitions
    );

  const values =
    await Promise.all(
      entries.map(
        async ([
          dataset
        ]) => [
          dataset,
          await loadDataset(
            scope,
            dataset,
            options
          )
        ]
      )
    );

  return Object.fromEntries(
    values
  );
}

async function loadCoreDatabase(
  {
    includeAssessment = true,
    includeCentral = true,
    includeWestBengal = true,
    forceReload = false,
    persistSession = false,
    signal = undefined
  } = {}
) {
  const scopes = {
    COMMON: true,
    ASSESSMENT:
      includeAssessment,
    CENTRAL:
      includeCentral,
    WEST_BENGAL:
      includeWestBengal
  };

  const scopeEntries =
    Object.entries(
      scopes
    ).filter(
      ([, enabled]) =>
        enabled
    );

  const loaded =
    {};

  const scopeValues =
    await Promise.all(
      scopeEntries.map(
        async ([
          scope
        ]) => [
          scope,
          await loadScope(
            scope,
            {
              forceReload,
              persistSession,
              signal
            }
          )
        ]
      )
    );

  scopeValues.forEach(
    ([
      scope,
      datasets
    ]) => {
      loaded[
        scope
      ] =
        datasets;
    }
  );

  return loaded;
}

function flattenCoreDatabase(
  scopedData
) {
  const database = {
    jobs: [],
    exams: [],
    departments: [],
    organisations: [],
    serviceCadres: [],
    eligibilityRules: [],
    recruitment: [],
    pay: [],
    locations: [],
    housing: [],
    promotion: [],
    benefits: [],
    sources: [],
    governments: [],
    states: [],
    qualifications: [],
    categories: [],
    glossary: [],
    scoringRules: [],
    statuses: [],
    confidenceLevels: [],
    sourceTypes: [],
    assessmentQuestions: [],
    assessmentOptions: [],
    assessmentBranching: [],
    assessmentProfileFields: [],
    assessmentResponseScoring: []
  };

  const append =
    (
      target,
      records
    ) => {
      if (
        Array.isArray(
          records
        )
      ) {
        target.push(
          ...records
        );
      }
    };

  append(
    database.qualifications,
    scopedData
      ?.COMMON
      ?.qualifications
  );

  append(
    database.categories,
    scopedData
      ?.COMMON
      ?.categories
  );

  append(
    database.glossary,
    scopedData
      ?.COMMON
      ?.glossary
  );

  append(
    database.scoringRules,
    scopedData
      ?.COMMON
      ?.scoringRules
  );

  append(
    database.governments,
    scopedData
      ?.COMMON
      ?.governments
  );

  append(
    database.states,
    scopedData
      ?.COMMON
      ?.states
  );

  append(
    database.locations,
    scopedData
      ?.COMMON
      ?.locations
  );

  append(
    database.statuses,
    scopedData
      ?.COMMON
      ?.statuses
  );

  append(
    database.confidenceLevels,
    scopedData
      ?.COMMON
      ?.confidenceLevels
  );

  append(
    database.sourceTypes,
    scopedData
      ?.COMMON
      ?.sourceTypes
  );

  append(
    database.assessmentQuestions,
    scopedData
      ?.ASSESSMENT
      ?.questions
  );

  append(
    database.assessmentOptions,
    scopedData
      ?.ASSESSMENT
      ?.options
  );

  append(
    database.assessmentBranching,
    scopedData
      ?.ASSESSMENT
      ?.branching
  );

  append(
    database.assessmentProfileFields,
    scopedData
      ?.ASSESSMENT
      ?.profileFields
  );

  append(
    database.assessmentResponseScoring,
    scopedData
      ?.ASSESSMENT
      ?.responseScoring
  );

  const governmentScopes = [
    scopedData?.CENTRAL,
    scopedData?.WEST_BENGAL
  ].filter(Boolean);

  governmentScopes.forEach(
    (scope) => {
      append(
        database.jobs,
        scope.jobs
      );

      append(
        database.exams,
        scope.exams
      );

      append(
        database.departments,
        scope.departments
      );

      append(
        database.organisations,
        scope.organisations
      );

      append(
        database.serviceCadres,
        scope.serviceCadres
      );

      append(
        database.eligibilityRules,
        scope.eligibilityRules
      );

      append(
        database.recruitment,
        scope.recruitment
      );

      append(
        database.pay,
        scope.pay
      );

      append(
        database.locations,
        scope.locations
      );

      append(
        database.housing,
        scope.housing
      );

      append(
        database.promotion,
        scope.promotion
      );

      append(
        database.benefits,
        scope.benefits
      );

      append(
        database.sources,
        scope.sources
      );
    }
  );

  return database;
}

function registerDatabase(
  database,
  {
    clearFirst = true
  } = {}
) {
  if (clearFirst) {
    registry.clear();
  }

  const registrationMap = {
    JOB:
      database.jobs,
    EXAM:
      database.exams,
    DEPARTMENT:
      database.departments,
    ORGANISATION:
      database.organisations,
    SERVICE_CADRE:
      database.serviceCadres,
    ELIGIBILITY_RULE:
      database.eligibilityRules,
    RECRUITMENT:
      database.recruitment,
    PAY:
      database.pay,
    LOCATION:
      database.locations,
    HOUSING:
      database.housing,
    PROMOTION:
      database.promotion,
    BENEFIT:
      database.benefits,
    SOURCE:
      database.sources,
    GOVERNMENT:
      database.governments,
    STATE:
      database.states,
    QUALIFICATION:
      database.qualifications,
    CATEGORY:
      database.categories,
    GLOSSARY:
      database.glossary,
    SCORING_RULE:
      database.scoringRules,
    STATUS:
      database.statuses,
    CONFIDENCE_LEVEL:
      database.confidenceLevels,
    SOURCE_TYPE:
      database.sourceTypes,
    ASSESSMENT_QUESTION:
      database.assessmentQuestions,
    ASSESSMENT_OPTION:
      database.assessmentOptions,
    ASSESSMENT_BRANCHING:
      database.assessmentBranching,
    ASSESSMENT_PROFILE_FIELD:
      database.assessmentProfileFields,
    ASSESSMENT_RESPONSE_SCORING:
      database.assessmentResponseScoring
  };

  registry.registerMany(
    registrationMap
  );

  return registry;
}

async function loadDatabase(
  options = {}
) {
  const scoped =
    await loadCoreDatabase(
      options
    );

  const database =
    flattenCoreDatabase(
      scoped
    );

  const validation =
    validateDatabase(
      database
    );

  registry.setMeta({
    loadedAt:
      new Date().toISOString(),
    version:
      config.app.version,
    validated:
      validation.valid,
    warnings:
      validation.warnings,
    errors:
      validation.errors
  });

  if (
    !validation.valid
  ) {
    /*
     * Invalid data must stop the production database
     * from being registered. This protects the UI from
     * operating on broken relationships.
     */
    const error =
      new Error(
        'GovCareer Compass database validation failed.'
      );

    error.details =
      validation;

    throw error;
  }

  registerDatabase(
    database
  );

  return {
    database,
    validation,
    registry
  };
}

function getDatasetDefinitions() {
  return DATASET_DEFINITIONS;
}

function clearLoaderCache() {
  loadPromises.clear();
  cache.clear();
}

export {
  DATASET_DEFINITIONS,
  fetchJson,
  loadDataset,
  loadScope,
  loadCoreDatabase,
  flattenCoreDatabase,
  registerDatabase,
  loadDatabase,
  getDatasetDefinitions,
  clearLoaderCache
};

export default {
  loadDatabase,
  loadDataset,
  loadScope,
  getDatasetDefinitions
};
