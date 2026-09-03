/**
 * GovCareer Compass
 * ============================================================
 * Global Footer Component
 * ============================================================
 *
 * Purpose
 * -------
 * Creates the consistent site-wide footer used across GovCareer Compass.
 *
 * Responsibilities
 * ----------------
 * - Shared research/career navigation
 * - Trust / methodology navigation
 * - Research and decision-support disclaimer
 * - Official-source authority notice
 * - Analytical-estimate disclosures
 * - Configurable research-baseline display
 * - Accessible semantic footer structure
 * - i18n-ready markup
 *
 * The footer does NOT:
 * - calculate salary;
 * - determine eligibility;
 * - determine recruitment status;
 * - make promotion promises;
 * - guarantee government housing;
 * - contain career-specific logic.
 *
 * Stable integration hooks
 * -------------------------
 * [data-component="footer"]
 * [data-footer-root]
 * [data-route]
 * [data-research-baseline]
 *
 * User-facing copy is exposed through data-i18n hooks so the translation
 * service remains the single source of localized UI copy.
 */

import {
  getRoute
} from '../config.js';


/* --------------------------------------------------------------------------
 * Constants
 * -------------------------------------------------------------------------- */

const FOOTER_SELECTOR =
  '[data-component="footer"]';

const DEFAULT_BRAND_NAME =
  'GovCareer Compass';

const DEFAULT_RESEARCH_BASELINE =
  '';

const CURRENT_YEAR =
  new Date().getFullYear();


/* --------------------------------------------------------------------------
 * Generic helpers
 * -------------------------------------------------------------------------- */

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
      typeof route ===
        'string'
    ) {
      return route;
    }
  } catch {
    /*
     * Fall through to the explicit route fallback.
     */
  }

  return fallback;
}


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


/* --------------------------------------------------------------------------
 * Routes
 * -------------------------------------------------------------------------- */

function getFooterRoutes() {
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

    preparation:
      safeRoute(
        'preparation',
        './preparation.html'
      ),

    states:
      safeRoute(
        'states',
        './states.html'
      ),

    sources:
      safeRoute(
        'sources',
        './sources.html'
      ),

    methodology:
      safeRoute(
        'methodology',
        './methodology.html'
      ),

    glossary:
      safeRoute(
        'glossary',
        './glossary.html'
      ),

    about:
      safeRoute(
        'about',
        './about.html'
      ),

    privacy:
      safeRoute(
        'privacy',
        './privacy.html'
      )
  };
}


/* --------------------------------------------------------------------------
 * Research baseline resolution
 * -------------------------------------------------------------------------- */

/**
 * Resolve the research-baseline label without embedding a fixed date into
 * the footer component.
 *
 * Priority:
 * 1. Explicit render option.
 * 2. <html data-research-baseline="...">.
 * 3. <html data-research-baseline-key="..."> is intentionally NOT translated
 *    here because the footer is a structural component; data should provide
 *    the final display label when available.
 * 4. Empty value.
 *
 * The footer therefore never falsely reports a hard-coded "current" research
 * date.
 */
function resolveResearchBaseline(
  explicitBaseline
) {
  const normalizedExplicit =
    String(
      explicitBaseline ??
        ''
    ).trim();


  if (
    normalizedExplicit
  ) {
    return normalizedExplicit;
  }


  if (
    typeof document ===
      'undefined'
  ) {
    return DEFAULT_RESEARCH_BASELINE;
  }


  const configured =
    document.documentElement
      ?.dataset
      ?.researchBaseline;


  return String(
    configured ??
      DEFAULT_RESEARCH_BASELINE
  ).trim();
}


/* --------------------------------------------------------------------------
 * Footer markup
 * -------------------------------------------------------------------------- */

/**
 * Create the shared footer.
 *
 * The component deliberately uses i18n keys instead of embedding localized
 * copy in JavaScript. English defaults remain as accessible initial content
 * so the footer remains readable before the i18n service completes its first
 * translation pass.
 */
