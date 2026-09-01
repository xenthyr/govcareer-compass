/**
 * GovCareer Compass
 * ============================================================
 * CAREER RANKING ENGINE
 * ============================================================
 *
 * Takes scored careers and produces deterministic rankings.
 *
 * Ranking order:
 *
 *   1. Eligibility status
 *   2. Preference-filter pass
 *   3. Overall score
 *   4. Preference score
 *   5. Data confidence
 *   6. Stable career ID
 *
 * A stable ID is used as the final tie-breaker so the same data
 * produces deterministic ordering.
 */

import {
  ELIGIBILITY_RESULT
} from './eligibility-engine.js';

const ELIGIBILITY_PRIORITY =
  Object.freeze({
    [ELIGIBILITY_RESULT.DIRECT]:
      3,

    [ELIGIBILITY_RESULT.CONDITIONAL]:
      2,

    [ELIGIBILITY_RESULT.MANUAL_VERIFICATION]:
      1,

    [ELIGIBILITY_RESULT.NOT_ELIGIBLE]:
      0
  });

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

function numeric(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
}

function getEligibilityPriority(
  status
) {
  return (
    ELIGIBILITY_PRIORITY[
      status
    ] ??
    0
  );
}

function getConfidencePriority(
  confidence
) {
  const key =
    String(
      confidence ||
        'UNKNOWN'
    ).toUpperCase();

  return (
    CONFIDENCE_PRIORITY[
      key
    ] ??
    0
  );
}

function compareValues(
  a,
  b
) {
  return numeric(
    b
  ) -
    numeric(
      a
    );
}

function compareCareers(
  a,
  b
) {
  const aEligibility =
    getEligibilityPriority(
      a.eligibilityStatus
    );

  const bEligibility =
    getEligibilityPriority(
      b.eligibilityStatus
    );

  if (
    aEligibility !==
    bEligibility
  ) {
    return (
      bEligibility -
      aEligibility
    );
  }

  const aPreferencePass =
    a.passesPreferenceFilters
      ? 1
      : 0;

  const bPreferencePass =
    b.passesPreferenceFilters
      ? 1
      : 0;

  if (
    aPreferencePass !==
    bPreferencePass
  ) {
    return (
      bPreferencePass -
      aPreferencePass
    );
  }

  const scoreComparison =
    compareValues(
      a.score,
      b.score
    );

  if (
    scoreComparison !== 0
  ) {
    return scoreComparison;
  }

  const preferenceComparison =
    compareValues(
      a.preferenceScore,
      b.preferenceScore
    );

  if (
    preferenceComparison !==
    0
  ) {
    return preferenceComparison;
  }

  const confidenceComparison =
    getConfidencePriority(
      a.career?.confidence
    ) -
    getConfidencePriority(
      b.career?.confidence
    );

  if (
    confidenceComparison !==
    0
  ) {
    return confidenceComparison;
  }

  return String(
    a.career?.id ??
      a.careerId ??
      ''
  ).localeCompare(
    String(
      b.career?.id ??
        b.careerId ??
        ''
    )
  );
}

