/**
 * GovCareer Compass
 * ============================================================
 * Source / Evidence Card Component
 * ============================================================
 *
 * Displays the evidence behind career-data claims.
 *
 * Evidence vocabulary:
 *
 *   HIGH
 *   MEDIUM_HIGH
 *   MEDIUM
 *   LOW
 *   ESTIMATE
 *   NOT_VERIFIED
 *   UNKNOWN
 */

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
        'Official departmental information is available, but some current applicability may require additional verification.'
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
        'The source record does not specify an evidence confidence level.'
    }
  });

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
      (
        item
      ) =>
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
  const value =
    source?.url ||
    source?.officialUrl ||
    source?.link;

  if (
    typeof value !==
    'string'
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return /^https?:\/\//i.test(
    trimmed
  )
    ? trimmed
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

function normalizeConfidence(
  value
) {
  const normalized =
    String(
      value ||
        'UNKNOWN'
    )
      .trim()
      .toUpperCase()
      .replace(
        /[\s-]+/g,
        '_'
      );

  const aliases = {
    OFFICIAL_CURRENT:
      'HIGH',

    CURRENT_OFFICIAL:
      'HIGH',

    OFFICIAL_HISTORICAL:
      'MEDIUM_HIGH',

    OFFICIAL_RULE:
      'HIGH',

    SECONDARY:
      'LOW'
  };

  return (
    aliases[
      normalized
    ] ||
    (
      CONFIDENCE_META[
        normalized
      ]
        ? normalized
        : 'UNKNOWN'
    )
  );
}

function createConfidenceBlock(
  confidence
) {
  const normalized =
    normalizeConfidence(
      confidence
    );

  const meta =
    CONFIDENCE_META[
      normalized
    ];

  return `
    <div
      class="source-card__confidence source-card__confidence--${escapeHtml(
        meta.tone
      )}"
      data-confidence="${escapeHtml(
        normalized
      )}"
    >
      <span
        class="source-card__confidence-label"
      >
        ${escapeHtml(
          meta.label
        )}
      </span>

      <span
        class="source-card__confidence-explanation"
      >
        ${escapeHtml(
          meta.description
        )}
      </span>
    </div>
  `;
}

function createSourceCardMarkup(
  source,
  {
    compact =
      false,

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
                    normalizeConfidence(
                      confidence
                    )
                  ].description
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

  const element =
    wrapper.firstElementChild;

  if (
    !element
  ) {
    throw new Error(
      'Unable to create source card.'
    );
  }

  return element;
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
        (
          source
        ) =>
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

  normalizeConfidence,

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
