/**
 * GovCareer Compass
 * ============================================================
 * CAREER SCORING ENGINE
 * ============================================================
 *
 * Purpose
 * -------
 * Produces a transparent, deterministic analytical score from:
 *
 *   1. finalized eligibility result;
 *   2. normalized candidate preference model;
 *   3. supplied canonical career attributes;
 *   4. supplied evidence/confidence metadata.
 *
 * Canonical pipeline
 * ------------------
 *
 *   Candidate Profile
 *          │
 *          ▼
 *   Eligibility Engine
 *          │
 *          ▼
 *   Preference Engine
 *          │
 *          ▼
 *   Scoring Engine
 *          │
 *          ▼
 *   Ranking Engine
 *          │
 *          ▼
 *   Explanation Engine
 *
 * This module is the ONLY layer that converts:
 *
 *   candidate preference
 *           +
 *   career attribute
 *
 * into a preference-fit score.
 *
 * It must NOT:
 * - determine hard eligibility;
 * - invent missing career facts;
 * - use AI knowledge;
 * - rank careers;
 * - decide recruitment law;
 * - use `baEligibility` as an authority;
 * - silently turn unknown data into a positive score.
 *
 * IMPORTANT
 * ---------
 * `scoreCareer()` scores ONE already-described career.
 *
 * `scoreCareers()` additionally supports cohort-relative salary
 * normalization when multiple careers are being evaluated together.
 *
 * Eligibility remains a gate:
 *
 *   NOT_ELIGIBLE
 *       → score = 0
 *
 *   REVIEW_REQUIRED / UNKNOWN
 *       → not an automatic recommendation
 *
 *   CONDITIONAL
 *       → score is available but receives the configured
 *          conditional gate
 *
 *   DIRECT
 *       → normal score
 *
 * Score range
 * -----------
 * 0–100
 *
 * This is an analytical fit score, not an official government
 * ranking, selection probability, examination cutoff, or promise
 * of appointment.
 */

/* ============================================================
 * IMPORTS
 * ========================================================== */

import {
  ELIGIBILITY_RESULT
} from './eligibility-engine.js';

import {
  DIRECTION,
  normalizePreferences,
  PREFERENCE_DEFINITIONS
} from './preference-engine.js';

/* ============================================================
 * DEFAULT SCORING WEIGHTS
 * ============================================================
 *
 * These weights are deliberately separate from preference weights.
 *
 * Preference weights answer:
 *   "How important is this metric to the candidate?"
 *
 * Scoring weights answer:
 *   "How much should overall preference fit contribute to the
 *    final analytical score?"
 */

const DEFAULT_WEIGHTS = Object.freeze({
  preferenceFit:
    0.70,

  dataConfidence:
    0.10,

  eligibilityClarity:
    0.10,

  careerCompleteness:
    0.10
});

/* ============================================================
 * SCORE CONSTANTS
 * ========================================================== */

const SCORE_RANGE = Object.freeze({
  MIN:
    0,

  MAX:
    100
});

const FIT_RANGE = Object.freeze({
  MIN:
    0,

  MAX:
    10
});

const CONDITIONAL_SCORE_FACTOR =
  0.90;

const REVIEW_SCORE_CAP =
  55;

/*
 * Review-required results are deliberately not automatically
 * recommendable. The capped score exists only for audit/compare
 * views and should never be interpreted as verified eligibility.
 */

const CONFIDENCE_SCORE = Object.freeze({
  HIGH:
    100,

  MEDIUM_HIGH:
    90,

  MEDIUM:
    75,

  LOW:
    55,

  ESTIMATE:
    45,

  NOT_VERIFIED:
    20,

  UNKNOWN:
    35
});

/* ============================================================
 * CANONICAL CAREER ATTRIBUTE ACCESS
 * ============================================================
 *
 * The canonical Job schema is relational and structured.
 * These helpers read both the current canonical structure and a
 * deliberately limited compatibility layer for older normalized
 * records.
 *
 * The compatibility layer may read existing fields, but it must
 * never invent a value.
 */

/* ------------------------------------------------------------
 * Generic object helpers
 * --------------------------------------------------------- */

function isObject(
  value
) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(
      value
    )
  );
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

function clamp(
  value,
  min,
  max
) {
  const number =
    Number(
      value
    );

  if (
    !Number.isFinite(
      number
    )
  ) {
    return min;
  }

  return Math.min(
    max,
    Math.max(
      min,
      number
    )
  );
}

function clampScore(
  value
) {
  return clamp(
    value,
    SCORE_RANGE.MIN,
    SCORE_RANGE.MAX
  );
}

