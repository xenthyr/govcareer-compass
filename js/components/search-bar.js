/**
 * GovCareer Compass
 * ============================================================
 * Search Bar Component
 * ============================================================
 *
 * FILE:
 *   /js/components/search-bar.js
 *
 * PURPOSE:
 *   Reusable global search interface for:
 *
 *   - Jobs
 *   - Exams
 *   - Departments
 *   - Organisations
 *   - Service / Cadres
 *   - Qualifications
 *
 * DEPENDENCIES:
 *   /js/search.js
 *
 * IMPORTANT:
 *   This component is responsible for presentation and interaction.
 *   Search ranking remains inside /js/search.js.
 */

import {
  search,
  escapeHtml
} from '../search.js';

import {
  getRoute
} from '../config.js';

/* ============================================================
 * CONSTANTS
 * ============================================================
 */

const DEFAULT_LIMIT =
  8;

const DEFAULT_PLACEHOLDER =
  'Search government jobs, exams, departments and more…';

const SEARCH_RESULT_ROUTES =
  Object.freeze({
    JOB:
      'jobDetails',

    EXAM:
      'examDetails',

    DEPARTMENT:
      'jobs',

    ORGANISATION:
      'jobs',

    SERVICE_CADRE:
      'jobs',

    QUALIFICATION:
      'eligibility'
  });

/* ============================================================
 * UTILITIES
 * ============================================================
 */

