/**
 * GovCareer Compass
 * ============================================================
 * Runtime Database Validator
 * ============================================================
 *
 * Runtime validation complements repository-level JSON Schema validation.
 *
 * Architectural responsibility
 * -----------------------------
 * This module validates already-normalized canonical runtime data.
 *
 * It does NOT:
 * - normalize records;
 * - repair records;
 * - mutate canonical records;
 * - load data;
 * - resolve candidate eligibility;
 * - calculate preference fit;
 * - score careers;
 * - rank careers;
 * - perform AI work;
 * - treat derived indexes as canonical data;
 * - use legacy `baEligibility` as an authority.
 *
 * Canonical source-of-truth order
 * -------------------------------
 *
 *   source JSON
 *       ↓
 *   loader
 *       ↓
 *   normalizer
 *       ↓
 *   validator
 *       ↓
 *   runtime registry
 *       ↓
 *   derived indexes
 *       ↓
 *   search / filters / recommendation / AI explanation
 *
 * Fatal integrity problems are returned in `errors`.
 * Non-fatal data-quality problems are returned in `warnings`.
 * Diagnostics are returned in `infos`.
 *
 * The validator intentionally performs semantic checks that JSON Schema
 * cannot safely express in the repository contract, including:
 * - minimum <= maximum;
 * - effectiveFrom <= effectiveTo;
 * - eligibility dependency integrity;
 * - eligibility dependency cycles;
 * - hierarchical service-cadre cycles;
 * - cross-entity reference integrity;
 * - duplicate IDs;
 * - cross-namespace ID collisions;
 * - derived-index references to canonical IDs.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const VALID_JOB_ELIGIBILITY =
  Object.freeze(
    new Set([
      'DIRECT',
      'CONDITIONAL',
      'NOT_ELIGIBLE',
      'MANUAL_VERIFICATION',
      'REVIEW_REQUIRED',
      'UNKNOWN'
    ])
  );

const VALID_RULE_CLASSES =
  Object.freeze(
    new Set([
      'HARD',
      'SOFT'
    ])
  );

const VALID_RULE_EFFECTS =
  Object.freeze(
    new Set([
      'ALLOW',
      'DENY',
      'REQUIRE_VERIFICATION',
      'CONDITIONAL',
      'MODIFY'
    ])
  );

const VALID_OPERATORS =
  Object.freeze(
    new Set([
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
    ])
  );

const VALID_CONFIDENCE =
  Object.freeze(
    new Set([
      'HIGH',
      'MEDIUM_HIGH',
      'MEDIUM',
      'LOW',
      'ESTIMATE',
      'NOT_VERIFIED',
      'UNKNOWN'
    ])
  );

const VALID_SEVERITIES =
  Object.freeze(
    new Set([
      'ERROR',
      'WARNING',
      'INFO'
    ])
  );

const VALID_METRIC_DIRECTIONS =
  Object.freeze(
    new Set([
      'higher_is_better',
      'higher_is_worse',
      'lower_is_better',
      'lower_is_worse',
      'neutral'
    ])
  );

const VALID_ENTITY_TYPES =
  Object.freeze(
    new Set([
      'JOB',
      'EXAM',
      'DEPARTMENT',
      'ORGANISATION',
      'SERVICE_CADRE',
      'ELIGIBILITY_RULE',
      'RECRUITMENT',
      'PAY',
      'LOCATION',
      'HOUSING',
      'PROMOTION',
      'BENEFIT',
      'SOURCE',
      'GOVERNMENT',
      'STATE',
      'QUALIFICATION',
      'CATEGORY',
      'GLOSSARY',
      'SCORING_RULE',
      'STATUS',
      'CONFIDENCE_LEVEL',
      'SOURCE_TYPE',
      'ASSESSMENT_QUESTION',
      'ASSESSMENT_OPTION',
      'ASSESSMENT_BRANCHING',
      'ASSESSMENT_PROFILE_FIELD',
      'ASSESSMENT_RESPONSE_SCORING'
    ])
  );

const SCORE_FIELDS =
  Object.freeze([
    'workLife',
    'stress',
    'physicalRisk',
    'authority',
    'familyCompatibility',
    'parentCareCompatibility',
    'kolkataStability',
    'transferBurden',
    'careerGrowth',
    'socialStatus',
    'housingAdvantage',
    'physicalSafety'
  ]);

const SCORE_FIELD_PATHS =
  Object.freeze([
    ...SCORE_FIELDS.map(
      field =>
        `analysis.${field}`
    ),

    ...SCORE_FIELDS.map(
      field =>
        `lifestyle.${field}`
    ),

    ...SCORE_FIELDS
  ]);

const PERCENTAGE_FIELDS =
  Object.freeze(
    new Set([
      'percentage',
      'minimumPercentage',
      'maximumPercentage',
      'minPercentage',
      'maxPercentage',
      'minimumMarksPercentage',
      'maximumMarksPercentage',
      'minimumAggregatePercentage',
      'maximumAggregatePercentage',
      'reservationPercentage',
      'daPercentage',
      'hraPercentage',
      'otherAllowancePercentage'
    ])
  );

const NON_NEGATIVE_NUMERIC_FIELDS =
  Object.freeze(
    new Set([
      'startingBasic',
      'maximumBasic',
      'basicPay',
      'minimumPay',
      'maximumPay',
      'minPay',
      'maxPay',
      'age',
      'minimumAge',
      'maximumAge',
      'minAge',
      'maxAge',
      'minimumMarks',
      'maximumMarks',
      'minMarks',
      'maxMarks',
      'experienceYears',
      'minimumExperienceYears',
      'maximumExperienceYears',
      'minExperienceYears',
      'maxExperienceYears',
      'vacancies',
      'sanctionedStrength',
      'yearsOfService',
      'probationMonths',
      'noticePeriodDays',
      'priority',
      'weight',
      'score',
      'minimumScore',
      'maximumScore'
    ])
  );

const DATE_FIELDS =
  Object.freeze(
    new Set([
      'date',
      'startDate',
      'endDate',
      'effectiveFrom',
      'effectiveTo',
      'validFrom',
      'validTo',
      'notificationDate',
      'publicationDate',
      'lastUpdated',
      'lastVerified',
      'sourceDate',
      'asOfDate',
      'effectiveDate',
      'publishedDate'
    ])
  );

const COLLECTION_ENTITY_TYPES =
  Object.freeze({
    jobs: 'JOB',
    exams: 'EXAM',
    departments: 'DEPARTMENT',
    organisations: 'ORGANISATION',
    serviceCadres: 'SERVICE_CADRE',
    eligibilityRules: 'ELIGIBILITY_RULE',
    recruitment: 'RECRUITMENT',
    pay: 'PAY',
    locations: 'LOCATION',
    housing: 'HOUSING',
    promotion: 'PROMOTION',
    benefits: 'BENEFIT',
    sources: 'SOURCE',
    governments: 'GOVERNMENT',
    states: 'STATE',
    qualifications: 'QUALIFICATION',
    categories: 'CATEGORY',
    glossary: 'GLOSSARY',
    scoringRules: 'SCORING_RULE',
    statuses: 'STATUS',
    confidenceLevels: 'CONFIDENCE_LEVEL',
    sourceTypes: 'SOURCE_TYPE',
    assessmentQuestions: 'ASSESSMENT_QUESTION',
    assessmentOptions: 'ASSESSMENT_OPTION',
    assessmentBranching: 'ASSESSMENT_BRANCHING',
    assessmentProfileFields: 'ASSESSMENT_PROFILE_FIELD',
    assessmentResponseScoring:
      'ASSESSMENT_RESPONSE_SCORING'
  });

const HIERARCHY_RELATIONSHIPS =
  Object.freeze([
    Object.freeze({
      collection: 'departments',
      field: 'parentDepartmentId',
      targetCollection: 'departments'
    }),

    Object.freeze({
      collection: 'departments',
      field: 'parentId',
      targetCollection: 'departments'
    }),

    Object.freeze({
      collection: 'organisations',
      field: 'parentOrganisationId',
      targetCollection: 'organisations'
    }),

    Object.freeze({
      collection: 'organisations',
      field: 'parentId',
      targetCollection: 'organisations'
    }),

    Object.freeze({
      collection: 'locations',
      field: 'parentLocationId',
      targetCollection: 'locations'
    }),

    Object.freeze({
      collection: 'categories',
      field: 'parentCategoryId',
      targetCollection: 'categories'
    }),

    Object.freeze({
      collection: 'serviceCadres',
      field: 'parentServiceCadreId',
      targetCollection: 'serviceCadres'
    })
  ]);

/*
 * Canonical reference contract.
 *
 * IMPORTANT:
 * These paths intentionally follow the finalized relational schemas rather
 * than the retired flat job shape.
 */
