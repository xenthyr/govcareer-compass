/**
 * GovCareer Compass
 * Runtime Derived Index Builder
 *
 * Purpose:
 * - create fast lookup structures from canonical records;
 * - support search, filtering and relationships;
 * - avoid repeatedly scanning every record.
 *
 * IMPORTANT:
 * These are derived indexes.
 * Canonical JSON records remain the source of truth.
 */

import registry from './registry.js';

import {
  normalizeByType,
  cleanString
} from './normalizer.js';

function addToIndex(
  map,
  key,
  id
) {
  if (
    key === undefined ||
    key === null ||
    key === ''
  ) {
    return;
  }

  const normalizedKey =
    String(
      key
    );

  if (
    !map.has(
      normalizedKey
    )
  ) {
    map.set(
      normalizedKey,
      new Set()
    );
  }

  map
    .get(
      normalizedKey
    )
    .add(id);
}

function addManyToIndex(
  map,
  values,
  id
) {
  if (
    !Array.isArray(values)
  ) {
    return;
  }

  values.forEach(
    (value) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        addToIndex(
          map,
          value,
          id
        );
      }
    }
  );
}

function mapToObject(
  map
) {
  const result = {};

  map.forEach(
    (set, key) => {
      result[key] = [
        ...set
      ];
    }
  );

  return result;
}

function tokenize(
  value
) {
  return cleanString(
    value,
    ''
  )
    .normalize(
      'NFKD'
    )
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .replace(
      /[^\p{L}\p{N}\s-]/gu,
      ' '
    )
    .split(
      /\s+/
    )
    .filter(
      (token) =>
        token.length >=
        2
    );
}

function buildJobIndexes(
  jobs
) {
  const indexes = {
    byId: new Map(),
    byGovernmentId: new Map(),
    byStateId: new Map(),
    byDepartmentId: new Map(),
    byOrganisationId: new Map(),
    byServiceCadreId: new Map(),
    byExamId: new Map(),
    byCategoryId: new Map(),
    byEligibilityStatus: new Map(),
    byEmploymentStatus: new Map(),
    byRecruitmentRoute: new Map(),
    byPaySystem: new Map(),
    byPayLevel: new Map(),
    byLocationId: new Map(),
    byStatus: new Map(),
    byConfidence: new Map(),
    byQualificationLevel: new Map(),
    byLanguage: new Map(),
    bySearchToken: new Map()
  };

  jobs.forEach(
    (job) => {
      const id =
        job.id;

      if (!id) {
        return;
      }

      indexes.byId.set(
        id,
        id
      );

      addToIndex(
        indexes.byGovernmentId,
        job.governmentId,
        id
      );

      addToIndex(
        indexes.byStateId,
        job.stateId,
        id
      );

      addToIndex(
        indexes.byDepartmentId,
        job.departmentId,
        id
      );

      addToIndex(
        indexes.byOrganisationId,
        job.organisationId,
        id
      );

      addToIndex(
        indexes.byServiceCadreId,
        job.serviceCadreId,
        id
      );

      addManyToIndex(
        indexes.byExamId,
        job.examIds,
        id
      );

      addManyToIndex(
        indexes.byCategoryId,
        job.categoryIds,
        id
      );

      addToIndex(
        indexes.byEligibilityStatus,
        job.eligibilityStatus,
        id
      );

      addToIndex(
        indexes.byEmploymentStatus,
        job.employmentStatus,
        id
      );

      addManyToIndex(
        indexes.byRecruitmentRoute,
        job.recruitmentRouteIds,
        id
      );

      addToIndex(
        indexes.byPaySystem,
        job.paySystemId,
        id
      );

      addToIndex(
        indexes.byPayLevel,
        job.payLevel,
        id
      );

      addManyToIndex(
        indexes.byLocationId,
        job.locationIds,
        id
      );

      addToIndex(
        indexes.byStatus,
        job.status,
        id
      );

      addToIndex(
        indexes.byConfidence,
        job.confidence,
        id
      );

      addManyToIndex(
        indexes.byQualificationLevel,
        job.qualificationLevelIds,
        id
      );

      addManyToIndex(
        indexes.byLanguage,
        job.languageIds,
        id
      );

      const searchText =
        job.searchText ||
        '';

      tokenize(
        searchText
      ).forEach(
        (token) => {
          addToIndex(
            indexes.bySearchToken,
            token,
            id
          );
        }
      );
    }
  );

  return indexes;
}

