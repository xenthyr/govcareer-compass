/**
 * GovCareer Compass
 * ============================================================
 * Runtime Database Validator
 * ============================================================
 *
 * Runtime validation complements repository-level JSON Schema
 * validation.
 *
 * Responsibilities:
 * - validate canonical runtime entity collections;
 * - validate stable IDs and entity types;
 * - validate references between entities;
 * - validate numeric, date, status and confidence fields;
 * - validate localized structures;
 * - validate eligibility-rule integrity;
 * - validate scoring-rule integrity;
 * - validate derived index/data consistency;
 * - detect inappropriate cross-namespace ID collisions;
 * - detect circular references in hierarchical relationships;
 * - return structured errors, warnings and informational findings.
 *
 * Validation policy:
 *
 *   ERROR
 *     Fatal integrity problem. The runtime database must not be
 *     registered as canonical application data.
 *
 *   WARNING
 *     The database can technically load, but data quality or
 *     completeness requires attention.
 *
 *   INFO
 *     Non-fatal diagnostic information useful for CI, development,
 *     research and debugging.
 *
 * This module does NOT:
 * - repair canonical data;
 * - mutate database records;
 * - resolve eligibility;
 * - calculate recommendations;
 * - calculate rankings;
 * - fetch external sources;
 * - modify indexes;
 * - silently invent missing values.
 */

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const VALID_JOB_ELIGIBILITY =
  new Set([
    'DIRECT',
    'CONDITIONAL',
    'NOT_ELIGIBLE',
    'MANUAL_VERIFICATION',
    'UNKNOWN',
    'REVIEW_REQUIRED'
  ]);

const VALID_RULE_CLASSES =
  new Set([
    'HARD',
    'SOFT'
  ]);

const VALID_CONFIDENCE =
  new Set([
    'HIGH',
    'MEDIUM_HIGH',
    'MEDIUM',
    'LOW',
    'ESTIMATE',
    'NOT_VERIFIED',
    'UNKNOWN'
  ]);

const VALID_SEVERITIES =
  new Set([
    'ERROR',
    'WARNING',
    'INFO'
  ]);

const VALID_METRIC_DIRECTIONS =
  new Set([
    'higher_is_better',
    'higher_is_worse',
    'lower_is_better',
    'lower_is_worse',
    'neutral'
  ]);

const VALID_ENTITY_TYPES =
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
  ]);

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

const PERCENTAGE_FIELDS =
  new Set([
    'percentage',
    'minimumPercentage',
    'maximumPercentage',
    'minimumMarksPercentage',
    'maximumMarksPercentage',
    'minimumAggregatePercentage',
    'maximumAggregatePercentage',
    'reservationPercentage',
    'daPercentage',
    'hraPercentage',
    'otherAllowancePercentage'
  ]);

const NON_NEGATIVE_NUMERIC_FIELDS =
  new Set([
    'startingBasic',
    'maximumBasic',
    'basicPay',
    'minimumPay',
    'maximumPay',
    'age',
    'minimumAge',
    'maximumAge',
    'minimumMarks',
    'maximumMarks',
    'experienceYears',
    'minimumExperienceYears',
    'maximumExperienceYears',
    'vacancies',
    'sanctionedStrength',
    'yearsOfService',
    'probationMonths',
    'noticePeriodDays'
  ]);

const DATE_FIELDS =
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
    'sourceDate',
    'asOfDate'
  ]);

const HIERARCHICAL_REFERENCE_FIELDS =
  Object.freeze([
    'parentId',
    'parentDepartmentId',
    'parentOrganisationId',
    'parentLocationId',
    'parentStateId',
    'parentCategoryId',
    'supersedesId',
    'replacesId',
    'previousRuleId',
    'nextRuleId'
  ]);

const REFERENCE_FIELD_MAP =
  Object.freeze({
    jobs: Object.freeze({
      departmentId: 'departments',
      organisationId: 'organisations',
      serviceCadreId: 'serviceCadres',
      recruitmentId: 'recruitment',
      payId: 'pay',
      locationId: 'locations',
      housingId: 'housing',
      promotionId: 'promotion',
      benefitIds: 'benefits',
      examIds: 'exams',
      eligibilityRuleIds: 'eligibilityRules',
      sourceIds: 'sources',
      qualificationIds: 'qualifications',
      categoryId: 'categories',
      governmentId: 'governments',
      stateId: 'states'
    }),

    exams: Object.freeze({
      departmentId: 'departments',
      organisationId: 'organisations',
      serviceCadreId: 'serviceCadres',
      recruitmentId: 'recruitment',
      governmentId: 'governments',
      stateId: 'states',
      sourceIds: 'sources',
      postIds: 'jobs',
      jobIds: 'jobs',
      qualificationIds: 'qualifications'
    }),

    serviceCadres: Object.freeze({
      departmentId: 'departments',
      organisationId: 'organisations',
      governmentId: 'governments',
      stateId: 'states',
      postIds: 'jobs',
      jobIds: 'jobs',
      examIds: 'exams',
      eligibilityRuleIds: 'eligibilityRules',
      recruitmentIds: 'recruitment',
      promotionIds: 'promotion',
      sourceIds: 'sources'
    }),

    eligibilityRules: Object.freeze({
      targetId: '__TARGET__',
      jobId: 'jobs',
      serviceCadreId: 'serviceCadres',
      examId: 'exams',
      targetJobId: 'jobs',
      targetServiceCadreId: 'serviceCadres',
      qualificationIds: 'qualifications',
      requiredQualificationIds: 'qualifications',
      sourceIds: 'sources'
    }),

    departments: Object.freeze({
      governmentId: 'governments',
      stateId: 'states',
      organisationId: 'organisations',
      parentDepartmentId: 'departments',
      parentId: 'departments',
      sourceIds: 'sources'
    }),

    organisations: Object.freeze({
      governmentId: 'governments',
      stateId: 'states',
      parentOrganisationId: 'organisations',
      parentId: 'organisations',
      departmentId: 'departments',
      sourceIds: 'sources'
    }),

    recruitment: Object.freeze({
      examId: 'exams',
      jobIds: 'jobs',
      postIds: 'jobs',
      serviceCadreId: 'serviceCadres',
      departmentId: 'departments',
      organisationId: 'organisations',
      sourceIds: 'sources'
    }),

    pay: Object.freeze({
      jobId: 'jobs',
      serviceCadreId: 'serviceCadres',
      sourceIds: 'sources'
    }),

    locations: Object.freeze({
      stateId: 'states',
      parentLocationId: 'locations',
      sourceIds: 'sources'
    }),

    housing: Object.freeze({
      jobId: 'jobs',
      locationId: 'locations',
      stateId: 'states',
      sourceIds: 'sources'
    }),

    promotion: Object.freeze({
      jobId: 'jobs',
      serviceCadreId: 'serviceCadres',
      nextJobId: 'jobs',
      previousJobId: 'jobs',
      sourceIds: 'sources'
    }),

    benefits: Object.freeze({
      jobId: 'jobs',
      governmentId: 'governments',
      stateId: 'states',
      sourceIds: 'sources'
    }),

    sources: Object.freeze({
      governmentId: 'governments',
      stateId: 'states'
    }),

    qualifications: Object.freeze({
      sourceIds: 'sources'
    }),

    categories: Object.freeze({
      parentCategoryId: 'categories',
      sourceIds: 'sources'
    }),

    governments: Object.freeze({
      sourceIds: 'sources'
    }),

    states: Object.freeze({
      governmentId: 'governments',
      sourceIds: 'sources'
    })
  });

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
    assessmentResponseScoring: 'ASSESSMENT_RESPONSE_SCORING'
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

