/**
 * GovCareer Compass
 * Global navigation and mobile menu controller
 */

import config from './config.js';
import {
  navigate,
  markActiveNavigation
} from './router.js';

let drawer = null;
let overlay = null;
let lastFocusedElement = null;

function getFocusableElements(
  container
) {
  return [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ].filter(
    (element) =>
      !element.hasAttribute(
        'hidden'
      )
  );
}

function createMenuStructure() {
  return {
    primary: [
      ['home', 'Home', config.routes.home],
      [
        'careerFinder',
        'Find My Career',
        config.routes.careerFinder
      ],
      [
        'jobs',
        'Government Jobs',
        config.routes.jobs
      ],
      [
        'exams',
        'Government Exams',
        config.routes.exams
      ],
      [
        'compare',
        'Compare Careers',
        config.routes.compare
      ],
      [
        'rankings',
        'Rankings',
        config.routes.rankings
      ],
      [
        'salary',
        'Salary',
        config.routes.salary
      ],
      [
        'eligibility',
        'Eligibility Checker',
        config.routes.eligibility
      ],
      [
        'location',
        'Location & Transfers',
        config.routes.location
      ],
      [
        'housing',
        'Housing',
        config.routes.housing
      ],
      [
        'preparation',
        'Preparation',
        config.routes.preparation
      ],
      [
        'ai',
        'Compass AI',
        config.routes.ai
      ]
    ],
    secondary: [
      [
        'confusionCenter',
        'Confusion Center',
        config.routes.confusionCenter
      ],
      [
        'states',
        'States',
        config.routes.states
      ],
      [
        'sources',
        'Sources',
        config.routes.sources
      ],
      [
        'glossary',
        'Glossary',
        config.routes.glossary
      ],
      [
        'methodology',
        'Methodology',
        config.routes.methodology
      ],
      [
        'about',
        'About',
        config.routes.about
      ],
      [
        'privacy',
        'Privacy',
        config.routes.privacy
      ]
    ]
  };
}

function renderNavigation(
  target
) {
  const menu =
    createMenuStructure();

  const makeGroup = (
    title,
    items
  ) => `
    <section class="nav-group">
      <h2 class="nav-group__title">${escapeHtml(
        title
      )}</h2>
      <div class="nav-group__items">
        ${items
          .map(
            ([
              key,
              label,
              route
            ]) => `
            <a
              class="nav-link"
              href="${escapeAttribute(
                route
              )}"
              data-route="${escapeAttribute(
                route
              )}"
              data-nav-key="${escapeAttribute(
                key
              )}"
            >
              <span>${escapeHtml(
                label
              )}</span>
            </a>
          `
          )
          .join('')}
      </div>
    </section>
  `;

  target.innerHTML = `
    <div class="navigation-panel__header">
      <div>
        <span class="navigation-panel__eyebrow">
          Explore
        </span>
        <h2 class="navigation-panel__title">
          GovCareer Compass
        </h2>
      </div>

      <button
        type="button"
        class="navigation-close"
        data-nav-close
        aria-label="Close navigation"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>

    <div class="navigation-panel__body">
      ${makeGroup(
        'Career Discovery',
        menu.primary
      )}

      ${makeGroup(
        'Information',
        menu.secondary
      )}
    </div>

    <div class="navigation-panel__footer">
      <span>Research baseline: ${escapeHtml(
        config.app.researchBaseline
      )}</span>
      <span>© 2026 GovCareer Compass</span>
    </div>
  `;

  bindNavigationActions();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function ensureNavigationElements() {
  if (!drawer) {
    drawer =
      document.createElement('aside');

    drawer.className =
      'navigation-drawer';

    drawer.setAttribute(
      'aria-hidden',
      'true'
    );

    drawer.setAttribute(
      'role',
      'dialog'
    );

    drawer.setAttribute(
      'aria-label',
      'Main navigation'
    );

    document.body.appendChild(
      drawer
    );

    renderNavigation(
      drawer
    );
  }

  if (!overlay) {
    overlay =
      document.createElement('div');

    overlay.className =
      'navigation-overlay';

    overlay.hidden = true;

    document.body.appendChild(
      overlay
    );

    overlay.addEventListener(
      'click',
      closeNavigation
    );
  }
}

