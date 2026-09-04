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
 *   Optional page controller
 *
 * IMPORTANT:
 *   This file coordinates systems.
 *   It does not contain government-job business rules.
 *
 * BOOTSTRAP OWNERSHIP:
 *
 *   app.js is the single canonical application startup owner.
 *
 *   init.js is a compatibility bridge only and must not create
 *   a competing startup lifecycle.
 *
 * GLOBAL AI:
 *
 *   Compass AI is initialized through the canonical shared-component
 *   layer using initializeCompassAI().
 *
 * PAGE CONTROLLERS:
 *
 *   PAGE_CONTROLLER_MAP and PAGE_CONTROLLER_CONTRACT together define
 *   the explicit application-level controller dependency surface.
 *
 *   During Batch 1, no page controllers are registered because the
 *   corresponding physical controller modules are not yet implemented.
 *
 *   Future batches may register controllers here once those modules
 *   genuinely exist in the repository.
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

/*
 * Canonical global CompassAI component.
 *
 * This is the application-shell integration point for the shared AI
 * interface. The component itself owns its internal state, rendering,
 * context orchestration, safety, response parsing and API interaction.
 */
import {
  initializeCompassAI
} from './components/ai-assistant.js';


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


/*
 * Explicit application-controller contract version.
 *
 * This is intentionally small. Its purpose is to make the declared
 * controller surface obvious to CI, documentation and future tooling.
 */
const PAGE_CONTROLLER_CONTRACT_VERSION =
  '1.0';


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
      'change',
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
 * SHARED COMPONENT INITIALIZATION
 * ============================================================
 */

