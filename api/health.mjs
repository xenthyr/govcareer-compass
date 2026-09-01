/**
 * GovCareer Compass
 * Deployment and AI configuration health endpoint.
 *
 * This endpoint never returns the API key or other secrets.
 */

import {
  AI_CONFIG,
  validateServerConfiguration
} from "./_lib/config.mjs";

export default {
  fetch(request) {
    if (
      request.method !== "GET" &&
      request.method !== "HEAD"
    ) {
      return Response.json(
        {
          ok: false,
          error: "Method not allowed."
        },
        {
          status: 405,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }

    const configuration =
      validateServerConfiguration();

    return Response.json(
      {
        ok: configuration.valid,
        service: "GovCareer Compass",
        assistant: AI_CONFIG.assistantName,
        environment:
          process.env.VERCEL_ENV || "unknown",
        configuration: {
          openAIConfigured:
            Boolean(
              process.env.OPENAI_API_KEY
            ),
          modelConfigured:
            Boolean(AI_CONFIG.model)
        },
        timestamp:
          new Date().toISOString()
      },
      {
        status: configuration.valid
          ? 200
          : 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff"
        }
      }
    );
  }
};
