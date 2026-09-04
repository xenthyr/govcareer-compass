/**
 * GovCareer Compass
 * ============================================================
 * Global Header Component
 * ============================================================
 *
 * Purpose
 * -------
 * Renders the permanent application shell header used throughout
 * GovCareer Compass.
 *
 * Responsibilities
 * ----------------
 * - Branding / home navigation
 * - Global search trigger and mount
 * - Compass AI global trigger
 * - State selector mount
 * - Language selector mount
 * - Theme selector mount
 * - Responsive primary navigation
 * - Mobile navigation drawer trigger and markup
 * - Accessibility / focus behavior
 * - Active-route indication
 *
 * Architectural boundary
 * ----------------------
 * The header is intentionally presentation/shell-only.
 *
 * It does NOT:
 * - perform eligibility logic;
 * - calculate career scores;
 * - inspect jobs;
 * - implement recommendation logic;
 * - implement search ranking;
 * - implement AI responses;
 * - implement language dictionaries;
 * - implement theme persistence;
 * - implement state-selection persistence;
 * - implement drawer behavior.
 *
 * Those responsibilities belong to their respective modules.
 *
 * Stable integration hooks
 * ------------------------
 * Search:
 *   [data-header-search-trigger]
 *   [data-header-search-panel]
 *   [data-header-search-mount]
 *   [data-search-input]
 *
 * Compass AI:
 *   [data-ai-trigger]
 *   [data-header-ai-trigger]
 *   [data-ai-trigger-label]
 *
 * State:
 *   [data-header-state]
 *   [data-state-selector]
 *
 * Language:
 *   [data-header-language]
 *   [data-language-selector]
 *
 * Theme:
 *   [data-header-theme]
 *   [data-theme-selector]
 *
 * Navigation:
 *   [data-header-navigation]
 *   [data-drawer-open]
 *   [data-header-menu-trigger]
 *
 * Drawer:
 *   [data-drawer]
 *   [data-drawer-close]
 *
 * Custom events consumed/emitted by this shell:
 *   gcc:header-ready
 *   gcc:header-search
 *   gcc:languagechange
 *   govcareer:languagechange
 *   gcc:ai:open
 *   gcc:ai:close
 *   gcc:ai:statechange
 *   govcareer:draweropen
 *   govcareer:drawerclose
 *
 * Important integration rule
 * --------------------------
 * The header does not implement AI or drawer behavior itself.
 *
 * The AI component owns opening/closing Compass AI through the stable
 * [data-ai-trigger] / [data-header-ai-trigger] contract.
 *
 * The drawer component owns the [data-drawer-open] contract, focus trap,
 * backdrop handling, Escape handling, and drawer lifecycle.
 */


/* --------------------------------------------------------------------------
 * Dependencies
 * -------------------------------------------------------------------------- */

import {
  getRoute
} from '../config.js';


/* --------------------------------------------------------------------------
 * Constants
 * -------------------------------------------------------------------------- */

const DEFAULT_BRAND_NAME =
  'GovCareer Compass';

const DEFAULT_AI_NAME =
  'Compass AI';

const FULL_LOGO_PATH =
  '../assets/logos/govcareer-compass-logo.svg';

const DARK_LOGO_PATH =
  '../assets/logos/govcareer-compass-logo-dark.svg';

const MARK_PATH =
  '../assets/logos/govcareer-compass-mark.svg';

const DARK_MARK_PATH =
  '../assets/logos/govcareer-compass-mark-dark.svg';

const HEADER_SELECTOR =
  '[data-component="header"]';

const HEADER_READY_EVENT =
  'gcc:header-ready';

const HEADER_SEARCH_EVENT =
  'gcc:header-search';

const AI_OPEN_EVENT =
  'gcc:ai:open';

const AI_CLOSE_EVENT =
  'gcc:ai:close';

const AI_STATE_EVENT =
  'gcc:ai:statechange';

const DRAWER_OPEN_EVENT =
  'govcareer:draweropen';

const DRAWER_CLOSE_EVENT =
  'govcareer:drawerclose';

const GLOBAL_NAVIGATION_DRAWER_ID =
  'global-navigation-drawer';


/* --------------------------------------------------------------------------
 * Generic helpers
 * -------------------------------------------------------------------------- */