function createFooterMarkup({
  brandName =
    DEFAULT_BRAND_NAME,

  researchBaseline =
    DEFAULT_RESEARCH_BASELINE
} = {}) {
  const routes =
    getFooterRoutes();


  const baseline =
    resolveResearchBaseline(
      researchBaseline
    );


  return `
    <footer
      class="site-footer"
      data-footer-root
      role="contentinfo"
    >

      <div
        class="site-footer__inner"
      >

        <!-- Brand / identity --------------------------------------------- -->

        <div
          class="site-footer__brand"
        >
          <a
            href="${escapeHtml(
              routes.home
            )}"
            class="site-footer__brand-link"
            data-route="home"
            data-i18n="brand.name"
            aria-label="${escapeHtml(
              brandName
            )}"
          >
            ${escapeHtml(
              brandName
            )}
          </a>

          <p
            class="site-footer__description"
            data-i18n="footer.description"
          >
            A research and decision-support platform
            for understanding, comparing and exploring
            government career opportunities.
          </p>
        </div>


        <!-- Navigation --------------------------------------------------- -->

        <div
          class="site-footer__links"
        >

          <!-- Career exploration ---------------------------------------- -->

          <section
            class="site-footer__group"
            aria-labelledby="footer-careers-title"
          >
            <h2
              id="footer-careers-title"
              class="site-footer__title"
              data-i18n="footer.sections.careers"
            >
              Careers
            </h2>

            <a
              href="${escapeHtml(
                routes.careerFinder
              )}"
              data-route="careerFinder"
              data-i18n="navigation.careerFinder"
            >
              Career Finder
            </a>

            <a
              href="${escapeHtml(
                routes.jobs
              )}"
              data-route="jobs"
              data-i18n="navigation.jobs"
            >
              Jobs
            </a>

            <a
              href="${escapeHtml(
                routes.exams
              )}"
              data-route="exams"
              data-i18n="navigation.exams"
            >
              Exams
            </a>

            <a
              href="${escapeHtml(
                routes.rankings
              )}"
              data-route="rankings"
              data-i18n="navigation.rankings"
            >
              Rankings
            </a>

            <a
              href="${escapeHtml(
                routes.compare
              )}"
              data-route="compare"
              data-i18n="navigation.compare"
            >
              Compare
            </a>

            <a
              href="${escapeHtml(
                routes.preparation
              )}"
              data-route="preparation"
              data-i18n="navigation.preparation"
            >
              Preparation
            </a>
          </section>


          <!-- Research --------------------------------------------------- -->

          <section
            class="site-footer__group"
            aria-labelledby="footer-research-title"
          >
            <h2
              id="footer-research-title"
              class="site-footer__title"
              data-i18n="footer.sections.research"
            >
              Research
            </h2>

            <a
              href="${escapeHtml(
                routes.sources
              )}"
              data-route="sources"
              data-i18n="navigation.sources"
            >
              Sources
            </a>

            <a
              href="${escapeHtml(
                routes.methodology
              )}"
              data-route="methodology"
              data-i18n="navigation.methodology"
            >
              Methodology
            </a>

            <a
              href="${escapeHtml(
                routes.glossary
              )}"
              data-route="glossary"
              data-i18n="navigation.glossary"
            >
              Glossary
            </a>

            <a
              href="${escapeHtml(
                routes.states
              )}"
              data-route="states"
              data-i18n="navigation.states"
            >
              States
            </a>
          </section>


          <!-- About / trust --------------------------------------------- -->

          <section
            class="site-footer__group"
            aria-labelledby="footer-about-title"
          >
            <h2
              id="footer-about-title"
              class="site-footer__title"
              data-i18n="footer.sections.about"
            >
              About
            </h2>

            <a
              href="${escapeHtml(
                routes.about
              )}"
              data-route="about"
              data-i18n="navigation.about"
            >
              About GovCareer Compass
            </a>

            <a
              href="${escapeHtml(
                routes.privacy
              )}"
              data-route="privacy"
              data-i18n="navigation.privacy"
            >
              Privacy
            </a>
          </section>

        </div>
      </div>


      <!-- Trust / research disclosures ---------------------------------- -->

      <div
        class="site-footer__disclosures"
      >

        <section
          class="site-footer__disclosure"
          aria-labelledby="footer-disclaimer-title"
        >
          <h2
            id="footer-disclaimer-title"
            class="site-footer__disclosure-title"
            data-i18n="footer.disclaimer.title"
          >
            Research and decision-support notice
          </h2>

          <p
            class="site-footer__disclosure-text"
            data-i18n="footer.disclaimer.body"
          >
            GovCareer Compass is a research and
            decision-support platform, not an official
            recruitment portal.
          </p>
        </section>


        <section
          class="site-footer__disclosure"
          aria-labelledby="footer-authority-title"
        >
          <h2
            id="footer-authority-title"
            class="site-footer__disclosure-title"
            data-i18n="footer.authority.title"
          >
            Official documents control
          </h2>

          <p
            class="site-footer__disclosure-text"
            data-i18n="footer.authority.body"
          >
            Official recruitment notifications, service
            rules, government orders and other authoritative
            documents control actual eligibility, recruitment
            status, pay and service conditions.
          </p>
        </section>


        <section
          class="site-footer__disclosure"
          aria-labelledby="footer-estimates-title"
        >
          <h2
            id="footer-estimates-title"
            class="site-footer__disclosure-title"
            data-i18n="footer.estimates.title"
          >
            Analytical estimates
          </h2>

          <p
            class="site-footer__disclosure-text"
            data-i18n="footer.estimates.body"
          >
            Salary, affordability, housing and other
            analytical figures shown by GovCareer Compass
            may be estimates or research-derived comparisons.
            They do not guarantee actual pay, government
            quarters or other service benefits.
          </p>
        </section>


        <section
          class="site-footer__disclosure"
          aria-labelledby="footer-promotion-title"
        >
          <h2
            id="footer-promotion-title"
            class="site-footer__disclosure-title"
            data-i18n="footer.promotion.title"
          >
            Service progression
          </h2>

          <p
            class="site-footer__disclosure-text"
            data-i18n="footer.promotion.body"
          >
            Promotion and career-growth information is
            analytical and informational. GovCareer Compass
            does not guarantee promotion eligibility,
            promotion dates or service timelines.
          </p>
        </section>

      </div>


      <!-- Footer metadata ----------------------------------------------- -->

      <div
        class="site-footer__bottom"
      >

        <p>
          ©
          ${escapeHtml(
            String(
              CURRENT_YEAR
            )
          )}
          <span
            data-i18n="brand.name"
          >
            ${escapeHtml(
              brandName
            )}
          </span>.
          <span
            data-i18n="footer.allRightsReserved"
          >
            All rights reserved.
          </span>
        </p>


        <p
          data-research-baseline-wrapper
          ${
            baseline
              ? ''
              : 'hidden'
          }
        >
          <span
            data-i18n="footer.researchBaseline"
          >
            Research baseline:
          </span>

          <span
            data-research-baseline
          >
            ${escapeHtml(
              baseline
            )}
          </span>
        </p>


        <p
          data-i18n="footer.officialPortalNotice"
        >
          This website is not an official government
          recruitment portal.
        </p>

      </div>

    </footer>
  `;
}


