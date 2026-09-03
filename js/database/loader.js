/**
 * GovCareer Compass
 * Database Loader
 *
 * Responsibilities:
 * - load canonical JSON datasets;
 * - resolve government/state-specific dataset paths;
 * - load derived indexes when requested;
 * - normalize loaded data;
 * - validate canonical records;
 * - populate the central registry;
 * - expose one unified database snapshot;
 * - support dataset-level caching and in-flight deduplication.
 *
 * The loader does NOT:
 * - calculate recommendations;
 * - determine soft preferences;
 * - make eligibility decisions;
 * - alter canonical IDs;
 * - fabricate missing data;
 * - fetch research Markdown;
 * - expose secrets;
 * - mutate canonical source records.
 *
 * Architectural position:
 *
 *   config
 *      ↓
 *   dataset definitions
 *      ↓
 *   fetch/cache
 *      ↓
 *   normalization
 *      ↓
 *   validation
 *      ↓
 *   registry
 *      ↓
 *   unified database snapshot
 *
 * Canonical data and derived indexes are intentionally kept separate.
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

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SCOPE_NAMES = Object.freeze({
  COMMON: 'COMMON',
  ASSESSMENT: 'ASSESSMENT',
  CENTRAL: 'CENTRAL'
});

const DEFAULT_STATE_ID = 'west-bengal';

const OPTIONAL_DATASET_NAMES = new Set([
  'locations',
  'housing',
  'promotion',
  'benefits',
  'sources',
  'serviceCadres',
  'eligibilityRules',
  'recruitment',
  'departments',
  'organisations'
]);

const INDEX_TYPE = Object.freeze({
  SERVICE_CADRE_INDEX: 'INDEX',
  ELIGIBILITY_RULE_INDEX: 'INDEX',
  QUALIFICATION_INDEX: 'INDEX',
  JOB_INDEX: 'INDEX',
  EXAM_INDEX: 'INDEX',
  DEPARTMENT_INDEX: 'INDEX',
  SOURCE_INDEX: 'INDEX',
  SEARCH_INDEX: 'INDEX'
});

/**
 * Promise map used to deduplicate simultaneous requests for the same dataset.
 *
 * Example:
 *
 *   loadDataset('CENTRAL', 'jobs')
 *   loadDataset('CENTRAL', 'jobs')
 *
 * will share the same in-flight promise rather than issuing two HTTP requests.
 */
const loadPromises = new Map();

/**
 * Dataset definitions are generated once from configuration.
 *
 * Canonical entity datasets live under:
 *
 *   data/common
 *   data/assessment
 *   data/central
 *   data/states/<state-id>
 *
 * Derived indexes live under:
 *
 *   data/indexes
 */
const DATASET_DEFINITIONS = buildDatasetDefinitions();

/* -------------------------------------------------------------------------- */
/* Configuration helpers                                                      */
/* -------------------------------------------------------------------------- */

function getConfigValue(
  ...paths
) {
  for (const path of paths) {
    let current = config;

    for (const segment of path) {
      if (
        current == null ||
        typeof current !== 'object' ||
        !(segment in current)
      ) {
        current = undefined;
        break;
      }

      current = current[segment];
    }

    if (
      typeof current === 'string' &&
      current.trim()
    ) {
      return current;
    }
  }

  return undefined;
}

function getDataRoot() {
  return (
    getConfigValue(
      ['dataRoot'],
      ['data', 'root']
    ) ||
    './data'
  );
}

function joinPath(
  ...parts
) {
  return parts
    .filter(
      part =>
        typeof part === 'string' &&
        part.trim()
    )
    .map(
      (part, index) => {
        const value =
          part.trim();

        if (index === 0) {
          return value.replace(
            /\/+$/,
            ''
          );
        }

        return value
          .replace(/^\/+/, '')
          .replace(/\/+$/, '');
      }
    )
    .join('/');
}

function resolveConfiguredDataPath(
  configuredPath,
  fallbackRelativePath
) {
  if (
    typeof configuredPath === 'string' &&
    configuredPath.trim()
  ) {
    return configuredPath;
  }

  return joinPath(
    getDataRoot(),
    fallbackRelativePath
  );
}

/* -------------------------------------------------------------------------- */
/* Dataset definition construction                                            */
/* -------------------------------------------------------------------------- */

function createDefinition(
  path,
  type,
  {
    optional = false,
    derived = false,
    scope = null,
    entity = null
  } = {}
) {
  return Object.freeze({
    path,
    type,
    optional,
    derived,
    scope,
    entity
  });
}