function clampFit(
  value
) {
  return clamp(
    value,
    FIT_RANGE.MIN,
    FIT_RANGE.MAX
  );
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

  return (
    text ||
    fallback
  );
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

function getNestedValue(
  object,
  path
) {
  if (
    !object ||
    !path
  ) {
    return undefined;
  }

  const parts =
    String(
      path
    )
      .split('.')
      .filter(Boolean);

  let current =
    object;

  for (
    const part of
      parts
  ) {
    if (
      current === null ||
      current === undefined
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

function firstDefined(
  ...values
) {
  for (
    const value of
      values
  ) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ''
    ) {
      return value;
    }
  }

  return null;
}

/* ============================================================
 * CONFIDENCE
 * ========================================================== */

function normalizeConfidence(
  confidence
) {
  return cleanText(
    confidence,
    'UNKNOWN'
  )
    .trim()
    .toUpperCase();
}

function getConfidenceScore(
  confidence
) {
  const key =
    normalizeConfidence(
      confidence
    );

  return (
    CONFIDENCE_SCORE[
      key
    ] ??
    CONFIDENCE_SCORE.UNKNOWN
  );
}

/* ============================================================
 * ELIGIBILITY
 * ========================================================== */

function normalizeEligibilityStatus(
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
    return (
      ELIGIBILITY_RESULT.REVIEW_REQUIRED ||
      'REVIEW_REQUIRED'
    );
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

function getEligibilityClarityScore(
  status
) {
  switch (
    normalizeEligibilityStatus(
      status
    )
  ) {
    case 'DIRECT':
      return 100;

    case 'CONDITIONAL':
      return 80;

    case 'REVIEW_REQUIRED':
      return 40;

    case 'UNKNOWN':
      return 30;

    case 'NOT_ELIGIBLE':
      return 0;

    default:
      return 30;
  }
}

/* ============================================================
 * CAREER COMPLETENESS
 * ============================================================
 *
 * Completeness measures how much of the canonical analytical
 * record is actually populated.
 *
 * It is NOT a quality score for the career itself.
 *
 * It exists so sparse records do not appear artificially
 * equivalent to thoroughly documented records.
 */

const COMPLETENESS_CHECKS =
  Object.freeze([
    {
      key:
        'identity',
      paths: [
        'identity.governmentId',
        'governmentId'
      ]
    },

    {
      key:
        'department',
      paths: [
        'identity.departmentId',
        'departmentId'
      ]
    },

    {
      key:
        'organisation',
      paths: [
        'identity.organisationId',
        'organisationId'
      ]
    },

    {
      key:
        'post',
      paths: [
        'identity.post',
        'post',
        'postName',
        'name'
      ]
    },

    {
      key:
        'serviceCadre',
      paths: [
        'identity.serviceCadreId',
        'serviceCadreId'
      ]
    },

    {
      key:
        'recruitment',
      paths: [
        'recruitment',
        'recruitment.routeIds',
        'recruitment.examIds',
        'recruitment.recruitmentIds'
      ]
    },

    {
      key:
        'eligibility',
      paths: [
        'eligibility',
        'eligibility.ruleIds'
      ]
    },

    {
      key:
        'pay',
      paths: [
        'payProfileId',
        'pay',
        'payProfile'
      ]
    },

    {
      key:
        'location',
      paths: [
        'locationProfileId',
        'location',
        'locationProfile'
      ]
    },

    {
      key:
        'housing',
      paths: [
        'housingProfileId',
        'housing',
        'housingProfile'
      ]
    },

    {
      key:
        'promotion',
      paths: [
        'promotionProfileId',
        'promotion',
        'promotionProfile'
      ]
    },

    {
      key:
        'benefits',
      paths: [
        'benefitProfileId',
        'benefits',
        'benefitProfile'
      ]
    },

    {
      key:
        'lifestyle',
      paths: [
        'lifestyle',
        'lifestyle.workLife',
        'lifestyle.stress'
      ]
    },

    {
      key:
        'analysis',
      paths: [
        'analysis',
        'analysis.familyCompatibility',
        'analysis.authority'
      ]
    },

    {
      key:
        'sources',
      paths: [
        'sourceIds',
        'sourceReferences'
      ]
    },

    {
      key:
        'confidence',
      paths: [
        'confidence'
      ]
    },

    {
      key:
        'currentness',
      paths: [
        'currentness',
        'lastVerified'
      ]
    }
  ]);

function hasPopulatedValue(
  career,
  paths
) {
  for (
    const path of
      paths
  ) {
    const value =
      getNestedValue(
        career,
        path
      );

    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      continue;
    }

    if (
      Array.isArray(
        value
      ) &&
      value.length === 0
    ) {
      continue;
    }

    if (
      isObject(
        value
      ) &&
      Object.keys(
        value
      ).length === 0
    ) {
      continue;
    }

    return true;
  }

  return false;
}

function getCareerCompletenessScore(
  career
) {
  if (
    !career ||
    typeof career !==
      'object'
  ) {
    return 0;
  }

  let present = 0;

  COMPLETENESS_CHECKS.forEach(
    (check) => {
      if (
        hasPopulatedValue(
          career,
          check.paths
        )
      ) {
        present += 1;
      }
    }
  );

  return (
    present /
    COMPLETENESS_CHECKS.length
  ) * 100;
}

/* ============================================================
 * CANONICAL CAREER METRICS
 * ============================================================
 *
 * All career metrics returned from this section are already in
 * candidate-comparable 0–10 form where possible.
 *
 * `null` means unavailable.
 */

const METRIC_ACCESSORS =
  Object.freeze({
    authority: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.authority,
        career?.analysis
          ?.authorityScore,
        career?.authority,
        career?.authorityScore
      ),

    careerGrowth: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.careerGrowth,
        career?.analysis
          ?.careerGrowthScore,
        career?.careerGrowth,
        career?.careerGrowthScore
      ),

    workLife: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.workLife,
        career?.lifestyle
          ?.workLife,
        career?.workLife,
        career?.workLifeScore
      ),

    familyCompatibility: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.familyCompatibility,
        career?.analysis
          ?.familyCompatibilityBase,
        career?.familyCompatibility,
        career?.familyScore
      ),

    parentCareCompatibility: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.parentCareCompatibility,
        career?.analysis
          ?.parentCareCompatibilityBase,
        career?.parentCareCompatibility,
        career?.parentScore
      ),

    kolkataStability: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.kolkataStability,
        career?.kolkataStability,
        career?.kolkataScore
      ),

    locationStability: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.postingPredictability,
        career?.locationStability,
        career?.analysis
          ?.kolkataStability,
        career?.kolkataStability
      ),

    jobSecurity: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.jobSecurity,
        career?.analysis
          ?.jobSecurityScore,
        career?.jobSecurity,
        career?.jobSecurityScore
      ),

    housingAdvantage: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.housingAdvantage,
        career?.housingAdvantage,
        career?.housingScore
      ),

    physicalRisk: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.physicalRisk,
        career?.lifestyle
          ?.physicalRisk,
        career?.physicalRisk,
        career?.risk
      ),

    stress: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.stress,
        career?.lifestyle
          ?.stress,
        career?.stress
      ),

    transferBurden: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.transferBurden,
        career?.transferBurden
      ),

    ruralPostingBurden: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.ruralPostingBurden,
        career?.ruralPostingBurden,
        career?.ruralPosting
      ),

    nightDutyBurden: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.nightDutyBurden,
        career?.nightDutyBurden
      ),

    shiftDutyBurden: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.shiftDutyBurden,
        career?.shiftDutyBurden
      ),

    publicInteraction: (
      career
    ) =>
      firstDefined(
        career?.lifestyle
          ?.publicInteraction,
        career?.publicInteraction
      ),

    fieldWork: (
      career
    ) =>
      firstDefined(
        career?.lifestyle
          ?.fieldWork,
        career?.lifestyle
          ?.deskField,
        career?.fieldWork,
        career?.deskField
      ),

    uniform: (
      career
    ) =>
      firstDefined(
        career?.lifestyle
          ?.uniformScore,
        career?.uniformScore
      ),

    englishAdvantage: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.englishAdvantageScore,
        career?.englishAdvantageScore
      ),

    salaryScore: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.salaryScore,
        career?.salaryScore,
        career?.payScore
      ),

    startingBasic: (
      career
    ) =>
      firstDefined(
        career?.pay
          ?.startingBasic,
        career?.startingBasic
      ),

    examDifficulty: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.examDifficulty,
        career?.examDifficulty
      ),

    preparationBurden: (
      career
    ) =>
      firstDefined(
        career?.analysis
          ?.preparationBurden,
        career?.preparationBurden
      )
  });

