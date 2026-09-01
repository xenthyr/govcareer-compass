/**
 * GovCareer Compass
 * ============================================================
 * Static-Site Router
 * ============================================================
 *
 * Designed for:
 * - GitHub Pages
 * - Vercel
 * - direct .html navigation
 *
 * The project remains a multi-page static website.
 * This module provides consistent navigation helpers rather
 * than pretending the entire site is an SPA.
 */

import {
  getRoute,
  withBasePath
} from './config.js';

function normalizeRoute(
  value
) {
  return String(
    value || ''
  )
    .replace(
      /\\/g,
      '/'
    )
    .replace(
      /^\/+/,
      ''
    );
}

function resolveRoute(
  routeOrPath
) {
  const value =
    normalizeRoute(
      routeOrPath
    );

  if (
    !value
  ) {
    return getRoute(
      'home'
    );
  }

  /*
   * Known named routes.
   */
  try {
    if (
      Object.prototype.hasOwnProperty.call(
        {
          home: true,
          careerFinder: true,
          careerResults: true,
          exams: true,
          examDetails: true,
          jobs: true,
          jobDetails: true,
          compare: true,
          rankings: true,
          salary: true,
          eligibility: true,
          family: true,
          parents: true,
          location: true,
          housing: true,
          preparation: true,
          confusionCenter: true,
          states: true,
          ai: true,
          sources: true,
          glossary: true,
          methodology: true,
          about: true,
          privacy: true,
          notFound: true
        },
        value
      )
    ) {
      return getRoute(
        value
      );
    }
  } catch {
    // Treat as path below.
  }

  return withBasePath(
    value
  );
}

function navigate(
  routeOrPath,
  {
    replace = false,
    newTab = false
  } = {}
) {
  const destination =
    resolveRoute(
      routeOrPath
    );

  if (
    newTab
  ) {
    window.open(
      destination,
      '_blank',
      'noopener,noreferrer'
    );

    return destination;
  }

  if (
    replace
  ) {
    window.location.replace(
      destination
    );
  } else {
    window.location.assign(
      destination
    );
  }

  return destination;
}

function getCurrentLocation() {
  return {
    href:
      window.location.href,

    pathname:
      window.location.pathname,

    search:
      window.location.search,

    hash:
      window.location.hash
  };
}

function buildQuery(
  parameters = {}
) {
  const query =
    new URLSearchParams();

  Object.entries(
    parameters
  ).forEach(
    ([
      key,
      value
    ]) => {
      if (
        value === undefined ||
        value === null ||
        value === ''
      ) {
        return;
      }

      if (
        Array.isArray(
          value
        )
      ) {
        value.forEach(
          (item) => {
            query.append(
              key,
              String(
                item
              )
            );
          }
        );

        return;
      }

      query.set(
        key,
        String(
          value
        )
      );
    }
  );

  return query.toString();
}

function navigateWithQuery(
  routeOrPath,
  parameters = {},
  options = {}
) {
  const base =
    resolveRoute(
      routeOrPath
    );

  const query =
    buildQuery(
      parameters
    );

  const destination =
    query
      ? `${base}?${query}`
      : base;

  if (
    options.newTab
  ) {
    window.open(
      destination,
      '_blank',
      'noopener,noreferrer'
    );

    return destination;
  }

  if (
    options.replace
  ) {
    window.location.replace(
      destination
    );
  } else {
    window.location.assign(
      destination
    );
  }

  return destination;
}

function getQueryParameters() {
  const parameters =
    new URLSearchParams(
      window.location.search
    );

  return Object.fromEntries(
    parameters.entries()
  );
}

function getQueryParameter(
  name,
  fallback = null
) {
  const value =
    new URLSearchParams(
      window.location.search
    ).get(
      name
    );

  return value ??
    fallback;
}

function scrollToHash(
  hash = window.location.hash
) {
  if (
    !hash
  ) {
    return false;
  }

  const id =
    String(
      hash
    ).replace(
      /^#/,
      ''
    );

  if (
    !id
  ) {
    return false;
  }

  const element =
    document.getElementById(
      id
    );

  if (
    !element
  ) {
    return false;
  }

  element.scrollIntoView({
    behavior:
      document.documentElement
        .dataset
        .reducedMotion ===
      'true'
        ? 'auto'
        : 'smooth',
    block:
      'start'
  });

  return true;
}

function initializeRouter() {
  window.addEventListener(
    'load',
    () => {
      window.setTimeout(
        () => {
          scrollToHash();
        },
        0
      );
    }
  );
}

export {
  normalizeRoute,
  resolveRoute,
  navigate,
  getCurrentLocation,
  buildQuery,
  navigateWithQuery,
  getQueryParameters,
  getQueryParameter,
  scrollToHash,
  initializeRouter
};

export default {
  navigate,
  navigateWithQuery,
  resolveRoute,
  getCurrentLocation
};