function escapeHtml(
  value
) {
  return String(
    value ?? ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}


function safeRoute(
  name,
  fallback
) {
  try {
    const route =
      getRoute(
        name
      );

    if (
      typeof route ===
        'string' &&
      route
    ) {
      return route;
    }
  } catch {
    /*
     * Configuration failure must not prevent the shell from rendering.
     */
  }

  return fallback;
}


function normalizePath(
  value
) {
  const normalized =
    String(
      value ?? ''
    )
      .split(
        '#',
        1
      )[0]
      .split(
        '?',
        1
      )[0];

  const pathname =
    normalized
      .replace(
        /\/+$/,
        ''
      );

  return pathname || '/';
}


/**
 * Resolve route-relative links against the current document.
 *
 * This is used only for active-route comparison. The router remains the
 * owner of actual navigation behavior.
 */
function getAbsolutePath(
  href
) {
  try {
    return new URL(
      href,
      window.location.href
    ).pathname;
  } catch {
    return String(
      href ?? ''
    );
  }
}


/**
 * Add an event listener owned by this header instance.
 *
 * Every listener registered through this helper can subsequently be removed
 * by cleanupHeader().
 */
function addManagedListener(
  mount,
  target,
  eventName,
  handler,
  options
) {
  if (
    !mount ||
    !target ||
    typeof target.addEventListener !==
      'function'
  ) {
    return;
  }

  const cleanup =
    Array.isArray(
      mount.__gccHeaderCleanup
    )
      ? mount.__gccHeaderCleanup
      : [];

  target.addEventListener(
    eventName,
    handler,
    options
  );

  cleanup.push(
    () => {
      try {
        target.removeEventListener(
          eventName,
          handler,
          options
        );
      } catch {
        /*
         * Listener cleanup is non-critical.
         */
      }
    }
  );

  mount.__gccHeaderCleanup =
    cleanup;
}


/**
 * Remove listeners owned by a previous render of this header.
 */
function cleanupHeader(
  mount
) {
  if (
    !mount
  ) {
    return;
  }

  const cleanup =
    mount.__gccHeaderCleanup;

  if (
    Array.isArray(
      cleanup
    )
  ) {
    cleanup.forEach(
      (
        dispose
      ) => {
        try {
          dispose();
        } catch {
          /*
           * Cleanup must never interrupt rendering.
           */
        }
      }
    );
  }

  delete mount.__gccHeaderCleanup;
}


/* --------------------------------------------------------------------------
 * Routes
 * -------------------------------------------------------------------------- */

function getHeaderRoutes() {
  return {
    home:
      safeRoute(
        'home',
        '../index.html'
      ),

    careerFinder:
      safeRoute(
        'careerFinder',
        './career-finder.html'
      ),

    jobs:
      safeRoute(
        'jobs',
        './jobs.html'
      ),

    exams:
      safeRoute(
        'exams',
        './exams.html'
      ),

    rankings:
      safeRoute(
        'rankings',
        './rankings.html'
      ),

    compare:
      safeRoute(
        'compare',
        './compare.html'
      )
  };
}


/* --------------------------------------------------------------------------
 * Header markup
 * -------------------------------------------------------------------------- */

/**
 * Create the permanent site-header DOM structure.
 *
 * Translation hooks intentionally use the existing canonical locale
 * namespaces:
 *
 *   common.*
 *   header.*
 *
 * The header does not create a parallel translation vocabulary.
 */
function createHeaderMarkup({
  brandName =
    DEFAULT_BRAND_NAME,

  aiName =
    DEFAULT_AI_NAME
} = {}) {
  const routes =
    getHeaderRoutes();

  return `
    <header
      class="site-header"
      data-header-root
      role="banner"
    >
      <div class="site-header__inner">

        <!-- Brand -------------------------------------------------------- -->

        <a
          class="site-brand"
          href="${escapeHtml(
            routes.home
          )}"
          data-route="home"
          data-header-brand
          data-i18n-aria-label="header.home"
          aria-label="${escapeHtml(
            `${brandName} — Home`
          )}"
        >
          <!--
            Full wordmark for desktop / spacious layouts.
            The companion compact mark is retained as a responsive hook.
            Visibility/sizing remains a CSS responsibility.
          -->
          <span
            class="site-brand__logo-wrap"
            aria-hidden="true"
          >
            <img
              class="site-brand__logo site-brand__logo--full"
              src="${FULL_LOGO_PATH}"
              alt=""
              width="160"
              height="40"
              decoding="async"
              fetchpriority="high"
            >

            <img
              class="site-brand__logo site-brand__logo--full-dark"
              src="${DARK_LOGO_PATH}"
              alt=""
              width="160"
              height="40"
              decoding="async"
            >

            <img
              class="site-brand__mark site-brand__mark--compact"
              src="${MARK_PATH}"
              alt=""
              width="40"
              height="40"
              decoding="async"
            >

            <img
              class="site-brand__mark site-brand__mark--compact-dark"
              src="${DARK_MARK_PATH}"
              alt=""
              width="40"
              height="40"
              decoding="async"
            >
          </span>

          <span
            class="site-brand__text"
          >
            <span
              class="site-brand__name"
              data-i18n="common.appName"
            >
              ${escapeHtml(
                brandName
              )}
            </span>

            <span
              class="site-brand__tagline"
              data-i18n="common.tagline"
            >
              Find the government career that fits you.
            </span>
          </span>
        </a>


        <!-- Primary navigation ------------------------------------------ -->

        <nav
          class="site-navigation"
          data-header-navigation
          aria-label="Primary navigation"
          data-i18n-aria-label="header.home"
        >
          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.careerFinder
            )}"
            data-route="careerFinder"
            data-i18n="header.careerFinder"
          >
            Career Finder
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.jobs
            )}"
            data-route="jobs"
            data-i18n="header.jobs"
          >
            Jobs
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.exams
            )}"
            data-route="exams"
            data-i18n="header.exams"
          >
            Exams
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.rankings
            )}"
            data-route="rankings"
            data-i18n="header.rankings"
          >
            Rankings
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.compare
            )}"
            data-route="compare"
            data-i18n="header.compare"
          >
            Compare
          </a>
        </nav>


        <!-- Global shell actions ---------------------------------------- -->

        <div
          class="site-header__actions"
          data-header-actions
          aria-label="Site tools"
          data-i18n-aria-label="common.settings"
        >

          <!-- Global Search -->

          <button
            type="button"
            class="icon-button"
            data-header-search-trigger
            aria-expanded="false"
            aria-controls="global-header-search"
            data-i18n-aria-label="common.search"
            data-i18n-title="common.search"
            aria-label="Search"
            title="Search"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              ></circle>

              <path
                d="m20 20-3.6-3.6"
              ></path>
            </svg>
          </button>


          <!-- Compass AI ------------------------------------------------- -->

          <button
            type="button"
            class="header-ai-button"
            data-ai-trigger
            data-header-ai-trigger
            data-i18n-aria-label="header.aiAssistant"
            aria-label="${escapeHtml(
              aiName
            )}"
            aria-haspopup="dialog"
            aria-controls="compass-ai-panel"
            aria-expanded="false"
          >
            <span
              class="header-ai-button__icon"
              aria-hidden="true"
            >
              ✦
            </span>

            <span
              class="header-ai-button__label"
              data-ai-trigger-label
              data-i18n="header.aiAssistant"
            >
              ${escapeHtml(
                aiName
              )}
            </span>
          </button>


          <!-- State selector -------------------------------------------- -->

          <div
            class="header-control header-control--state"
            data-header-state
            data-state-selector
          ></div>


          <!-- Language selector ----------------------------------------- -->

          <div
            class="header-control header-control--language"
            data-header-language
            data-language-selector
          ></div>


          <!-- Theme selector -------------------------------------------- -->

          <div
            class="header-control header-control--theme"
            data-header-theme
            data-theme-selector
          ></div>


          <!-- Mobile navigation trigger ------------------------------- -->

          <button
            type="button"
            class="icon-button mobile-menu-button"
            data-drawer-open="${GLOBAL_NAVIGATION_DRAWER_ID}"
            data-header-menu-trigger
            data-i18n-aria-label="header.openMenu"
            data-i18n-title="header.openMenu"
            aria-label="Open navigation menu"
            title="Open navigation menu"
            aria-controls="${GLOBAL_NAVIGATION_DRAWER_ID}"
            aria-expanded="false"
          >
            <svg
              viewBox="0 0 24 24"
              width="21"
              height="21"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            >
              <path
                d="M4 6h16"
              ></path>

              <path
                d="M4 12h16"
              ></path>

              <path
                d="M4 18h16"
              ></path>
            </svg>
          </button>

        </div>

      </div>


      <!-- Header search panel ------------------------------------------- -->

      <div
        id="global-header-search"
        class="site-header__search"
        data-header-search-panel
        hidden
      >
        <div
          class="site-header__search-inner"
        >
          <div
            class="site-header__search-heading"
            data-i18n="common.search"
          >
            Search
          </div>

          <div
            class="site-header__search-control"
            data-header-search-mount
          >
            <!-- search-bar.js mounts here -->
          </div>
        </div>
      </div>


      <!-- Global navigation drawer -------------------------------------- -->

      <aside
        id="${GLOBAL_NAVIGATION_DRAWER_ID}"
        class="navigation-drawer"
        data-drawer
        data-drawer-backdrop-close="true"
        aria-hidden="true"
        hidden
        tabindex="-1"
      >
        <div
          class="navigation-drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          data-i18n-aria-label="header.openMenu"
        >
          <div
            class="navigation-drawer__header"
          >
            <strong
              class="navigation-drawer__title"
              data-i18n="header.openMenu"
            >
              Navigation
            </strong>

            <button
              type="button"
              class="icon-button navigation-drawer__close"
              data-drawer-close
              data-i18n-aria-label="header.closeMenu"
              data-i18n-title="header.closeMenu"
              aria-label="Close navigation menu"
              title="Close navigation menu"
            >
              ×
            </button>
          </div>

          <nav
            class="navigation-drawer__navigation"
            aria-label="Primary navigation"
            data-i18n-aria-label="header.openMenu"
          >
            <a
              class="navigation-drawer__link"
              href="${escapeHtml(
                routes.careerFinder
              )}"
              data-route="careerFinder"
              data-i18n="header.careerFinder"
            >
              Career Finder
            </a>

            <a
              class="navigation-drawer__link"
              href="${escapeHtml(
                routes.jobs
              )}"
              data-route="jobs"
              data-i18n="header.jobs"
            >
              Jobs
            </a>

            <a
              class="navigation-drawer__link"
              href="${escapeHtml(
                routes.exams
              )}"
              data-route="exams"
              data-i18n="header.exams"
            >
              Exams
            </a>

            <a
              class="navigation-drawer__link"
              href="${escapeHtml(
                routes.rankings
              )}"
              data-route="rankings"
              data-i18n="header.rankings"
            >
              Rankings
            </a>

            <a
              class="navigation-drawer__link"
              href="${escapeHtml(
                routes.compare
              )}"
              data-route="compare"
              data-i18n="header.compare"
            >
              Compare
            </a>
          </nav>
        </div>
      </aside>
    </header>
  `;
}


/* --------------------------------------------------------------------------
 * Header mount
 * -------------------------------------------------------------------------- */

function ensureHeaderMount() {
  if (
    typeof document ===
      'undefined'
  ) {
    return null;
  }

  let mount =
    document.querySelector(
      HEADER_SELECTOR
    );

  if (
    mount
  ) {
    return mount;
  }

  mount =
    document.createElement(
      'div'
    );

  mount.dataset.component =
    'header';

  if (
    document.body
  ) {
    document.body.prepend(
      mount
    );
  }

  return mount;
}


/* --------------------------------------------------------------------------
 * Search
 * -------------------------------------------------------------------------- */

function getSearchFocusTarget(
  mount
) {
  const stored =
    mount?.__gccHeaderSearchFocusTarget;

  if (
    stored &&
    stored.isConnected
  ) {
    return stored;
  }

  return mount?.querySelector(
    '[data-header-search-trigger]'
  ) || null;
}


function toggleSearch(
  mount,
  force,
  {
    focus = true,
    restoreFocus = true
  } = {}
) {
  if (
    !mount
  ) {
    return false;
  }

  const panel =
    mount.querySelector(
      '[data-header-search-panel]'
    );

  const trigger =
    mount.querySelector(
      '[data-header-search-trigger]'
    );

  if (
    !panel
  ) {
    return false;
  }

  const shouldOpen =
    typeof force ===
      'boolean'
      ? force
      : panel.hidden;

  if (
    shouldOpen ===
      !panel.hidden
  ) {
    if (
      shouldOpen &&
      focus
    ) {
      const searchInput =
        panel.querySelector(
          '[data-search-input]'
        );

      searchInput?.focus();
    }

    return shouldOpen;
  }

  if (
    shouldOpen
  ) {
    const activeElement =
      typeof document !==
        'undefined'
        ? document.activeElement
        : null;

    if (
      activeElement &&
      activeElement !==
        document.body &&
      activeElement instanceof
        HTMLElement
    ) {
      mount.__gccHeaderSearchFocusTarget =
        activeElement;
    } else {
      mount.__gccHeaderSearchFocusTarget =
        trigger || null;
    }

    panel.hidden =
      false;

    trigger?.setAttribute(
      'aria-expanded',
      'true'
    );

    if (
      focus &&
      typeof window !==
        'undefined' &&
      typeof window.requestAnimationFrame ===
        'function'
    ) {
      window.requestAnimationFrame(
        () => {
          const searchInput =
            panel.querySelector(
              '[data-search-input]'
            );

          searchInput?.focus();
        }
      );
    }

    return true;
  }

  panel.hidden =
    true;

  trigger?.setAttribute(
    'aria-expanded',
    'false'
  );

  if (
    restoreFocus
  ) {
    const target =
      getSearchFocusTarget(
        mount
      );

    target?.focus();
  }

  mount.__gccHeaderSearchFocusTarget =
    null;

  return false;
}


function emitHeaderSearchEvent(
  mount
) {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }

  const panel =
    mount?.querySelector(
      '[data-header-search-panel]'
    ) || null;

  const input =
    mount?.querySelector(
      '[data-search-input]'
    ) || null;

  document.dispatchEvent(
    new CustomEvent(
      HEADER_SEARCH_EVENT,
      {
        detail: {
          mount,
          panel,
          input
        }
      }
    )
  );
}


