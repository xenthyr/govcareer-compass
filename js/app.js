/**
 * GovCareer Compass
 * ============================================================
 * Global Application Bootstrap
 * ============================================================
 *
 * FILE:
 *   /js/app.js
 *
 * ROLE:
 *   Central bootstrap/orchestration layer.
 *
 * ARCHITECTURE:
 *
 *   Application shell
 *        ↓
 *   Core services
 *        ↓
 *   Shared UI components
 *        ↓
 *   Database/page controller
 *
 * IMPORTANT:
 *   This file coordinates systems.
 *   It does not contain government-job business rules.
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

/*
 * Shared presentation components.
 */
import {
  initializeHeader
} from './components/header.js';

import {
  initializeFooter
} from './components/footer.js';

import {
  initializeDrawers
} from './components/drawer.js';

import {
  initializeModalComponent
} from './components/modal.js';

import {
  initializeToastSystem
} from './components/toast.js';

import {
  initializeThemeSelector
} from './components/theme-selector.js';

import {
  initializeLanguageSelector
} from './components/language-selector.js';

import {
  initializeStateSelector
} from './components/state-selector.js';

import {
  initializeSearchBar
} from './components/search-bar.js';

import {
  initializeJobCardInteractions
} from './components/job-card.js';

import {
  initializeExamCardInteractions
} from './components/exam-card.js';

import {
  initializeCareerResultInteractions
} from './components/career-result.js';

import {
  initializeFilterPanels
} from './components/filter-panel.js';

import {
  initializeFilterChips
} from './components/filter-chips.js';

import {
  initializeComparisonTables
} from './components/comparison-table.js';

import {
  initializePagination
} from './components/pagination.js';

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
  initializing:
    false,

  initialized:
    false,

  ready:
    false,

  page:
    null,

  route:
    null,

  startedAt:
    null,

  readyAt:
    null,

  initializationSteps:
    [],

  errors:
    [],

  pageController:
    null
};

/* ============================================================
 * UTILITIES
 * ============================================================
 */

function safeString(
  value,
  fallback = ''
) {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return fallback;
  }

  const result =
    String(
      value
    ).trim();

  return (
    result ||
    fallback
  );
}

function dispatchAppEvent(
  name,
  detail = {}
) {
  try {
    document.dispatchEvent(
      new CustomEvent(
        name,
        {
          detail
        }
      )
    );
  } catch {
    /*
     * Lifecycle events are non-critical.
     */
  }
}

function recordStep(
  name,
  status =
    'completed',
  detail =
    null
) {
  appState.initializationSteps.push({
    name,
    status,
    detail,
    timestamp:
      new Date().toISOString()
  });
}

function normalizeError(
  error
) {
  if (
    error instanceof
    Error
  ) {
    return error;
  }

  return new Error(
    error?.message ||
      String(
        error ||
          'Unknown application error.'
      )
  );
}

