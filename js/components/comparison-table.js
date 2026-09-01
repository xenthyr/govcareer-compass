/**
 * GovCareer Compass
 * ============================================================
 * Career Comparison Table Component
 * ============================================================
 *
 * PURPOSE:
 * Compare 2–5 careers.
 *
 * IMPORTANT:
 * Numeric direction is explicit:
 *
 *   Positive metric:
 *       higher = better
 *
 *   Negative metric:
 *       lower = better
 *
 * Examples:
 *
 *   Salary                → higher is better
 *   Authority             → higher is better
 *   Family compatibility → higher is better
 *   Safety                → higher is better
 *   Stress                → lower is better
 *   Physical risk         → lower is better
 *   Transfer burden       → lower is better
 *
 * This component does not calculate the underlying career score.
 */

const COMPARISON_METRICS =
  Object.freeze([
    {
      id:
        'eligibility',

      label:
        'B.A. English eligibility',

      type:
        'text',

      positive:
        null
    },

    {
      id:
        'government',

      label:
        'Government',

      type:
        'text',

      positive:
        null
    },

    {
      id:
        'startingBasic',

      label:
        'Starting basic',

      type:
        'currency',

      positive:
        true
    },

    {
      id:
        'payLevel',

      label:
        'Pay level',

      type:
        'text',

      positive:
        null
    },

    {
      id:
        'overallScore',

      label:
        'Overall fit',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'salaryScore',

      label:
        'Salary',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'authorityScore',

      label:
        'Authority',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'familyCompatibility',

      label:
        'Family compatibility',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'parentCareCompatibility',

      label:
        'Parent-care compatibility',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'workLifeScore',

      label:
        'Work-life balance',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'safetyScore',

      label:
        'Safety',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'stress',

      label:
        'Stress',

      type:
        'score',

      positive:
        false
    },

    {
      id:
        'physicalRisk',

      label:
        'Physical risk',

      type:
        'score',

      positive:
        false
    },

    {
      id:
        'transferBurden',

      label:
        'Transfer burden',

      type:
        'score',

      positive:
        false
    },

    {
      id:
        'kolkataStability',

      label:
        'Kolkata stability',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'geographicStability',

      label:
        'Geographic stability',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'housingScore',

      label:
        'Housing advantage',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'careerGrowthScore',

      label:
        'Career growth',

      type:
        'score',

      positive:
        true
    },

    {
      id:
        'examDifficulty',

      label:
        'Exam difficulty',

      type:
        'difficulty',

      positive:
        false
    },

    {
      id:
        'posting',

      label:
        'Posting',

      type:
        'text',

      positive:
        null
    },

    {
      id:
        'physicalTest',

      label:
        'Physical test',

      type:
        'text',

      positive:
        null
    },

    {
      id:
        'housing',

      label:
        'Housing',

      type:
        'text',

      positive:
        null
    },

    {
      id:
        'promotion',

      label:
        'Promotion',

      type:
        'text',

      positive:
        null
    },

    {
      id:
        'retirement',

      label:
        'Retirement / benefits',

      type:
        'text',

      positive:
        null
    }
  ]);

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

function numericValue(
  value
) {
  const numeric =
    Number(
      value
    );

  return Number.isFinite(
    numeric
  )
    ? numeric
    : null;
}

function getNestedValue(
  object,
  path
) {
  return String(
    path ||
      ''
  )
    .split('.')
    .reduce(
      (
        current,
        key
      ) =>
        current ===
          null ||
        current ===
          undefined
          ? undefined
          : current[
              key
            ],
      object
    );
}

