/**
 * GovCareer Compass
 * Canonical Database Normalizer
 *
 * Pure transformation layer between source JSON and canonical runtime records.
 * It preserves explicit facts, translates only established legacy aliases, and
 * never fabricates foreign keys or factual defaults.
 */

const UNKNOWN = 'UNKNOWN';

const ENTITY_TYPES = Object.freeze({
  UNKNOWN: 'UNKNOWN',
  JOB: 'JOB',
  EXAM: 'EXAM',
  DEPARTMENT: 'DEPARTMENT',
  ORGANISATION: 'ORGANISATION',
  SERVICE_CADRE: 'SERVICE_CADRE',
  ELIGIBILITY_RULE: 'ELIGIBILITY_RULE',
  RECRUITMENT: 'RECRUITMENT',
  PAY: 'PAY',
  LOCATION: 'LOCATION',
  HOUSING: 'HOUSING',
  PROMOTION: 'PROMOTION',
  BENEFIT: 'BENEFIT',
  SOURCE: 'SOURCE',
  GOVERNMENT: 'GOVERNMENT',
  STATE: 'STATE',
  QUALIFICATION: 'QUALIFICATION',
  CATEGORY: 'CATEGORY',
  STATUS: 'STATUS',
  CONFIDENCE_LEVEL: 'CONFIDENCE_LEVEL',
  SOURCE_TYPE: 'SOURCE_TYPE',
  GLOSSARY: 'GLOSSARY',
  SCORING_RULE: 'SCORING_RULE',
  ASSESSMENT_QUESTION: 'ASSESSMENT_QUESTION',
  ASSESSMENT_OPTION: 'ASSESSMENT_OPTION',
  ASSESSMENT_BRANCHING: 'ASSESSMENT_BRANCHING',
  ASSESSMENT_PROFILE_FIELD: 'ASSESSMENT_PROFILE_FIELD',
  ASSESSMENT_RESPONSE_SCORING: 'ASSESSMENT_RESPONSE_SCORING'
});

const COLLECTION_WRAPPERS = Object.freeze({
  JOB: ['jobs', 'records', 'data', 'items'],

  EXAM: ['exams', 'records', 'data', 'items'],

  DEPARTMENT: [
    'departments',
    'records',
    'data',
    'items'
  ],

  ORGANISATION: [
    'organisations',
    'organizations',
    'records',
    'data',
    'items'
  ],

  SERVICE_CADRE: [
    'serviceCadres',
    'records',
    'data',
    'items'
  ],

  ELIGIBILITY_RULE: [
    'eligibilityRules',
    'records',
    'data',
    'items'
  ],

  RECRUITMENT: [
    'recruitments',
    'records',
    'data',
    'items'
  ],

  PAY: [
    'payStructures',
    'payProfiles',
    'records',
    'data',
    'items'
  ],

  LOCATION: [
    'locations',
    'locationProfiles',
    'records',
    'data',
    'items'
  ],

  HOUSING: [
    'housingProfiles',
    'housing',
    'records',
    'data',
    'items'
  ],

  PROMOTION: [
    'promotionProfiles',
    'promotion',
    'records',
    'data',
    'items'
  ],

  BENEFIT: [
    'benefitsProfiles',
    'benefitProfiles',
    'benefits',
    'records',
    'data',
    'items'
  ],

  SOURCE: [
    'sources',
    'records',
    'data',
    'items'
  ],

  GOVERNMENT: [
    'governments',
    'records',
    'data',
    'items'
  ],

  STATE: [
    'states',
    'unionTerritories',
    'records',
    'data',
    'items'
  ],

  /*
   * Qualification is deliberately entity-aware. Generic vocabularies such as
   * educationLevels, qualificationTypes and itiTrades are not included here.
   */
  QUALIFICATION: [
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
  ],

  CATEGORY: [
    'categories',
    'records',
    'data',
    'items'
  ],

  /*
   * Statuses are intentionally kept namespace-aware instead of selecting the
   * first array in statuses.json.
   */
  STATUS: [
    'careerStatuses',
    'recruitmentStatuses',
    'recruitmentModes',
    'coverageStatuses',
    'dataStatuses',
    'sourceCurrentnessStatuses'
  ],

  CONFIDENCE_LEVEL: [
    'confidenceLevels',
    'records',
    'data',
    'items'
  ],

  SOURCE_TYPE: [
    'sourceTypes',
    'records',
    'data',
    'items'
  ],

  GLOSSARY: [
    'glossary',
    'entries',
    'records',
    'data',
    'items'
  ],

  SCORING_RULE: [
    'scoringRules',
    'rules',
    'records',
    'data',
    'items'
  ],

  ASSESSMENT_QUESTION: [
    'questions',
    'assessmentQuestions',
    'records',
    'data',
    'items'
  ],

  ASSESSMENT_OPTION: [
    'options',
    'assessmentOptions',
    'records',
    'data',
    'items'
  ],

  ASSESSMENT_BRANCHING: [
    'branching',
    'assessmentBranching',
    'records',
    'data',
    'items'
  ],

  ASSESSMENT_PROFILE_FIELD: [
    'profileFields',
    'assessmentProfileFields',
    'records',
    'data',
    'items'
  ],

  ASSESSMENT_RESPONSE_SCORING: [
    'responseScoring',
    'assessmentResponseScoring',
    'records',
    'data',
    'items'
  ]
});

const ENVELOPE_METADATA_KEYS = Object.freeze([
  'governmentId',
  'stateId',
  'schemaVersion',
  'dataVersion',
  'lastVerified',
  'version'
]);

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

