/**
 * GovCareer Compass
 * Client-side AI safety helpers.
 *
 * Server-side instructions remain authoritative.
 */

const ALLOWED_SCOPE_KEYWORDS = [
  "government",
  "exam",
  "examination",
  "job",
  "career",
  "eligibility",
  "recruitment",
  "qualification",
  "salary",
  "pay",
  "posting",
  "transfer",
  "promotion",
  "housing",
  "quarter",
  "pension",
  "work-life",
  "family",
  "parent",
  "preparation",
  "syllabus",
  "railway",
  "police",
  "upsc",
  "ssc",
  "wbpsc",
  "wbcsc",
  "wbcs",
  "rpf",
  "ib",
  "cbi",
  "nia",
  "ncb",
  "panchayat",
  "west bengal",
  "central government"
];

const IDENTITY_RESPONSE =
  "I'm CompassAI, the AI career assistant for GovCareer Compass. I specialise in government exams, government jobs, eligibility, pay, career comparisons and preparation.";

export function isIdentityQuestion(
  text
) {
  if (typeof text !== "string") {
    return false;
  }

  const value =
    text.toLowerCase().trim();

  return (
    value.includes("your name") ||
    value.includes("who are you") ||
    value.includes("what are you") ||
    value.includes("তোমার নাম") ||
    value.includes("আপনার নাম") ||
    value.includes("কে তুমি") ||
    value.includes("কে আপনি")
  );
}

export function getIdentityResponse() {
  return IDENTITY_RESPONSE;
}

export function appearsGovernmentRelated(
  text
) {
  if (typeof text !== "string") {
    return false;
  }

  const value =
    text.toLowerCase().trim();

  return ALLOWED_SCOPE_KEYWORDS.some(
    (keyword) =>
      value.includes(keyword)
  );
}

export function getOutOfScopeResponse() {
  return "I'm CompassAI, the GovCareer Compass assistant. I can help with government exams, government jobs, eligibility, pay, postings, preparation and career selection.";
}

export function normalizeLanguage(
  language
) {
  if (
    typeof language !== "string" ||
    !language.trim()
  ) {
    return "en";
  }

  return language.trim().toLowerCase();
}

export default {
  isIdentityQuestion,
  getIdentityResponse,
  appearsGovernmentRelated,
  getOutOfScopeResponse,
  normalizeLanguage
};
