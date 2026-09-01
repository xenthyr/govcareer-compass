/**
 * GovCareer Compass
 * Server-side request validation and security helpers.
 */

import { AI_CONFIG } from "./config.mjs";

const TRUSTED_METHODS = new Set(["POST", "OPTIONS"]);

function getRequestOrigin(request) {
  return request.headers.get("origin")?.trim() || "";
}

function getRequestHost(request) {
  try {
    return new URL(request.url).host;
  } catch {
    return "";
  }
}

function isSameOrigin(request) {
  const origin = getRequestOrigin(request);

  if (!origin) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    return originUrl.host === getRequestHost(request);
  } catch {
    return false;
  }
}

function isAllowedConfiguredOrigin(request) {
  const origin = getRequestOrigin(request);

  if (!origin) {
    return true;
  }

  if (AI_CONFIG.allowedOrigins.length === 0) {
    return false;
  }

  return AI_CONFIG.allowedOrigins.includes(origin);
}

export function isAllowedOrigin(request) {
  if (AI_CONFIG.allowedOrigins.length > 0) {
    return (
      isSameOrigin(request) ||
      isAllowedConfiguredOrigin(request)
    );
  }

  return isSameOrigin(request);
}

export function isAllowedMethod(method) {
  return TRUSTED_METHODS.has(
    String(method || "").toUpperCase()
  );
}

export function getClientContentLength(request) {
  const value = request.headers.get("content-length");

  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export function exceedsRequestSize(request) {
  const contentLength = getClientContentLength(request);

  if (contentLength === null) {
    return false;
  }

  return contentLength > AI_CONFIG.maxRequestBytes;
}

export function sanitizePlainText(value, maxLength) {
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

export function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .slice(-AI_CONFIG.maxMessages)
    .filter(
      (message) =>
        message &&
        typeof message === "object" &&
        typeof message.role === "string" &&
        typeof message.content === "string"
    )
    .map((message) => ({
      role:
        message.role === "assistant"
          ? "assistant"
          : "user",
      content: sanitizePlainText(
        message.content,
        AI_CONFIG.maxMessageChars
      )
    }))
    .filter(
      (message) =>
        message.content.length >=
        AI_CONFIG.minUserMessageChars
    );
}

export function sanitizeContext(context) {
  if (context === null || context === undefined) {
    return "";
  }

  if (typeof context === "string") {
    return sanitizePlainText(
      context,
      AI_CONFIG.maxContextChars
    );
  }

  try {
    const serialized = JSON.stringify(context);

    return sanitizePlainText(
      serialized,
      AI_CONFIG.maxContextChars
    );
  } catch {
    return "";
  }
}

export function jsonResponse(payload, status = 200) {
  return new Response(
    JSON.stringify(payload),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        "X-Content-Type-Options": "nosniff"
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
