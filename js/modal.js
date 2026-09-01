/**
 * GovCareer Compass
 * ============================================================
 * Accessible Modal Manager
 * ============================================================
 */

let activeModal = null;
let previouslyFocusedElement = null;

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

function trapFocus(
  event
) {
  if (
    !activeModal ||
    event.key !==
      'Tab'
  ) {
    return;
  }

  const focusable =
    getFocusableElements(
      activeModal
    );

  if (
    focusable.length ===
    0
  ) {
    event.preventDefault();
    activeModal.focus();
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

function openModal(
  modalOrId,
  {
    focus = true
  } = {}
) {
  const modal =
    typeof modalOrId ===
      'string'
      ? document.getElementById(
          modalOrId
        )
      : modalOrId;

  if (
    !modal
  ) {
    return false;
  }

  previouslyFocusedElement =
    document.activeElement;

  activeModal =
    modal;

  modal.classList.add(
    'is-open'
  );

  modal.removeAttribute(
    'hidden'
  );

  modal.setAttribute(
    'aria-hidden',
    'false'
  );

  document.documentElement.classList.add(
    'modal-open'
  );

  if (
    focus
  ) {
    const focusable =
      getFocusableElements(
        modal
      );

    (
      focusable[0] ||
      modal
    ).focus();
  }

  document.dispatchEvent(
    new CustomEvent(
      'govcareer:modalopen',
      {
        detail: {
          modal
        }
      }
    )
  );

  return true;
}

function closeModal(
  modalOrId =
    activeModal
) {
  const modal =
    typeof modalOrId ===
      'string'
      ? document.getElementById(
          modalOrId
        )
      : modalOrId;

  if (
    !modal
  ) {
    return false;
  }

  modal.classList.remove(
    'is-open'
  );

  modal.setAttribute(
    'aria-hidden',
    'true'
  );

  modal.setAttribute(
    'hidden',
    ''
  );

  if (
    modal ===
    activeModal
  ) {
    activeModal =
      null;

    document.documentElement.classList.remove(
      'modal-open'
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
      'govcareer:modalclose',
      {
        detail: {
          modal
        }
      }
    )
  );

  return true;
}

function closeActiveModal() {
  return closeModal(
    activeModal
  );
}

function bindModalControls() {
  document.addEventListener(
    'click',
    (event) => {
      const opener =
        event.target.closest(
          '[data-modal-open]'
        );

      if (
        opener
      ) {
        event.preventDefault();

        openModal(
          opener.dataset.modalOpen
        );

        return;
      }

      const closer =
        event.target.closest(
          '[data-modal-close]'
        );

      if (
        closer
      ) {
        event.preventDefault();

        closeModal(
          closer.closest(
            '[role="dialog"], [data-modal]'
          )
        );

        return;
      }

      if (
        activeModal &&
        event.target ===
          activeModal &&
        activeModal.dataset.modalBackdropClose !==
          'false'
      ) {
        closeActiveModal();
      }
    }
  );

  document.addEventListener(
    'keydown',
    trapFocus
  );

  document.addEventListener(
    'govcareer:escape',
    () => {
      closeActiveModal();
    }
  );
}

function initializeModalSystem() {
  bindModalControls();

  document
    .querySelectorAll(
      '[data-modal][hidden]'
    )
    .forEach(
      (modal) => {
        modal.setAttribute(
          'aria-hidden',
          'true'
        );
      }
    );
}

export {
  openModal,
  closeModal,
  closeActiveModal,
  initializeModalSystem
};

export default {
  openModal,
  closeModal,
  closeActiveModal,
  initializeModalSystem
};
