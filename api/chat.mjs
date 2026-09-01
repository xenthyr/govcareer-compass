/**
 * GovCareer Compass
 * CompassAI Vercel serverless API
 *
 * Browser
 *   ↓
 * /api/chat
 *   ↓
 * OpenRouter
 *   ↓
 * selected model
 */

import {
  COMPASS_CONFIG,
  validateServerConfiguration
} from "./_lib/config.mjs";

import {
  COMPASS_SYSTEM_PROMPT,
  buildRequestInstructions
} from "./_lib/compass-prompt.mjs";

import {
  errorResponse,
  jsonResponse,
  isAllowedMethod,
  isAllowedOrigin,
  exceedsRequestSize,
  sanitizeContext,
  sanitizeMessages
} from "./_lib/security.mjs";

function getApiKey() {
  return (
    process.env.OPENROUTER_API_KEY?.trim() ||
    ""
  );
}

function getSiteUrl() {
  return (
    process.env.PUBLIC_SITE_URL?.trim() ||
    ""
  );
}

function getSiteName() {
  return "GovCareer Compass";
}

async function parseJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function buildMessages({
  messages,
  language,
  context
}) {
  return [
    {
      role: "system",
      content:
        COMPASS_SYSTEM_PROMPT
    },
    {
      role: "system",
      content:
        buildRequestInstructions({
          language,
          context
        })
    },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content
    }))
  ];
}

function extractAssistantText(
  data
) {
  const content =
    data?.choices?.[0]?.message
      ?.content;

  if (
    typeof content !== "string"
  ) {
    return "";
  }

  return content.trim();
}

function createUpstreamBody({
  messages
}) {
  return {
    model:
      COMPASS_CONFIG.openRouterModel,

    messages,

    max_tokens:
      COMPASS_CONFIG.maxOutputTokens,

    temperature: 0.2
  };
}

async function fetchWithTimeout(
  url,
  options,
  timeoutMs
) {
  const controller =
    new AbortController();

  const timeoutId =
    setTimeout(
      () => controller.abort(),
      timeoutMs
    );

  try {
    return await fetch(
      url,
      {
        ...options,
        signal:
          controller.signal
      }
    );
  } finally {
    clearTimeout(
      timeoutId
    );
  }
}

export default async function handler(
  request
) {
  try {
    const method =
      String(request.method || "")
        .toUpperCase();

    if (
      method === "OPTIONS"
    ) {
      return new Response(
        null,
        {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin":
              "*",
            "Access-Control-Allow-Methods":
              "POST, OPTIONS",
            "Access-Control-Allow-Headers":
              "Content-Type",
            "Cache-Control":
              "no-store"
          }
        }
      );
    }

    if (
      !isAllowedMethod(method)
    ) {
      return errorResponse(
        "Method not allowed.",
        405,
        "METHOD_NOT_ALLOWED"
      );
    }

    if (
      !isAllowedOrigin(request)
    ) {
      return errorResponse(
        "Request origin is not allowed.",
        403,
        "ORIGIN_NOT_ALLOWED"
      );
    }

    if (
      exceedsRequestSize(request)
    ) {
      return errorResponse(
        "Request is too large.",
        413,
        "REQUEST_TOO_LARGE"
      );
    }

    const configuration =
      validateServerConfiguration();

    if (!configuration.valid) {
      console.error(
        "CompassAI configuration error:",
        configuration.missing
      );

      return errorResponse(
        "CompassAI is not configured correctly.",
        503,
        "AI_NOT_CONFIGURED"
      );
    }

    const body =
      await parseJsonBody(
        request
      );

    if (
      !body ||
      typeof body !== "object"
    ) {
      return errorResponse(
        "Invalid JSON request.",
        400,
        "INVALID_JSON"
      );
    }

    const messages =
      sanitizeMessages(
        body.messages
      );

    if (
      messages.length === 0
    ) {
      return errorResponse(
        "At least one valid message is required.",
        400,
        "EMPTY_MESSAGES"
      );
    }

    const latestMessage =
      messages[
        messages.length - 1
      ];

    if (
      latestMessage.role !==
        "user"
    ) {
      return errorResponse(
        "The latest message must be a user message.",
        400,
        "INVALID_LATEST_MESSAGE"
      );
    }

    const context =
      sanitizeContext(
        body.context
      );

    const language =
      typeof body.language ===
        "string" &&
      body.language.trim()
        ? body.language
            .trim()
            .slice(0, 32)
        : "en";

    const apiKey =
      getApiKey();

    const siteUrl =
      getSiteUrl();

    const headers = {
      "Authorization":
        `Bearer ${apiKey}`,

      "Content-Type":
        "application/json",

      "X-Title":
        getSiteName()
    };

    if (siteUrl) {
      headers[
        "HTTP-Referer"
      ] = siteUrl;
    }

    const openRouterResponse =
      await fetchWithTimeout(
        `${COMPASS_CONFIG.openRouterBaseUrl}/chat/completions`,
        {
          method: "POST",
          headers,
          body:
            JSON.stringify(
              createUpstreamBody({
                messages:
                  buildMessages({
                    messages,
                    language,
                    context
                  })
              })
            )
        },
        COMPASS_CONFIG
          .requestTimeoutMs
      );

    const raw =
      await openRouterResponse.text();

    let data = null;

    try {
      data = raw
        ? JSON.parse(raw)
        : null;
    } catch {
      data = null;
    }

    if (
      !openRouterResponse.ok
    ) {
      console.error(
        "OpenRouter upstream error:",
        openRouterResponse.status,
        data
      );

      return errorResponse(
        "CompassAI could not complete the request.",
        502,
        "OPENROUTER_UPSTREAM_ERROR"
      );
    }

    const answer =
      extractAssistantText(
        data
      );

    if (!answer) {
      console.error(
        "OpenRouter returned no assistant content."
      );

      return errorResponse(
        "CompassAI returned an empty response.",
        502,
        "EMPTY_AI_RESPONSE"
      );
    }

    return jsonResponse({
      ok: true,

      assistant:
        "CompassAI",

      answer,

      provider:
        "OpenRouter",

      model:
        data?.model ||
        COMPASS_CONFIG
          .openRouterModel,

      language,

      scope:
        COMPASS_CONFIG
          .researchScope,

      researchBaseline:
        COMPASS_CONFIG
          .researchBaseline,

      usage:
        data?.usage || null
    });
  } catch (error) {
    console.error(
      "CompassAI request failure:",
      error
    );

    const timeout =
      error?.name ===
      "AbortError";

    return errorResponse(
      timeout
        ? "CompassAI timed out. Please try again."
        : "CompassAI is temporarily unavailable. Please try again.",
      500,
      timeout
        ? "AI_TIMEOUT"
        : "AI_REQUEST_FAILED"
    );
  }
}
