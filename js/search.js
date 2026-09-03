/**
 * GovCareer Compass
 * ============================================================
 * Global Search Engine
 * ============================================================
 *
 * Index-aware, normalized search across canonical registry entities.
 *
 * Supported entities:
 * - Jobs
 * - Exams
 * - Service Cadres
 * - Departments
 * - Organisations
 * - Qualifications
 * - States
 * - Governments
 *
 * Search behavior:
 * - Prefers the canonical search index when one is exposed by the registry.
 * - Always resolves search hits back to canonical registry records.
 * - Falls back safely to normalized canonical-record scanning when the index
 *   is absent, incomplete, or incompatible.
 * - Supports:
 *   - exact ID search
 *   - exact-name search
 *   - alias search
 *   - token search
 *   - localized English/Bengali search
 *   - designation search
 *   - category search
 *   - relevance ranking
 *   - entity-type filtering
 *   - state filtering
 *   - government filtering
 */

/* --------------------------------------------------------------------------
 * Dependencies
 * -------------------------------------------------------------------------- */

import registry from './database/registry.js';

import {
  tokenize
} from './database/indexes.js';


/* --------------------------------------------------------------------------
 * Searchable entities
 * -------------------------------------------------------------------------- */

const SEARCHABLE_ENTITIES =
  Object.freeze([
    Object.freeze({
      type: 'JOB',
      label: 'Job'
    }),

    Object.freeze({
      type: 'EXAM',
      label: 'Exam'
    }),

    Object.freeze({
      type: 'SERVICE_CADRE',
      label: 'Service / Cadre'
    }),

    Object.freeze({
      type: 'DEPARTMENT',
      label: 'Department'
    }),

    Object.freeze({
      type: 'ORGANISATION',
      label: 'Organisation'
    }),

    Object.freeze({
      type: 'QUALIFICATION',
      label: 'Qualification'
    }),

    Object.freeze({
      type: 'STATE',
      label: 'State'
    }),

    Object.freeze({
      type: 'GOVERNMENT',
      label: 'Government'
    })
  ]);


const SEARCH_ENTITY_TYPES =
  Object.freeze(
    new Set(
      SEARCHABLE_ENTITIES.map(
        ({
          type
        }) => type
      )
    )
  );


/*
 * Accept common calling conventions without changing the canonical
 * internal entity names.
 */
const ENTITY_ALIASES =
  Object.freeze({
    JOB:
      'JOB',

    JOBS:
      'JOB',

    EXAM:
      'EXAM',

    EXAMS:
      'EXAM',

    SERVICE_CADRE:
      'SERVICE_CADRE',

    SERVICE_CADRES:
      'SERVICE_CADRE',

    SERVICE_CADRESSES:
      'SERVICE_CADRE',

    CADRE:
      'SERVICE_CADRE',

    DEPARTMENT:
      'DEPARTMENT',

    DEPARTMENTS:
      'DEPARTMENT',

    ORGANISATION:
      'ORGANISATION',

    ORGANISATIONS:
      'ORGANISATION',

    ORGANIZATION:
      'ORGANISATION',

    ORGANIZATIONS:
      'ORGANISATION',

    QUALIFICATION:
      'QUALIFICATION',

    QUALIFICATIONS:
      'QUALIFICATION',

    STATE:
      'STATE',

    STATES:
      'STATE',

    GOVERNMENT:
      'GOVERNMENT',

    GOVERNMENTS:
      'GOVERNMENT'
  });


/*
 * Search-index names that may be exposed by the registry/index layer.
 *
 * The search layer deliberately uses feature detection rather than importing
 * a non-guaranteed registry API. This keeps it compatible with the canonical
 * registry while allowing the database/index layer to evolve independently.
 */
const INDEX_LOOKUP_NAMES =
  Object.freeze([
    'SEARCH',
    'SEARCH_INDEX',
    'search',
    'searchIndex'
  ]);


/* --------------------------------------------------------------------------
 * Canonical searchable field definitions
 * -------------------------------------------------------------------------- */

/*
 * These paths deliberately include both canonical nested fields and
 * compatibility paths for normalized legacy records.
 *
 * Weight here is descriptive metadata for search-field importance.
 * Actual relevance weighting is implemented in scoreRecord().
 */
