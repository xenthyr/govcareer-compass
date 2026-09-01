/**
 * GovCareer Compass
 * ============================================================
 * Eligibility Badge Component
 * ============================================================
 *
 * Eligibility is a HARD-GATE concept.
 *
 * It must never be replaced by a recommendation score.
 *
 * Supported states:
 *
 *   DIRECTLY_ELIGIBLE
 *   CONDITIONALLY_ELIGIBLE
 *   NOT_ELIGIBLE
 *   MANUAL_VERIFICATION
 *   INSUFFICIENT_INFORMATION
 *   UNKNOWN
 *
 * This component only displays the determination made by the
 * eligibility engine.
 */

const ELIGIBILITY_STATUS =
  Object.freeze({
    DIRECTLY_ELIGIBLE:
      'DIRECTLY_ELIGIBLE',

    CONDITIONALLY_ELIGIBLE:
      'CONDITIONALLY_ELIGIBLE',

    NOT_ELIGIBLE:
      'NOT_ELIGIBLE',

    MANUAL_VERIFICATION:
      'MANUAL_VERIFICATION',

    INSUFFICIENT_INFORMATION:
      'INSUFFICIENT_INFORMATION',

    UNKNOWN:
      'UNKNOWN'
  });

function normalizeEligibility(
  value
) {
  const normalized =
    String(
      value ||
        ELIGIBILITY_STATUS.UNKNOWN
    )
      .trim()
      .toUpperCase()
      .replace(
        /[\s-]+/g,
        '_'
      );

  const aliases = {
    DIRECT:
      ELIGIBILITY_STATUS.DIRECTLY_ELIGIBLE,

    ELIGIBLE:
      ELIGIBILITY_STATUS.DIRECTLY_ELIGIBLE,

    BA_ELIGIBLE:
      ELIGIBILITY_STATUS.DIRECTLY_ELIGIBLE,

    CONDITIONAL:
      ELIGIBILITY_STATUS.CONDITIONALLY_ELIGIBLE,

    CONDITIONALLY_ELIGIBLE:
      ELIGIBILITY_STATUS.CONDITIONALLY_ELIGIBLE,

    INELIGIBLE:
      ELIGIBILITY_STATUS.NOT_ELIGIBLE,

    NOT_ELIGIBLE_WITH_BA:
      ELIGIBILITY_STATUS.NOT_ELIGIBLE,

    NEEDS_VERIFICATION:
      ELIGIBILITY_STATUS.MANUAL_VERIFICATION,

    VERIFICATION_REQUIRED:
      ELIGIBILITY_STATUS.MANUAL_VERIFICATION,

    INSUFFICIENT:
      ELIGIBILITY_STATUS.INSUFFICIENT_INFORMATION
  };

  return (
    aliases[
      normalized
    ] ||
    Object.values(
      ELIGIBILITY_STATUS
    ).includes(
      normalized
    )
      ? normalized
      : ELIGIBILITY_STATUS.UNKNOWN
  );
}

