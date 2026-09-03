/**
 * GovCareer Compass
 * ============================================================
 * Canonical Data Registry
 * ============================================================
 *
 * The registry has two deliberately separate responsibilities:
 *
 * 1. Dataset definitions
 *    - describes where canonical datasets live;
 *    - remains compatible with the loader's dataset-definition layer.
 *
 * 2. Runtime canonical-record storage
 *    - stores normalized, validated application records by canonical ID;
 *    - provides deterministic collection and ID lookup for consumers.
 *
 * The registry does NOT:
 * - normalize records;
 * - validate business rules;
 * - build derived indexes;
 * - determine eligibility;
 * - calculate preferences, scores, rankings, or recommendations;
 * - perform AI work;
 * - infer or fabricate missing records.
 *
 * Architectural position:
 *
 *   config
 *      -> dataset definitions
 *      -> loader
 *      -> normalization
 *      -> validation
 *      -> runtime registry
 *      -> derived indexes / search
 *      -> recommendation / AI consumers
 *
 * Canonical records are copied into immutable internal storage. Consumers
 * receive fresh copies so neither the original loader object nor a value
 * returned by the registry can mutate registry state accidentally.
 */

import config from '../config.js';

/* -------------------------------------------------------------------------- */
/* Entity universe                                                            */
/* -------------------------------------------------------------------------- */

const ENTITY_TYPES =
  Object.freeze([
    'governments',
    'states',
    'qualifications',
    'categories',
    'locations',
    'statuses',
    'confidenceLevels',
    'sourceTypes',
    'glossary',
    'scoringRules',

    'exams',
    'jobs',
    'departments',
    'organisations',
    'recruitment',
    'pay',
    'housing',
    'promotion',
    'benefits',
    'sources',
    'serviceCadres',
    'eligibilityRules',

    'assessmentQuestions',
    'assessmentOptions',
    'assessmentBranching',
    'assessmentProfileFields',
    'assessmentResponseScoring'
  ]);

/*
 * Runtime entity-type names are the canonical type names emitted by the
 * loader/normalizer contract and consumed by search/index/recommendation
 * modules. Collection names remain pluralized in the public entity universe.
 */
const RUNTIME_ENTITY_TYPES =
  Object.freeze([
    'GOVERNMENT',
    'STATE',
    'QUALIFICATION',
    'CATEGORY',
    'LOCATION',
    'STATUS',
    'CONFIDENCE_LEVEL',
    'SOURCE_TYPE',
    'GLOSSARY',
    'SCORING_RULE',

    'EXAM',
    'JOB',
    'DEPARTMENT',
    'ORGANISATION',
    'RECRUITMENT',
    'PAY',
    'HOUSING',
    'PROMOTION',
    'BENEFIT',
    'SOURCE',
    'SERVICE_CADRE',
    'ELIGIBILITY_RULE',

    'ASSESSMENT_QUESTION',
    'ASSESSMENT_OPTION',
    'ASSESSMENT_BRANCHING',
    'ASSESSMENT_PROFILE_FIELD',
    'ASSESSMENT_RESPONSE_SCORING'
  ]);