const FIELD_ALIASES =
  Object.freeze({
    eligibility: [
      'eligibilityStatus',
      'baEligibility',
      'eligibility.status',
      'eligibility'
    ],

    government: [
      'governmentName',
      'government',
      'governmentId'
    ],

    startingBasic: [
      'startingBasic',
      'pay.startingBasic'
    ],

    payLevel: [
      'payLevel',
      'pay.level',
      'level'
    ],

    overallScore: [
      'overallScore',
      'matchScore',
      'score',
      'scoring.overall'
    ],

    salaryScore: [
      'salaryScore',
      'scores.salary',
      'scoring.salary'
    ],

    authorityScore: [
      'authorityScore',
      'authority',
      'scores.authority',
      'scoring.authority'
    ],

    familyCompatibility: [
      'familyCompatibility',
      'familyScore',
      'scores.family',
      'scoring.family'
    ],

    parentCareCompatibility: [
      'parentCareCompatibility',
      'parentCareScore',
      'scores.parentCare',
      'scoring.parentCare'
    ],

    workLifeScore: [
      'workLifeScore',
      'workLife',
      'scores.workLife',
      'scoring.workLife'
    ],

    safetyScore: [
      'safetyScore',
      'physicalSafety',
      'scores.safety',
      'scoring.safety'
    ],

    stress: [
      'stress',
      'stressScore',
      'scores.stress',
      'scoring.stress'
    ],

    physicalRisk: [
      'physicalRisk',
      'risk',
      'scores.physicalRisk',
      'scoring.physicalRisk'
    ],

    transferBurden: [
      'transferBurden',
      'transferScore',
      'scores.transferBurden',
      'scoring.transferBurden'
    ],

    kolkataStability: [
      'kolkataStability',
      'scores.kolkataStability',
      'scoring.kolkataStability'
    ],

    geographicStability: [
      'geographicStability',
      'locationStability',
      'scores.geographicStability',
      'scoring.geographicStability'
    ],

    housingScore: [
      'housingScore',
      'scores.housing',
      'scoring.housing'
    ],

    careerGrowthScore: [
      'careerGrowthScore',
      'careerGrowth',
      'scores.careerGrowth',
      'scoring.careerGrowth'
    ],

    examDifficulty: [
      'examDifficulty',
      'difficulty',
      'exam.difficulty'
    ],

    posting: [
      'posting',
      'location',
      'locationName'
    ],

    physicalTest: [
      'physicalTest',
      'physicalRequirement'
    ],

    housing: [
      'housing',
      'housingSummary',
      'quarter'
    ],

    promotion: [
      'promotion',
      'promotionSummary'
    ],

    retirement: [
      'retirement',
      'benefitsSummary',
      'benefits'
    ]
  });

function resolveField(
  career,
  metricId
) {
  const paths =
    FIELD_ALIASES[
      metricId
    ] || [
      metricId
    ];

  for (
    const path of
      paths
  ) {
    const value =
      getNestedValue(
        career,
        path
      );

    if (
      value !==
        undefined &&
      value !==
        null &&
      value !==
        ''
    ) {
      return value;
    }
  }

  return null;
}

function formatCurrency(
  value
) {
  const numeric =
    numericValue(
      value
    );

  return numeric ===
    null
    ? '—'
    : `₹${numeric.toLocaleString(
        'en-IN'
      )}`;
}

function formatMetric(
  metric,
  value
) {
  if (
    value ===
      null ||
    value ===
      undefined ||
    value ===
      ''
  ) {
    return '—';
  }

  switch (
    metric.type
  ) {
    case 'currency':
      return formatCurrency(
        value
      );

    case 'score': {
      const numeric =
        numericValue(
          value
        );

      return numeric ===
        null
        ? '—'
        : `${numeric}/10`;
    }

    case 'difficulty':
      return String(
        value
      );

    default:
      return String(
        typeof value ===
          'object'
          ? JSON.stringify(
              value
            )
          : value
      );
  }
}

function getComparableValue(
  metric,
  career
) {
  if (
    ![
      'currency',
      'score'
    ].includes(
      metric.type
    )
  ) {
    return null;
  }

  return numericValue(
    resolveField(
      career,
      metric.id
    )
  );
}

