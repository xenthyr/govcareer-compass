/**
 * GovCareer Compass
 * ============================================================
 * HARD ELIGIBILITY ENGINE
 * ============================================================
 *
 * Purpose
 * -------
 * Determines whether a candidate is:
 *
 *   DIRECTLY_ELIGIBLE
 *   CONDITIONALLY_ELIGIBLE
 *   NOT_ELIGIBLE
 *   MANUAL_VERIFICATION
 *
 * for a job/exam/service/cadre.
 *
 * IMPORTANT
 * ---------
 * This engine evaluates legal/procedural eligibility only.
 *
 * It must NOT:
 * - rank careers;
 * - reward salary;
 * - consider prestige;
 * - override missing mandatory qualifications;
 * - convert preferences into eligibility.
 *
 * Data source
 * -----------
 * Canonical records are read from the runtime registry.
 *
 * Relationship
 * ------------
 *
 * Candidate Profile
 *       ↓
 * Eligibility Rules
 *       ↓
 * Rule Evaluation
 *       ↓
 * Eligibility Result
 *       ↓
 * Recommendation Layer
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
  MANUAL_VERIFICATION: 'MANUAL_VERIFICATION'
});

const RULE_CLASS = Object.freeze({
  HARD: 'HARD',
  SOFT: 'SOFT'
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

  if (
    typeof structuredClone === 'function'
  ) {
    try {
      return structuredClone(value);
    } catch {
      // Fall through.
    }
  }

  try {
    return JSON.parse(
      JSON.stringify(value)
    );
  } catch {
    return value;
  }
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

  let current = object;

  for (const part of parts) {
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

function hasValue(
  candidateValue,
  expectedValue
) {
  const actualValues =
    asArray(candidateValue);

  const expectedValues =
    asArray(expectedValue);

  return expectedValues.every(
    (expected) =>
      actualValues.some(
        (actual) =>
          valuesEqual(
            actual,
            expected
          )
      )
  );
}

function anyValue(
  candidateValue,
  expectedValue
) {
  const actualValues =
    asArray(candidateValue);

  const expectedValues =
    asArray(expectedValue);

  return expectedValues.some(
    (expected) =>
      actualValues.some(
        (actual) =>
          valuesEqual(
            actual,
            expected
          )
      )
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
    ).toUpperCase();

  switch (normalizedOperator) {
    case OPERATORS.EQ:
      return valuesEqual(
        actual,
        expected
      );

    case OPERATORS.NEQ:
      return !valuesEqual(
        actual,
        expected
      );

    case OPERATORS.GT:
      return (
        Number(actual) >
        Number(expected)
      );

    case OPERATORS.GTE:
      return (
        Number(actual) >=
        Number(expected)
      );

    case OPERATORS.LT:
      return (
        Number(actual) <
        Number(expected)
      );

    case OPERATORS.LTE:
      return (
        Number(actual) <=
        Number(expected)
      );

    case OPERATORS.IN:
      return asArray(
        expected
      ).some(
        (item) =>
          valuesEqual(
            actual,
            item
          )
      );

    case OPERATORS.NOT_IN:
      return !asArray(
        expected
      ).some(
        (item) =>
          valuesEqual(
            actual,
            item
          )
      );

    case OPERATORS.HAS:
      return hasValue(
        actual,
        expected
      );

    case OPERATORS.NOT_HAS:
      return !hasValue(
        actual,
        expected
      );

    case OPERATORS.ALL_OF:
      return hasValue(
        actual,
        expected
      );

    case OPERATORS.ANY_OF:
      return anyValue(
        actual,
        expected
      );

    case OPERATORS.NONE_OF:
      return !anyValue(
        actual,
        expected
      );

    default:
      return null;
  }
}

function getCandidateValues(
  profile,
  rule
) {
  const candidates = [];

  const addPath =
    (path) => {
      const value =
        getNestedValue(
          profile,
          path
        );

      if (
        value !== MISSING
      ) {
        candidates.push(
          value
        );
      }
    };

  switch (
    rule.conditionType
  ) {
    case 'EDUCATION_LEVEL':
      addPath(
        'education.level'
      );
      addPath(
        'educationLevels'
      );
      addPath(
        'highestEducationLevel'
      );
      break;

    case 'QUALIFICATION':
      addPath(
        'qualifications'
      );
      addPath(
        'qualificationIds'
      );
      break;

    case 'DEGREE':
      addPath(
        'degree.id'
      );
      addPath(
        'degreeId'
      );
      addPath(
        'degrees'
      );
      break;

    case 'SUBJECT':
      addPath(
        'subjects'
      );
      addPath(
        'subjectIds'
      );
      break;

    case 'MATHEMATICS':
      addPath(
        'subjects.mathematics'
      );
      addPath(
        'academic.mathematics'
      );
      addPath(
        'mathematics'
      );
      break;

    case 'STATISTICS':
      addPath(
        'subjects.statistics'
      );
      addPath(
        'academic.statistics'
      );
      addPath(
        'statistics'
      );
      break;

    case 'ECONOMICS':
      addPath(
        'subjects.economics'
      );
      addPath(
        'academic.economics'
      );
      addPath(
        'economics'
      );
      break;

    case 'COMMERCE':
      addPath(
        'subjects.commerce'
      );
      addPath(
        'academic.commerce'
      );
      addPath(
        'commerce'
      );
      break;

    case 'SCIENCE':
      addPath(
        'subjects.science'
      );
      addPath(
        'academic.science'
      );
      addPath(
        'science'
      );
      break;

    case 'LANGUAGE':
      addPath(
        'languages'
      );
      addPath(
        'languageIds'
      );
      break;

    case 'COMPUTER_KNOWLEDGE':
      addPath(
        'skills.computerKnowledge'
      );
      addPath(
        'computerKnowledge'
      );
      addPath(
        'skills'
      );
      break;

    case 'TYPING':
      addPath(
        'skills.typing'
      );
      addPath(
        'typing'
      );
      break;

    case 'SHORTHAND':
      addPath(
        'skills.shorthand'
      );
      addPath(
        'shorthand'
      );
      break;

    case 'DRIVING_LICENCE':
      addPath(
        'licences.driving'
      );
      addPath(
        'drivingLicence'
      );
      addPath(
        'drivingLicense'
      );
      break;

    case 'EXPERIENCE':
      addPath(
        'experience'
      );
      addPath(
        'experiences'
      );
      break;

    case 'AGE':
      addPath(
        'age'
      );
      addPath(
        'dateOfBirth'
      );
      break;

    case 'CITIZENSHIP':
      addPath(
        'citizenship'
      );
      addPath(
        'citizenshipId'
      );
      break;

    case 'DOMICILE':
      addPath(
        'domicile'
      );
      addPath(
        'domicileId'
      );
      addPath(
        'stateId'
      );
      break;

    case 'RESERVATION':
    case 'CATEGORY':
      addPath(
        'reservation.category'
      );
      addPath(
        'category'
      );
      addPath(
        'reservationCategory'
      );
      break;

    case 'GENDER':
      addPath(
        'gender'
      );
      break;

    case 'PHYSICAL_STANDARD':
    case 'PHYSICAL_EFFICIENCY_TEST':
    case 'HEIGHT':
    case 'CHEST':
    case 'RUNNING':
    case 'WALKING':
    case 'CYCLING':
    case 'FITNESS':
      addPath(
        'physical'
      );
      addPath(
        'physicalEligibility'
      );
      break;

    case 'MEDICAL_STANDARD':
    case 'EYESIGHT':
      addPath(
        'medical'
      );
      addPath(
        'medicalEligibility'
      );
      break;

    case 'BED':
      addPath(
        'qualifications.bed'
      );
      addPath(
        'hasBed'
      );
      break;

    case 'DELED':
      addPath(
        'qualifications.deled'
      );
      addPath(
        'hasDeled'
      );
      break;

    case 'BELED':
      addPath(
        'qualifications.beled'
      );
      addPath(
        'hasBeled'
      );
      break;

    case 'ITI':
      addPath(
        'qualifications.iti'
      );
      addPath(
        'iti'
      );
      break;

    case 'DIPLOMA':
      addPath(
        'qualifications.diploma'
      );
      addPath(
        'diplomas'
      );
      break;

    case 'TET':
      addPath(
        'qualifications.tet'
      );
      addPath(
        'tet'
      );
      break;

    default:
      if (
        rule.profileField
      ) {
        addPath(
          rule.profileField
        );
      }

      if (
        rule.candidateField
      ) {
        addPath(
          rule.candidateField
        );
      }
  }

  return candidates;
}

function flattenCandidateValues(
  values
) {
  return values.flatMap(
    (value) => {
      if (
        Array.isArray(value)
      ) {
        return value;
      }

      if (
        isObject(value)
      ) {
        return Object.values(
          value
        ).flatMap(
          (inner) =>
            Array.isArray(
              inner
            )
              ? inner
              : [inner]
        );
      }

      return [value];
    }
  );
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
    rule.qualificationIds?.length
  ) {
    return rule.qualificationIds;
  }

  if (
    rule.subjectIds?.length
  ) {
    return rule.subjectIds;
  }

  if (
    rule.requiredQualificationIds
      ?.length
  ) {
    return rule.requiredQualificationIds;
  }

  if (
    rule.requiredSubjectIds?.length
  ) {
    return rule.requiredSubjectIds;
  }

  if (
    rule.requiredLanguages?.length
  ) {
    return rule.requiredLanguages;
  }

  if (
    rule.requiredSkills?.length
  ) {
    return rule.requiredSkills;
  }

  return undefined;
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

  return age >= 0
    ? age
    : null;
}

function evaluateAgeRule(
  profile,
  rule
) {
  let age =
    profile.age;

  if (
    age === undefined ||
    age === null
  ) {
    age =
      calculateAge(
        profile.dateOfBirth ||
          profile?.personal
            ?.dateOfBirth,
        rule.referenceDate
      );
  }

  if (
    !Number.isFinite(
      Number(age)
    )
  ) {
    return {
      status:
        RESULT.MANUAL_VERIFICATION,
      reason:
        'Candidate age could not be established from the available profile information.'
    };
  }

  const numericAge =
    Number(age);

  if (
    rule.minimumAge !==
      undefined &&
    numericAge <
      Number(
        rule.minimumAge
      )
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        `Candidate age ${numericAge} is below the minimum age requirement.`
    };
  }

  if (
    rule.maximumAge !==
      undefined &&
    numericAge >
      Number(
        rule.maximumAge
      )
  ) {
    return {
      status:
        RESULT.NOT_ELIGIBLE,
      reason:
        `Candidate age ${numericAge} exceeds the maximum age requirement.`
    };
  }

  return {
    status:
      RESULT.DIRECT
  };
}

function evaluateMarksRule(
  profile,
  rule
) {
  const marks =
    profile.marks ??
    profile.education?.marks ??
    profile.academic?.marks;

  const percentage =
    profile.percentage ??
    profile.education?.percentage ??
    profile.academic?.percentage;

  if (
    rule.minimumPercentage !==
      undefined
  ) {
    if (
      !Number.isFinite(
        Number(
          percentage
        )
      )
    ) {
      return {
        status:
          RESULT.MANUAL_VERIFICATION,
        reason:
          'Required percentage information is missing.'
      };
    }

    if (
      Number(percentage) <
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
      undefined &&
    Number.isFinite(
      Number(
        percentage
      )
    )
  ) {
    if (
      Number(percentage) >
        Number(
          rule.maximumPercentage
        )
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          `Candidate percentage exceeds the permitted maximum.`
      };
    }
  }

  if (
    rule.minimumMarks !==
      undefined
  ) {
    if (
      !Number.isFinite(
        Number(
          marks
        )
      )
    ) {
      return {
        status:
          RESULT.MANUAL_VERIFICATION,
        reason:
          'Required marks information is missing.'
      };
    }

    if (
      Number(marks) <
        Number(
          rule.minimumMarks
        )
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          'Candidate marks are below the required threshold.'
      };
    }
  }

  return {
    status:
      RESULT.DIRECT
  };
}

function evaluatePhysicalRule(
  profile,
  rule
) {
  const physical =
    profile.physical ||
    profile.physicalEligibility;

  if (!isObject(physical)) {
    return {
      status:
        RESULT.MANUAL_VERIFICATION,
      reason:
        'Physical eligibility information is not available.'
    };
  }

  const standard =
    rule.physicalStandard;

  if (!isObject(standard)) {
    return {
      status:
        RESULT.MANUAL_VERIFICATION,
      reason:
        'The applicable physical standard requires manual verification.'
    };
  }

  if (
    standard.gender &&
    standard.gender !== 'ANY'
  ) {
    if (
      !physical.gender
    ) {
      return {
        status:
          RESULT.MANUAL_VERIFICATION,
        reason:
          'Gender-specific physical standard requires candidate verification.'
      };
    }

    if (
      cleanString(
        physical.gender
      ).toUpperCase() !==
      standard.gender
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          'Candidate gender does not match the stated physical-standard category.'
      };
    }
  }

  const numericChecks = [
    [
      'minimumHeightCm',
      'heightCm'
    ],
    [
      'minimumChestCm',
      'chestCm'
    ],
    [
      'minimumExpandedChestCm',
      'expandedChestCm'
    ]
  ];

  for (
    const [
      requiredField,
      candidateField
    ] of numericChecks
  ) {
    if (
      standard[
        requiredField
      ] === undefined
    ) {
      continue;
    }

    const actual =
      Number(
        physical[
          candidateField
        ]
      );

    if (
      !Number.isFinite(actual)
    ) {
      return {
        status:
          RESULT.MANUAL_VERIFICATION,
        reason:
          `Candidate ${candidateField} is required for physical verification.`
      };
    }

    if (
      actual <
      Number(
        standard[
          requiredField
        ]
      )
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        reason:
          `Candidate ${candidateField} does not meet the required physical standard.`
      };
    }
  }

  return {
    status:
      RESULT.DIRECT
  };
}

function evaluateRule(
  profile,
  rule,
  {
    allowSoftRules = false
  } = {}
) {
  if (
    !isObject(rule)
  ) {
    return {
      status:
        RESULT.MANUAL_VERIFICATION,
      reason:
        'Eligibility rule is malformed.'
    };
  }

  const ruleClass =
    cleanString(
      rule.ruleClass,
      RULE_CLASS.HARD
    ).toUpperCase();

  if (
    ruleClass !==
      RULE_CLASS.HARD &&
    !allowSoftRules
  ) {
    return {
      status:
        RESULT.DIRECT,
      skipped: true,
      reason:
        'Soft rule is handled by the recommendation layer.'
    };
  }

  const condition =
    cleanString(
      rule.conditionType,
      'OTHER'
    ).toUpperCase();

  if (
    condition === 'AGE'
  ) {
    return evaluateAgeRule(
      profile,
      rule
    );
  }

  if (
    condition ===
      'MARKS' ||
    condition ===
      'PERCENTAGE'
  ) {
    return evaluateMarksRule(
      profile,
      rule
    );
  }

  if (
    condition ===
      'PHYSICAL_STANDARD' ||
    condition ===
      'PHYSICAL_EFFICIENCY_TEST' ||
    condition ===
      'HEIGHT' ||
    condition ===
      'CHEST' ||
    condition ===
      'RUNNING' ||
    condition ===
      'WALKING' ||
    condition ===
      'CYCLING' ||
    condition ===
      'FITNESS'
  ) {
    return evaluatePhysicalRule(
      profile,
      rule
    );
  }

  const candidateValues =
    flattenCandidateValues(
      getCandidateValues(
        profile,
        rule
      )
    );

  if (
    candidateValues.length ===
    0
  ) {
    return {
      status:
        RESULT.MANUAL_VERIFICATION,
      reason:
        `Candidate information required for "${condition}" is unavailable.`
    };
  }

  const expected =
    getRuleExpectedValue(
      rule
    );

  if (
    expected ===
    undefined
  ) {
    return {
      status:
        RESULT.MANUAL_VERIFICATION,
      reason:
        'Eligibility rule does not contain a usable comparison value.'
    };
  }

  const matches =
    candidateValues.some(
      (candidateValue) =>
        evaluateOperator(
          candidateValue,
          rule.operator,
          expected
        ) === true
    );

  if (
    matches
  ) {
    return {
      status:
        RESULT.DIRECT
    };
  }

  if (
    rule.exceptions?.length
  ) {
    for (
      const exception of
        rule.exceptions
    ) {
      if (
        evaluateException(
          profile,
          exception
        )
      ) {
        if (
          exception.effect ===
          'ALLOW'
        ) {
          return {
            status:
              RESULT.DIRECT,
            exceptionApplied:
              true
          };
        }

        if (
          exception.effect ===
          'DISALLOW'
        ) {
          return {
            status:
              RESULT.NOT_ELIGIBLE,
            exceptionApplied:
              true,
            reason:
              'A rule exception makes the candidate ineligible.'
          };
        }
      }
    }
  }

  return {
    status:
      RESULT.NOT_ELIGIBLE,
    reason:
      `Candidate does not satisfy the required ${condition.toLowerCase()} condition.`
  };
}

function evaluateException(
  profile,
  exception
) {
  if (
    !exception?.condition
  ) {
    return false;
  }

  /*
   * Exception conditions are deliberately treated as a
   * small declarative expression language.
   *
   * Supported examples:
   *   "candidate.gender === 'FEMALE'"
   *
   * We DO NOT execute arbitrary JavaScript.
   *
   * The supported implementation only handles:
   *   profile.path
   *   ==
   *   ===
   *   !=
   *   !==
   * with quoted/string/numeric/boolean values.
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
    expected ===
    undefined
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

function parseLiteral(
  value
) {
  const text =
    String(
      value
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
    text ===
    'true'
  ) {
    return true;
  }

  if (
    text ===
    'false'
  ) {
    return false;
  }

  if (
    text ===
    'null'
  ) {
    return null;
  }

  const number =
    Number(text);

  if (
    Number.isFinite(
      number
    )
  ) {
    return number;
  }

  return undefined;
}

function getRulesForTarget(
  targetType,
  targetId
) {
  return registry.find(
    'ELIGIBILITY_RULE',
    (rule) =>
      rule.targetType ===
        targetType &&
      rule.targetId ===
        targetId &&
      (
        rule.ruleClass ===
          RULE_CLASS.HARD ||
        rule.ruleClass ===
          undefined
      ) &&
      (
        rule.status ===
          undefined ||
        rule.status ===
          'ACTIVE'
      )
  );
}

function getInheritedRuleIds(
  rule
) {
  return normalizeIdArray(
    rule.dependsOnRuleIds
  );
}

function expandRules(
  rules
) {
  const result = [];
  const visited =
    new Set();

  const visit =
    (rule) => {
      if (
        !rule?.id ||
        visited.has(
          rule.id
        )
      ) {
        return;
      }

      visited.add(
        rule.id
      );

      getInheritedRuleIds(
        rule
      ).forEach(
        (parentId) => {
          const parent =
            registry.get(
              'ELIGIBILITY_RULE',
              parentId
            );

          if (parent) {
            visit(
              parent
            );
          }
        }
      );

      result.push(
        rule
      );
    };

  rules.forEach(visit);

  return result;
}

function evaluateTarget(
  targetType,
  targetId,
  profile,
  options = {}
) {
  const directRules =
    getRulesForTarget(
      targetType,
      targetId
    );

  const rules =
    expandRules(
      directRules
    );

  const ruleResults =
    [];

  let hasConditional =
    false;

  let manualVerification =
    false;

  for (
    const rule of rules
  ) {
    const result =
      evaluateRule(
        profile,
        rule,
        options
      );

    ruleResults.push({
      ruleId:
        rule.id,
      conditionType:
        rule.conditionType,
      ruleClass:
        rule.ruleClass ??
        RULE_CLASS.HARD,
      status:
        result.status,
      reason:
        result.reason ??
        null,
      exceptionApplied:
        Boolean(
          result.exceptionApplied
        )
    });

    if (
      result.status ===
      RESULT.NOT_ELIGIBLE
    ) {
      return {
        status:
          RESULT.NOT_ELIGIBLE,
        eligible:
          false,
        conditionallyEligible:
          false,
        manualVerification:
          false,
        ruleResults,
        failedRuleIds:
          ruleResults
            .filter(
              (item) =>
                item.status ===
                RESULT.NOT_ELIGIBLE
            )
            .map(
              (item) =>
                item.ruleId
            )
      };
    }

    if (
      result.status ===
      RESULT.MANUAL_VERIFICATION
    ) {
      manualVerification =
        true;
    }

    if (
      result.status ===
      RESULT.CONDITIONAL
    ) {
      hasConditional =
        true;
    }
  }

  if (
    manualVerification
  ) {
    return {
      status:
        RESULT.MANUAL_VERIFICATION,
      eligible:
        false,
      conditionallyEligible:
        false,
      manualVerification:
        true,
      ruleResults,
      failedRuleIds: [],
      manualRuleIds:
        ruleResults
          .filter(
            (item) =>
              item.status ===
              RESULT.MANUAL_VERIFICATION
          )
          .map(
            (item) =>
              item.ruleId
          )
    };
  }

  if (
    hasConditional
  ) {
    return {
      status:
        RESULT.CONDITIONAL,
      eligible:
        true,
      conditionallyEligible:
        true,
      manualVerification:
        false,
      ruleResults,
      failedRuleIds: []
    };
  }

  return {
    status:
      RESULT.DIRECT,
    eligible:
      true,
    conditionallyEligible:
      false,
    manualVerification:
      false,
    ruleResults,
    failedRuleIds: []
  };
}

function evaluateJob(
  job,
  profile,
  options = {}
) {
  if (!job?.id) {
    return {
      status:
        RESULT.MANUAL_VERIFICATION,
      eligible:
        false,
      reason:
        'Job record has no stable ID.'
    };
  }

  const result =
    evaluateTarget(
      'JOB',
      job.id,
      profile,
      options
    );

  /*
   * If there are no rules attached to the job,
   * the engine should not invent ineligibility.
   *
   * Such a record is manual-review rather than
   * automatically "eligible".
   */
  const hasRules =
    result.ruleResults?.length >
    0;

  if (!hasRules) {
    return {
      ...result,
      status:
        RESULT.MANUAL_VERIFICATION,
      eligible:
        false,
      manualVerification:
        true,
      reason:
        'No active hard eligibility rules were found for this job.'
    };
  }

  return {
    ...result,
    jobId:
      job.id
  };
}