/* --------------------------------------------------------------------------
 * Compass AI
 * -------------------------------------------------------------------------- */

/**
 * Trigger Compass AI through its actual DOM integration contract.
 *
 * The header does not call an undocumented AI method and does not implement
 * any AI behavior. The AI assistant owns the click listener attached to the
 * stable [data-ai-trigger] hook.
 */
function triggerCompassAI(
  mount
) {
  const trigger =
    mount?.querySelector(
      '[data-header-ai-trigger]'
    );

  if (
    !trigger
  ) {
    return false;
  }

  if (
    typeof trigger.click ===
      'function'
  ) {
    trigger.click();

    return true;
  }

  return false;
}


/**
 * Keep the shell trigger synchronized with the real AI implementation.
 *
 * Only lifecycle data announced by ai-assistant.js is consumed here.
 */
function updateAITriggerState(
  mount,
  expanded
) {
  const trigger =
    mount?.querySelector(
      '[data-header-ai-trigger]'
    );

  if (
    !trigger
  ) {
    return;
  }

  trigger.setAttribute(
    'aria-expanded',
    String(
      Boolean(
        expanded
      )
    )
  );
}


function getAIEventState(
  event
) {
  const detail =
    event?.detail;

  if (
    typeof detail?.open ===
      'boolean'
  ) {
    return detail.open;
  }

  if (
    typeof detail?.expanded ===
      'boolean'
  ) {
    return detail.expanded;
  }

  return null;
}


