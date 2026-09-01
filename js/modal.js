/**
 * GovCareer Compass
 * Accessible modal manager
 */

let activeModal = null;
let lastFocusedElement = null;

function createModal({
  id = `gcc-modal-${Date.now()}`,
  title = '',
  content = '',
  size = 'medium',
  closeOnBackdrop = true,
  closeOnEscape = true
} = {}) {
  const existing =
    document.getElementById(id);

  if (existing) {
    existing.remove();
  }

  const modal =
    document.createElement('div');

  modal.id = id;
  modal.className =
    `gcc-modal gcc-modal--${size}`;
  modal.hidden = true;

  modal.innerHTML = `
    <div
      class="gcc-modal__backdrop"
      data-modal-backdrop
    ></div>

    <section
      class="gcc-modal__dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="${id}-title"
      tabindex="-1"
    >
      <header class="gcc-modal__header">
        <h2
          id="${id}-title"
          class="gcc-modal__title"
        >
          ${escapeHtml(title)}
        </h2>

        <button
          type="button"
          class="gcc-modal__close"
          data-modal-close
          aria-label="Close dialog"
        >
          <span aria-hidden="true">×</span>
        </button>
      </header>

      <div class="gcc-modal__body">
        ${content}
      </div>
    </section>
  `;

  document.body.appendChild(
    modal
  );

  const closeButton =
    modal.querySelector(
      '[data-modal-close]'
    );

  const backdrop =
    modal.querySelector(
      '[data-modal-backdrop]'
    );

  closeButton.addEventListener(
    'click',
    () => closeModal(id)
  );

  if (closeOnBackdrop) {
    backdrop.addEventListener(
      'click',
      () => closeModal(id)
    );
  }

  modal.dataset.closeOnEscape =
    String(closeOnEscape);

  return modal;
}

function openModal(
  modalOrId,
  options = {}
) {
  let modal =
    typeof modalOrId === 'string'
      ? document.getElementById(
          modalOrId
        )
      : modalOrId;

  if (!modal) {
    modal = createModal(options);
  }

  if (activeModal) {
    closeModal(
      activeModal.id,
      {
        restoreFocus: false
      }
    );
  }

  lastFocusedElement =
    document.activeElement;

  activeModal = modal;

  modal.hidden = false;

  document.body.classList.add(
    'modal-open'
  );

  requestAnimationFrame(() => {
    modal.classList.add(
      'is-open'
    );
  });

  const dialog =
    modal.querySelector(
      '[role="dialog"]'
    );

  window.setTimeout(
    () => dialog?.focus(),
    30
  );

  return modal;
}

function closeModal(
  modalId = null,
  {
    restoreFocus = true
  } = {}
) {
  const modal =
    modalId
      ? document.getElementById(
          modalId
        )
      : activeModal;

  if (!modal) {
    return;
  }

  modal.classList.remove(
    'is-open'
  );

  window.setTimeout(() => {
    modal.hidden = true;

    if (
      modal.dataset.destroyOnClose ===
      'true'
    ) {
      modal.remove();
    }
  }, 220);

  activeModal = null;

  document.body.classList.remove(
    'modal-open'
  );

  if (
    restoreFocus &&
    lastFocusedElement &&
    document.contains(
      lastFocusedElement
    )
  ) {
    lastFocusedElement.focus();
  }

  lastFocusedElement = null;
}

function destroyModal(modalId) {
  const modal =
    document.getElementById(
      modalId
    );

  if (!modal) {
    return;
  }

  if (
    activeModal?.id ===
    modalId
  ) {
    closeModal(
      modalId,
      {
        restoreFocus: false
      }
    );
  }

  modal.remove();
}

function getFocusableElements(
  modal
) {
  return [
    ...modal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ].filter(
    (element) =>
      !element.hasAttribute(
        'hidden'
      )
  );
}

function handleModalKeyboard(
  event
) {
  if (!activeModal) {
    return;
  }

  if (
    event.key ===
      'Escape' &&
    activeModal.dataset
      .closeOnEscape !== 'false'
  ) {
    closeModal();
    return;
  }

  if (event.key !== 'Tab') {
    return;
  }

  const focusable =
    getFocusableElements(
      activeModal
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

function bindModalTriggers(
  root = document
) {
  root
    .querySelectorAll(
      '[data-modal-open]'
    )
    .forEach((trigger) => {
      if (
        trigger.dataset.modalBound ===
        'true'
      ) {
        return;
      }

      trigger.dataset.modalBound =
        'true';

      trigger.addEventListener(
        'click',
        () => {
          const id =
            trigger.dataset.modalOpen;

          openModal(id);
        }
      );
    });

  root
    .querySelectorAll(
      '[data-modal-close]'
    )
    .forEach((button) => {
      if (
        button.dataset.modalBound ===
        'true'
      ) {
        return;
      }

      button.dataset.modalBound =
        'true';

      button.addEventListener(
        'click',
        () => closeModal()
      );
    });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initModal() {
  document.addEventListener(
    'keydown',
    handleModalKeyboard
  );

  bindModalTriggers();
}

export {
  initModal,
  createModal,
  openModal,
  closeModal,
  destroyModal,
  bindModalTriggers
};

export default {
  initModal,
  createModal,
  openModal,
  closeModal,
  destroyModal,
  bindModalTriggers
};
