/**
 * GovCareer Compass
 * CompassAI health endpoint.
 *
 * Never exposes the secret key.
 */

import {
  COMPASS_CONFIG,
  validateServerConfiguration
} from "./_lib/config.mjs";

export default async function handler(
  request
) {
  if (
    request.method !== "GET" &&
    request.method !== "HEAD"
  ) {
    return new Response(
      JSON.stringify({
        ok: false,
        error:
          "Method not allowed."
      }),
      {
        status: 405,
        headers: {
          "Content-Type":
            "application/json; charset=utf-8",
          "Cache-Control":
            "no-store"
        }
      }
    );
  }

  const configuration =
    validateServerConfiguration();

  return new Response(
    JSON.stringify({
      ok:
        configuration.valid,

      service:
        "GovCareer Compass",

      assistant:
        COMPASS_CONFIG
          .assistantName,

      provider:
        "OpenRouter",

      environment:
        process.env.VERCEL_ENV ||
        "unknown",

      configuration: {
        apiKeyConfigured:
          Boolean(
            process.env
              .OPENROUTER_API_KEY
          ),

        modelConfigured:
          Boolean(
            COMPASS_CONFIG
              .openRouterModel
          ),

        publicSiteConfigured:
          Boolean(
            process.env
              .PUBLIC_SITE_URL
          )
      },

      timestamp:
        new Date().toISOString()
    }),
    {
      status:
        configuration.valid
          ? 200
          : 503,

      headers: {
        "Content-Type":
          "application/json; charset=utf-8",

        "Cache-Control":
          "no-store",

        "X-Content-Type-Options":
          "nosniff"
      }
    }
  );
}