function getCareerMetric(
  career,
  metric
) {
  const accessor =
    METRIC_ACCESSORS[
      metric
    ];

  if (
    typeof accessor !==
    'function'
  ) {
    return null;
  }

  const value =
    accessor(
      career
    );

  return numeric(
    value,
    null
  );
}

/* ============================================================
 * CATEGORICAL METRIC NORMALIZATION
 * ============================================================
 *
 * Some canonical lifestyle fields may be descriptive rather than
 * numeric. They must be converted only through explicit mappings.
 *
 * Unknown text remains unavailable.
 */

const CATEGORICAL_SCORE_MAPS =
  Object.freeze({
    publicInteraction:
      Object.freeze({
        NONE:
          0,

        LOW:
          3,

        'LOW/MODERATE':
          4,

        MODERATE:
          5,

        'MODERATE/HIGH':
          7,

        HIGH:
          8,

        VERY_HIGH:
          10
      }),

    fieldWork:
      Object.freeze({
        NONE:
          0,

        OFFICE:
          2,

        'MOSTLY OFFICE':
          2,

        'OFFICE + FIELD':
          5,

        FIELD:
          8,

        'FIELD + INVESTIGATION':
          9,

        'VERY HIGH':
          10
      }),

    uniform:
      Object.freeze({
        NO:
          0,

        NONE:
          0,

        YES:
          10,

        OPTIONAL:
          5,

        CONDITIONAL:
          5
      }),

    englishAdvantage:
      Object.freeze({
        NONE:
          0,

        LOW:
          3,

        MODERATE:
          5,

        STRONG:
          8,

        'STRONG ADVANTAGE':
          9,

        VERY_STRONG:
          10
      })
  });

function normalizeCategoricalValue(
  metric,
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  const number =
    Number(
      value
    );

  if (
    Number.isFinite(
      number
    )
  ) {
    return clampFit(
      number
    );
  }

  const normalized =
    String(
      value
    )
      .trim()
      .toUpperCase();

  const mapping =
    CATEGORICAL_SCORE_MAPS[
      metric
    ];

  if (
    !mapping
  ) {
    return null;
  }

  return (
    mapping[
      normalized
    ] ??
    null
  );
}

function getNormalizedCareerMetric(
  career,
  metric
) {
  const raw =
    getCareerMetric(
      career,
      metric
    );

  if (
    raw !== null
  ) {
    return clampFit(
      raw
    );
  }

  /*
   * Attempt categorical normalization only for metrics that support
   * explicit canonical text mappings.
   */
  const rawValue =
    METRIC_ACCESSORS[
      metric
    ]?.(
      career
    );

  return normalizeCategoricalValue(
    metric,
    rawValue
  );
}

/* ============================================================
 * SALARY NORMALIZATION
 * ============================================================
 *
 * Salary is fundamentally comparative.
 *
 * Therefore:
 *
 *   scoreCareer()
 *       → uses explicit salaryScore/payScore if already supplied;
 *       → otherwise salary cannot be invented from a single career.
 *
 *   scoreCareers()
 *       → may normalize startingBasic across the supplied cohort.
 *
 * This prevents an arbitrary absolute salary mapping.
 */

function normalizeRelativeSalary(
  career,
  salaryRange
) {
  const explicit =
    getNormalizedCareerMetric(
      career,
      'salaryScore'
    );

  if (
    explicit !== null
  ) {
    return {
      value:
        explicit,

      basis:
        'career.salaryScore'
    };
  }

  const startingBasic =
    getCareerMetric(
      career,
      'startingBasic'
    );

  if (
    startingBasic ===
      null ||
    !salaryRange
  ) {
    return {
      value:
        null,

      basis:
        null
    };
  }

  const minimum =
    salaryRange.minimum;

  const maximum =
    salaryRange.maximum;

  if (
    minimum ===
    maximum
  ) {
    return {
      value:
        5,

      basis:
        'cohort-relative salary; identical supplied salary values'
    };
  }

  const normalized =
    (
      (
        startingBasic -
        minimum
      ) /
      (
        maximum -
        minimum
      )
    ) *
    10;

  return {
    value:
      clampFit(
        normalized
      ),

    basis:
      'cohort-relative starting basic'
  };
}

function buildSalaryRange(
  careers
) {
  const values =
    (careers || [])
      .map(
        (career) =>
          getCareerMetric(
            career,
            'startingBasic'
          )
      )
      .filter(
        (value) =>
          value !== null
      );

  if (
    values.length ===
    0
  ) {
    return null;
  }

  return {
    minimum:
      Math.min(
        ...values
      ),

    maximum:
      Math.max(
        ...values
      )
  };
}

/* ============================================================
 * PREFERENCE SIGNAL CALCULATION
 * ============================================================
 *
 * This is the core of scoring-engine responsibility.
 *
 * Preference Engine:
 *   tells us:
 *       metric
 *       importance
 *       weight
 *       direction
 *       tolerance
 *
 * Scoring Engine:
 *   compares that preference against the supplied career metric.
 */

function resolvePreferenceSignals(
  preferenceModel
) {
  if (
    preferenceModel?.preferences
  ) {
    return Object.values(
      preferenceModel.preferences
    );
  }

  return [];
}

function getSignalByKey(
  preferenceModel,
  key
) {
  return (
    preferenceModel
      ?.preferences
      ?.[
        key
      ] ??
    null
  );
}

function getMetricForPreference(
  signal,
  career,
  salaryRange
) {
  if (
    !signal
  ) {
    return null;
  }

  if (
    signal.metric ===
    'salary'
  ) {
    return normalizeRelativeSalary(
      career,
      salaryRange
    );
  }

  const rawMetric =
    getNormalizedCareerMetric(
      career,
      signal.metric
    );

  return {
    value:
      rawMetric,

    basis:
      rawMetric !== null
        ? 'canonical career attribute'
        : null
  };
}

/* ============================================================
 * PREFERENCE FIT FUNCTIONS
 * ============================================================ */

