/**
 * GovCareer Compass
 * CompassAI server endpoint
 *
 * Browser -> POST /api/chat -> Vercel -> OpenAI Responses API
 */

import {
  AI_CONFIG,
  validateServerConfiguration
} from "./_lib/config.mjs";

import {
  COMPASS_SYSTEM_INSTRUCTIONS,
  buildInputInstructions
} from "./_lib/compass-prompt.mjs";

import {
  errorResponse,
  isAllowedMethod,
  isAllowedOrigin,
  exceedsRequestSize,
  sanitizeContext,
  sanitizeMessages,
  jsonResponse
} from "./_lib/security.mjs";

function getBearerToken() {
  const value = process.env.OPENAI_API_KEY;

  if (!value || typeof value !== "string") {
    return "";
  }

  return value.trim();
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function createOpenAIInput(messages, context, language) {
  const input = [];

  input.push({
    role: "developer",
    content: buildInputInstructions({
      context,
      language
    })
  });

  for (const message of messages) {
    input.push({
      role: message.role,
      content: message.content
    });
  }

  return input;
}

async function fetchWithTimeout(
  url,
  options,
  timeoutMs
) {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function extractOutputText(data) {
  if (
    data &&
    typeof data.output_text === "string"
  ) {
    return data.output_text.trim();
  }

  if (!data || !Array.isArray(data.output)) {
    return "";
  }

  const chunks = [];

  for (const item of data.output) {
    if (
      item &&
      item.type === "message" &&
      Array.isArray(item.content)
    ) {
      for (const content of item.content) {
        if (
          content &&
          content.type === "output_text" &&
          typeof content.text === "string"
        ) {
          chunks.push(content.text);
        }
      }
    }
  }

  return chunks.join("\n").trim();
}

export default {
  async fetch(request) {
    try {
      const method =
        request.method?.toUpperCase() || "GET";

      if (method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers":
              "Content-Type"
          }
        });
      }

      if (!isAllowedMethod(method)) {
        return errorResponse(
          "Method not allowed.",
          405,
          "METHOD_NOT_ALLOWED"
        );
      }

      if (!isAllowedOrigin(request)) {
        return errorResponse(
          "Request origin is not allowed.",
          403,
          "ORIGIN_NOT_ALLOWED"
        );
      }

      if (exceedsRequestSize(request)) {
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
          configuration.errors
        );

        return errorResponse(
          "CompassAI is not configured correctly.",
          503,
          "AI_NOT_CONFIGURED"
        );
      }

      const body = await readJsonBody(request);

      if (!body || typeof body !== "object") {
        return errorResponse(
          "Invalid JSON request.",
          400,
          "INVALID_JSON"
        );
      }

      const messages = sanitizeMessages(
        body.messages
      );

      if (messages.length === 0) {
        return errorResponse(
          "At least one user message is required.",
          400,
          "EMPTY_MESSAGES"
        );
      }

      const latestMessage =
        messages[messages.length - 1];

      if (
        latestMessage.role !== "user" ||
        latestMessage.content.length <
          AI_CONFIG.minUserMessageChars
      ) {
        return errorResponse(
          "The latest message must be a valid user message.",
          400,
          "INVALID_LATEST_MESSAGE"
        );
      }

      const context = sanitizeContext(
        body.context
      );

      const language =
        typeof body.language === "string" &&
        body.language.trim()
          ? body.language.trim().slice(0, 32)
          : "en";

      const apiKey = getBearerToken();

      if (!apiKey) {
        return errorResponse(
          "AI service credentials are unavailable.",
          503,
          "MISSING_API_KEY"
        );
      }

      const openAIInput = createOpenAIInput(
        messages,
        context,
        language
      );

      const upstreamResponse =
        await fetchWithTimeout(
          "https://api.openai.com/v1/responses",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: AI_CONFIG.model,
              instructions:
                COMPASS_SYSTEM_INSTRUCTIONS,
              input: openAIInput,
              max_output_tokens:
                AI_CONFIG.maxOutputTokens,
              store: false
            })
          },
          AI_CONFIG.requestTimeoutMs
        );

      const rawText =
        await upstreamResponse.text();

      let upstreamData = null;

      try {
        upstreamData = rawText
          ? JSON.parse(rawText)
          : null;
      } catch {
        upstreamData = null;
      }

      if (!upstreamResponse.ok) {
        console.error(
          "OpenAI API error:",
          upstreamResponse.status,
          upstreamData
        );

        return errorResponse(
          "CompassAI could not complete the request.",
          502,
          "UPSTREAM_AI_ERROR"
        );
      }

      const answer =
        extractOutputText(upstreamData);

      if (!answer) {
        return errorResponse(
          "CompassAI returned an empty response.",
          502,
          "EMPTY_AI_RESPONSE"
        );
      }

      return jsonResponse({
        ok: true,
        assistant: AI_CONFIG.assistantName,
        answer,
        model: AI_CONFIG.model,
        language,
        scope: AI_CONFIG.researchScope,
        researchBaseline:
          AI_CONFIG.baselineDate
      });
    } catch (error) {
      const isAbort =
        error?.name === "AbortError";

      console.error(
        "CompassAI request failure:",
        error
      );

      return errorResponse(
        isAbort
          ? "CompassAI request timed out. Please try again."
          : "CompassAI is temporarily unavailable. Please try again.",
        500,
        isAbort
          ? "AI_TIMEOUT"
          : "AI_REQUEST_FAILED"
      );
    }
  }
};
