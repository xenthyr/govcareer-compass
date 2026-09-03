/**
 * GovCareer Compass
 * ============================================================
 * CAREER RANKING ENGINE
 * ============================================================
 *
 * Purpose
 * -------
 * Consumes finalized eligibility + scoring results and produces
 * deterministic ordered recommendation results.
 *
 * Canonical pipeline
 * ------------------
 *
 *   Candidate Profile
 *          │
 *          ▼
 *   Eligibility Engine
 *          │
 *          ├── NOT_ELIGIBLE
 *          ├── REVIEW_REQUIRED / UNKNOWN
 *          ├── CONDITIONAL
 *          └── DIRECT
 *                    │
 *                    ▼
 *             Preference Engine
 *                    │
 *                    ▼
 *              Scoring Engine
 *                    │
 *                    ▼
 *              Ranking Engine
 *
 * This module only performs ORDERING.
 *
 * It must NOT:
 * - determine legal eligibility;
 * - infer eligibility;
 * - calculate preference fit;
 * - calculate career scores;
 * - inspect raw career facts to invent scores;
 * - modify score breakdowns;
 * - replace missing information with assumptions;
 * - override hard ineligibility.
 *
 * Ranking responsibility
 * ----------------------
 * The Ranking Engine:
 *
 *   1. receives already-scored records;
 *   2. classifies eligibility state;
 *   3. excludes unsafe states by policy;
 *   4. orders remaining records deterministically;
 *   5. preserves all upstream score/explanation/evidence data;
 *   6. applies only configured ranking policy;
 *   7. assigns stable ranks.
 *
 * Deterministic ordering
 * ----------------------
 * Default order:
 *
 *   1. Eligibility priority
 *   2. Preference-filter status
 *   3. Overall score
 *   4. Preference score
 *   5. Score confidence
 *   6. Career confidence
 *   7. Stable career ID
 *
 * No raw career metric is recalculated here.
 *
 * Unknown eligibility
 * -------------------
 * UNKNOWN and REVIEW_REQUIRED are never silently treated as
 * eligible.
 *
 * They may be returned separately when requested, but they are
 * never allowed into the normal recommendation ranking unless
 * explicitly enabled by the caller.
 */

import {
  ELIGIBILITY_RESULT
} from './eligibility-engine.js';

/* ============================================================
 * CANONICAL ELIGIBILITY PRIORITY
 * ============================================================
 *
 * DIRECT is the strongest recommendation state.
 *
 * CONDITIONAL remains potentially recommendable but ranks below
 * DIRECT.
 *
 * REVIEW_REQUIRED and UNKNOWN are not safe automatic
 * recommendations.
 *
 * NOT_ELIGIBLE is always last and is excluded by default.
 */

const ELIGIBILITY_PRIORITY =
  Object.freeze({
    [ELIGIBILITY_RESULT.DIRECT]:
      4,

    [ELIGIBILITY_RESULT.CONDITIONAL]:
      3,

    [ELIGIBILITY_RESULT.REVIEW_REQUIRED]:
      1,

    [ELIGIBILITY_RESULT.UNKNOWN]:
      0,

    [ELIGIBILITY_RESULT.NOT_ELIGIBLE]:
      -1,

    /*
     * Compatibility with older callers that still submit the literal
     * string MANUAL_VERIFICATION rather than the canonical
     * REVIEW_REQUIRED value.
     */
    MANUAL_VERIFICATION:
      1
  });

/* ============================================================
 * CONFIDENCE PRIORITY
 * ============================================================ */

const CONFIDENCE_PRIORITY =
  Object.freeze({
    HIGH: 6,
    MEDIUM_HIGH: 5,
    MEDIUM: 4,
    LOW: 3,
    ESTIMATE: 2,
    NOT_VERIFIED: 1,
    UNKNOWN: 0
  });

/* ============================================================
 * BASIC HELPERS
 * ========================================================== */

