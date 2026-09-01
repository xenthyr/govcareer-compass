/**
 * GovCareer Compass
 * Static multi-page router/navigation helper
 *
 * This is NOT a SPA router.
 * It provides:
 * - safe route resolution
 * - current-page detection
 * - query/hash navigation
 * - internal navigation helpers
 */

import config from './config.js';

function normalizePath(path) {
  return String(path || '')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/{2,}/g, '/');
}

function resolveRoute(routeOrPath) {
  if (!routeOrPath) {
    return config.site.home;
  }

  const value =
    String(routeOrPath);

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('#')
  ) {
    return value;
  }

  if (
    value.startsWith(config.site.basePath)
  ) {
    return value;
  }

  return `${config.site.basePath}${normalizePath(
    value
  )}`;
}

function getCurrentPath() {
  const pathname =
    window.location.pathname;

  let path = pathname;

  if (
    config.site.basePath !== '/' &&
    path.startsWith(
      config.site.basePath
    )
  ) {
    path =
      path.substring(
        config.site.basePath.length
      );
  }

  return path
    .replace(/^\/+/, '')
    .replace(/\/+$/, '');
}

function getCurrentRouteName() {
  const current =
    getCurrentPath();

  const entries =
    Object.entries(
      config.routes
    );

  const match =
    entries.find(
      ([, route]) =>
        normalizePath(route) ===
        normalizePath(current)
    );

  return match
    ? match[0]
    : null;
}

function navigate(
  route,
  {
    replace = false,
    newTab = false
  } = {}
) {
  const target =
    resolveRoute(route);

  if (newTab) {
    window.open(
      target,
      '_blank',
      'noopener,noreferrer'
    );
    return;
  }

  if (replace) {
    window.location.replace(
      target
    );
  } else {
    window.location.href =
      target;
  }
}

function navigateTo(route) {
  return navigate(route);
}

function getPageUrl(
  route,
  query = {},
  hash = ''
) {
  const url =
    new URL(
      resolveRoute(route),
      window.location.origin
    );

  Object.entries(query || {}).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        url.searchParams.set(
          key,
          String(value)
        );
      }
    }
  );

  if (hash) {
    url.hash = String(
      hash
    ).replace(/^#/, '');
  }

  return url.href;
}

function scrollToHash(
  hash = window.location.hash
) {
  if (!hash) {
    return false;
  }

  const id =
    decodeURIComponent(
      hash.replace(/^#/, '')
    );

  const element =
    document.getElementById(id);

  if (!element) {
    return false;
  }

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  return true;
}

function markActiveNavigation(
  root = document
) {
  const current =
    getCurrentPath();

  root
    .querySelectorAll(
      '[data-route]'
    )
    .forEach((link) => {
      const route =
        normalizePath(
          link.dataset.route
        );

      const isActive =
        route === current;

      link.classList.toggle(
        'is-active',
        isActive
      );

      link.setAttribute(
        'aria-current',
        isActive
          ? 'page'
          : 'false'
      );
    });
}

function initRouter() {
  document.addEventListener(
    'click',
    (event) => {
      const target =
        event.target.closest(
          '[data-route]'
        );

      if (!target) {
        return;
      }

      const href =
        target.getAttribute(
          'href'
        );

      if (
        href?.startsWith('#')
      ) {
        return;
      }

      event.preventDefault();

      navigate(
        target.dataset.route
      );
    }
  );

  markActiveNavigation();

  if (
    document.readyState ===
    'complete'
  ) {
    scrollToHash();
  } else {
    window.addEventListener(
      'load',
      () => scrollToHash(),
      {
        once: true
      }
    );
  }
}

export {
  initRouter,
  navigate,
  navigateTo,
  resolveRoute,
  getCurrentPath,
  getCurrentRouteName,
  getPageUrl,
  scrollToHash,
  markActiveNavigation
};

export default {
  initRouter,
  navigate,
  navigateTo,
  resolveRoute,
  getCurrentPath,
  getCurrentRouteName,
  getPageUrl,
  scrollToHash,
  markActiveNavigation
};
