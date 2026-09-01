/**
 * GovCareer Compass
 * ============================================================
 * Career Recommendation Result Component
 * ============================================================
 *
 * PURPOSE
 * -------
 * Presents a recommendation produced by the project's analytical
 * engines.
 *
 * Expected conceptual pipeline:
 *
 *   Candidate Profile
 *          ↓
 *   Eligibility Engine
 *          ↓
 *   Preference Engine
 *          ↓
 *   Scoring Engine
 *          ↓
 *   Ranking Engine
 *          ↓
 *   Explanation Engine
 *          ↓
 *   Career Result
 *
 * HARD ELIGIBILITY
 * ----------------
 * A candidate should not be represented as "recommended" when
 * the eligibility engine says NOT_ELIGIBLE.
 *
 * SOFT PREFERENCE
 * ---------------
 * Once eligibility is satisfied, preference matching determines
 * how well a career fits the candidate's priorities.
 *
 * IMPORTANT
 * ---------
 * This component does not calculate the recommendation.
 * It only presents the engine output.
 */

import {
  getRoute
} from '../config.js';

/* ============================================================
 * SAFE HELPERS
 * ============================================================
 */

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

function getNumeric(
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

function getCareerId(
  result
) {
  return (
    result?.jobId ||
    result?.careerId ||
    result?.id ||
    result?.job?.id ||
    null
  );
}

function getCareerName(
  result
) {
  return (
    firstValue(
      result,
      [
        'jobName',
        'careerName',
        'post',
        'postName',
        'name',
        'title'
      ]
    ) ||
    firstValue(
      result?.job,
      [
        'post',
        'postName',
        'name',
        'title'
      ]
    ) ||
    'Government career'
  );
}

function getGovernment(
  result
) {
  return (
    firstValue(
      result,
      [
        'governmentName',
        'government',
        'governmentId'
      ]
    ) ||
    firstValue(
      result?.job,
      [
        'governmentName',
        'government',
        'governmentId'
      ]
    )
  );
}

function getDepartment(
  result
) {
  return (
    firstValue(
      result,
      [
        'departmentName',
        'department',
        'departmentId'
      ]
    ) ||
    firstValue(
      result?.job,
      [
        'departmentName',
        'department',
        'departmentId'
      ]
    )
  );
}

function getCategory(
  result
) {
  return (
    firstValue(
      result,
      [
        'jobCategory',
        'categoryName',
        'category'
      ]
    ) ||
    firstValue(
      result?.job,
      [
        'jobCategory',
        'categoryName',
        'category'
      ]
    )
  );
}

function getEligibilityStatus(
  result
) {
  return (
    result?.eligibilityStatus ||
    result?.eligibility?.status ||
    result?.eligibility ||
    result?.job?.eligibilityStatus ||
    'UNKNOWN'
  );
}

function getConfidence(
  result
) {
  return (
    result?.confidence ||
    result?.confidenceLevel ||
    result?.job?.confidence ||
    'UNKNOWN'
  );
}

function getStatus(
  result
) {
  return (
    result?.currentStatus ||
    result?.status ||
    result?.job?.currentStatus ||
    result?.job?.status ||
    'UNKNOWN'
  );
}

function getOverallScore(
  result
) {
  return (
    getNumeric(
      result?.overallScore
    ) ??
    getNumeric(
      result?.matchScore
    ) ??
    getNumeric(
      result?.score
    ) ??
    getNumeric(
      result?.scoring?.overall
    )
  );
}

function getScoreMax(
  result
) {
  return (
    getNumeric(
      result?.overallScoreMax
    ) ??
    getNumeric(
      result?.scoreMax
    ) ??
    getNumeric(
      result?.scoring?.max
    ) ??
    100
  );
}

function getRank(
  result
) {
  const rank =
    getNumeric(
      result?.rank
    );

  if (
    rank ===
    null
  ) {
    return null;
  }

  return Math.max(
    1,
    Math.trunc(
      rank
    )
  );
}

function getRecommendationLabel(
  result
) {
  if (
    result?.recommendationLabel
  ) {
    return getLocalizedText(
      result.recommendationLabel
    );
  }

  const eligibility =
    String(
      getEligibilityStatus(
        result
      )
    )
      .toUpperCase();

  if (
    eligibility ===
      'NOT_ELIGIBLE' ||
    eligibility ===
      'NOT_ELIGIBLE_WITH_BA'
  ) {
    return 'Not recommended — eligibility barrier';
  }

  const score =
    getOverallScore(
      result
    );

  const max =
    getScoreMax(
      result
    );

  if (
    score ===
      null ||
    max <=
      0
  ) {
    return 'Recommendation available';
  }

  const percentage =
    (
      score /
      max
    ) *
    100;

  if (
    percentage >=
    80
  ) {
    return 'Excellent fit';
  }

  if (
    percentage >=
    65
  ) {
    return 'Strong fit';
  }

  if (
    percentage >=
    50
  ) {
    return 'Moderate fit';
  }

  return 'Limited fit';
}

function getExplanation(
  result
) {
  return (
    firstValue(
      result,
      [
        'explanation',
        'summary',
        'reason',
        'recommendationReason'
      ]
    ) ||
    firstValue(
      result?.explanation,
      [
        'summary',
        'reason'
      ]
    )
  );
}

/* ============================================================
 * SCORE METRIC EXTRACTION
 * ============================================================
 *
 * Different versions of the scoring engine may use different
 * property names during development. These helpers centralize
 * the UI's mapping without changing the scoring engine.
 */

const SCORE_FIELDS =
  Object.freeze({
    salary:
      [
        'salaryScore',
        'scores.salary',
        'scoring.salary'
      ],

    authority:
      [
        'authorityScore',
        'scores.authority',
        'scoring.authority'
      ],

    family:
      [
        'familyScore',
        'familyCompatibility',
        'scores.family',
        'scoring.family'
      ],

    parentCare:
      [
        'parentCareScore',
        'parentCareCompatibility',
        'scores.parentCare',
        'scoring.parentCare'
      ],

    workLife:
      [
        'workLifeScore',
        'workLife',
        'scores.workLife',
        'scoring.workLife'
      ],

    location:
      [
        'locationScore',
        'kolkataStability',
        'geographicStability',
        'scores.location',
        'scoring.location'
      ],

    safety:
      [
        'safetyScore',
        'physicalSafety',
        'scores.safety',
        'scoring.safety'
      ],

    careerGrowth:
      [
        'careerGrowthScore',
        'careerGrowth',
        'scores.careerGrowth',
        'scoring.careerGrowth'
      ]
  });

function deepGet(
  object,
  path
) {
  const parts =
    String(
      path || ''
    ).split('.');

  let current =
    object;

  for (
    const part of
      parts
  ) {
    if (
      current ===
        undefined ||
      current ===
        null
    ) {
      return undefined;
    }

    current =
      current[
        part
      ];
  }

  return current;
}

function getFirstNumeric(
  object,
  paths
) {
  if (
    !Array.isArray(
      paths
    )
  ) {
    return null;
  }

  for (
    const path of
      paths
  ) {
    const value =
      deepGet(
        object,
        path
      );

    const numeric =
      getNumeric(
        value
      );

    if (
      numeric !==
      null
    ) {
      return numeric;
    }
  }

  return null;
}

function getResultMetric(
  result,
  metric
) {
  return getFirstNumeric(
    result,
    SCORE_FIELDS[
      metric
    ] || []
  );
}

/* ============================================================
 * DESTINATION
 * ============================================================
 */

function getJobDetailsUrl(
  careerId
) {
  if (
    !careerId
  ) {
    return null;
  }

  try {
    const base =
      getRoute(
        'jobDetails'
      );

    const query =
      new URLSearchParams();

    query.set(
      'job',
      careerId
    );

    return `${base}?${query.toString()}`;
  } catch {
    return null;
  }
}

/* ============================================================
 * PRIMARY RECOMMENDATION STATE
 * ============================================================
 */

function isHardEligible(
  status
) {
  const normalized =
    String(
      status ||
        ''
    )
      .trim()
      .toUpperCase();

  return [
    'DIRECT',
    'ELIGIBLE',
    'DIRECTLY_ELIGIBLE',
    'CONDITIONAL',
    'CONDITIONALLY_ELIGIBLE'
  ].includes(
    normalized
  );
}

function isConditionallyEligible(
  status
) {
  const normalized =
    String(
      status ||
        ''
    )
      .trim()
      .toUpperCase();

  return [
    'CONDITIONAL',
    'CONDITIONALLY_ELIGIBLE'
  ].includes(
    normalized
  );
}

function isNotEligible(
  status
) {
  const normalized =
    String(
      status ||
        ''
    )
      .trim()
      .toUpperCase();

  return [
    'NOT_ELIGIBLE',
    'NOT_ELIGIBLE_WITH_BA',
    'INELIGIBLE'
  ].includes(
    normalized
  );
}

/* ============================================================
 * SCORE GRID
 * ============================================================
 */

function createMetricMarkup(
  label,
  score,
  mode =
    'positive'
) {
  if (
    score ===
    null
  ) {
    return '';
  }

  const maximum =
    10;

  const numeric =
    Math.max(
      0,
      Math.min(
        maximum,
        score
      )
    );

  const percentage =
    (
      numeric /
      maximum
    ) *
    100;

  return `
    <div
      class="career-result__metric"
      data-metric="${escapeHtml(
        label
      )}"
      data-score-mode="${escapeHtml(
        mode
      )}"
    >
      <div
        class="career-result__metric-header"
      >
        <span>
          ${escapeHtml(
            label
          )}
        </span>

        <strong>
          ${numeric}/10
        </strong>
      </div>

      <div
        class="career-result__metric-track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="10"
        aria-valuenow="${numeric}"
        aria-label="${escapeHtml(
          label
        )}: ${numeric} out of 10"
      >
        <span
          class="career-result__metric-fill career-result__metric-fill--${escapeHtml(
            mode
          )}"
          style="width:${percentage}%"
          aria-hidden="true"
        ></span>
      </div>
    </div>
  `;
}

/* ============================================================
 * MAIN RESULT MARKUP
 * ============================================================
 */

function createCareerResultMarkup(
  result,
  {
    position = null,
    compact = false,
    showMetrics = true,
    showExplanation = true,
    showActions = true
  } = {}
) {
  if (
    !result ||
    typeof result !==
      'object'
  ) {
    return `
      <article
        class="career-result career-result--invalid"
      >
        <p>
          Recommendation information is unavailable.
        </p>
      </article>
    `;
  }

  const careerId =
    getCareerId(
      result
    );

  const careerName =
    getCareerName(
      result
    );

  const government =
    getGovernment(
      result
    );

  const department =
    getDepartment(
      result
    );

  const category =
    getCategory(
      result
    );

  const eligibility =
    getEligibilityStatus(
      result
    );

  const confidence =
    getConfidence(
      result
    );

  const status =
    getStatus(
      result
    );

  const score =
    getOverallScore(
      result
    );

  const scoreMax =
    getScoreMax(
      result
    );

  const rank =
    position ??
    getRank(
      result
    );

  const explanation =
    getExplanation(
      result
    );

  const recommendationLabel =
    getRecommendationLabel(
      result
    );

  const conditionText =
    firstValue(
      result?.eligibility,
      [
        'conditionText',
        'conditions',
        'reason'
      ]
    ) ||
    firstValue(
      result,
      [
        'eligibilityCondition',
        'eligibilityReason'
      ]
    );

  const detailUrl =
    getJobDetailsUrl(
      careerId
    );

  const careerClass =
    compact
      ? 'career-result--compact'
      : '';

  const hardEligible =
    isHardEligible(
      eligibility
    );

  const conditional =
    isConditionallyEligible(
      eligibility
    );

  const blocked =
    isNotEligible(
      eligibility
    );

  return `
    <article
      class="career-result ${careerClass}"
      data-career-result
      data-career-id="${escapeHtml(
        careerId ||
          ''
      )}"
      data-eligibility="${escapeHtml(
        eligibility
      )}"
      data-status="${escapeHtml(
        status
      )}"
    >

      <div
        class="career-result__top"
      >
        <div
          class="career-result__rank"
          ${
            rank
              ? ''
              : 'hidden'
          }
          aria-label="${
            rank
              ? `Recommendation rank ${rank}`
              : ''
          }"
        >
          ${
            rank
              ? `#${escapeHtml(
                  rank
                )}`
              : ''
          }
        </div>

        <div
          class="career-result__identity"
        >
          <div
            class="career-result__icon"
            aria-hidden="true"
          >
            ${
              blocked
                ? '!'
                : '✓'
            }
          </div>

          <div>
            <div
              class="career-result__eyebrow"
            >
              ${escapeHtml(
                recommendationLabel
              )}
            </div>

            <h3
              class="career-result__title"
            >
              ${
                detailUrl
                  ? `
                    <a
                      href="${escapeHtml(
                        detailUrl
                      )}"
                    >
                      ${escapeHtml(
                        careerName
                      )}
                    </a>
                  `
                  : escapeHtml(
                      careerName
                    )
              }
            </h3>

            ${
              category
                ? `
                  <span
                    class="career-result__category"
                  >
                    ${escapeHtml(
                      category
                    )}
                  </span>
                `
                : ''
            }
          </div>
        </div>

        ${
          score !==
          null
            ? `
              <div
                class="career-result__overall-score"
              >
                <span>
                  Match
                </span>

                <strong>
                  ${escapeHtml(
                    score
                  )}/${escapeHtml(
                    scoreMax
                  )}
                </strong>
              </div>
            `
            : ''
        }
      </div>

      <div
        class="career-result__evidence"
      >
        <span
          class="career-result__eligibility"
          data-result-eligibility-slot
        >
          ${createResultEligibilityBadge(
            eligibility,
            conditionText
          )}
        </span>

        <span
          class="career-result__status"
        >
          ${createResultStatusBadge(
            status
          )}
        </span>

        <span
          class="career-result__confidence"
        >
          ${createResultConfidenceBadge(
            confidence
          )}
        </span>
      </div>

      <div
        class="career-result__meta"
      >
        ${
          government
            ? `
              <div
                class="career-result__meta-item"
              >
                <span>
                  Government
                </span>

                <strong>
                  ${escapeHtml(
                    government
                  )}
                </strong>
              </div>
            `
            : ''
        }

        ${
          department
            ? `
              <div
                class="career-result__meta-item"
              >
                <span>
                  Department
                </span>

                <strong>
                  ${escapeHtml(
                    department
                  )}
                </strong>
              </div>
            `
            : ''
        }
      </div>

      ${
        conditional &&
        conditionText
          ? `
            <div
              class="career-result__condition"
            >
              <strong>
                Condition to verify
              </strong>

              <p>
                ${escapeHtml(
                  conditionText
                )}
              </p>
            </div>
          `
          : ''
      }

      ${
        showExplanation &&
        explanation
          ? `
            <section
              class="career-result__explanation"
              aria-label="Recommendation explanation"
            >
              <h4>
                Why this appears here
              </h4>

              <p>
                ${escapeHtml(
                  explanation
                )}
              </p>
            </section>
          `
          : ''
      }

      ${
        showMetrics
          ? `
            <section
              class="career-result__metrics"
              aria-label="Preference match metrics"
            >
              ${createMetricMarkup(
                'Salary',
                getResultMetric(
                  result,
                  'salary'
                )
              )}

              ${createMetricMarkup(
                'Authority',
                getResultMetric(
                  result,
                  'authority'
                )
              )}

              ${createMetricMarkup(
                'Family',
                getResultMetric(
                  result,
                  'family'
                )
              )}

              ${createMetricMarkup(
                'Parent care',
                getResultMetric(
                  result,
                  'parentCare'
                )
              )}

              ${createMetricMarkup(
                'Work-life',
                getResultMetric(
                  result,
                  'workLife'
                )
              )}

              ${createMetricMarkup(
                'Location',
                getResultMetric(
                  result,
                  'location'
                )
              )}

              ${createMetricMarkup(
                'Safety',
                getResultMetric(
                  result,
                  'safety'
                )
              )}

              ${createMetricMarkup(
                'Career growth',
                getResultMetric(
                  result,
                  'careerGrowth'
                )
              )}
            </section>
          `
          : ''
      }

      ${
        showActions
          ? `
            <div
              class="career-result__actions"
            >
              ${
                detailUrl
                  ? `
                    <a
                      href="${escapeHtml(
                        detailUrl
                      )}"
                      class="button button--primary"
                    >
                      View Career Details
                    </a>
                  `
                  : ''
              }

              ${
                careerId
                  ? `
                    <button
                      type="button"
                      class="button button--secondary"
                      data-result-compare="${escapeHtml(
                        careerId
                      )}"
                      aria-pressed="false"
                    >
                      Compare
                    </button>

                    <button
                      type="button"
                      class="button button--ghost"
                      data-result-save="${escapeHtml(
                        careerId
                      )}"
                      aria-pressed="false"
                    >
                      Save
                    </button>
                  `
                  : ''
              }
            </div>
          `
          : ''
      }

      ${
        blocked
          ? `
            <div
              class="career-result__blocked"
              role="note"
            >
              <strong>
                Eligibility barrier
              </strong>

              <p>
                Preference matching does not override an
                essential eligibility requirement.
              </p>
            </div>
          `
          : hardEligible
            ? `
              <div
                class="career-result__eligible-note"
                role="note"
              >
                ${
                  conditional
                    ? `
                      This career remains subject to the
                      additional condition shown above.
                    `
                    : `
                      Eligibility is satisfied according
                      to the current assessment result.
                    `
                }
              </div>
            `
            : ''
      }

    </article>
  `;
}