const REFERENCE_PATHS =
  Object.freeze({
    jobs:
      Object.freeze([
        Object.freeze({
          path: 'identity.governmentId',
          target: 'governments',
          kind: 'one'
        }),

        Object.freeze({
          path: 'identity.stateId',
          target: 'states',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'identity.departmentId',
          target: 'departments',
          kind: 'one'
        }),

        Object.freeze({
          path: 'identity.organisationId',
          target: 'organisations',
          kind: 'one'
        }),

        Object.freeze({
          path: 'identity.serviceCadreId',
          target: 'serviceCadres',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'identity.parentPostId',
          target: 'jobs',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'recruitment.examIds',
          target: 'exams',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'recruitment.recruitmentIds',
          target: 'recruitment',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'eligibility.qualificationIds',
          target: 'qualifications',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'eligibility.minimumQualificationId',
          target: 'qualifications',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'eligibility.ruleIds',
          target: 'eligibilityRules',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'payProfileId',
          target: 'pay',
          kind: 'one'
        }),

        Object.freeze({
          path: 'locationProfileId',
          target: 'locations',
          kind: 'one'
        }),

        Object.freeze({
          path: 'housingProfileId',
          target: 'housing',
          kind: 'one'
        }),

        Object.freeze({
          path: 'promotionProfileId',
          target: 'promotion',
          kind: 'one'
        }),

        Object.freeze({
          path: 'benefitProfileId',
          target: 'benefits',
          kind: 'one'
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many'
        })
      ]),

    exams:
      Object.freeze([
        Object.freeze({
          path: 'governmentId',
          target: 'governments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'stateId',
          target: 'states',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'recruitingAuthorityId',
          target: 'organisations',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'departmentId',
          target: 'departments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'organisationId',
          target: 'organisations',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'serviceCadreId',
          target: 'serviceCadres',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'qualificationLevelIds',
          target: 'qualifications',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'qualificationIds',
          target: 'qualifications',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'postIds',
          target: 'jobs',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'jobIds',
          target: 'jobs',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    serviceCadres:
      Object.freeze([
        Object.freeze({
          path: 'governmentId',
          target: 'governments',
          kind: 'one'
        }),

        Object.freeze({
          path: 'stateId',
          target: 'states',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'ministryId',
          target: 'departments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'departmentId',
          target: 'departments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'organisationId',
          target: 'organisations',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'parentServiceCadreId',
          target: 'serviceCadres',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'postIds',
          target: 'jobs',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'examIds',
          target: 'exams',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'recruitmentIds',
          target: 'recruitment',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'eligibilityRuleIds',
          target: 'eligibilityRules',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'payIds',
          target: 'pay',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'promotionIds',
          target: 'promotion',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'benefitIds',
          target: 'benefits',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'locationIds',
          target: 'locations',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'postingScope.locationIds',
          target: 'locations',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'cadreScope.stateIds',
          target: 'states',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    eligibilityRules:
      Object.freeze([
        Object.freeze({
          path: 'qualificationIds',
          target: 'qualifications',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'requiredQualificationIds',
          target: 'qualifications',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'subjectIds',
          target: 'qualifications',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'requiredSubjectIds',
          target: 'qualifications',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'recruitmentIds',
          target: 'recruitment',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many'
        }),

        Object.freeze({
          path: 'dependsOnRuleIds',
          target: 'eligibilityRules',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'parentRuleIds',
          target: 'eligibilityRules',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'logic.ruleIds',
          target: 'eligibilityRules',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'jobId',
          target: 'jobs',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'serviceCadreId',
          target: 'serviceCadres',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'examId',
          target: 'exams',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'targetJobId',
          target: 'jobs',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'targetServiceCadreId',
          target: 'serviceCadres',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'governmentId',
          target: 'governments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'stateId',
          target: 'states',
          kind: 'one',
          optional: true
        })
      ]),

    recruitment:
      Object.freeze([
        Object.freeze({
          path: 'examId',
          target: 'exams',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'jobIds',
          target: 'jobs',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'postIds',
          target: 'jobs',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'serviceCadreId',
          target: 'serviceCadres',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'departmentId',
          target: 'departments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'organisationId',
          target: 'organisations',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    pay:
      Object.freeze([
        Object.freeze({
          path: 'jobId',
          target: 'jobs',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'serviceCadreId',
          target: 'serviceCadres',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    locations:
      Object.freeze([
        Object.freeze({
          path: 'stateId',
          target: 'states',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'parentLocationId',
          target: 'locations',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    housing:
      Object.freeze([
        Object.freeze({
          path: 'jobId',
          target: 'jobs',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'locationId',
          target: 'locations',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'stateId',
          target: 'states',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    promotion:
      Object.freeze([
        Object.freeze({
          path: 'jobId',
          target: 'jobs',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'serviceCadreId',
          target: 'serviceCadres',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'nextJobId',
          target: 'jobs',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'previousJobId',
          target: 'jobs',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    benefits:
      Object.freeze([
        Object.freeze({
          path: 'jobId',
          target: 'jobs',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'governmentId',
          target: 'governments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'stateId',
          target: 'states',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    departments:
      Object.freeze([
        Object.freeze({
          path: 'governmentId',
          target: 'governments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'stateId',
          target: 'states',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'ministryId',
          target: 'departments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'organisationIds',
          target: 'organisations',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'serviceCadreIds',
          target: 'serviceCadres',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'examIds',
          target: 'exams',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'jobIds',
          target: 'jobs',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'locationIds',
          target: 'locations',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'categoryIds',
          target: 'categories',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'recruitmentAuthorityIds',
          target: 'organisations',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    organisations:
      Object.freeze([
        Object.freeze({
          path: 'governmentId',
          target: 'governments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'stateId',
          target: 'states',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'departmentId',
          target: 'departments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'departmentIds',
          target: 'departments',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'serviceCadreIds',
          target: 'serviceCadres',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'examIds',
          target: 'exams',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'jobIds',
          target: 'jobs',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'locationIds',
          target: 'locations',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    sources:
      Object.freeze([
        Object.freeze({
          path: 'governmentId',
          target: 'governments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'stateId',
          target: 'states',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'departmentId',
          target: 'departments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'organisationId',
          target: 'organisations',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'examIds',
          target: 'exams',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'jobIds',
          target: 'jobs',
          kind: 'many',
          optional: true
        }),

        Object.freeze({
          path: 'serviceCadreIds',
          target: 'serviceCadres',
          kind: 'many',
          optional: true
        })
      ]),

    states:
      Object.freeze([
        Object.freeze({
          path: 'governmentId',
          target: 'governments',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    qualifications:
      Object.freeze([
        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    categories:
      Object.freeze([
        Object.freeze({
          path: 'parentCategoryId',
          target: 'categories',
          kind: 'one',
          optional: true
        }),

        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ]),

    governments:
      Object.freeze([
        Object.freeze({
          path: 'sourceIds',
          target: 'sources',
          kind: 'many',
          optional: true
        })
      ])
  });

/* -------------------------------------------------------------------------- */
/* Primitive helpers                                                          */
/* -------------------------------------------------------------------------- */

function isObject(
  value
) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function isNonEmptyString(
  value
) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0
  );
}

function isFiniteNumber(
  value
) {
  return (
    typeof value === 'number' &&
    Number.isFinite(value)
  );
}

function issue(
  severity,
  code,
  message,
  path = null,
  details = undefined
) {
  if (
    !VALID_SEVERITIES.has(
      severity
    )
  ) {
    throw new Error(
      `Invalid validation severity "${severity}".`
    );
  }

  const result = {
    severity,
    code,
    message,
    path
  };

  if (
    details !== undefined
  ) {
    result.details =
      details;
  }

  return result;
}

function makeResult(
  errors = [],
  warnings = [],
  infos = []
) {
  return {
    valid:
      errors.length === 0,

    errors,
    warnings,
    infos,

    counts: {
      errors:
        errors.length,

      warnings:
        warnings.length,

      infos:
        infos.length
    }
  };
}

function addIssues(
  target,
  values
) {
  if (
    !Array.isArray(values)
  ) {
    return;
  }

  target.push(
    ...values
  );
}

function getArray(
  value
) {
  return Array.isArray(value)
    ? value
    : [];
}

function trimId(
  value
) {
  return isNonEmptyString(
    value
  )
    ? value.trim()
    : '';
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

  const parts =
    String(path)
      .split('.')
      .filter(Boolean);

  let current =
    object;

  for (
    const part of parts
  ) {
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return undefined;
    }

    current =
      current[part];
  }

  return current;
}

function getPathEntries(
  object,
  path
) {
  return flattenValues(
    getPathValue(
      object,
      path
    )
  );
}

function flattenValues(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return [];
  }

  if (
    typeof value ===
      'string' ||
    typeof value ===
      'number' ||
    typeof value ===
      'boolean'
  ) {
    return [
      value
    ];
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
    typeof value ===
      'object'
  ) {
    return Object.values(
      value
    ).flatMap(
      flattenValues
    );
  }

  return [];
}

function getFirstScalar(
  object,
  paths
) {
  const candidates =
    Array.isArray(paths)
      ? paths
      : [
          paths
        ];

  for (
    const path of candidates
  ) {
    const values =
      getPathEntries(
        object,
        path
      );

    const value =
      values.find(
        item =>
          isNonEmptyString(
            String(item)
          )
      );

    if (
      value !== undefined
    ) {
      return value;
    }
  }

  return '';
}

/* -------------------------------------------------------------------------- */
/* Collection / entity validation                                             */
/* -------------------------------------------------------------------------- */

function validateObjectRecords(
  records,
  entityName
) {
  const errors = [];

  if (
    !Array.isArray(records)
  ) {
    errors.push(
      issue(
        'ERROR',
        'NOT_ARRAY',
        `${entityName} must be an array.`,
        entityName
      )
    );

    return errors;
  }

  records.forEach(
    (record, index) => {
      if (
        !isObject(record)
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_RECORD',
            `${entityName} record must be an object.`,
            `${entityName}[${index}]`
          )
        );
      }
    }
  );

  return errors;
}

function validateIds(
  records,
  entityName
) {
  const errors = [];
  const seen =
    new Set();

  if (
    !Array.isArray(records)
  ) {
    return errors;
  }

  records.forEach(
    (record, index) => {
      if (
        !isObject(record)
      ) {
        return;
      }

      const id =
        record.id;

      if (
        !isNonEmptyString(
          id
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_ID',
            `${entityName} record requires a stable non-empty string ID.`,
            `${entityName}[${index}].id`
          )
        );

        return;
      }

      const normalized =
        id.trim();

      if (
        seen.has(
          normalized
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'DUPLICATE_ID',
            `Duplicate ${entityName} ID "${normalized}".`,
            `${entityName}[${index}].id`,
            {
              id:
                normalized
            }
          )
        );

        return;
      }

      seen.add(
        normalized
      );
    }
  );

  return errors;
}

function validateEntityTypes(
  records,
  entityName,
  expectedEntityType
) {
  const errors = [];

  if (
    !Array.isArray(records)
  ) {
    return errors;
  }

  records.forEach(
    (record, index) => {
      if (
        !isObject(record)
      ) {
        return;
      }

      const explicitType =
        record.entityType ??
        record._type;

      /*
       * `record.type` is deliberately not interpreted as entityType.
       *
       * Many canonical records legitimately use `type` as a domain field:
       * service-cadre.type, source.type, qualification.type, etc.
       */
      if (
        explicitType ===
          undefined ||
        explicitType ===
          null
      ) {
        return;
      }

      if (
        !isNonEmptyString(
          explicitType
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_ENTITY_TYPE',
            `${entityName}.entityType must be a non-empty string when present.`,
            `${entityName}[${index}].entityType`
          )
        );

        return;
      }

      const normalized =
        explicitType
          .trim()
          .toUpperCase();

      if (
        !VALID_ENTITY_TYPES.has(
          normalized
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'UNKNOWN_ENTITY_TYPE',
            `Unknown entity type "${explicitType}".`,
            `${entityName}[${index}].entityType`
          )
        );

        return;
      }

      if (
        expectedEntityType &&
        normalized !==
          expectedEntityType
      ) {
        errors.push(
          issue(
            'ERROR',
            'ENTITY_TYPE_MISMATCH',
            `${entityName} record declares "${normalized}" but expected "${expectedEntityType}".`,
            `${entityName}[${index}].entityType`
          )
        );
      }
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Numeric/date validation                                                    */
/* -------------------------------------------------------------------------- */

function validateNumericFields(
  value,
  path,
  {
    recursive = true
  } = {}
) {
  const errors = [];

  if (
    !isObject(value)
  ) {
    return errors;
  }

  Object.entries(
    value
  ).forEach(
    ([
      field,
      fieldValue
    ]) => {
      const currentPath =
        `${path}.${field}`;

      if (
        recursive &&
        isObject(
          fieldValue
        )
      ) {
        errors.push(
          ...validateNumericFields(
            fieldValue,
            currentPath,
            {
              recursive: true
            }
          )
        );
      }

      if (
        NON_NEGATIVE_NUMERIC_FIELDS.has(
          field
        )
      ) {
        if (
          fieldValue ===
            undefined ||
          fieldValue ===
            null
        ) {
          return;
        }

        if (
          !isFiniteNumber(
            fieldValue
          ) ||
          fieldValue < 0
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_NON_NEGATIVE_NUMBER',
              `${field} must be a finite non-negative number.`,
              currentPath
            )
          );
        }
      }

      if (
        PERCENTAGE_FIELDS.has(
          field
        )
      ) {
        if (
          fieldValue ===
            undefined ||
          fieldValue ===
            null
        ) {
          return;
        }

        if (
          !isFiniteNumber(
            fieldValue
          ) ||
          fieldValue < 0 ||
          fieldValue > 100
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_PERCENTAGE',
              `${field} must be a finite number from 0 to 100.`,
              currentPath
            )
          );
        }
      }
    }
  );

  return errors;
}

function isValidDateString(
  value
) {
  if (
    !isNonEmptyString(
      value
    )
  ) {
    return false;
  }

  const text =
    value.trim();

  if (
    !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(
      text
    )
  ) {
    return false;
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
    return false;
  }

  /*
   * Reject impossible calendar dates such as 2026-02-31.
   */
  const datePart =
    text.slice(
      0,
      10
    );

  const [
    year,
    month,
    day
  ] =
    datePart
      .split(
        '-'
      )
      .map(
        Number
      );

  const reconstructed =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  return (
    reconstructed.getUTCFullYear() ===
      year &&
    reconstructed.getUTCMonth() ===
      month - 1 &&
    reconstructed.getUTCDate() ===
      day
  );
}

function validateDateFieldsRecursive(
  value,
  path
) {
  const errors = [];

  if (
    !isObject(value)
  ) {
    return errors;
  }

  Object.entries(
    value
  ).forEach(
    ([
      field,
      fieldValue
    ]) => {
      const currentPath =
        `${path}.${field}`;

      if (
        DATE_FIELDS.has(
          field
        )
      ) {
        if (
          fieldValue ===
            undefined ||
          fieldValue ===
            null ||
          fieldValue ===
            ''
        ) {
          return;
        }

        if (
          !isValidDateString(
            fieldValue
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_DATE',
              `${field} must use YYYY-MM-DD or an ISO datetime with a valid calendar date.`,
              currentPath
            )
          );
        }

        return;
      }

      if (
        isObject(
          fieldValue
        )
      ) {
        errors.push(
          ...validateDateFieldsRecursive(
            fieldValue,
            currentPath
          )
        );

        return;
      }

      if (
        Array.isArray(
          fieldValue
        )
      ) {
        fieldValue.forEach(
          (
            item,
            index
          ) => {
            if (
              isObject(
                item
              )
            ) {
              errors.push(
                ...validateDateFieldsRecursive(
                  item,
                  `${currentPath}[${index}]`
                )
              );
            }
          }
        );
      }
    }
  );

  return errors;
}

function dateValue(
  value
) {
  if (
    !isValidDateString(
      value
    )
  ) {
    return null;
  }

  return new Date(
    value
  ).getTime();
}

function validateDateRanges(
  value,
  path
) {
  const errors = [];

  if (
    !isObject(value)
  ) {
    return errors;
  }

  const ranges = [
    [
      'effectiveFrom',
      'effectiveTo'
    ],

    [
      'validFrom',
      'validTo'
    ],

    [
      'startDate',
      'endDate'
    ]
  ];

  ranges.forEach(
    ([
      fromField,
      toField
    ]) => {
      const from =
        value[
          fromField
        ];

      const to =
        value[
          toField
        ];

      if (
        from ===
          undefined ||
        from ===
          null ||
        from ===
          '' ||
        to ===
          undefined ||
        to ===
          null ||
        to ===
          ''
      ) {
        return;
      }

      const fromTime =
        dateValue(
          from
        );

      const toTime =
        dateValue(
          to
        );

      if (
        fromTime === null ||
        toTime === null
      ) {
        return;
      }

      if (
        fromTime >
        toTime
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_DATE_RANGE',
            `${fromField} cannot be later than ${toField}.`,
            path,
            {
              fromField,
              toField
            }
          )
        );
      }
    }
  );

  return errors;
}

function validateDateRangesRecursive(
  value,
  path
) {
  const errors = [];

  if (
    !isObject(value)
  ) {
    return errors;
  }

  errors.push(
    ...validateDateRanges(
      value,
      path
    )
  );

  Object.entries(
    value
  ).forEach(
    ([
      field,
      fieldValue
    ]) => {
      const currentPath =
        `${path}.${field}`;

      if (
        isObject(
          fieldValue
        )
      ) {
        errors.push(
          ...validateDateRangesRecursive(
            fieldValue,
            currentPath
          )
        );
      }

      if (
        Array.isArray(
          fieldValue
        )
      ) {
        fieldValue.forEach(
          (
            item,
            index
          ) => {
            if (
              isObject(
                item
              )
            ) {
              errors.push(
                ...validateDateRangesRecursive(
                  item,
                  `${currentPath}[${index}]`
                )
              );
            }
          }
        );
      }
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Confidence / scores                                                        */
/* -------------------------------------------------------------------------- */

function validateConfidence(
  record,
  path
) {
  const errors = [];

  const confidence =
    record?.confidence;

  if (
    confidence ===
      undefined ||
    confidence ===
      null ||
    confidence ===
      ''
  ) {
    return errors;
  }

  if (
    !isNonEmptyString(
      confidence
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_CONFIDENCE',
        'confidence must be a string.',
        `${path}.confidence`
      )
    );

    return errors;
  }

  const normalized =
    confidence
      .trim()
      .toUpperCase();

  if (
    !VALID_CONFIDENCE.has(
      normalized
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_CONFIDENCE',
        `Invalid confidence "${confidence}".`,
        `${path}.confidence`
      )
    );
  }

  return errors;
}

function validateScores(
  record,
  path
) {
  const errors = [];

  SCORE_FIELD_PATHS.forEach(
    fieldPath => {
      const value =
        getPathValue(
          record,
          fieldPath
        );

      if (
        value ===
          undefined ||
        value ===
          null ||
        value ===
          ''
      ) {
        return;
      }

      if (
        !isFiniteNumber(
          value
        ) ||
        value < 0 ||
        value > 10
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_SCORE',
            `${fieldPath} must be a finite number from 0 to 10.`,
            `${path}.${fieldPath}`
          )
        );
      }
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Localization                                                              */
/* -------------------------------------------------------------------------- */

function isSupportedLocaleTag(
  locale
) {
  return (
    typeof locale ===
      'string' &&
    /^[a-z]{2,3}(?:-[A-Z][a-zA-Z]{2,})?$/.test(
      locale
    )
  );
}

function validateLocalizedValue(
  value,
  path,
  {
    supportedLocales = null,
    allowPlainString = true,
    requireEnglish = false
  } = {}
) {
  const errors = [];
  const warnings = [];

  if (
    value ===
      undefined ||
    value ===
      null
  ) {
    return {
      errors,
      warnings
    };
  }

  if (
    typeof value ===
      'string'
  ) {
    if (
      allowPlainString &&
      value.trim()
    ) {
      if (
        requireEnglish &&
        !value.trim()
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_ENGLISH_LOCALIZATION',
            'Localized value requires English content.',
            path
          )
        );
      }

      return {
        errors,
        warnings
      };
    }

    errors.push(
      issue(
        'ERROR',
        'INVALID_LOCALIZED_VALUE',
        'Localized value must be a non-empty string or locale map.',
        path
      )
    );

    return {
      errors,
      warnings
    };
  }

  if (
    !isObject(
      value
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_LOCALIZED_VALUE',
        'Localized value must be a string or locale map.',
        path
      )
    );

    return {
      errors,
      warnings
    };
  }

  const entries =
    Object.entries(
      value
    );

  if (
    entries.length ===
    0
  ) {
    errors.push(
      issue(
        'ERROR',
        'EMPTY_LOCALIZED_VALUE',
        'Localized value cannot be an empty object.',
        path
      )
    );

    return {
      errors,
      warnings
    };
  }

  entries.forEach(
    ([
      locale,
      text
    ]) => {
      if (
        !isSupportedLocaleTag(
          locale
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_LOCALE_TAG',
            `Invalid locale tag "${locale}".`,
            `${path}.${locale}`
          )
        );
      }

      if (
        supportedLocales &&
        supportedLocales.size > 0 &&
        !supportedLocales.has(
          locale
        )
      ) {
        warnings.push(
          issue(
            'WARNING',
            'UNSUPPORTED_LOCALE',
            `Locale "${locale}" is not present in the loaded i18n catalogs.`,
            `${path}.${locale}`
          )
        );
      }

      if (
        !isNonEmptyString(
          text
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'EMPTY_TRANSLATION',
            `Translation for locale "${locale}" must be a non-empty string.`,
            `${path}.${locale}`
          )
        );
      }
    }
  );

  if (
    requireEnglish &&
    !isNonEmptyString(
      value.en
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'MISSING_ENGLISH_LOCALIZATION',
        'Localized value requires a non-empty English translation.',
        `${path}.en`
      )
    );
  }

  return {
    errors,
    warnings
  };
}

function validateLocalizedFields(
  record,
  entityName,
  index,
  supportedLocales
) {
  const errors = [];
  const warnings = [];

  if (
    !isObject(
      record
    )
  ) {
    return {
      errors,
      warnings
    };
  }

  const localizedPaths = [
    'name',
    'shortName',
    'title',
    'description',
    'officialName',
    'displayName',
    'identity.post',
    'identity.description',
    'eligibility.eligibilitySummary',
    'eligibility.notes',
    'recruitment.recruitmentNotes',
    'cadreAuthority.authorityName',
    'cadreAuthority.description',
    'cadreScope.description',
    'postingScope.description',
    'transferControl.description',
    'notes',
    'analyticalNotes',
    'analysis.analyticalNotes'
  ];

  localizedPaths.forEach(
    path => {
      const value =
        getPathValue(
          record,
          path
        );

      if (
        value ===
          undefined
      ) {
        return;
      }

      const result =
        validateLocalizedValue(
          value,
          `${entityName}[${index}].${path}`,
          {
            supportedLocales
          }
        );

      errors.push(
        ...result.errors
      );

      warnings.push(
        ...result.warnings
      );
    }
  );

  return {
    errors,
    warnings
  };
}

/* -------------------------------------------------------------------------- */
/* Entity-specific validation                                                 */
/* -------------------------------------------------------------------------- */

function validateJobs(
  jobs,
  options = {}
) {
  const errors = [];
  const warnings = [];

  errors.push(
    ...validateObjectRecords(
      jobs,
      'jobs'
    )
  );

  errors.push(
    ...validateIds(
      jobs,
      'jobs'
    )
  );

  errors.push(
    ...validateEntityTypes(
      jobs,
      'jobs',
      'JOB'
    )
  );

  if (
    !Array.isArray(
      jobs
    )
  ) {
    return {
      errors,
      warnings
    };
  }

  jobs.forEach(
    (job, index) => {
      if (
        !isObject(
          job
        )
      ) {
        return;
      }

      const path =
        `jobs[${index}]`;

      /*
       * Required canonical Job structure.
       */
      if (
        !isObject(
          job.identity
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_IDENTITY_OBJECT',
            'Canonical job must contain an identity object.',
            `${path}.identity`
          )
        );
      } else {
        [
          'governmentId',
          'departmentId',
          'organisationId',
          'post'
        ].forEach(
          field => {
            if (
              job.identity[
                field
              ] ===
                undefined ||
              job.identity[
                field
              ] ===
                null ||
              job.identity[
                field
              ] ===
                ''
            ) {
              errors.push(
                issue(
                  'ERROR',
                  'MISSING_REQUIRED_JOB_IDENTITY',
                  `Canonical job identity requires "${field}".`,
                  `${path}.identity.${field}`
                )
              );
            }
          }
        );
      }

      if (
        !isObject(
          job.recruitment
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_RECRUITMENT_OBJECT',
            'Canonical job must contain a recruitment object.',
            `${path}.recruitment`
          )
        );
      } else {
        if (
          !Array.isArray(
            job.recruitment.routeIds
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_ROUTE_IDS',
              'job.recruitment.routeIds must be an array.',
              `${path}.recruitment.routeIds`
            )
          );
        }

        if (
          !isNonEmptyString(
            job.recruitment.mode
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'MISSING_RECRUITMENT_MODE',
              'job.recruitment.mode is required.',
              `${path}.recruitment.mode`
            )
          );
        }

        if (
          !isNonEmptyString(
            job.recruitment.careerStatus
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'MISSING_CAREER_STATUS',
              'job.recruitment.careerStatus is required.',
              `${path}.recruitment.careerStatus`
            )
          );
        }

        if (
          typeof job.recruitment.freshEntryEligible !==
            'boolean'
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_FRESH_ENTRY_ELIGIBILITY',
              'job.recruitment.freshEntryEligible must be boolean.',
              `${path}.recruitment.freshEntryEligible`
            )
          );
        }
      }

      if (
        !isObject(
          job.eligibility
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_ELIGIBILITY_OBJECT',
            'Canonical job must contain an eligibility object.',
            `${path}.eligibility`
          )
        );
      } else {
        if (
          !isNonEmptyString(
            job.eligibility.educationLevel
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'MISSING_EDUCATION_LEVEL',
              'job.eligibility.educationLevel is required.',
              `${path}.eligibility.educationLevel`
            )
          );
        }

        if (
          !isNonEmptyString(
            job.eligibility.minimumQualification
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'MISSING_MINIMUM_QUALIFICATION',
              'job.eligibility.minimumQualification is required.',
              `${path}.eligibility.minimumQualification`
            )
          );
        }

        if (
          !Array.isArray(
            job.eligibility.ruleIds
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_JOB_RULE_IDS',
              'job.eligibility.ruleIds must be an array.',
              `${path}.eligibility.ruleIds`
            )
          );
        }

        if (
          !isNonEmptyString(
            job.eligibility.baEnglishAssessment
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'MISSING_BASELINE_ENGLISH_ASSESSMENT',
              'job.eligibility.baEnglishAssessment is required by the canonical schema.',
              `${path}.eligibility.baEnglishAssessment`
            )
          );
        }

        /*
         * baEnglishAssessment is display/research metadata only.
         * It is explicitly forbidden from becoming the runtime eligibility
         * authority.
         */
        if (
          Object.prototype.hasOwnProperty.call(
            job,
            'eligibilityStatus'
          )
        ) {
          warnings.push(
            issue(
              'WARNING',
              'LEGACY_FLAT_ELIGIBILITY_STATUS',
              'Flat job.eligibilityStatus is not authoritative in the canonical model; candidate eligibility must come from eligibility rules.',
              `${path}.eligibilityStatus`
            )
          );
        }

        if (
          Object.prototype.hasOwnProperty.call(
            job,
            'baEligibility'
          )
        ) {
          warnings.push(
            issue(
              'WARNING',
              'LEGACY_BA_ELIGIBILITY',
              'Legacy baEligibility is retained only as non-authoritative compatibility metadata and must not drive eligibility.',
              `${path}.baEligibility`
            )
          );
        }
      }

      [
        'payProfileId',
        'locationProfileId',
        'housingProfileId',
        'promotionProfileId',
        'benefitProfileId'
      ].forEach(
        field => {
          if (
            !isNonEmptyString(
              job[field]
            )
          ) {
            errors.push(
              issue(
                'ERROR',
                'MISSING_PROFILE_REFERENCE',
                `${field} is required by the canonical job schema.`,
                `${path}.${field}`
              )
            );
          }
        }
      );

      if (
        !isObject(
          job.lifestyle
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_LIFESTYLE_OBJECT',
            'Canonical job must contain lifestyle.',
            `${path}.lifestyle`
          )
        );
      }

      if (
        !isObject(
          job.analysis
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_ANALYSIS_OBJECT',
            'Canonical job must contain analysis.',
            `${path}.analysis`
          )
        );
      }

      if (
        !Array.isArray(
          job.sourceIds
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_JOB_SOURCE_IDS',
            'Canonical job sourceIds must be an array.',
            `${path}.sourceIds`
          )
        );
      }

      if (
        !isNonEmptyString(
          job.currentness
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_CURRENTNESS',
            'Canonical job currentness is required.',
            `${path}.currentness`
          )
        );
      }

      if (
        !isNonEmptyString(
          job.lastVerified
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_LAST_VERIFIED',
            'Canonical job lastVerified is required.',
            `${path}.lastVerified`
          )
        );
      }

      if (
        !isNonEmptyString(
          job.dataVersion
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_DATA_VERSION',
            'Canonical job dataVersion is required.',
            `${path}.dataVersion`
          )
        );
      }

      const eligibilityStatus =
        job.recommendationEligibilityStatus ??
        job.runtimeEligibilityStatus;

      if (
        eligibilityStatus !==
          undefined &&
        eligibilityStatus !==
          null
      ) {
        const normalized =
          String(
            eligibilityStatus
          )
            .trim()
            .toUpperCase();

        if (
          !VALID_JOB_ELIGIBILITY.has(
            normalized
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_ELIGIBILITY_STATUS',
              `Invalid candidate eligibility result "${String(
                eligibilityStatus
              )}".`,
              `${path}.recommendationEligibilityStatus`
            )
          );
        }
      }

      errors.push(
        ...validateConfidence(
          job,
          path
        )
      );

      errors.push(
        ...validateScores(
          job,
          path
        )
      );

      errors.push(
        ...validateNumericFields(
          job,
          path
        )
      );

      errors.push(
        ...validateDateFieldsRecursive(
          job,
          path
        )
      );

      errors.push(
        ...validateDateRangesRecursive(
          job,
          path
        )
      );

      const score =
        job.analysis?.score ??
        job.score;

      if (
        score !==
          undefined &&
        score !==
          null
      ) {
        if (
          !isFiniteNumber(
            score
          ) ||
          score <
            0 ||
          score >
            100
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_JOB_SCORE',
              'Any stored job score must be a finite number from 0 to 100.',
              `${path}.score`
            )
          );
        }
      }

      void options;
    }
  );

  return {
    errors,
    warnings
  };
}

function validateExams(
  exams
) {
  const errors = [];
  const warnings = [];

  errors.push(
    ...validateObjectRecords(
      exams,
      'exams'
    )
  );

  errors.push(
    ...validateIds(
      exams,
      'exams'
    )
  );

  errors.push(
    ...validateEntityTypes(
      exams,
      'exams',
      'EXAM'
    )
  );

  if (
    !Array.isArray(
      exams
    )
  ) {
    return {
      errors,
      warnings
    };
  }

  exams.forEach(
    (exam, index) => {
      if (
        !isObject(
          exam
        )
      ) {
        return;
      }

      const path =
        `exams[${index}]`;

      if (
        exam.year !==
          undefined &&
        exam.year !==
          null
      ) {
        if (
          !Number.isInteger(
            exam.year
          ) ||
          exam.year <
            1900 ||
          exam.year >
            2200
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_YEAR',
              'Exam year must be an integer between 1900 and 2200.',
              `${path}.year`
            )
          );
        }
      }

      errors.push(
        ...validateNumericFields(
          exam,
          path
        )
      );

      errors.push(
        ...validateDateFieldsRecursive(
          exam,
          path
        )
      );

      errors.push(
        ...validateDateRangesRecursive(
          exam,
          path
        )
      );

      if (
        exam.status ===
        'UNKNOWN'
      ) {
        warnings.push(
          issue(
            'WARNING',
            'UNKNOWN_EXAM_STATUS',
            'Exam status is UNKNOWN.',
            `${path}.status`
          )
        );
      }
    }
  );

  return {
    errors,
    warnings
  };
}

function validateServiceCadres(
  serviceCadres
) {
  const errors = [];
  const warnings = [];

  errors.push(
    ...validateObjectRecords(
      serviceCadres,
      'serviceCadres'
    )
  );

  errors.push(
    ...validateIds(
      serviceCadres,
      'serviceCadres'
    )
  );

  errors.push(
    ...validateEntityTypes(
      serviceCadres,
      'serviceCadres',
      'SERVICE_CADRE'
    )
  );

  if (
    !Array.isArray(
      serviceCadres
    )
  ) {
    return {
      errors,
      warnings
    };
  }

  serviceCadres.forEach(
    (
      record,
      index
    ) => {
      if (
        !isObject(
          record
        )
      ) {
        return;
      }

      const path =
        `serviceCadres[${index}]`;

      if (
        !isNonEmptyString(
          record.name
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_SERVICE_CADRE_NAME',
            'Service-cadre requires a canonical name.',
            `${path}.name`
          )
        );
      }

      if (
        !isNonEmptyString(
          record.governmentId
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_SERVICE_CADRE_GOVERNMENT_ID',
            'Service-cadre requires governmentId.',
            `${path}.governmentId`
          )
        );
      }

      if (
        record.entryRoutes !==
          undefined &&
        !Array.isArray(
          record.entryRoutes
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_ENTRY_ROUTES',
            'serviceCadres.entryRoutes must be an array.',
            `${path}.entryRoutes`
          )
        );
      }

      if (
        isObject(
          record.cadreScope
        ) &&
        record.cadreScope.scopeType ===
          'STATE' &&
        !Array.isArray(
          record.cadreScope.stateIds
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'STATE_CADRE_WITHOUT_STATE_IDS',
            'A STATE service-cadre scope requires cadreScope.stateIds.',
            `${path}.cadreScope.stateIds`
          )
        );
      }

      if (
        record.classification ===
          'STATE_GOVERNMENT_SERVICE' &&
        !isNonEmptyString(
          record.stateId
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'STATE_SERVICE_WITHOUT_STATE_ID',
            'STATE_GOVERNMENT_SERVICE requires stateId.',
            `${path}.stateId`
          )
        );
      }

      if (
        record.classification ===
          'CENTRAL_GOVERNMENT_SERVICE' &&
        isNonEmptyString(
          record.stateId
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'CENTRAL_SERVICE_HAS_STATE_ID',
            'CENTRAL_GOVERNMENT_SERVICE must not carry a stateId.',
            `${path}.stateId`
          )
        );
      }

      errors.push(
        ...validateConfidence(
          record,
          path
        )
      );

      errors.push(
        ...validateNumericFields(
          record,
          path
        )
      );

      errors.push(
        ...validateDateFieldsRecursive(
          record,
          path
        )
      );

      errors.push(
        ...validateDateRangesRecursive(
          record,
          path
        )
      );

      if (
        Array.isArray(
          record.postIds
        ) &&
        record.postIds.length ===
          0
      ) {
        warnings.push(
          issue(
            'WARNING',
            'EMPTY_SERVICE_CADRE_POST_IDS',
            'Service-cadre postIds is present but empty.',
            `${path}.postIds`
          )
        );
      }

      if (
        record.status !==
          undefined &&
        [
          'HISTORICAL',
          'RENAMED',
          'MERGED',
          'REORGANISED',
          'ABOLISHED'
        ].includes(
          record.status
        ) &&
        !isNonEmptyString(
          record.effectiveTo
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'HISTORICAL_SERVICE_WITHOUT_END_DATE',
            'Historical/retired service-cadre records require effectiveTo.',
            `${path}.effectiveTo`
          )
        );
      }
    }
  );

  return {
    errors,
    warnings
  };
}

