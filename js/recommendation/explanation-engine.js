/**
 * GovCareer Compass
 * ============================================================
 * CAREER EXPLANATION ENGINE
 * ============================================================
 *
 * Purpose
 * -------
 * Converts eligibility and scoring output into transparent,
 * human-readable explanations.
 *
 * The engine must explain:
 *
 * - why the candidate is eligible;
 * - why a career ranks highly;
 * - which preferences helped;
 * - which trade-offs exist;
 * - what remains uncertain;
 * - why a career is conditional or needs verification.
 *
 * This is deterministic and database-driven.
 *
 * Compass AI may later provide a richer conversational
 * explanation, but the core website must remain understandable
 * without AI.
 */

import {
  ELIGIBILITY_RESULT
} from './eligibility-engine.js';

import {
  getScoreBand,
  getConfidenceScore
} from './scoring-engine.js';

const PREFERENCE_LABELS =
  Object.freeze({
    salaryImportance:
      'salary',

    authorityImportance:
      'authority',

    familyImportance:
      'family compatibility',

    parentCareImportance:
      'elderly-parent compatibility',

    kolkataImportance:
      'Kolkata stability',

    jobSecurityImportance:
      'job security',

    lowStressImportance:
      'lower stress',

    lowPhysicalRiskImportance:
      'lower physical risk',

    careerGrowthImportance:
      'career growth',

    prestigeImportance:
      'social status/prestige',

    workLifeBalanceImportance:
      'work-life balance',

    housingImportance:
      'housing advantage',

    lowTransferImportance:
      'lower transfer burden',

    lowNightDutyImportance:
      'lower night-duty burden',

    lowWeekendDutyImportance:
      'fewer weekend/holiday duties'
  });

const STATUS_LABELS =
  Object.freeze({
    [ELIGIBILITY_RESULT.DIRECT]:
      'Directly eligible',

    [ELIGIBILITY_RESULT.CONDITIONAL]:
      'Conditionally eligible',

    [ELIGIBILITY_RESULT.MANUAL_VERIFICATION]:
      'Manual verification required',

    [ELIGIBILITY_RESULT.NOT_ELIGIBLE]:
      'Not eligible'
  });

function getCareerName(
  career
) {
  const name =
    career?.name ||
    career?.post ||
    career?.postName ||
    career?.title ||
    career?.officialName;

  if (
    typeof name ===
    'string'
  ) {
    return name;
  }

  if (
    name &&
    typeof name ===
      'object'
  ) {
    return (
      name.en ||
      Object.values(
        name
      )[0] ||
      'This career'
    );
  }

  return 'This career';
}

function getGovernmentName(
  career
) {
  return (
    career?.governmentName ||
    career?.governmentId ||
    ''
  );
}

function getEligibilityExplanation(
  eligibilityResult
) {
  if (
    !eligibilityResult
  ) {
    return {
      headline:
        'Eligibility could not be determined.',
      reasons: [
        'No eligibility result is available.'
      ],
      cautions: [
        'Verify the current official recruitment notification before applying.'
      ]
    };
  }

  switch (
    eligibilityResult.status
  ) {
    case ELIGIBILITY_RESULT.DIRECT:
      return {
        headline:
          'Your available information satisfies the evaluated hard eligibility rules.',
        reasons:
          buildPassedReasons(
            eligibilityResult
          ),
        cautions: []
      };

    case ELIGIBILITY_RESULT.CONDITIONAL:
      return {
        headline:
          'You appear eligible subject to the conditions identified by the recruitment rules.',
        reasons:
          buildPassedReasons(
            eligibilityResult
          ),
        cautions:
          buildConditionalReasons(
            eligibilityResult
          )
      };

    case ELIGIBILITY_RESULT.NOT_ELIGIBLE:
      return {
        headline:
          'The evaluated hard eligibility rules are not satisfied.',
        reasons:
          buildFailedReasons(
            eligibilityResult
          ),
        cautions: [
          'A preference score cannot override a mandatory eligibility requirement.'
        ]
      };

    case ELIGIBILITY_RESULT.MANUAL_VERIFICATION:
      return {
        headline:
          'Additional verification is required before eligibility can be concluded.',
        reasons: [],
        cautions:
          buildManualReasons(
            eligibilityResult
          )
      };

    default:
      return {
        headline:
          'Eligibility status is uncertain.',
        reasons: [],
        cautions: [
          'Check the applicable official recruitment notification.'
        ]
      };
  }
}

function buildPassedReasons(
  result
) {
  return (
    result.ruleResults || []
  )
    .filter(
      (rule) =>
        rule.status ===
        ELIGIBILITY_RESULT.DIRECT
    )
    .map(
      (rule) =>
        `Requirement satisfied: ${formatCondition(
          rule.conditionType
        )}.`
    );
}