/**
 * Calculates directional fit.
 *
 * Candidate preference:
 *
 *   HIGHER
 *      Higher career value → better fit.
 *
 *   LOWER
 *      Lower career value → better fit.
 *
 *   NEUTRAL
 *      No directional preference → neutral fit.
 */
function calculateDirectionalFit(
  careerValue,
  direction
) {
  if (
    careerValue ===
    null
  ) {
    return null;
  }

  const value =
    clampFit(
      careerValue
    );

  switch (
    direction
  ) {
    case DIRECTION.HIGHER:
      return value;

    case DIRECTION.LOWER:
      return (
        10 -
        value
      );

    case DIRECTION.NEUTRAL:
    default:
      return 5;
  }
}

/**
 * Tolerance is interpreted as tolerance for a burden.
 *
 * Lower tolerance:
 *   stronger penalty for high burden.
 *
 * Higher tolerance:
 *   weaker penalty for high burden.
 *
 * For a burden metric:
 *
 *   burden = 0
 *       → fit 10 regardless of tolerance
 *
 *   burden = 10
 *       → fit approaches:
 *          0 when tolerance is very low
 *          10 when tolerance is very high
 *
 * This keeps the meaning of "tolerance" distinct from ordinary
 * importance.
 */
function calculateToleranceFit(
  careerValue,
  tolerance
) {
  if (
    careerValue ===
      null ||
    tolerance ===
      null ||
    tolerance ===
      undefined
  ) {
    return null;
  }

  const burden =
    clampFit(
      careerValue
    );

  const normalizedTolerance =
    clamp(
      Number(
        tolerance
      ),
      0,
      10
    );

  /*
   * Difference between burden and candidate tolerance.
   *
   * The candidate's tolerance is expressed in the same 0–10 space:
   *   0 = very low tolerance
   *   10 = very high tolerance
   */
  const fit =
    10 -
    Math.max(
      0,
      burden -
        normalizedTolerance
    );

  return clampFit(
    fit
  );
}

function calculatePreferenceFit(
  signal,
  careerValue
) {
  if (
    !signal ||
    careerValue ===
      null
  ) {
    return null;
  }

  if (
    signal.mode ===
    'tolerance'
  ) {
    return calculateToleranceFit(
      careerValue,
      signal.tolerance
    );
  }

  if (
    signal.direction ===
    DIRECTION.NEUTRAL
  ) {
    return 5;
  }

  return calculateDirectionalFit(
    careerValue,
    signal.direction
  );
}

/* ============================================================
 * PREFERENCE EVALUATION
 * ============================================================
 *
 * This function replaces the old preference-engine scoring
 * responsibility.
 */

function evaluateCareerPreferences(
  career,
  preferenceModel,
  {
    salaryRange = null
  } = {}
) {
  const signals =
    resolvePreferenceSignals(
      preferenceModel
    );

  const metrics = [];

  let weightedTotal =
    0;

  let totalWeight =
    0;

  signals.forEach(
    (signal) => {
      if (
        !signal ||
        !signal.metric
      ) {
        return;
      }

      const importance =
        numeric(
          signal.importance,
          0
        );

      const weight =
        numeric(
          signal.weight,
          importance / 10
        );

      if (
        importance <=
          0 ||
        weight <=
          0
      ) {
        return;
      }

      const careerMetric =
        getMetricForPreference(
          signal,
          career,
          salaryRange
        );

      const careerValue =
        careerMetric?.value ??
        null;

      const fit =
        calculatePreferenceFit(
          signal,
          careerValue
        );

      if (
        fit ===
        null
      ) {
        metrics.push({
          preferenceKey:
            signal.key ??
            null,

          metric:
            signal.metric,

          mode:
            signal.mode,

          importance,

          weight,

          direction:
            signal.direction ??
            DIRECTION.NEUTRAL,

          tolerance:
            signal.tolerance ??
            null,

          careerValue:
            null,

          fit:
            null,

          fitScore:
            null,

          contribution:
            0,

          available:
            false,

          source:
            careerMetric?.basis ??
            null
        });

        return;
      }

      const contribution =
        fit *
        weight;

      weightedTotal +=
        contribution;

      totalWeight +=
        weight;

      metrics.push({
        preferenceKey:
          signal.key ??
          null,

        metric:
          signal.metric,

        mode:
          signal.mode,

        importance,

        weight,

        direction:
          signal.direction ??
          DIRECTION.NEUTRAL,

        tolerance:
          signal.tolerance ??
          null,

        careerValue,

        fit,

        fitScore:
          fit * 10,

        contribution,

        available:
          true,

        source:
          careerMetric?.basis ??
          null
      });
    }
  );

  const preferenceFit =
    totalWeight > 0
      ? weightedTotal /
        totalWeight
      : null;

  return {
    score:
      preferenceFit ===
      null
        ? null
        : clampFit(
            preferenceFit
          ),

    score100:
      preferenceFit ===
      null
        ? null
        : clampScore(
            preferenceFit *
            10
          ),

    weightedTotal,

    totalWeight,

    metrics,

    availableMetricCount:
      metrics.filter(
        (metric) =>
          metric.available
      ).length,

    unavailableMetricCount:
      metrics.filter(
        (metric) =>
          !metric.available
      ).length
  };
}

/* ============================================================
 * PREFERENCE FILTERS
 * ============================================================
 *
 * These are preference constraints, NOT eligibility rules.
 *
 * They therefore never make an otherwise eligible career legally
 * ineligible.
 */

function normalizeComparable(
  value
) {
  return cleanText(
    value,
    ''
  )
    .trim()
    .toUpperCase();
}

function getCareerGovernmentId(
  career
) {
  return firstDefined(
    career?.identity
      ?.governmentId,
    career?.governmentId
  );
}

function getCareerStateId(
  career
) {
  return firstDefined(
    career?.identity
      ?.stateId,
    career?.stateId
  );
}

function getCareerLocationIds(
  career
) {
  const values =
    firstDefined(
      career?.location
        ?.locationIds,
      career?.postingScope
        ?.locationIds,
      career?.locationIds
    );

  if (
    Array.isArray(
      values
    )
  ) {
    return values;
  }

  return values
    ? [
        values
      ]
    : [];
}

function matchesGovernmentPreference(
  career,
  preference
) {
  const desired =
    normalizeComparable(
      preference
    );

  if (
    !desired ||
    desired ===
      'ANY'
  ) {
    return true;
  }

  const actual =
    normalizeComparable(
      getCareerGovernmentId(
        career
      )
    );

  return (
    actual ===
    desired
  );
}