/* -------------------------------------------------------------------------- */
/* Eligibility-rule validation                                                */
/* -------------------------------------------------------------------------- */

function validateEligibilityRuleTargets(
  rule,
  index
) {
  const errors = [];

  const explicitTargetFields = [
    'targetId',
    'jobId',
    'serviceCadreId',
    'examId',
    'targetJobId',
    'targetServiceCadreId'
  ];

  const hasExplicitTarget =
    explicitTargetFields.some(
      field =>
        isNonEmptyString(
          rule[field]
        )
    );

  if (
    !hasExplicitTarget
  ) {
    errors.push(
      issue(
        'ERROR',
        'MISSING_RULE_TARGET',
        'Eligibility rule must identify at least one target through targetId or an explicit job/service-cadre/exam target reference.',
        `eligibilityRules[${index}]`
      )
    );
  }

  if (
    isNonEmptyString(
      rule.targetType
    )
  ) {
    const targetType =
      rule.targetType
        .trim()
        .toUpperCase();

    const supportedTargets =
      new Set([
        'JOB',
        'EXAM',
        'SERVICE_CADRE',
        'RECRUITMENT'
      ]);

    if (
      !supportedTargets.has(
        targetType
      )
    ) {
      errors.push(
        issue(
          'ERROR',
          'INVALID_RULE_TARGET_TYPE',
          `Unsupported eligibility-rule targetType "${rule.targetType}".`,
          `eligibilityRules[${index}].targetType`
        )
      );
    }
  } else {
    errors.push(
      issue(
        'ERROR',
        'MISSING_RULE_TARGET_TYPE',
        'Eligibility rule requires targetType.',
        `eligibilityRules[${index}].targetType`
      )
    );
  }

  return errors;
}

