/**
 * GovCareer Compass
 * Runtime Data Validator
 *
 * Purpose:
 * - validate loaded JSON before it reaches application logic;
 * - detect duplicate IDs;
 * - detect broken relationships;
 * - detect obviously invalid score ranges;
 * - distinguish errors from warnings.
 *
 * This is intentionally a runtime validator.
 * Full JSON-Schema validation remains a repository/build concern.
 */

const VALID_JOB_ELIGIBILITY = new Set([
  'DIRECT',
  'CONDITIONAL',
  'NOT_ELIGIBLE',
  'MANUAL_VERIFICATION',
  'UNKNOWN'
]);

const VALID_CONFIDENCE = new Set([
  'HIGH',
  'MEDIUM_HIGH',
  'MEDIUM',
  'LOW',
  'ESTIMATE',
  'NOT_VERIFIED',
  'UNKNOWN'
]);

function isObject(
  value
) {
  return (
    value !== null &&
    typeof value ===
      'object' &&
    !Array.isArray(
      value
    )
  );
}

function createIssue(
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

function validateCollectionShape(
  records,
  entityName
) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(records)) {
    errors.push(
      createIssue(
        'ERROR',
        'NOT_ARRAY',
        `${entityName} data must be an array.`
      )
    );

    return {
      valid: false,
      errors,
      warnings
    };
  }

  return {
    valid: true,
    errors,
    warnings
  };
}

function validateIds(
  records,
  entityName
) {
  const errors = [];
  const seen =
    new Map();

  records.forEach(
    (record, index) => {
      const id =
        record?.id;

      const path =
        `${entityName}[${index}].id`;

      if (
        typeof id !==
          'string' ||
        !id.trim()
      ) {
        errors.push(
          createIssue(
            'ERROR',
            'MISSING_ID',
            `${entityName} record is missing a valid ID.`,
            path
          )
        );

        return;
      }

      if (
        seen.has(id)
      ) {
        errors.push(
          createIssue(
            'ERROR',
            'DUPLICATE_ID',
            `Duplicate ${entityName} ID "${id}".`,
            path
          )
        );

        return;
      }

      seen.set(
        id,
        index
      );
    }
  );

  return errors;
}

function validateObjectRecords(
  records,
  entityName
) {
  return records
    .map(
      (record, index) => {
        if (
          !isObject(record)
        ) {
          return createIssue(
            'ERROR',
            'INVALID_RECORD',
            `${entityName} record must be an object.`,
            `${entityName}[${index}]`
          );
        }

        return null;
      }
    )
    .filter(Boolean);
}

function validateReferences(
  records,
  field,
  referenceIds,
  entityName
) {
  const errors = [];
  const validIds =
    new Set(
      referenceIds
        .filter(
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
        value ===
          undefined ||
        value === null
      ) {
        return;
      }

      const ids =
        Array.isArray(value)
          ? value
          : [value];

      ids.forEach((id) => {
        if (
          typeof id !==
            'string' ||
          !validIds.has(id)
        ) {
          errors.push(
            createIssue(
              'ERROR',
              'BROKEN_REFERENCE',
              `${entityName} references unknown ${field} ID "${String(
                id
              )}".`,
              `${entityName}[${index}].${field}`
            )
          );
        }
      });
    }
  );

  return errors;
}

function validateScore(
  record,
  field,
  {
    min = 0,
    max = 10
  } = {}
) {
  const value =
    record?.[field];

  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  if (
    typeof value !==
      'number' ||
    !Number.isFinite(
      value
    ) ||
    value < min ||
    value > max
  ) {
    return createIssue(
      'ERROR',
      'INVALID_SCORE',
      `${field} must be a number from ${min} to ${max}.`
    );
  }

  return null;
}

function validateJobRecords(
  jobs
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

  jobs.forEach(
    (job, index) => {
      if (!isObject(job)) {
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
          createIssue(
            'ERROR',
            'INVALID_ELIGIBILITY_STATUS',
            `Invalid eligibility status "${String(
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
          createIssue(
            'ERROR',
            'INVALID_CONFIDENCE',
            `Invalid confidence "${String(
              job.confidence
            )}".`,
            `jobs[${index}].confidence`
          )
        );
      }

      [
        'workLife',
        'stress',
        'physicalRisk',
        'authority',
        'familyCompatibility',
        'parentCareCompatibility',
        'kolkataStability',
        'transferBurden'
      ].forEach(
        (field) => {
          const issue =
            validateScore(
              job,
              field
            );

          if (issue) {
            issue.path =
              `jobs[${index}].${field}`;

            errors.push(
              issue
            );
          }
        }
      );

      if (
        job.startingBasic !==
          undefined &&
        job.startingBasic !==
          null &&
        (
          typeof job.startingBasic !==
            'number' ||
          job.startingBasic <
            0
        )
      ) {
        errors.push(
          createIssue(
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
        job.maximumBasic !==
          null &&
        (
          typeof job.maximumBasic !==
            'number' ||
          job.maximumBasic <
            0
        )
      ) {
        errors.push(
          createIssue(
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
          createIssue(
            'ERROR',
            'PAY_RANGE_INVALID',
            'startingBasic cannot exceed maximumBasic.',
            `jobs[${index}]`
          )
        );
      }

      if (
        !job.sourceIds?.length &&
        !job.sources?.length
      ) {
        warnings.push(
          createIssue(
            'WARNING',
            'NO_SOURCE_REFERENCE',
            'Job has no source reference.',
            `jobs[${index}]`
          )
        );
      }
    }
  );

  return {
    valid:
      errors.length === 0,
    errors,
    warnings
  };
}

