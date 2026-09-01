/**
 * GovCareer Compass
 * Builds structured application context for CompassAI.
 *
 * This module should pass only relevant application state.
 */

function safeClone(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  try {
    return JSON.parse(
      JSON.stringify(value)
    );
  } catch {
    return null;
  }
}

function pick(object, keys) {
  if (!object || typeof object !== "object") {
    return {};
  }

  const output = {};

  for (const key of keys) {
    if (
      Object.prototype.hasOwnProperty.call(
        object,
        key
      )
    ) {
      output[key] = safeClone(
        object[key]
      );
    }
  }

  return output;
}

export function buildCandidateContext(
  candidateProfile
) {
  return pick(
    candidateProfile,
    [
      "education",
      "degree",
      "honours",
      "subjects",
      "marks",
      "additionalQualifications",
      "professionalQualifications",
      "technicalQualifications",
      "itiTrades",
      "languages",
      "computerSkills",
      "typing",
      "shorthand",
      "drivingLicence",
      "experience",
      "age",
      "dateOfBirth",
      "citizenship",
      "domicile",
      "gender",
      "category",
      "physicalProfile"
    ]
  );
}

export function buildPreferenceContext(
  preferences
) {
  return pick(
    preferences,
    [
      "governmentPreference",
      "statePreference",
      "salaryImportance",
      "authorityImportance",
      "familyImportance",
      "parentCareImportance",
      "locationImportance",
      "kolkataImportance",
      "transferTolerance",
      "nightDutyTolerance",
      "physicalRiskTolerance",
      "workLifeImportance",
      "careerGrowthImportance",
      "prestigeImportance",
      "housingImportance",
      "careerInterests",
      "examPreparationTolerance"
    ]
  );
}

export function buildCareerContext(
  career
) {
  if (!career || typeof career !== "object") {
    return null;
  }

  return pick(
    career,
    [
      "id",
      "government",
      "department",
      "organisation",
      "service",
      "cadre",
      "post",
      "exam",
      "qualification",
      "baEligibility",
      "eligibilityStatus",
      "paySystem",
      "payLevel",
      "startingBasic",
      "maximumBasic",
      "grossEstimate",
      "inHandEstimate",
      "jobProfile",
      "workStyle",
      "nightDuty",
      "shiftDuty",
      "workLife",
      "stress",
      "physicalRisk",
      "authority",
      "posting",
      "transfer",
      "kolkataStability",
      "housing",
      "promotion",
      "familyCompatibility",
      "parentCareCompatibility",
      "englishAdvantage",
      "difficulty",
      "currentStatus",
      "confidence",
      "sources"
    ]
  );
}

export function buildComparisonContext(
  careers
) {
  if (!Array.isArray(careers)) {
    return [];
  }

  return careers
    .slice(0, 5)
    .map(buildCareerContext)
    .filter(Boolean);
}

export function buildEligibilityContext(
  eligibilityResult
) {
  if (
    !eligibilityResult ||
    typeof eligibilityResult !==
      "object"
  ) {
    return null;
  }

  return pick(
    eligibilityResult,
    [
      "opportunityId",
      "overallStatus",
      "passedRequirements",
      "failedRequirements",
      "unknownRequirements",
      "conditionalRequirements",
      "explanation",
      "sourceReferences",
      "confidence"
    ]
  );
}

export function buildRecommendationContext(
  recommendationResult
) {
  if (
    !recommendationResult ||
    typeof recommendationResult !==
      "object"
  ) {
    return null;
  }

  return pick(
    recommendationResult,
    [
      "opportunityId",
      "eligibilityStatus",
      "overallScore",
      "dimensionScores",
      "matchedFactors",
      "tradeOffFactors",
      "missingInformation",
      "confidence",
      "explanation"
    ]
  );
}

export function buildCompassContext({
  candidateProfile = null,
  preferences = null,
  selectedCareer = null,
  selectedExam = null,
  comparison = [],
  eligibility = null,
  recommendation = null,
  language = "en"
} = {}) {
  return {
    application: {
      product: "GovCareer Compass",
      assistant: "CompassAI",
      language,
      researchScope: [
        "Central Government",
        "West Bengal Government"
      ],
      researchBaseline: "31 August 2026"
    },

    candidate:
      buildCandidateContext(
        candidateProfile
      ),

    preferences:
      buildPreferenceContext(
        preferences
      ),

    selectedCareer:
      buildCareerContext(
        selectedCareer
      ),

    selectedExam:
      safeClone(selectedExam),

    comparison:
      buildComparisonContext(
        comparison
      ),

    eligibility:
      buildEligibilityContext(
        eligibility
      ),

    recommendation:
      buildRecommendationContext(
        recommendation
      )
  };
}

export default {
  buildCandidateContext,
  buildPreferenceContext,
  buildCareerContext,
  buildComparisonContext,
  buildEligibilityContext,
  buildRecommendationContext,
  buildCompassContext
};