function initializeSharedComponents() {
  /*
   * The order intentionally follows dependency direction:
   *
   *   shell
   *      ↓
   *   shared controls
   *      ↓
   *   data presentation
   *      ↓
   *   interaction UI
   *
   * CompassAI is initialized after the shared header has been
   * created so the canonical component can bind to shell-level
   * AI triggers without introducing a page-specific startup path.
   */

  initializeHeader();

  recordStep(
    'component-header'
  );

  initializeFooter();

  recordStep(
    'component-footer'
  );

  /*
   * Initialize the global AI component once through the canonical
   * application bootstrap.
   *
   * initializeCompassAI() is expected to be idempotent at the
   * component layer, so repeated calls cannot create a second
   * assistant instance during the same page lifecycle.
   */
  initializeCompassAI();

  recordStep(
    'component-ai-assistant'
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
 * PAGE CONTROLLER DEPENDENCY CONTRACT
 * ============================================================
 *
 * PAGE_CONTROLLER_MAP:
 *   Runtime lookup table used by the canonical bootstrap.
 *
 * PAGE_CONTROLLER_CONTRACT:
 *   Explicit dependency declaration for verification tooling,
 *   future implementation batches and architectural documentation.
 *
 * Batch 1:
 *   No page controllers are registered because the physical
 *   controller modules have not yet been implemented.
 *
 * Future batches:
 *   Controllers may be added only when their modules genuinely
 *   exist in the repository and conform to the initializer contract.
 *
 * Every registered module is expected to:
 *   1. exist at the exact declared path;
 *   2. be an ES module;
 *   3. export initialize(), init(), or a default function;
 *   4. tolerate receiving the standard controller context.
 *
 * The controller files themselves are NOT implemented here.
 * app.js only declares and orchestrates them.
 *
 * AI, About and Privacy are intentionally not included because
 * they are currently static/page-surface concerns rather than
 * registered page-controller dependencies.
 */

const PAGE_CONTROLLER_MAP =
  Object.freeze({});


/*
 * Machine-readable dependency contract.
 *
 * Keeping this alongside the map avoids maintaining a second
 * source for module paths while still making the contract explicit
 * to repository validation / CI tooling.
 *
 * With no currently implemented page controllers this array is empty.
 * Future registrations will automatically appear here from the map.
 */
const PAGE_CONTROLLER_CONTRACT =
  Object.freeze(
    Object.entries(
      PAGE_CONTROLLER_MAP
    ).map(
      (
        [
          page,
          modulePath
        ]
      ) =>
        Object.freeze({
          page,
          modulePath,
          required:
            true,
          initializerExports:
            Object.freeze([
              'initialize',
              'init',
              'default'
            ])
        })
    )
  );


/*
 * Validate the declaration itself before attempting a runtime
 * page-controller import.
 *
 * This does NOT pretend to verify filesystem existence in the browser.
 * Physical file existence remains a CI / repository-contract concern.
 *
 * An empty controller contract is valid during Batch 1.
 */
function validatePageControllerContract() {
  const errors = [];

  const seenPages =
    new Set();

  const seenModules =
    new Set();

  for (
    const entry of
      PAGE_CONTROLLER_CONTRACT
  ) {
    const page =
      safeString(
        entry?.page
      );

    const modulePath =
      safeString(
        entry?.modulePath
      );

    if (
      !page
    ) {
      errors.push(
        'A page-controller contract entry has no page name.'
      );

      continue;
    }

    if (
      !modulePath
    ) {
      errors.push(
        `Page-controller "${page}" has no module path.`
      );

      continue;
    }

    if (
      seenPages.has(
        page
      )
    ) {
      errors.push(
        `Duplicate page-controller declaration: "${page}".`
      );
    }

    if (
      seenModules.has(
        modulePath
      )
    ) {
      errors.push(
        `Duplicate page-controller module path: "${modulePath}".`
      );
    }

    seenPages.add(
      page
    );

    seenModules.add(
      modulePath
    );

    if (
      PAGE_CONTROLLER_MAP[
        page
      ] !== modulePath
    ) {
      errors.push(
        `Page-controller contract mismatch for "${page}".`
      );
    }

    if (
      entry.required !==
      true
    ) {
      errors.push(
        `Page-controller "${page}" must be marked required.`
      );
    }

    if (
      !Array.isArray(
        entry.initializerExports
      ) ||
      entry.initializerExports.length ===
        0
    ) {
      errors.push(
        `Page-controller "${page}" has no supported initializer contract.`
      );
    }
  }

  return {
    valid:
      errors.length ===
      0,

    errors
  };
}


/* ============================================================
 * PAGE CONTROLLERS
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
   * Pages without a registered controller are valid.
   *
   * This includes the Batch-1 shell, where no page controller
   * modules have yet been implemented.
   *
   * A missing registration is therefore not treated as an error.
   * Once a controller is registered, its actual module loading
   * and initializer contract are enforced below.
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
      result ??
      null;

    dispatchAppEvent(
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
    /*
     * This is intentionally not swallowed.
     *
     * The failure is:
     * - normalized;
     * - recorded in application state;
     * - surfaced through govcareer:error;
     * - surfaced through govcareer:page-error;
     * - recorded in initializationSteps.
     *
     * The existing mature behavior is preserved: a page-controller
     * failure does not automatically create a second application
     * lifecycle or throw outside the canonical bootstrap boundary.
     */
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
     * Validate the declared controller dependency surface before
     * page-specific loading begins.
     *
     * This checks the application's declaration itself.
     * CI remains responsible for verifying physical module presence.
     *
     * An empty map is a valid Batch-1 state.
     */
    const pageControllerContract =
      validatePageControllerContract();

    if (
      !pageControllerContract.valid
    ) {
      const contractError =
        new Error(
          `Invalid page-controller dependency contract: ${pageControllerContract.errors.join(
            ' '
          )}`
        );

      reportError(
        contractError,
        'Page controller contract'
      );

      recordStep(
        'page-controller-contract',
        'failed',
        pageControllerContract.errors
      );
    } else {
      recordStep(
        'page-controller-contract'
      );
    }

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
     *
     * The canonical CompassAI component is initialized inside this
     * shared layer rather than through a page-specific controller.
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

    document.documentElement
      .dataset
      .appReady =
      'error';

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
      once:
        true
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

  PAGE_CONTROLLER_CONTRACT_VERSION,
  PAGE_CONTROLLER_MAP,
  PAGE_CONTROLLER_CONTRACT,

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
