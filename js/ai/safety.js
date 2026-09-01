/**
 * GovCareer Compass
 * Client-side CompassAI helpers.
 *
 * IMPORTANT:
 * These checks are UX helpers only.
 * They are NOT the security boundary.
 */

const IDENTITY_PATTERNS = [
  "your name",
  "who are you",
  "what are you",
  "your ai",
  "তোমার নাম",
  "আপনার নাম",
  "কে তুমি",
  "কে আপনি"
];

export function isIdentityQuestion(
  text
) {
  if (
    typeof text !==
    "string"
  ) {
    return false;
  }

  const value =
    text.toLowerCase().trim();

  return IDENTITY_PATTERNS.some(
    (pattern) =>
      value.includes(pattern)
  );
}

export function getIdentityResponse(
  language = "en"
) {
  if (
    typeof language ===
      "string" &&
    language
      .toLowerCase()
      .startsWith("bn")
  ) {
    return (
      "আমি CompassAI — GovCareer Compass-এর AI career assistant। আমি সরকারি পরীক্ষা, সরকারি চাকরি, যোগ্যতা, বেতন, পোস্টিং, প্রস্তুতি এবং career selection নিয়ে সাহায্য করি।"
    );
  }

  return (
    "I'm CompassAI, the AI career assistant for GovCareer Compass. I specialise in government exams, government jobs, eligibility, pay, postings, preparation and career selection."
  );
}

export function normalizeLanguage(
  language
) {
  if (
    typeof language !==
      "string" ||
    !language.trim()
  ) {
    return "en";
  }

  return language
    .trim()
    .toLowerCase();
}

export default {
  isIdentityQuestion,
  getIdentityResponse,
  normalizeLanguage
};
