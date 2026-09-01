/**
 * GovCareer Compass
 * ============================================================
 * Score Bar Component
 * ============================================================
 *
 * FILE:
 *   /js/components/score-bar.js
 *
 * PURPOSE:
 *   Reusable accessible visual representation of a numeric score.
 *
 * IMPORTANT:
 *   The component does not decide whether a higher score is good
 *   or bad. That meaning is provided through `metricType`.
 *
 * Examples:
 *
 *   Salary:
 *      higher = better
 *
 *   Authority:
 *      higher = more authority
 *
 *   Family compatibility:
 *      higher = better compatibility
 *
 *   Safety:
 *      higher = safer
 *
 *   Stress:
 *      higher = MORE stress
 *
 *   Transfer burden:
 *      higher = MORE burden
 *
 * This distinction prevents negative metrics from being rendered
 * as if a higher number were automatically better.
 */

const DEFAULT_MAX =
  10;

const SCORE_MODES =
  Object.freeze({
    POSITIVE:
      'positive',

    NEGATIVE:
      'negative',

    NEUTRAL:
      'neutral'
  });

function toFiniteNumber(
  value
) {
  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ? number
    : null;
}

function clamp(
  value,
  min,
  max
) {
  return Math.min(
    max,
    Math.max(
      min,
      value
    )
  );
}

function normalizeScore(
  value,
  max = DEFAULT_MAX
) {
  const numeric =
    toFiniteNumber(
      value
    );

  if (
    numeric === null
  ) {
    return null;
  }

  const safeMax =
    Math.max(
      1,
      toFiniteNumber(
        max
      ) ?? DEFAULT_MAX
    );

  return clamp(
    numeric,
    0,
    safeMax
  );
}

function getPercentage(
  score,
  max
) {
  const normalized =
    normalizeScore(
      score,
      max
    );

  if (
    normalized ===
    null
  ) {
    return null;
  }

  const safeMax =
    Math.max(
      1,
      toFiniteNumber(
        max
      ) ?? DEFAULT_MAX
    );

  return (
    normalized /
    safeMax
  ) *
  100;
}

function normalizeMode(
  mode
) {
  const normalized =
    String(
      mode ||
        SCORE_MODES.POSITIVE
    )
      .trim()
      .toLowerCase();

  return Object.values(
    SCORE_MODES
  ).includes(
    normalized
  )
    ? normalized
    : SCORE_MODES.POSITIVE;
}

/**
 * Convert a raw metric into display metadata.
 */
function getScoreSemantics(
  mode
) {
  switch (
    normalizeMode(
      mode
    )
  ) {
    case SCORE_MODES.NEGATIVE:
      return {
        mode:
          SCORE_MODES.NEGATIVE,

        meaning:
          'Higher numeric values indicate a greater burden or negative impact.',

        preferredDirection:
          'LOWER_IS_BETTER'
      };

    case SCORE_MODES.NEUTRAL:
      return {
        mode:
          SCORE_MODES.NEUTRAL,

        meaning:
          'The score is informational and has no built-in good/bad direction.',

        preferredDirection:
          'NEUTRAL'
      };

    default:
      return {
        mode:
          SCORE_MODES.POSITIVE,

        meaning:
          'Higher numeric values indicate a stronger or more favourable result.',

        preferredDirection:
          'HIGHER_IS_BETTER'
      };
  }
}