const SEARCH_FIELD_DEFINITIONS =
  Object.freeze([
    Object.freeze({
      path: 'id',
      weight: 1
    }),

    Object.freeze({
      path: 'identity.id',
      weight: 1
    }),

    Object.freeze({
      path: 'identity.post',
      weight: 12
    }),

    Object.freeze({
      path: 'identity.postName',
      weight: 12
    }),

    Object.freeze({
      path: 'identity.designation',
      weight: 12
    }),

    Object.freeze({
      path: 'identity.designations',
      weight: 12
    }),

    Object.freeze({
      path: 'identity.name',
      weight: 12
    }),

    Object.freeze({
      path: 'identity.title',
      weight: 12
    }),

    Object.freeze({
      path: 'post',
      weight: 12
    }),

    Object.freeze({
      path: 'postName',
      weight: 12
    }),

    Object.freeze({
      path: 'designation',
      weight: 12
    }),

    Object.freeze({
      path: 'designations',
      weight: 12
    }),

    Object.freeze({
      path: 'name',
      weight: 12
    }),

    Object.freeze({
      path: 'title',
      weight: 12
    }),

    Object.freeze({
      path: 'shortName',
      weight: 10
    }),

    Object.freeze({
      path: 'fullForm',
      weight: 10
    }),

    Object.freeze({
      path: 'abbreviation',
      weight: 10
    }),

    Object.freeze({
      path: 'aliases',
      weight: 10
    }),

    Object.freeze({
      path: 'identity.aliases',
      weight: 10
    }),

    Object.freeze({
      path: 'historicalNames',
      weight: 8
    }),

    Object.freeze({
      path: 'identity.historicalNames',
      weight: 8
    }),

    Object.freeze({
      path: 'keywords',
      weight: 8
    }),

    Object.freeze({
      path: 'identity.keywords',
      weight: 8
    }),

    Object.freeze({
      path: 'category',
      weight: 7
    }),

    Object.freeze({
      path: 'jobCategory',
      weight: 7
    }),

    Object.freeze({
      path: 'categories',
      weight: 7
    }),

    Object.freeze({
      path: 'identity.category',
      weight: 7
    }),

    Object.freeze({
      path: 'identity.categories',
      weight: 7
    }),

    Object.freeze({
      path: 'description',
      weight: 3
    }),

    Object.freeze({
      path: 'identity.description',
      weight: 3
    }),

    Object.freeze({
      path: 'governmentId',
      weight: 5
    }),

    Object.freeze({
      path: 'identity.governmentId',
      weight: 5
    }),

    Object.freeze({
      path: 'stateId',
      weight: 5
    }),

    Object.freeze({
      path: 'identity.stateId',
      weight: 5
    }),

    Object.freeze({
      path: 'departmentId',
      weight: 5
    }),

    Object.freeze({
      path: 'identity.departmentId',
      weight: 5
    }),

    Object.freeze({
      path: 'organisationId',
      weight: 5
    }),

    Object.freeze({
      path: 'identity.organisationId',
      weight: 5
    }),

    Object.freeze({
      path: 'serviceCadreId',
      weight: 5
    }),

    Object.freeze({
      path: 'identity.serviceCadreId',
      weight: 5
    }),

    Object.freeze({
      path: 'status',
      weight: 3
    }),

    Object.freeze({
      path: 'currentness',
      weight: 3
    }),

    Object.freeze({
      path: 'searchTokens',
      weight: 8
    })
  ]);


/* --------------------------------------------------------------------------
 * Canonical relationship paths
 * -------------------------------------------------------------------------- */

const GOVERNMENT_ID_PATHS =
  Object.freeze([
    'governmentId',
    'identity.governmentId'
  ]);


const STATE_ID_PATHS =
  Object.freeze([
    'stateId',
    'identity.stateId'
  ]);


const PRIMARY_NAME_PATHS =
  Object.freeze([
    'name',
    'title',
    'post',
    'postName',
    'identity.name',
    'identity.title',
    'identity.post',
    'identity.postName',
    'identity.designation',
    'designation'
  ]);


const ALIAS_PATHS =
  Object.freeze([
    'aliases',
    'identity.aliases',
    'historicalNames',
    'identity.historicalNames',
    'abbreviation',
    'identity.abbreviation',
    'shortName'
  ]);


/* --------------------------------------------------------------------------
 * Normalization
 * -------------------------------------------------------------------------- */

/**
 * Normalize text for search comparison.
 *
 * Keeps the semantic characters used by IDs and Bengali/English text while:
 * - normalizing Unicode
 * - removing combining marks
 * - lower-casing
 * - removing zero-width characters
 * - collapsing whitespace
 */
function normalizeText(
  value
) {
  return String(
    value ?? ''
  )
    .normalize(
      'NFKD'
    )
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[\u200B-\u200D\uFEFF]/g,
      ''
    )
    .toLowerCase()
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}


/**
 * Safely extract localized text.
 *
 * Supported canonical forms include:
 *
 * {
 *   en: 'Income Tax Inspector',
 *   bn: 'আয়কর পরিদর্শক'
 * }
 *
 * The function also tolerates simple string/number values and generic
 * localized objects.
 */
function getLocalizedText(
  value
) {
  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return String(
      value
    );
  }

  if (
    !value ||
    typeof value !== 'object'
  ) {
    return '';
  }

  if (
    typeof value.en === 'string' &&
    value.en.trim()
  ) {
    return value.en;
  }

  if (
    typeof value.bn === 'string' &&
    value.bn.trim()
  ) {
    return value.bn;
  }

  const values =
    Object.values(
      value
    );

  return values
    .filter(
      (item) =>
        typeof item === 'string' ||
        typeof item === 'number'
    )
    .join(' ');
}


/**
 * Resolve a nested canonical field path.
 */
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


/**
 * Flatten strings/numbers/localized objects/arrays into searchable values.
 */
function flattenFieldValue(
  value
) {
  if (
    value == null
  ) {
    return [];
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number'
  ) {
    return [
      String(
        value
      )
    ];
  }

  if (
    Array.isArray(
      value
    )
  ) {
    return value.flatMap(
      flattenFieldValue
    );
  }

  if (
    typeof value === 'object'
  ) {
    const localized =
      getLocalizedText(
        value
      );

    if (
      localized
    ) {
      return [
        localized
      ];
    }

    return Object.values(
      value
    ).flatMap(
      flattenFieldValue
    );
  }

  return [];
}


