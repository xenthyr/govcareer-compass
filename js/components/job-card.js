/**
 * GovCareer Compass
 * ============================================================
 * Job Card Component
 * ============================================================
 *
 * Purpose:
 * Render a compact but information-rich government job record.
 *
 * The component intentionally does not calculate:
 * - eligibility;
 * - salary;
 * - recommendation score;
 * - legal authority.
 *
 * Those remain the responsibility of their dedicated engines.
 */

import {
  getRoute
} from '../config.js';

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

function getJobTitle(
  job
) {
  return (
    firstValue(
      job,
      [
        'post',
        'postName',
        'name',
        'title'
      ]
    ) ||
    job?.id ||
    'Government job'
  );
}

function getJobDescription(
  job
) {
  return firstValue(
    job,
    [
      'shortDescription',
      'summary',
      'description',
      'jobProfile'
    ]
  );
}

function getEligibility(
  job
) {
  return (
    job?.eligibilityStatus ??
    job?.baEligibility ??
    job?.eligibility ??
    'UNKNOWN'
  );
}

function normalizeEligibility(
  value
) {
  const normalized =
    String(
      value || 'UNKNOWN'
    )
      .trim()
      .toUpperCase();

  if (
    [
      'DIRECT',
      'DIRECTLY_ELIGIBLE',
      'ELIGIBLE',
      'BA_ELIGIBLE'
    ].includes(
      normalized
    )
  ) {
    return 'DIRECT';
  }

  if (
    [
      'CONDITIONAL',
      'CONDITIONALLY_ELIGIBLE'
    ].includes(
      normalized
    )
  ) {
    return 'CONDITIONAL';
  }

  if (
    [
      'NOT_ELIGIBLE',
      'NOT_ELIGIBLE_WITH_BA',
      'INELIGIBLE'
    ].includes(
      normalized
    )
  ) {
    return 'NOT_ELIGIBLE';
  }

  if (
    normalized ===
    'MANUAL_VERIFICATION'
  ) {
    return 'MANUAL_VERIFICATION';
  }

  return 'UNKNOWN';
}

function getPayText(
  job
) {
  const payLevel =
    firstValue(
      job,
      [
        'payLevel',
        'level'
      ]
    );

  const startingBasic =
    job?.startingBasic ??
    job?.pay?.startingBasic;

  const maximumBasic =
    job?.maximumBasic ??
    job?.pay?.maximumBasic;

  const system =
    firstValue(
      job,
      [
        'paySystem',
        'paySystemId'
      ]
    );

  const parts =
    [];

  if (
    system
  ) {
    parts.push(
      system
    );
  }

  if (
    payLevel
  ) {
    parts.push(
      `Level ${payLevel}`
    );
  }

  if (
    Number.isFinite(
      Number(
        startingBasic
      )
    )
  ) {
    parts.push(
      `₹${Number(
        startingBasic
      ).toLocaleString(
        'en-IN'
      )} starting basic`
    );
  }

  if (
    Number.isFinite(
      Number(
        maximumBasic
      )
    )
  ) {
    parts.push(
      `₹${Number(
        maximumBasic
      ).toLocaleString(
        'en-IN'
      )} maximum basic`
    );
  }

  return (
    parts.join(
      ' · '
    ) ||
    'Pay information not yet verified'
  );
}

function getRouteForJob(
  jobId
) {
  try {
    const base =
      getRoute(
        'jobDetails'
      );

    const query =
      new URLSearchParams();

    query.set(
      'job',
      jobId
    );

    return `${base}?${query.toString()}`;
  } catch {
    return null;
  }
}

function getConfidence(
  job
) {
  return (
    job?.confidence ||
    'UNKNOWN'
  );
}

function getCurrentStatus(
  job
) {
  return (
    job?.currentStatus ||
    job?.status ||
    'UNKNOWN'
  );
}

function getLocation(
  job
) {
  return firstValue(
    job,
    [
      'posting',
      'location',
      'locationName'
    ]
  );
}

function getCategory(
  job
) {
  return firstValue(
    job,
    [
      'jobCategory',
      'category',
      'categoryName'
    ]
  );
}

/* ============================================================
 * BADGES
 * ============================================================
 */

