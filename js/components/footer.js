/**
 * GovCareer Compass
 * ============================================================
 * Global Footer Component
 * ============================================================
 *
 * Purpose:
 * Creates the consistent footer used across every page.
 */

import {
  getRoute
} from '../config.js';

const FOOTER_SELECTOR =
  '[data-component="footer"]';

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

function createFooterMarkup({
  brandName =
    'GovCareer Compass'
} = {}) {
  const routes = {
    home:
      safeRoute(
        'home',
        '../index.html'
      ),

    exams:
      safeRoute(
        'exams',
        './exams.html'
      ),

    jobs:
      safeRoute(
        'jobs',
        './jobs.html'
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

  const year =
    new Date().getFullYear();

  return `
    <footer
      class="site-footer"
      data-footer-root
    >
      <div class="site-footer__inner">

        <div
          class="site-footer__brand"
        >
          <a
            href="${escapeHtml(
              routes.home
            )}"
            class="site-footer__brand-link"
            data-route="home"
          >
            ${escapeHtml(
              brandName
            )}
          </a>

          <p class="site-footer__description">
            A research and decision-support platform
            for understanding, comparing and exploring
            government career opportunities.
          </p>
        </div>

        <div
          class="site-footer__links"
        >

          <section
            class="site-footer__group"
            aria-labelledby="footer-explore"
          >
            <h2
              id="footer-explore"
              class="site-footer__title"
            >
              Explore
            </h2>

            <a
              href="${escapeHtml(
                routes.exams
              )}"
              data-route="exams"
            >
              Exams
            </a>

            <a
              href="${escapeHtml(
                routes.jobs
              )}"
              data-route="jobs"
            >
              Jobs
            </a>

            <a
              href="${escapeHtml(
                routes.glossary
              )}"
              data-route="glossary"
            >
              Glossary
            </a>
          </section>

          <section
            class="site-footer__group"
            aria-labelledby="footer-research"
          >
            <h2
              id="footer-research"
              class="site-footer__title"
            >
              Research
            </h2>

            <a
              href="${escapeHtml(
                routes.sources
              )}"
              data-route="sources"
            >
              Sources
            </a>

            <a
              href="${escapeHtml(
                routes.methodology
              )}"
              data-route="methodology"
            >
              Methodology
            </a>
          </section>

          <section
            class="site-footer__group"
            aria-labelledby="footer-site"
          >
            <h2
              id="footer-site"
              class="site-footer__title"
            >
              Website
            </h2>

            <a
              href="${escapeHtml(
                routes.about
              )}"
              data-route="about"
            >
              About
            </a>

            <a
              href="${escapeHtml(
                routes.privacy
              )}"
              data-route="privacy"
            >
              Privacy
            </a>
          </section>

        </div>
      </div>

      <div
        class="site-footer__bottom"
      >
        <p>
          © ${year}
          ${escapeHtml(
            brandName
          )}.
          All rights reserved.
        </p>

        <p>
          Research baseline:
          <span
            data-research-baseline
          >
            31 August 2026
          </span>
        </p>

        <p>
          This website is a research and
          decision-support tool, not an official
          recruitment portal.
        </p>
      </div>
    </footer>
  `;
}

function ensureFooterMount() {
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

  document.body.append(
    mount
  );

  return mount;
}

function renderFooter(
  options = {}
) {
  const mount =
    ensureFooterMount();

  mount.innerHTML =
    createFooterMarkup(
      options
    );

  const configuredBaseline =
    document.documentElement
      .dataset
      .researchBaseline;

  const baseline =
    mount.querySelector(
      '[data-research-baseline]'
    );

  if (
    configuredBaseline
  ) {
    baseline.textContent =
      configuredBaseline;
  }

  return mount;
}

function initializeFooter(
  options = {}
) {
  return renderFooter(
    options
  );
}

export {
  createFooterMarkup,
  renderFooter,
  initializeFooter
};

export default {
  renderFooter,
  initializeFooter
};
