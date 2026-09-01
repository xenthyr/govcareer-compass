/**
 * GovCareer Compass
 * ============================================================
 * Application Bootstrap
 * ============================================================
 *
 * Responsible for:
 * - bootstrapping shared application state;
 * - initializing theme/language/navigation;
 * - exposing application events;
 * - identifying the active page;
 * - initializing page controllers when present;
 * - graceful error handling.
 *
 * This file is deliberately orchestration-only.
 * Business logic belongs in dedicated modules.
 */

import config from './config.js';
import {
  initializeTheme
} from './theme.js';

import {
  initializeLanguage
} from './language.js';

import {
  initializeNavigation
} from './navigation.js';

import {
  initializeStorage
} from './storage.js';

const APP_READY_EVENT =
  'govcareer:ready';

const APP_ERROR_EVENT =
  'govcareer:error';

let appState = {
  initialized: false,
  ready: false,
  page: null,
  route: null,
  errors: []
};

function getPageName() {
  const bodyPage =
    document.body?.dataset?.page;

  if (
    bodyPage &&
    bodyPage.trim()
  ) {
    return bodyPage.trim();
  }

  const pathname =
    window.location.pathname;

  const filename =
    pathname
      .split('/')
      .pop();

  if (
    !filename ||
    filename === 'index.html'
  ) {
    return 'home';
  }

  return filename
    .replace(
      /\.html$/i,
      ''
    );
}

function getCurrentPath() {
  return window.location.pathname;
}

function emit(
  eventName,
  detail = {}
) {
  document.dispatchEvent(
    new CustomEvent(
      eventName,
      {
        detail
      }
    )
  );
}

function reportError(
  error,
  context = ''
) {
  const normalized =
    error instanceof Error
      ? error
      : new Error(
          String(error)
        );

  appState.errors.push({
    context,
    message:
      normalized.message,
    timestamp:
      new Date().toISOString()
  });

  emit(
    APP_ERROR_EVENT,
    {
      error:
        normalized,
      context
    }
  );

  /*
   * Do not expose technical errors directly to users.
   * Detailed errors remain available in development console.
   */
  if (
    config.app?.environment !==
    'production'
  ) {
    console.error(
      `[GovCareer Compass] ${context}`,
      normalized
    );
  }
}

function initializeBaseMetadata() {
  document.documentElement.dataset.app =
    'govcareer-compass';

  document.documentElement.dataset.appVersion =
    config.app.version;

  document.documentElement.dataset.researchBaseline =
    config.app.researchBaseline;

  document.documentElement.lang =
    config.app.defaultLanguage;
}

function initializeAccessibility() {
  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key ===
        'Escape'
      ) {
        document.dispatchEvent(
          new CustomEvent(
            'govcareer:escape'
          )
        );
      }
    }
  );

  /*
   * Allow the UI to react to reduced-motion preferences.
   */
  const mediaQuery =
    window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    );

  if (
    mediaQuery
  ) {
    document.documentElement.dataset.reducedMotion =
      String(
        mediaQuery.matches
      );

    const listener =
      (event) => {
        document.documentElement.dataset.reducedMotion =
          String(
            event.matches
          );
      };

    if (
      typeof mediaQuery.addEventListener ===
      'function'
    ) {
      mediaQuery.addEventListener(
        'change',
        listener
      );
    } else if (
      typeof mediaQuery.addListener ===
      'function'
    ) {
      mediaQuery.addListener(
        listener
      );
    }
  }
}

function resolvePageControllerName(
  pageName
) {
  const normalized =
    String(
      pageName || ''
    )
      .trim()
      .toLowerCase();

  const map = {
    home:
      'home',

    'career-finder':
      'careerFinder',

    'career-results':
      'results',

    jobs:
      'jobs',

    'job-details':
      'jobDetails',

    exams:
      'exams',

    'exam-details':
      'examDetails',

    compare:
      'comparison',

    rankings:
      'rankings',

    salary:
      'salary',

    eligibility:
      'eligibility',

    family:
      'family',

    parents:
      'parents',

    location:
      'location',

    housing:
      'housing',

    preparation:
      'preparation',

    'confusion-center':
      'confusionCenter',

    states:
      'states',

    ai:
      'ai',

    sources:
      'sources',

    glossary:
      'glossary',

    methodology:
      'methodology'
  };

  return (
    map[
      normalized
    ] ||
    normalized
  );
}

/**
 * Page controllers are intentionally dynamically loaded.
 *
 * This keeps the initial application shell lightweight and
 * prevents unrelated page code from being evaluated on every page.
 */
async function initializePageController(
  pageName
) {
  const controllerName =
    resolvePageControllerName(
      pageName
    );

  const modulePathMap = {
    home:
      './pages/home.js',

    careerFinder:
      './pages/career-finder.js',

    results:
      './pages/results.js',

    jobs:
      './pages/jobs.js',

    jobDetails:
      './pages/job-details.js',

    exams:
      './pages/exams.js',

    examDetails:
      './pages/exam-details.js',

    comparison:
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

    confusionCenter:
      './pages/confusion-center.js',

    states:
      './pages/states.js',

    ai:
      null,

    sources:
      './pages/sources.js',

    glossary:
      './pages/glossary.js',

    methodology:
      './pages/methodology.js'
  };

  const modulePath =
    modulePathMap[
      controllerName
    ];

  if (
    !modulePath
  ) {
    return null;
  }

  try {
    const module =
      await import(
        modulePath
      );

    const initialize =
      module.initialize ||
      module.init ||
      module.default;

    if (
      typeof initialize ===
      'function'
    ) {
      return await initialize({
        config,
        page:
          pageName,
        controller:
          controllerName
      });
    }

    return null;
  } catch (
    error
  ) {
    /*
     * An unavailable page controller should not destroy the
     * global application shell.
     */
    reportError(
      error,
      `Page controller initialization failed for "${controllerName}".`
    );

    return null;
  }
}

async function initApp() {
  if (
    appState.initialized
  ) {
    return appState;
  }

  appState.initialized =
    true;

  try {
    initializeBaseMetadata();

    initializeStorage();

    initializeTheme();

    initializeLanguage();

    initializeNavigation();

    initializeAccessibility();

    appState.page =
      getPageName();

    appState.route =
      getCurrentPath();

    await initializePageController(
      appState.page
    );

    appState.ready =
      true;

    emit(
      APP_READY_EVENT,
      {
        ...appState
      }
    );
  } catch (
    error
  ) {
    reportError(
      error,
      'Application initialization failed.'
    );
  }

  return {
    ...appState
  };
}

function getAppState() {
  return {
    ...appState,
    errors: [
      ...appState.errors
    ]
  };
}

function isReady() {
  return (
    appState.ready ===
    true
  );
}

if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      void initApp();
    },
    {
      once: true
    }
  );
} else {
  void initApp();
}

export {
  initApp,
  getAppState,
  isReady,
  APP_READY_EVENT,
  APP_ERROR_EVENT
};

export default {
  initApp,
  getAppState,
  isReady
};
