/**
 * GovCareer Compass
 * ============================================================
 * CAREER SCORING ENGINE
 * ============================================================
 *
 * Purpose
 * -------
 * Produces a transparent normalized score from:
 *
 *   1. Eligibility result
 *   2. Candidate preferences
 *   3. Career attributes
 *
 * The score is an analytical decision aid.
 *
 * It is NOT:
 * - an official government ranking;
 * - an examination cutoff;
 * - a legal eligibility result;
 * - a prediction of selection.
 */

import config from '../config.js';

import {
  ELIGIBILITY_RESULT
} from './eligibility-engine.js';

import {
  evaluatePreferenceFit,
  normalizePreferences
} from './preference-engine.js';

const DEFAULT_WEIGHTS = Object.freeze({
  preferenceFit: 0.70,
  dataConfidence: 0.10,
  eligibilityClarity: 0.10,
  careerCompleteness: 0.10
});

function clamp(
  value,
  min = 0,
  max = 100
) {
  const numeric =
    Number(value);

  if (
    !Number.isFinite(
      numeric
    )
  ) {
    return min;
  }

  return Math.min(
    max,
    Math.max(
      min,
      numeric
    )
  );
}

function score10To100(
  value
) {
  if (
    !Number.isFinite(
      Number(value)
    )
  ) {
    return 50;
  }

  return clamp(
    Number(value) * 10,
    0,
    100
  );
}

function getConfidenceScore(
  confidence
) {
  const mapping = {
    HIGH: 100,
    MEDIUM_HIGH: 90,
    MEDIUM: 75,
    LOW: 55,
    ESTIMATE: 45,
    NOT_VERIFIED: 20,
    UNKNOWN: 35
  };

  const key =
    String(
      confidence ||
        'UNKNOWN'
    ).toUpperCase();

  return (
    mapping[key] ??
    mapping.UNKNOWN
  );
}

function getEligibilityClarityScore(
  eligibility
) {
  switch (
    eligibility
  ) {
    case ELIGIBILITY_RESULT.DIRECT:
      return 100;

    case ELIGIBILITY_RESULT.CONDITIONAL:
      return 80;

    case ELIGIBILITY_RESULT.MANUAL_VERIFICATION:
      return 40;

    case ELIGIBILITY_RESULT.NOT_ELIGIBLE:
      return 0;

    default:
      return 30;
  }
}

function getCareerCompletenessScore(
  career
) {
  const fields = [
    'governmentId',
    'departmentId',
    'organisationId',
    'post',
    'jobProfile',
    'qualification',
    'payLevel',
    'startingBasic',
    'posting',
    'transfer',
    'promotion',
    'housing',
    'sourceIds'
  ];

  let present = 0;

  fields.forEach(
    (field) => {
      const value =
        career?.[
          field
        ];

      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !(
          Array.isArray(
            value
          ) &&
          value.length === 0
        )
      ) {
        present += 1;
      }
    }
  );

  return (
    present /
    fields.length
  ) *
  100;
}

function normalizeWeights(
  weights = DEFAULT_WEIGHTS
) {
  const merged = {
    ...DEFAULT_WEIGHTS,
    ...(weights || {})
  };

  const rawValues =
    Object.values(
      merged
    ).map(
      Number
    );

  const total =
    rawValues.reduce(
      (
        sum,
        value
      ) =>
        Number.isFinite(
          value
        )
          ? sum + value
          : sum,
      0
    );

  if (
    total <= 0
  ) {
    return {
      ...DEFAULT_WEIGHTS
    };
  }

  return Object.fromEntries(
    Object.entries(
      merged
    ).map(
      ([
        key,
        value
      ]) => [
        key,
        Number.isFinite(
          Number(value)
        )
          ? Number(value) /
            total
          : 0
      ]
    )
  );
}

function deriveDimensionScores(
  career,
  preferenceEvaluation
) {
  const details =
    preferenceEvaluation
      ?.details
      ?.metrics || [];

  const dimensions = {};

  details.forEach(
    (metric) => {
      if (
        !metric.available
      ) {
        return;
      }

      dimensions[
        metric.preferenceKey
      ] =
        clamp(
          Number(
            metric.fit
          ) * 10,
          0,
          100
        );
    }
  );

  dimensions.preferenceFit =
    clamp(
      Number(
        preferenceEvaluation
          ?.preferenceScore
      ) * 10,
      0,
      100
    );

  dimensions.categoryFit =
    clamp(
      Number(
        preferenceEvaluation
          ?.categoryScore
      ) * 10,
      0,
      100
    );

  dimensions.dataConfidence =
    getConfidenceScore(
      career?.confidence
    );

  dimensions.eligibilityClarity =
    getEligibilityClarityScore(
      preferenceEvaluation
        ?.eligibilityStatus
    );

  dimensions.careerCompleteness =
    getCareerCompletenessScore(
      career
    );

  return dimensions;
}

function getOverallBaseScore(
  dimensions,
  weights
) {
  return (
    (
      dimensions.preferenceFit *
      weights.preferenceFit
    ) +
    (
      dimensions.dataConfidence *
      weights.dataConfidence
    ) +
    (
      dimensions.eligibilityClarity *
      weights.eligibilityClarity
    ) +
    (
      dimensions.careerCompleteness *
      weights.careerCompleteness
    )
  );
}