const RUNTIME_TYPE_ALIASES =
  Object.freeze({
    GOVERNMENTS: 'GOVERNMENT',
    GOVERNMENT: 'GOVERNMENT',

    STATES: 'STATE',
    STATE: 'STATE',

    QUALIFICATIONS: 'QUALIFICATION',
    QUALIFICATION: 'QUALIFICATION',

    CATEGORIES: 'CATEGORY',
    CATEGORY: 'CATEGORY',

    LOCATIONS: 'LOCATION',
    LOCATION: 'LOCATION',

    STATUSES: 'STATUS',
    STATUS: 'STATUS',

    CONFIDENCELEVELS: 'CONFIDENCE_LEVEL',
    CONFIDENCE_LEVELS: 'CONFIDENCE_LEVEL',
    CONFIDENCE_LEVEL: 'CONFIDENCE_LEVEL',

    SOURCETYPES: 'SOURCE_TYPE',
    SOURCE_TYPES: 'SOURCE_TYPE',
    SOURCE_TYPE: 'SOURCE_TYPE',

    GLOSSARY: 'GLOSSARY',

    SCORINGRULES: 'SCORING_RULE',
    SCORING_RULES: 'SCORING_RULE',
    SCORING_RULE: 'SCORING_RULE',

    EXAMS: 'EXAM',
    EXAM: 'EXAM',

    JOBS: 'JOB',
    JOB: 'JOB',

    DEPARTMENTS: 'DEPARTMENT',
    DEPARTMENT: 'DEPARTMENT',

    ORGANISATIONS: 'ORGANISATION',
    ORGANISATION: 'ORGANISATION',
    ORGANIZATIONS: 'ORGANISATION',
    ORGANIZATION: 'ORGANISATION',

    RECRUITMENT: 'RECRUITMENT',
    RECRUITMENTS: 'RECRUITMENT',

    PAY: 'PAY',
    PAYS: 'PAY',

    HOUSING: 'HOUSING',
    HOUSINGS: 'HOUSING',

    PROMOTION: 'PROMOTION',
    PROMOTIONS: 'PROMOTION',

    BENEFITS: 'BENEFIT',
    BENEFIT: 'BENEFIT',

    SOURCES: 'SOURCE',
    SOURCE: 'SOURCE',

    SERVICECADRES: 'SERVICE_CADRE',
    SERVICE_CADRES: 'SERVICE_CADRE',
    SERVICE_CADRE: 'SERVICE_CADRE',
    CADRE: 'SERVICE_CADRE',

    ELIGIBILITYRULES: 'ELIGIBILITY_RULE',
    ELIGIBILITY_RULES: 'ELIGIBILITY_RULE',
    ELIGIBILITY_RULE: 'ELIGIBILITY_RULE',

    ASSESSMENTQUESTIONS: 'ASSESSMENT_QUESTION',
    ASSESSMENT_QUESTION: 'ASSESSMENT_QUESTION',

    ASSESSMENTOPTIONS: 'ASSESSMENT_OPTION',
    ASSESSMENT_OPTION: 'ASSESSMENT_OPTION',

    ASSESSMENTBRANCHING: 'ASSESSMENT_BRANCHING',
    ASSESSMENT_BRANCHING: 'ASSESSMENT_BRANCHING',

    ASSESSMENTPROFILEFIELDS: 'ASSESSMENT_PROFILE_FIELD',
    ASSESSMENT_PROFILE_FIELDS: 'ASSESSMENT_PROFILE_FIELD',
    ASSESSMENT_PROFILE_FIELD: 'ASSESSMENT_PROFILE_FIELD',

    ASSESSMENTRESPONSECORING: 'ASSESSMENT_RESPONSE_SCORING',
    ASSESSMENT_RESPONSE_SCORING:
      'ASSESSMENT_RESPONSE_SCORING'
  });

const COLLECTION_BY_RUNTIME_TYPE =
  Object.freeze({
    GOVERNMENT: 'governments',
    STATE: 'states',
    QUALIFICATION: 'qualifications',
    CATEGORY: 'categories',
    LOCATION: 'locations',
    STATUS: 'statuses',
    CONFIDENCE_LEVEL: 'confidenceLevels',
    SOURCE_TYPE: 'sourceTypes',
    GLOSSARY: 'glossary',
    SCORING_RULE: 'scoringRules',

    EXAM: 'exams',
    JOB: 'jobs',
    DEPARTMENT: 'departments',
    ORGANISATION: 'organisations',
    RECRUITMENT: 'recruitment',
    PAY: 'pay',
    HOUSING: 'housing',
    PROMOTION: 'promotion',
    BENEFIT: 'benefits',
    SOURCE: 'sources',
    SERVICE_CADRE: 'serviceCadres',
    ELIGIBILITY_RULE: 'eligibilityRules',

    ASSESSMENT_QUESTION:
      'assessmentQuestions',

    ASSESSMENT_OPTION:
      'assessmentOptions',

    ASSESSMENT_BRANCHING:
      'assessmentBranching',

    ASSESSMENT_PROFILE_FIELD:
      'assessmentProfileFields',

    ASSESSMENT_RESPONSE_SCORING:
      'assessmentResponseScoring'
  });