/* ============================================================
 * SMALL INLINE BADGE ADAPTERS
 * ============================================================
 *
 * The standalone badge modules are intentionally reusable.
 * These lightweight adapters avoid importing the modules here
 * and creating a circular dependency chain.
 */

function createResultEligibilityBadge(
  status,
  conditionText
) {
  const normalized =
    String(
      status ||
        'UNKNOWN'
    )
      .trim()
      .toUpperCase();

  const metadata = {
    DIRECTLY_ELIGIBLE: {
      label:
        'Directly Eligible',
      tone:
        'positive',
      icon:
        '✓'
    },

    ELIGIBLE: {
      label:
        'Directly Eligible',
      tone:
        'positive',
      icon:
        '✓'
    },

    CONDITIONAL:
      {
        label:
          'Conditionally Eligible',
        tone:
          'caution',
        icon:
          '△'
      },

    CONDITIONALLY_ELIGIBLE:
      {
        label:
          'Conditionally Eligible',
        tone:
          'caution',
        icon:
          '△'
      },

    NOT_ELIGIBLE: {
      label:
        'Not Eligible',
      tone:
        'negative',
      icon:
        '×'
    },

    MANUAL_VERIFICATION: {
      label:
        'Verification Required',
      tone:
        'caution',
      icon:
        '?'
    },

    INSUFFICIENT_INFORMATION: {
      label:
        'Insufficient Information',
      tone:
        'caution',
      icon:
        '…'
    },

    UNKNOWN: {
      label:
        'Eligibility Not Verified',
      tone:
        'neutral',
      icon:
        '?'
    }
  };

  const meta =
    metadata[
      normalized
    ] ||
    metadata.UNKNOWN;

  return `
    <span
      class="eligibility-badge eligibility-badge--${meta.tone}"
      data-eligibility-status="${escapeHtml(
        normalized
      )}"
      title="${escapeHtml(
        conditionText ||
          ''
      )}"
    >
      <span
        class="eligibility-badge__icon"
        aria-hidden="true"
      >
        ${meta.icon}
      </span>

      <span
        class="eligibility-badge__label"
      >
        ${escapeHtml(
          meta.label
        )}
      </span>
    </span>
  `;
}

