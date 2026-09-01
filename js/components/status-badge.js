/**
 * GovCareer Compass
 * ============================================================
 * Recruitment / Record Status Badge
 * ============================================================
 *
 * This is different from eligibility and confidence.
 *
 * STATUS answers:
 *
 *   "What is the current lifecycle state of this record?"
 *
 * Examples:
 *   OPEN
 *   CLOSED
 *   ACTIVE
 *   UNDER_PROCESS
 *   HISTORICAL
 *   ABOLISHED
 *   PERIODIC
 *   IRREGULAR
 *
 * It does not indicate whether the candidate is eligible.
 */

const RECORD_STATUS =
  Object.freeze({
    OPEN:
      'OPEN',

    ACTIVE:
      'ACTIVE',

    CURRENT:
      'CURRENT',

    CLOSED:
      'CLOSED',

    UNDER_PROCESS:
      'UNDER_PROCESS',

    RECENTLY_COMPLETED:
      'RECENTLY_COMPLETED',

    PERIODIC:
      'PERIODIC',

    IRREGULAR:
      'IRREGULAR',

    HISTORICAL:
      'HISTORICAL',

    ABOLISHED:
      'ABOLISHED',

    REPLACED:
      'REPLACED',

    SUSPENDED:
      'SUSPENDED',

    NOT_CURRENT:
      'NOT_CURRENT',

    UNKNOWN:
      'UNKNOWN'
  });

const STATUS_META =
  Object.freeze({
    OPEN: {
      label:
        'Open',

      tone:
        'positive'
    },

    ACTIVE: {
      label:
        'Active',

      tone:
        'positive'
    },

    CURRENT: {
      label:
        'Current',

      tone:
        'positive'
    },

    CLOSED: {
      label:
        'Closed',

      tone:
        'neutral'
    },

    UNDER_PROCESS: {
      label:
        'Under Process',

      tone:
        'caution'
    },

    RECENTLY_COMPLETED: {
      label:
        'Recently Completed',

      tone:
        'neutral'
    },

    PERIODIC: {
      label:
        'Periodic',

      tone:
        'information'
    },

    IRREGULAR: {
      label:
        'Irregular',

      tone:
        'caution'
    },

    HISTORICAL: {
      label:
        'Historical',

      tone:
        'historical'
    },

    ABOLISHED: {
      label:
        'Abolished',

      tone:
        'negative'
    },

    REPLACED: {
      label:
        'Replaced',

      tone:
        'negative'
    },

    SUSPENDED: {
      label:
        'Suspended',

      tone:
        'negative'
    },

    NOT_CURRENT: {
      label:
        'Not Current',

      tone:
        'neutral'
    },

    UNKNOWN: {
      label:
        'Status Not Verified',

      tone:
        'neutral'
    }
  });

function normalizeStatus(
  value
) {
  const normalized =
    String(
      value ||
        RECORD_STATUS.UNKNOWN
    )
      .trim()
      .toUpperCase()
      .replace(
        /[\s-]+/g,
        '_'
      );

  const aliases = {
    LIVE:
      RECORD_STATUS.ACTIVE,

    COMPLETED:
      RECORD_STATUS.RECENTLY_COMPLETED,

    HISTORIC:
      RECORD_STATUS.HISTORICAL,

    CANCELLED:
      RECORD_STATUS.CLOSED,

    CANCELED:
      RECORD_STATUS.CLOSED,

    DISCONTINUED:
      RECORD_STATUS.ABOLISHED
  };

  return (
    aliases[
      normalized
    ] ||
    (
      Object.values(
        RECORD_STATUS
      ).includes(
        normalized
      )
        ? normalized
        : RECORD_STATUS.UNKNOWN
    )
  );
}

function getStatusMeta(
  status
) {
  const normalized =
    normalizeStatus(
      status
    );

  return (
    STATUS_META[
      normalized
    ] ||
    STATUS_META.UNKNOWN
  );
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

function createStatusBadgeMarkup(
  {
    status =
      RECORD_STATUS.UNKNOWN,
    compact =
      false,
    showIndicator =
      true
  } = {}
) {
  const normalized =
    normalizeStatus(
      status
    );

  const meta =
    getStatusMeta(
      normalized
    );

  return `
    <span
      class="status-badge status-badge--${escapeHtml(
        meta.tone
      )} ${
        compact
          ? 'status-badge--compact'
          : ''
      }"
      data-status-badge
      data-status="${escapeHtml(
        normalized
      )}"
      role="status"
      aria-label="${escapeHtml(
        meta.label
      )}"
    >

      ${
        showIndicator
          ? `
            <span
              class="status-badge__indicator"
              aria-hidden="true"
            ></span>
          `
          : ''
      }

      <span
        class="status-badge__label"
      >
        ${escapeHtml(
          meta.label
        )}
      </span>

    </span>
  `;
}

function createStatusBadge(
  options = {}
) {
  const wrapper =
    document.createElement(
      'span'
    );

  wrapper.innerHTML =
    createStatusBadgeMarkup(
      options
    );

  const element =
    wrapper.firstElementChild;

  if (
    !element
  ) {
    throw new Error(
      'Unable to create status badge.'
    );
  }

  return element;
}

function mountStatusBadge(
  container,
  options = {}
) {
  const mount =
    typeof container ===
      'string'
      ? document.querySelector(
          container
        )
      : container;

  if (
    !mount
  ) {
    return null;
  }

  mount.innerHTML =
    '';

  const badge =
    createStatusBadge(
      options
    );

  mount.append(
    badge
  );

  return badge;
}

function updateStatusBadge(
  element,
  status
) {
  if (
    !element
  ) {
    return false;
  }

  const normalized =
    normalizeStatus(
      status
    );

  const meta =
    getStatusMeta(
      normalized
    );

  element.dataset.status =
    normalized;

  element.className =
    `status-badge status-badge--${meta.tone}`;

  element.setAttribute(
    'aria-label',
    meta.label
  );

  const label =
    element.querySelector(
      '.status-badge__label'
    );

  if (
    label
  ) {
    label.textContent =
      meta.label;
  }

  return true;
}

export {
  RECORD_STATUS,
  STATUS_META,

  normalizeStatus,
  getStatusMeta,

  createStatusBadgeMarkup,
  createStatusBadge,
  mountStatusBadge,
  updateStatusBadge
};

export default {
  createStatusBadge,
  mountStatusBadge,
  updateStatusBadge
};