function validateExamRecords(
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

  exams.forEach(
    (exam, index) => {
      if (!isObject(exam)) {
        return;
      }

      if (
        exam.sourceIds &&
        !Array.isArray(
          exam.sourceIds
        )
      ) {
        errors.push(
          createIssue(
            'ERROR',
            'INVALID_SOURCE_IDS',
            'sourceIds must be an array.',
            `exams[${index}].sourceIds`
          )
        );
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
          createIssue(
            'ERROR',
            'INVALID_EXAM_YEAR',
            'Exam year must be a valid integer.',
            `exams[${index}].year`
          )
        );
      }

      if (
        !exam.postIds?.length &&
        !exam.jobIds?.length
      ) {
        warnings.push(
          createIssue(
            'WARNING',
            'NO_POST_MAPPING',
            'Exam has no mapped post IDs.',
            `exams[${index}]`
          )
        );
      }
    }
  );

  return {
    valid:
      errors.length === 0,
    errors,
    warnings
  };
}

function validateGenericRecords(
  records,
  entityName
) {
  const errors = [
    ...validateObjectRecords(
      records,
      entityName
    ),
    ...validateIds(
      records,
      entityName
    )
  ];

  return {
    valid:
      errors.length === 0,
    errors,
    warnings: []
  };
}

function validateCrossReferences(
  {
    jobs = [],
    exams = [],
    departments = [],
    organisations = [],
    sources = []
  } = {}
) {
  const errors = [];
  const warnings = [];

  const examIds =
    exams.map(
      (item) => item.id
    );

  const departmentIds =
    departments.map(
      (item) => item.id
    );

  const organisationIds =
    organisations.map(
      (item) => item.id
    );

  const sourceIds =
    sources.map(
      (item) => item.id
    );

  jobs.forEach(
    (job, index) => {
      errors.push(
        ...validateReferences(
          [job],
          'examIds',
          examIds,
          'jobs'
        ).map(
          (issue) => ({
            ...issue,
            path:
              `jobs[${index}].${issue.path ?? 'examIds'}`
          })
        )
      );

      errors.push(
        ...validateReferences(
          [job],
          'departmentId',
          departmentIds,
          'jobs'
        )
      );

      errors.push(
        ...validateReferences(
          [job],
          'organisationId',
          organisationIds,
          'jobs'
        )
      );

      errors.push(
        ...validateReferences(
          [job],
          'sourceIds',
          sourceIds,
          'jobs'
        )
      );
    }
  );

  exams.forEach(
    (exam, index) => {
      errors.push(
        ...validateReferences(
          [exam],
          'sourceIds',
          sourceIds,
          'exams'
        ).map(
          (issue) => ({
            ...issue,
            path:
              `exams[${index}].${issue.path ?? 'sourceIds'}`
          })
        )
      );
    }
  );

  if (
    !jobs.length &&
    !exams.length
  ) {
    warnings.push(
      createIssue(
        'WARNING',
        'EMPTY_DATABASE',
        'No jobs or exams are currently loaded.'
      )
    );
  }

  return {
    valid:
      errors.length === 0,
    errors,
    warnings
  };
}

function validateDatabase(
  database
) {
  const errors = [];
  const warnings = [];

  const validators = {
    jobs: validateJobRecords,
    exams: validateExamRecords,
    departments:
      (records) =>
        validateGenericRecords(
          records,
          'departments'
        ),
    organisations:
      (records) =>
        validateGenericRecords(
          records,
          'organisations'
        ),
    sources:
      (records) =>
        validateGenericRecords(
          records,
          'sources'
        ),
    governments:
      (records) =>
        validateGenericRecords(
          records,
          'governments'
        ),
    states:
      (records) =>
        validateGenericRecords(
          records,
          'states'
        )
  };

  Object.entries(
    database || {}
  ).forEach(
    ([key, records]) => {
      const validator =
        validators[key];

      if (!validator) {
        return;
      }

      const result =
        validator(
          Array.isArray(
            records
          )
            ? records
            : []
        );

      errors.push(
        ...result.errors
      );

      warnings.push(
        ...result.warnings
      );
    }
  );

  const crossReference =
    validateCrossReferences(
      database
    );

  errors.push(
    ...crossReference.errors
  );

  warnings.push(
    ...crossReference.warnings
  );

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
  validateCollectionShape,
  validateIds,
  validateObjectRecords,
  validateReferences,
  validateJobRecords,
  validateExamRecords,
  validateGenericRecords,
  validateCrossReferences,
  validateDatabase
};

export default {
  validateDatabase,
  validateCrossReferences,
  validateJobRecords,
  validateExamRecords
};