function buildFailedReasons(
  result
) {
  return (
    result.ruleResults || []
  )
    .filter(
      (rule) =>
        rule.status ===
        ELIGIBILITY_RESULT.NOT_ELIGIBLE
    )
    .map(
      (rule) =>
        rule.reason ||
        `Requirement not satisfied: ${formatCondition(
          rule.conditionType
        )}.`
    );
}

function buildConditionalReasons(
  result
) {
  return (
    result.ruleResults || []
  )
    .filter(
      (rule) =>
        rule.status ===
          ELIGIBILITY_RESULT.MANUAL_VERIFICATION ||
        rule.status ===
          ELIGIBILITY_RESULT.CONDITIONAL
    )
    .map(
      (rule) =>
        rule.reason ||
        `Additional verification may be required for ${formatCondition(
          rule.conditionType
        )}.`
    );
}

function buildManualReasons(
  result
) {
  const reasons =
    (
      result.ruleResults || []
    )
      .filter(
        (rule) =>
          rule.status ===
          ELIGIBILITY_RESULT.MANUAL_VERIFICATION
      )
      .map(
        (rule) =>
          rule.reason ||
          `Verification required for ${formatCondition(
            rule.conditionType
          )}.`
      );

  if (
    reasons.length ===
    0
  ) {
    reasons.push(
      result.reason ||
        'The available candidate data is insufficient for a definitive conclusion.'
    );
  }

  return reasons;
}

function formatCondition(
  condition
) {
  if (!condition) {
    return 'this requirement';
  }

  return String(
    condition
  )
    .toLowerCase()
    .replace(
      /_/g,
      ' '
    );
}

function getPreferenceHighlights(
  scoredResult,
  {
    minimumImportance = 6,
    minimumFit = 7
  } = {}
) {
  const metrics =
    scoredResult
      ?.preferenceEvaluation
      ?.details
      ?.metrics || [];

  return metrics
    .filter(
      (metric) =>
        metric.available &&
        Number(
          metric.importance
        ) >=
          minimumImportance &&
        Number(
          metric.fit
        ) >=
          minimumFit
    )
    .sort(
      (a, b) =>
        (
          Number(
            b.contribution
          ) -
          Number(
            a.contribution
          )
        )
    )
    .map(
      (metric) => ({
        preferenceKey:
          metric.preferenceKey,
        label:
          PREFERENCE_LABELS[
            metric.preferenceKey
          ] ||
          metric.preferenceKey,
        importance:
          Number(
            metric.importance
          ),
        fit:
          Number(
            metric.fit
          )
      })
    );
}

function getPreferenceWeaknesses(
  scoredResult,
  {
    maximumFit = 4,
    minimumImportance = 6
  } = {}
) {
  const metrics =
    scoredResult
      ?.preferenceEvaluation
      ?.details
      ?.metrics || [];

  return metrics
    .filter(
      (metric) =>
        metric.available &&
        Number(
          metric.importance
        ) >=
          minimumImportance &&
        Number(
          metric.fit
        ) <=
          maximumFit
    )
    .sort(
      (a, b) =>
        Number(
          a.fit
        ) -
        Number(
          b.fit
        )
    )
    .map(
      (metric) => ({
        preferenceKey:
          metric.preferenceKey,
        label:
          PREFERENCE_LABELS[
            metric.preferenceKey
          ] ||
          metric.preferenceKey,
        importance:
          Number(
            metric.importance
          ),
        fit:
          Number(
            metric.fit
          )
      })
    );
}

function buildTradeoffs(
  career
) {
  const tradeoffs = [];

  if (
    Number.isFinite(
      Number(
        career?.stress
      )
    ) &&
    Number(
      career.stress
    ) >=
      7
  ) {
    tradeoffs.push(
      'The role has a relatively high stress indicator in the current analytical dataset.'
    );
  }

  if (
    Number.isFinite(
      Number(
        career?.physicalRisk
      )
    ) &&
    Number(
      career.physicalRisk
    ) >=
      7
  ) {
    tradeoffs.push(
      'The role has a relatively high physical-risk indicator.'
    );
  }

  if (
    Number.isFinite(
      Number(
        career?.transferBurden
      )
    ) &&
    Number(
      career.transferBurden
    ) >=
      7
  ) {
    tradeoffs.push(
      'Transfer burden is relatively high.'
    );
  }

  if (
    Number.isFinite(
      Number(
        career?.nightDutyBurden
      )
    ) &&
    Number(
      career.nightDutyBurden
    ) >=
      7
  ) {
    tradeoffs.push(
      'Night-duty burden is relatively high.'
    );
  }

  if (
    Number.isFinite(
      Number(
        career?.workLife
      )
    ) &&
    Number(
      career.workLife
    ) <=
      4
  ) {
    tradeoffs.push(
      'The current work-life indicator is relatively demanding.'
    );
  }

  if (
    Number.isFinite(
      Number(
        career?.kolkataStability
      )
    ) &&
    Number(
      career.kolkataStability
    ) <=
      4
  ) {
    tradeoffs.push(
      'Kolkata/geographic stability is relatively limited.'
    );
  }

  return tradeoffs;
}

