/**
 * GovCareer Compass
 * ============================================================
 * CANONICAL HARD ELIGIBILITY ENGINE
 * ============================================================
 *
 * Purpose
 * -------
 * The single source of truth for deterministic candidate eligibility.
 *
 * It evaluates canonical eligibility-rule records against:
 *   - candidate profile;
 *   - job / exam / service-cadre target;
 *   - qualification registry when available;
 *   - current recruitment context when available.
 *
 * It does NOT:
 *   - rank careers;
 *   - score preferences;
 *   - infer missing requirements;
 *   - use AI or generic job knowledge as an authority;
 *   - use legacy `baEligibility` as a decision source.
 *
 * Result states
 * -------------
 *   DIRECT
 *   CONDITIONAL
 *   NOT_ELIGIBLE
 *   REVIEW_REQUIRED
 *
 * Compatibility
 * -------------
 * `MANUAL_VERIFICATION` remains an exported compatibility alias for
 * `REVIEW_REQUIRED`. The canonical emitted status is REVIEW_REQUIRED.
 *
 * Deterministic rule model
 * ------------------------
 * A canonical rule is evaluated in this order:
 *
 *   1. rule structure
 *   2. HARD/SOFT classification
 *   3. effective date
 *   4. recruitment applicability
 *   5. logical child rules, if any
 *   6. condition-specific evaluator
 *   7. rule effect
 *   8. rule exceptions
 *   9. auditable trace generation
 *
 * Missing information never becomes a guessed pass.
 */

import registry from '../database/registry.js';
import {
  cleanString,
  cleanArray,
  normalizeIdArray
} from '../database/normalizer.js';

const RESULT = Object.freeze({
  DIRECT: 'DIRECT',
  CONDITIONAL: 'CONDITIONAL',
  NOT_ELIGIBLE: 'NOT_ELIGIBLE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  UNKNOWN: 'UNKNOWN',

  /*
   * Backward-compatible alias.
   *
   * DO NOT emit "MANUAL_VERIFICATION" as the canonical status.
   * Existing callers that reference ELIGIBILITY_RESULT.MANUAL_VERIFICATION
   * will still receive the canonical REVIEW_REQUIRED value.
   */
  MANUAL_VERIFICATION: 'REVIEW_REQUIRED'
});

const RULE_CLASS = Object.freeze({
  HARD: 'HARD',
  SOFT: 'SOFT'
});

const EFFECT = Object.freeze({
  ALLOW: 'ALLOW',
  DENY: 'DENY',
  REQUIRE_VERIFICATION: 'REQUIRE_VERIFICATION',
  CONDITIONAL: 'CONDITIONAL',
  MODIFY: 'MODIFY'
});

const OPERATORS = Object.freeze({
  EQ: 'EQ',
  NEQ: 'NEQ',
  GT: 'GT',
  GTE: 'GTE',
  LT: 'LT',
  LTE: 'LTE',
  IN: 'IN',
  NOT_IN: 'NOT_IN',
  HAS: 'HAS',
  NOT_HAS: 'NOT_HAS',
  ALL_OF: 'ALL_OF',
  ANY_OF: 'ANY_OF',
  NONE_OF: 'NONE_OF'
});

const MISSING = Symbol('MISSING');

const MAX_REASONABLE_AGE = 150;

/* ============================================================
 * BASIC HELPERS
 * ========================================================== */

function isObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function clone(value) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch {
      // Fall through.
    }
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return value;
  }
}

function asArray(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return [];
  }

  return Array.isArray(value)
    ? value
    : [value];
}

function compactUnique(values) {
  return [
    ...new Set(
      asArray(values)
        .filter(
          (value) =>
            value !== undefined &&
            value !== null &&
            value !== ''
        )
        .map(
          (value) =>
            typeof value === 'string'
              ? value.trim()
              : value
        )
    )
  ];
}

function normalizeId(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const normalized =
    cleanString(
      value,
      ''
    ).trim();

  return normalized || null;
}

function normalizeIdList(value) {
  const normalized =
    normalizeIdArray(
      value
    );

  if (
    normalized.length
  ) {
    return normalized;
  }

  return compactUnique(
    cleanArray(
      value
    )
  );
}

function getNestedValue(
  object,
  path
) {
  if (!path) {
    return MISSING;
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
      !Object.prototype.hasOwnProperty.call(
        current,
        part
      )
    ) {
      return MISSING;
    }

    current =
      current[part];
  }

  return current;
}

function firstExistingValue(
  object,
  paths
) {
  for (
    const path of paths
  ) {
    const value =
      getNestedValue(
        object,
        path
      );

    if (
      value !== MISSING
    ) {
      return value;
    }
  }

  return MISSING;
}

function normalizeComparable(
  value
) {
  if (
    typeof value === 'string'
  ) {
    return value
      .trim()
      .toLowerCase();
  }

  return value;
}

function valuesEqual(
  actual,
  expected
) {
  if (
    typeof actual === 'string' &&
    typeof expected === 'string'
  ) {
    return (
      normalizeComparable(actual) ===
      normalizeComparable(expected)
    );
  }

  return actual === expected;
}

function normalizeBoolean(
  value
) {
  if (
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (
    typeof value !== 'string'
  ) {
    return null;
  }

  const normalized =
    value
      .trim()
      .toLowerCase();

  if (
    [
      'true',
      'yes',
      'y',
      '1'
    ].includes(
      normalized
    )
  ) {
    return true;
  }

  if (
    [
      'false',
      'no',
      'n',
      '0'
    ].includes(
      normalized
    )
  ) {
    return false;
  }

  return null;
}

function isTruthyDefined(
  value
) {
  return (
    value !== undefined &&
    value !== null &&
    value !== ''
  );
}

/* ============================================================
 * VALUE / OPERATOR EVALUATION
 * ========================================================== */

function flattenValues(
  values
) {
  const output = [];

  const visit =
    (value) => {
      if (
        Array.isArray(value)
      ) {
        value.forEach(
          visit
        );
        return;
      }

      if (
        isObject(value)
      ) {
        Object.values(
          value
        ).forEach(
          visit
        );
        return;
      }

      output.push(
        value
      );
    };

  visit(values);

  return output;
}

function compareNumbers(
  actual,
  expected,
  comparator
) {
  const a =
    Number(actual);

  const b =
    Number(expected);

  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b)
  ) {
    return null;
  }

  return comparator(
    a,
    b
  );
}

function evaluateOperator(
  actual,
  operator,
  expected
) {
  const normalizedOperator =
    cleanString(
      operator,
      ''
    )
      .trim()
      .toUpperCase();

  switch (
    normalizedOperator
  ) {
    case OPERATORS.EQ:
      if (
        Array.isArray(
          actual
        )
      ) {
        return actual.some(
          (item) =>
            valuesEqual(
              item,
              expected
            )
        );
      }

      return valuesEqual(
        actual,
        expected
      );

    case OPERATORS.NEQ:
      if (
        Array.isArray(
          actual
        )
      ) {
        return actual.every(
          (item) =>
            !valuesEqual(
              item,
              expected
            )
        );
      }

      return !valuesEqual(
        actual,
        expected
      );

    case OPERATORS.GT:
      return compareNumbers(
        actual,
        expected,
        (a, b) =>
          a > b
      );

    case OPERATORS.GTE:
      return compareNumbers(
        actual,
        expected,
        (a, b) =>
          a >= b
      );

    case OPERATORS.LT:
      return compareNumbers(
        actual,
        expected,
        (a, b) =>
          a < b
      );

    case OPERATORS.LTE:
      return compareNumbers(
        actual,
        expected,
        (a, b) =>
          a <= b
      );

    case OPERATORS.IN: {
      const expectedValues =
        flattenValues(
          expected
        );

      if (
        !expectedValues.length
      ) {
        return null;
      }

      return asArray(
        actual
      ).some(
        (actualValue) =>
          expectedValues.some(
            (item) =>
              valuesEqual(
                actualValue,
                item
              )
          )
      );
    }

    case OPERATORS.NOT_IN: {
      const expectedValues =
        flattenValues(
          expected
        );

      if (
        !expectedValues.length
      ) {
        return null;
      }

      return asArray(
        actual
      ).every(
        (actualValue) =>
          expectedValues.every(
            (item) =>
              !valuesEqual(
                actualValue,
                item
              )
          )
      );
    }

    case OPERATORS.HAS: {
      const actualValues =
        flattenValues(
          actual
        );

      const expectedValues =
        flattenValues(
          expected
        );

      if (
        !expectedValues.length
      ) {
        return null;
      }

      return expectedValues.every(
        (item) =>
          actualValues.some(
            (candidate) =>
              valuesEqual(
                candidate,
                item
              )
          )
      );
    }

    case OPERATORS.NOT_HAS: {
      const actualValues =
        flattenValues(
          actual
        );

      const expectedValues =
        flattenValues(
          expected
        );

      if (
        !expectedValues.length
      ) {
        return null;
      }

      return expectedValues.every(
        (item) =>
          actualValues.every(
            (candidate) =>
              !valuesEqual(
                candidate,
                item
              )
          )
      );
    }

    case OPERATORS.ALL_OF: {
      const actualValues =
        flattenValues(
          actual
        );

      const expectedValues =
        flattenValues(
          expected
        );

      if (
        !expectedValues.length
      ) {
        return null;
      }

      return expectedValues.every(
        (item) =>
          actualValues.some(
            (candidate) =>
              valuesEqual(
                candidate,
                item
              )
          )
      );
    }

    case OPERATORS.ANY_OF: {
      const actualValues =
        flattenValues(
          actual
        );

      const expectedValues =
        flattenValues(
          expected
        );

      if (
        !expectedValues.length
      ) {
        return null;
      }

      return expectedValues.some(
        (item) =>
          actualValues.some(
            (candidate) =>
              valuesEqual(
                candidate,
                item
              )
          )
      );
    }

    case OPERATORS.NONE_OF: {
      const actualValues =
        flattenValues(
          actual
        );

      const expectedValues =
        flattenValues(
          expected
        );

      if (
        !expectedValues.length
      ) {
        return null;
      }

      return expectedValues.every(
        (item) =>
          actualValues.every(
            (candidate) =>
              !valuesEqual(
                candidate,
                item
              )
          )
      );
    }

    default:
      return null;
  }
}

/* ============================================================
 * CANDIDATE PROFILE ACCESS
 * ========================================================== */

