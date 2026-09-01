/**
 * GovCareer Compass
 * ============================================================
 * Modal Component
 * ============================================================
 *
 * This component provides the UI-level modal layer.
 *
 * The lower-level modal.js utility is the state manager.
 * This component is responsible for creating/rendering
 * reusable modal markup and connecting it to that system.
 */

import {
  openModal,
  closeModal,
  initializeModalSystem
} from '../modal.js';

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

function createModal({
  id,
  title = '',
  content = '',
  size = 'medium',
  labelledBy = null
} = {}) {
  if (
    !id
  ) {
    throw new Error(
      'Modal requires a stable ID.'
    );
  }

  const existing =
    document.getElementById(
      id
    );

  if (
    existing
  ) {
    existing.remove();
  }

  const titleId =
    labelledBy ||
    `${id}-title`;

  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML = `
    <section
      id="${escapeHtml(
        id
      )}"
      class="modal"
      data-modal
      data-modal-size="${escapeHtml(
        size
      )}"
      data-modal-backdrop-close="true"
      role="dialog"
      aria-modal="true"
      aria-labelledby="${escapeHtml(
        titleId
      )}"
      aria-hidden="true"
      tabindex="-1"
      hidden
    >
      <div
        class="modal__backdrop"
        data-modal-close
        aria-hidden="true"
      ></div>

      <div
        class="modal__dialog"
        role="document"
      >
        <div
          class="modal__header"
        >
          <h2
            id="${escapeHtml(
              titleId
            )}"
            class="modal__title"
          >
            ${escapeHtml(
              title
            )}
          </h2>

          <button
            type="button"
            class="modal__close icon-button"
            data-modal-close
            aria-label="Close dialog"
            title="Close"
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12"></path>
              <path d="M18 6 6 18"></path>
            </svg>
          </button>
        </div>

        <div
          class="modal__body"
          data-modal-body
        >
          ${content}
        </div>
      </div>
    </section>
  `;

  const modal =
    wrapper.firstElementChild;

  document.body.append(
    modal
  );

  initializeModalSystem();

  return modal;
}

function setModalContent(
  modalOrId,
  content
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

  const body =
    modal.querySelector(
      '[data-modal-body]'
    );

  if (
    !body
  ) {
    return false;
  }

  body.innerHTML =
    String(
      content ?? ''
    );

  return true;
}

function setModalTitle(
  modalOrId,
  title
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

  const titleElement =
    modal.querySelector(
      '.modal__title'
    );

  if (
    !titleElement
  ) {
    return false;
  }

  titleElement.textContent =
    String(
      title ?? ''
    );

  return true;
}

function showModal({
  id,
  title,
  content,
  size = 'medium',
  onOpen
} = {}) {
  let modal =
    document.getElementById(
      id
    );

  if (
    !modal
  ) {
    modal =
      createModal({
        id,
        title,
        content,
        size
      });
  } else {
    if (
      title !==
      undefined
    ) {
      setModalTitle(
        modal,
        title
      );
    }

    if (
      content !==
      undefined
    ) {
      setModalContent(
        modal,
        content
      );
    }
  }

  const opened =
    openModal(
      modal
    );

  if (
    opened &&
    typeof onOpen ===
      'function'
  ) {
    onOpen(
      modal
    );
  }

  return modal;
}

function hideModal(
  modalOrId
) {
  return closeModal(
    modalOrId
  );
}

function initializeModalComponent() {
  initializeModalSystem();
}

export {
  createModal,
  setModalContent,
  setModalTitle,
  showModal,
  hideModal,
  initializeModalComponent
};

export default {
  createModal,
  showModal,
  hideModal,
  initializeModalComponent
};
