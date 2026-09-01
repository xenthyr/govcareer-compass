/**
 * GovCareer Compass
 * ============================================================
 * Global Header Component
 * ============================================================
 *
 * Purpose
 * -------
 * Renders the permanent site header used throughout the
 * application.
 *
 * Design goals
 * ------------
 * - premium glassmorphic appearance;
 * - consistent branding;
 * - responsive desktop/tablet/mobile behavior;
 * - global search access;
 * - Compass AI access;
 * - language access;
 * - theme access;
 * - mobile drawer access;
 * - accessible keyboard/focus behavior;
 *
 * The actual visual styling belongs to the CSS system.
 * This component supplies semantic structure, state hooks and
 * data attributes for the CSS and other JavaScript modules.
 */

import {
  getRoute
} from '../config.js';

const DEFAULT_BRAND_NAME =
  'GovCareer Compass';

const DEFAULT_AI_NAME =
  'Compass AI';

const HEADER_SELECTOR =
  '[data-component="header"]';

function escapeHtml(value) {
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
    return getRoute(
      name
    );
  } catch {
    return fallback;
  }
}

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
          aria-label="${escapeHtml(
            brandName
          )} — Home"
        >
          <span
            class="site-brand__mark"
            aria-hidden="true"
          >
            <span class="site-brand__mark-inner">
              GC
            </span>
          </span>

          <span class="site-brand__text">
            <span class="site-brand__name">
              ${escapeHtml(
                brandName
              )}
            </span>

            <span class="site-brand__tagline">
              Government Career Intelligence
            </span>
          </span>
        </a>

        <nav
          class="site-navigation"
          data-header-navigation
          aria-label="Primary navigation"
        >
          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.careerFinder
            )}"
            data-route="careerFinder"
          >
            Career Finder
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.jobs
            )}"
            data-route="jobs"
          >
            Jobs
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.exams
            )}"
            data-route="exams"
          >
            Exams
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.rankings
            )}"
            data-route="rankings"
          >
            Rankings
          </a>

          <a
            class="site-navigation__link"
            href="${escapeHtml(
              routes.compare
            )}"
            data-route="compare"
          >
            Compare
          </a>
        </nav>

        <div
          class="site-header__actions"
          aria-label="Site tools"
        >

          <button
            type="button"
            class="icon-button"
            data-header-search-trigger
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

          <a
            class="header-ai-button"
            href="${escapeHtml(
              routes.ai
            )}"
            data-route="ai"
            data-ai-trigger
            aria-label="${escapeHtml(
              aiName
            )}"
          >
            <span
              class="header-ai-button__icon"
              aria-hidden="true"
            >
              ✦
            </span>

            <span
              class="header-ai-button__label"
            >
              ${escapeHtml(
                aiName
              )}
            </span>
          </a>

          <div
            class="header-control"
            data-header-language
          ></div>

          <div
            class="header-control"
            data-header-theme
          ></div>

          <button
            type="button"
            class="icon-button mobile-menu-button"
            data-drawer-open="global-navigation-drawer"
            aria-label="Open navigation menu"
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
              <path d="M4 6h16"></path>
              <path d="M4 12h16"></path>
              <path d="M4 18h16"></path>
            </svg>
          </button>

        </div>

      </div>

      <div
        class="site-header__search"
        data-header-search-panel
        hidden
      >
        <div
          class="site-header__search-inner"
        >
          <div
            data-header-search-mount
          ></div>
        </div>
      </div>

    </header>
  `;
}

function ensureHeaderMount() {
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
   * Insert as the first child of body so the global header
   * appears before page content.
   */
  document.body.prepend(
    mount
  );

  return mount;
}

function renderHeader(
  options = {}
) {
  const mount =
    ensureHeaderMount();

  mount.innerHTML =
    createHeaderMarkup(
      options
    );

  bindHeaderInteractions(
    mount
  );

  return mount;
}

function toggleSearch(
  mount,
  force
) {
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
    shouldOpen
  ) {
    const searchInput =
      panel.querySelector(
        '[data-search-input]'
      );

    searchInput?.focus();
  }

  return shouldOpen;
}

function bindHeaderInteractions(
  mount
) {
  const searchTrigger =
    mount.querySelector(
      '[data-header-search-trigger]'
    );

  searchTrigger?.addEventListener(
    'click',
    () => {
      toggleSearch(
        mount
      );
    }
  );

  document.addEventListener(
    'govcareer:escape',
    () => {
      toggleSearch(
        mount,
        false
      );
    }
  );

  document.addEventListener(
    'click',
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
          false
        );
      }
    }
  );

  document.addEventListener(
    'govcareer:languagechange',
    () => {
      /*
       * Translation-aware page controllers may rerender the
       * localized header. The event is intentionally exposed
       * rather than forcing a destructive rerender here.
       */
    }
  );
}

function updateHeaderActiveRoute(
  pathname =
    window.location.pathname
) {
  const mount =
    document.querySelector(
      HEADER_SELECTOR
    );

  if (
    !mount
  ) {
    return;
  }

  mount
    .querySelectorAll(
      '[data-route]'
    )
    .forEach(
      (link) => {
        const href =
          link.getAttribute(
            'href'
          );

        if (
          !href
        ) {
          return;
        }

        let linkPath;

        try {
          linkPath =
            new URL(
              href,
              window.location.href
            ).pathname;
        } catch {
          linkPath =
            href;
        }

        const active =
          linkPath.replace(
            /\/+$/,
            ''
          ) ===
          pathname.replace(
            /\/+$/,
            ''
          );

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

function initializeHeader(
  options = {}
) {
  const mount =
    renderHeader(
      options
    );

  updateHeaderActiveRoute();

  document.addEventListener(
    'popstate',
    () => {
      updateHeaderActiveRoute();
    }
  );

  return mount;
}

export {
  createHeaderMarkup,
  renderHeader,
  initializeHeader,
  updateHeaderActiveRoute,
  toggleSearch
};

export default {
  renderHeader,
  initializeHeader
};