function createEligibilityBadge(
  eligibility
) {
  const normalized =
    normalizeEligibility(
      eligibility
    );

  const labels = {
    DIRECT:
      'BA English Eligible',

    CONDITIONAL:
      'Conditionally Eligible',

    NOT_ELIGIBLE:
      'Not Eligible',

    MANUAL_VERIFICATION:
      'Verification Required',

    UNKNOWN:
      'Eligibility Not Verified'
  };

  return `
    <span
      class="status-badge status-badge--eligibility eligibility-${normalized.toLowerCase()}"
      data-eligibility-status="${normalized}"
    >
      ${labels[
        normalized
      ]}
    </span>
  `;
}

function createConfidenceBadge(
  confidence
) {
  const normalized =
    String(
      confidence ||
        'UNKNOWN'
    )
      .trim()
      .toUpperCase();

  const labels = {
    HIGH:
      'High confidence',

    MEDIUM_HIGH:
      'Official historical',

    MEDIUM:
      'Official information',

    LOW:
      'Low confidence',

    ESTIMATE:
      'Estimate',

    NOT_VERIFIED:
      'Not publicly verified',

    UNKNOWN:
      'Confidence not specified'
  };

  return `
    <span
      class="confidence-badge confidence-${normalized.toLowerCase()}"
    >
      ${labels[
        normalized
      ] ||
        escapeHtml(
          confidence
        )}
    </span>
  `;
}

function createStatusBadge(
  status
) {
  const normalized =
    String(
      status ||
        'UNKNOWN'
    )
      .trim()
      .toUpperCase();

  const labelMap = {
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

    UNKNOWN:
      'Status not verified'
  };

  return `
    <span
      class="status-badge status-${normalized.toLowerCase()}"
    >
      ${labelMap[
        normalized
      ] ||
        escapeHtml(
          status
        )}
    </span>
  `;
}

/* ============================================================
 * SCORE HELPERS
 * ============================================================
 */

function scoreValue(
  value
) {
  const number =
    Number(
      value
    );

  return Number.isFinite(
    number
  )
    ? Math.max(
        0,
        Math.min(
          10,
          number
        )
      )
    : null;
}

function createMiniScore(
  label,
  value,
  negative =
    false
) {
  const score =
    scoreValue(
      value
    );

  if (
    score ===
    null
  ) {
    return '';
  }

  return `
    <div
      class="job-card__score"
      data-negative-metric="${negative}"
    >
      <span
        class="job-card__score-label"
      >
        ${escapeHtml(
          label
        )}
      </span>

      <strong
        class="job-card__score-value"
      >
        ${score}/10
      </strong>
    </div>
  `;
}

/* ============================================================
 * CARD MARKUP
 * ============================================================
 */

