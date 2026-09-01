/**
 * GovCareer Compass
 * Normalizes CompassAI server responses for the UI.
 */

export function parseCompassResponse(
  response
) {
  if (
    !response ||
    typeof response !== "object"
  ) {
    throw new Error(
      "Invalid CompassAI response."
    );
  }

  if (response.ok === false) {
    throw new Error(
      response.error?.message ||
        "CompassAI request failed."
    );
  }

  const answer =
    typeof response.answer === "string"
      ? response.answer.trim()
      : "";

  if (!answer) {
    throw new Error(
      "CompassAI did not return an answer."
    );
  }

  return {
    answer,
    assistant:
      response.assistant ||
      "CompassAI",
    language:
      response.language || "en",
    model:
      response.model || null,
    scope: Array.isArray(response.scope)
      ? response.scope
      : [],
    researchBaseline:
      response.researchBaseline || null
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