/* -------------------------------------------------------------------------- */
/* Dataset definitions                                                        */
/* -------------------------------------------------------------------------- */

function deepFreeze(
  value,
  seen = new WeakSet()
) {
  if (
    value === null ||
    typeof value !== 'object' ||
    seen.has(value)
  ) {
    return value;
  }

  seen.add(
    value
  );

  Object.values(
    value
  ).forEach(
    (child) =>
      deepFreeze(
        child,
        seen
      )
  );

  return Object.freeze(
    value
  );
}

function freezeShallowDataset(
  scope,
  paths,
  extra = {}
) {
  return Object.freeze({
    scope,
    ...extra,

    paths:
      Object.freeze({
        ...(
          paths &&
          typeof paths === 'object'
            ? paths
            : {}
        )
      })
  });
}

function getGovernmentConfig(
  id
) {
  const governments =
    config?.data?.governments;

  if (
    governments &&
    typeof governments === 'object' &&
    governments[id]
  ) {
    return governments[id];
  }

  if (
    id === 'CENTRAL'
  ) {
    return (
      config?.data?.central ||
      null
    );
  }

  if (
    id === 'IN-WB'
  ) {
    return (
      config?.data?.westBengal ||
      config?.data?.states?.[
        'west-bengal'
      ] ||
      null
    );
  }

  return null;
}

function getConfiguredPaths(
  object
) {
  return (
    object &&
    typeof object === 'object' &&
    object.paths &&
    typeof object.paths === 'object'
  )
    ? object.paths
    : (
      object &&
      typeof object === 'object'
        ? object
        : {}
    );
}

function buildDatasetDefinitions() {
  const common =
    config?.data?.common ||
    {};

  const assessment =
    config?.data?.assessment ||
    {};

  const central =
    getGovernmentConfig(
      'CENTRAL'
    );

  const stateIds =
    Array.isArray(
      config?.activeStateIds
    ) &&
    config.activeStateIds.length
      ? config.activeStateIds
      : Object.keys(
          config?.data?.states ||
          {}
        );

  const datasets = {
    common:
      freezeShallowDataset(
        'common',
        getConfiguredPaths(
          common
        )
      ),

    assessment:
      freezeShallowDataset(
        'assessment',
        getConfiguredPaths(
          assessment
        )
      ),

    central:
      freezeShallowDataset(
        'central',
        getConfiguredPaths(
          central
        ),
        {
          governmentId:
            'CENTRAL'
        }
      )
  };

  stateIds.forEach(
    (stateId) => {
      const configured =
        config?.data?.states?.[
          stateId
        ] ||
        getGovernmentConfig(
          stateId ===
          'west-bengal'
            ? 'IN-WB'
            : stateId
        );

      if (
        !configured
      ) {
        return;
      }

      const governmentId =
        configured.governmentId ||
        stateId;

      datasets[
        stateId
      ] =
        freezeShallowDataset(
          'state',
          getConfiguredPaths(
            configured
          ),
          {
            stateId,
            governmentId
          }
        );

      /*
       * Preserve the legacy dataset key used by the original registry and
       * older callers while making the state map future-proof.
       */
      if (
        stateId ===
          'west-bengal' ||
        governmentId ===
          'IN-WB'
      ) {
        datasets[
          'IN-WB'
        ] =
          datasets[
            stateId
          ];
      }
    }
  );

  return deepFreeze(
    datasets
  );
}

const DATASETS =
  buildDatasetDefinitions();

function getDataset(
  datasetId
) {
  return (
    DATASETS[
      datasetId
    ] ||
    null
  );
}

function getDatasetPath(
  datasetId,
  entity
) {
  const dataset =
    getDataset(
      datasetId
    );

  if (
    !dataset ||
    !dataset.paths
  ) {
    return null;
  }

  return (
    dataset.paths[
      entity
    ] ||
    null
  );
}

function getDatasetIds() {
  return Object.keys(
    DATASETS
  );
}

function getEntityTypes() {
  return [
    ...ENTITY_TYPES
  ];
}

function getRuntimeEntityTypes() {
  return [
    ...RUNTIME_ENTITY_TYPES
  ];
}