function getCandidateValues(
  profile,
  rule
) {
  const condition =
    cleanString(
      rule.conditionType,
      'OTHER'
    )
      .trim()
      .toUpperCase();

  const candidates = [];

  const add =
    (paths) => {
      for (
        const path of paths
      ) {
        const value =
          getNestedValue(
            profile,
            path
          );

        if (
          value !== MISSING
        ) {
          candidates.push({
            path,
            value
          });
        }
      }
    };

  switch (
    condition
  ) {
    case 'EDUCATION_LEVEL':
      add([
        'education.level',
        'educationLevel',
        'educationLevels',
        'highestEducationLevel'
      ]);
      break;

    case 'QUALIFICATION':
      add([
        'qualifications',
        'qualificationIds',
        'education.qualificationIds'
      ]);
      break;

    case 'DEGREE':
      add([
        'degree.id',
        'degreeId',
        'degrees',
        'degreeIds',
        'education.degreeIds'
      ]);
      break;

    case 'SUBJECT':
      add([
        'subjects',
        'subjectIds',
        'education.subjectIds',
        'academic.subjectIds'
      ]);
      break;

    case 'MATHEMATICS':
      add([
        'subjects.mathematics',
        'academic.mathematics',
        'mathematics',
        'subjects.math',
        'academic.math'
      ]);
      break;

    case 'STATISTICS':
      add([
        'subjects.statistics',
        'academic.statistics',
        'statistics'
      ]);
      break;

    case 'ECONOMICS':
      add([
        'subjects.economics',
        'academic.economics',
        'economics'
      ]);
      break;

    case 'COMMERCE':
      add([
        'subjects.commerce',
        'academic.commerce',
        'commerce'
      ]);
      break;

    case 'SCIENCE':
      add([
        'subjects.science',
        'academic.science',
        'science'
      ]);
      break;

    case 'LANGUAGE':
    case 'LANGUAGES':
      add([
        'languages',
        'languageIds',
        'languageKnowledge'
      ]);
      break;

    case 'COMPUTER_KNOWLEDGE':
    case 'COMPUTER':
      add([
        'skills.computerKnowledge',
        'skills.computer',
        'computerKnowledge',
        'computerSkills'
      ]);
      break;

    case 'TYPING':
    case 'TYPING_REQUIREMENT':
      add([
        'skills.typing',
        'typing',
        'typingProficiency'
      ]);
      break;

    case 'SHORTHAND':
      add([
        'skills.shorthand',
        'shorthand',
        'shorthandProficiency'
      ]);
      break;

    case 'DRIVING_LICENCE':
    case 'DRIVING_LICENSE':
    case 'LICENCE':
    case 'LICENSE':
      add([
        'licences.driving',
        'licenses.driving',
        'drivingLicence',
        'drivingLicense',
        'licenceIds',
        'licenseIds'
      ]);
      break;

    case 'EXPERIENCE':
      add([
        'experience',
        'experiences',
        'experienceYears',
        'employment.experienceYears'
      ]);
      break;

    case 'AGE':
      add([
        'age',
        'personal.age'
      ]);
      break;

    case 'CITIZENSHIP':
      add([
        'citizenship',
        'citizenshipId',
        'nationality'
      ]);
      break;

    case 'DOMICILE':
      add([
        'domicile',
        'domicileId',
        'stateId',
        'residence.stateId',
        'address.stateId'
      ]);
      break;

    case 'RESERVATION':
    case 'CATEGORY':
      add([
        'reservation.category',
        'reservationCategory',
        'category',
        'socialCategory'
      ]);
      break;

    case 'GENDER':
      add([
        'gender',
        'personal.gender'
      ]);
      break;

    case 'PHYSICAL_STANDARD':
    case 'PHYSICAL_EFFICIENCY_TEST':
    case 'HEIGHT':
    case 'CHEST':
    case 'RUNNING':
    case 'WALKING':
    case 'CYCLING':
    case 'FITNESS':
      add([
        'physical',
        'physicalEligibility',
        'fitness'
      ]);
      break;

    case 'MEDICAL_STANDARD':
    case 'EYESIGHT':
      add([
        'medical',
        'medicalEligibility',
        'medicalFitness'
      ]);
      break;

    case 'BED':
      add([
        'qualifications.bed',
        'hasBed',
        'bed'
      ]);
      break;

    case 'DELED':
      add([
        'qualifications.deled',
        'hasDeled',
        'deled'
      ]);
      break;

    case 'BELED':
      add([
        'qualifications.beled',
        'hasBeled',
        'beled'
      ]);
      break;

    case 'ITI':
      add([
        'qualifications.iti',
        'iti',
        'itiQualifications'
      ]);
      break;

    case 'DIPLOMA':
      add([
        'qualifications.diploma',
        'diplomas',
        'diplomaIds'
      ]);
      break;

    case 'TET':
      add([
        'qualifications.tet',
        'tet',
        'tetQualified'
      ]);
      break;

    default:
      if (
        rule.profileField
      ) {
        add([
          rule.profileField
        ]);
      }

      if (
        rule.candidateField
      ) {
        add([
          rule.candidateField
        ]);
      }

      if (
        rule.field
      ) {
        add([
          rule.field
        ]);
      }
  }

  return candidates;
}

function getRuleExpectedValue(
  rule
) {
  if (
    rule.value !== undefined
  ) {
    return rule.value;
  }

  if (
    rule.requiredQualificationIds?.length
  ) {
    return rule.requiredQualificationIds;
  }

  if (
    rule.qualificationIds?.length
  ) {
    return rule.qualificationIds;
  }

  if (
    rule.requiredSubjectIds?.length
  ) {
    return rule.requiredSubjectIds;
  }

  if (
    rule.subjectIds?.length
  ) {
    return rule.subjectIds;
  }

  if (
    rule.requiredLanguages?.length
  ) {
    return rule.requiredLanguages;
  }

  if (
    rule.languages?.length
  ) {
    return rule.languages;
  }

  if (
    rule.requiredSkills?.length
  ) {
    return rule.requiredSkills;
  }

  if (
    rule.skills?.length
  ) {
    return rule.skills;
  }

  if (
    rule.requiredNationality !== undefined
  ) {
    return rule.requiredNationality;
  }

  if (
    rule.citizenship !== undefined
  ) {
    return rule.citizenship;
  }

  if (
    rule.requiredDomicile !== undefined
  ) {
    return rule.requiredDomicile;
  }

  if (
    rule.domicileRequirement !== undefined &&
    !isObject(rule.domicileRequirement)
  ) {
    return rule.domicileRequirement;
  }

  if (
    rule.categoryRequirement !== undefined &&
    !isObject(rule.categoryRequirement)
  ) {
    return rule.categoryRequirement;
  }

  return undefined;
}

/* ============================================================
 * DATE / AGE
 * ========================================================== */

function parseDate(
  value
) {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? new Date(
          value.getTime()
        )
      : new Date(
          value
        );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}

function calculateAge(
  dateOfBirth,
  referenceDate = new Date()
) {
  if (!dateOfBirth) {
    return null;
  }

  const dob =
    new Date(
      `${dateOfBirth}T00:00:00`
    );

  if (
    Number.isNaN(
      dob.getTime()
    )
  ) {
    return null;
  }

  const reference =
    referenceDate instanceof Date
      ? referenceDate
      : new Date(
          referenceDate
        );

  if (
    Number.isNaN(
      reference.getTime()
    )
  ) {
    return null;
  }

  let age =
    reference.getFullYear() -
    dob.getFullYear();

  const monthDifference =
    reference.getMonth() -
    dob.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      reference.getDate() <
        dob.getDate()
    )
  ) {
    age -= 1;
  }

  return (
    age >= 0 &&
    age <= MAX_REASONABLE_AGE
  )
    ? age
    : null;
}

function getReferenceDate(
  rule,
  recruitmentContext,
  options
) {
  return (
    options?.referenceDate ??
    rule.ageReferenceDate ??
    recruitmentContext?.ageReferenceDate ??
    recruitmentContext?.cutoffDate ??
    recruitmentContext?.referenceDate ??
    new Date()
  );
}

function getCandidateDateOfBirth(
  profile
) {
  const value =
    firstExistingValue(
      profile,
      [
        'dateOfBirth',
        'personal.dateOfBirth',
        'dob',
        'personal.dob'
      ]
    );

  return value === MISSING
    ? null
    : value;
}

function getCandidateAge(
  profile,
  rule,
  recruitmentContext,
  options
) {
  const explicitAge =
    firstExistingValue(
      profile,
      [
        'age',
        'personal.age'
      ]
    );

  if (
    explicitAge !== MISSING &&
    Number.isFinite(
      Number(explicitAge)
    )
  ) {
    return {
      age:
        Number(
          explicitAge
        ),
      source:
        'profile.age',
      referenceDate:
        null
    };
  }

  const dateOfBirth =
    getCandidateDateOfBirth(
      profile
    );

  if (!dateOfBirth) {
    return {
      age: null,
      source: null,
      referenceDate: null
    };
  }

  const referenceDate =
    getReferenceDate(
      rule,
      recruitmentContext,
      options
    );

  const age =
    calculateAge(
      dateOfBirth,
      referenceDate
    );

  return {
    age,
    source:
      age === null
        ? null
        : 'dateOfBirth',
    referenceDate
  };
}

/* ============================================================
 * EDUCATION / MARKS / EXPERIENCE
 * ========================================================== */

function evaluateEducationLevelRule(
  profile,
  rule
) {
  const actual =
    firstExistingValue(
      profile,
      [
        'education.level',
        'educationLevel',
        'highestEducationLevel'
      ]
    );

  if (
    actual === MISSING
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate education level is unavailable.'
    };
  }

  const expected =
    rule.minimumEducationLevel ??
    rule.educationLevel ??
    getRuleExpectedValue(
      rule
    );

  if (
    !isTruthyDefined(
      expected
    )
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Education-level rule does not define a canonical required level.'
    };
  }

  /*
   * This hierarchy is used only when both values are recognized
   * canonical education levels. Unknown labels are never guessed.
   */
  const hierarchy = [
    'CLASS_5',
    'CLASS_8',
    'CLASS_10',
    'CLASS_12',
    'DIPLOMA',
    'GRADUATE',
    'POSTGRADUATE',
    'DOCTORATE'
  ];

  const actualToken =
    cleanString(
      actual,
      ''
    )
      .trim()
      .toUpperCase()
      .replace(
        /[ .-]+/g,
        '_'
      );

  const expectedToken =
    cleanString(
      expected,
      ''
    )
      .trim()
      .toUpperCase()
      .replace(
        /[ .-]+/g,
        '_'
      );

  const actualIndex =
    hierarchy.indexOf(
      actualToken
    );

  const expectedIndex =
    hierarchy.indexOf(
      expectedToken
    );

  if (
    actualIndex >= 0 &&
    expectedIndex >= 0
  ) {
    if (
      actualIndex >=
      expectedIndex
    ) {
      return {
        status:
          RESULT.DIRECT
      };
    }

    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        `Candidate education level ${actual} is below the required ${expected}.`
    };
  }

  const match =
    evaluateOperator(
      actual,
      rule.operator ||
        OPERATORS.EQ,
      expected
    );

  if (
    match === true
  ) {
    return {
      status:
        RESULT.DIRECT
    };
  }

  if (
    match === false
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        'Candidate education level does not satisfy the rule.'
    };
  }

  return {
    status:
      RESULT.REVIEW_REQUIRED,
    reason:
      'Education-level comparison could not be resolved deterministically.'
  };
}

