/**
 * GovCareer Compass
 * ============================================================
 * Search Bar Component
 * ============================================================
 *
 * Presentation layer for the global career search.
 *
 * Search logic remains in:
 *
 *   /js/search.js
 *
 * The component does not decide relevance or ranking.
 */

import {
  search
} from '../search.js';

const DEFAULT_LIMIT =
  8;

const DEFAULT_PLACEHOLDER =
  'Search government jobs, exams, departments and more…';

const RESULT_TYPES =
  Object.freeze([
    'ALL',
    'JOB',
    'EXAM',
    'DEPARTMENT',
    'ORGANISATION',
    'SERVICE_CADRE',
    'QUALIFICATION'
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

function getResultTitle(
  result
) {
  return (
    firstValue(
      result?.record,
      [
        'post',
        'postName',
        'name',
        'title'
      ]
    ) ||
    getLocalizedText(
      result?.title
    ) ||
    result?.id ||
    'Untitled result'
  );
}

function getResultSubtitle(
  result
) {
  return (
    firstValue(
      result?.record,
      [
        'departmentName',
        'department',
        'organisationName',
        'organisation',
        'fullForm',
        'shortName'
      ]
    ) ||
    result?.typeLabel ||
    ''
  );
}

function getResultDestination(
  result
) {
  /*
   * Prefer a URL explicitly supplied by the search engine.
   */
  if (
    typeof result?.url ===
    'string' &&
    result.url
  ) {
    return result.url;
  }

  /*
   * Fall back to normal page paths.
   *
   * This avoids importing routing logic into the search
   * component while still allowing the project to remain
   * compatible with GitHub Pages and Vercel.
   */
  const recordType =
    String(
      result?.type ||
        ''
    )
      .toUpperCase();

  const id =
    encodeURIComponent(
      result?.id ||
        ''
    );

  if (
    !id
  ) {
    return null;
  }

  switch (
    recordType
  ) {
    case 'JOB':
      return `./job-details.html?job=${id}`;

    case 'EXAM':
      return `./exam-details.html?exam=${id}`;

    case 'QUALIFICATION':
      return `./eligibility.html?qualification=${id}`;

    case 'DEPARTMENT':
    case 'ORGANISATION':
    case 'SERVICE_CADRE':
      return `./jobs.html?id=${id}`;

    default:
      return null;
  }
}

function getTypeIcon(
  type
) {
  switch (
    String(
      type ||
        ''
    ).toUpperCase()
  ) {
    case 'JOB':
      return '▣';

    case 'EXAM':
      return '◇';

    case 'DEPARTMENT':
      return '▤';

    case 'ORGANISATION':
      return '▥';

    case 'SERVICE_CADRE':
      return '◆';

    case 'QUALIFICATION':
      return '◎';

    default:
      return '•';
  }
}

function createSearchMarkup({
  placeholder =
    DEFAULT_PLACEHOLDER,
  limit =
    DEFAULT_LIMIT,
  showTypes =
    true,
  autofocus =
    false
} = {}) {
  const safeLimit =
    Number.isInteger(
      Number(
        limit
      )
    ) &&
    Number(
      limit
    ) > 0
      ? Number(
          limit
        )
      : DEFAULT_LIMIT;

  return `
    <div
      class="global-search"
      data-search-component
      data-search-limit="${safeLimit}"
    >

      <div
        class="global-search__control"
      >
        <svg
          class="global-search__icon"
          viewBox="0 0 24 24"
          width="21"
          height="21"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
          ></circle>

          <path
            d="m20 20-3.6-3.6"
          ></path>
        </svg>

        <input
          type="search"
          class="global-search__input"
          data-search-input
          autocomplete="off"
          spellcheck="false"
          placeholder="${escapeHtml(
            placeholder
          )}"
          aria-label="Search government careers"
          aria-controls="global-search-results"
          aria-expanded="false"
          ${
            autofocus
              ? 'autofocus'
              : ''
          }
        />

        <button
          type="button"
          class="global-search__clear icon-button"
          data-search-clear
          aria-label="Clear search"
          title="Clear"
          hidden
        >
          ×
        </button>

        <kbd
          class="global-search__shortcut"
          aria-hidden="true"
        >
          /
        </kbd>
      </div>

      ${
        showTypes
          ? `
            <div
              class="global-search__types"
              data-search-types
              aria-label="Search categories"
            >
              ${RESULT_TYPES
                .map(
                  (
                    type
                  ) => {
                    const labelMap = {
                      ALL:
                        'All',

                      JOB:
                        'Jobs',

                      EXAM:
                        'Exams',

                      DEPARTMENT:
                        'Departments',

                      ORGANISATION:
                        'Organisations',

                      SERVICE_CADRE:
                        'Services',

                      QUALIFICATION:
                        'Qualifications'
                    };

                    return `
                      <button
                        type="button"
                        class="search-type-chip ${
                          type ===
                          'ALL'
                            ? 'is-active'
                            : ''
                        }"
                        data-search-type="${type}"
                        aria-pressed="${
                          type ===
                          'ALL'
                        }"
                      >
                        ${labelMap[type]}
                      </button>
                    `;
                  }
                )
                .join('')}
            </div>
          `
          : ''
      }

      <div
        id="global-search-results"
        class="global-search__results"
        data-search-results
        role="listbox"
        aria-label="Search results"
        hidden
      ></div>

    </div>
  `;
}

/* ============================================================
 * RESULT RENDERING
 * ============================================================
 */

function createResultMarkup(
  result,
  index,
  query
) {
  const title =
    getResultTitle(
      result
    );

  const subtitle =
    getResultSubtitle(
      result
    );

  const destination =
    getResultDestination(
      result
    );

  const type =
    String(
      result?.type ||
        'RESULT'
    ).toUpperCase();

  return `
    <a
      class="global-search__result"
      data-search-result
      data-result-index="${index}"
      data-result-type="${escapeHtml(
        type
      )}"
      data-result-id="${escapeHtml(
        result?.id ||
          ''
      )}"
      ${
        destination
          ? `href="${escapeHtml(
              destination
            )}"`
          : 'href="#"'
      }
      role="option"
      aria-selected="false"
      data-search-query="${escapeHtml(
        query
      )}"
    >

      <span
        class="global-search__result-icon"
        aria-hidden="true"
      >
        ${getTypeIcon(
          type
        )}
      </span>

      <span
        class="global-search__result-content"
      >
        <strong
          class="global-search__result-title"
        >
          ${escapeHtml(
            title
          )}
        </strong>

        ${
          subtitle
            ? `
              <span
                class="global-search__result-subtitle"
              >
                ${escapeHtml(
                  subtitle
                )}
              </span>
            `
            : ''
        }
      </span>

      <span
        class="global-search__result-type"
      >
        ${escapeHtml(
          result?.typeLabel ||
            type
        )}
      </span>

      <span
        class="global-search__result-arrow"
        aria-hidden="true"
      >
        →
      </span>

    </a>
  `;
}

/* ============================================================
 * COMPONENT STATE
 * ============================================================
 */

const componentState =
  new WeakMap();

function getState(
  root
) {
  if (
    !componentState.has(
      root
    )
  ) {
    componentState.set(
      root,
      {
        query:
          '',

        type:
          'ALL',

        results:
          [],

        activeIndex:
          -1,

        limit:
          Number(
            root.dataset
              .searchLimit
          ) ||
          DEFAULT_LIMIT
      }
    );
  }

  return componentState.get(
    root
  );
}

/* ============================================================
 * SEARCH
 * ============================================================
 */

function performSearch(
  root
) {
  const state =
    getState(
      root
    );

  const input =
    root.querySelector(
      '[data-search-input]'
    );

  if (
    !input
  ) {
    return [];
  }

  const query =
    input.value.trim();

  state.query =
    query;

  state.activeIndex =
    -1;

  if (
    !query
  ) {
    state.results =
      [];

    renderResults(
      root,
      [],
      ''
    );

    return [];
  }

  const options =
    state.type ===
    'ALL'
      ? {
          limit:
            state.limit
        }
      : {
          limit:
            state.limit,

          entities: [
            state.type
          ]
        };

  let results = [];

  try {
    const response =
      search(
        query,
        options
      );

    results =
      Array.isArray(
        response
      )
        ? response
        : Array.isArray(
            response?.results
          )
        ? response.results
        : [];
  } catch (
    error
  ) {
    results =
      [];

    document.dispatchEvent(
      new CustomEvent(
        'govcareer:search-error',
        {
          detail: {
            query,
            error
          }
        }
      )
    );
  }

  state.results =
    results;

  renderResults(
    root,
    results,
    query
  );

  root.dispatchEvent(
    new CustomEvent(
      'govcareer:search-results',
      {
        bubbles:
          true,

        detail: {
          query,
          type:
            state.type,
          results
        }
      }
    )
  );

  return results;
}

function renderResults(
  root,
  results,
  query
) {
  const container =
    root.querySelector(
      '[data-search-results]'
    );

  const input =
    root.querySelector(
      '[data-search-input]'
    );

  if (
    !container
  ) {
    return;
  }

  if (
    !query
  ) {
    container.innerHTML =
      '';

    container.hidden =
      true;

    input?.setAttribute(
      'aria-expanded',
      'false'
    );

    return;
  }

  if (
    !results.length
  ) {
    container.innerHTML = `
      <div
        class="global-search__empty"
        role="status"
      >
        <strong>
          No matching careers found
        </strong>

        <span>
          Try a job name, exam, department,
          qualification or abbreviation.
        </span>
      </div>
    `;

    container.hidden =
      false;

    input?.setAttribute(
      'aria-expanded',
      'true'
    );

    return;
  }

  container.innerHTML =
    results
      .map(
        (
          result,
          index
        ) =>
          createResultMarkup(
            result,
            index,
            query
          )
      )
      .join('');

  container.hidden =
    false;

  input?.setAttribute(
    'aria-expanded',
    'true'
  );
}

/* ============================================================
 * KEYBOARD NAVIGATION
 * ============================================================
 */

function getResultElements(
  root
) {
  return [
    ...root.querySelectorAll(
      '[data-search-result]'
    )
  ];
}

function updateActiveResult(
  root
) {
  const state =
    getState(
      root
    );

  const elements =
    getResultElements(
      root
    );

  elements.forEach(
    (
      element,
      index
    ) => {
      const active =
        index ===
        state.activeIndex;

      element.classList.toggle(
        'is-active',
        active
      );

      element.setAttribute(
        'aria-selected',
        String(
          active
        )
      );

      if (
        active
      ) {
        element.scrollIntoView({
          block:
            'nearest'
        });
      }
    }
  );
}

function handleKeydown(
  event,
  root
) {
  const state =
    getState(
      root
    );

  const results =
    getResultElements(
      root
    );

  switch (
    event.key
  ) {
    case 'ArrowDown':
      if (
        !results.length
      ) {
        return;
      }

      event.preventDefault();

      state.activeIndex =
        Math.min(
          state.activeIndex +
            1,
          results.length -
            1
        );

      updateActiveResult(
        root
      );
      break;

    case 'ArrowUp':
      if (
        !results.length
      ) {
        return;
      }

      event.preventDefault();

      state.activeIndex =
        Math.max(
          state.activeIndex -
            1,
          0
        );

      updateActiveResult(
        root
      );
      break;

    case 'Enter':
      if (
        state.activeIndex >=
          0 &&
        results[
          state.activeIndex
        ]
      ) {
        event.preventDefault();

        results[
          state.activeIndex
        ].click();
      }

      break;

    case 'Escape':
      closeSearchResults(
        root
      );
      break;

    default:
      break;
  }
}

/* ============================================================
 * TYPE FILTER
 * ============================================================
 */

function setSearchType(
  root,
  type
) {
  const state =
    getState(
      root
    );

  const normalized =
    RESULT_TYPES.includes(
      type
    )
      ? type
      : 'ALL';

  state.type =
    normalized;

  root
    .querySelectorAll(
      '[data-search-type]'
    )
    .forEach(
      (button) => {
        const active =
          button.dataset
            .searchType ===
          normalized;

        button.classList.toggle(
          'is-active',
          active
        );

        button.setAttribute(
          'aria-pressed',
          String(
            active
          )
        );
      }
    );

  performSearch(
    root
  );
}

/* ============================================================
 * CLEAR / CLOSE
 * ============================================================
 */

function clearSearch(
  root
) {
  const state =
    getState(
      root
    );

  const input =
    root.querySelector(
      '[data-search-input]'
    );

  const clearButton =
    root.querySelector(
      '[data-search-clear]'
    );

  if (
    input
  ) {
    input.value =
      '';
  }

  if (
    clearButton
  ) {
    clearButton.hidden =
      true;
  }

  state.query =
    '';

  state.results =
    [];

  state.activeIndex =
    -1;

  renderResults(
    root,
    [],
    ''
  );
}

function closeSearchResults(
  root
) {
  const container =
    root.querySelector(
      '[data-search-results]'
    );

  const input =
    root.querySelector(
      '[data-search-input]'
    );

  if (
    container
  ) {
    container.hidden =
      true;
  }

  input?.setAttribute(
    'aria-expanded',
    'false'
  );
}

/* ============================================================
 * EVENTS
 * ============================================================
 */

function bindSearchEvents(
  root
) {
  if (
    root.dataset
      .searchBound ===
    'true'
  ) {
    return;
  }

  root.dataset
    .searchBound =
    'true';

  const input =
    root.querySelector(
      '[data-search-input]'
    );

  if (
    !input
  ) {
    return;
  }

  input.addEventListener(
    'input',
    () => {
      const clearButton =
        root.querySelector(
          '[data-search-clear]'
        );

      if (
        clearButton
      ) {
        clearButton.hidden =
          !input.value.trim();
      }

      performSearch(
        root
      );
    }
  );

  input.addEventListener(
    'keydown',
    (event) => {
      handleKeydown(
        event,
        root
      );
    }
  );

  root
    .querySelectorAll(
      '[data-search-type]'
    )
    .forEach(
      (button) => {
        button.addEventListener(
          'click',
          () => {
            setSearchType(
              root,
              button.dataset
                .searchType
            );
          }
        );
      }
    );

  root
    .querySelector(
      '[data-search-clear]'
    )
    ?.addEventListener(
      'click',
      () => {
        clearSearch(
          root
        );

        input.focus();
      }
    );

  root.addEventListener(
    'click',
    (event) => {
      const result =
        event.target.closest(
          '[data-search-result]'
        );

      if (
        !result
      ) {
        return;
      }

      root.dispatchEvent(
        new CustomEvent(
          'govcareer:search-select',
          {
            bubbles:
              true,

            detail: {
              id:
                result.dataset
                  .resultId,

              type:
                result.dataset
                  .resultType,

              query:
                result.dataset
                  .searchQuery
            }
          }
        )
      );
    }
  );
}

function initializeGlobalSearchShortcut() {
  if (
    document.documentElement
      .dataset
      .searchShortcutBound ===
    'true'
  ) {
    return;
  }

  document.documentElement
    .dataset
    .searchShortcutBound =
    'true';

  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key !==
        '/'
      ) {
        return;
      }

      const target =
        event.target;

      const tag =
        target?.tagName?.toLowerCase();

      if (
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        target?.isContentEditable
      ) {
        return;
      }

      const input =
        document.querySelector(
          '[data-search-input]'
        );

      if (
        !input
      ) {
        return;
      }

      event.preventDefault();

      input.focus();
    }
  );
}

/* ============================================================
 * PUBLIC API
 * ============================================================
 */

function createSearchBar(
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createSearchMarkup(
      options
    );

  const root =
    wrapper.firstElementChild;

  if (
    !root
  ) {
    throw new Error(
      'Unable to create search bar.'
    );
  }

  bindSearchEvents(
    root
  );

  return root;
}

function mountSearchBar(
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

  const searchBar =
    createSearchBar(
      options
    );

  mount.append(
    searchBar
  );

  return searchBar;
}

function initializeSearchBar() {
  document
    .querySelectorAll(
      '[data-search-component]'
    )
    .forEach(
      (root) => {
        bindSearchEvents(
          root
        );
      }
    );

  initializeGlobalSearchShortcut();
}

export {
  DEFAULT_LIMIT,
  RESULT_TYPES,

  createSearchMarkup,
  createSearchBar,
  mountSearchBar,

  performSearch,
  renderResults,
  clearSearch,
  closeSearchResults,
  setSearchType,

  initializeSearchBar
};

export default {
  createSearchBar,
  mountSearchBar,
  initializeSearchBar
};