function getAriaLabel(
  {
    label,
    score,
    max,
    mode,
    unit = '/10'
  }
) {
  const semantics =
    getScoreSemantics(
      mode
    );

  const numeric =
    normalizeScore(
      score,
      max
    );

  if (
    numeric ===
    null
  ) {
    return `${label}: score not available.`;
  }

  return `${label}: ${numeric}${unit}. ${semantics.meaning}`;
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

/**
 * Create semantic score bar markup.
 */
function createScoreBarMarkup(
  {
    label = 'Score',
    score = null,
    max = DEFAULT_MAX,
    mode = SCORE_MODES.POSITIVE,
    unit = '/10',
    showValue = true,
    showMeaning = false,
    compact = false,
    id = ''
  } = {}
) {
  const normalizedScore =
    normalizeScore(
      score,
      max
    );

  const percentage =
    getPercentage(
      normalizedScore,
      max
    );

  const normalizedMode =
    normalizeMode(
      mode
    );

  const semantics =
    getScoreSemantics(
      normalizedMode
    );

  const valueText =
    normalizedScore ===
    null
      ? '—'
      : `${normalizedScore}${unit}`;

  const ariaLabel =
    getAriaLabel({
      label,
      score:
        normalizedScore,
      max,
      mode:
        normalizedMode,
      unit
    });

  const safeId =
    id
      ? ` id="${escapeHtml(
          id
        )}"`
      : '';

  return `
    <div
      class="score-bar score-bar--${escapeHtml(
        normalizedMode
      )} ${
        compact
          ? 'score-bar--compact'
          : ''
      }"
      data-score-bar
      data-score="${escapeHtml(
        normalizedScore ?? ''
      )}"
      data-score-max="${escapeHtml(
        max
      )}"
      data-score-mode="${escapeHtml(
        normalizedMode
      )}"
      ${safeId}
      role="group"
      aria-label="${escapeHtml(
        ariaLabel
      )}"
    >

      <div
        class="score-bar__header"
      >
        <span
          class="score-bar__label"
        >
          ${escapeHtml(
            label
          )}
        </span>

        ${
          showValue
            ? `
              <strong
                class="score-bar__value"
              >
                ${escapeHtml(
                  valueText
                )}
              </strong>
            `
            : ''
        }
      </div>

      <div
        class="score-bar__track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="${escapeHtml(
          max
        )}"
        ${
          normalizedScore !==
          null
            ? `aria-valuenow="${escapeHtml(
                normalizedScore
              )}"`
            : 'aria-valuetext="Score not available"'
        }
      >
        <span
          class="score-bar__fill"
          style="width:${percentage ?? 0}%"
          aria-hidden="true"
        ></span>
      </div>

      ${
        showMeaning
          ? `
            <p
              class="score-bar__meaning"
            >
              ${escapeHtml(
                semantics.meaning
              )}
            </p>
          `
          : ''
      }

    </div>
  `;
}

function createScoreBar(
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createScoreBarMarkup(
      options
    );

  const element =
    wrapper.firstElementChild;

  if (
    !element
  ) {
    throw new Error(
      'Unable to create score bar.'
    );
  }

  return element;
}

function mountScoreBar(
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

  const element =
    createScoreBar(
      options
    );

  mount.append(
    element
  );

  return element;
}

function updateScoreBar(
  element,
  {
    score,
    max,
    mode,
    label
  } = {}
) {
  if (
    !element
  ) {
    return false;
  }

  const nextMax =
    max ??
    Number(
      element.dataset
        .scoreMax
    ) ||
    DEFAULT_MAX;

  const nextMode =
    normalizeMode(
      mode ??
        element.dataset
          .scoreMode
    );

  const nextScore =
    normalizeScore(
      score,
      nextMax
    );

  element.dataset.score =
    nextScore ?? '';

  element.dataset.scoreMax =
    nextMax;

  element.dataset.scoreMode =
    nextMode;

  const percentage =
    getPercentage(
      nextScore,
      nextMax
    );

  const fill =
    element.querySelector(
      '.score-bar__fill'
    );

  if (
    fill
  ) {
    fill.style.width =
      `${percentage ?? 0}%`;
  }

  const value =
    element.querySelector(
      '.score-bar__value'
    );

  if (
    value
  ) {
    value.textContent =
      nextScore ===
      null
        ? '—'
        : `${nextScore}/10`;
  }

  const progress =
    element.querySelector(
      '[role="progressbar"]'
    );

  if (
    progress
  ) {
    if (
      nextScore ===
      null
    ) {
      progress.removeAttribute(
        'aria-valuenow'
      );

      progress.setAttribute(
        'aria-valuetext',
        'Score not available'
      );
    } else {
      progress.setAttribute(
        'aria-valuenow',
        String(
          nextScore
        )
      );

      progress.removeAttribute(
        'aria-valuetext'
      );
    }
  }

  if (
    label
  ) {
    const labelElement =
      element.querySelector(
        '.score-bar__label'
      );

    if (
      labelElement
    ) {
      labelElement.textContent =
        label;
    }
  }

  return true;
}

export {
  DEFAULT_MAX,
  SCORE_MODES,

  normalizeScore,
  getPercentage,
  getScoreSemantics,

  createScoreBarMarkup,
  createScoreBar,
  mountScoreBar,
  updateScoreBar
};

export default {
  createScoreBar,
  mountScoreBar,
  updateScoreBar
};