function matchesStatePreference(
  career,
  preference
) {
  const desired =
    normalizeComparable(
      preference
    );

  if (
    !desired ||
    desired ===
      'ANY'
  ) {
    return true;
  }

  const actual =
    normalizeComparable(
      getCareerStateId(
        career
      )
    );

  return (
    actual ===
    desired
  );
}

function matchesLocationPreference(
  career,
  preference
) {
  const desired =
    normalizeComparable(
      preference
    );

  if (
    !desired ||
    desired ===
      'ANY'
  ) {
    return true;
  }

  const locationIds =
    getCareerLocationIds(
      career
    ).map(
      normalizeComparable
    );

  return locationIds.includes(
    desired
  );
}

function evaluatePreferenceFilters(
  career,
  preferenceModel
) {
  const filters =
    preferenceModel
      ?.filters || {};

  const government =
    matchesGovernmentPreference(
      career,
      filters.government
    );

  const state =
    matchesStatePreference(
      career,
      filters.state
    );

  const location =
    matchesLocationPreference(
      career,
      filters.location
    );

  return {
    government,
    state,
    location,

    pass:
      government &&
      state &&
      location
  };
}

/* ============================================================
 * SCORE DIMENSIONS
 * ============================================================
 */

function buildScoreBreakdown(
  {
    preferenceEvaluation,
    career,
    eligibilityStatus,
    normalizedWeights,
    preferenceFilters,
    confidence,
    completeness,
    baseScore,
    gatedScore
  }
) {
  const dimensions = {};

  preferenceEvaluation
    ?.metrics
    ?.forEach(
      (metric) => {
        if (
          metric.preferenceKey
        ) {
          dimensions[
            metric.preferenceKey
          ] = {
            metric:
              metric.metric,

            fit:
              metric.fit,

            fitScore:
              metric.fitScore,

            importance:
              metric.importance,

            weight:
              metric.weight,

            contribution:
              metric.contribution,

            direction:
              metric.direction,

            tolerance:
              metric.tolerance,

            available:
              metric.available
          };
        }
      }
    );

  return {
    preferenceFit:
      preferenceEvaluation
        ?.score100 ??
      null,

    dataConfidence:
      confidence,

    dataConfidenceWeight:
      normalizedWeights
        .dataConfidence,

    eligibilityClarity:
      getEligibilityClarityScore(
        eligibilityStatus
      ),

    eligibilityClarityWeight:
      normalizedWeights
        .eligibilityClarity,

    careerCompleteness:
      completeness,

    careerCompletenessWeight:
      normalizedWeights
        .careerCompleteness,

    preferenceFitWeight:
      normalizedWeights
        .preferenceFit,

    preferenceDimensions:
      dimensions,

    preferenceFilters: {
      government:
        preferenceFilters
          .government,

      state:
        preferenceFilters
          .state,

      location:
        preferenceFilters
          .location,

      pass:
        preferenceFilters
          .pass
    },

    baseScore,

    gatedScore,

    /*
     * Raw career facts are NOT copied into the breakdown.
     * The scoring result explains the score through normalized
     * dimensions rather than duplicating the whole career record.
     */
    careerId:
      career?.id ??
      null
  };
}

/* ============================================================
 * WEIGHT NORMALIZATION
 * ============================================================ */

function normalizeWeights(
  weights = DEFAULT_WEIGHTS
) {
  const merged = {
    ...DEFAULT_WEIGHTS,
    ...(
      weights ||
      {}
    )
  };

  const entries =
    Object.entries(
      merged
    ).map(
      ([
        key,
        value
      ]) => [
        key,
        numeric(
          value,
          0
        )
      ]
    );

  const total =
    entries.reduce(
      (
        sum,
        [
          ,
          value
        ]
      ) =>
        sum +
        Math.max(
          0,
          value
        ),
      0
    );

  if (
    total <=
    0
  ) {
    return {
      ...DEFAULT_WEIGHTS
    };
  }

  return Object.fromEntries(
    entries.map(
      ([
        key,
        value
      ]) => [
        key,
        Math.max(
          0,
          value
        ) /
        total
      ]
    )
  );
}

/* ============================================================
 * BASE SCORE
 * ============================================================ */

function calculateBaseScore(
  preferenceEvaluation,
  confidence,
  eligibilityStatus,
  completeness,
  normalizedWeights
) {
  /*
   * When no preference metric is available, preferenceFit is null.
   *
   * We do NOT silently turn it into 50.
   *
   * The scoring engine uses the remaining dimensions only in that
   * situation, then transparently reports the reduced evidence base.
   */
  const components = [];

  if (
    preferenceEvaluation
      ?.score100 !==
      null &&
    preferenceEvaluation
      ?.score100 !==
      undefined
  ) {
    components.push({
      value:
        preferenceEvaluation
          .score100,

      weight:
        normalizedWeights
          .preferenceFit
    });
  }

  components.push({
    value:
      confidence,

    weight:
      normalizedWeights
        .dataConfidence
  });

  components.push({
    value:
      getEligibilityClarityScore(
        eligibilityStatus
      ),

    weight:
      normalizedWeights
        .eligibilityClarity
  });

  components.push({
    value:
      completeness,

    weight:
      normalizedWeights
        .careerCompleteness
  });

  /*
   * Re-normalize only across dimensions that actually exist.
   *
   * This avoids assigning an unavailable preference score a false
   * numerical value.
   */
  const effectiveWeight =
    components.reduce(
      (
        sum,
        component
      ) =>
        sum +
        component.weight,
      0
    );

  if (
    effectiveWeight <=
    0
  ) {
    return 0;
  }

  const weightedTotal =
    components.reduce(
      (
        sum,
        component
      ) =>
        sum +
        (
          component.value *
          component.weight
        ),
      0
    );

  return clampScore(
    weightedTotal /
      effectiveWeight
  );
}

/* ============================================================
 * ELIGIBILITY GATE
 * ============================================================ */

