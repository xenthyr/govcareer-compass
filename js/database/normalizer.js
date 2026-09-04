/**
 * GovCareer Compass
 * Canonical Database Normalizer
 *
 * Purpose:
 * - normalize structurally equivalent source representations;
 * - preserve canonical information and legitimate source metadata;
 * - build predictable canonical runtime entities;
 * - keep genuinely unresolved factual relationships unresolved.
 *
 * Architectural boundary:
 * - the loader owns loading, fetching and caching;
 * - this module canonicalizes already-loaded values only;
 * - the validator decides whether the canonical runtime database is valid;
 * - the eligibility engine, not this module, determines candidate eligibility.
 *
 * IMPORTANT:
 * - normalization does not determine candidate eligibility;
 * - normalization does not create government facts;
 * - relational IDs are preserved and never fabricated;
 * - dataset envelopes are extracted explicitly by entity type;
 * - missing factual relationships remain missing for validation/migration;
 * - `baEligibility` / `baEnglishEligibility` is compatibility/research data,
 *   not an eligibility-engine authority;
 * - normalization never performs network or filesystem operations.
 */

const UNKNOWN = 'UNKNOWN';

const ENTITY_TYPES = Object.freeze({
  UNKNOWN:
    'UNKNOWN',

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
    'CATEGORY',

  STATUS:
    'STATUS'
});

/*
 * Wrapper names are deliberately entity-specific. This prevents a common
 * catalogue such as qualifications.json from returning whichever array happens
 * to occur first in the file.
 */
