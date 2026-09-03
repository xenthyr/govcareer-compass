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
 * - Mobile navigation drawer trigger
 * - Accessibility / focus behavior
 * - Active-route indication
 *
 * Architecture
 * ------------
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
 * - implement state-selection persistence.
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
 *
 * Custom events:
 *   gcc:header-ready
 *   gcc:header-search
 *   gcc:ai:open
 *   gcc:languagechange
 *
 * The header preserves the global `gcc:languagechange` ecosystem contract.
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

const HEADER_SELECTOR =
  '[data-component="header"]';

const HEADER_ROOT_ATTRIBUTE =
  'data-header-root';

const HEADER_READY_EVENT =
  'gcc:header-ready';

const HEADER_SEARCH_EVENT =
  'gcc:header-search';

const AI_OPEN_EVENT =
  'gcc:ai:open';


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
      route &&
      typeof route === 'string'
    ) {
      return route;
    }
  } catch {
    /*
     * Use the explicit fallback below.
     */
  }

  return fallback;
}


function normalizePath(
  value
) {
  return String(
    value ?? ''
  )
    .split(
      '#',
      1
    )[0]
    .split(
      '?',
      1
    )[0]
    .replace(
      /\/+$/,
      ''
    ) || '/';
}


/**
 * Resolve route-relative links against the current document.
 *
 * The helper is intentionally defensive because the application uses
 * both index.html and pages/*.html entry points.
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
 * Avoid duplicate event listeners when the header is rendered again.
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
    !target
  ) {
    return;
  }

  const cleanup =
    mount.__gccHeaderCleanup ||
    [];

  target.addEventListener(
    eventName,
    handler,
    options
  );

  cleanup.push(
    () =>
      target.removeEventListener(
        eventName,
        handler,
        options
      )
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
           * Cleanup must never interrupt header rendering.
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
      ),

    ai:
      safeRoute(
        'ai',
        './ai.html'
      )
  };
}


/* --------------------------------------------------------------------------
 * Header markup
 * -------------------------------------------------------------------------- */

/**
 * Create the permanent site-header DOM structure.
 *
 * The returned markup intentionally contains translation hooks rather than
 * hard-coded localized UI content.
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

        <a
          class="site-brand"
          href="${escapeHtml(
            routes.home
          )}"
          data-route="home"
          data-header-brand
          data-i18n-aria-label="header.homeAriaLabel"
          aria-label="${escapeHtml(
            `${brandName} — Home`
          )}"
        >
          <span
            class="site-brand__mark"
            aria-hidden="true"
          >
            <span
              class="site-brand__mark-inner"
            >
              GC
            </span>
          </span>

          <span
            class="site-brand__text"
          >
            <span
              class="site-brand__name"
              data-i18n="brand.name"
            >
              ${escapeHtml(
                brandName
              )}
            </span>

            <span
              class="site-brand__tagline"
              data-i18n="brand.tagline"
            >
              Government Career Intelligence
            </span>
          </span>
        </a>


        <nav
          class="site-navigation"
          data-header-navigation
          aria-label="Primary navigation"
          data-i18n-aria-label="header.primaryNavigation"
        >

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.careerFinder
            )}"
            data-route="careerFinder"
            data-i18n="navigation.careerFinder"
          >
            Career Finder
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.jobs
            )}"
            data-route="jobs"
            data-i18n="navigation.jobs"
          >
            Jobs
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.exams
            )}"
            data-route="exams"
            data-i18n="navigation.exams"
          >
            Exams
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.rankings
            )}"
            data-route="rankings"
            data-i18n="navigation.rankings"
          >
            Rankings
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.compare
            )}"
            data-route="compare"
            data-i18n="navigation.compare"
          >
            Compare
          </a>

        </nav>


        <div
          class="site-header__actions"
          data-header-actions
          data-i18n-aria-label="header.siteTools"
          aria-label="Site tools"
        >

          <!-- Global Search ------------------------------------------------ -->

          <button
            type="button"
            class="icon-button"
            data-header-search-trigger
            aria-expanded="false"
            aria-controls="global-header-search"
            data-i18n-aria-label="header.search"
            data-i18n-title="header.search"
            aria-label="Search government careers"
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


          <!-- Compass AI --------------------------------------------------- -->

          <button
            type="button"
            class="header-ai-button"
            data-ai-trigger
            data-header-ai-trigger
            data-i18n-aria-label="header.compassAI"
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
              data-i18n="brand.aiName"
            >
              ${escapeHtml(
                aiName
              )}
            </span>
          </button>


          <!-- State selector ---------------------------------------------- -->

          <div
            class="header-control header-control--state"
            data-header-state
            data-state-selector
          ></div>


          <!-- Language selector ------------------------------------------- -->

          <div
            class="header-control header-control--language"
            data-header-language
            data-language-selector
          ></div>


          <!-- Theme selector ---------------------------------------------- -->

          <div
            class="header-control header-control--theme"
            data-header-theme
            data-theme-selector
          ></div>


          <!-- Mobile menu ------------------------------------------------- -->

          <button
            type="button"
            class="icon-button mobile-menu-button"
            data-drawer-open="global-navigation-drawer"
            data-header-menu-trigger
            data-i18n-aria-label="header.openNavigation"
            data-i18n-title="header.openNavigation"
            aria-label="Open navigation menu"
            title="Open navigation menu"
            aria-controls="global-navigation-drawer"
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


      <!-- Header search panel -------------------------------------------- -->

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
            data-i18n="search.globalTitle"
          >
            Search GovCareer Compass
          </div>

          <div
            class="site-header__search-control"
            data-header-search-mount
          >
            <!-- search-bar.js mounts here -->
          </div>
        </div>
      </div>

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


  /*
   * The permanent application header belongs before all page content.
   */
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