/**
 * Tokenize normalized text using the canonical index tokenization helper.
 *
 * Falls back to whitespace tokenization if the index helper cannot tokenize
 * a particular value.
 */
function normalizeTokenList(
  value
) {
  const tokens = [];

  flattenFieldValue(
    value
  ).forEach(
    (text) => {
      const normalized =
        normalizeText(
          text
        );

      if (
        !normalized
      ) {
        return;
      }

      let tokenized = [];

      try {
        tokenized =
          tokenize(
            normalized
          );
      } catch {
        tokenized = [];
      }

      if (
        !Array.isArray(
          tokenized
        ) ||
        tokenized.length === 0
      ) {
        tokenized =
          normalized
            .split(/\s+/)
            .filter(Boolean);
      }

      tokens.push(
        ...tokenized
      );
    }
  );

  return [
    ...new Set(
      tokens
    )
  ];
}


/* --------------------------------------------------------------------------
 * Canonical identity extraction
 * -------------------------------------------------------------------------- */

function getRecordGovernmentId(
  record
) {
  for (
    const path of GOVERNMENT_ID_PATHS
  ) {
    const value =
      getPathValue(
        record,
        path
      );

    const localized =
      getLocalizedText(
        value
      );

    if (
      localized
    ) {
      return String(
        localized
      );
    }
  }

  return '';
}


function getRecordStateId(
  record
) {
  for (
    const path of STATE_ID_PATHS
  ) {
    const value =
      getPathValue(
        record,
        path
      );

    const localized =
      getLocalizedText(
        value
      );

    if (
      localized
    ) {
      return String(
        localized
      );
    }
  }

  /*
   * State-specific service-cadre records may carry a stateIds array in
   * cadreScope. If there is exactly one state, it is safe to use it as the
   * record's searchable state relationship.
   */
  const stateIds =
    getPathValue(
      record,
      'cadreScope.stateIds'
    ) ||
    getPathValue(
      record,
      'stateIds'
    );

  if (
    Array.isArray(
      stateIds
    ) &&
    stateIds.length === 1
  ) {
    return String(
      stateIds[0]
    );
  }

  return '';
}


function getPrimaryName(
  record
) {
  for (
    const path of PRIMARY_NAME_PATHS
  ) {
    const value =
      getPathValue(
        record,
        path
      );

    const text =
      getLocalizedText(
        value
      );

    if (
      text
    ) {
      return text;
    }
  }

  return String(
    record?.id || ''
  );
}


function getRecordAliases(
  record
) {
  const values =
    ALIAS_PATHS.flatMap(
      (path) =>
        flattenFieldValue(
          getPathValue(
            record,
            path
          )
        )
    );

  return [
    ...new Set(
      values.filter(Boolean)
    )
  ];
}


/**
 * Build the canonical normalized text representation for search.
 *
 * This is deliberately based on canonical fields rather than arbitrary deep
 * traversal so that source metadata, analytical objects, dates, and unrelated
 * implementation fields do not become accidental search terms.
 */
function getRecordSearchText(
  record
) {
  if (
    !record ||
    typeof record !== 'object'
  ) {
    return '';
  }

  const parts =
    SEARCH_FIELD_DEFINITIONS.flatMap(
      ({
        path
      }) =>
        flattenFieldValue(
          getPathValue(
            record,
            path
          )
        )
    );

  return normalizeText(
    parts
      .filter(Boolean)
      .join(' ')
  );
}


/**
 * Build the complete normalized search representation of a canonical record.
 */
function buildNormalizedRecord(
  record,
  entityType
) {
  const searchText =
    getRecordSearchText(
      record
    );

  const normalizedPrimaryName =
    normalizeText(
      getPrimaryName(
        record
      )
    );

  const aliases =
    getRecordAliases(
      record
    );

  const normalizedAliases =
    aliases
      .map(
        normalizeText
      )
      .filter(Boolean);

  const tokens =
    new Set(
      normalizeTokenList(
        searchText
      )
    );

  /*
   * Explicit searchTokens remain useful as a curated index hint.
   */
  normalizeTokenList(
    record?.searchTokens
  ).forEach(
    (token) =>
      tokens.add(
        token
      )
  );

  return {
    record,

    id:
      String(
        record?.id ?? ''
      ),

    entityType,

    normalizedId:
      normalizeText(
        record?.id
      ),

    primaryName:
      getPrimaryName(
        record
      ),

    normalizedPrimaryName,

    aliases,

    normalizedAliases,

    searchText,

    tokens: [
      ...tokens
    ],

    stateId:
      getRecordStateId(
        record
      ),

    governmentId:
      getRecordGovernmentId(
        record
      )
  };
}


/* --------------------------------------------------------------------------
 * Entity-type normalization
 * -------------------------------------------------------------------------- */

function canonicalizeEntityType(
  value
) {
  const normalized =
    normalizeText(
      value
    )
      .replace(
        /[\s-]+/g,
        '_'
      );

  const upper =
    normalized.toUpperCase();

  return (
    ENTITY_ALIASES[
      upper
    ] ||
    upper
  );
}