function validateEligibilityRuleStructure(
  rule,
  index
) {
  const errors = [];
  const warnings = [];

  const path =
    `eligibilityRules[${index}]`;

  if (
    !isNonEmptyString(
      rule.ruleClass
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'MISSING_RULE_CLASS',
        'Eligibility rule ruleClass is required.',
        `${path}.ruleClass`
      )
    );
  } else if (
    !VALID_RULE_CLASSES.has(
      rule.ruleClass
        .trim()
        .toUpperCase()
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_RULE_CLASS',
        `Invalid ruleClass "${rule.ruleClass}".`,
        `${path}.ruleClass`
      )
    );
  }

  if (
    !isNonEmptyString(
      rule.effect
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'MISSING_RULE_EFFECT',
        'Eligibility rule effect is required.',
        `${path}.effect`
      )
    );
  } else if (
    !VALID_RULE_EFFECTS.has(
      rule.effect
        .trim()
        .toUpperCase()
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_RULE_EFFECT',
        `Invalid rule effect "${rule.effect}".`,
        `${path}.effect`
      )
    );
  }

  if (
    rule.conditionType !==
      undefined &&
    rule.conditionType !==
      null &&
    !isNonEmptyString(
      rule.conditionType
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_CONDITION_TYPE',
        'conditionType must be a non-empty string when present.',
        `${path}.conditionType`
      )
    );
  }

  if (
    rule.operator !==
      undefined &&
    rule.operator !==
      null
  ) {
    if (
      !isNonEmptyString(
        rule.operator
      )
    ) {
      errors.push(
        issue(
          'ERROR',
          'INVALID_OPERATOR',
          'operator must be a non-empty string when present.',
          `${path}.operator`
        )
      );
    } else if (
      !VALID_OPERATORS.has(
        rule.operator
          .trim()
          .toUpperCase()
      )
    ) {
      errors.push(
        issue(
          'ERROR',
          'UNKNOWN_OPERATOR',
          `Unknown eligibility operator "${rule.operator}".`,
          `${path}.operator`
        )
      );
    }
  }

  if (
    rule.logic !==
      undefined &&
    rule.logic !==
      null
  ) {
    if (
      !isObject(
        rule.logic
      )
    ) {
      errors.push(
        issue(
          'ERROR',
          'INVALID_RULE_LOGIC',
          'Eligibility rule logic must be an object.',
          `${path}.logic`
        )
      );
    } else {
      if (
        rule.logic.mode !==
          undefined &&
        !isNonEmptyString(
          rule.logic.mode
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_RULE_LOGIC_MODE',
            'logic.mode must be a non-empty string when present.',
            `${path}.logic.mode`
          )
        );
      }

      if (
        rule.logic.ruleIds !==
          undefined &&
        !Array.isArray(
          rule.logic.ruleIds
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_RULE_LOGIC_IDS',
            'logic.ruleIds must be an array when present.',
            `${path}.logic.ruleIds`
          )
        );
      }
    }
  }

  if (
    rule.verificationRequirement !==
      undefined &&
    !isNonEmptyString(
      rule.verificationRequirement
    ) &&
    !isObject(
      rule.verificationRequirement
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_VERIFICATION_REQUIREMENT',
        'verificationRequirement must be a string or object.',
        `${path}.verificationRequirement`
      )
    );
  }

  if (
    rule.mandatory !==
      undefined &&
    typeof rule.mandatory !==
      'boolean'
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_MANDATORY_FLAG',
        'mandatory must be boolean when present.',
        `${path}.mandatory`
      )
    );
  }

  if (
    rule.conditional !==
      undefined &&
    typeof rule.conditional !==
      'boolean'
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_CONDITIONAL_FLAG',
        'conditional must be boolean when present.',
        `${path}.conditional`
      )
    );
  }

  if (
    rule.reviewRequired !==
      undefined &&
    typeof rule.reviewRequired !==
      'boolean'
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_REVIEW_REQUIRED_FLAG',
        'reviewRequired must be boolean when present.',
        `${path}.reviewRequired`
      )
    );
  }

  if (
    rule.priority !==
      undefined &&
    rule.priority !==
      null
  ) {
    if (
      !Number.isFinite(
        rule.priority
      )
    ) {
      errors.push(
        issue(
          'ERROR',
          'INVALID_RULE_PRIORITY',
          'priority must be a finite number.',
          `${path}.priority`
        )
      );
    }
  }

  /*
   * Runtime cross-field checks required because JSON Schema cannot safely
   * express all of these relationships without non-standard constructs.
   */
  const ageMin =
    rule.minAge ??
    rule.minimumAge;

  const ageMax =
    rule.maxAge ??
    rule.maximumAge;

  if (
    isFiniteNumber(ageMin) &&
    isFiniteNumber(ageMax) &&
    ageMin >
      ageMax
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_AGE_RANGE',
        'Minimum age cannot exceed maximum age.',
        path
      )
    );
  }

  const percentageMin =
    rule.minPercentage ??
    rule.minimumPercentage;

  const percentageMax =
    rule.maxPercentage ??
    rule.maximumPercentage;

  if (
    isFiniteNumber(
      percentageMin
    ) &&
    isFiniteNumber(
      percentageMax
    ) &&
    percentageMin >
      percentageMax
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_PERCENTAGE_RANGE',
        'Minimum percentage cannot exceed maximum percentage.',
        path
      )
    );
  }

  const marksMin =
    rule.minMarks ??
    rule.minimumMarks ??
    rule.minimumMarksPercentage;

  const marksMax =
    rule.maxMarks ??
    rule.maximumMarks ??
    rule.maximumMarksPercentage;

  if (
    isFiniteNumber(
      marksMin
    ) &&
    isFiniteNumber(
      marksMax
    ) &&
    marksMin >
      marksMax
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_MARKS_RANGE',
        'Minimum marks cannot exceed maximum marks.',
        path
      )
    );
  }

  const experienceMin =
    rule.minExperienceYears ??
    rule.minimumExperienceYears ??
    rule.requiredExperienceYears;

  const experienceMax =
    rule.maxExperienceYears ??
    rule.maximumExperienceYears;

  if (
    isFiniteNumber(
      experienceMin
    ) &&
    isFiniteNumber(
      experienceMax
    ) &&
    experienceMin >
      experienceMax
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_EXPERIENCE_RANGE',
        'Minimum experience cannot exceed maximum experience.',
        path
      )
    );
  }

  errors.push(
    ...validateConfidence(
      rule,
      path
    )
  );

  errors.push(
    ...validateNumericFields(
      rule,
      path
    )
  );

  errors.push(
    ...validateDateFieldsRecursive(
      rule,
      path
    )
  );

  errors.push(
    ...validateDateRangesRecursive(
      rule,
      path
    )
  );

  if (
    rule.ruleClass ===
      'HARD' &&
    (
      !Array.isArray(
        rule.sourceIds
      ) ||
      rule.sourceIds.length ===
        0
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'HARD_RULE_WITHOUT_SOURCE',
        'Hard eligibility rules require at least one sourceId.',
        `${path}.sourceIds`
      )
    );
  }

  if (
    rule.effect ===
      'REQUIRE_VERIFICATION' &&
    !rule.verificationRequirement
  ) {
    warnings.push(
      issue(
        'WARNING',
        'VERIFICATION_EFFECT_WITHOUT_REQUIREMENT',
        'Rule uses REQUIRE_VERIFICATION but does not specify verificationRequirement.',
        `${path}.verificationRequirement`
      )
    );
  }

  if (
    rule.effect ===
      'CONDITIONAL' &&
    rule.conditional ===
      false
  ) {
    warnings.push(
      issue(
        'WARNING',
        'CONDITIONAL_EFFECT_WITHOUT_FLAG',
        'Rule has CONDITIONAL effect while conditional=false.',
        `${path}.conditional`
      )
    );
  }

  return {
    errors,
    warnings
  };
}