/* --------------------------------------------------------------------------
 * Responsive navigation state
 * -------------------------------------------------------------------------- */

function updateMenuTriggerState(
  mount,
  expanded
) {
  const trigger =
    mount?.querySelector(
      '[data-header-menu-trigger]'
    );

  if (
    !trigger
  ) {
    return;
  }

  trigger.setAttribute(
    'aria-expanded',
    String(
      Boolean(
        expanded
      )
    )
  );
}


/* --------------------------------------------------------------------------
 * Header interactions
 * -------------------------------------------------------------------------- */

function bindHeaderInteractions(
  mount
) {
  if (
    !mount ||
    typeof document ===
      'undefined'
  ) {
    return;
  }

  cleanupHeader(
    mount
  );

  const searchTrigger =
    mount.querySelector(
      '[data-header-search-trigger]'
    );

  const globalEscapeHandler =
    () => {
      /*
       * Search belongs to the header, so Escape may safely close it.
       *
       * Compass AI and the drawer are deliberately not manipulated here.
       * Their respective modules consume the same project-wide Escape event
       * and own their lifecycle.
       */
      toggleSearch(
        mount,
        false,
        {
          focus:
            false,
          restoreFocus:
            true
        }
      );
    };

  const outsideClickHandler =
    (event) => {
      const target =
        event.target;

      if (
        !(target instanceof
          Node)
      ) {
        return;
      }

      if (
        !mount.contains(
          target
        )
      ) {
        toggleSearch(
          mount,
          false,
          {
            focus:
              false,
            restoreFocus:
              false
          }
        );
      }
    };

  const languageChangeHandler =
    () => {
      /*
       * language.js performs the actual translation pass.
       * The header only repairs shell-local accessibility relationships.
       */
      updateHeaderAccessibleState(
        mount
      );
    };

  const aiStateHandler =
    (
      event
    ) => {
      const expanded =
        getAIEventState(
          event
        );

      if (
        expanded ===
          null
      ) {
        return;
      }

      updateAITriggerState(
        mount,
        expanded
      );
    };

  const aiCloseHandler =
    () => {
      updateAITriggerState(
        mount,
        false
      );
    };

  const drawerOpenHandler =
    (
      event
    ) => {
      const drawer =
        event.detail?.drawer;

      if (
        drawer &&
        drawer.id &&
        drawer.id !==
          GLOBAL_NAVIGATION_DRAWER_ID
      ) {
        return;
      }

      updateMenuTriggerState(
        mount,
        true
      );
    };

  const drawerCloseHandler =
    (
      event
    ) => {
      const drawer =
        event.detail?.drawer;

      if (
        drawer &&
        drawer.id &&
        drawer.id !==
          GLOBAL_NAVIGATION_DRAWER_ID
      ) {
        return;
      }

      updateMenuTriggerState(
        mount,
        false
      );
    };


  /* Search --------------------------------------------------------------- */

  addManagedListener(
    mount,
    searchTrigger,
    'click',
    () => {
      const open =
        toggleSearch(
          mount
        );

      if (
        open
      ) {
        emitHeaderSearchEvent(
          mount
        );
      }
    }
  );


  /* Escape ---------------------------------------------------------------- */

  addManagedListener(
    mount,
    document,
    'govcareer:escape',
    globalEscapeHandler
  );


  /* Click outside --------------------------------------------------------- */

  addManagedListener(
    mount,
    document,
    'click',
    outsideClickHandler
  );


  /* Language lifecycle ---------------------------------------------------- */

  addManagedListener(
    mount,
    document,
    'gcc:languagechange',
    languageChangeHandler
  );

  addManagedListener(
    mount,
    document,
    'govcareer:languagechange',
    languageChangeHandler
  );


  /* AI lifecycle ---------------------------------------------------------- */

  addManagedListener(
    mount,
    document,
    AI_STATE_EVENT,
    aiStateHandler
  );

  addManagedListener(
    mount,
    document,
    AI_OPEN_EVENT,
    () => {
      updateAITriggerState(
        mount,
        true
      );
    }
  );

  addManagedListener(
    mount,
    document,
    AI_CLOSE_EVENT,
    aiCloseHandler
  );


  /* Drawer lifecycle ------------------------------------------------------ */

  addManagedListener(
    mount,
    document,
    DRAWER_OPEN_EVENT,
    drawerOpenHandler
  );

  addManagedListener(
    mount,
    document,
    DRAWER_CLOSE_EVENT,
    drawerCloseHandler
  );
}


