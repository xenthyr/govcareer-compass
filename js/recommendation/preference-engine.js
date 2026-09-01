/**
 * GovCareer Compass
 * ============================================================
 * SOFT PREFERENCE ENGINE
 * ============================================================
 *
 * Purpose
 * -------
 * Converts a candidate's stated preferences into comparable
 * preference signals for eligible careers.
 *
 * Examples:
 * - salary importance
 * - authority importance
 * - family importance
 * - elderly-parent care
 * - Kolkata preference
 * - work-life balance
 * - low stress
 * - low physical risk
 * - career growth
 * - prestige
 * - housing
 *
 * IMPORTANT
 * ---------
 * This module never determines legal eligibility.
 *
 * Failed hard eligibility is handled by eligibility-engine.js.
 */

import config from '../config.js';

const DEFAULT_PREFERENCES = Object.freeze({
  salaryImportance: 5,
  authorityImportance: 5,
  familyImportance: 5,
  parentCareImportance: 5,
  kolkataImportance: 5,
  jobSecurityImportance: 5,
  lowStressImportance: 5,
  lowPhysicalRiskImportance: 5,
  careerGrowthImportance: 5,
  prestigeImportance: 5,
  workLifeBalanceImportance: 5,
  housingImportance: 5,

  lowTransferImportance: 5,
  lowNightDutyImportance: 5,
  lowWeekendDutyImportance: 5,
  governmentPreference: 'ANY',
  statePreference: 'ANY',
  locationPreference: 'ANY',
  officeWorkPreference: 5,
  policeInterest: 5,
  intelligenceInterest: 5,
  administrativeInterest: 5,
  railwayInterest: 5,
  fieldWorkTolerance: 5,
  physicalRiskTolerance: 5,
  shiftDutyTolerance: 5,
  examDifficultyTolerance: 5
});

const METRICS = Object.freeze({
  salary:
    'salary',

  authority:
    'authority',

  family:
    'familyCompatibility',

  parentCare:
    'parentCareCompatibility',

  kolkata:
    'kolkataStability',

  jobSecurity:
    'jobSecurity',

  workLife:
    'workLife',

  careerGrowth:
    'careerGrowth',

  prestige:
    'socialStatus',

  housing:
    'housingAdvantage',

  physicalSafety:
    'physicalSafety'
});

const NEGATIVE_METRICS = Object.freeze(
  new Set([
    'stress',
    'physicalRisk',
    'transferBurden',
    'nightDutyBurden',
    'weekendDutyBurden'
  ])
);