function validateEligibilityRules(
  rules
) {
  const errors = [];
  const warnings = [];

  errors.push(
    ...validateObjectRecords(
      rules,
      'eligibilityRules'
    )
  );

  errors.push(
    ...validateIds(
      rules,
      'eligibilityRules'
    )
  );

  errors.push(
    ...validateEntityTypes(
      rules,
      'eligibilityRules',
      'ELIGIBILITY_RULE'
    )
  );

  if (
    !Array.isArray(
      rules
    )
  ) {
    return {
      errors,
      warnings
    };
  }

  rules.forEach(
    (rule, index) => {
      if (
        !isObject(
          rule
        )
      ) {
        return;
      }

      errors.push(
        ...validateEligibilityRuleTargets(
          rule,
          index
        )
      );

      const structure =
        validateEligibilityRuleStructure(
          rule,
          index
        );

      errors.push(
        ...structure.errors
      );

      warnings.push(
        ...structure.warnings
      );
    }
  );

  return {
    errors,
    warnings
  };
}

function validateQualifications(
  qualifications
) {
  const errors = [];
  const warnings = [];

  errors.push(
    ...validateObjectRecords(
      qualifications,
      'qualifications'
    )
  );

  errors.push(
    ...validateIds(
      qualifications,
      'qualifications'
    )
  );

  errors.push(
    ...validateEntityTypes(
      qualifications,
      'qualifications',
      'QUALIFICATION'
    )
  );

  if (
    !Array.isArray(
      qualifications
    )
  ) {
    return {
      errors,
      warnings
    };
  }

  qualifications.forEach(
    (
      qualification,
      index
    ) => {
      if (
        !isObject(
          qualification
        )
      ) {
        return;
      }

      const path =
        `qualifications[${index}]`;

      errors.push(
        ...validateConfidence(
          qualification,
          path
        )
      );

      errors.push(
        ...validateNumericFields(
          qualification,
          path
        )
      );

      errors.push(
        ...validateDateFieldsRecursive(
          qualification,
          path
        )
      );
    }
  );

  return {
    errors,
    warnings
  };
}

/* -------------------------------------------------------------------------- */
/* Generic collection validation                                              */
/* -------------------------------------------------------------------------- */

function validateGeneric(
  records,
  entityName
) {
  const errors = [];

  errors.push(
    ...validateObjectRecords(
      records,
      entityName
    )
  );

  errors.push(
    ...validateIds(
      records,
      entityName
    )
  );

  const expectedType =
    COLLECTION_ENTITY_TYPES[
      entityName
    ];

  errors.push(
    ...validateEntityTypes(
      records,
      entityName,
      expectedType
    )
  );

  if (
    !Array.isArray(
      records
    )
  ) {
    return errors;
  }

  records.forEach(
    (
      record,
      index
    ) => {
      if (
        !isObject(
          record
        )
      ) {
        return;
      }

      const path =
        `${entityName}[${index}]`;

      errors.push(
        ...validateConfidence(
          record,
          path
        )
      );

      errors.push(
        ...validateNumericFields(
          record,
          path
        )
      );

      errors.push(
        ...validateDateFieldsRecursive(
          record,
          path
        )
      );

      errors.push(
        ...validateDateRangesRecursive(
          record,
          path
        )
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* ID/reference maps                                                          */
/* -------------------------------------------------------------------------- */

function createIdSet(
  records
) {
  const ids =
    new Set();

  getArray(
    records
  ).forEach(
    record => {
      if (
        isNonEmptyString(
          record?.id
        )
      ) {
        ids.add(
          record.id.trim()
        );
      }
    }
  );

  return ids;
}

function createReferenceSets(
  database
) {
  const sets = {};

  Object.keys(
    COLLECTION_ENTITY_TYPES
  ).forEach(
    collection => {
      sets[
        collection
      ] =
        createIdSet(
          database?.[
            collection
          ]
        );
    }
  );

  return sets;
}

function normalizeReferenceValues(
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
    return value;
  }

  return [
    value
  ];
}

function validateReferenceDescriptor(
  record,
  descriptor,
  sourceCollection,
  sourceIndex,
  referenceSets
) {
  const errors = [];

  const value =
    getPathValue(
      record,
      descriptor.path
    );

  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ''
  ) {
    if (
      descriptor.optional
    ) {
      return errors;
    }

    /*
     * The JSON schema remains the authority for which fields are structurally
     * required. This semantic validator only complains about missing required
     * references when the descriptor itself is explicitly required.
     */
    errors.push(
      issue(
        'ERROR',
        'MISSING_REQUIRED_REFERENCE',
        `${descriptor.path} is required but is missing.`,
        `${sourceCollection}[${sourceIndex}].${descriptor.path}`
      )
    );

    return errors;
  }

  const expected =
    descriptor.kind ===
      'many'
      ? 'array'
      : 'scalar';

  if (
    expected ===
      'array' &&
    !Array.isArray(
      value
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'REFERENCE_NOT_ARRAY',
        `${descriptor.path} must be an array.`,
        `${sourceCollection}[${sourceIndex}].${descriptor.path}`
      )
    );

    return errors;
  }

  if (
    expected ===
      'scalar' &&
    Array.isArray(
      value
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'REFERENCE_UNEXPECTED_ARRAY',
        `${descriptor.path} must contain one canonical ID, not an array.`,
        `${sourceCollection}[${sourceIndex}].${descriptor.path}`
      )
    );

    return errors;
  }

  const values =
    normalizeReferenceValues(
      value
    );

  const targetIds =
    referenceSets[
      descriptor.target
    ] ||
    new Set();

  values.forEach(
    (
      referencedId,
      referenceIndex
    ) => {
      if (
        !isNonEmptyString(
          referencedId
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_REFERENCE_ID',
            `${descriptor.path} contains an invalid reference ID.`,
            `${sourceCollection}[${sourceIndex}].${descriptor.path}${
              descriptor.kind ===
              'many'
                ? `[${referenceIndex}]`
                : ''
            }`
          )
        );

        return;
      }

      const id =
        referencedId.trim();

      if (
        !targetIds.has(
          id
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'BROKEN_REFERENCE',
            `${sourceCollection}.${descriptor.path} references unknown ${descriptor.target} ID "${id}".`,
            `${sourceCollection}[${sourceIndex}].${descriptor.path}${
              descriptor.kind ===
              'many'
                ? `[${referenceIndex}]`
                : ''
            }`,
            {
              sourceCollection,
              targetCollection:
                descriptor.target,
              id
            }
          )
        );
      }
    }
  );

  return errors;
}

function validateCrossReferences(
  database
) {
  const errors = [];
  const referenceSets =
    createReferenceSets(
      database
    );

  Object.entries(
    REFERENCE_PATHS
  ).forEach(
    ([
      sourceCollection,
      descriptors
    ]) => {
      const records =
        database?.[
          sourceCollection
        ];

      if (
        !Array.isArray(
          records
        )
      ) {
        return;
      }

      records.forEach(
        (
          record,
          sourceIndex
        ) => {
          if (
            !isObject(
              record
            )
          ) {
            return;
          }

          descriptors.forEach(
            descriptor => {
              errors.push(
                ...validateReferenceDescriptor(
                  record,
                  descriptor,
                  sourceCollection,
                  sourceIndex,
                  referenceSets
                )
              );
            }
          );
        }
      );
    }
  );

  /*
   * Explicit runtime registry relationships.
   *
   * Some references are semantically represented in arrays of structured
   * objects rather than direct ID fields.
   */
  errors.push(
    ...validateServiceCadreEntryRoutes(
      database,
      referenceSets
    )
  );

  errors.push(
    ...validateServiceCadreRuleReferences(
      database,
      referenceSets
    )
  );

  errors.push(
    ...validateEligibilityRuleTargetsAgainstType(
      database,
      referenceSets
    )
  );

  return errors;
}

function validateServiceCadreEntryRoutes(
  database,
  referenceSets
) {
  const errors = [];

  getArray(
    database?.serviceCadres
  ).forEach(
    (
      serviceCadre,
      index
    ) => {
      getArray(
        serviceCadre.entryRoutes
      ).forEach(
        (
          route,
          routeIndex
        ) => {
          if (
            !isObject(
              route
            )
          ) {
            errors.push(
              issue(
                'ERROR',
                'INVALID_ENTRY_ROUTE',
                'Service-cadre entry route must be an object.',
                `serviceCadres[${index}].entryRoutes[${routeIndex}]`
              )
            );

            return;
          }

          [
            [
              'examIds',
              'exams'
            ],
            [
              'recruitmentIds',
              'recruitment'
            ]
          ].forEach(
            ([
              field,
              target
            ]) => {
              if (
                route[field] ===
                  undefined
              ) {
                return;
              }

              if (
                !Array.isArray(
                  route[field]
                )
              ) {
                errors.push(
                  issue(
                    'ERROR',
                    'ENTRY_ROUTE_REFERENCE_NOT_ARRAY',
                    `${field} must be an array.`,
                    `serviceCadres[${index}].entryRoutes[${routeIndex}].${field}`
                  )
                );

                return;
              }

              route[field].forEach(
                (
                  id,
                  idIndex
                ) => {
                  if (
                    !isNonEmptyString(
                      id
                    ) ||
                    !referenceSets[
                      target
                    ]?.has(
                      id.trim()
                    )
                  ) {
                    errors.push(
                      issue(
                        'ERROR',
                        'BROKEN_ENTRY_ROUTE_REFERENCE',
                        `${field} references unknown ID "${String(
                          id
                        )}".`,
                        `serviceCadres[${index}].entryRoutes[${routeIndex}].${field}[${idIndex}]`
                      )
                    );
                  }
                }
              );
            }
          );
        }
      );
    }
  );

  return errors;
}

function validateServiceCadreRuleReferences(
  database,
  referenceSets
) {
  const errors = [];

  getArray(
    database?.serviceCadres
  ).forEach(
    (
      serviceCadre,
      index
    ) => {
      getArray(
        serviceCadre.serviceRuleReferences
      ).forEach(
        (
          reference,
          referenceIndex
        ) => {
          if (
            !isObject(
              reference
            )
          ) {
            errors.push(
              issue(
                'ERROR',
                'INVALID_SERVICE_RULE_REFERENCE',
                'serviceRuleReferences entries must be objects.',
                `serviceCadres[${index}].serviceRuleReferences[${referenceIndex}]`
              )
            );

            return;
          }

          if (
            reference.sourceIds !==
              undefined
          ) {
            if (
              !Array.isArray(
                reference.sourceIds
              )
            ) {
              errors.push(
                issue(
                  'ERROR',
                  'INVALID_SERVICE_RULE_SOURCE_IDS',
                  'serviceRuleReferences.sourceIds must be an array.',
                  `serviceCadres[${index}].serviceRuleReferences[${referenceIndex}].sourceIds`
                )
              );

              return;
            }

            reference.sourceIds.forEach(
              (
                sourceId,
                sourceIndex
              ) => {
                if (
                  !referenceSets.sources?.has(
                    trimId(
                      sourceId
                    )
                  )
                ) {
                  errors.push(
                    issue(
                      'ERROR',
                      'BROKEN_SERVICE_RULE_SOURCE_REFERENCE',
                      `serviceRuleReferences.sourceIds references unknown source ID "${String(
                        sourceId
                      )}".`,
                      `serviceCadres[${index}].serviceRuleReferences[${referenceIndex}].sourceIds[${sourceIndex}]`
                    )
                  );
                }
              }
            );
          }
        }
      );
    }
  );

  return errors;
}

