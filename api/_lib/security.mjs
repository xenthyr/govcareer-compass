/**
 * GovCareer Compass
 * Server-side request validation.
 */

import {
  COMPASS_CONFIG
} from "./config.mjs";

const ALLOWED_METHODS =
  new Set([
    "POST",
    "OPTIONS"
  ]);

function getOrigin(request) {
  return (
    request.headers.get("origin")?.trim() ||
    ""
  );
}

function getHost(request) {
  try {
    return new URL(request.url).host;
  } catch {
    return "";
  }
}

function sameOrigin(request) {
  const origin = getOrigin(request);

  if (!origin) {
    return true;
  }

  try {
    return (
      new URL(origin).host ===
      getHost(request)
    );
  } catch {
    return false;
  }
}

function configuredOriginAllowed(
  request
) {
  const origin = getOrigin(request);

  if (!origin) {
    return true;
  }

  if (
    COMPASS_CONFIG.allowedOrigins
      .length === 0
  ) {
    return false;
  }

  return COMPASS_CONFIG.allowedOrigins
    .includes(origin);
}

export function isAllowedOrigin(
  request
) {
  if (
    COMPASS_CONFIG.allowedOrigins
      .length > 0
  ) {
    return (
      sameOrigin(request) ||
      configuredOriginAllowed(request)
    );
  }

  return sameOrigin(request);
}

export function isAllowedMethod(
  method
) {
  return ALLOWED_METHODS.has(
    String(method || "")
      .toUpperCase()
  );
}

export function exceedsRequestSize(
  request
) {
  const value =
    request.headers.get(
      "content-length"
    );

  if (!value) {
    return false;
  }

  const length =
    Number.parseInt(value, 10);

  if (!Number.isFinite(length)) {
    return false;
  }

  return (
    length >
    COMPASS_CONFIG.maxRequestBytes
  );
}

export function sanitizePlainText(
  value,
  maxLength
) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMessages(
  messages
) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .slice(-COMPASS_CONFIG.maxMessages)
    .filter(
      (message) =>
        message &&
        typeof message === "object" &&
        (
          message.role === "user" ||
          message.role === "assistant"
        ) &&
        typeof message.content ===
          "string"
    )
    .map((message) => ({
      role: message.role,
      content:
        sanitizePlainText(
          message.content,
          COMPASS_CONFIG.maxMessageChars
        )
    }))
    .filter(
      (message) =>
        message.content.length >=
        COMPASS_CONFIG
          .minUserMessageChars
    );
}

export function sanitizeContext(
  context
) {
  if (
    context === null ||
    context === undefined
  ) {
    return "";
  }

  try {
    const serialized =
      typeof context === "string"
        ? context
        : JSON.stringify(context);

    return sanitizePlainText(
      serialized,
      COMPASS_CONFIG.maxContextChars
    );
  } catch {
    return "";
  }
}

export function jsonResponse(
  payload,
  status = 200
) {
  return new Response(
    JSON.stringify(payload),
    {
      status,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        "X-Content-Type-Options":
          "nosniff"
      }
    }
  );
}

export function errorResponse(
  message,
  status,
  code
) {
  return jsonResponse(
    {
      ok: false,
      error: {
        code,
        message
      }
    },
    status
  );
}
