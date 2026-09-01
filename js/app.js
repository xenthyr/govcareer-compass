/**
 * GovCareer Compass
 * ============================================================
 * Global Application Bootstrap
 * ============================================================
 *
 * FILE:
 *   /js/app.js
 *
 * PURPOSE:
 *   Central entry point for the static GovCareer Compass
 *   application.
 *
 * RESPONSIBILITIES:
 *   1. Initialize application metadata.
 *   2. Initialize safe local storage.
 *   3. Initialize theme.
 *   4. Initialize language.
 *   5. Initialize router.
 *   6. Initialize navigation.
 *   7. Initialize search.
 *   8. Initialize filters.
 *   9. Initialize modal system.
 *  10. Initialize sharing.
 *  11. Initialize export/print helpers.
 *  12. Load the current page controller.
 *  13. Provide application-wide lifecycle events.
 *
 * IMPORTANT:
 *   This file is an orchestration layer.
 *
 *   Business logic belongs in:
 *     /js/database/
 *     /js/recommendation/
 *     /js/calculators/
 *
 *   UI rendering belongs in:
 *     /js/components/
 *     /js/pages/
 *
 *   This application remains a static multi-page website,
 *   compatible with GitHub Pages and Vercel.
 */

import config from './config.js';

import {
  initializeStorage
} from './storage.js';

import {
  initializeTheme
} from './theme.js';

import {
  initializeLanguage
} from './language.js';

import {
  initializeRouter
} from './router.js';

import {
  initializeNavigation
} from './navigation.js';

import {
  initializeSearch
} from './search.js';

import {
  initializeFilters
} from './filters.js';

import {
  initializeModalSystem
} from './modal.js';

import {
  initializeSharing
} from './share.js';

import {
  initializeExport
} from './export.js';

/* ============================================================
 * APPLICATION CONSTANTS
 * ============================================================
 */

const APP_READY_EVENT =
  'govcareer:ready';

const APP_ERROR_EVENT =
  'govcareer:error';

const APP_PAGE_READY_EVENT =
  'govcareer:page-ready';

const APP_PAGE_ERROR_EVENT =
  'govcareer:page-error';

/* ============================================================
 * APPLICATION STATE
 * ============================================================
 */

const appState = {
  initialized: false,
  initializing: false,
  ready: false,

  page: null,
  route: null,

  startedAt: null,
  readyAt: null,

  initializationSteps: [],

  errors: [],

  pageController:
    null
};

/* ============================================================
 * SAFE UTILITY FUNCTIONS
 * ============================================================
 */

function safeString(
  value,
  fallback = ''
) {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  const result =
    String(
      value
    ).trim();

  return result ||
    fallback;
}

function dispatchEvent(
  eventName,
  detail = {}
) {
  try {
    document.dispatchEvent(
      new CustomEvent(
        eventName,
        {
          detail
        }
      )
    );
  } catch {
    /*
     * The application must never fail because an application
     * lifecycle event could not be dispatched.
     */
  }
}

function recordStep(
  name,
  status = 'completed',
  detail = null
) {
  appState.initializationSteps.push({
    name,
    status,
    detail,
    timestamp:
      new Date().toISOString()
  });
}

/* ============================================================
 * ERROR MANAGEMENT
 * ============================================================
 */

function normalizeError(
  error
) {
  if (
    error instanceof Error
  ) {
    return error;
  }

  if (
    error &&
    typeof error === 'object' &&
    typeof error.message ===
      'string'
  ) {
    return new Error(
      error.message
    );
  }

  return new Error(
    String(
      error ||
        'Unknown application error.'
    )
  );
}

function reportError(
  error,
  context = ''
) {
  const normalized =
    normalizeError(
      error
    );

  const entry = {
    context:
      safeString(
        context,
        'Application'
      ),

    message:
      normalized.message,

    name:
      normalized.name,

    timestamp:
      new Date().toISOString()
  };

  appState.errors.push(
    entry
  );

  dispatchEvent(
    APP_ERROR_EVENT,
    {
      error:
        normalized,

      context:
        entry.context
    }
  );

  /*
   * During production, the user should not see raw technical
   * errors. During development, console logging is useful.
   */
  const environment =
    config?.app?.environment ||
    'production';

  if (
    environment !==
    'production'
  ) {
    console.error(
      '[GovCareer Compass]',
      entry.context,
      normalized
    );
  }

  return entry;
}

