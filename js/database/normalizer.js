// COMPLETE FINAL NORMALIZER

/**
 * GovCareer Compass
 * Canonical Database Normalizer
 *
 * Purpose:
 * - normalize structurally equivalent source representations;
 * - preserve canonical information and legitimate source metadata;
 * - build predictable canonical runtime shapes from supported legacy/source forms;
 * - keep unresolved factual relationships unresolved for validation/migration.
 *
 * Architectural boundary:
 * - the loader loads data and controls IO/cache behaviour;
 * - this module canonicalizes already-loaded values only;
 * - the validator decides whether the resulting runtime representation is valid;
 * - the eligibility engine, not this module, determines candidate eligibility.
 *
 * IMPORTANT:
 * - normalization does not determine eligibility;
 * - normalization does not create government facts;
 * - relational IDs are preserved, not fabricated;
 * - dataset envelopes are interpreted explicitly and entity-by-entity;
 * - missing factual relationships remain absent rather than being filled with
 *   UNKNOWN, arbitrary defaults, guessed profile IDs, or name-based matches.
 */

const UNKNOWN = 'UNKNOWN';

const ENTITY_TYPES = Object.freeze({
  UNKNOWN: 'UNKNOWN',

  JOB:
    'JOB',

  EXAM:
    'EXAM',

  DEPARTMENT:
    'DEPARTMENT',

  ORGANISATION:
    'ORGANISATION',

  SERVICE_CADRE:
    'SERVICE_CADRE',

  ELIGIBILITY_RULE:
    'ELIGIBILITY_RULE',

  RECRUITMENT:
    'RECRUITMENT',

  PAY:
    'PAY',

  LOCATION:
    'LOCATION',

  HOUSING:
    'HOUSING',

  PROMOTION:
    'PROMOTION',

  BENEFIT:
    'BENEFIT',

  SOURCE:
    'SOURCE',

  GOVERNMENT:
    'GOVERNMENT',

  STATE:
    'STATE',

  QUALIFICATION:
    'QUALIFICATION',

  CATEGORY:
    'CATEGORY'
});

const COLLECTION_WRAPPERS = Object.freeze({
  JOB: Object.freeze([
    'jobs',
    'records',
    'data',
    'items'
  ]),

  EXAM: Object.freeze([
    'exams',
    'records',
    'data',
    'items'
  ]),

  DEPARTMENT: Object.freeze([
    'departments',
    'records',
    'data',
    'items'
  ]),

  ORGANISATION: Object.freeze([
    'organisations',
    'organizations',
    'records',
    'data',
    'items'
  ]),

  SERVICE_CADRE: Object.freeze([
    'serviceCadres',
    'records',
    'data',
    'items'
  ]),

  ELIGIBILITY_RULE: Object.freeze([
    'eligibilityRules',
    'records',
    'data',
    'items'
  ]),

  RECRUITMENT: Object.freeze([
    'recruitments',
    'records',
    'data',
    'items'
  ]),

  PAY: Object.freeze([
    'payStructures',
    'payProfiles',
    'records',
    'data',
    'items'
  ]),

  LOCATION: Object.freeze([
    'locations',
    'locationProfiles',
    'records',
    'data',
    'items'
  ]),

  HOUSING: Object.freeze([
    'housingProfiles',
    'housing',
    'records',
    'data',
    'items'
  ]),

  PROMOTION: Object.freeze([
    'promotionProfiles',
    'promotion',
    'records',
    'data',
    'items'
  ]),

  BENEFIT: Object.freeze([
    'benefitsProfiles',
    'benefitProfiles',
    'benefits',
    'records',
    'data',
    'items'
  ]),

  SOURCE: Object.freeze([
    'sources',
    'records',
    'data',
    'items'
  ]),

  GOVERNMENT: Object.freeze([
    'governments',
    'records',
    'data',
    'items'
  ]),

  STATE: Object.freeze([
    'states',
    'unionTerritories',
    'records',
    'data',
    'items'
  ]),

  QUALIFICATION: Object.freeze([
    'academicQualifications',
    'teacherEducationQualifications',
    'technicalQualifications',
    'computerQualifications',
    'lawQualifications',
    'medicalQualifications',
    'nursingQualifications',
    'pharmacyQualifications',
    'engineeringQualifications',
    'agricultureQualifications',
    'paramedicalQualifications',
    'qualifications',
    'records',
    'data',
    'items'
  ]),

  CATEGORY: Object.freeze([
    'categories',
    'records',
    'data',
    'items'
  ]),

  STATUS: Object.freeze([
    'careerStatuses',
    'recruitmentStatuses',
    'recruitmentModes',
    'coverageStatuses',
    'dataStatuses',
    'sourceCurrentnessStatuses'
  ])
});

const ENVELOPE_METADATA_KEYS = Object.freeze([
  'governmentId',
  'stateId',
  'schemaVersion',
  'dataVersion',
  'lastVerified',
  'version'
]);

const DOMAIN_METADATA_TYPES = Object.freeze(
  new Set([
    ENTITY_TYPES.JOB,
    ENTITY_TYPES.EXAM,
    ENTITY_TYPES.DEPARTMENT,
    ENTITY_TYPES.ORGANISATION,
    ENTITY_TYPES.SERVICE_CADRE,
    ENTITY_TYPES.ELIGIBILITY_RULE,
    ENTITY_TYPES.RECRUITMENT,
    ENTITY_TYPES.PAY,
    ENTITY_TYPES.LOCATION,
    ENTITY_TYPES.HOUSING,
    ENTITY_TYPES.PROMOTION,
    ENTITY_TYPES.BENEFIT,
    ENTITY_TYPES.SOURCE
  ])
);

const DATA_VERSION_TYPES = Object.freeze(
  new Set([
    ENTITY_TYPES.JOB,
    ENTITY_TYPES.EXAM,
    ENTITY_TYPES.SERVICE_CADRE,
    ENTITY_TYPES.ELIGIBILITY_RULE,
    ENTITY_TYPES.RECRUITMENT,
    ENTITY_TYPES.PAY,
    ENTITY_TYPES.LOCATION,
    ENTITY_TYPES.HOUSING,
    ENTITY_TYPES.PROMOTION,
    ENTITY_TYPES.BENEFIT,
    ENTITY_TYPES.QUALIFICATION,
    ENTITY_TYPES.STATE,
    ENTITY_TYPES.SOURCE
  ])
);

const LAST_VERIFIED_TYPES = Object.freeze(
  new Set([
    ENTITY_TYPES.JOB,
    ENTITY_TYPES.EXAM,
    ENTITY_TYPES.SERVICE_CADRE,
    ENTITY_TYPES.ELIGIBILITY_RULE,
    ENTITY_TYPES.RECRUITMENT,
    ENTITY_TYPES.PAY,
    ENTITY_TYPES.LOCATION,
    ENTITY_TYPES.HOUSING,
    ENTITY_TYPES.PROMOTION,
    ENTITY_TYPES.BENEFIT,
    ENTITY_TYPES.STATE,
    ENTITY_TYPES.SOURCE
  ])
);

const SCORE_FIELDS = Object.freeze([
  'familyCompatibilityBase',
  'parentCareCompatibilityBase',
  'authority',
  'socialStatus',
  'careerGrowth',
  'safety',
  'housingAdvantage',
  'kolkataStability',
  'ruralPostingBurden',
  'transferBurden',
  'postingPredictability',
  'parentCareRisk',
  'physicalRisk',
  'workLife',
  'stress',
  'risk',
  'familyCompatibility',
  'parentCareCompatibility',
  'physicalSafety'
]);

const CANONICAL_SERVICE_TYPES = Object.freeze([
  'CIVIL_SERVICE',
  'POLICE_SERVICE',
  'REVENUE_SERVICE',
  'TAX_SERVICE',
  'AUDIT_SERVICE',
  'ACCOUNTS_SERVICE',
  'ADMINISTRATIVE_SERVICE',
  'SECRETARIAT_SERVICE',
  'PANCHAYAT_SERVICE',
  'EDUCATION_SERVICE',
  'FOREST_SERVICE',
  'CORRECTIONAL_SERVICE',
  'FIRE_SERVICE',
  'POSTAL_SERVICE',
  'RAILWAY_SERVICE',
  'SECURITY_SERVICE',
  'OTHER'
]);

/*
 * These mappings are deliberately narrow. They translate a serviceNature
 * value already present in the repository into the canonical service type
 * enum only when the semantic correspondence is explicit.
 */
const SERVICE_TYPE_BY_NATURE = Object.freeze({
  ADMINISTRATIVE:
    'ADMINISTRATIVE_SERVICE',

  POLICE:
    'POLICE_SERVICE',

  REVENUE:
    'REVENUE_SERVICE',

  TAX:
    'TAX_SERVICE',

  AUDIT:
    'AUDIT_SERVICE',

  ACCOUNTS:
    'ACCOUNTS_SERVICE',

  SECRETARIAT:
    'SECRETARIAT_SERVICE',

  PANCHAYAT:
    'PANCHAYAT_SERVICE',

  EDUCATION:
    'EDUCATION_SERVICE',

  FOREST:
    'FOREST_SERVICE',

  CORRECTIONAL:
    'CORRECTIONAL_SERVICE',

  CORRECTIONS:
    'CORRECTIONAL_SERVICE',

  FIRE:
    'FIRE_SERVICE',

  POSTAL:
    'POSTAL_SERVICE',

  RAILWAY:
    'RAILWAY_SERVICE',

  SECURITY:
    'SECURITY_SERVICE'
});

const JOB_EDUCATION_LEVELS = Object.freeze([
  'CLASS_8',
  'CLASS_10',
  'CLASS_12',
  'DIPLOMA',
  'ITI',
  'GRADUATE',
  'POSTGRADUATE',
  'DOCTORATE',
  'PROFESSIONAL',
  'OTHER'
]);

const ELIGIBILITY_RULE_CONDITION_TYPES =
  Object.freeze([
    'EDUCATION_LEVEL',
    'MINIMUM_QUALIFICATION',
    'QUALIFICATION',
    'DEGREE',
    'SUBJECT',
    'SUBJECT_COMBINATION',
    'MARKS',
    'PERCENTAGE',
    'LANGUAGE',
    'MATHEMATICS',
    'STATISTICS',
    'ECONOMICS',
    'COMMERCE',
    'SCIENCE',
    'ARTS',
    'PROFESSIONAL_QUALIFICATION',
    'BED',
    'DELED',
    'BELED',
    'ITI',
    'DIPLOMA',
    'TET',
    'COMPUTER_KNOWLEDGE',
    'COMPUTER_CERTIFICATE',
    'TYPING',
    'SHORTHAND',
    'DRIVING_LICENCE',
    'OTHER_LICENCE',
    'EXPERIENCE',
    'AGE',
    'CITIZENSHIP',
    'DOMICILE',
    'RESERVATION',
    'CATEGORY',
    'GENDER',
    'NATIONALITY',
    'PHYSICAL_STANDARD',
    'PHYSICAL_EFFICIENCY_TEST',
    'MEDICAL_STANDARD',
    'EYESIGHT',
    'HEIGHT',
    'WEIGHT',
    'CHEST',
    'RUNNING',
    'WALKING',
    'CYCLING',
    'FITNESS',
    'MEDICAL_TEST',
    'DOCUMENT_VERIFICATION',
    'OTHER'
  ]);

