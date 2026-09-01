/**
 * GovCareer Compass
 * ============================================================
 * Exam Card Component
 * ============================================================
 *
 * Displays an examination/recruitment route without confusing
 * the examination with the individual posts recruited through it.
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

function getExamTitle(
  exam
) {
  return (
    firstValue(
      exam,
      [
        'name',
        'examName',
        'title'
      ]
    ) ||
    exam?.id ||
    'Government examination'
  );
}

function getExamFullForm(
  exam
) {
  return firstValue(
    exam,
    [
      'fullForm',
      'fullName'
    ]
  );
}

function getExamDifficulty(
  exam
) {
  return firstValue(
    exam,
    [
      'difficulty',
      'difficultyLevel'
    ]
  );
}

function getExamStatus(
  exam
) {
  return (
    exam?.currentStatus ||
    exam?.status ||
    'UNKNOWN'
  );
}

function getRecruitingAuthority(
  exam
) {
  return firstValue(
    exam,
    [
      'recruitingAuthorityName',
      'recruitingAuthority',
      'authorityName',
      'authority'
    ]
  );
}

function getQualificationText(
  exam
) {
  return firstValue(
    exam,
    [
      'qualification',
      'minimumQualification',
      'qualificationSummary'
    ]
  );
}

function getStages(
  exam
) {
  const stages =
    exam?.stages ||
    exam?.selectionStages ||
    [];

  if (
    !Array.isArray(
      stages
    )
  ) {
    return [];
  }

  return stages
    .map(
      (stage) =>
        getLocalizedText(
          stage?.name ||
            stage?.title ||
            stage
        )
    )
    .filter(Boolean);
}

function getPhysicalRequirement(
  exam
) {
  if (
    exam?.physicalTest ===
    true ||
    exam?.physicalRequired ===
    true
  ) {
    return 'Physical test required';
  }

  if (
    exam?.physicalTest ===
    false ||
    exam?.physicalRequired ===
    false
  ) {
    return 'No physical test specified';
  }

  return 'Physical requirement not verified';
}

function getExamRoute(
  examId
) {
  if (
    !examId
  ) {
    return null;
  }

  try {
    const base =
      getRoute(
        'examDetails'
      );

    const query =
      new URLSearchParams();

    query.set(
      'exam',
      examId
    );

    return `${base}?${query.toString()}`;
  } catch {
    return null;
  }
}

/* ============================================================
 * STATUS / BADGES
 * ============================================================
 */

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

    UNKNOWN:
      'Status not verified'
  };

  return `
    <span
      class="status-badge status-${normalized.toLowerCase()}"
    >
      ${labels[
        normalized
      ] ||
        escapeHtml(
          status
        )}
    </span>
  `;
}

function createDifficultyBadge(
  difficulty
) {
  if (
    !difficulty
  ) {
    return '';
  }

  return `
    <span
      class="exam-card__difficulty"
      data-difficulty="${escapeHtml(
        difficulty
      )}"
    >
      ${escapeHtml(
        difficulty
      )}
    </span>
  `;
}

/* ============================================================
 * CARD MARKUP
 * ============================================================
 */

