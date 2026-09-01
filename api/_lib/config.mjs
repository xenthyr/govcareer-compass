/**
 * GovCareer Compass
 * Server-side AI configuration.
 *
 * This file must never expose secrets to browser code.
 */

function readPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function readNonNegativeInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
}

function readOriginList(value) {
  if (!value || typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const AI_CONFIG = Object.freeze({
  assistantName: "CompassAI",

  researchScope: Object.freeze([
    "Central Government",
    "West Bengal Government"
  ]),

  baselineDate: "31 August 2026",

  model:
    process.env.OPENAI_MODEL?.trim() || "",

  maxMessages: readPositiveInteger(
    process.env.AI_MAX_MESSAGES,
    12
  ),

  maxMessageChars: readPositiveInteger(
    process.env.AI_MAX_MESSAGE_CHARS,
    6000
  ),

  maxContextChars: readPositiveInteger(
    process.env.AI_MAX_CONTEXT_CHARS,
    30000
  ),

  maxOutputTokens: readPositiveInteger(
    process.env.AI_MAX_OUTPUT_TOKENS,
    1200
  ),

  allowedOrigins: readOriginList(
    process.env.ALLOWED_ORIGINS
  ),

  requestTimeoutMs: readPositiveInteger(
    process.env.AI_REQUEST_TIMEOUT_MS,
    45000
  ),

  maxInputMessages: readPositiveInteger(
    process.env.AI_MAX_MESSAGES,
    12
  ),

  maxRequestBytes: readPositiveInteger(
    process.env.AI_MAX_REQUEST_BYTES,
    100000
  ),

  rateLimitWindowSeconds: readPositiveInteger(
    process.env.AI_RATE_LIMIT_WINDOW_SECONDS,
    60
  ),

  rateLimitRequests:
    readPositiveInteger(
      process.env.AI_RATE_LIMIT_REQUESTS,
      10
    ),

  minUserMessageChars: readNonNegativeInteger(
    process.env.AI_MIN_USER_MESSAGE_CHARS,
    1
  )
});

export function validateServerConfiguration() {
  const errors = [];

  if (!process.env.OPENAI_API_KEY?.trim()) {
    errors.push("OPENAI_API_KEY is not configured.");
  }

  if (!AI_CONFIG.model) {
    errors.push("OPENAI_MODEL is not configured.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
