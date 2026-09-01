/**
 * GovCareer Compass
 * ============================================================
 * Runtime Database Validator
 * ============================================================
 *
 * Runtime validation complements the repository's JSON Schema
 * validation.
 *
 * Errors stop unsafe/broken data from entering the runtime
 * recommendation pipeline.
 */

const VALID_JOB_ELIGIBILITY =
  new Set([
    'DIRECT',
    'CONDITIONAL',
    'NOT_ELIGIBLE',
    'MANUAL_VERIFICATION',
    'UNKNOWN'
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

const SCORE_FIELDS =
  [
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
  ];

function isObject(
  value
) {
  return (
    value !== null &&
    typeof value ===
      'object' &&
    !Array.isArray(value)
  );
}

function issue(
  severity,
  code,
  message,
  path = null
) {
  return {
    severity,
    code,
    message,
    path
  };
}

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
        `${entityName} must be an array.`
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
      const id =
        record?.id;

      if (
        typeof id !==
          'string' ||
        !id.trim()
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

      if (
        seen.has(id)
      ) {
        errors.push(
          issue(
            'ERROR',
            'DUPLICATE_ID',
            `Duplicate ${entityName} ID "${id}".`,
            `${entityName}[${index}].id`
          )
        );

        return;
      }

      seen.add(id);
    }
  );

  return errors;
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
    new Set(
      validIds.filter(
        (id) =>
          typeof id ===
          'string'
      )
    );

  records.forEach(
    (record, index) => {
      const values =
        record?.[field];

      if (
        values === undefined ||
        values === null
      ) {
        return;
      }

      if (
        !Array.isArray(
          values
        )
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
        (value) => {
          if (
            typeof value !==
              'string' ||
            !ids.has(value)
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
    new Set(
      validIds.filter(
        (id) =>
          typeof id ===
          'string'
      )
    );

  records.forEach(
    (record, index) => {
      const value =
        record?.[field];

      if (
        value === undefined ||
        value === null ||
        value === ''
      ) {
        return;
      }

      if (
        typeof value !==
          'string' ||
        !ids.has(value)
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

function validateScores(
  record,
  entityName,
  index
) {
  const errors = [];

  SCORE_FIELDS.forEach(
    (field) => {
      const value =
        record?.[field];

      if (
        value === undefined ||
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
            `${field} must be a number from 0 to 10.`,
            `${entityName}[${index}].${field}`
          )
        );
      }
    }
  );

  return errors;
}

function validateJobs(
  jobs
) {
  const errors = [];

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
        !VALID_JOB_ELIGIBILITY.has(
          eligibility
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

      if (
        job.confidence !==
          undefined &&
        !VALID_CONFIDENCE.has(
          job.confidence
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_CONFIDENCE',
            `Invalid confidence "${String(
              job.confidence
            )}".`,
            `jobs[${index}].confidence`
          )
        );
      }

      errors.push(
        ...validateScores(
          job,
          'jobs',
          index
        )
      );

      if (
        job.startingBasic !==
          undefined &&
        (
          typeof job.startingBasic !==
            'number' ||
          job.startingBasic <
            0
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_BASIC_PAY',
            'startingBasic must be a non-negative number.',
            `jobs[${index}].startingBasic`
          )
        );
      }

      if (
        job.maximumBasic !==
          undefined &&
        (
          typeof job.maximumBasic !==
            'number' ||
          job.maximumBasic <
            0
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_MAXIMUM_PAY',
            'maximumBasic must be a non-negative number.',
            `jobs[${index}].maximumBasic`
          )
        );
      }

      if (
        typeof job.startingBasic ===
          'number' &&
        typeof job.maximumBasic ===
          'number' &&
        job.startingBasic >
          job.maximumBasic
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
    }
  );

  return errors;
}

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
            1900
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_YEAR',
            'Exam year must be a valid integer.',
            `exams[${index}].year`
          )
        );
      }
    }
  );

  return errors;
}

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

  return errors;
}

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
        !VALID_RULE_CLASSES.has(
          rule.ruleClass
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

      if (
        rule.minimumAge !==
          undefined &&
        rule.maximumAge !==
          undefined &&
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

      if (
        rule.confidence !==
          undefined &&
        !VALID_CONFIDENCE.has(
          rule.confidence
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'INVALID_CONFIDENCE',
            `Invalid confidence "${String(
              rule.confidence
            )}".`,
            `eligibilityRules[${index}].confidence`
          )
        );
      }

      if (
        rule.ruleClass ===
          'HARD' &&
        !Array.isArray(
          rule.sourceIds
        )
      ) {
        errors.push(
          issue(
            'ERROR',
            'HARD_RULE_WITHOUT_SOURCE',
            'A hard eligibility rule must contain sourceIds.',
            `eligibilityRules[${index}].sourceIds`
          )
        );
      }
    }
  );

  return errors;
}

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

  return errors;
}

function validateGeneric(
  records,
  entityName
) {
  return [
    ...validateObjectRecords(
      records,
      entityName
    ),
    ...validateIds(
      records,
      entityName
    )
  ];
}