/* --------------------------------------------------------------------------
 * Accessibility state
 * -------------------------------------------------------------------------- */

function updateHeaderAccessibleState(
  mount
) {
  if (
    !mount
  ) {
    return;
  }

  const brand =
    mount.querySelector(
      '[data-header-brand]'
    );

  if (
    brand &&
    !brand.getAttribute(
      'aria-label'
    )
  ) {
    brand.setAttribute(
      'aria-label',
      `${DEFAULT_BRAND_NAME} — Home`
    );
  }

  const aiTrigger =
    mount.querySelector(
      '[data-header-ai-trigger]'
    );

  if (
    aiTrigger
  ) {
    aiTrigger.setAttribute(
      'aria-controls',
      'compass-ai-panel'
    );

    if (
      !aiTrigger.hasAttribute(
        'aria-expanded'
      )
    ) {
      aiTrigger.setAttribute(
        'aria-expanded',
        'false'
      );
    }
  }

  const menuTrigger =
    mount.querySelector(
      '[data-header-menu-trigger]'
    );

  if (
    menuTrigger
  ) {
    menuTrigger.setAttribute(
      'aria-controls',
      GLOBAL_NAVIGATION_DRAWER_ID
    );

    if (
      !menuTrigger.hasAttribute(
        'aria-expanded'
      )
    ) {
      menuTrigger.setAttribute(
        'aria-expanded',
        'false'
      );
    }
  }

  const searchTrigger =
    mount.querySelector(
      '[data-header-search-trigger]'
    );

  const searchPanel =
    mount.querySelector(
      '[data-header-search-panel]'
    );

  if (
    searchTrigger &&
    searchPanel
  ) {
    searchTrigger.setAttribute(
      'aria-controls',
      searchPanel.id ||
        'global-header-search'
    );

    searchTrigger.setAttribute(
      'aria-expanded',
      String(
        !searchPanel.hidden
      )
    );
  }
}