function hasEntity(
  datasetId,
  entity
) {
  return Boolean(
    getDatasetPath(
      datasetId,
      entity
    )
  );
}

/* -------------------------------------------------------------------------- */
/* Immutable runtime storage                                                  */
/* -------------------------------------------------------------------------- */

const collections =
  new Map();

const registryMeta = {
  loadedAt: null,
  version: null,
  dataVersion: null,
  schemaVersion: null,
  validated: false,
  warnings: [],
  errors: [],
  loadedScopes: [],
  loadedDatasets: {}
};

function normalizeRuntimeType(
  entityType
) {
  if (
    typeof entityType !==
    'string'
  ) {
    throw new TypeError(
      'A runtime entity type must be a non-empty string.'
    );
  }

  const key =
    entityType
      .trim()
      .replace(
        /[\s-]+/g,
        '_'
      )
      .toUpperCase();

  const normalized =
    RUNTIME_TYPE_ALIASES[
      key
    ] ||
    key;

  if (
    !RUNTIME_ENTITY_TYPES.includes(
      normalized
    )
  ) {
    throw new Error(
      `Unknown runtime entity type "${entityType}".`
    );
  }

  return normalized;
}

function cloneValue(
  value
) {
  if (
    value === null ||
    value === undefined ||
    typeof value !== 'object'
  ) {
    return value;
  }

  if (
    typeof structuredClone ===
    'function'
  ) {
    try {
      return structuredClone(
        value
      );
    } catch {
      /*
       * Fall through to the JSON-compatible recursive clone.
       */
    }
  }

  if (
    Array.isArray(
      value
    )
  ) {
    return value.map(
      cloneValue
    );
  }

  const output = {};

  Object.entries(
    value
  ).forEach(
    ([
      key,
      child
    ]) => {
      output[
        key
      ] =
        cloneValue(
          child
        );
    }
  );

  return output;
}

function immutableRecordCopy(
  record
) {
  return deepFreeze(
    cloneValue(
      record
    )
  );
}

function isCanonicalRecord(
  record
) {
  return (
    record !== null &&
    typeof record === 'object' &&
    !Array.isArray(
      record
    ) &&
    typeof record.id ===
      'string' &&
    record.id.trim().length > 0
  );
}

function canonicalId(
  record
) {
  if (
    !isCanonicalRecord(
      record
    )
  ) {
    throw new TypeError(
      'Canonical registry records must be objects with a non-empty string id.'
    );
  }

  return record.id.trim();
}

function createPreparedCollection(
  records,
  entityType
) {
  if (
    !Array.isArray(
      records
    )
  ) {
    throw new TypeError(
      `Registry collection "${entityType}" must be an array of canonical records.`
    );
  }

  const map =
    new Map();

  records.forEach(
    (record) => {
      const id =
        canonicalId(
          record
        );

      if (
        map.has(
          id
        )
      ) {
        throw new Error(
          `Duplicate canonical ID "${id}" in registry collection "${entityType}".`
        );
      }

      map.set(
        id,
        immutableRecordCopy(
          record
        )
      );
    }
  );

  return map;
}

function registerCollection(
  entityType,
  records,
  {
    replace = false
  } = {}
) {
  const type =
    normalizeRuntimeType(
      entityType
    );

  const prepared =
    createPreparedCollection(
      records,
      type
    );

  if (
    collections.has(
      type
    ) &&
    !replace
  ) {
    throw new Error(
      `Registry collection "${type}" is already registered. Clear the registry or pass replace: true explicitly.`
    );
  }

  /*
   * The prepared map is completely detached from caller-owned objects before
   * registry state is changed, making registration atomic for this collection.
   */
  collections.set(
    type,
    prepared
  );

  return getCollection(
    type
  );
}

function registerEntity(
  entityType,
  record
) {
  const type =
    normalizeRuntimeType(
      entityType
    );

  const id =
    canonicalId(
      record
    );

  let collection =
    collections.get(
      type
    );

  if (
    !collection
  ) {
    collection =
      new Map();

    collections.set(
      type,
      collection
    );
  }

  if (
    collection.has(
      id
    )
  ) {
    throw new Error(
      `Duplicate canonical ID "${id}" in registry collection "${type}".`
    );
  }

  collection.set(
    id,
    immutableRecordCopy(
      record
    )
  );

  return getById(
    type,
    id
  );
}

