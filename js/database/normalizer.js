/**
 * GovCareer Compass
 * Canonical Database Normalizer
 *
 * Pure transformation layer between source JSON and canonical runtime records.
 *
 * Design rules:
 * - normalize structure aggressively;
 * - normalize facts conservatively;
 * - preserve explicit source relationships;
 * - translate only established aliases;
 * - never fabricate IDs, facts, dates, status, booleans or foreign keys;
 * - keep strict canonical builders isolated from compatibility helpers;
 * - never perform lookup, fuzzy matching, network access or filesystem access.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

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
  ASSESSMENT_RESPONSE_SCORING:
    'ASSESSMENT_RESPONSE_SCORING'
});

const COLLECTION_WRAPPERS = Object.freeze({
  JOB: [
    'jobs',
    'records',
    'data',
    'items'
  ],

  EXAM: [
    'exams',
    'records',
    'data',
    'items'
  ],

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
   * Qualification data is intentionally vocabulary-aware.
   * Generic metadata arrays such as educationLevels and qualificationTypes
   * are catalogues, not Qualification entity records.
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
   * Status vocabularies intentionally remain separate.
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

const RULE_EDUCATION_LEVELS = Object.freeze([
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

const RECRUITMENT_MODES = Object.freeze([
  'DIRECT_RECRUITMENT',
  'PROMOTION',
  'DEPUTATION',
  'TRANSFER',
  'CONTRACT',
  'TEMPORARY',
  'SCHEME_PROJECT',
  'OUTSOURCED',
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

const JOB_CURRENT_RECRUITMENT_STATUSES =
  Object.freeze([
    'OPEN',
    'NOTIFIED',
    'RECURRING_ROUTE',
    'CLOSED',
    'NOT_CURRENTLY_NOTIFIED',
    'HISTORICAL',
    'UNKNOWN'
  ]);

const RECRUITMENT_STATUS_VALUES = Object.freeze([
  'OPEN',
  'CLOSED',
  'UNDER_PROCESS',
  'RECENTLY_COMPLETED',
  'EXPECTED_PERIODIC',
  'IRREGULAR',
  'HISTORICAL',
  'CANCELLED',
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

/*
 * The shared schema currently references a `currentness` definition.
 * This vocabulary mirrors the repository validator/data contract without
 * manufacturing values when source data does not provide them.
 */