function rankCareers(
  scoredCareers,
  {
    limit = null,
    includeIneligible = false,
    includeManualVerification = true,
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

  let results =
    scoredCareers
      .filter(
        (item) => {
          if (
            !includeIneligible &&
            item.eligibilityStatus ===
              ELIGIBILITY_RESULT.NOT_ELIGIBLE
          ) {
            return false;
          }

          if (
            !includeManualVerification &&
            item.eligibilityStatus ===
              ELIGIBILITY_RESULT.MANUAL_VERIFICATION
          ) {
            return false;
          }

          if (
            onlyPreferenceMatches &&
            !item.passesPreferenceFilters
          ) {
            return false;
          }

          return true;
        }
      )
      .map(
        (item) => ({
          ...item
        })
      )
      .sort(
        compareCareers
      );

  if (
    Number.isInteger(
      Number(limit)
    ) &&
    Number(limit) >
      0
  ) {
    results =
      results.slice(
        0,
        Number(limit)
      );
  }

  return results.map(
    (item, index) => ({
      ...item,
      rank:
        index + 1
    })
  );
}

function groupRankedCareers(
  rankedCareers
) {
  const groups = {
    direct:
      [],
    conditional:
      [],
    manualVerification:
      [],
    notEligible:
      []
  };

  rankedCareers.forEach(
    (career) => {
      switch (
        career.eligibilityStatus
      ) {
        case ELIGIBILITY_RESULT.DIRECT:
          groups.direct.push(
            career
          );
          break;

        case ELIGIBILITY_RESULT.CONDITIONAL:
          groups.conditional.push(
            career
          );
          break;

        case ELIGIBILITY_RESULT.MANUAL_VERIFICATION:
          groups.manualVerification.push(
            career
          );
          break;

        case ELIGIBILITY_RESULT.NOT_ELIGIBLE:
          groups.notEligible.push(
            career
          );
          break;

        default:
          groups.manualVerification.push(
            career
          );
      }
    }
  );

  return groups;
}

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

    manualVerification:
      0,

    notEligible:
      0,

    averageScore:
      0,

    topScore:
      0
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
        numeric(
          career.score
        );

      switch (
        career.eligibilityStatus
      ) {
        case ELIGIBILITY_RESULT.DIRECT:
          summary.direct +=
            1;
          break;

        case ELIGIBILITY_RESULT.CONDITIONAL:
          summary.conditional +=
            1;
          break;

        case ELIGIBILITY_RESULT.MANUAL_VERIFICATION:
          summary.manualVerification +=
            1;
          break;

        case ELIGIBILITY_RESULT.NOT_ELIGIBLE:
          summary.notEligible +=
            1;
          break;

        default:
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
    numeric(
      rankedCareers[0]
        ?.score
    );

  return summary;
}

/**
 * Generate alternative "best for X" rankings.
 *
 * This does not invent scores. It sorts using actual fields
 * already present in the canonical career records.
 */
const OBJECTIVE_SORTERS =
  Object.freeze({
    salary: (
      a,
      b
    ) =>
      compareValues(
        a.career?.startingBasic,
        b.career?.startingBasic
      ),

    authority: (
      a,
      b
    ) =>
      compareValues(
        a.career?.authority,
        b.career?.authority
      ),

    family: (
      a,
      b
    ) =>
      compareValues(
        a.career
          ?.familyCompatibility,
        b.career
          ?.familyCompatibility
      ),

    parentCare: (
      a,
      b
    ) =>
      compareValues(
        a.career
          ?.parentCareCompatibility,
        b.career
          ?.parentCareCompatibility
      ),

    kolkata: (
      a,
      b
    ) =>
      compareValues(
        a.career
          ?.kolkataStability,
        b.career
          ?.kolkataStability
      ),

    workLife: (
      a,
      b
    ) =>
      compareValues(
        a.career?.workLife,
        b.career?.workLife
      ),

    safety: (
      a,
      b
    ) =>
      compareValues(
        10 -
          numeric(
            a.career
              ?.physicalRisk
          ),
        10 -
          numeric(
            b.career
              ?.physicalRisk
          )
      ),

    lowStress: (
      a,
      b
    ) =>
      compareValues(
        10 -
          numeric(
            a.career
              ?.stress
          ),
        10 -
          numeric(
            b.career
              ?.stress
          )
      ),

    careerGrowth: (
      a,
      b
    ) =>
      compareValues(
        a.career
          ?.careerGrowth,
        b.career
          ?.careerGrowth
      )
  });

function rankByObjective(
  scoredCareers,
  objective,
  {
    limit = null
  } = {}
) {
  const sorter =
    OBJECTIVE_SORTERS[
      objective
    ];

  if (
    typeof sorter !==
    'function'
  ) {
    return [];
  }

  const eligible =
    Array.isArray(
      scoredCareers
    )
      ? scoredCareers.filter(
          (item) =>
            item.eligibilityStatus !==
              ELIGIBILITY_RESULT.NOT_ELIGIBLE
        )
      : [];

  const sorted =
    [...eligible]
      .sort(
        sorter
      )
      .sort(
        (a, b) =>
          compareCareers(
            a,
            b
          )
      );

  const limited =
    Number.isInteger(
      Number(limit)
    ) &&
    Number(limit) > 0
      ? sorted.slice(
          0,
          Number(limit)
        )
      : sorted;

  return limited.map(
    (item, index) => ({
      ...item,
      objective,
      objectiveRank:
        index + 1
    })
  );
}

export {
  ELIGIBILITY_PRIORITY,
  CONFIDENCE_PRIORITY,
  compareCareers,
  rankCareers,
  groupRankedCareers,
  getTopCareer,
  getRankingSummary,
  rankByObjective
};

export default {
  compareCareers,
  rankCareers,
  groupRankedCareers,
  getTopCareer,
  getRankingSummary,
  rankByObjective
};
