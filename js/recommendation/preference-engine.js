/**
 * GovCareer Compass
 * ============================================================
 * SOFT PREFERENCE ENGINE
 * ============================================================
 *
 * Purpose
 * -------
 * Converts a candidate's stated preferences into a clean,
 * deterministic and normalized preference model.
 *
 * This module is intentionally CAREER-AGNOSTIC.
 *
 * It must NOT:
 * - determine legal eligibility;
 * - inspect eligibility rules;
 * - inspect or invent job facts;
 * - calculate a career's preference score;
 * - rank careers;
 * - apply final recommendation logic.
 *
 * Responsibility boundary
 * -----------------------
 *
 * Candidate Profile / Assessment Answers
 *                 ↓
 *        Preference Engine
 *                 ↓
 *        Normalized Preference Model
 *                 ↓
 *          Scoring Engine
 *
 * Eligibility is handled independently by:
 *   js/recommendation/eligibility-engine.js
 *
 * Final career scoring is handled independently by:
 *   js/recommendation/scoring-engine.js
 *
 * Preference direction
 * --------------------
 * Every preference signal explicitly carries one of:
 *
 *   HIGHER
 *   LOWER
 *   NEUTRAL
 *
 * This is critical because the raw importance of a preference and
 * the direction in which the candidate wants a metric to move are
 * two different concepts.
 *
 * Example:
 *
 *   low stress importance = 9
 *
 * becomes:
 *
 *   {
 *     metric: "stress",
 *     importance: 9,
 *     weight: 0.9,
 *     direction: "LOWER"
 *   }
 *
 * Tolerance preferences
 * ---------------------
 * Some candidate inputs describe tolerance rather than a desired
 * outcome, for example:
 *
 *   transferTolerance
 *   ruralPostingTolerance
 *   nightDutyTolerance
 *   shiftDutyTolerance
 *   physicalRiskTolerance
 *   stressTolerance
 *   examDifficultyTolerance
 *   preparationBurdenTolerance
 *
 * These are kept as explicit tolerance values. The corresponding
 * burden metric normally keeps direction LOWER, while the tolerance
 * value tells the scoring engine how strongly the burden should
 * affect the candidate's preference fit.
 *
 * No job facts
 * ------------
 * This module must remain completely independent of career data.
 * It therefore never reads registry records and never assumes that
 * a particular career has any particular salary, authority, posting,
 * housing, risk, prestige, etc.
 */

const DIRECTION = Object.freeze({
  HIGHER: 'HIGHER',
  LOWER: 'LOWER',
  NEUTRAL: 'NEUTRAL'
});

const DEFAULT_IMPORTANCE = 5;

const MIN_IMPORTANCE = 0;
const MAX_IMPORTANCE = 10;

const MIN_TOLERANCE = 0;
const MAX_TOLERANCE = 10;

/* ============================================================
 * PREFERENCE DEFINITIONS
 * ============================================================
 *
 * Each definition describes the semantic contract exposed to the
 * scoring layer.
 *
 * `metric` is the canonical career-data metric expected by the
 * scoring engine.
 *
 * `mode`:
 *   importance = normal preference strength
 *   tolerance  = tolerance signal controlling burden sensitivity
 *
 * `defaultDirection` is the safe semantic direction when the
 * candidate has not explicitly supplied a direction.
 *
 * Neutral defaults are intentionally used where the candidate's
 * desired direction cannot be safely inferred.
 */

