/**
 * GovCareer Compass
 * Global search controller
 *
 * The canonical search source is the derived:
 * /data/indexes/search-index.json
 *
 * Search never decides eligibility.
 * Search only discovers records.
 */

import config from './config.js';

let searchIndex = null;
let searchLoaded = false;
let searchLoadingPromise = null;

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(query) {
  return normalizeText(query)
    .split(' ')
    .filter(
      (token) =>
        token.length >= 2
    );
}

async function loadSearchIndex() {
  if (searchLoaded) {
    return searchIndex;
  }

  if (searchLoadingPromise) {
    return searchLoadingPromise;
  }

  searchLoadingPromise =
    fetch(
      config.data.indexes.search,
      {
        cache: 'no-store'
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Search index failed: ${response.status}`
          );
        }

        const data =
          await response.json();

        searchIndex = data;
        searchLoaded = true;

        return data;
      })
      .finally(() => {
        searchLoadingPromise = null;
      });

  return searchLoadingPromise;
}

function getDocuments() {
  if (
    !searchIndex ||
    !Array.isArray(
      searchIndex.documents
    )
  ) {
    return [];
  }

  return searchIndex.documents;
}

function scoreDocument(
  document,
  query
) {
  const normalizedQuery =
    normalizeText(query);

  if (!normalizedQuery) {
    return 0;
  }

  const tokens =
    tokenize(query);

  const name =
    normalizeText(
      document.displayName?.en ||
        document.displayName ||
        ''
    );

  const aliases =
    Array.isArray(
      document.aliases
    )
      ? document.aliases.map(
          normalizeText
        )
      : [];

  const abbreviations =
    Array.isArray(
      document.abbreviations
    )
      ? document.abbreviations.map(
          normalizeText
        )
      : [];

  const fullForms =
    Array.isArray(
      document.fullForms
    )
      ? document.fullForms.map(
          normalizeText
        )
      : [];

  const searchText =
    normalizeText(
      document.searchText ||
        ''
    );

  let score = 0;

  if (name === normalizedQuery) {
    score += 900;
  } else if (
    name.startsWith(
      normalizedQuery
    )
  ) {
    score += 700;
  } else if (
    name.includes(
      normalizedQuery
    )
  ) {
    score += 600;
  }

  if (
    aliases.includes(
      normalizedQuery
    )
  ) {
    score += 450;
  }

  if (
    abbreviations.includes(
      normalizedQuery
    )
  ) {
    score += 850;
  }

  if (
    fullForms.includes(
      normalizedQuery
    )
  ) {
    score += 840;
  }

  tokens.forEach((token) => {
    if (
      name.includes(token)
    ) {
      score += 100;
    }

    if (
      searchText.includes(token)
    ) {
      score += 40;
    }

    if (
      aliases.some(
        (alias) =>
          alias.includes(token)
      )
    ) {
      score += 30;
    }
  });

  return score;
}

function search(
  query,
  {
    type = null,
    governmentId = null,
    stateId = null,
    limit = 25
  } = {}
) {
  const normalizedQuery =
    normalizeText(query);

  if (
    !normalizedQuery ||
    !searchIndex
  ) {
    return [];
  }

  const documents =
    getDocuments();

  return documents
    .filter((document) => {
      if (
        type &&
        document.type !== type
      ) {
        return false;
      }

      if (
        governmentId &&
        document.governmentId !==
          governmentId
      ) {
        return false;
      }

      if (
        stateId &&
        document.stateId !==
          stateId
      ) {
        return false;
      }

      return true;
    })
    .map((document) => ({
      ...document,
      _score:
        scoreDocument(
          document,
          normalizedQuery
        )
    }))
    .filter(
      (document) =>
        document._score > 0
    )
    .sort(
      (a, b) =>
        b._score - a._score
    )
    .slice(0, limit);
}

function renderSearchResults(
  results,
  container,
  {
    emptyMessage = 'No results found.'
  } = {}
) {
  if (!container) {
    return;
  }

  if (!results.length) {
    container.innerHTML = `
      <div class="search-empty">
        ${escapeHtml(
          emptyMessage
        )}
      </div>
    `;
    return;
  }

  container.innerHTML =
    results
      .map(
        (result) => `
          <article
            class="search-result"
            data-search-result-id="${escapeHtml(
              result.canonicalId ||
                result.id
            )}"
          >
            <div class="search-result__type">
              ${escapeHtml(
                result.type ||
                  ''
              )}
            </div>

            <h3 class="search-result__title">
              ${escapeHtml(
                result.displayName
                  ?.en ||
                  result.displayName ||
                  ''
              )}
            </h3>

            ${
              result.abbreviations
                ?.length
                ? `
                <div class="search-result__meta">
                  ${result.abbreviations
                    .map(
                      (item) =>
                        `<span>${escapeHtml(
                          item
                        )}</span>`
                    )
                    .join('')}
                </div>
              `
                : ''
            }

            <button
              type="button"
              class="search-result__action"
              data-search-open
              data-search-type="${escapeHtml(
                result.type
              )}"
              data-search-id="${escapeHtml(
                result.canonicalId ||
                  result.id
              )}"
            >
              View details
            </button>
          </article>
        `
      )
      .join('');
}

function bindSearch(
  input,
  resultsContainer,
  options = {}
) {
  if (!input) {
    return;
  }

  let timer = null;

  input.addEventListener(
    'input',
    () => {
      window.clearTimeout(
        timer
      );

      timer = window.setTimeout(
        () => {
          const results =
            search(
              input.value,
              options
            );

          renderSearchResults(
            results,
            resultsContainer,
            options
          );

          window.dispatchEvent(
            new CustomEvent(
              'gcc:search',
              {
                detail: {
                  query:
                    input.value,
                  results
                }
              }
            )
          );
        },
        config.ui.searchDebounceMs
      );
    }
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function initSearch() {
  try {
    await loadSearchIndex();

    document
      .querySelectorAll(
        '[data-global-search]'
      )
      .forEach((input) => {
        const resultsId =
          input.dataset
            .globalSearchResults;

        const resultsContainer =
          resultsId
            ? document.getElementById(
                resultsId
              )
            : null;

        bindSearch(
          input,
          resultsContainer
        );
      });

    return true;
  } catch (error) {
    console.error(
      'Search initialization failed:',
      error
    );

    return false;
  }
}

export {
  initSearch,
  loadSearchIndex,
  search,
  bindSearch,
  renderSearchResults,
  normalizeText,
  tokenize
};

export default {
  initSearch,
  loadSearchIndex,
  search,
  bindSearch,
  renderSearchResults
};