function applyEligibilityGate(
  baseScore,
  eligibilityStatus
) {
  switch (
    normalizeEligibilityStatus(
      eligibilityStatus
    )
  ) {
    case 'DIRECT':
      return {
        score:
          clampScore(
            baseScore
          ),

        eligible:
          true,

        conditional:
          false,

        reviewRequired:
          false,

        unknown:
          false,

        gated:
          false,

        gate:
          'DIRECT'
      };

    case 'CONDITIONAL':
      return {
        score:
          clampScore(
            baseScore *
            CONDITIONAL_SCORE_FACTOR
          ),

        eligible:
          true,

        conditional:
          true,

        reviewRequired:
          false,

        unknown:
          false,

        gated:
          true,

        gate:
          'CONDITIONAL'
      };

    case 'REVIEW_REQUIRED':
      return {
        score:
          clampScore(
            Math.min(
              baseScore,
              REVIEW_SCORE_CAP
            )
          ),

        eligible:
          false,

        conditional:
          false,

        reviewRequired:
          true,

        unknown:
          false,

        gated:
          true,

        gate:
          'REVIEW_REQUIRED'
      };

    case 'UNKNOWN':
      return {
        score:
          0,

        eligible:
          false,

        conditional:
          false,

        reviewRequired:
          false,

        unknown:
          true,

        gated:
          true,

        gate:
          'UNKNOWN'
      };

    case 'NOT_ELIGIBLE':
    default:
      return {
        score:
          0,

        eligible:
          false,

        conditional:
          false,

        reviewRequired:
          false,

        unknown:
          false,

        gated:
          true,

        gate:
          'NOT_ELIGIBLE'
      };
  }
}

/* ============================================================
 * TRADE-OFF DETECTION
 * ============================================================
 *
 * These are generated only from already-calculated preference
 * metrics.
 *
 * The scoring engine knows:
 *   candidate preference
 *   +
 *   career metric
 *   +
 *   fit
 *
 * Therefore it is the correct place to create structured scoring
 * trade-offs.
 *
 * The explanation engine then only explains them.
 */

const TRADEOFF_FIT_THRESHOLD =
  5;

const TRADEOFF_IMPORTANCE_THRESHOLD =
  6;