const JOB_RECRUITMENT_MODES = Object.freeze([
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

const JOB_CAREER_STATUSES = Object.freeze([
  'ACTIVE_CAREER',
  'HISTORICAL',
  'ABOLISHED',
  'REPLACED',
  'SUPERSEDED',
  'NOT_VERIFIED',
  'UNKNOWN'
]);

const CONFIDENCE_VALUES = Object.freeze([
  'HIGH',
  'MEDIUM_HIGH',
  'MEDIUM',
  'LOW',
  'ESTIMATE',
  'NOT_VERIFIED'
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

const RULE_CLASSES = Object.freeze([
  'HARD',
  'SOFT'
]);

const RULE_CONDITION_TYPES = Object.freeze([
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

const RULE_OPERATORS = Object.freeze([
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
]);

const RULE_EFFECTS = Object.freeze([
  'ALLOW',
  'DENY',
  'REQUIRE_VERIFICATION',
  'CONDITIONAL',
  'MODIFY'
]);

const SERVICE_TYPES = Object.freeze([
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

const QUALIFICATION_TYPE_BY_COLLECTION = Object.freeze({
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
    'PARAMEDICAL'
});

/* -------------------------------------------------------------------------- */
/* Primitive helpers                                                          */
/* -------------------------------------------------------------------------- */

function isPlainObject(
  value
) {
  if (
    value === null ||
    typeof value !==
      'object' ||
    Array.isArray(value)
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
    value ===
      undefined ||
    value ===
      null
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
  const text =
    cleanString(
      value,
      ''
    );

  return (
    text ||
    null
  );
}

function cleanId(
  value,
  fallback = null
) {
  return (
    cleanNullableString(
      value
    ) ||
    fallback
  );
}

function cleanArray(
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

  return Array.isArray(
    value
  )
    ? value.filter(
        item =>
          item !==
            undefined &&
          item !==
            null
      )
    : [
        value
      ];
}

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
  const seen =
    new Set();

  const result =
    [];

  cleanArray(
    value
  ).forEach(
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

function cloneValue(
  value
) {
  if (
    isPlainObject(
      value
    )
  ) {
    const result =
      {};

    Object.entries(
      value
    ).forEach(
      ([
        key,
        child
      ]) => {
        result[
          key
        ] =
          cloneValue(
            child
          );
      }
    );

    return result;
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

  return value;
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

  const result =
    {};

  Object.entries(
    value
  ).forEach(
    ([
      locale,
      text
    ]) => {
      const normalized =
        cleanString(
          text,
          ''
        );

      if (
        normalized
      ) {
        result[
          locale
        ] =
          normalized;
      }
    }
  );

  return result;
}

function normalizeLocalizedText(
  value
) {
  return cleanLocalizedText(
    value
  );
}

/*
 * Deterministic date normalization.
 *
 * Only the date portion of an explicit YYYY-MM-DD/ISO-style value is accepted.
 * No locale parsing, current date or current time is introduced.
 */
function normalizeDate(
  value
) {
  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ''
  ) {
    return null;
  }

  const text =
    cleanString(
      value,
      ''
    );

  const match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (
    !match
  ) {
    return null;
  }

  const year =
    Number(
      match[1]
    );

  const month =
    Number(
      match[2]
    );

  const day =
    Number(
      match[3]
    );

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  if (
    date.getUTCFullYear() !==
      year ||
    date.getUTCMonth() !==
      month - 1 ||
    date.getUTCDate() !==
      day
  ) {
    return null;
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
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
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ''
  ) {
    return null;
  }

  /*
   * Boolean -> number coercion is not a safe factual transformation:
   * Number(false) === 0 and Number(true) === 1.
   */
  if (
    typeof value ===
    'boolean'
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

  const result =
    integer
      ? Math.trunc(
          number
        )
      : number;

  if (
    min !== null &&
    result < min
  ) {
    return null;
  }

  if (
    max !== null &&
    result > max
  ) {
    return null;
  }

  return result;
}

function normalizeBoolean(
  value,
  fallback = null
) {
  if (
    typeof value ===
    'boolean'
  ) {
    return value;
  }

  if (
    value ===
      1 ||
    value ===
      '1' ||
    value ===
      'true' ||
    value ===
      'TRUE'
  ) {
    return true;
  }

  if (
    value ===
      0 ||
    value ===
      '0' ||
    value ===
      'false' ||
    value ===
      'FALSE'
  ) {
    return false;
  }

  return fallback;
}

function normalizeOptionalBoolean(
  value
) {
  return normalizeBoolean(
    value,
    null
  );
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

  if (
    !normalized
  ) {
    return fallback;
  }

  return (
    allowedValues.find(
      item =>
        item.toUpperCase() ===
        normalized
    ) ||
    fallback
  );
}

function normalizeEnum(
  value,
  allowedValues,
  fallback = UNKNOWN
) {
  return normalizeEnumIgnoreCase(
    value,
    allowedValues,
    fallback
  );
}

/* -------------------------------------------------------------------------- */
/* Object-path helpers                                                        */
/* -------------------------------------------------------------------------- */

function getPathValue(
  object,
  path
) {
  if (
    !path
  ) {
    return undefined;
  }

  let current =
    object;

  for (
    const part of
    String(
      path
    )
      .split('.')
      .filter(Boolean)
  ) {
    if (
      current ===
        null ||
      current ===
        undefined ||
      typeof current !==
        'object'
    ) {
      return undefined;
    }

    current =
      current[
        part
      ];
  }

  return current;
}

function getFirstValue(
  object,
  paths
) {
  for (
    const path of
    Array.isArray(
      paths
    )
      ? paths
      : [
          paths
        ]
  ) {
    const value =
      getPathValue(
        object,
        path
      );

    if (
      value !==
        undefined &&
      value !==
        null &&
      value !==
        ''
    ) {
      return value;
    }
  }

  return undefined;
}

/* -------------------------------------------------------------------------- */
/* Source/reference helpers                                                   */
/* -------------------------------------------------------------------------- */

function normalizeSourceReference(
  value
) {
  if (
    typeof value ===
    'string'
  ) {
    const sourceId =
      cleanId(
        value
      );

    return sourceId
      ? {
          sourceId
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

  const sourceId =
    cleanId(
      value.sourceId ??
      value.id
    );

  if (
    !sourceId
  ) {
    return null;
  }

  const result = {
    sourceId
  };

  const note =
    cleanNullableString(
      value.note
    );

  if (
    note
  ) {
    result.note =
      note;
  }

  const claim =
    cleanNullableString(
      value.claim
    );

  if (
    claim
  ) {
    result.claim =
      claim;
  }

  return result;
}

function normalizeSources(
  value
) {
  return uniqueArray(
    cleanArray(
      value
    )
      .map(
        normalizeSourceReference
      )
      .filter(Boolean)
  );
}

function normalizeRequirement(
  value
) {
  if (
    typeof value ===
    'string'
  ) {
    return {
      id:
        null,

      type:
        'UNSPECIFIED',

      value:
        value,

      hard:
        null,

      sourceIds:
        []
    };
  }

  if (
    !isPlainObject(
      value
    )
  ) {
    return null;
  }

  return {
    id:
      cleanId(
        value.id
      ),

    type:
      cleanString(
        value.type,
        'UNSPECIFIED'
      ),

    value:
      value.value ??
      null,

    hard:
      normalizeOptionalBoolean(
        value.hard
      ),

    sourceIds:
      normalizeIdArray(
        value.sourceIds
      )
  };
}

function normalizeRequirements(
  value
) {
  return cleanArray(
    value
  )
    .map(
      normalizeRequirement
    )
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Entity/context helpers                                                     */
/* -------------------------------------------------------------------------- */

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
      ENTITY_TYPES.STATUS,

    CONFIDENCELEVELS:
      ENTITY_TYPES.CONFIDENCE_LEVEL,

    SOURCE_TYPES:
      ENTITY_TYPES.SOURCE_TYPE,

    SOURCETYPES:
      ENTITY_TYPES.SOURCE_TYPE,

    SCORINGRULES:
      ENTITY_TYPES.SCORING_RULE,

    ASSESSMENTQUESTIONS:
      ENTITY_TYPES.ASSESSMENT_QUESTION,

    ASSESSMENTOPTIONS:
      ENTITY_TYPES.ASSESSMENT_OPTION,

    ASSESSMENTBRANCHING:
      ENTITY_TYPES.ASSESSMENT_BRANCHING,

    ASSESSMENTPROFILEFIELDS:
      ENTITY_TYPES.ASSESSMENT_PROFILE_FIELD,

    ASSESSMENTRESPONSECORING:
      ENTITY_TYPES.ASSESSMENT_RESPONSE_SCORING
  };

  return (
    aliases[
      normalized
    ] ||
    normalized
  );
}

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
        data[
          key
        ] !==
          undefined &&
        data[
          key
        ] !==
          null &&
        data[
          key
        ] !==
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
  return (
    COLLECTION_WRAPPERS[
      normalizeEntityType(
        entityType
      )
    ] ||
    [
      'records',
      'data',
      'items'
    ]
  );
}

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

  const type =
    normalizeEntityType(
      entityType
    );

  /*
   * States and union territories are separate source namespaces.
   */
  if (
    type ===
      ENTITY_TYPES.STATE
  ) {
    return [
      'states',
      'unionTerritories'
    ]
      .filter(
        key =>
          Array.isArray(
            data[
              key
            ]
          )
      )
      .map(
        key => ({
          key,

          records:
            data[
              key
            ]
        })
      );
  }

  /*
   * Qualifications and statuses may contain several intentionally separate
   * vocabularies. Every matching entity collection is retained.
   */
  if (
    type ===
      ENTITY_TYPES.QUALIFICATION ||
    type ===
      ENTITY_TYPES.STATUS
  ) {
    return getCollectionKeys(
      type
    )
      .filter(
        key =>
          Array.isArray(
            data[
              key
            ]
          )
      )
      .map(
        key => ({
          key,

          records:
            data[
              key
            ]
        })
      );
  }

  const key =
    getCollectionKeys(
      type
    ).find(
      candidate =>
        Array.isArray(
          data[
            candidate
          ]
        )
    );

  return key
    ? [
        {
          key,

          records:
            data[
              key
            ]
        }
      ]
    : [];
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
        entry =>
          entry.records.map(
            record => ({
              record,

              collectionKey:
                entry.key
            })
          )
      ),

    metadata:
      getDatasetMetadata(
        data
      )
  };
}

/*
 * Generic source-normalized representation retained for backwards
 * compatibility. Canonical builders intentionally do not spread this object
 * into strict schema records.
 */
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

  const result =
    cloneValue(
      record
    );

  const metadata =
    context.metadata ||
    {};

  result.id =
    cleanId(
      record.id
    );

  result.governmentId =
    cleanId(
      record.governmentId ??
      context.governmentId ??
      metadata.governmentId
    );

  result.stateId =
    cleanId(
      record.stateId ??
      context.stateId ??
      metadata.stateId
    );

  result.departmentId =
    cleanId(
      record.departmentId
    );

  result.organisationId =
    cleanId(
      record.organisationId
    );

  result.serviceCadreId =
    cleanId(
      record.serviceCadreId
    );

  result.sourceIds =
    normalizeIdArray(
      record.sourceIds
    );

  result.aliases =
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

  result.keywords =
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

  if (
    result.lastVerified ===
      undefined
  ) {
    result.lastVerified =
      normalizeDate(
        record.lastVerified ??
        metadata.lastVerified
      );
  } else {
    result.lastVerified =
      normalizeDate(
        result.lastVerified
      );
  }

  if (
    result.dataVersion ===
      undefined
  ) {
    result.dataVersion =
      cleanNullableString(
        record.dataVersion ??
        metadata.dataVersion
      );
  } else {
    result.dataVersion =
      cleanNullableString(
        result.dataVersion
      );
  }

  if (
    result.version !==
      undefined
  ) {
    result.version =
      cleanNullableString(
        result.version
      );
  }

  if (
    record.name !==
      undefined
  ) {
    result.name =
      normalizeLocalizedText(
        record.name
      );
  }

  if (
    record.title !==
      undefined
  ) {
    result.title =
      normalizeLocalizedText(
        record.title
      );
  }

  if (
    record.description !==
      undefined
  ) {
    result.description =
      normalizeLocalizedText(
        record.description
      );
  }

  if (
    record.sourceReferences !==
      undefined
  ) {
    result.sourceReferences =
      normalizeSources(
        record.sourceReferences
      );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Controlled mappings                                                        */
/* -------------------------------------------------------------------------- */

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

function normalizeEducationLevel(
  value
) {
  return normalizeEnumIgnoreCase(
    value,
    JOB_EDUCATION_LEVELS,
    null
  );
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
    JOB_RECRUITMENT_MODES,
    null
  );
}

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
  recruitment
) {
  const explicit =
    getFirstValue(
      recruitment,
      [
        'mode',
        'recruitmentMode',
        'recruitmentType',
        'entryMode'
      ]
    ) ??
    getFirstValue(
      job,
      [
        'mode',
        'recruitmentMode',
        'recruitmentType',
        'entryMode'
      ]
    );

  const direct =
    normalizeRecruitmentMode(
      explicit
    );

  if (
    direct
  ) {
    return direct;
  }

  const route =
    getFirstValue(
      recruitment,
      [
        'route',
        'recruitmentRoute'
      ]
    ) ??
    getFirstValue(
      job,
      [
        'route',
        'recruitmentRoute'
      ]
    );

  const key =
    cleanString(
      route,
      ''
    ).toUpperCase();

  return (
    RECRUITMENT_ROUTE_TO_MODE[
      key
    ] ||
    null
  );
}

function normalizeCareerStatus(
  value
) {
  const direct =
    normalizeEnumIgnoreCase(
      value,
      JOB_CAREER_STATUSES,
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  /*
   * The source explicitly uses RECURRING_CAREER for an ongoing career route.
   * This is the one source-specific legacy mapping retained here.
   */
  if (
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

/* -------------------------------------------------------------------------- */
/* Job normalization                                                          */
/* -------------------------------------------------------------------------- */

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
  const identitySource =
    isPlainObject(
      job.identity
    )
      ? job.identity
      : {};

  const identity =
    {};

  const governmentId =
    cleanId(
      identitySource.governmentId ??
      job.governmentId ??
      context.governmentId ??
      context.metadata?.governmentId
    );

  const stateId =
    cleanId(
      identitySource.stateId ??
      job.stateId ??
      context.stateId ??
      context.metadata?.stateId
    );

  if (
    governmentId
  ) {
    identity.governmentId =
      governmentId;
  }

  if (
    stateId
  ) {
    identity.stateId =
      stateId;
  }

  [
    'departmentId',
    'organisationId',
    'serviceCadreId',
    'parentPostId'
  ].forEach(
    field => {
      const value =
        cleanId(
          identitySource[
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
  );

  const post =
    identitySource.post ??
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
    identitySource.abbreviation ??
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
    identitySource.roleType ??
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
    identitySource.description ??
    job.description;

  if (
    description !==
      undefined &&
    description !==
      null
  ) {
    identity.description =
      normalizeLocalizedText(
        description
      );
  }

  const aliases =
    normalizeStringArray(
      identitySource.aliases ??
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
      identitySource.historicalNames ??
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

  const rawRoute =
    source.routeIds ??
    source.route ??
    source.recruitmentRoute ??
    job.routeIds ??
    job.recruitmentRoute;

  const routeIds =
    normalizeIdArray(
      rawRoute
    );

  if (
    routeIds.length
  ) {
    recruitment.routeIds =
      routeIds;
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
      source.careerStatus ??
      job.careerStatus ??
      job.currentStatus
    );

  if (
    careerStatus
  ) {
    recruitment.careerStatus =
      careerStatus;
  }

  /*
   * Fresh-entry eligibility is a factual Boolean. A recruitment route does
   * not establish it. Only an explicit Boolean-equivalent source value is
   * accepted.
   */
  const freshEntry =
    normalizeOptionalBoolean(
      source.freshEntryEligible ??
      job.freshEntryEligible
    );

  if (
    freshEntry !==
      null
  ) {
    recruitment.freshEntryEligible =
      freshEntry;
  }

  const currentRecruitmentStatus =
    normalizeEnumIgnoreCase(
      source.currentRecruitmentStatus ??
      job.currentRecruitmentStatus,
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
    currentRecruitmentStatus
  ) {
    recruitment.currentRecruitmentStatus =
      currentRecruitmentStatus;
  }

  const recruitmentNotes =
    source.recruitmentNotes ??
    job.recruitmentNotes;

  if (
    recruitmentNotes !==
      undefined
  ) {
    recruitment.recruitmentNotes =
      normalizeLocalizedText(
        recruitmentNotes
      );
  }

  return recruitment;
}

function normalizeBaEnglishAssessment(
  value
) {
  const normalized =
    cleanString(
      value,
      ''
    ).toUpperCase();

  if (
    !normalized
  ) {
    return null;
  }

  const direct =
    normalizeEnumIgnoreCase(
      normalized,
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

  /*
   * These are explicit values from the source BA-English assessment field.
   * They are reduced to the canonical assessment vocabulary only; they do
   * not become candidate eligibility results.
   */
  if (
    normalized.startsWith(
      'DIRECT_WITH_'
    ) ||
    normalized.startsWith(
      'DIRECT_ACADEMIC_'
    )
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

  return null;
}

function normalizeQualificationReferenceIds(
  source,
  job,
  governmentId
) {
  const direct =
    normalizeIdArray(
      source.qualificationIds ??
      source.qualificationId ??
      job.qualificationIds ??
      job.qualificationId ??
      source.requiredQualificationIds ??
      job.requiredQualificationIds
    );

  if (
    direct.length
  ) {
    return direct;
  }

  /*
   * Established Central-data compatibility contract:
   *
   * Central jobs use `qualificationRuleIds` for actual qualification IDs,
   * while `eligibilityRuleIds` separately stores eligibility-rule IDs.
   *
   * West Bengal uses the same legacy field name for eligibility-rule IDs.
   * Therefore this mapping is explicitly restricted to the Central government
   * identity and is never performed by ID prefix or name matching.
   */
  if (
    governmentId ===
    'central-government'
  ) {
    return normalizeIdArray(
      job.qualificationRuleIds ??
      source.qualificationRuleIds
    );
  }

  return [];
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
   * entryLevel is an education level, not the required human-readable
   * qualification statement. It therefore must not populate
   * minimumQualification.
   */
  const minimum =
    getFirstValue(
      source,
      [
        'minimumQualification',
        'minimumQualificationSummary',
        'educationalQualification',
        'educationRequirement',
        'requiredQualification'
      ]
    ) ??
    getFirstValue(
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
    typeof minimum ===
    'string' &&
    cleanNullableString(
      minimum
    )
  ) {
    eligibility.minimumQualification =
      cleanString(
        minimum
      );
  } else if (
    isPlainObject(
      minimum
    )
  ) {
    const localized =
      normalizeLocalizedText(
        minimum
      );

    if (
      localized.en
    ) {
      eligibility.minimumQualification =
        localized;
    }
  }

  const governmentId =
    cleanId(
      job.governmentId
    );

  const qualificationIds =
    normalizeQualificationReferenceIds(
      source,
      job,
      governmentId
    );

  if (
    qualificationIds.length
  ) {
    eligibility.qualificationIds =
      qualificationIds;
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
      normalizeLocalizedText(
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
      normalizeLocalizedText(
        notes
      );
  }

  return eligibility;
}

/* -------------------------------------------------------------------------- */
/* Job lifestyle / analysis                                                   */
/* -------------------------------------------------------------------------- */

const LIFESTYLE_FIELDS = Object.freeze([
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

  const desk =
    normalizeEnumIgnoreCase(
      source.deskField ??
      work.deskField,
      [
        'MOSTLY_OFFICE',
        'OFFICE_PLUS_FIELD',
        'MOSTLY_FIELD',
        'OPERATIONAL',
        'MIXED',
        'NOT_VERIFIED'
      ],
      null
    );

  if (
    desk
  ) {
    lifestyle.deskField =
      desk;
  }

  const mappings = {
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
    LIFESTYLE_FIELDS
  ) {
    const raw =
      mappings[
        field
      ].find(
        value =>
          value !==
            undefined &&
          value !==
            null
      );

    const value =
      normalizeNumber(
        raw,
        {
          min:
            0,

          max:
            10
        }
      );

    if (
      value !==
      null
    ) {
      lifestyle[
        field
      ] =
        value;
    }
  }

  const statusMappings = {
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

  Object.entries(
    statusMappings
  ).forEach(
    ([
      field,
      candidates
    ]) => {
      const raw =
        candidates.find(
          value =>
            value !==
              undefined &&
            value !==
              null
        );

      const value =
        normalizeEnumIgnoreCase(
          raw,
          allowed[
            field
          ],
          null
        );

      if (
        value
      ) {
        lifestyle[
          field
        ] =
          value;
      }
    }
  );

  return lifestyle;
}

const ANALYSIS_SCORE_FIELDS =
  Object.freeze([
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

  ANALYSIS_SCORE_FIELDS.forEach(
    field => {
      const value =
        normalizeNumber(
          source[
            field
          ] ??
          job[
            field
          ],
          {
            min:
              0,

            max:
              10
          }
        );

      if (
        value !==
        null
      ) {
        analysis[
          field
        ] =
          value;
      }
    }
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

  const notes =
    source.analyticalNotes ??
    job.analyticalNotes;

  if (
    notes !==
      undefined
  ) {
    analysis.analyticalNotes =
      normalizeLocalizedText(
        notes
      );
  }

  return analysis;
}

function normalizeJob(
  job,
  context = {}
) {
  if (
    !isPlainObject(
      job
    )
  ) {
    return null;
  }

  const identity =
    normalizeJobIdentity(
      job,
      context
    );

  const recruitment =
    normalizeJobRecruitment(
      job
    );

  const eligibility =
    normalizeJobEligibility(
      job
    );

  const result = {
    id:
      cleanId(
        job.id
      ),

    identity,

    recruitment,

    eligibility,

    payProfileId:
      cleanId(
        job.payProfileId ??
        job.pay?.payProfileId ??
        job.pay?.payId
      ),

    locationProfileId:
      cleanId(
        job.locationProfileId ??
        job.posting?.locationProfileId ??
        job.posting?.profileId
      ),

    housingProfileId:
      cleanId(
        job.housingProfileId ??
        job.housing?.housingProfileId
      ),

    promotionProfileId:
      cleanId(
        job.promotionProfileId ??
        job.promotion?.promotionProfileId ??
        job.promotion?.profileId
      ),

    benefitProfileId:
      cleanId(
        job.benefitProfileId ??
        job.benefits?.benefitProfileId ??
        job.benefits?.benefitsProfileId ??
        job.benefits?.profileId
      ),

    lifestyle:
      normalizeLifestyle(
        job
      ),

    analysis:
      normalizeAnalysis(
        job
      ),

    sourceIds:
      normalizeIdArray(
        job.sourceIds
      )
  };

  const confidence =
    normalizeConfidence(
      job.confidence
    );

  if (
    confidence
  ) {
    result.confidence =
      confidence;
  }

  const currentness =
    normalizeCurrentness(
      job.currentness ??
      job.sourceCurrentness
    );

  if (
    currentness
  ) {
    result.currentness =
      currentness;
  }

  const lastVerified =
    normalizeDate(
      job.lastVerified
    );

  if (
    lastVerified
  ) {
    result.lastVerified =
      lastVerified;
  }

  const dataVersion =
    cleanNullableString(
      job.dataVersion
    );

  if (
    dataVersion
  ) {
    result.dataVersion =
      dataVersion;
  }

  if (
    !result.lastVerified &&
    context.metadata?.lastVerified
  ) {
    result.lastVerified =
      normalizeDate(
        context.metadata.lastVerified
      );
  }

  if (
    !result.dataVersion &&
    context.metadata?.dataVersion
  ) {
    result.dataVersion =
      cleanString(
        context.metadata.dataVersion
      );
  }

  /*
   * Strict canonical Job output:
   *
   * No entityType field, no synthetic jobId, no searchText, and no raw
   * source-only compatibility properties are injected into the schema object.
   *
   * The legacy BA assessment is represented by eligibility.baEnglishAssessment
   * only when the source explicitly supplies it; it does not become the
   * candidate eligibility authority.
   */
  return removeNullish(
    result
  );
}

/* -------------------------------------------------------------------------- */
/* Exam normalization                                                         */
/* -------------------------------------------------------------------------- */

function normalizeExam(
  exam,
  context = {}
) {
  if (
    !isPlainObject(
      exam
    )
  ) {
    return null;
  }

  /*
   * The source examination model uses selectionStages while the canonical
   * schema requires an ordered array of stage objects.
   *
   * Known source labels are mapped explicitly. Unknown stage labels retain
   * their original source wording under canonical type OTHER.
   */
  const stageTypeMap = {
    PRELIMINARY:
      'PRELIMINARY',

    PRELIMS:
      'PRELIMINARY',

    MAIN:
      'MAIN',

    MAINS:
      'MAIN',

    DESCRIPTIVE:
      'DESCRIPTIVE',

    INTERVIEW:
      'INTERVIEW',

    PERSONALITY_TEST:
      'PERSONALITY_TEST',

    SSB_INTERVIEW:
      'PERSONALITY_TEST',

    INTERVIEW_PERSONALITY_TEST:
      'PERSONALITY_TEST',

    PHYSICAL:
      'PHYSICAL',

    MEDICAL:
      'MEDICAL',

    SKILL_TEST:
      'SKILL_TEST',

    SKILL_OR_TYPING_TEST_WHERE_APPLICABLE:
      'SKILL_TEST',

    TYPING_TEST:
      'TYPING_TEST',

    DOCUMENT_VERIFICATION:
      'DOCUMENT_VERIFICATION'
  };

  const stages =
    Array.isArray(
      exam.stages
    )
      ? exam.stages
      : (
          Array.isArray(
            exam.selectionStages
          )
            ? exam.selectionStages
            : []
        );

  const normalizedStages =
    stages
      .map(
        (
          stage,
          index
        ) => {
          if (
            isPlainObject(
              stage
            )
          ) {
            return removeNullish({
              order:
                normalizeNumber(
                  stage.order ??
                  (
                    index +
                    1
                  ),
                  {
                    integer:
                      true,

                    min:
                      1
                  }
                ),

              type:
                normalizeEnumIgnoreCase(
                  stage.type,
                  [
                    'PRELIMINARY',
                    'MAIN',
                    'DESCRIPTIVE',
                    'INTERVIEW',
                    'PERSONALITY_TEST',
                    'PHYSICAL',
                    'MEDICAL',
                    'SKILL_TEST',
                    'TYPING_TEST',
                    'DOCUMENT_VERIFICATION',
                    'OTHER'
                  ],
                  null
                ),

              name:
                cleanNullableString(
                  stage.name
                ),

              description:
                cleanNullableString(
                  stage.description
                ),

              mandatory:
                normalizeOptionalBoolean(
                  stage.mandatory
                )
            });
          }

          const sourceName =
            cleanString(
              stage,
              ''
            );

          if (
            !sourceName
          ) {
            return null;
          }

          const key =
            sourceName
              .toUpperCase()
              .replace(
                /[^A-Z0-9]+/g,
                '_'
              );

          const type =
            stageTypeMap[
              key
            ] ||
            'OTHER';

          return {
            order:
              index +
              1,

            type,

            name:
              sourceName
          };
        }
      )
      .filter(Boolean);

  const status =
    normalizeEnumIgnoreCase(
      exam.status,
      [
        'ACTIVE',
        'CURRENT_RECRUITMENT',
        'RECENTLY_COMPLETED',
        'HISTORICAL',
        'DISCONTINUED',
        'NOT_VERIFIED'
      ],
      null
    );

  const frequencyRaw =
    cleanString(
      exam.recruitmentFrequency ??
      exam.frequency,
      ''
    ).toUpperCase();

  const frequency =
    {
      ANNUAL:
        'ANNUAL',

      NEARLY_ANNUAL:
        'NEARLY_ANNUAL',

      PERIODIC:
        'PERIODIC',

      TWICE_YEARLY:
        'PERIODIC',

      ANNUAL_OR_PERIODIC:
        'PERIODIC',

      IRREGULAR:
        'IRREGULAR',

      RARE:
        'RARE',

      DEPARTMENT_SPECIFIC:
        'DEPARTMENT_SPECIFIC',

      NOT_VERIFIED:
        'NOT_VERIFIED'
    }[
      frequencyRaw
    ] ||
    null;

  let physicalRequirements;

  if (
    isPlainObject(
      exam.physicalRequirements
    )
  ) {
    physicalRequirements =
      cloneValue(
        exam.physicalRequirements
      );
  } else {
    const explicit =
      normalizeOptionalBoolean(
        exam.physicalRequirement
      );

    if (
      explicit !==
      null
    ) {
      physicalRequirements =
        {
          required:
            explicit
        };
    } else if (
      cleanNullableString(
        exam.physicalRequirement
      )
    ) {
      physicalRequirements =
        {
          status:
            cleanString(
              exam.physicalRequirement
            )
        };
    }
  }

  const result = {
    id:
      cleanId(
        exam.id
      ),

    name:
      normalizeLocalizedText(
        exam.name ??
        exam.title
      ),

    fullName:
      cleanNullableString(
        exam.fullName
      ),

    abbreviation:
      cleanNullableString(
        exam.abbreviation
      ),

    governmentId:
      cleanId(
        exam.governmentId ??
        context.governmentId ??
        context.metadata?.governmentId
      ),

    stateId:
      cleanId(
        exam.stateId ??
        context.stateId ??
        context.metadata?.stateId
      ),

    authorityId:
      cleanId(
        exam.authorityId ??
        exam.recruitingAuthorityId
      ),

    departmentIds:
      normalizeIdArray(
        exam.departmentIds ??
        exam.departmentId
      ),

    organisationIds:
      normalizeIdArray(
        exam.organisationIds ??
        exam.organisationId
      ),

    qualificationRuleIds:
      normalizeIdArray(
        exam.qualificationRuleIds
      ),

    stages:
      normalizedStages,

    skillTests:
      cloneValue(
        exam.skillTests
      ),

    physicalRequirements,

    medicalRequirements:
      cloneValue(
        exam.medicalRequirements
      ),

    syllabus:
      cloneValue(
        exam.syllabus
      ),

    attemptRules:
      cloneValue(
        exam.attemptRules
      ),

    difficulty:
      normalizeEnumIgnoreCase(
        exam.difficulty,
        [
          'EASY',
          'MODERATE',
          'HARD',
          'VERY_HARD',
          'EXTREME',
          'NOT_VERIFIED'
        ],
        null
      ),

    preparationBurden:
      normalizeEnumIgnoreCase(
        exam.preparationBurden,
        [
          'LOW',
          'MODERATE',
          'HIGH',
          'VERY_HIGH',
          'EXTREME',
          'NOT_VERIFIED'
        ],
        null
      ),

    recruitmentFrequency:
      frequency,

    mainPostIds:
      normalizeIdArray(
        exam.mainPostIds ??
        exam.postIds ??
        exam.jobIds
      ),

    recruitmentIds:
      normalizeIdArray(
        exam.recruitmentIds
      ),

    status,

    sourceIds:
      normalizeIdArray(
        exam.sourceIds
      ),

    confidence:
      normalizeConfidence(
        exam.confidence
      ),

    lastVerified:
      normalizeDate(
        exam.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        exam.dataVersion ??
        context.metadata?.dataVersion
      )
  };

  return removeNullish(
    result
  );
}

/* -------------------------------------------------------------------------- */
/* Organisation structure                                                     */
/* -------------------------------------------------------------------------- */

function normalizeDepartment(
  department,
  context = {}
) {
  if (
    !isPlainObject(
      department
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        department.id
      ),

    governmentId:
      cleanId(
        department.governmentId ??
        context.governmentId ??
        context.metadata?.governmentId
      ),

    stateId:
      cleanId(
        department.stateId ??
        context.stateId ??
        context.metadata?.stateId
      ),

    name:
      normalizeLocalizedText(
        department.name ??
        department.title
      ),

    shortName:
      cleanNullableString(
        department.shortName
      ),

    type:
      normalizeEnumIgnoreCase(
        department.type,
        [
          'MINISTRY',
          'DEPARTMENT',
          'SECRETARIAT',
          'DIRECTORATE',
          'ATTACHED_DEPARTMENT',
          'SUBORDINATE_DEPARTMENT',
          'OTHER'
        ],
        null
      ),

    description:
      department.description ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            department.description
          ),

    website:
      cleanNullableString(
        department.website
      ),

    directorateIds:
      normalizeIdArray(
        department.directorateIds
      ),

    organisationIds:
      normalizeIdArray(
        department.organisationIds
      ),

    serviceCadreIds:
      normalizeIdArray(
        department.serviceCadreIds
      ),

    sourceIds:
      normalizeIdArray(
        department.sourceIds
      ),

    status:
      normalizeEnumIgnoreCase(
        department.status,
        [
          'ACTIVE',
          'HISTORICAL',
          'REPLACED',
          'ABOLISHED',
          'NOT_VERIFIED'
        ],
        null
      ),

    confidence:
      normalizeConfidence(
        department.confidence
      ),

    lastVerified:
      normalizeDate(
        department.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        department.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

function normalizeOrganisation(
  organisation,
  context = {}
) {
  if (
    !isPlainObject(
      organisation
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        organisation.id
      ),

    governmentId:
      cleanId(
        organisation.governmentId ??
        context.governmentId ??
        context.metadata?.governmentId
      ),

    stateId:
      cleanId(
        organisation.stateId ??
        context.stateId ??
        context.metadata?.stateId
      ),

    departmentId:
      cleanId(
        organisation.departmentId
      ),

    name:
      normalizeLocalizedText(
        organisation.name ??
        organisation.title
      ),

    shortName:
      cleanNullableString(
        organisation.shortName
      ),

    type:
      normalizeEnumIgnoreCase(
        organisation.type,
        [
          'COMMISSION',
          'BOARD',
          'DIRECTORATE',
          'POLICE_ORGANISATION',
          'POLICE_FORCE',
          'CENTRAL_ARMED_FORCE',
          'RAILWAY_ORGANISATION',
          'AUTHORITY',
          'ATTACHED_OFFICE',
          'SUBORDINATE_OFFICE',
          'STATUTORY_BODY',
          'AUTONOMOUS_BODY',
          'PUBLIC_BODY',
          'OTHER'
        ],
        null
      ),

    description:
      organisation.description ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            organisation.description
          ),

    website:
      cleanNullableString(
        organisation.website
      ),

    sourceIds:
      normalizeIdArray(
        organisation.sourceIds
      ),

    status:
      normalizeEnumIgnoreCase(
        organisation.status,
        [
          'ACTIVE',
          'HISTORICAL',
          'REPLACED',
          'ABOLISHED',
          'NOT_VERIFIED'
        ],
        null
      ),

    confidence:
      normalizeConfidence(
        organisation.confidence
      ),

    lastVerified:
      normalizeDate(
        organisation.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        organisation.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

/* -------------------------------------------------------------------------- */
/* Service-cadre normalization                                                */
/* -------------------------------------------------------------------------- */

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

  return removeNullish({
    scopeType:
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
      ),

    stateIds:
      normalizeIdArray(
        value.stateIds
      ),

    regionNames:
      normalizeStringArray(
        value.regionNames
      ),

    districtNames:
      normalizeStringArray(
        value.districtNames
      ),

    description:
      value.description ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            value.description
          )
  });
}

function normalizePostingScope(
  value
) {
  if (
    typeof value ===
    'string'
  ) {
    const mappings = {
      STATEWIDE:
        'STATE_WIDE',

      STATE_WIDE:
        'STATE_WIDE',

      ALL_INDIA:
        'ALL_INDIA',

      REGIONAL:
        'REGIONAL',

      ZONE:
        'ZONE',

      DISTRICT:
        'DISTRICT',

      CITY:
        'CITY',

      DEPARTMENTAL:
        'DEPARTMENTAL',

      ORGANISATION_SPECIFIC:
        'ORGANISATION_SPECIFIC',

      OTHER:
        'OTHER',

      UNKNOWN:
        'UNKNOWN'
    };

    const scopeType =
      mappings[
        cleanString(
          value,
          ''
        ).toUpperCase()
      ];

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

  return removeNullish({
    scopeType:
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
      ),

    locationIds:
      normalizeIdArray(
        value.locationIds
      ),

    stateIds:
      normalizeIdArray(
        value.stateIds
      ),

    description:
      value.description ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            value.description
          )
  });
}

function normalizeServiceType(
  type,
  serviceNature
) {
  const direct =
    normalizeEnumIgnoreCase(
      type,
      SERVICE_TYPES,
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  /*
   * Explicit source semantic field only. No service-name inference.
   */
  return (
    SERVICE_TYPE_BY_NATURE[
      cleanString(
        serviceNature,
        ''
      ).toUpperCase()
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
    .map(
      route => {
        if (
          !isPlainObject(
            route
          )
        ) {
          return null;
        }

        return removeNullish({
          routeType:
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
            ),

          examIds:
            normalizeIdArray(
              route.examIds
            ),

          recruitmentIds:
            normalizeIdArray(
              route.recruitmentIds
            ),

          description:
            route.description ===
              undefined
              ? undefined
              : normalizeLocalizedText(
                  route.description
                )
        });
      }
    )
    .filter(Boolean);
}

function normalizeServiceCadre(
  serviceCadre,
  context = {}
) {
  if (
    !isPlainObject(
      serviceCadre
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        serviceCadre.id
      ),

    name:
      normalizeLocalizedText(
        serviceCadre.name
      ),

    shortName:
      serviceCadre.shortName ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            serviceCadre.shortName
          ),

    fullForm:
      cleanNullableString(
        serviceCadre.fullForm
      ),

    governmentId:
      cleanId(
        serviceCadre.governmentId ??
        context.governmentId ??
        context.metadata?.governmentId
      ),

    stateId:
      cleanId(
        serviceCadre.stateId ??
        context.stateId ??
        context.metadata?.stateId
      ),

    ministryId:
      cleanId(
        serviceCadre.ministryId
      ),

    departmentId:
      cleanId(
        serviceCadre.departmentId
      ),

    organisationId:
      cleanId(
        serviceCadre.organisationId
      ),

    parentServiceCadreId:
      cleanId(
        serviceCadre.parentServiceCadreId
      ),

    type:
      normalizeServiceType(
        serviceCadre.type,
        serviceCadre.serviceNature
      ),

    serviceGroup:
      normalizeEnumIgnoreCase(
        serviceCadre.serviceGroup,
        [
          'GROUP_A',
          'GROUP_B',
          'GROUP_C',
          'GROUP_D',
          'OTHER',
          'UNKNOWN'
        ],
        null
      ),

    cadreControl:
      normalizeEnumIgnoreCase(
        serviceCadre.cadreControl,
        [
          'STATE',
          'CENTRAL',
          'JOINT',
          'DEPARTMENTAL',
          'ORGANISATION_SPECIFIC',
          'UNKNOWN'
        ],
        null
      ),

    classification:
      normalizeEnumIgnoreCase(
        serviceCadre.classification,
        [
          'STATE_GOVERNMENT_SERVICE',
          'CENTRAL_GOVERNMENT_SERVICE',
          'LOCAL_GOVERNMENT_SERVICE',
          'STATUTORY_BODY_SERVICE',
          'CORPORATION_SERVICE',
          'PSU_SERVICE',
          'AUTONOMOUS_BODY_SERVICE',
          'OTHER',
          'UNKNOWN'
        ],
        null
      ),

    cadreAuthority:
      cloneValue(
        serviceCadre.cadreAuthority
      ),

    cadreScope:
      normalizeCadreScope(
        serviceCadre.cadreScope
      ),

    entryRoutes:
      normalizeEntryRoutes(
        serviceCadre.entryRoutes
      ),

    postIds:
      normalizeIdArray(
        serviceCadre.postIds
      ),

    examIds:
      normalizeIdArray(
        serviceCadre.examIds
      ),

    recruitmentIds:
      normalizeIdArray(
        serviceCadre.recruitmentIds
      ),

    recruitmentRouteIds:
      normalizeIdArray(
        serviceCadre.recruitmentRouteIds
      ),

    eligibilityRuleIds:
      normalizeIdArray(
        serviceCadre.eligibilityRuleIds
      ),

    payIds:
      normalizeIdArray(
        serviceCadre.payIds
      ),

    promotionIds:
      normalizeIdArray(
        serviceCadre.promotionIds
      ),

    benefitIds:
      normalizeIdArray(
        serviceCadre.benefitIds
      ),

    locationIds:
      normalizeIdArray(
        serviceCadre.locationIds
      ),

    postingScope:
      normalizePostingScope(
        serviceCadre.postingScope
      ),

    transferControl:
      cloneValue(
        serviceCadre.transferControl
      ),

    serviceRuleReferences:
      cloneValue(
        serviceCadre.serviceRuleReferences
      ),

    keywords:
      normalizeStringArray(
        serviceCadre.keywords
      ),

    description:
      serviceCadre.description ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            serviceCadre.description
          ),

    status:
      normalizeEnumIgnoreCase(
        serviceCadre.status,
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
      ),

    effectiveFrom:
      normalizeDate(
        serviceCadre.effectiveFrom
      ),

    effectiveTo:
      normalizeDate(
        serviceCadre.effectiveTo
      ),

    historicalNames:
      normalizeStringArray(
        serviceCadre.historicalNames
      ),

    notes:
      serviceCadre.notes ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            serviceCadre.notes
          ),

    sourceIds:
      normalizeIdArray(
        serviceCadre.sourceIds
      ),

    sourceReferences:
      normalizeSources(
        serviceCadre.sourceReferences
      ),

    version:
      cleanNullableString(
        serviceCadre.version
      )
  });
}

/* -------------------------------------------------------------------------- */
/* Eligibility-rule normalization                                             */
/* -------------------------------------------------------------------------- */

function mapEligibilityRuleTarget(
  rule
) {
  const targetType =
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

  const targetId =
    cleanId(
      rule.targetId
    );

  if (
    targetType &&
    targetId
  ) {
    return {
      targetType,

      targetId
    };
  }

  /*
   * These are explicit relationship fields only.
   *
   * No name matching, prefix inference, rule-description matching or
   * organisation/title similarity is performed.
   */
  const explicit = [
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
      type,
      idValue
    ] of explicit
  ) {
    const id =
      cleanId(
        idValue
      );

    if (
      id
    ) {
      return {
        targetType:
          type,

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
      RULE_CLASSES,
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  /*
   * These mappings are based on the repository's actual ruleType values.
   * They are explicit controlled mappings, not free-text inference.
   */
  const type =
    cleanString(
      rule.ruleType,
      ''
    ).toUpperCase();

  const mappings = {
    HARD_ELIGIBILITY:
      'HARD',

    PHYSICAL_REQUIREMENT:
      'HARD',

    MEDICAL_REQUIREMENT:
      'HARD',

    ELIGIBILITY_CONDITION:
      'HARD',

    SKILL_REQUIREMENT:
      'HARD',

    LANGUAGE_REQUIREMENT:
      'HARD',

    SOFT_REQUIREMENT:
      'SOFT',

    SOFT_ELIGIBILITY:
      'SOFT'
  };

  return (
    mappings[
      type
    ] ||
    null
  );
}

function normalizeConditionType(
  rule
) {
  const direct =
    normalizeEnumIgnoreCase(
      rule.conditionType,
      RULE_CONDITION_TYPES,
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  const subjectField =
    cleanString(
      rule.subject?.field,
      ''
    ).toLowerCase();

  const subjectMappings = {
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

    languages:
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

    typingskill:
      'TYPING',

    shorthand:
      'SHORTHAND',

    computerknowledge:
      'COMPUTER_KNOWLEDGE',

    computercertificate:
      'COMPUTER_CERTIFICATE'
  };

  /*
   * Composite source subjects such as physicalAndMedicalProfile and
   * postSpecificRequirements intentionally do not map to an unrelated
   * single condition type.
   */
  return (
    subjectMappings[
      subjectField
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
      RULE_EFFECTS,
      null
    );

  if (
    direct
  ) {
    return direct;
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

  const failureStatus =
    cleanString(
      rule.failureStatus,
      ''
    ).toUpperCase();

  const ruleType =
    cleanString(
      rule.ruleType,
      ''
    ).toUpperCase();

  /*
   * Canonical engine semantics:
   *
   * A positive eligibility requirement uses ALLOW. The rule is satisfied when
   * the condition evaluates true; failureStatus describes the outcome when it
   * does not. Using DENY here would invert that meaning in the evaluator.
   *
   * The source currently uses both NOT_ELIGIBLE and CONDITION_NOT_MET for this
   * class of positive requirement.
   */
  if (
    (
      failureStatus ===
        'NOT_ELIGIBLE' ||
      failureStatus ===
        'CONDITION_NOT_MET'
    ) &&
    [
      'HARD_ELIGIBILITY',
      'PHYSICAL_REQUIREMENT',
      'MEDICAL_REQUIREMENT',
      'ELIGIBILITY_CONDITION',
      'SKILL_REQUIREMENT',
      'LANGUAGE_REQUIREMENT'
    ].includes(
      ruleType
    )
  ) {
    return 'ALLOW';
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
    return removeNullish({
      mode:
        normalizeEnumIgnoreCase(
          value.mode,
          [
            'ALL_OF',
            'ANY_OF',
            'NONE_OF'
          ],
          null
        ),

      ruleIds:
        normalizeIdArray(
          value.ruleIds
        )
    });
  }

  const modeMappings = {
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
    modeMappings[
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

function normalizeVerificationRequirement(
  rule
) {
  const unknownStatus =
    cleanString(
      rule.unknownStatus,
      ''
    ).toUpperCase();

  if (
    ![
      'REQUIRES_MANUAL_VERIFICATION',
      'REQUIRES_VERIFICATION',
      'REVIEW_REQUIRED'
    ].includes(
      unknownStatus
    )
  ) {
    return null;
  }

  return removeNullish({
    required:
      true,

    reason:
      rule.explanation ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            rule.explanation
          )
  });
}

function normalizeEligibilityRule(
  rule,
  context = {}
) {
  if (
    !isPlainObject(
      rule
    )
  ) {
    return null;
  }

  const target =
    mapEligibilityRuleTarget(
      rule
    );

  const result = {
    id:
      cleanId(
        rule.id
      ),

    name:
      normalizeLocalizedText(
        rule.name
      ),

    description:
      rule.description !==
        undefined
        ? normalizeLocalizedText(
            rule.description
          )
        : (
            rule.explanation !==
              undefined
              ? normalizeLocalizedText(
                  rule.explanation
                )
              : undefined
          ),

    targetType:
      target.targetType,

    targetId:
      target.targetId,

    ruleClass:
      normalizeRuleClass(
        rule
      ),

    conditionType:
      normalizeConditionType(
        rule
      ),

    operator:
      normalizeEnumIgnoreCase(
        rule.operator,
        RULE_OPERATORS,
        null
      ),

    value:
      rule.value,

    logic:
      normalizeRuleLogic(
        rule.logic
      ),

    effect:
      normalizeRuleEffect(
        rule
      ),

    verificationRequirement:
      normalizeVerificationRequirement(
        rule
      ),

    qualificationIds:
      normalizeIdArray(
        rule.qualificationIds
      ),

    requiredQualificationIds:
      normalizeIdArray(
        rule.requiredQualificationIds ??
        rule.requiredQualifications
      ),

    subjectIds:
      normalizeIdArray(
        rule.subjectIds
      ),

    requiredSubjectIds:
      normalizeIdArray(
        rule.requiredSubjectIds
      ),

    educationLevel:
      normalizeEnumIgnoreCase(
        rule.educationLevel,
        JOB_EDUCATION_LEVELS,
        null
      ),

    minimumEducationLevel:
      normalizeEnumIgnoreCase(
        rule.minimumEducationLevel,
        [
          'CLASS_8',
          'CLASS_10',
          'CLASS_12',
          'DIPLOMA',
          'GRADUATE',
          'POSTGRADUATE',
          'PROFESSIONAL',
          'UNDERGRADUATE',
          'DOCTORAL'
        ],
        null
      ),

    degreeNames:
      normalizeStringArray(
        rule.degreeNames
      ),

    subjectNames:
      normalizeStringArray(
        rule.subjectNames
      ),

    minimumMarks:
      normalizeNumber(
        rule.minimumMarks,
        {
          min:
            0
        }
      ),

    maximumMarks:
      normalizeNumber(
        rule.maximumMarks,
        {
          min:
            0
        }
      ),

    minimumPercentage:
      normalizeNumber(
        rule.minimumPercentage,
        {
          min:
            0,

          max:
            100
        }
      ),

    maximumPercentage:
      normalizeNumber(
        rule.maximumPercentage,
        {
          min:
            0,

          max:
            100
        }
      ),

    requiredLanguages:
      normalizeStringArray(
        rule.requiredLanguages
      ),

    requiredSkills:
      normalizeStringArray(
        rule.requiredSkills
      ),

    requiredComputerKnowledge:
      normalizeStringArray(
        rule.requiredComputerKnowledge
      ),

    typingRequirement:
      cloneValue(
        rule.typingRequirement
      ),

    shorthandRequirement:
      cloneValue(
        rule.shorthandRequirement
      ),

    licenceRequirements:
      cloneValue(
        rule.licenceRequirements
      ),

    requiredExperience:
      cloneValue(
        rule.requiredExperience
      ),

    minimumExperienceYears:
      normalizeNumber(
        rule.minimumExperienceYears,
        {
          min:
            0
        }
      ),

    maximumExperienceYears:
      normalizeNumber(
        rule.maximumExperienceYears,
        {
          min:
            0
        }
      ),

    minimumAge:
      normalizeNumber(
        rule.minimumAge,
        {
          integer:
            true,

          min:
            0
        }
      ),

    maximumAge:
      normalizeNumber(
        rule.maximumAge,
        {
          integer:
            true,

          min:
            0
        }
      ),

    ageReferenceDate:
      normalizeDate(
        rule.ageReferenceDate
      ),

    ageRelaxations:
      cloneValue(
        rule.ageRelaxations
      ),

    citizenship:
      cloneValue(
        rule.citizenship
      ),

    requiredNationality:
      normalizeStringArray(
        rule.requiredNationality
      ),

    domicileRequirement:
      cloneValue(
        rule.domicileRequirement
      ),

    reservationRequirement:
      cloneValue(
        rule.reservationRequirement
      ),

    categoryRequirement:
      normalizeStringArray(
        rule.categoryRequirement
      ),

    genderRequirement:
      normalizeEnumIgnoreCase(
        rule.genderRequirement,
        [
          'ANY',
          'MALE',
          'FEMALE',
          'OTHER'
        ],
        null
      ),

    recruitmentRouteTypes:
      normalizeStringArray(
        rule.recruitmentRouteTypes
      ),

    recruitmentIds:
      normalizeIdArray(
        rule.recruitmentIds
      ),

    physicalStandard:
      cloneValue(
        rule.physicalStandard
      ),

    medicalStandard:
      cloneValue(
        rule.medicalStandard
      ),

    eyesightRequirement:
      cloneValue(
        rule.eyesightRequirement
      ),

    documentRequirements:
      cloneValue(
        rule.documentRequirements
      ),

    exceptions:
      cloneValue(
        rule.exceptions
      ),

    dependsOnRuleIds:
      normalizeIdArray(
        rule.dependsOnRuleIds
      ),

    sourceIds:
      normalizeIdArray(
        rule.sourceIds
      ),

    sourceReferences:
      normalizeSources(
        rule.sourceReferences
      ),

    status:
      normalizeEnumIgnoreCase(
        rule.status,
        [
          'ACTIVE',
          'DRAFT',
          'DEPRECATED',
          'HISTORICAL',
          'SUPERSEDED',
          'UNKNOWN'
        ],
        null
      ),

    effectiveFrom:
      normalizeDate(
        rule.effectiveFrom
      ),

    effectiveTo:
      normalizeDate(
        rule.effectiveTo
      ),

    mandatory:
      normalizeOptionalBoolean(
        rule.mandatory
      ),

    conditional:
      normalizeOptionalBoolean(
        rule.conditional
      ),

    reviewRequired:
      normalizeOptionalBoolean(
        rule.reviewRequired
      ),

    notes:
      rule.notes ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            rule.notes
          ),

    confidence:
      normalizeConfidence(
        rule.confidence
      ),

    version:
      cleanNullableString(
        rule.version ??
        context.metadata?.version
      )
  };

  return removeNullishDeepArrays(
    result
  );
}

/* -------------------------------------------------------------------------- */
/* Recruitment and profile normalization                                      */
/* -------------------------------------------------------------------------- */

function normalizeRecruitment(
  recruitment,
  context = {}
) {
  if (
    !isPlainObject(
      recruitment
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        recruitment.id
      ),

    examId:
      cleanId(
        recruitment.examId
      ),

    jobIds:
      normalizeIdArray(
        recruitment.jobIds ??
        recruitment.postIds
      ),

    postIds:
      normalizeIdArray(
        recruitment.postIds ??
        recruitment.jobIds
      ),

    serviceCadreId:
      cleanId(
        recruitment.serviceCadreId
      ),

    departmentId:
      cleanId(
        recruitment.departmentId
      ),

    organisationId:
      cleanId(
        recruitment.organisationId
      ),

    mode:
      normalizeRecruitmentMode(
        recruitment.mode ??
        recruitment.recruitmentMode ??
        recruitment.recruitmentRoute
      ),

    status:
      normalizeEnumIgnoreCase(
        recruitment.status,
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
      ),

    currentness:
      normalizeCurrentness(
        recruitment.currentness
      ),

    sourceIds:
      normalizeIdArray(
        recruitment.sourceIds
      ),

    confidence:
      normalizeConfidence(
        recruitment.confidence
      ),

    lastVerified:
      normalizeDate(
        recruitment.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        recruitment.dataVersion ??
        context.metadata?.dataVersion
      ),

    notificationDate:
      normalizeDate(
        recruitment.notificationDate
      ),

    applicationStartDate:
      normalizeDate(
        recruitment.applicationStartDate
      ),

    applicationEndDate:
      normalizeDate(
        recruitment.applicationEndDate
      ),

    examDate:
      normalizeDate(
        recruitment.examDate
      ),

    resultDate:
      normalizeDate(
        recruitment.resultDate
      )
  });
}

function normalizeProfileSourceMetadata(
  record,
  context
) {
  return {
    sourceIds:
      normalizeIdArray(
        record.sourceIds
      ),

    confidence:
      normalizeConfidence(
        record.confidence
      ),

    lastVerified:
      normalizeDate(
        record.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        record.dataVersion ??
        context.metadata?.dataVersion
      )
  };
}

function normalizePay(
  pay,
  context = {}
) {
  if (
    !isPlainObject(
      pay
    )
  ) {
    return null;
  }

  const metadata =
    normalizeProfileSourceMetadata(
      pay,
      context
    );

  return removeNullish({
    id:
      cleanId(
        pay.id
      ),

    governmentId:
      cleanId(
        pay.governmentId ??
        context.governmentId ??
        context.metadata?.governmentId
      ),

    stateId:
      cleanId(
        pay.stateId ??
        context.stateId ??
        context.metadata?.stateId
      ),

    paySystem:
      cleanNullableString(
        pay.paySystem
      ),

    payCommission:
      cleanNullableString(
        pay.payCommission
      ),

    payLevel:
      cleanNullableString(
        pay.payLevel
      ),

    payScale:
      cleanNullableString(
        pay.payScale
      ),

    startingBasic:
      normalizeNumber(
        pay.startingBasic,
        {
          min:
            0
        }
      ),

    maximumBasic:
      normalizeNumber(
        pay.maximumBasic,
        {
          min:
            0
        }
      ),

    da:
      cloneValue(
        pay.da
      ),

    hra:
      cloneValue(
        pay.hra
      ),

    transportAllowance:
      cloneValue(
        pay.transportAllowance
      ),

    otherAllowances:
      cloneValue(
        pay.otherAllowances
      ),

    deductions:
      cloneValue(
        pay.deductions
      ),

    grossEstimate:
      cloneValue(
        pay.grossEstimate
      ),

    inHandEstimate:
      cloneValue(
        pay.inHandEstimate
      ),

    officialStatus:
      normalizeEnumIgnoreCase(
        pay.officialStatus,
        [
          'OFFICIAL',
          'CALCULATED',
          'ESTIMATED',
          'NOT_VERIFIED'
        ],
        null
      ),

    ...metadata
  });
}

function normalizeLocation(
  location,
  context = {}
) {
  if (
    !isPlainObject(
      location
    )
  ) {
    return null;
  }

  const metadata =
    normalizeProfileSourceMetadata(
      location,
      context
    );

  const rawType =
    cleanString(
      location.postingCategory ??
      location.type,
      ''
    ).toUpperCase();

  const postingCategory =
    normalizeEnumIgnoreCase(
      rawType,
      [
        'KOLKATA_CENTRIC',
        'WEST_BENGAL_WIDE',
        'DISTRICT_BASED',
        'RURAL_HEAVY',
        'URBAN_HEAVY',
        'ALL_INDIA',
        'DELHI_HEAVY',
        'REMOTE',
        'LOCATION_UNCERTAIN',
        'NOT_VERIFIED'
      ],
      null
    );

  return removeNullish({
    id:
      cleanId(
        location.id
      ),

    postingCategory,

    stateIds:
      normalizeIdArray(
        location.stateIds ??
        location.stateId
      ),

    districts:
      normalizeStringArray(
        location.districts
      ),

    cities:
      normalizeStringArray(
        location.cities
      ),

    headquartersLocations:
      normalizeStringArray(
        location.headquartersLocations
      ),

    kolkataStability:
      normalizeNumber(
        location.kolkataStability,
        {
          min:
            0,

          max:
            10
        }
      ),

    geographicStability:
      normalizeNumber(
        location.geographicStability,
        {
          min:
            0,

          max:
            10
        }
      ),

    ruralBurden:
      normalizeNumber(
        location.ruralBurden,
        {
          min:
            0,

          max:
            10
        }
      ),

    remoteBurden:
      normalizeNumber(
        location.remoteBurden,
        {
          min:
            0,

          max:
            10
        }
      ),

    transferBurden:
      normalizeNumber(
        location.transferBurden,
        {
          min:
            0,

          max:
            10
        }
      ),

    requestTransfer:
      cloneValue(
        location.requestTransfer
      ),

    promotionTransferRisk:
      cleanNullableString(
        location.promotionTransferRisk
      ),

    notes:
      cleanNullableString(
        location.notes
      ),

    ...metadata
  });
}

function normalizeHousing(
  housing,
  context = {}
) {
  if (
    !isPlainObject(
      housing
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        housing.id
      ),

    accommodationTypes:
      normalizeStringArray(
        housing.accommodationTypes
      ),

    entitlement:
      cleanNullableString(
        housing.entitlement
      ),

    eligibility:
      cleanNullableString(
        housing.eligibility
      ),

    availabilityStatus:
      normalizeEnumIgnoreCase(
        housing.availabilityStatus,
        [
          'MEANINGFUL_ADVANTAGE',
          'VACANCY_DEPENDENT',
          'DEPARTMENTAL',
          'LIMITED',
          'NONE_IDENTIFIED',
          'NOT_VERIFIED'
        ],
        null
      ),

    allotment:
      cloneValue(
        housing.allotment
      ),

    waitingList:
      cloneValue(
        housing.waitingList
      ),

    licenceFee:
      cloneValue(
        housing.licenceFee
      ),

    hraEffect:
      cloneValue(
        housing.hraEffect
      ),

    utilityCosts:
      cloneValue(
        housing.utilityCosts
      ),

    maintenanceCosts:
      cloneValue(
        housing.maintenanceCosts
      ),

    privateHousingAlternative:
      cloneValue(
        housing.privateHousingAlternative
      ),

    practicalLikelihood:
      cleanNullableString(
        housing.practicalLikelihood
      ),

    housingAdvantageScore:
      normalizeNumber(
        housing.housingAdvantageScore,
        {
          min:
            0,

          max:
            10
        }
      ),

    notes:
      cleanNullableString(
        housing.notes
      ),

    ...normalizeProfileSourceMetadata(
      housing,
      context
    )
  });
}

function normalizePromotionSteps(
  steps
) {
  if (
    !Array.isArray(
      steps
    )
  ) {
    return [];
  }

  return steps
    .map(
      step => {
        if (
          !isPlainObject(
            step
          )
        ) {
          return null;
        }

        return removeNullish({
          order:
            normalizeNumber(
              step.order,
              {
                integer:
                  true,

                min:
                  1
              }
            ),

          designation:
            normalizeLocalizedText(
              step.designation
            ),

          minimumQualifyingService:
            cleanNullableString(
              step.minimumQualifyingService
            ),

          method:
            normalizeStringArray(
              step.method
            ),

          vacancyDependence:
            normalizeOptionalBoolean(
              step.vacancyDependence
            ),

          certainty:
            normalizeEnumIgnoreCase(
              step.certainty,
              [
                'RULE_DEFINED',
                'VACANCY_DEPENDENT',
                'PRACTICAL_UNCERTAINTY',
                'NOT_VERIFIED'
              ],
              null
            ),

          notes:
            cleanNullableString(
              step.notes
            )
        });
      }
    )
    .filter(Boolean);
}

function normalizePromotion(
  promotion,
  context = {}
) {
  if (
    !isPlainObject(
      promotion
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        promotion.id
      ),

    steps:
      normalizePromotionSteps(
        promotion.steps
      ),

    careerCeiling:
      cleanNullableString(
        promotion.careerCeiling
      ),

    departmentalExamination:
      cloneValue(
        promotion.departmentalExamination
      ),

    trainingRequirements:
      cloneValue(
        promotion.trainingRequirements
      ),

    ...normalizeProfileSourceMetadata(
      promotion,
      context
    )
  });
}

function normalizeBenefit(
  benefit,
  context = {}
) {
  if (
    !isPlainObject(
      benefit
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        benefit.id
      ),

    retirementAge:
      normalizeNumber(
        benefit.retirementAge,
        {
          min:
            0
        }
      ),

    retirementFramework:
      cleanNullableString(
        benefit.retirementFramework
      ),

    pensionFramework:
      cleanNullableString(
        benefit.pensionFramework
      ),

    nps:
      cloneValue(
        benefit.nps
      ),

    gratuity:
      cloneValue(
        benefit.gratuity
      ),

    familyBenefits:
      cloneValue(
        benefit.familyBenefits
      ),

    leave:
      cloneValue(
        benefit.leave
      ),

    medical:
      cloneValue(
        benefit.medical
      ),

    insurance:
      cloneValue(
        benefit.insurance
      ),

    employeeWelfare:
      cloneValue(
        benefit.employeeWelfare
      ),

    travelBenefits:
      cloneValue(
        benefit.travelBenefits
      ),

    accommodationBenefits:
      cloneValue(
        benefit.accommodationBenefits
      ),

    appointmentDateConditions:
      cleanNullableString(
        benefit.appointmentDateConditions
      ),

    ...normalizeProfileSourceMetadata(
      benefit,
      context
    )
  });
}

/* -------------------------------------------------------------------------- */
/* Common catalogues                                                          */
/* -------------------------------------------------------------------------- */

function normalizeGovernment(
  government,
  context = {}
) {
  if (
    !isPlainObject(
      government
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        government.id
      ),

    name:
      normalizeLocalizedText(
        government.name ??
        government.title
      ),

    type:
      normalizeEnumIgnoreCase(
        government.type,
        [
          'CENTRAL',
          'STATE',
          'LOCAL',
          'PSU',
          'STATUTORY_BODY',
          'AUTONOMOUS_BODY',
          'OTHER'
        ],
        null
      ),

    enabled:
      normalizeOptionalBoolean(
        government.enabled
      ),

    coverage:
      normalizeEnumIgnoreCase(
        government.coverage,
        [
          'ACTIVE',
          'PLANNED',
          'PARTIAL',
          'DISABLED'
        ],
        null
      ),

    description:
      government.description ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            government.description
          ),

    sourceIds:
      normalizeIdArray(
        government.sourceIds
      ),

    dataVersion:
      cleanNullableString(
        government.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

function normalizeState(
  state,
  context = {}
) {
  if (
    !isPlainObject(
      state
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        state.id
      ),

    name:
      normalizeLocalizedText(
        state.name ??
        state.title
      ),

    type:
      normalizeEnumIgnoreCase(
        state.type,
        [
          'STATE',
          'UNION_TERRITORY'
        ],
        context.collectionKey ===
          'unionTerritories'
          ? 'UNION_TERRITORY'
          : (
              context.collectionKey ===
                'states'
                ? 'STATE'
                : null
            )
      ),

    enabled:
      normalizeOptionalBoolean(
        state.enabled
      ),

    coverage:
      normalizeEnumIgnoreCase(
        state.coverage,
        [
          'ACTIVE',
          'PLANNED',
          'RESEARCHING',
          'PARTIAL',
          'TEMPORARILY_DISABLED'
        ],
        null
      ),

    capital:
      state.capital ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            state.capital
          ),

    governmentId:
      cleanId(
        state.governmentId ??
        context.governmentId ??
        context.metadata?.governmentId
      ),

    website:
      cleanNullableString(
        state.website
      ),

    sourceIds:
      normalizeIdArray(
        state.sourceIds
      ),

    lastVerified:
      normalizeDate(
        state.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        state.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

function normalizeQualification(
  qualification,
  context = {}
) {
  if (
    !isPlainObject(
      qualification
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        qualification.id
      ),

    name:
      normalizeLocalizedText(
        qualification.name ??
        qualification.title
      ),

    qualificationType:
      cleanNullableString(
        qualification.qualificationType
      ) ??
      QUALIFICATION_TYPE_BY_COLLECTION[
        context.collectionKey
      ] ??
      null,

    educationLevel:
      normalizeEducationLevel(
        qualification.educationLevel
      ),

    status:
      cleanNullableString(
        qualification.status
      ),

    dataVersion:
      cleanNullableString(
        qualification.dataVersion ??
        context.metadata?.dataVersion
      ),

    sourceIds:
      normalizeIdArray(
        qualification.sourceIds
      ),

    aliases:
      normalizeStringArray(
        qualification.aliases
      ),

    subjectIds:
      normalizeIdArray(
        qualification.subjectIds
      ),

    confidence:
      normalizeConfidence(
        qualification.confidence
      )
  });
}

function normalizeCategory(
  category
) {
  if (
    !isPlainObject(
      category
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        category.id
      ),

    label:
      normalizeLocalizedText(
        category.label ??
        category.name ??
        category.title
      ),

    description:
      category.description ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            category.description
          ),

    status:
      cleanNullableString(
        category.status
      ),

    sourceIds:
      normalizeIdArray(
        category.sourceIds
      )
  });
}

function normalizeSource(
  source,
  context = {}
) {
  if (
    !isPlainObject(
      source
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        source.id
      ),

    name:
      source.name ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            source.name
          ),

    title:
      source.title ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            source.title
          ),

    url:
      cleanNullableString(
        source.url
      ),

    type:
      cleanNullableString(
        source.type
      ),

    sourceTypeId:
      cleanId(
        source.sourceTypeId
      ),

    description:
      source.description ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            source.description
          ),

    status:
      cleanNullableString(
        source.status
      ),

    governmentId:
      cleanId(
        source.governmentId ??
        context.governmentId ??
        context.metadata?.governmentId
      ),

    stateId:
      cleanId(
        source.stateId ??
        context.stateId ??
        context.metadata?.stateId
      ),

    departmentId:
      cleanId(
        source.departmentId
      ),

    organisationId:
      cleanId(
        source.organisationId
      ),

    examIds:
      normalizeIdArray(
        source.examIds
      ),

    jobIds:
      normalizeIdArray(
        source.jobIds
      ),

    serviceCadreIds:
      normalizeIdArray(
        source.serviceCadreIds
      ),

    sourceIds:
      normalizeIdArray(
        source.sourceIds
      ),

    confidence:
      normalizeConfidence(
        source.confidence
      ),

    publicationDate:
      normalizeDate(
        source.publicationDate
      ),

    lastVerified:
      normalizeDate(
        source.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        source.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

/*
 * statuses.json contains several independent namespaces. A vocabulary marker
 * is retained in runtime representation so identical IDs such as ACTIVE or
 * NOT_VERIFIED are not semantically conflated.
 */
function normalizeStatus(
  status,
  context = {}
) {
  if (
    !isPlainObject(
      status
    )
  ) {
    return null;
  }

  return removeNullish({
    id:
      cleanId(
        status.id
      ),

    label:
      normalizeLocalizedText(
        status.label ??
        status.name ??
        status.title
      ),

    description:
      status.description ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            status.description
          ),

    status:
      cleanNullableString(
        status.status
      ),

    sourceIds:
      normalizeIdArray(
        status.sourceIds
      ),

    vocabulary:
      context.collectionKey ||
      null
  });
}

/* -------------------------------------------------------------------------- */
/* Generic reference-like collections                                         */
/* -------------------------------------------------------------------------- */

function normalizeReferenceEntity(
  record,
  context = {}
) {
  if (
    !isPlainObject(
      record
    )
  ) {
    return null;
  }

  const result =
    cloneValue(
      record
    );

  result.id =
    cleanId(
      record.id
    );

  if (
    record.name !==
      undefined
  ) {
    result.name =
      normalizeLocalizedText(
        record.name
      );
  }

  if (
    record.label !==
      undefined
  ) {
    result.label =
      normalizeLocalizedText(
        record.label
      );
  }

  if (
    record.title !==
      undefined
  ) {
    result.title =
      normalizeLocalizedText(
        record.title
      );
  }

  if (
    record.description !==
      undefined
  ) {
    result.description =
      normalizeLocalizedText(
        record.description
      );
  }

  if (
    record.sourceIds !==
      undefined
  ) {
    result.sourceIds =
      normalizeIdArray(
        record.sourceIds
      );
  }

  if (
    record.lastVerified !==
      undefined ||
    context.metadata?.lastVerified !==
      undefined
  ) {
    result.lastVerified =
      normalizeDate(
        record.lastVerified ??
        context.metadata?.lastVerified
      );
  }

  if (
    record.dataVersion !==
      undefined ||
    context.metadata?.dataVersion !==
      undefined
  ) {
    result.dataVersion =
      cleanNullableString(
        record.dataVersion ??
        context.metadata?.dataVersion
      );
  }

  return result;
}

function normalizeConfidenceLevel(
  record
) {
  return normalizeReferenceEntity(
    record
  );
}

function normalizeSourceType(
  record
) {
  return normalizeReferenceEntity(
    record
  );
}

function normalizeGlossary(
  record
) {
  return normalizeReferenceEntity(
    record
  );
}

function normalizeScoringRule(
  record
) {
  return normalizeReferenceEntity(
    record
  );
}

function normalizeAssessment(
  record
) {
  return normalizeReferenceEntity(
    record
  );
}

function normalizeGeneric(
  record,
  entityType,
  context = {}
) {
  return normalizeReferenceEntity(
    record,
    {
      ...context,

      entityType:
        normalizeEntityType(
          entityType
        )
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Cleanup/search compatibility                                               */
/* -------------------------------------------------------------------------- */

function removeNullish(
  value
) {
  if (
    !isPlainObject(
      value
    )
  ) {
    return value;
  }

  const result =
    {};

  Object.entries(
    value
  ).forEach(
    ([
      key,
      child
    ]) => {
      if (
        child ===
          undefined ||
        child ===
          null
      ) {
        return;
      }

      if (
        isPlainObject(
          child
        )
      ) {
        const nested =
          removeNullish(
            child
          );

        if (
          Object.keys(
            nested
          ).length
        ) {
          result[
            key
          ] =
            nested;
        }

        return;
      }

      if (
        Array.isArray(
          child
        )
      ) {
        result[
          key
        ] =
          child
            .filter(
              item =>
                item !==
                  null &&
                item !==
                  undefined
            )
            .map(
              item =>
                isPlainObject(
                  item
                )
                  ? removeNullish(
                      item
                    )
                  : item
            );

        return;
      }

      result[
        key
      ] =
        child;
    }
  );

  return result;
}

function removeNullishDeepArrays(
  value
) {
  return removeNullish(
    value
  );
}

/*
 * Kept as a deterministic public utility for compatibility with older
 * callers. Search/index builders remain the intended consumers of canonical
 * search representation; normalizeJob does not inject searchText.
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

  return values
    .flat(Infinity)
    .filter(
      value =>
        value !==
          undefined &&
        value !==
          null
    )
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

/* -------------------------------------------------------------------------- */
/* Public normalization API                                                   */
/* -------------------------------------------------------------------------- */

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

          case ENTITY_TYPES.CONFIDENCE_LEVEL:
            return normalizeConfidenceLevel(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.SOURCE_TYPE:
            return normalizeSourceType(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.GLOSSARY:
            return normalizeGlossary(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.SCORING_RULE:
            return normalizeScoringRule(
              entry.record,
              recordContext
            );

          case ENTITY_TYPES.ASSESSMENT_QUESTION:
          case ENTITY_TYPES.ASSESSMENT_OPTION:
          case ENTITY_TYPES.ASSESSMENT_BRANCHING:
          case ENTITY_TYPES.ASSESSMENT_PROFILE_FIELD:
          case ENTITY_TYPES.ASSESSMENT_RESPONSE_SCORING:
            return normalizeAssessment(
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

function normalizeCollection(
  data,
  entityType =
    ENTITY_TYPES.UNKNOWN,
  context = {}
) {
  const mergedContext = {
    ...normalizeContext(
      entityType
    ),

    ...context
  };

  return normalizeByType(
    data,
    mergedContext
  );
}

/* -------------------------------------------------------------------------- */
/* Exports                                                                   */
/* -------------------------------------------------------------------------- */

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