function createCommonDefinitions() {
  return Object.freeze({
    qualifications:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'common', 'qualifications']
          ),
          'common/qualifications.json'
        ),
        'QUALIFICATION',
        {
          scope: SCOPE_NAMES.COMMON,
          entity: 'qualifications'
        }
      ),

    categories:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'common', 'categories']
          ),
          'common/categories.json'
        ),
        'CATEGORY',
        {
          scope: SCOPE_NAMES.COMMON,
          entity: 'categories'
        }
      ),

    glossary:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'common', 'glossary']
          ),
          'common/glossary.json'
        ),
        'GLOSSARY',
        {
          scope: SCOPE_NAMES.COMMON,
          entity: 'glossary'
        }
      ),

    scoringRules:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'common', 'scoringRules']
          ),
          'common/scoring-rules.json'
        ),
        'SCORING_RULE',
        {
          scope: SCOPE_NAMES.COMMON,
          entity: 'scoringRules'
        }
      ),

    governments:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'common', 'governments']
          ),
          'common/governments.json'
        ),
        'GOVERNMENT',
        {
          scope: SCOPE_NAMES.COMMON,
          entity: 'governments'
        }
      ),

    states:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'common', 'states']
          ),
          'common/states.json'
        ),
        'STATE',
        {
          scope: SCOPE_NAMES.COMMON,
          entity: 'states'
        }
      ),

    locations:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'common', 'locations']
          ),
          'common/locations.json'
        ),
        'LOCATION',
        {
          optional: true,
          scope: SCOPE_NAMES.COMMON,
          entity: 'locations'
        }
      ),

    statuses:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'common', 'statuses']
          ),
          'common/statuses.json'
        ),
        'STATUS',
        {
          scope: SCOPE_NAMES.COMMON,
          entity: 'statuses'
        }
      ),

    confidenceLevels:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'common', 'confidenceLevels']
          ),
          'common/confidence-levels.json'
        ),
        'CONFIDENCE_LEVEL',
        {
          scope: SCOPE_NAMES.COMMON,
          entity: 'confidenceLevels'
        }
      ),

    sourceTypes:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'common', 'sourceTypes']
          ),
          'common/source-types.json'
        ),
        'SOURCE_TYPE',
        {
          scope: SCOPE_NAMES.COMMON,
          entity: 'sourceTypes'
        }
      )
  });
}

function createAssessmentDefinitions() {
  return Object.freeze({
    questions:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'assessment', 'questions']
          ),
          'assessment/questions.json'
        ),
        'ASSESSMENT_QUESTION',
        {
          scope: SCOPE_NAMES.ASSESSMENT,
          entity: 'assessmentQuestions'
        }
      ),

    options:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'assessment', 'options']
          ),
          'assessment/options.json'
        ),
        'ASSESSMENT_OPTION',
        {
          scope: SCOPE_NAMES.ASSESSMENT,
          entity: 'assessmentOptions'
        }
      ),

    branching:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'assessment', 'branching']
          ),
          'assessment/branching.json'
        ),
        'ASSESSMENT_BRANCHING',
        {
          scope: SCOPE_NAMES.ASSESSMENT,
          entity: 'assessmentBranching'
        }
      ),

    profileFields:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'assessment', 'profileFields']
          ),
          'assessment/profile-fields.json'
        ),
        'ASSESSMENT_PROFILE_FIELD',
        {
          optional: true,
          scope: SCOPE_NAMES.ASSESSMENT,
          entity: 'assessmentProfileFields'
        }
      ),

    responseScoring:
      createDefinition(
        resolveConfiguredDataPath(
          getConfigValue(
            ['data', 'assessment', 'responseScoring']
          ),
          'assessment/response-scoring.json'
        ),
        'ASSESSMENT_RESPONSE_SCORING',
        {
          optional: true,
          scope: SCOPE_NAMES.ASSESSMENT,
          entity: 'assessmentResponseScoring'
        }
      )
  });
}