function getLocalizedText(
  value,
  preferredLanguage = null
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

  if (
    preferredLanguage &&
    typeof value[
      preferredLanguage
    ] === 'string'
  ) {
    return value[
      preferredLanguage
    ];
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

function getResultTitle(
  result
) {
  if (
    !result
  ) {
    return '';
  }

  const record =
    result.record ||
    {};

  return (
    getLocalizedText(
      record.post ||
        record.name ||
        record.title ||
        result.title
    ) ||
    result.id ||
    'Untitled result'
  );
}

function getResultSubtitle(
  result
) {
  if (
    !result
  ) {
    return '';
  }

  const record =
    result.record ||
    {};

  const candidates = [
    record.departmentName,
    record.department,
    record.organisationName,
    record.organisation,
    record.fullForm,
    record.shortName
  ];

  return (
    candidates
      .map(
        (value) =>
          getLocalizedText(
            value
          )
      )
      .find(Boolean) ||
    result.typeLabel ||
    ''
  );
}

function getResultDestination(
  result
) {
  if (
    !result
  ) {
    return null;
  }

  const routeName =
    SEARCH_RESULT_ROUTES[
      result.type
    ];

  if (
    !routeName
  ) {
    return null;
  }

  try {
    const base =
      getRoute(
        routeName
      );

    const params =
      new URLSearchParams();

    if (
      result.id
    ) {
      /*
       * The parameter names remain generic so page controllers
       * can interpret them consistently.
       */
      if (
        result.type ===
        'JOB'
      ) {
        params.set(
          'job',
          result.id
        );
      } else if (
        result.type ===
        'EXAM'
      ) {
        params.set(
          'exam',
          result.id
        );
      } else if (
        result.type ===
        'QUALIFICATION'
      ) {
        params.set(
          'qualification',
          result.id
        );
      } else {
        params.set(
          'id',
          result.id
        );
      }
    }

    const query =
      params.toString();

    return query
      ? `${base}?${query}`
      : base;
  } catch {
    return null;
  }
}

/* ============================================================
 * MARKUP
 * ============================================================
 */

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
  return `
    <div
      class="global-search"
      data-search-component
      data-search-limit="${Number(
        limit
      )}"
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
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12"></path>
            <path d="M18 6 6 18"></path>
          </svg>
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
              <button
                type="button"
                class="search-type-chip is-active"
                data-search-type="ALL"
                aria-pressed="true"
              >
                All
              </button>

              <button
                type="button"
                class="search-type-chip"
                data-search-type="JOB"
                aria-pressed="false"
              >
                Jobs
              </button>

              <button
                type="button"
                class="search-type-chip"
                data-search-type="EXAM"
                aria-pressed="false"
              >
                Exams
              </button>

              <button
                type="button"
                class="search-type-chip"
                data-search-type="DEPARTMENT"
                aria-pressed="false"
              >
                Departments
              </button>

              <button
                type="button"
                class="search-type-chip"
                data-search-type="SERVICE_CADRE"
                aria-pressed="false"
              >
                Services
              </button>

              <button
                type="button"
                class="search-type-chip"
                data-search-type="QUALIFICATION"
                aria-pressed="false"
              >
                Qualifications
              </button>
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

  const safeTitle =
    escapeHtml(
      title
    );

  const safeSubtitle =
    escapeHtml(
      subtitle
    );

  const safeType =
    escapeHtml(
      result.typeLabel ||
        result.type ||
        'Result'
    );

  const safeId =
    escapeHtml(
      result.id ||
        ''
    );

  /*
   * The underlying search module provides scoring; the UI
   * does not expose a potentially confusing numerical relevance
   * score to ordinary users.
   */
  return `
    <a
      class="global-search__result"
      data-search-result
      data-result-index="${index}"
      data-result-type="${safeType}"
      data-result-id="${safeId}"
      ${
        destination
          ? `href="${escapeHtml(
              destination
            )}"`
          : 'href="#"'
      }
      role="option"
      aria-selected="false"
      ${
        query
          ? `data-search-query="${escapeHtml(
              query
            )}"`
          : ''
      }
    >
      <span
        class="global-search__result-icon"
        aria-hidden="true"
      >
        ${getTypeIcon(
          result.type
        )}
      </span>

      <span
        class="global-search__result-content"
      >
        <strong
          class="global-search__result-title"
        >
          ${safeTitle}
        </strong>

        ${
          subtitle
            ? `
              <span
                class="global-search__result-subtitle"
              >
                ${safeSubtitle}
              </span>
            `
            : ''
        }
      </span>

      <span
        class="global-search__result-type"
      >
        ${safeType}
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

function getTypeIcon(
  type
) {
  switch (
    type
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

function renderResults(
  root,
  results,
  query
) {
  const resultsContainer =
    root.querySelector(
      '[data-search-results]'
    );

  if (
    !resultsContainer
  ) {
    return;
  }

  if (
    !query.trim()
  ) {
    resultsContainer.innerHTML =
      '';

    resultsContainer.hidden =
      true;

    root
      .querySelector(
        '[data-search-input]'
      )
      ?.setAttribute(
        'aria-expanded',
        'false'
      );

    return;
  }

  if (
    results.length ===
    0
  ) {
    resultsContainer.innerHTML = `
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

    resultsContainer.hidden =
      false;

    root
      .querySelector(
        '[data-search-input]'
      )
      ?.setAttribute(
        'aria-expanded',
        'true'
      );

    return;
  }

  resultsContainer.innerHTML =
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

  resultsContainer.hidden =
    false;

  root
    .querySelector(
      '[data-search-input]'
    )
    ?.setAttribute(
      'aria-expanded',
      'true'
    );
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
        query: '',
        type: 'ALL',
        results: [],
        activeIndex: -1,
        limit:
          Number(
            root.dataset.searchLimit
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

  const entities =
    state.type ===
      'ALL'
      ? undefined
      : [
          state.type
        ];

  let results =
    search(
      query,
      {
        entities,
        limit:
          state.limit
      }
    );

  state.results =
    Array.isArray(
      results
    )
      ? results
      : [];

  renderResults(
    root,
    state.results,
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
          results:
            state.results
        }
      }
    )
  );

  return state.results;
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

function handleInputKeydown(
  event,
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

  switch (
    event.key
  ) {
    case 'ArrowDown':
      if (
        elements.length ===
        0
      ) {
        return;
      }

      event.preventDefault();

      state.activeIndex =
        Math.min(
          state.activeIndex +
            1,
          elements.length -
            1
        );

      updateActiveResult(
        root
      );
      break;

    case 'ArrowUp':
      if (
        elements.length ===
        0
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
        state.activeIndex <
          0 ||
        !elements[
          state.activeIndex
        ]
      ) {
        return;
      }

      event.preventDefault();

      elements[
        state.activeIndex
      ].click();
      break;

    case 'Escape':
      event.preventDefault();

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

  const allowedTypes = [
    'ALL',
    'JOB',
    'EXAM',
    'DEPARTMENT',
    'ORGANISATION',
    'SERVICE_CADRE',
    'QUALIFICATION'
  ];

  const normalized =
    allowedTypes.includes(
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
  const input =
    root.querySelector(
      '[data-search-input]'
    );

  const state =
    getState(
      root
    );

  if (
    input
  ) {
    input.value =
      '';
  }

  state.query =
    '';

  state.results =
    [];

  state.activeIndex =
    -1;

  const clearButton =
    root.querySelector(
      '[data-search-clear]'
    );

  if (
    clearButton
  ) {
    clearButton.hidden =
      true;
  }

  renderResults(
    root,
    [],
    ''
  );
}

function closeSearchResults(
  root
) {
  const results =
    root.querySelector(
      '[data-search-results]'
    );

  if (
    results
  ) {
    results.hidden =
      true;
  }

  root
    .querySelector(
      '[data-search-input]'
    )
    ?.setAttribute(
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
      handleInputKeydown(
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

  /*
   * Clicking outside closes results but does not erase the query.
   */
  document.addEventListener(
    'click',
    (event) => {
      if (
        !(event.target instanceof
          Node)
      ) {
        return;
      }

      if (
        !root.contains(
          event.target
        )
      ) {
        closeSearchResults(
          root
        );
      }
    }
  );

  /*
   * "/" focuses search unless the user is already typing in
   * another interactive control.
   */
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

      const tagName =
        target?.tagName
          ?.toLowerCase();

      if (
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select' ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();

      input.focus();
    }
  );

  /*
   * Search results are also exposed as an application-wide event.
   */
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

/* ============================================================
 * PUBLIC COMPONENT API
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
      'Unable to create search component.'
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
        /*
         * Avoid binding the same component twice.
         */
        if (
          root.dataset
            .searchInitialized ===
          'true'
        ) {
          return;
        }

        root.dataset
          .searchInitialized =
          'true';

        bindSearchEvents(
          root
        );
      }
    );
}

export {
  DEFAULT_LIMIT,
  createSearchMarkup,
  createSearchBar,
  mountSearchBar,
  performSearch,
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
