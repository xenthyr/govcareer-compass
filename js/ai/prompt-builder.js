/**
 * GovCareer Compass
 * Client-side conversation preparation.
 *
 * This is NOT the authority layer.
 * The server-side system instructions remain authoritative.
 */

export function buildCareerQuestion(question) {
  if (
    typeof question !== "string"
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
    typeof postName === "string"
      ? postName.trim()
      : "";

  const candidate =
    typeof candidateSummary === "string"
      ? candidateSummary.trim()
      : "";

  if (!post) {
    return "Please explain the eligibility requirements for this government career.";
  }

  return [
    `Please assess the documented eligibility requirements for ${post}.`,
    candidate
      ? `Candidate context: ${candidate}`
      : ""
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildComparisonQuestion(
  careerNames = []
) {
  if (!Array.isArray(careerNames)) {
    return "";
  }

  const names = careerNames
    .filter(
      (name) =>
        typeof name === "string" &&
        name.trim()
    )
    .slice(0, 5);

  if (names.length < 2) {
    return "Please compare the selected government careers.";
  }

  return [
    "Compare these government careers for me:",
    ...names.map(
      (name, index) =>
        `${index + 1}. ${name.trim()}`
    ),
    "",
    "Focus on eligibility, pay, work profile,",
    "posting, transfer, family compatibility,",
    "parent-care, housing, promotion, risk and",
    "long-term career trade-offs."
  ].join("\n");
}

export function buildPreparationQuestion({
  examName
} = {}) {
  const exam =
    typeof examName === "string"
      ? examName.trim()
      : "";

  if (!exam) {
    return "Please explain the preparation strategy for this government examination.";
  }

  return [
    `How should I prepare for ${exam}?`,
    "",
    "Please separate:",
    "1. Core syllabus overlap",
    "2. Unique subjects",
    "3. Exam stages",
    "4. Physical/skill preparation if applicable",
    "5. Preparation difficulty",
    "6. Related backup examinations"
  ].join("\n");
}

export default {
  buildCareerQuestion,
  buildEligibilityQuestion,
  buildComparisonQuestion,
  buildPreparationQuestion
};