function createGovernmentDefinitions(
  governmentConfig,
  {
    scope,
    fallbackRoot
  }
) {
  const root =
    governmentConfig?.root ||
    fallbackRoot;

  const configured =
    governmentConfig || {};

  return Object.freeze({
    exams:
      createDefinition(
        resolveConfiguredDataPath(
          configured.exams,
          `${root}/exams.json`
        ),
        'EXAM',
        {
          scope,
          entity: 'exams'
        }
      ),

    jobs:
      createDefinition(
        resolveConfiguredDataPath(
          configured.jobs,
          `${root}/jobs.json`
        ),
        'JOB',
        {
          scope,
          entity: 'jobs'
        }
      ),

    departments:
      createDefinition(
        resolveConfiguredDataPath(
          configured.departments,
          `${root}/departments.json`
        ),
        'DEPARTMENT',
        {
          scope,
          entity: 'departments'
        }
      ),

    organisations:
      createDefinition(
        resolveConfiguredDataPath(
          configured.organisations,
          `${root}/organisations.json`
        ),
        'ORGANISATION',
        {
          scope,
          entity: 'organisations'
        }
      ),

    serviceCadres:
      createDefinition(
        resolveConfiguredDataPath(
          configured.serviceCadres,
          `${root}/service-cadres.json`
        ),
        'SERVICE_CADRE',
        {
          optional: true,
          scope,
          entity: 'serviceCadres'
        }
      ),

    eligibilityRules:
      createDefinition(
        resolveConfiguredDataPath(
          configured.eligibilityRules,
          `${root}/eligibility-rules.json`
        ),
        'ELIGIBILITY_RULE',
        {
          optional: true,
          scope,
          entity: 'eligibilityRules'
        }
      ),

    recruitment:
      createDefinition(
        resolveConfiguredDataPath(
          configured.recruitment,
          `${root}/recruitment.json`
        ),
        'RECRUITMENT',
        {
          optional: true,
          scope,
          entity: 'recruitment'
        }
      ),

    pay:
      createDefinition(
        resolveConfiguredDataPath(
          configured.pay,
          `${root}/pay.json`
        ),
        'PAY',
        {
          optional: true,
          scope,
          entity: 'pay'
        }
      ),

    locations:
      createDefinition(
        resolveConfiguredDataPath(
          configured.locations,
          `${root}/locations.json`
        ),
        'LOCATION',
        {
          optional: true,
          scope,
          entity: 'locations'
        }
      ),

    housing:
      createDefinition(
        resolveConfiguredDataPath(
          configured.housing,
          `${root}/housing.json`
        ),
        'HOUSING',
        {
          optional: true,
          scope,
          entity: 'housing'
        }
      ),

    promotion:
      createDefinition(
        resolveConfiguredDataPath(
          configured.promotion,
          `${root}/promotion.json`
        ),
        'PROMOTION',
        {
          optional: true,
          scope,
          entity: 'promotion'
        }
      ),

    benefits:
      createDefinition(
        resolveConfiguredDataPath(
          configured.benefits,
          `${root}/benefits.json`
        ),
        'BENEFIT',
        {
          optional: true,
          scope,
          entity: 'benefits'
        }
      ),

    sources:
      createDefinition(
        resolveConfiguredDataPath(
          configured.sources,
          `${root}/sources.json`
        ),
        'SOURCE',
        {
          optional: true,
          scope,
          entity: 'sources'
        }
      )
  });
}

function createIndexDefinitions() {
  const indexConfig =
    config?.data?.indexes ||
    {};

  return Object.freeze({
    serviceCadre:
      createDefinition(
        resolveConfiguredDataPath(
          indexConfig.serviceCadre ||
          indexConfig.serviceCadres,
          'indexes/service-cadre-index.json'
        ),
        INDEX_TYPE.SERVICE_CADRE_INDEX,
        {
          optional: true,
          derived: true,
          scope: 'INDEXES',
          entity: 'serviceCadreIndex'
        }
      ),

    eligibilityRule:
      createDefinition(
        resolveConfiguredDataPath(
          indexConfig.eligibilityRule ||
          indexConfig.eligibilityRules,
          'indexes/eligibility-rule-index.json'
        ),
        INDEX_TYPE.ELIGIBILITY_RULE_INDEX,
        {
          optional: true,
          derived: true,
          scope: 'INDEXES',
          entity: 'eligibilityRuleIndex'
        }
      ),

    qualification:
      createDefinition(
        resolveConfiguredDataPath(
          indexConfig.qualification,
          'indexes/qualification-index.json'
        ),
        INDEX_TYPE.QUALIFICATION_INDEX,
        {
          optional: true,
          derived: true,
          scope: 'INDEXES',
          entity: 'qualificationIndex'
        }
      ),

    job:
      createDefinition(
        resolveConfiguredDataPath(
          indexConfig.job ||
          indexConfig.jobs,
          'indexes/job-index.json'
        ),
        INDEX_TYPE.JOB_INDEX,
        {
          optional: true,
          derived: true,
          scope: 'INDEXES',
          entity: 'jobIndex'
        }
      ),

    exam:
      createDefinition(
        resolveConfiguredDataPath(
          indexConfig.exam ||
          indexConfig.exams,
          'indexes/exam-index.json'
        ),
        INDEX_TYPE.EXAM_INDEX,
        {
          optional: true,
          derived: true,
          scope: 'INDEXES',
          entity: 'examIndex'
        }
      ),

    department:
      createDefinition(
        resolveConfiguredDataPath(
          indexConfig.department ||
          indexConfig.departments,
          'indexes/department-index.json'
        ),
        INDEX_TYPE.DEPARTMENT_INDEX,
        {
          optional: true,
          derived: true,
          scope: 'INDEXES',
          entity: 'departmentIndex'
        }
      ),

    source:
      createDefinition(
        resolveConfiguredDataPath(
          indexConfig.source ||
          indexConfig.sources,
          'indexes/source-index.json'
        ),
        INDEX_TYPE.SOURCE_INDEX,
        {
          optional: true,
          derived: true,
          scope: 'INDEXES',
          entity: 'sourceIndex'
        }
      ),

    search:
      createDefinition(
        resolveConfiguredDataPath(
          indexConfig.search,
          'indexes/search-index.json'
        ),
        INDEX_TYPE.SEARCH_INDEX,
        {
          optional: true,
          derived: true,
          scope: 'INDEXES',
          entity: 'searchIndex'
        }
      )
  });
}