function findBestCareerIndexes(
  metric,
  careers
) {
  if (
    metric.positive ===
      null ||
    !Array.isArray(
      careers
    )
  ) {
    return [];
  }

  const values =
    careers.map(
      (
        career
      ) =>
        getComparableValue(
          metric,
          career
        )
    );

  const valid =
    values.filter(
      (
        value
      ) =>
        value !==
        null
    );

  if (
    valid.length <
    2
  ) {
    return [];
  }

  const best =
    metric.positive
      ? Math.max(
          ...valid
        )
      : Math.min(
          ...valid
        );

  return values
    .map(
      (
        value,
        index
      ) =>
        value ===
        best
          ? index
          : -1
    )
    .filter(
      (
        index
      ) =>
        index >=
        0
    );
}

function createComparisonTableMarkup(
  {
    careers = [],

    metrics =
      COMPARISON_METRICS,

    stickyFirstColumn =
      true,

    highlightBest =
      true
  } = {}
) {
  const selected =
    Array.isArray(
      careers
    )
      ? careers.slice(
          0,
          5
        )
      : [];

  if (
    selected.length ===
    0
  ) {
    return `
      <div
        class="comparison-table comparison-table--empty"
        data-comparison-table
      >
        <div
          class="comparison-table__empty"
          role="status"
        >
          Select careers to compare.
        </div>
      </div>
    `;
  }

  const metricList =
    Array.isArray(
      metrics
    ) &&
    metrics.length
      ? metrics
      : [
          ...COMPARISON_METRICS
        ];

  const headerCells =
    selected
      .map(
        (
          career,
          index
        ) => {
          const title =
            career.name ||
            career.post ||
            career.postName ||
            career.title ||
            career.id ||
            `Career ${
              index + 1
            }`;

          const government =
            career.governmentName ||
            career.government ||
            '';

          const id =
            escapeHtml(
              career.id ||
                ''
            );

          return `
            <th
              scope="col"
              class="comparison-table__career"
              data-career-index="${index}"
            >
              <div
                class="comparison-table__career-header"
              >
                ${
                  career.id
                    ? `
                      <button
                        type="button"
                        class="comparison-table__remove"
                        data-comparison-remove="${id}"
                        aria-label="Remove ${escapeHtml(
                          title
                        )} from comparison"
                        title="Remove"
                      >
                        ×
                      </button>
                    `
                    : ''
                }

                <strong
                  class="comparison-table__career-name"
                >
                  ${escapeHtml(
                    title
                  )}
                </strong>

                ${
                  government
                    ? `
                      <span
                        class="comparison-table__career-government"
                      >
                        ${escapeHtml(
                          government
                        )}
                      </span>
                    `
                    : ''
                }
              </div>
            </th>
          `;
        }
      )
      .join('');

  const rows =
    metricList
      .map(
        (
          metric
        ) => {
          const winners =
            highlightBest
              ? findBestCareerIndexes(
                  metric,
                  selected
                )
              : [];

          const direction =
            metric.positive ===
            true
              ? 'Higher is better'
              : metric.positive ===
                false
              ? 'Lower is better'
              : '';

          const cells =
            selected
              .map(
                (
                  career,
                  index
                ) => {
                  const value =
                    resolveField(
                      career,
                      metric.id
                    );

                  const formatted =
                    formatMetric(
                      metric,
                      value
                    );

                  const isBest =
                    winners.includes(
                      index
                    );

                  return `
                    <td
                      class="${
                        isBest
                          ? 'is-best'
                          : ''
                      }"
                      data-comparison-cell
                      data-career-index="${index}"
                      data-metric="${escapeHtml(
                        metric.id
                      )}"
                    >
                      <span
                        class="comparison-table__value"
                      >
                        ${escapeHtml(
                          formatted
                        )}
                      </span>

                      ${
                        isBest
                          ? `
                            <span
                              class="comparison-table__best-label"
                            >
                              Best
                            </span>
                          `
                          : ''
                      }
                    </td>
                  `;
                }
              )
              .join('');

          return `
            <tr
              data-comparison-row="${escapeHtml(
                metric.id
              )}"
            >
              <th
                scope="row"
                class="comparison-table__metric ${
                  stickyFirstColumn
                    ? 'comparison-table__metric--sticky'
                    : ''
                }"
              >
                <span
                  class="comparison-table__metric-name"
                >
                  ${escapeHtml(
                    metric.label
                  )}
                </span>

                ${
                  direction
                    ? `
                      <span
                        class="comparison-table__direction"
                      >
                        ${direction}
                      </span>
                    `
                    : ''
                }
              </th>

              ${cells}
            </tr>
          `;
        }
      )
      .join('');

  return `
    <div
      class="comparison-table-wrapper"
      data-comparison-wrapper
    >
      <div
        class="comparison-table__legend"
        role="note"
      >
        <span>
          For directional metrics, “Best” follows the
          project's defined metric direction. Stress,
          risk and transfer burden use lower-is-better logic.
        </span>
      </div>

      <div
        class="comparison-table__scroll"
        tabindex="0"
        role="region"
        aria-label="Career comparison table"
      >
        <table
          class="comparison-table"
          data-comparison-table
        >
          <thead>
            <tr>
              <th
                scope="col"
                class="comparison-table__metric-header ${
                  stickyFirstColumn
                    ? 'comparison-table__metric--sticky'
                    : ''
                }"
              >
                Metric
              </th>

              ${headerCells}
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function createComparisonTable(
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createComparisonTableMarkup(
      options
    );

  const element =
    wrapper.firstElementChild;

  if (
    !element
  ) {
    throw new Error(
      'Unable to create comparison table.'
    );
  }

  bindComparisonEvents(
    element
  );

  return element;
}

function mountComparisonTable(
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

  const table =
    createComparisonTable(
      options
    );

  mount.append(
    table
  );

  return table;
}

function updateComparisonTable(
  root,
  options = {}
) {
  if (
    !root
  ) {
    return null;
  }

  const wrapper =
    root.matches(
      '[data-comparison-wrapper]'
    )
      ? root
      : root.closest(
          '[data-comparison-wrapper]'
        );

  if (
    !wrapper
  ) {
    return null;
  }

  const replacement =
    document.createElement(
      'div'
    );

  replacement.innerHTML =
    createComparisonTableMarkup(
      options
    );

  const next =
    replacement.firstElementChild;

  if (
    !next
  ) {
    return null;
  }

  wrapper.replaceWith(
    next
  );

  bindComparisonEvents(
    next
  );

  return next;
}

function bindComparisonEvents(
  root
) {
  if (
    root.dataset
      .comparisonEventsBound ===
    'true'
  ) {
    return;
  }

  root.dataset
    .comparisonEventsBound =
    'true';

  root.addEventListener(
    'click',
    (
      event
    ) => {
      const button =
        event.target.closest(
          '[data-comparison-remove]'
        );

      if (
        !button
      ) {
        return;
      }

      const id =
        button.dataset
          .comparisonRemove;

      if (
        !id
      ) {
        return;
      }

      const detail = {
        id,

        entityType:
          'JOB',

        reason:
          'comparison-remove'
      };

      root.dispatchEvent(
        new CustomEvent(
          'govcareer:comparison-remove',
          {
            bubbles:
              true,

            detail
          }
        )
      );

      document.dispatchEvent(
        new CustomEvent(
          'govcareer:comparison-remove',
          {
            detail
          }
        )
      );
    }
  );
}

function initializeComparisonTables() {
  document
    .querySelectorAll(
      '[data-comparison-table]'
    )
    .forEach(
      (
        root
      ) => {
        bindComparisonEvents(
          root
        );
      }
    );
}

export {
  COMPARISON_METRICS,

  getNestedValue,
  resolveField,
  formatMetric,
  findBestCareerIndexes,

  createComparisonTableMarkup,
  createComparisonTable,
  mountComparisonTable,
  updateComparisonTable,

  initializeComparisonTables
};

export default {
  createComparisonTable,
  mountComparisonTable,
  updateComparisonTable,
  initializeComparisonTables
};