function createResultConfidenceBadge(
  confidence
) {
  const normalized =
    String(
      confidence ||
        'UNKNOWN'
    )
      .trim()
      .toUpperCase();

  const metadata = {
    HIGH:
      'High confidence',

    MEDIUM_HIGH:
      'Official historical',

    MEDIUM:
      'Official information',

    LOW:
      'Low confidence',

    ESTIMATE:
      'Current estimate',

    NOT_VERIFIED:
      'Not publicly verified',

    UNKNOWN:
      'Confidence not specified'
  };

  return `
    <span
      class="confidence-badge confidence-badge--${escapeHtml(
        normalized.toLowerCase()
      )}"
      data-confidence="${escapeHtml(
        normalized
      )}"
    >
      <span
        class="confidence-badge__label"
      >
        ${escapeHtml(
          metadata[
            normalized
          ] ||
            metadata.UNKNOWN
        )}
      </span>
    </span>
  `;
}

function createResultStatusBadge(
  status
) {
  const normalized =
    String(
      status ||
        'UNKNOWN'
    )
      .trim()
      .toUpperCase();

  const labels = {
    OPEN:
      'Open',

    ACTIVE:
      'Active',

    CURRENT:
      'Current',

    CLOSED:
      'Closed',

    UNDER_PROCESS:
      'Under Process',

    RECENTLY_COMPLETED:
      'Recently Completed',

    PERIODIC:
      'Periodic',

    IRREGULAR:
      'Irregular',

    HISTORICAL:
      'Historical',

    ABOLISHED:
      'Abolished',

    REPLACED:
      'Replaced',

    SUSPENDED:
      'Suspended',

    UNKNOWN:
      'Status not verified'
  };

  return `
    <span
      class="status-badge status-badge--result"
      data-status="${escapeHtml(
        normalized
      )}"
    >
      ${escapeHtml(
        labels[
          normalized
        ] ||
          labels.UNKNOWN
      )}
    </span>
  `;
}