function registerMany(
  registrationMap,
  {
    replace = false
  } = {}
) {
  if (
    !registrationMap ||
    typeof registrationMap !==
      'object' ||
    Array.isArray(
      registrationMap
    )
  ) {
    throw new TypeError(
      'registerMany() expects an object mapping runtime entity types to arrays of canonical records.'
    );
  }

  const preparedCollections =
    [];

  /*
   * Prepare every collection before modifying registry state. A duplicate or
   * malformed record therefore cannot leave half of a multi-collection
   * registration committed.
   */
  Object.entries(
    registrationMap
  ).forEach(
    ([
      entityType,
      records
    ]) => {
      const type =
        normalizeRuntimeType(
          entityType
        );

      const prepared =
        createPreparedCollection(
          Array.isArray(
            records
          )
            ? records
            : [],
          type
        );

      if (
        collections.has(
          type
        ) &&
        !replace
      ) {
        throw new Error(
          `Registry collection "${type}" is already registered. Clear the registry or pass replace: true explicitly.`
        );
      }

      preparedCollections.push([
        type,
        prepared
      ]);
    }
  );

  preparedCollections.forEach(
    ([
      type,
      prepared
    ]) => {
      collections.set(
        type,
        prepared
      );
    }
  );

  return getSnapshot({
    includeRecords:
      false
  });
}