function normalizeEntityTypes(
  entities,
  entityTypes
) {
  const input =
    entityTypes ??
    entities ??
    SEARCHABLE_ENTITIES.map(
      ({
        type
      }) => type
    );

  const values =
    Array.isArray(
      input
    )
      ? input
      : [
          input
        ];

  return [
    ...new Set(
      values
        .map(
          canonicalizeEntityType
        )
        .filter(
          (type) =>
            SEARCH_ENTITY_TYPES.has(
              type
            )
        )
    )
  ];
}


/* --------------------------------------------------------------------------
 * Registry access
 * -------------------------------------------------------------------------- */

function safeRegistryGetAll(
  entityType
) {
  if (
    !registry ||
    typeof registry.getAll !== 'function'
  ) {
    return [];
  }

  try {
    const records =
      registry.getAll(
        entityType
      );

    return Array.isArray(
      records
    )
      ? records
      : [];
  } catch {
    return [];
  }
}


/**
 * Find a search index exposed by the registry/index system.
 *
 * Search indexes are treated as derived data. They are never used as the
 * authoritative returned records; canonical registry records always win.
 */
function getSearchIndex() {
  if (
    !registry
  ) {
    return null;
  }

  const methodNames = [
    'getIndex',
    'getSearchIndex',
    'getDerivedIndex'
  ];

  for (
    const methodName of methodNames
  ) {
    const method =
      registry[
        methodName
      ];

    if (
      typeof method !== 'function'
    ) {
      continue;
    }

    for (
      const name of INDEX_LOOKUP_NAMES
    ) {
      try {
        const index =
          method.call(
            registry,
            name
          );

        if (
          index
        ) {
          return index;
        }
      } catch {
        /*
         * Continue through possible index names. A registry implementation
         * may only support a subset of them.
         */
      }
    }
  }

  /*
   * Support registries that expose derived indexes as public containers
   * rather than accessor methods.
   */
  const indexContainers = [
    registry.indexes,
    registry.indices,
    registry.searchIndexes,
    registry.derivedIndexes
  ];

  for (
    const container of indexContainers
  ) {
    if (
      !container ||
      typeof container !== 'object'
    ) {
      continue;
    }

    for (
      const name of INDEX_LOOKUP_NAMES
    ) {
      if (
        container[name]
      ) {
        return container[name];
      }
    }
  }

  return null;
}


/* --------------------------------------------------------------------------
 * Search-index adapters
 * -------------------------------------------------------------------------- */

/**
 * Resolve the likely entity bucket from a search-index object.
 *
 * The adapter accepts common naming forms without coupling search.js to one
 * serialized search-index implementation.
 */
function getEntityIndexBucket(
  searchIndex,
  entityType
) {
  if (
    !searchIndex ||
    typeof searchIndex !== 'object'
  ) {
    return null;
  }

  const camelCaseType =
    entityType
      .toLowerCase()
      .replace(
        /_([a-z])/g,
        (
          _,
          character
        ) =>
          character.toUpperCase()
      );

  const candidates = [
    entityType,
    entityType.toLowerCase(),
    entityType.toLowerCase() + 's',
    entityType
      .replace(
        /_/g,
        '-'
      )
      .toLowerCase(),
    camelCaseType
  ];

  for (
    const key of candidates
  ) {
    if (
      searchIndex[key]
    ) {
      return searchIndex[key];
    }
  }

  /*
   * Some search-index implementations are a single inverted map rather than
   * separate entity buckets.
   */
  return searchIndex;
}


/**
 * Extract a canonical/entity ID from an index posting.
 */
function extractPostingId(
  posting
) {
  if (
    posting == null
  ) {
    return '';
  }

  if (
    typeof posting === 'string' ||
    typeof posting === 'number'
  ) {
    return String(
      posting
    );
  }

  if (
    typeof posting !== 'object'
  ) {
    return '';
  }

  return String(
    posting.id ??
      posting.recordId ??
      posting.entityId ??
      posting.key ??
      posting.value ??
      ''
  );
}


function extractPostingType(
  posting,
  fallbackType
) {
  if (
    !posting ||
    typeof posting !== 'object'
  ) {
    return fallbackType;
  }

  const type =
    posting.entityType ??
    posting.type ??
    posting.kind;

  return type
    ? canonicalizeEntityType(
        type
      )
    : fallbackType;
}


function addCandidate(
  candidateMap,
  entityType,
  id
) {
  if (
    !entityType ||
    !id
  ) {
    return;
  }

  const key =
    `${entityType}:${id}`;

  candidateMap.set(
    key,
    {
      entityType,
      id: String(
        id
      )
    }
  );
}


function addPostings(
  candidateMap,
  postings,
  entityType
) {
  if (
    Array.isArray(
      postings
    )
  ) {
    postings.forEach(
      (posting) => {
        const id =
          extractPostingId(
            posting
          );

        const type =
          extractPostingType(
            posting,
            entityType
          );

        if (
          id
        ) {
          addCandidate(
            candidateMap,
            type,
            id
          );
        }
      }
    );

    return;
  }

  const id =
    extractPostingId(
      postings
    );

  const type =
    extractPostingType(
      postings,
      entityType
    );

  if (
    id
  ) {
    addCandidate(
      candidateMap,
      type,
      id
    );
  }
}