function addIssue(
  bucket,
  validationIssue
) {
  if (
    validationIssue &&
    VALID_SEVERITIES.has(
      validationIssue.severity
    )
  ) {
    bucket.push(
      validationIssue
    );
  }
}

function getArray(
  value
) {
  return Array.isArray(
    value
  )
    ? value
    : [];
}

function uniqueStrings(
  values
) {
  return [
    ...new Set(
      getArray(values).filter(
        isNonEmptyString
      )
    )
  ];
}

/* -------------------------------------------------------------------------- */
/* Entity/object validation                                                   */
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
            `${entityName} record requires a stable ID.`,
            `${entityName}[${index}].id`
          )
        );

        return;
      }

      const normalizedId =
        id.trim();

      if (
        seen.has(
          normalizedId
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'DUPLICATE_ID',
            `Duplicate ${entityName} ID "${normalizedId}".`,
            `${entityName}[${index}].id`
          )
        );

        return;
      }

      seen.add(
        normalizedId
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
        record.type ??
        record._type;

      if (
        explicitType ===
        undefined
      ) {
        return;
      }

      if (
        typeof explicitType !==
        'string'
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_ENTITY_TYPE',
            `${entityName} entityType must be a string.`,
            `${entityName}[${index}].entityType`
          )
        );

        return;
      }

      const normalizedType =
        explicitType
          .trim()
          .toUpperCase();

      if (
        !VALID_ENTITY_TYPES.has(
          normalizedType
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
        normalizedType !==
          expectedEntityType
      ) {
        errors.push(
          issue(
            'ERROR',
            'ENTITY_TYPE_MISMATCH',
            `${entityName} record declares "${normalizedType}" but expected "${expectedEntityType}".`,
            `${entityName}[${index}].entityType`
          )
        );
      }
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Reference validation                                                       */
/* -------------------------------------------------------------------------- */

function createIdSet(
  records
) {
  return new Set(
    getArray(records)
      .map(
        record =>
          record?.id
      )
      .filter(
        isNonEmptyString
      )
      .map(
        id =>
          id.trim()
      )
  );
}

function validateReferenceArray(
  records,
  field,
  validIds,
  entityName
) {
  const errors = [];

  if (
    !Array.isArray(records)
  ) {
    return errors;
  }

  const ids =
    validIds instanceof Set
      ? validIds
      : createIdSet(
          validIds
        );

  records.forEach(
    (record, index) => {
      if (
        !isObject(record)
      ) {
        return;
      }

      const values =
        record[field];

      if (
        values ===
          undefined ||
        values === null
      ) {
        return;
      }

      if (
        !Array.isArray(values)
      ) {
        errors.push(
          issue(
            'ERROR',
            'REFERENCE_NOT_ARRAY',
            `${field} must be an array.`,
            `${entityName}[${index}].${field}`
          )
        );

        return;
      }

      values.forEach(
        (
          value,
          referenceIndex
        ) => {
          if (
            !isNonEmptyString(
              value
            ) ||
            !ids.has(
              value.trim()
            )
          ) {
            errors.push(
              issue(
                'ERROR',
                'BROKEN_REFERENCE',
                `${entityName}.${field} references unknown ID "${String(
                  value
                )}".`,
                `${entityName}[${index}].${field}[${referenceIndex}]`
              )
            );
          }
        }
      );
    }
  );

  return errors;
}

function validateReferenceField(
  records,
  field,
  validIds,
  entityName
) {
  const errors = [];

  if (
    !Array.isArray(records)
  ) {
    return errors;
  }

  const ids =
    validIds instanceof Set
      ? validIds
      : createIdSet(
          validIds
        );

  records.forEach(
    (record, index) => {
      if (
        !isObject(record)
      ) {
        return;
      }

      const value =
        record[field];

      if (
        value ===
          undefined ||
        value === null ||
        value === ''
      ) {
        return;
      }

      if (
        !isNonEmptyString(
          value
        ) ||
        !ids.has(
          value.trim()
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'BROKEN_REFERENCE',
            `${entityName}.${field} references unknown ID "${String(
              value
            )}".`,
            `${entityName}[${index}].${field}`
          )
        );
      }
    }
  );

  return errors;
}

function validateFlexibleReference(
  records,
  field,
  targetIds,
  entityName,
  {
    allowArray = true,
    allowString = true
  } = {}
) {
  const errors = [];

  if (
    !Array.isArray(records)
  ) {
    return errors;
  }

  const ids =
    targetIds instanceof Set
      ? targetIds
      : createIdSet(
          targetIds
        );

  records.forEach(
    (record, index) => {
      if (
        !isObject(record)
      ) {
        return;
      }

      const value =
        record[field];

      if (
        value ===
          undefined ||
        value === null
      ) {
        return;
      }

      if (
        allowArray &&
        Array.isArray(
          value
        )
      ) {
        value.forEach(
          (
            item,
            itemIndex
          ) => {
            if (
              !isNonEmptyString(
                item
              ) ||
              !ids.has(
                item.trim()
              )
            ) {
              errors.push(
                issue(
                  'ERROR',
                  'BROKEN_REFERENCE',
                  `${entityName}.${field} references unknown ID "${String(
                    item
                  )}".`,
                  `${entityName}[${index}].${field}[${itemIndex}]`
                )
              );
            }
          }
        );

        return;
      }

      if (
        allowString &&
        isNonEmptyString(
          value
        )
      ) {
        if (
          !ids.has(
            value.trim()
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'BROKEN_REFERENCE',
              `${entityName}.${field} references unknown ID "${value}".`,
              `${entityName}[${index}].${field}`
            )
          );
        }

        return;
      }

      errors.push(
        issue(
          'ERROR',
          'INVALID_REFERENCE_SHAPE',
          `${entityName}.${field} must contain a valid ID or ID array.`,
          `${entityName}[${index}].${field}`
        )
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Scalar/date/numeric validation                                             */
/* -------------------------------------------------------------------------- */

function validateScores(
  record,
  entityName,
  index
) {
  const errors = [];

  SCORE_FIELDS.forEach(
    field => {
      const value =
        record?.[field];

      if (
        value ===
          undefined ||
        value === null
      ) {
        return;
      }

      if (
        typeof value !==
          'number' ||
        !Number.isFinite(
          value
        ) ||
        value < 0 ||
        value > 10
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_SCORE',
            `${field} must be a finite number from 0 to 10.`,
            `${entityName}[${index}].${field}`
          )
        );
      }
    }
  );

  return errors;
}

function validateNumericFields(
  record,
  entityName,
  index
) {
  const errors = [];

  if (
    !isObject(record)
  ) {
    return errors;
  }

  for (
    const [
      field,
      value
    ] of Object.entries(
      record
    )
  ) {
    if (
      NON_NEGATIVE_NUMERIC_FIELDS.has(
        field
      )
    ) {
      if (
        value ===
          undefined ||
        value === null
      ) {
        continue;
      }

      if (
        typeof value !==
          'number' ||
        !Number.isFinite(
          value
        ) ||
        value < 0
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_NUMERIC_FIELD',
            `${field} must be a finite non-negative number.`,
            `${entityName}[${index}].${field}`
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
        value ===
          undefined ||
        value === null
      ) {
        continue;
      }

      if (
        typeof value !==
          'number' ||
        !Number.isFinite(
          value
        ) ||
        value < 0 ||
        value > 100
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_PERCENTAGE',
            `${field} must be a number from 0 to 100.`,
            `${entityName}[${index}].${field}`
          )
        );
      }
    }
  }

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

  const date =
    new Date(
      value
    );

  return (
    !Number.isNaN(
      date.getTime()
    ) &&
    /^\d{4}-\d{2}-\d{2}/.test(
      value.trim()
    )
  );
}