function evaluateAgeRule(
  profile,
  rule,
  recruitmentContext,
  options
) {
  const {
    age,
    source,
    referenceDate
  } =
    getCandidateAge(
      profile,
      rule,
      recruitmentContext,
      options
    );

  if (
    !Number.isFinite(
      Number(age)
    )
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate age could not be established from the available profile information.',
      details: {
        referenceDate:
          referenceDate ?? null
      }
    };
  }

  const numericAge =
    Number(age);

  let maximumAge =
    rule.maximumAge !== undefined
      ? Number(
          rule.maximumAge
        )
      : null;

  let ageRelaxationApplied =
    null;

  /*
   * Age relaxation is applied BEFORE the maximum-age comparison.
   * This fixes the common error where a candidate was rejected against
   * the base maximum before the relaxation could ever be considered.
   */
  if (
    maximumAge !== null &&
    rule.ageRelaxations &&
    isObject(
      rule.ageRelaxations
    )
  ) {
    const rawCategory =
      firstExistingValue(
        profile,
        [
          'reservation.category',
          'reservationCategory',
          'category',
          'socialCategory'
        ]
      );

    if (
      rawCategory !== MISSING
    ) {
      const candidateCategory =
        normalizeComparable(
          rawCategory
        );

      const relaxation =
        Object.entries(
          rule.ageRelaxations
        ).find(
          ([category]) =>
            normalizeComparable(
              category
            ) ===
            candidateCategory
        );

      if (
        relaxation
      ) {
        const years =
          Number(
            relaxation[1] || 0
          );

        if (
          Number.isFinite(
            years
          )
        ) {
          maximumAge +=
            years;

          ageRelaxationApplied = {
            category:
              relaxation[0],
            years
          };
        }
      }
    }
  }

  if (
    rule.minimumAge !== undefined &&
    numericAge <
      Number(
        rule.minimumAge
      )
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        `Candidate age ${numericAge} is below the minimum age requirement of ${rule.minimumAge}.`,
      details: {
        age:
          numericAge,
        source,
        referenceDate:
          referenceDate ?? null,
        ageRelaxationApplied
      }
    };
  }

  if (
    maximumAge !== null &&
    numericAge >
      maximumAge
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        `Candidate age ${numericAge} exceeds the applicable maximum age of ${maximumAge}.`,
      details: {
        age:
          numericAge,
        source,
        referenceDate:
          referenceDate ?? null,
        ageRelaxationApplied
      }
    };
  }

  return {
    status:
      RESULT.DIRECT,
    details: {
      age:
        numericAge,
      source,
      referenceDate:
        referenceDate ?? null,
      ageRelaxationApplied
    }
  };
}

function getMarks(
  profile
) {
  return firstExistingValue(
    profile,
    [
      'percentage',
      'education.percentage',
      'academic.percentage',
      'marks.percentage',
      'marks'
    ]
  );
}

function getRawMarks(
  profile
) {
  return firstExistingValue(
    profile,
    [
      'marks',
      'education.marks',
      'academic.marks'
    ]
  );
}

function evaluateMarksRule(
  profile,
  rule
) {
  const rawPercentage =
    getMarks(
      profile
    );

  const rawMarks =
    getRawMarks(
      profile
    );

  const percentage =
    Number(
      rawPercentage ===
        MISSING
        ? NaN
        : rawPercentage
    );

  const marks =
    Number(
      rawMarks ===
        MISSING
        ? NaN
        : rawMarks
    );

  if (
    rule.minimumPercentage !==
    undefined
  ) {
    if (
      !Number.isFinite(
        percentage
      )
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'Required percentage information is unavailable.'
      };
    }

    if (
      percentage <
      Number(
        rule.minimumPercentage
      )
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          `Candidate percentage ${percentage}% is below the required ${rule.minimumPercentage}%.`
      };
    }
  }

  if (
    rule.maximumPercentage !==
    undefined
  ) {
    if (
      !Number.isFinite(
        percentage
      )
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'Required percentage information is unavailable.'
      };
    }

    if (
      percentage >
      Number(
        rule.maximumPercentage
      )
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          `Candidate percentage ${percentage}% exceeds the permitted maximum of ${rule.maximumPercentage}%.`
      };
    }
  }

  if (
    rule.minimumMarks !==
    undefined
  ) {
    if (
      !Number.isFinite(
        marks
      )
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'Required marks information is unavailable.'
      };
    }

    if (
      marks <
      Number(
        rule.minimumMarks
      )
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          `Candidate marks ${marks} are below the required ${rule.minimumMarks}.`
      };
    }
  }

  if (
    rule.maximumMarks !==
    undefined
  ) {
    if (
      !Number.isFinite(
        marks
      )
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'Required marks information is unavailable.'
      };
    }

    if (
      marks >
      Number(
        rule.maximumMarks
      )
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          `Candidate marks ${marks} exceed the permitted maximum of ${rule.maximumMarks}.`
      };
    }
  }

  return {
    status:
      RESULT.DIRECT,
    details: {
      percentage:
        Number.isFinite(
          percentage
        )
          ? percentage
          : null,
      marks:
        Number.isFinite(
          marks
        )
          ? marks
          : null
    }
  };
}

function evaluateExperienceRule(
  profile,
  rule
) {
  const rawYears =
    firstExistingValue(
      profile,
      [
        'experienceYears',
        'experience.years',
        'employment.experienceYears',
        'experience'
      ]
    );

  if (
    rawYears === MISSING
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Required experience information is unavailable.'
    };
  }

  let actualYears =
    Number(
      rawYears
    );

  if (
    isObject(
      rawYears
    )
  ) {
    actualYears =
      Number(
        rawYears.years ??
        rawYears.totalYears
      );
  }

  if (
    !Number.isFinite(
      actualYears
    )
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate experience could not be converted into a deterministic number of years.'
    };
  }

  if (
    rule.minimumExperienceYears !==
      undefined &&
    actualYears <
      Number(
        rule.minimumExperienceYears
      )
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        `Candidate experience of ${actualYears} years is below the required ${rule.minimumExperienceYears} years.`
    };
  }

  if (
    rule.maximumExperienceYears !==
      undefined &&
    actualYears >
      Number(
        rule.maximumExperienceYears
      )
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        `Candidate experience of ${actualYears} years exceeds the permitted maximum of ${rule.maximumExperienceYears} years.`
    };
  }

  if (
    rule.requiredExperience &&
    isObject(
      rule.requiredExperience
    )
  ) {
    const minimum =
      Number(
        rule.requiredExperience.minimumYears ??
        rule.requiredExperience.years
      );

    if (
      Number.isFinite(
        minimum
      ) &&
      actualYears <
        minimum
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          `Candidate experience of ${actualYears} years is below the required ${minimum} years.`
      };
    }
  }

  return {
    status:
      RESULT.DIRECT,
    details: {
      experienceYears:
        actualYears
    }
  };
}

/* ============================================================
 * QUALIFICATION REGISTRY
 * ========================================================== */

function getQualificationRecord(
  id
) {
  const normalizedId =
    normalizeId(
      id
    );

  if (!normalizedId) {
    return null;
  }

  return (
    registry.get(
      'QUALIFICATION',
      normalizedId
    ) ||
    null
  );
}

function getCandidateQualificationIds(
  profile
) {
  const raw =
    firstExistingValue(
      profile,
      [
        'qualificationIds',
        'qualifications',
        'education.qualificationIds'
      ]
    );

  if (
    raw === MISSING
  ) {
    return [];
  }

  return compactUnique(
    flattenValues(
      raw
    )
      .filter(
        (value) =>
          typeof value ===
            'string' ||
          typeof value ===
            'number'
      )
      .map(
        (value) =>
          normalizeId(
            value
          )
      )
  );
}

function getQualificationAliases(
  record
) {
  if (!record) {
    return [];
  }

  return compactUnique(
    [
      record.id,
      record.name,
      record.shortName,
      record.abbreviation,
      ...(record.aliases || []),
      ...(record.historicalNames || [])
    ]
  );
}

function qualificationMatches(
  candidateRecord,
  requiredRecord,
  requiredId
) {
  if (
    !candidateRecord
  ) {
    return false;
  }

  const candidateTokens =
    getQualificationAliases(
      candidateRecord
    ).map(
      normalizeComparable
    );

  const requiredTokens =
    compactUnique(
      [
        ...getQualificationAliases(
          requiredRecord
        ),
        requiredId
      ]
    ).map(
      normalizeComparable
    );

  return requiredTokens.some(
    (token) =>
      candidateTokens.includes(
        token
      )
  );
}

function evaluateQualificationRule(
  profile,
  rule
) {
  const requiredIds =
    compactUnique(
      [
        ...normalizeIdList(
          rule.requiredQualificationIds
        ),
        ...normalizeIdList(
          rule.qualificationIds
        ),
        ...(
          rule.minimumQualificationId
            ? [
                normalizeId(
                  rule.minimumQualificationId
                )
              ]
            : []
        )
      ]
    );

  if (
    !requiredIds.length
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Qualification rule contains no canonical qualification ID or comparison value.'
    };
  }

  const candidateIds =
    getCandidateQualificationIds(
      profile
    );

  if (
    !candidateIds.length
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate qualification information is unavailable.'
    };
  }

  const candidateRecords =
    candidateIds
      .map(
        getQualificationRecord
      )
      .filter(Boolean);

  const unresolvedCandidateIds =
    candidateIds.filter(
      (id) =>
        !getQualificationRecord(
          id
        )
    );

  const matchedRequiredIds = [];
  const missingRequiredIds = [];

  for (
    const requiredId of
      requiredIds
  ) {
    const requiredRecord =
      getQualificationRecord(
        requiredId
      );

    const matched =
      candidateIds.some(
        (candidateId) => {
          if (
            valuesEqual(
              candidateId,
              requiredId
            )
          ) {
            return true;
          }

          const candidateRecord =
            getQualificationRecord(
              candidateId
            );

          return qualificationMatches(
            candidateRecord,
            requiredRecord,
            requiredId
          );
        }
      );

    if (
      matched
    ) {
      matchedRequiredIds.push(
        requiredId
      );
    } else {
      missingRequiredIds.push(
        requiredId
      );
    }
  }

  if (
    missingRequiredIds.length === 0
  ) {
    return {
      status:
        RESULT.DIRECT,
      details: {
        requiredQualificationIds:
          requiredIds,
        matchedQualificationIds:
          matchedRequiredIds,
        unresolvedCandidateQualificationIds:
          unresolvedCandidateIds,
        candidateQualificationRecordCount:
          candidateRecords.length
      }
    };
  }

  return {
    status:
      RESULT.NOT_ELIGIBLE,
    reason:
      `Candidate does not have the required qualification(s): ${missingRequiredIds.join(', ')}.`,
    details: {
      requiredQualificationIds:
        requiredIds,
      matchedQualificationIds:
        matchedRequiredIds,
      missingQualificationIds:
        missingRequiredIds,
      unresolvedCandidateQualificationIds:
        unresolvedCandidateIds,
      candidateQualificationRecordCount:
        candidateRecords.length
    }
  };
}

/* ============================================================
 * PHYSICAL STANDARDS
 * ========================================================== */

function getPhysicalObject(
  profile
) {
  const value =
    firstExistingValue(
      profile,
      [
        'physical',
        'physicalEligibility',
        'fitness'
      ]
    );

  return (
    value !== MISSING &&
    isObject(value)
  )
    ? value
    : null;
}

function comparePhysicalField(
  physical,
  standard,
  requiredField,
  candidateFields,
  label,
  comparator = 'min'
) {
  if (
    standard[
      requiredField
    ] === undefined
  ) {
    return null;
  }

  const actualRaw =
    firstExistingValue(
      physical,
      candidateFields
    );

  if (
    actualRaw === MISSING
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        `Candidate ${label} is required for physical verification.`
    };
  }

  const actual =
    Number(
      actualRaw
    );

  const expected =
    Number(
      standard[
        requiredField
      ]
    );

  if (
    !Number.isFinite(actual) ||
    !Number.isFinite(expected)
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        `Physical requirement for ${label} could not be verified deterministically.`
    };
  }

  const pass =
    comparator === 'max'
      ? actual <= expected
      : actual >= expected;

  if (!pass) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        `Candidate ${label} does not meet the required physical standard.`,
      details: {
        actual,
        required:
          expected
      }
    };
  }

  return {
    status:
      RESULT.DIRECT,
    details: {
      actual,
      required:
        expected
    }
  };
}

