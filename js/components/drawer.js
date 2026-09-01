/**
 * GovCareer Compass
 * ============================================================
 * Responsive Drawer Component
 * ============================================================
 *
 * Purpose:
 * - mobile navigation;
 * - filter drawers;
 * - future utility drawers;
 * - accessible focus handling;
 * - backdrop interaction.
 *
 * The drawer is generic and is not tied to a specific page.
 */

let activeDrawer =
  null;

let previouslyFocusedElement =
  null;

function getFocusableElements(
  container
) {
  if (
    !container
  ) {
    return [];
  }

  return [
    ...container.querySelectorAll(
      [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(',')
    )
  ];
}

function setExpandedState(
  drawer,
  expanded
) {
  const drawerId =
    drawer.id;

  if (
    !drawerId
  ) {
    return;
  }

  document
    .querySelectorAll(
      `[data-drawer-open="${CSS.escape(
        drawerId
      )}"]`
    )
    .forEach(
      (trigger) => {
        trigger.setAttribute(
          'aria-expanded',
          String(
            expanded
          )
        );
      }
    );
}

function openDrawer(
  drawerOrId
) {
  const drawer =
    typeof drawerOrId ===
      'string'
      ? document.getElementById(
          drawerOrId
        )
      : drawerOrId;

  if (
    !drawer
  ) {
    return false;
  }

  if (
    activeDrawer &&
    activeDrawer !==
      drawer
  ) {
    closeDrawer(
      activeDrawer
    );
  }

  previouslyFocusedElement =
    document.activeElement;

  activeDrawer =
    drawer;

  drawer.hidden =
    false;

  drawer.classList.add(
    'is-open'
  );

  drawer.setAttribute(
    'aria-hidden',
    'false'
  );

  document.documentElement.classList.add(
    'drawer-open'
  );

  setExpandedState(
    drawer,
    true
  );

  const focusable =
    getFocusableElements(
      drawer
    );

  (
    focusable[0] ||
    drawer
  ).focus();

  document.dispatchEvent(
    new CustomEvent(
      'govcareer:draweropen',
      {
        detail: {
          drawer
        }
      }
    )
  );

  return true;
}

function closeDrawer(
  drawerOrId =
    activeDrawer
) {
  const drawer =
    typeof drawerOrId ===
      'string'
      ? document.getElementById(
          drawerOrId
        )
      : drawerOrId;

  if (
    !drawer
  ) {
    return false;
  }

  drawer.classList.remove(
    'is-open'
  );

  drawer.setAttribute(
    'aria-hidden',
    'true'
  );

  drawer.hidden =
    true;

  setExpandedState(
    drawer,
    false
  );

  if (
    drawer ===
    activeDrawer
  ) {
    activeDrawer =
      null;

    document.documentElement.classList.remove(
      'drawer-open'
    );

    if (
      previouslyFocusedElement &&
      document.contains(
        previouslyFocusedElement
      )
    ) {
      previouslyFocusedElement.focus();
    }

    previouslyFocusedElement =
      null;
  }

  document.dispatchEvent(
    new CustomEvent(
      'govcareer:drawerclose',
      {
        detail: {
          drawer
        }
      }
    )
  );

  return true;
}

function closeActiveDrawer() {
  return closeDrawer(
    activeDrawer
  );
}

function trapDrawerFocus(
  event
) {
  if (
    !activeDrawer ||
    event.key !==
      'Tab'
  ) {
    return;
  }

  const focusable =
    getFocusableElements(
      activeDrawer
    );

  if (
    focusable.length ===
    0
  ) {
    event.preventDefault();
    activeDrawer.focus();
    return;
  }

  const first =
    focusable[0];

  const last =
    focusable[
      focusable.length -
        1
    ];

  if (
    event.shiftKey &&
    document.activeElement ===
      first
  ) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    document.activeElement ===
      last
  ) {
    event.preventDefault();
    first.focus();
  }
}

function bindDrawerControls() {
  document.addEventListener(
    'click',
    (event) => {
      const openTrigger =
        event.target.closest(
          '[data-drawer-open]'
        );

      if (
        openTrigger
      ) {
        const target =
          openTrigger.dataset
            .drawerOpen;

        if (
          target
        ) {
          event.preventDefault();

          openDrawer(
            target
          );
        }

        return;
      }

      const closeTrigger =
        event.target.closest(
          '[data-drawer-close]'
        );

      if (
        closeTrigger
      ) {
        event.preventDefault();

        const drawer =
          closeTrigger.closest(
            '[data-drawer]'
          );

        closeDrawer(
          drawer
        );

        return;
      }

      if (
        activeDrawer &&
        event.target ===
          activeDrawer &&
        activeDrawer.dataset
          .drawerBackdropClose !==
          'false'
      ) {
        closeActiveDrawer();
      }
    }
  );

  document.addEventListener(
    'keydown',
    trapDrawerFocus
  );

  document.addEventListener(
    'govcareer:escape',
    () => {
      closeActiveDrawer();
    }
  );
}

function initializeDrawers() {
  document
    .querySelectorAll(
      '[data-drawer]'
    )
    .forEach(
      (drawer) => {
        if (
          !drawer.hasAttribute(
            'tabindex'
          )
        ) {
          drawer.setAttribute(
            'tabindex',
            '-1'
          );
        }

        if (
          !drawer.classList.contains(
            'is-open'
          )
        ) {
          drawer.hidden =
            true;

          drawer.setAttribute(
            'aria-hidden',
            'true'
          );
        }
      }
    );

  bindDrawerControls();
}

export {
  openDrawer,
  closeDrawer,
  closeActiveDrawer,
  initializeDrawers
};

export default {
  openDrawer,
  closeDrawer,
  closeActiveDrawer,
  initializeDrawers
};