function evaluateExam(
  exam,
  profile,
  options = {}
) {
  if (!exam?.id) {
    return {
      status:
        RESULT.MANUAL_VERIFICATION,
      eligible:
        false,
      reason:
        'Exam record has no stable ID.'
    };
  }

  const result =
    evaluateTarget(
      'EXAM',
      exam.id,
      profile,
      options
    );

  const hasRules =
    result.ruleResults?.length >
    0;

  if (!hasRules) {
    /*
     * An exam may rely entirely on job-level rules.
     * Do not automatically call it ineligible.
     */
    return {
      ...result,
      examId:
        exam.id,
      status:
        RESULT.DIRECT,
      eligible:
        true,
      manuallyReviewed:
        false,
      ruleSource:
        'POST_RULES_OR_EXAM_DATA'
    };
  }

  return {
    ...result,
    examId:
      exam.id
  };
}

function evaluateServiceCadre(
  serviceCadre,
  profile,
  options = {}
) {
  if (!serviceCadre?.id) {
    return {
      status:
        RESULT.MANUAL_VERIFICATION,
      eligible:
        false,
      reason:
        'Service/cadre record has no stable ID.'
    };
  }

  return {
    ...evaluateTarget(
      'SERVICE_CADRE',
      serviceCadre.id,
      profile,
      options
    ),
    serviceCadreId:
      serviceCadre.id
  };
}

