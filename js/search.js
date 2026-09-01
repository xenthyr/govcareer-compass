/**
 * GovCareer Compass
 * ============================================================
 * Global Search Engine
 * ============================================================
 *
 * Searches across:
 * - Jobs
 * - Exams
 * - Departments
 * - Organisations
 * - Service Cadres
 * - Qualifications
 *
 * Search is intentionally tolerant of incomplete index files.
 * Canonical registry records remain the fallback.
 */

import registry from './database/registry.js';
import {
  tokenize
} from './database/indexes.js';

const SEARCHABLE_ENTITIES =
  Object.freeze([
    {
      type: 'JOB',
      label: 'Job'
    },
    {
      type: 'EXAM',
      label: 'Exam'
    },
    {
      type: 'DEPARTMENT',
      label: 'Department'
    },
    {
      type: 'ORGANISATION',
      label: 'Organisation'
    },
    {
      type: 'SERVICE_CADRE',
      label: 'Service / Cadre'
    },
    {
      type: 'QUALIFICATION',
      label: 'Qualification'
    }
  ]);

function normalizeText(
  value
) {
  return String(
    value || ''
  )
    .normalize(
      'NFKD'
    )
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .trim();
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
    value &&
    typeof value ===
      'object'
  ) {
    return (
      value.en ||
      value.bn ||
      Object.values(
        value
      )[0] ||
      ''
    );
  }

  return '';
}

function getRecordSearchText(
  record
) {
  if (
    !record ||
    typeof record !==
      'object'
  ) {
    return '';
  }

  const parts = [];

  const directFields = [
    'id',
    'post',
    'postName',
    'name',
    'title',
    'shortName',
    'fullForm',
    'description',
    'keywords',
    'searchText',
    'departmentName',
    'organisationName',
    'serviceCadreName',
    'examName',
    'abbreviation',
    'category',
    'jobCategory',
    'qualification',
    'status',
    'payLevel',
    'governmentId',
    'stateId'
  ];

  directFields.forEach(
    (field) => {
      const value =
        record[
          field
        ];

      if (
        Array.isArray(
          value
        )
      ) {
        value.forEach(
          (item) => {
            parts.push(
              getLocalizedText(
                item
              )
            );
          }
        );
      } else {
        parts.push(
          getLocalizedText(
            value
          )
        );
      }
    }
  );

  if (
    Array.isArray(
      record.aliases
    )
  ) {
    parts.push(
      ...record.aliases
    );
  }

  return normalizeText(
    parts
      .filter(Boolean)
      .join(' ')
  );
}

function scoreRecord(
  record,
  queryTokens
) {
  const text =
    getRecordSearchText(
      record
    );

  if (
    !text
  ) {
    return 0;
  }

  const normalizedId =
    normalizeText(
      record.id
    );

  const primaryName =
    normalizeText(
      getLocalizedText(
        record.name ||
          record.post ||
          record.title
      )
    );

  let score =
    0;

  queryTokens.forEach(
    (token) => {
      if (
        normalizedId ===
        token
      ) {
        score += 100;
      } else if (
        normalizedId.includes(
          token
        )
      ) {
        score += 35;
      }

      if (
        primaryName ===
        token
      ) {
        score += 90;
      } else if (
        primaryName.startsWith(
          token
        )
      ) {
        score += 55;
      } else if (
        primaryName.includes(
          token
        )
      ) {
        score += 40;
      }

      if (
        text.includes(
          token
        )
      ) {
        score += 15;
      }
    }
  );

  return score;
}

function search(
  query,
  {
    entities =
      SEARCHABLE_ENTITIES.map(
        (item) =>
          item.type
      ),
    limit = 30
  } = {}
) {
  const normalizedQuery =
    normalizeText(
      query
    );

  if (
    normalizedQuery.length <
    1
  ) {
    return [];
  }

  const queryTokens =
    tokenize(
      normalizedQuery
    );

  if (
    queryTokens.length ===
    0
  ) {
    return [];
  }

  const results = [];

  entities.forEach(
    (entityType) => {
      const meta =
        SEARCHABLE_ENTITIES.find(
          (item) =>
            item.type ===
            entityType
        );

      if (
        !meta
      ) {
        return;
      }

      const records =
        registry.getAll(
          entityType
        );

      records.forEach(
        (record) => {
          const score =
            scoreRecord(
              record,
              queryTokens
            );

          if (
            score <= 0
          ) {
            return;
          }

          results.push({
            id:
              record.id,

            type:
              entityType,

            typeLabel:
              meta.label,

            title:
              getLocalizedText(
                record.post ||
                  record.name ||
                  record.title
              ),

            record,

            score
          });
        }
      );
    }
  );

  return results
    .sort(
      (a, b) =>
        b.score -
        a.score ||
        a.title.localeCompare(
          b.title
        )
    )
    .slice(
      0,
      Math.max(
        1,
        Number(
          limit
        ) || 30
      )
    );
}

function highlightText(
  text,
  query
) {
  const source =
    String(
      text || ''
    );

  const normalized =
    String(
      query || ''
    ).trim();

  if (
    !normalized
  ) {
    return escapeHtml(
      source
    );
  }

  const escaped =
    escapeRegExp(
      normalized
    );

  return escapeHtml(
    source
  ).replace(
    new RegExp(
      `(${escaped})`,
      'ig'
    ),
    '<mark>$1</mark>'
  );
}

function escapeRegExp(
  value
) {
  return String(
    value
  ).replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

function escapeHtml(
  value
) {
  return String(
    value
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

function initializeSearch() {
  document.addEventListener(
    'input',
    (event) => {
      const input =
        event.target.closest(
          '[data-search-input]'
        );

      if (
        !input
      ) {
        return;
      }

      const query =
        input.value;

      const results =
        search(
          query,
          {
            limit:
              Number(
                input.dataset.searchLimit
              ) || 8
          }
        );

      document.dispatchEvent(
        new CustomEvent(
          'govcareer:search',
          {
            detail: {
              query,
              results
            }
          }
        )
      );
    }
  );
}

export {
  SEARCHABLE_ENTITIES,
  normalizeText,
  getRecordSearchText,
  search,
  highlightText,
  escapeHtml,
  initializeSearch
};

export default {
  search,
  highlightText,
  initializeSearch
};