function evaluatePhysicalRule(
  profile,
  rule
) {
  const physical =
    getPhysicalObject(
      profile
    );

  if (!physical) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate physical eligibility information is unavailable.'
    };
  }

  const standard =
    rule.physicalStandard;

  if (
    !isObject(
      standard
    )
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'The applicable physical standard requires manual verification.'
    };
  }

  const checks = [];

  if (
    standard.gender &&
    cleanString(
      standard.gender,
      'ANY'
    ).toUpperCase() !==
      'ANY'
  ) {
    const actualGender =
      firstExistingValue(
        physical,
        [
          'gender'
        ]
      );

    if (
      actualGender === MISSING
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'Gender-specific physical standard requires candidate verification.'
      };
    }

    if (
      cleanString(
        actualGender,
        ''
      ).toUpperCase() !==
      cleanString(
        standard.gender,
        ''
      ).toUpperCase()
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          'Candidate gender does not match the stated physical-standard category.'
      };
    }
  }

  const numericDefinitions = [
    [
      'minimumHeightCm',
      [
        'heightCm',
        'height'
      ],
      'height'
    ],
    [
      'maximumHeightCm',
      [
        'heightCm',
        'height'
      ],
      'height',
      'max'
    ],
    [
      'minimumChestCm',
      [
        'chestCm',
        'chest'
      ],
      'chest'
    ],
    [
      'minimumExpandedChestCm',
      [
        'expandedChestCm',
        'chestExpandedCm',
        'expandedChest'
      ],
      'expanded chest'
    ],
    [
      'minimumRunningMeters',
      [
        'runningMeters',
        'runMeters'
      ],
      'running distance'
    ],
    [
      'minimumWalkingMeters',
      [
        'walkingMeters',
        'walkMeters'
      ],
      'walking distance'
    ],
    [
      'minimumCyclingMeters',
      [
        'cyclingMeters',
        'cycleMeters'
      ],
      'cycling distance'
    ]
  ];

  for (
    const [
      requiredField,
      candidateFields,
      label,
      comparator
    ] of numericDefinitions
  ) {
    const result =
      comparePhysicalField(
        physical,
        standard,
        requiredField,
        candidateFields,
        label,
        comparator
      );

    if (
      result
    ) {
      checks.push({
        requiredField,
        ...result
      });
    }

    if (
      result?.status ===
        RESULT.NOT_ELIGIBLE ||
      result?.status ===
        RESULT.REVIEW_REQUIRED
    ) {
      return {
        status:
          result.status,
        reason:
          result.reason,
        details: {
          checks
        }
      };
    }
  }

  if (
    standard.runningTimeSeconds !==
    undefined
  ) {
    const raw =
      firstExistingValue(
        physical,
        [
          'runningTimeSeconds',
          'runTimeSeconds'
        ]
      );

    if (
      raw === MISSING ||
      !Number.isFinite(
        Number(raw)
      )
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'Candidate running-time information is required for physical verification.'
      };
    }

    if (
      Number(raw) >
      Number(
        standard.runningTimeSeconds
      )
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          'Candidate running time exceeds the permitted physical standard.'
      };
    }
  }

  return {
    status:
      RESULT.DIRECT,
    details: {
      checks
    }
  };
}

/* ============================================================
 * MEDICAL STANDARDS
 * ========================================================== */

function getMedicalObject(
  profile
) {
  const value =
    firstExistingValue(
      profile,
      [
        'medical',
        'medicalEligibility',
        'medicalFitness'
      ]
    );

  return (
    value !== MISSING &&
    isObject(value)
  )
    ? value
    : null;
}

function evaluateMedicalRule(
  profile,
  rule
) {
  const medical =
    getMedicalObject(
      profile
    );

  if (!medical) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate medical eligibility information is unavailable.'
    };
  }

  const standard =
    rule.medicalStandard;

  if (
    !isObject(
      standard
    )
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'The applicable medical standard requires manual verification.'
    };
  }

  const directStatus =
    firstExistingValue(
      medical,
      [
        'status',
        'fitnessStatus',
        'fit'
      ]
    );

  if (
    standard.requiredStatus !==
    undefined
  ) {
    if (
      directStatus === MISSING
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'Candidate medical fitness status is required.'
      };
    }

    const fit =
      normalizeBoolean(
        directStatus
      );

    if (
      fit !== null
    ) {
      const expectedFit =
        normalizeBoolean(
          standard.requiredStatus
        );

      if (
        expectedFit !== null &&
        fit !== expectedFit
      ) {
        return {
          status:
            RESULT.NOT_ELIGIBLE,
          reason:
            'Candidate medical status does not satisfy the required medical standard.'
        };
      }
    } else if (
      !valuesEqual(
        directStatus,
        standard.requiredStatus
      )
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          'Candidate medical status does not satisfy the required medical standard.'
      };
    }
  }

  const eyesightRule =
    rule.eyesightRequirement ??
    standard.eyesightRequirement;

  if (
    eyesightRule !== undefined
  ) {
    const eyesight =
      firstExistingValue(
        medical,
        [
          'eyesight',
          'vision',
          'visualAcuity'
        ]
      );

    if (
      eyesight === MISSING
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'Candidate eyesight information is required for medical verification.'
      };
    }

    if (
      isObject(
        eyesightRule
      )
    ) {
      if (
        eyesightRule.minimumAcuity !==
        undefined
      ) {
        const actual =
          Number(
            eyesight
          );

        const required =
          Number(
            eyesightRule.minimumAcuity
          );

        if (
          !Number.isFinite(
            actual
          ) ||
          !Number.isFinite(
            required
          )
        ) {
          return {
            status:
              RESULT.REVIEW_REQUIRED,
            reason:
              'Eyesight values could not be compared deterministically.'
          };
        }

        if (
          actual < required
        ) {
          return {
            status:
              RESULT.NOT_ELIGIBLE,
            reason:
              'Candidate eyesight does not satisfy the required minimum standard.'
          };
        }
      }
    } else {
      const match =
        evaluateOperator(
          eyesight,
          rule.operator ||
            OPERATORS.EQ,
          eyesightRule
        );

      if (
        match === false
      ) {
        return {
          status:
            RESULT.NOT_ELIGIBLE,
          reason:
            'Candidate eyesight does not satisfy the required standard.'
        };
      }

      if (
        match === null
      ) {
        return {
          status:
            RESULT.REVIEW_REQUIRED,
          reason:
            'Candidate eyesight could not be compared deterministically.'
        };
      }
    }
  }

  return {
    status:
      RESULT.DIRECT
  };
}

/* ============================================================
 * LANGUAGE / SKILLS / LICENCE
 * ========================================================== */

function evaluateLanguageRule(
  profile,
  rule
) {
  const candidate =
    firstExistingValue(
      profile,
      [
        'languages',
        'languageIds',
        'languageKnowledge'
      ]
    );

  if (
    candidate === MISSING
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate language information is unavailable.'
    };
  }

  const required =
    getRuleExpectedValue(
      rule
    );

  if (
    !isTruthyDefined(
      required
    )
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Language rule does not contain a canonical requirement.'
    };
  }

  const match =
    evaluateOperator(
      candidate,
      rule.operator ||
        OPERATORS.HAS,
      required
    );

  if (
    match === true
  ) {
    return {
      status:
        RESULT.DIRECT
    };
  }

  if (
    match === false
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        'Candidate language profile does not satisfy the required language condition.'
    };
  }

  return {
    status:
      RESULT.REVIEW_REQUIRED,
    reason:
      'Language requirement could not be evaluated deterministically.'
  };
}

function evaluateSkillRule(
  profile,
  rule
) {
  const condition =
    cleanString(
      rule.conditionType,
      ''
    )
      .trim()
      .toUpperCase();

  let candidatePaths;

  if (
    condition === 'TYPING' ||
    condition ===
      'TYPING_REQUIREMENT'
  ) {
    candidatePaths = [
      'skills.typing',
      'typing',
      'typingProficiency'
    ];
  } else if (
    condition ===
    'SHORTHAND'
  ) {
    candidatePaths = [
      'skills.shorthand',
      'shorthand',
      'shorthandProficiency'
    ];
  } else {
    candidatePaths = [
      'skills.computerKnowledge',
      'skills.computer',
      'computerKnowledge',
      'computerSkills',
      'skills'
    ];
  }

  const candidate =
    firstExistingValue(
      profile,
      candidatePaths
    );

  if (
    candidate === MISSING
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        `Candidate ${condition.toLowerCase()} information is unavailable.`
    };
  }

  const expected =
    getRuleExpectedValue(
      rule
    );

  if (
    !isTruthyDefined(
      expected
    )
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        `${condition} rule does not contain a canonical comparison value.`
    };
  }

  const operator =
    rule.operator ||
    (
      Array.isArray(
        candidate
      )
        ? OPERATORS.HAS
        : OPERATORS.EQ
    );

  const match =
    evaluateOperator(
      candidate,
      operator,
      expected
    );

  if (
    match === true
  ) {
    return {
      status:
        RESULT.DIRECT
    };
  }

  if (
    match === false
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        `Candidate does not satisfy the required ${condition.toLowerCase()} condition.`
    };
  }

  return {
    status:
      RESULT.REVIEW_REQUIRED,
    reason:
      `${condition} requirement could not be evaluated deterministically.`
  };
}

function evaluateLicenceRule(
  profile,
  rule
) {
  const candidate =
    firstExistingValue(
      profile,
      [
        'licences',
        'licenses',
        'licenceIds',
        'licenseIds',
        'drivingLicence',
        'drivingLicense'
      ]
    );

  if (
    candidate === MISSING
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate licence information is unavailable.'
    };
  }

  const expected =
    getRuleExpectedValue(
      rule
    ) ??
    rule.licenceRequirements ??
    rule.licenseRequirements;

  if (
    !isTruthyDefined(
      expected
    )
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Licence rule does not contain a canonical requirement.'
    };
  }

  const match =
    evaluateOperator(
      candidate,
      rule.operator ||
        OPERATORS.HAS,
      expected
    );

  if (
    match === true
  ) {
    return {
      status:
        RESULT.DIRECT
    };
  }

  if (
    match === false
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        'Candidate does not hold the required licence.'
    };
  }

  return {
    status:
      RESULT.REVIEW_REQUIRED,
    reason:
      'Licence requirement could not be evaluated deterministically.'
  };
}

/* ============================================================
 * DOMICILE / CATEGORY / GENDER / CITIZENSHIP
 * ========================================================== */

