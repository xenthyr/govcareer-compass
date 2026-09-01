/**
 * GovCareer Compass
 * ============================================================
 * Source / Evidence Card Component
 * ============================================================
 *
 * Purpose:
 * Display the evidence behind government-career information.
 *
 * The project explicitly distinguishes:
 *
 *   OFFICIAL CURRENT
 *   OFFICIAL HISTORICAL
 *   OFFICIAL RULE
 *   SECONDARY
 *   ESTIMATE
 *   NOT VERIFIED
 *
 * A source card therefore needs to make evidence quality visible
 * without pretending that every piece of information has equal
 * authority.
 */

import {
  getLocalizedText as _unused
} from './source-card-internal.js';

/*
 * The project does not currently require a separate internal
 * helper module. The local implementation below intentionally
 * avoids relying on a future file.
 */

/* ============================================================
 * UTILITIES
 * ============================================================
 */

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

function getLocalizedText(
  value
) {
  if (
    typeof value ===
    'string'
  ) {
    return value;
  }

  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return '';
  }

  return (
    value.en ||
    value.bn ||
    Object.values(
      value
    ).find(
      (item) =>
        typeof item ===
        'string'
    ) ||
    ''
  );
}

function firstValue(
  object,
  fields
) {
  for (
    const field of
      fields
  ) {
    const value =
      object?.[
        field
      ];

    if (
      value ===
        undefined ||
      value ===
        null
    ) {
      continue;
    }

    const text =
      getLocalizedText(
        value
      );

    if (
      text
    ) {
      return text;
    }
  }

  return '';
}

function getSourceTitle(
  source
) {
  return (
    firstValue(
      source,
      [
        'title',
        'sourceTitle',
        'documentTitle',
        'name'
      ]
    ) ||
    source?.id ||
    'Source'
  );
}

function getSourceOrganisation(
  source
) {
  return firstValue(
    source,
    [
      'organisationName',
      'organisation',
      'organisationId',
      'publisher',
      'sourceOrganisation'
    ]
  );
}

function getSourceType(
  source
) {
  return (
    firstValue(
      source,
      [
        'sourceTypeName',
        'sourceType',
        'type'
      ]
    ) ||
    'Source type not specified'
  );
}

function getConfidence(
  source
) {
  return (
    source?.confidence ||
    source?.confidenceLevel ||
    'UNKNOWN'
  );
}

function getSourceDate(
  source
) {
  return (
    source?.date ||
    source?.publicationDate ||
    source?.notificationDate ||
    source?.sourceDate ||
    ''
  );
}

function getSourceDescription(
  source
) {
  return firstValue(
    source,
    [
      'description',
      'relevance',
      'summary',
      'notes'
    ]
  );
}

function getUrl(
  source
) {
  const candidate =
    source?.url ||
    source?.officialUrl ||
    source?.link;

  return typeof candidate ===
    'string' &&
    /^https?:\/\//i.test(
      candidate.trim()
    )
    ? candidate.trim()
    : null;
}

function getSourcePriority(
  source
) {
  return firstValue(
    source,
    [
      'priority',
      'sourcePriority',
      'authorityLevel'
    ]
  );
}

/* ============================================================
 * EVIDENCE DEFINITIONS
 * ============================================================
 */

const CONFIDENCE_META =
  Object.freeze({
    HIGH: {
      label:
        'High confidence',

      explanation:
        'Supported by current official government documentation.',

      className:
        'high'
    },

    MEDIUM_HIGH: {
      label:
        'Official historical',

      explanation:
        'Official documentation is historical; continued applicability must be checked against newer rules.',

      className:
        'medium-high'
    },

    MEDIUM: {
      label:
        'Official information',

      explanation:
        'Official departmental information is available, but current recruitment applicability may require additional verification.',

      className:
        'medium'
    },

    LOW: {
      label:
        'Low confidence',

      explanation:
        'Evidence is less conclusive and should be checked against the applicable official notification.',

      className:
        'low'
    },

    ESTIMATE: {
      label:
        'Current estimate',

      explanation:
        'This value is calculated or estimated and should not be treated as an official figure.',

      className:
        'estimate'
    },

    NOT_VERIFIED: {
      label:
        'Not publicly verified',

      explanation:
        'A sufficiently authoritative public source was not located.',

      className:
        'not-verified'
    },

    UNKNOWN: {
      label:
        'Confidence not specified',

      explanation:
        'The source record does not specify an evidence-confidence level.',

      className:
        'unknown'
    }
  });

function createConfidenceBlock(
  confidence
) {
  const normalized =
    String(
      confidence ||
        'UNKNOWN'
    )
      .trim()
      .toUpperCase();

  const metadata =
    CONFIDENCE_META[
      normalized
    ] ||
    CONFIDENCE_META.UNKNOWN;

  return `
    <div
      class="source-card__confidence source-card__confidence--${metadata.className}"
      data-confidence="${escapeHtml(
        normalized
      )}"
    >
      <span
        class="source-card__confidence-label"
      >
        ${escapeHtml(
          metadata.label
        )}
      </span>

      <span
        class="source-card__confidence-explanation"
      >
        ${escapeHtml(
          metadata.explanation
        )}
      </span>
    </div>
  `;
}

