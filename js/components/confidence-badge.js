/**
 * GovCareer Compass
 * ============================================================
 * Evidence Confidence Badge
 * ============================================================
 *
 * Used for claims/data whose evidence quality matters.
 *
 * Project evidence vocabulary:
 *
 *   HIGH
 *   MEDIUM_HIGH
 *   MEDIUM
 *   LOW
 *   ESTIMATE
 *   NOT_VERIFIED
 *   UNKNOWN
 *
 * The component never changes the evidence level.
 * It only presents what the dataset says.
 */

const CONFIDENCE_LEVEL =
  Object.freeze({
    HIGH:
      'HIGH',

    MEDIUM_HIGH:
      'MEDIUM_HIGH',

    MEDIUM:
      'MEDIUM',

    LOW:
      'LOW',

    ESTIMATE:
      'ESTIMATE',

    NOT_VERIFIED:
      'NOT_VERIFIED',

    UNKNOWN:
      'UNKNOWN'
  });

const CONFIDENCE_META =
  Object.freeze({
    HIGH: {
      label:
        'High confidence',

      shortLabel:
        'High',

      tone:
        'positive',

      description:
        'Supported by current authoritative official evidence.'
    },

    MEDIUM_HIGH: {
      label:
        'Official historical',

      shortLabel:
        'Official historical',

      tone:
        'historical',

      description:
        'Based on official historical documentation whose continuing applicability should be checked against newer rules.'
    },

    MEDIUM: {
      label:
        'Official information',

      shortLabel:
        'Official',

      tone:
        'official',

      description:
        'Official departmental information is available, but some current applicability may require verification.'
    },

    LOW: {
      label:
        'Low confidence',

      shortLabel:
        'Low',

      tone:
        'caution',

      description:
        'The available evidence is less conclusive.'
    },

    ESTIMATE: {
      label:
        'Current estimate',

      shortLabel:
        'Estimate',

      tone:
        'estimate',

      description:
        'This value is calculated or estimated and is not an official fixed figure.'
    },

    NOT_VERIFIED: {
      label:
        'Not publicly verified',

      shortLabel:
        'Not verified',

      tone:
        'unverified',

      description:
        'A sufficiently authoritative public confirmation was not located.'
    },

    UNKNOWN: {
      label:
        'Confidence not specified',

      shortLabel:
        'Unknown',

      tone:
        'neutral',

      description:
        'The record does not specify a confidence level.'
    }
  });

function normalizeConfidence(
  value
) {
  const normalized =
    String(
      value ||
        CONFIDENCE_LEVEL.UNKNOWN
    )
      .trim()
      .toUpperCase()
      .replace(
        /[\s-]+/g,
        '_'
      );

  const aliases = {
    OFFICIAL_CURRENT:
      CONFIDENCE_LEVEL.HIGH,

    CURRENT_OFFICIAL:
      CONFIDENCE_LEVEL.HIGH,

    OFFICIAL_HISTORICAL:
      CONFIDENCE_LEVEL.MEDIUM_HIGH,

    OFFICIAL_RULE:
      CONFIDENCE_LEVEL.HIGH,

    SECONDARY:
      CONFIDENCE_LEVEL.LOW,

    NOT_VERIFIED:
      CONFIDENCE_LEVEL.NOT_VERIFIED
  };

  return (
    aliases[
      normalized
    ] ||
    (
      Object.values(
        CONFIDENCE_LEVEL
      ).includes(
        normalized
      )
        ? normalized
        : CONFIDENCE_LEVEL.UNKNOWN
    )
  );
}

function getConfidenceMeta(
  confidence
) {
  const normalized =
    normalizeConfidence(
      confidence
    );

  return (
    CONFIDENCE_META[
      normalized
    ] ||
    CONFIDENCE_META.UNKNOWN
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

function createConfidenceBadgeMarkup(
  {
    confidence =
      CONFIDENCE_LEVEL.UNKNOWN,
    compact =
      false,
    showDescription =
      false
  } = {}
) {
  const normalized =
    normalizeConfidence(
      confidence
    );

  const meta =
    getConfidenceMeta(
      normalized
    );

  return `
    <span
      class="confidence-badge confidence-badge--${escapeHtml(
        meta.tone
      )} ${
        compact
          ? 'confidence-badge--compact'
          : ''
      }"
      data-confidence-badge
      data-confidence="${escapeHtml(
        normalized
      )}"
      title="${escapeHtml(
        meta.description
      )}"
    >
      <span
        class="confidence-badge__indicator"
        aria-hidden="true"
      ></span>

      <span
        class="confidence-badge__label"
      >
        ${escapeHtml(
          compact
            ? meta.shortLabel
            : meta.label
        )}
      </span>

      ${
        showDescription
          ? `
            <span
              class="confidence-badge__description"
            >
              ${escapeHtml(
                meta.description
              )}
            </span>
          `
          : ''
      }
    </span>
  `;
}

function createConfidenceBadge(
  options = {}
) {
  const wrapper =
    document.createElement(
      'span'
    );

  wrapper.innerHTML =
    createConfidenceBadgeMarkup(
      options
    );

  const element =
    wrapper.firstElementChild;

  if (
    !element
  ) {
    throw new Error(
      'Unable to create confidence badge.'
    );
  }

  return element;
}

function mountConfidenceBadge(
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
    createConfidenceBadge(
      options
    );

  mount.append(
    badge
  );

  return badge;
}

function updateConfidenceBadge(
  element,
  confidence,
  {
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
    normalizeConfidence(
      confidence
    );

  const meta =
    getConfidenceMeta(
      normalized
    );

  element.dataset.confidence =
    normalized;

  element.className =
    `confidence-badge confidence-badge--${meta.tone}`;

  element.title =
    meta.description;

  const label =
    element.querySelector(
      '.confidence-badge__label'
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
        '.confidence-badge__description'
      );

    if (
      description
    ) {
      description.textContent =
        meta.description;
    }
  }

  return true;
}

export {
  CONFIDENCE_LEVEL,
  CONFIDENCE_META,

  normalizeConfidence,
  getConfidenceMeta,

  createConfidenceBadgeMarkup,
  createConfidenceBadge,
  mountConfidenceBadge,
  updateConfidenceBadge
};

export default {
  createConfidenceBadge,
  mountConfidenceBadge,
  updateConfidenceBadge
};
