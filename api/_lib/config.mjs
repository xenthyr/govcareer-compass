/**
 * GovCareer Compass
 * CompassAI server configuration.
 *
 * IMPORTANT:
 * No secret is hard-coded here.
 * Secrets are supplied by Vercel Environment Variables.
 */

function readPositiveInteger(
  value,
  fallback
) {
  const parsed = Number.parseInt(
    value ?? "",
    10
  );

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : fallback;
}

function readNonNegativeInteger(
  value,
  fallback
) {
  const parsed = Number.parseInt(
    value ?? "",
    10
  );

  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : fallback;
}

function readOriginList(
  value
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return [];
  }

  return value
    .split(",")
    .map(
      (origin) =>
        origin.trim()
    )
    .filter(Boolean);
}

export const COMPASS_CONFIG =
  Object.freeze({
    assistantName:
      "CompassAI",

    productName:
      "GovCareer Compass",

    identity:
      Object.freeze({
        productName:
          "GovCareer Compass",

        assistantName:
          "CompassAI",

        ownerPublicName:
          "Abhijit Dutta",

        ownerPublicRole:
          "Developer and owner of GovCareer Compass"
      }),

    researchBaseline:
      "31 August 2026",

    researchScope:
      Object.freeze([
        "Central Government",
        "West Bengal Government"
      ]),

    openRouterBaseUrl:
      "https://openrouter.ai/api/v1",

    openRouterModel:
      process.env.OPENROUTER_MODEL?.trim() || "",

    siteUrl:
      process.env.PUBLIC_SITE_URL?.trim() || "",

    allowedOrigins:
      readOriginList(
        process.env.ALLOWED_ORIGINS
      ),

    maxMessages:
      readPositiveInteger(
        process.env.AI_MAX_MESSAGES,
        12
      ),

    maxMessageChars:
      readPositiveInteger(
        process.env.AI_MAX_MESSAGE_CHARS,
        6000
      ),

    maxContextChars:
      readPositiveInteger(
        process.env.AI_MAX_CONTEXT_CHARS,
        30000
      ),

    maxOutputTokens:
      readPositiveInteger(
        process.env.AI_MAX_OUTPUT_TOKENS,
        1200
      ),

    requestTimeoutMs:
      readPositiveInteger(
        process.env.AI_REQUEST_TIMEOUT_MS,
        45000
      ),

    maxRequestBytes:
      readPositiveInteger(
        process.env.AI_MAX_REQUEST_BYTES,
        100000
      ),

    minUserMessageChars:
      readNonNegativeInteger(
        process.env.AI_MIN_USER_MESSAGE_CHARS,
        1
      )
  });

export function validateServerConfiguration() {
  const missing = [];

  if (
    !process.env.OPENROUTER_API_KEY?.trim()
  ) {
    missing.push(
      "OPENROUTER_API_KEY"
    );
  }

  if (
    !COMPASS_CONFIG.openRouterModel
  ) {
    missing.push(
      "OPENROUTER_MODEL"
    );
  }

  return {
    valid:
      missing.length === 0,

    missing
  };
}
