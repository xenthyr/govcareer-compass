/**
 * GovCareer Compass
 * User-question builders for CompassAI.
 */

export function buildCareerQuestion(
  question
) {
  if (
    typeof question !==
    "string"
  ) {
    return "";
  }

  return question.trim();
}

export function buildEligibilityQuestion({
  postName,
  candidateSummary
} = {}) {
  const post =
    typeof postName ===
    "string"
      ? postName.trim()
      : "";

  const candidate =
    typeof candidateSummary ===
    "string"
      ? candidateSummary.trim()
      : "";

  if (!post) {
    return (
      "Explain the documented eligibility requirements for this government career."
    );
  }

  return [
    `Explain whether the candidate appears eligible for ${post}.`,
    candidate
      ? `Candidate profile:\n${candidate}`
      : "",
    "",
    "Separate hard eligibility from preference and identify any missing information."
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildComparisonQuestion(
  careerNames = []
) {
  const names =
    Array.isArray(careerNames)
      ? careerNames
          .filter(
            (name) =>
              typeof name ===
                "string" &&
              name.trim()
          )
          .slice(0, 5)
      : [];

  if (names.length < 2) {
    return (
      "Compare the selected government careers using the available GovCareer Compass data."
    );
  }

  return [
    "Compare these government careers:",
    ...names.map(
      (name, index) =>
        `${index + 1}. ${name.trim()}`
    ),
    "",
    "Compare eligibility, pay, work profile,",
    "authority, posting, transfer, housing,",
    "promotion, work-life, family, parent-care,",
    "physical risk and long-term trade-offs."
  ].join("\n");
}

export function buildPreparationQuestion({
  examName
} = {}) {
  const exam =
    typeof examName ===
    "string"
      ? examName.trim()
      : "";

  if (!exam) {
    return (
      "Explain how to prepare for this government examination using the available GovCareer Compass information."
    );
  }

  return [
    `How should I prepare for ${exam}?`,
    "",
    "Separate:",
    "1. Syllabus",
    "2. Common subjects",
    "3. Unique subjects",
    "4. Examination stages",
    "5. Physical or skill preparation",
    "6. Preparation difficulty",
    "7. Related backup examinations"
  ].join("\n");
}

export default {
  buildCareerQuestion,
  buildEligibilityQuestion,
  buildComparisonQuestion,
  buildPreparationQuestion
};