/* --------------------------------------------------------------------------
 * Mount management
 * -------------------------------------------------------------------------- */

function ensureFooterMount() {
  if (
    typeof document ===
      'undefined'
  ) {
    return null;
  }


  let mount =
    document.querySelector(
      FOOTER_SELECTOR
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
    'footer';


  if (
    document.body
  ) {
    document.body.append(
      mount
    );
  }


  return mount;
}


/* --------------------------------------------------------------------------
 * Active route state
 * -------------------------------------------------------------------------- */

function updateFooterActiveRoute(
  pathname =
    typeof window !==
      'undefined'
      ? window.location.pathname
      : ''
) {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }


  const mount =
    document.querySelector(
      FOOTER_SELECTOR
    );


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
          normalizePath(
            linkPath
          ) ===
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
 * Research baseline state
 * -------------------------------------------------------------------------- */

function updateResearchBaseline(
  baseline
) {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }


  const mount =
    document.querySelector(
      FOOTER_SELECTOR
    );


  if (
    !mount
  ) {
    return;
  }


  const normalized =
    resolveResearchBaseline(
      baseline
    );


  const valueElement =
    mount.querySelector(
      '[data-research-baseline]'
    );


  const wrapper =
    mount.querySelector(
      '[data-research-baseline-wrapper]'
    );


  if (
    valueElement
  ) {
    valueElement.textContent =
      normalized;
  }


  if (
    wrapper
  ) {
    wrapper.hidden =
      !normalized;
  }
}