function validateEligibilityRuleTargetsAgainstType(
  database,
  referenceSets
) {
  const errors = [];

  getArray(
    database?.eligibilityRules
  ).forEach(
    (
      rule,
      index
    ) => {
      if (
        !isNonEmptyString(
          rule.targetType
        ) ||
        !isNonEmptyString(
          rule.targetId
        )
      ) {
        return;
      }

      const targetType =
        rule.targetType
          .trim()
          .toUpperCase();

      const collectionByType = {
        JOB: 'jobs',
        EXAM: 'exams',
        SERVICE_CADRE:
          'serviceCadres',
        RECRUITMENT:
          'recruitment'
      };

      const targetCollection =
        collectionByType[
          targetType
        ];

      if (
        !targetCollection
      ) {
        return;
      }

      if (
        !referenceSets[
          targetCollection
        ]?.has(
          rule.targetId.trim()
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'BROKEN_RULE_TARGET',
            `Eligibility rule targetId "${rule.targetId}" does not exist in ${targetCollection}.`,
            `eligibilityRules[${index}].targetId`
          )
        );
      }
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Cross-namespace identity integrity                                         */
/* -------------------------------------------------------------------------- */

function collectEntityIds(
  database
) {
  const occurrences =
    new Map();

  Object.entries(
    COLLECTION_ENTITY_TYPES
  ).forEach(
    ([
      collection,
      entityType
    ]) => {
      const records =
        database?.[
          collection
        ];

      if (
        !Array.isArray(
          records
        )
      ) {
        return;
      }

      records.forEach(
        (
          record,
          index
        ) => {
          if (
            !isNonEmptyString(
              record?.id
            )
          ) {
            return;
          }

          const id =
            record.id.trim();

          if (
            !occurrences.has(
              id
            )
          ) {
            occurrences.set(
              id,
              []
            );
          }

          occurrences
            .get(
              id
            )
            .push({
              collection,
              entityType,
              index
            });
        }
      );
    }
  );

  return occurrences;
}

function validateCrossNamespaceIds(
  database
) {
  const errors = [];
  const occurrences =
    collectEntityIds(
      database
    );

  occurrences.forEach(
    (
      records,
      id
    ) => {
      const collections =
        [
          ...new Set(
            records.map(
              record =>
                record.collection
            )
          )
        ];

      if (
        collections.length >
        1
      ) {
        errors.push(
          issue(
            'ERROR',
            'CROSS_NAMESPACE_ID_COLLISION',
            `Canonical ID "${id}" is used by multiple entity collections.`,
            null,
            {
              id,
              collections,
              occurrences:
                records
            }
          )
        );
      }
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Eligibility dependency cycles                                              */
/* -------------------------------------------------------------------------- */

function collectRuleDependencies(
  rule
) {
  return [
    ...new Set(
      [
        ...getArray(
          rule?.dependsOnRuleIds
        ),
        ...getArray(
          rule?.parentRuleIds
        ),
        ...getArray(
          rule?.logic?.ruleIds
        )
      ]
        .filter(
          isNonEmptyString
        )
        .map(
          value =>
            value.trim()
        )
    )
  ];
}

function validateEligibilityRuleCycles(
  rules
) {
  const errors = [];
  const byId =
    new Map();

  getArray(
    rules
  ).forEach(
    rule => {
      if (
        isNonEmptyString(
          rule?.id
        )
      ) {
        byId.set(
          rule.id.trim(),
          rule
        );
      }
    }
  );

  const graph =
    new Map();

  byId.forEach(
    (
      rule,
      id
    ) => {
      graph.set(
        id,
        collectRuleDependencies(
          rule
        )
      );
    }
  );

  const state =
    new Map();

  const reported =
    new Set();

  function visit(
    node,
    stack
  ) {
    const current =
      state.get(
        node
      );

    if (
      current ===
        'VISITING'
    ) {
      const start =
        stack.indexOf(
          node
        );

      const cycle =
        (
          start >= 0
            ? stack.slice(
                start
              )
            : stack
        ).concat(
          node
        );

      const signature =
        cycle.join(
          '→'
        );

      if (
        !reported.has(
          signature
        )
      ) {
        reported.add(
          signature
        );

        errors.push(
          issue(
            'ERROR',
            'ELIGIBILITY_DEPENDENCY_CYCLE',
            `Eligibility-rule dependency cycle detected: ${cycle.join(
              ' → '
            )}.`,
            `eligibilityRules.${node}`,
            {
              cycle
            }
          )
        );
      }

      return;
    }

    if (
      current ===
        'VISITED'
    ) {
      return;
    }

    state.set(
      node,
      'VISITING'
    );

    const dependencies =
      graph.get(
        node
      ) ||
      [];

    dependencies.forEach(
      dependencyId => {
        if (
          graph.has(
            dependencyId
          )
        ) {
          visit(
            dependencyId,
            [
              ...stack,
              node
            ]
          );
        }
      }
    );

    state.set(
      node,
      'VISITED'
    );
  }

  graph.forEach(
    (
      _dependencies,
      node
    ) => {
      visit(
        node,
        []
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Hierarchy cycles                                                           */
/* -------------------------------------------------------------------------- */

function validateHierarchyCycles(
  database
) {
  const errors = [];

  HIERARCHY_RELATIONSHIPS.forEach(
    relationship => {
      const records =
        getArray(
          database?.[
            relationship.collection
          ]
        );

      const byId =
        new Map();

      records.forEach(
        record => {
          if (
            isNonEmptyString(
              record?.id
            )
          ) {
            byId.set(
              record.id.trim(),
              record
            );
          }
        }
      );

      const graph =
        new Map();

      records.forEach(
        record => {
          const sourceId =
            trimId(
              record?.id
            );

          const parentId =
            trimId(
              record?.[
                relationship.field
              ]
            );

          if (
            sourceId &&
            parentId
          ) {
            graph.set(
              sourceId,
              parentId
            );
          }
        }
      );

      const state =
        new Map();

      const reported =
        new Set();

      function visit(
        node,
        stack
      ) {
        if (
          state.get(
            node
          ) ===
          'VISITING'
        ) {
          const start =
            stack.indexOf(
              node
            );

          const cycle =
            (
              start >= 0
                ? stack.slice(
                    start
                  )
                : stack
            ).concat(
              node
            );

          const signature =
            `${relationship.collection}:${relationship.field}:${cycle.join(
              '→'
            )}`;

          if (
            !reported.has(
              signature
            )
          ) {
            reported.add(
              signature
            );

            errors.push(
              issue(
                'ERROR',
                'HIERARCHY_CYCLE',
                `Circular hierarchy detected through ${relationship.field}: ${cycle.join(
                  ' → '
                )}.`,
                `${relationship.collection}.${node}.${relationship.field}`,
                {
                  collection:
                    relationship.collection,
                  field:
                    relationship.field,
                  cycle
                }
              )
            );
          }

          return;
        }

        if (
          state.get(
            node
          ) ===
          'VISITED'
        ) {
          return;
        }

        state.set(
          node,
          'VISITING'
        );

        const next =
          graph.get(
            node
          );

        if (
          next &&
          byId.has(
            next
          )
        ) {
          visit(
            next,
            [
              ...stack,
              node
            ]
          );
        }

        state.set(
          node,
          'VISITED'
        );
      }

      graph.forEach(
        (
          _parent,
          sourceId
        ) => {
          visit(
            sourceId,
            []
          );
        }
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Scoring-rule validation                                                    */
/* -------------------------------------------------------------------------- */

function validateScoringRules(
  scoringRules
) {
  const errors = [];
  const warnings = [];

  errors.push(
    ...validateObjectRecords(
      scoringRules,
      'scoringRules'
    )
  );

  errors.push(
    ...validateIds(
      scoringRules,
      'scoringRules'
    )
  );

  errors.push(
    ...validateEntityTypes(
      scoringRules,
      'scoringRules',
      'SCORING_RULE'
    )
  );

  if (
    !Array.isArray(
      scoringRules
    )
  ) {
    return {
      errors,
      warnings
    };
  }

  scoringRules.forEach(
    (
      rule,
      index
    ) => {
      if (
        !isObject(
          rule
        )
      ) {
        return;
      }

      const path =
        `scoringRules[${index}]`;

      const direction =
        rule.direction ??
        rule.metricDirection ??
        rule.preferenceDirection;

      if (
        direction !==
          undefined &&
        direction !==
          null
      ) {
        if (
          !isNonEmptyString(
            direction
          ) ||
          !VALID_METRIC_DIRECTIONS.has(
            direction
              .trim()
              .toLowerCase()
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_METRIC_DIRECTION',
              `Invalid metric direction "${String(
                direction
              )}".`,
              `${path}.direction`
            )
          );
        }
      }

      if (
        rule.weight !==
          undefined &&
        rule.weight !==
          null &&
        (
          !isFiniteNumber(
            rule.weight
          ) ||
          rule.weight < 0
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_SCORING_WEIGHT',
            'Scoring-rule weight must be a finite non-negative number.',
            `${path}.weight`
          )
        );
      }

      const minimum =
        rule.minimum ??
        rule.min;

      const maximum =
        rule.maximum ??
        rule.max;

      if (
        isFiniteNumber(
          minimum
        ) &&
        isFiniteNumber(
          maximum
        ) &&
        minimum >
          maximum
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_SCORING_RANGE',
            'Scoring-rule minimum cannot exceed maximum.',
            path
          )
        );
      }

      if (
        rule.metric ===
          undefined &&
        rule.field ===
          undefined &&
        rule.key ===
          undefined
      ) {
        warnings.push(
          issue(
            'WARNING',
            'SCORING_RULE_WITHOUT_METRIC',
            'Scoring rule does not explicitly identify a metric.',
            path
          )
        );
      }
    }
  );

  return {
    errors,
    warnings
  };
}

/* -------------------------------------------------------------------------- */
/* Source integrity                                                           */
/* -------------------------------------------------------------------------- */

function validateSourceIntegrity(
  database
) {
  const errors = [];
  const warnings = [];

  getArray(
    database?.sources
  ).forEach(
    (
      source,
      index
    ) => {
      if (
        !isObject(
          source
        )
      ) {
        return;
      }

      const path =
        `sources[${index}]`;

      if (
        source.url !==
          undefined &&
        source.url !==
          null &&
        source.url !==
          ''
      ) {
        if (
          !isNonEmptyString(
            source.url
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_SOURCE_URL',
              'Source URL must be a non-empty string.',
              `${path}.url`
            )
          );
        } else {
          try {
            new URL(
              source.url
            );
          } catch {
            warnings.push(
              issue(
                'WARNING',
                'INVALID_SOURCE_URL_FORMAT',
                'Source URL is not a syntactically valid absolute URL.',
                `${path}.url`
              )
            );
          }
        }
      }

      const sourceTypeId =
        source.sourceTypeId;

      if (
        sourceTypeId !==
          undefined &&
        sourceTypeId !==
          null &&
        !isNonEmptyString(
          sourceTypeId
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_SOURCE_TYPE_ID',
            'sourceTypeId must be a non-empty string when present.',
            `${path}.sourceTypeId`
          )
        );
      }

      if (
        !source.url &&
        !source.documentId &&
        !source.reference &&
        !source.title
      ) {
        warnings.push(
          issue(
            'WARNING',
            'SOURCE_WITHOUT_LOCATOR',
            'Source has no obvious URL, document ID, reference or title locator.',
            path
          )
        );
      }

      const confidence =
        source.confidence;

      if (
        confidence !==
          undefined &&
        confidence !==
          null
      ) {
        const normalized =
          String(
            confidence
          )
            .trim()
            .toUpperCase();

        if (
          !VALID_CONFIDENCE.has(
            normalized
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_SOURCE_CONFIDENCE',
              `Invalid source confidence "${String(
                confidence
              )}".`,
              `${path}.confidence`
            )
          );
        }
      }
    }
  );

  return {
    errors,
    warnings
  };
}

/* -------------------------------------------------------------------------- */
/* Source coverage                                                            */
/* -------------------------------------------------------------------------- */

function validateSourceCoverage(
  database,
  {
    requireSources = false,
    hardEligibilityRequiresSources = true
  } = {}
) {
  const errors = [];
  const warnings = [];

  const sourceBearingCollections = [
    'jobs',
    'exams',
    'serviceCadres',
    'eligibilityRules',
    'recruitment',
    'pay',
    'locations',
    'housing',
    'promotion',
    'benefits',
    'qualifications'
  ];

  sourceBearingCollections.forEach(
    collection => {
      getArray(
        database?.[
          collection
        ]
      ).forEach(
        (
          record,
          index
        ) => {
          if (
            !isObject(
              record
            )
          ) {
            return;
          }

          const sourceIds =
            record.sourceIds;

          if (
            Array.isArray(
              sourceIds
            ) &&
            sourceIds.length >
              0
          ) {
            return;
          }

          if (
            collection ===
              'eligibilityRules' &&
            record.ruleClass ===
              'HARD' &&
            hardEligibilityRequiresSources
          ) {
            errors.push(
              issue(
                'ERROR',
                'HARD_RULE_WITHOUT_SOURCE',
                'Hard eligibility rules require sourceIds.',
                `${collection}[${index}].sourceIds`
              )
            );

            return;
          }

          if (
            requireSources
          ) {
            errors.push(
              issue(
                'ERROR',
                'MISSING_REQUIRED_SOURCE',
                `${collection} record has no sourceIds.`,
                `${collection}[${index}].sourceIds`
              )
            );
          } else {
            warnings.push(
              issue(
                'WARNING',
                'MISSING_SOURCE_IDS',
                `${collection} record has no sourceIds.`,
                `${collection}[${index}].sourceIds`
              )
            );
          }
        }
      );
    }
  );

  return {
    errors,
    warnings
  };
}

/* -------------------------------------------------------------------------- */
/* I18n validation                                                            */
/* -------------------------------------------------------------------------- */

function collectLocales(
  i18n
) {
  if (
    !isObject(
      i18n
    )
  ) {
    return new Set();
  }

  return new Set(
    Object.keys(
      i18n
    ).filter(
      isSupportedLocaleTag
    )
  );
}

function validateI18nCatalog(
  catalog,
  locale,
  path
) {
  const errors = [];

  if (
    !isObject(
      catalog
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_I18N_CATALOG',
        `i18n catalog "${locale}" must be an object.`,
        path
      )
    );

    return errors;
  }

  function walk(
    value,
    currentPath
  ) {
    if (
      typeof value ===
        'string'
    ) {
      if (
        !value.trim()
      ) {
        errors.push(
          issue(
            'ERROR',
            'EMPTY_TRANSLATION',
            'Translation strings cannot be empty.',
            currentPath
          )
        );
      }

      return;
    }

    if (
      Array.isArray(
        value
      )
    ) {
      value.forEach(
        (
          item,
          index
        ) => {
          walk(
            item,
            `${currentPath}[${index}]`
          );
        }
      );

      return;
    }

    if (
      isObject(
        value
      )
    ) {
      Object.entries(
        value
      ).forEach(
        ([
          key,
          child
        ]) => {
          walk(
            child,
            `${currentPath}.${key}`
          );
        }
      );

      return;
    }

    errors.push(
      issue(
        'ERROR',
        'INVALID_TRANSLATION_NODE',
        'Translation nodes must be strings, arrays or objects.',
        currentPath
      )
    );
  }

  walk(
    catalog,
    path
  );

  return errors;
}

function flattenTranslationKeys(
  value,
  prefix = '',
  output = new Set()
) {
  if (
    typeof value ===
      'string'
  ) {
    output.add(
      prefix
    );

    return output;
  }

  if (
    Array.isArray(
      value
    )
  ) {
    value.forEach(
      (
        item,
        index
      ) => {
        flattenTranslationKeys(
          item,
          `${prefix}[${index}]`,
          output
        );
      }
    );

    return output;
  }

  if (
    isObject(
      value
    )
  ) {
    Object.entries(
      value
    ).forEach(
      ([
        key,
        child
      ]) => {
        flattenTranslationKeys(
          child,
          prefix
            ? `${prefix}.${key}`
            : key,
          output
        );
      }
    );
  }

  return output;
}

function validateI18n(
  i18n
) {
  const errors = [];
  const warnings = [];
  const infos = [];

  if (
    i18n ===
      undefined ||
    i18n ===
      null
  ) {
    warnings.push(
      issue(
        'WARNING',
        'I18N_NOT_LOADED',
        'No i18n catalogs are currently loaded.',
        'i18n'
      )
    );

    return {
      errors,
      warnings,
      infos
    };
  }

  if (
    !isObject(
      i18n
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_I18N_ROOT',
        'i18n must be an object keyed by locale.',
        'i18n'
      )
    );

    return {
      errors,
      warnings,
      infos
    };
  }

  const locales =
    Object.keys(
      i18n
    );

  if (
    locales.length ===
    0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'EMPTY_I18N',
        'The i18n container is empty.',
        'i18n'
      )
    );

    return {
      errors,
      warnings,
      infos
    };
  }

  locales.forEach(
    locale => {
      if (
        !isSupportedLocaleTag(
          locale
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_LOCALE_TAG',
            `Invalid i18n locale "${locale}".`,
            `i18n.${locale}`
          )
        );

        return;
      }

      errors.push(
        ...validateI18nCatalog(
          i18n[locale],
          locale,
          `i18n.${locale}`
        )
      );
    }
  );

  const localeKeySets =
    new Map();

  locales.forEach(
    locale => {
      localeKeySets.set(
        locale,
        flattenTranslationKeys(
          i18n[locale]
        )
      );
    }
  );

  const localeList =
    [
      ...localeKeySets.keys()
    ];

  if (
    localeList.length >
    1
  ) {
    const baseLocale =
      localeList[0];

    const baseKeys =
      localeKeySets.get(
        baseLocale
      );

    localeList
      .slice(1)
      .forEach(
        locale => {
          const keys =
            localeKeySets.get(
              locale
            );

          const missing =
            [
              ...baseKeys
            ].filter(
              key =>
                !keys.has(
                  key
                )
            );

          if (
            missing.length
          ) {
            warnings.push(
              issue(
                'WARNING',
                'MISSING_TRANSLATION_KEYS',
                `${locale} is missing ${missing.length} translation key(s) compared with ${baseLocale}.`,
                `i18n.${locale}`,
                {
                  referenceLocale:
                    baseLocale,
                  missingKeys:
                    missing.slice(
                      0,
                      100
                    )
                }
              )
            );
          }
        }
      );
  }

  infos.push(
    issue(
      'INFO',
      'I18N_LOCALES_DETECTED',
      `Loaded i18n locales: ${locales.join(
        ', '
      )}.`,
      'i18n',
      {
        locales
      }
    )
  );

  return {
    errors,
    warnings,
    infos
  };
}

/* -------------------------------------------------------------------------- */
/* Derived-index validation                                                   */
/* -------------------------------------------------------------------------- */

function isIndexPostingObject(
  value
) {
  return (
    isObject(
      value
    ) &&
    (
      isNonEmptyString(
        value.id
      ) ||
      isNonEmptyString(
        value.recordId
      ) ||
      isNonEmptyString(
        value.entityId
      ) ||
      isNonEmptyString(
        value.canonicalId
      )
    )
  );
}

function extractIndexPostingIds(
  value,
  {
    includeObjectKeys = true
  } = {}
) {
  const ids =
    new Set();

  function visit(
    current
  ) {
    if (
      current ===
        undefined ||
      current ===
        null
    ) {
      return;
    }

    if (
      typeof current ===
        'string'
    ) {
      return;
    }

    if (
      Array.isArray(
        current
      )
    ) {
      current.forEach(
        visit
      );

      return;
    }

    if (
      !isObject(
        current
      )
    ) {
      return;
    }

    [
      'id',
      'recordId',
      'entityId',
      'canonicalId',
      'jobId',
      'examId',
      'qualificationId',
      'serviceCadreId',
      'eligibilityRuleId'
    ].forEach(
      field => {
        if (
          isNonEmptyString(
            current[field]
          )
        ) {
          ids.add(
            current[field].trim()
          );
        }
      }
    );

    [
      'ids',
      'entityIds',
      'jobIds',
      'examIds',
      'qualificationIds',
      'serviceCadreIds',
      'eligibilityRuleIds'
    ].forEach(
      field => {
        if (
          Array.isArray(
            current[field]
          )
        ) {
          current[field].forEach(
            id => {
              if (
                isNonEmptyString(
                  id
                )
              ) {
                ids.add(
                  id.trim()
                );
              }
            }
          );
        }
      }
    );

    Object.entries(
      current
    ).forEach(
      ([
        key,
        child
      ]) => {
        if (
          includeObjectKeys &&
          isNonEmptyString(
            key
          ) &&
          ![
            'metadata',
            'meta',
            '_meta',
            'version',
            'generatedAt',
            'description'
          ].includes(
            key
          )
        ) {
          /*
           * Keys are not automatically IDs. We only inspect them when their
           * child resembles a postings list/object.
           */
          if (
            Array.isArray(
              child
            ) ||
            isIndexPostingObject(
              child
            )
          ) {
            if (
              !isNonEmptyString(
                key
              )
            ) {
              return;
            }
          }
        }

        visit(
          child
        );
      }
    );
  }

  visit(
    value
  );

  return ids;
}

function validateRuntimeIndexGroup(
  group,
  domain,
  canonicalIds,
  path,
  {
    tokenIndex = false
  } = {}
) {
  const errors = [];
  const warnings = [];

  if (
    group ===
      null ||
    group ===
      undefined
  ) {
    return {
      errors,
      warnings
    };
  }

  if (
    !isObject(
      group
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_INDEX_GROUP',
        `${domain} index group must be an object.`,
        path
      )
    );

    return {
      errors,
      warnings
    };
  }

  Object.entries(
    group
  ).forEach(
    ([
      indexName,
      indexValue
    ]) => {
      if (
        indexValue instanceof Map
      ) {
        indexValue.forEach(
          (
            postingValues,
            key
          ) => {
            if (
              !(postingValues instanceof Set) &&
              !Array.isArray(
                postingValues
              )
            ) {
              errors.push(
                issue(
                  'ERROR',
                  'INVALID_INDEX_POSTINGS',
                  `Index ${indexName} must map keys to Sets or arrays of IDs.`,
                  `${path}.${indexName}`
                )
              );

              return;
            }

            const postings =
              postingValues instanceof
                Set
                ? [
                    ...postingValues
                  ]
                : postingValues;

            postings.forEach(
              id => {
                if (
                  !isNonEmptyString(
                    id
                  )
                ) {
                  errors.push(
                    issue(
                      'ERROR',
                      'INVALID_INDEX_ID',
                      `Index ${indexName} contains a non-string ID.`,
                      `${path}.${indexName}.${String(
                        key
                      )}`
                    )
                  );

                  return;
                }

                if (
                  !canonicalIds.has(
                    id.trim()
                  )
                ) {
                  warnings.push(
                    issue(
                      'WARNING',
                      'INDEX_UNKNOWN_ID',
                      `Derived index ${indexName} contains ID "${id}" that is absent from the canonical ${domain} collection.`,
                      `${path}.${indexName}.${String(
                        key
                      )}`,
                      {
                        domain,
                        id:
                          id.trim()
                      }
                    )
                  );
                }
              }
            );
          }
        );

        return;
      }

      /*
       * Serialized/static index shape.
       */
      if (
        isObject(
          indexValue
        )
      ) {
        const candidateIds =
          extractIndexPostingIds(
            indexValue
          );

        candidateIds.forEach(
          id => {
            if (
              !canonicalIds.has(
                id
              )
            ) {
              warnings.push(
                issue(
                  'WARNING',
                  'INDEX_UNKNOWN_ID',
                  `Derived index ${indexName} contains ID "${id}" absent from canonical ${domain} records.`,
                  `${path}.${indexName}`,
                  {
                    domain,
                    id
                  }
                )
              );
            }
          }
        );

        return;
      }

      if (
        tokenIndex &&
        typeof indexValue ===
          'string'
      ) {
        return;
      }

      if (
        !Array.isArray(
          indexValue
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_INDEX_VALUE',
            `Index ${indexName} contains an unsupported value.`,
            `${path}.${indexName}`
          )
        );
      }
    }
  );

  return {
    errors,
    warnings
  };
}