function buildConfidenceExplanation(
  career
) {
  const confidence =
    String(
      career?.confidence ||
        'UNKNOWN'
    ).toUpperCase();

  const score =
    getConfidenceScore(
      confidence
    );

  if (
    score >=
    90
  ) {
    return 'The relevant record has a high-confidence evidence classification.';
  }

  if (
    score >=
    75
  ) {
    return 'The relevant record has reasonably strong evidence, although some details may require source review.';
  }

  if (
    score >=
    50
  ) {
    return 'Some information should be treated cautiously because the available evidence is not fully definitive.';
  }

  return 'Important information remains uncertain or requires manual verification.';
}

function createCareerExplanation(
  {
    career,
    eligibility,
    scoredResult = null,
    rank = null
  } = {}
) {
  const name =
    getCareerName(
      career
    );

  const eligibilityExplanation =
    getEligibilityExplanation(
      eligibility
    );

  const highlights =
    getPreferenceHighlights(
      scoredResult
    );

  const weaknesses =
    getPreferenceWeaknesses(
      scoredResult
    );

  const tradeoffs =
    buildTradeoffs(
      career
    );

  const confidenceExplanation =
    buildConfidenceExplanation(
      career
    );

  const score =
    scoredResult
      ?.score;

  const scoreBand =
    getScoreBand(
      score ??
        0
    );

  const whyRanked =
    [];

  if (
    Number.isFinite(
      Number(score)
    )
  ) {
    whyRanked.push(
      `${scoreBand.label} with an analytical fit score of ${Number(
        score
      ).toFixed(1)}/100.`
    );
  }

  highlights
    .slice(
      0,
      5
    )
    .forEach(
      (item) => {
        whyRanked.push(
          `Strong alignment with your ${item.label} preference.`
        );
      }
    );

  if (
    rank
  ) {
    whyRanked.push(
      `Ranked #${rank} among the careers included in this recommendation set.`
    );
  }

  return {
    careerId:
      career?.id ??
      null,

    careerName:
      name,

    government:
      getGovernmentName(
        career
      ),

    eligibility:
      eligibilityExplanation,

    score: score ?? null,

    scoreBand,

    whyRecommended:
      whyRanked,

    strongestPreferenceMatches:
      highlights,

    weakerPreferenceAreas:
      weaknesses,

    tradeoffs,

    evidence:
      confidenceExplanation,

    caveats: [
      'This is an analytical recommendation, not an official recruitment recommendation.',
      'Current recruitment notifications and service rules control actual eligibility.',
      'Salary, transfer, housing and lifestyle indicators may vary by posting and current rules.'
    ]
  };
}

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
      topCount
    )
    .map(
      (result) =>
        createCareerExplanation(
          {
            career:
              result.career,
            eligibility: {
              status:
                result.eligibilityStatus,
              ruleResults:
                result.eligibilityRuleResults ||
                []
            },
            scoredResult:
              result,
            rank:
              result.rank
          }
        )
    );
}

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
      statements: []
    };
  }

  const eligible =
    scoredResults
      .filter(
        (result) =>
          result.eligibilityStatus !==
          ELIGIBILITY_RESULT.NOT_ELIGIBLE
      )
      .sort(
        (a, b) =>
          Number(
            b.score
          ) -
          Number(
            a.score
          )
      );

  if (
    eligible.length ===
    0
  ) {
    return {
      winner:
        null,
      statements: [
        'No currently eligible career is available for this comparison.'
      ]
    };
  }

  const winner =
    eligible[0];

  const statements = [
    `${getCareerName(
      winner.career
    )} has the highest analytical fit score among the compared eligible careers.`
  ];

  if (
    eligible.length >
    1
  ) {
    const runnerUp =
      eligible[1];

    const difference =
      Number(
        winner.score
      ) -
      Number(
        runnerUp.score
      );

    statements.push(
      `Its score is ${difference.toFixed(
        1
      )} points above the next-ranked career.`
    );
  }

  return {
    winner:
      winner.careerId ??
      winner.career?.id ??
      null,

    statements
  };
}

export {
  PREFERENCE_LABELS,
  getCareerName,
  getEligibilityExplanation,
  getPreferenceHighlights,
  getPreferenceWeaknesses,
  buildTradeoffs,
  buildConfidenceExplanation,
  createCareerExplanation,
  createRankingExplanation,
  createComparisonExplanation
};

export default {
  createCareerExplanation,
  createRankingExplanation,
  createComparisonExplanation,
  getEligibilityExplanation,
  getPreferenceHighlights
};