/**
 * Read common inverted-index layouts:
 *
 * bucket.byToken
 * bucket.tokens
 * bucket.inverted
 * bucket.invertedIndex
 * bucket.postings
 * bucket.index
 *
 * Prefix token matching is supported for type-ahead search.
 */
function addTokenBucketCandidates(
  candidateMap,
  bucket,
  queryTokens,
  entityType
) {
  if (
    !bucket ||
    typeof bucket !== 'object'
  ) {
    return false;
  }

  const tokenMaps = [
    bucket.byToken,
    bucket.tokens,
    bucket.inverted,
    bucket.invertedIndex,
    bucket.postings,
    bucket.index
  ];

  let usedTokenMap =
    false;

  for (
    const tokenMap of tokenMaps
  ) {
    if (
      !tokenMap ||
      typeof tokenMap !== 'object'
    ) {
      continue;
    }

    const keys =
      Object.keys(
        tokenMap
      );

    if (
      !keys.length
    ) {
      continue;
    }

    usedTokenMap =
      true;

    queryTokens.forEach(
      (queryToken) => {
        const normalizedQueryToken =
          normalizeText(
            queryToken
          );

        keys.forEach(
          (key) => {
            const normalizedKey =
              normalizeText(
                key
              );

            if (
              normalizedKey ===
                normalizedQueryToken ||
              normalizedKey.startsWith(
                normalizedQueryToken
              )
            ) {
              addPostings(
                candidateMap,
                tokenMap[key],
                entityType
              );
            }
          }
        );
      }
    );
  }

  return usedTokenMap;
}


/**
 * Support document-oriented search indexes when they expose searchable
 * document metadata instead of only postings.
 */
function addDocumentCandidates(
  candidateMap,
  bucket,
  query,
  entityType
) {
  if (
    !bucket ||
    typeof bucket !== 'object'
  ) {
    return false;
  }

  const documents =
    bucket.documents ??
    bucket.records ??
    bucket.entries;

  if (
    !documents
  ) {
    return false;
  }

  const candidates =
    Array.isArray(
      documents
    )
      ? documents
      : Object.entries(
          documents
        ).map(
          ([
            id,
            document
          ]) => ({
            ...(document &&
            typeof document === 'object'
              ? document
              : {}),
            id:
              document?.id ??
              id
          })
        );

  let used =
    false;

  const normalizedQuery =
    normalizeText(
      query
    );

  const queryTokens =
    normalizeTokenList(
      normalizedQuery
    );

  candidates.forEach(
    (document) => {
      const text =
        normalizeText(
          [
            document.id,
            document.name,
            document.title,
            document.post,
            document.postName,
            document.designation,
            document.aliases,
            document.keywords,
            document.searchText,
            document.normalizedName,
            document.tokens
          ]
            .flatMap(
              flattenFieldValue
            )
            .join(' ')
        );

      if (
        text.includes(
          normalizedQuery
        ) ||
        (
          queryTokens.length > 0 &&
          queryTokens.every(
            (token) =>
              text.includes(
                token
              )
          )
        )
      ) {
        const id =
          extractPostingId(
            document
          );

        const type =
          extractPostingType(
            document,
            entityType
          );

        if (
          id
        ) {
          addCandidate(
            candidateMap,
            type,
            id
          );

          used = true;
        }
      }
    }
  );

  return used;
}


/**
 * Collect candidate IDs from the available search index.
 */
function collectIndexedCandidates({
  searchIndex,
  query,
  queryTokens,
  entityTypes
}) {
  const candidateMap =
    new Map();

  let indexUsable =
    false;

  if (
    !searchIndex
  ) {
    return {
      candidates: [],
      indexUsable: false
    };
  }

  entityTypes.forEach(
    (entityType) => {
      const bucket =
        getEntityIndexBucket(
          searchIndex,
          entityType
        );

      if (
        addTokenBucketCandidates(
          candidateMap,
          bucket,
          queryTokens,
          entityType
        )
      ) {
        indexUsable =
          true;
      }

      if (
        addDocumentCandidates(
          candidateMap,
          bucket,
          query,
          entityType
        )
      ) {
        indexUsable =
          true;
      }

      /*
       * Support a simple direct token → postings object at the bucket level.
       */
      if (
        !bucket ||
        typeof bucket !== 'object' ||
        Array.isArray(bucket)
      ) {
        return;
      }

      Object.keys(
        bucket
      ).forEach(
        (key) => {
          /*
           * Ignore structural fields already handled above.
           */
          if (
            [
              'byToken',
              'tokens',
              'inverted',
              'invertedIndex',
              'postings',
              'index',
              'documents',
              'records',
              'entries',
              'version',
              'meta',
              'metadata'
            ].includes(
              key
            )
          ) {
            return;
          }

          const normalizedKey =
            normalizeText(
              key
            );

          if (
            !queryTokens.some(
              (token) =>
                normalizedKey === token ||
                normalizedKey.startsWith(
                  token
                )
            )
          ) {
            return;
          }

          addPostings(
            candidateMap,
            bucket[key],
            entityType
          );

          indexUsable =
            true;
        }
      );
    }
  );

  return {
    candidates: [
      ...candidateMap.values()
    ],
    indexUsable
  };
}