function getAllJobs() {
  return registry.getAll(
    'JOB'
  );
}

function evaluateAllJobs(
  profile,
  {
    includeNotEligible = true,
    includeManualVerification = true
  } = {}
) {
  const jobs =
    getAllJobs();

  return jobs
    .map(
      (job) =>
        evaluateJob(
          job,
          profile
        )
    )
    .filter(
      (result) => {
        if (
          result.status ===
          RESULT.NOT_ELIGIBLE
        ) {
          return includeNotEligible;
        }

        if (
          result.status ===
          RESULT.MANUAL_VERIFICATION
        ) {
          return includeManualVerification;
        }

        return true;
      }
    );
}

function summarizeEligibility(
  results
) {
  const summary = {
    total: 0,
    direct: 0,
    conditional: 0,
    notEligible: 0,
    manualVerification: 0
  };

  results.forEach(
    (result) => {
      summary.total += 1;

      switch (
        result.status
      ) {
        case RESULT.DIRECT:
          summary.direct += 1;
          break;

        case RESULT.CONDITIONAL:
          summary.conditional += 1;
          break;

        case RESULT.NOT_ELIGIBLE:
          summary.notEligible += 1;
          break;

        case RESULT.MANUAL_VERIFICATION:
          summary.manualVerification +=
            1;
          break;

        default:
          break;
      }
    }
  );

  return summary;
}

export {
  RESULT as ELIGIBILITY_RESULT,
  RULE_CLASS,
  OPERATORS,
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

export default {
  RESULT,
  evaluateRule,
  evaluateTarget,
  evaluateJob,
  evaluateExam,
  evaluateServiceCadre,
  evaluateAllJobs,
  summarizeEligibility
};