const COLLECTION_WRAPPERS = Object.freeze({
  JOB:
    Object.freeze([
      'jobs',
      'records',
      'data',
      'items'
    ]),

  EXAM:
    Object.freeze([
      'exams',
      'records',
      'data',
      'items'
    ]),

  DEPARTMENT:
    Object.freeze([
      'departments',
      'records',
      'data',
      'items'
    ]),

  ORGANISATION:
    Object.freeze([
      'organisations',
      'organizations',
      'records',
      'data',
      'items'
    ]),

  SERVICE_CADRE:
    Object.freeze([
      'serviceCadres',
      'records',
      'data',
      'items'
    ]),

  ELIGIBILITY_RULE:
    Object.freeze([
      'eligibilityRules',
      'records',
      'data',
      'items'
    ]),

  RECRUITMENT:
    Object.freeze([
      'recruitments',
      'records',
      'data',
      'items'
    ]),

  PAY:
    Object.freeze([
      'payStructures',
      'payProfiles',
      'records',
      'data',
      'items'
    ]),

  LOCATION:
    Object.freeze([
      'locations',
      'locationProfiles',
      'records',
      'data',
      'items'
    ]),

  HOUSING:
    Object.freeze([
      'housingProfiles',
      'housing',
      'records',
      'data',
      'items'
    ]),

  PROMOTION:
    Object.freeze([
      'promotionProfiles',
      'promotion',
      'records',
      'data',
      'items'
    ]),

  BENEFIT:
    Object.freeze([
      'benefitsProfiles',
      'benefitProfiles',
      'benefits',
      'records',
      'data',
      'items'
    ]),

  SOURCE:
    Object.freeze([
      'sources',
      'records',
      'data',
      'items'
    ]),

  GOVERNMENT:
    Object.freeze([
      'governments',
      'records',
      'data',
      'items'
    ]),

  STATE:
    Object.freeze([
      'states',
      'unionTerritories',
      'records',
      'data',
      'items'
    ]),

  QUALIFICATION:
    Object.freeze([
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

  CATEGORY:
    Object.freeze([
      'categories',
      'records',
      'data',
      'items'
    ]),

  STATUS:
    Object.freeze([
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

const LIFESTYLE_SCORE_FIELDS = Object.freeze([
  'publicInteractionScore',
  'computerWorkScore',
  'legalWorkScore',
  'accountsWorkScore',
  'investigationScore',
  'inspectionScore',
  'supervisionScore',
  'workLifeScore',
  'predictabilityScore',
  'stressBurden',
  'riskBurden',
  'nightDutyBurden',
  'shiftDutyBurden',
  'holidayDutyBurden',
  'emergencyDutyBurden',
  'travelBurden',
  'courtDutyBurden',
  'uniformScore'
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
 * These are exact semantic mappings from source serviceNature values that
 * exist in the repository. They are not name-based guesses.
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

const RECRUITMENT_MODES = Object.freeze([
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
]);

const CAREER_STATUSES = Object.freeze([
  'ACTIVE_CAREER',
  'HISTORICAL',
  'ABOLISHED',
  'REPLACED',
  'SUPERSEDED',
  'NOT_VERIFIED',
  'UNKNOWN'
]);

const CURRENTNESS_VALUES = Object.freeze([
  'CURRENT',
  'HISTORICAL',
  'CURRENT_WITH_HISTORICAL_SUPPORT',
  'CURRENTNESS_UNCLEAR',
  'REPLACED',
  'ABOLISHED',
  'NOT_VERIFIED'
]);

const CONFIDENCE_VALUES = Object.freeze([
  'HIGH',
  'MEDIUM_HIGH',
  'MEDIUM',
  'LOW',
  'ESTIMATE',
  'NOT_VERIFIED'
]);

const QUALIFICATION_TYPES = Object.freeze([
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
]);

const QUALIFICATION_COLLECTION_TYPES = Object.freeze({
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

function isPlainObject(
  value
) {
  if (
    value === null ||
    typeof value !==
      'object'
  ) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(
      value
    );

  return (
    prototype ===
      Object.prototype ||
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
      item =>
        item !==
          undefined &&
        item !==
          null
    );
  }

  return [
    value
  ];
}

/*
 * Object-property order must not determine whether two structured values are
 * identical. Array order is deliberately retained.
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
        key =>
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
    item => {
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

/*
 * Unlike normalizeBoolean(), this returns null when the source did not provide
 * a recognized boolean representation. That prevents unknown from becoming
 * false merely because a property is required by the canonical model.
 */
function normalizeOptionalBoolean(
  value
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

  return null;
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

function normalizeEnumIgnoreCase(
  value,
  allowedValues,
  fallback = null
) {
  const normalized =
    cleanString(
      value,
      ''
    ).toUpperCase();

  const match =
    allowedValues.find(
      item =>
        item.toUpperCase() ===
        normalized
    );

  return (
    match ||
    fallback
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
        item =>
          cleanId(
            item
          )
      )
      .filter(Boolean)
  );
}

function normalizeSourceReference(
  source
) {
  if (
    typeof source ===
    'string'
  ) {
    const sourceId =
      cleanId(
        source
      );

    return sourceId
      ? {
          sourceId
        }
      : null;
  }

  if (
    !isPlainObject(
      source
    )
  ) {
    return null;
  }

  const sourceId =
    cleanId(
      source.sourceId ??
      source.id
    );

  if (
    !sourceId
  ) {
    return null;
  }

  const normalized = {
    sourceId
  };

  const note =
    cleanNullableString(
      source.note
    );

  if (
    note
  ) {
    normalized.note =
      note;
  }

  const claim =
    cleanNullableString(
      source.claim
    );

  if (
    claim
  ) {
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
      .filter(Boolean)
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
      id:
        null,

      type:
        'UNSPECIFIED',

      value:
        requirement,

      hard:
        true
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
    .filter(Boolean);
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

    RECRUITMENT_RECORDS:
      ENTITY_TYPES.RECRUITMENT,

    PAY_STRUCTURE:
      ENTITY_TYPES.PAY,

    PAY_STRUCTURES:
      ENTITY_TYPES.PAY,

    PAY_PROFILE:
      ENTITY_TYPES.PAY,

    PAY_PROFILES:
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
      ENTITY_TYPES.CATEGORY,

    STATUSES:
      ENTITY_TYPES.STATUS
  };

  return (
    aliases[
      normalized
    ] ||
    normalized
  );
}

/*
 * Backward-compatible context support:
 *
 * Existing loader:
 *   normalizeByType(data, 'JOB')
 *
 * Context-aware callers:
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
      ...fallbackContext,
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
    key => {
      if (
        data[key] !==
          undefined &&
        data[key] !==
          null &&
        data[key] !==
          ''
      ) {
        metadata[
          key
        ] =
          data[
            key
          ];
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

/*
 * Return every semantically relevant collection for entity types whose source
 * files legitimately contain multiple independent arrays.
 *
 * QUALIFICATION deliberately excludes:
 *   educationLevels
 *   qualificationTypes
 *   itiTrades
 *   other non-qualification vocabularies
 *
 * STATE keeps states and unionTerritories as separate collection entries.
 *
 * STATUS keeps each vocabulary identifiable through collectionKey.
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
        key:
          null,

        records:
          data
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
    ENTITY_TYPES.QUALIFICATION
  ) {
    const entries =
      [];

    for (
      const key of
      getCollectionKeys(
        normalizedType
      )
    ) {
      if (
        Array.isArray(
          data[
            key
          ]
        )
      ) {
        entries.push({
          key,

          records:
            data[
              key
            ]
        });
      }
    }

    return entries;
  }

  if (
    normalizedType ===
    ENTITY_TYPES.STATUS
  ) {
    const entries =
      [];

    for (
      const key of
      getCollectionKeys(
        normalizedType
      )
    ) {
      if (
        Array.isArray(
          data[
            key
          ]
        )
      ) {
        entries.push({
          key,

          records:
            data[
              key
            ]
        });
      }
    }

    return entries;
  }

  for (
    const key of
    getCollectionKeys(
      normalizedType
    )
  ) {
    if (
      Array.isArray(
        data[
          key
        ]
      )
    ) {
      return [
        {
          key,

          records:
            data[
              key
            ]
        }
      ];
    }
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
            record => ({
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
  const candidates =
    Array.isArray(
      keys
    )
      ? keys
      : [
          keys
        ];

  for (
    const key of
    candidates
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
 * Envelope context is applied only where the entity type legitimately inherits
 * government/state/version/verification metadata.
 *
 * Precedence:
 *   record value > explicit context > dataset envelope > absent
 *
 * `schemaVersion` and `version` are deliberately not used as dataVersion
 * fallbacks. They describe schema/record versions, not verification metadata.
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
      metadata.dataVersion,

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

  const normalizedEntityType =
    normalizeEntityType(
      entityType
    );

  const withContext =
    applyEnvelopeContext(
      record,
      context,
      {
        allowGovernment:
          DOMAIN_METADATA_TYPES.has(
            normalizedEntityType
          ),

        allowState:
          DOMAIN_METADATA_TYPES.has(
            normalizedEntityType
          ),

        allowVersion:
          DATA_VERSION_TYPES.has(
            normalizedEntityType
          ),

        allowLastVerified:
          LAST_VERIFIED_TYPES.has(
            normalizedEntityType
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
    normalizedEntityType;

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
          item =>
            cleanString(
              item,
              ''
            )
        )
        .filter(Boolean)
    );

  normalized.keywords =
    uniqueArray(
      cleanArray(
        record.keywords
      )
        .map(
          item =>
            cleanString(
              item,
              ''
            )
        )
        .filter(Boolean)
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

  normalized.sourceReferences =
    normalizeSources(
      record.sourceReferences
    );

  normalized.requirements =
    normalizeRequirements(
      record.requirements
    );

  for (
    const field of [
      'createdAt',
      'updatedAt',
      'publicationDate',
      'effectiveDate'
    ]
  ) {
    if (
      record[
        field
      ] !==
        undefined
    ) {
      normalized[
        field
      ] =
        normalizeDate(
          record[
            field
          ]
        );
    }
  }

  if (
    normalized.lastVerified !==
      undefined &&
    normalized.lastVerified !==
      null
  ) {
    normalized.lastVerified =
      normalizeDate(
        normalized.lastVerified
      );
  }

  if (
    normalized.dataVersion !==
      undefined &&
    normalized.dataVersion !==
      null
  ) {
    normalized.dataVersion =
      cleanNullableString(
        normalized.dataVersion
      );
  }

  return normalized;
}

function normalizeScore10(
  value
) {
  return normalizeNumber(
    value,
    {
      min:
        0,

      max:
        10
    }
  );
}

function normalizeCurrentness(
  value
) {
  return normalizeEnumIgnoreCase(
    value,
    CURRENTNESS_VALUES,
    null
  );
}

function normalizeConfidence(
  value
) {
  return normalizeEnumIgnoreCase(
    value,
    CONFIDENCE_VALUES,
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

  const roleType =
    sourceIdentity.roleType ??
    job.roleType;

  if (
    cleanNullableString(
      roleType
    )
  ) {
    identity.roleType =
      cleanString(
        roleType
      );
  }

  const description =
    sourceIdentity.description ??
    job.description;

  if (
    description !==
      undefined &&
    description !==
      null
  ) {
    identity.description =
      cleanLocalizedText(
        description
      );
  }

  const aliases =
    normalizeStringArray(
      sourceIdentity.aliases ??
      job.aliases
    );

  if (
    aliases.length
  ) {
    identity.aliases =
      aliases;
  }

  const historicalNames =
    normalizeStringArray(
      sourceIdentity.historicalNames ??
      job.historicalNames
    );

  if (
    historicalNames.length
  ) {
    identity.historicalNames =
      historicalNames;
  }

  return identity;
}

function normalizeStringArray(
  value
) {
  return uniqueArray(
    cleanArray(
      value
    )
      .map(
        item =>
          cleanString(
            item,
            ''
          )
      )
      .filter(Boolean)
  );
}

function normalizeRecruitmentMode(
  value
) {
  return normalizeEnumIgnoreCase(
    value,
    RECRUITMENT_MODES,
    null
  );
}

/*
 * Current repository source uses explicit route values such as
 * DIRECT_EXAMINATION and WBPSC_WBCS. These exact route values identify a
 * direct recruitment route; they are not inferred from a job title.
 */
const RECRUITMENT_ROUTE_TO_MODE =
  Object.freeze({
    DIRECT_EXAMINATION:
      'DIRECT_RECRUITMENT',

    DIRECT_RECRUITMENT:
      'DIRECT_RECRUITMENT',

    WBPSC_WBCS:
      'DIRECT_RECRUITMENT'
  });

function normalizeRecruitmentModeFromJob(
  job,
  source
) {
  const explicit =
    getRecordValue(
      source,
      [
        'mode',
        'recruitmentMode',
        'recruitmentType',
        'entryMode'
      ]
    ) ??
    getRecordValue(
      job,
      [
        'recruitmentMode',
        'recruitmentType',
        'entryMode',
        'mode'
      ]
    );

  const normalizedExplicit =
    normalizeRecruitmentMode(
      explicit
    );

  if (
    normalizedExplicit
  ) {
    return normalizedExplicit;
  }

  const route =
    getRecordValue(
      source,
      [
        'route',
        'recruitmentRoute'
      ]
    ) ??
    getRecordValue(
      job,
      [
        'route',
        'recruitmentRoute'
      ]
    );

  const routeKey =
    cleanString(
      route,
      ''
    ).toUpperCase();

  return (
    RECRUITMENT_ROUTE_TO_MODE[
      routeKey
    ] ||
    null
  );
}

function normalizeCareerStatus(
  value,
  {
    allowRecurringCareer =
      false
  } = {}
) {
  const direct =
    normalizeEnumIgnoreCase(
      value,
      CAREER_STATUSES,
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  if (
    allowRecurringCareer &&
    cleanString(
      value,
      ''
    ).toUpperCase() ===
      'RECURRING_CAREER'
  ) {
    return 'ACTIVE_CAREER';
  }

  return null;
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
      job.routeIds
    );

  if (
    routeIds.length
  ) {
    recruitment.routeIds =
      routeIds;
  } else {
    const route =
      getRecordValue(
        source,
        [
          'route',
          'recruitmentRoute'
        ]
      ) ??
      getRecordValue(
        job,
        [
          'route',
          'recruitmentRoute'
        ]
      );

    if (
      cleanNullableString(
        route
      )
    ) {
      recruitment.routeIds = [
        cleanString(
          route
        )
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
    normalizeRecruitmentModeFromJob(
      job,
      source
    );

  if (
    mode
  ) {
    recruitment.mode =
      mode;
  }

  const careerStatus =
    normalizeCareerStatus(
      getRecordValue(
        source,
        [
          'careerStatus'
        ]
      ) ??
      getRecordValue(
        job,
        [
          'careerStatus'
        ]
      ) ??
      getRecordValue(
        job,
        [
          'currentStatus'
        ]
      ),
      {
        allowRecurringCareer:
          true
      }
    );

  if (
    careerStatus
  ) {
    recruitment.careerStatus =
      careerStatus;
  }

  /*
   * Do not derive freshEntryEligible from a route. A route tells us how a
   * recruitment may occur; it does not, by itself, establish the required
   * boolean canonical fact. Only explicit boolean-equivalent source values
   * are normalized.
   */
  const freshEntryValue =
    getRecordValue(
      source,
      [
        'freshEntryEligible'
      ]
    );

  const normalizedFreshEntry =
    freshEntryValue !==
      undefined
      ? normalizeOptionalBoolean(
          freshEntryValue
        )
      : normalizeOptionalBoolean(
          getRecordValue(
            job,
            [
              'freshEntryEligible'
            ]
          )
        );

  if (
    normalizedFreshEntry !==
      null
  ) {
    recruitment.freshEntryEligible =
      normalizedFreshEntry;
  }

  const currentStatus =
    getRecordValue(
      source,
      [
        'currentRecruitmentStatus'
      ]
    ) ??
    getRecordValue(
      job,
      [
        'currentRecruitmentStatus'
      ]
    );

  const normalizedCurrentStatus =
    normalizeEnumIgnoreCase(
      currentStatus,
      [
        'OPEN',
        'NOTIFIED',
        'RECURRING_ROUTE',
        'CLOSED',
        'NOT_CURRENTLY_NOTIFIED',
        'HISTORICAL',
        'UNKNOWN'
      ],
      null
    );

  if (
    normalizedCurrentStatus
  ) {
    recruitment.currentRecruitmentStatus =
      normalizedCurrentStatus;
  }

  const recruitmentNotes =
    source.recruitmentNotes ??
    job.recruitmentNotes;

  if (
    recruitmentNotes !==
      undefined
  ) {
    recruitment.recruitmentNotes =
      cleanLocalizedText(
        recruitmentNotes
      );
  }

  return recruitment;
}

function normalizeEducationLevel(
  value
) {
  return normalizeEnumIgnoreCase(
    value,
    JOB_EDUCATION_LEVELS,
    null
  );
}

function normalizeBaEnglishAssessment(
  value
) {
  const direct =
    normalizeEnumIgnoreCase(
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

  if (
    direct
  ) {
    return direct;
  }

  const normalized =
    cleanString(
      value,
      ''
    ).toUpperCase();

  /*
   * The existing source contains explicit baseline-assessment values such as:
   *
   *   DIRECT_WITH_BENGALI
   *   DIRECT_ACADEMIC_WITH_MEDICAL_REQUIREMENTS
   *   DIRECT_ACADEMIC_WITH_PHYSICAL_MEDICAL
   *
   * These belong to the source's BA-English-assessment field. Normalizing
   * them to the canonical DIRECT value preserves that field's semantics;
   * it does not determine candidate eligibility.
   */
  if (
    normalized ===
      'DIRECT_WITH_BENGALI' ||
    normalized.startsWith(
      'DIRECT_ACADEMIC_'
    ) ||
    normalized.startsWith(
      'DIRECT_WITH_'
    )
  ) {
    return 'DIRECT';
  }

  if (
    normalized ===
    'DIRECT'
  ) {
    return 'DIRECT';
  }

  if (
    normalized.startsWith(
      'CONDITIONAL'
    )
  ) {
    return 'CONDITIONAL';
  }

  if (
    normalized.startsWith(
      'NOT_ELIGIBLE'
    )
  ) {
    return 'NOT_ELIGIBLE';
  }

  if (
    normalized.includes(
      'CURRENT_NOTIFICATION_REQUIRED'
    )
  ) {
    return 'CURRENT_NOTIFICATION_REQUIRED';
  }

  if (
    normalized ===
    'NOT_VERIFIED'
  ) {
    return 'NOT_VERIFIED';
  }

  if (
    normalized ===
    'NOT_APPLICABLE'
  ) {
    return 'NOT_APPLICABLE';
  }

  return null;
}

function normalizeQualificationReferenceIds(
  source,
  job
) {
  return normalizeIdArray(
    source.qualificationIds ??
    source.qualificationId ??
    job.qualificationIds ??
    job.qualificationId ??
    source.requiredQualificationIds ??
    job.requiredQualificationIds
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

  /*
   * `entryLevel` is deliberately not converted into minimumQualification.
   * GRADUATE is an education level, not the canonical human-readable
   * qualification statement required by the job schema.
   */
  const minimumQualification =
    getRecordValue(
      source,
      [
        'minimumQualification',
        'minimumQualificationSummary',
        'educationalQualification',
        'educationRequirement',
        'requiredQualification'
      ]
    ) ??
    getRecordValue(
      job,
      [
        'minimumQualification',
        'minimumQualificationSummary',
        'educationalQualification',
        'educationRequirement',
        'requiredQualification'
      ]
    );

  if (
    typeof minimumQualification ===
    'string'
  ) {
    const normalizedMinimum =
      cleanNullableString(
        minimumQualification
      );

    if (
      normalizedMinimum
    ) {
      eligibility.minimumQualification =
        normalizedMinimum;
    }
  } else if (
    isPlainObject(
      minimumQualification
    )
  ) {
    const normalizedMinimum =
      cleanLocalizedText(
        minimumQualification
      );

    if (
      normalizedMinimum.en
    ) {
      eligibility.minimumQualification =
        normalizedMinimum;
    }
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
    normalizeQualificationReferenceIds(
      source,
      job
    );

  if (
    qualificationIds.length
  ) {
    eligibility.qualificationIds =
      qualificationIds;
  }

  /*
   * IMPORTANT:
   * qualificationRuleIds are not silently treated as qualificationIds.
   * They are semantically distinct from eligibilityRuleIds and are not a safe
   * canonical qualification relationship without explicit source evidence.
   */
  const ruleIds =
    normalizeIdArray(
      source.ruleIds ??
      source.eligibilityRuleIds ??
      job.ruleIds ??
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
      job.baEnglishAssessment ??
      job.baEnglishEligibility
    );

  if (
    baEnglishAssessment
  ) {
    eligibility.baEnglishAssessment =
      baEnglishAssessment;
  }

  const overqualification =
    normalizeEnumIgnoreCase(
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
      ],
      null
    );

  if (
    overqualification
  ) {
    eligibility.overqualification =
      overqualification;
  }

  const summary =
    source.eligibilitySummary ??
    job.eligibilitySummary;

  if (
    summary !==
      undefined
  ) {
    eligibility.eligibilitySummary =
      cleanLocalizedText(
        summary
      );
  }

  const notes =
    source.notes ??
    job.eligibilityNotes;

  if (
    notes !==
      undefined
  ) {
    eligibility.notes =
      cleanLocalizedText(
        notes
      );
  }

  return eligibility;
}

function normalizeDeskField(
  value
) {
  const normalized =
    cleanString(
      value,
      ''
    ).toUpperCase();

  const mappings = {
    OFFICE:
      'MOSTLY_OFFICE',

    OFFICE_HEAVY:
      'MOSTLY_OFFICE',

    MOSTLY_OFFICE:
      'MOSTLY_OFFICE',

    OFFICE_AND_FIELD:
      'OFFICE_PLUS_FIELD',

    FIELD_AND_OFFICE:
      'OFFICE_PLUS_FIELD',

    OFFICE_AND_INSPECTION:
      'OFFICE_PLUS_FIELD',

    OFFICE_AND_AUDIT:
      'OFFICE_PLUS_FIELD',

    OFFICE_AND_PUBLIC_COMMUNICATION:
      'OFFICE_PLUS_FIELD',

    INVESTIGATION_AND_OFFICE:
      'OFFICE_PLUS_FIELD',

    OFFICE_PLUS_FIELD:
      'OFFICE_PLUS_FIELD',

    FIELD:
      'MOSTLY_FIELD',

    FIELD_HEAVY:
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

function copyScoreFields(
  source,
  target,
  fields = SCORE_FIELDS
) {
  for (
    const field of
    fields
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

function normalizeLifestyle(
  job
) {
  const source =
    isPlainObject(
      job.lifestyle
    )
      ? job.lifestyle
      : {};

  const work =
    isPlainObject(
      job.work
    )
      ? job.work
      : {};

  const lifestyle =
    {};

  const deskField =
    normalizeDeskField(
      source.deskField ??
      work.deskField
    );

  if (
    deskField
  ) {
    lifestyle.deskField =
      deskField;
  }

  const scoreSources = {
    publicInteractionScore: [
      source.publicInteractionScore,
      job.publicInteractionScore
    ],

    computerWorkScore: [
      source.computerWorkScore,
      job.computerWorkScore
    ],

    legalWorkScore: [
      source.legalWorkScore,
      job.legalWorkScore
    ],

    accountsWorkScore: [
      source.accountsWorkScore,
      job.accountsWorkScore
    ],

    investigationScore: [
      source.investigationScore,
      job.investigationScore
    ],

    inspectionScore: [
      source.inspectionScore,
      job.inspectionScore
    ],

    supervisionScore: [
      source.supervisionScore,
      job.supervisionScore
    ],

    workLifeScore: [
      source.workLifeScore,
      job.workLife
    ],

    predictabilityScore: [
      source.predictabilityScore,
      job.predictabilityScore
    ],

    stressBurden: [
      source.stressBurden,
      job.stress
    ],

    riskBurden: [
      source.riskBurden,
      job.physicalRisk ??
      job.risk
    ],

    nightDutyBurden: [
      source.nightDutyBurden,
      job.nightDutyBurden
    ],

    shiftDutyBurden: [
      source.shiftDutyBurden,
      job.shiftDutyBurden
    ],

    holidayDutyBurden: [
      source.holidayDutyBurden,
      job.holidayDutyBurden
    ],

    emergencyDutyBurden: [
      source.emergencyDutyBurden,
      job.emergencyDutyBurden
    ],

    travelBurden: [
      source.travelBurden,
      job.travelBurden
    ],

    courtDutyBurden: [
      source.courtDutyBurden,
      job.courtDutyBurden
    ],

    uniformScore: [
      source.uniformScore,
      job.uniformScore
    ]
  };

  for (
    const field of
    LIFESTYLE_SCORE_FIELDS
  ) {
    const value =
      scoreSources[
        field
      ]?.find(
        candidate =>
          candidate !==
            undefined &&
          candidate !==
            null
      );

    const normalizedValue =
      normalizeScore10(
        value
      );

    if (
      normalizedValue !==
      null
    ) {
      lifestyle[
        field
      ] =
        normalizedValue;
    }
  }

  const allowedStatusValues = {
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

  const statusSources = {
    uniformStatus: [
      source.uniformStatus,
      job.uniformStatus
    ],

    nightDutyStatus: [
      source.nightDutyStatus,
      job.nightDutyStatus,
      work.nightDuty
    ],

    shiftDutyStatus: [
      source.shiftDutyStatus,
      job.shiftDutyStatus,
      work.shiftDuty
    ],

    holidayDutyStatus: [
      source.holidayDutyStatus,
      job.holidayDutyStatus,
      work.holidayDuty
    ],

    emergencyDutyStatus: [
      source.emergencyDutyStatus,
      job.emergencyDutyStatus,
      work.emergencyDuty
    ]
  };

  for (
    const [
      field,
      values
    ] of Object.entries(
      statusSources
    )
  ) {
    const value =
      values.find(
        candidate =>
          candidate !==
            undefined &&
          candidate !==
            null
      );

    const normalized =
      normalizeEnumIgnoreCase(
        value,
        allowedStatusValues[
          field
        ],
        null
      );

    if (
      normalized
    ) {
      lifestyle[
        field
      ] =
        normalized;
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
    normalizeEnumIgnoreCase(
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
      ],
      null
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
  } else if (
    job.analyticalNotes !==
      undefined
  ) {
    analysis.analyticalNotes =
      cleanLocalizedText(
        job.analyticalNotes
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
        base.posting?.locationProfileId,
        base.posting?.profileId
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
        base.promotion?.promotionProfileId,
        base.promotion?.profileId
      ]
    ],

    [
      'benefitProfileId',
      [
        base.benefitProfileId,
        base.benefits?.benefitProfileId,
        base.benefits?.benefitsProfileId,
        base.benefits?.profileId
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
          item =>
            cleanId(
              item
            )
        )
        .find(Boolean);

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
      base.currentness ??
      base.sourceCurrentness
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

  const dataVersion =
    cleanNullableString(
      base.dataVersion
    );

  if (
    dataVersion
  ) {
    canonical.dataVersion =
      dataVersion;
  }

  /*
   * Compatibility-only legacy metadata.
   *
   * These values never populate canonical ruleIds or candidate eligibility
   * results.
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
    getRecordValue(
      base,
      [
        'currentStatus'
      ]
    );

  if (
    cleanNullableString(
      legacyStatus
    )
  ) {
    canonical.legacyCurrentStatus =
      cleanString(
        legacyStatus
      );
  }

  /*
   * Preserve the stable compatibility alias used by older consumers without
   * creating a second relational key.
   */
  canonical.jobId =
    canonical.id;

  canonical.searchText =
    buildSearchText(
      canonical,
      [
        base.id,
        base.post,
        base.postName,
        base.officialName,
        base.shortName,
        base.category,
        base.jobCategory,
        base.aliases,
        base.keywords,
        base.departmentName,
        base.organisationName,
        base.examName,
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
      ENTITY_TYPES.EXAM,

    examId:
      result.id,

    status:
      normalizeEnumIgnoreCase(
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
        ],
        null
      ),

    difficulty:
      normalizeEnumIgnoreCase(
        result.difficulty,
        [
          'EASY',
          'MODERATE',
          'HARD',
          'VERY_HARD',
          'EXTREME',
          'UNKNOWN'
        ],
        null
      ),

    year:
      normalizeNumber(
        result.year,
        {
          integer:
            true
        }
      ),

    qualificationLevelIds:
      normalizeIdArray(
        result.qualificationLevelIds
      ),

    qualificationIds:
      normalizeIdArray(
        result.qualificationIds
      ),

    postIds:
      normalizeIdArray(
        result.postIds ??
        result.jobIds
      ),

    jobIds:
      normalizeIdArray(
        result.jobIds ??
        result.postIds
      ),

    sourceIds:
      normalizeIdArray(
        result.sourceIds
      )
  };

  Object.keys(
    canonical
  ).forEach(
    key => {
      if (
        canonical[
          key
        ] ===
          null ||
        canonical[
          key
        ] ===
          undefined
      ) {
        delete canonical[
          key
        ];
      }
    }
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

  const status =
    normalizeEnumIgnoreCase(
      result.status,
      [
        'ACTIVE',
        'HISTORICAL',
        'RENAMED',
        'MERGED',
        'REORGANISED',
        'ABOLISHED',
        'UNKNOWN'
      ],
      null
    );

  const canonical = {
    ...result,

    entityType:
      ENTITY_TYPES.DEPARTMENT,

    departmentId:
      result.id,

    searchText:
      buildSearchText(
        result
      )
  };

  if (
    status
  ) {
    canonical.status =
      status;
  }

  return canonical;
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
    normalizeEnumIgnoreCase(
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
      ],
      null
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
    normalizeStringArray(
      value.regionNames
    );

  if (
    regionNames.length
  ) {
    result.regionNames =
      regionNames;
  }

  const districtNames =
    normalizeStringArray(
      value.districtNames
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
    typeof value ===
    'string'
  ) {
    const scopeType =
      normalizeEnumIgnoreCase(
        value,
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
        ],
        null
      );

    return scopeType
      ? {
          scopeType
        }
      : null;
  }

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
    normalizeEnumIgnoreCase(
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
      ],
      null
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

function normalizeServiceType(
  value,
  serviceNature
) {
  const direct =
    normalizeEnumIgnoreCase(
      value,
      CANONICAL_SERVICE_TYPES,
      null
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
    ).toUpperCase();

  return (
    SERVICE_TYPE_BY_NATURE[
      nature
    ] ||
    null
  );
}

function normalizeEntryRoutes(
  routes
) {
  if (
    !Array.isArray(
      routes
    )
  ) {
    return [];
  }

  return routes
    .filter(
      isPlainObject
    )
    .map(
      route => {
        const normalized =
          {};

        const routeType =
          normalizeEnumIgnoreCase(
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
            ],
            null
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

    id:
      result.id,

    name:
      normalizeLocalizedText(
        result.name
      ),

    sourceIds:
      normalizeIdArray(
        result.sourceIds
      )
  };

  const governmentId =
    cleanId(
      result.governmentId ??
      context.governmentId
    );

  if (
    governmentId
  ) {
    canonical.governmentId =
      governmentId;
  }

  if (
    result.shortName !==
      undefined
  ) {
    canonical.shortName =
      normalizeLocalizedText(
        result.shortName
      );
  }

  if (
    result.fullForm
  ) {
    canonical.fullForm =
      cleanNullableString(
        result.fullForm
      );
  }

  const stateId =
    cleanId(
      result.stateId
    );

  if (
    stateId
  ) {
    canonical.stateId =
      stateId;
  }

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

  for (
    const field of [
      'serviceGroup',
      'cadreControl',
      'classification'
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

  for (
    const field of [
      'postIds',
      'examIds',
      'recruitmentIds',
      'recruitmentRouteIds',
      'eligibilityRuleIds',
      'payIds',
      'promotionIds',
      'benefitIds',
      'locationIds'
    ]
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

  const entryRoutes =
    normalizeEntryRoutes(
      result.entryRoutes
    );

  if (
    entryRoutes.length
  ) {
    canonical.entryRoutes =
      entryRoutes;
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
    normalizeEnumIgnoreCase(
      result.status,
      [
        'ACTIVE',
        'HISTORICAL',
        'RENAMED',
        'MERGED',
        'REORGANISED',
        'ABOLISHED',
        'UNKNOWN'
      ],
      null
    );

  if (
    status
  ) {
    canonical.status =
      status;
  }

  return canonical;
}

function mapEligibilityRuleTarget(
  rule
) {
  const explicitType =
    normalizeEnumIgnoreCase(
      rule.targetType,
      [
        'JOB',
        'EXAM',
        'SERVICE_CADRE',
        'RECRUITMENT'
      ],
      null
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

  /*
   * Only explicit relationship fields are eligible here. The function never
   * searches by name and never infers a target from a rule description.
   */
  const explicitCandidates = [
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
    ] of explicitCandidates
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
  const direct =
    normalizeEnumIgnoreCase(
      rule.ruleClass,
      [
        'HARD',
        'SOFT'
      ],
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  const ruleType =
    cleanString(
      rule.ruleType,
      ''
    ).toUpperCase();

  const exactMappings = {
    HARD_ELIGIBILITY:
      'HARD',

    PHYSICAL_REQUIREMENT:
      'HARD',

    MEDICAL_REQUIREMENT:
      'HARD',

    SOFT_REQUIREMENT:
      'SOFT',

    SOFT_ELIGIBILITY:
      'SOFT'
  };

  return (
    exactMappings[
      ruleType
    ] ||
    null
  );
}

function normalizeConditionType(
  rule
) {
  const explicit =
    normalizeEnumIgnoreCase(
      rule.conditionType,
      ELIGIBILITY_RULE_CONDITION_TYPES,
      null
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

  const exactSubjectMappings = {
    qualifications:
      'QUALIFICATION',

    qualification:
      'QUALIFICATION',

    requiredqualifications:
      'QUALIFICATION',

    physicalprofile:
      'PHYSICAL_STANDARD',

    physicalstandard:
      'PHYSICAL_STANDARD',

    medicalprofile:
      'MEDICAL_STANDARD',

    medicalstandard:
      'MEDICAL_STANDARD',

    age:
      'AGE',

    language:
      'LANGUAGE',

    citizenship:
      'CITIZENSHIP',

    domicile:
      'DOMICILE',

    reservation:
      'RESERVATION',

    category:
      'CATEGORY',

    gender:
      'GENDER',

    experience:
      'EXPERIENCE',

    typing:
      'TYPING',

    shorthand:
      'SHORTHAND',

    computerknowledge:
      'COMPUTER_KNOWLEDGE',

    computercertificate:
      'COMPUTER_CERTIFICATE'
  };

  if (
    exactSubjectMappings[
      subjectField
    ]
  ) {
    return exactSubjectMappings[
      subjectField
    ];
  }

  const ruleType =
    cleanString(
      rule.ruleType,
      ''
    ).toUpperCase();

  const exactRuleTypeMappings = {
    PHYSICAL_REQUIREMENT:
      'PHYSICAL_STANDARD',

    MEDICAL_REQUIREMENT:
      'MEDICAL_STANDARD'
  };

  return (
    exactRuleTypeMappings[
      ruleType
    ] ||
    null
  );
}

function normalizeRuleEffect(
  rule
) {
  const direct =
    normalizeEnumIgnoreCase(
      rule.effect,
      [
        'ALLOW',
        'DENY',
        'REQUIRE_VERIFICATION',
        'CONDITIONAL',
        'MODIFY'
      ],
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  /*
   * Narrow structural mappings from explicit source outcomes.
   *
   * failureStatus = NOT_ELIGIBLE means the rule's failure effect is denial.
   * unknownStatus = manual verification means unresolved satisfaction requires
   * verification. These are rule semantics, not candidate-specific decisions.
   */
  const failureStatus =
    normalizeEnumIgnoreCase(
      rule.failureStatus,
      [
        'NOT_ELIGIBLE'
      ],
      null
    );

  if (
    failureStatus ===
    'NOT_ELIGIBLE'
  ) {
    return 'DENY';
  }

  const unknownStatus =
    cleanString(
      rule.unknownStatus,
      ''
    ).toUpperCase();

  if (
    [
      'REQUIRES_MANUAL_VERIFICATION',
      'REQUIRES_VERIFICATION',
      'REVIEW_REQUIRED'
    ].includes(
      unknownStatus
    )
  ) {
    return 'REQUIRE_VERIFICATION';
  }

  const conditional =
    normalizeOptionalBoolean(
      rule.conditional
    );

  if (
    conditional ===
    true
  ) {
    return 'CONDITIONAL';
  }

  return null;
}

function normalizeRuleLogic(
  value
) {
  if (
    isPlainObject(
      value
    )
  ) {
    const logic =
      {};

    const mode =
      normalizeEnumIgnoreCase(
        value.mode,
        [
          'ALL_OF',
          'ANY_OF',
          'NONE_OF'
        ],
        null
      );

    if (
      mode
    ) {
      logic.mode =
        mode;
    }

    const ruleIds =
      normalizeIdArray(
        value.ruleIds
      );

    if (
      ruleIds.length
    ) {
      logic.ruleIds =
        ruleIds;
    }

    return Object.keys(
      logic
    ).length
      ? logic
      : null;
  }

  if (
    typeof value ===
    'string'
  ) {
    const mappings = {
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
      mappings[
        cleanString(
          value,
          ''
        ).toUpperCase()
      ];

    return mode
      ? {
          mode
        }
      : null;
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
    mapEligibilityRuleTarget(
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
  } else if (
    result.explanation !==
      undefined
  ) {
    canonical.description =
      cleanLocalizedText(
        result.explanation
      );
  }

  /*
   * If the source does not identify a target, targetType/targetId deliberately
   * remain absent. The canonical validator must expose that migration need.
   */
  if (
    target.targetType
  ) {
    canonical.targetType =
      target.targetType;
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
    normalizeEnumIgnoreCase(
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
      ],
      null
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

  const logic =
    normalizeRuleLogic(
      result.logic
    );

  if (
    logic
  ) {
    canonical.logic =
      logic;
  }

  const effect =
    normalizeRuleEffect(
      result
    );

  if (
    effect
  ) {
    canonical.effect =
      effect;
  }

  /*
   * Preserve the explicit mandatory/conditional/review semantics where the
   * source actually expresses them.
   */
  if (
    typeof result.priority ===
    'number' &&
    Number.isFinite(
      result.priority
    )
  ) {
    const priority =
      normalizeNumber(
        result.priority,
        {
          integer:
            true,

          min:
            0
        }
      );

    if (
      priority !==
      null
    ) {
      canonical.priority =
        priority;
    }
  } else {
    const priorityText =
      cleanString(
        result.priority,
        ''
      ).toUpperCase();

    if (
      priorityText ===
      'MANDATORY'
    ) {
      canonical.mandatory =
        true;
    } else if (
      priorityText ===
      'OPTIONAL'
    ) {
      canonical.mandatory =
        false;
    } else if (
      priorityText ===
      'CONDITIONAL'
    ) {
      canonical.conditional =
        true;
    }
  }

  for (
    const field of [
      'mandatory',
      'conditional',
      'reviewRequired'
    ]
  ) {
    const booleanValue =
      normalizeOptionalBoolean(
        result[
          field
        ]
      );

    if (
      booleanValue !==
      null
    ) {
      canonical[
        field
      ] =
        booleanValue;
    }
  }

  const unknownStatus =
    cleanString(
      result.unknownStatus,
      ''
    ).toUpperCase();

  if (
    [
      'REQUIRES_MANUAL_VERIFICATION',
      'REQUIRES_VERIFICATION',
      'REVIEW_REQUIRED'
    ].includes(
      unknownStatus
    )
  ) {
    canonical.verificationRequirement =
      {
        required:
          true
      };

    if (
      result.explanation !==
        undefined
    ) {
      canonical.verificationRequirement.reason =
        cleanLocalizedText(
          result.explanation
        );
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

  for (
    const field of [
      'requiredLanguages',
      'requiredSkills',
      'requiredComputerKnowledge',
      'degreeNames',
      'subjectNames',
      'requiredNationality',
      'categoryRequirement'
    ]
  ) {
    const values =
      normalizeStringArray(
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

  const educationLevel =
    normalizeEnumIgnoreCase(
      result.educationLevel,
      JOB_EDUCATION_LEVELS,
      null
    );

  if (
    educationLevel
  ) {
    canonical.educationLevel =
      educationLevel;
  }

  const minimumEducationLevel =
    normalizeEnumIgnoreCase(
      result.minimumEducationLevel,
      JOB_EDUCATION_LEVELS.filter(
        level =>
          level !==
          'OTHER'
      ),
      null
    );

  if (
    minimumEducationLevel
  ) {
    canonical.minimumEducationLevel =
      minimumEducationLevel;
  }

  const recruitmentRouteTypes =
    normalizeStringEnumArray(
      result.recruitmentRouteTypes,
      [
        'DIRECT_RECRUITMENT',
        'PROMOTION',
        'DEPUTATION',
        'LATERAL_ENTRY',
        'DEPARTMENTAL',
        'CONTRACTUAL',
        'TEMPORARY',
        'ABSORPTION',
        'OTHER'
      ]
    );

  if (
    recruitmentRouteTypes.length
  ) {
    canonical.recruitmentRouteTypes =
      recruitmentRouteTypes;
  }

  const recruitmentIds =
    normalizeIdArray(
      result.recruitmentIds
    );

  if (
    recruitmentIds.length
  ) {
    canonical.recruitmentIds =
      recruitmentIds;
  }

  const dependsOnRuleIds =
    normalizeIdArray(
      result.dependsOnRuleIds
    );

  if (
    dependsOnRuleIds.length
  ) {
    canonical.dependsOnRuleIds =
      dependsOnRuleIds;
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

  const ageReferenceDate =
    normalizeDate(
      result.ageReferenceDate
    );

  if (
    ageReferenceDate
  ) {
    canonical.ageReferenceDate =
      ageReferenceDate;
  }

  for (
    const field of [
      'ageRelaxations'
    ]
  ) {
    if (
      Array.isArray(
        result[
          field
        ]
      )
    ) {
      canonical[
        field
      ] =
        result[
          field
        ]
          .filter(
            isPlainObject
          )
          .map(
            item => {
              const normalized =
                {};

              const category =
                cleanNullableString(
                  item.category
                );

              if (
                category
              ) {
                normalized.category =
                  category;
              }

              const years =
                normalizeNumber(
                  item.maximumRelaxationYears,
                  {
                    integer:
                      true,

                    min:
                      0
                  }
                );

              if (
                years !==
                null
              ) {
                normalized.maximumRelaxationYears =
                  years;
              }

              if (
                item.description !==
                  undefined
              ) {
                normalized.description =
                  cleanLocalizedText(
                    item.description
                  );
              }

              return normalized;
            }
          )
          .filter(
            item =>
              Object.keys(
                item
              ).length > 0
          );
    }
  }

  if (
    result.citizenship &&
    isPlainObject(
      result.citizenship
    )
  ) {
    canonical.citizenship =
      normalizeCitizenshipRequirement(
        result.citizenship
      );
  }

  const requiredNationality =
    normalizeStringArray(
      result.requiredNationality
    );

  if (
    requiredNationality.length
  ) {
    canonical.requiredNationality =
      requiredNationality;
  }

  if (
    result.domicileRequirement &&
    isPlainObject(
      result.domicileRequirement
    )
  ) {
    canonical.domicileRequirement =
      normalizeDomicileRequirement(
        result.domicileRequirement
      );
  }

  if (
    result.reservationRequirement &&
    isPlainObject(
      result.reservationRequirement
    )
  ) {
    canonical.reservationRequirement =
      normalizeReservationRequirement(
        result.reservationRequirement
      );
  }

  if (
    result.typingRequirement &&
    isPlainObject(
      result.typingRequirement
    )
  ) {
    canonical.typingRequirement =
      normalizeTypingRequirement(
        result.typingRequirement
      );
  }

  if (
    result.shorthandRequirement &&
    isPlainObject(
      result.shorthandRequirement
    )
  ) {
    canonical.shorthandRequirement =
      normalizeShorthandRequirement(
        result.shorthandRequirement
      );
  }

  if (
    result.licenceRequirements &&
    isPlainObject(
      result.licenceRequirements
    )
  ) {
    canonical.licenceRequirements =
      normalizeLicenceRequirements(
        result.licenceRequirements
      );
  }

  if (
    result.requiredExperience &&
    isPlainObject(
      result.requiredExperience
    )
  ) {
    canonical.requiredExperience =
      normalizeRequiredExperience(
        result.requiredExperience
      );
  }

  if (
    result.physicalStandard &&
    isPlainObject(
      result.physicalStandard
    )
  ) {
    canonical.physicalStandard =
      normalizeStructuredRequirementObject(
        result.physicalStandard
      );
  }

  if (
    result.medicalStandard &&
    isPlainObject(
      result.medicalStandard
    )
  ) {
    canonical.medicalStandard =
      clonePlainObject(
        result.medicalStandard
      );
  }

  if (
    result.eyesightRequirement &&
    isPlainObject(
      result.eyesightRequirement
    )
  ) {
    canonical.eyesightRequirement =
      clonePlainObject(
        result.eyesightRequirement
      );
  }

  if (
    result.documentRequirements &&
    Array.isArray(
      result.documentRequirements
    )
  ) {
    canonical.documentRequirements =
      result.documentRequirements
        .filter(
          isPlainObject
        )
        .map(
          item => {
            const normalized =
              {};

            const documentType =
              cleanNullableString(
                item.documentType
              );

            if (
              documentType
            ) {
              normalized.documentType =
                documentType;
            }

            const mandatory =
              normalizeOptionalBoolean(
                item.mandatory
              );

            if (
              mandatory !==
              null
            ) {
              normalized.mandatory =
                mandatory;
            }

            if (
              item.description !==
                undefined
            ) {
              normalized.description =
                cleanLocalizedText(
                  item.description
                );
            }

            return normalized;
          }
        )
        .filter(
          item =>
            Object.keys(
              item
            ).length > 0
        );
  }

  if (
    result.exceptions &&
    Array.isArray(
      result.exceptions
    )
  ) {
    canonical.exceptions =
      result.exceptions
        .filter(
          isPlainObject
        )
        .map(
          item => {
            const normalized =
              {};

            if (
              item.condition !==
                undefined
            ) {
              normalized.condition =
                cleanLocalizedText(
                  item.condition
                );
            }

            const effect =
              normalizeEnumIgnoreCase(
                item.effect,
                [
                  'ALLOW',
                  'DISALLOW',
                  'MODIFY',
                  'REQUIRES_VERIFICATION'
                ],
                null
              );

            if (
              effect
            ) {
              normalized.effect =
                effect;
            }

            if (
              item.value !==
                undefined
            ) {
              normalized.value =
                item.value;
            }

            return normalized;
          }
        )
        .filter(
          item =>
            Object.keys(
              item
            ).length > 0
        );
  }

  if (
    result.notes !==
      undefined
  ) {
    canonical.notes =
      cleanLocalizedText(
        result.notes
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
    normalizeEnumIgnoreCase(
      result.status,
      [
        'ACTIVE',
        'DRAFT',
        'DEPRECATED',
        'HISTORICAL',
        'SUPERSEDED',
        'UNKNOWN'
      ],
      null
    );

  if (
    status
  ) {
    canonical.status =
      status;
  }

  const effectiveFrom =
    normalizeDate(
      result.effectiveFrom
    );

  if (
    effectiveFrom
  ) {
    canonical.effectiveFrom =
      effectiveFrom;
  }

  const effectiveTo =
    normalizeDate(
      result.effectiveTo
    );

  if (
    effectiveTo
  ) {
    canonical.effectiveTo =
      effectiveTo;
  }

  const version =
    cleanNullableString(
      result.version
    );

  if (
    version
  ) {
    canonical.version =
      version;
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

  const dataVersion =
    cleanNullableString(
      result.dataVersion
    );

  if (
    dataVersion
  ) {
    canonical.dataVersion =
      dataVersion;
  }

  /*
   * `sourceDate`, `failureStatus`, `unknownStatus` and the legacy `subject`
   * object are deliberately not emitted as arbitrary canonical properties.
   *
   * Their supported semantics are represented through:
   * - sourceIds/sourceReferences;
   * - effect;
   * - verificationRequirement;
   * - conditionType and qualification/reference fields.
   *
   * This keeps the runtime shape aligned with the canonical rule schema rather
   * than leaking the entire legacy rule representation into the canonical
   * entity.
   */

  return canonical;
}

function normalizeStringEnumArray(
  value,
  allowedValues
) {
  return uniqueArray(
    cleanArray(
      value
    )
      .map(
        item =>
          normalizeEnumIgnoreCase(
            item,
            allowedValues,
            null
          )
      )
      .filter(Boolean)
  );
}

function clonePlainObject(
  value
) {
  if (
    !isPlainObject(
      value
    )
  ) {
    return null;
  }

  const clone =
    {};

  Object.entries(
    value
  ).forEach(
    ([
      key,
      child
    ]) => {
      if (
        isPlainObject(
          child
        )
      ) {
        clone[
          key
        ] =
          clonePlainObject(
            child
          );

        return;
      }

      if (
        Array.isArray(
          child
        )
      ) {
        clone[
          key
        ] =
          child.map(
            item =>
              isPlainObject(
                item
              )
                ? clonePlainObject(
                    item
                  )
                : item
          );

        return;
      }

      clone[
        key
      ] =
        child;
    }
  );

  return clone;
}

function normalizeStructuredRequirementObject(
  value
) {
  const clone =
    clonePlainObject(
      value
    );

  return clone ||
    {};
}

function normalizeTypingRequirement(
  value
) {
  const result =
    {};

  const minimumWordsPerMinute =
    normalizeNumber(
      value.minimumWordsPerMinute,
      {
        min:
          0
      }
    );

  if (
    minimumWordsPerMinute !==
      null
  ) {
    result.minimumWordsPerMinute =
      minimumWordsPerMinute;
  }

  for (
    const field of [
      'language',
      'script'
    ]
  ) {
    const text =
      cleanNullableString(
        value[
          field
        ]
      );

    if (
      text
    ) {
      result[
        field
      ] =
        text;
    }
  }

  const mode =
    normalizeEnumIgnoreCase(
      value.mode,
      [
        'TYPING',
        'TRANSCRIPTION',
        'DATA_ENTRY',
        'OTHER'
      ],
      null
    );

  if (
    mode
  ) {
    result.mode =
      mode;
  }

  return result;
}

function normalizeShorthandRequirement(
  value
) {
  const result =
    {};

  const minimumWordsPerMinute =
    normalizeNumber(
      value.minimumWordsPerMinute,
      {
        min:
          0
      }
    );

  if (
    minimumWordsPerMinute !==
      null
  ) {
    result.minimumWordsPerMinute =
      minimumWordsPerMinute;
  }

  const language =
    cleanNullableString(
      value.language
    );

  if (
    language
  ) {
    result.language =
      language;
  }

  return result;
}

function normalizeLicenceRequirements(
  value
) {
  const result =
    {};

  const licenceTypes =
    normalizeStringArray(
      value.licenceTypes
    );

  if (
    licenceTypes.length
  ) {
    result.licenceTypes =
      licenceTypes;
  }

  const minimumValidityMonths =
    normalizeNumber(
      value.minimumValidityMonths,
      {
        min:
          0
      }
    );

  if (
    minimumValidityMonths !==
      null
  ) {
    result.minimumValidityMonths =
      minimumValidityMonths;
  }

  const commercialRequired =
    normalizeOptionalBoolean(
      value.commercialRequired
    );

  if (
    commercialRequired !==
      null
  ) {
    result.commercialRequired =
      commercialRequired;
  }

  return result;
}

function normalizeRequiredExperience(
  value
) {
  const result =
    {};

  for (
    const field of [
      'minimumYears',
      'maximumYears'
    ]
  ) {
    const years =
      normalizeNumber(
        value[
          field
        ],
        {
          min:
            0
        }
      );

    if (
      years !==
      null
    ) {
      result[
        field
      ] =
        years;
    }
  }

  const experienceType =
    cleanNullableString(
      value.experienceType
    );

  if (
    experienceType
  ) {
    result.experienceType =
      experienceType;
  }

  if (
    value.specificExperience !==
      undefined
  ) {
    result.specificExperience =
      cleanLocalizedText(
        value.specificExperience
      );
  }

  for (
    const field of [
      'organisationTypes',
      'experienceDomains'
    ]
  ) {
    const values =
      normalizeStringArray(
        value[
          field
        ]
      );

    if (
      values.length
    ) {
      result[
        field
      ] =
        values;
    }
  }

  return result;
}

function normalizeCitizenshipRequirement(
  value
) {
  const result =
    {};

  const required =
    normalizeOptionalBoolean(
      value.required
    );

  if (
    required !==
      null
  ) {
    result.required =
      required;
  }

  const allowedStatuses =
    normalizeStringArray(
      value.allowedStatuses
    );

  if (
    allowedStatuses.length
  ) {
    result.allowedStatuses =
      allowedStatuses;
  }

  return result;
}

function normalizeDomicileRequirement(
  value
) {
  const result =
    {};

  const required =
    normalizeOptionalBoolean(
      value.required
    );

  if (
    required !==
      null
  ) {
    result.required =
      required;
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

  const districtNames =
    normalizeStringArray(
      value.districtNames
    );

  if (
    districtNames.length
  ) {
    result.districtNames =
      districtNames;
  }

  const localAreaNames =
    normalizeStringArray(
      value.localAreaNames
    );

  if (
    localAreaNames.length
  ) {
    result.localAreaNames =
      localAreaNames;
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

function normalizeReservationRequirement(
  value
) {
  const result =
    {};

  const categories =
    normalizeStringArray(
      value.categories
    );

  if (
    categories.length
  ) {
    result.categories =
      categories;
  }

  const requiresCertificate =
    normalizeOptionalBoolean(
      value.requiresCertificate
    );

  if (
    requiresCertificate !==
      null
  ) {
    result.requiresCertificate =
      requiresCertificate;
  }

  const certificateTypes =
    normalizeStringArray(
      value.certificateTypes
    );

  if (
    certificateTypes.length
  ) {
    result.certificateTypes =
      certificateTypes;
  }

  const conditions =
    normalizeStringArray(
      value.conditions
    );

  if (
    conditions.length
  ) {
    result.conditions =
      conditions;
  }

  return result;
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

  for (
    const field of [
      'authorityId',
      'examId'
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
    normalizeEnumIgnoreCase(
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
      ],
      null
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

  return {
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
      'governmentId',
      'stateId',
      'paySystem',
      'payCommission',
      'payLevel',
      'payScale',
      'officialStatus'
    ]
  ) {
    const value =
      field.endsWith(
        'Id'
      )
        ? cleanId(
            pay[
              field
            ]
          )
        : cleanNullableString(
            pay[
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

  for (
    const field of [
      'da',
      'hra',
      'transportAllowance',
      'grossEstimate',
      'inHandEstimate'
    ]
  ) {
    if (
      pay[
        field
      ] !==
        undefined
    ) {
      canonical[
        field
      ] =
        clonePlainObject(
          pay[
            field
          ]
        ) ??
        pay[
          field
        ];
    }
  }

  if (
    Array.isArray(
      pay.otherAllowances
    )
  ) {
    canonical.otherAllowances =
      pay.otherAllowances.map(
        item =>
          isPlainObject(
            item
          )
            ? clonePlainObject(
                item
              )
            : item
      );
  }

  if (
    Array.isArray(
      pay.deductions
    )
  ) {
    canonical.deductions =
      pay.deductions.map(
        item =>
          isPlainObject(
            item
          )
            ? clonePlainObject(
                item
              )
            : item
      );
  }

  const confidence =
    normalizeConfidence(
      pay.confidence
    );

  if (
    confidence
  ) {
    canonical.confidence =
      confidence;
  }

  const lastVerified =
    normalizeDate(
      pay.lastVerified
    );

  if (
    lastVerified
  ) {
    canonical.lastVerified =
      lastVerified;
  }

  if (
    cleanNullableString(
      pay.dataVersion
    )
  ) {
    canonical.dataVersion =
      cleanString(
        pay.dataVersion
      );
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

  canonical.id =
    cleanId(
      location.id
    );

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

  const parentLocationId =
    cleanId(
      location.parentLocationId
    );

  if (
    parentLocationId
  ) {
    canonical.parentLocationId =
      parentLocationId;
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
      ),

    searchText:
      buildSearchText(
        result
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
    normalizeEnumIgnoreCase(
      result.type,
      [
        'STATE',
        'UNION_TERRITORY'
      ],
      null
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
    normalizeEnumIgnoreCase(
      result.coverage,
      [
        'ACTIVE',
        'PLANNED',
        'RESEARCHING',
        'PARTIAL',
        'TEMPORARILY_DISABLED'
      ],
      null
    );

  if (
    coverage
  ) {
    canonical.coverage =
      coverage;
  }

  const governmentId =
    cleanId(
      result.governmentId
    );

  if (
    governmentId
  ) {
    canonical.governmentId =
      governmentId;
  }

  canonical.sourceIds =
    normalizeIdArray(
      result.sourceIds
    );

  return canonical;
}

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
    normalizeEnumIgnoreCase(
      result.qualificationType,
      QUALIFICATION_TYPES,
      QUALIFICATION_COLLECTION_TYPES[
        context.collectionKey
      ] ||
        null
    );

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
    normalizeEnumIgnoreCase(
      result.status,
      [
        'COMPLETED',
        'FINAL_YEAR',
        'PURSUING',
        'NOT_HELD'
      ],
      null
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
    normalizeStringArray(
      result.aliases
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

  return {
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

  const sourceTypeId =
    cleanId(
      result.sourceTypeId
    );

  if (
    sourceTypeId
  ) {
    canonical.sourceTypeId =
      sourceTypeId;
  }

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

  const publicationDate =
    normalizeDate(
      result.publicationDate
    );

  if (
    publicationDate
  ) {
    canonical.publicationDate =
      publicationDate;
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
          ENTITY_TYPES.STATUS,

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
      ENTITY_TYPES.STATUS,

    vocabulary:
      context.collectionKey ||
      UNKNOWN
  };

  if (
    result.label !==
      undefined
  ) {
    canonical.label =
      normalizeLocalizedText(
        result.label
      );
  } else if (
    result.name !==
      undefined
  ) {
    canonical.label =
      normalizeLocalizedText(
        result.name
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
 * Search text intentionally flattens localized/structured values rather than
 * converting objects into the useless "[object Object]" representation.
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
        value =>
          value !==
            undefined &&
          value !==
            null
      );

  return flattened
    .map(
      value => {
        if (
          typeof value ===
          'object'
        ) {
          return Object.values(
            value
          )
            .flat(Infinity)
            .filter(
              item =>
                item !==
                  undefined &&
                item !==
                  null
            )
            .map(
              item =>
                String(
                  item
                )
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
 * Main entity-aware dispatch.
 *
 * The existing loader remains compatible with:
 *   normalizeByType(data, 'JOB')
 *
 * A future context-aware caller can use:
 *   normalizeByType(data, {
 *     entityType: 'JOB',
 *     datasetName: 'jobs',
 *     scope: 'CENTRAL',
 *     path: 'central/jobs.json'
 *   })
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
      entry => {
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

          case ENTITY_TYPES.STATUS:
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
    .filter(Boolean);
}

/*
 * Public compatibility helper.
 *
 * It retains the original API while using the same entity-aware extraction
 * rules as normalizeByType(). It never falls back to an arbitrary first array.
 */
function normalizeCollection(
  data,
  entityType =
    ENTITY_TYPES.UNKNOWN,
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
      entry =>
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
    .filter(Boolean);
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