function createI18nDefinitions() {
  const i18n =
    config?.data?.i18n ||
    {};

  return Object.freeze({
    en:
      createDefinition(
        resolveConfiguredDataPath(
          i18n.en,
          'i18n/en.json'
        ),
        'I18N',
        {
          optional: true,
          derived: false,
          scope: 'I18N',
          entity: 'en'
        }
      ),

    bn:
      createDefinition(
        resolveConfiguredDataPath(
          i18n.bn,
          'i18n/bn.json'
        ),
        'I18N',
        {
          optional: true,
          derived: false,
          scope: 'I18N',
          entity: 'bn'
        }
      )
  });
}

function createStateDefinitions() {
  const stateConfig =
    config?.data?.states ||
    {};

  const stateIds =
    Array.isArray(
      config?.activeStateIds
    ) &&
    config.activeStateIds.length
      ? config.activeStateIds
      : Object.keys(
          stateConfig
        );

  const definitions = {};

  for (const stateId of stateIds) {
    const configured =
      stateConfig[
        stateId
      ] ||
      (
        stateId ===
        DEFAULT_STATE_ID
          ? config?.data?.westBengal
          : undefined
      ) ||
      {};

    const root =
      configured.root ||
      `states/${stateId}`;

    definitions[
      stateId
    ] =
      createGovernmentDefinitions(
        configured,
        {
          scope:
            `STATE_${normalizeScopeToken(
              stateId
            )}`,
          fallbackRoot:
            root
        }
      );
  }

  /*
   * Backward-compatible fallback when config does not yet expose
   * a state map but does expose data.westBengal.
   */
  if (
    !Object.keys(
      definitions
    ).length &&
    config?.data?.westBengal
  ) {
    definitions[
      DEFAULT_STATE_ID
    ] =
      createGovernmentDefinitions(
        config.data.westBengal,
        {
          scope:
            `STATE_${normalizeScopeToken(
              DEFAULT_STATE_ID
            )}`,
          fallbackRoot:
            `states/${DEFAULT_STATE_ID}`
        }
      );
  }

  return Object.freeze(
    definitions
  );
}

function buildDatasetDefinitions() {
  const definitions = {
    COMMON:
      createCommonDefinitions(),

    ASSESSMENT:
      createAssessmentDefinitions(),

    CENTRAL:
      createGovernmentDefinitions(
        config?.data?.central ||
        {},
        {
          scope:
            SCOPE_NAMES.CENTRAL,
          fallbackRoot:
            'central'
        }
      )
  };

  const stateDefinitions =
    createStateDefinitions();

  Object.entries(
    stateDefinitions
  ).forEach(
    ([
      stateId,
      datasets
    ]) => {
      definitions[
        `STATE:${stateId}`
      ] =
        datasets;
    }
  );

  definitions.INDEXES =
    createIndexDefinitions();

  definitions.I18N =
    createI18nDefinitions();

  return deepFreeze(
    definitions
  );
}

function normalizeScopeToken(
  value
) {
  return String(
    value || ''
  )
    .trim()
    .replace(
      /[^a-zA-Z0-9]+/g,
      '_'
    )
    .replace(
      /^_+|_+$/g,
      ''
    )
    .toUpperCase();
}

function deepFreeze(
  value
) {
  if (
    value === null ||
    typeof value !== 'object'
  ) {
    return value;
  }

  Object.freeze(
    value
  );

  Object.values(
    value
  ).forEach(
    deepFreeze
  );

  return value;
}