/* ============================================================
 * PAGE IDENTIFICATION
 * ============================================================
 */

function getPageName() {
  /*
   * Preferred mechanism:
   *
   * <body data-page="jobs">
   */
  const bodyPage =
    safeString(
      document.body?.dataset?.page
    );

  if (
    bodyPage
  ) {
    return bodyPage;
  }

  /*
   * Fallback:
   * determine page from the current HTML filename.
   */
  const pathname =
    window.location.pathname ||
    '';

  const filename =
    pathname
      .split('/')
      .filter(Boolean)
      .pop() ||
    '';

  if (
    !filename ||
    filename.toLowerCase() ===
      'index.html'
  ) {
    return 'home';
  }

  return filename
    .replace(
      /\.html$/i,
      ''
    )
    .replace(
      /^index$/i,
      'home'
    );
}

function getCurrentRoute() {
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

/* ============================================================
 * DOCUMENT / APPLICATION METADATA
 * ============================================================
 */

function initializeApplicationMetadata() {
  const appConfig =
    config?.app || {};

  const version =
    safeString(
      appConfig.version,
      '0.1.0'
    );

  const baseline =
    safeString(
      appConfig.researchBaseline,
      '31 August 2026'
    );

  const defaultLanguage =
    safeString(
      appConfig.defaultLanguage,
      'en'
    );

  document.documentElement.dataset.app =
    'govcareer-compass';

  document.documentElement.dataset.appVersion =
    version;

  document.documentElement.dataset.researchBaseline =
    baseline;

  /*
   * Language manager will establish the final active language.
   * This is only the initial document language.
   */
  if (
    !document.documentElement.lang
  ) {
    document.documentElement.lang =
      defaultLanguage;
  }

  /*
   * Expose basic application metadata to the document.
   */
  document.body?.setAttribute(
    'data-app-ready',
    'false'
  );

  recordStep(
    'application-metadata'
  );
}

/* ============================================================
 * ACCESSIBILITY INITIALIZATION
 * ============================================================
 */

function initializeAccessibility() {
  /*
   * Keep the user's viewport from jumping unexpectedly when
   * clicking navigation links with hashes.
   */
  document.documentElement.style.scrollBehavior =
    document.documentElement
      .dataset
      .reducedMotion ===
    'true'
      ? 'auto'
      : '';

  /*
   * Respect operating-system reduced-motion preferences.
   */
  if (
    typeof window.matchMedia ===
    'function'
  ) {
    const mediaQuery =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );

    const applyReducedMotion =
      () => {
        document.documentElement.dataset.reducedMotion =
          String(
            mediaQuery.matches
          );
      };

    applyReducedMotion();

    if (
      typeof mediaQuery.addEventListener ===
      'function'
    ) {
      mediaQuery.addEventListener(
        'change',
        applyReducedMotion
      );
    } else if (
      typeof mediaQuery.addListener ===
      'function'
    ) {
      mediaQuery.addListener(
        applyReducedMotion
      );
    }
  }

  /*
   * Escape is broadcast globally.
   *
   * Modal, drawer and other UI systems can react independently.
   */
  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key ===
        'Escape'
      ) {
        dispatchEvent(
          'govcareer:escape'
        );
      }
    }
  );

  recordStep(
    'accessibility'
  );
}

/* ============================================================
 * GLOBAL ERROR BOUNDARIES
 * ============================================================
 */

function initializeGlobalErrorHandling() {
  window.addEventListener(
    'error',
    (event) => {
      /*
       * Ignore errors that have already been handled by the
       * application's explicit error management.
       */
      if (
        event.error
      ) {
        reportError(
          event.error,
          'Unhandled browser error'
        );
      }
    }
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      reportError(
        event.reason,
        'Unhandled promise rejection'
      );
    }
  );

  recordStep(
    'global-error-handling'
  );
}

/* ============================================================
 * PAGE CONTROLLER MAP
 * ============================================================
 *
 * The site deliberately remains multi-page.
 *
 * Each HTML page has its own page controller.
 * Only the controller for the current page is loaded.
 */

