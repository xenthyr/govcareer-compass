/**
 * GovCareer Compass
 * Browser-side CompassAI client.
 *
 * IMPORTANT:
 * This file never contains OPENAI_API_KEY.
 */

const COMPASS_AI_ENDPOINT = "/api/chat";

function createError(message, code = "AI_CLIENT_ERROR") {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter(
      (message) =>
        message &&
        typeof message === "object" &&
        (message.role === "user" ||
          message.role === "assistant") &&
        typeof message.content === "string"
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim()
    }))
    .filter((message) => message.content);
}

async function parseResponseBody(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw createError(
      "The AI server returned an invalid response.",
      "INVALID_SERVER_RESPONSE"
    );
  }
}

export async function askCompassAI({
  messages,
  context = null,
  language = "en",
  signal
} = {}) {
  const normalizedMessages =
    normalizeMessages(messages);

  if (normalizedMessages.length === 0) {
    throw createError(
      "At least one message is required.",
      "EMPTY_MESSAGES"
    );
  }

  const response = await fetch(
    COMPASS_AI_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messages: normalizedMessages,
        context,
        language
      }),
      signal
    }
  );

  const data =
    await parseResponseBody(response);

  if (!response.ok || data.ok === false) {
    const serverMessage =
      data?.error?.message ||
      "CompassAI is temporarily unavailable.";

    throw createError(
      serverMessage,
      data?.error?.code || "AI_SERVER_ERROR"
    );
  }

  if (
    typeof data.answer !== "string" ||
    !data.answer.trim()
  ) {
    throw createError(
      "CompassAI returned no answer.",
      "EMPTY_AI_ANSWER"
    );
  }

  return {
    answer: data.answer.trim(),
    assistant:
      data.assistant || "CompassAI",
    language:
      data.language || language,
    model: data.model || null,
    scope: Array.isArray(data.scope)
      ? data.scope
      : [],
    researchBaseline:
      data.researchBaseline || null
  };
}

export async function askCompassAIWithHistory({
  history = [],
  userMessage,
  context = null,
  language = "en",
  signal
} = {}) {
  const messages = [
    ...normalizeMessages(history),
    {
      role: "user",
      content:
        typeof userMessage === "string"
          ? userMessage.trim()
          : ""
    }
  ];

  return askCompassAI({
    messages,
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
