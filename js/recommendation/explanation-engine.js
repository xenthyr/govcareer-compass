/**
 * GovCareer Compass
 * ============================================================
 * CAREER EXPLANATION ENGINE
 * ============================================================
 *
 * Purpose
 * -------
 * Converts finalized eligibility, preference and scoring output
 * into transparent, structured, deterministic explanations.
 *
 * Canonical pipeline
 * ------------------
 *
 *   Eligibility Engine
 *          ↓
 *   Preference Engine
 *          ↓
 *   Scoring Engine
 *          ↓
 *   Ranking Engine
 *          ↓
 *   Explanation Engine
 *          ↓
 *   UI / Compass AI
 *
 * The Explanation Engine is READ-ONLY with respect to decision
 * logic.
 *
 * It must NOT:
 * - determine eligibility;
 * - calculate eligibility;
 * - calculate preference fit;
 * - calculate scores;
 * - rank careers;
 * - inspect raw job facts to invent trade-offs;
 * - infer missing reasons;
 * - replace unknown information with assumptions.
 *
 * It may only explain:
 * - eligibility results supplied by eligibility-engine.js;
 * - score information supplied by scoring-engine.js;
 * - preference information supplied by preference/scoring output;
 * - ranking information supplied by ranking-engine.js;
 * - source/confidence information already present in those results.
 *
 * Output
 * ------
 * A single structured explanation contract is used across:
 *
 *   Career Results
 *   Job Details
 *   Compare
 *   Rankings
 *   Compass AI
 *
 * Explanation categories
 * ----------------------
 * - eligibility
 * - recommendation
 * - preferenceMatches
 * - preferenceConflicts
 * - tradeoffs
 * - uncertainty
 * - evidence
 * - ranking
 *
 * IMPORTANT
 * ---------
 * Explanations are derived output, not a source of truth.
 *
 * The source of truth remains:
 *   eligibility-engine.js
 *   preference-engine.js
 *   scoring-engine.js
 *   ranking-engine.js
 */

import {
  ELIGIBILITY_RESULT
} from './eligibility-engine.js';

import {
  getScoreBand,
  getConfidenceScore
} from './scoring-engine.js';

/* ============================================================
 * CONSTANTS
 * ========================================================== */

const STATUS_LABELS =
  Object.freeze({
    DIRECT:
      'Directly eligible',

    CONDITIONAL:
      'Conditionally eligible',

    REVIEW_REQUIRED:
      'Verification required',

    UNKNOWN:
      'Eligibility unknown',

    NOT_ELIGIBLE:
      'Not eligible',

    /*
     * Compatibility for older result objects.
     */
    MANUAL_VERIFICATION:
      'Verification required'
  });

const CONDITION_LABELS =
  Object.freeze({
    AGE:
      'age',

    EDUCATION_LEVEL:
      'education level',

    QUALIFICATION:
      'qualification',

    DEGREE:
      'degree',

    SUBJECT:
      'subject',

    MATHEMATICS:
      'mathematics requirement',

    STATISTICS:
      'statistics requirement',

    ECONOMICS:
      'economics requirement',

    COMMERCE:
      'commerce requirement',

    SCIENCE:
      'science requirement',

    LANGUAGE:
      'language requirement',

    LANGUAGES:
      'language requirement',

    COMPUTER:
      'computer-knowledge requirement',

    COMPUTER_KNOWLEDGE:
      'computer-knowledge requirement',

    TYPING:
      'typing requirement',

    TYPING_REQUIREMENT:
      'typing requirement',

    SHORTHAND:
      'shorthand requirement',

    EXPERIENCE:
      'experience requirement',

    DRIVING_LICENCE:
      'driving-licence requirement',

    DRIVING_LICENSE:
      'driving-licence requirement',

    LICENCE:
      'licence requirement',

    LICENSE:
      'licence requirement',

    CITIZENSHIP:
      'citizenship requirement',

    DOMICILE:
      'domicile requirement',

    RESERVATION:
      'reservation/category requirement',

    CATEGORY:
      'category requirement',

    GENDER:
      'gender requirement',

    PHYSICAL_STANDARD:
      'physical standard',

    PHYSICAL_EFFICIENCY_TEST:
      'physical-efficiency requirement',

    HEIGHT:
      'height requirement',

    CHEST:
      'chest requirement',

    RUNNING:
      'running requirement',

    WALKING:
      'walking requirement',

    CYCLING:
      'cycling requirement',

    FITNESS:
      'fitness requirement',

    MEDICAL_STANDARD:
      'medical standard',

    EYESIGHT:
      'eyesight requirement',

    MARKS:
      'marks requirement',

    PERCENTAGE:
      'percentage requirement'
  });

const PREFERENCE_LABELS =
  Object.freeze({
    salaryImportance:
      'salary',

    authorityImportance:
      'authority',

    careerGrowthImportance:
      'career growth',

    workLifeBalanceImportance:
      'work-life balance',

    familyImportance:
      'family compatibility',

    parentCareImportance:
      'elderly-parent compatibility',

    kolkataImportance:
      'Kolkata stability',

    locationStabilityImportance:
      'location stability',

    transferTolerance:
      'transfer burden',

    ruralPostingTolerance:
      'rural-posting burden',

    nightDutyTolerance:
      'night-duty burden',

    shiftDutyTolerance:
      'shift-duty burden',

    physicalRiskTolerance:
      'physical risk',

    stressTolerance:
      'stress',

    publicInteractionImportance:
      'public interaction',

    fieldWorkImportance:
      'field work',

    uniformImportance:
      'uniform preference',

    prestigeImportance:
      'prestige/social status',

    housingImportance:
      'housing advantage',

    englishAdvantageImportance:
      'English advantage',

    jobSecurityImportance:
      'job stability',

    examDifficultyTolerance:
      'exam difficulty',

    preparationBurdenTolerance:
      'preparation burden'
  });

const CATEGORY_LABELS =
  Object.freeze({
    location:
      'location',

    transfer:
      'transfer',

    rural:
      'rural posting',

    family:
      'family compatibility',

    parentCare:
      'parent-care compatibility',

    salary:
      'salary',

    workLife:
      'work-life balance',

    physical:
      'physical demands',

    medical:
      'medical requirements',

    stress:
      'stress',

    nightDuty:
      'night duty',

    shiftDuty:
      'shift duty',

    publicInteraction:
      'public interaction',

    fieldWork:
      'field work',

    housing:
      'housing',

    careerGrowth:
      'career growth',

    examDifficulty:
      'exam difficulty',

    preparation:
      'preparation burden'
  });

/* ============================================================
 * BASIC HELPERS
 * ========================================================== */

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