function evaluateDomicileRule(
  profile,
  rule
) {
  const candidate =
    firstExistingValue(
      profile,
      [
        'domicileId',
        'domicile',
        'stateId',
        'residence.stateId',
        'address.stateId'
      ]
    );

  if (
    candidate === MISSING
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate domicile information is unavailable.'
    };
  }

  const expected =
    rule.value ??
    rule.domicileRequirement;

  if (
    expected === undefined
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Domicile rule does not contain a canonical requirement.'
    };
  }

  if (
    isObject(
      expected
    )
  ) {
    const allowed =
      expected.stateIds ||
      expected.domicileIds ||
      expected.values;

    if (
      !allowed?.length
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'Domicile rule contains no usable allowed domicile values.'
      };
    }

    const match =
      evaluateOperator(
        candidate,
        rule.operator ||
          OPERATORS.IN,
        allowed
      );

    if (
      match === true
    ) {
      return {
        status:
          RESULT.DIRECT
      };
    }

    if (
      match === false
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          'Candidate domicile does not satisfy the stated domicile requirement.'
      };
    }

    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Domicile requirement could not be evaluated deterministically.'
    };
  }

  const match =
    evaluateOperator(
      candidate,
      rule.operator ||
        OPERATORS.EQ,
      expected
    );

  if (
    match === true
  ) {
    return {
      status:
        RESULT.DIRECT
    };
  }

  if (
    match === false
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        'Candidate domicile does not satisfy the stated domicile requirement.'
    };
  }

  return {
    status:
      RESULT.REVIEW_REQUIRED,
    reason:
      'Domicile requirement could not be evaluated deterministically.'
  };
}

function evaluateReservationRule(
  profile,
  rule
) {
  const candidate =
    firstExistingValue(
      profile,
      [
        'reservation.category',
        'reservationCategory',
        'category',
        'socialCategory'
      ]
    );

  if (
    candidate === MISSING
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate reservation/category information is unavailable.'
    };
  }

  const requirement =
    rule.value ??
    rule.categoryRequirement ??
    rule.reservationRequirement;

  if (
    requirement === undefined
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Reservation/category rule contains no canonical requirement.'
    };
  }

  const allowed =
    isObject(
      requirement
    )
      ? (
          requirement.categories ||
          requirement.categoryIds ||
          requirement.values
        )
      : requirement;

  const match =
    evaluateOperator(
      candidate,
      rule.operator ||
        OPERATORS.IN,
      allowed
    );

  if (
    match === true
  ) {
    return {
      status:
        RESULT.DIRECT
    };
  }

  if (
    match === false
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        'Candidate reservation/category does not satisfy the stated requirement.'
    };
  }

  return {
    status:
      RESULT.REVIEW_REQUIRED,
    reason:
      'Reservation/category requirement could not be evaluated deterministically.'
  };
}

function evaluateGenderRule(
  profile,
  rule
) {
  const candidate =
    firstExistingValue(
      profile,
      [
        'gender',
        'personal.gender'
      ]
    );

  if (
    candidate === MISSING
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate gender information is unavailable.'
    };
  }

  const expected =
    rule.value ??
    rule.genderRequirement;

  if (
    !isTruthyDefined(
      expected
    )
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Gender rule contains no canonical requirement.'
    };
  }

  const match =
    evaluateOperator(
      candidate,
      rule.operator ||
        OPERATORS.EQ,
      expected
    );

  if (
    match === true
  ) {
    return {
      status:
        RESULT.DIRECT
    };
  }

  if (
    match === false
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        'Candidate gender does not satisfy the stated requirement.'
    };
  }

  return {
    status:
      RESULT.REVIEW_REQUIRED,
    reason:
      'Gender requirement could not be evaluated deterministically.'
  };
}

function evaluateCitizenshipRule(
  profile,
  rule
) {
  const candidate =
    firstExistingValue(
      profile,
      [
        'citizenship',
        'citizenshipId',
        'nationality'
      ]
    );

  if (
    candidate === MISSING
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Candidate citizenship information is unavailable.'
    };
  }

  const expected =
    rule.value ??
    rule.requiredNationality ??
    rule.citizenship;

  if (
    !isTruthyDefined(
      expected
    )
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Citizenship rule contains no canonical requirement.'
    };
  }

  const match =
    evaluateOperator(
      candidate,
      rule.operator ||
        OPERATORS.EQ,
      expected
    );

  if (
    match === true
  ) {
    return {
      status:
        RESULT.DIRECT
    };
  }

  if (
    match === false
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        'Candidate citizenship does not satisfy the stated requirement.'
    };
  }

  return {
    status:
      RESULT.REVIEW_REQUIRED,
    reason:
      'Citizenship requirement could not be evaluated deterministically.'
  };
}

/* ============================================================
 * RULE LOGIC
 * ========================================================== */

function evaluateRuleLogic(
  profile,
  rule,
  recruitmentContext,
  options
) {
  const mode =
    cleanString(
      rule.logic?.mode,
      ''
    )
      .trim()
      .toUpperCase();

  const ruleIds =
    normalizeIdList(
      rule.logic?.ruleIds
    );

  if (
    !mode ||
    !ruleIds.length
  ) {
    return null;
  }

  const childRules =
    ruleIds
      .map(
        (id) =>
          registry.get(
            'ELIGIBILITY_RULE',
            id
          )
      )
      .filter(Boolean);

  if (
    childRules.length !==
    ruleIds.length
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Rule logic references an unavailable eligibility rule.'
    };
  }

  const childResults =
    childRules.map(
      (childRule) =>
        evaluateCanonicalRule(
          profile,
          childRule,
          recruitmentContext,
          options
        )
    );

  const statusValues =
    childResults.map(
      (result) =>
        result.status
    );

  const anyReview =
    statusValues.includes(
      RESULT.REVIEW_REQUIRED
    ) ||
    statusValues.includes(
      RESULT.UNKNOWN
    );

  const anyFail =
    statusValues.includes(
      RESULT.NOT_ELIGIBLE
    );

  if (
    mode === 'ALL_OF'
  ) {
    if (
      anyFail
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          'At least one required child rule failed.',
        details: {
          childResults
        }
      };
    }

    if (
      anyReview
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'At least one required child rule requires review.',
        details: {
          childResults
        }
      };
    }

    if (
      childResults.some(
        (result) =>
          result.status ===
          RESULT.CONDITIONAL
      )
    ) {
      return {
        status:
          RESULT.CONDITIONAL,
        reason:
          'All child rules pass, but at least one remains conditional.',
        details: {
          childResults
        }
      };
    }

    return {
      status:
        RESULT.DIRECT,
      details: {
        childResults
      }
    };
  }

  if (
    mode === 'ANY_OF'
  ) {
    if (
      childResults.some(
        (result) =>
          result.status ===
          RESULT.DIRECT
      )
    ) {
      return {
        status:
          RESULT.DIRECT,
        details: {
          childResults
        }
      };
    }

    if (
      childResults.some(
        (result) =>
          result.status ===
          RESULT.CONDITIONAL
      )
    ) {
      return {
        status:
          RESULT.CONDITIONAL,
        reason:
          'At least one permitted child path is conditional.',
        details: {
          childResults
        }
      };
    }

    if (
      anyReview
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'No child rule passed deterministically and at least one requires review.',
        details: {
          childResults
        }
      };
    }

    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        'None of the permitted child rules passed.',
      details: {
        childResults
      }
    };
  }

  if (
    mode === 'NONE_OF'
  ) {
    if (
      childResults.some(
        (result) =>
          result.status ===
          RESULT.DIRECT
      )
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          'A prohibited child rule matched.',
        details: {
          childResults
        }
      };
    }

    if (
      anyReview
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'A prohibited child condition could not be resolved deterministically.',
        details: {
          childResults
        }
      };
    }

    return {
      status:
        RESULT.DIRECT,
      details: {
        childResults
      }
    };
  }

  if (
    mode === 'ONE_OF'
  ) {
    const passed =
      childResults.filter(
        (result) =>
          result.status ===
          RESULT.DIRECT
      ).length;

    const conditional =
      childResults.filter(
        (result) =>
          result.status ===
          RESULT.CONDITIONAL
      ).length;

    if (
      passed === 1 &&
      conditional === 0
    ) {
      return {
        status:
          RESULT.DIRECT,
        details: {
          childResults
        }
      };
    }

    if (
      passed === 0 &&
      conditional === 1 &&
      !anyReview
    ) {
      return {
        status:
          RESULT.CONDITIONAL,
        details: {
          childResults
        }
      };
    }

    if (
      passed > 1
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          'More than one mutually-exclusive child condition matched.',
        details: {
          childResults
        }
      };
    }

    if (
      anyReview
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          'Mutually-exclusive child conditions could not be fully verified.',
        details: {
          childResults
        }
      };
    }

    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        'Exactly one required child condition was not satisfied.',
      details: {
        childResults
      }
    };
  }

  return {
    status:
      RESULT.REVIEW_REQUIRED,
    reason:
      `Unsupported rule logic mode: ${mode}.`
  };
}

/* ============================================================
 * GENERIC CONDITION EVALUATION
 * ========================================================== */

function inferDefaultOperator(
  candidateEntries,
  expected
) {
  const candidate =
    candidateEntries[0]?.value;

  if (
    Array.isArray(
      candidate
    ) ||
    Array.isArray(
      expected
    )
  ) {
    return OPERATORS.HAS;
  }

  return OPERATORS.EQ;
}

function evaluateGenericCondition(
  profile,
  rule
) {
  const condition =
    cleanString(
      rule.conditionType,
      'OTHER'
    )
      .trim()
      .toUpperCase();

  const candidateValues =
    getCandidateValues(
      profile,
      rule
    );

  if (
    !candidateValues.length
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        `Candidate information required for "${condition}" is unavailable.`
    };
  }

  const expected =
    getRuleExpectedValue(
      rule
    );

  if (
    expected === undefined
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Eligibility rule does not contain a usable canonical comparison value.'
    };
  }

  const operator =
    rule.operator ||
    inferDefaultOperator(
      candidateValues,
      expected
    );

  const outcomes =
    candidateValues.map(
      ({ value }) =>
        evaluateOperator(
          value,
          operator,
          expected
        )
    );

  if (
    outcomes.includes(
      true
    )
  ) {
    return {
      status:
        RESULT.DIRECT
    };
  }

  if (
    outcomes.every(
      (outcome) =>
        outcome === false
    )
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        `Candidate does not satisfy the required ${condition.toLowerCase()} condition.`
    };
  }

  return {
    status:
      RESULT.REVIEW_REQUIRED,
    reason:
      `The ${condition.toLowerCase()} requirement could not be evaluated deterministically.`
  };
}

/* ============================================================
 * RULE EFFECTS / EXCEPTIONS
 * ========================================================== */

function getRuleEffect(
  rule
) {
  return cleanString(
    rule.effect,
    EFFECT.ALLOW
  )
    .trim()
    .toUpperCase();
}

function applyRuleEffect(
  rule,
  requirementResult
) {
  const effect =
    getRuleEffect(
      rule
    );

  const conditional =
    Boolean(
      rule.conditional
    ) ||
    effect ===
      EFFECT.CONDITIONAL;

  /*
   * Unknown/unavailable information is never converted into a pass
   * by a rule effect.
   */
  if (
    requirementResult.status ===
      RESULT.REVIEW_REQUIRED ||
    requirementResult.status ===
      RESULT.UNKNOWN
  ) {
    return requirementResult;
  }

  if (
    effect === EFFECT.MODIFY
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Rule effect MODIFY requires an explicit deterministic transformation that is not implemented by the eligibility engine.',
      details:
        requirementResult.details
    };
  }

  /*
   * DENY means:
   *   condition matched -> candidate is denied
   *   condition did not match -> requirement passes
   */
  if (
    effect === EFFECT.DENY
  ) {
    if (
      requirementResult.status ===
      RESULT.DIRECT
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          requirementResult.reason ||
          'A prohibitive eligibility rule matched.',
        details:
          requirementResult.details
      };
    }

    return {
      status:
        RESULT.DIRECT,
      reason:
        'The prohibitive condition did not match.',
      details:
        requirementResult.details
    };
  }

  /*
   * REQUIRE_VERIFICATION means that even a matching condition cannot
   * establish final eligibility without explicit verification.
   */
  if (
    effect ===
    EFFECT.REQUIRE_VERIFICATION
  ) {
    if (
      requirementResult.status ===
      RESULT.DIRECT
    ) {
      return {
        status:
          RESULT.REVIEW_REQUIRED,
        reason:
          rule.verificationRequirement
            ? 'The rule matched, but the specified verification requirement must be satisfied before final eligibility can be confirmed.'
            : 'The rule requires explicit verification before final eligibility can be confirmed.',
        details:
          requirementResult.details
      };
    }

    return requirementResult;
  }

  /*
   * CONDITIONAL means that an unmet requirement creates a conditional
   * result rather than an immediate hard rejection.
   */
  if (
    conditional &&
    requirementResult.status ===
      RESULT.NOT_ELIGIBLE
  ) {
    return {
      status:
        RESULT.CONDITIONAL,
      reason:
        requirementResult.reason ||
        'A conditional requirement is not currently satisfied.',
      details:
        requirementResult.details,
      unmet: true
    };
  }

  return requirementResult;
}

