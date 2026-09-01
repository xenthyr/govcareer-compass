/**
 * GovCareer Compass
 * Builds structured context for CompassAI.
 *
 * Only relevant structured application information
 * should be sent to the AI.
 */

function clone(value) {
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

function select(
  object,
  fields
) {
  if (
    !object ||
    typeof object !==
      "object"
  ) {
    return {};
  }

  const result = {};

  for (const field of fields) {
    if (
      Object.prototype.hasOwnProperty.call(
        object,
        field
      )
    ) {
      result[field] =
        clone(object[field]);
    }
  }

  return result;
}

export function buildCandidateContext(
  candidate
) {
  return select(
    candidate,
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
  return select(
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
  return select(
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
      "conditions",
      "paySystem",
      "payLevel",
      "startingBasic",
      "maximumBasic",
      "da",
      "hra",
      "allowances",
      "grossEstimate",
      "inHandEstimate",
      "jobProfile",
      "workStyle",
      "publicInteraction",
      "nightDuty",
      "shiftDuty",
      "holidayDuty",
      "emergencyDuty",
      "workLife",
      "stress",
      "physicalRisk",
      "authority",
      "socialStatus",
      "posting",
      "transfer",
      "kolkataStability",
      "ruralPosting",
      "housing",
      "promotion",
      "careerCeiling",
      "training",
      "probation",
      "retirement",
      "familyCompatibility",
      "parentCareCompatibility",
      "englishAdvantage",
      "advantages",
      "disadvantages",
      "difficulty",
      "recruitmentFrequency",
      "currentStatus",
      "confidence",
      "sources"
    ]
  );
}

export function buildExamContext(
  exam
) {
  if (
    !exam ||
    typeof exam !==
      "object"
  ) {
    return null;
  }

  return clone(exam);
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
  result
) {
  return select(
    result,
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
  result
) {
  return select(
    result,
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
      product:
        "GovCareer Compass",

      assistant:
        "CompassAI",

      language,

      researchScope: [
        "Central Government",
        "West Bengal Government"
      ],

      researchBaseline:
        "31 August 2026"
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
      buildExamContext(
        selectedExam
      ),

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
  buildExamContext,
  buildComparisonContext,
  buildEligibilityContext,
  buildRecommendationContext,
  buildCompassContext
};
