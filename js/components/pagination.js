/**
 * GovCareer Compass
 * ============================================================
 * Pagination Component
 * ============================================================
 *
 * Reusable pagination for:
 * - jobs
 * - exams
 * - search results
 * - rankings
 * - sources
 * - departments
 * - other large datasets
 *
 * This component does not fetch data.
 * It only manages the visible page state and emits events.
 */

const DEFAULT_PAGE_SIZE =
  20;

const DEFAULT_MAX_VISIBLE =
  7;

/* ============================================================
 * UTILITIES
 * ============================================================
 */

function toPositiveInteger(
  value,
  fallback
) {
  const number =
    Number(
      value
    );

  if (
    !Number.isInteger(
      number
    ) ||
    number <=
      0
  ) {
    return fallback;
  }

  return number;
}

function normalizePagination(
  {
    totalItems =
      0,
    currentPage =
      1,
    pageSize =
      DEFAULT_PAGE_SIZE,
    maxVisible =
      DEFAULT_MAX_VISIBLE
  } = {}
) {
  const total =
    Math.max(
      0,
      Number(
        totalItems
      ) || 0
    );

  const size =
    toPositiveInteger(
      pageSize,
      DEFAULT_PAGE_SIZE
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        total /
          size
      )
    );

  const page =
    Math.min(
      totalPages,
      Math.max(
        1,
        Number(
          currentPage
        ) || 1
      )
    );

  return {
    totalItems:
      total,

    currentPage:
      page,

    pageSize:
      size,

    totalPages,

    maxVisible:
      toPositiveInteger(
        maxVisible,
        DEFAULT_MAX_VISIBLE
      )
  };
}

function getPageItems(
  {
    totalPages,
    currentPage,
    maxVisible
  }
) {
  if (
    totalPages <=
    maxVisible
  ) {
    return Array.from(
      {
        length:
          totalPages
      },
      (
        _,
        index
      ) =>
        index + 1
    );
  }

  const items =
    [];

  const visible =
    Math.max(
      3,
      maxVisible -
        2
    );

  let start =
    Math.max(
      2,
      currentPage -
        Math.floor(
          visible /
            2
        )
    );

  let end =
    Math.min(
      totalPages -
        1,
      start +
        visible -
        1
    );

  if (
    end -
      start +
      1 <
    visible
  ) {
    start =
      Math.max(
        2,
        end -
          visible +
          1
      );
  }

  items.push(
    1
  );

  if (
    start >
    2
  ) {
    items.push(
      'ellipsis-left'
    );
  }

  for (
    let page =
      start;
    page <=
    end;
    page +=
      1
  ) {
    items.push(
      page
    );
  }

  if (
    end <
    totalPages -
      1
  ) {
    items.push(
      'ellipsis-right'
    );
  }

  items.push(
    totalPages
  );

  return items;
}

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

function getRangeStart(
  pagination
) {
  if (
    pagination.totalItems ===
    0
  ) {
    return 0;
  }

  return (
    (
      pagination.currentPage -
      1
    ) *
      pagination.pageSize
  ) + 1;
}

function getRangeEnd(
  pagination
) {
  if (
    pagination.totalItems ===
    0
  ) {
    return 0;
  }

  return Math.min(
    pagination.totalItems,
    pagination.currentPage *
      pagination.pageSize
  );
}

/* ============================================================
 * MARKUP
 * ============================================================
 */