/* -------------------------------------------------------------------------- */
/* HTTP / fetch helpers                                                       */
/* -------------------------------------------------------------------------- */

function assertJsonResponse(
  response,
  path
) {
  if (
    !response ||
    !response.ok
  ) {
    const status =
      response?.status ??
      'unknown';

    const statusText =
      response?.statusText
        ? ` ${response.statusText}`
        : '';

    throw new Error(
      `Failed to load ${path}: HTTP ${status}${statusText}`
    );
  }

  return (
    response.headers.get(
      'content-type'
    ) || ''
  );
}

async function fetchJson(
  path,
  {
    signal = undefined,
    cacheMode = 'no-store'
  } = {}
) {
  if (
    typeof path !== 'string' ||
    !path.trim()
  ) {
    throw new TypeError(
      'A non-empty dataset path is required.'
    );
  }

  let response;

  try {
    response =
      await fetch(
        path,
        {
          method: 'GET',
          headers: {
            Accept:
              'application/json'
          },
          cache:
            cacheMode,
          signal
        }
      );
  } catch (error) {
    if (
      error?.name ===
      'AbortError'
    ) {
      throw error;
    }

    throw new Error(
      `Network error while loading ${path}: ${
        error?.message ||
        'Unknown network error'
      }`
    );
  }

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

/* -------------------------------------------------------------------------- */
/* Dataset utilities                                                          */
/* -------------------------------------------------------------------------- */

function definitionKey(
  scope,
  dataset
) {
  return `${scope}:${dataset}`;
}

function isIndexScope(
  scope
) {
  return scope === 'INDEXES';
}

function isI18nScope(
  scope
) {
  return scope === 'I18N';
}

function isStateScope(
  scope
) {
  return String(
    scope
  ).startsWith(
    'STATE:'
  );
}

function stateIdFromScope(
  scope
) {
  return isStateScope(scope)
    ? String(
        scope
      ).slice(
        'STATE:'.length
      )
    : null;
}

function getScopeDefinitions(
  scope
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

  return definitions;
}

function getDatasetDefinition(
  scope,
  dataset
) {
  const definitions =
    getScopeDefinitions(
      scope
    );

  const definition =
    definitions[
      dataset
    ];

  if (!definition) {
    throw new Error(
      `Unknown dataset "${scope}.${dataset}".`
    );
  }

  return definition;
}

function shouldIgnoreMissingError(
  definition,
  {
    allowOptional = true
  } = {}
) {
  return (
    Boolean(
      allowOptional
    ) &&
    Boolean(
      definition?.optional
    )
  );
}

function extractRecords(
  value
) {
  if (
    Array.isArray(
      value
    )
  ) {
    return value;
  }

  if (
    value &&
    typeof value === 'object'
  ) {
    /*
     * Batch-0 files may use either:
     *
     *   [...]
     *
     * or:
     *
     *   { records: [...] }
     *
     * or another single top-level collection property.
     *
     * Do not mutate the source object; only select the collection.
     */
    if (
      Array.isArray(
        value.records
      )
    ) {
      return value.records;
    }

    if (
      Array.isArray(
        value.items
      )
    ) {
      return value.items;
    }

    if (
      Array.isArray(
        value.data
      )
    ) {
      return value.data;
    }
  }

  return value;
}

function normalizeDataset(
  raw,
  definition
) {
  /*
   * Indexes and i18n catalogs are not canonical domain records.
   * They still pass through normalizeByType when the normalizer supports
   * the corresponding type, but the loader does not flatten them into
   * domain entity arrays.
   */
  return normalizeByType(
    raw,
    definition.type
  );
}

/* -------------------------------------------------------------------------- */
/* Dataset loading                                                            */
/* -------------------------------------------------------------------------- */

async function loadDataset(
  scope,
  dataset,
  {
    forceReload = false,
    signal = undefined,
    persistSession = false,
    allowOptional = true,
    cacheMode = 'no-store'
  } = {}
) {
  const definition =
    getDatasetDefinition(
      scope,
      dataset
    );

  const key =
    definitionKey(
      scope,
      dataset
    );

  /*
   * In-flight deduplication.
   *
   * forceReload deliberately bypasses a previous in-flight promise so an
   * explicit reload request cannot accidentally consume the older request.
   */
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
      try {
        const raw =
          await fetchJson(
            definition.path,
            {
              signal,
              cacheMode
            }
          );

        return normalizeDataset(
          raw,
          definition
        );
      } catch (error) {
        if (
          shouldIgnoreMissingError(
            definition,
            {
              allowOptional
            }
          ) &&
          error?.message &&
          /HTTP 404\b/i.test(
            error.message
          )
        ) {
          return null;
        }

        throw error;
      }
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

/* -------------------------------------------------------------------------- */
/* Scope loading                                                              */
/* -------------------------------------------------------------------------- */

async function loadScope(
  scope,
  {
    datasets = undefined,
    ...options
  } = {}
) {
  const definitions =
    getScopeDefinitions(
      scope
    );

  const datasetNames =
    Array.isArray(
      datasets
    )
      ? datasets
      : Object.keys(
          definitions
        );

  const selectedNames =
    datasetNames.filter(
      dataset =>
        Object.prototype.hasOwnProperty.call(
          definitions,
          dataset
        )
    );

  const unknownNames =
    datasetNames.filter(
      dataset =>
        !Object.prototype.hasOwnProperty.call(
          definitions,
          dataset
        )
    );

  if (
    unknownNames.length
  ) {
    throw new Error(
      `Unknown dataset(s) "${unknownNames.join(
        ', '
      )}" in scope "${scope}".`
    );
  }

  const values =
    await Promise.all(
      selectedNames.map(
        async dataset => {
          const value =
            await loadDataset(
              scope,
              dataset,
              options
            );

          return [
            dataset,
            value
          ];
        }
      )
    );

  return Object.fromEntries(
    values
  );
}

async function loadState(
  stateId,
  options = {}
) {
  const normalizedId =
    String(
      stateId || ''
    ).trim();

  if (!normalizedId) {
    throw new Error(
      'A state ID is required.'
    );
  }

  const scope =
    `STATE:${normalizedId}`;

  return loadScope(
    scope,
    options
  );
}

/* -------------------------------------------------------------------------- */
/* Core database                                                              */
/* -------------------------------------------------------------------------- */

async function loadCoreDatabase(
  {
    includeAssessment = true,
    includeCentral = true,
    includeWestBengal = true,
    includeStates = undefined,
    includeIndexes = true,
    includeI18n = false,
    datasets = undefined,
    forceReload = false,
    persistSession = false,
    allowOptional = true,
    cacheMode = 'no-store',
    signal = undefined
  } = {}
) {
  const loaded = {};

  const scopeRequests = [];

  /*
   * Common data is always required for a canonical database snapshot.
   */
  scopeRequests.push([
    'COMMON',
    {
      datasets:
        datasets?.COMMON
    }
  ]);

  if (
    includeAssessment
  ) {
    scopeRequests.push([
      'ASSESSMENT',
      {
        datasets:
          datasets?.ASSESSMENT
      }
    ]);
  }

  if (
    includeCentral
  ) {
    scopeRequests.push([
      'CENTRAL',
      {
        datasets:
          datasets?.CENTRAL
      }
    ]);
  }

  /*
   * Backward-compatible convenience option for the currently active
   * West Bengal state.
   */
  if (
    includeWestBengal
  ) {
    const stateScope =
      `STATE:${DEFAULT_STATE_ID}`;

    if (
      DATASET_DEFINITIONS[
        stateScope
      ]
    ) {
      scopeRequests.push([
        stateScope,
        {
          datasets:
            datasets?.[
              stateScope
            ]
        }
      ]);
    }
  }

  /*
   * Future-proof multi-state option.
   *
   * If includeStates is provided, it wins over includeWestBengal.
   *
   * Examples:
   *
   *   includeStates: ['west-bengal', 'bihar']
   *
   *   includeStates: ['all']
   */
  if (
    Array.isArray(
      includeStates
    )
  ) {
    const requestedStateIds =
      includeStates.includes(
        'all'
      )
        ? Object.keys(
            DATASET_DEFINITIONS
          )
            .filter(
              key =>
                key.startsWith(
                  'STATE:'
                )
            )
            .map(
              stateIdFromScope
            )
        : includeStates;

    requestedStateIds.forEach(
      stateId => {
        const scope =
          `STATE:${stateId}`;

        if (
          !scopeRequests.some(
            ([requestedScope]) =>
              requestedScope ===
              scope
          ) &&
          DATASET_DEFINITIONS[
            scope
          ]
        ) {
          scopeRequests.push([
            scope,
            {
              datasets:
                datasets?.[
                  scope
                ]
            }
          ]);
        }
      }
    );
  }

  if (
    includeIndexes
  ) {
    scopeRequests.push([
      'INDEXES',
      {
        datasets:
          datasets?.INDEXES
      }
    ]);
  }

  if (
    includeI18n
  ) {
    scopeRequests.push([
      'I18N',
      {
        datasets:
          datasets?.I18N
      }
    ]);
  }

  const scopeValues =
    await Promise.all(
      scopeRequests.map(
        async ([
          scope,
          scopeOptions
        ]) => {
          const scopeData =
            await loadScope(
              scope,
              {
                ...scopeOptions,
                forceReload,
                persistSession,
                allowOptional,
                cacheMode,
                signal
              }
            );

          return [
            scope,
            scopeData
          ];
        }
      )
    );

  scopeValues.forEach(
    ([
      scope,
      scopeData
    ]) => {
      loaded[
        scope
      ] =
        scopeData;
    }
  );

  return loaded;
}

/* -------------------------------------------------------------------------- */
/* Flattening                                                                 */
/* -------------------------------------------------------------------------- */

function appendRecords(
  target,
  records
) {
  const extracted =
    extractRecords(
      records
    );

  if (
    Array.isArray(
      extracted
    )
  ) {
    target.push(
      ...extracted
    );
  }
}

function appendIfPresent(
  database,
  target,
  value
) {
  appendRecords(
    database[
      target
    ],
    value
  );
}

/**
 * Convert scoped canonical data into a unified application database.
 *
 * Important:
 * - canonical entities are flattened;
 * - derived indexes are kept under `indexes`;
 * - i18n remains under `i18n`;
 * - state identity is preserved in each record by normalizer/schema rather
 *   than being inferred from array position.
 */
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
    assessmentResponseScoring: [],

    indexes: {},
    i18n: {}
  };

  /*
   * Common entities.
   */
  const common =
    scopedData?.COMMON ||
    {};

  appendIfPresent(
    database,
    'qualifications',
    common.qualifications
  );

  appendIfPresent(
    database,
    'categories',
    common.categories
  );

  appendIfPresent(
    database,
    'glossary',
    common.glossary
  );

  appendIfPresent(
    database,
    'scoringRules',
    common.scoringRules
  );

  appendIfPresent(
    database,
    'governments',
    common.governments
  );

  appendIfPresent(
    database,
    'states',
    common.states
  );

  appendIfPresent(
    database,
    'locations',
    common.locations
  );

  appendIfPresent(
    database,
    'statuses',
    common.statuses
  );

  appendIfPresent(
    database,
    'confidenceLevels',
    common.confidenceLevels
  );

  appendIfPresent(
    database,
    'sourceTypes',
    common.sourceTypes
  );

  /*
   * Assessment entities.
   */
  const assessment =
    scopedData?.ASSESSMENT ||
    {};

  appendIfPresent(
    database,
    'assessmentQuestions',
    assessment.questions
  );

  appendIfPresent(
    database,
    'assessmentOptions',
    assessment.options
  );

  appendIfPresent(
    database,
    'assessmentBranching',
    assessment.branching
  );

  appendIfPresent(
    database,
    'assessmentProfileFields',
    assessment.profileFields
  );

  appendIfPresent(
    database,
    'assessmentResponseScoring',
    assessment.responseScoring
  );

  /*
   * Government/state entity flattening.
   *
   * CENTRAL is one government scope.
   *
   * Every STATE:<id> scope is flattened into the same entity arrays so
   * consumers can query globally without knowing which scope supplied a
   * record.
   */
  const entityScopes =
    Object.entries(
      scopedData
    ).filter(
      ([
        scope,
        value
      ]) => {
        if (
          scope ===
          'CENTRAL'
        ) {
          return true;
        }

        if (
          scope.startsWith(
            'STATE:'
          )
        ) {
          return true;
        }

        return false;
      }
    );

  entityScopes.forEach(
    ([
      scope,
      scopeData
    ]) => {
      if (!scopeData) {
        return;
      }

      appendIfPresent(
        database,
        'jobs',
        scopeData.jobs
      );

      appendIfPresent(
        database,
        'exams',
        scopeData.exams
      );

      appendIfPresent(
        database,
        'departments',
        scopeData.departments
      );

      appendIfPresent(
        database,
        'organisations',
        scopeData.organisations
      );

      appendIfPresent(
        database,
        'serviceCadres',
        scopeData.serviceCadres
      );

      appendIfPresent(
        database,
        'eligibilityRules',
        scopeData.eligibilityRules
      );

      appendIfPresent(
        database,
        'recruitment',
        scopeData.recruitment
      );

      appendIfPresent(
        database,
        'pay',
        scopeData.pay
      );

      appendIfPresent(
        database,
        'locations',
        scopeData.locations
      );

      appendIfPresent(
        database,
        'housing',
        scopeData.housing
      );

      appendIfPresent(
        database,
        'promotion',
        scopeData.promotion
      );

      appendIfPresent(
        database,
        'benefits',
        scopeData.benefits
      );

      appendIfPresent(
        database,
        'sources',
        scopeData.sources
      );
    }
  );

  /*
   * Derived indexes are not flattened into canonical entity arrays.
   */
  const indexData =
    scopedData?.INDEXES ||
    {};

  Object.entries(
    indexData
  ).forEach(
    ([
      name,
      value
    ]) => {
      if (
        value !== null &&
        value !== undefined
      ) {
        database.indexes[
          name
        ] =
          value;
      }
    }
  );

  /*
   * i18n catalogs remain isolated from domain records.
   */
  const i18nData =
    scopedData?.I18N ||
    {};

  Object.entries(
    i18nData
  ).forEach(
    ([
      locale,
      value
    ]) => {
      if (
        value !== null &&
        value !== undefined
      ) {
        database.i18n[
          locale
        ] =
          value;
      }
    }
  );

  return database;
}