function toggleSearch(
  mount,
  force,
  {
    focus = true
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


  panel.hidden =
    !shouldOpen;


  trigger?.setAttribute(
    'aria-expanded',
    String(
      shouldOpen
    )
  );


  if (
    shouldOpen &&
    focus
  ) {
    requestAnimationFrame(
      () => {
        const searchInput =
          panel.querySelector(
            '[data-search-input]'
          );

        searchInput?.focus();
      }
    );
  }


  return shouldOpen;
}


/**
 * Emit a semantic global search event in addition to revealing the search
 * panel. This gives search-bar.js/page controllers an integration point
 * without putting search implementation into the header.
 */
function emitHeaderSearchEvent(
  mount
) {
  if (
    typeof document ===
    'undefined'
  ) {
    return;
  }


  document.dispatchEvent(
    new CustomEvent(
      HEADER_SEARCH_EVENT,
      {
        detail: {
          mount,
          panel:
            mount?.querySelector(
              '[data-header-search-panel]'
            ) || null,

          input:
            mount?.querySelector(
              '[data-search-input]'
            ) || null
        }
      }
    )
  );
}


/* --------------------------------------------------------------------------
 * Compass AI
 * -------------------------------------------------------------------------- */

/**
 * Notify ai-assistant.js that the global header trigger was activated.
 *
 * The existing [data-ai-trigger] hook remains the primary integration
 * contract. The semantic event is additive and does not require the AI
 * assistant to implement another API.
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


  /*
   * The AI assistant may already be listening to [data-ai-trigger].
   * Dispatching a dedicated event gives the global shell a stable public
   * signal without assuming the assistant's internal implementation.
   */
  if (
    typeof document !==
    'undefined'
  ) {
    document.dispatchEvent(
      new CustomEvent(
        AI_OPEN_EVENT,
        {
          detail: {
            trigger,
            source:
              'global-header'
          }
        }
      )
    );
  }


  return true;
}