/* --------------------------------------------------------------------------
 * Active route
 * -------------------------------------------------------------------------- */

function updateHeaderActiveRoute(
  pathname =
    typeof window !==
      'undefined'
      ? window.location.pathname
      : ''
) {
  const mount =
    typeof document !==
      'undefined'
      ? document.querySelector(
          HEADER_SELECTOR
        )
      : null;

  if (
    !mount
  ) {
    return;
  }

  const currentPath =
    normalizePath(
      pathname
    );

  mount
    .querySelectorAll(
      '[data-route]'
    )
    .forEach(
      (
        link
      ) => {
        if (
          !link.matches(
            'a'
          )
        ) {
          return;
        }

        const href =
          link.getAttribute(
            'href'
          );

        if (
          !href
        ) {
          return;
        }

        const linkPath =
          normalizePath(
            getAbsolutePath(
              href
            )
          );

        const active =
          linkPath ===
          currentPath;

        link.classList.toggle(
          'is-active',
          active
        );

        if (
          active
        ) {
          link.setAttribute(
            'aria-current',
            'page'
          );
        } else {
          link.removeAttribute(
            'aria-current'
          );
        }
      }
    );
}


/* --------------------------------------------------------------------------
 * Component host readiness
 * -------------------------------------------------------------------------- */