/* -------------------------------------------------------------------------- */
/* Registry registration                                                      */
/* -------------------------------------------------------------------------- */

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

  /*
   * Only register entity collections.
   *
   * Derived indexes and i18n catalogs are intentionally not inserted as
   * ordinary registry entities because they have different semantics.
   */
  registry.registerMany(
    registrationMap
  );

  return registry;
}

/* -------------------------------------------------------------------------- */
/* Unified database loading                                                   */
/* -------------------------------------------------------------------------- */

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

  /*
   * Registry metadata is updated before the fatal-error check so debugging
   * information remains available to consumers that inspect the registry
   * after a failed load.
   */
  registry.setMeta({
    loadedAt:
      new Date().toISOString(),

    version:
      config?.app?.version ||
      config?.appVersion ||
      'unknown',

    dataVersion:
      config?.data?.version ||
      config?.dataVersion ||
      'unknown',

    schemaVersion:
      config?.schemaVersion ||
      'unknown',

    validated:
      validation.valid,

    warnings:
      validation.warnings,

    errors:
      validation.errors,

    loadedScopes:
      Object.keys(
        scoped
      ),

    loadedDatasets:
      getLoadedDatasetSummary(
        scoped
      )
  });

  /*
   * Never register an invalid canonical database.
   */
  if (
    !validation.valid
  ) {
    const error =
      new Error(
        'GovCareer Compass database validation failed.'
      );

    error.code =
      'DATABASE_VALIDATION_FAILED';

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
    registry,
    scoped
  };
}