function createJobCardMarkup(
  job,
  {
    compact = false,
    showScores = true,
    showDescription = true
  } = {}
) {
  if (
    !job ||
    typeof job !==
      'object'
  ) {
    return `
      <article
        class="job-card job-card--invalid"
      >
        <p>
          Job information is unavailable.
        </p>
      </article>
    `;
  }

  const title =
    getJobTitle(
      job
    );

  const government =
    firstValue(
      job,
      [
        'governmentName',
        'government',
        'governmentId'
      ]
    );

  const department =
    firstValue(
      job,
      [
        'departmentName',
        'department',
        'departmentId'
      ]
    );

  const organisation =
    firstValue(
      job,
      [
        'organisationName',
        'organisation',
        'organisationId'
      ]
    );

  const exam =
    firstValue(
      job,
      [
        'examName',
        'exam',
        'examId'
      ]
    );

  const category =
    getCategory(
      job
    );

  const location =
    getLocation(
      job
    );

  const description =
    getJobDescription(
      job
    );

  const eligibility =
    getEligibility(
      job
    );

  const confidence =
    getConfidence(
      job
    );

  const status =
    getCurrentStatus(
      job
    );

  const destination =
    job.id
      ? getRouteForJob(
          job.id
        )
      : null;

  const familyScore =
    job.familyCompatibility;

  const parentScore =
    job.parentCareCompatibility;

  const workLifeScore =
    job.workLife;

  const safetyScore =
    job.physicalSafety;

  const authorityScore =
    job.authority;

  const jobId =
    escapeHtml(
      job.id ||
        ''
    );

  const articleClasses = [
    'job-card',
    compact
      ? 'job-card--compact'
      : ''
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <article
      class="${articleClasses}"
      data-job-card
      data-job-id="${jobId}"
      data-government-id="${escapeHtml(
        job.governmentId ||
          ''
      )}"
      data-department-id="${escapeHtml(
        job.departmentId ||
          ''
      )}"
      data-service-cadre-id="${escapeHtml(
        job.serviceCadreId ||
          ''
      )}"
      data-eligibility="${escapeHtml(
        normalizeEligibility(
          eligibility
        )
      )}"
    >

      <div
        class="job-card__top"
      >
        <div
          class="job-card__badges"
        >
          ${createEligibilityBadge(
            eligibility
          )}

          ${createStatusBadge(
            status
          )}
        </div>

        <div
          class="job-card__actions"
        >
          <button
            type="button"
            class="icon-button"
            data-bookmark-job="${jobId}"
            aria-label="Save ${escapeHtml(
              title
            )}"
            aria-pressed="false"
            title="Save career"
          >
            ☆
          </button>

          <button
            type="button"
            class="icon-button"
            data-compare-job="${jobId}"
            aria-label="Add ${escapeHtml(
              title
            )} to comparison"
            aria-pressed="false"
            title="Compare"
          >
            ⇄
          </button>
        </div>
      </div>

      <div
        class="job-card__identity"
      >
        <div
          class="job-card__monogram"
          aria-hidden="true"
        >
          ${escapeHtml(
            title
              .split(
                /\s+/
              )
              .slice(
                0,
                2
              )
              .map(
                (word) =>
                  word.charAt(
                    0
                  )
              )
              .join('')
              .toUpperCase()
          )}
        </div>

        <div
          class="job-card__heading"
        >
          <h3
            class="job-card__title"
          >
            ${
              destination
                ? `
                  <a
                    href="${escapeHtml(
                      destination
                    )}"
                    data-route="jobDetails"
                    data-job-link="${jobId}"
                  >
                    ${escapeHtml(
                      title
                    )}
                  </a>
                `
                : escapeHtml(
                    title
                  )
            }
          </h3>

          ${
            category
              ? `
                <span
                  class="job-card__category"
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

      <div
        class="job-card__meta"
      >
        ${
          government
            ? `
              <div class="job-card__meta-item">
                <span class="job-card__meta-label">
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
              <div class="job-card__meta-item">
                <span class="job-card__meta-label">
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

        ${
          organisation
            ? `
              <div class="job-card__meta-item">
                <span class="job-card__meta-label">
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
          exam
            ? `
              <div class="job-card__meta-item">
                <span class="job-card__meta-label">
                  Recruitment
                </span>
                <strong>
                  ${escapeHtml(
                    exam
                  )}
                </strong>
              </div>
            `
            : ''
        }
      </div>

      <div
        class="job-card__pay"
      >
        <span
          class="job-card__pay-label"
        >
          Pay
        </span>

        <strong
          class="job-card__pay-value"
        >
          ${escapeHtml(
            getPayText(
              job
            )
          )}
        </strong>
      </div>

      ${
        location
          ? `
            <div
              class="job-card__location"
            >
              <span
                aria-hidden="true"
              >
                ◉
              </span>

              <span>
                ${escapeHtml(
                  location
                )}
              </span>
            </div>
          `
          : ''
      }

      ${
        showDescription &&
        description
          ? `
            <p
              class="job-card__description"
            >
              ${escapeHtml(
                description
              )}
            </p>
          `
          : ''
      }

      ${
        showScores
          ? `
            <div
              class="job-card__scores"
              aria-label="Career assessment indicators"
            >
              ${createMiniScore(
                'Family',
                familyScore
              )}

              ${createMiniScore(
                'Parents',
                parentScore
              )}

              ${createMiniScore(
                'Work-life',
                workLifeScore
              )}

              ${createMiniScore(
                'Safety',
                safetyScore
              )}

              ${createMiniScore(
                'Authority',
                authorityScore
              )}
            </div>
          `
          : ''
      }

      <div
        class="job-card__footer"
      >
        <div
          class="job-card__evidence"
        >
          ${createConfidenceBadge(
            confidence
          )}
        </div>

        <div
          class="job-card__buttons"
        >
          ${
            destination
              ? `
                <a
                  href="${escapeHtml(
                    destination
                  )}"
                  class="button button--primary button--small"
                  data-route="jobDetails"
                >
                  View Details
                </a>
              `
              : ''
          }

          <button
            type="button"
            class="button button--secondary button--small"
            data-job-view-details="${jobId}"
          >
            Full Profile
          </button>
        </div>
      </div>

    </article>
  `;
}