function parseLiteral(
  value
) {
  const text =
    String(
      value ?? ''
    ).trim();

  if (
    (
      text.startsWith(
        "'"
      ) &&
      text.endsWith(
        "'"
      )
    ) ||
    (
      text.startsWith(
        '"'
      ) &&
      text.endsWith(
        '"'
      )
    )
  ) {
    return text.slice(
      1,
      -1
    );
  }

  if (
    text === 'true'
  ) {
    return true;
  }

  if (
    text === 'false'
  ) {
    return false;
  }

  if (
    text === 'null'
  ) {
    return null;
  }

  const number =
    Number(
      text
    );

  if (
    Number.isFinite(
      number
    )
  ) {
    return number;
  }

  return undefined;
}

function evaluateException(
  profile,
  exception
) {
  if (
    !isObject(
      exception
    ) ||
    !exception.condition
  ) {
    return false;
  }

  /*
   * Deliberately do NOT execute arbitrary JavaScript.
   *
   * Supported expression:
   *   candidate.path === 'value'
   *   profile.path == 12
   *   candidate.path !== true
   */
  const match =
    String(
      exception.condition
    ).match(
      /^\s*(?:candidate|profile)\.([A-Za-z0-9_.]+)\s*(===|==|!==|!=)\s*(.+?)\s*$/
    );

  if (!match) {
    return false;
  }

  const [
    ,
    path,
    operator,
    rawExpected
  ] = match;

  const actual =
    getNestedValue(
      profile,
      path
    );

  if (
    actual === MISSING
  ) {
    return false;
  }

  const expected =
    parseLiteral(
      rawExpected
    );

  if (
    expected === undefined
  ) {
    return false;
  }

  if (
    operator === '===' ||
    operator === '=='
  ) {
    return valuesEqual(
      actual,
      expected
    );
  }

  return !valuesEqual(
    actual,
    expected
  );
}

function applyRuleExceptions(
  profile,
  rule,
  baseResult
) {
  const exceptions =
    Array.isArray(
      rule.exceptions
    )
      ? rule.exceptions
      : [];

  if (
    !exceptions.length
  ) {
    return baseResult;
  }

  for (
    const exception of
      exceptions
  ) {
    if (
      !evaluateException(
        profile,
        exception
      )
    ) {
      continue;
    }

    const effect =
      cleanString(
        exception.effect,
        ''
      )
        .trim()
        .toUpperCase();

    if (
      effect === 'ALLOW'
    ) {
      return {
        status:
          RESULT.DIRECT,
        reason:
          'A canonical rule exception explicitly allows the candidate.',
        details: {
          ...(baseResult.details ||
            {}),
          exceptionApplied:
            true
        }
      };
    }

    if (
      effect === 'DISALLOW' ||
      effect === 'DENY'
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          'A canonical rule exception explicitly disallows the candidate.',
        details: {
          ...(baseResult.details ||
            {}),
          exceptionApplied:
            true
        }
      };
    }
  }

  return baseResult;
}

/* ============================================================
 * TEMPORAL / RECRUITMENT APPLICABILITY
 * ========================================================== */

function getAsOfDate(
  recruitmentContext,
  options
) {
  const raw =
    options?.asOfDate ??
    recruitmentContext?.asOfDate ??
    recruitmentContext?.date ??
    new Date();

  if (
    raw instanceof Date
  ) {
    return new Date(
      raw.getTime()
    );
  }

  const parsed =
    new Date(
      raw
    );

  return Number.isNaN(
    parsed.getTime()
  )
    ? null
    : parsed;
}

function evaluateRuleTemporalApplicability(
  rule,
  recruitmentContext,
  options
) {
  const asOfDate =
    getAsOfDate(
      recruitmentContext,
      options
    );

  if (
    !asOfDate
  ) {
    return {
      applicable: null,
      reason:
        'The rule effective date context could not be resolved.'
    };
  }

  const effectiveFrom =
    parseDate(
      rule.effectiveFrom
    );

  const effectiveTo =
    parseDate(
      rule.effectiveTo
    );

  if (
    effectiveFrom &&
    asOfDate <
      effectiveFrom
  ) {
    return {
      applicable: false,
      reason:
        'Rule is not yet effective for the supplied evaluation date.'
    };
  }

  if (
    effectiveTo &&
    asOfDate >
      effectiveTo
  ) {
    return {
      applicable: false,
      reason:
        'Rule is no longer effective for the supplied evaluation date.'
    };
  }

  return {
    applicable: true
  };
}

function isRuleApplicableToRecruitment(
  rule,
  recruitmentContext
) {
  const recruitmentIds =
    normalizeIdList(
      rule.recruitmentIds
    );

  const routeTypes =
    compactUnique(
      rule.recruitmentRouteTypes
    ).map(
      (value) =>
        cleanString(
          value,
          ''
        )
          .trim()
          .toUpperCase()
    );

  if (
    !recruitmentIds.length &&
    !routeTypes.length
  ) {
    return {
      applicable: true
    };
  }

  if (
    !isObject(
      recruitmentContext
    )
  ) {
    return {
      applicable: null,
      reason:
        'This eligibility rule is recruitment-specific, but the current recruitment context is unavailable.'
    };
  }

  const contextIds =
    compactUnique(
      [
        recruitmentContext.id,
        recruitmentContext.recruitmentId,
        ...(recruitmentContext.recruitmentIds ||
          []),
        ...(recruitmentContext.ids ||
          [])
      ]
    )
      .map(
        normalizeId
      )
      .filter(Boolean);

  const contextRouteTypes =
    compactUnique(
      [
        recruitmentContext.routeType,
        recruitmentContext.recruitmentRouteType,
        recruitmentContext.mode,
        ...(recruitmentContext.routeTypes ||
          [])
      ]
    ).map(
      (value) =>
        cleanString(
          value,
          ''
        )
          .trim()
          .toUpperCase()
    );

  const idMatched =
    recruitmentIds.length
      ? recruitmentIds.some(
          (id) =>
            contextIds.some(
              (candidateId) =>
                valuesEqual(
                  candidateId,
                  id
                )
            )
        )
      : true;

  const routeMatched =
    routeTypes.length
      ? routeTypes.some(
          (route) =>
            contextRouteTypes.includes(
              route
            )
        )
      : true;

  /*
   * When both dimensions are supplied, either explicit recruitment ID
   * matching OR explicit route-type matching can establish applicability.
   *
   * This is intentionally permissive because a canonical rule may define
   * one or both identifiers as alternative recruitment scopes.
   */
  if (
    (
      recruitmentIds.length &&
      idMatched
    ) ||
    (
      !recruitmentIds.length &&
      routeMatched
    )
  ) {
    return {
      applicable: true
    };
  }

  if (
    recruitmentIds.length &&
    routeTypes.length
  ) {
    return (
      idMatched ||
      routeMatched
    )
      ? {
          applicable: true
        }
      : {
          applicable: false,
          reason:
            'Rule is not applicable to the supplied recruitment context.'
        };
  }

  return {
    applicable: false,
    reason:
      'Rule is not applicable to the supplied recruitment context.'
  };
}

/* ============================================================
 * TARGET RULE DISCOVERY
 * ========================================================== */

function getRulesForTarget(
  targetType,
  targetId
) {
  const normalizedTargetType =
    cleanString(
      targetType,
      ''
    )
      .trim()
      .toUpperCase();

  const normalizedTargetId =
    normalizeId(
      targetId
    );

  if (
    !normalizedTargetType ||
    !normalizedTargetId
  ) {
    return [];
  }

  return registry.find(
    'ELIGIBILITY_RULE',
    (rule) =>
      cleanString(
        rule.targetType,
        ''
      )
        .trim()
        .toUpperCase() ===
        normalizedTargetType &&
      valuesEqual(
        rule.targetId,
        normalizedTargetId
      ) &&
      cleanString(
        rule.ruleClass,
        RULE_CLASS.HARD
      )
        .trim()
        .toUpperCase() ===
        RULE_CLASS.HARD &&
      (
        rule.status ===
          undefined ||
        cleanString(
          rule.status,
          ''
        )
          .trim()
          .toUpperCase() ===
          'ACTIVE'
      )
  );
}

function getInheritedRuleIds(
  rule
) {
  return compactUnique(
    [
      ...normalizeIdList(
        rule.dependsOnRuleIds
      ),
      ...normalizeIdList(
        rule.parentRuleIds
      ),
      ...normalizeIdList(
        rule.inheritedRuleIds
      )
    ]
  );
}

function expandRules(
  rules
) {
  const ordered = [];

  const visiting =
    new Set();

  const visited =
    new Set();

  const visit =
    (rule) => {
      if (
        !rule?.id
      ) {
        return;
      }

      if (
        visited.has(
          rule.id
        )
      ) {
        return;
      }

      if (
        visiting.has(
          rule.id
        )
      ) {
        /*
         * The database validator should reject cycles.
         * Runtime protection prevents infinite recursion if invalid
         * data somehow reaches this layer.
         */
        return;
      }

      visiting.add(
        rule.id
      );

      for (
        const parentId of
          getInheritedRuleIds(
            rule
          )
      ) {
        const parent =
          registry.get(
            'ELIGIBILITY_RULE',
            parentId
          );

        if (
          parent
        ) {
          visit(
            parent
          );
        }
      }

      visiting.delete(
        rule.id
      );

      visited.add(
        rule.id
      );

      ordered.push(
        rule
      );
    };

  rules.forEach(
    visit
  );

  return ordered;
}

/* ============================================================
 * CANONICAL RULE EVALUATION
 * ========================================================== */

