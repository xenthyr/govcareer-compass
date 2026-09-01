/**
 * GovCareer Compass
 * ============================================================
 * Runtime Derived Index Builder
 * ============================================================
 *
 * These indexes are generated from registry records.
 *
 * They are NEVER the canonical source of government facts.
 */

import registry from './registry.js';

import {
  cleanString
} from './normalizer.js';

function normalizeKey(value) {
  return cleanString(
    value,
    ''
  );
}

function addToIndex(
  map,
  key,
  id
) {
  const normalized =
    normalizeKey(key);

  if (
    !normalized ||
    !id
  ) {
    return;
  }

  if (
    !map.has(normalized)
  ) {
    map.set(
      normalized,
      new Set()
    );
  }

  map
    .get(normalized)
    .add(id);
}

function addManyToIndex(
  map,
  values,
  id
) {
  if (
    !Array.isArray(
      values
    )
  ) {
    return;
  }

  values.forEach(
    (value) =>
      addToIndex(
        map,
        value,
        id
      )
  );
}

function addNestedIndex(
  map,
  values,
  id
) {
  if (
    !Array.isArray(
      values
    )
  ) {
    return;
  }

  values.forEach(
    (value) => {
      if (
        value !== undefined &&
        value !== null
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
        token.length >= 2
    );
}

function createIndexGroup(
  fieldNames
) {
  const group = {
    byId: new Map()
  };

  fieldNames.forEach(
    (field) => {
      group[field] =
        new Map();
    }
  );

  return group;
}

function indexBasicFields(
  record,
  indexGroup,
  id
) {
  indexGroup.byId.set(
    id,
    id
  );

  Object.entries(
    indexGroup
  ).forEach(
    ([field, map]) => {
      if (
        field ===
        'byId'
      ) {
        return;
      }

      const actualField =
        field.replace(
          /^by/,
          ''
        );

      const camelField =
        actualField.charAt(
          0
        ).toLowerCase() +
        actualField.slice(
          1
        );

      const value =
        record[
          camelField
        ];

      if (
        Array.isArray(value)
      ) {
        addManyToIndex(
          map,
          value,
          id
        );
      } else {
        addToIndex(
          map,
          value,
          id
        );
      }
    }
  );
}

function buildJobIndexes(
  jobs
) {
  const indexes =
    createIndexGroup([
      'byGovernmentId',
      'byStateId',
      'byDepartmentId',
      'byOrganisationId',
      'byServiceCadreId',
      'byEligibilityStatus',
      'byEmploymentStatus',
      'byPaySystem',
      'byPayLevel',
      'byStatus',
      'byConfidence',
      'byRecruitmentRouteId',
      'byExamId',
      'byCategoryId',
      'byLocationId',
      'byQualificationLevelId',
      'bySourceId',
      'bySearchToken'
    ]);

  jobs.forEach(
    (job) => {
      if (!job?.id) {
        return;
      }

      indexes.byId.set(
        job.id,
        job.id
      );

      addToIndex(
        indexes.byGovernmentId,
        job.governmentId,
        job.id
      );

      addToIndex(
        indexes.byStateId,
        job.stateId,
        job.id
      );

      addToIndex(
        indexes.byDepartmentId,
        job.departmentId,
        job.id
      );

      addToIndex(
        indexes.byOrganisationId,
        job.organisationId,
        job.id
      );

      addToIndex(
        indexes.byServiceCadreId,
        job.serviceCadreId,
        job.id
      );

      addToIndex(
        indexes.byEligibilityStatus,
        job.eligibilityStatus,
        job.id
      );

      addToIndex(
        indexes.byEmploymentStatus,
        job.employmentStatus,
        job.id
      );

      addToIndex(
        indexes.byPaySystem,
        job.paySystemId,
        job.id
      );

      addToIndex(
        indexes.byPayLevel,
        job.payLevel,
        job.id
      );

      addToIndex(
        indexes.byStatus,
        job.status,
        job.id
      );

      addToIndex(
        indexes.byConfidence,
        job.confidence,
        job.id
      );

      addManyToIndex(
        indexes.byRecruitmentRouteId,
        job.recruitmentRouteIds,
        job.id
      );

      addManyToIndex(
        indexes.byExamId,
        job.examIds,
        job.id
      );

      addManyToIndex(
        indexes.byCategoryId,
        job.categoryIds,
        job.id
      );

      addManyToIndex(
        indexes.byLocationId,
        job.locationIds,
        job.id
      );

      addManyToIndex(
        indexes.byQualificationLevelId,
        job.qualificationLevelIds,
        job.id
      );

      addManyToIndex(
        indexes.bySourceId,
        job.sourceIds,
        job.id
      );

      tokenize(
        job.searchText ||
          ''
      ).forEach(
        (token) =>
          addToIndex(
            indexes.bySearchToken,
            token,
            job.id
          )
      );
    }
  );

  return indexes;
}

function buildExamIndexes(
  exams
) {
  const indexes =
    createIndexGroup([
      'byGovernmentId',
      'byStateId',
      'byRecruitingAuthorityId',
      'byDepartmentId',
      'byOrganisationId',
      'byServiceCadreId',
      'byExamFamilyId',
      'byYear',
      'byStatus',
      'byDifficulty',
      'byQualificationLevelId',
      'byPostId',
      'bySourceId',
      'bySearchToken'
    ]);

  exams.forEach(
    (exam) => {
      if (!exam?.id) {
        return;
      }

      indexes.byId.set(
        exam.id,
        exam.id
      );

      addToIndex(
        indexes.byGovernmentId,
        exam.governmentId,
        exam.id
      );

      addToIndex(
        indexes.byStateId,
        exam.stateId,
        exam.id
      );

      addToIndex(
        indexes.byRecruitingAuthorityId,
        exam.recruitingAuthorityId,
        exam.id
      );

      addToIndex(
        indexes.byDepartmentId,
        exam.departmentId,
        exam.id
      );

      addToIndex(
        indexes.byOrganisationId,
        exam.organisationId,
        exam.id
      );

      addToIndex(
        indexes.byServiceCadreId,
        exam.serviceCadreId,
        exam.id
      );

      addToIndex(
        indexes.byExamFamilyId,
        exam.examFamilyId,
        exam.id
      );

      addToIndex(
        indexes.byYear,
        exam.year,
        exam.id
      );

      addToIndex(
        indexes.byStatus,
        exam.status,
        exam.id
      );

      addToIndex(
        indexes.byDifficulty,
        exam.difficulty,
        exam.id
      );

      addManyToIndex(
        indexes.byQualificationLevelId,
        exam.qualificationLevelIds,
        exam.id
      );

      addManyToIndex(
        indexes.byPostId,
        exam.postIds,
        exam.id
      );

      addManyToIndex(
        indexes.bySourceId,
        exam.sourceIds,
        exam.id
      );

      tokenize(
        exam.searchText ||
          ''
      ).forEach(
        (token) =>
          addToIndex(
            indexes.bySearchToken,
            token,
            exam.id
          )
      );
    }
  );

  return indexes;
}

function buildServiceCadreIndexes(
  serviceCadres
) {
  const indexes =
    createIndexGroup([
      'byGovernmentId',
      'byStateId',
      'byMinistryId',
      'byDepartmentId',
      'byOrganisationId',
      'byParentServiceCadreId',
      'byType',
      'byServiceGroup',
      'byCadreControl',
      'byClassification',
      'byPostId',
      'byExamId',
      'byEligibilityRuleId',
      'byPayId',
      'byPromotionId',
      'byBenefitId',
      'byLocationId',
      'bySourceId',
      'byStatus',
      'bySearchToken'
    ]);

  serviceCadres.forEach(
    (record) => {
      if (!record?.id) {
        return;
      }

      indexes.byId.set(
        record.id,
        record.id
      );

      addToIndex(
        indexes.byGovernmentId,
        record.governmentId,
        record.id
      );

      addToIndex(
        indexes.byStateId,
        record.stateId,
        record.id
      );

      addToIndex(
        indexes.byMinistryId,
        record.ministryId,
        record.id
      );

      addToIndex(
        indexes.byDepartmentId,
        record.departmentId,
        record.id
      );

      addToIndex(
        indexes.byOrganisationId,
        record.organisationId,
        record.id
      );

      addToIndex(
        indexes.byParentServiceCadreId,
        record.parentServiceCadreId,
        record.id
      );

      addToIndex(
        indexes.byType,
        record.type,
        record.id
      );

      addToIndex(
        indexes.byServiceGroup,
        record.serviceGroup,
        record.id
      );

      addToIndex(
        indexes.byCadreControl,
        record.cadreControl,
        record.id
      );

      addToIndex(
        indexes.byClassification,
        record.classification,
        record.id
      );

      addManyToIndex(
        indexes.byPostId,
        record.postIds,
        record.id
      );

      addManyToIndex(
        indexes.byExamId,
        record.examIds,
        record.id
      );

      addManyToIndex(
        indexes.byEligibilityRuleId,
        record.eligibilityRuleIds,
        record.id
      );

      addManyToIndex(
        indexes.byPayId,
        record.payIds,
        record.id
      );

      addManyToIndex(
        indexes.byPromotionId,
        record.promotionIds,
        record.id
      );

      addManyToIndex(
        indexes.byBenefitId,
        record.benefitIds,
        record.id
      );

      addManyToIndex(
        indexes.byLocationId,
        record.locationIds,
        record.id
      );

      addManyToIndex(
        indexes.bySourceId,
        record.sourceIds,
        record.id
      );

      addToIndex(
        indexes.byStatus,
        record.status,
        record.id
      );

      tokenize(
        record.searchText ||
          ''
      ).forEach(
        (token) =>
          addToIndex(
            indexes.bySearchToken,
            token,
            record.id
          )
      );
    }
  );

  return indexes;
}

function buildEligibilityRuleIndexes(
  rules
) {
  const indexes =
    createIndexGroup([
      'byTargetId',
      'byTargetType',
      'byRuleClass',
      'byConditionType',
      'byOperator',
      'byQualificationId',
      'bySubjectId',
      'byGovernmentId',
      'byStateId',
      'byStatus',
      'byPriority',
      'bySourceId',
      'byDependsOnRuleId'
    ]);

  rules.forEach(
    (rule) => {
      if (!rule?.id) {
        return;
      }

      indexes.byId.set(
        rule.id,
        rule.id
      );

      addToIndex(
        indexes.byTargetId,
        rule.targetId,
        rule.id
      );

      addToIndex(
        indexes.byTargetType,
        rule.targetType,
        rule.id
      );

      addToIndex(
        indexes.byRuleClass,
        rule.ruleClass,
        rule.id
      );

      addToIndex(
        indexes.byConditionType,
        rule.conditionType,
        rule.id
      );

      addToIndex(
        indexes.byOperator,
        rule.operator,
        rule.id
      );

      addManyToIndex(
        indexes.byQualificationId,
        rule.qualificationIds,
        rule.id
      );

      addManyToIndex(
        indexes.byQualificationId,
        rule.requiredQualificationIds,
        rule.id
      );

      addManyToIndex(
        indexes.bySubjectId,
        rule.subjectIds,
        rule.id
      );

      addManyToIndex(
        indexes.bySubjectId,
        rule.requiredSubjectIds,
        rule.id
      );

      addToIndex(
        indexes.byGovernmentId,
        rule.governmentId,
        rule.id
      );

      addToIndex(
        indexes.byStateId,
        rule.stateId,
        rule.id
      );

      addToIndex(
        indexes.byStatus,
        rule.status,
        rule.id
      );

      addToIndex(
        indexes.byPriority,
        rule.priority,
        rule.id
      );

      addManyToIndex(
        indexes.bySourceId,
        rule.sourceIds,
        rule.id
      );

      addManyToIndex(
        indexes.byDependsOnRuleId,
        rule.dependsOnRuleIds,
        rule.id
      );
    }
  );

  return indexes;
}

function buildQualificationIndexes(
  qualifications
) {
  const indexes =
    createIndexGroup([
      'byType',
      'byCategory',
      'byLevel',
      'bySubject',
      'byProfessional',
      'byTeaching',
      'byTechnical',
      'byTrade',
      'byGovernmentRecognition',
      'byStatus',
      'byAlias',
      'bySearchToken'
    ]);

  qualifications.forEach(
    (qualification) => {
      if (!qualification?.id) {
        return;
      }

      indexes.byId.set(
        qualification.id,
        qualification.id
      );

      addToIndex(
        indexes.byType,
        qualification.type,
        qualification.id
      );

      addToIndex(
        indexes.byCategory,
        qualification.category,
        qualification.id
      );

      addToIndex(
        indexes.byLevel,
        qualification.level,
        qualification.id
      );

      addManyToIndex(
        indexes.bySubject,
        qualification.subjectIds,
        qualification.id
      );

      if (
        qualification.professional !==
        undefined
      ) {
        addToIndex(
          indexes.byProfessional,
          String(
            Boolean(
              qualification.professional
            )
          ),
          qualification.id
        );
      }

      if (
        qualification.teaching !==
        undefined
      ) {
        addToIndex(
          indexes.byTeaching,
          String(
            Boolean(
              qualification.teaching
            )
          ),
          qualification.id
        );
      }

      if (
        qualification.technical !==
        undefined
      ) {
        addToIndex(
          indexes.byTechnical,
          String(
            Boolean(
              qualification.technical
            )
          ),
          qualification.id
        );
      }

      if (
        qualification.trade !==
        undefined
      ) {
        addToIndex(
          indexes.byTrade,
          qualification.trade,
          qualification.id
        );
      }

      if (
        qualification.governmentRecognition !==
        undefined
      ) {
        addToIndex(
          indexes.byGovernmentRecognition,
          String(
            Boolean(
              qualification.governmentRecognition
            )
          ),
          qualification.id
        );
      }

      addToIndex(
        indexes.byStatus,
        qualification.status,
        qualification.id
      );

      addManyToIndex(
        indexes.byAlias,
        qualification.aliases,
        qualification.id
      );

      tokenize(
        qualification.searchText ||
          ''
      ).forEach(
        (token) =>
          addToIndex(
            indexes.bySearchToken,
            token,
            qualification.id
          )
      );
    }
  );

  return indexes;
}

function buildGenericIndexes(
  records,
  fields = []
) {
  const indexes =
    createIndexGroup(
      fields
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
        (fieldName) => {
          const map =
            indexes[fieldName];

          if (!map) {
            return;
          }

          const property =
            fieldName.replace(
              /^by/,
              ''
            );

          const camelCase =
            property.charAt(
              0
            ).toLowerCase() +
            property.slice(
              1
            );

          const value =
            record[
              camelCase
            ];

          if (
            Array.isArray(
              value
            )
          ) {
            addManyToIndex(
              map,
              value,
              record.id
            );
          } else {
            addToIndex(
              map,
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

function buildDepartmentIndexes(
  departments
) {
  return buildGenericIndexes(
    departments,
    [
      'byGovernmentId',
      'byStateId',
      'byStatus'
    ]
  );
}

function buildOrganisationIndexes(
  organisations
) {
  return buildGenericIndexes(
    organisations,
    [
      'byGovernmentId',
      'byStateId',
      'byDepartmentId',
      'byType',
      'byStatus'
    ]
  );
}

function buildSourceIndexes(
  sources
) {
  return buildGenericIndexes(
    sources,
    [
      'byGovernmentId',
      'byStateId',
      'byDepartmentId',
      'byOrganisationId',
      'bySourceTypeId',
      'byConfidence',
      'byStatus'
    ]
  );
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

  const serviceCadres =
    registry.getAll(
      'SERVICE_CADRE'
    );

  const eligibilityRules =
    registry.getAll(
      'ELIGIBILITY_RULE'
    );

  const qualifications =
    registry.getAll(
      'QUALIFICATION'
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
      buildDepartmentIndexes(
        departments
      ),

    organisations:
      buildOrganisationIndexes(
        organisations
      ),

    serviceCadres:
      buildServiceCadreIndexes(
        serviceCadres
      ),

    eligibilityRules:
      buildEligibilityRuleIndexes(
        eligibilityRules
      ),

    qualifications:
      buildQualificationIndexes(
        qualifications
      ),

    sources:
      buildSourceIndexes(
        sources
      )
  };
}

function getIdsFromIndex(
  indexMap,
  key
) {
  if (!indexMap) {
    return [];
  }

  const normalized =
    normalizeKey(key);

  if (!normalized) {
    return [];
  }

  const ids =
    indexMap.get(
      normalized
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
    !Array.isArray(lists) ||
    lists.length === 0
  ) {
    return [];
  }

  const usable =
    lists.filter(
      Array.isArray
    );

  if (
    usable.length === 0
  ) {
    return [];
  }

  const membership =
    new Set(
      usable[0]
    );

  for (
    let i = 1;
    i < usable.length;
    i += 1
  ) {
    const allowed =
      new Set(
        usable[i]
      );

    [...membership].forEach(
      (id) => {
        if (
          !allowed.has(id)
        ) {
          membership.delete(
            id
          );
        }
      }
    );
  }

  return [
    ...membership
  ];
}

function unionIdLists(
  lists
) {
  const result =
    new Set();

  if (
    !Array.isArray(lists)
  ) {
    return [];
  }

  lists.forEach(
    (list) => {
      if (
        !Array.isArray(
          list
        )
      ) {
        return;
      }

      list.forEach(
        (id) =>
          result.add(id)
      );
    }
  );

  return [
    ...result
  ];
}

class RuntimeIndexStore {
  constructor() {
    this.indexes =
      null;

    this.createdAt =
      null;
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
    indexName
  ) {
    return (
      this.indexes?.[
        domain
      ]?.[
        indexName
      ] ||
      null
    );
  }

  getIds(
    domain,
    indexName,
    value
  ) {
    return getIdsFromIndex(
      this.get(
        domain,
        indexName
      ),
      value
    );
  }

  getJobIdsBy(
    indexName,
    value
  ) {
    return this.getIds(
      'jobs',
      indexName,
      value
    );
  }

  getExamIdsBy(
    indexName,
    value
  ) {
    return this.getIds(
      'exams',
      indexName,
      value
    );
  }

  getServiceCadreIdsBy(
    indexName,
    value
  ) {
    return this.getIds(
      'serviceCadres',
      indexName,
      value
    );
  }

  getEligibilityRuleIdsBy(
    indexName,
    value
  ) {
    return this.getIds(
      'eligibilityRules',
      indexName,
      value
    );
  }

  getQualificationIdsBy(
    indexName,
    value
  ) {
    return this.getIds(
      'qualifications',
      indexName,
      value
    );
  }

  findJobIdsByFilters(
    filters = {}
  ) {
    const lists = [];

    const mappings = [
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

    mappings.forEach(
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

        lists.push(
          unionIdLists(
            listsForField
          )
        );
      }
    );

    if (
      lists.length === 0
    ) {
      return registry
        .getAll(
          'JOB'
        )
        .map(
          (job) =>
            job.id
        );
    }

    return intersectIdLists(
      lists
    );
  }

  getEligibilityRulesForTarget(
    targetType,
    targetId
  ) {
    const targetTypeIds =
      this.getEligibilityRuleIdsBy(
        'byTargetType',
        targetType
      );

    const targetIdIds =
      this.getEligibilityRuleIdsBy(
        'byTargetId',
        targetId
      );

    return intersectIdLists([
      targetTypeIds,
      targetIdIds
    ]);
  }

  searchTokens(
    domain,
    tokens
  ) {
    if (
      !Array.isArray(tokens)
    ) {
      return [];
    }

    const lists =
      tokens
        .map(
          (token) =>
            this.getIds(
              domain,
              'bySearchToken',
              token
            )
        )
        .filter(
          (list) =>
            list.length > 0
        );

    return unionIdLists(
      lists
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

      domains: [
        ...Object.keys(
          this.indexes
        )
      ]
    };
  }
}

const runtimeIndexes =
  new RuntimeIndexStore();

function rebuildIndexes() {
  return runtimeIndexes.build();
}

export {
  addToIndex,
  addManyToIndex,
  tokenize,

  buildJobIndexes,
  buildExamIndexes,
  buildServiceCadreIndexes,
  buildEligibilityRuleIndexes,
  buildQualificationIndexes,
  buildDepartmentIndexes,
  buildOrganisationIndexes,
  buildSourceIndexes,

  createRuntimeIndexes,

  getIdsFromIndex,
  intersectIdLists,
  unionIdLists,

  RuntimeIndexStore,
  runtimeIndexes,
  rebuildIndexes
};

export default runtimeIndexes;