const PAGE_CONTROLLER_MAP =
  Object.freeze({
    home:
      './pages/home.js',

    'career-finder':
      './pages/career-finder.js',

    'career-results':
      './pages/results.js',

    jobs:
      './pages/jobs.js',

    'job-details':
      './pages/job-details.js',

    exams:
      './pages/exams.js',

    'exam-details':
      './pages/exam-details.js',

    compare:
      './pages/comparison.js',

    rankings:
      './pages/rankings.js',

    salary:
      './pages/salary.js',

    eligibility:
      './pages/eligibility.js',

    family:
      './pages/family.js',

    parents:
      './pages/parents.js',

    location:
      './pages/location.js',

    housing:
      './pages/housing.js',

    preparation:
      './pages/preparation.js',

    'confusion-center':
      './pages/confusion-center.js',

    states:
      './pages/states.js',

    sources:
      './pages/sources.js',

    glossary:
      './pages/glossary.js',

    methodology:
      './pages/methodology.js'
  });

/* ============================================================
 * PAGE CONTROLLER INITIALIZATION
 * ============================================================
 */

async function initializePageController(
  pageName
) {
  const normalized =
    safeString(
      pageName
    ).toLowerCase();

  const modulePath =
    PAGE_CONTROLLER_MAP[
      normalized
    ];

  /*
   * Some pages are intentionally shell-only for now.
   *
   * Example:
   *   ai.html
   *
   * The Compass AI client integration will be wired in when
   * the server-side Vercel API endpoint is introduced.
   */
  if (
    !modulePath
  ) {
    appState.pageController =
      null;

    recordStep(
      'page-controller',
      'skipped',
      `No controller registered for "${normalized}".`
    );

    return null;
  }

  try {
    const module =
      await import(
        modulePath
      );

    /*
     * Supported controller conventions:
     *
     *   export function initialize()
     *   export function init()
     *   export default function initialize()
     *
     * This keeps future page controllers flexible.
     */
    const initializer =
      typeof module.initialize ===
      'function'
        ? module.initialize
        : typeof module.init ===
            'function'
          ? module.init
          : typeof module.default ===
              'function'
            ? module.default
            : null;

    if (
      !initializer
    ) {
      throw new Error(
        `Page controller "${normalized}" does not export initialize(), init(), or a default function.`
      );
    }

    const controllerContext = {
      page:
        normalized,

      route:
        getCurrentRoute(),

      config,

      application:
        getAppState()
    };

    const result =
      await initializer(
        controllerContext
      );

    appState.pageController =
      result ??
      null;

    dispatchEvent(
      APP_PAGE_READY_EVENT,
      {
        page:
          normalized,

        controller:
          result ??
          null
      }
    );

    recordStep(
      'page-controller'
    );

    return result;
  } catch (
    error
  ) {
    const entry =
      reportError(
        error,
        `Page controller initialization failed: ${normalized}`
      );

    dispatchEvent(
      APP_PAGE_ERROR_EVENT,
      {
        page:
          normalized,

        error:
          entry
      }
    );

    /*
     * The global shell remains usable even if an individual
     * page controller fails.
     */
    recordStep(
      'page-controller',
      'failed',
      entry.message
    );

    return null;
  }
}

/* ============================================================
 * STARTUP PIPELINE
 * ============================================================
 *
 * Order matters.
 *
 * 1. Storage
 * 2. Theme
 * 3. Language
 * 4. Router
 * 5. Accessibility
 * 6. Navigation
 * 7. Search
 * 8. Filters
 * 9. Modal
 * 10. Sharing
 * 11. Export
 * 12. Page controller
 */