function getTradeoffCategory(
  metric
) {
  const key =
    cleanText(
      metric?.preferenceKey,
      ''
    ).toLowerCase();

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
      'work-life'
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
      'medical'
    )
  ) {
    return 'medical';
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

function getTradeoffLabel(
  category
) {
  const labels = {
    location:
      'location',

    transfer:
      'transfer',

    family:
      'family compatibility',

    parentCare:
      'parent-care compatibility',

    salary:
      'salary',

    workLife:
      'work-life balance',

    physical:
      'physical risk',

    medical:
      'medical requirements',

    stress:
      'stress',

    nightDuty:
      'night-duty burden',

    shiftDuty:
      'shift-duty burden',

    housing:
      'housing',

    careerGrowth:
      'career growth',

    examDifficulty:
      'exam difficulty',

    preparation:
      'preparation burden',

    publicInteraction:
      'public interaction',

    fieldWork:
      'field work',

    general:
      'preference fit'
  };

  return (
    labels[
      category
    ] ??
    'preference fit'
  );
}

function buildTradeoffs(
  preferenceEvaluation
) {
  return (
    preferenceEvaluation
      ?.metrics ||
    []
  )
    .filter(
      (metric) =>
        metric.available &&
        Number(
          metric.importance
        ) >=
          TRADEOFF_IMPORTANCE_THRESHOLD &&
        Number(
          metric.fit
        ) <=
          TRADEOFF_FIT_THRESHOLD
    )
    .map(
      (metric) => {
        const category =
          getTradeoffCategory(
            metric
          );

        const label =
          getTradeoffLabel(
            category
          );

        return {
          category,

          label,

          preferenceKey:
            metric.preferenceKey ??
            null,

          metric:
            metric.metric ??
            null,

          importance:
            metric.importance,

          fit:
            metric.fit,

          fitScore:
            metric.fitScore,

          direction:
            metric.direction,

          tolerance:
            metric.tolerance,

          careerValue:
            metric.careerValue,

          statement:
            `This career is a weaker match for your ${label} preference.`,

          source:
            'scoring-engine'
        };
      }
    );
}

/* ============================================================
 * STRONG PREFERENCE MATCHES
 * ============================================================ */

function buildPreferenceMatches(
  preferenceEvaluation
) {
  return (
    preferenceEvaluation
      ?.metrics ||
    []
  )
    .filter(
      (metric) =>
        metric.available &&
        Number(
          metric.importance
        ) >=
          6 &&
        Number(
          metric.fit
        ) >=
          7
    )
    .sort(
      (a, b) =>
        Number(
          b.contribution ??
          0
        ) -
        Number(
          a.contribution ??
          0
        )
    )
    .map(
      (metric) => ({
        preferenceKey:
          metric.preferenceKey ??
          null,

        metric:
          metric.metric ??
          null,

        importance:
          metric.importance,

        fit:
          metric.fit,

        fitScore:
          metric.fitScore,

        contribution:
          metric.contribution,

        direction:
          metric.direction,

        tolerance:
          metric.tolerance,

        careerValue:
          metric.careerValue
      })
    );
}

/* ============================================================
 * UNCERTAINTY
 * ============================================================ */

function buildScoringUncertainty(
  preferenceEvaluation,
  career
) {
  const uncertainty = [];

  (
    preferenceEvaluation
      ?.metrics ||
    []
  )
    .filter(
      (metric) =>
        !metric.available &&
        Number(
          metric.importance
        ) > 0
    )
    .forEach(
      (metric) => {
        uncertainty.push({
          category:
            'preference-fit',

          preferenceKey:
            metric.preferenceKey ??
            null,

          metric:
            metric.metric ??
            null,

          statement:
            `No comparable career data is available for the candidate's ${cleanText(
              metric.metric,
              'requested preference'
            )} preference.`,

          confidence:
            'UNKNOWN'
        });
      }
    );

  const careerConfidence =
    normalizeConfidence(
      career?.confidence
    );

  if (
    careerConfidence ===
      'UNKNOWN' ||
    careerConfidence ===
      'NOT_VERIFIED' ||
    careerConfidence ===
      'LOW'
  ) {
    uncertainty.push({
      category:
        'career-data',

      statement:
        'The career record contains evidence that is not fully verified at a high-confidence level.',

      confidence:
        careerConfidence
    });
  }

  return uncertainty;
}

/* ============================================================
 * SCORE BAND
 * ============================================================ */

function getScoreBand(
  score
) {
  const value =
    numeric(
      score,
      0
    );

  if (
    value >=
    85
  ) {
    return {
      key:
        'EXCELLENT_MATCH',

      label:
        'Excellent Match',

      minimum:
        85,

      maximum:
        100
    };
  }

  if (
    value >=
    70
  ) {
    return {
      key:
        'STRONG_MATCH',

      label:
        'Strong Match',

      minimum:
        70,

      maximum:
        84.99
    };
  }

  if (
    value >=
    55
  ) {
    return {
      key:
        'GOOD_MATCH',

      label:
        'Good Match',

      minimum:
        55,

      maximum:
        69.99
    };
  }

  if (
    value >=
    40
  ) {
    return {
      key:
        'MIXED_MATCH',

      label:
        'Mixed Match',

      minimum:
        40,

      maximum:
        54.99
    };
  }

  return {
    key:
      'WEAK_MATCH',

    label:
      'Weak Match',

    minimum:
      0,

    maximum:
      39.99
  };
}

/* ============================================================
 * CAREER SCORE
 * ============================================================ */

function scoreCareer(
  career,
  {
    eligibility = null,
    preferences = {},
    preferenceModel = null,
    weights = DEFAULT_WEIGHTS,

    /*
     * Used when one career is scored independently and no cohort
     * salary range exists.
     *
     * The caller may supply a previously-normalized salary score,
     * but no arbitrary salary score is invented here.
     */
    salaryRange = null,

    includeDimensions = true
  } = {}
) {
  const normalizedPreferences =
    preferenceModel ??
    normalizePreferences(
      preferences
    );

  const normalizedWeights =
    normalizeWeights(
      weights
    );

  const eligibilityStatus =
    normalizeEligibilityStatus(
      eligibility?.status ??
      'UNKNOWN'
    );

  const preferenceEvaluation =
    evaluateCareerPreferences(
      career,
      normalizedPreferences,
      {
        salaryRange
      }
    );

  const preferenceFilters =
    evaluatePreferenceFilters(
      career,
      normalizedPreferences
    );

  const dataConfidence =
    getConfidenceScore(
      career?.confidence
    );

  const careerCompleteness =
    getCareerCompletenessScore(
      career
    );

  const baseScore =
    calculateBaseScore(
      preferenceEvaluation,
      dataConfidence,
      eligibilityStatus,
      careerCompleteness,
      normalizedWeights
    );

  const gated =
    applyEligibilityGate(
      baseScore,
      eligibilityStatus
    );

  const preferenceMatches =
    buildPreferenceMatches(
      preferenceEvaluation
    );

  const tradeoffs =
    buildTradeoffs(
      preferenceEvaluation
    );

  const uncertainty =
    buildScoringUncertainty(
      preferenceEvaluation,
      career
    );

  const scoreBreakdown =
    buildScoreBreakdown({
      preferenceEvaluation,
      career,
      eligibilityStatus,
      normalizedWeights,
      preferenceFilters,
      confidence:
        dataConfidence,
      completeness:
        careerCompleteness,
      baseScore:
        Number(
          baseScore.toFixed(
            2
          )
        ),
      gatedScore:
        Number(
          gated.score.toFixed(
            2
          )
        )
    });

  const result = {
    careerId:
      career?.id ??
      null,

    score:
      Number(
        gated.score.toFixed(
          2
        )
      ),

    baseScore:
      Number(
        baseScore.toFixed(
          2
        )
      ),

    eligibilityStatus,

    eligible:
      Boolean(
        gated.eligible
      ),

    conditional:
      Boolean(
        gated.conditional
      ),

    reviewRequired:
      Boolean(
        gated.reviewRequired
      ),

    unknown:
      Boolean(
        gated.unknown
      ),

    manualVerification:
      Boolean(
        gated.reviewRequired
      ),

    gated:
      Boolean(
        gated.gated
      ),

    gate:
      gated.gate,

    passesPreferenceFilters:
      preferenceFilters.pass,

    preferenceFilters:

      preferenceFilters,

    preferenceScore:
      preferenceEvaluation
        ?.score !==
        null &&
      preferenceEvaluation
        ?.score !==
        undefined
        ? Number(
            preferenceEvaluation
              .score
              .toFixed(
                2
              )
          )
        : null,

    preferenceScore100:
      preferenceEvaluation
        ?.score100 !==
        null &&
      preferenceEvaluation
        ?.score100 !==
        undefined
        ? Number(
            preferenceEvaluation
              .score100
              .toFixed(
                2
              )
          )
        : null,

    dataConfidence:
      dataConfidence,

    eligibilityClarity:
      getEligibilityClarityScore(
        eligibilityStatus
      ),

    careerCompleteness:
      Number(
        careerCompleteness.toFixed(
          2
        )
      ),

    weights:
      normalizedWeights,

    preferenceEvaluation:
      includeDimensions
        ? preferenceEvaluation
        : undefined,

    scoreBreakdown:
      includeDimensions
        ? scoreBreakdown
        : undefined,

    preferenceMatches:
      includeDimensions
        ? preferenceMatches
        : undefined,

    tradeoffs:
      includeDimensions
        ? tradeoffs
        : undefined,

    uncertainty:
      includeDimensions
        ? uncertainty
        : undefined,

    scoreBand:
      getScoreBand(
        gated.score
      ),

    /*
     * Preserve source metadata supplied by the canonical career record.
     */
    sourceIds:
      Array.isArray(
        career?.sourceIds
      )
        ? [
            ...career.sourceIds
          ]
        : [],

    sourceReferences:
      clone(
        career?.sourceReferences
      ) || [],

    confidence:
      normalizeConfidence(
        career?.confidence
      ),

    /*
     * `baEligibility` is retained only as a compatibility/display
     * field on the career itself if it exists.
     *
     * It is deliberately NOT copied into the score decision.
     */
    legacyEligibilityDisplay:
      career?.baEligibility ??
      null
  };

  return result;
}

/* ============================================================
 * BULK CAREER SCORING
 * ============================================================
 *
 * Bulk scoring builds a cohort salary range once, allowing salary
 * preference to be meaningfully compared across the current result
 * universe.
 */

function scoreCareers(
  careers,
  {
    eligibilityResults = [],
    preferences = {},
    preferenceModel = null,
    weights = DEFAULT_WEIGHTS,
    includeIneligible = true,
    includeReviewRequired = true,
    includeUnknown = true,
    includeConditional = true,
    includeDimensions = true
  } = {}
) {
  if (
    !Array.isArray(
      careers
    )
  ) {
    return [];
  }

  const normalizedPreferenceModel =
    preferenceModel ??
    normalizePreferences(
      preferences
    );

  const eligibilityMap =
    new Map();

  (
    Array.isArray(
      eligibilityResults
    )
      ? eligibilityResults
      : []
  ).forEach(
    (result) => {
      const id =
        result?.jobId ??
        result?.examId ??
        result?.serviceCadreId ??
        result?.targetId;

      if (
        id !== undefined &&
        id !== null &&
        id !== ''
      ) {
        eligibilityMap.set(
          String(
            id
          ),
          result
        );
      }
    }
  );

  const salaryRange =
    buildSalaryRange(
      careers
    );

  return careers
    .map(
      (career) => {
        const eligibility =
          eligibilityMap.get(
            String(
              career?.id ??
                ''
            )
          ) || {
            status:
              'UNKNOWN'
          };

        const result =
          scoreCareer(
            career,
            {
              eligibility,
              preferenceModel:
                normalizedPreferenceModel,
              weights,
              salaryRange,
              includeDimensions
            }
          );

        return {
          ...result,

          career,

          /*
           * Explicitly preserve the authoritative eligibility object.
           * This allows the explanation layer and UI to access the full
           * rule/source trace without re-running eligibility.
           */
          eligibilityResult:
            clone(
              eligibility
            ),

          eligibilityRuleResults:
            clone(
              eligibility?.ruleResults
            ) || [],

          eligibilitySourceIds:
            clone(
              eligibility?.sourceIds
            ) || [],

          eligibilitySourceReferences:
            clone(
              eligibility?.sourceReferences
            ) || []
        };
      }
    )
    .filter(
      (result) => {
        switch (
          normalizeEligibilityStatus(
            result.eligibilityStatus
          )
        ) {
          case 'NOT_ELIGIBLE':
            return includeIneligible;

          case 'REVIEW_REQUIRED':
            return includeReviewRequired;

          case 'UNKNOWN':
            return includeUnknown;

          case 'CONDITIONAL':
            return includeConditional;

          case 'DIRECT':
            return true;

          default:
            return false;
        }
      }
    );
}

/* ============================================================
 * SCORE METHODOLOGY
 * ============================================================ */

function getScoreMethodology(
  weights = DEFAULT_WEIGHTS
) {
  const normalizedWeights =
    normalizeWeights(
      weights
    );

  return {
    version:
      'canonical-2.0.0',

    description:
      'Deterministic analytical career-fit score combining candidate preference fit, source/evidence confidence, eligibility clarity and career-record completeness.',

    scoreRange: {
      minimum:
        SCORE_RANGE.MIN,

      maximum:
        SCORE_RANGE.MAX
    },

    weights:
      normalizedWeights,

    semantics: {
      preferenceFit:
        'Measures how well supplied career attributes align with the candidate preference model.',

      dataConfidence:
        'Reflects the confidence classification already attached to the career record.',

      eligibilityClarity:
        'Reflects how clearly the eligibility engine established the candidate state.',

      careerCompleteness:
        'Reflects how much of the canonical career record is populated.',

      conditionalGate:
        CONDITIONAL_SCORE_FACTOR,

      reviewScoreCap:
        REVIEW_SCORE_CAP
    },

    eligibilityRules: {
      direct:
        'Normal scoring gate.',

      conditional:
        'Score is available but reduced by the conditional gate.',

      reviewRequired:
        'Not automatically recommendable; score is capped for audit/decision-support views.',

      unknown:
        'Not automatically recommendable; score is zero.',

      notEligible:
        'Score is zero.'
    },

    importantLimitations: [
      'The score is not an official government ranking.',
      'The score is not a probability of selection.',
      'The score does not replace legal eligibility rules.',
      'Unavailable career attributes are not converted into assumed positive values.',
      'Salary preference is cohort-relative when starting basic is the only salary evidence available.'
    ]
  };
}

/* ============================================================
 * RESULT VALIDATION
 * ============================================================
 */

function validateScoreResult(
  result
) {
  const errors = [];

  if (
    !result ||
    typeof result !==
      'object'
  ) {
    return {
      valid:
        false,

      errors: [
        'Score result is not an object.'
      ]
    };
  }

  if (
    !Number.isFinite(
      Number(
        result.score
      )
    )
  ) {
    errors.push(
      'Score is not a finite number.'
    );
  }

  if (
    Number(
      result.score
    ) <
      SCORE_RANGE.MIN ||
    Number(
      result.score
    ) >
      SCORE_RANGE.MAX
  ) {
    errors.push(
      'Score is outside the 0–100 range.'
    );
  }

  const status =
    normalizeEligibilityStatus(
      result.eligibilityStatus
    );

  if (
    ![
      'DIRECT',
      'CONDITIONAL',
      'NOT_ELIGIBLE',
      'REVIEW_REQUIRED',
      'UNKNOWN'
    ].includes(
      status
    )
  ) {
    errors.push(
      'Invalid eligibility status.'
    );
  }

  if (
    status ===
      'NOT_ELIGIBLE' &&
    Number(
      result.score
    ) !== 0
  ) {
    errors.push(
      'NOT_ELIGIBLE result must have a score of zero.'
    );
  }

  if (
    status ===
      'UNKNOWN' &&
    Number(
      result.score
    ) !== 0
  ) {
    errors.push(
      'UNKNOWN eligibility must not have an automatic recommendation score.'
    );
  }

  return {
    valid:
      errors.length ===
      0,

    errors
  };
}

/* ============================================================
 * EXPORTS
 * ============================================================ */

export {
  DEFAULT_WEIGHTS,

  SCORE_RANGE,
  FIT_RANGE,

  CONFIDENCE_SCORE,

  normalizeWeights,
  normalizeConfidence,
  getConfidenceScore,

  normalizeEligibilityStatus,
  getEligibilityClarityScore,

  getCareerCompletenessScore,

  getCareerMetric,
  getNormalizedCareerMetric,

  buildSalaryRange,
  normalizeRelativeSalary,

  calculateDirectionalFit,
  calculateToleranceFit,

  evaluateCareerPreferences,
  evaluatePreferenceFilters,

  buildPreferenceMatches,
  buildTradeoffs,
  buildScoringUncertainty,

  scoreCareer,
  scoreCareers,

  getScoreBand,
  getScoreMethodology,

  validateScoreResult
};

export default {
  DEFAULT_WEIGHTS,

  normalizeWeights,

  getConfidenceScore,
  getEligibilityClarityScore,
  getCareerCompletenessScore,

  evaluateCareerPreferences,
  evaluatePreferenceFilters,

  scoreCareer,
  scoreCareers,

  getScoreBand,
  getScoreMethodology,

  validateScoreResult
};