function validateIndexes(
  database
) {
  const errors = [];
  const warnings = [];
  const infos = [];

  const indexes =
    database?.indexes;

  if (
    indexes ===
      undefined ||
    indexes ===
      null
  ) {
    warnings.push(
      issue(
        'WARNING',
        'INDEXES_NOT_LOADED',
        'No derived indexes are currently loaded.',
        'indexes'
      )
    );

    return {
      errors,
      warnings,
      infos
    };
  }

  if (
    !isObject(
      indexes
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_INDEX_CONTAINER',
        'database.indexes must be an object.',
        'indexes'
      )
    );

    return {
      errors,
      warnings,
      infos
    };
  }

  const mappings = [
    [
      'jobs',
      'jobs'
    ],
    [
      'exams',
      'exams'
    ],
    [
      'departments',
      'departments'
    ],
    [
      'organisations',
      'organisations'
    ],
    [
      'serviceCadres',
      'serviceCadres'
    ],
    [
      'eligibilityRules',
      'eligibilityRules'
    ],
    [
      'qualifications',
      'qualifications'
    ],
    [
      'sources',
      'sources'
    ]
  ];

  mappings.forEach(
    ([
      indexDomain,
      collection
    ]) => {
      const group =
        indexes[
          indexDomain
        ];

      if (
        group ===
          undefined
      ) {
        return;
      }

      const result =
        validateRuntimeIndexGroup(
          group,
          collection,
          createIdSet(
            database?.[
              collection
            ]
          ),
          `indexes.${indexDomain}`
        );

      errors.push(
        ...result.errors
      );

      warnings.push(
        ...result.warnings
      );

      infos.push(
        issue(
          'INFO',
          'INDEX_VALIDATED',
          `Derived index group "${indexDomain}" was inspected.`,
          `indexes.${indexDomain}`
        )
      );
    }
  );

  /*
   * Unified search index.
   *
   * Search documents may contain references and copied display metadata.
   * They are derived structures, so the validator verifies reference targets
   * but never treats them as canonical records.
   */
  const search =
    indexes.search;

  if (
    search !==
      undefined &&
    search !==
      null
  ) {
    if (
      !isObject(
        search
      )
    ) {
      errors.push(
        issue(
          'ERROR',
          'INVALID_SEARCH_INDEX',
          'Unified search index must be an object.',
          'indexes.search'
        )
      );
    } else {
      const documents =
        Array.isArray(
          search.documents
        )
          ? search.documents
          : [];

      const searchIds =
        new Set();

      documents.forEach(
        (
          document,
          index
        ) => {
          if (
            !isObject(
              document
            )
          ) {
            errors.push(
              issue(
                'ERROR',
                'INVALID_SEARCH_DOCUMENT',
                'Search index documents must be objects.',
                `indexes.search.documents[${index}]`
              )
            );

            return;
          }

          if (
            !isNonEmptyString(
              document.id
            )
          ) {
            errors.push(
              issue(
                'ERROR',
                'SEARCH_DOCUMENT_WITHOUT_ID',
                'Search index documents require canonical IDs.',
                `indexes.search.documents[${index}].id`
              )
            );

            return;
          }

          const composite =
            `${
              document.entityType ||
              ''
            }:${document.id}`;

          if (
            searchIds.has(
              composite
            )
          ) {
            errors.push(
              issue(
                'ERROR',
                'DUPLICATE_SEARCH_DOCUMENT',
                `Duplicate search document "${composite}".`,
                `indexes.search.documents[${index}].id`
              )
            );
          }

          searchIds.add(
            composite
          );

          if (
            isNonEmptyString(
              document.entityType
            )
          ) {
            const type =
              document.entityType
                .trim()
                .toUpperCase();

            if (
              !VALID_ENTITY_TYPES.has(
                type
              )
            ) {
              errors.push(
                issue(
                  'ERROR',
                  'INVALID_SEARCH_ENTITY_TYPE',
                  `Search document entityType "${document.entityType}" is invalid.`,
                  `indexes.search.documents[${index}].entityType`
                )
              );
            } else {
              const targetCollection =
                Object.entries(
                  COLLECTION_ENTITY_TYPES
                ).find(
                  ([
                    _collection,
                    entityType
                  ]) =>
                    entityType ===
                    type
                )?.[0];

              if (
                targetCollection &&
                !createIdSet(
                  database?.[
                    targetCollection
                  ]
                ).has(
                  document.id.trim()
                )
              ) {
                warnings.push(
                  issue(
                    'WARNING',
                    'SEARCH_DOCUMENT_UNKNOWN_CANONICAL_ID',
                    `Search document references unknown canonical ID "${document.id}".`,
                    `indexes.search.documents[${index}].id`
                  )
                );
              }
            }
          }
        }
      );

      infos.push(
        issue(
          'INFO',
          'SEARCH_INDEX_VALIDATED',
          `Unified search index contains ${documents.length} derived document(s).`,
          'indexes.search.documents',
          {
            documents:
              documents.length
          }
        )
      );
    }
  }

  return {
    errors,
    warnings,
    infos
  };
}