function applyEligibilityGate(
  baseScore,
  eligibilityStatus
) {
  switch (
    eligibilityStatus
  ) {
    case ELIGIBILITY_RESULT.DIRECT:
      return {
        score:
          clamp(
            baseScore
          ),
        eligible:
          true,
        gated:
          false
      };

    case ELIGIBILITY_RESULT.CONDITIONAL:
      return {
        score:
          clamp(
            baseScore *
              0.90
          ),
        eligible:
          true,
        conditional:
          true,
        gated:
          true
      };

    case ELIGIBILITY_RESULT.MANUAL_VERIFICATION:
      return {
        score:
          clamp(
            Math.min(
              baseScore,
              55
            )
          ),
        eligible:
          false,
        manualVerification:
          true,
        gated:
          true
      };

    case ELIGIBILITY_RESULT.NOT_ELIGIBLE:
      return {
        score:
          0,
        eligible:
          false,
        gated:
          true
      };

    default:
      return {
        score:
          0,
        eligible:
          false,
        gated:
          true
      };
  }
}

function scoreCareer(
  career,
  {
    eligibility = null,
    preferences = {},
    weights = DEFAULT_WEIGHTS,
    includeDimensions = true
  } = {}
) {
  const normalizedPreferences =
    normalizePreferences(
      preferences
    );

  const normalizedWeights =
    normalizeWeights(
      weights
    );

  const eligibilityStatus =
    eligibility?.status ??
    ELIGIBILITY_RESULT.MANUAL_VERIFICATION;

  const preferenceEvaluation =
    evaluatePreferenceFit(
      career,
      normalizedPreferences
    );

  /*
   * Attach eligibility to the local evaluation object so
   * deriveDimensionScores can calculate clarity correctly.
   */
  const enrichedPreferenceEvaluation =
    {
      ...preferenceEvaluation,
      eligibilityStatus
    };

  const dimensions =
    deriveDimensionScores(
      career,
      enrichedPreferenceEvaluation
    );

  const baseScore =
    getOverallBaseScore(
      dimensions,
      normalizedWeights
    );

  const gated =
    applyEligibilityGate(
      baseScore,
      eligibilityStatus
    );

  return {
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

    manualVerification:
      Boolean(
        gated.manualVerification
      ),

    passesPreferenceFilters:
      Boolean(
        preferenceEvaluation
          .passesPreferenceFilters
      ),

    preferenceScore:
      Number(
        (
          preferenceEvaluation
            .preferenceScore ??
          0
        ).toFixed(2)
      ),

    weights:
      normalizedWeights,

    dimensions:
      includeDimensions
        ? dimensions
        : undefined,

    preferenceEvaluation:
      includeDimensions
        ? preferenceEvaluation
        : undefined
  };
}

function scoreCareers(
  careers,
  {
    eligibilityResults = [],
    preferences = {},
    weights = DEFAULT_WEIGHTS,
    includeIneligible = false
  } = {}
) {
  if (
    !Array.isArray(
      careers
    )
  ) {
    return [];
  }

  const eligibilityMap =
    new Map();

  eligibilityResults.forEach(
    (result) => {
      const id =
        result.jobId ??
        result.examId ??
        result.serviceCadreId ??
        result.targetId;

      if (id) {
        eligibilityMap.set(
          id,
          result
        );
      }
    }
  );

  return careers
    .map(
      (career) => {
        const eligibility =
          eligibilityMap.get(
            career.id
          ) || {
            status:
              ELIGIBILITY_RESULT.MANUAL_VERIFICATION
          };

        const scored =
          scoreCareer(
            career,
            {
              eligibility,
              preferences,
              weights
            }
          );

        return {
          ...scored,
          career
        };
      }
    )
    .filter(
      (result) => {
        if (
          includeIneligible
        ) {
          return true;
        }

        return (
          result.eligibilityStatus !==
            ELIGIBILITY_RESULT.NOT_ELIGIBLE
        );
      }
    );
}

function getScoreBand(
  score
) {
  const value =
    Number(score);

  if (
    value >= 85
  ) {
    return {
      key:
        'EXCELLENT_MATCH',
      label:
        'Excellent Match'
    };
  }

  if (
    value >= 70
  ) {
    return {
      key:
        'STRONG_MATCH',
      label:
        'Strong Match'
    };
  }

  if (
    value >= 55
  ) {
    return {
      key:
        'GOOD_MATCH',
      label:
        'Good Match'
    };
  }

  if (
    value >= 40
  ) {
    return {
      key:
        'MIXED_MATCH',
      label:
        'Mixed Match'
    };
  }

  return {
    key:
      'WEAK_MATCH',
    label:
      'Weak Match'
  };
}

function getScoreMethodology() {
  return {
    description:
      'Analytical career-fit score combining user preference fit, evidence confidence, eligibility clarity and record completeness.',
    eligibilityGate:
      'Hard ineligibility always overrides preference score.',
    weights: {
      ...DEFAULT_WEIGHTS
    },
    semantics:
      config.scoreSemantics
  };
}

export {
  DEFAULT_WEIGHTS,
  normalizeWeights,
  scoreCareer,
  scoreCareers,
  getScoreBand,
  getScoreMethodology,
  getConfidenceScore,
  getCareerCompletenessScore
};

export default {
  DEFAULT_WEIGHTS,
  normalizeWeights,
  scoreCareer,
  scoreCareers,
  getScoreBand,
  getScoreMethodology
};