function createPaginationMarkup(
  {
    totalItems = 0,
    currentPage = 1,
    pageSize =
      DEFAULT_PAGE_SIZE,
    maxVisible =
      DEFAULT_MAX_VISIBLE,
    showSummary =
      true,
    showPageSize =
      true,
    pageSizeOptions = [
      10,
      20,
      50,
      100
    ]
  } = {}
) {
  const pagination =
    normalizePagination({
      totalItems,
      currentPage,
      pageSize,
      maxVisible
    });

  const items =
    getPageItems(
      pagination
    );

  const start =
    getRangeStart(
      pagination
    );

  const end =
    getRangeEnd(
      pagination
    );

  return `
    <nav
      class="pagination"
      data-pagination
      data-current-page="${pagination.currentPage}"
      data-page-size="${pagination.pageSize}"
      data-total-items="${pagination.totalItems}"
      data-total-pages="${pagination.totalPages}"
      aria-label="Pagination"
    >

      ${
        showSummary
          ? `
            <div
              class="pagination__summary"
              aria-live="polite"
            >
              ${
                pagination.totalItems
                  ? `
                    Showing
                    <strong>
                      ${start}–${end}
                    </strong>
                    of
                    <strong>
                      ${pagination.totalItems}
                    </strong>
                  `
                  : `
                    No results
                  `
              }
            </div>
          `
          : ''
      }

      <div
        class="pagination__controls"
      >

        <button
          type="button"
          class="pagination__button"
          data-pagination-page="prev"
          ${
            pagination.currentPage <=
            1
              ? 'disabled'
              : ''
          }
          aria-label="Previous page"
        >
          ←
          <span>
            Previous
          </span>
        </button>

        <div
          class="pagination__pages"
          role="list"
        >
          ${items
            .map(
              (item) => {
                if (
                  typeof item !==
                  'number'
                ) {
                  return `
                    <span
                      class="pagination__ellipsis"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  `;
                }

                const active =
                  item ===
                  pagination.currentPage;

                return `
                  <button
                    type="button"
                    class="pagination__page ${
                      active
                        ? 'is-active'
                        : ''
                    }"
                    data-pagination-page="${item}"
                    ${
                      active
                        ? 'aria-current="page"'
                        : ''
                    }
                    aria-label="Page ${item}"
                    ${
                      active
                        ? 'disabled'
                        : ''
                    }
                  >
                    ${item}
                  </button>
                `;
              }
            )
            .join('')}
        </div>

        <button
          type="button"
          class="pagination__button"
          data-pagination-page="next"
          ${
            pagination.currentPage >=
            pagination.totalPages
              ? 'disabled'
              : ''
          }
          aria-label="Next page"
        >
          <span>
            Next
          </span>
          →
        </button>

      </div>

      ${
        showPageSize
          ? `
            <label
              class="pagination__size"
            >
              <span>
                Per page
              </span>

              <select
                data-pagination-size
                aria-label="Results per page"
              >
                ${pageSizeOptions
                  .map(
                    (size) => `
                      <option
                        value="${escapeHtml(
                          size
                        )}"
                        ${
                          Number(
                            size
                          ) ===
                          pagination.pageSize
                            ? 'selected'
                            : ''
                        }
                      >
                        ${escapeHtml(
                          size
                        )}
                      </option>
                    `
                  )
                  .join('')}
              </select>
            </label>
          `
          : ''
      }

    </nav>
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
      normalizePagination({
        totalItems:
          root.dataset
            .totalItems,

        currentPage:
          root.dataset
            .currentPage,

        pageSize:
          root.dataset
            .pageSize,

        maxVisible:
          root.dataset
            .maxVisible
      })
    );
  }

  return componentState.get(
    root
  );
}

/* ============================================================
 * EVENTS
 * ============================================================
 */

function emitPageChange(
  root,
  page,
  reason =
    'page'
) {
  const state =
    getState(
      root
    );

  const normalized =
    Math.min(
      state.totalPages,
      Math.max(
        1,
        Number(
          page
        ) || 1
      )
    );

  state.currentPage =
    normalized;

  root.dataset.currentPage =
    String(
      normalized
    );

  const detail = {
    page:
      normalized,

    pageSize:
      state.pageSize,

    totalItems:
      state.totalItems,

    totalPages:
      state.totalPages,

    reason
  };

  root.dispatchEvent(
    new CustomEvent(
      'govcareer:page-change',
      {
        bubbles:
          true,
        detail
      }
    )
  );

  document.dispatchEvent(
    new CustomEvent(
      'govcareer:pagination-change',
      {
        detail
      }
    )
  );

  return detail;
}

function bindPagination(
  root
) {
  if (
    root.dataset
      .paginationBound ===
    'true'
  ) {
    return;
  }

  root.dataset
    .paginationBound =
    'true';

  const state =
    getState(
      root
    );

  root.addEventListener(
    'click',
    (event) => {
      const button =
        event.target.closest(
          '[data-pagination-page]'
        );

      if (
        !button ||
        button.disabled
      ) {
        return;
      }

      const value =
        button.dataset
          .paginationPage;

      if (
        value ===
        'prev'
      ) {
        emitPageChange(
          root,
          state.currentPage -
            1,
          'previous'
        );

        return;
      }

      if (
        value ===
        'next'
      ) {
        emitPageChange(
          root,
          state.currentPage +
            1,
          'next'
        );

        return;
      }

      emitPageChange(
        root,
        Number(
          value
        ),
        'page'
      );
    }
  );

  root.addEventListener(
    'change',
    (event) => {
      const select =
        event.target.closest(
          '[data-pagination-size]'
        );

      if (
        !select
      ) {
        return;
      }

      const newSize =
        toPositiveInteger(
          select.value,
          DEFAULT_PAGE_SIZE
        );

      state.pageSize =
        newSize;

      state.totalPages =
        Math.max(
          1,
          Math.ceil(
            state.totalItems /
              newSize
          )
        );

      state.currentPage =
        Math.min(
          state.currentPage,
          state.totalPages
        );

      root.dataset.pageSize =
        String(
          newSize
        );

      emitPageChange(
        root,
        state.currentPage,
        'page-size'
      );
    }
  );
}

/* ============================================================
 * COMPONENT FACTORY
 * ============================================================
 */

function createPagination(
  options = {}
) {
  const wrapper =
    document.createElement(
      'div'
    );

  wrapper.innerHTML =
    createPaginationMarkup(
      options
    );

  const element =
    wrapper.firstElementChild;

  if (
    !element
  ) {
    throw new Error(
      'Unable to create pagination component.'
    );
  }

  element.dataset.maxVisible =
    String(
      options.maxVisible ??
        DEFAULT_MAX_VISIBLE
    );

  bindPagination(
    element
  );

  return element;
}

function mountPagination(
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

  const pagination =
    createPagination(
      options
    );

  mount.append(
    pagination
  );

  return pagination;
}

function updatePagination(
  root,
  options = {}
) {
  if (
    !root
  ) {
    return false;
  }

  const parent =
    root.parentElement;

  if (
    !parent
  ) {
    return false;
  }

  const replacement =
    createPagination(
      {
        totalItems:
          options.totalItems ??
          root.dataset.totalItems,

        currentPage:
          options.currentPage ??
          root.dataset.currentPage,

        pageSize:
          options.pageSize ??
          root.dataset.pageSize,

        maxVisible:
          options.maxVisible ??
          root.dataset.maxVisible,

        showSummary:
          options.showSummary ??
          true,

        showPageSize:
          options.showPageSize ??
          true,

        pageSizeOptions:
          options.pageSizeOptions
      }
    );

  root.replaceWith(
    replacement
  );

  return replacement;
}

function initializePagination() {
  document
    .querySelectorAll(
      '[data-pagination]'
    )
    .forEach(
      (root) => {
        bindPagination(
          root
        );
      }
    );
}

export {
  DEFAULT_PAGE_SIZE,
  DEFAULT_MAX_VISIBLE,

  normalizePagination,
  getPageItems,
  getRangeStart,
  getRangeEnd,

  createPaginationMarkup,
  createPagination,
  mountPagination,
  updatePagination,

  initializePagination
};

export default {
  createPagination,
  mountPagination,
  updatePagination,
  initializePagination
};