function asArray(
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
    ? value
    : [value];
}

function cleanText(
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
    ).trim();

  return text ||
    fallback;
}

function numeric(
  value,
  fallback = null
) {
  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
}

function uniqueStrings(
  values
) {
  return [
    ...new Set(
      asArray(
        values
      )
        .map(
          (value) =>
            cleanText(
              value
            )
        )
        .filter(Boolean)
    )
  ];
}

function clone(
  value
) {
  if (
    value === undefined
  ) {
    return undefined;
  }

  if (
    typeof structuredClone ===
    'function'
  ) {
    try {
      return structuredClone(
        value
      );
    } catch {
      // Fall through.
    }
  }

  try {
    return JSON.parse(
      JSON.stringify(
        value
      )
    );
  } catch {
    return value;
  }
}

function normalizeStatus(
  status
) {
  const normalized =
    cleanText(
      status,
      'UNKNOWN'
    )
      .trim()
      .toUpperCase();

  if (
    normalized ===
    'MANUAL_VERIFICATION'
  ) {
    return 'REVIEW_REQUIRED';
  }

  if (
    normalized ===
      'DIRECT' ||
    normalized ===
      'CONDITIONAL' ||
    normalized ===
      'NOT_ELIGIBLE' ||
    normalized ===
      'REVIEW_REQUIRED' ||
    normalized ===
      'UNKNOWN'
  ) {
    return normalized;
  }

  return 'UNKNOWN';
}

/* ============================================================
 * CAREER ID / NAME / GOVERNMENT
 * ========================================================== */

function getCareerId(
  career,
  result
) {
  return (
    career?.id ??
    result?.careerId ??
    result?.jobId ??
    result?.examId ??
    result?.serviceCadreId ??
    null
  );
}

function getCareerName(
  career,
  result
) {
  const name =
    career?.name ??
    career?.post ??
    career?.postName ??
    career?.title ??
    career?.officialName ??
    result?.careerName;

  if (
    typeof name ===
    'string'
  ) {
    return name;
  }

  if (
    isObject(name)
  ) {
    return (
      name.en ??
      name.bn ??
      Object.values(
        name
      )[0] ??
      'This career'
    );
  }

  return 'This career';
}

function getGovernmentName(
  career,
  result
) {
  const value =
    career?.governmentName ??
    career?.governmentId ??
    result?.government ??
    result?.governmentName ??
    '';

  if (
    typeof value ===
    'string'
  ) {
    return value;
  }

  if (
    isObject(value)
  ) {
    return (
      value.en ??
      value.bn ??
      Object.values(
        value
      )[0] ??
      ''
    );
  }

  return '';
}

/* ============================================================
 * SCORE ACCESS
 * ============================================================
 *
 * No score is calculated here.
 *
 * These helpers only read values already supplied by the
 * scoring engine.
 */

function getOverallScore(
  scoredResult
) {
  const value =
    scoredResult?.score ??
    scoredResult?.overallScore;

  return numeric(
    value,
    null
  );
}

function getPreferenceScore(
  scoredResult
) {
  const value =
    scoredResult?.preferenceScore ??
    scoredResult?.preferenceEvaluation
      ?.score ??
    scoredResult?.scoreBreakdown
      ?.preferenceScore ??
    scoredResult?.breakdown
      ?.preferenceScore;

  return numeric(
    value,
    null
  );
}

function getScoreBreakdown(
  scoredResult
) {
  if (
    isObject(
      scoredResult?.scoreBreakdown
    )
  ) {
    return (
      scoredResult.scoreBreakdown
    );
  }

  if (
    isObject(
      scoredResult?.breakdown
    )
  ) {
    return (
      scoredResult.breakdown
    );
  }

  if (
    isObject(
      scoredResult?.scores
    )
  ) {
    return (
      scoredResult.scores
    );
  }

  return {};
}

function getScoreConfidence(
  scoredResult
) {
  return (
    scoredResult?.scoreConfidence ??
    scoredResult?.scoring?.confidence ??
    scoredResult?.scoreBreakdown
      ?.confidence ??
    'UNKNOWN'
  );
}

/* ============================================================
 * ELIGIBILITY EXPLANATION
 * ========================================================== */

function getEligibilityStatusLabel(
  status
) {
  const normalized =
    normalizeStatus(
      status
    );

  return (
    STATUS_LABELS[
      normalized
    ] ??
    STATUS_LABELS.UNKNOWN
  );
}

function getRuleConditionLabel(
  conditionType
) {
  const normalized =
    cleanText(
      conditionType,
      ''
    )
      .trim()
      .toUpperCase();

  return (
    CONDITION_LABELS[
      normalized
    ] ??
    formatCondition(
      normalized
    )
  );
}