/* ============================================================
 * SOURCE CARD
 * ============================================================
 */

function createSourceCardMarkup(
  source,
  {
    compact = false,
    showDescription =
      true,
    showEvidenceExplanation =
      true
  } = {}
) {
  if (
    !source ||
    typeof source !==
      'object'
  ) {
    return `
      <article
        class="source-card source-card--invalid"
      >
        <p>
          Source information is unavailable.
        </p>
      </article>
    `;
  }

  const title =
    getSourceTitle(
      source
    );

  const organisation =
    getSourceOrganisation(
      source
    );

  const sourceType =
    getSourceType(
      source
    );

  const confidence =
    getConfidence(
      source
    );

  const date =
    getSourceDate(
      source
    );

  const description =
    getSourceDescription(
      source
    );

  const priority =
    getSourcePriority(
      source
    );

  const url =
    getUrl(
      source
    );

  const sourceId =
    escapeHtml(
      source.id ||
        ''
    );

  const classes = [
    'source-card',
    compact
      ? 'source-card--compact'
      : ''
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <article
      class="${classes}"
      data-source-card
      data-source-id="${sourceId}"
    >

      <div
        class="source-card__header"
      >
        <div
          class="source-card__icon"
          aria-hidden="true"
        >
          §
        </div>

        <div
          class="source-card__heading"
        >
          <div
            class="source-card__type"
          >
            ${escapeHtml(
              sourceType
            )}
          </div>

          <h3
            class="source-card__title"
          >
            ${escapeHtml(
              title
            )}
          </h3>
        </div>
      </div>

      <div
        class="source-card__meta"
      >
        ${
          organisation
            ? `
              <div
                class="source-card__meta-item"
              >
                <span>
                  Organisation
                </span>

                <strong>
                  ${escapeHtml(
                    organisation
                  )}
                </strong>
              </div>
            `
            : ''
        }

        ${
          date
            ? `
              <div
                class="source-card__meta-item"
              >
                <span>
                  Source date
                </span>

                <strong>
                  ${escapeHtml(
                    date
                  )}
                </strong>
              </div>
            `
            : ''
        }

        ${
          priority
            ? `
              <div
                class="source-card__meta-item"
              >
                <span>
                  Source priority
                </span>

                <strong>
                  ${escapeHtml(
                    priority
                  )}
                </strong>
              </div>
            `
            : ''
        }
      </div>

      ${createConfidenceBlock(
        confidence
      )}

      ${
        showDescription &&
        description
          ? `
            <p
              class="source-card__description"
            >
              ${escapeHtml(
                description
              )}
            </p>
          `
          : ''
      }

      ${
        showEvidenceExplanation
          ? `
            <details
              class="source-card__evidence-details"
            >
              <summary>
                What this evidence means
              </summary>

              <p>
                ${escapeHtml(
                  CONFIDENCE_META[
                    String(
                      confidence
                    )
                      .trim()
                      .toUpperCase()
                  ]?.explanation ||
                    CONFIDENCE_META
                      .UNKNOWN
                      .explanation
                )}
              </p>
            </details>
          `
          : ''
      }

      <div
        class="source-card__footer"
      >
        <div
          class="source-card__identifier"
        >
          ${
            source.id
              ? `
                <span>
                  Source ID
                </span>

                <code>
                  ${sourceId}
                </code>
              `
              : ''
          }
        </div>

        ${
          url
            ? `
              <a
                href="${escapeHtml(
                  url
                )}"
                class="button button--secondary button--small"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Source
                <span
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>
            `
            : `
              <span
                class="source-card__no-link"
              >
                Public URL not verified
              </span>
            `
        }
      </div>

    </article>
  `;
}

/* ============================================================
 * COMPONENT FACTORY
 * ============================================================
 */

function createSourceCard(
  source,
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createSourceCardMarkup(
      source,
      options
    );

  const card =
    wrapper.firstElementChild;

  if (
    !card
  ) {
    throw new Error(
      'Unable to create source card.'
    );
  }

  return card;
}

function mountSourceCard(
  container,
  source,
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
    createSourceCard(
      source,
      options
    );

  mount.append(
    card
  );

  return card;
}

function renderSourceCards(
  container,
  sources,
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
    return [];
  }

  if (
    !Array.isArray(
      sources
    )
  ) {
    mount.innerHTML =
      '';

    return [];
  }

  mount.innerHTML =
    sources
      .map(
        (source) =>
          createSourceCardMarkup(
            source,
            options
          )
      )
      .join('');

  return [
    ...mount.querySelectorAll(
      '[data-source-card]'
    )
  ];
}

export {
  CONFIDENCE_META,

  createSourceCardMarkup,
  createSourceCard,
  mountSourceCard,
  renderSourceCards,

  getSourceTitle,
  getSourceOrganisation,
  getSourceType,
  getConfidence,
  getSourceDate,
  getUrl
};

export default {
  createSourceCard,
  mountSourceCard,
  renderSourceCards
};