function registerDatabase(
  database,
  {
    clearFirst = true
  } = {}
) {
  if (
    !database ||
    typeof database !==
      'object'
  ) {
    throw new TypeError(
      'registerDatabase() expects a canonical database object.'
    );
  }

  const registrationMap = {
    GOVERNMENT:
      database.governments,

    STATE:
      database.states,

    QUALIFICATION:
      database.qualifications,

    CATEGORY:
      database.categories,

    LOCATION:
      database.locations,

    STATUS:
      database.statuses,

    CONFIDENCE_LEVEL:
      database.confidenceLevels,

    SOURCE_TYPE:
      database.sourceTypes,

    GLOSSARY:
      database.glossary,

    SCORING_RULE:
      database.scoringRules,

    EXAM:
      database.exams,

    JOB:
      database.jobs,

    DEPARTMENT:
      database.departments,

    ORGANISATION:
      database.organisations,

    RECRUITMENT:
      database.recruitment,

    PAY:
      database.pay,

    HOUSING:
      database.housing,

    PROMOTION:
      database.promotion,

    BENEFIT:
      database.benefits,

    SOURCE:
      database.sources,

    SERVICE_CADRE:
      database.serviceCadres,

    ELIGIBILITY_RULE:
      database.eligibilityRules,

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

  if (
    clearFirst
  ) {
    clear();
  }

  registerMany(
    registrationMap,
    {
      replace:
        true
    }
  );

  return registryApi;
}

/* -------------------------------------------------------------------------- */
/* Runtime lookup API                                                         */
/* -------------------------------------------------------------------------- */

function getCollectionMap(
  entityType
) {
  const type =
    normalizeRuntimeType(
      entityType
    );

  return (
    collections.get(
      type
    ) ||
    null
  );
}

function getCollection(
  entityType
) {
  const collection =
    getCollectionMap(
      entityType
    );

  if (
    !collection
  ) {
    return [];
  }

  return [
    ...collection.values()
  ].map(
    cloneValue
  );
}

function getAll(
  entityType
) {
  return getCollection(
    entityType
  );
}

function getById(
  entityType,
  id
) {
  const collection =
    getCollectionMap(
      entityType
    );

  if (
    !collection ||
    id === undefined ||
    id === null
  ) {
    return null;
  }

  const key =
    String(
      id
    ).trim();

  if (
    !key
  ) {
    return null;
  }

  const record =
    collection.get(
      key
    );

  return record
    ? cloneValue(
        record
      )
    : null;
}

function get(
  entityType,
  id
) {
  return getById(
    entityType,
    id
  );
}

function has(
  entityType,
  id
) {
  const collection =
    getCollectionMap(
      entityType
    );

  if (
    !collection ||
    id === undefined ||
    id === null
  ) {
    return false;
  }

  const key =
    String(
      id
    ).trim();

  return Boolean(
    key &&
    collection.has(
      key
    )
  );
}

function hasCollection(
  entityType
) {
  return Boolean(
    getCollectionMap(
      entityType
    )
  );
}

function getCollectionSize(
  entityType
) {
  const collection =
    getCollectionMap(
      entityType
    );

  return collection
    ? collection.size
    : 0;
}

/* -------------------------------------------------------------------------- */
/* Registry metadata / snapshots                                              */
/* -------------------------------------------------------------------------- */

function cloneMeta() {
  return cloneValue(
    registryMeta
  );
}

function setMeta(
  meta = {}
) {
  if (
    !meta ||
    typeof meta !==
      'object' ||
    Array.isArray(
      meta
    )
  ) {
    throw new TypeError(
      'setMeta() expects a metadata object.'
    );
  }

  const nextMeta =
    cloneValue(
      meta
    );

  Object.keys(
    registryMeta
  ).forEach(
    (key) => {
      if (
        Object.prototype.hasOwnProperty.call(
          nextMeta,
          key
        )
      ) {
        registryMeta[
          key
        ] =
          nextMeta[
            key
          ];
      }
    }
  );

  return cloneMeta();
}

function getMeta() {
  return cloneMeta();
}

function getSnapshot(
  {
    includeRecords = true
  } = {}
) {
  const snapshot = {
    datasets:
      Object.fromEntries(
        Object.entries(
          DATASETS
        ).map(
          ([
            id,
            dataset
          ]) => [
            id,
            {
              ...dataset,

              paths: {
                ...dataset.paths
              }
            }
          ]
        )
      ),

    entityTypes:
      getEntityTypes(),

    runtimeEntityTypes:
      getRuntimeEntityTypes(),

    meta:
      getMeta(),

    collections: {},

    counts: {}
  };

  RUNTIME_ENTITY_TYPES.forEach(
    (type) => {
      const collection =
        collections.get(
          type
        );

      const count =
        collection
          ? collection.size
          : 0;

      snapshot.counts[
        type
      ] =
        count;

      if (
        includeRecords
      ) {
        snapshot.collections[
          type
        ] =
          collection
            ? [
                ...collection.values()
              ].map(
                cloneValue
              )
            : [];
      }
    }
  );

  return snapshot;
}

function getRegistrySnapshot(
  options = {}
) {
  return getSnapshot(
    options
  );
}

function clear() {
  collections.clear();

  Object.assign(
    registryMeta,
    {
      loadedAt: null,
      version: null,
      dataVersion: null,
      schemaVersion: null,
      validated: false,
      warnings: [],
      errors: [],
      loadedScopes: [],
      loadedDatasets: {}
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

const registryApi = {
  /* Dataset-definition compatibility. */
  DATASETS,
  getDataset,
  getDatasetPath,
  getDatasetIds,
  getEntityTypes,
  getRuntimeEntityTypes,
  hasEntity,
  getRegistrySnapshot,

  /* Runtime canonical registry. */
  registerCollection,
  registerEntity,
  registerMany,
  registerDatabase,
  getCollection,
  getAll,
  getById,
  get,
  has,
  hasCollection,
  getCollectionSize,
  clear,

  /* Runtime metadata and snapshots. */
  setMeta,
  getMeta,
  getSnapshot
};

export {
  ENTITY_TYPES,
  RUNTIME_ENTITY_TYPES,
  DATASETS,

  getDataset,
  getDatasetPath,
  getDatasetIds,
  getEntityTypes,
  getRuntimeEntityTypes,
  hasEntity,
  getRegistrySnapshot,

  registerCollection,
  registerEntity,
  registerMany,
  registerDatabase,
  getCollection,
  getAll,
  getById,
  get,
  has,
  hasCollection,
  getCollectionSize,
  clear,

  setMeta,
  getMeta,
  getSnapshot
};

export default registryApi;
