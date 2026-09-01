/**
 * GovCareer Compass
 * ============================================================
 * Global Navigation Controller
 * ============================================================
 */

import {
  getRoute
} from './config.js';

import {
  navigate
} from './router.js';

const OPEN_CLASS =
  'is-open';

const ACTIVE_CLASS =
  'is-active';

function setActiveNavigation() {
  const currentPath =
    window.location.pathname
      .replace(
        /\/+$/,
        ''
      );

  const links =
    document.querySelectorAll(
      '[data-nav-route], [data-nav-link]'
    );

  links.forEach(
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

      let resolved;

      try {
        resolved =
          new URL(
            href,
            window.location.href
          ).pathname;
      } catch {
        resolved =
          href;
      }

      const isActive =
        resolved.replace(
          /\/+$/,
          ''
        ) ===
        currentPath;

      link.classList.toggle(
        ACTIVE_CLASS,
        isActive
      );

      link.setAttribute(
        'aria-current',
        isActive
          ? 'page'
          : 'false'
      );
    }
  );
}

function closeAllDrawers() {
  const elements =
    document.querySelectorAll(
      '[data-drawer]'
    );

  elements.forEach(
    (drawer) => {
      drawer.classList.remove(
        OPEN_CLASS
      );

      drawer.setAttribute(
        'aria-hidden',
        'true'
      );
    }
  );

  document.documentElement.classList.remove(
    'drawer-open'
  );
}

function bindDrawerTriggers() {
  const triggers =
    document.querySelectorAll(
      '[data-drawer-open]'
    );

  triggers.forEach(
    (trigger) => {
      trigger.addEventListener(
        'click',
        () => {
          const targetId =
            trigger.getAttribute(
              'data-drawer-open'
            );

          if (
            !targetId
          ) {
            return;
          }

          const drawer =
            document.getElementById(
              targetId
            );

          if (
            !drawer
          ) {
            return;
          }

          drawer.classList.add(
            OPEN_CLASS
          );

          drawer.setAttribute(
            'aria-hidden',
            'false'
          );

          document.documentElement.classList.add(
            'drawer-open'
          );

          const firstFocusable =
            drawer.querySelector(
              'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

          firstFocusable?.focus();
        }
      );
    }
  );

  document.addEventListener(
    'click',
    (event) => {
      const closeTrigger =
        event.target.closest(
          '[data-drawer-close]'
        );

      if (
        closeTrigger
      ) {
        closeAllDrawers();
        return;
      }

      const drawer =
        event.target.closest(
          '[data-drawer]'
        );

      if (
        !drawer
      ) {
        return;
      }

      if (
        event.target ===
        drawer
      ) {
        closeAllDrawers();
      }
    }
  );

  document.addEventListener(
    'govcareer:escape',
    () => {
      closeAllDrawers();
    }
  );
}

function bindNavigationLinks() {
  const links =
    document.querySelectorAll(
      '[data-route]'
    );

  links.forEach(
    (link) => {
      link.addEventListener(
        'click',
        (event) => {
          const route =
            link.dataset.route;

          if (
            !route
          ) {
            return;
          }

          /*
           * Let normal browser behavior handle modified clicks.
           */
          if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !==
              0
          ) {
            return;
          }

          event.preventDefault();

          closeAllDrawers();

          navigate(
            route
          );
        }
      );
    }
  );
}

function bindQuickActions() {
  const buttons =
    document.querySelectorAll(
      '[data-quick-action]'
    );

  buttons.forEach(
    (button) => {
      button.addEventListener(
        'click',
        () => {
          const route =
            button.dataset.quickAction;

          if (
            route
          ) {
            navigate(
              route
            );
          }
        }
      );
    }
  );
}

function ensureRouteLinks() {
  document
    .querySelectorAll(
      '[data-route-link]'
    )
    .forEach(
      (element) => {
        const route =
          element.dataset.routeLink;

        if (
          !route
        ) {
          return;
        }

        try {
          element.setAttribute(
            'href',
            getRoute(
              route
            )
          );
        } catch {
          element.removeAttribute(
            'href'
          );
        }
      }
    );
}

function initializeNavigation() {
  ensureRouteLinks();

  bindDrawerTriggers();

  bindNavigationLinks();

  bindQuickActions();

  setActiveNavigation();
}

export {
  initializeNavigation,
  closeAllDrawers,
  setActiveNavigation
};

export default {
  initializeNavigation,
  closeAllDrawers
};