function evaluateRequirementCondition(
  profile,
  rule,
  recruitmentContext,
  options
) {
  const condition =
    cleanString(
      rule.conditionType,
      'OTHER'
    )
      .trim()
      .toUpperCase();

  if (
    rule.logic?.ruleIds?.length
  ) {
    return evaluateRuleLogic(
      profile,
      rule,
      recruitmentContext,
      options
    );
  }

  switch (
    condition
  ) {
    case 'AGE':
      return evaluateAgeRule(
        profile,
        rule,
        recruitmentContext,
        options
      );

    case 'MARKS':
    case 'PERCENTAGE':
      return evaluateMarksRule(
        profile,
        rule
      );

    case 'QUALIFICATION':
      return evaluateQualificationRule(
        profile,
        rule
      );

    case 'EDUCATION_LEVEL':
      return evaluateEducationLevelRule(
        profile,
        rule
      );

    case 'LANGUAGE':
    case 'LANGUAGES':
      return evaluateLanguageRule(
        profile,
        rule
      );

    case 'TYPING':
    case 'TYPING_REQUIREMENT':
    case 'SHORTHAND':
    case 'COMPUTER':
    case 'COMPUTER_KNOWLEDGE':
      return evaluateSkillRule(
        profile,
        rule
      );

    case 'DRIVING_LICENCE':
    case 'DRIVING_LICENSE':
    case 'LICENCE':
    case 'LICENSE':
      return evaluateLicenceRule(
        profile,
        rule
      );

    case 'EXPERIENCE':
      return evaluateExperienceRule(
        profile,
        rule
      );

    case 'DOMICILE':
      return evaluateDomicileRule(
        profile,
        rule
      );

    case 'RESERVATION':
    case 'CATEGORY':
      return evaluateReservationRule(
        profile,
        rule
      );

    case 'GENDER':
      return evaluateGenderRule(
        profile,
        rule
      );

    case 'CITIZENSHIP':
      return evaluateCitizenshipRule(
        profile,
        rule
      );

    case 'PHYSICAL_STANDARD':
    case 'PHYSICAL_EFFICIENCY_TEST':
    case 'HEIGHT':
    case 'CHEST':
    case 'RUNNING':
    case 'WALKING':
    case 'CYCLING':
    case 'FITNESS':
      return evaluatePhysicalRule(
        profile,
        rule
      );

    case 'MEDICAL_STANDARD':
    case 'EYESIGHT':
      return evaluateMedicalRule(
        profile,
        rule
      );

    default:
      return evaluateGenericCondition(
        profile,
        rule
      );
  }
}

function evaluateCanonicalRule(
  profile,
  rule,
  recruitmentContext,
  options = {}
) {
  if (
    !isObject(
      rule
    ) ||
    !rule.id
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Eligibility rule is malformed or has no stable ID.'
    };
  }

  const ruleClass =
    cleanString(
      rule.ruleClass,
      RULE_CLASS.HARD
    )
      .trim()
      .toUpperCase();

  /*
   * Soft rules are never allowed to establish eligibility.
   * They belong to preference/scoring logic.
   */
  if (
    ruleClass !==
    RULE_CLASS.HARD
  ) {
    return {
      status:
        RESULT.DIRECT,
      skipped: true,
      reason:
        'Non-HARD rule is not used to establish hard eligibility.'
    };
  }

  /*
   * A rule may be valid in the database but not active for the
   * date on which a candidate is being evaluated.
   */
  const temporal =
    evaluateRuleTemporalApplicability(
      rule,
      recruitmentContext,
      options
    );

  if (
    temporal.applicable === false
  ) {
    return {
      status:
        RESULT.DIRECT,
      skipped: true,
      reason:
        temporal.reason
    };
  }

  if (
    temporal.applicable === null
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        temporal.reason
    };
  }

  /*
   * Recruitment-specific rules cannot safely be evaluated if their
   * recruitment context is unavailable.
   */
  const applicability =
    isRuleApplicableToRecruitment(
      rule,
      recruitmentContext
    );

  if (
    applicability.applicable === false
  ) {
    return {
      status:
        RESULT.DIRECT,
      skipped: true,
      reason:
        applicability.reason
    };
  }

  if (
    applicability.applicable === null
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        applicability.reason
    };
  }

  const requirementResult =
    evaluateRequirementCondition(
      profile,
      rule,
      recruitmentContext,
      options
    );

  const effectedResult =
    applyRuleEffect(
      rule,
      requirementResult
    );

  return applyRuleExceptions(
    profile,
    rule,
    effectedResult
  );
}

/* ============================================================
 * SOURCE / CONFIDENCE TRACE
 * ========================================================== */

function collectRuleSourceReferences(
  rule
) {
  const sourceIds =
    normalizeIdList(
      rule.sourceIds
    );

  const sourceReferences =
    cleanArray(
      rule.sourceReferences
    );

  const resolvedSources =
    sourceIds.map(
      (sourceId) => {
        const source =
          registry.get(
            'SOURCE',
            sourceId
          );

        if (
          !source
        ) {
          return {
            sourceId,
            resolved:
              false
          };
        }

        return {
          sourceId,
          resolved:
            true,
          title:
            source.title ??
            source.name ??
            null,
          url:
            source.url ??
            source.link ??
            null,
          sourceType:
            source.sourceType ??
            null,
          official:
            source.official ??
            null
        };
      }
    );

  return {
    sourceIds,
    sourceReferences:
      sourceReferences.map(
        clone
      ),
    resolvedSources
  };
}

function getEffectiveRuleConfidence(
  rule,
  result
) {
  /*
   * Confidence does not change the underlying decision.
   *
   * It describes how strongly the underlying rule evidence is
   * supported. Review-required results retain the same source
   * confidence but still cannot be promoted to DIRECT.
   */
  const confidence =
    cleanString(
      rule.confidence,
      ''
    )
      .trim()
      .toUpperCase();

  if (
    result.status ===
      RESULT.REVIEW_REQUIRED ||
    result.status ===
      RESULT.UNKNOWN
  ) {
    return (
      confidence ||
      'UNKNOWN'
    );
  }

  return (
    confidence ||
    'UNKNOWN'
  );
}

function makeRuleTrace(
  rule,
  result,
  index
) {
  const source =
    collectRuleSourceReferences(
      rule
    );

  return {
    sequence:
      index,

    ruleId:
      rule.id,

    targetType:
      rule.targetType ??
      null,

    targetId:
      rule.targetId ??
      null,

    ruleClass:
      cleanString(
        rule.ruleClass,
        RULE_CLASS.HARD
      )
        .trim()
        .toUpperCase(),

    conditionType:
      cleanString(
        rule.conditionType,
        'OTHER'
      )
        .trim()
        .toUpperCase(),

    operator:
      cleanString(
        rule.operator,
        ''
      )
        .trim()
        .toUpperCase() ||
      null,

    effect:
      getRuleEffect(
        rule
      ),

    status:
      result.status,

    passed:
      result.status ===
      RESULT.DIRECT,

    conditional:
      result.status ===
      RESULT.CONDITIONAL,

    failed:
      result.status ===
      RESULT.NOT_ELIGIBLE,

    requiresReview:
      result.status ===
        RESULT.REVIEW_REQUIRED ||
      result.status ===
        RESULT.UNKNOWN,

    skipped:
      Boolean(
        result.skipped
      ),

    reason:
      result.reason ??
      null,

    unmet:
      Boolean(
        result.unmet
      ),

    details:
      clone(
        result.details
      ) ??
      null,

    confidence:
      getEffectiveRuleConfidence(
        rule,
        result
      ),

    sourceIds:
      source.sourceIds,

    sourceReferences:
      source.sourceReferences,

    resolvedSources:
      source.resolvedSources,

    effectiveFrom:
      rule.effectiveFrom ??
      null,

    effectiveTo:
      rule.effectiveTo ??
      null,

    version:
      rule.version ??
      null,

    priority:
      rule.priority ??
      null,

    mandatory:
      rule.mandatory !== false
  };
}

function aggregateSourceEvidence(
  ruleResults
) {
  const sourceIds =
    compactUnique(
      ruleResults.flatMap(
        (item) =>
          item.sourceIds ||
          []
      )
    );

  const sourceReferences =
    ruleResults.flatMap(
      (item) =>
        item.sourceReferences ||
        []
    );

  /*
   * The weakest confidence found among the rules is surfaced at
   * result level. A single LOW/UNKNOWN rule should not let an
   * otherwise strong result appear falsely HIGH-confidence.
   */
  const confidenceOrder = [
    'HIGH',
    'MEDIUM_HIGH',
    'MEDIUM',
    'LOW',
    'ESTIMATE',
    'NOT_VERIFIED',
    'UNKNOWN'
  ];

  const confidences =
    ruleResults
      .map(
        (item) =>
          item.confidence
      )
      .filter(Boolean)
      .map(
        (value) =>
          cleanString(
            value,
            'UNKNOWN'
          )
            .trim()
            .toUpperCase()
      );

  const confidence =
    confidences.length
      ? confidenceOrder[
          Math.max(
            ...confidences.map(
              (value) => {
                const index =
                  confidenceOrder.indexOf(
                    value
                  );

                return index >=
                  0
                  ? index
                  : confidenceOrder.length -
                    1;
              }
            )
          )
        ]
      : 'UNKNOWN';

  return {
    sourceIds,
    sourceReferences,
    confidence
  };
}

/* ============================================================
 * RESULT CONSTRUCTION
 * ========================================================== */

function makeResult({
  status,
  targetType,
  target,
  ruleResults,
  options = {},
  recruitmentContext = null,
  reason = null
}) {
  const failedRuleIds =
    ruleResults
      .filter(
        (item) =>
          item.status ===
          RESULT.NOT_ELIGIBLE
      )
      .map(
        (item) =>
          item.ruleId
      );

  const manualRuleIds =
    ruleResults
      .filter(
        (item) =>
          item.status ===
            RESULT.REVIEW_REQUIRED ||
          item.status ===
            RESULT.UNKNOWN
      )
      .map(
        (item) =>
          item.ruleId
      );

  const conditionalRuleIds =
    ruleResults
      .filter(
        (item) =>
          item.status ===
          RESULT.CONDITIONAL
      )
      .map(
        (item) =>
          item.ruleId
      );

  const passedRuleIds =
    ruleResults
      .filter(
        (item) =>
          item.status ===
            RESULT.DIRECT &&
          !item.skipped
      )
      .map(
        (item) =>
          item.ruleId
      );

  const skippedRuleIds =
    ruleResults
      .filter(
        (item) =>
          item.skipped
      )
      .map(
        (item) =>
          item.ruleId
      );

  const evidence =
    aggregateSourceEvidence(
      ruleResults
    );

  const result = {
    status,

    eligible:
      status === RESULT.DIRECT ||
      status === RESULT.CONDITIONAL,

    conditionallyEligible:
      status ===
      RESULT.CONDITIONAL,

    manualVerification:
      status ===
      RESULT.REVIEW_REQUIRED,

    unknown:
      status ===
      RESULT.UNKNOWN,

    targetType,

    targetId:
      target?.id ??
      null,

    jobId:
      targetType === 'JOB'
        ? target?.id ??
          null
        : undefined,

    examId:
      targetType === 'EXAM'
        ? target?.id ??
          null
        : undefined,

    serviceCadreId:
      targetType ===
      'SERVICE_CADRE'
        ? target?.id ??
          null
        : undefined,

    reason,

    ruleIds:
      ruleResults.map(
        (item) =>
          item.ruleId
      ),

    passedRuleIds,

    failedRuleIds,

    conditionalRuleIds,

    manualRuleIds,

    skippedRuleIds,

    ruleResults,

    /*
     * This trace is deliberately redundant.
     *
     * The ruleResults array is machine-oriented.
     * The trace groups the same evidence by the way it is displayed
     * to users and by the way Compass AI can explain it.
     */
    trace: {
      passedRequirements:
        ruleResults
          .filter(
            (item) =>
              item.status ===
                RESULT.DIRECT &&
              !item.skipped
          )
          .map(
            (item) => ({
              ruleId:
                item.ruleId,
              reason:
                item.reason,
              details:
                item.details
            })
          ),

      failedRequirements:
        ruleResults
          .filter(
            (item) =>
              item.status ===
              RESULT.NOT_ELIGIBLE
          )
          .map(
            (item) => ({
              ruleId:
                item.ruleId,
              reason:
                item.reason,
              details:
                item.details
            })
          ),

      unmetConditionalRequirements:
        ruleResults
          .filter(
            (item) =>
              item.status ===
              RESULT.CONDITIONAL
          )
          .map(
            (item) => ({
              ruleId:
                item.ruleId,
              reason:
                item.reason,
              details:
                item.details
            })
          ),

      unavailableOrUncertainInformation:
        ruleResults
          .filter(
            (item) =>
              item.status ===
                RESULT.REVIEW_REQUIRED ||
              item.status ===
                RESULT.UNKNOWN
          )
          .map(
            (item) => ({
              ruleId:
                item.ruleId,
              reason:
                item.reason,
              details:
                item.details
            })
          ),

      sourceIds:
        evidence.sourceIds,

      sourceReferences:
        evidence.sourceReferences,

      confidence:
        evidence.confidence,

      ruleIdsUsed:
        ruleResults.map(
          (item) =>
            item.ruleId
        )
    },

    confidence:
      evidence.confidence,

    sourceIds:
      evidence.sourceIds,

    sourceReferences:
      evidence.sourceReferences,

    recruitmentContext:
      clone(
        recruitmentContext
      ),

    evaluatedAt:
      options.evaluatedAt ??
      new Date().toISOString(),

    engineVersion:
      options.engineVersion ??
      'canonical-1.0.0'
  };

  if (
    result.jobId ===
    undefined
  ) {
    delete result.jobId;
  }

  if (
    result.examId ===
    undefined
  ) {
    delete result.examId;
  }

  if (
    result.serviceCadreId ===
    undefined
  ) {
    delete result.serviceCadreId;
  }

  return result;
}