/* --------------------------------------------------------------------------
 * Relevance scoring
 * -------------------------------------------------------------------------- */

function scoreRecord(
  normalizedRecord,
  queryTokens,
  normalizedQuery
) {
  if (
    !normalizedRecord?.searchText
  ) {
    return 0;
  }

  const {
    normalizedId,
    normalizedPrimaryName,
    normalizedAliases,
    searchText,
    tokens
  } = normalizedRecord;

  const tokenSet =
    new Set(
      tokens
    );

  let score =
    0;

  let matchedTokenCount =
    0;

  let exactAlias =
    false;

  const exactName =
    normalizedPrimaryName ===
    normalizedQuery;

  const exactId =
    normalizedId ===
    normalizedQuery;


  /*
   * Exact ID is the highest semantic signal.
   */
  if (
    exactId
  ) {
    score += 1000;
  } else if (
    normalizedId.includes(
      normalizedQuery
    )
  ) {
    score += 260;
  }


  /*
   * Exact name outranks all non-exact textual matches.
   */
  if (
    exactName
  ) {
    score += 900;
  } else if (
    normalizedPrimaryName.startsWith(
      normalizedQuery
    )
  ) {
    score += 620;
  } else if (
    normalizedPrimaryName.includes(
      normalizedQuery
    )
  ) {
    score += 460;
  }


  /*
   * Exact aliases are nearly as strong as exact names.
   */
  normalizedAliases.forEach(
    (alias) => {
      if (
        alias ===
        normalizedQuery
      ) {
        score += 850;
        exactAlias =
          true;
      } else if (
        alias.startsWith(
          normalizedQuery
        )
      ) {
        score += 500;
      } else if (
        alias.includes(
          normalizedQuery
        )
      ) {
        score += 340;
      }
    }
  );


  /*
   * Token-level matching handles:
   * - partial queries
   * - multi-word names
   * - Bengali token searches
   * - designation/category terms
   */
  queryTokens.forEach(
    (token) => {
      if (
        !token
      ) {
        return;
      }

      let tokenMatched =
        false;

      if (
        tokenSet.has(
          token
        )
      ) {
        score += 85;
        tokenMatched =
          true;
      } else if (
        searchText.includes(
          token
        )
      ) {
        score += 40;
        tokenMatched =
          true;
      }

      if (
        normalizedPrimaryName.includes(
          token
        )
      ) {
        score += 70;
        tokenMatched =
          true;
      }

      if (
        normalizedAliases.some(
          (alias) =>
            alias.includes(
              token
            )
        )
      ) {
        score += 55;
        tokenMatched =
          true;
      }

      if (
        tokenMatched
      ) {
        matchedTokenCount += 1;
      }
    }
  );


  /*
   * Multi-token complete matches should clearly outrank partial matches.
   */
  if (
    queryTokens.length > 1
  ) {
    if (
      matchedTokenCount ===
      queryTokens.length
    ) {
      score += 180;
    } else if (
      matchedTokenCount > 0
    ) {
      score +=
        35 *
        matchedTokenCount;
    }
  }

  return {
    score,
    matchedTokenCount,
    exactId,
    exactName,
    exactAlias
  };
}


/* --------------------------------------------------------------------------
 * Result helpers
 * -------------------------------------------------------------------------- */

function getEntityMeta(
  entityType
) {
  return (
    SEARCHABLE_ENTITIES.find(
      ({
        type
      }) =>
        type ===
        entityType
    ) || {
      type: entityType,
      label: entityType
    }
  );
}


/**
 * Load authoritative canonical records once for the requested entity types.
 */
function getCanonicalRecordMap(
  entityTypes
) {
  const map =
    new Map();

  entityTypes.forEach(
    (entityType) => {
      safeRegistryGetAll(
        entityType
      ).forEach(
        (record) => {
          if (
            !record ||
            !record.id
          ) {
            return;
          }

          map.set(
            `${entityType}:${String(record.id)}`,
            record
          );
        }
      );
    }
  );

  return map;
}


/* --------------------------------------------------------------------------
 * Filtering
 * -------------------------------------------------------------------------- */

function recordMatchesFilters(
  record,
  {
    stateId = '',
    governmentId = ''
  } = {}
) {
  const normalizedStateId =
    normalizeText(
      stateId
    );

  const normalizedGovernmentId =
    normalizeText(
      governmentId
    );


  if (
    normalizedStateId &&
    normalizeText(
      getRecordStateId(
        record
      )
    ) !==
      normalizedStateId
  ) {
    return false;
  }


  if (
    normalizedGovernmentId &&
    normalizeText(
      getRecordGovernmentId(
        record
      )
    ) !==
      normalizedGovernmentId
  ) {
    return false;
  }

  return true;
}


/* --------------------------------------------------------------------------
 * Canonical fallback search
 * -------------------------------------------------------------------------- */

function buildFallbackRecords(
  entityTypes,
  filters
) {
  const records = [];

  entityTypes.forEach(
    (entityType) => {
      safeRegistryGetAll(
        entityType
      ).forEach(
        (record) => {
          if (
            !recordMatchesFilters(
              record,
              filters
            )
          ) {
            return;
          }

          records.push(
            buildNormalizedRecord(
              record,
              entityType
            )
          );
        }
      );
    }
  );

  return records;
}