function buildExamIndexes(
  exams
) {
  const indexes = {
    byId: new Map(),
    byGovernmentId: new Map(),
    byStateId: new Map(),
    byRecruitingAuthorityId:
      new Map(),
    byDepartmentId:
      new Map(),
    byOrganisationId:
      new Map(),
    byExamFamilyId:
      new Map(),
    byYear:
      new Map(),
    byStatus:
      new Map(),
    byDifficulty:
      new Map(),
    byQualificationLevel:
      new Map(),
    byPostId:
      new Map(),
    bySourceId:
      new Map(),
    bySearchToken:
      new Map()
  };

  exams.forEach(
    (exam) => {
      const id =
        exam.id;

      if (!id) {
        return;
      }

      indexes.byId.set(
        id,
        id
      );

      addToIndex(
        indexes.byGovernmentId,
        exam.governmentId,
        id
      );

      addToIndex(
        indexes.byStateId,
        exam.stateId,
        id
      );

      addToIndex(
        indexes.byRecruitingAuthorityId,
        exam.recruitingAuthorityId,
        id
      );

      addToIndex(
        indexes.byDepartmentId,
        exam.departmentId,
        id
      );

      addToIndex(
        indexes.byOrganisationId,
        exam.organisationId,
        id
      );

      addToIndex(
        indexes.byExamFamilyId,
        exam.examFamilyId,
        id
      );

      addToIndex(
        indexes.byYear,
        exam.year,
        id
      );

      addToIndex(
        indexes.byStatus,
        exam.status,
        id
      );

      addToIndex(
        indexes.byDifficulty,
        exam.difficulty,
        id
      );

      addManyToIndex(
        indexes.byQualificationLevel,
        exam.qualificationLevelIds,
        id
      );

      addManyToIndex(
        indexes.byPostId,
        exam.postIds,
        id
      );

      addManyToIndex(
        indexes.bySourceId,
        exam.sourceIds,
        id
      );

      tokenize(
        exam.searchText ||
          ''
      ).forEach(
        (token) => {
          addToIndex(
            indexes.bySearchToken,
            token,
            id
          );
        }
      );
    }
  );

  return indexes;
}

function buildGenericIndexes(
  records,
  {
    fields = []
  } = {}
) {
  const indexes = {
    byId: new Map()
  };

  fields.forEach(
    (field) => {
      indexes[
        `by${capitalize(
          field
        )}`
      ] = new Map();
    }
  );

  records.forEach(
    (record) => {
      if (!record?.id) {
        return;
      }

      indexes.byId.set(
        record.id,
        record.id
      );

      fields.forEach(
        (field) => {
          const index =
            indexes[
              `by${capitalize(
                field
              )}`
            ];

          if (!index) {
            return;
          }

          const value =
            record[
              field
            ];

          if (
            Array.isArray(
              value
            )
          ) {
            addManyToIndex(
              index,
              value,
              record.id
            );
          } else {
            addToIndex(
              index,
              value,
              record.id
            );
          }
        }
      );
    }
  );

  return indexes;
}

function capitalize(
  value
) {
  return value
    ? value.charAt(0)
        .toUpperCase() +
        value.slice(1)
    : value;
}

function getIdsFromIndex(
  indexMap,
  key
) {
  if (!indexMap) {
    return [];
  }

  const ids =
    indexMap.get(
      String(key)
    );

  return ids
    ? [
        ...ids
      ]
    : [];
}

function intersectIdLists(
  lists
) {
  if (
    !Array.isArray(
      lists
    ) ||
    lists.length ===
      0
  ) {
    return [];
  }

  const normalized =
    lists.filter(
      Array.isArray
    );

  if (!normalized.length) {
    return [];
  }

  const [
    first,
    ...rest
  ] = normalized;

  const membership =
    new Set(
      first
    );

  rest.forEach(
    (list) => {
      const allowed =
        new Set(
          list
        );

      [...membership].forEach(
        (id) => {
          if (
            !allowed.has(
              id
            )
          ) {
            membership.delete(
              id
            );
          }
        }
      );
    }
  );

  return [
    ...membership
  ];
}

function createRuntimeIndexes() {
  const jobs =
    registry.getAll(
      'JOB'
    );

  const exams =
    registry.getAll(
      'EXAM'
    );

  const departments =
    registry.getAll(
      'DEPARTMENT'
    );

  const organisations =
    registry.getAll(
      'ORGANISATION'
    );

  const sources =
    registry.getAll(
      'SOURCE'
    );

  return {
    jobs:
      buildJobIndexes(
        jobs
      ),

    exams:
      buildExamIndexes(
        exams
      ),

    departments:
      buildGenericIndexes(
        departments,
        {
          fields: [
            'governmentId',
            'stateId',
            'status'
          ]
        }
      ),

    organisations:
      buildGenericIndexes(
        organisations,
        {
          fields: [
            'governmentId',
            'stateId',
            'departmentId',
            'type',
            'status'
          ]
        }
      ),

    sources:
      buildGenericIndexes(
        sources,
        {
          fields: [
            'governmentId',
            'stateId',
            'departmentId',
            'organisationId',
            'sourceTypeId',
            'confidence',
            'status'
          ]
        }
      )
  };
}

