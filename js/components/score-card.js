/**
 * GovCareer Compass
 * ============================================================
 * Score Card Component
 * ============================================================
 *
 * Purpose:
 * Display a meaningful analytical score with:
 *
 * - score;
 * - label;
 * - interpretation;
 * - confidence/evidence context;
 * - optional supporting metrics.
 *
 * This component does not calculate the score.
 */

import {
  normalizeScore,
  getScoreSemantics,
  SCORE_MODES
} from './score-bar.js';

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

function formatScore(
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
    return '—';
  }

  return Number.isInteger(
    normalized
  )
    ? String(
        normalized
      )
    : normalized.toFixed(
        1
      );
}

function getScoreInterpretation(
  score,
  max,
  mode
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
    return 'Score unavailable';
  }

  const percentage =
    (
      normalized /
      max
    ) *
    100;

  /*
   * For negative metrics, the wording is deliberately inverted:
   * a lower numerical value is more favourable.
   */
  if (
    normalizeMode(
      mode
    ) ===
    SCORE_MODES.NEGATIVE
  ) {
    if (
      percentage <=
      25
    ) {
      return 'Low burden';
    }

    if (
      percentage <=
      50
    ) {
      return 'Moderate burden';
    }

    if (
      percentage <=
      75
    ) {
      return 'High burden';
    }

    return 'Very high burden';
  }

  if (
    normalizeMode(
      mode
    ) ===
    SCORE_MODES.NEUTRAL
  ) {
    return 'Informational score';
  }

  if (
    percentage >=
    80
  ) {
    return 'Very strong';
  }

  if (
    percentage >=
    60
  ) {
    return 'Strong';
  }

  if (
    percentage >=
    40
  ) {
    return 'Moderate';
  }

  if (
    percentage >=
    20
  ) {
    return 'Limited';
  }

  return 'Very limited';
}

function createScoreCardMarkup(
  {
    label =
      'Career score',
    score = null,
    max = 10,
    mode =
      SCORE_MODES.POSITIVE,
    description = '',
    interpretation =
      null,
    unit =
      '/10',
    icon = '',
    confidence =
      '',
    className =
      '',
    compact =
      false
  } = {}
) {
  const normalizedMode =
    normalizeMode(
      mode
    );

  const normalizedScore =
    normalizeScore(
      score,
      max
    );

  const displayScore =
    normalizedScore ===
    null
      ? '—'
      : `${formatScore(
          normalizedScore,
          max
        )}${unit}`;

  const calculatedInterpretation =
    interpretation ||
    getScoreInterpretation(
      normalizedScore,
      max,
      normalizedMode
    );

  const semantics =
    getScoreSemantics(
      normalizedMode
    );

  return `
    <article
      class="score-card score-card--${escapeHtml(
        normalizedMode
      )} ${
        compact
          ? 'score-card--compact'
          : ''
      } ${escapeHtml(
        className
      )}"
      data-score-card
      data-score="${escapeHtml(
        normalizedScore ?? ''
      )}"
      data-score-max="${escapeHtml(
        max
      )}"
      data-score-mode="${escapeHtml(
        normalizedMode
      )}"
    >

      <div
        class="score-card__header"
      >
        <div
          class="score-card__identity"
        >
          ${
            icon
              ? `
                <span
                  class="score-card__icon"
                  aria-hidden="true"
                >
                  ${escapeHtml(
                    icon
                  )}
                </span>
              `
              : ''
          }

          <div>
            <h3
              class="score-card__label"
            >
              ${escapeHtml(
                label
              )}
            </h3>

            <span
              class="score-card__interpretation"
            >
              ${escapeHtml(
                calculatedInterpretation
              )}
            </span>
          </div>
        </div>

        <strong
          class="score-card__value"
        >
          ${escapeHtml(
            displayScore
          )}
        </strong>
      </div>

      ${
        description
          ? `
            <p
              class="score-card__description"
            >
              ${escapeHtml(
                description
              )}
            </p>
          `
          : ''
      }

      ${
        confidence
          ? `
            <div
              class="score-card__confidence"
            >
              ${escapeHtml(
                confidence
              )}
            </div>
          `
          : ''
      }

      <div
        class="score-card__semantics"
      >
        ${escapeHtml(
          semantics.meaning
        )}
      </div>

    </article>
  `;
}

function createScoreCard(
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createScoreCardMarkup(
      options
    );

  const element =
    wrapper.firstElementChild;

  if (
    !element
  ) {
    throw new Error(
      'Unable to create score card.'
    );
  }

  return element;
}

function mountScoreCard(
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

  const card =
    createScoreCard(
      options
    );

  mount.append(
    card
  );

  return card;
}

export {
  createScoreCardMarkup,
  createScoreCard,
  mountScoreCard,
  getScoreInterpretation
};

export default {
  createScoreCard,
  mountScoreCard
};