const CURRENTNESS_VALUES = Object.freeze([
  'CURRENT',
  'HISTORICAL',
  'CURRENTNESS_UNCLEAR',
  'CURRENT_WITH_HISTORICAL_SUPPORT',
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

const DEPARTMENT_TYPES = Object.freeze([
  'MINISTRY',
  'DEPARTMENT',
  'SECRETARIAT',
  'DIRECTORATE',
  'ATTACHED_DEPARTMENT',
  'SUBORDINATE_DEPARTMENT',
  'OTHER'
]);

const ORGANISATION_TYPES = Object.freeze([
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

const QUALIFICATION_STATUSES = Object.freeze([
  'COMPLETED',
  'FINAL_YEAR',
  'PURSUING',
  'NOT_HELD'
]);

const STATE_TYPES = Object.freeze([
  'STATE',
  'UNION_TERRITORY'
]);

const GOVERNMENT_TYPES = Object.freeze([
  'CENTRAL',
  'STATE',
  'LOCAL',
  'PSU',
  'STATUTORY_BODY',
  'AUTONOMOUS_BODY',
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

const QUALIFICATION_TYPE_BY_COLLECTION =
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
      'PARAMEDICAL'
  });

const SOURCE_DOCUMENT_TYPE_VALUES = Object.freeze([
  'RECRUITMENT_NOTIFICATION',
  'RECRUITMENT_RULE',
  'SERVICE_RULE',
  'GAZETTE',
  'PAY_RULE',
  'FINANCE_ORDER',
  'GOVERNMENT_ORDER',
  'DEPARTMENT_PAGE',
  'DIRECTORATE_PAGE',
  'CADRE_STRENGTH_DOCUMENT',
  'ORGANISATIONAL_DOCUMENT',
  'ANNUAL_REPORT',
  'OFFICIAL_PORTAL',
  'OFFICIAL_FAQ',
  'OFFICIAL_CIRCULAR',
  'OFFICIAL_CORRIGENDUM',
  'OFFICIAL_RESULT',
  'OFFICIAL_ANSWER_KEY',
  'SECONDARY_SOURCE',
  'OTHER'
]);

const SOURCE_DOCUMENT_TYPE_ALIASES =
  Object.freeze({
    EXAMINATION_PAGE_AND_NOTIFICATION:
      'OFFICIAL_PORTAL',

    EXAMINATION_NOTIFICATION_ARCHIVE:
      'RECRUITMENT_NOTIFICATION',

    OFFICIAL_EXAMINATION_INDEX:
      'OFFICIAL_PORTAL',

    FINAL_VACANCY_STATEMENT:
      'OTHER',

    EXAMINATION_CALENDAR:
      'OFFICIAL_PORTAL',

    SELECTION_POST_NOTIFICATION:
      'RECRUITMENT_NOTIFICATION',

    RECRUITMENT_NOTIFICATION_AND_VACANCY:
      'RECRUITMENT_NOTIFICATION',

    RECRUITMENT_PORTAL_INDEX:
      'OFFICIAL_PORTAL',

    CENTRALISED_EMPLOYMENT_NOTICE:
      'RECRUITMENT_NOTIFICATION',

    EXAMINATION_SCHEDULE:
      'OFFICIAL_PORTAL',

    RECRUITMENT_RULES_INDEX:
      'RECRUITMENT_RULE',

    RECRUITMENT_NOTIFICATION_CORRIGENDUM:
      'OFFICIAL_CORRIGENDUM',

    RECRUITMENT_RULES:
      'RECRUITMENT_RULE',

    FINANCE_ORDER:
      'FINANCE_ORDER',

    GOVERNMENT_ORDER:
      'GOVERNMENT_ORDER',

    GAZETTE:
      'GAZETTE',

    SERVICE_RULE:
      'SERVICE_RULE',

    DEPARTMENT_PAGE:
      'DEPARTMENT_PAGE',

    DIRECTORATE_PAGE:
      'DIRECTORATE_PAGE',

    OFFICIAL_RESULT:
      'OFFICIAL_RESULT',

    OFFICIAL_ANSWER_KEY:
      'OFFICIAL_ANSWER_KEY',

    OFFICIAL_FAQ:
      'OFFICIAL_FAQ',

    OFFICIAL_CIRCULAR:
      'OFFICIAL_CIRCULAR',

    OFFICIAL_CORRIGENDUM:
      'OFFICIAL_CORRIGENDUM',

    OFFICIAL_PORTAL:
      'OFFICIAL_PORTAL',

    ORGANISATIONAL_DOCUMENT:
      'ORGANISATIONAL_DOCUMENT',

    ANNUAL_REPORT:
      'ANNUAL_REPORT',

    PAY_RULE:
      'PAY_RULE',

    CADRE_STRENGTH_DOCUMENT:
      'CADRE_STRENGTH_DOCUMENT',

    RECRUITMENT_NOTIFICATION:
      'RECRUITMENT_NOTIFICATION',

    RECRUITMENT_RULE:
      'RECRUITMENT_RULE',

    SECONDARY_SOURCE:
      'SECONDARY_SOURCE',

    OTHER:
      'OTHER'
  });

const SOURCE_PRIORITY_VALUES = Object.freeze([
  'PRIMARY_CURRENT',
  'PRIMARY_HISTORICAL',
  'OFFICIAL_GENERAL',
  'SECONDARY'
]);

const SOURCE_CURRENTNESS_VALUES =
  Object.freeze([
    'CURRENT',
    'HISTORICAL',
    'CURRENTNESS_UNCLEAR',
    'REPLACED',
    'ABOLISHED',
    'NOT_VERIFIED'
  ]);

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
    value === undefined ||
    value === null
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

function normalizeNonEmptyStringArray(
  value
) {
  const result =
    normalizeStringArray(
      value
    );

  return result.length
    ? result
    : undefined;
}

function normalizeNonEmptyIdArray(
  value
) {
  const result =
    normalizeIdArray(
      value
    );

  return result.length
    ? result
    : undefined;
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

function normalizeLocalizedText(
  value
) {
  if (
    typeof value ===
    'string'
  ) {
    const text =
      cleanString(
        value,
        ''
      );

    return text
      ? {
          en:
            text
        }
      : {};
  }

  if (
    !isPlainObject(
      value
    )
  ) {
    return {};
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

function normalizePlainString(
  value
) {
  return cleanNullableString(
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

  /*
   * Canonical dates are YYYY-MM-DD. Do not parse ambiguous natural-language
   * values and do not derive dates from year-only strings.
   */
  const match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:$|T)/
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
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  /*
   * Never treat boolean values as 0/1 numeric facts.
   */
  if (
    typeof value ===
    'boolean'
  ) {
    return null;
  }

  const number =
    Number(
      typeof value ===
        'string'
        ? cleanString(
            value
          )
        : value
    );

  if (
    !Number.isFinite(
      number
    )
  ) {
    return null;
  }

  /*
   * Truncation is used only for schema properties whose canonical type is
   * explicitly integer.
   */
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
    value === 1 ||
    value === '1' ||
    value === 'true' ||
    value === 'TRUE'
  ) {
    return true;
  }

  if (
    value === 0 ||
    value === '0' ||
    value === 'false' ||
    value === 'FALSE'
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
/* Object helpers                                                             */
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
      current === null ||
      current === undefined ||
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
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      return value;
    }
  }

  return undefined;
}

/*
 * Remove only null/undefined object properties.
 *
 * This helper intentionally DOES NOT delete empty arrays because ordinary
 * arrays and idArray fields may legally be empty in the canonical schema.
 */
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
        child === undefined ||
        child === null
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
                  undefined &&
                item !==
                  null
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

/*
 * Historical compatibility name retained for callers. It performs nullish
 * cleanup only; it deliberately does not perform global empty-array removal.
 */
function removeNullishDeepArrays(
  value
) {
  return removeNullish(
    value
  );
}

function omitEmptyArrays(
  object,
  keys
) {
  if (
    !isPlainObject(
      object
    )
  ) {
    return object;
  }

  const result =
    {
      ...object
    };

  keys.forEach(
    key => {
      if (
        Array.isArray(
          result[
            key
          ]
        ) &&
        result[
          key
        ].length ===
          0
      ) {
        delete result[
          key
        ];
      }
    }
  );

  return result;
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

  const result =
    {
      sourceId
    };

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
      cloneValue(
        value.value
      ),

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
/* Context / collection extraction                                            */
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
        ] !== undefined &&
        data[
          key
        ] !== null &&
        data[
          key
        ] !== ''
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

/* -------------------------------------------------------------------------- */
/* Compatibility normalizer                                                  */
/* -------------------------------------------------------------------------- */

/*
 * This function intentionally preserves arbitrary source properties because
 * it is a compatibility representation rather than a canonical builder.
 *
 * Canonical entity builders below NEVER spread this result into strict schema
 * entities.
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
    normalizeStringArray(
      record.aliases
    );

  result.keywords =
    normalizeStringArray(
      record.keywords
    );

  result.lastVerified =
    normalizeDate(
      record.lastVerified ??
      metadata.lastVerified
    );

  result.dataVersion =
    cleanNullableString(
      record.dataVersion ??
      metadata.dataVersion
    );

  if (
    result.version !== undefined
  ) {
    result.version =
      cleanNullableString(
        result.version
      );
  }

  if (
    record.name !== undefined
  ) {
    result.name =
      normalizeLocalizedText(
        record.name
      );
  }

  if (
    record.title !== undefined
  ) {
    result.title =
      normalizeLocalizedText(
        record.title
      );
  }

  if (
    record.description !== undefined
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

function normalizeRuleEducationLevel(
  value
) {
  const direct =
    normalizeEnumIgnoreCase(
      value,
      RULE_EDUCATION_LEVELS,
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  const aliases = {
    UNDERGRAD:
      'UNDERGRADUATE',

    UNDER_GRADUATE:
      'UNDERGRADUATE',

    POST_GRADUATE:
      'POSTGRADUATE',

    DOCTORATE:
      'DOCTORAL'
  };

  return (
    aliases[
      cleanString(
        value,
        ''
      )
        .toUpperCase()
        .replace(
          /[-\s]+/g,
          '_'
        )
    ] ||
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Recruitment mappings                                                       */
/* -------------------------------------------------------------------------- */

const JOB_RECRUITMENT_ROUTE_ALIASES =
  Object.freeze({
    DIRECT_EXAMINATION:
      'DIRECT_RECRUITMENT',

    DIRECT_RECRUITMENT:
      'DIRECT_RECRUITMENT',

    WBPSC_WBCS:
      'DIRECT_RECRUITMENT'
  });

function normalizeRecruitmentMode(
  value
) {
  return normalizeEnumIgnoreCase(
    value,
    JOB_RECRUITMENT_MODES,
    null
  );
}

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
    JOB_RECRUITMENT_ROUTE_ALIASES[
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
   * Source uses explicit variants such as DIRECT_ACADEMIC and
   * DIRECT_WITH_LANGUAGE. These are normalized only to the canonical
   * research/display assessment vocabulary.
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
  context = {}
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
    post !== undefined &&
    post !== null
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

  const routeIds =
    normalizeIdArray(
      source.routeIds ??
      source.route ??
      source.recruitmentRoute ??
      job.routeIds ??
      job.recruitmentRoute
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
   * Important: a route is NOT evidence that fresh-entry eligibility is true.
   */
  const freshEntryEligible =
    normalizeOptionalBoolean(
      source.freshEntryEligible ??
      job.freshEntryEligible
    );

  if (
    freshEntryEligible !==
      null
  ) {
    recruitment.freshEntryEligible =
      freshEntryEligible;
  }

  const currentRecruitmentStatus =
    normalizeEnumIgnoreCase(
      source.currentRecruitmentStatus ??
      job.currentRecruitmentStatus,
      JOB_CURRENT_RECRUITMENT_STATUSES,
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
   * Repository-established Central legacy contract:
   *
   * Central jobs use qualificationRuleIds for actual qualification IDs,
   * while eligibilityRuleIds independently contain eligibility-rule IDs.
   *
   * This interpretation is deliberately jurisdiction-restricted. It is NOT
   * applied to West Bengal or other governments.
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
  job,
  context = {}
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
   * minimumQualification is a plain canonical string, NOT localizedText.
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
      'string'
  ) {
    const text =
      cleanNullableString(
        minimum
      );

    if (
      text
    ) {
      eligibility.minimumQualification =
        text;
    }
  } else if (
    isPlainObject(
      minimum
    )
  ) {
    /*
     * A localized source qualification object is flattened only because the
     * canonical Job schema explicitly defines minimumQualification as string.
     *
     * English is the canonical fallback when available; otherwise the first
     * non-empty localized value is used deterministically.
     */
    const localized =
      normalizeLocalizedText(
        minimum
      );

    const text =
      cleanNullableString(
        localized.en ??
        Object.values(
          localized
        )[0]
      );

    if (
      text
    ) {
      eligibility.minimumQualification =
        text;
    }
  }

  const governmentId =
    cleanId(
      job.governmentId ??
      context.governmentId ??
      context.metadata?.governmentId
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
    summary !== undefined
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
    notes !== undefined
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

  LIFESTYLE_FIELDS.forEach(
    field => {
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
  );

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

  const allowed =
    {
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
    notes !== undefined
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

  const result =
    {
      id:
        cleanId(
          job.id
        ),

      identity:
        normalizeJobIdentity(
          job,
          context
        ),

      recruitment:
        normalizeJobRecruitment(
          job
        ),

      eligibility:
        normalizeJobEligibility(
          job,
          context
        ),

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
        ),

      confidence:
        normalizeConfidence(
          job.confidence
        ),

      currentness:
        normalizeCurrentness(
          job.currentness ??
          job.sourceCurrentness
        ),

      lastVerified:
        normalizeDate(
          job.lastVerified ??
          context.metadata?.lastVerified
        ),

      dataVersion:
        cleanNullableString(
          job.dataVersion ??
          context.metadata?.dataVersion
        )
    };

  /*
   * This is a strict canonical builder. No source-only properties are spread.
   * Required-property omissions remain visible to validation when source facts
   * are genuinely absent.
   */
  return removeNullish(
    result
  );
}

/* -------------------------------------------------------------------------- */
/* Exam normalization                                                         */
/* -------------------------------------------------------------------------- */

const EXAM_STAGE_TYPES = Object.freeze([
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
]);

const EXAM_STAGE_ALIASES = Object.freeze({
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
});

function normalizeExamStageType(
  value
) {
  const direct =
    normalizeEnumIgnoreCase(
      value,
      EXAM_STAGE_TYPES,
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  return (
    EXAM_STAGE_ALIASES[
      cleanString(
        value,
        ''
      )
        .toUpperCase()
        .replace(
          /[-\s]+/g,
          '_'
        )
    ] ||
    'OTHER'
  );
}

function normalizeExamStage(
  stage,
  order
) {
  if (
    isPlainObject(
      stage
    )
  ) {
    return removeNullish({
      order:
        normalizeNumber(
          stage.order ??
          order,
          {
            integer:
              true,

            min:
              1
          }
        ),

      type:
        normalizeExamStageType(
          stage.type
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

  return {
    order,

    type:
      normalizeExamStageType(
        sourceName
      ),

    name:
      sourceName
  };
}

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

  const rawStages =
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

  const stages =
    rawStages
      .map(
        (
          stage,
          index
        ) =>
          normalizeExamStage(
            stage,
            index + 1
          )
      )
      .filter(Boolean);

  const frequencyRaw =
    cleanString(
      exam.recruitmentFrequency ??
      exam.frequency,
      ''
    ).toUpperCase();

  const recruitmentFrequency =
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
    } else {
      const status =
        cleanNullableString(
          exam.physicalRequirement
        );

      if (
        status
      ) {
        physicalRequirements =
          {
            status
          };
      }
    }
  }

  return removeNullish({
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

    stages,

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

    recruitmentFrequency,

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

    status:
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
      ),

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
  });
}

/* -------------------------------------------------------------------------- */
/* Department / organisation normalization                                    */
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
        DEPARTMENT_TYPES,
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
        ORGANISATION_TYPES,
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

function normalizeCadreAuthority(
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
    authorityType:
      normalizeEnumIgnoreCase(
        value.authorityType,
        [
          'MINISTRY',
          'DEPARTMENT',
          'ORGANISATION',
          'STATE_GOVERNMENT',
          'CENTRAL_GOVERNMENT',
          'COMMISSION',
          'BOARD',
          'STATUTORY_AUTHORITY',
          'OTHER',
          'UNKNOWN'
        ],
        null
      ),

    authorityId:
      cleanId(
        value.authorityId
      ),

    authorityName:
      value.authorityName ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            value.authorityName
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
      normalizeNonEmptyStringArray(
        value.regionNames
      ),

    districtNames:
      normalizeNonEmptyStringArray(
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
    const aliases = {
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
      aliases[
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

function normalizeTransferControl(
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
    controlType:
      normalizeEnumIgnoreCase(
        value.controlType,
        [
          'STATE_CADRE',
          'CENTRAL_CADRE',
          'JOINT_CADRE',
          'DEPARTMENT_CONTROLLED',
          'ORGANISATION_CONTROLLED',
          'ZONE_CONTROLLED',
          'REGION_CONTROLLED',
          'DISTRICT_CONTROLLED',
          'OTHER',
          'UNKNOWN'
        ],
        null
      ),

    transferAuthorityId:
      cleanId(
        value.transferAuthorityId
      ),

    transferAuthorityName:
      value.transferAuthorityName ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            value.transferAuthorityName
          ),

    transferScope:
      normalizeEnumIgnoreCase(
        value.transferScope,
        [
          'WITHIN_CADRE',
          'WITHIN_STATE',
          'INTER_STATE',
          'ALL_INDIA',
          'REGIONAL',
          'DEPARTMENTAL',
          'ORGANISATION',
          'UNKNOWN'
        ],
        null
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

function normalizeServiceRuleReferences(
  value
) {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value
    .map(
      reference => {
        if (
          !isPlainObject(
            reference
          )
        ) {
          return null;
        }

        return removeNullish({
          title:
            normalizeLocalizedText(
              reference.title
            ),

          ruleType:
            normalizeEnumIgnoreCase(
              reference.ruleType,
              [
                'SERVICE_RULE',
                'CADRE_RULE',
                'RECRUITMENT_RULE',
                'CONDUCT_RULE',
                'PROMOTION_RULE',
                'TRANSFER_RULE',
                'OTHER'
              ],
              null
            ),

          reference:
            cleanNullableString(
              reference.reference
            ),

          section:
            cleanNullableString(
              reference.section
            ),

          sourceIds:
            normalizeIdArray(
              reference.sourceIds
            ),

          sourceReferences:
            normalizeSources(
              reference.sourceReferences
            ),

          description:
            reference.description ===
              undefined
              ? undefined
              : normalizeLocalizedText(
                  reference.description
                )
        });
      }
    )
    .filter(Boolean);
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
    .filter(
      route =>
        route &&
        route.routeType
    );
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

  const status =
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
    );

  /*
   * Explicit source `type` is preferred.
   * Source `serviceNature` is used only through the repository's explicit
   * controlled mapping.
   */
  const type =
    normalizeServiceType(
      serviceCadre.type,
      serviceCadre.serviceNature
    );

  let classification =
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
    );

  /*
   * Do not infer classification from filenames, names or type. The source
   * may explicitly provide it during canonicalization; otherwise validation
   * is allowed to report its absence.
   */

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

    type,

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

    classification,

    cadreAuthority:
      normalizeCadreAuthority(
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
      normalizeTransferControl(
        serviceCadre.transferControl
      ),

    serviceRuleReferences:
      normalizeServiceRuleReferences(
        serviceCadre.serviceRuleReferences
      ),

    keywords:
      normalizeNonEmptyStringArray(
        serviceCadre.keywords
      ),

    description:
      serviceCadre.description ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            serviceCadre.description
          ),

    status,

    effectiveFrom:
      normalizeDate(
        serviceCadre.effectiveFrom
      ),

    effectiveTo:
      normalizeDate(
        serviceCadre.effectiveTo
      ),

    historicalNames:
      normalizeNonEmptyStringArray(
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
        serviceCadre.version ??
        context.metadata?.version
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

/* -------------------------------------------------------------------------- */
/* Eligibility-rule nested structures                                         */
/* -------------------------------------------------------------------------- */

function normalizeRuleLogic(
  value
) {
  if (
    isPlainObject(
      value
    )
  ) {
    const normalized =
      removeNullish({
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
          normalizeNonEmptyIdArray(
            value.ruleIds
          )
      });

    return Object.keys(
      normalized
    ).length
      ? normalized
      : null;
  }

  const mode =
    {
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
    }[
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
  if (
    isPlainObject(
      rule.verificationRequirement
    )
  ) {
    const explicit =
      removeNullish({
        required:
          normalizeOptionalBoolean(
            rule.verificationRequirement.required
          ),

        type:
          cleanNullableString(
            rule.verificationRequirement.type
          ),

        reason:
          rule.verificationRequirement.reason ===
            undefined
            ? undefined
            : normalizeLocalizedText(
                rule.verificationRequirement.reason
              )
      });

    return Object.keys(
      explicit
    ).length
      ? explicit
      : null;
  }

  const unknownStatus =
    cleanString(
      rule.unknownStatus,
      ''
    ).toUpperCase();

  const type =
    {
      REQUIRES_MANUAL_VERIFICATION:
        'MANUAL',

      REQUIRES_VERIFICATION:
        'VERIFICATION',

      REVIEW_REQUIRED:
        'REVIEW'
    }[
      unknownStatus
    ] || null;

  if (
    !type
  ) {
    return null;
  }

  return removeNullish({
    required:
      true,

    type,

    reason:
      rule.explanation ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            rule.explanation
          )
  });
}

function normalizeTypingRequirement(
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
    minimumWordsPerMinute:
      normalizeNumber(
        value.minimumWordsPerMinute,
        {
          min:
            0
        }
      ),

    language:
      cleanNullableString(
        value.language
      ),

    script:
      cleanNullableString(
        value.script
      ),

    mode:
      normalizeEnumIgnoreCase(
        value.mode,
        [
          'TYPING',
          'TRANSCRIPTION',
          'DATA_ENTRY',
          'OTHER'
        ],
        null
      )
  });
}

function normalizeShorthandRequirement(
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
    minimumWordsPerMinute:
      normalizeNumber(
        value.minimumWordsPerMinute,
        {
          min:
            0
        }
      ),

    language:
      cleanNullableString(
        value.language
      )
  });
}

function normalizeLicenceRequirements(
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
    licenceTypes:
      normalizeNonEmptyStringArray(
        value.licenceTypes
      ),

    minimumValidityMonths:
      normalizeNumber(
        value.minimumValidityMonths,
        {
          min:
            0
        }
      ),

    commercialRequired:
      normalizeOptionalBoolean(
        value.commercialRequired
      )
  });
}

function normalizeRequiredExperience(
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
    minimumYears:
      normalizeNumber(
        value.minimumYears,
        {
          min:
            0
        }
      ),

    maximumYears:
      normalizeNumber(
        value.maximumYears,
        {
          min:
            0
        }
      ),

    experienceType:
      cleanNullableString(
        value.experienceType
      ),

    specificExperience:
      value.specificExperience ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            value.specificExperience
          ),

    organisationTypes:
      normalizeNonEmptyStringArray(
        value.organisationTypes
      ),

    experienceDomains:
      normalizeNonEmptyStringArray(
        value.experienceDomains
      )
  });
}

function normalizeAgeRelaxations(
  value
) {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value
    .map(
      relaxation => {
        if (
          !isPlainObject(
            relaxation
          )
        ) {
          return null;
        }

        return removeNullish({
          category:
            cleanNullableString(
              relaxation.category
            ),

          maximumRelaxationYears:
            normalizeNumber(
              relaxation.maximumRelaxationYears,
              {
                integer:
                  true,

                min:
                  0
              }
            ),

          description:
            relaxation.description ===
              undefined
              ? undefined
              : normalizeLocalizedText(
                  relaxation.description
                )
        });
      }
    )
    .filter(
      relaxation =>
        relaxation &&
        relaxation.category
    );
}

function normalizeCitizenship(
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
    required:
      normalizeOptionalBoolean(
        value.required
      ),

    allowedStatuses:
      normalizeNonEmptyStringArray(
        value.allowedStatuses
      )
  });
}

function normalizeDomicileRequirement(
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
    required:
      normalizeOptionalBoolean(
        value.required
      ),

    stateIds:
      normalizeIdArray(
        value.stateIds
      ),

    districtNames:
      normalizeNonEmptyStringArray(
        value.districtNames
      ),

    localAreaNames:
      normalizeNonEmptyStringArray(
        value.localAreaNames
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

function normalizeReservationRequirement(
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
    categories:
      normalizeNonEmptyStringArray(
        value.categories
      ),

    requiresCertificate:
      normalizeOptionalBoolean(
        value.requiresCertificate
      ),

    certificateTypes:
      normalizeNonEmptyStringArray(
        value.certificateTypes
      ),

    conditions:
      normalizeNonEmptyStringArray(
        value.conditions
      )
  });
}

function normalizePhysicalStandard(
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
    gender:
      normalizeEnumIgnoreCase(
        value.gender,
        [
          'ANY',
          'MALE',
          'FEMALE',
          'OTHER'
        ],
        null
      ),

    minimumHeightCm:
      normalizeNumber(
        value.minimumHeightCm,
        {
          min:
            0
        }
      ),

    maximumHeightCm:
      normalizeNumber(
        value.maximumHeightCm,
        {
          min:
            0
        }
      ),

    minimumWeightKg:
      normalizeNumber(
        value.minimumWeightKg,
        {
          min:
            0
        }
      ),

    maximumWeightKg:
      normalizeNumber(
        value.maximumWeightKg,
        {
          min:
            0
        }
      ),

    minimumChestCm:
      normalizeNumber(
        value.minimumChestCm,
        {
          min:
            0
        }
      ),

    maximumChestCm:
      normalizeNumber(
        value.maximumChestCm,
        {
          min:
            0
        }
      ),

    minimumExpandedChestCm:
      normalizeNumber(
        value.minimumExpandedChestCm,
        {
          min:
            0
        }
      ),

    maximumExpandedChestCm:
      normalizeNumber(
        value.maximumExpandedChestCm,
        {
          min:
            0
        }
      )
  });
}

function normalizePhysicalEfficiencyTest(
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
    testType:
      cleanNullableString(
        value.testType
      ),

    minimumDistanceMetres:
      normalizeNumber(
        value.minimumDistanceMetres,
        {
          min:
            0
        }
      ),

    maximumTimeSeconds:
      normalizeNumber(
        value.maximumTimeSeconds,
        {
          min:
            0
        }
      ),

    minimumTimeSeconds:
      normalizeNumber(
        value.minimumTimeSeconds,
        {
          min:
            0
        }
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

function normalizeMedicalStandard(
  value
) {
  if (
    !isPlainObject(
      value
    )
  ) {
    return null;
  }

  return removeNullish(
    normalizeKnownObjectFields(
      value,
      {
        id: value.id,
        standardId: value.standardId,
        category: value.category,
        class: value.class,
        description:
          value.description ===
            undefined
            ? undefined
            : normalizeLocalizedText(
                value.description
              )
      }
    )
  );
}

function normalizeEyesight(
  value
) {
  if (
    !isPlainObject(
      value
    )
  ) {
    return null;
  }

  return removeNullish(
    normalizeKnownObjectFields(
      value,
      {
        betterEye:
          value.betterEye,
        worseEye:
          value.worseEye,
        correctedVisionAllowed:
          normalizeOptionalBoolean(
            value.correctedVisionAllowed
          ),
        colourVision:
          value.colourVision,
        binocularVision:
          value.binocularVision,
        description:
          value.description ===
            undefined
            ? undefined
            : normalizeLocalizedText(
                value.description
              )
      }
    )
  );
}

function normalizeDocumentRequirements(
  value
) {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value
    .map(
      requirement => {
        if (
          !isPlainObject(
            requirement
          )
        ) {
          return null;
        }

        return removeNullish(
          normalizeKnownObjectFields(
            requirement,
            {
              documentType:
                requirement.documentType,
              required:
                normalizeOptionalBoolean(
                  requirement.required
                ),
              description:
                requirement.description ===
                  undefined
                  ? undefined
                  : normalizeLocalizedText(
                      requirement.description
                    )
            }
          )
        );
      }
    )
    .filter(Boolean);
}

function normalizeKnownObjectFields(
  source,
  output
) {
  /*
   * `output` is already an explicit allowlist supplied by a dedicated caller.
   * This helper exists only to avoid repeating null filtering.
   */
  return output;
}

/* -------------------------------------------------------------------------- */
/* Eligibility-rule target/classification                                     */
/* -------------------------------------------------------------------------- */

function mapEligibilityRuleTarget(
  rule
) {
  const directType =
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

  const directId =
    cleanId(
      rule.targetId
    );

  if (
    directType &&
    directId
  ) {
    return {
      targetType:
        directType,

      targetId:
        directId
    };
  }

  /*
   * These are explicit relationships only. No fuzzy/entity lookup is ever
   * performed here.
   */
  const explicitRelationships = [
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
      candidateId
    ] of explicitRelationships
  ) {
    const targetId =
      cleanId(
        candidateId
      );

    if (
      targetId
    ) {
      return {
        targetType,
        targetId
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
   * Explicit repository ruleType vocabulary.
   *
   * These are classification mappings, not descriptions guessed from names.
   */
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
      cleanString(
        rule.ruleType,
        ''
      ).toUpperCase()
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
    )
      .toLowerCase()
      .replace(
        /[\s_-]+/g,
        ''
      );

  const mappings = {
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

    physicalefficiency:
      'PHYSICAL_EFFICIENCY_TEST',

    physicalefficiencytest:
      'PHYSICAL_EFFICIENCY_TEST',

    eyesight:
      'EYESIGHT',

    height:
      'HEIGHT',

    weight:
      'WEIGHT',

    chest:
      'CHEST',

    running:
      'RUNNING',

    walking:
      'WALKING',

    cycling:
      'CYCLING',

    fitness:
      'FITNESS',

    medicaltest:
      'MEDICAL_TEST',

    typing:
      'TYPING',

    typingskill:
      'TYPING',

    shorthand:
      'SHORTHAND',

    computerknowledge:
      'COMPUTER_KNOWLEDGE',

    computercertificate:
      'COMPUTER_CERTIFICATE',

    language:
      'LANGUAGE',

    languages:
      'LANGUAGE',

    citizenship:
      'CITIZENSHIP',

    nationality:
      'NATIONALITY',

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

    age:
      'AGE',

    drivinglicence:
      'DRIVING_LICENCE',

    otherlicence:
      'OTHER_LICENCE',

    tet:
      'TET',

    b_ed:
      'BED',

    bed:
      'BED',

    d_el_ed:
      'DELED',

    deled:
      'DELED',

    b_el_ed:
      'BELED',

    beled:
      'BELED',

    iti:
      'ITI',

    diploma:
      'DIPLOMA',

    mathematics:
      'MATHEMATICS',

    statistics:
      'STATISTICS',

    economics:
      'ECONOMICS',

    commerce:
      'COMMERCE',

    science:
      'SCIENCE',

    arts:
      'ARTS',

    degree:
      'DEGREE',

    subject:
      'SUBJECT',

    subjectcombination:
      'SUBJECT_COMBINATION',

    marks:
      'MARKS',

    percentage:
      'PERCENTAGE',

    professionalqualification:
      'PROFESSIONAL_QUALIFICATION',

    documentverification:
      'DOCUMENT_VERIFICATION'
  };

  /*
   * Composite source subjects are deliberately represented by OTHER instead
   * of pretending that one narrower canonical type captures the whole fact.
   *
   * Their explicit supporting structures remain preserved through the rule's
   * canonical fields where those source structures have direct equivalents.
   */
  return (
    mappings[
      subjectField
    ] ||
    'OTHER'
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
   * The canonical effect describes the effect when the rule condition is
   * satisfied.
   *
   * For repository source rules, failureStatus describes the opposite case.
   * Therefore:
   *
   *   condition true  -> ALLOW
   *   condition false -> source failureStatus
   *
   * This prevents an inversion where every positive eligibility requirement
   * would incorrectly become DENY.
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

/* -------------------------------------------------------------------------- */
/* Eligibility-rule normalization                                             */
/* -------------------------------------------------------------------------- */

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

  const result =
    {
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
        cloneValue(
          rule.value
        ),

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
        normalizeNonEmptyIdArray(
          rule.qualificationIds
        ),

      requiredQualificationIds:
        normalizeNonEmptyIdArray(
          rule.requiredQualificationIds ??
          rule.requiredQualifications
        ),

      subjectIds:
        normalizeNonEmptyIdArray(
          rule.subjectIds
        ),

      requiredSubjectIds:
        normalizeNonEmptyIdArray(
          rule.requiredSubjectIds
        ),

      educationLevel:
        normalizeRuleEducationLevel(
          rule.educationLevel
        ),

      minimumEducationLevel:
        normalizeEnumIgnoreCase(
          rule.minimumEducationLevel,
          RULE_EDUCATION_LEVELS.filter(
            level =>
              level !==
              'OTHER'
          ),
          null
        ),

      degreeNames:
        normalizeNonEmptyStringArray(
          rule.degreeNames
        ),

      subjectNames:
        normalizeNonEmptyStringArray(
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
        normalizeNonEmptyStringArray(
          rule.requiredLanguages
        ),

      requiredSkills:
        normalizeNonEmptyStringArray(
          rule.requiredSkills
        ),

      requiredComputerKnowledge:
        normalizeNonEmptyStringArray(
          rule.requiredComputerKnowledge
        ),

      typingRequirement:
        normalizeTypingRequirement(
          rule.typingRequirement
        ),

      shorthandRequirement:
        normalizeShorthandRequirement(
          rule.shorthandRequirement
        ),

      licenceRequirements:
        normalizeLicenceRequirements(
          rule.licenceRequirements
        ),

      requiredExperience:
        normalizeRequiredExperience(
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
        normalizeAgeRelaxations(
          rule.ageRelaxations
        ),

      citizenship:
        normalizeCitizenship(
          rule.citizenship
        ),

      requiredNationality:
        normalizeNonEmptyStringArray(
          rule.requiredNationality
        ),

      domicileRequirement:
        normalizeDomicileRequirement(
          rule.domicileRequirement
        ),

      reservationRequirement:
        normalizeReservationRequirement(
          rule.reservationRequirement
        ),

      categoryRequirement:
        normalizeNonEmptyStringArray(
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
        normalizePhysicalStandard(
          rule.physicalStandard
        ),

      physicalEfficiencyTest:
        normalizePhysicalEfficiencyTest(
          rule.physicalEfficiencyTest
        ),

      medicalStandard:
        normalizeMedicalStandard(
          rule.medicalStandard
        ),

      eyesightRequirement:
        normalizeEyesight(
          rule.eyesightRequirement ??
          rule.eyesight
        ),

      documentRequirements:
        normalizeDocumentRequirements(
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

  /*
   * Do not emit optional non-empty arrays when empty.
   *
   * Ordinary idArray properties such as recruitmentIds and dependsOnRuleIds
   * remain present as empty arrays when explicitly supplied; non-empty schema
   * arrays do not.
   */
  return omitEmptyArrays(
    removeNullish(
      result
    ),
    [
      'qualificationIds',
      'requiredQualificationIds',
      'subjectIds',
      'requiredSubjectIds',
      'degreeNames',
      'subjectNames',
      'requiredLanguages',
      'requiredSkills',
      'requiredComputerKnowledge',
      'requiredNationality',
      'categoryRequirement',
      'sourceIds'
    ]
  );
}

/* -------------------------------------------------------------------------- */
/* Recruitment normalization                                                 */
/* -------------------------------------------------------------------------- */

const RECRUITMENT_MODE_ALIASES =
  Object.freeze({
    DIRECT_EXAMINATION:
      'DIRECT_RECRUITMENT',

    DIRECT_RECRUITMENT:
      'DIRECT_RECRUITMENT',

    WBPSC_WBCS:
      'DIRECT_RECRUITMENT',

    CONTRACTUAL:
      'CONTRACT',

    CONTRACT:
      'CONTRACT',

    TEMPORARY:
      'TEMPORARY',

    SCHEME_PROJECT:
      'SCHEME_PROJECT',

    OUTSOURCED:
      'OUTSOURCED',

    PROMOTION:
      'PROMOTION',

    DEPUTATION:
      'DEPUTATION',

    TRANSFER:
      'TRANSFER',

    OTHER:
      'OTHER'
  });

function normalizeRecruitmentEntityMode(
  value
) {
  const direct =
    normalizeEnumIgnoreCase(
      value,
      RECRUITMENT_MODES,
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  return (
    RECRUITMENT_MODE_ALIASES[
      cleanString(
        value,
        ''
      )
        .toUpperCase()
        .replace(
          /[-\s]+/g,
          '_'
        )
    ] ||
    null
  );
}

const RECRUITMENT_STATUS_ALIASES =
  Object.freeze({
    UNDER_PROCESS:
      'UNDER_PROCESS',

    ADMINISTRATIVE_PROCESS_UNDERWAY:
      'UNDER_PROCESS',

    FINAL_EXAMINATION_PROCESS:
      'UNDER_PROCESS',

    PRELIMINARY_EXAMINATION_PROCESS:
      'UNDER_PROCESS',

    MAIN_EXAM_PROCESS:
      'UNDER_PROCESS',

    WRITTEN_RESULT_STAGE:
      'UNDER_PROCESS',

    EXAM_SCHEDULED:
      'UNDER_PROCESS',

    RECRUITMENT_CYCLE:
      'EXPECTED_PERIODIC',

    RECRUITMENT_FRAMEWORK:
      'EXPECTED_PERIODIC',

    RECENTLY_COMPLETED:
      'RECENTLY_COMPLETED',

    POST_SELECTION_ACTIVITY:
      'RECENTLY_COMPLETED',

    POST_FINAL_EXAMINATION_PROCESS:
      'RECENTLY_COMPLETED',

    HISTORICAL:
      'HISTORICAL',

    HISTORICAL_RECRUITMENT_CYCLE:
      'HISTORICAL',

    HISTORICAL_COMPLETED_OR_POST_PROCESS:
      'HISTORICAL',

    CANCELLED:
      'CANCELLED',

    CLOSED:
      'CLOSED',

    OPEN:
      'OPEN',

    NOT_VERIFIED:
      'NOT_VERIFIED',

    IRREGULAR:
      'IRREGULAR',

    EXPECTED_PERIODIC:
      'EXPECTED_PERIODIC'
  });

function normalizeRecruitmentStatus(
  value
) {
  const direct =
    normalizeEnumIgnoreCase(
      value,
      RECRUITMENT_STATUS_VALUES,
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  return (
    RECRUITMENT_STATUS_ALIASES[
      cleanString(
        value,
        ''
      )
        .toUpperCase()
        .replace(
          /[-\s]+/g,
          '_'
        )
    ] ||
    null
  );
}

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

  /*
   * Recruitment schema is strict. Only schema-authorized fields are emitted.
   * In particular, legacy jobIds/serviceCadreId/departmentId/organisationId
   * are NOT copied into canonical Recruitment.
   */
  return removeNullish({
    id:
      cleanId(
        recruitment.id
      ),

    authorityId:
      cleanId(
        recruitment.authorityId
      ),

    examId:
      cleanId(
        recruitment.examId
      ),

    postIds:
      normalizeIdArray(
        recruitment.postIds
      ),

    mode:
      normalizeRecruitmentEntityMode(
        recruitment.mode ??
        recruitment.recruitmentMode ??
        recruitment.recruitmentRoute
      ),

    status:
      normalizeRecruitmentStatus(
        recruitment.status
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
      ),

    /*
     * Recruitment schema allows integer OR string. The source may legitimately
     * contain a numeric string, so keep the canonical value numeric when it is
     * unambiguous and otherwise preserve a non-empty string.
     */
    vacancy:
      normalizeRecruitmentVacancy(
        recruitment.vacancy
      ),

    vacancyBreakdown:
      normalizeRecruitmentVacancyBreakdown(
        recruitment.vacancyBreakdown
      ),

    applicationUrl:
      cleanNullableString(
        recruitment.applicationUrl
      ),

    notificationUrl:
      cleanNullableString(
        recruitment.notificationUrl
      ),

    sourceIds:
      normalizeIdArray(
        recruitment.sourceIds
      ),

    currentness:
      normalizeCurrentness(
        recruitment.currentness
      ),

    confidence:
      normalizeConfidence(
        recruitment.confidence
      ),

    notes:
      cleanNullableString(
        recruitment.notes
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
      )
  });
}

function normalizeRecruitmentVacancy(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  if (
    typeof value ===
      'boolean'
  ) {
    return null;
  }

  if (
    typeof value ===
    'number'
  ) {
    return Number.isInteger(
      value
    ) &&
    value >=
      0
      ? value
      : null;
  }

  const text =
    cleanString(
      value,
      ''
    );

  if (
    /^\d+$/.test(
      text
    )
  ) {
    return Number(
      text
    );
  }

  return text || null;
}

function normalizeRecruitmentVacancyBreakdown(
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

  Object.entries(
    value
  ).forEach(
    ([
      key,
      item
    ]) => {
      const normalizedKey =
        cleanString(
          key,
          ''
        );

      if (
        !normalizedKey
      ) {
        return;
      }

      const normalizedValue =
        normalizeRecruitmentVacancy(
          item
        );

      if (
        normalizedValue !==
          null
      ) {
        result[
          normalizedKey
        ] =
          normalizedValue;
      }
    }
  );

  return Object.keys(
    result
  ).length
    ? result
    : null;
}

/* -------------------------------------------------------------------------- */
/* Profile metadata                                                           */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Pay                                                                        */
/* -------------------------------------------------------------------------- */

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

    sourceIds:
      normalizeIdArray(
        pay.sourceIds
      ),

    confidence:
      normalizeConfidence(
        pay.confidence
      ),

    lastVerified:
      normalizeDate(
        pay.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        pay.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

/* -------------------------------------------------------------------------- */
/* Location                                                                    */
/* -------------------------------------------------------------------------- */

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

  return removeNullish({
    id:
      cleanId(
        location.id
      ),

    postingCategory:
      normalizeEnumIgnoreCase(
        location.postingCategory ??
        location.type,
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
      ),

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

    sourceIds:
      normalizeIdArray(
        location.sourceIds
      ),

    confidence:
      normalizeConfidence(
        location.confidence
      ),

    lastVerified:
      normalizeDate(
        location.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        location.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

/* -------------------------------------------------------------------------- */
/* Housing                                                                     */
/* -------------------------------------------------------------------------- */

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

    sourceIds:
      normalizeIdArray(
        housing.sourceIds
      ),

    confidence:
      normalizeConfidence(
        housing.confidence
      ),

    lastVerified:
      normalizeDate(
        housing.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        housing.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

/* -------------------------------------------------------------------------- */
/* Promotion                                                                   */
/* -------------------------------------------------------------------------- */

function normalizePromotionStep(
  step
) {
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
      normalizePromotionStep
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

    sourceIds:
      normalizeIdArray(
        promotion.sourceIds
      ),

    confidence:
      normalizeConfidence(
        promotion.confidence
      ),

    lastVerified:
      normalizeDate(
        promotion.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        promotion.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

/* -------------------------------------------------------------------------- */
/* Benefits                                                                    */
/* -------------------------------------------------------------------------- */

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

    sourceIds:
      normalizeIdArray(
        benefit.sourceIds
      ),

    confidence:
      normalizeConfidence(
        benefit.confidence
      ),

    lastVerified:
      normalizeDate(
        benefit.lastVerified ??
        context.metadata?.lastVerified
      ),

    dataVersion:
      cleanNullableString(
        benefit.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

/* -------------------------------------------------------------------------- */
/* Government / State / Qualification / Category                              */
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
        GOVERNMENT_TYPES,
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

  const typeFallback =
    context.collectionKey ===
      'unionTerritories'
      ? 'UNION_TERRITORY'
      : (
          context.collectionKey ===
            'states'
            ? 'STATE'
            : null
        );

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
        STATE_TYPES,
        typeFallback
      ),

    capital:
      state.capital ===
        undefined
        ? undefined
        : normalizeLocalizedText(
            state.capital
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
      normalizeEnumIgnoreCase(
        qualification.qualificationType,
        QUALIFICATION_TYPES,
        null
      ) ??
      QUALIFICATION_TYPE_BY_COLLECTION[
        context.collectionKey
      ] ??
      null,

    educationLevel:
      normalizeEducationLevel(
        qualification.educationLevel
      ),

    degreeType:
      cleanNullableString(
        qualification.degreeType
      ),

    subjectIds:
      normalizeIdArray(
        qualification.subjectIds
      ),

    specialisation:
      cleanNullableString(
        qualification.specialisation
      ),

    tradeId:
      cleanId(
        qualification.tradeId
      ),

    recognisingAuthority:
      cleanNullableString(
        qualification.recognisingAuthority
      ),

    registrationAuthority:
      cleanNullableString(
        qualification.registrationAuthority
      ),

    registrationRequired:
      normalizeOptionalBoolean(
        qualification.registrationRequired
      ),

    licenceType:
      cleanNullableString(
        qualification.licenceType
      ),

    minimumDuration:
      cleanNullableString(
        qualification.minimumDuration
      ),

    status:
      normalizeEnumIgnoreCase(
        qualification.status,
        QUALIFICATION_STATUSES,
        null
      ),

    isSpecialist:
      normalizeOptionalBoolean(
        qualification.isSpecialist
      ),

    aliases:
      normalizeStringArray(
        qualification.aliases
      ),

    sourceIds:
      normalizeIdArray(
        qualification.sourceIds
      ),

    confidence:
      normalizeConfidence(
        qualification.confidence
      ),

    dataVersion:
      cleanNullableString(
        qualification.dataVersion ??
        context.metadata?.dataVersion
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

/* -------------------------------------------------------------------------- */
/* Source normalization                                                       */
/* -------------------------------------------------------------------------- */

function normalizeSourceDocumentType(
  value
) {
  const direct =
    normalizeEnumIgnoreCase(
      value,
      SOURCE_DOCUMENT_TYPE_VALUES,
      null
    );

  if (
    direct
  ) {
    return direct;
  }

  return (
    SOURCE_DOCUMENT_TYPE_ALIASES[
      cleanString(
        value,
        ''
      )
        .toUpperCase()
        .replace(
          /[-\s]+/g,
          '_'
        )
    ] ||
    null
  );
}

function normalizeSourcePriority(
  source
) {
  const explicit =
    normalizeEnumIgnoreCase(
      source.sourcePriority,
      SOURCE_PRIORITY_VALUES,
      null
    );

  if (
    explicit
  ) {
    return explicit;
  }

  return {
    OFFICIAL_CURRENT:
      'PRIMARY_CURRENT',

    OFFICIAL_HISTORICAL:
      'PRIMARY_HISTORICAL',

    OFFICIAL_RULE:
      'OFFICIAL_GENERAL',

    SECONDARY:
      'SECONDARY'
  }[
    cleanString(
      source.sourceType,
      ''
    ).toUpperCase()
  ] || null;
}

function normalizeSourceCurrentness(
  source
) {
  const explicit =
    normalizeEnumIgnoreCase(
      source.currentness,
      SOURCE_CURRENTNESS_VALUES,
      null
    );

  if (
    explicit
  ) {
    return explicit;
  }

  return {
    OFFICIAL_CURRENT:
      'CURRENT',

    OFFICIAL_HISTORICAL:
      'HISTORICAL',

    OFFICIAL_RULE:
      'CURRENTNESS_UNCLEAR',

    SECONDARY:
      'CURRENTNESS_UNCLEAR'
  }[
    cleanString(
      source.sourceType,
      ''
    ).toUpperCase()
  ] || null;
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

  /*
   * Current repository source records use `relevance` as their source-claim
   * list. The canonical schema calls this `supportedClaims`, so that explicit
   * legacy alias is intentionally retained.
   */
  const supportedClaims =
    normalizeNonEmptyStringArray(
      source.supportedClaims ??
      source.relevance
    );

  return removeNullish({
    id:
      cleanId(
        source.id
      ),

    organisation:
      cleanString(
        source.organisation,
        ''
      ),

    department:
      cleanNullableString(
        source.department
      ),

    title:
      cleanString(
        source.title,
        ''
      ),

    documentType:
      normalizeSourceDocumentType(
        source.documentType
      ),

    publicationDate:
      normalizeDate(
        source.publicationDate
      ),

    verificationDate:
      normalizeDate(
        source.verificationDate ??
        source.lastVerified ??
        context.metadata?.lastVerified
      ),

    url:
      cleanNullableString(
        source.url
      ),

    archiveUrl:
      cleanNullableString(
        source.archiveUrl
      ),

    sourcePriority:
      normalizeSourcePriority(
        source
      ),

    confidence:
      normalizeConfidence(
        source.confidence
      ),

    currentness:
      normalizeSourceCurrentness(
        source
      ),

    supportedClaims,

    notes:
      cleanNullableString(
        source.notes
      ),

    dataVersion:
      cleanNullableString(
        source.dataVersion ??
        context.metadata?.dataVersion
      )
  });
}

/* -------------------------------------------------------------------------- */
/* Status / compatibility reference records                                  */
/* -------------------------------------------------------------------------- */

function normalizeStatus(
  status
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
      )
  });
}

/*
 * Generic reference entities are intentionally retained for non-domain
 * compatibility collections whose canonical schema/runtime contract is not
 * one of the strict builders above.
 *
 * They are NOT used for Job, Exam, Service Cadre, Eligibility Rule,
 * Recruitment, Profile, Government, State, Qualification, Organisation,
 * Department or Source canonical objects.
 */
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
/* Search compatibility utility                                               */
/* -------------------------------------------------------------------------- */

/*
 * Search indexing belongs to the search/index layer. This helper remains only
 * for compatibility with existing callers and never injects searchText into
 * canonical records.
 *
 * Objects are recursively flattened through values, preventing
 * "[object Object]" contamination.
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
        value !== undefined &&
        value !== null
    )
    .map(
      value =>
        flattenSearchValue(
          value
        )
    )
    .filter(Boolean)
    .join(' ')
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function flattenSearchValue(
  value
) {
  if (
    typeof value ===
    'string'
  ) {
    return cleanString(
      value,
      ''
    );
  }

  if (
    typeof value ===
      'number' ||
    typeof value ===
      'boolean'
  ) {
    return String(
      value
    );
  }

  if (
    Array.isArray(
      value
    )
  ) {
    return value
      .map(
        flattenSearchValue
      )
      .filter(Boolean)
      .join(' ');
  }

  if (
    isPlainObject(
      value
    )
  ) {
    return Object.values(
      value
    )
      .map(
        flattenSearchValue
      )
      .filter(Boolean)
      .join(' ');
  }

  return '';
}

/* -------------------------------------------------------------------------- */
/* Public dispatcher                                                          */
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
        const recordContext =
          {
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
  return normalizeByType(
    data,
    {
      ...normalizeContext(
        entityType
      ),

      ...context
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
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

  normalizePlainString,

  normalizeDate,

  normalizeNumber,

  normalizeBoolean,

  normalizeEnum,

  normalizeIdArray,

  normalizeNonEmptyStringArray,

  normalizeNonEmptyIdArray,

  normalizeSources,

  normalizeSourceReference,

  normalizeRequirement,

  normalizeRequirements,

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

  normalizeStatus,

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