function formatCondition(
  condition
) {
  const text =
    cleanText(
      condition,
      'this requirement'
    );

  return text
    .toLowerCase()
    .replace(
      /_/g,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function getRuleResults(
  eligibilityResult
) {
  return Array.isArray(
    eligibilityResult?.ruleResults
  )
    ? eligibilityResult.ruleResults
    : [];
}

function isPassedRule(
  rule
) {
  return (
    normalizeStatus(
      rule?.status
    ) === 'DIRECT' &&
    !rule?.skipped
  );
}

function isFailedRule(
  rule
) {
  return (
    normalizeStatus(
      rule?.status
    ) ===
    'NOT_ELIGIBLE'
  );
}

function isConditionalRule(
  rule
) {
  return (
    normalizeStatus(
      rule?.status
    ) ===
    'CONDITIONAL'
  );
}

function isReviewRule(
  rule
) {
  const status =
    normalizeStatus(
      rule?.status
    );

  return (
    status ===
      'REVIEW_REQUIRED' ||
    status ===
      'UNKNOWN'
  );
}

function buildPassedRequirements(
  eligibilityResult
) {
  return getRuleResults(
    eligibilityResult
  )
    .filter(
      isPassedRule
    )
    .map(
      (rule) => ({
        ruleId:
          rule.ruleId ??
          null,

        conditionType:
          rule.conditionType ??
          null,

        label:
          getRuleConditionLabel(
            rule.conditionType
          ),

        reason:
          cleanText(
            rule.reason,
            `The ${getRuleConditionLabel(
              rule.conditionType
            )} was satisfied.`
          ),

        sourceIds:
          uniqueStrings(
            rule.sourceIds
          ),

        sourceReferences:
          clone(
            rule.sourceReferences
          ) || [],

        confidence:
          cleanText(
            rule.confidence,
            'UNKNOWN'
          ),

        details:
          clone(
            rule.details
          ) ??
          null
      })
    );
}

function buildFailedRequirements(
  eligibilityResult
) {
  return getRuleResults(
    eligibilityResult
  )
    .filter(
      isFailedRule
    )
    .map(
      (rule) => ({
        ruleId:
          rule.ruleId ??
          null,

        conditionType:
          rule.conditionType ??
          null,

        label:
          getRuleConditionLabel(
            rule.conditionType
          ),

        reason:
          cleanText(
            rule.reason,
            `The ${getRuleConditionLabel(
              rule.conditionType
            )} was not satisfied.`
          ),

        sourceIds:
          uniqueStrings(
            rule.sourceIds
          ),

        sourceReferences:
          clone(
            rule.sourceReferences
          ) || [],

        confidence:
          cleanText(
            rule.confidence,
            'UNKNOWN'
          ),

        details:
          clone(
            rule.details
          ) ??
          null
      })
    );
}

function buildConditionalRequirements(
  eligibilityResult
) {
  return getRuleResults(
    eligibilityResult
  )
    .filter(
      isConditionalRule
    )
    .map(
      (rule) => ({
        ruleId:
          rule.ruleId ??
          null,

        conditionType:
          rule.conditionType ??
          null,

        label:
          getRuleConditionLabel(
            rule.conditionType
          ),

        reason:
          cleanText(
            rule.reason,
            `The ${getRuleConditionLabel(
              rule.conditionType
            )} remains conditional.`
          ),

        sourceIds:
          uniqueStrings(
            rule.sourceIds
          ),

        sourceReferences:
          clone(
            rule.sourceReferences
          ) || [],

        confidence:
          cleanText(
            rule.confidence,
            'UNKNOWN'
          ),

        details:
          clone(
            rule.details
          ) ??
          null
      })
    );
}

function buildReviewRequirements(
  eligibilityResult
) {
  return getRuleResults(
    eligibilityResult
  )
    .filter(
      isReviewRule
    )
    .map(
      (rule) => ({
        ruleId:
          rule.ruleId ??
          null,

        conditionType:
          rule.conditionType ??
          null,

        label:
          getRuleConditionLabel(
            rule.conditionType
          ),

        reason:
          cleanText(
            rule.reason,
            `The ${getRuleConditionLabel(
              rule.conditionType
            )} requires verification.`
          ),

        sourceIds:
          uniqueStrings(
            rule.sourceIds
          ),

        sourceReferences:
          clone(
            rule.sourceReferences
          ) || [],

        confidence:
          cleanText(
            rule.confidence,
            'UNKNOWN'
          ),

        details:
          clone(
            rule.details
          ) ??
          null
      })
    );
}

function buildEligibilityExplanation(
  eligibilityResult
) {
  const status =
    normalizeStatus(
      eligibilityResult?.status
    );

  const passed =
    buildPassedRequirements(
      eligibilityResult
    );

  const failed =
    buildFailedRequirements(
      eligibilityResult
    );

  const conditional =
    buildConditionalRequirements(
      eligibilityResult
    );

  const review =
    buildReviewRequirements(
      eligibilityResult
    );

  let headline;

  switch (
    status
  ) {
    case 'DIRECT':
      headline =
        'The evaluated hard eligibility requirements are satisfied.';
      break;

    case 'CONDITIONAL':
      headline =
        'The available information indicates eligibility subject to the conditions shown below.';
      break;

    case 'NOT_ELIGIBLE':
      headline =
        'At least one evaluated hard eligibility requirement is not satisfied.';
      break;

    case 'REVIEW_REQUIRED':
      headline =
        'Eligibility cannot be confirmed until the identified information or requirements are verified.';
      break;

    case 'UNKNOWN':
      headline =
        'Eligibility is unknown because the available rule or candidate information is insufficient.';
      break;

    default:
      headline =
        'Eligibility status could not be established.';
  }

  return {
    status,

    label:
      getEligibilityStatusLabel(
        status
      ),

    headline,

    passedRequirements:
      passed,

    failedRequirements:
      failed,

    unmetConditionalRequirements:
      conditional,

    unavailableOrUncertainRequirements:
      review,

    ruleIdsUsed:
      uniqueStrings(
        eligibilityResult?.ruleIds ??
        eligibilityResult?.trace
          ?.ruleIdsUsed ??
        getRuleResults(
          eligibilityResult
        ).map(
          (rule) =>
            rule.ruleId
        )
      ),

    failedRuleIds:
      uniqueStrings(
        eligibilityResult?.failedRuleIds ??
        failed.map(
          (rule) =>
            rule.ruleId
        )
      ),

    manualRuleIds:
      uniqueStrings(
        eligibilityResult?.manualRuleIds ??
        review.map(
          (rule) =>
            rule.ruleId
        )
      ),

    conditionalRuleIds:
      uniqueStrings(
        eligibilityResult?.conditionalRuleIds ??
        conditional.map(
          (rule) =>
            rule.ruleId
        )
      ),

    sourceIds:
      uniqueStrings(
        eligibilityResult?.sourceIds ??
        eligibilityResult?.trace
          ?.sourceIds
      ),

    sourceReferences:
      clone(
        eligibilityResult?.sourceReferences ??
        eligibilityResult?.trace
          ?.sourceReferences
      ) || [],

    confidence:
      cleanText(
        eligibilityResult?.confidence ??
        eligibilityResult?.trace
          ?.confidence,
        'UNKNOWN'
      ),

    resultReason:
      cleanText(
        eligibilityResult?.reason,
        ''
      )
  };
}

/* ============================================================
 * PREFERENCE DATA ACCESS
 * ============================================================
 *
 * Different scoring-engine versions may expose preference signals
 * under slightly different containers. We normalize the READ path,
 * without recalculating anything.
 */

function getPreferenceMetrics(
  scoredResult
) {
  const candidates = [
    scoredResult
      ?.preferenceEvaluation
      ?.details
      ?.metrics,

    scoredResult
      ?.preferenceEvaluation
      ?.metrics,

    scoredResult
      ?.preferenceDetails
      ?.metrics,

    scoredResult
      ?.preferenceMetrics,

    scoredResult
      ?.preferenceEvaluation
      ?.details
      ?.signals
  ];

  for (
    const value of
      candidates
  ) {
    if (
      Array.isArray(
        value
      )
    ) {
      return value;
    }
  }

  return [];
}

function getPreferenceModel(
  scoredResult
) {
  return (
    scoredResult
      ?.preferenceEvaluation
      ?.preferenceModel ??
    scoredResult
      ?.preferenceModel ??
    scoredResult
      ?.preferences ??
    null
  );
}

function getPreferenceMetricLabel(
  metric
) {
  const key =
    metric?.preferenceKey ??
    metric?.key ??
    metric?.metric ??
    '';

  return (
    PREFERENCE_LABELS[
      key
    ] ??
    cleanText(
      metric?.label,
      key
    )
  );
}

function getMetricImportance(
  metric
) {
  return numeric(
    metric?.importance,
    0
  );
}

function getMetricFit(
  metric
) {
  return numeric(
    metric?.fit,
    null
  );
}

function getMetricContribution(
  metric
) {
  return numeric(
    metric?.contribution,
    null
  );
}

function getMetricDirection(
  metric
) {
  return cleanText(
    metric?.direction,
    ''
  )
    .trim()
    .toUpperCase() || null;
}

function getMetricTolerance(
  metric
) {
  return numeric(
    metric?.tolerance,
    null
  );
}

function isMetricAvailable(
  metric
) {
  if (
    typeof metric?.available ===
    'boolean'
  ) {
    return metric.available;
  }

  return (
    getMetricFit(
      metric
    ) !== null
  );
}

/* ============================================================
 * PREFERENCE MATCHES
 * ========================================================== */

function getPreferenceHighlights(
  scoredResult,
  {
    minimumImportance = 6,
    minimumFit = 7,
    limit = 5
  } = {}
) {
  return getPreferenceMetrics(
    scoredResult
  )
    .filter(
      (metric) =>
        isMetricAvailable(
          metric
        ) &&
        getMetricImportance(
          metric
        ) >=
          minimumImportance &&
        getMetricFit(
          metric
        ) !== null &&
        getMetricFit(
          metric
        ) >=
          minimumFit
    )
    .sort(
      (a, b) =>
        (
          getMetricContribution(
            b
          ) ??
          0
        ) -
        (
          getMetricContribution(
            a
          ) ??
          0
        )
    )
    .slice(
      0,
      limit
    )
    .map(
      (metric) => ({
        preferenceKey:
          metric.preferenceKey ??
          metric.key ??
          null,

        metric:
          metric.metric ??
          null,

        label:
          getPreferenceMetricLabel(
            metric
          ),

        importance:
          getMetricImportance(
            metric
          ),

        fit:
          getMetricFit(
            metric
          ),

        contribution:
          getMetricContribution(
            metric
          ),

        direction:
          getMetricDirection(
            metric
          ),

        tolerance:
          getMetricTolerance(
            metric
          ),

        available:
          true
      })
    );
}

/* ============================================================
 * PREFERENCE CONFLICTS
 * ============================================================ */

function getPreferenceWeaknesses(
  scoredResult,
  {
    maximumFit = 4,
    minimumImportance = 6,
    limit = 5
  } = {}
) {
  return getPreferenceMetrics(
    scoredResult
  )
    .filter(
      (metric) =>
        isMetricAvailable(
          metric
        ) &&
        getMetricImportance(
          metric
        ) >=
          minimumImportance &&
        getMetricFit(
          metric
        ) !== null &&
        getMetricFit(
          metric
        ) <=
          maximumFit
    )
    .sort(
      (a, b) =>
        (
          getMetricFit(
            a
          ) ??
          0
        ) -
        (
          getMetricFit(
            b
          ) ??
          0
        )
    )
    .slice(
      0,
      limit
    )
    .map(
      (metric) => ({
        preferenceKey:
          metric.preferenceKey ??
          metric.key ??
          null,

        metric:
          metric.metric ??
          null,

        label:
          getPreferenceMetricLabel(
            metric
          ),

        importance:
          getMetricImportance(
            metric
          ),

        fit:
          getMetricFit(
            metric
          ),

        contribution:
          getMetricContribution(
            metric
          ),

        direction:
          getMetricDirection(
            metric
          ),

        tolerance:
          getMetricTolerance(
            metric
          ),

        available:
          true
      })
    );
}

function getUnavailablePreferenceMetrics(
  scoredResult
) {
  return getPreferenceMetrics(
    scoredResult
  )
    .filter(
      (metric) =>
        !isMetricAvailable(
          metric
        )
    )
    .map(
      (metric) => ({
        preferenceKey:
          metric.preferenceKey ??
          metric.key ??
          null,

        metric:
          metric.metric ??
          null,

        label:
          getPreferenceMetricLabel(
            metric
          ),

        importance:
          getMetricImportance(
            metric
          ),

        fit:
          null,

        contribution:
          0,

        direction:
          getMetricDirection(
            metric
          ),

        tolerance:
          getMetricTolerance(
            metric
          ),

        available:
          false
      })
    );
}

/* ============================================================
 * EXPLICIT SCORING TRADE-OFFS
 * ============================================================
 *
 * These are READ-ONLY.
 *
 * Preferred sources:
 *
 *   scoredResult.tradeoffs
 *   scoredResult.scoreBreakdown.tradeoffs
 *   scoredResult.preferenceEvaluation.tradeoffs
 *
 * No trade-off is invented from raw career fields.
 */

function getSuppliedTradeoffs(
  scoredResult
) {
  const sources = [
    scoredResult?.tradeoffs,

    scoredResult
      ?.scoreBreakdown
      ?.tradeoffs,

    scoredResult
      ?.preferenceEvaluation
      ?.tradeoffs,

    scoredResult
      ?.scoring
      ?.tradeoffs
  ];

  const values =
    sources.find(
      (value) =>
        Array.isArray(
          value
        ) &&
        value.length
    );

  if (
    !values
  ) {
    return [];
  }

  return values.map(
    (item) => {
      if (
        typeof item ===
        'string'
      ) {
        return {
          category:
            'general',

          label:
            CATEGORY_LABELS[
              'general'
            ] ||
            'trade-off',

          statement:
            item,

          source:
            'scoring-engine'
        };
      }

      if (
        isObject(
          item
        )
      ) {
        return {
          category:
            cleanText(
              item.category,
              'general'
            ),

          label:
            cleanText(
              item.label,
              CATEGORY_LABELS[
                item.category
              ] ||
                'trade-off'
            ),

          statement:
            cleanText(
              item.statement ??
              item.reason ??
              item.description,
              'A scoring trade-off was identified by the scoring engine.'
            ),

          metric:
            item.metric ??
            null,

          score:
            numeric(
              item.score,
              null
            ),

          source:
            'scoring-engine'
        };
      }

      return null;
    }
  ).filter(Boolean);
}

/* ============================================================
 * PREFERENCE-DERIVED CONFLICT GROUPS
 * ============================================================
 *
 * These groups are still based only on supplied preference metrics.
 * No raw job fact is evaluated.
 */

function classifyPreferenceConflict(
  metric
) {
  const key =
    cleanText(
      metric?.preferenceKey ??
      metric?.key,
      ''
    )
      .trim()
      .toLowerCase();

  if (
    key.includes(
      'kolkata'
    ) ||
    key.includes(
      'location'
    )
  ) {
    return 'location';
  }

  if (
    key.includes(
      'transfer'
    ) ||
    key.includes(
      'rural'
    )
  ) {
    return 'transfer';
  }

  if (
    key.includes(
      'family'
    )
  ) {
    return 'family';
  }

  if (
    key.includes(
      'parent'
    )
  ) {
    return 'parentCare';
  }

  if (
    key.includes(
      'salary'
    )
  ) {
    return 'salary';
  }

  if (
    key.includes(
      'worklife'
    ) ||
    key.includes(
      'workLife'
    )
  ) {
    return 'workLife';
  }

  if (
    key.includes(
      'physical'
    )
  ) {
    return 'physical';
  }

  if (
    key.includes(
      'stress'
    )
  ) {
    return 'stress';
  }

  if (
    key.includes(
      'night'
    )
  ) {
    return 'nightDuty';
  }

  if (
    key.includes(
      'shift'
    )
  ) {
    return 'shiftDuty';
  }

  if (
    key.includes(
      'housing'
    )
  ) {
    return 'housing';
  }

  if (
    key.includes(
      'growth'
    )
  ) {
    return 'careerGrowth';
  }

  if (
    key.includes(
      'difficulty'
    )
  ) {
    return 'examDifficulty';
  }

  if (
    key.includes(
      'preparation'
    )
  ) {
    return 'preparation';
  }

  if (
    key.includes(
      'public'
    ) &&
    key.includes(
      'interaction'
    )
  ) {
    return 'publicInteraction';
  }

  if (
    key.includes(
      'field'
    )
  ) {
    return 'fieldWork';
  }

  return 'general';
}

function buildPreferenceConflicts(
  scoredResult,
  {
    maximumFit = 5,
    minimumImportance = 6
  } = {}
) {
  return getPreferenceMetrics(
    scoredResult
  )
    .filter(
      (metric) =>
        isMetricAvailable(
          metric
        ) &&
        getMetricImportance(
          metric
        ) >=
          minimumImportance &&
        getMetricFit(
          metric
        ) !== null &&
        getMetricFit(
          metric
        ) <=
          maximumFit
    )
    .map(
      (metric) => {
        const category =
          classifyPreferenceConflict(
            metric
          );

        const label =
          getPreferenceMetricLabel(
            metric
          );

        return {
          category,

          label:
            CATEGORY_LABELS[
              category
            ] ??
            label,

          preferenceKey:
            metric.preferenceKey ??
            metric.key ??
            null,

          metric:
            metric.metric ??
            null,

          importance:
            getMetricImportance(
              metric
            ),

          fit:
            getMetricFit(
              metric
            ),

          direction:
            getMetricDirection(
              metric
            ),

          tolerance:
            getMetricTolerance(
              metric
            ),

          statement:
            `This career is a weaker match for your ${label} preference.`,

          source:
            'scoring-engine'
        };
      }
    );
}

/* ============================================================
 * SCORE BREAKDOWN EXPLANATION
 * ============================================================
 *
 * Only reads the already-finalized score breakdown.
 */

function getPositiveScoreComponents(
  scoredResult,
  {
    minimum = 0,
    limit = 5
  } = {}
) {
  const breakdown =
    getScoreBreakdown(
      scoredResult
    );

  return Object.entries(
    breakdown
  )
    .map(
      ([
        key,
        value
      ]) => ({
        key,
        value:
          numeric(
            value,
            null
          )
      })
    )
    .filter(
      (item) =>
        item.value !==
        null &&
        item.value >
          minimum &&
        item.key !==
          'confidence' &&
        item.key !==
          'tradeoffs'
    )
    .sort(
      (a, b) =>
        b.value -
        a.value
    )
    .slice(
      0,
      limit
    );
}

function getScoreContributors(
  scoredResult
) {
  const supplied =
    scoredResult
      ?.scoreContributors;

  if (
    Array.isArray(
      supplied
    )
  ) {
    return supplied.map(
      clone
    );
  }

  const breakdown =
    getPositiveScoreComponents(
      scoredResult
    );

  return breakdown.map(
    (item) => ({
      key:
        item.key,

      value:
        item.value,

      source:
        'scoring-engine'
    })
  );
}

/* ============================================================
 * UNCERTAINTY / EVIDENCE
 * ============================================================ */

function getExplanationUncertainty(
  eligibilityResult,
  scoredResult
) {
  const eligibilityReview =
    buildReviewRequirements(
      eligibilityResult
    );

  const unavailablePreferenceMetrics =
    getUnavailablePreferenceMetrics(
      scoredResult
    );

  const uncertainty =
    [];

  eligibilityReview.forEach(
    (item) => {
      uncertainty.push({
        category:
          'eligibility',

        label:
          item.label,

        statement:
          item.reason,

        ruleId:
          item.ruleId,

        sourceIds:
          item.sourceIds,

        sourceReferences:
          item.sourceReferences,

        confidence:
          item.confidence
      });
    }
  );

  unavailablePreferenceMetrics.forEach(
    (item) => {
      if (
        Number(
          item.importance
        ) <=
        0
      ) {
        return;
      }

      uncertainty.push({
        category:
          'preference-data',

        label:
          item.label,

        statement:
          `No comparable scoring data is available for your ${item.label} preference.`,

        preferenceKey:
          item.preferenceKey,

        confidence:
          'UNKNOWN'
      });
    }
  );

  const scoringUncertainty =
    asArray(
      scoredResult
        ?.uncertainty
    )
      .concat(
        asArray(
          scoredResult
            ?.scoring
            ?.uncertainty
        )
      );

  scoringUncertainty.forEach(
    (item) => {
      if (
        typeof item ===
        'string'
      ) {
        uncertainty.push({
          category:
            'scoring',

          label:
            'scoring uncertainty',

          statement:
            item,

          confidence:
            'UNKNOWN'
        });

        return;
      }

      if (
        isObject(
          item
        )
      ) {
        uncertainty.push({
          category:
            cleanText(
              item.category,
              'scoring'
            ),

          label:
            cleanText(
              item.label,
              'scoring uncertainty'
            ),

          statement:
            cleanText(
              item.statement ??
              item.reason ??
              item.description,
              'Some scoring information remains uncertain.'
            ),

          confidence:
            cleanText(
              item.confidence,
              'UNKNOWN'
            ),

          sourceIds:
            uniqueStrings(
              item.sourceIds
            ),

          sourceReferences:
            clone(
              item.sourceReferences
            ) || []
        });
      }
    }
  );

  return uncertainty;
}

function getEvidence(
  eligibilityResult,
  scoredResult
) {
  const eligibilitySourceIds =
    uniqueStrings(
      eligibilityResult?.sourceIds ??
      eligibilityResult?.trace
        ?.sourceIds
    );

  const scoringSourceIds =
    uniqueStrings(
      scoredResult?.sourceIds ??
      scoredResult
        ?.scoreBreakdown
        ?.sourceIds
    );

  const sourceIds =
    uniqueStrings(
      [
        ...eligibilitySourceIds,
        ...scoringSourceIds
      ]
    );

  const eligibilityReferences =
    clone(
      eligibilityResult?.sourceReferences ??
      eligibilityResult?.trace
        ?.sourceReferences
    ) || [];

  const scoringReferences =
    clone(
      scoredResult?.sourceReferences ??
      scoredResult
        ?.scoreBreakdown
        ?.sourceReferences
    ) || [];

  const sourceReferences = [
    ...eligibilityReferences,
    ...scoringReferences
  ];

  const eligibilityConfidence =
    cleanText(
      eligibilityResult?.confidence ??
      eligibilityResult?.trace
        ?.confidence,
      'UNKNOWN'
    );

  const scoreConfidence =
    cleanText(
      getScoreConfidence(
        scoredResult
      ),
      'UNKNOWN'
    );

  /*
   * Keep both confidence values separate.
   *
   * Eligibility confidence and scoring-data confidence describe
   * different evidence domains and must not be merged into a
   * single fabricated certainty score.
   */
  return {
    sourceIds,

    sourceReferences,

    eligibilityConfidence,

    scoringConfidence:
      scoreConfidence,

    recordConfidence:
      cleanText(
        scoredResult?.career
          ?.confidence ??
        scoredResult?.confidence,
        'UNKNOWN'
      )
  };
}

function getConfidenceExplanation(
  confidence
) {
  const normalized =
    cleanText(
      confidence,
      'UNKNOWN'
    )
      .trim()
      .toUpperCase();

  let numericScore;

  try {
    numericScore =
      numeric(
        getConfidenceScore(
          normalized
        ),
        null
      );
  } catch {
    numericScore =
      null;
  }

  if (
    numericScore !== null
  ) {
    if (
      numericScore >=
      90
    ) {
      return 'High-confidence evidence is attached to this result.';
    }

    if (
      numericScore >=
      75
    ) {
      return 'The available evidence is reasonably strong, with some details still subject to source review.';
    }

    if (
      numericScore >=
      50
    ) {
      return 'The available evidence should be treated with caution because some information is not fully definitive.';
    }
  }

  switch (
    normalized
  ) {
    case 'HIGH':
      return 'The relevant evidence is classified as high confidence.';

    case 'MEDIUM_HIGH':
      return 'The relevant evidence is classified as medium-high confidence.';

    case 'MEDIUM':
      return 'The relevant evidence is classified as medium confidence.';

    case 'LOW':
      return 'The relevant evidence is classified as low confidence.';

    case 'ESTIMATE':
      return 'The relevant value is an estimate rather than a fully verified fact.';

    case 'NOT_VERIFIED':
      return 'The relevant information has not been verified sufficiently.';

    default:
      return 'Confidence information is unavailable or unknown.';
  }
}

/* ============================================================
 * RANKING EXPLANATION
 * ========================================================== */

function getRankingExplanation(
  rankedResult
) {
  if (
    !rankedResult
  ) {
    return {
      rank:
        null,

      statement:
        'No ranking information is available.'
    };
  }

  const rank =
    numeric(
      rankedResult.rank ??
      rankedResult.ranking
        ?.position,
      null
    );

  if (
    rank === null
  ) {
    return {
      rank:
        null,

      statement:
        'This result has no assigned rank.'
    };
  }

  return {
    rank,

    statement:
      `Ranked #${rank} among the careers included in this recommendation set.`,

    eligibilityStatus:
      normalizeStatus(
        rankedResult
          .eligibilityStatus
      ),

    score:
      getOverallScore(
        rankedResult
      )
  };
}

/* ============================================================
 * RECOMMENDATION SUMMARY
 * ========================================================== */

function buildRecommendationSummary(
  eligibilityResult,
  scoredResult,
  rankedResult
) {
  const status =
    normalizeStatus(
      eligibilityResult?.status ??
      scoredResult
        ?.eligibilityStatus ??
      rankedResult
        ?.eligibilityStatus
    );

  const score =
    getOverallScore(
      scoredResult ??
      rankedResult
    );

  const preferenceScore =
    getPreferenceScore(
      scoredResult ??
      rankedResult
    );

  if (
    status ===
    'NOT_ELIGIBLE'
  ) {
    return {
      recommendable:
        false,

      statement:
        'This career is not recommendable because a hard eligibility requirement failed.',

      score,

      preferenceScore
    };
  }

  if (
    status ===
      'REVIEW_REQUIRED' ||
    status ===
      'UNKNOWN'
  ) {
    return {
      recommendable:
        false,

      statement:
        'This career cannot be presented as an automatically verified recommendation until the identified eligibility uncertainty is resolved.',

      score,

      preferenceScore
    };
  }

  if (
    status ===
    'CONDITIONAL'
  ) {
    return {
      recommendable:
        true,

      conditional:
        true,

      statement:
        'This career is a conditional recommendation because one or more evaluated requirements remain conditional.',

      score,

      preferenceScore
    };
  }

  return {
    recommendable:
      true,

    conditional:
      false,

    statement:
      'This career passed the evaluated hard eligibility checks and may be considered by the recommendation pipeline.',

    score,

    preferenceScore
  };
}

/* ============================================================
 * COMPLETE STRUCTURED EXPLANATION
 * ============================================================ */

function createCareerExplanation(
  {
    career = null,
    eligibility = null,
    scoredResult = null,
    rankedResult = null,
    rank = null
  } = {}
) {
  /*
   * Support both:
   *
   * createCareerExplanation({
   *   career,
   *   eligibility,
   *   scoredResult
   * })
   *
   * and a ranking-result-centric invocation where the complete
   * eligibility result may already be embedded.
   */
  const effectiveEligibility =
    eligibility ??
    rankedResult
      ?.eligibilityResult ??
    scoredResult
      ?.eligibilityResult ??
    {
      status:
        rankedResult
          ?.eligibilityStatus ??
        scoredResult
          ?.eligibilityStatus ??
        'UNKNOWN',

      ruleResults:
        rankedResult
          ?.eligibilityRuleResults ??
        scoredResult
          ?.eligibilityRuleResults ??
        [],

      reason:
        rankedResult
          ?.eligibilityReason ??
        scoredResult
          ?.eligibilityReason ??
        null
    };

  const effectiveScored =
    scoredResult ??
    rankedResult ??
    null;

  const effectiveRank =
    rank ??
    rankedResult
      ?.rank ??
    rankedResult
      ?.ranking
      ?.position ??
    null;

  const effectiveCareer =
    career ??
    scoredResult?.career ??
    rankedResult?.career ??
    null;

  const name =
    getCareerName(
      effectiveCareer,
      effectiveScored
    );

  const careerId =
    getCareerId(
      effectiveCareer,
      effectiveScored
    );

  const government =
    getGovernmentName(
      effectiveCareer,
      effectiveScored
    );

  const eligibilityExplanation =
    buildEligibilityExplanation(
      effectiveEligibility
    );

  const preferenceHighlights =
    getPreferenceHighlights(
      effectiveScored
    );

  const preferenceWeaknesses =
    getPreferenceWeaknesses(
      effectiveScored
    );

  const preferenceConflicts =
    buildPreferenceConflicts(
      effectiveScored
    );

  const scoringTradeoffs =
    getSuppliedTradeoffs(
      effectiveScored
    );

  const uncertainty =
    getExplanationUncertainty(
      effectiveEligibility,
      effectiveScored
    );

  const evidence =
    getEvidence(
      effectiveEligibility,
      effectiveScored
    );

  const overallScore =
    getOverallScore(
      effectiveScored
    );

  const preferenceScore =
    getPreferenceScore(
      effectiveScored
    );

  let scoreBand = null;

  if (
    overallScore !==
    null
  ) {
    try {
      scoreBand =
        getScoreBand(
          overallScore
        );
    } catch {
      scoreBand =
        null;
    }
  }

  const recommendation =
    buildRecommendationSummary(
      effectiveEligibility,
      effectiveScored,
      rankedResult
    );

  const ranking =
    getRankingExplanation(
      {
        ...(rankedResult ||
          effectiveScored ||
          {}),
        rank:
          effectiveRank
      }
    );

  const explanation =
    {
      version:
        '1.0.0',

      career: {
        id:
          careerId,

        name,

        government
      },

      eligibility:
        eligibilityExplanation,

      recommendation,

      scoring: {
        overallScore,

        preferenceScore,

        scoreBand,

        scoreConfidence:
          getScoreConfidence(
            effectiveScored
          ),

        contributors:
          getScoreContributors(
            effectiveScored
          ),

        breakdown:
          clone(
            getScoreBreakdown(
              effectiveScored
            )
          )
      },

      preferenceMatches:
        preferenceHighlights,

      preferenceConflicts,

      weakerPreferenceAreas:
        preferenceWeaknesses,

      tradeoffs:
        scoringTradeoffs,

      uncertainty,

      evidence: {
        ...evidence,

        eligibilityExplanation:
          getConfidenceExplanation(
            evidence
              .eligibilityConfidence
          ),

        scoringExplanation:
          getConfidenceExplanation(
            evidence
              .scoringConfidence
          ),

        recordExplanation:
          getConfidenceExplanation(
            evidence
              .recordConfidence
          )
      },

      ranking
    };

  /*
   * Preserve the complete upstream explanation/scoring/eligibility
   * objects where they are available, while keeping the normalized
   * explanation structure stable for all consumers.
   */
  return explanation;
}

/* ============================================================
 * RANKING-SET EXPLANATIONS
 * ============================================================ */

function createRankingExplanation(
  rankedResults,
  {
    topCount = 5
  } = {}
) {
  if (
    !Array.isArray(
      rankedResults
    )
  ) {
    return [];
  }

  return rankedResults
    .slice(
      0,
      Math.max(
        0,
        Number(
          topCount
        ) || 0
      )
    )
    .map(
      (result) =>
        createCareerExplanation(
          {
            career:
              result.career ??
              null,

            eligibility:
              result.eligibilityResult ??
              null,

            scoredResult:
              result,

            rankedResult:
              result,

            rank:
              result.rank
          }
        )
    );
}

/* ============================================================
 * COMPARISON EXPLANATION
 * ============================================================
 *
 * Comparison is based on already-produced scores.
 * It does not create a new scoring model.
 */

function createComparisonExplanation(
  scoredResults
) {
  if (
    !Array.isArray(
      scoredResults
    )
  ) {
    return {
      winner:
        null,

      compared:
        [],

      statements: [
        'No comparable scoring results are available.'
      ]
    };
  }

  const classified =
    scoredResults.map(
      (result) => ({
        result,

        status:
          normalizeStatus(
            result?.eligibilityStatus
          ),

        score:
          getOverallScore(
            result
          )
      })
    );

  const eligible =
    classified.filter(
      (item) =>
        item.status ===
          'DIRECT' ||
        item.status ===
          'CONDITIONAL'
    );

  /*
   * Do not compare ineligible/review-only results as if they were
   * valid recommendations.
   */
  if (
    eligible.length ===
    0
  ) {
    return {
      winner:
        null,

      compared:
        scoredResults.map(
          (result) => ({
            careerId:
              getCareerId(
                result?.career,
                result
              ),

            careerName:
              getCareerName(
                result?.career,
                result
              ),

            eligibilityStatus:
              normalizeStatus(
                result?.eligibilityStatus
              ),

            score:
              getOverallScore(
                result
              )
          })
        ),

      statements: [
        'No directly or conditionally eligible career is available for this comparison.'
      ]
    };
  }

  const sorted =
    [...eligible].sort(
      (a, b) => {
        const scoreDifference =
          (
            b.score ??
            0
          ) -
          (
            a.score ??
            0
          );

        if (
          scoreDifference !==
          0
        ) {
          return scoreDifference;
        }

        return String(
          getCareerId(
            a.result?.career,
            a.result
          )
        ).localeCompare(
          String(
            getCareerId(
              b.result?.career,
              b.result
            )
          )
        );
      }
    );

  const winner =
    sorted[0]
      ?.result ??
    null;

  const statements = [];

  if (
    winner
  ) {
    statements.push(
      `${getCareerName(
        winner.career,
        winner
      )} has the highest supplied analytical score among the eligible careers compared.`
    );
  }

  if (
    sorted.length >
    1 &&
    sorted[0].score !==
      null &&
    sorted[1].score !==
      null
  ) {
    const difference =
      Number(
        sorted[0].score
      ) -
      Number(
        sorted[1].score
      );

    statements.push(
      `The supplied score difference from the next career is ${difference.toFixed(
        2
      )} points.`
    );
  }

  const winnerExplanation =
    createCareerExplanation(
      {
        career:
          winner?.career ??
          null,

        eligibility:
          winner?.eligibilityResult ??
          null,

        scoredResult:
          winner,

        rankedResult:
          winner
      }
    );

  return {
    winner:
      winner
        ? getCareerId(
            winner.career,
            winner
          )
        : null,

    compared:
      sorted.map(
        (item) => ({
          careerId:
            getCareerId(
              item.result
                ?.career,
              item.result
            ),

          careerName:
            getCareerName(
              item.result
                ?.career,
              item.result
            ),

          eligibilityStatus:
            item.status,

          score:
            item.score,

          preferenceScore:
            getPreferenceScore(
              item.result
            ),

          confidence:
            getScoreConfidence(
              item.result
            )
        })
      ),

    winnerExplanation,

    statements
  };
}

/* ============================================================
 * COMPACT EXPLANATION FOR CARDS
 * ============================================================
 *
 * Useful for Career Results cards where the complete structured
 * explanation would be too large.
 */

function createCompactExplanation(
  explanation
) {
  if (
    !explanation
  ) {
    return {
      headline:
        'No explanation is available.',

      highlights: [],

      caveats: []
    };
  }

  const headline =
    explanation
      ?.eligibility
      ?.headline ??
    explanation
      ?.recommendation
      ?.statement ??
    'No explanation is available.';

  const highlights = [];

  explanation
    ?.preferenceMatches
    ?.slice(
      0,
      3
    )
    .forEach(
      (item) => {
        highlights.push(
          `Strong match for ${item.label}.`
        );
      }
    );

  explanation
    ?.tradeoffs
    ?.slice(
      0,
      2
    )
    .forEach(
      (item) => {
        highlights.push(
          item.statement
        );
      }
    );

  const caveats = [];

  explanation
    ?.eligibility
    ?.unavailableOrUncertainRequirements
    ?.slice(
      0,
      3
    )
    .forEach(
      (item) => {
        caveats.push(
          item.reason
        );
      }
    );

  explanation
    ?.preferenceConflicts
    ?.slice(
      0,
      3
    )
    .forEach(
      (item) => {
        caveats.push(
          item.statement
        );
      }
    );

  return {
    headline,

    highlights:
      uniqueStrings(
        highlights
      ),

    caveats:
      uniqueStrings(
        caveats
      )
  };
}

/* ============================================================
 * AI-SAFE EXPLANATION PAYLOAD
 * ============================================================
 *
 * Compass AI should receive structured facts rather than a giant
 * untrusted prose explanation.
 *
 * This function deliberately excludes internal implementation
 * details that are not useful for conversational explanation.
 */

function createAIExplanationContext(
  explanation
) {
  if (
    !explanation
  ) {
    return null;
  }

  return {
    career:
      clone(
        explanation.career
      ),

    eligibility: {
      status:
        explanation
          ?.eligibility
          ?.status,

      label:
        explanation
          ?.eligibility
          ?.label,

      headline:
        explanation
          ?.eligibility
          ?.headline,

      passedRequirements:
        clone(
          explanation
            ?.eligibility
            ?.passedRequirements
        ) || [],

      failedRequirements:
        clone(
          explanation
            ?.eligibility
            ?.failedRequirements
        ) || [],

      conditionalRequirements:
        clone(
          explanation
            ?.eligibility
            ?.unmetConditionalRequirements
        ) || [],

      reviewRequirements:
        clone(
          explanation
            ?.eligibility
            ?.unavailableOrUncertainRequirements
        ) || [],

      sourceIds:
        clone(
          explanation
            ?.eligibility
            ?.sourceIds
        ) || [],

      confidence:
        explanation
          ?.eligibility
          ?.confidence ??
        'UNKNOWN'
    },

    recommendation:
      clone(
        explanation.recommendation
      ),

    scoring: {
      overallScore:
        explanation
          ?.scoring
          ?.overallScore ??
        null,

      preferenceScore:
        explanation
          ?.scoring
          ?.preferenceScore ??
        null,

      scoreBand:
        clone(
          explanation
            ?.scoring
            ?.scoreBand
        ),

      contributors:
        clone(
          explanation
            ?.scoring
            ?.contributors
        ) || []
    },

    preferenceMatches:
      clone(
        explanation
          ?.preferenceMatches
      ) || [],

    preferenceConflicts:
      clone(
        explanation
          ?.preferenceConflicts
      ) || [],

    tradeoffs:
      clone(
        explanation
          ?.tradeoffs
      ) || [],

    uncertainty:
      clone(
        explanation
          ?.uncertainty
      ) || [],

    evidence: {
      sourceIds:
        clone(
          explanation
            ?.evidence
            ?.sourceIds
        ) || [],

      sourceReferences:
        clone(
          explanation
            ?.evidence
            ?.sourceReferences
        ) || [],

      eligibilityConfidence:
        explanation
          ?.evidence
          ?.eligibilityConfidence ??
        'UNKNOWN',

      scoringConfidence:
        explanation
          ?.evidence
          ?.scoringConfidence ??
        'UNKNOWN',

      recordConfidence:
        explanation
          ?.evidence
          ?.recordConfidence ??
        'UNKNOWN'
    },

    ranking:
      clone(
        explanation
          ?.ranking
      )
  };
}

/* ============================================================
 * EXPORTS
 * ========================================================== */

export {
  STATUS_LABELS,
  CONDITION_LABELS,
  PREFERENCE_LABELS,
  CATEGORY_LABELS,

  normalizeStatus,

  getCareerId,
  getCareerName,
  getGovernmentName,

  getEligibilityStatusLabel,
  getRuleConditionLabel,

  buildPassedRequirements,
  buildFailedRequirements,
  buildConditionalRequirements,
  buildReviewRequirements,
  buildEligibilityExplanation,

  getPreferenceHighlights,
  getPreferenceWeaknesses,
  getUnavailablePreferenceMetrics,
  buildPreferenceConflicts,

  getSuppliedTradeoffs,

  getPositiveScoreComponents,
  getScoreContributors,

  getExplanationUncertainty,
  getEvidence,
  getConfidenceExplanation,

  getRankingExplanation,

  buildRecommendationSummary,

  createCareerExplanation,
  createRankingExplanation,
  createComparisonExplanation,

  createCompactExplanation,
  createAIExplanationContext
};

export default {
  createCareerExplanation,
  createRankingExplanation,
  createComparisonExplanation,

  createCompactExplanation,
  createAIExplanationContext,

  buildEligibilityExplanation,

  getPreferenceHighlights,
  getPreferenceWeaknesses,
  buildPreferenceConflicts,

  getSuppliedTradeoffs,

  getEvidence,
  getConfidenceExplanation
};