/**
 * Notify selector/search components that their header hosts now exist.
 *
 * This is informational only. Existing component initializers retain
 * ownership of their own mounting and event binding.
 */
function emitHeaderReady(
  mount
) {
  if (
    typeof document ===
      'undefined' ||
    !mount
  ) {
    return;
  }

  document.dispatchEvent(
    new CustomEvent(
      HEADER_READY_EVENT,
      {
        detail: {
          mount,

          searchMount:
            mount.querySelector(
              '[data-header-search-mount]'
            ),

          stateMount:
            mount.querySelector(
              '[data-header-state]'
            ),

          languageMount:
            mount.querySelector(
              '[data-header-language]'
            ),

          themeMount:
            mount.querySelector(
              '[data-header-theme]'
            ),

          aiTrigger:
            mount.querySelector(
              '[data-header-ai-trigger]'
            ),

          menuTrigger:
            mount.querySelector(
              '[data-header-menu-trigger]'
            ),

          navigationDrawer:
            mount.querySelector(
              `[data-drawer="${GLOBAL_NAVIGATION_DRAWER_ID}"], #${GLOBAL_NAVIGATION_DRAWER_ID}`
            )
        }
      }
    )
  );
}


/* --------------------------------------------------------------------------
 * Rendering
 * -------------------------------------------------------------------------- */

function renderHeader(
  options = {}
) {
  if (
    typeof document ===
      'undefined'
  ) {
    return null;
  }

  const mount =
    ensureHeaderMount();

  if (
    !mount
  ) {
    return null;
  }

  cleanupHeader(
    mount
  );

  mount.innerHTML =
    createHeaderMarkup(
      options
    );

  bindHeaderInteractions(
    mount
  );

  updateHeaderAccessibleState(
    mount
  );

  updateHeaderActiveRoute();

  emitHeaderReady(
    mount
  );

  return mount;
}