/* -------------------------------------------------------------------------- */
/* Dataset presence                                                           */
/* -------------------------------------------------------------------------- */

function validateDatasetPresence(
  database
) {
  const errors = [];
  const warnings = [];
  const infos = [];

  const requiredCollections = [
    'jobs',
    'exams',
    'qualifications'
  ];

  requiredCollections.forEach(
    collection => {
      const value =
        database?.[
          collection
        ];

      if (
        !Array.isArray(
          value
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_REQUIRED_COLLECTION',
            `${collection} must be a loaded array.`,
            collection
          )
        );
      }
    }
  );

  Object.keys(
    COLLECTION_ENTITY_TYPES
  )
    .filter(
      collection =>
        !requiredCollections.includes(
          collection
        )
    )
    .forEach(
      collection => {
        const value =
          database?.[
            collection
          ];

        if (
          value ===
            undefined ||
          value ===
            null
        ) {
          infos.push(
            issue(
              'INFO',
              'COLLECTION_NOT_LOADED',
              `${collection} collection is not currently loaded.`,
              collection
            )
          );

          return;
        }

        if (
          !Array.isArray(
            value
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'COLLECTION_NOT_ARRAY',
              `${collection} must be an array when loaded.`,
              collection
            )
          );
        }
      }
    );

  return {
    errors,
    warnings,
    infos
  };
}

/* -------------------------------------------------------------------------- */
/* Registry compatibility                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Validate a runtime registry snapshot produced by the finalized registry.
 *
 * This is intentionally optional and does not import registry.js, preventing
 * any circular dependency:
 *
 *   registry → no validator import
 *   validator → no registry import
 */
function validateRegistrySnapshot(
  snapshot,
  options = {}
) {
  const errors = [];
  const warnings = [];
  const infos = [];

  if (
    !isObject(
      snapshot
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_REGISTRY_SNAPSHOT',
        'Registry snapshot must be an object.',
        'registry'
      )
    );

    return makeResult(
      errors,
      warnings,
      infos
    );
  }

  const collections =
    isObject(
      snapshot.collections
    )
      ? snapshot.collections
      : {};

  const database = {};

  Object.entries(
    COLLECTION_ENTITY_TYPES
  ).forEach(
    ([
      collection
    ]) => {
      database[
        collection
      ] =
        Array.isArray(
          collections[
            collection
          ]
        )
          ? collections[
              collection
            ]
          : [];
    }
  );

  if (
    isObject(
      snapshot.indexes
    )
  ) {
    database.indexes =
      snapshot.indexes;
  }

  if (
    isObject(
      snapshot.i18n
    )
  ) {
    database.i18n =
      snapshot.i18n;
  }

  return validateDatabase(
    database,
    {
      ...options,
      validateIndexes:
        options.validateIndexes ??
        true
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Complete database validation                                               */
/* -------------------------------------------------------------------------- */

function validateAllCollections(
  database,
  {
    supportedLocales = null
  } = {}
) {
  const errors = [];
  const warnings = [];

  const specialValidators = {
    jobs:
      validateJobs,

    exams:
      validateExams,

    serviceCadres:
      validateServiceCadres,

    eligibilityRules:
      validateEligibilityRules,

    qualifications:
      validateQualifications,

    scoringRules:
      validateScoringRules
  };

  Object.entries(
    COLLECTION_ENTITY_TYPES
  ).forEach(
    ([
      collection,
      expectedType
    ]) => {
      const records =
        database?.[
          collection
        ];

      if (
        records ===
          undefined ||
        records ===
          null
      ) {
        return;
      }

      if (
        specialValidators[
          collection
        ]
      ) {
        const result =
          specialValidators[
            collection
          ](
            records
          );

        /*
         * Most entity validators return { errors, warnings }.
         * validateScoringRules is handled the same way.
         */
        errors.push(
          ...(
            Array.isArray(
              result
            )
              ? result
              : result.errors ||
                []
          )
        );

        if (
          !Array.isArray(
            result
          )
        ) {
          warnings.push(
            ...(result.warnings ||
              [])
          );
        }
      } else {
        errors.push(
          ...validateGeneric(
            records,
            collection
          )
        );
      }

      if (
        Array.isArray(
          records
        )
      ) {
        records.forEach(
          (
            record,
            index
          ) => {
            const localized =
              validateLocalizedFields(
                record,
                collection,
                index,
                supportedLocales
              );

            errors.push(
              ...localized.errors
            );

            warnings.push(
              ...localized.warnings
            );

            /*
             * Avoid accepting a record's domain `type` field as its
             * entityType. The expected collection type is supplied above.
             */
            void expectedType;
          }
        );
      }
    }
  );

  return {
    errors,
    warnings
  };
}

function validateDatabase(
  database = {},
  {
    strict = false,
    requireSources = false,
    validateIndexes:
      shouldValidateIndexes = true,
    validateI18n:
      shouldValidateI18n = true,
    detectCycles = true,
    detectCrossNamespaceCollisions = true,
    hardEligibilityRequiresSources = true
  } = {}
) {
  const errors = [];
  const warnings = [];
  const infos = [];

  if (
    !isObject(
      database
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_DATABASE',
        'Database root must be an object.',
        'database'
      )
    );

    return makeResult(
      errors,
      warnings,
      infos
    );
  }

  /*
   * Validate database presence first so all later checks can safely inspect
   * canonical collections.
   */
  const presence =
    validateDatasetPresence(
      database
    );

  errors.push(
    ...presence.errors
  );

  warnings.push(
    ...presence.warnings
  );

  infos.push(
    ...presence.infos
  );

  const supportedLocales =
    collectLocales(
      database.i18n
    );

  /*
   * Entity collection validation.
   */
  const collections =
    validateAllCollections(
      database,
      {
        supportedLocales
      }
    );

  errors.push(
    ...collections.errors
  );

  warnings.push(
    ...collections.warnings
  );

  /*
   * Cross-namespace identity collisions.
   */
  if (
    detectCrossNamespaceCollisions
  ) {
    errors.push(
      ...validateCrossNamespaceIds(
        database
      )
    );
  }

  /*
   * Canonical relationship integrity.
   */
  errors.push(
    ...validateCrossReferences(
      database
    )
  );

  /*
   * Eligibility dependency integrity.
   */
  if (
    detectCycles
  ) {
    errors.push(
      ...validateEligibilityRuleCycles(
        database.eligibilityRules
      )
    );

    errors.push(
      ...validateHierarchyCycles(
        database
      )
    );
  }

  /*
   * Derived indexes.
   */
  if (
    shouldValidateIndexes
  ) {
    const indexResult =
      validateIndexes(
        database
      );

    errors.push(
      ...indexResult.errors
    );

    warnings.push(
      ...indexResult.warnings
    );

    infos.push(
      ...indexResult.infos
    );
  }

  /*
   * i18n catalogs.
   */
  if (
    shouldValidateI18n
  ) {
    const i18nResult =
      validateI18n(
        database.i18n
      );

    errors.push(
      ...i18nResult.errors
    );

    warnings.push(
      ...i18nResult.warnings
    );

    infos.push(
      ...i18nResult.infos
    );
  }

  /*
   * Source integrity and source coverage.
   */
  const sourceIntegrity =
    validateSourceIntegrity(
      database
    );

  errors.push(
    ...sourceIntegrity.errors
  );

  warnings.push(
    ...sourceIntegrity.warnings
  );

  const sourceCoverage =
    validateSourceCoverage(
      database,
      {
        requireSources:
          strict ||
          requireSources,

        hardEligibilityRequiresSources
      }
    );

  errors.push(
    ...sourceCoverage.errors
  );

  warnings.push(
    ...sourceCoverage.warnings
  );

  /*
   * High-level diagnostics.
   */
  const jobCount =
    getArray(
      database.jobs
    ).length;

  const examCount =
    getArray(
      database.exams
    ).length;

  const qualificationCount =
    getArray(
      database.qualifications
    ).length;

  const serviceCadreCount =
    getArray(
      database.serviceCadres
    ).length;

  const eligibilityRuleCount =
    getArray(
      database.eligibilityRules
    ).length;

  const sourceCount =
    getArray(
      database.sources
    ).length;

  if (
    jobCount ===
    0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'NO_JOBS',
        'No canonical job records are currently loaded.',
        'jobs'
      )
    );
  }

  if (
    examCount ===
    0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'NO_EXAMS',
        'No canonical exam records are currently loaded.',
        'exams'
      )
    );
  }

  if (
    qualificationCount ===
    0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'NO_QUALIFICATIONS',
        'No canonical qualification records are currently loaded.',
        'qualifications'
      )
    );
  }

  if (
    serviceCadreCount ===
    0
  ) {
    infos.push(
      issue(
        'INFO',
        'NO_SERVICE_CADRES',
        'No service-cadre records are currently loaded.',
        'serviceCadres'
      )
    );
  }

  if (
    eligibilityRuleCount ===
    0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'NO_ELIGIBILITY_RULES',
        'No canonical eligibility-rule records are currently loaded.',
        'eligibilityRules'
      )
    );
  }

  if (
    sourceCount ===
    0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'NO_SOURCES',
        'No source records are currently loaded.',
        'sources'
      )
    );
  }

  /*
   * Explicitly document the legacy-field boundary in diagnostics rather than
   * silently treating old fields as authority.
   */
  const legacyBaEligibilityCount =
    getArray(
      database.jobs
    ).filter(
      job =>
        Object.prototype.hasOwnProperty.call(
          job,
          'baEligibility'
        )
    ).length;

  if (
    legacyBaEligibilityCount >
      0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'LEGACY_BA_ELIGIBILITY_PRESENT',
        `${legacyBaEligibilityCount} job record(s) contain legacy baEligibility metadata. It is not used as runtime eligibility authority.`,
        'jobs'
      )
    );
  }

  infos.push(
    issue(
      'INFO',
      'DATABASE_VALIDATION_COMPLETED',
      'Runtime canonical database validation completed.',
      'database',
      {
        strict,

        counts: {
          jobs:
            jobCount,

          exams:
            examCount,

          qualifications:
            qualificationCount,

          serviceCadres:
            serviceCadreCount,

          eligibilityRules:
            eligibilityRuleCount,

          sources:
            sourceCount
        },

        canonicalArchitecture:
          'relational',

        eligibilityAuthority:
          'eligibilityRules',

        legacyBaEligibility:
          'non-authoritative'
      }
    )
  );

  return makeResult(
    errors,
    warnings,
    infos
  );
}

/* -------------------------------------------------------------------------- */
/* Compatibility exports                                                      */
/* -------------------------------------------------------------------------- */

export {
  VALID_JOB_ELIGIBILITY,
  VALID_RULE_CLASSES,
  VALID_RULE_EFFECTS,
  VALID_OPERATORS,
  VALID_CONFIDENCE,
  VALID_METRIC_DIRECTIONS,
  SCORE_FIELDS,

  isObject,
  issue,

  validateObjectRecords,
  validateIds,
  validateEntityTypes,

  validateNumericFields,
  validateDateFieldsRecursive,
  validateDateRanges,
  validateDateRangesRecursive,

  validateConfidence,
  validateScores,

  validateLocalizedValue,
  validateLocalizedFields,

  validateJobs,
  validateExams,
  validateServiceCadres,
  validateEligibilityRules,
  validateQualifications,
  validateGeneric,

  validateCrossReferences,
  validateCrossNamespaceIds,
  validateEligibilityRuleCycles,
  validateHierarchyCycles,

  validateScoringRules,
  validateSourceIntegrity,
  validateSourceCoverage,
  validateI18n,
  validateIndexes,

  validateDatasetPresence,
  validateRegistrySnapshot,

  validateDatabase
};

export default {
  validateDatabase,

  validateRegistrySnapshot,

  validateCrossReferences,
  validateCrossNamespaceIds,
  validateEligibilityRuleCycles,
  validateHierarchyCycles,

  validateJobs,
  validateExams,
  validateServiceCadres,
  validateEligibilityRules,
  validateQualifications,

  validateScoringRules,
  validateSourceIntegrity,
  validateSourceCoverage,

  validateI18n,
  validateIndexes
};