function numeric(
  value,
  fallback = 0
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

function normalizeStatus(
  status
) {
  const normalized =
    String(
      status ??
        ''
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
    'REVIEW_REQUIRED'
  ) {
    return 'REVIEW_REQUIRED';
  }

  if (
    normalized ===
    'UNKNOWN'
  ) {
    return 'UNKNOWN';
  }

  if (
    normalized ===
    'CONDITIONAL'
  ) {
    return 'CONDITIONAL';
  }

  if (
    normalized ===
    'DIRECT'
  ) {
    return 'DIRECT';
  }

  if (
    normalized ===
    'NOT_ELIGIBLE'
  ) {
    return 'NOT_ELIGIBLE';
  }

  return 'UNKNOWN';
}

function getEligibilityPriority(
  status
) {
  const normalized =
    normalizeStatus(
      status
    );

  return (
    ELIGIBILITY_PRIORITY[
      normalized
    ] ??
    ELIGIBILITY_PRIORITY.UNKNOWN
  );
}

function getConfidencePriority(
  confidence
) {
  const key =
    String(
      confidence ??
        'UNKNOWN'
    )
      .trim()
      .toUpperCase();

  return (
    CONFIDENCE_PRIORITY[
      key
    ] ??
    CONFIDENCE_PRIORITY.UNKNOWN
  );
}

function getCareerId(
  item
) {
  return String(
    item?.career?.id ??
      item?.careerId ??
      item?.jobId ??
      item?.examId ??
      item?.serviceCadreId ??
      ''
  );
}

function getScore(
  item
) {
  return numeric(
    item?.score,
    0
  );
}

function getPreferenceScore(
  item
) {
  /*
   * The preferred canonical location is `preferenceScore`.
   *
   * A small compatibility fallback is retained for scoring
   * implementations that nest the value in `scoreBreakdown`.
   *
   * This does not calculate the value.
   */
  return numeric(
    item?.preferenceScore ??
      item?.scoreBreakdown
        ?.preferenceScore ??
      item?.breakdown
        ?.preferenceScore,
    0
  );
}

function getScoreConfidence(
  item
) {
  return (
    item?.scoreConfidence ??
    item?.scoreBreakdown
      ?.confidence ??
    item?.scoring?.confidence ??
    'UNKNOWN'
  );
}

function getCareerConfidence(
  item
) {
  return (
    item?.career?.confidence ??
    item?.confidence ??
    'UNKNOWN'
  );
}

function hasPreferenceFilterResult(
  item
) {
  /*
   * An explicitly supplied boolean is authoritative.
   *
   * Missing filter information is treated as "not supplied",
   * not automatically as a failed or passed preference match.
   */
  if (
    typeof item?.passesPreferenceFilters ===
    'boolean'
  ) {
    return item
      .passesPreferenceFilters;
  }

  if (
    typeof item?.preferenceFilterPass ===
    'boolean'
  ) {
    return item.preferenceFilterPass;
  }

  return null;
}

function getPreferenceFilterPriority(
  item
) {
  const value =
    hasPreferenceFilterResult(
      item
    );

  if (
    value === true
  ) {
    return 2;
  }

  if (
    value === false
  ) {
    return 1;
  }

  return 0;
}

function compareStrings(
  a,
  b
) {
  return String(
    a ??
      ''
  ).localeCompare(
    String(
      b ??
        ''
    )
  );
}

/* ============================================================
 * ELIGIBILITY CLASSIFICATION
 * ========================================================== */

function classifyEligibility(
  item
) {
  const status =
    normalizeStatus(
      item?.eligibilityStatus
    );

  return {
    status,

    priority:
      getEligibilityPriority(
        status
      ),

    directlyEligible:
      status ===
      'DIRECT',

    conditionallyEligible:
      status ===
      'CONDITIONAL',

    reviewRequired:
      status ===
        'REVIEW_REQUIRED' ||
      status ===
        'UNKNOWN',

    unknown:
      status ===
      'UNKNOWN',

    notEligible:
      status ===
      'NOT_ELIGIBLE'
  };
}

/* ============================================================
 * RECOMMENDABILITY POLICY
 * ============================================================
 *
 * These functions do not alter eligibility.
 *
 * They determine whether an already-computed result may participate
 * in a particular ranking view.
 */

function isAutomaticallyEligibleStatus(
  status
) {
  const normalized =
    normalizeStatus(
      status
    );

  return (
    normalized ===
      'DIRECT' ||
    normalized ===
      'CONDITIONAL'
  );
}

function isHardIneligibleStatus(
  status
) {
  return (
    normalizeStatus(
      status
    ) ===
    'NOT_ELIGIBLE'
  );
}

function isReviewStatus(
  status
) {
  const normalized =
    normalizeStatus(
      status
    );

  return (
    normalized ===
      'REVIEW_REQUIRED' ||
    normalized ===
      'UNKNOWN'
  );
}

function filterRankableCareers(
  scoredCareers,
  {
    includeConditional = true,
    includeReviewRequired = false,
    includeUnknown = false,
    includeNotEligible = false,
    onlyPreferenceMatches = false
  } = {}
) {
  if (
    !Array.isArray(
      scoredCareers
    )
  ) {
    return [];
  }

  return scoredCareers.filter(
    (item) => {
      const status =
        normalizeStatus(
          item?.eligibilityStatus
        );

      if (
        status ===
        'NOT_ELIGIBLE'
      ) {
        return (
          includeNotEligible
        );
      }

      if (
        status ===
        'CONDITIONAL'
      ) {
        if (
          !includeConditional
        ) {
          return false;
        }
      }

      if (
        status ===
        'REVIEW_REQUIRED'
      ) {
        if (
          !includeReviewRequired
        ) {
          return false;
        }
      }

      if (
        status ===
        'UNKNOWN'
      ) {
        if (
          !includeUnknown
        ) {
          return false;
        }
      }

      if (
        onlyPreferenceMatches
      ) {
        return (
          item?.passesPreferenceFilters ===
          true
        );
      }

      return true;
    }
  );
}

/* ============================================================
 * DETERMINISTIC COMPARISON
 * ============================================================
 *
 * IMPORTANT:
 * No raw career metric is accessed here.
 *
 * All numerical values must already have been produced by the
 * eligibility/scoring pipeline.
 */

function compareEligibility(
  a,
  b
) {
  return (
    getEligibilityPriority(
      b?.eligibilityStatus
    ) -
    getEligibilityPriority(
      a?.eligibilityStatus
    )
  );
}

function comparePreferenceFilter(
  a,
  b
) {
  return (
    getPreferenceFilterPriority(
      b
    ) -
    getPreferenceFilterPriority(
      a
    )
  );
}

function compareOverallScore(
  a,
  b
) {
  return (
    getScore(
      b
    ) -
    getScore(
      a
    )
  );
}

function comparePreferenceScore(
  a,
  b
) {
  return (
    getPreferenceScore(
      b
    ) -
    getPreferenceScore(
      a
    )
  );
}

function compareScoreConfidence(
  a,
  b
) {
  return (
    getConfidencePriority(
      getScoreConfidence(
        b
      )
    ) -
    getConfidencePriority(
      getScoreConfidence(
        a
      )
    )
  );
}

function compareCareerConfidence(
  a,
  b
) {
  return (
    getConfidencePriority(
      getCareerConfidence(
        b
      )
    ) -
    getConfidencePriority(
      getCareerConfidence(
        a
      )
    )
  );
}

function compareStableId(
  a,
  b
) {
  return compareStrings(
    getCareerId(
      a
    ),
    getCareerId(
      b
    )
  );
}

/**
 * Canonical ranking comparator.
 *
 * Every upstream dimension is already finalized before reaching
 * this function.
 */
function compareCareers(
  a,
  b
) {
  const eligibilityComparison =
    compareEligibility(
      a,
      b
    );

  if (
    eligibilityComparison !==
    0
  ) {
    return eligibilityComparison;
  }

  const preferenceFilterComparison =
    comparePreferenceFilter(
      a,
      b
    );

  if (
    preferenceFilterComparison !==
    0
  ) {
    return preferenceFilterComparison;
  }

  const scoreComparison =
    compareOverallScore(
      a,
      b
    );

  if (
    scoreComparison !==
    0
  ) {
    return scoreComparison;
  }

  const preferenceComparison =
    comparePreferenceScore(
      a,
      b
    );

  if (
    preferenceComparison !==
    0
  ) {
    return preferenceComparison;
  }

  const scoreConfidenceComparison =
    compareScoreConfidence(
      a,
      b
    );

  if (
    scoreConfidenceComparison !==
    0
  ) {
    return scoreConfidenceComparison;
  }

  const careerConfidenceComparison =
    compareCareerConfidence(
      a,
      b
    );

  if (
    careerConfidenceComparison !==
    0
  ) {
    return careerConfidenceComparison;
  }

  return compareStableId(
    a,
    b
  );
}

/* ============================================================
 * RANK PRESERVATION
 * ============================================================
 *
 * Ranking must not strip information produced upstream.
 *
 * The result is therefore a shallow copy only, with rank metadata
 * added. Nested:
 *
 *   career
 *   scoreBreakdown
 *   explanation
 *   eligibilityResult
 *   source metadata
 *   confidence metadata
 *
 * remains untouched.
 */

function attachRank(
  item,
  rank,
  position
) {
  return {
    ...item,

    rank,

    ranking: {
      position,
      rank
    }
  };
}

/* ============================================================
 * MAIN RANKING FUNCTION
 * ========================================================== */

function rankCareers(
  scoredCareers,
  {
    limit = null,

    /*
     * Normal recommendation mode:
     * include DIRECT and CONDITIONAL results.
     */
    includeConditional = true,

    /*
     * REVIEW_REQUIRED and UNKNOWN are excluded by default.
     *
     * This is intentional: absence of confirmed eligibility cannot
     * be silently converted into an eligible recommendation.
     */
    includeReviewRequired = false,
    includeUnknown = false,

    /*
     * Hard ineligible careers remain excluded by default.
     *
     * They can only be included explicitly for audit/debug views.
     */
    includeNotEligible = false,

    onlyPreferenceMatches = false
  } = {}
) {
  if (
    !Array.isArray(
      scoredCareers
    )
  ) {
    return [];
  }

  const rankable =
    filterRankableCareers(
      scoredCareers,
      {
        includeConditional,
        includeReviewRequired,
        includeUnknown,
        includeNotEligible,
        onlyPreferenceMatches
      }
    );

  const sorted =
    [...rankable]
      .sort(
        compareCareers
      );

  const normalizedLimit =
    Number(
      limit
    );

  const limited =
    Number.isInteger(
      normalizedLimit
    ) &&
    normalizedLimit > 0
      ? sorted.slice(
          0,
          normalizedLimit
        )
      : sorted;

  return limited.map(
    (
      item,
      index
    ) =>
      attachRank(
        item,
        index + 1,
        index
      )
  );
}

/* ============================================================
 * CLASSIFIED RANKING VIEW
 * ============================================================
 *
 * Useful for UI screens that need:
 *
 *   Recommended
 *   Conditional
 *   Needs verification
 *   Not eligible
 *
 * without changing the underlying eligibility results.
 */

function groupRankedCareers(
  rankedCareers
) {
  const groups = {
    direct: [],
    conditional: [],
    reviewRequired: [],
    unknown: [],
    notEligible: []
  };

  if (
    !Array.isArray(
      rankedCareers
    )
  ) {
    return groups;
  }

  rankedCareers.forEach(
    (career) => {
      const status =
        normalizeStatus(
          career?.eligibilityStatus
        );

      switch (
        status
      ) {
        case 'DIRECT':
          groups.direct.push(
            career
          );
          break;

        case 'CONDITIONAL':
          groups.conditional.push(
            career
          );
          break;

        case 'REVIEW_REQUIRED':
          groups.reviewRequired.push(
            career
          );
          break;

        case 'UNKNOWN':
          groups.unknown.push(
            career
          );
          break;

        case 'NOT_ELIGIBLE':
          groups.notEligible.push(
            career
          );
          break;

        default:
          groups.unknown.push(
            career
          );
          break;
      }
    }
  );

  return groups;
}

/* ============================================================
 * ALL-STATE CLASSIFICATION
 * ============================================================
 *
 * This preserves every scored record but makes the recommendation
 * boundary explicit.
 *
 * It is useful when the UI needs a full audit rather than only the
 * automatically recommendable list.
 */

function classifyRankedCareers(
  scoredCareers
) {
  if (
    !Array.isArray(
      scoredCareers
    )
  ) {
    return {
      recommendable: [],
      conditional: [],
      reviewRequired: [],
      unknown: [],
      notEligible: []
    };
  }

  const result = {
    recommendable: [],
    conditional: [],
    reviewRequired: [],
    unknown: [],
    notEligible: []
  };

  scoredCareers.forEach(
    (item) => {
      const status =
        normalizeStatus(
          item?.eligibilityStatus
        );

      switch (
        status
      ) {
        case 'DIRECT':
          result.recommendable.push(
            item
          );
          break;

        case 'CONDITIONAL':
          result.conditional.push(
            item
          );
          break;

        case 'REVIEW_REQUIRED':
          result.reviewRequired.push(
            item
          );
          break;

        case 'UNKNOWN':
          result.unknown.push(
            item
          );
          break;

        case 'NOT_ELIGIBLE':
          result.notEligible.push(
            item
          );
          break;

        default:
          result.unknown.push(
            item
          );
          break;
      }
    }
  );

  return result;
}

/* ============================================================
 * TOP CAREER
 * ========================================================== */

function getTopCareer(
  rankedCareers
) {
  if (
    !Array.isArray(
      rankedCareers
    ) ||
    rankedCareers.length ===
      0
  ) {
    return null;
  }

  return rankedCareers[0];
}

/* ============================================================
 * RANKING SUMMARY
 * ========================================================== */

function getRankingSummary(
  rankedCareers
) {
  const summary = {
    total:
      0,

    direct:
      0,

    conditional:
      0,

    reviewRequired:
      0,

    unknown:
      0,

    notEligible:
      0,

    averageScore:
      0,

    topScore:
      0,

    topCareerId:
      null
  };

  if (
    !Array.isArray(
      rankedCareers
    ) ||
    rankedCareers.length ===
      0
  ) {
    return summary;
  }

  let scoreTotal =
    0;

  rankedCareers.forEach(
    (career) => {
      summary.total +=
        1;

      scoreTotal +=
        getScore(
          career
        );

      switch (
        normalizeStatus(
          career?.eligibilityStatus
        )
      ) {
        case 'DIRECT':
          summary.direct +=
            1;
          break;

        case 'CONDITIONAL':
          summary.conditional +=
            1;
          break;

        case 'REVIEW_REQUIRED':
          summary.reviewRequired +=
            1;
          break;

        case 'UNKNOWN':
          summary.unknown +=
            1;
          break;

        case 'NOT_ELIGIBLE':
          summary.notEligible +=
            1;
          break;

        default:
          summary.unknown +=
            1;
          break;
      }
    }
  );

  summary.averageScore =
    Number(
      (
        scoreTotal /
        rankedCareers.length
      ).toFixed(
        2
      )
    );

  summary.topScore =
    getScore(
      rankedCareers[0]
    );

  summary.topCareerId =
    getCareerId(
      rankedCareers[0]
    ) ||
    null;

  return summary;
}

/* ============================================================
 * SCORE-BASED ALTERNATIVE RANKING
 * ============================================================
 *
 * The old implementation contained raw career-data objective
 * sorters such as:
 *
 *   salary → career.startingBasic
 *   authority → career.authority
 *   family → career.familyCompatibility
 *   stress → career.stress
 *
 * Those are deliberately removed.
 *
 * Alternative rankings must be created by the Scoring Engine,
 * which produces an appropriate score for the requested objective.
 *
 * This helper therefore accepts an ALREADY-COMPUTED scoring field
 * from the scoring pipeline.
 */

function rankByScoredMetric(
  scoredCareers,
  metric,
  {
    direction = 'DESC',
    limit = null,
    includeConditional = true,
    includeReviewRequired = false,
    includeUnknown = false,
    includeNotEligible = false
  } = {}
) {
  if (
    !Array.isArray(
      scoredCareers
    )
  ) {
    return [];
  }

  const normalizedMetric =
    String(
      metric ??
        ''
    ).trim();

  if (
    !normalizedMetric
  ) {
    return [];
  }

  const normalizedDirection =
    String(
      direction ??
        'DESC'
    )
      .trim()
      .toUpperCase();

  if (
    normalizedDirection !==
      'ASC' &&
    normalizedDirection !==
      'DESC'
  ) {
    return [];
  }

  const rankable =
    filterRankableCareers(
      scoredCareers,
      {
        includeConditional,
        includeReviewRequired,
        includeUnknown,
        includeNotEligible
      }
    );

  const sorted =
    [...rankable]
      .sort(
        (
          a,
          b
        ) => {
          const aValue =
            numeric(
              a?.scoreBreakdown?.[
                normalizedMetric
              ] ??
              a?.breakdown?.[
                normalizedMetric
              ] ??
              a?.scores?.[
                normalizedMetric
              ],
              0
            );

          const bValue =
            numeric(
              b?.scoreBreakdown?.[
                normalizedMetric
              ] ??
              b?.breakdown?.[
                normalizedMetric
              ] ??
              b?.scores?.[
                normalizedMetric
              ],
              0
            );

          const difference =
            normalizedDirection ===
            'ASC'
              ? aValue -
                bValue
              : bValue -
                aValue;

          if (
            difference !==
            0
          ) {
            return difference;
          }

          return compareCareers(
            a,
            b
          );
        }
      );

  const normalizedLimit =
    Number(
      limit
    );

  const limited =
    Number.isInteger(
      normalizedLimit
    ) &&
    normalizedLimit > 0
      ? sorted.slice(
          0,
          normalizedLimit
        )
      : sorted;

  return limited.map(
    (
      item,
      index
    ) =>
      attachRank(
        item,
        index + 1,
        index
      )
  );
}

/* ============================================================
 * DETERMINISTIC TIE CHECK
 * ============================================================ */

function areRankingTies(
  a,
  b
) {
  return (
    compareEligibility(
      a,
      b
    ) === 0 &&
    comparePreferenceFilter(
      a,
      b
    ) === 0 &&
    compareOverallScore(
      a,
      b
    ) === 0 &&
    comparePreferenceScore(
      a,
      b
    ) === 0 &&
    compareScoreConfidence(
      a,
      b
    ) === 0 &&
    compareCareerConfidence(
      a,
      b
    ) === 0
  );
}

/* ============================================================
 * EXPORTS
 * ========================================================== */

export {
  ELIGIBILITY_PRIORITY,
  CONFIDENCE_PRIORITY,

  normalizeStatus,

  getEligibilityPriority,
  getConfidencePriority,

  classifyEligibility,

  isAutomaticallyEligibleStatus,
  isHardIneligibleStatus,
  isReviewStatus,

  filterRankableCareers,

  compareEligibility,
  comparePreferenceFilter,
  compareOverallScore,
  comparePreferenceScore,
  compareScoreConfidence,
  compareCareerConfidence,
  compareStableId,
  compareCareers,

  rankCareers,
  groupRankedCareers,
  classifyRankedCareers,

  getTopCareer,
  getRankingSummary,

  rankByScoredMetric,

  areRankingTies
};

export default {
  normalizeStatus,

  classifyEligibility,

  filterRankableCareers,

  compareCareers,

  rankCareers,

  groupRankedCareers,
  classifyRankedCareers,

  getTopCareer,
  getRankingSummary,

  rankByScoredMetric,

  areRankingTies
};
