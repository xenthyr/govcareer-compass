/**
 * GovCareer Compass
 * CompassAI response normalization.
 */

export function parseCompassResponse(
  response
) {
  if (
    !response ||
    typeof response !==
      "object"
  ) {
    throw new Error(
      "Invalid CompassAI response."
    );
  }

  if (
    response.ok === false
  ) {
    throw new Error(
      response.error?.message ||
        "CompassAI request failed."
    );
  }

  const answer =
    typeof response.answer ===
      "string"
      ? response.answer.trim()
      : "";

  if (!answer) {
    throw new Error(
      "CompassAI returned an empty answer."
    );
  }

  return {
    answer,

    assistant:
      response.assistant ||
      "CompassAI",

    provider:
      response.provider ||
      "OpenRouter",

    model:
      response.model ||
      null,

    language:
      response.language ||
      "en",

    scope:
      Array.isArray(
        response.scope
      )
        ? response.scope
        : [],

    researchBaseline:
      response.researchBaseline ||
      null,

    usage:
      response.usage ||
      null
  };
}

export function getDisplayAnswer(
  response
) {
  return parseCompassResponse(
    response
  ).answer;
}

export default {
  parseCompassResponse,
  getDisplayAnswer
};