function getEligibilityMeta(
  status
) {
  const normalized =
    normalizeEligibility(
      status
    );

  const metadata = {
    DIRECTLY_ELIGIBLE: {
      label:
        'Directly Eligible',

      shortLabel:
        'Eligible',

      description:
        'The recorded essential educational qualification is satisfied by the candidate profile.',

      tone:
        'positive'
    },

    CONDITIONALLY_ELIGIBLE: {
      label:
        'Conditionally Eligible',

      shortLabel:
        'Conditional',

      description:
        'The candidate may qualify only when the recorded additional conditions are satisfied.',

      tone:
        'caution'
    },

    NOT_ELIGIBLE: {
      label:
        'Not Eligible',

      shortLabel:
        'Not eligible',

      description:
        'The recorded essential eligibility requirements are not satisfied by the current candidate profile.',

      tone:
        'negative'
    },

    MANUAL_VERIFICATION: {
      label:
        'Verification Required',

      shortLabel:
        'Verify',

      description:
        'The available evidence is not sufficient to make a reliable eligibility determination.',

      tone:
        'caution'
    },

    INSUFFICIENT_INFORMATION: {
      label:
        'Insufficient Information',

      shortLabel:
        'Incomplete',

      description:
        'Required candidate or recruitment-rule information is missing.',

      tone:
        'caution'
    },

    UNKNOWN: {
      label:
        'Eligibility Not Verified',

      shortLabel:
        'Unknown',

      description:
        'No reliable eligibility determination is currently available.',

      tone:
        'neutral'
    }
  };

  return (
    metadata[
      normalized
    ] ||
    metadata.UNKNOWN
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

function createEligibilityBadgeMarkup(
  {
    status =
      ELIGIBILITY_STATUS.UNKNOWN,
    conditionText =
      '',
    showDescription =
      false,
    showIcon =
      true,
    compact =
      false
  } = {}
) {
  const normalized =
    normalizeEligibility(
      status
    );

  const meta =
    getEligibilityMeta(
      normalized
    );

  const iconMap = {
    DIRECTLY_ELIGIBLE:
      '✓',

    CONDITIONALLY_ELIGIBLE:
      '△',

    NOT_ELIGIBLE:
      '×',

    MANUAL_VERIFICATION:
      '?',

    INSUFFICIENT_INFORMATION:
      '…',

    UNKNOWN:
      '?'
  };

  return `
    <div
      class="eligibility-badge eligibility-badge--${escapeHtml(
        meta.tone
      )} ${
        compact
          ? 'eligibility-badge--compact'
          : ''
      }"
      data-eligibility-badge
      data-eligibility-status="${escapeHtml(
        normalized
      )}"
      role="status"
      aria-label="${escapeHtml(
        meta.label
      )}"
    >

      ${
        showIcon
          ? `
            <span
              class="eligibility-badge__icon"
              aria-hidden="true"
            >
              ${
                iconMap[
                  normalized
                ] ||
                '?'
              }
            </span>
          `
          : ''
      }

      <span
        class="eligibility-badge__content"
      >
        <strong
          class="eligibility-badge__label"
        >
          ${escapeHtml(
            compact
              ? meta.shortLabel
              : meta.label
          )}
        </strong>

        ${
          showDescription
            ? `
              <span
                class="eligibility-badge__description"
              >
                ${escapeHtml(
                  conditionText ||
                    meta.description
                )}
              </span>
            `
            : ''
        }
      </span>

    </div>
  `;
}

function createEligibilityBadge(
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createEligibilityBadgeMarkup(
      options
    );

  const element =
    wrapper.firstElementChild;

  if (
    !element
  ) {
    throw new Error(
      'Unable to create eligibility badge.'
    );
  }

  return element;
}

function mountEligibilityBadge(
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
    createEligibilityBadge(
      options
    );

  mount.append(
    badge
  );

  return badge;
}

function updateEligibilityBadge(
  element,
  status,
  {
    conditionText = '',
    showDescription =
      false
  } = {}
) {
  if (
    !element
  ) {
    return false;
  }

  const normalized =
    normalizeEligibility(
      status
    );

  const meta =
    getEligibilityMeta(
      normalized
    );

  element.dataset
    .eligibilityStatus =
    normalized;

  element.setAttribute(
    'aria-label',
    meta.label
  );

  element.className =
    `eligibility-badge eligibility-badge--${meta.tone}`;

  const label =
    element.querySelector(
      '.eligibility-badge__label'
    );

  if (
    label
  ) {
    label.textContent =
      meta.label;
  }

  if (
    showDescription
  ) {
    const description =
      element.querySelector(
        '.eligibility-badge__description'
      );

    if (
      description
    ) {
      description.textContent =
        conditionText ||
        meta.description;
    }
  }

  return true;
}

export {
  ELIGIBILITY_STATUS,

  normalizeEligibility,
  getEligibilityMeta,

  createEligibilityBadgeMarkup,
  createEligibilityBadge,
  mountEligibilityBadge,
  updateEligibilityBadge
};

export default {
  createEligibilityBadge,
  mountEligibilityBadge,
  updateEligibilityBadge
};