function isPlainObject(
  value
) {
  if (
    value === null ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(
      value
    );

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

function cleanString(
  value,
  fallback = ''
) {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  const text =
    String(
      value
    )
      .replace(
        /\u00A0/g,
        ' '
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  return (
    text ||
    fallback
  );
}

function cleanNullableString(
  value
) {
  const result =
    cleanString(
      value,
      ''
    );

  return (
    result ||
    null
  );
}

function cleanArray(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return [];
  }

  if (
    Array.isArray(
      value
    )
  ) {
    return value.filter(
      (item) =>
        item !== undefined &&
        item !== null
    );
  }

  return [
    value
  ];
}

/*
 * Object-property order should not determine whether two structured values
 * are considered identical. Array order is preserved because it can be
 * semantically meaningful for rule sequences and other ordered structures.
 */
function stableSerialize(
  value
) {
  if (
    Array.isArray(
      value
    )
  ) {
    return `[${value
      .map(
        stableSerialize
      )
      .join(',')}]`;
  }

  if (
    isPlainObject(
      value
    )
  ) {
    return `{${Object.keys(
      value
    )
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(
            key
          )}:${stableSerialize(
            value[
              key
            ]
          )}`
      )
      .join(',')}}`;
  }

  return JSON.stringify(
    value
  );
}

function uniqueArray(
  value
) {
  const items =
    cleanArray(
      value
    );

  const seen =
    new Set();

  const result =
    [];

  items.forEach(
    (item) => {
      const key =
        stableSerialize(
          item
        );

      if (
        !seen.has(
          key
        )
      ) {
        seen.add(
          key
        );

        result.push(
          item
        );
      }
    }
  );

  return result;
}

function cleanId(
  value,
  fallback = null
) {
  const id =
    cleanNullableString(
      value
    );

  return (
    id ||
    fallback
  );
}

function cleanLocalizedText(
  value
) {
  if (
    typeof value ===
    'string'
  ) {
    return {
      en:
        cleanString(
          value
        )
    };
  }

  if (
    !isPlainObject(
      value
    )
  ) {
    return {
      en:
        ''
    };
  }

  const normalized =
    {};

  Object.entries(
    value
  ).forEach(
    ([
      language,
      text
    ]) => {
      const cleaned =
        cleanString(
          text,
          ''
        );

      if (
        cleaned
      ) {
        normalized[
          language
        ] =
          cleaned;
      }
    }
  );

  if (
    !normalized.en
  ) {
    const first =
      Object.values(
        normalized
      )[0];

    normalized.en =
      first ||
      '';
  }

  return normalized;
}

function normalizeLocalizedText(
  value
) {
  return cleanLocalizedText(
    value
  );
}

function normalizeDate(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  const text =
    cleanString(
      value,
      ''
    );

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      text
    )
  ) {
    const date =
      new Date(
        `${text}T00:00:00Z`
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return text;
    }
  }

  const date =
    new Date(
      text
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date
    .toISOString()
    .slice(
      0,
      10
    );
}

function normalizeNumber(
  value,
  {
    integer = false,
    min = null,
    max = null
  } = {}
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  const number =
    Number(
      value
    );

  if (
    !Number.isFinite(
      number
    )
  ) {
    return null;
  }

  let result =
    integer
      ? Math.trunc(
          number
        )
      : number;

  if (
    min !== null &&
    result < min
  ) {
    result =
      min;
  }

  if (
    max !== null &&
    result > max
  ) {
    result =
      max;
  }

  return result;
}

function normalizeBoolean(
  value,
  fallback = false
) {
  if (
    typeof value ===
    'boolean'
  ) {
    return value;
  }

  if (
    value === 'true' ||
    value === 'TRUE' ||
    value === 1 ||
    value === '1'
  ) {
    return true;
  }

  if (
    value === 'false' ||
    value === 'FALSE' ||
    value === 0 ||
    value === '0'
  ) {
    return false;
  }

  return fallback;
}

function normalizeEnum(
  value,
  allowedValues,
  fallback = UNKNOWN
) {
  const normalized =
    cleanString(
      value,
      ''
    );

  if (
    allowedValues.includes(
      normalized
    )
  ) {
    return normalized;
  }

  return fallback;
}

function normalizeStringEnumOrNull(
  value,
  allowedValues
) {
  return normalizeEnum(
    value,
    allowedValues,
    null
  );
}

function normalizeIdArray(
  value
) {
  return uniqueArray(
    cleanArray(
      value
    )
      .map(
        (item) =>
          cleanId(
            item
          )
      )
      .filter(
        Boolean
      )
  );
}

function normalizeSourceReference(
  source
) {
  if (
    typeof source ===
    'string'
  ) {
    return {
      sourceId:
        cleanId(
          source
        )
    };
  }

  if (
    !isPlainObject(
      source
    )
  ) {
    return null;
  }

  const normalized = {
    sourceId:
      cleanId(
        source.sourceId ??
        source.id
      )
  };

  const note =
    cleanNullableString(
      source.note
    );

  if (note) {
    normalized.note =
      note;
  }

  const claim =
    cleanNullableString(
      source.claim
    );

  if (claim) {
    normalized.claim =
      claim;
  }

  return normalized;
}

function normalizeSources(
  sources
) {
  return uniqueArray(
    cleanArray(
      sources
    )
      .map(
        normalizeSourceReference
      )
      .filter(
        (item) =>
          item?.sourceId
      )
  );
}

function normalizeRequirement(
  requirement
) {
  if (
    typeof requirement ===
    'string'
  ) {
    return {
      id: null,
      type:
        'UNSPECIFIED',
      value:
        requirement,
      hard: true
    };
  }

  if (
    !isPlainObject(
      requirement
    )
  ) {
    return null;
  }

  return {
    id:
      cleanId(
        requirement.id
      ),

    type:
      cleanString(
        requirement.type,
        'UNSPECIFIED'
      ),

    value:
      requirement.value ??
      null,

    hard:
      normalizeBoolean(
        requirement.hard,
        true
      ),

    sourceIds:
      normalizeIdArray(
        requirement.sourceIds
      )
  };
}

function normalizeRequirements(
  requirements
) {
  return cleanArray(
    requirements
  )
    .map(
      normalizeRequirement
    )
    .filter(
      Boolean
    );
}

function normalizeEntityType(
  value
) {
  const normalized =
    cleanString(
      value,
      ENTITY_TYPES.UNKNOWN
    )
      .replace(
        /[-\s]+/g,
        '_'
      )
      .toUpperCase();

  const aliases = {
    ORGANIZATION:
      ENTITY_TYPES.ORGANISATION,

    ORGANIZATIONS:
      ENTITY_TYPES.ORGANISATION,

    ORGANISATION:
      ENTITY_TYPES.ORGANISATION,

    ORGANISATIONS:
      ENTITY_TYPES.ORGANISATION,

    CADRE:
      ENTITY_TYPES.SERVICE_CADRE,

    SERVICE_CADRES:
      ENTITY_TYPES.SERVICE_CADRE,

    ELIGIBILITY_RULES:
      ENTITY_TYPES.ELIGIBILITY_RULE,

    RECRUITMENT_RECORD:
      ENTITY_TYPES.RECRUITMENT,

    RECRUITMENTS:
      ENTITY_TYPES.RECRUITMENT,

    PAY_STRUCTURE:
      ENTITY_TYPES.PAY,

    PAY_STRUCTURES:
      ENTITY_TYPES.PAY,

    LOCATION_PROFILE:
      ENTITY_TYPES.LOCATION,

    LOCATION_PROFILES:
      ENTITY_TYPES.LOCATION,

    HOUSING_PROFILE:
      ENTITY_TYPES.HOUSING,

    HOUSING_PROFILES:
      ENTITY_TYPES.HOUSING,

    PROMOTION_PROFILE:
      ENTITY_TYPES.PROMOTION,

    PROMOTION_PROFILES:
      ENTITY_TYPES.PROMOTION,

    BENEFIT_PROFILE:
      ENTITY_TYPES.BENEFIT,

    BENEFIT_PROFILES:
      ENTITY_TYPES.BENEFIT,

    QUALIFICATIONS:
      ENTITY_TYPES.QUALIFICATION,

    CATEGORIES:
      ENTITY_TYPES.CATEGORY
  };

  return (
    aliases[
      normalized
    ] ||
    normalized
  );
}

/*
 * Public compatibility:
 *
 * Existing loader usage:
 *   normalizeByType(data, 'JOB')
 *
 * Extended usage:
 *   normalizeByType(data, {
 *     entityType: 'JOB',
 *     datasetName: 'jobs',
 *     scope: 'CENTRAL',
 *     path: 'central/jobs.json'
 *   })
 */
function normalizeContext(
  entityTypeOrContext,
  fallbackContext = {}
) {
  if (
    isPlainObject(
      entityTypeOrContext
    )
  ) {
    return {
      ...entityTypeOrContext,

      entityType:
        normalizeEntityType(
          entityTypeOrContext.entityType
        )
    };
  }

  return {
    ...fallbackContext,

    entityType:
      normalizeEntityType(
        entityTypeOrContext
      )
  };
}

function getDatasetMetadata(
  data
) {
  if (
    !isPlainObject(
      data
    )
  ) {
    return {};
  }

  const metadata =
    {};

  ENVELOPE_METADATA_KEYS.forEach(
    (key) => {
      if (
        data[key] !==
          undefined &&
        data[key] !==
          null &&
        data[key] !==
          ''
      ) {
        metadata[key] =
          data[key];
      }
    }
  );

  return metadata;
}

function getCollectionKeys(
  entityType
) {
  const normalizedType =
    normalizeEntityType(
      entityType
    );

  return (
    COLLECTION_WRAPPERS[
      normalizedType
    ] ||
    Object.freeze([
      'records',
      'data',
      'items'
    ])
  );
}

function getCollectionKeyForEntity(
  data,
  entityType
) {
  if (
    !isPlainObject(
      data
    )
  ) {
    return null;
  }

  const keys =
    getCollectionKeys(
      entityType
    );

  for (
    const key of
    keys
  ) {
    if (
      Array.isArray(
        data[
          key
        ]
      )
    ) {
      return key;
    }
  }

  return null;
}

/*
 * Return every semantically relevant collection for an entity type.
 *
 * Special cases:
 * - STATE preserves states and unionTerritories as distinguishable records.
 * - STATUS preserves each vocabulary through collectionKey.
 * - QUALIFICATION intentionally excludes educationLevels, qualificationTypes,
 *   subjectFamilies and qualificationStatuses because those are vocabularies,
 *   not qualification records.
 */
function getCollectionEntries(
  data,
  entityType
) {
  if (
    Array.isArray(
      data
    )
  ) {
    return [
      {
        key: null,
        records: data
      }
    ];
  }

  if (
    !isPlainObject(
      data
    )
  ) {
    return [];
  }

  const normalizedType =
    normalizeEntityType(
      entityType
    );

  if (
    normalizedType ===
    ENTITY_TYPES.STATE
  ) {
    const entries =
      [];

    if (
      Array.isArray(
        data.states
      )
    ) {
      entries.push({
        key:
          'states',
        records:
          data.states
      });
    }

    if (
      Array.isArray(
        data.unionTerritories
      )
    ) {
      entries.push({
        key:
          'unionTerritories',
        records:
          data.unionTerritories
      });
    }

    if (
      entries.length
    ) {
      return entries;
    }
  }

  if (
    normalizedType ===
    'STATUS'
  ) {
    const entries =
      [];

    for (
      const key of
      getCollectionKeys(
        'STATUS'
      )
    ) {
      if (
        Array.isArray(
          data[key]
        )
      ) {
        entries.push({
          key,
          records:
            data[key]
        });
      }
    }

    return entries;
  }

  if (
    normalizedType ===
    ENTITY_TYPES.QUALIFICATION
  ) {
    const entries =
      [];

    for (
      const key of
      getCollectionKeys(
        'QUALIFICATION'
      )
    ) {
      if (
        Array.isArray(
          data[key]
        )
      ) {
        entries.push({
          key,
          records:
            data[key]
        });
      }
    }

    return entries;
  }

  const key =
    getCollectionKeyForEntity(
      data,
      normalizedType
    );

  if (
    key
  ) {
    return [
      {
        key,
        records:
          data[key]
      }
    ];
  }

  return [];
}

function extractCollection(
  data,
  context = {}
) {
  const normalizedContext =
    normalizeContext(
      context
    );

  const entries =
    getCollectionEntries(
      data,
      normalizedContext.entityType
    );

  return {
    records:
      entries.flatMap(
        ({
          key,
          records
        }) =>
          records.map(
            (record) => ({
              record,
              collectionKey:
                key
            })
          )
      ),

    metadata:
      getDatasetMetadata(
        data
      )
  };
}

function getRecordValue(
  record,
  keys
) {
  for (
    const key of
    keys
  ) {
    if (
      record?.[
        key
      ] !==
        undefined &&
      record?.[
        key
      ] !==
        null &&
      record?.[
        key
      ] !==
        ''
    ) {
      return record[
        key
      ];
    }
  }

  return undefined;
}

/*
 * Envelope context is applied only when the relevant entity type can
 * legitimately inherit that metadata. Record-level values always win.
 */
function applyEnvelopeContext(
  record,
  context,
  {
    allowGovernment =
      false,

    allowState =
      false,

    allowVersion =
      false,

    allowLastVerified =
      false
  } = {}
) {
  const result = {
    ...record
  };

  const metadata =
    context?.metadata ||
    {};

  const supplied = {
    governmentId:
      context?.governmentId ??
      metadata.governmentId,

    stateId:
      context?.stateId ??
      metadata.stateId,

    dataVersion:
      context?.dataVersion ??
      metadata.dataVersion ??
      metadata.version,

    lastVerified:
      context?.lastVerified ??
      metadata.lastVerified
  };

  if (
    allowGovernment &&
    !cleanId(
      result.governmentId
    ) &&
    cleanId(
      supplied.governmentId
    )
  ) {
    result.governmentId =
      cleanId(
        supplied.governmentId
      );
  }

  if (
    allowState &&
    !cleanId(
      result.stateId
    ) &&
    cleanId(
      supplied.stateId
    )
  ) {
    result.stateId =
      cleanId(
        supplied.stateId
      );
  }

  if (
    allowVersion &&
    !cleanNullableString(
      result.dataVersion
    ) &&
    cleanNullableString(
      supplied.dataVersion
    )
  ) {
    result.dataVersion =
      cleanString(
        supplied.dataVersion
      );
  }

  if (
    allowLastVerified &&
    !normalizeDate(
      result.lastVerified
    ) &&
    normalizeDate(
      supplied.lastVerified
    )
  ) {
    result.lastVerified =
      normalizeDate(
        supplied.lastVerified
      );
  }

  return result;
}

function normalizeRecord(
  record,
  {
    entityType =
      ENTITY_TYPES.UNKNOWN,

    context =
      {}
  } = {}
) {
  if (
    !isPlainObject(
      record
    )
  ) {
    return null;
  }

  const withContext =
    applyEnvelopeContext(
      record,
      context,
      {
        allowGovernment:
          DOMAIN_METADATA_TYPES.has(
            entityType
          ),

        allowState:
          DOMAIN_METADATA_TYPES.has(
            entityType
          ),

        allowVersion:
          DATA_VERSION_TYPES.has(
            entityType
          ),

        allowLastVerified:
          LAST_VERIFIED_TYPES.has(
            entityType
          )
      }
    );

  const normalized = {
    ...withContext
  };

  normalized.id =
    cleanId(
      record.id
    );

  normalized.entityType =
    cleanString(
      record.entityType,
      entityType
    );

  if (
    record.name !==
    undefined
  ) {
    normalized.name =
      normalizeLocalizedText(
        record.name
      );
  }

  if (
    record.title !==
    undefined
  ) {
    normalized.title =
      normalizeLocalizedText(
        record.title
      );
  }

  if (
    record.fullForm !==
    undefined
  ) {
    normalized.fullForm =
      cleanNullableString(
        record.fullForm
      );
  }

  normalized.aliases =
    uniqueArray(
      cleanArray(
        record.aliases
      )
        .map(
          (item) =>
            cleanString(
              item,
              ''
            )
        )
        .filter(
          Boolean
        )
    );

  normalized.keywords =
    uniqueArray(
      cleanArray(
        record.keywords
      )
        .map(
          (item) =>
            cleanString(
              item,
              ''
            )
        )
        .filter(
          Boolean
        )
    );

  normalized.governmentId =
    cleanId(
      normalized.governmentId
    );

  normalized.stateId =
    cleanId(
      normalized.stateId
    );

  normalized.departmentId =
    cleanId(
      normalized.departmentId
    );

  normalized.organisationId =
    cleanId(
      normalized.organisationId
    );

  normalized.serviceCadreId =
    cleanId(
      normalized.serviceCadreId
    );

  normalized.examIds =
    normalizeIdArray(
      record.examIds ??
      record.examId
    );

  normalized.jobIds =
    normalizeIdArray(
      record.jobIds ??
      record.jobId
    );

  normalized.departmentIds =
    normalizeIdArray(
      record.departmentIds
    );

  normalized.organisationIds =
    normalizeIdArray(
      record.organisationIds
    );

  normalized.sourceIds =
    normalizeIdArray(
      record.sourceIds
    );

  normalized.sources =
    normalizeSources(
      record.sources
    );

  normalized.requirements =
    normalizeRequirements(
      record.requirements
    );

  if (
    record.createdAt !==
    undefined
  ) {
    normalized.createdAt =
      normalizeDate(
        record.createdAt
      );
  }

  if (
    record.updatedAt !==
    undefined
  ) {
    normalized.updatedAt =
      normalizeDate(
        record.updatedAt
      );
  }

  if (
    record.publicationDate !==
    undefined
  ) {
    normalized.publicationDate =
      normalizeDate(
        record.publicationDate
      );
  }

  if (
    record.effectiveDate !==
    undefined
  ) {
    normalized.effectiveDate =
      normalizeDate(
        record.effectiveDate
      );
  }

  if (
    normalized.lastVerified !==
    undefined
  ) {
    normalized.lastVerified =
      normalizeDate(
        normalized.lastVerified
      );
  }

  if (
    normalized.dataVersion !==
    undefined
  ) {
    normalized.dataVersion =
      cleanString(
        normalized.dataVersion,
        ''
      ) ||
      null;
  }

  return normalized;
}

function normalizeScore10(
  value
) {
  return normalizeNumber(
    value,
    {
      min: 0,
      max: 10
    }
  );
}

function normalizeCurrentness(
  value
) {
  return normalizeEnum(
    value,
    [
      'CURRENT',
      'HISTORICAL',
      'CURRENT_WITH_HISTORICAL_SUPPORT',
      'CURRENTNESS_UNCLEAR',
      'REPLACED',
      'ABOLISHED',
      'NOT_VERIFIED'
    ],
    null
  );
}

function normalizeConfidence(
  value
) {
  return normalizeEnum(
    value,
    [
      'HIGH',
      'MEDIUM_HIGH',
      'MEDIUM',
      'LOW',
      'ESTIMATE',
      'NOT_VERIFIED'
    ],
    null
  );
}

function normalizeJobPost(
  value
) {
  if (
    isPlainObject(
      value
    )
  ) {
    return normalizeLocalizedText(
      value.name ??
      value.postName ??
      value.title ??
      value.designation
    );
  }

  return normalizeLocalizedText(
    value
  );
}

function normalizeJobIdentity(
  job,
  context
) {
  const sourceIdentity =
    isPlainObject(
      job.identity
    )
      ? job.identity
      : {};

  const identity =
    {};

  const governmentId =
    cleanId(
      getRecordValue(
        sourceIdentity,
        [
          'governmentId'
        ]
      ) ??
      job.governmentId ??
      context.governmentId
    );

  if (
    governmentId
  ) {
    identity.governmentId =
      governmentId;
  }

  const stateId =
    cleanId(
      getRecordValue(
        sourceIdentity,
        [
          'stateId'
        ]
      ) ??
      job.stateId ??
      context.stateId
    );

  if (
    stateId
  ) {
    identity.stateId =
      stateId;
  }

  for (
    const field of [
      'departmentId',
      'organisationId',
      'serviceCadreId',
      'parentPostId'
    ]
  ) {
    const value =
      cleanId(
        sourceIdentity[
          field
        ] ??
        job[
          field
        ]
      );

    if (
      value
    ) {
      identity[
        field
      ] =
        value;
    }
  }

  const post =
    sourceIdentity.post ??
    job.post ??
    job.postName ??
    job.designation;

  if (
    post !==
      undefined &&
    post !==
      null
  ) {
    identity.post =
      normalizeJobPost(
        post
      );
  }

  const abbreviation =
    sourceIdentity.abbreviation ??
    (
      isPlainObject(
        job.post
      )
        ? job.post.abbreviation
        : job.abbreviation
    );

  if (
    cleanNullableString(
      abbreviation
    )
  ) {
    identity.abbreviation =
      cleanString(
        abbreviation
      );
  }

  if (
    cleanNullableString(
      sourceIdentity.roleType ??
      job.roleType
    )
  ) {
    identity.roleType =
      cleanString(
        sourceIdentity.roleType ??
        job.roleType
      );
  }

  return identity;
}

function normalizeRecruitmentMode(
  value
) {
  return normalizeEnum(
    value,
    [
      'DIRECT_RECRUITMENT',
      'PROMOTION',
      'DEPUTATION',
      'TRANSFER',
      'CONTRACT',
      'TEMPORARY',
      'SCHEME_PROJECT',
      'OUTSOURCED',
      'ABSORPTION',
      'LATERAL_ENTRY',
      'DEPARTMENTAL',
      'OTHER'
    ],
    null
  );
}

function normalizeJobRecruitment(
  job
) {
  const source =
    isPlainObject(
      job.recruitment
    )
      ? job.recruitment
      : {};

  const recruitment =
    {};

  const routeIds =
    normalizeIdArray(
      source.routeIds ??
      job.routeIds ??
      job.recruitmentRouteIds
    );

  if (
    routeIds.length
  ) {
    recruitment.routeIds =
      routeIds;
  } else {
    const route =
      cleanNullableString(
        job.recruitmentRoute
      );

    if (
      route
    ) {
      recruitment.routeIds = [
        route
      ];
    }
  }

  const examIds =
    normalizeIdArray(
      source.examIds ??
      job.examIds ??
      job.examId
    );

  if (
    examIds.length
  ) {
    recruitment.examIds =
      examIds;
  }

  const recruitmentIds =
    normalizeIdArray(
      source.recruitmentIds ??
      job.recruitmentIds ??
      job.recruitmentId
    );

  if (
    recruitmentIds.length
  ) {
    recruitment.recruitmentIds =
      recruitmentIds;
  }

  const mode =
    normalizeRecruitmentMode(
      source.mode ??
      source.recruitmentMode ??
      job.recruitmentMode
    );

  if (
    mode
  ) {
    recruitment.mode =
      mode;
  }

  const careerStatus =
    normalizeEnum(
      source.careerStatus ??
      job.careerStatus,
      [
        'ACTIVE_CAREER',
        'HISTORICAL',
        'ABOLISHED',
        'REPLACED',
        'SUPERSEDED',
        'NOT_VERIFIED',
        'UNKNOWN'
      ],
      null
    );

  if (
    careerStatus
  ) {
    recruitment.careerStatus =
      careerStatus;
  }

  if (
    typeof source.freshEntryEligible ===
    'boolean'
  ) {
    recruitment.freshEntryEligible =
      source.freshEntryEligible;
  } else if (
    typeof job.freshEntryEligible ===
    'boolean'
  ) {
    recruitment.freshEntryEligible =
      job.freshEntryEligible;
  }

  const currentStatus =
    cleanNullableString(
      source.currentRecruitmentStatus ??
      job.currentRecruitmentStatus
    );

  if (
    currentStatus
  ) {
    const normalizedStatus =
      normalizeStringEnumOrNull(
        currentStatus,
        [
          'OPEN',
          'NOTIFIED',
          'RECURRING_ROUTE',
          'CLOSED',
          'NOT_CURRENTLY_NOTIFIED',
          'HISTORICAL',
          'UNKNOWN'
        ]
      );

    if (
      normalizedStatus
    ) {
      recruitment.currentRecruitmentStatus =
        normalizedStatus;
    }
  }

  if (
    isPlainObject(
      source.recruitmentNotes
    )
  ) {
    recruitment.recruitmentNotes =
      cleanLocalizedText(
        source.recruitmentNotes
      );
  }

  return recruitment;
}

function normalizeEducationLevel(
  value
) {
  return normalizeEnum(
    value,
    JOB_EDUCATION_LEVELS,
    null
  );
}

function normalizeBaEnglishAssessment(
  value
) {
  return normalizeEnum(
    value,
    [
      'DIRECT',
      'CONDITIONAL',
      'NOT_ELIGIBLE',
      'CURRENT_NOTIFICATION_REQUIRED',
      'NOT_VERIFIED',
      'NOT_APPLICABLE'
    ],
    null
  );
}

function normalizeJobEligibility(
  job
) {
  const source =
    isPlainObject(
      job.eligibility
    )
      ? job.eligibility
      : {};

  const eligibility =
    {};

  const educationLevel =
    normalizeEducationLevel(
      source.educationLevel ??
      job.educationLevel ??
      job.entryLevel
    );

  if (
    educationLevel
  ) {
    eligibility.educationLevel =
      educationLevel;
  }

  const minimumQualification =
    cleanNullableString(
      source.minimumQualification ??
      job.minimumQualification ??
      job.minimumQualificationSummary
    );

  if (
    minimumQualification
  ) {
    eligibility.minimumQualification =
      minimumQualification;
  }

  const minimumQualificationId =
    cleanId(
      source.minimumQualificationId ??
      job.minimumQualificationId
    );

  if (
    minimumQualificationId
  ) {
    eligibility.minimumQualificationId =
      minimumQualificationId;
  }

  const qualificationIds =
    normalizeIdArray(
      source.qualificationIds ??
      job.qualificationIds
    );

  if (
    qualificationIds.length
  ) {
    eligibility.qualificationIds =
      qualificationIds;
  }

  const ruleIds =
    normalizeIdArray(
      source.ruleIds ??
      job.eligibilityRuleIds
    );

  if (
    ruleIds.length
  ) {
    eligibility.ruleIds =
      ruleIds;
  }

  const baEnglishAssessment =
    normalizeBaEnglishAssessment(
      source.baEnglishAssessment ??
      job.baEnglishAssessment
    );

  if (
    baEnglishAssessment
  ) {
    eligibility.baEnglishAssessment =
      baEnglishAssessment;
  }

  const overqualification =
    normalizeStringEnumOrNull(
      source.overqualification ??
      job.overqualification,
      [
        'HIGHER_QUALIFICATION_ALLOWED',
        'HIGHER_QUALIFICATION_NOT_ADDRESSED',
        'HIGHER_QUALIFICATION_RESTRICTED',
        'EXACT_QUALIFICATION_REQUIRED',
        'CURRENT_NOTIFICATION_REQUIRED',
        'NOT_APPLICABLE',
        'NOT_VERIFIED'
      ]
    );

  if (
    overqualification
  ) {
    eligibility.overqualification =
      overqualification;
  }

  if (
    source.eligibilitySummary !==
      undefined
  ) {
    eligibility.eligibilitySummary =
      cleanLocalizedText(
        source.eligibilitySummary
      );
  }

  if (
    source.notes !==
      undefined
  ) {
    eligibility.notes =
      cleanLocalizedText(
        source.notes
      );
  }

  /*
   * Legacy baEligibility/baEnglishEligibility deliberately stays outside the
   * canonical eligibility object. It cannot be converted into ruleIds.
   */
  return eligibility;
}

function copyScoreFields(
  source,
  target
) {
  for (
    const field of
    SCORE_FIELDS
  ) {
    const value =
      normalizeScore10(
        source?.[
          field
        ]
      );

    if (
      value !==
      null
    ) {
      target[
        field
      ] =
        value;
    }
  }
}

function normalizeDeskField(
  value
) {
  const normalized =
    cleanString(
      value,
      ''
    )
      .toUpperCase();

  const mappings = {
    OFFICE:
      'MOSTLY_OFFICE',

    MOSTLY_OFFICE:
      'MOSTLY_OFFICE',

    OFFICE_AND_FIELD:
      'OFFICE_PLUS_FIELD',

    OFFICE_PLUS_FIELD:
      'OFFICE_PLUS_FIELD',

    FIELD:
      'MOSTLY_FIELD',

    MOSTLY_FIELD:
      'MOSTLY_FIELD',

    OPERATIONAL:
      'OPERATIONAL',

    MIXED:
      'MIXED',

    NOT_VERIFIED:
      'NOT_VERIFIED'
  };

  return (
    mappings[
      normalized
    ] ||
    null
  );
}

function normalizeLifestyle(
  job
) {
  const source =
    isPlainObject(
      job.lifestyle
    )
      ? job.lifestyle
      : {};

  const lifestyle =
    {};

  const deskField =
    normalizeDeskField(
      source.deskField ??
      job.work?.deskField
    );

  if (
    deskField
  ) {
    lifestyle.deskField =
      deskField;
  }

  const scoreAliases = [
    [
      'workLifeScore',
      'workLife'
    ],
    [
      'stressBurden',
      'stress'
    ],
    [
      'riskBurden',
      'physicalRisk'
    ],
    [
      'travelBurden',
      'travelBurden'
    ],
    [
      'publicInteractionScore',
      'publicInteractionScore'
    ],
    [
      'computerWorkScore',
      'computerWorkScore'
    ],
    [
      'legalWorkScore',
      'legalWorkScore'
    ],
    [
      'accountsWorkScore',
      'accountsWorkScore'
    ],
    [
      'investigationScore',
      'investigationScore'
    ],
    [
      'inspectionScore',
      'inspectionScore'
    ],
    [
      'supervisionScore',
      'supervisionScore'
    ],
    [
      'predictabilityScore',
      'predictabilityScore'
    ],
    [
      'nightDutyBurden',
      'nightDutyBurden'
    ],
    [
      'shiftDutyBurden',
      'shiftDutyBurden'
    ],
    [
      'holidayDutyBurden',
      'holidayDutyBurden'
    ],
    [
      'emergencyDutyBurden',
      'emergencyDutyBurden'
    ],
    [
      'courtDutyBurden',
      'courtDutyBurden'
    ],
    [
      'uniformScore',
      'uniformScore'
    ]
  ];

  for (
    const [
      targetKey,
      sourceKey
    ] of scoreAliases
  ) {
    const value =
      normalizeScore10(
        source[
          targetKey
        ] ??
        job[
          sourceKey
        ]
      );

    if (
      value !==
      null
    ) {
      lifestyle[
        targetKey
      ] =
        value;
    }
  }

  const statusFields = [
    [
      'uniformStatus',
      'uniformStatus'
    ],
    [
      'nightDutyStatus',
      'nightDutyStatus'
    ],
    [
      'shiftDutyStatus',
      'shiftDutyStatus'
    ],
    [
      'holidayDutyStatus',
      'holidayDutyStatus'
    ],
    [
      'emergencyDutyStatus',
      'emergencyDutyStatus'
    ]
  ];

  const allowed = {
    uniformStatus: [
      'REQUIRED',
      'NOT_REQUIRED',
      'POST_DEPENDENT',
      'OPERATIONAL',
      'UNKNOWN',
      'NOT_APPLICABLE'
    ],

    nightDutyStatus: [
      'NONE',
      'RARE',
      'OCCASIONAL',
      'REGULAR',
      'SHIFT_BASED',
      'EMERGENCY_ONLY',
      'POST_DEPENDENT',
      'UNKNOWN'
    ],

    shiftDutyStatus: [
      'NONE',
      'RARE',
      'OCCASIONAL',
      'REGULAR',
      'SHIFT_BASED',
      'POST_DEPENDENT',
      'UNKNOWN'
    ],

    holidayDutyStatus: [
      'NONE',
      'RARE',
      'OCCASIONAL',
      'REGULAR',
      'EMERGENCY_ONLY',
      'POST_DEPENDENT',
      'UNKNOWN'
    ],

    emergencyDutyStatus: [
      'NONE',
      'RARE',
      'OCCASIONAL',
      'REGULAR',
      'EMERGENCY_ONLY',
      'POST_DEPENDENT',
      'UNKNOWN'
    ]
  };

  for (
    const [
      targetKey,
      sourceKey
    ] of statusFields
  ) {
    const value =
      normalizeStringEnumOrNull(
        source[
          sourceKey
        ] ??
        job[
          sourceKey
        ] ??
        job.work?.[
          sourceKey
        ],
        allowed[
          targetKey
        ]
      );

    if (
      value
    ) {
      lifestyle[
        targetKey
      ] =
        value;
    }
  }

  return lifestyle;
}

function normalizeAnalysis(
  job
) {
  const source =
    isPlainObject(
      job.analysis
    )
      ? job.analysis
      : {};

  const analysis =
    {};

  copyScoreFields(
    source,
    analysis
  );

  copyScoreFields(
    job,
    analysis
  );

  const englishAdvantage =
    normalizeStringEnumOrNull(
      source.englishAdvantage ??
      job.englishAdvantage,
      [
        'STRONG',
        'MODERATE',
        'NEUTRAL',
        'MINOR_DISADVANTAGE',
        'NOT_ELIGIBLE',
        'NOT_APPLICABLE',
        'NOT_VERIFIED'
      ]
    );

  if (
    englishAdvantage
  ) {
    analysis.englishAdvantage =
      englishAdvantage;
  }

  if (
    source.analyticalNotes !==
      undefined
  ) {
    analysis.analyticalNotes =
      cleanLocalizedText(
        source.analyticalNotes
      );
  }

  return analysis;
}

function normalizeJob(
  job,
  context = {}
) {
  const base =
    normalizeRecord(
      job,
      {
        entityType:
          ENTITY_TYPES.JOB,
        context
      }
    );

  if (
    !base
  ) {
    return null;
  }

  const canonical = {
    id:
      base.id,

    entityType:
      ENTITY_TYPES.JOB,

    identity:
      normalizeJobIdentity(
        base,
        context
      ),

    recruitment:
      normalizeJobRecruitment(
        base
      ),

    eligibility:
      normalizeJobEligibility(
        base
      ),

    lifestyle:
      normalizeLifestyle(
        base
      ),

    analysis:
      normalizeAnalysis(
        base
      ),

    sourceIds:
      normalizeIdArray(
        base.sourceIds
      )
  };

  const profileMappings = [
    [
      'payProfileId',
      [
        base.payProfileId,
        base.pay?.payProfileId,
        base.pay?.payId
      ]
    ],
    [
      'locationProfileId',
      [
        base.locationProfileId,
        base.posting?.locationProfileId
      ]
    ],
    [
      'housingProfileId',
      [
        base.housingProfileId,
        base.housing?.housingProfileId
      ]
    ],
    [
      'promotionProfileId',
      [
        base.promotionProfileId,
        base.promotion?.promotionProfileId
      ]
    ],
    [
      'benefitProfileId',
      [
        base.benefitProfileId,
        base.benefits?.benefitProfileId,
        base.benefits?.benefitsProfileId
      ]
    ]
  ];

  for (
    const [
      field,
      values
    ] of profileMappings
  ) {
    const value =
      values
        .map(
          (item) =>
            cleanId(
              item
            )
        )
        .find(
          Boolean
        );

    if (
      value
    ) {
      canonical[
        field
      ] =
        value;
    }
  }

  const confidence =
    normalizeConfidence(
      base.confidence
    );

  if (
    confidence
  ) {
    canonical.confidence =
      confidence;
  }

  const currentness =
    normalizeCurrentness(
      base.currentness
    );

  if (
    currentness
  ) {
    canonical.currentness =
      currentness;
  }

  const lastVerified =
    normalizeDate(
      base.lastVerified
    );

  if (
    lastVerified
  ) {
    canonical.lastVerified =
      lastVerified;
  }

  if (
    cleanNullableString(
      base.dataVersion
    )
  ) {
    canonical.dataVersion =
      cleanString(
        base.dataVersion
      );
  }

  /*
   * Compatibility metadata remains non-authoritative. It is intentionally
   * kept outside canonical eligibility and never becomes a rule relationship.
   */
  const legacyBaEligibility =
    getRecordValue(
      base,
      [
        'baEligibility',
        'baEnglishEligibility'
      ]
    );

  if (
    cleanNullableString(
      legacyBaEligibility
    )
  ) {
    canonical.legacyBaEligibility =
      cleanString(
        legacyBaEligibility
      );
  }

  const legacyStatus =
    cleanNullableString(
      base.currentStatus
    );

  if (
    legacyStatus
  ) {
    canonical.legacyCurrentStatus =
      legacyStatus;
  }

  /*
   * Keep the stable jobId compatibility property used by older runtime
   * consumers without allowing it to become a separate relational key.
   */
  canonical.jobId =
    canonical.id;

  canonical.searchText =
    buildSearchText(
      canonical,
      [
        base.id,
        base.postName,
        base.officialName,
        base.shortName,
        base.category,
        base.jobCategory,
        base.aliases,
        base.keywords,
        canonical.identity.post,
        legacyStatus,
        legacyBaEligibility
      ]
    );

  return canonical;
}

function normalizeExam(
  exam,
  context = {}
) {
  const result =
    normalizeRecord(
      exam,
      {
        entityType:
          ENTITY_TYPES.EXAM,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  const canonical = {
    ...result,

    entityType:
      ENTITY_TYPES.EXAM
  };

  canonical.examId =
    canonical.id;

  canonical.status =
    normalizeStringEnumOrNull(
      result.status,
      [
        'OPEN',
        'CLOSED',
        'UNDER_PROCESS',
        'RECENTLY_COMPLETED',
        'EXPECTED_PERIODIC',
        'IRREGULAR',
        'HISTORICAL',
        'DISCONTINUED',
        'UNKNOWN'
      ]
    ) ??
    result.status;

  canonical.difficulty =
    normalizeStringEnumOrNull(
      result.difficulty,
      [
        'EASY',
        'MODERATE',
        'HARD',
        'VERY_HARD',
        'EXTREME',
        'UNKNOWN'
      ]
    ) ??
    result.difficulty;

  canonical.year =
    normalizeNumber(
      result.year,
      {
        integer:
          true
      }
    );

  canonical.qualificationLevelIds =
    normalizeIdArray(
      result.qualificationLevelIds
    );

  canonical.qualificationIds =
    normalizeIdArray(
      result.qualificationIds
    );

  canonical.postIds =
    normalizeIdArray(
      result.postIds ??
      result.jobIds
    );

  canonical.jobIds =
    normalizeIdArray(
      result.jobIds ??
      result.postIds
    );

  canonical.sourceIds =
    normalizeIdArray(
      result.sourceIds
    );

  canonical.searchText =
    buildSearchText(
      canonical
    );

  return canonical;
}

function normalizeDepartment(
  department,
  context = {}
) {
  const result =
    normalizeRecord(
      department,
      {
        entityType:
          ENTITY_TYPES.DEPARTMENT,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  return {
    ...result,

    entityType:
      ENTITY_TYPES.DEPARTMENT,

    departmentId:
      result.id,

    status:
      normalizeStringEnumOrNull(
        result.status,
        [
          'ACTIVE',
          'HISTORICAL',
          'RENAMED',
          'MERGED',
          'REORGANISED',
          'ABOLISHED',
          'UNKNOWN'
        ]
      ) ??
      result.status,

    searchText:
      buildSearchText(
        result
      )
  };
}

function normalizeOrganisation(
  organisation,
  context = {}
) {
  const result =
    normalizeRecord(
      organisation,
      {
        entityType:
          ENTITY_TYPES.ORGANISATION,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  return {
    ...result,

    entityType:
      ENTITY_TYPES.ORGANISATION,

    organisationId:
      result.id,

    type:
      cleanString(
        result.type,
        UNKNOWN
      ),

    searchText:
      buildSearchText(
        result
      )
  };
}

function normalizeServiceType(
  value,
  serviceNature
) {
  const direct =
    normalizeStringEnumOrNull(
      value,
      CANONICAL_SERVICE_TYPES
    );

  if (
    direct
  ) {
    return direct;
  }

  const nature =
    cleanString(
      serviceNature,
      ''
    )
      .toUpperCase();

  return (
    SERVICE_TYPE_BY_NATURE[
      nature
    ] ||
    null
  );
}

function normalizeCadreScope(
  value
) {
  if (
    !isPlainObject(
      value
    )
  ) {
    return null;
  }

  const result =
    {};

  const scopeType =
    normalizeStringEnumOrNull(
      value.scopeType,
      [
        'STATE',
        'ALL_INDIA',
        'REGION',
        'ZONE',
        'DISTRICT',
        'DEPARTMENT',
        'ORGANISATION',
        'JOINT',
        'OTHER',
        'UNKNOWN'
      ]
    );

  if (
    scopeType
  ) {
    result.scopeType =
      scopeType;
  }

  const stateIds =
    normalizeIdArray(
      value.stateIds
    );

  if (
    stateIds.length
  ) {
    result.stateIds =
      stateIds;
  }

  const regionNames =
    uniqueArray(
      cleanArray(
        value.regionNames
      )
        .map(
          (item) =>
            cleanString(
              item,
              ''
            )
        )
        .filter(
          Boolean
        )
    );

  if (
    regionNames.length
  ) {
    result.regionNames =
      regionNames;
  }

  const districtNames =
    uniqueArray(
      cleanArray(
        value.districtNames
      )
        .map(
          (item) =>
            cleanString(
              item,
              ''
            )
        )
        .filter(
          Boolean
        )
    );

  if (
    districtNames.length
  ) {
    result.districtNames =
      districtNames;
  }

  if (
    value.description !==
    undefined
  ) {
    result.description =
      cleanLocalizedText(
        value.description
      );
  }

  return result;
}

function normalizePostingScope(
  value
) {
  if (
    !isPlainObject(
      value
    )
  ) {
    return null;
  }

  const result =
    {};

  const scopeType =
    normalizeStringEnumOrNull(
      value.scopeType,
      [
        'STATE_WIDE',
        'ALL_INDIA',
        'REGIONAL',
        'ZONE',
        'DISTRICT',
        'CITY',
        'DEPARTMENTAL',
        'ORGANISATION_SPECIFIC',
        'OTHER',
        'UNKNOWN'
      ]
    );

  if (
    scopeType
  ) {
    result.scopeType =
      scopeType;
  }

  const locationIds =
    normalizeIdArray(
      value.locationIds
    );

  if (
    locationIds.length
  ) {
    result.locationIds =
      locationIds;
  }

  const stateIds =
    normalizeIdArray(
      value.stateIds
    );

  if (
    stateIds.length
  ) {
    result.stateIds =
      stateIds;
  }

  if (
    value.description !==
    undefined
  ) {
    result.description =
      cleanLocalizedText(
        value.description
      );
  }

  return result;
}

function normalizeServiceCadre(
  serviceCadre,
  context = {}
) {
  const result =
    normalizeRecord(
      serviceCadre,
      {
        entityType:
          ENTITY_TYPES.SERVICE_CADRE,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  const canonical = {
    ...result,

    entityType:
      ENTITY_TYPES.SERVICE_CADRE,

    name:
      normalizeLocalizedText(
        result.name
      )
  };

  if (
    result.shortName !==
    undefined
  ) {
    canonical.shortName =
      normalizeLocalizedText(
        result.shortName
      );
  }

  canonical.governmentId =
    cleanId(
      result.governmentId ??
      context.governmentId
    );

  canonical.stateId =
    cleanId(
      result.stateId
    );

  for (
    const field of [
      'ministryId',
      'departmentId',
      'organisationId',
      'parentServiceCadreId'
    ]
  ) {
    const value =
      cleanId(
        result[
          field
        ]
      );

    if (
      value
    ) {
      canonical[
        field
      ] =
        value;
    }
  }

  const type =
    normalizeServiceType(
      result.type,
      result.serviceNature
    );

  if (
    type
  ) {
    canonical.type =
      type;
  }

  const arrays = [
    'postIds',
    'examIds',
    'recruitmentIds',
    'recruitmentRouteIds',
    'eligibilityRuleIds',
    'payIds',
    'promotionIds',
    'benefitIds',
    'locationIds',
    'sourceIds'
  ];

  for (
    const field of
    arrays
  ) {
    const values =
      normalizeIdArray(
        result[
          field
        ]
      );

    if (
      values.length
    ) {
      canonical[
        field
      ] =
        values;
    }
  }

  const postingScope =
    normalizePostingScope(
      result.postingScope
    );

  if (
    postingScope
  ) {
    canonical.postingScope =
      postingScope;
  }

  const cadreScope =
    normalizeCadreScope(
      result.cadreScope
    );

  if (
    cadreScope
  ) {
    canonical.cadreScope =
      cadreScope;
  }

  if (
    Array.isArray(
      result.entryRoutes
    )
  ) {
    canonical.entryRoutes =
      result.entryRoutes
        .filter(
          isPlainObject
        )
        .map(
          (route) => {
            const normalized =
              {};

            const routeType =
              normalizeStringEnumOrNull(
                route.routeType,
                [
                  'DIRECT_RECRUITMENT',
                  'PROMOTION',
                  'DEPUTATION',
                  'LATERAL_ENTRY',
                  'DEPARTMENTAL',
                  'ABSORPTION',
                  'TRANSFER',
                  'CONTRACTUAL',
                  'TEMPORARY',
                  'OTHER'
                ]
              );

            if (
              routeType
            ) {
              normalized.routeType =
                routeType;
            }

            for (
              const field of [
                'examIds',
                'recruitmentIds'
              ]
            ) {
              const ids =
                normalizeIdArray(
                  route[
                    field
                  ]
                );

              if (
                ids.length
              ) {
                normalized[
                  field
                ] =
                  ids;
              }
            }

            if (
              route.description !==
              undefined
            ) {
              normalized.description =
                cleanLocalizedText(
                  route.description
                );
            }

            return normalized;
          }
        );
  }

  const sourceReferences =
    normalizeSources(
      result.sourceReferences
    );

  if (
    sourceReferences.length
  ) {
    canonical.sourceReferences =
      sourceReferences;
  }

  canonical.sourceIds =
    normalizeIdArray(
      result.sourceIds
    );

  const confidence =
    normalizeConfidence(
      result.confidence
    );

  if (
    confidence
  ) {
    canonical.confidence =
      confidence;
  }

  if (
    cleanNullableString(
      result.version
    )
  ) {
    canonical.version =
      cleanString(
        result.version
      );
  }

  const status =
    normalizeStringEnumOrNull(
      result.status,
      [
        'ACTIVE',
        'HISTORICAL',
        'RENAMED',
        'MERGED',
        'REORGANISED',
        'ABOLISHED',
        'UNKNOWN'
      ]
    );

  if (
    status
  ) {
    canonical.status =
      status;
  }

  return canonical;
}

function mapRuleTarget(
  rule
) {
  const explicitType =
    cleanNullableString(
      rule.targetType
    );

  const explicitId =
    cleanId(
      rule.targetId
    );

  if (
    explicitType &&
    explicitId
  ) {
    return {
      targetType:
        explicitType,

      targetId:
        explicitId
    };
  }

  const candidates = [
    [
      'JOB',
      rule.jobId
    ],
    [
      'JOB',
      rule.targetJobId
    ],
    [
      'EXAM',
      rule.examId
    ],
    [
      'SERVICE_CADRE',
      rule.serviceCadreId
    ],
    [
      'SERVICE_CADRE',
      rule.targetServiceCadreId
    ],
    [
      'RECRUITMENT',
      rule.recruitmentId
    ],
    [
      'RECRUITMENT',
      rule.targetRecruitmentId
    ]
  ];

  for (
    const [
      targetType,
      targetId
    ] of candidates
  ) {
    const id =
      cleanId(
        targetId
      );

    if (
      id
    ) {
      return {
        targetType,
        targetId:
          id
      };
    }
  }

  return {};
}

function normalizeRuleClass(
  rule
) {
  const explicit =
    normalizeStringEnumOrNull(
      rule.ruleClass,
      [
        'HARD',
        'SOFT'
      ]
    );

  if (
    explicit
  ) {
    return explicit;
  }

  const ruleType =
    cleanString(
      rule.ruleType,
      ''
    )
      .toUpperCase();

  if (
    ruleType.includes(
      'HARD'
    )
  ) {
    return 'HARD';
  }

  if (
    ruleType.includes(
      'SOFT'
    )
  ) {
    return 'SOFT';
  }

  return null;
}

function normalizeConditionType(
  rule
) {
  const explicit =
    normalizeStringEnumOrNull(
      rule.conditionType,
      ELIGIBILITY_RULE_CONDITION_TYPES
    );

  if (
    explicit
  ) {
    return explicit;
  }

  const subjectField =
    cleanString(
      rule.subject?.field,
      ''
    ).toLowerCase();

  const ruleType =
    cleanString(
      rule.ruleType,
      ''
    ).toLowerCase();

  const mappings = [
    [
      /qualification|qualifications/,
      'QUALIFICATION'
    ],
    [
      /education/,
      'EDUCATION_LEVEL'
    ],
    [
      /physical/,
      'PHYSICAL_STANDARD'
    ],
    [
      /medical/,
      'MEDICAL_STANDARD'
    ],
    [
      /age/,
      'AGE'
    ],
    [
      /language/,
      'LANGUAGE'
    ],
    [
      /citizenship/,
      'CITIZENSHIP'
    ],
    [
      /domicile/,
      'DOMICILE'
    ],
    [
      /reservation/,
      'RESERVATION'
    ],
    [
      /category/,
      'CATEGORY'
    ],
    [
      /gender/,
      'GENDER'
    ],
    [
      /experience/,
      'EXPERIENCE'
    ],
    [
      /typing/,
      'TYPING'
    ],
    [
      /shorthand/,
      'SHORTHAND'
    ],
    [
      /driving.*licen[cs]e|licen[cs]e/,
      'DRIVING_LICENCE'
    ],
    [
      /computer/,
      'COMPUTER_KNOWLEDGE'
    ]
  ];

  const combined =
    `${subjectField} ${ruleType}`;

  for (
    const [
      pattern,
      value
    ] of mappings
  ) {
    if (
      pattern.test(
        combined
      )
    ) {
      return value;
    }
  }

  return null;
}

function normalizeEligibilityRule(
  rule,
  context = {}
) {
  const result =
    normalizeRecord(
      rule,
      {
        entityType:
          ENTITY_TYPES.ELIGIBILITY_RULE,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  const target =
    mapRuleTarget(
      result
    );

  const canonical = {
    id:
      result.id,

    entityType:
      ENTITY_TYPES.ELIGIBILITY_RULE,

    name:
      normalizeLocalizedText(
        result.name
      )
  };

  if (
    result.description !==
    undefined
  ) {
    canonical.description =
      cleanLocalizedText(
        result.description
      );
  }

  if (
    target.targetType
  ) {
    const normalizedTargetType =
      normalizeStringEnumOrNull(
        target.targetType,
        [
          'JOB',
          'EXAM',
          'SERVICE_CADRE',
          'RECRUITMENT'
        ]
      );

    if (
      normalizedTargetType
    ) {
      canonical.targetType =
        normalizedTargetType;
    }
  }

  if (
    target.targetId
  ) {
    canonical.targetId =
      target.targetId;
  }

  const ruleClass =
    normalizeRuleClass(
      result
    );

  if (
    ruleClass
  ) {
    canonical.ruleClass =
      ruleClass;
  }

  const conditionType =
    normalizeConditionType(
      result
    );

  if (
    conditionType
  ) {
    canonical.conditionType =
      conditionType;
  }

  const operator =
    normalizeStringEnumOrNull(
      result.operator,
      [
        'EQ',
        'NEQ',
        'GT',
        'GTE',
        'LT',
        'LTE',
        'IN',
        'NOT_IN',
        'HAS',
        'NOT_HAS',
        'ALL_OF',
        'ANY_OF',
        'NONE_OF'
      ]
    );

  if (
    operator
  ) {
    canonical.operator =
      operator;
  }

  if (
    result.value !==
    undefined
  ) {
    canonical.value =
      result.value;
  }

  if (
    isPlainObject(
      result.logic
    )
  ) {
    const logic =
      {};

    const mode =
      normalizeStringEnumOrNull(
        result.logic.mode,
        [
          'ALL_OF',
          'ANY_OF',
          'NONE_OF'
        ]
      );

    if (
      mode
    ) {
      logic.mode =
        mode;
    }

    const ruleIds =
      normalizeIdArray(
        result.logic.ruleIds
      );

    if (
      ruleIds.length
    ) {
      logic.ruleIds =
        ruleIds;
    }

    if (
      Object.keys(
        logic
      ).length
    ) {
      canonical.logic =
        logic;
    }
  } else if (
    typeof result.logic ===
    'string'
  ) {
    const modeMap = {
      ALL:
        'ALL_OF',

      ANY:
        'ANY_OF',

      NONE:
        'NONE_OF',

      ALL_OF:
        'ALL_OF',

      ANY_OF:
        'ANY_OF',

      NONE_OF:
        'NONE_OF'
    };

    const mode =
      modeMap[
        cleanString(
          result.logic,
          ''
        )
          .toUpperCase()
      ];

    if (
      mode
    ) {
      canonical.logic = {
        mode
      };
    }
  }

  const qualificationIds =
    normalizeIdArray(
      result.qualificationIds
    );

  if (
    qualificationIds.length
  ) {
    canonical.qualificationIds =
      qualificationIds;
  }

  const requiredQualificationIds =
    normalizeIdArray(
      result.requiredQualificationIds ??
      result.requiredQualifications
    );

  if (
    requiredQualificationIds.length
  ) {
    canonical.requiredQualificationIds =
      requiredQualificationIds;
  }

  const subjectIds =
    normalizeIdArray(
      result.subjectIds
    );

  if (
    subjectIds.length
  ) {
    canonical.subjectIds =
      subjectIds;
  }

  const requiredSubjectIds =
    normalizeIdArray(
      result.requiredSubjectIds
    );

  if (
    requiredSubjectIds.length
  ) {
    canonical.requiredSubjectIds =
      requiredSubjectIds;
  }

  const directArrayFields = [
    'requiredLanguages',
    'requiredSkills',
    'requiredComputerKnowledge',
    'degreeNames',
    'subjectNames',
    'requiredNationality',
    'categoryRequirement'
  ];

  for (
    const field of
    directArrayFields
  ) {
    const values =
      cleanArray(
        result[
          field
        ]
      )
        .map(
          (item) =>
            cleanString(
              item,
              ''
            )
        )
        .filter(
          Boolean
        );

    if (
      values.length
    ) {
      canonical[
        field
      ] =
        uniqueArray(
          values
        );
    }
  }

  const educationLevel =
    normalizeStringEnumOrNull(
      result.educationLevel,
      [
        'CLASS_8',
        'CLASS_10',
        'CLASS_12',
        'DIPLOMA',
        'UNDERGRADUATE',
        'GRADUATE',
        'POSTGRADUATE',
        'DOCTORAL',
        'PROFESSIONAL',
        'OTHER'
      ]
    );

  if (
    educationLevel
  ) {
    canonical.educationLevel =
      educationLevel;
  }

  const minimumEducationLevel =
    normalizeStringEnumOrNull(
      result.minimumEducationLevel,
      [
        'CLASS_8',
        'CLASS_10',
        'CLASS_12',
        'DIPLOMA',
        'UNDERGRADUATE',
        'GRADUATE',
        'POSTGRADUATE',
        'DOCTORAL',
        'PROFESSIONAL'
      ]
    );

  if (
    minimumEducationLevel
  ) {
    canonical.minimumEducationLevel =
      minimumEducationLevel;
  }

  for (
    const field of [
      'minimumMarks',
      'maximumMarks',
      'minimumPercentage',
      'maximumPercentage',
      'minimumExperienceYears',
      'maximumExperienceYears'
    ]
  ) {
    const value =
      normalizeNumber(
        result[
          field
        ],
        {
          min:
            0
        }
      );

    if (
      value !==
      null
    ) {
      canonical[
        field
      ] =
        value;
    }
  }

  for (
    const field of [
      'minimumAge',
      'maximumAge'
    ]
  ) {
    const value =
      normalizeNumber(
        result[
          field
        ],
        {
          integer:
            true,

          min:
            0
        }
      );

    if (
      value !==
      null
    ) {
      canonical[
        field
      ] =
        value;
    }
  }

  for (
    const field of [
      'ageReferenceDate',
      'sourceDate'
    ]
  ) {
    const value =
      normalizeDate(
        result[
          field
        ]
      );

    if (
      value
    ) {
      canonical[
        field
      ] =
        value;
    }
  }

  if (
    isPlainObject(
      result.subject
    )
  ) {
    const subject =
      {};

    for (
      const [
        key,
        value
      ] of Object.entries(
        result.subject
      )
    ) {
      if (
        key ===
          'field' ||
        key ===
          'profileFieldId'
      ) {
        const cleaned =
          cleanNullableString(
            value
          );

        if (
          cleaned
        ) {
          subject[
            key
          ] =
            cleaned;
        }
      }
    }

    if (
      Object.keys(
        subject
      ).length
    ) {
      canonical.subject =
        subject;
    }
  }

  if (
    result.explanation !==
      undefined &&
    canonical.description ===
      undefined
  ) {
    canonical.description =
      cleanLocalizedText(
        result.explanation
      );
  }

  for (
    const field of [
      'failureStatus',
      'unknownStatus'
    ]
  ) {
    const value =
      cleanNullableString(
        result[
          field
        ]
      );

    if (
      value
    ) {
      canonical[
        field
      ] =
        value;
    }
  }

  const sourceIds =
    normalizeIdArray(
      result.sourceIds
    );

  if (
    sourceIds.length
  ) {
    canonical.sourceIds =
      sourceIds;
  }

  const confidence =
    normalizeConfidence(
      result.confidence
    );

  if (
    confidence
  ) {
    canonical.confidence =
      confidence;
  }

  const status =
    cleanNullableString(
      result.status
    );

  if (
    status
  ) {
    canonical.status =
      status;
  }

  if (
    cleanNullableString(
      result.version
    )
  ) {
    canonical.version =
      cleanString(
        result.version
      );
  }

  const lastVerified =
    normalizeDate(
      result.lastVerified
    );

  if (
    lastVerified
  ) {
    canonical.lastVerified =
      lastVerified;
  }

  if (
    cleanNullableString(
      result.dataVersion
    )
  ) {
    canonical.dataVersion =
      cleanString(
        result.dataVersion
      );
  }

  return canonical;
}

function normalizeRecruitment(
  recruitment,
  context = {}
) {
  const result =
    normalizeRecord(
      recruitment,
      {
        entityType:
          ENTITY_TYPES.RECRUITMENT,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  const canonical = {
    ...result,

    entityType:
      ENTITY_TYPES.RECRUITMENT,

    id:
      result.id,

    sourceIds:
      normalizeIdArray(
        result.sourceIds
      )
  };

  if (
    result.authorityId
  ) {
    canonical.authorityId =
      cleanId(
        result.authorityId
      );
  }

  if (
    result.examId
  ) {
    canonical.examId =
      cleanId(
        result.examId
      );
  }

  const postIds =
    normalizeIdArray(
      result.postIds ??
      result.jobIds
    );

  if (
    postIds.length
  ) {
    canonical.postIds =
      postIds;
  }

  const mode =
    normalizeRecruitmentMode(
      result.mode
    );

  if (
    mode
  ) {
    canonical.mode =
      mode;
  }

  const status =
    normalizeStringEnumOrNull(
      result.status,
      [
        'OPEN',
        'CLOSED',
        'UNDER_PROCESS',
        'RECENTLY_COMPLETED',
        'EXPECTED_PERIODIC',
        'IRREGULAR',
        'HISTORICAL',
        'CANCELLED',
        'NOT_VERIFIED'
      ]
    );

  if (
    status
  ) {
    canonical.status =
      status;
  }

  const currentness =
    normalizeCurrentness(
      result.currentness
    );

  if (
    currentness
  ) {
    canonical.currentness =
      currentness;
  }

  const confidence =
    normalizeConfidence(
      result.confidence
    );

  if (
    confidence
  ) {
    canonical.confidence =
      confidence;
  }

  for (
    const field of [
      'notificationDate',
      'applicationStartDate',
      'applicationEndDate',
      'examDate',
      'resultDate',
      'lastVerified'
    ]
  ) {
    const value =
      normalizeDate(
        result[
          field
        ]
      );

    if (
      value
    ) {
      canonical[
        field
      ] =
        value;
    }
  }

  if (
    cleanNullableString(
      result.dataVersion
    )
  ) {
    canonical.dataVersion =
      cleanString(
        result.dataVersion
      );
  }

  return canonical;
}

function normalizeProfileBase(
  record,
  entityType,
  context
) {
  const result =
    normalizeRecord(
      record,
      {
        entityType,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  const canonical = {
    ...result,

    entityType,

    id:
      cleanId(
        result.id
      ),

    sourceIds:
      normalizeIdArray(
        result.sourceIds
      )
  };

  if (
    result.governmentId
  ) {
    canonical.governmentId =
      cleanId(
        result.governmentId
      );
  }

  if (
    result.stateId
  ) {
    canonical.stateId =
      cleanId(
        result.stateId
      );
  }

  const confidence =
    normalizeConfidence(
      result.confidence
    );

  if (
    confidence
  ) {
    canonical.confidence =
      confidence;
  }

  const lastVerified =
    normalizeDate(
      result.lastVerified
    );

  if (
    lastVerified
  ) {
    canonical.lastVerified =
      lastVerified;
  }

  if (
    cleanNullableString(
      result.dataVersion
    )
  ) {
    canonical.dataVersion =
      cleanString(
        result.dataVersion
      );
  }

  return canonical;
}

function normalizePay(
  pay,
  context = {}
) {
  const canonical =
    normalizeProfileBase(
      pay,
      ENTITY_TYPES.PAY,
      context
    );

  if (
    !canonical
  ) {
    return null;
  }

  for (
    const field of [
      'paySystem',
      'payCommission',
      'payLevel',
      'payScale',
      'officialStatus'
    ]
  ) {
    if (
      cleanNullableString(
        pay[
          field
        ]
      )
    ) {
      canonical[
        field
      ] =
        cleanString(
          pay[
            field
          ]
        );
    }
  }

  for (
    const field of [
      'startingBasic',
      'maximumBasic'
    ]
  ) {
    const value =
      normalizeNumber(
        pay[
          field
        ],
        {
          min:
            0
        }
      );

    if (
      value !==
      null
    ) {
      canonical[
        field
      ] =
        value;
    }
  }

  return canonical;
}

function normalizeLocation(
  location,
  context = {}
) {
  const canonical =
    normalizeProfileBase(
      location,
      ENTITY_TYPES.LOCATION,
      context
    );

  if (
    !canonical
  ) {
    return null;
  }

  if (
    location.name !==
    undefined
  ) {
    canonical.name =
      normalizeLocalizedText(
        location.name
      );
  }

  if (
    location.type !==
    undefined
  ) {
    canonical.type =
      cleanString(
        location.type,
        UNKNOWN
      );
  }

  if (
    location.description !==
    undefined
  ) {
    canonical.description =
      normalizeLocalizedText(
        location.description
      );
  }

  return canonical;
}

function normalizeHousing(
  housing,
  context = {}
) {
  return normalizeProfileBase(
    housing,
    ENTITY_TYPES.HOUSING,
    context
  );
}

function normalizePromotion(
  promotion,
  context = {}
) {
  return normalizeProfileBase(
    promotion,
    ENTITY_TYPES.PROMOTION,
    context
  );
}

function normalizeBenefit(
  benefit,
  context = {}
) {
  return normalizeProfileBase(
    benefit,
    ENTITY_TYPES.BENEFIT,
    context
  );
}

function normalizeGovernment(
  government,
  context = {}
) {
  const result =
    normalizeRecord(
      government,
      {
        entityType:
          ENTITY_TYPES.GOVERNMENT,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  return {
    ...result,

    entityType:
      ENTITY_TYPES.GOVERNMENT,

    id:
      result.id,

    name:
      normalizeLocalizedText(
        result.name
      )
  };
}

function normalizeState(
  state,
  context = {}
) {
  const result =
    normalizeRecord(
      state,
      {
        entityType:
          ENTITY_TYPES.STATE,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  const canonical = {
    ...result,

    entityType:
      ENTITY_TYPES.STATE,

    id:
      result.id,

    name:
      normalizeLocalizedText(
        result.name
      )
  };

  const explicitType =
    normalizeStringEnumOrNull(
      result.type,
      [
        'STATE',
        'UNION_TERRITORY'
      ]
    );

  if (
    explicitType
  ) {
    canonical.type =
      explicitType;
  } else if (
    context.collectionKey ===
    'unionTerritories'
  ) {
    canonical.type =
      'UNION_TERRITORY';
  } else if (
    context.collectionKey ===
    'states'
  ) {
    canonical.type =
      'STATE';
  }

  if (
    typeof result.enabled ===
    'boolean'
  ) {
    canonical.enabled =
      result.enabled;
  }

  const coverage =
    normalizeStringEnumOrNull(
      result.coverage,
      [
        'ACTIVE',
        'PLANNED',
        'RESEARCHING',
        'PARTIAL',
        'TEMPORARILY_DISABLED'
      ]
    );

  if (
    coverage
  ) {
    canonical.coverage =
      coverage;
  }

  canonical.governmentId =
    cleanId(
      result.governmentId
    );

  canonical.sourceIds =
    normalizeIdArray(
      result.sourceIds
    );

  return canonical;
}

const QUALIFICATION_COLLECTION_TYPES =
  Object.freeze({
    academicQualifications:
      'ACADEMIC',

    teacherEducationQualifications:
      'TEACHER_EDUCATION',

    technicalQualifications:
      'TECHNICAL',

    computerQualifications:
      'COMPUTER_IT',

    lawQualifications:
      'LAW',

    medicalQualifications:
      'MEDICAL',

    nursingQualifications:
      'NURSING',

    pharmacyQualifications:
      'PHARMACY',

    engineeringQualifications:
      'ENGINEERING',

    agricultureQualifications:
      'AGRICULTURE',

    paramedicalQualifications:
      'PARAMEDICAL',

    qualifications:
      null
  });

function normalizeQualification(
  qualification,
  context = {}
) {
  const result =
    normalizeRecord(
      qualification,
      {
        entityType:
          ENTITY_TYPES.QUALIFICATION,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  const canonical = {
    ...result,

    entityType:
      ENTITY_TYPES.QUALIFICATION,

    id:
      result.id,

    name:
      normalizeLocalizedText(
        result.name ??
        result.title
      )
  };

  const qualificationType =
    normalizeStringEnumOrNull(
      result.qualificationType,
      [
        'ACADEMIC',
        'PROFESSIONAL',
        'TECHNICAL',
        'TEACHER_EDUCATION',
        'MEDICAL',
        'NURSING',
        'PHARMACY',
        'LAW',
        'COMPUTER_IT',
        'ENGINEERING',
        'AGRICULTURE',
        'PARAMEDICAL',
        'TRADE',
        'LICENCE',
        'REGISTRATION',
        'CERTIFICATION',
        'OTHER'
      ]
    ) ||
    QUALIFICATION_COLLECTION_TYPES[
      context.collectionKey
    ] ||
    null;

  if (
    qualificationType
  ) {
    canonical.qualificationType =
      qualificationType;
  }

  const educationLevel =
    normalizeEducationLevel(
      result.educationLevel
    );

  if (
    educationLevel
  ) {
    canonical.educationLevel =
      educationLevel;
  }

  for (
    const field of [
      'degreeType',
      'specialisation',
      'tradeId',
      'recognisingAuthority',
      'registrationAuthority',
      'licenceType',
      'minimumDuration'
    ]
  ) {
    if (
      cleanNullableString(
        result[
          field
        ]
      )
    ) {
      canonical[
        field
      ] =
        field ===
          'tradeId'
          ? cleanId(
              result[
                field
              ]
            )
          : cleanString(
              result[
                field
              ]
            );
    }
  }

  if (
    typeof result.registrationRequired ===
    'boolean'
  ) {
    canonical.registrationRequired =
      result.registrationRequired;
  }

  const status =
    normalizeStringEnumOrNull(
      result.status,
      [
        'COMPLETED',
        'FINAL_YEAR',
        'PURSUING',
        'NOT_HELD'
      ]
    );

  if (
    status
  ) {
    canonical.status =
      status;
  }

  if (
    typeof result.isSpecialist ===
    'boolean'
  ) {
    canonical.isSpecialist =
      result.isSpecialist;
  }

  canonical.subjectIds =
    normalizeIdArray(
      result.subjectIds
    );

  canonical.aliases =
    uniqueArray(
      cleanArray(
        result.aliases
      )
        .map(
          (item) =>
            cleanString(
              item,
              ''
            )
        )
        .filter(
          Boolean
        )
    );

  canonical.sourceIds =
    normalizeIdArray(
      result.sourceIds
    );

  const confidence =
    normalizeConfidence(
      result.confidence
    );

  if (
    confidence
  ) {
    canonical.confidence =
      confidence;
  }

  if (
    cleanNullableString(
      result.dataVersion
    )
  ) {
    canonical.dataVersion =
      cleanString(
        result.dataVersion
      );
  }

  return canonical;
}

function normalizeCategory(
  category,
  context = {}
) {
  const result =
    normalizeRecord(
      category,
      {
        entityType:
          ENTITY_TYPES.CATEGORY,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  const canonical = {
    ...result,

    entityType:
      ENTITY_TYPES.CATEGORY,

    id:
      result.id,

    name:
      normalizeLocalizedText(
        result.name ??
        result.label ??
        result.title
      )
  };

  return canonical;
}

function normalizeSource(
  source,
  context = {}
) {
  const result =
    normalizeRecord(
      source,
      {
        entityType:
          ENTITY_TYPES.SOURCE,
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  const canonical = {
    ...result,

    entityType:
      ENTITY_TYPES.SOURCE,

    sourceId:
      result.id,

    sourceIds:
      normalizeIdArray(
        result.sourceIds
      )
  };

  const confidence =
    normalizeConfidence(
      result.confidence
    );

  if (
    confidence
  ) {
    canonical.confidence =
      confidence;
  }

  canonical.sourceTypeId =
    cleanId(
      result.sourceTypeId
    );

  if (
    cleanNullableString(
      result.status
    )
  ) {
    canonical.status =
      cleanString(
        result.status
      );
  }

  if (
    normalizeDate(
      result.publicationDate
    )
  ) {
    canonical.publicationDate =
      normalizeDate(
        result.publicationDate
      );
  }

  canonical.searchText =
    buildSearchText(
      result
    );

  return canonical;
}

function normalizeStatus(
  status,
  context = {}
) {
  const result =
    normalizeRecord(
      status,
      {
        entityType:
          'STATUS',
        context
      }
    );

  if (
    !result
  ) {
    return null;
  }

  const canonical = {
    ...result,

    entityType:
      'STATUS',

    vocabulary:
      context.collectionKey ||
      UNKNOWN
  };

  if (
    !cleanNullableString(
      canonical.id
    )
  ) {
    return null;
  }

  if (
    canonical.label !==
    undefined
  ) {
    canonical.label =
      normalizeLocalizedText(
        canonical.label
      );
  }

  return canonical;
}

function normalizeGeneric(
  record,
  entityType,
  context = {}
) {
  return normalizeRecord(
    record,
    {
      entityType:
        normalizeEntityType(
          entityType
        ),

      context
    }
  );
}

/*
 * Search text intentionally flattens localized/structured values instead of
 * relying on String(object), which would produce [object Object].
 */
function buildSearchText(
  record,
  additionalValues = []
) {
  const values = [
    record?.name,
    record?.title,
    record?.fullForm,
    record?.post,
    record?.postName,
    record?.officialName,
    record?.shortName,
    record?.designation,
    record?.description,
    record?.departmentName,
    record?.organisationName,
    record?.examName,
    record?.serviceName,
    record?.category,
    record?.jobCategory,
    record?.keywords,
    record?.aliases,
    additionalValues
  ];

  const flattened =
    values
      .flat(Infinity)
      .filter(
        (value) =>
          value !==
            undefined &&
          value !==
            null
      );

  return flattened
    .map(
      (value) => {
        if (
          typeof value ===
          'object'
        ) {
          return Object.values(
            value
          )
            .flat(Infinity)
            .filter(
              (item) =>
                item !==
                  undefined &&
                item !==
                  null
            )
            .map(
              String
            )
            .join(' ');
        }

        return String(
          value
        );
      }
    )
    .join(' ')
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

/*
 * Main dispatch remains intentionally explicit. The loader may continue
 * passing only (data, entityType); callers with richer context can pass an
 * object as the second argument without breaking the existing API.
 */
function normalizeByType(
  data,
  entityTypeOrContext
) {
  const context =
    normalizeContext(
      entityTypeOrContext
    );

  const extracted =
    extractCollection(
      data,
      context
    );

  const metadata =
    extracted.metadata;

  return extracted.records
    .map(
      (entry) => {
        const recordContext = {
          ...context,

          metadata,

          collectionKey:
            entry.collectionKey
        };

        switch (
          context.entityType
        ) {
          case ENTITY_TYPES.JOB:
            return normalizeJob(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.EXAM:
            return normalizeExam(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.DEPARTMENT:
            return normalizeDepartment(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.ORGANISATION:
            return normalizeOrganisation(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.SERVICE_CADRE:
            return normalizeServiceCadre(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.ELIGIBILITY_RULE:
            return normalizeEligibilityRule(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.RECRUITMENT:
            return normalizeRecruitment(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.PAY:
            return normalizePay(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.LOCATION:
            return normalizeLocation(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.HOUSING:
            return normalizeHousing(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.PROMOTION:
            return normalizePromotion(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.BENEFIT:
            return normalizeBenefit(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.SOURCE:
            return normalizeSource(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.GOVERNMENT:
            return normalizeGovernment(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.STATE:
            return normalizeState(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.QUALIFICATION:
            return normalizeQualification(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.CATEGORY:
            return normalizeCategory(
              entry.record,
              recordContext
            );

          case 'STATUS':
            return normalizeStatus(
              entry.record,
              recordContext
            );

          default:
            return normalizeGeneric(
              entry.record,
              context.entityType,
              recordContext
            );
        }
      }
    )
    .filter(
      Boolean
    );
}

/*
 * Keep normalizeCollection as a public compatibility utility. It performs
 * entity-aware extraction but intentionally returns a normalized generic
 * record shape; normalizeByType is the canonical specialized entry point.
 */
function normalizeCollection(
  data,
  entityType = ENTITY_TYPES.UNKNOWN,
  context = {}
) {
  const normalizedContext = {
    ...normalizeContext(
      entityType
    ),
    ...context
  };

  const extracted =
    extractCollection(
      data,
      normalizedContext
    );

  return extracted.records
    .map(
      (entry) =>
        normalizeRecord(
          entry.record,
          {
            entityType:
              normalizedContext.entityType,

            context: {
              ...normalizedContext,

              metadata:
                extracted.metadata,

              collectionKey:
                entry.collectionKey
            }
          }
        )
    )
    .filter(
      Boolean
    );
}

export {
  ENTITY_TYPES,
  COLLECTION_WRAPPERS,

  isPlainObject,
  cleanString,
  cleanNullableString,
  cleanArray,
  uniqueArray,
  cleanId,
  normalizeLocalizedText,
  normalizeDate,
  normalizeNumber,
  normalizeBoolean,
  normalizeEnum,
  normalizeIdArray,
  normalizeSources,
  normalizeRequirements,
  normalizeSourceReference,
  normalizeRequirement,
  normalizeRecord,

  getDatasetMetadata,
  getCollectionKeys,
  extractCollection,
  normalizeCollection,

  normalizeJob,
  normalizeExam,
  normalizeDepartment,
  normalizeOrganisation,
  normalizeServiceCadre,
  normalizeEligibilityRule,
  normalizeRecruitment,
  normalizePay,
  normalizeLocation,
  normalizeHousing,
  normalizePromotion,
  normalizeBenefit,
  normalizeGovernment,
  normalizeState,
  normalizeQualification,
  normalizeCategory,
  normalizeSource,
  normalizeGeneric,

  normalizeByType,
  buildSearchText
};

export default {
  normalizeByType,
  normalizeCollection,

  normalizeJob,
  normalizeExam,
  normalizeDepartment,
  normalizeOrganisation,
  normalizeServiceCadre,
  normalizeEligibilityRule,
  normalizeRecruitment,
  normalizePay,
  normalizeLocation,
  normalizeHousing,
  normalizePromotion,
  normalizeBenefit,
  normalizeGovernment,
  normalizeState,
  normalizeQualification,
  normalizeCategory,
  normalizeSource,
  normalizeGeneric
};
