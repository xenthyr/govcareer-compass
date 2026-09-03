/**
 * GovCareer Compass
 * Browser client for CompassAI.
 *
 * There is intentionally NO OpenRouter API key here.
 *
 * Endpoint source of truth:
 *   config.ai.endpoint
 *
 * Deterministic fallback:
 *   /api/chat
 */

import config from "../config.js";

const DEFAULT_COMPASS_AI_ENDPOINT =
  "/api/chat";

function resolveCompassAIEndpoint() {
  const configuredEndpoint =
    config?.ai?.endpoint;

  if (
    typeof configuredEndpoint ===
      "string" &&
    configuredEndpoint.trim()
  ) {
    return configuredEndpoint.trim();
  }

  return DEFAULT_COMPASS_AI_ENDPOINT;
}

function createClientError(
  message,
  code
) {
  const error =
    new Error(message);

  error.code = code;

  return error;
}

function normalizeMessages(
  messages
) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
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
      role:
        message.role,
      content:
        message.content.trim()
    }))
    .filter(
      (message) =>
        message.content.length > 0
    );
}

async function parseResponse(
  response
) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw createClientError(
      "The CompassAI server returned an invalid response.",
      "INVALID_RESPONSE"
    );
  }
}

export async function askCompassAI({
  messages,
  context = null,
  language = "en",
  signal
} = {}) {
  const normalized =
    normalizeMessages(
      messages
    );

  if (
    normalized.length === 0
  ) {
    throw createClientError(
      "At least one message is required.",
      "EMPTY_MESSAGES"
    );
  }

  const response =
    await fetch(
      resolveCompassAIEndpoint(),
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body:
          JSON.stringify({
            messages:
              normalized,

            context,

            language
          }),

        signal
      }
    );

  const data =
    await parseResponse(
      response
    );

  if (
    !response.ok ||
    data.ok === false
  ) {
    throw createClientError(
      data?.error?.message ||
        "CompassAI is temporarily unavailable.",
      data?.error?.code ||
        "AI_SERVER_ERROR"
    );
  }

  if (
    typeof data.answer !==
      "string" ||
    !data.answer.trim()
  ) {
    throw createClientError(
      "CompassAI returned no answer.",
      "EMPTY_AI_ANSWER"
    );
  }

  return {
    answer:
      data.answer.trim(),

    assistant:
      data.assistant ||
      "CompassAI",

    provider:
      data.provider ||
      "OpenRouter",

    model:
      data.model ||
      null,

    language:
      data.language ||
      language,

    scope:
      Array.isArray(data.scope)
        ? data.scope
        : [],

    researchBaseline:
      data.researchBaseline ||
      null,

    usage:
      data.usage ||
      null
  };
}

export async function askCompassAIWithHistory(
  {
    history = [],
    userMessage,
    context = null,
    language = "en",
    signal
  } = {}
) {
  return askCompassAI({
    messages: [
      ...normalizeMessages(
        history
      ),
      {
        role: "user",
        content:
          typeof userMessage ===
          "string"
            ? userMessage.trim()
            : ""
      }
    ],
    context,
    language,
    signal
  });
}

export function createAbortController() {
  return new AbortController();
}

export default {
  askCompassAI,
  askCompassAIWithHistory,
  createAbortController
};