function clamp(
  value,
  min = 0,
  max = 10
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

function normalizeImportance(
  value
) {
  return clamp(
    Number(value),
    0,
    10
  );
}

function normalizePreferences(
  input = {}
) {
  const preferences = {
    ...DEFAULT_PREFERENCES,
    ...(input || {})
  };

  Object.keys(
    preferences
  ).forEach(
    (key) => {
      if (
        key.endsWith(
          'Importance'
        )
      ) {
        preferences[key] =
          normalizeImportance(
            preferences[key]
          );
      }
    }
  );

  return preferences;
}

function getCareerScore(
  career,
  metric
) {
  const direct =
    career?.[metric];

  if (
    Number.isFinite(
      Number(direct)
    )
  ) {
    return clamp(
      Number(direct),
      0,
      10
    );
  }

  const aliases = {
    salary:
      career?.salaryScore ??
      career?.payScore,

    authority:
      career?.authorityScore,

    familyCompatibility:
      career?.family ??
      career?.familyScore,

    parentCareCompatibility:
      career?.parentCare ??
      career?.parentScore,

    kolkataStability:
      career?.kolkataStability ??
      career?.kolkataScore,

    jobSecurity:
      career?.jobSecurityScore,

    workLife:
      career?.workLifeBalance ??
      career?.workLifeScore,

    careerGrowth:
      career?.careerGrowthScore,

    socialStatus:
      career?.socialStatusScore ??
      career?.prestigeScore,

    housingAdvantage:
      career?.housingScore,

    physicalSafety:
      career?.safetyScore
  };

  const value =
    aliases[
      metric
    ];

  return Number.isFinite(
    Number(value)
  )
    ? clamp(
        Number(value),
        0,
        10
      )
    : null;
}

function normalizeNegativeMetric(
  career,
  metric
) {
  const value =
    career?.[metric];

  if (
    !Number.isFinite(
      Number(value)
    )
  ) {
    return null;
  }

  return clamp(
    10 - Number(value),
    0,
    10
  );
}

function getFitValue(
  career,
  preferenceKey
) {
  switch (
    preferenceKey
  ) {
    case 'salaryImportance':
      return getCareerScore(
        career,
        'salary'
      );

    case 'authorityImportance':
      return getCareerScore(
        career,
        'authority'
      );

    case 'familyImportance':
      return getCareerScore(
        career,
        'familyCompatibility'
      );

    case 'parentCareImportance':
      return getCareerScore(
        career,
        'parentCareCompatibility'
      );

    case 'kolkataImportance':
      return getCareerScore(
        career,
        'kolkataStability'
      );

    case 'jobSecurityImportance':
      return getCareerScore(
        career,
        'jobSecurity'
      );

    case 'lowStressImportance':
      return normalizeNegativeMetric(
        career,
        'stress'
      );

    case 'lowPhysicalRiskImportance':
      return normalizeNegativeMetric(
        career,
        'physicalRisk'
      );

    case 'careerGrowthImportance':
      return getCareerScore(
        career,
        'careerGrowth'
      );

    case 'prestigeImportance':
      return getCareerScore(
        career,
        'socialStatus'
      );

    case 'workLifeBalanceImportance':
      return getCareerScore(
        career,
        'workLife'
      );

    case 'housingImportance':
      return getCareerScore(
        career,
        'housingAdvantage'
      );

    case 'lowTransferImportance':
      return normalizeNegativeMetric(
        career,
        'transferBurden'
      );

    case 'lowNightDutyImportance':
      return normalizeNegativeMetric(
        career,
        'nightDutyBurden'
      );

    case 'lowWeekendDutyImportance':
      return normalizeNegativeMetric(
        career,
        'weekendDutyBurden'
      );

    default:
      return null;
  }
}

function getPreferenceImportanceKeys() {
  return [
    'salaryImportance',
    'authorityImportance',
    'familyImportance',
    'parentCareImportance',
    'kolkataImportance',
    'jobSecurityImportance',
    'lowStressImportance',
    'lowPhysicalRiskImportance',
    'careerGrowthImportance',
    'prestigeImportance',
    'workLifeBalanceImportance',
    'housingImportance',
    'lowTransferImportance',
    'lowNightDutyImportance',
    'lowWeekendDutyImportance'
  ];
}

function scoreCareerPreferences(
  career,
  inputPreferences = {}
) {
  const preferences =
    normalizePreferences(
      inputPreferences
    );

  let weightedTotal =
    0;

  let totalWeight =
    0;

  const metricResults =
    [];

  getPreferenceImportanceKeys().forEach(
    (preferenceKey) => {
      const importance =
        normalizeImportance(
          preferences[
            preferenceKey
          ]
        );

      if (
        importance <= 0
      ) {
        return;
      }

      const fit =
        getFitValue(
          career,
          preferenceKey
        );

      if (
        fit === null
      ) {
        metricResults.push({
          preferenceKey,
          importance,
          fit: null,
          contribution: 0,
          available: false
        });

        return;
      }

      const weight =
        importance;

      weightedTotal +=
        fit * weight;

      totalWeight +=
        weight;

      metricResults.push({
        preferenceKey,
        importance,
        fit,
        contribution:
          fit * weight,
        available: true
      });
    }
  );

  const normalizedScore =
    totalWeight > 0
      ? (
          weightedTotal /
          totalWeight
        ) * 10
      : 0;

  return {
    score: clamp(
      normalizedScore
    ),
    weightedTotal,
    totalWeight,
    metrics:
      metricResults
  };
}

function matchesGovernmentPreference(
  career,
  preference
) {
  if (
    !preference ||
    preference ===
      'ANY'
  ) {
    return true;
  }

  const governmentId =
    career?.governmentId;

  if (
    !governmentId
  ) {
    return false;
  }

  return (
    String(
      governmentId
    ).toUpperCase() ===
    String(
      preference
    ).toUpperCase()
  );
}

function matchesStatePreference(
  career,
  preference
) {
  if (
    !preference ||
    preference ===
      'ANY'
  ) {
    return true;
  }

  const stateId =
    career?.stateId;

  if (
    !stateId
  ) {
    return false;
  }

  return (
    String(
      stateId
    ).toUpperCase() ===
    String(
      preference
    ).toUpperCase()
  );
}

function getCategoryFit(
  career,
  preferences
) {
  const categories =
    new Set(
      [
        ...(career?.categoryIds ||
          []),
        ...(career?.categorySlugs ||
          []),
        career?.category,
        career?.jobCategory
      ]
        .filter(Boolean)
        .map(
          (item) =>
            String(
              item
            ).toLowerCase()
        )
    );

  const scores = {
    police:
      preferences.policeInterest,
    intelligence:
      preferences.intelligenceInterest,
    administrative:
      preferences.administrativeInterest,
    railway:
      preferences.railwayInterest
  };

  const categoryMapping = {
    police: [
      'police',
      'security',
      'law-enforcement'
    ],

    intelligence: [
      'intelligence'
    ],

    administrative: [
      'administrative',
      'administration',
      'secretariat'
    ],

    railway: [
      'railway',
      'railway-operations'
    ]
  };

  const applicable =
    [];

  Object.entries(
    categoryMapping
  ).forEach(
    ([
      category,
      names
    ]) => {
      const found =
        names.some(
          (name) =>
            categories.has(
              name
            )
        );

      if (found) {
        applicable.push({
          category,
          importance:
            normalizeImportance(
              scores[
                category
              ]
            )
        });
      }
    }
  );

  if (
    applicable.length ===
    0
  ) {
    return {
      score: 5,
      details: []
    };
  }

  const average =
    applicable.reduce(
      (sum, item) =>
        sum +
        item.importance,
      0
    ) /
    applicable.length;

  return {
    score: clamp(
      average
    ),
    details:
      applicable
  };
}

function evaluatePreferenceFit(
  career,
  inputPreferences = {}
) {
  const preferences =
    normalizePreferences(
      inputPreferences
    );

  const hardPreferenceChecks = {
    government:
      matchesGovernmentPreference(
        career,
        preferences.governmentPreference
      ),

    state:
      matchesStatePreference(
        career,
        preferences.statePreference
      )
  };

  /*
   * These filters are user-selected constraints rather
   * than legal eligibility.
   *
   * They may exclude a career from a user's personalized
   * result set, but they never alter legal eligibility.
   */
  const categoryFit =
    getCategoryFit(
      career,
      preferences
    );

  const preferenceScore =
    scoreCareerPreferences(
      career,
      preferences
    );

  const combinedScore =
    clamp(
      (
        preferenceScore.score *
        0.85
      ) +
      (
        categoryFit.score *
        0.15
      )
    );

  return {
    score:
      combinedScore,

    preferenceScore:
      preferenceScore.score,

    categoryScore:
      categoryFit.score,

    governmentMatch:
      hardPreferenceChecks.government,

    stateMatch:
      hardPreferenceChecks.state,

    passesPreferenceFilters:
      hardPreferenceChecks.government &&
      hardPreferenceChecks.state,

    details: {
      metrics:
        preferenceScore.metrics,

      category:
        categoryFit
    }
  };
}

function createPreferenceProfile(
  partial = {}
) {
  return normalizePreferences(
    partial
  );
}

function explainPreferenceSignal(
  metricResult
) {
  if (
    !metricResult?.available
  ) {
    return 'No comparable data is currently available.';
  }

  const score =
    Number(
      metricResult.fit
    );

  if (
    score >= 8
  ) {
    return 'Strong match with this preference.';
  }

  if (
    score >= 6
  ) {
    return 'Good match with this preference.';
  }

  if (
    score >= 4
  ) {
    return 'Mixed match with this preference.';
  }

  return 'Weak match with this preference.';
}

export {
  DEFAULT_PREFERENCES,
  METRICS,
  NEGATIVE_METRICS,
  normalizePreferences,
  createPreferenceProfile,
  scoreCareerPreferences,
  evaluatePreferenceFit,
  explainPreferenceSignal,
  getCareerScore
};

export default {
  DEFAULT_PREFERENCES,
  normalizePreferences,
  createPreferenceProfile,
  scoreCareerPreferences,
  evaluatePreferenceFit
};
