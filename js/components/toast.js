/**
 * GovCareer Compass
 * ============================================================
 * Toast Notification Component
 * ============================================================
 *
 * Used for:
 * - saved/bookmarked feedback;
 * - copied text feedback;
 * - export completion;
 * - language/theme changes;
 * - validation notices;
 * - non-blocking application messages.
 */

let toastContainer =
  null;

const DEFAULT_DURATION =
  3500;

const TOAST_TYPES =
  Object.freeze({
    INFO:
      'info',

    SUCCESS:
      'success',

    WARNING:
      'warning',

    ERROR:
      'error'
  });

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

function ensureToastContainer() {
  if (
    toastContainer &&
    document.body.contains(
      toastContainer
    )
  ) {
    return toastContainer;
  }

  toastContainer =
    document.querySelector(
      '[data-toast-container]'
    );

  if (
    !toastContainer
  ) {
    toastContainer =
      document.createElement(
        'div'
      );

    toastContainer.className =
      'toast-container';

    toastContainer.dataset.toastContainer =
      'true';

    toastContainer.setAttribute(
      'aria-live',
      'polite'
    );

    toastContainer.setAttribute(
      'aria-atomic',
      'false'
    );

    document.body.append(
      toastContainer
    );
  }

  return toastContainer;
}

function normalizeType(
  type
) {
  const normalized =
    String(
      type ||
        TOAST_TYPES.INFO
    )
      .trim()
      .toLowerCase();

  return Object.values(
    TOAST_TYPES
  ).includes(
    normalized
  )
    ? normalized
    : TOAST_TYPES.INFO;
}

function showToast(
  {
    message,
    type =
      TOAST_TYPES.INFO,
    title = '',
    duration =
      DEFAULT_DURATION,
    dismissible =
      true
  } = {}
) {
  if (
    !message
  ) {
    return null;
  }

  const container =
    ensureToastContainer();

  const normalizedType =
    normalizeType(
      type
    );

  const toast =
    document.createElement(
      'article'
    );

  toast.className =
    `toast toast--${normalizedType}`;

  toast.setAttribute(
    'role',
    normalizedType ===
      TOAST_TYPES.ERROR ||
    normalizedType ===
      TOAST_TYPES.WARNING
      ? 'alert'
      : 'status'
  );

  toast.innerHTML = `
    <div class="toast__icon" aria-hidden="true">
      ${getTypeSymbol(
        normalizedType
      )}
    </div>

    <div class="toast__content">
      ${
        title
          ? `
            <strong class="toast__title">
              ${escapeHtml(
                title
              )}
            </strong>
          `
          : ''
      }

      <div class="toast__message">
        ${escapeHtml(
          message
        )}
      </div>
    </div>

    ${
      dismissible
        ? `
          <button
            type="button"
            class="toast__close icon-button"
            aria-label="Dismiss notification"
            data-toast-close
          >
            ×
          </button>
        `
        : ''
    }
  `;

  container.append(
    toast
  );

  requestAnimationFrame(
    () => {
      toast.classList.add(
        'is-visible'
      );
    }
  );

  let timeoutId =
    null;

  const dismiss =
    () => {
      if (
        timeoutId
      ) {
        clearTimeout(
          timeoutId
        );
      }

      toast.classList.remove(
        'is-visible'
      );

      const remove =
        () => {
          toast.remove();
        };

      window.setTimeout(
        remove,
        220
      );
    };

  const closeButton =
    toast.querySelector(
      '[data-toast-close]'
    );

  closeButton?.addEventListener(
    'click',
    dismiss
  );

  if (
    Number(duration) >
    0
  ) {
    timeoutId =
      window.setTimeout(
        dismiss,
        Number(
          duration
        )
      );
  }

  return {
    element:
      toast,

    dismiss
  };
}

function getTypeSymbol(
  type
) {
  switch (
    type
  ) {
    case TOAST_TYPES.SUCCESS:
      return '✓';

    case TOAST_TYPES.WARNING:
      return '!';

    case TOAST_TYPES.ERROR:
      return '×';

    default:
      return 'i';
  }
}

function dismissAllToasts() {
  if (
    !toastContainer
  ) {
    return;
  }

  toastContainer
    .querySelectorAll(
      '.toast'
    )
    .forEach(
      (toast) => {
        toast.classList.remove(
          'is-visible'
        );

        window.setTimeout(
          () => {
            toast.remove();
          },
          220
        );
      }
    );
}

function initializeToastSystem() {
  ensureToastContainer();

  document.addEventListener(
    'click',
    (event) => {
      const closeButton =
        event.target.closest(
          '[data-toast-close]'
        );

      if (
        !closeButton
      ) {
        return;
      }

      const toast =
        closeButton.closest(
          '.toast'
        );

      toast?.classList.remove(
        'is-visible'
      );

      window.setTimeout(
        () => {
          toast?.remove();
        },
        220
      );
    }
  );

  /*
   * Integration with existing application events.
   */
  document.addEventListener(
    'govcareer:copy',
    (event) => {
      if (
        event.detail?.success
      ) {
        showToast({
          message:
            'Copied to clipboard.',
          type:
            TOAST_TYPES.SUCCESS
        });
      }
    }
  );

  document.addEventListener(
    'govcareer:share',
    (event) => {
      if (
        event.detail?.success
      ) {
        showToast({
          message:
            event.detail.method ===
            'web-share'
              ? 'Share dialog opened.'
              : 'Link copied to clipboard.',
          type:
            TOAST_TYPES.SUCCESS
        });
      }
    }
  );
}

export {
  TOAST_TYPES,
  showToast,
  dismissAllToasts,
  initializeToastSystem
};

export default {
  showToast,
  dismissAllToasts,
  initializeToastSystem
};