function createExamCardMarkup(
  exam,
  {
    compact = false,
    showStages = true,
    showQualification =
      true
  } = {}
) {
  if (
    !exam ||
    typeof exam !==
      'object'
  ) {
    return `
      <article
        class="exam-card exam-card--invalid"
      >
        <p>
          Examination information is unavailable.
        </p>
      </article>
    `;
  }

  const title =
    getExamTitle(
      exam
    );

  const fullForm =
    getExamFullForm(
      exam
    );

  const authority =
    getRecruitingAuthority(
      exam
    );

  const qualification =
    getQualificationText(
      exam
    );

  const difficulty =
    getExamDifficulty(
      exam
    );

  const status =
    getExamStatus(
      exam
    );

  const stages =
    getStages(
      exam
    );

  const physical =
    getPhysicalRequirement(
      exam
    );

  const year =
    exam.year ??
    exam.notificationYear ??
    '';

  const government =
    firstValue(
      exam,
      [
        'governmentName',
        'government',
        'governmentId'
      ]
    );

  const frequency =
    firstValue(
      exam,
      [
        'frequency',
        'recruitmentFrequency'
      ]
    );

  const destination =
    getExamRoute(
      exam.id
    );

  const postIds =
    Array.isArray(
      exam.postIds
    )
      ? exam.postIds
      : [];

  const examId =
    escapeHtml(
      exam.id ||
        ''
    );

  const classes = [
    'exam-card',
    compact
      ? 'exam-card--compact'
      : ''
  ]
    .filter(Boolean)
    .join(' ');

  return `
    <article
      class="${classes}"
      data-exam-card
      data-exam-id="${examId}"
    >

      <div
        class="exam-card__top"
      >
        <div
          class="exam-card__badges"
        >
          ${createStatusBadge(
            status
          )}

          ${createDifficultyBadge(
            difficulty
          )}
        </div>

        <div
          class="exam-card__actions"
        >
          <button
            type="button"
            class="icon-button"
            data-bookmark-exam="${examId}"
            aria-label="Save ${escapeHtml(
              title
            )}"
            aria-pressed="false"
            title="Save examination"
          >
            ☆
          </button>
        </div>
      </div>

      <div
        class="exam-card__heading"
      >
        <div
          class="exam-card__symbol"
          aria-hidden="true"
        >
          E
        </div>

        <div>
          <h3
            class="exam-card__title"
          >
            ${
              destination
                ? `
                  <a
                    href="${escapeHtml(
                      destination
                    )}"
                    data-route="examDetails"
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
            fullForm &&
            fullForm !==
              title
              ? `
                <p
                  class="exam-card__full-form"
                >
                  ${escapeHtml(
                    fullForm
                  )}
                </p>
              `
              : ''
          }
        </div>
      </div>

      <div
        class="exam-card__meta"
      >
        ${
          government
            ? `
              <div
                class="exam-card__meta-item"
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
          authority
            ? `
              <div
                class="exam-card__meta-item"
              >
                <span>
                  Recruiting authority
                </span>

                <strong>
                  ${escapeHtml(
                    authority
                  )}
                </strong>
              </div>
            `
            : ''
        }

        ${
          year
            ? `
              <div
                class="exam-card__meta-item"
              >
                <span>
                  Year
                </span>

                <strong>
                  ${escapeHtml(
                    year
                  )}
                </strong>
              </div>
            `
            : ''
        }

        ${
          frequency
            ? `
              <div
                class="exam-card__meta-item"
              >
                <span>
                  Frequency
                </span>

                <strong>
                  ${escapeHtml(
                    frequency
                  )}
                </strong>
              </div>
            `
            : ''
        }
      </div>

      ${
        showQualification &&
        qualification
          ? `
            <div
              class="exam-card__qualification"
            >
              <span
                class="exam-card__section-label"
              >
                Qualification
              </span>

              <p>
                ${escapeHtml(
                  qualification
                )}
              </p>
            </div>
          `
          : ''
      }

      ${
        showStages
          ? `
            <div
              class="exam-card__selection"
            >
              <span
                class="exam-card__section-label"
              >
                Selection
              </span>

              <div
                class="exam-card__stage-list"
              >
                ${
                  stages.length
                    ? stages
                        .slice(
                          0,
                          6
                        )
                        .map(
                          (
                            stage,
                            index
                          ) => `
                            <span
                              class="exam-card__stage"
                            >
                              <small>
                                ${index +
                                  1}
                              </small>
                              ${escapeHtml(
                                stage
                              )}
                            </span>
                          `
                        )
                        .join('')
                    : `
                      <span
                        class="exam-card__unknown"
                      >
                        Selection stages not yet verified
                      </span>
                    `
                }
              </div>
            </div>
          `
          : ''
      }

      <div
        class="exam-card__physical"
      >
        <span
          class="exam-card__section-label"
        >
          Physical
        </span>

        <strong>
          ${escapeHtml(
            physical
          )}
        </strong>
      </div>

      <div
        class="exam-card__footer"
      >
        <div
          class="exam-card__post-count"
        >
          ${
            postIds.length
              ? `
                <span>
                  ${postIds.length}
                </span>
                post${
                  postIds.length ===
                  1
                    ? ''
                    : 's'
                } linked
              `
              : `
                Posts linked:
                not yet indexed
              `
          }
        </div>

        <div
          class="exam-card__buttons"
        >
          ${
            destination
              ? `
                <a
                  href="${escapeHtml(
                    destination
                  )}"
                  class="button button--primary button--small"
                  data-route="examDetails"
                >
                  Explore Exam
                </a>
              `
              : ''
          }

          <button
            type="button"
            class="button button--secondary button--small"
            data-exam-view-details="${examId}"
          >
            Full Details
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

function createExamCard(
  exam,
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createExamCardMarkup(
      exam,
      options
    );

  const card =
    wrapper.firstElementChild;

  if (
    !card
  ) {
    throw new Error(
      'Unable to create exam card.'
    );
  }

  return card;
}

function mountExamCard(
  container,
  exam,
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
    createExamCard(
      exam,
      options
    );

  mount.append(
    card
  );

  return card;
}

function renderExamCards(
  container,
  exams,
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
      exams
    )
  ) {
    mount.innerHTML =
      '';

    return [];
  }

  mount.innerHTML =
    exams
      .map(
        (exam) =>
          createExamCardMarkup(
            exam,
            options
          )
      )
      .join('');

  return [
    ...mount.querySelectorAll(
      '[data-exam-card]'
    )
  ];
}

/* ============================================================
 * INTERACTION EVENTS
 * ============================================================
 */

function initializeExamCardInteractions() {
  document.addEventListener(
    'click',
    (event) => {
      const bookmark =
        event.target.closest(
          '[data-bookmark-exam]'
        );

      if (
        bookmark
      ) {
        document.dispatchEvent(
          new CustomEvent(
            'govcareer:bookmark-toggle',
            {
              detail: {
                entityType:
                  'EXAM',
                id:
                  bookmark.dataset
                    .bookmarkExam,
                source:
                  bookmark
              }
            }
          )
        );

        return;
      }

      const details =
        event.target.closest(
          '[data-exam-view-details]'
        );

      if (
        details
      ) {
        document.dispatchEvent(
          new CustomEvent(
            'govcareer:exam-details-request',
            {
              detail: {
                examId:
                  details.dataset
                    .examViewDetails
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
      if (
        event.detail?.entityType !==
        'EXAM'
      ) {
        return;
      }

      const id =
        event.detail.id;

      const saved =
        event.detail.saved ===
        true;

      if (
        !id
      ) {
        return;
      }

      document
        .querySelectorAll(
          `[data-bookmark-exam="${CSS.escape(
            id
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
          }
        );
    }
  );
}

export {
  createExamCardMarkup,
  createExamCard,
  mountExamCard,
  renderExamCards,
  initializeExamCardInteractions,

  getExamTitle,
  getStages,
  getRecruitingAuthority
};

export default {
  createExamCard,
  mountExamCard,
  renderExamCards,
  initializeExamCardInteractions
};