/* --------------------------------------------------------------------------
 * Rendering
 * -------------------------------------------------------------------------- */

function renderFooter(
  options = {}
) {
  const mount =
    ensureFooterMount();


  if (
    !mount
  ) {
    return null;
  }


  mount.innerHTML =
    createFooterMarkup(
      options
    );


  /*
   * Allow page/application metadata to provide the research baseline.
   */
  updateResearchBaseline(
    options.researchBaseline
  );


  updateFooterActiveRoute();


  return mount;
}


/* --------------------------------------------------------------------------
 * Initialization
 * -------------------------------------------------------------------------- */

let initialized =
  false;


/**
 * Initialize the footer once for the current document.
 */
function initializeFooter(
  options = {}
) {
  if (
    initialized &&
    typeof document !==
      'undefined'
  ) {
    const existing =
      document.querySelector(
        FOOTER_SELECTOR
      );


    if (
      existing
    ) {
      updateFooterActiveRoute();

      updateResearchBaseline(
        options.researchBaseline
      );

      return existing;
    }
  }


  const mount =
    renderFooter(
      options
    );


  if (
    !mount
  ) {
    return null;
  }


  initialized =
    true;


  /*
   * Keep route highlighting synchronized with the existing application/router
   * without taking router ownership.
   */
  mount.__gccFooterCleanup =
    mount.__gccFooterCleanup ||
    [];


  const routeChangeHandler =
    () => {
      updateFooterActiveRoute();
    };


  const popstateHandler =
    () => {
      updateFooterActiveRoute();
    };


  document.addEventListener(
    'gcc:routechange',
    routeChangeHandler
  );


  window.addEventListener(
    'popstate',
    popstateHandler
  );


  mount.__gccFooterCleanup.push(
    () =>
      document.removeEventListener(
        'gcc:routechange',
        routeChangeHandler
      )
  );


  mount.__gccFooterCleanup.push(
    () =>
      window.removeEventListener(
        'popstate',
        popstateHandler
      )
  );


  return mount;
}


/* --------------------------------------------------------------------------
 * Cleanup
 * -------------------------------------------------------------------------- */

function destroyFooter() {
  if (
    typeof document ===
      'undefined'
  ) {
    return;
  }


  const mount =
    document.querySelector(
      FOOTER_SELECTOR
    );


  if (
    mount
  ) {
    const cleanup =
      mount.__gccFooterCleanup;


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
             * Cleanup should never break application shutdown/navigation.
             */
          }
        }
      );
    }


    delete mount.__gccFooterCleanup;
  }


  initialized =
    false;
}


/* --------------------------------------------------------------------------
 * Exports
 * -------------------------------------------------------------------------- */

export {
  FOOTER_SELECTOR,
  DEFAULT_BRAND_NAME,
  DEFAULT_RESEARCH_BASELINE,

  getFooterRoutes,

  createFooterMarkup,
  ensureFooterMount,

  renderFooter,
  initializeFooter,
  destroyFooter,

  updateFooterActiveRoute,
  updateResearchBaseline
};


export default {
  renderFooter,
  initializeFooter,
  updateFooterActiveRoute
};