/* --------------------------------------------------------------------------
 * Initialization
 * -------------------------------------------------------------------------- */

let initialized =
  false;

let initializedMount =
  null;


/**
 * Initialize the global header once per document lifecycle.
 *
 * Repeated calls return the currently initialized header without creating
 * duplicate shell instances or listeners.
 *
 * If the DOM instance was externally removed, a fresh shell is rendered and
 * rebound safely.
 */
function initializeHeader(
  options = {}
) {
  if (
    typeof document ===
      'undefined'
  ) {
    return null;
  }

  const existing =
    document.querySelector(
      HEADER_SELECTOR
    );

  if (
    initialized &&
    initializedMount &&
    initializedMount.isConnected &&
    existing ===
      initializedMount
  ) {
    updateHeaderActiveRoute();

    updateHeaderAccessibleState(
      initializedMount
    );

    return initializedMount;
  }

  const mount =
    renderHeader(
      options
    );

  if (
    !mount
  ) {
    return null;
  }

  initialized =
    true;

  initializedMount =
    mount;

  /*
   * Client-side history changes.
   *
   * The main application is multi-page, so this is only a lightweight
   * presentation synchronization hook.
   */
  const popstateHandler =
    () => {
      updateHeaderActiveRoute();
    };

  addManagedListener(
    mount,
    window,
    'popstate',
    popstateHandler
  );

  /*
   * Optional application-level route hook.
   *
   * The header does not own router behavior; it only refreshes active state.
   */
  const routeChangeHandler =
    () => {
      updateHeaderActiveRoute();
    };

  addManagedListener(
    mount,
    document,
    'gcc:routechange',
    routeChangeHandler
  );

  return mount;
}


/* --------------------------------------------------------------------------
 * Public helpers
 * -------------------------------------------------------------------------- */

function getHeaderMount() {
  if (
    initializedMount &&
    initializedMount.isConnected
  ) {
    return initializedMount;
  }

  initializedMount =
    null;

  initialized =
    false;

  if (
    typeof document ===
      'undefined'
  ) {
    return null;
  }

  return document.querySelector(
    HEADER_SELECTOR
  );
}


/**
 * Programmatically open the global search panel.
 */
function openSearch() {
  const mount =
    getHeaderMount();

  if (
    !mount
  ) {
    return false;
  }

  const opened =
    toggleSearch(
      mount,
      true
    );

  if (
    opened
  ) {
    emitHeaderSearchEvent(
      mount
    );
  }

  return opened;
}


/**
 * Programmatically close the global search panel.
 */
function closeSearch() {
  const mount =
    getHeaderMount();

  return toggleSearch(
    mount,
    false,
    {
      focus:
        false,
      restoreFocus:
        true
    }
  );
}


/**
 * Programmatically trigger Compass AI through the same stable DOM trigger
 * used by users.
 */
function openCompassAI() {
  const mount =
    getHeaderMount();

  if (
    !mount
  ) {
    return false;
  }

  return triggerCompassAI(
    mount
  );
}


/* --------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
  DEFAULT_BRAND_NAME,
  DEFAULT_AI_NAME,

  FULL_LOGO_PATH,
  DARK_LOGO_PATH,
  MARK_PATH,
  DARK_MARK_PATH,

  HEADER_SELECTOR,
  HEADER_READY_EVENT,
  HEADER_SEARCH_EVENT,

  AI_OPEN_EVENT,
  AI_CLOSE_EVENT,
  AI_STATE_EVENT,

  DRAWER_OPEN_EVENT,
  DRAWER_CLOSE_EVENT,

  createHeaderMarkup,

  ensureHeaderMount,

  renderHeader,
  initializeHeader,

  getHeaderMount,

  toggleSearch,
  openSearch,
  closeSearch,

  triggerCompassAI,
  openCompassAI,

  updateAITriggerState,
  updateMenuTriggerState,

  updateHeaderActiveRoute,
  updateHeaderAccessibleState
};


export default {
  renderHeader,
  initializeHeader,

  openSearch,
  closeSearch,

  openCompassAI,

  updateHeaderActiveRoute
};