function validateDateFields(
  record,
  entityName,
  index
) {
  const errors = [];

  if (
    !isObject(record)
  ) {
    return errors;
  }

  for (
    const field of DATE_FIELDS
  ) {
    const value =
      record[field];

    if (
      value ===
        undefined ||
      value === null ||
      value === ''
    ) {
      continue;
    }

    if (
      !isValidDateString(
        value
      )
    ) {
      errors.push(
        issue(
          'ERROR',
          'INVALID_DATE',
          `${field} must be a valid ISO-like date string (YYYY-MM-DD...).`,
          `${entityName}[${index}].${field}`
        )
      );
    }
  }

  return errors;
}

function compareDates(
  from,
  to
) {
  if (
    !isValidDateString(from) ||
    !isValidDateString(to)
  ) {
    return null;
  }

  return (
    new Date(
      from
    ).getTime() <=
    new Date(
      to
    ).getTime()
  );
}

function validateDateRanges(
  record,
  entityName,
  index
) {
  const errors = [];

  if (
    !isObject(record)
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
        record[fromField];

      const to =
        record[toField];

      if (
        from ===
          undefined ||
        from === null ||
        to ===
          undefined ||
        to === null
      ) {
        return;
      }

      const valid =
        compareDates(
          from,
          to
        );

      if (
        valid === false
      ) {
        errors.push(
          issue(
            'ERROR',
            'INCONSISTENT_EFFECTIVE_DATES',
            `${fromField} cannot be later than ${toField}.`,
            `${entityName}[${index}]`
          )
        );
      }
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Confidence/status/localization validation                                  */
/* -------------------------------------------------------------------------- */

function validateConfidence(
  record,
  entityName,
  index
) {
  const errors = [];

  if (
    !isObject(record)
  ) {
    return errors;
  }

  const confidence =
    record.confidence;

  if (
    confidence ===
      undefined ||
    confidence ===
      null
  ) {
    return errors;
  }

  if (
    typeof confidence !==
    'string'
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_CONFIDENCE',
        'confidence must be a string.',
        `${entityName}[${index}].confidence`
      )
    );

    return errors;
  }

  if (
    !VALID_CONFIDENCE.has(
      confidence
        .trim()
        .toUpperCase()
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_CONFIDENCE',
        `Invalid confidence "${confidence}".`,
        `${entityName}[${index}].confidence`
      )
    );
  }

  return errors;
}

function validateStatus(
  record,
  entityName,
  index
) {
  const errors = [];

  if (
    !isObject(record)
  ) {
    return errors;
  }

  const status =
    record.status ??
    record.currentStatus;

  if (
    status ===
      undefined ||
    status ===
      null
  ) {
    return errors;
  }

  if (
    typeof status !==
    'string'
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_STATUS',
        'status/currentStatus must be a string.',
        `${entityName}[${index}].status`
      )
    );
  }

  return errors;
}