const PREFERENCE_DEFINITIONS = Object.freeze({
  salary: {
    key: 'salaryImportance',
    metric: 'salary',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  authority: {
    key: 'authorityImportance',
    metric: 'authority',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  careerGrowth: {
    key: 'careerGrowthImportance',
    metric: 'careerGrowth',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  workLifeBalance: {
    key: 'workLifeBalanceImportance',
    metric: 'workLife',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  familyCompatibility: {
    key: 'familyImportance',
    metric: 'familyCompatibility',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  parentCareCompatibility: {
    key: 'parentCareImportance',
    metric: 'parentCareCompatibility',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  kolkataStability: {
    key: 'kolkataImportance',
    metric: 'kolkataStability',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  locationStability: {
    key: 'locationStabilityImportance',
    metric: 'locationStability',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  transfer: {
    key: 'transferTolerance',
    metric: 'transferBurden',
    mode: 'tolerance',
    defaultDirection:
      DIRECTION.LOWER
  },

  ruralPosting: {
    key: 'ruralPostingTolerance',
    metric: 'ruralPostingBurden',
    mode: 'tolerance',
    defaultDirection:
      DIRECTION.LOWER
  },

  nightDuty: {
    key: 'nightDutyTolerance',
    metric: 'nightDutyBurden',
    mode: 'tolerance',
    defaultDirection:
      DIRECTION.LOWER
  },

  shiftDuty: {
    key: 'shiftDutyTolerance',
    metric: 'shiftDutyBurden',
    mode: 'tolerance',
    defaultDirection:
      DIRECTION.LOWER
  },

  physicalRisk: {
    key: 'physicalRiskTolerance',
    metric: 'physicalRisk',
    mode: 'tolerance',
    defaultDirection:
      DIRECTION.LOWER
  },

  stress: {
    key: 'stressTolerance',
    metric: 'stress',
    mode: 'tolerance',
    defaultDirection:
      DIRECTION.LOWER
  },

  publicInteraction: {
    key: 'publicInteractionImportance',
    metric: 'publicInteraction',
    mode: 'importance',
    defaultDirection:
      DIRECTION.NEUTRAL
  },

  fieldWork: {
    key: 'fieldWorkImportance',
    metric: 'fieldWork',
    mode: 'importance',
    defaultDirection:
      DIRECTION.NEUTRAL
  },

  uniform: {
    key: 'uniformImportance',
    metric: 'uniform',
    mode: 'importance',
    defaultDirection:
      DIRECTION.NEUTRAL
  },

  prestige: {
    key: 'prestigeImportance',
    metric: 'socialStatus',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  housing: {
    key: 'housingImportance',
    metric: 'housingAdvantage',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  englishAdvantage: {
    key: 'englishAdvantageImportance',
    metric: 'englishAdvantage',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  jobStability: {
    key: 'jobSecurityImportance',
    metric: 'jobSecurity',
    mode: 'importance',
    defaultDirection:
      DIRECTION.HIGHER
  },

  examDifficulty: {
    key: 'examDifficultyTolerance',
    metric: 'examDifficulty',
    mode: 'tolerance',
    defaultDirection:
      DIRECTION.LOWER
  },

  preparationBurden: {
    key: 'preparationBurdenTolerance',
    metric: 'preparationBurden',
    mode: 'tolerance',
    defaultDirection:
      DIRECTION.LOWER
  }
});

const DEFAULT_PREFERENCES = Object.freeze({
  salaryImportance: DEFAULT_IMPORTANCE,
  authorityImportance: DEFAULT_IMPORTANCE,
  careerGrowthImportance:
    DEFAULT_IMPORTANCE,
  workLifeBalanceImportance:
    DEFAULT_IMPORTANCE,
  familyImportance:
    DEFAULT_IMPORTANCE,
  parentCareImportance:
    DEFAULT_IMPORTANCE,
  kolkataImportance:
    DEFAULT_IMPORTANCE,
  locationStabilityImportance:
    DEFAULT_IMPORTANCE,

  transferTolerance:
    DEFAULT_IMPORTANCE,
  ruralPostingTolerance:
    DEFAULT_IMPORTANCE,
  nightDutyTolerance:
    DEFAULT_IMPORTANCE,
  shiftDutyTolerance:
    DEFAULT_IMPORTANCE,
  physicalRiskTolerance:
    DEFAULT_IMPORTANCE,
  stressTolerance:
    DEFAULT_IMPORTANCE,

  publicInteractionImportance:
    DEFAULT_IMPORTANCE,
  fieldWorkImportance:
    DEFAULT_IMPORTANCE,
  uniformImportance:
    DEFAULT_IMPORTANCE,
  prestigeImportance:
    DEFAULT_IMPORTANCE,
  housingImportance:
    DEFAULT_IMPORTANCE,
  englishAdvantageImportance:
    DEFAULT_IMPORTANCE,
  jobSecurityImportance:
    DEFAULT_IMPORTANCE,

  examDifficultyTolerance:
    DEFAULT_IMPORTANCE,
  preparationBurdenTolerance:
    DEFAULT_IMPORTANCE,

  governmentPreference:
    'ANY',

  statePreference:
    'ANY',

  locationPreference:
    'ANY'
});

/* ============================================================
 * LEGACY / INPUT ALIASES
 * ============================================================
 *
 * Assessment systems and older pages may use different names.
 * Aliases are accepted only at the preference-input boundary.
 *
 * The normalized model always exposes canonical names.
 */

const INPUT_ALIASES = Object.freeze({
  salaryImportance: [
    'salaryImportance',
    'salary',
    'salaryPriority',
    'salaryPreference'
  ],

  authorityImportance: [
    'authorityImportance',
    'authority',
    'authorityPriority'
  ],

  careerGrowthImportance: [
    'careerGrowthImportance',
    'careerGrowth',
    'growthImportance',
    'promotionImportance'
  ],

  workLifeBalanceImportance: [
    'workLifeBalanceImportance',
    'workLifeBalance',
    'workLife',
    'lifestyleImportance'
  ],

  familyImportance: [
    'familyImportance',
    'family',
    'familyCompatibility',
    'familyPriority'
  ],

  parentCareImportance: [
    'parentCareImportance',
    'parentCare',
    'parentCareCompatibility',
    'elderlyParentCareImportance'
  ],

  kolkataImportance: [
    'kolkataImportance',
    'kolkataStabilityImportance',
    'kolkataPreference',
    'kolkata'
  ],

  locationStabilityImportance: [
    'locationStabilityImportance',
    'locationImportance',
    'locationStability'
  ],

  transferTolerance: [
    'transferTolerance',
    'transferImportance',
    'lowTransferImportance',
    'transferPreference'
  ],

  ruralPostingTolerance: [
    'ruralPostingTolerance',
    'ruralPostingImportance',
    'ruralTolerance',
    'ruralPosting'
  ],

  nightDutyTolerance: [
    'nightDutyTolerance',
    'nightDutyImportance',
    'lowNightDutyImportance',
    'nightDuty'
  ],

  shiftDutyTolerance: [
    'shiftDutyTolerance',
    'shiftDutyImportance',
    'shiftTolerance',
    'shiftDuty'
  ],

  physicalRiskTolerance: [
    'physicalRiskTolerance',
    'lowPhysicalRiskImportance',
    'physicalRiskImportance',
    'physicalRiskTolerance'
  ],

  stressTolerance: [
    'stressTolerance',
    'lowStressImportance',
    'stressImportance',
    'stressTolerance'
  ],

  publicInteractionImportance: [
    'publicInteractionImportance',
    'publicInteraction',
    'publicDealingImportance'
  ],

  fieldWorkImportance: [
    'fieldWorkImportance',
    'fieldWork',
    'fieldJobImportance'
  ],

  uniformImportance: [
    'uniformImportance',
    'uniformPreference',
    'uniform'
  ],

  prestigeImportance: [
    'prestigeImportance',
    'prestige',
    'socialStatusImportance',
    'socialStatus'
  ],

  housingImportance: [
    'housingImportance',
    'housing',
    'housingAdvantageImportance'
  ],

  englishAdvantageImportance: [
    'englishAdvantageImportance',
    'englishImportance',
    'englishAdvantage'
  ],

  jobSecurityImportance: [
    'jobSecurityImportance',
    'jobSecurity',
    'stabilityImportance',
    'jobStabilityImportance'
  ],

  examDifficultyTolerance: [
    'examDifficultyTolerance',
    'examDifficultyImportance',
    'difficultyTolerance',
    'examDifficulty'
  ],

  preparationBurdenTolerance: [
    'preparationBurdenTolerance',
    'preparationBurdenImportance',
    'preparationTolerance',
    'studyBurdenTolerance',
    'examPreparationBurden'
  ],

  governmentPreference: [
    'governmentPreference',
    'government',
    'governmentId'
  ],

  statePreference: [
    'statePreference',
    'state',
    'stateId'
  ],

  locationPreference: [
    'locationPreference',
    'location',
    'locationId',
    'preferredLocation'
  ]
});

/* ============================================================
 * NORMALIZATION HELPERS
 * ========================================================== */

function clamp(
  value,
  min = 0,
  max = 10
) {
  const numeric =
    Number(
      value
    );

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
    value,
    MIN_IMPORTANCE,
    MAX_IMPORTANCE
  );
}

function normalizeTolerance(
  value
) {
  return clamp(
    value,
    MIN_TOLERANCE,
    MAX_TOLERANCE
  );
}

function normalizeWeight(
  value
) {
  return clamp(
    Number(value) /
      MAX_IMPORTANCE,
    0,
    1
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

function normalizeDirection(
  value,
  fallback =
    DIRECTION.NEUTRAL
) {
  const normalized =
    cleanText(
      value,
      ''
    )
      .toUpperCase()
      .replace(
        /[\s-]+/g,
        '_'
      );

  switch (
    normalized
  ) {
    case 'HIGHER':
    case 'MORE':
    case 'INCREASE':
    case 'MAXIMIZE':
    case 'PREFER_HIGHER':
    case 'PREFER_MORE':
      return DIRECTION.HIGHER;

    case 'LOWER':
    case 'LESS':
    case 'DECREASE':
    case 'MINIMIZE':
    case 'PREFER_LOWER':
    case 'PREFER_LESS':
      return DIRECTION.LOWER;

    case 'NEUTRAL':
    case 'NONE':
    case 'NO_PREFERENCE':
    case 'ANY':
    case '':
      return DIRECTION.NEUTRAL;

    default:
      return fallback;
  }
}

function normalizePreferenceObject(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  if (
    typeof value ===
    'number'
  ) {
    return {
      importance:
        normalizeImportance(
          value
        )
    };
  }

  if (
    typeof value ===
    'string'
  ) {
    /*
     * Numeric strings are accepted.
     * Otherwise the string is interpreted as a direction only.
     */
    const numeric =
      Number(
        value
      );

    if (
      Number.isFinite(
        numeric
      )
    ) {
      return {
        importance:
          normalizeImportance(
            numeric
          )
      };
    }

    return {
      direction:
        normalizeDirection(
          value
        )
    };
  }

  if (
    typeof value ===
      'object' &&
    !Array.isArray(
      value
    )
  ) {
    return {
      ...value
    };
  }

  return null;
}

function getFirstDefined(
  objects,
  keys
) {
  for (
    const object of
      objects
  ) {
    if (
      !object ||
      typeof object !==
        'object'
    ) {
      continue;
    }

    for (
      const key of
        keys
    ) {
      if (
        Object.prototype.hasOwnProperty.call(
          object,
          key
        ) &&
        object[key] !==
          undefined
      ) {
        return object[key];
      }
    }
  }

  return undefined;
}

function getPreferenceInput(
  rootObjects,
  canonicalKey
) {
  const aliases =
    INPUT_ALIASES[
      canonicalKey
    ] ||
    [
      canonicalKey
    ];

  return getFirstDefined(
    rootObjects,
    aliases
  );
}

/* ============================================================
 * DIRECTION OVERRIDE ACCESS
 * ============================================================
 *
 * Directions may be supplied in any of these forms:
 *
 * {
 *   salaryImportance: {
 *     importance: 9,
 *     direction: "HIGHER"
 *   }
 * }
 *
 * or:
 *
 * {
 *   salaryImportance: 9,
 *   salaryDirection: "HIGHER"
 * }
 *
 * or:
 *
 * {
 *   directions: {
 *     salary: "HIGHER"
 *   }
 * }
 */

function getDirectionOverride(
  rootObjects,
  canonicalKey,
  semanticName
) {
  const explicitDirection =
    getFirstDefined(
      rootObjects,
      [
        `${canonicalKey}Direction`,
        `${semanticName}Direction`
      ]
    );

  if (
    explicitDirection !==
      undefined
  ) {
    return explicitDirection;
  }

  for (
    const object of
      rootObjects
  ) {
    if (
      !object ||
      typeof object !==
        'object'
    ) {
      continue;
    }

    if (
      object.directions &&
      typeof object.directions ===
        'object'
    ) {
      const value =
        getFirstDefined(
          [
            object.directions
          ],
          [
            canonicalKey,
            semanticName
          ]
        );

      if (
        value !==
        undefined
      ) {
        return value;
      }
    }

    if (
      object.preferenceDirections &&
      typeof object.preferenceDirections ===
        'object'
    ) {
      const value =
        getFirstDefined(
          [
            object.preferenceDirections
          ],
          [
            canonicalKey,
            semanticName
          ]
        );

      if (
        value !==
        undefined
      ) {
        return value;
      }
    }
  }

  return undefined;
}

/* ============================================================
 * INDIVIDUAL SIGNAL NORMALIZATION
 * ========================================================== */

function normalizeImportanceSignal(
  definition,
  rawValue,
  directionOverride
) {
  const objectValue =
    normalizePreferenceObject(
      rawValue
    ) || {};

  const importance =
    normalizeImportance(
      objectValue.importance ??
      objectValue.weight ??
      rawValue ??
      DEFAULT_IMPORTANCE
    );

  const direction =
    normalizeDirection(
      objectValue.direction ??
      directionOverride,
      definition.defaultDirection
    );

  return {
    key:
      definition.key,

    metric:
      definition.metric,

    mode:
      definition.mode,

    importance,

    weight:
      normalizeWeight(
        importance
      ),

    direction,

    tolerance:
      null,

    explicit:
      rawValue !==
        undefined &&
      rawValue !==
        null,

    source:
      'candidate_profile'
  };
}

function normalizeToleranceSignal(
  definition,
  rawValue,
  directionOverride
) {
  const objectValue =
    normalizePreferenceObject(
      rawValue
    ) || {};

  const tolerance =
    normalizeTolerance(
      objectValue.tolerance ??
      objectValue.importance ??
      objectValue.weight ??
      rawValue ??
      DEFAULT_IMPORTANCE
    );

  const direction =
    normalizeDirection(
      objectValue.direction ??
      directionOverride,
      definition.defaultDirection
    );

  /*
   * Tolerance is intentionally retained separately from weight.
   *
   * The scoring engine may decide how strongly a burden is penalized.
   * This module only exposes the normalized candidate signal.
   */
  return {
    key:
      definition.key,

    metric:
      definition.metric,

    mode:
      definition.mode,

    importance:
      tolerance,

    weight:
      normalizeWeight(
        tolerance
      ),

    direction,

    tolerance,

    explicit:
      rawValue !==
        undefined &&
      rawValue !==
        null,

    source:
      'candidate_profile'
  };
}

/* ============================================================
 * SEMANTIC PREFERENCE MODEL
 * ========================================================== */

function buildPreferenceSignal(
  rootObjects,
  definition,
  semanticName
) {
  const rawValue =
    getPreferenceInput(
      rootObjects,
      definition.key
    );

  const directionOverride =
    getDirectionOverride(
      rootObjects,
      definition.key,
      semanticName
    );

  if (
    definition.mode ===
    'tolerance'
  ) {
    return normalizeToleranceSignal(
      definition,
      rawValue,
      directionOverride
    );
  }

  return normalizeImportanceSignal(
    definition,
    rawValue,
    directionOverride
  );
}

function getPreferenceImportanceKeys() {
  return Object.values(
    PREFERENCE_DEFINITIONS
  )
    .filter(
      (definition) =>
        definition.mode ===
        'importance'
    )
    .map(
      (definition) =>
        definition.key
    );
}

function getPreferenceToleranceKeys() {
  return Object.values(
    PREFERENCE_DEFINITIONS
  )
    .filter(
      (definition) =>
        definition.mode ===
        'tolerance'
    )
    .map(
      (definition) =>
        definition.key
    );
}

function getPreferenceDefinitions() {
  return Object.values(
    PREFERENCE_DEFINITIONS
  ).map(
    (definition) => ({
      ...definition
    })
  );
}

/* ============================================================
 * PREFERENCE MODEL NORMALIZATION
 * ========================================================== */

function normalizePreferences(
  input = {}
) {
  const candidate =
    input || {};

  /*
   * Preferences may be provided:
   *   1. directly;
   *   2. under `preferences`;
   *   3. under `assessment.preferences`;
   *   4. under `profile.preferences`.
   *
   * All are read-only input sources. Nothing is mutated.
   */
  const rootObjects = [
    candidate,
    candidate.preferences,
    candidate.assessment?.preferences,
    candidate.profile?.preferences
  ].filter(
    Boolean
  );

  const semanticNames = {
    salaryImportance:
      'salary',

    authorityImportance:
      'authority',

    careerGrowthImportance:
      'careerGrowth',

    workLifeBalanceImportance:
      'workLifeBalance',

    familyImportance:
      'familyCompatibility',

    parentCareImportance:
      'parentCareCompatibility',

    kolkataImportance:
      'kolkataStability',

    locationStabilityImportance:
      'locationStability',

    transferTolerance:
      'transfer',

    ruralPostingTolerance:
      'ruralPosting',

    nightDutyTolerance:
      'nightDuty',

    shiftDutyTolerance:
      'shiftDuty',

    physicalRiskTolerance:
      'physicalRisk',

    stressTolerance:
      'stress',

    publicInteractionImportance:
      'publicInteraction',

    fieldWorkImportance:
      'fieldWork',

    uniformImportance:
      'uniform',

    prestigeImportance:
      'prestige',

    housingImportance:
      'housing',

    englishAdvantageImportance:
      'englishAdvantage',

    jobSecurityImportance:
      'jobStability',

    examDifficultyTolerance:
      'examDifficulty',

    preparationBurdenTolerance:
      'preparationBurden'
  };

  const signals = {};

  for (
    const definition of
      Object.values(
        PREFERENCE_DEFINITIONS
      )
  ) {
    const semanticName =
      semanticNames[
        definition.key
      ] ??
      definition.metric;

    signals[
      definition.key
    ] =
      buildPreferenceSignal(
        rootObjects,
        definition,
        semanticName
      );
  }

  const governmentPreference =
    cleanText(
      getPreferenceInput(
        rootObjects,
        'governmentPreference'
      ),
      'ANY'
    );

  const statePreference =
    cleanText(
      getPreferenceInput(
        rootObjects,
        'statePreference'
      ),
      'ANY'
    );

  const locationPreference =
    cleanText(
      getPreferenceInput(
        rootObjects,
        'locationPreference'
      ),
      'ANY'
    );

  return {
    version:
      '1.0.0',

    preferences: {
      ...signals
    },

    /*
     * Convenient canonical lookup tables for the scoring engine.
     *
     * They contain no career results and no career facts.
     */
    byMetric:
      buildMetricIndex(
        signals
      ),

    importance:
      buildImportanceIndex(
        signals
      ),

    tolerances:
      buildToleranceIndex(
        signals
      ),

    directions:
      buildDirectionIndex(
        signals
      ),

    /*
     * These are candidate selection constraints, not eligibility
     * decisions and not preference scores.
     */
    filters: {
      government:
        governmentPreference,

      state:
        statePreference,

      location:
        locationPreference
    },

    /*
     * Useful for debugging, analytics and assessment integration.
     */
    activePreferenceKeys:
      Object.values(
        signals
      )
        .filter(
          (signal) =>
            signal.importance >
              0 ||
            signal.explicit
        )
        .map(
          (signal) =>
            signal.key
        )
  };
}

/* ============================================================
 * INDEX BUILDERS
 * ========================================================== */

function buildMetricIndex(
  signals
) {
  const output = {};

  Object.values(
    signals
  ).forEach(
    (signal) => {
      output[
        signal.metric
      ] = {
        key:
          signal.key,

        mode:
          signal.mode,

        importance:
          signal.importance,

        weight:
          signal.weight,

        direction:
          signal.direction,

        tolerance:
          signal.tolerance
      };
    }
  );

  return output;
}

function buildImportanceIndex(
  signals
) {
  const output = {};

  Object.values(
    signals
  )
    .filter(
      (signal) =>
        signal.mode ===
        'importance'
    )
    .forEach(
      (signal) => {
        output[
          signal.key
        ] =
          signal.importance;
      }
    );

  return output;
}

function buildToleranceIndex(
  signals
) {
  const output = {};

  Object.values(
    signals
  )
    .filter(
      (signal) =>
        signal.mode ===
        'tolerance'
    )
    .forEach(
      (signal) => {
        output[
          signal.key
        ] =
          signal.tolerance;
      }
    );

  return output;
}

function buildDirectionIndex(
  signals
) {
  const output = {};

  Object.values(
    signals
  ).forEach(
    (signal) => {
      output[
        signal.key
      ] =
        signal.direction;
    }
  );

  return output;
}

/* ============================================================
 * PROFILE EXTRACTION
 * ============================================================
 *
 * Some assessment/profile implementations may store preference
 * information under a dedicated profile object.
 *
 * This helper creates a normalized model without modifying the
 * supplied candidate object.
 */

function createPreferenceProfile(
  candidateProfile = {}
) {
  return normalizePreferences(
    candidateProfile
  );
}

/* ============================================================
 * DIRECTIONAL HELPERS FOR SCORING ENGINE
 * ============================================================ */

function prefersHigher(
  preferenceModel,
  metric
) {
  const signal =
    preferenceModel?.byMetric?.[
      metric
    ];

  return (
    signal?.direction ===
    DIRECTION.HIGHER
  );
}

function prefersLower(
  preferenceModel,
  metric
) {
  const signal =
    preferenceModel?.byMetric?.[
      metric
    ];

  return (
    signal?.direction ===
    DIRECTION.LOWER
  );
}

function isNeutralPreference(
  preferenceModel,
  metric
) {
  const signal =
    preferenceModel?.byMetric?.[
      metric
    ];

  return (
    !signal ||
    signal.direction ===
      DIRECTION.NEUTRAL
  );
}

function getPreferenceWeight(
  preferenceModel,
  metric
) {
  return (
    Number(
      preferenceModel?.byMetric?.[
        metric
      ]?.weight
    ) || 0
  );
}

function getPreferenceImportance(
  preferenceModel,
  metric
) {
  return (
    Number(
      preferenceModel?.byMetric?.[
        metric
      ]?.importance
    ) || 0
  );
}

function getPreferenceTolerance(
  preferenceModel,
  metric
) {
  const value =
    preferenceModel?.byMetric?.[
      metric
    ]?.tolerance;

  return value === null ||
    value === undefined
    ? null
    : Number(
        value
      );
}

/* ============================================================
 * PREFERENCE SIGNAL EXPLANATION
 * ============================================================
 *
 * This does not score a career. It only explains what the
 * candidate preference model means.
 */

function explainPreferenceSignal(
  signal
) {
  if (
    !signal
  ) {
    return {
      direction:
        DIRECTION.NEUTRAL,

      importance:
        0,

      weight:
        0,

      tolerance:
        null,

      text:
        'No preference signal is available.'
    };
  }

  const directionText = {
    HIGHER:
      'prefers higher values',
    LOWER:
      'prefers lower values',
    NEUTRAL:
      'has no fixed direction'
  };

  const modeText =
    signal.mode ===
    'tolerance'
      ? 'This is a tolerance setting.'
      : 'This is an importance setting.';

  return {
    direction:
      signal.direction,

    importance:
      signal.importance,

    weight:
      signal.weight,

    tolerance:
      signal.tolerance,

    text:
      `${modeText} The candidate ${directionText[
        signal.direction
      ]}.`
  };
}

/* ============================================================
 * VALIDATION
 * ============================================================
 *
 * The preference engine validates candidate preference input at
 * runtime so malformed assessment values do not silently leak
 * into the scoring layer.
 */

function validatePreferenceModel(
  model
) {
  const errors = [];

  if (
    !model ||
    typeof model !==
      'object'
  ) {
    return {
      valid:
        false,
      errors: [
        'Preference model is not an object.'
      ]
    };
  }

  if (
    !model.preferences ||
    typeof model.preferences !==
      'object'
  ) {
    errors.push(
      'Preference model has no normalized preferences object.'
    );
  }

  const validDirections =
    new Set(
      Object.values(
        DIRECTION
      )
    );

  Object.entries(
    model.preferences || {}
  ).forEach(
    ([
      key,
      signal
    ]) => {
      if (
        !signal ||
        typeof signal !==
          'object'
      ) {
        errors.push(
          `Preference signal "${key}" is malformed.`
        );

        return;
      }

      if (
        !validDirections.has(
          signal.direction
        )
      ) {
        errors.push(
          `Preference signal "${key}" has an invalid direction.`
        );
      }

      if (
        !Number.isFinite(
          Number(
            signal.importance
          )
        ) ||
        Number(
          signal.importance
        ) <
          MIN_IMPORTANCE ||
        Number(
          signal.importance
        ) >
          MAX_IMPORTANCE
      ) {
        errors.push(
          `Preference signal "${key}" has an invalid importance value.`
        );
      }

      if (
        !Number.isFinite(
          Number(
            signal.weight
          )
        ) ||
        Number(
          signal.weight
        ) <
          0 ||
        Number(
          signal.weight
        ) >
          1
      ) {
        errors.push(
          `Preference signal "${key}" has an invalid normalized weight.`
        );
      }

      if (
        signal.mode ===
          'tolerance' &&
        (
          signal.tolerance ===
            null ||
          !Number.isFinite(
            Number(
              signal.tolerance
            )
          ) ||
          Number(
            signal.tolerance
          ) <
            MIN_TOLERANCE ||
          Number(
            signal.tolerance
          ) >
            MAX_TOLERANCE
        )
      ) {
        errors.push(
          `Tolerance preference "${key}" has an invalid tolerance value.`
        );
      }
    }
  );

  return {
    valid:
      errors.length ===
      0,
    errors
  };
}

/* ============================================================
 * LEGACY COMPATIBILITY
 * ============================================================
 *
 * Older callers may have imported the previous
 * `scoreCareerPreferences()` function.
 *
 * That operation was conceptually misplaced in this module.
 *
 * To avoid silently allowing career scoring here, the compatibility
 * function now only normalizes the candidate preference input.
 *
 * It deliberately DOES NOT accept or inspect a career record.
 */

function scoreCareerPreferences(
  inputPreferences = {}
) {
  return normalizePreferences(
    inputPreferences
  );
}

/* ============================================================
 * EXPORTS
 * ========================================================== */

export {
  DIRECTION,

  DEFAULT_PREFERENCES,
  PREFERENCE_DEFINITIONS,

  normalizePreferences,
  createPreferenceProfile,

  getPreferenceDefinitions,
  getPreferenceImportanceKeys,
  getPreferenceToleranceKeys,

  prefersHigher,
  prefersLower,
  isNeutralPreference,

  getPreferenceWeight,
  getPreferenceImportance,
  getPreferenceTolerance,

  explainPreferenceSignal,
  validatePreferenceModel,

  /*
   * Backward-compatible export.
   *
   * It no longer scores a career.
   */
  scoreCareerPreferences
};

export default {
  DIRECTION,

  DEFAULT_PREFERENCES,
  PREFERENCE_DEFINITIONS,

  normalizePreferences,
  createPreferenceProfile,

  getPreferenceDefinitions,
  getPreferenceImportanceKeys,
  getPreferenceToleranceKeys,

  prefersHigher,
  prefersLower,
  isNeutralPreference,

  getPreferenceWeight,
  getPreferenceImportance,
  getPreferenceTolerance,

  explainPreferenceSignal,
  validatePreferenceModel,

  scoreCareerPreferences
};