async function initializeApplication() {
  if (
    appState.ready
  ) {
    return getAppState();
  }

  if (
    appState.initializing
  ) {
    return getAppState();
  }

  appState.initializing =
    true;

  appState.startedAt =
    new Date().toISOString();

  try {
    initializeApplicationMetadata();

    initializeGlobalErrorHandling();

    /*
     * Storage must be available before theme, language,
     * bookmarks, comparison and preferences are initialized.
     */
    try {
      initializeStorage();

      recordStep(
        'storage'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Storage initialization'
      );

      recordStep(
        'storage',
        'failed'
      );
    }

    /*
     * Theme comes before most visible UI initialization so the
     * user is less likely to see a flash of the wrong theme.
     */
    try {
      initializeTheme();

      recordStep(
        'theme'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Theme initialization'
      );

      recordStep(
        'theme',
        'failed'
      );
    }

    /*
     * Language may load en.json/bn.json asynchronously.
     */
    try {
      await initializeLanguage();

      recordStep(
        'language'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Language initialization'
      );

      recordStep(
        'language',
        'failed'
      );
    }

    try {
      initializeRouter();

      recordStep(
        'router'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Router initialization'
      );

      recordStep(
        'router',
        'failed'
      );
    }

    try {
      initializeAccessibility();
    } catch (
      error
    ) {
      reportError(
        error,
        'Accessibility initialization'
      );
    }

    try {
      initializeNavigation();

      recordStep(
        'navigation'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Navigation initialization'
      );

      recordStep(
        'navigation',
        'failed'
      );
    }

    try {
      initializeSearch();

      recordStep(
        'search'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Search initialization'
      );

      recordStep(
        'search',
        'failed'
      );
    }

    try {
      initializeFilters();

      recordStep(
        'filters'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Filter initialization'
      );

      recordStep(
        'filters',
        'failed'
      );
    }

    try {
      initializeModalSystem();

      recordStep(
        'modal'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Modal initialization'
      );

      recordStep(
        'modal',
        'failed'
      );
    }

    try {
      initializeSharing();

      recordStep(
        'sharing'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Sharing initialization'
      );

      recordStep(
        'sharing',
        'failed'
      );
    }

    try {
      initializeExport();

      recordStep(
        'export'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Export initialization'
      );

      recordStep(
        'export',
        'failed'
      );
    }

    /*
     * Identify the actual page only after the global shell
     * has been initialized.
     */
    appState.page =
      getPageName();

    appState.route =
      getCurrentRoute();

    document.body?.setAttribute(
      'data-page',
      appState.page
    );

    /*
     * Initialize the page-specific controller.
     */
    await initializePageController(
      appState.page
    );

    appState.initialized =
      true;

    appState.initializing =
      false;

    appState.ready =
      true;

    appState.readyAt =
      new Date().toISOString();

    document.body?.setAttribute(
      'data-app-ready',
      'true'
    );

    document.documentElement.dataset.appReady =
      'true';

    dispatchEvent(
      APP_READY_EVENT,
      {
        page:
          appState.page,

        route:
          appState.route,

        initialized:
          true,

        readyAt:
          appState.readyAt,

        errors:
          appState.errors.length
      }
    );

    return getAppState();
  } catch (
    error
  ) {
    appState.initializing =
      false;

    appState.initialized =
      true;

    appState.ready =
      false;

    document.body?.setAttribute(
      'data-app-ready',
      'error'
    );

    reportError(
      error,
      'Application bootstrap'
    );

    dispatchEvent(
      APP_ERROR_EVENT,
      {
        fatal:
          true,

        errors:
          [
            ...appState.errors
          ]
      }
    );

    return getAppState();
  }
}

/* ============================================================
 * PUBLIC STATE API
 * ============================================================
 */

function getAppState() {
  return {
    initialized:
      appState.initialized,

    initializing:
      appState.initializing,

    ready:
      appState.ready,

    page:
      appState.page,

    route:
      appState.route
        ? {
            ...appState.route
          }
        : null,

    startedAt:
      appState.startedAt,

    readyAt:
      appState.readyAt,

    initializationSteps:
      appState.initializationSteps.map(
        (step) => ({
          ...step
        })
      ),

    errors:
      appState.errors.map(
        (error) => ({
          ...error
        })
      ),

    pageController:
      appState.pageController
  };
}

function isApplicationReady() {
  return (
    appState.ready ===
    true
  );
}

function getCurrentPage() {
  return appState.page;
}

/* ============================================================
 * AUTO-BOOTSTRAP
 * ============================================================
 */

function bootstrap() {
  /*
   * Prevent duplicate bootstrap calls.
   */
  if (
    appState.ready ||
    appState.initializing
  ) {
    return;
  }

  void initializeApplication();
}

if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    bootstrap,
    {
      once: true
    }
  );
} else {
  bootstrap();
}

/* ============================================================
 * EXPORTS
 * ============================================================
 */

export {
  APP_READY_EVENT,
  APP_ERROR_EVENT,
  APP_PAGE_READY_EVENT,
  APP_PAGE_ERROR_EVENT,

  initializeApplication,
  initializePageController,

  getAppState,
  isApplicationReady,
  getCurrentPage,
  getPageName,
  getCurrentRoute,

  reportError
};

export default {
  initializeApplication,
  getAppState,
  isApplicationReady,
  getCurrentPage
};