function reportError(
  error,
  context
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

  dispatchAppEvent(
    APP_ERROR_EVENT,
    {
      error:
        normalized,

      context:
        entry.context
    }
  );

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
  const declaredPage =
    safeString(
      document.body
        ?.dataset
        ?.page
    );

  if (
    declaredPage
  ) {
    return declaredPage;
  }

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
 * ACCESSIBILITY FOUNDATION
 * ============================================================
 */

function initializeAccessibility() {
  if (
    typeof window.matchMedia !==
    'function'
  ) {
    return;
  }

  const mediaQuery =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

  const applyPreference =
    () => {
      document.documentElement
        .dataset
        .reducedMotion =
        String(
          mediaQuery.matches
        );
    };

  applyPreference();

  if (
    typeof mediaQuery.addEventListener ===
    'function'
  ) {
    mediaQuery.addEventListener(
      'change',
      applyPreference
    );
  } else if (
    typeof mediaQuery.addListener ===
    'function'
  ) {
    mediaQuery.addListener(
      applyPreference
    );
  }

  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key ===
        'Escape'
      ) {
        dispatchAppEvent(
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
 * GLOBAL ERROR HANDLING
 * ============================================================
 */

function initializeGlobalErrorHandling() {
  window.addEventListener(
    'error',
    (event) => {
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
 * APPLICATION METADATA
 * ============================================================
 */

function initializeMetadata() {
  const appConfig =
    config?.app ||
    {};

  document.documentElement
    .dataset
    .app =
    'govcareer-compass';

  document.documentElement
    .dataset
    .appVersion =
    safeString(
      appConfig.version,
      '0.1.0'
    );

  document.documentElement
    .dataset
    .researchBaseline =
    safeString(
      appConfig.researchBaseline,
      '31 August 2026'
    );

  document.body?.setAttribute(
    'data-app-ready',
    'false'
  );

  recordStep(
    'application-metadata'
  );
}

/* ============================================================
 * COMPONENT INITIALIZATION
 * ============================================================
 */

function initializeSharedComponents() {
  /*
   * The order intentionally follows dependency direction:
   *
   *   shell → controls → data presentation → interaction UI
   */

  initializeHeader();

  recordStep(
    'component-header'
  );

  initializeFooter();

  recordStep(
    'component-footer'
  );

  initializeDrawers();

  recordStep(
    'component-drawers'
  );

  /*
   * Core modal service first, modal component second.
   */
  initializeModalComponent();

  recordStep(
    'component-modal'
  );

  initializeToastSystem();

  recordStep(
    'component-toast'
  );

  initializeThemeSelector();

  recordStep(
    'component-theme-selector'
  );

  initializeLanguageSelector();

  recordStep(
    'component-language-selector'
  );

  initializeStateSelector();

  recordStep(
    'component-state-selector'
  );

  initializeSearchBar();

  recordStep(
    'component-search-bar'
  );

  initializeJobCardInteractions();

  recordStep(
    'component-job-cards'
  );

  initializeExamCardInteractions();

  recordStep(
    'component-exam-cards'
  );

  initializeCareerResultInteractions();

  recordStep(
    'component-career-results'
  );

  initializeFilterPanels();

  recordStep(
    'component-filter-panels'
  );

  initializeFilterChips();

  recordStep(
    'component-filter-chips'
  );

  initializeComparisonTables();

  recordStep(
    'component-comparison-tables'
  );

  initializePagination();

  recordStep(
    'component-pagination'
  );
}

/* ============================================================
 * PAGE CONTROLLERS
 * ============================================================
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
   * Pages such as AI, About and Privacy may initially be
   * static content pages without a JavaScript controller.
   */
  if (
    !modulePath
  ) {
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
        `Page controller "${normalized}" does not export a supported initializer.`
      );
    }

    const context = {
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
        context
      );

    appState.pageController =
      result ?? null;

    dispatchAppEvent(
      APP_PAGE_READY_EVENT,
      {
        page:
          normalized,

        controller:
          result ?? null
      }
    );

    recordStep(
      'page-controller'
    );

    return result;
  } catch (
    error
  ) {
    const recorded =
      reportError(
        error,
        `Page controller initialization: ${normalized}`
      );

    dispatchAppEvent(
      APP_PAGE_ERROR_EVENT,
      {
        page:
          normalized,

        error:
          recorded
      }
    );

    recordStep(
      'page-controller',
      'failed',
      recorded.message
    );

    return null;
  }
}

/* ============================================================
 * MAIN BOOTSTRAP
 * ============================================================
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
    initializeMetadata();

    initializeGlobalErrorHandling();

    /*
     * Persistent state must exist before controls that consume
     * it are initialized.
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
     * Theme should precede visible shared UI.
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

    initializeAccessibility();

    /*
     * Core application services.
     */
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
        'Filters initialization'
      );

      recordStep(
        'filters',
        'failed'
      );
    }

    try {
      initializeModalSystem();

      recordStep(
        'modal-service'
      );
    } catch (
      error
    ) {
      reportError(
        error,
        'Modal service initialization'
      );

      recordStep(
        'modal-service',
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
     * Shared component layer.
     */
    try {
      initializeSharedComponents();
    } catch (
      error
    ) {
      reportError(
        error,
        'Shared component initialization'
      );

      recordStep(
        'shared-components',
        'failed'
      );
    }

    appState.page =
      getPageName();

    appState.route =
      getCurrentRoute();

    document.body?.setAttribute(
      'data-page',
      appState.page
    );

    await initializePageController(
      appState.page
    );

    appState.initialized =
      true;

    appState.ready =
      true;

    appState.initializing =
      false;

    appState.readyAt =
      new Date().toISOString();

    document.body?.setAttribute(
      'data-app-ready',
      'true'
    );

    document.documentElement
      .dataset
      .appReady =
      'true';

    dispatchAppEvent(
      APP_READY_EVENT,
      {
        page:
          appState.page,

        route:
          appState.route,

        readyAt:
          appState.readyAt,

        errorCount:
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

    const recorded =
      reportError(
        error,
        'Fatal application bootstrap'
      );

    dispatchAppEvent(
      APP_ERROR_EVENT,
      {
        fatal:
          true,

        error:
          recorded
      }
    );

    return getAppState();
  }
}

/* ============================================================
 * PUBLIC STATE
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
        (
          item
        ) => ({
          ...item
        })
      ),

    errors:
      appState.errors.map(
        (
          item
        ) => ({
          ...item
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
 * AUTO START
 * ============================================================
 */

function bootstrap() {
  if (
    appState.initializing ||
    appState.ready
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