/* --------------------------------------------------------------------------
 * Indexed candidate resolution
 * -------------------------------------------------------------------------- */

function resolveIndexedRecords(
  indexCandidates,
  canonicalRecordMap,
  filters
) {
  const resolved = [];

  indexCandidates.forEach(
    ({
      entityType,
      id
    }) => {
      const record =
        canonicalRecordMap.get(
          `${entityType}:${String(id)}`
        );

      /*
       * Indexes are derived data. Never return an index-only pseudo-record.
       */
      if (
        !record
      ) {
        return;
      }

      if (
        !recordMatchesFilters(
          record,
          filters
        )
      ) {
        return;
      }

      resolved.push(
        buildNormalizedRecord(
          record,
          entityType
        )
      );
    }
  );

  return resolved;
}


function dedupeNormalizedRecords(
  records
) {
  const map =
    new Map();

  records.forEach(
    (item) => {
      const key =
        `${item.entityType}:${item.id}`;

      if (
        !map.has(
          key
        )
      ) {
        map.set(
          key,
          item
        );
      }
    }
  );

  return [
    ...map.values()
  ];
}


/* --------------------------------------------------------------------------
 * Public search API
 * -------------------------------------------------------------------------- */

/**
 * Search canonical GovCareer Compass entities.
 *
 * Supported options:
 *
 * search(query, {
 *   entityTypes: ['JOB', 'EXAM'],
 *   stateId: 'WEST_BENGAL',
 *   governmentId: 'WEST_BENGAL_GOVERNMENT',
 *   limit: 30
 * })
 *
 * Compatibility:
 *
 * search(query, {
 *   entities: ['JOB']
 * })
 */
function search(
  query,
  {
    entities,
    entityTypes,
    stateId = '',
    governmentId = '',
    limit = 30
  } = {}
) {
  const normalizedQuery =
    normalizeText(
      query
    );

  if (
    !normalizedQuery
  ) {
    return [];
  }

  let queryTokens =
    [];

  try {
    queryTokens =
      tokenize(
        normalizedQuery
      );
  } catch {
    queryTokens =
      [];
  }

  if (
    !Array.isArray(
      queryTokens
    ) ||
    queryTokens.length === 0
  ) {
    queryTokens =
      normalizedQuery
        .split(/\s+/)
        .filter(Boolean);
  }


  queryTokens =
    [
      ...new Set(
        queryTokens
          .map(
            normalizeText
          )
          .filter(Boolean)
      )
    ];


  if (
    queryTokens.length === 0
  ) {
    return [];
  }


  const requestedEntityTypes =
    normalizeEntityTypes(
      entities,
      entityTypes
    );


  if (
    requestedEntityTypes.length === 0
  ) {
    return [];
  }


  const filters = {
    stateId,
    governmentId
  };


  /*
   * Canonical records are always the authority.
   */
  const canonicalRecordMap =
    getCanonicalRecordMap(
      requestedEntityTypes
    );


  /*
   * Prefer a derived search index when exposed by the registry.
   */
  const searchIndex =
    getSearchIndex();


  const indexed =
    collectIndexedCandidates({
      searchIndex,
      query: normalizedQuery,
      queryTokens,
      entityTypes:
        requestedEntityTypes
    });


  let normalizedRecords =
    [];


  if (
    indexed.indexUsable &&
    indexed.candidates.length
  ) {
    normalizedRecords =
      resolveIndexedRecords(
        indexed.candidates,
        canonicalRecordMap,
        filters
      );
  }


  /*
   * The search index may intentionally be partial.
   *
   * Canonical fallback records therefore supplement indexed candidates rather
   * than allowing an incomplete derived index to hide valid records.
   *
   * Dedupe below ensures an indexed record is not returned twice.
   */
  const fallbackRecords =
    buildFallbackRecords(
      requestedEntityTypes,
      filters
    );


  const combined =
    dedupeNormalizedRecords([
      ...normalizedRecords,
      ...fallbackRecords
    ]);


  const results =
    [];


  combined.forEach(
    (normalizedRecord) => {
      const ranking =
        scoreRecord(
          normalizedRecord,
          queryTokens,
          normalizedQuery
        );

      if (
        !ranking ||
        ranking.score <= 0
      ) {
        return;
      }


      const meta =
        getEntityMeta(
          normalizedRecord.entityType
        );


      results.push({
        id:
          normalizedRecord.id,

        type:
          normalizedRecord.entityType,

        typeLabel:
          meta.label,

        title:
          normalizedRecord.primaryName,

        /*
         * Return the authoritative canonical registry record, never the
         * serialized search-index document.
         */
        record:
          normalizedRecord.record,

        score:
          ranking.score,

        matchedTokenCount:
          ranking.matchedTokenCount,

        exactId:
          ranking.exactId,

        exactName:
          ranking.exactName,

        exactAlias:
          ranking.exactAlias,

        stateId:
          normalizedRecord.stateId,

        governmentId:
          normalizedRecord.governmentId
      });
    }
  );


  const safeLimit =
    Math.max(
      1,
      Math.min(
        200,
        Number(
          limit
        ) || 30
      )
    );


  return results
    .sort(
      (
        a,
        b
      ) =>
        /*
         * Primary ranking.
         */
        b.score -
        a.score ||

        /*
         * Deterministic semantic tie breakers.
         */
        Number(
          b.exactId
        ) -
        Number(
          a.exactId
        ) ||

        Number(
          b.exactName
        ) -
        Number(
          a.exactName
        ) ||

        Number(
          b.exactAlias
        ) -
        Number(
          a.exactAlias
        ) ||

        b.matchedTokenCount -
        a.matchedTokenCount ||

        /*
         * Stable deterministic textual ordering.
         */
        a.title.localeCompare(
          b.title,
          undefined,
          {
            sensitivity:
              'base'
          }
        ) ||

        a.id.localeCompare(
          b.id,
          undefined,
          {
            sensitivity:
              'base'
          }
        )
    )
    .slice(
      0,
      safeLimit
    );
}