function openNavigation() {
  ensureNavigationElements();

  lastFocusedElement =
    document.activeElement;

  drawer.classList.add(
    'is-open'
  );

  overlay.hidden = false;

  requestAnimationFrame(() => {
    overlay.classList.add(
      'is-visible'
    );
  });

  drawer.setAttribute(
    'aria-hidden',
    'false'
  );

  document.body.classList.add(
    'navigation-open'
  );

  const firstFocusable =
    getFocusableElements(
      drawer
    )[0];

  firstFocusable?.focus();

  window.dispatchEvent(
    new CustomEvent(
      'gcc:navigationopen'
    )
  );
}

function closeNavigation() {
  if (!drawer) {
    return;
  }

  drawer.classList.remove(
    'is-open'
  );

  overlay?.classList.remove(
    'is-visible'
  );

  drawer.setAttribute(
    'aria-hidden',
    'true'
  );

  document.body.classList.remove(
    'navigation-open'
  );

  window.setTimeout(() => {
    if (overlay) {
      overlay.hidden = true;
    }
  }, config.ui.animationDuration);

  if (
    lastFocusedElement &&
    typeof lastFocusedElement.focus ===
      'function'
  ) {
    lastFocusedElement.focus();
  }

  window.dispatchEvent(
    new CustomEvent(
      'gcc:navigationclose'
    )
  );
}

function toggleNavigation() {
  if (
    drawer?.classList.contains(
      'is-open'
    )
  ) {
    closeNavigation();
  } else {
    openNavigation();
  }
}

function bindNavigationActions() {
  drawer
    ?.querySelectorAll(
      '[data-nav-close]'
    )
    .forEach((button) => {
      button.addEventListener(
        'click',
        closeNavigation
      );
    });

  drawer
    ?.querySelectorAll(
      '[data-route]'
    )
    .forEach((link) => {
      link.addEventListener(
        'click',
        (event) => {
          event.preventDefault();

          const route =
            link.dataset.route;

          closeNavigation();

          window.setTimeout(
            () => navigate(route),
            config.ui.animationDuration
          );
        }
      );
    });
}

function bindMenuButtons(
  root = document
) {
  root
    .querySelectorAll(
      '[data-menu-toggle]'
    )
    .forEach((button) => {
      if (
        button.dataset.menuBound ===
        'true'
      ) {
        return;
      }

      button.dataset.menuBound =
        'true';

      button.addEventListener(
        'click',
        toggleNavigation
      );

      button.setAttribute(
        'aria-expanded',
        'false'
      );
    });
}

function handleKeyboard(event) {
  if (
    event.key === 'Escape' &&
    drawer?.classList.contains(
      'is-open'
    )
  ) {
    closeNavigation();
    return;
  }

  if (
    event.key !== 'Tab' ||
    !drawer?.classList.contains(
      'is-open'
    )
  ) {
    return;
  }

  const focusable =
    getFocusableElements(
      drawer
    );

  if (!focusable.length) {
    return;
  }

  const first =
    focusable[0];

  const last =
    focusable[
      focusable.length - 1
    ];

  if (
    event.shiftKey &&
    document.activeElement === first
  ) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    document.activeElement === last
  ) {
    event.preventDefault();
    first.focus();
  }
}

function initNavigation() {
  ensureNavigationElements();

  bindMenuButtons();

  document.addEventListener(
    'keydown',
    handleKeyboard
  );

  markActiveNavigation();
}

export {
  initNavigation,
  openNavigation,
  closeNavigation,
  toggleNavigation,
  bindMenuButtons,
  markActiveNavigation
};

export default {
  initNavigation,
  openNavigation,
  closeNavigation,
  toggleNavigation,
  bindMenuButtons
};