function validateCrossReferences(
  database
) {
  const errors = [];

  const jobs =
    database?.jobs || [];

  const exams =
    database?.exams || [];

  const serviceCadres =
    database?.serviceCadres ||
    [];

  const eligibilityRules =
    database?.eligibilityRules ||
    [];

  const qualifications =
    database?.qualifications ||
    [];

  const departments =
    database?.departments ||
    [];

  const organisations =
    database?.organisations ||
    [];

  const sources =
    database?.sources ||
    [];

  const jobIds =
    jobs.map(
      (item) =>
        item.id
    );

  const examIds =
    exams.map(
      (item) =>
        item.id
    );

  const serviceCadreIds =
    serviceCadres.map(
      (item) =>
        item.id
    );

  const eligibilityRuleIds =
    eligibilityRules.map(
      (item) =>
        item.id
    );

  const qualificationIds =
    qualifications.map(
      (item) =>
        item.id
    );

  const departmentIds =
    departments.map(
      (item) =>
        item.id
    );

  const organisationIds =
    organisations.map(
      (item) =>
        item.id
    );

  const sourceIds =
    sources.map(
      (item) =>
        item.id
    );

  errors.push(
    ...validateReferenceField(
      jobs,
      'departmentId',
      departmentIds,
      'jobs'
    )
  );

  errors.push(
    ...validateReferenceField(
      jobs,
      'organisationId',
      organisationIds,
      'jobs'
    )
  );

  errors.push(
    ...validateReferenceField(
      jobs,
      'serviceCadreId',
      serviceCadreIds,
      'jobs'
    )
  );

  errors.push(
    ...validateReferenceArray(
      jobs,
      'examIds',
      examIds,
      'jobs'
    )
  );

  errors.push(
    ...validateReferenceArray(
      jobs,
      'eligibilityRuleIds',
      eligibilityRuleIds,
      'jobs'
    )
  );

  errors.push(
    ...validateReferenceArray(
      jobs,
      'sourceIds',
      sourceIds,
      'jobs'
    )
  );

  errors.push(
    ...validateReferenceArray(
      exams,
      'postIds',
      jobIds,
      'exams'
    )
  );

  errors.push(
    ...validateReferenceField(
      exams,
      'serviceCadreId',
      serviceCadreIds,
      'exams'
    )
  );

  errors.push(
    ...validateReferenceArray(
      exams,
      'sourceIds',
      sourceIds,
      'exams'
    )
  );

  errors.push(
    ...validateReferenceArray(
      serviceCadres,
      'postIds',
      jobIds,
      'serviceCadres'
    )
  );

  errors.push(
    ...validateReferenceArray(
      serviceCadres,
      'examIds',
      examIds,
      'serviceCadres'
    )
  );

  errors.push(
    ...validateReferenceArray(
      serviceCadres,
      'eligibilityRuleIds',
      eligibilityRuleIds,
      'serviceCadres'
    )
  );

  errors.push(
    ...validateReferenceArray(
      serviceCadres,
      'sourceIds',
      sourceIds,
      'serviceCadres'
    )
  );

  errors.push(
    ...validateReferenceField(
      eligibilityRules,
      'targetId',
      new Set(
        [
          ...jobIds,
          ...examIds,
          ...serviceCadreIds
        ]
      ),
      'eligibilityRules'
    )
  );

  errors.push(
    ...validateReferenceArray(
      eligibilityRules,
      'qualificationIds',
      qualificationIds,
      'eligibilityRules'
    )
  );

  errors.push(
    ...validateReferenceArray(
      eligibilityRules,
      'requiredQualificationIds',
      qualificationIds,
      'eligibilityRules'
    )
  );

  errors.push(
    ...validateReferenceArray(
      eligibilityRules,
      'sourceIds',
      sourceIds,
      'eligibilityRules'
    )
  );

  return errors;
}

function validateDatabase(
  database = {}
) {
  const errors = [];
  const warnings = [];

  errors.push(
    ...validateJobs(
      database.jobs || []
    )
  );

  errors.push(
    ...validateExams(
      database.exams || []
    )
  );

  errors.push(
    ...validateServiceCadres(
      database.serviceCadres ||
        []
    )
  );

  errors.push(
    ...validateEligibilityRules(
      database.eligibilityRules ||
        []
    )
  );

  errors.push(
    ...validateQualifications(
      database.qualifications ||
        []
    )
  );

  [
    [
      'departments',
      database.departments
    ],
    [
      'organisations',
      database.organisations
    ],
    [
      'sources',
      database.sources
    ],
    [
      'governments',
      database.governments
    ],
    [
      'states',
      database.states
    ]
  ].forEach(
    ([
      entityName,
      records
    ]) => {
      errors.push(
        ...validateGeneric(
          records || [],
          entityName
        )
      );
    }
  );

  errors.push(
    ...validateCrossReferences(
      database
    )
  );

  if (
    (
      database.jobs ||
      []
    ).length === 0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'NO_JOBS',
        'No job records are currently loaded.'
      )
    );
  }

  if (
    (
      database.exams ||
      []
    ).length === 0
  ) {
    warnings.push(
      issue(
        'WARNING',
        'NO_EXAMS',
        'No exam records are currently loaded.'
      )
    );
  }

  return {
    valid:
      errors.length === 0,

    errors,

    warnings,

    counts: {
      errors:
        errors.length,

      warnings:
        warnings.length
    }
  };
}

export {
  validateObjectRecords,
  validateIds,
  validateReferenceArray,
  validateReferenceField,
  validateJobs,
  validateExams,
  validateServiceCadres,
  validateEligibilityRules,
  validateQualifications,
  validateCrossReferences,
  validateDatabase
};

export default {
  validateDatabase,
  validateCrossReferences,
  validateJobs,
  validateExams,
  validateServiceCadres,
  validateEligibilityRules,
  validateQualifications
};