function validateLocalizedValue(
  value,
  path,
  {
    supportedLocales = null,
    allowPlainString = true
  } = {}
) {
  const errors = [];

  if (
    value ===
      undefined ||
    value === null
  ) {
    return errors;
  }

  if (
    typeof value ===
      'string'
  ) {
    if (
      allowPlainString &&
      value.trim()
    ) {
      return errors;
    }

    errors.push(
      issue(
        'ERROR',
        'INVALID_LOCALIZED_VALUE',
        'Localized value must be a non-empty string.',
        path
      )
    );

    return errors;
  }

  if (
    !isObject(value)
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_LOCALIZED_VALUE',
        'Localized value must be a string or locale map.',
        path
      )
    );

    return errors;
  }

  const entries =
    Object.entries(
      value
    );

  if (
    entries.length === 0
  ) {
    errors.push(
      issue(
        'ERROR',
        'EMPTY_LOCALIZED_VALUE',
        'Localized value cannot be an empty object.',
        path
      )
    );

    return errors;
  }

  entries.forEach(
    ([
      locale,
      text
    ]) => {
      if (
        !/^[a-z]{2,3}(?:-[A-Z][a-zA-Z]{2,})?$/.test(
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
        errors.push(
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

  return errors;
}

function validateLocalizedFields(
  record,
  entityName,
  index,
  supportedLocales
) {
  const errors = [];

  if (
    !isObject(record)
  ) {
    return errors;
  }

  const localizedFields =
    [
      'name',
      'localizedName',
      'title',
      'localizedTitle',
      'description',
      'localizedDescription',
      'shortName',
      'nativeName'
    ];

  localizedFields.forEach(
    field => {
      if (
        record[field] ===
          undefined
      ) {
        return;
      }

      errors.push(
        ...validateLocalizedValue(
          record[field],
          `${entityName}[${index}].${field}`,
          {
            supportedLocales
          }
        )
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Job validation                                                             */
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
    !Array.isArray(jobs)
  ) {
    return errors;
  }

  jobs.forEach(
    (job, index) => {
      if (
        !isObject(job)
      ) {
        return;
      }

      const eligibility =
        job.eligibilityStatus ??
        job.baEligibility;

      if (
        eligibility !==
          undefined &&
        eligibility !==
          null
      ) {
        const normalized =
          String(
            eligibility
          )
            .trim()
            .toUpperCase();

        /*
         * Backward compatibility:
         * legacy A/B/C values are accepted but produce a warning because
         * canonical eligibility is now rule-driven.
         */
        if (
          /^[ABC](?:\s|$)/i.test(
            String(
              eligibility
            )
          )
        ) {
          warnings.push(
            issue(
              'WARNING',
              'LEGACY_ELIGIBILITY_FIELD',
              'Legacy A/B/C eligibility is present; canonical eligibility must be resolved from eligibility rules.',
              `jobs[${index}].baEligibility`
            )
          );
        } else if (
          !VALID_JOB_ELIGIBILITY.has(
            normalized
          )
        ) {
          errors.push(
            issue(
              'ERROR',
              'INVALID_ELIGIBILITY_STATUS',
              `Invalid job eligibility status "${String(
                eligibility
              )}".`,
              `jobs[${index}].eligibilityStatus`
            )
          );
        }
      }

      errors.push(
        ...validateConfidence(
          job,
          'jobs',
          index
        )
      );

      errors.push(
        ...validateStatus(
          job,
          'jobs',
          index
        )
      );

      errors.push(
        ...validateScores(
          job,
          'jobs',
          index
        )
      );

      errors.push(
        ...validateNumericFields(
          job,
          'jobs',
          index
        )
      );

      errors.push(
        ...validateDateFields(
          job,
          'jobs',
          index
        )
      );

      errors.push(
        ...validateDateRanges(
          job,
          'jobs',
          index
        )
      );

      const startingBasic =
        job.startingBasic;

      const maximumBasic =
        job.maximumBasic;

      if (
        startingBasic !==
          undefined &&
        startingBasic !==
          null &&
        maximumBasic !==
          undefined &&
        maximumBasic !==
          null &&
        typeof startingBasic ===
          'number' &&
        typeof maximumBasic ===
          'number' &&
        startingBasic >
          maximumBasic
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_PAY_RANGE',
            'startingBasic cannot exceed maximumBasic.',
            `jobs[${index}]`
          )
        );
      }

      if (
        !Array.isArray(
          job.sourceIds
        ) &&
        job.sourceIds !==
          undefined &&
        job.sourceIds !==
          null
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_SOURCE_IDS',
            'sourceIds must be an array when provided.',
            `jobs[${index}].sourceIds`
          )
        );
      }

      if (
        options.requireSources &&
        !Array.isArray(
          job.sourceIds
        )
      ) {
        warnings.push(
          issue(
            'WARNING',
            'MISSING_SOURCE_IDS',
            'Job does not contain sourceIds.',
            `jobs[${index}].sourceIds`
          )
        );
      }
    }
  );

  /*
   * Warnings are deliberately not returned from the legacy validateJobs()
   * signature. validateDatabase() performs the complete warning-aware pass.
   */
  void warnings;

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Exam validation                                                            */
/* -------------------------------------------------------------------------- */

function validateExams(
  exams
) {
  const errors = [];

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
    !Array.isArray(exams)
  ) {
    return errors;
  }

  exams.forEach(
    (exam, index) => {
      if (
        !isObject(exam)
      ) {
        return;
      }

      if (
        exam.year !==
          undefined &&
        exam.year !==
          null &&
        (
          !Number.isInteger(
            exam.year
          ) ||
          exam.year <
            1900 ||
          exam.year >
            2200
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_YEAR',
            'Exam year must be a valid integer between 1900 and 2200.',
            `exams[${index}].year`
          )
        );
      }

      errors.push(
        ...validateDateFields(
          exam,
          'exams',
          index
        )
      );

      errors.push(
        ...validateDateRanges(
          exam,
          'exams',
          index
        )
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Service-cadre validation                                                   */
/* -------------------------------------------------------------------------- */

function validateServiceCadres(
  serviceCadres
) {
  const errors = [];

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
    return errors;
  }

  serviceCadres.forEach(
    (
      record,
      index
    ) => {
      if (
        !isObject(record)
      ) {
        return;
      }

      errors.push(
        ...validateConfidence(
          record,
          'serviceCadres',
          index
        )
      );

      errors.push(
        ...validateDateFields(
          record,
          'serviceCadres',
          index
        )
      );

      errors.push(
        ...validateDateRanges(
          record,
          'serviceCadres',
          index
        )
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Eligibility-rule validation                                                */
/* -------------------------------------------------------------------------- */

function validateEligibilityRules(
  rules
) {
  const errors = [];

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
    !Array.isArray(rules)
  ) {
    return errors;
  }

  rules.forEach(
    (rule, index) => {
      if (
        !isObject(rule)
      ) {
        return;
      }

      if (
        rule.ruleClass !==
          undefined &&
        rule.ruleClass !==
          null
      ) {
        if (
          typeof rule.ruleClass !==
          'string' ||
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
              `Invalid ruleClass "${String(
                rule.ruleClass
              )}".`,
              `eligibilityRules[${index}].ruleClass`
            )
          );
        }
      }

      if (
        rule.minimumAge !==
          undefined &&
        rule.maximumAge !==
          undefined &&
        typeof rule.minimumAge ===
          'number' &&
        typeof rule.maximumAge ===
          'number' &&
        rule.minimumAge >
          rule.maximumAge
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_AGE_RANGE',
            'minimumAge cannot exceed maximumAge.',
            `eligibilityRules[${index}]`
          )
        );
      }

      if (
        rule.minimumPercentage !==
          undefined &&
        rule.maximumPercentage !==
          undefined &&
        typeof rule.minimumPercentage ===
          'number' &&
        typeof rule.maximumPercentage ===
          'number' &&
        rule.minimumPercentage >
          rule.maximumPercentage
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_PERCENTAGE_RANGE',
            'minimumPercentage cannot exceed maximumPercentage.',
            `eligibilityRules[${index}]`
          )
        );
      }

      errors.push(
        ...validateConfidence(
          rule,
          'eligibilityRules',
          index
        )
      );

      errors.push(
        ...validateNumericFields(
          rule,
          'eligibilityRules',
          index
        )
      );

      errors.push(
        ...validateDateFields(
          rule,
          'eligibilityRules',
          index
        )
      );

      errors.push(
        ...validateDateRanges(
          rule,
          'eligibilityRules',
          index
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
            'A hard eligibility rule must contain at least one sourceId.',
            `eligibilityRules[${index}].sourceIds`
          )
        );
      }

      /*
       * A canonical rule must identify what it applies to.
       */
      const targetFields = [
        'targetId',
        'jobId',
        'serviceCadreId',
        'examId',
        'targetJobId',
        'targetServiceCadreId'
      ];

      const hasTarget =
        targetFields.some(
          field =>
            isNonEmptyString(
              rule[field]
            )
        );

      if (
        !hasTarget
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_RULE_TARGET',
            'Eligibility rule must identify at least one target job, service cadre or exam.',
            `eligibilityRules[${index}]`
          )
        );
      }

      /*
       * Rule logic should never contain an empty requirement object.
       */
      const requirementCollections = [
        rule.requirements,
        rule.conditions,
        rule.criteria,
        rule.requirementsAll,
        rule.requirementsAny
      ];

      requirementCollections.forEach(
        (
          collection,
          collectionIndex
        ) => {
          if (
            collection ===
              undefined ||
            collection ===
              null
          ) {
            return;
          }

          if (
            typeof collection !==
              'object'
          ) {
            errors.push(
              issue(
                'ERROR',
                'INVALID_RULE_REQUIREMENTS',
                'Eligibility-rule requirement structure must be an object, array or valid modeled value.',
                `eligibilityRules[${index}].requirements[${collectionIndex}]`
              )
            );
          }
        }
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Qualification validation                                                   */
/* -------------------------------------------------------------------------- */

function validateQualifications(
  qualifications
) {
  const errors = [];

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
    return errors;
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

      errors.push(
        ...validateConfidence(
          qualification,
          'qualifications',
          index
        )
      );

      errors.push(
        ...validateDateFields(
          qualification,
          'qualifications',
          index
        )
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Generic entity validation                                                  */
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

  if (
    expectedType
  ) {
    errors.push(
      ...validateEntityTypes(
        records,
        entityName,
        expectedType
      )
    );
  }

  if (
    !Array.isArray(records)
  ) {
    return errors;
  }

  records.forEach(
    (
      record,
      index
    ) => {
      if (
        !isObject(record)
      ) {
        return;
      }

      errors.push(
        ...validateConfidence(
          record,
          entityName,
          index
        )
      );

      errors.push(
        ...validateStatus(
          record,
          entityName,
          index
        )
      );

      errors.push(
        ...validateNumericFields(
          record,
          entityName,
          index
        )
      );

      errors.push(
        ...validateDateFields(
          record,
          entityName,
          index
        )
      );

      errors.push(
        ...validateDateRanges(
          record,
          entityName,
          index
        )
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Cross-namespace ID validation                                              */
/* -------------------------------------------------------------------------- */

function collectEntityIds(
  database
) {
  const result = new Map();

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
        record => {
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
            !result.has(
              id
            )
          ) {
            result.set(
              id,
              []
            );
          }

          result
            .get(id)
            .push({
              collection,
              entityType
            });
        }
      );
    }
  );

  return result;
}

function validateCrossNamespaceIds(
  database
) {
  const errors = [];
  const allIds =
    collectEntityIds(
      database
    );

  allIds.forEach(
    (
      occurrences,
      id
    ) => {
      const namespaces =
        uniqueStrings(
          occurrences.map(
            occurrence =>
              occurrence.collection
          )
        );

      /*
       * Same ID reused by multiple canonical entity collections creates
       * ambiguity for generic references, search, AI context and registry
       * lookup.
       */
      if (
        namespaces.length >
        1
      ) {
        errors.push(
          issue(
            'ERROR',
            'CROSS_NAMESPACE_ID_COLLISION',
            `ID "${id}" is used by multiple entity collections: ${namespaces.join(
              ', '
            )}.`,
            null,
            {
              id,
              occurrences
            }
          )
        );
      }
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Cross-reference validation                                                */
/* -------------------------------------------------------------------------- */

function getReferenceTargets(
  database
) {
  const targets = {};

  Object.keys(
    COLLECTION_ENTITY_TYPES
  ).forEach(
    collection => {
      targets[
        collection
      ] =
        createIdSet(
          database?.[
            collection
          ]
        );
    }
  );

  return targets;
}

function resolveTargetSet(
  targetName,
  targetIds,
  database,
  record
) {
  if (
    targetName ===
      '__TARGET__'
  ) {
    const targetSet =
      new Set();

    [
      'jobs',
      'exams',
      'serviceCadres'
    ].forEach(
      collection => {
        createIdSet(
          database?.[
            collection
          ]
        ).forEach(
          id =>
            targetSet.add(
              id
            )
        );
      }
    );

    return targetSet;
  }

  return (
    targetIds[
      targetName
    ] ||
    new Set()
  );
}

function validateMappedReferences(
  database
) {
  const errors = [];
  const targets =
    getReferenceTargets(
      database
    );

  Object.entries(
    REFERENCE_FIELD_MAP
  ).forEach(
    ([
      collection,
      fieldMap
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

      Object.entries(
        fieldMap
      ).forEach(
        ([
          field,
          targetCollection
        ]) => {
          const targetIds =
            resolveTargetSet(
              targetCollection,
              targets,
              database
            );

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
                if (
                  !isObject(
                    record
                  )
                ) {
                  return;
                }

                const value =
                  record[field];

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
                  Array.isArray(
                    value
                  )
                ) {
                  value.forEach(
                    (
                      item,
                      itemIndex
                    ) => {
                      if (
                        !isNonEmptyString(
                          item
                        ) ||
                        !targetIds.has(
                          item.trim()
                        )
                      ) {
                        errors.push(
                          issue(
                            'ERROR',
                            'BROKEN_REFERENCE',
                            `${collection}.${field} references unknown ID "${String(
                              item
                            )}".`,
                            `${collection}[${index}].${field}[${itemIndex}]`
                          )
                        );
                      }
                    }
                  );

                  return;
                }

                if (
                  isNonEmptyString(
                    value
                  )
                ) {
                  if (
                    !targetIds.has(
                      value.trim()
                    )
                  ) {
                    errors.push(
                      issue(
                        'ERROR',
                        'BROKEN_REFERENCE',
                        `${collection}.${field} references unknown ID "${value}".`,
                        `${collection}[${index}].${field}`
                      )
                    );
                  }

                  return;
                }

                errors.push(
                  issue(
                    'ERROR',
                    'INVALID_REFERENCE_SHAPE',
                    `${collection}.${field} must contain an ID or array of IDs.`,
                    `${collection}[${index}].${field}`
                  )
                );
              }
            );
          }
        }
      );
    }
  );

  /*
   * Additional cross-reference field aliases that may exist in data while
   * keeping the canonical schema intentionally flexible.
   */
  errors.push(
    ...validateReferenceArray(
      database?.eligibilityRules,
      'sourceIds',
      targets.sources,
      'eligibilityRules'
    )
  );

  errors.push(
    ...validateReferenceArray(
      database?.eligibilityRules,
      'qualificationIds',
      targets.qualifications,
      'eligibilityRules'
    )
  );

  errors.push(
    ...validateReferenceArray(
      database?.eligibilityRules,
      'requiredQualificationIds',
      targets.qualifications,
      'eligibilityRules'
    )
  );

  return errors;
}

function validateCrossReferences(
  database
) {
  return [
    ...validateMappedReferences(
      database
    )
  ];
}

/* -------------------------------------------------------------------------- */
/* Circular-reference validation                                              */
/* -------------------------------------------------------------------------- */

function validateHierarchyCycles(
  database
) {
  const errors = [];

  /*
   * Only hierarchy-like relationships are checked.
   *
   * We deliberately do NOT treat all job↔exam↔service-cadre references as
   * cycle errors because legitimate bidirectional references are expected.
   */
  const collections =
    Object.keys(
      COLLECTION_ENTITY_TYPES
    );

  collections.forEach(
    collection => {
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

      HIERARCHICAL_REFERENCE_FIELDS.forEach(
        field => {
          const graph =
            new Map();

          records.forEach(
            record => {
              if (
                !isNonEmptyString(
                  record?.id
                )
              ) {
                return;
              }

              const sourceId =
                record.id.trim();

              const value =
                record[field];

              if (
                isNonEmptyString(
                  value
                )
              ) {
                graph.set(
                  sourceId,
                  value.trim()
                );
              }
            }
          );

          /*
           * Self-reference.
           */
          graph.forEach(
            (
              targetId,
              sourceId
            ) => {
              if (
                sourceId ===
                targetId &&
                byId.has(
                  sourceId
                )
              ) {
                errors.push(
                  issue(
                    'ERROR',
                    'SELF_REFERENCE_CYCLE',
                    `${collection} record "${sourceId}" references itself through ${field}.`,
                    `${collection}.${sourceId}.${field}`
                  )
                );
              }
            }
          );

          /*
           * Multi-node directed cycle detection.
           */
          const state =
            new Map();

          function visit(
            node,
            stack = []
          ) {
            const currentState =
              state.get(
                node
              );

            if (
              currentState ===
              'VISITING'
            ) {
              const cycleStart =
                stack.indexOf(
                  node
                );

              const cycle =
                (
                  cycleStart >=
                  0
                    ? stack.slice(
                        cycleStart
                      )
                    : stack
                ).concat(
                  node
                );

              errors.push(
                issue(
                  'ERROR',
                  'CIRCULAR_REFERENCE',
                  `Circular ${field} relationship detected: ${cycle.join(
                    ' → '
                  )}.`,
                  `${collection}.${node}.${field}`,
                  {
                    collection,
                    field,
                    cycle
                  }
                )
              );

              return;
            }

            if (
              currentState ===
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
                stack.concat(
                  node
                )
              );
            }

            state.set(
              node,
              'VISITED'
            );
          }

          graph.forEach(
            (
              _target,
              source
            ) => {
              visit(
                source
              );
            }
          );
        }
      );
    }
  );

  return errors;
}

/* -------------------------------------------------------------------------- */
/* Scoring-rule validation                                                     */
/* -------------------------------------------------------------------------- */

function collectScoringRules(
  scoringRules
) {
  if (
    !Array.isArray(
      scoringRules
    )
  ) {
    return [];
  }

  return scoringRules;
}

function validateScoringRules(
  scoringRules
) {
  const errors = [];
  const warnings = [];

  const rules =
    collectScoringRules(
      scoringRules
    );

  errors.push(
    ...validateObjectRecords(
      rules,
      'scoringRules'
    )
  );

  errors.push(
    ...validateIds(
      rules,
      'scoringRules'
    )
  );

  errors.push(
    ...validateEntityTypes(
      rules,
      'scoringRules',
      'SCORING_RULE'
    )
  );

  rules.forEach(
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

      const metric =
        rule.metric ??
        rule.field ??
        rule.key ??
        rule.name;

      if (
        metric ===
          undefined ||
        metric ===
          null
      ) {
        warnings.push(
          issue(
            'WARNING',
            'SCORING_RULE_WITHOUT_METRIC',
            'Scoring rule does not explicitly identify a metric.',
            `scoringRules[${index}]`
          )
        );
      }

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
          typeof direction !==
          'string' ||
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
              `Invalid scoring metric direction "${String(
                direction
              )}".`,
              `scoringRules[${index}].direction`
            )
          );
        }
      } else {
        warnings.push(
          issue(
            'WARNING',
            'MISSING_METRIC_DIRECTION',
            'Scoring rule does not specify an explicit metric direction.',
            `scoringRules[${index}].direction`
          )
        );
      }

      if (
        rule.weight !==
          undefined &&
        (
          typeof rule.weight !==
            'number' ||
          !Number.isFinite(
            rule.weight
          )
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_SCORING_WEIGHT',
            'Scoring rule weight must be a finite number.',
            `scoringRules[${index}].weight`
          )
        );
      }

      if (
        rule.minimum !==
          undefined &&
        rule.maximum !==
          undefined &&
        typeof rule.minimum ===
          'number' &&
        typeof rule.maximum ===
          'number' &&
        rule.minimum >
          rule.maximum
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_SCORING_RANGE',
            'Scoring rule minimum cannot exceed maximum.',
            `scoringRules[${index}]`
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
/* i18n validation                                                            */
/* -------------------------------------------------------------------------- */

function collectLocales(
  i18n
) {
  if (
    !isObject(i18n)
  ) {
    return new Set();
  }

  return new Set(
    Object.keys(
      i18n
    ).filter(
      key =>
        /^[a-z]{2,3}(?:-[A-Z][a-zA-Z]{2,})?$/.test(
          key
        )
    )
  );
}

function validateI18nCatalog(
  catalog,
  locale,
  path = `i18n.${locale}`
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
        'Translation node must be a string, array or object.',
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
        !/^[a-z]{2,3}(?:-[A-Z][a-zA-Z]{2,})?$/.test(
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
          locale
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
/* Index/data validation                                                      */
/* -------------------------------------------------------------------------- */

function collectReferencedStrings(
  value,
  output = []
) {
  if (
    typeof value ===
    'string'
  ) {
    output.push(
      value
    );

    return output;
  }

  if (
    Array.isArray(
      value
    )
  ) {
    value.forEach(
      item =>
        collectReferencedStrings(
          item,
          output
        )
    );

    return output;
  }

  if (
    isObject(
      value
    )
  ) {
    Object.values(
      value
    ).forEach(
      child =>
        collectReferencedStrings(
          child,
          output
        )
    );
  }

  return output;
}

function looksLikeId(
  value
) {
  return (
    isNonEmptyString(
      value
    ) &&
    /^[a-zA-Z0-9][a-zA-Z0-9._-]{1,150}$/.test(
      value.trim()
    )
  );
}

function validateIndexShape(
  indexValue,
  indexName
) {
  const errors = [];

  if (
    !Array.isArray(
      indexValue
    ) &&
    !isObject(
      indexValue
    )
  ) {
    errors.push(
      issue(
        'ERROR',
        'INVALID_INDEX_SHAPE',
        `${indexName} must be an array or object.`,
        `indexes.${indexName}`
      )
    );
  }

  return errors;
}

function getIndexCandidateIds(
  indexValue
) {
  const ids =
    new Set();

  if (
    Array.isArray(
      indexValue
    )
  ) {
    indexValue.forEach(
      item => {
        if (
          isNonEmptyString(
            item
          )
        ) {
          ids.add(
            item.trim()
          );
        }

        if (
          isObject(
            item
          )
        ) {
          [
            'id',
            'entityId',
            'jobId',
            'examId',
            'qualificationId',
            'serviceCadreId',
            'eligibilityRuleId'
          ].forEach(
            field => {
              if (
                isNonEmptyString(
                  item[field]
                )
              ) {
                ids.add(
                  item[field].trim()
                );
              }
            }
          );

          [
            'ids',
            'entityIds',
            'jobIds',
            'examIds',
            'qualificationIds'
          ].forEach(
            field => {
              if (
                Array.isArray(
                  item[field]
                )
              ) {
                item[field].forEach(
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
        }
      }
    );

    return ids;
  }

  if (
    isObject(
      indexValue
    )
  ) {
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
            indexValue[field]
          )
        ) {
          indexValue[field].forEach(
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
      indexValue
    ).forEach(
      ([
        key,
        value
      ]) => {
        if (
          [
            'metadata',
            '_meta',
            'version',
            'generatedAt'
          ].includes(
            key
          )
        ) {
          return;
        }

        if (
          looksLikeId(
            key
          )
        ) {
          ids.add(
            key.trim()
          );
        }

        collectReferencedStrings(
          value
        ).forEach(
          stringValue => {
            if (
              looksLikeId(
                stringValue
              )
            ) {
              ids.add(
                stringValue.trim()
              );
            }
          }
        );
      }
    );
  }

  return ids;
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

  const canonicalCollections =
    {
      serviceCadre: 'serviceCadres',
      serviceCadres: 'serviceCadres',
      eligibilityRule:
        'eligibilityRules',
      eligibilityRules:
        'eligibilityRules',
      qualification:
        'qualifications',
      qualifications:
        'qualifications',
      job: 'jobs',
      jobs: 'jobs',
      exam: 'exams',
      exams: 'exams',
      department: 'departments',
      departments: 'departments',
      source: 'sources',
      sources: 'sources'
    };

  Object.entries(
    indexes
  ).forEach(
    ([
      indexName,
      indexValue
    ]) => {
      errors.push(
        ...validateIndexShape(
          indexValue,
          indexName
        )
      );

      const targetCollection =
        canonicalCollections[
          indexName
        ];

      if (
        !targetCollection
      ) {
        infos.push(
          issue(
            'INFO',
            'INDEX_DETECTED',
            `Derived index "${indexName}" is loaded.`,
            `indexes.${indexName}`
          )
        );

        return;
      }

      const canonicalIds =
        createIdSet(
          database?.[
            targetCollection
          ]
        );

      const candidateIds =
        getIndexCandidateIds(
          indexValue
        );

      const unknownIds =
        [
          ...candidateIds
        ].filter(
          id =>
            !canonicalIds.has(
              id
            )
        );

      /*
       * We only flag an ID as broken when the index clearly expresses it as
       * an entity identifier. Generic search-token strings are intentionally
       * not treated as references.
       */
      unknownIds
        .slice(
          0,
          100
        )
        .forEach(
          id => {
            warnings.push(
              issue(
                'WARNING',
                'INDEX_UNKNOWN_ID',
                `Index "${indexName}" contains ID "${id}" that is not present in ${targetCollection}.`,
                `indexes.${indexName}`,
                {
                  targetCollection,
                  id
                }
              )
            );
          }
        );

      if (
        candidateIds.size >
          0 &&
        canonicalIds.size ===
          0
      ) {
        errors.push(
          issue(
            'ERROR',
            'INDEX_WITHOUT_SOURCE_DATA',
            `Index "${indexName}" contains entries but ${targetCollection} has no loaded canonical records.`,
            `indexes.${indexName}`
          )
        );
      }

      infos.push(
        issue(
          'INFO',
          'INDEX_VALIDATED',
          `Validated derived index "${indexName}".`,
          `indexes.${indexName}`,
          {
            candidateReferences:
              candidateIds.size,
            canonicalRecords:
              canonicalIds.size
          }
        )
      );
    }
  );

  return {
    errors,
    warnings,
    infos
  };
}

/* -------------------------------------------------------------------------- */
/* Source validation                                                          */
/* -------------------------------------------------------------------------- */

function validateSourceIntegrity(
  database
) {
  const errors = [];
  const warnings = [];

  const sources =
    getArray(
      database?.sources
    );

  sources.forEach(
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
              `sources[${index}].url`
            )
          );
        }
      }

      const sourceType =
        source.sourceType ??
        source.type;

      if (
        sourceType !==
          undefined &&
        (
          typeof sourceType !==
            'string' ||
          !sourceType.trim()
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_SOURCE_TYPE',
            'Source type must be a non-empty string when provided.',
            `sources[${index}].sourceType`
          )
        );
      }

      if (
        !Array.isArray(
          source.sourceTypes
        ) &&
        Array.isArray(
          source.sourceTypeIds
        )
      ) {
        source.sourceTypeIds.forEach(
          (
            id,
            idIndex
          ) => {
            if (
              !isNonEmptyString(
                id
              )
            ) {
              errors.push(
                issue(
                  'ERROR',
                  'INVALID_SOURCE_TYPE_ID',
                  'sourceTypeIds entries must be non-empty strings.',
                  `sources[${index}].sourceTypeIds[${idIndex}]`
                )
              );
            }
          }
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
            `sources[${index}]`
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
/* Required source coverage                                                   */
/* -------------------------------------------------------------------------- */

function validateRequiredSourceCoverage(
  database,
  {
    requireSources = false
  } = {}
) {
  const errors = [];
  const warnings = [];

  const sourceBearingCollections =
    [
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
      const records =
        getArray(
          database?.[
            collection
          ]
        );

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

          /*
           * Hard eligibility rules are always fatal without source coverage;
           * other entities can be handled as warnings unless strict mode is
           * explicitly requested.
           */
          if (
            collection ===
              'eligibilityRules' &&
            record.ruleClass ===
              'HARD'
          ) {
            errors.push(
              issue(
                'ERROR',
                'HARD_RULE_WITHOUT_SOURCE',
                'Hard eligibility rule must have sourceIds.',
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
/* Required-field/entity completeness                                         */
/* -------------------------------------------------------------------------- */

function validateRequiredEntityFields(
  database
) {
  const errors = [];
  const warnings = [];

  const requirements =
    {
      jobs: [
        'id'
      ],

      exams: [
        'id'
      ],

      serviceCadres: [
        'id'
      ],

      eligibilityRules: [
        'id',
        'ruleClass'
      ],

      qualifications: [
        'id'
      ],

      sources: [
        'id'
      ]
    };

  Object.entries(
    requirements
  ).forEach(
    ([
      collection,
      fields
    ]) => {
      const records =
        getArray(
          database?.[
            collection
          ]
        );

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

          fields.forEach(
            field => {
              if (
                field ===
                  'id'
              ) {
                /*
                 * validateIds() handles IDs.
                 */
                return;
              }

              if (
                record[field] ===
                  undefined ||
                record[field] ===
                  null ||
                record[field] ===
                  ''
              ) {
                warnings.push(
                  issue(
                    'WARNING',
                    'MISSING_RECOMMENDED_FIELD',
                    `${collection} record does not contain recommended field "${field}".`,
                    `${collection}[${index}].${field}`
                  )
                );
              }
            }
          );
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
/* Database collection validation                                              */
/* -------------------------------------------------------------------------- */

function validateAllCollections(
  database,
  {
    supportedLocales = null
  } = {}
) {
  const errors = [];
  const warnings = [];

  const specialValidators =
    {
      jobs: validateJobs,
      exams: validateExams,
      serviceCadres:
        validateServiceCadres,
      eligibilityRules:
        validateEligibilityRules,
      qualifications:
        validateQualifications
    };

  Object.entries(
    COLLECTION_ENTITY_TYPES
  ).forEach(
    ([
      collection
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
        errors.push(
          ...specialValidators[
            collection
          ](
            records
          )
        );
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
            if (
              !isObject(
                record
              )
            ) {
              return;
            }

            /*
             * Localization validation is intentionally applied only when
             * actual localized fields exist.
             */
            errors.push(
              ...validateLocalizedFields(
                record,
                collection,
                index,
                supportedLocales
              )
            );
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

/* -------------------------------------------------------------------------- */
/* Dataset presence / completeness                                            */
/* -------------------------------------------------------------------------- */

function validateDatasetPresence(
  database
) {
  const errors = [];
  const warnings = [];
  const infos = [];

  const coreCollections =
    [
      'jobs',
      'exams',
      'qualifications'
    ];

  coreCollections.forEach(
    collection => {
      if (
        !Array.isArray(
          database?.[
            collection
          ]
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'MISSING_COLLECTION',
            `${collection} collection must be an array.`,
            collection
          )
        );
      }
    }
  );

  const optionalCollections =
    [
      'serviceCadres',
      'eligibilityRules',
      'recruitment',
      'pay',
      'locations',
      'housing',
      'promotion',
      'benefits',
      'sources',
      'departments',
      'organisations',
      'governments',
      'states'
    ];

  optionalCollections.forEach(
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
      } else if (
        !Array.isArray(
          value
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'COLLECTION_NOT_ARRAY',
            `${collection} must be an array.`,
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
/* Primary database validation                                                */
/* -------------------------------------------------------------------------- */

function validateDatabase(
  database = {},
  {
    strict = false,
    requireSources = false,
    validateIndexes: shouldValidateIndexes = true,
    validateI18n: shouldValidateI18n = true,
    detectCycles = true,
    detectCrossNamespaceCollisions = true
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
   * Determine loaded locale set before validating entity localized fields.
   */
  const supportedLocales =
    collectLocales(
      database.i18n
    );

  /* ---------------------------------------------------------------------- */
  /* Dataset presence                                                        */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Entity collections                                                       */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Cross-namespace identity                                                */
  /* ---------------------------------------------------------------------- */

  if (
    detectCrossNamespaceCollisions
  ) {
    errors.push(
      ...validateCrossNamespaceIds(
        database
      )
    );
  }

  /* ---------------------------------------------------------------------- */
  /* References                                                              */
  /* ---------------------------------------------------------------------- */

  errors.push(
    ...validateCrossReferences(
      database
    )
  );

  /* ---------------------------------------------------------------------- */
  /* Circular hierarchy references                                           */
  /* ---------------------------------------------------------------------- */

  if (
    detectCycles
  ) {
    errors.push(
      ...validateHierarchyCycles(
        database
      )
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Scoring rules                                                           */
  /* ---------------------------------------------------------------------- */

  const scoring =
    validateScoringRules(
      database.scoringRules ||
        []
    );

  errors.push(
    ...scoring.errors
  );

  warnings.push(
    ...scoring.warnings
  );

  /* ---------------------------------------------------------------------- */
  /* Indexes                                                                  */
  /* ---------------------------------------------------------------------- */

  if (
    shouldValidateIndexes
  ) {
    const indexes =
      validateIndexes(
        database
      );

    errors.push(
      ...indexes.errors
    );

    warnings.push(
      ...indexes.warnings
    );

    infos.push(
      ...indexes.infos
    );
  }

  /* ---------------------------------------------------------------------- */
  /* i18n                                                                     */
  /* ---------------------------------------------------------------------- */

  if (
    shouldValidateI18n
  ) {
    const i18n =
      validateI18n(
        database.i18n
      );

    errors.push(
      ...i18n.errors
    );

    warnings.push(
      ...i18n.warnings
    );

    infos.push(
      ...i18n.infos
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Sources                                                                  */
  /* ---------------------------------------------------------------------- */

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
    validateRequiredSourceCoverage(
      database,
      {
        requireSources:
          strict ||
          requireSources
      }
    );

  errors.push(
    ...sourceCoverage.errors
  );

  warnings.push(
    ...sourceCoverage.warnings
  );

  /* ---------------------------------------------------------------------- */
  /* Required fields                                                          */
  /* ---------------------------------------------------------------------- */

  const requiredFields =
    validateRequiredEntityFields(
      database
    );

  errors.push(
    ...requiredFields.errors
  );

  warnings.push(
    ...requiredFields.warnings
  );

  /* ---------------------------------------------------------------------- */
  /* Basic quality diagnostics                                                */
  /* ---------------------------------------------------------------------- */

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

  if (
    jobCount === 0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'NO_JOBS',
        'No job records are currently loaded.',
        'jobs'
      )
    );
  }

  if (
    examCount === 0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'NO_EXAMS',
        'No exam records are currently loaded.',
        'exams'
      )
    );
  }

  if (
    qualificationCount === 0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'NO_QUALIFICATIONS',
        'No qualification records are currently loaded.',
        'qualifications'
      )
    );
  }

  infos.push(
    issue(
      'INFO',
      'DATABASE_VALIDATION_COMPLETED',
      'Runtime database validation completed.',
      'database',
      {
        counts: {
          jobs:
            jobCount,
          exams:
            examCount,
          qualifications:
            qualificationCount,
          serviceCadres:
            getArray(
              database.serviceCadres
            ).length,
          eligibilityRules:
            getArray(
              database.eligibilityRules
            ).length,
          sources:
            getArray(
              database.sources
            ).length
        },
        strict
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
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export {
  VALID_JOB_ELIGIBILITY,
  VALID_RULE_CLASSES,
  VALID_CONFIDENCE,
  VALID_METRIC_DIRECTIONS,
  SCORE_FIELDS,

  isObject,
  issue,

  validateObjectRecords,
  validateIds,
  validateEntityTypes,

  validateReferenceArray,
  validateReferenceField,
  validateFlexibleReference,

  validateScores,
  validateNumericFields,
  validateDateFields,
  validateDateRanges,

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
  validateHierarchyCycles,

  validateScoringRules,
  validateI18n,
  validateIndexes,

  validateSourceIntegrity,
  validateRequiredSourceCoverage,
  validateRequiredEntityFields,
  validateDatasetPresence,

  validateDatabase
};

export default {
  validateDatabase,

  validateCrossReferences,
  validateCrossNamespaceIds,
  validateHierarchyCycles,

  validateJobs,
  validateExams,
  validateServiceCadres,
  validateEligibilityRules,
  validateQualifications,

  validateScoringRules,
  validateI18n,
  validateIndexes
};