/**
 * Keep header AI trigger state synchronized when the AI implementation
 * announces its open/closed state.
 *
 * This is intentionally event-driven and tolerant: no dependency on a
 * particular ai-assistant.js implementation is assumed.
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


  const aiTrigger =
    mount.querySelector(
      '[data-header-ai-trigger]'
    );


  const menuTrigger =
    mount.querySelector(
      '[data-header-menu-trigger]'
    );


  const globalEscapeHandler =
    () => {
      toggleSearch(
        mount,
        false,
        {
          focus:
            false
        }
      );

      updateAITriggerState(
        mount,
        false
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
              false
          }
        );
      }
    };


  const languageChangeHandler =
    () => {
      /*
       * Do not rerender the header here.
       *
       * language.js owns the translation pass. The header only refreshes
       * localized state that belongs specifically to its generated controls.
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
        event.detail?.open ??
        event.detail?.expanded;


      if (
        expanded ===
          undefined
      ) {
        return;
      }


      updateAITriggerState(
        mount,
        Boolean(
          expanded
        )
      );
    };


  const drawerStateHandler =
    (
      event
    ) => {
      const drawerId =
        event.detail?.id ??
        event.detail?.drawerId;


      if (
        drawerId &&
        drawerId !==
          'global-navigation-drawer'
      ) {
        return;
      }


      const expanded =
        event.detail?.open ??
        event.detail?.expanded;


      if (
        expanded ===
          undefined
      ) {
        return;
      }


      updateMenuTriggerState(
        mount,
        Boolean(
          expanded
        )
      );
    };


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


  addManagedListener(
    mount,
    aiTrigger,
    'click',
    () => {
      triggerCompassAI(
        mount
      );
    }
  );


  /*
   * Do not directly operate the global drawer here.
   *
   * data-drawer-open is already the stable contract consumed by drawer.js.
   */
  addManagedListener(
    mount,
    menuTrigger,
    'click',
    () => {
      /*
       * The drawer module will update aria-expanded through its own lifecycle
       * event when available. Setting true here provides immediate keyboard
       * feedback without taking drawer ownership.
       */
      menuTrigger?.setAttribute(
        'aria-expanded',
        'true'
      );
    }
  );


  addManagedListener(
    mount,
    document,
    'govcareer:escape',
    globalEscapeHandler
  );


  addManagedListener(
    mount,
    document,
    'click',
    outsideClickHandler
  );


  /*
   * Required project-wide language event.
   *
   * Keep this listener even though language.js performs the actual DOM
   * translation pass. It preserves the header's ability to synchronize
   * component-local accessibility state.
   */
  addManagedListener(
    mount,
    document,
    'gcc:languagechange',
    languageChangeHandler
  );


  /*
   * Retain compatibility with the earlier application event namespace.
   */
  addManagedListener(
    mount,
    document,
    'govcareer:languagechange',
    languageChangeHandler
  );


  /*
   * Optional AI lifecycle hooks.
   */
  addManagedListener(
    mount,
    document,
    'gcc:ai:statechange',
    aiStateHandler
  );


  addManagedListener(
    mount,
    document,
    'gcc:ai:open',
    () => {
      /*
       * An external caller opened Compass AI. Mark the global trigger active.
       */
      updateAITriggerState(
        mount,
        true
      );
    }
  );


  /*
   * Optional drawer lifecycle hook.
   */
  addManagedListener(
    mount,
    document,
    'gcc:drawerstatechange',
    drawerStateHandler
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
      DEFAULT_BRAND_NAME +
        ' — Home'
    );
  }


  const aiTrigger =
    mount.querySelector(
      '[data-header-ai-trigger]'
    );


  if (
    aiTrigger &&
    !aiTrigger.getAttribute(
      'aria-controls'
    )
  ) {
    aiTrigger.setAttribute(
      'aria-controls',
      'compass-ai-panel'
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


        /*
         * The AI route is a global feature trigger and should not normally
         * receive active-navigation styling because it is a button.
         */
        if (
          !link.matches(
            'a'
          )
        ) {
          return;
        }


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
 * Notify selector components that their header hosts now exist.
 *
 * This does not call undocumented functions from those components.
 * Their existing initialization system can consume the event safely.
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
 * Initialize the global header once per document.
 *
 * Repeated calls return the existing header instead of creating duplicate
 * shell instances.
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
    existing &&
    initialized
  ) {
    updateHeaderActiveRoute();

    return existing;
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
   * Client-side route changes.
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
   * History-driven SPA navigation may not trigger popstate when another
   * router calls pushState/replaceState, so expose an application-level route
   * hook without taking router ownership.
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
    initializedMount
  ) {
    return initializedMount;
  }


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
        false
    }
  );
}


/**
 * Programmatically trigger Compass AI.
 *
 * This emits the same public event used by the header trigger and keeps the
 * internal AI implementation outside the header's responsibility boundary.
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

  HEADER_SELECTOR,
  HEADER_READY_EVENT,
  HEADER_SEARCH_EVENT,
  AI_OPEN_EVENT,

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