/* ============================================================
 * TARGET EVALUATION
 * ========================================================== */

function evaluateTarget(
  targetType,
  targetId,
  profile,
  options = {}
) {
  const normalizedTargetType =
    cleanString(
      targetType,
      ''
    )
      .trim()
      .toUpperCase();

  const normalizedTargetId =
    normalizeId(
      targetId
    );

  const safeProfile =
    isObject(
      profile
    )
      ? profile
      : {};

  const target =
    options.target ||
    registry.get(
      normalizedTargetType,
      normalizedTargetId
    ) ||
    null;

  const recruitmentContext =
    options.recruitmentContext ||
    null;

  if (
    !normalizedTargetType ||
    !normalizedTargetId
  ) {
    return makeResult({
      status:
        RESULT.REVIEW_REQUIRED,
      targetType:
        normalizedTargetType ||
        null,
      target,
      ruleResults: [],
      options,
      recruitmentContext,
      reason:
        'A stable target type and target ID are required for eligibility evaluation.'
    });
  }

  const directRules =
    getRulesForTarget(
      normalizedTargetType,
      normalizedTargetId
    );

  const rules =
    expandRules(
      directRules
    );

  const ruleResults =
    [];

  for (
    let index = 0;
    index <
    rules.length;
    index += 1
  ) {
    const rule =
      rules[index];

    const evaluated =
      evaluateCanonicalRule(
        safeProfile,
        rule,
        recruitmentContext,
        options
      );

    const trace =
      makeRuleTrace(
        rule,
        evaluated,
        index
      );

    ruleResults.push(
      trace
    );
  }

  /*
   * No canonical hard rules is UNKNOWN/REVIEW_REQUIRED, never DIRECT.
   *
   * This is one of the most important changes from the old implementation.
   * Absence of data is not proof of eligibility.
   */
  if (
    !rules.length
  ) {
    return makeResult({
      status:
        RESULT.REVIEW_REQUIRED,
      targetType:
        normalizedTargetType,
      target,
      ruleResults: [],
      options,
      recruitmentContext,
      reason:
        'No active hard eligibility rules are attached to this target. Eligibility cannot be established automatically.'
    });
  }

  const failed =
    ruleResults.filter(
      (item) =>
        item.status ===
        RESULT.NOT_ELIGIBLE
    );

  const reviews =
    ruleResults.filter(
      (item) =>
        item.status ===
          RESULT.REVIEW_REQUIRED ||
        item.status ===
          RESULT.UNKNOWN
    );

  const conditionals =
    ruleResults.filter(
      (item) =>
        item.status ===
        RESULT.CONDITIONAL
    );

  /*
   * A mandatory failed hard rule is an immediate hard failure.
   */
  const mandatoryFailure =
    failed.some(
      (item) =>
        item.mandatory !== false
    );

  if (
    mandatoryFailure
  ) {
    return makeResult({
      status:
        RESULT.NOT_ELIGIBLE,
      targetType:
        normalizedTargetType,
      target,
      ruleResults,
      options,
      recruitmentContext,
      reason:
        failed[0]?.reason ||
        'At least one mandatory hard eligibility requirement failed.'
    });
  }

  /*
   * A review-required rule blocks a DIRECT result.
   *
   * We intentionally do this even when other requirements pass.
   */
  if (
    reviews.length
  ) {
    return makeResult({
      status:
        RESULT.REVIEW_REQUIRED,
      targetType:
        normalizedTargetType,
      target,
      ruleResults,
      options,
      recruitmentContext,
      reason:
        reviews[0]?.reason ||
        'One or more mandatory eligibility requirements require verification.'
    });
  }

  /*
   * Conditional requirements are surfaced as CONDITIONAL.
   */
  if (
    conditionals.length
  ) {
    return makeResult({
      status:
        RESULT.CONDITIONAL,
      targetType:
        normalizedTargetType,
      target,
      ruleResults,
      options,
      recruitmentContext,
      reason:
        conditionals[0]?.reason ||
        'One or more eligibility requirements remain conditional.'
    });
  }

  return makeResult({
    status:
      RESULT.DIRECT,
    targetType:
      normalizedTargetType,
    target,
    ruleResults,
    options,
    recruitmentContext,
    reason:
      'All applicable active hard eligibility requirements passed deterministically.'
  });
}

/* ============================================================
 * PUBLIC TARGET WRAPPERS
 * ========================================================== */

function evaluateJob(
  job,
  profile,
  options = {}
) {
  if (
    !job?.id
  ) {
    return makeResult({
      status:
        RESULT.REVIEW_REQUIRED,
      targetType:
        'JOB',
      target:
        job,
      ruleResults: [],
      options,
      recruitmentContext:
        options.recruitmentContext ||
        null,
      reason:
        'Job record has no stable ID.'
    });
  }

  return evaluateTarget(
    'JOB',
    job.id,
    profile,
    {
      ...options,
      target:
        job
    }
  );
}

function evaluateExam(
  exam,
  profile,
  options = {}
) {
  if (
    !exam?.id
  ) {
    return makeResult({
      status:
        RESULT.REVIEW_REQUIRED,
      targetType:
        'EXAM',
      target:
        exam,
      ruleResults: [],
      options,
      recruitmentContext:
        options.recruitmentContext ||
        null,
      reason:
        'Exam record has no stable ID.'
    });
  }

  /*
   * Important:
   * An exam with no direct EXAM-level rules does NOT automatically
   * become eligible.
   *
   * If the recruitment architecture determines exam eligibility from
   * linked job/service rules, the caller should evaluate the relevant
   * job/cadre target and combine those results explicitly.
   */
  return evaluateTarget(
    'EXAM',
    exam.id,
    profile,
    {
      ...options,
      target:
        exam
    }
  );
}

function evaluateServiceCadre(
  serviceCadre,
  profile,
  options = {}
) {
  if (
    !serviceCadre?.id
  ) {
    return makeResult({
      status:
        RESULT.REVIEW_REQUIRED,
      targetType:
        'SERVICE_CADRE',
      target:
        serviceCadre,
      ruleResults: [],
      options,
      recruitmentContext:
        options.recruitmentContext ||
        null,
      reason:
        'Service/cadre record has no stable ID.'
    });
  }

  return evaluateTarget(
    'SERVICE_CADRE',
    serviceCadre.id,
    profile,
    {
      ...options,
      target:
        serviceCadre
    }
  );
}

/* ============================================================
 * BULK JOB EVALUATION
 * ========================================================== */

function getAllJobs() {
  return registry.getAll(
    'JOB'
  );
}

function evaluateAllJobs(
  profile,
  options = {}
) {
  const {
    includeNotEligible = true,
    includeReviewRequired = true,
    includeConditional = true,
    includeDirect = true
  } = options;

  return getAllJobs()
    .map(
      (job) =>
        evaluateJob(
          job,
          profile,
          options
        )
    )
    .filter(
      (result) => {
        switch (
          result.status
        ) {
          case RESULT.NOT_ELIGIBLE:
            return includeNotEligible;

          case RESULT.REVIEW_REQUIRED:
          case RESULT.UNKNOWN:
            return includeReviewRequired;

          case RESULT.CONDITIONAL:
            return includeConditional;

          case RESULT.DIRECT:
            return includeDirect;

          default:
            return false;
        }
      }
    );
}

/* ============================================================
 * SUMMARY
 * ========================================================== */

function summarizeEligibility(
  results
) {
  const summary = {
    total:
      0,

    direct:
      0,

    conditional:
      0,

    notEligible:
      0,

    reviewRequired:
      0,

    unknown:
      0
  };

  for (
    const result of
      results || []
  ) {
    summary.total +=
      1;

    switch (
      result.status
    ) {
      case RESULT.DIRECT:
        summary.direct +=
          1;
        break;

      case RESULT.CONDITIONAL:
        summary.conditional +=
          1;
        break;

      case RESULT.NOT_ELIGIBLE:
        summary.notEligible +=
          1;
        break;

      case RESULT.REVIEW_REQUIRED:
        summary.reviewRequired +=
          1;
        break;

      case RESULT.UNKNOWN:
        summary.unknown +=
          1;
        break;

      default:
        break;
    }
  }

  return summary;
}

/* ============================================================
 * LOW-LEVEL PUBLIC RULE EVALUATION
 * ========================================================== */

function evaluateRule(
  profile,
  rule,
  options = {}
) {
  const safeRule =
    clone(
      rule
    );

  if (
    !safeRule?.id
  ) {
    return {
      status:
        RESULT.REVIEW_REQUIRED,
      reason:
        'Eligibility rule is malformed or has no stable ID.'
    };
  }

  return evaluateCanonicalRule(
    isObject(profile)
      ? profile
      : {},
    safeRule,
    options.recruitmentContext ||
      null,
    options
  );
}

/* ============================================================
 * EXPORTS
 * ========================================================== */

export {
  RESULT as ELIGIBILITY_RESULT,
  RULE_CLASS,
  EFFECT,
  OPERATORS,

  evaluateRule,
  evaluateTarget,
  evaluateJob,
  evaluateExam,
  evaluateServiceCadre,
  evaluateAllJobs,
  summarizeEligibility,

  getRulesForTarget,
  calculateAge,

  getCandidateValues,
  getRuleExpectedValue
};

export default {
  RESULT,
  evaluateRule,
  evaluateTarget,
  evaluateJob,
  evaluateExam,
  evaluateServiceCadre,
  evaluateAllJobs,
  summarizeEligibility,
  getRulesForTarget,
  calculateAge
};