/* ============================================================
 * COMPONENT FACTORY
 * ============================================================
 */

function createJobCard(
  job,
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createJobCardMarkup(
      job,
      options
    );

  const card =
    wrapper.firstElementChild;

  if (
    !card
  ) {
    throw new Error(
      'Unable to create job card.'
    );
  }

  return card;
}

function mountJobCard(
  container,
  job,
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
    createJobCard(
      job,
      options
    );

  mount.append(
    card
  );

  return card;
}

function renderJobCards(
  container,
  jobs,
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
      jobs
    )
  ) {
    mount.innerHTML =
      '';

    return [];
  }

  mount.innerHTML =
    jobs
      .map(
        (job) =>
          createJobCardMarkup(
            job,
            options
          )
      )
      .join('');

  return [
    ...mount.querySelectorAll(
      '[data-job-card]'
    )
  ];
}

/* ============================================================
 * INTEGRATION EVENTS
 * ============================================================
 */

function initializeJobCardInteractions() {
  document.addEventListener(
    'click',
    (event) => {
      const bookmark =
        event.target.closest(
          '[data-bookmark-job]'
        );

      if (
        bookmark
      ) {
        const jobId =
          bookmark.dataset
            .bookmarkJob;

        document.dispatchEvent(
          new CustomEvent(
            'govcareer:bookmark-toggle',
            {
              detail: {
                entityType:
                  'JOB',
                id:
                  jobId,
                source:
                  bookmark
              }
            }
          )
        );

        return;
      }

      const compare =
        event.target.closest(
          '[data-compare-job]'
        );

      if (
        compare
      ) {
        const jobId =
          compare.dataset
            .compareJob;

        document.dispatchEvent(
          new CustomEvent(
            'govcareer:compare-toggle',
            {
              detail: {
                entityType:
                  'JOB',
                id:
                  jobId,
                source:
                  compare
              }
            }
          )
        );

        return;
      }

      const fullProfile =
        event.target.closest(
          '[data-job-view-details]'
        );

      if (
        fullProfile
      ) {
        const jobId =
          fullProfile.dataset
            .jobViewDetails;

        document.dispatchEvent(
          new CustomEvent(
            'govcareer:job-details-request',
            {
              detail: {
                jobId
              }
            }
          )
        );
      }
    }
  );

  document.addEventListener(
    'govcareer:bookmark-state',
    (event) => {
      const jobId =
        event.detail?.id;

      const saved =
        event.detail?.saved ===
        true;

      if (
        !jobId
      ) {
        return;
      }

      document
        .querySelectorAll(
          `[data-bookmark-job="${CSS.escape(
            jobId
          )}"]`
        )
        .forEach(
          (button) => {
            button.textContent =
              saved
                ? '★'
                : '☆';

            button.setAttribute(
              'aria-pressed',
              String(
                saved
              )
            );

            button.setAttribute(
              'title',
              saved
                ? 'Remove from saved careers'
                : 'Save career'
            );
          }
        );
    }
  );

  document.addEventListener(
    'govcareer:compare-state',
    (event) => {
      const jobId =
        event.detail?.id;

      const selected =
        event.detail?.selected ===
        true;

      if (
        !jobId
      ) {
        return;
      }

      document
        .querySelectorAll(
          `[data-compare-job="${CSS.escape(
            jobId
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
                ? '✓'
                : '⇄';
          }
        );
    }
  );
}

export {
  createJobCardMarkup,
  createJobCard,
  mountJobCard,
  renderJobCards,
  initializeJobCardInteractions,

  normalizeEligibility,
  getEligibility,
  getJobTitle,
  getPayText
};

export default {
  createJobCard,
  mountJobCard,
  renderJobCards,
  initializeJobCardInteractions
};