/* -------------------------------------------------------------------------- */
/* Snapshot helpers                                                           */
/* -------------------------------------------------------------------------- */

function getLoadedDatasetSummary(
  scopedData
) {
  const summary = {};

  Object.entries(
    scopedData || {}
  ).forEach(
    ([
      scope,
      datasets
    ]) => {
      summary[
        scope
      ] = Object.keys(
        datasets || {}
      );
    }
  );

  return summary;
}

function getDatasetDefinitions() {
  return DATASET_DEFINITIONS;
}

function getScopeNames() {
  return Object.keys(
    DATASET_DEFINITIONS
  );
}

function getStateIds() {
  return getScopeNames()
    .filter(
      isStateScope
    )
    .map(
      stateIdFromScope
    );
}

function isDatasetDefined(
  scope,
  dataset
) {
  return Boolean(
    DATASET_DEFINITIONS[
      scope
    ]?.[
      dataset
    ]
  );
}

function getDatasetPath(
  scope,
  dataset
) {
  return getDatasetDefinition(
    scope,
    dataset
  ).path;
}

/* -------------------------------------------------------------------------- */
/* Cache / lifecycle                                                          */
/* -------------------------------------------------------------------------- */

function clearLoaderCache() {
  loadPromises.clear();

  if (
    typeof cache.clear ===
    'function'
  ) {
    cache.clear();
  }
}

/**
 * Clear only in-flight loader promises.
 *
 * Useful when the application wants to preserve persistent/cache-layer data
 * but discard stale requests.
 */
function clearInFlightLoads() {
  loadPromises.clear();
}

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export {
  DATASET_DEFINITIONS,

  fetchJson,

  loadDataset,
  loadScope,
  loadState,
  loadCoreDatabase,
  flattenCoreDatabase,
  registerDatabase,
  loadDatabase,

  getDatasetDefinitions,
  getScopeNames,
  getStateIds,
  isDatasetDefined,
  getDatasetPath,

  clearLoaderCache,
  clearInFlightLoads
};

export default {
  loadDatabase,
  loadDataset,
  loadScope,
  loadState,
  loadCoreDatabase,

  getDatasetDefinitions,
  getScopeNames,
  getStateIds,

  clearLoaderCache
};