/* --------------------------------------------------------------------------
 * Highlighting
 * -------------------------------------------------------------------------- */

/**
 * Escape user-controlled text before inserting it into HTML.
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


/**
 * Escape a string for safe use inside a RegExp.
 */
function escapeRegExp(
  value
) {
  return String(
    value
  ).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}


/**
 * Highlight the complete query and individual tokens.
 *
 * This improves usability for:
 * - multi-word queries
 * - partial token searches
 * - English
 * - Bengali
 *
 * The HTML source is escaped before <mark> is inserted, preventing query
 * content from becoming executable markup.
 */
function highlightText(
  text,
  query
) {
  const source =
    String(
      text ?? ''
    );

  const normalizedQuery =
    normalizeText(
      query
    );

  if (
    !normalizedQuery
  ) {
    return escapeHtml(
      source
    );
  }


  let queryTokens =
    [];

  try {
    queryTokens =
      tokenize(
        normalizedQuery
      );
  } catch {
    queryTokens =
      [];
  }


  if (
    !Array.isArray(
      queryTokens
    ) ||
    queryTokens.length === 0
  ) {
    queryTokens =
      normalizedQuery
        .split(/\s+/)
        .filter(Boolean);
  }


  /*
   * Match the complete phrase first, then individual tokens.
   */
  const terms =
    [
      normalizedQuery,
      ...queryTokens
    ]
      .map(
        String
      )
      .filter(Boolean)
      .sort(
        (a, b) =>
          b.length -
          a.length
      )
      .filter(
        (
          term,
          index,
          array
        ) =>
          array.indexOf(
            term
          ) === index
      );


  const pattern =
    terms
      .map(
        escapeRegExp
      )
      .join('|');


  if (
    !pattern
  ) {
    return escapeHtml(
      source
    );
  }


  return escapeHtml(
    source
  ).replace(
    new RegExp(
      `(${pattern})`,
      'igu'
    ),
    '<mark>$1</mark>'
  );
}


/* --------------------------------------------------------------------------
 * DOM integration
 * -------------------------------------------------------------------------- */

/**
 * Initialize delegated global search input handling.
 *
 * Supported data attributes:
 *
 * data-search-input
 * data-search-limit="8"
 * data-search-entities="JOB,EXAM"
 * data-search-entity-types="JOB,EXAM"
 * data-search-state="WEST_BENGAL"
 * data-search-government="WEST_BENGAL_GOVERNMENT"
 *
 * Emits:
 *
 * document → govcareer:search
 *
 * detail:
 * {
 *   query,
 *   normalizedQuery,
 *   results
 * }
 */
function initializeSearch() {
  const handler =
    (event) => {
      const input =
        event.target?.closest?.(
          '[data-search-input]'
        );

      if (
        !input
      ) {
        return;
      }


      const query =
        input.value ?? '';


      const entityAttribute =
        input.dataset.searchEntities ||
        input.dataset.searchEntityTypes;


      const requestedEntities =
        entityAttribute
          ? entityAttribute
              .split(',')
              .map(
                (value) =>
                  value.trim()
              )
              .filter(Boolean)
          : undefined;


      const results =
        search(
          query,
          {
            entityTypes:
              requestedEntities,

            stateId:
              input.dataset.searchState ||
              '',

            governmentId:
              input.dataset.searchGovernment ||
              '',

            limit:
              input.dataset.searchLimit
          }
        );


      document.dispatchEvent(
        new CustomEvent(
          'govcareer:search',
          {
            detail: {
              query,

              normalizedQuery:
                normalizeText(
                  query
                ),

              results
            }
          }
        )
      );
    };


  document.addEventListener(
    'input',
    handler
  );


  /*
   * Return a cleanup function so page-level or test-level initialization can
   * safely remove its delegated listener.
   */
  return () =>
    document.removeEventListener(
      'input',
      handler
    );
}


/* --------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
  SEARCHABLE_ENTITIES,

  normalizeText,

  getLocalizedText,

  getRecordSearchText,

  getPrimaryName,

  getRecordAliases,

  canonicalizeEntityType,

  search,

  highlightText,

  escapeRegExp,

  escapeHtml,

  initializeSearch
};


export default {
  search,
  highlightText,
  initializeSearch
};