class RuntimeIndexStore {
  constructor() {
    this.indexes = null;
    this.createdAt = null;
  }

  build() {
    this.indexes =
      createRuntimeIndexes();

    this.createdAt =
      new Date().toISOString();

    return this;
  }

  get(
    domain,
    name
  ) {
    return (
      this.indexes?.[
        domain
      ]?.[
        name
      ] || null
    );
  }

  getJobIdsBy(
    indexName,
    value
  ) {
    return getIdsFromIndex(
      this.get(
        'jobs',
        indexName
      ),
      value
    );
  }

  getExamIdsBy(
    indexName,
    value
  ) {
    return getIdsFromIndex(
      this.get(
        'exams',
        indexName
      ),
      value
    );
  }

  findJobIdsByFilters(
    filters = {}
  ) {
    const lists = [];

    const mapping = [
      [
        'governmentId',
        'byGovernmentId'
      ],
      [
        'stateId',
        'byStateId'
      ],
      [
        'departmentId',
        'byDepartmentId'
      ],
      [
        'organisationId',
        'byOrganisationId'
      ],
      [
        'serviceCadreId',
        'byServiceCadreId'
      ],
      [
        'eligibilityStatus',
        'byEligibilityStatus'
      ],
      [
        'employmentStatus',
        'byEmploymentStatus'
      ],
      [
        'paySystemId',
        'byPaySystem'
      ],
      [
        'payLevel',
        'byPayLevel'
      ],
      [
        'status',
        'byStatus'
      ],
      [
        'confidence',
        'byConfidence'
      ]
    ];

    mapping.forEach(
      ([
        filterKey,
        indexName
      ]) => {
        const value =
          filters[
            filterKey
          ];

        if (
          value === undefined ||
          value === null ||
          value === ''
        ) {
          return;
        }

        const values =
          Array.isArray(
            value
          )
            ? value
            : [value];

        const listsForField =
          values.map(
            (item) =>
              this.getJobIdsBy(
                indexName,
                item
              )
          );

        const union =
          new Set();

        listsForField.forEach(
          (list) => {
            list.forEach(
              (id) =>
                union.add(id)
            );
          }
        );

        lists.push([
          ...union
        ]);
      }
    );

    if (!lists.length) {
      return registry
        .getAll('JOB')
        .map(
          (job) =>
            job.id
        );
    }

    return intersectIdLists(
      lists
    );
  }

  searchToken(
    domain,
    token
  ) {
    const normalized =
      cleanString(
        token,
        ''
      )
        .toLowerCase();

    if (!normalized) {
      return [];
    }

    const index =
      this.get(
        domain,
        'bySearchToken'
      );

    return getIdsFromIndex(
      index,
      normalized
    );
  }

  getSnapshot() {
    if (
      !this.indexes
    ) {
      return null;
    }

    return {
      createdAt:
        this.createdAt,
      jobs:
        convertIndexGroup(
          this.indexes.jobs
        ),
      exams:
        convertIndexGroup(
          this.indexes.exams
        ),
      departments:
        convertIndexGroup(
          this.indexes.departments
        ),
      organisations:
        convertIndexGroup(
          this.indexes.organisations
        ),
      sources:
        convertIndexGroup(
          this.indexes.sources
        )
    };
  }
}

function convertIndexGroup(
  group
) {
  if (!group) {
    return null;
  }

  const result = {};

  Object.entries(
    group
  ).forEach(
    ([name, map]) => {
      result[name] =
        mapToObject(
          map
        );
    }
  );

  return result;
}

const runtimeIndexes =
  new RuntimeIndexStore();

function rebuildIndexes() {
  runtimeIndexes.build();
  return runtimeIndexes;
}

export {
  addToIndex,
  addManyToIndex,
  tokenize,
  buildJobIndexes,
  buildExamIndexes,
  buildGenericIndexes,
  createRuntimeIndexes,
  getIdsFromIndex,
  intersectIdLists,
  RuntimeIndexStore,
  runtimeIndexes,
  rebuildIndexes
};

export default runtimeIndexes;