/* ============================================================
 * COMPONENT FACTORY
 * ============================================================
 */

function createCareerResult(
  result,
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createCareerResultMarkup(
      result,
      options
    );

  const element =
    wrapper.firstElementChild;

  if (
    !element
  ) {
    throw new Error(
      'Unable to create career result.'
    );
  }

  return element;
}

function mountCareerResult(
  container,
  result,
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
    createCareerResult(
      result,
      options
    );

  mount.append(
    element
  );

  return element;
}

function renderCareerResults(
  container,
  results,
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
      results
    )
  ) {
    mount.innerHTML =
      '';

    return [];
  }

  mount.innerHTML =
    results
      .map(
        (
          result,
          index
        ) =>
          createCareerResultMarkup(
            result,
            {
              ...options,

              position:
                options.startRank
                  ? options.startRank +
                    index
                  : index +
                    1
            }
          )
      )
      .join('');

  return [
    ...mount.querySelectorAll(
      '[data-career-result]'
    )
  ];
}

/* ============================================================
 * INTERACTION EVENTS
 * ============================================================
 */

function initializeCareerResultInteractions() {
  document.addEventListener(
    'click',
    (event) => {
      const compare =
        event.target.closest(
          '[data-result-compare]'
        );

      if (
        compare
      ) {
        event.preventDefault();

        document.dispatchEvent(
          new CustomEvent(
            'govcareer:compare-toggle',
            {
              detail: {
                entityType:
                  'JOB',

                id:
                  compare.dataset
                    .resultCompare,

                source:
                  compare
              }
            }
          )
        );

        return;
      }

      const save =
        event.target.closest(
          '[data-result-save]'
        );

      if (
        save
      ) {
        event.preventDefault();

        document.dispatchEvent(
          new CustomEvent(
            'govcareer:bookmark-toggle',
            {
              detail: {
                entityType:
                  'JOB',

                id:
                  save.dataset
                    .resultSave,

                source:
                  save
              }
            }
          )
        );
      }
    }
  );

  document.addEventListener(
    'govcareer:compare-state',
    (event) => {
      const id =
        event.detail?.id;

      if (
        !id
      ) {
        return;
      }

      const selected =
        event.detail
          ?.selected ===
        true;

      document
        .querySelectorAll(
          `[data-result-compare="${CSS.escape(
            id
          )}"]`
        )
        .forEach(
          (button) => {
            button.setAttribute(
              'aria-pressed',
              String(
                selected
              )
            );

            button.textContent =
              selected
                ? '✓ Added'
                : 'Compare';
          }
        );
    }
  );

  document.addEventListener(
    'govcareer:bookmark-state',
    (event) => {
      if (
        event.detail?.entityType !==
        'JOB'
      ) {
        return;
      }

      const id =
        event.detail.id;

      if (
        !id
      ) {
        return;
      }

      const saved =
        event.detail
          ?.saved ===
        true;

      document
        .querySelectorAll(
          `[data-result-save="${CSS.escape(
            id
          )}"]`
        )
        .forEach(
          (button) => {
            button.setAttribute(
              'aria-pressed',
              String(
                saved
              )
            );

            button.textContent =
              saved
                ? '★ Saved'
                : 'Save';
          }
        );
    }
  );
}

export {
  createCareerResultMarkup,
  createCareerResult,
  mountCareerResult,
  renderCareerResults,

  initializeCareerResultInteractions,

  getCareerId,
  getCareerName,
  getOverallScore,
  getScoreMax,
  getResultMetric,
  getRecommendationLabel
};

export default {
  createCareerResult,
  mountCareerResult,
  renderCareerResults,
  initializeCareerResultInteractions
};
