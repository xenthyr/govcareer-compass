/**
 * GovCareer Compass
 * ============================================================
 * Runtime Derived Index Builder
 * ============================================================
 *
 * Derived indexes are generated only from normalized canonical records stored
 * in the runtime registry. They contain stable references to canonical IDs and
 * never become an independent source of government facts.
 *
 * Responsibilities:
 * - build deterministic lookup indexes from registry records;
 * - understand the finalized nested canonical data model;
 * - keep canonical records separate from derived index state;
 * - expose stable ID-posting helpers for filters and recommendation consumers;
 * - build a unified search index containing references, not duplicated records.
 *
 * This module does NOT:
 * - normalize canonical records;
 * - validate canonical records;
 * - mutate canonical records;
 * - determine eligibility;
 * - calculate preference fit, scores or rankings;
 * - make AI decisions;
 * - load static index JSON files.
 *
 * Architectural position:
 *
 *   runtime registry
 *        ↓
 *   derived index builder
 *        ↓
 *   ID postings / search references
 *        ↓
 *   search / filters / other consumers
 *
 * The registry is the only canonical record source used here.
 */

import registry from './registry.js';

import {
  cleanString
} from './normalizer.js';

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const INDEX_VERSION = '2.0.0';
const MIN_TOKEN_LENGTH = 2;

const SEARCHABLE_ENTITY_TYPES =
  Object.freeze([
    'JOB',
    'EXAM',
    'DEPARTMENT',
    'ORGANISATION',
    'QUALIFICATION',
    'CATEGORY',
    'LOCATION',
    'GLOSSARY',
    'GOVERNMENT',
    'STATE',
    'SERVICE_CADRE',
    'SOURCE'
  ]);

/* -------------------------------------------------------------------------- */
/* Generic helpers                                                            */
/* -------------------------------------------------------------------------- */

function normalizeKey(value) {
  return cleanString(
    value,
    ''
  )
    .normalize('NFKD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[\u200B-\u200D\uFEFF]/g,
      ''
    )
    .toLowerCase()
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function normalizeId(value) {
  return cleanString(
    value,
    ''
  ).trim();
}

function getPathValue(
  record,
  path
) {
  if (
    !record ||
    typeof record !== 'object'
  ) {
    return undefined;
  }

  return String(
    path || ''
  )
    .split('.')
    .filter(Boolean)
    .reduce(
      (
        current,
        key
      ) => {
        if (
          current === null ||
          current === undefined ||
          typeof current !== 'object'
        ) {
          return undefined;
        }

        return current[key];
      },
      record
    );
}

function flattenValues(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return [];
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return [
      String(value)
    ];
  }

  if (
    Array.isArray(value)
  ) {
    return value.flatMap(
      flattenValues
    );
  }

  if (
    typeof value === 'object'
  ) {
    return Object.values(
      value
    ).flatMap(
      flattenValues
    );
  }

  return [];
}

function firstValue(
  record,
  paths
) {
  const pathList =
    Array.isArray(paths)
      ? paths
      : [
          paths
        ];

  for (
    const path of pathList
  ) {
    const value =
      getPathValue(
        record,
        path
      );

    const values =
      flattenValues(
        value
      );

    const first =
      values.find(
        (item) =>
          normalizeKey(
            item
          )
      );

    if (
      first !== undefined
    ) {
      return first;
    }
  }

  return '';
}

function valuesAtPaths(
  record,
  paths
) {
  const values = [];

  (
    Array.isArray(paths)
      ? paths
      : [
          paths
        ]
  ).forEach(
    (path) => {
      values.push(
        ...flattenValues(
          getPathValue(
            record,
            path
          )
        )
      );
    }
  );

  return values.filter(
    (value) =>
      normalizeKey(
        value
      )
  );
}

function uniqueValues(
  values
) {
  const output = [];
  const seen = new Set();

  (
    Array.isArray(values)
      ? values
      : [
          values
        ]
  ).forEach(
    (value) => {
      const normalized =
        normalizeKey(
          value
        );

      if (
        !normalized ||
        seen.has(
          normalized
        )
      ) {
        return;
      }

      seen.add(
        normalized
      );

      output.push(
        String(
          value
        ).trim()
      );
    }
  );

  return output;
}

function normalizeIdValues(
  values
) {
  return uniqueValues(
    Array.isArray(values)
      ? values
      : [
          values
        ]
  )
    .map(
      normalizeId
    )
    .filter(Boolean);
}

function getRecordId(
  record
) {
  return normalizeId(
    record?.id
  );
}

function assertUniqueIds(
  records,
  entityType
) {
  const seen = new Set();

  if (
    !Array.isArray(records)
  ) {
    throw new TypeError(
      `Index builder expected an array for ${entityType}.`
    );
  }

  records.forEach(
    (record) => {
      const id =
        getRecordId(
          record
        );

      if (
        !id
      ) {
        throw new TypeError(
          `Cannot build ${entityType} index: every canonical record must contain a non-empty string id.`
        );
      }

      if (
        seen.has(
          id
        )
      ) {
        throw new Error(
          `Duplicate canonical ID "${id}" encountered while building ${entityType} indexes.`
        );
      }

      seen.add(
        id
      );
    }
  );
}

/* -------------------------------------------------------------------------- */
/* Posting maps                                                               */
/* -------------------------------------------------------------------------- */

function addToIndex(
  map,
  key,
  id
) {
  if (
    !(map instanceof Map)
  ) {
    throw new TypeError(
      'addToIndex() requires a Map index.'
    );
  }

  const normalized =
    normalizeKey(
      key
    );

  const normalizedId =
    normalizeId(
      id
    );

  if (
    !normalized ||
    !normalizedId
  ) {
    return;
  }

  if (
    !map.has(
      normalized
    )
  ) {
    map.set(
      normalized,
      new Set()
    );
  }

  map
    .get(
      normalized
    )
    .add(
      normalizedId
    );
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
  addManyToIndex(
    map,
    flattenValues(
      values
    ),
    id
  );
}

/* -------------------------------------------------------------------------- */
/* Tokenization                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Deterministic bilingual tokenizer.
 *
 * Requirements:
 * - case-insensitive English matching;
 * - Unicode-stable comparison;
 * - Bengali-safe token preservation;
 * - punctuation normalization;
 * - no external dependency;
 * - stable output order;
 * - minimum token length of two characters.
 *
 * Search tokenization is deliberately separate from canonical data
 * normalization. `searchTokens` are derived hints only.
 */
function tokenize(
  value
) {
  const normalized =
    normalizeKey(
      value
    ).replace(
      /[^\p{L}\p{N}\s-]/gu,
      ' '
    );

  if (
    !normalized
  ) {
    return [];
  }

  return [
    ...new Set(
      normalized
        .split(
          /\s+/
        )
        .map(
          (token) =>
            token.trim()
        )
        .filter(
          (token) =>
            token.length >=
            MIN_TOKEN_LENGTH
        )
    )
  ];
}

function tokenizeMany(
  values
) {
  const tokens = [];

  (
    Array.isArray(values)
      ? values
      : [
          values
        ]
  ).forEach(
    (value) => {
      tokens.push(
        ...tokenize(
          value
        )
      );
    }
  );

  return [
    ...new Set(
      tokens
    )
  ];
}

/* -------------------------------------------------------------------------- */
/* Index-group construction                                                   */
/* -------------------------------------------------------------------------- */

function createIndexGroup(
  fieldNames
) {
  const group = {
    byId: new Map()
  };

  (
    fieldNames ||
    []
  ).forEach(
    (field) => {
      group[field] =
        new Map();
    }
  );

  return group;
}

function indexByPaths(
  map,
  record,
  paths,
  id
) {
  addNestedIndex(
    map,
    valuesAtPaths(
      record,
      paths
    ),
    id
  );
}

function indexByPath(
  map,
  record,
  path,
  id
) {
  indexByPaths(
    map,
    record,
    [
      path
    ],
    id
  );
}

function setById(
  indexGroup,
  id
) {
  indexGroup.byId.set(
    id,
    id
  );
}

/* -------------------------------------------------------------------------- */
/* Job indexes                                                                */
/* -------------------------------------------------------------------------- */

function buildJobIndexes(
  jobs
) {
  assertUniqueIds(
    jobs,
    'JOB'
  );

  const indexes =
    createIndexGroup([
      'byGovernmentId',
      'byStateId',
      'byDepartmentId',
      'byOrganisationId',
      'byServiceCadreId',
      'byParentPostId',
      'byRecruitmentRouteId',
      'byRecruitmentId',
      'byExamId',
      'byQualificationId',
      'byEligibilityRuleId',
      'byPayProfileId',
      'byLocationProfileId',
      'byHousingProfileId',
      'byPromotionProfileId',
      'byBenefitProfileId',
      'bySourceId',
      'byEducationLevel',
      'byCareerStatus',
      'byRecruitmentStatus',
      'byRecruitmentMode',
      'byFreshEntryEligible',
      'byStatus',
      'byConfidence',
      'byCurrentness',
      'byDeskField',
      'byLanguage',
      'byPhysicalRequirement',
      'bySearchToken'
    ]);

  jobs.forEach(
    (job) => {
      const id =
        getRecordId(
          job
        );

      setById(
        indexes,
        id
      );

      indexByPath(
        indexes.byGovernmentId,
        job,
        'identity.governmentId',
        id
      );

      indexByPath(
        indexes.byStateId,
        job,
        'identity.stateId',
        id
      );

      indexByPath(
        indexes.byDepartmentId,
        job,
        'identity.departmentId',
        id
      );

      indexByPath(
        indexes.byOrganisationId,
        job,
        'identity.organisationId',
        id
      );

      indexByPath(
        indexes.byServiceCadreId,
        job,
        'identity.serviceCadreId',
        id
      );

      indexByPath(
        indexes.byParentPostId,
        job,
        'identity.parentPostId',
        id
      );

      indexByPath(
        indexes.byRecruitmentRouteId,
        job,
        'recruitment.routeIds',
        id
      );

      indexByPath(
        indexes.byRecruitmentId,
        job,
        'recruitment.recruitmentIds',
        id
      );

      indexByPath(
        indexes.byExamId,
        job,
        'recruitment.examIds',
        id
      );

      indexByPath(
        indexes.byQualificationId,
        job,
        'eligibility.qualificationIds',
        id
      );

      indexByPath(
        indexes.byQualificationId,
        job,
        'eligibility.minimumQualificationId',
        id
      );

      indexByPath(
        indexes.byEligibilityRuleId,
        job,
        'eligibility.ruleIds',
        id
      );

      indexByPath(
        indexes.byPayProfileId,
        job,
        'payProfileId',
        id
      );

      indexByPath(
        indexes.byLocationProfileId,
        job,
        'locationProfileId',
        id
      );

      indexByPath(
        indexes.byHousingProfileId,
        job,
        'housingProfileId',
        id
      );

      indexByPath(
        indexes.byPromotionProfileId,
        job,
        'promotionProfileId',
        id
      );

      indexByPath(
        indexes.byBenefitProfileId,
        job,
        'benefitProfileId',
        id
      );

      indexByPath(
        indexes.bySourceId,
        job,
        'sourceIds',
        id
      );

      indexByPath(
        indexes.byEducationLevel,
        job,
        'eligibility.educationLevel',
        id
      );

      indexByPath(
        indexes.byCareerStatus,
        job,
        'recruitment.careerStatus',
        id
      );

      indexByPath(
        indexes.byRecruitmentStatus,
        job,
        'recruitment.currentRecruitmentStatus',
        id
      );

      indexByPath(
        indexes.byRecruitmentMode,
        job,
        'recruitment.mode',
        id
      );

      indexByPath(
        indexes.byFreshEntryEligible,
        job,
        'recruitment.freshEntryEligible',
        id
      );

      indexByPaths(
        indexes.byStatus,
        job,
        [
          'recruitment.careerStatus',
          'status'
        ],
        id
      );

      indexByPath(
        indexes.byConfidence,
        job,
        'confidence',
        id
      );

      indexByPath(
        indexes.byCurrentness,
        job,
        'currentness',
        id
      );

      indexByPath(
        indexes.byDeskField,
        job,
        'lifestyle.deskField',
        id
      );

      const languageValues =
        valuesAtPaths(
          job,
          [
            'eligibility.languages',
            'eligibility.languageIds',
            'recruitment.languages',
            'identity.languages'
          ]
        );

      addNestedIndex(
        indexes.byLanguage,
        languageValues,
        id
      );

      const physicalValues =
        valuesAtPaths(
          job,
          [
            'eligibility.physical',
            'eligibility.medical',
            'eligibility.physicalRequirements',
            'eligibility.medicalRequirements'
          ]
        );

      addNestedIndex(
        indexes.byPhysicalRequirement,
        physicalValues,
        id
      );

      addNestedIndex(
        indexes.bySearchToken,
        getSearchFields(
          job,
          'JOB'
        ).tokens,
        id
      );
    }
  );

  return indexes;
}

/* -------------------------------------------------------------------------- */
/* Exam indexes                                                               */
/* -------------------------------------------------------------------------- */

function buildExamIndexes(
  exams
) {
  assertUniqueIds(
    exams,
    'EXAM'
  );

  const indexes =
    createIndexGroup([
      'byGovernmentId',
      'byStateId',
      'byRecruitingAuthorityId',
      'byDepartmentId',
      'byOrganisationId',
      'byServiceCadreId',
      'byExamFamilyId',
      'byQualificationLevelId',
      'byQualificationId',
      'byPostId',
      'byJobId',
      'bySourceId',
      'byYear',
      'byCycle',
      'byStatus',
      'byDifficulty',
      'byPhysicalRequirement',
      'bySkillTest',
      'byInterview',
      'byLanguage',
      'bySearchToken'
    ]);

  exams.forEach(
    (exam) => {
      const id =
        getRecordId(
          exam
        );

      setById(
        indexes,
        id
      );

      indexByPath(
        indexes.byGovernmentId,
        exam,
        'governmentId',
        id
      );

      indexByPath(
        indexes.byStateId,
        exam,
        'stateId',
        id
      );

      indexByPath(
        indexes.byRecruitingAuthorityId,
        exam,
        'recruitingAuthorityId',
        id
      );

      indexByPath(
        indexes.byDepartmentId,
        exam,
        'departmentId',
        id
      );

      indexByPath(
        indexes.byOrganisationId,
        exam,
        'organisationId',
        id
      );

      indexByPath(
        indexes.byServiceCadreId,
        exam,
        'serviceCadreId',
        id
      );

      indexByPath(
        indexes.byExamFamilyId,
        exam,
        'examFamilyId',
        id
      );

      indexByPath(
        indexes.byQualificationLevelId,
        exam,
        'qualificationLevelIds',
        id
      );

      indexByPath(
        indexes.byQualificationId,
        exam,
        'qualificationIds',
        id
      );

      indexByPaths(
        indexes.byPostId,
        exam,
        [
          'postIds',
          'jobIds'
        ],
        id
      );

      indexByPath(
        indexes.byJobId,
        exam,
        'jobIds',
        id
      );

      indexByPath(
        indexes.bySourceId,
        exam,
        'sourceIds',
        id
      );

      indexByPath(
        indexes.byYear,
        exam,
        'year',
        id
      );

      indexByPath(
        indexes.byCycle,
        exam,
        'cycle',
        id
      );

      indexByPath(
        indexes.byStatus,
        exam,
        'status',
        id
      );

      indexByPath(
        indexes.byDifficulty,
        exam,
        'difficulty',
        id
      );

      indexByPath(
        indexes.byPhysicalRequirement,
        exam,
        'physicalRequirement',
        id
      );

      indexByPath(
        indexes.bySkillTest,
        exam,
        'skillTest',
        id
      );

      indexByPath(
        indexes.byInterview,
        exam,
        'interview',
        id
      );

      indexByPaths(
        indexes.byLanguage,
        exam,
        [
          'language',
          'languages',
          'languageIds'
        ],
        id
      );

      addNestedIndex(
        indexes.bySearchToken,
        getSearchFields(
          exam,
          'EXAM'
        ).tokens,
        id
      );
    }
  );

  return indexes;
}

/* -------------------------------------------------------------------------- */
/* Service-cadre indexes                                                      */
/* -------------------------------------------------------------------------- */

function buildServiceCadreIndexes(
  serviceCadres
) {
  assertUniqueIds(
    serviceCadres,
    'SERVICE_CADRE'
  );

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
      'byRecruitmentId',
      'byPayId',
      'byPromotionId',
      'byBenefitId',
      'byLocationId',
      'bySourceId',
      'byStatus',
      'byPostingScope',
      'byTransferScope',
      'bySearchToken'
    ]);

  serviceCadres.forEach(
    (record) => {
      const id =
        getRecordId(
          record
        );

      setById(
        indexes,
        id
      );

      indexByPath(
        indexes.byGovernmentId,
        record,
        'governmentId',
        id
      );

      indexByPath(
        indexes.byStateId,
        record,
        'stateId',
        id
      );

      indexByPath(
        indexes.byStateId,
        record,
        'cadreScope.stateIds',
        id
      );

      indexByPath(
        indexes.byMinistryId,
        record,
        'ministryId',
        id
      );

      indexByPath(
        indexes.byDepartmentId,
        record,
        'departmentId',
        id
      );

      indexByPath(
        indexes.byOrganisationId,
        record,
        'organisationId',
        id
      );

      indexByPath(
        indexes.byParentServiceCadreId,
        record,
        'parentServiceCadreId',
        id
      );

      indexByPath(
        indexes.byType,
        record,
        'type',
        id
      );

      indexByPath(
        indexes.byServiceGroup,
        record,
        'serviceGroup',
        id
      );

      indexByPath(
        indexes.byCadreControl,
        record,
        'cadreControl',
        id
      );

      indexByPath(
        indexes.byClassification,
        record,
        'classification',
        id
      );

      indexByPath(
        indexes.byPostId,
        record,
        'postIds',
        id
      );

      indexByPath(
        indexes.byExamId,
        record,
        'examIds',
        id
      );

      indexByPath(
        indexes.byEligibilityRuleId,
        record,
        'eligibilityRuleIds',
        id
      );

      indexByPaths(
        indexes.byRecruitmentId,
        record,
        [
          'recruitmentIds',
          'recruitmentRouteIds'
        ],
        id
      );

      indexByPath(
        indexes.byPayId,
        record,
        'payIds',
        id
      );

      indexByPath(
        indexes.byPromotionId,
        record,
        'promotionIds',
        id
      );

      indexByPath(
        indexes.byBenefitId,
        record,
        'benefitIds',
        id
      );

      indexByPaths(
        indexes.byLocationId,
        record,
        [
          'locationIds',
          'postingScope.locationIds'
        ],
        id
      );

      indexByPath(
        indexes.bySourceId,
        record,
        'sourceIds',
        id
      );

      indexByPath(
        indexes.byStatus,
        record,
        'status',
        id
      );

      indexByPaths(
        indexes.byPostingScope,
        record,
        [
          'postingScope.scopeType',
          'cadreScope.scopeType'
        ],
        id
      );

      indexByPath(
        indexes.byTransferScope,
        record,
        'transferControl.transferScope',
        id
      );

      addNestedIndex(
        indexes.bySearchToken,
        getSearchFields(
          record,
          'SERVICE_CADRE'
        ).tokens,
        id
      );
    }
  );

  return indexes;
}

/* -------------------------------------------------------------------------- */
/* Eligibility-rule indexes                                                   */
/* -------------------------------------------------------------------------- */

function buildEligibilityRuleIndexes(
  rules
) {
  assertUniqueIds(
    rules,
    'ELIGIBILITY_RULE'
  );

  const indexes =
    createIndexGroup([
      'byTargetId',
      'byTargetType',
      'byRuleClass',
      'byConditionType',
      'byOperator',
      'byQualificationId',
      'bySubjectId',
      'byRequiredQualificationId',
      'byRequiredSubjectId',
      'byGovernmentId',
      'byStateId',
      'byRecruitmentRouteType',
      'byRecruitmentId',
      'byStatus',
      'byPriority',
      'bySourceId',
      'byDependsOnRuleId',
      'byParentRuleId'
    ]);

  rules.forEach(
    (rule) => {
      const id =
        getRecordId(
          rule
        );

      setById(
        indexes,
        id
      );

      indexByPath(
        indexes.byTargetId,
        rule,
        'targetId',
        id
      );

      indexByPath(
        indexes.byTargetType,
        rule,
        'targetType',
        id
      );

      indexByPath(
        indexes.byRuleClass,
        rule,
        'ruleClass',
        id
      );

      indexByPath(
        indexes.byConditionType,
        rule,
        'conditionType',
        id
      );

      indexByPath(
        indexes.byOperator,
        rule,
        'operator',
        id
      );

      indexByPath(
        indexes.byQualificationId,
        rule,
        'qualificationIds',
        id
      );

      indexByPath(
        indexes.byQualificationId,
        rule,
        'requiredQualificationIds',
        id
      );

      indexByPath(
        indexes.byRequiredQualificationId,
        rule,
        'requiredQualificationIds',
        id
      );

      indexByPath(
        indexes.bySubjectId,
        rule,
        'subjectIds',
        id
      );

      indexByPath(
        indexes.bySubjectId,
        rule,
        'requiredSubjectIds',
        id
      );

      indexByPath(
        indexes.byRequiredSubjectId,
        rule,
        'requiredSubjectIds',
        id
      );

      indexByPaths(
        indexes.byGovernmentId,
        rule,
        [
          'governmentId',
          'scope.governmentId'
        ],
        id
      );

      indexByPaths(
        indexes.byStateId,
        rule,
        [
          'stateId',
          'scope.stateId'
        ],
        id
      );

      indexByPath(
        indexes.byRecruitmentRouteType,
        rule,
        'recruitmentRouteTypes',
        id
      );

      indexByPath(
        indexes.byRecruitmentId,
        rule,
        'recruitmentIds',
        id
      );

      indexByPath(
        indexes.byStatus,
        rule,
        'status',
        id
      );

      indexByPath(
        indexes.byPriority,
        rule,
        'priority',
        id
      );

      indexByPath(
        indexes.bySourceId,
        rule,
        'sourceIds',
        id
      );

      indexByPath(
        indexes.byDependsOnRuleId,
        rule,
        'dependsOnRuleIds',
        id
      );

      indexByPath(
        indexes.byParentRuleId,
        rule,
        'parentRuleIds',
        id
      );
    }
  );

  return indexes;
}

/* -------------------------------------------------------------------------- */
/* Qualification indexes                                                      */
/* -------------------------------------------------------------------------- */

function buildQualificationIndexes(
  qualifications
) {
  assertUniqueIds(
    qualifications,
    'QUALIFICATION'
  );

  const indexes =
    createIndexGroup([
      'byType',
      'byCategory',
      'byLevel',
      'bySubject',
      'bySubjectId',
      'byProfessional',
      'byTeaching',
      'byTechnical',
      'byTrade',
      'byGovernmentRecognition',
      'byStatus',
      'byAlias',
      'byFullForm',
      'byAbbreviation',
      'bySearchToken'
    ]);

  qualifications.forEach(
    (qualification) => {
      const id =
        getRecordId(
          qualification
        );

      setById(
        indexes,
        id
      );

      indexByPath(
        indexes.byType,
        qualification,
        'type',
        id
      );

      indexByPath(
        indexes.byCategory,
        qualification,
        'category',
        id
      );

      indexByPath(
        indexes.byLevel,
        qualification,
        'level',
        id
      );

      indexByPaths(
        indexes.bySubject,
        qualification,
        [
          'subject',
          'subjects'
        ],
        id
      );

      indexByPath(
        indexes.bySubjectId,
        qualification,
        'subjectIds',
        id
      );

      indexBooleanValue(
        indexes.byProfessional,
        qualification?.professional,
        id
      );

      indexBooleanValue(
        indexes.byTeaching,
        qualification?.teaching,
        id
      );

      indexBooleanValue(
        indexes.byTechnical,
        qualification?.technical,
        id
      );

      indexByPath(
        indexes.byTrade,
        qualification,
        'trade',
        id
      );

      indexBooleanValue(
        indexes.byGovernmentRecognition,
        qualification?.governmentRecognition,
        id
      );

      indexByPath(
        indexes.byStatus,
        qualification,
        'status',
        id
      );

      indexByPath(
        indexes.byAlias,
        qualification,
        'aliases',
        id
      );

      indexByPath(
        indexes.byFullForm,
        qualification,
        'fullForm',
        id
      );

      indexByPath(
        indexes.byAbbreviation,
        qualification,
        'abbreviation',
        id
      );

      addNestedIndex(
        indexes.bySearchToken,
        getSearchFields(
          qualification,
          'QUALIFICATION'
        ).tokens,
        id
      );
    }
  );

  return indexes;
}

function indexBooleanValue(
  map,
  value,
  id
) {
  if (
    value === undefined ||
    value === null
  ) {
    return;
  }

  addToIndex(
    map,
    String(
      Boolean(value)
    ),
    id
  );
}

/* -------------------------------------------------------------------------- */
/* Department / organisation / source indexes                                */
/* -------------------------------------------------------------------------- */

function buildDepartmentIndexes(
  departments
) {
  assertUniqueIds(
    departments,
    'DEPARTMENT'
  );

  const indexes =
    createIndexGroup([
      'byGovernmentId',
      'byStateId',
      'byMinistryId',
      'byOrganisationId',
      'byServiceCadreId',
      'byExamId',
      'byJobId',
      'byLocationId',
      'byCategoryId',
      'byStatus',
      'byResearchStatus',
      'byRecruitmentAuthorityId',
      'bySearchToken'
    ]);

  departments.forEach(
    (department) => {
      const id =
        getRecordId(
          department
        );

      setById(
        indexes,
        id
      );

      indexByPath(
        indexes.byGovernmentId,
        department,
        'governmentId',
        id
      );

      indexByPath(
        indexes.byStateId,
        department,
        'stateId',
        id
      );

      indexByPath(
        indexes.byMinistryId,
        department,
        'ministryId',
        id
      );

      indexByPath(
        indexes.byOrganisationId,
        department,
        'organisationIds',
        id
      );

      indexByPath(
        indexes.byServiceCadreId,
        department,
        'serviceCadreIds',
        id
      );

      indexByPath(
        indexes.byExamId,
        department,
        'examIds',
        id
      );

      indexByPath(
        indexes.byJobId,
        department,
        'jobIds',
        id
      );

      indexByPath(
        indexes.byLocationId,
        department,
        'locationIds',
        id
      );

      indexByPath(
        indexes.byCategoryId,
        department,
        'categoryIds',
        id
      );

      indexByPath(
        indexes.byStatus,
        department,
        'status',
        id
      );

      indexByPath(
        indexes.byResearchStatus,
        department,
        'researchStatus',
        id
      );

      indexByPath(
        indexes.byRecruitmentAuthorityId,
        department,
        'recruitmentAuthorityIds',
        id
      );

      addNestedIndex(
        indexes.bySearchToken,
        getSearchFields(
          department,
          'DEPARTMENT'
        ).tokens,
        id
      );
    }
  );

  return indexes;
}

function buildOrganisationIndexes(
  organisations
) {
  assertUniqueIds(
    organisations,
    'ORGANISATION'
  );

  const indexes =
    createIndexGroup([
      'byGovernmentId',
      'byStateId',
      'byDepartmentId',
      'byMinistryId',
      'byServiceCadreId',
      'byExamId',
      'byJobId',
      'byLocationId',
      'byType',
      'byStatus',
      'bySearchToken'
    ]);

  organisations.forEach(
    (organisation) => {
      const id =
        getRecordId(
          organisation
        );

      setById(
        indexes,
        id
      );

      indexByPath(
        indexes.byGovernmentId,
        organisation,
        'governmentId',
        id
      );

      indexByPath(
        indexes.byStateId,
        organisation,
        'stateId',
        id
      );

      indexByPath(
        indexes.byDepartmentId,
        organisation,
        'departmentId',
        id
      );

      indexByPath(
        indexes.byMinistryId,
        organisation,
        'ministryId',
        id
      );

      indexByPath(
        indexes.byServiceCadreId,
        organisation,
        'serviceCadreIds',
        id
      );

      indexByPath(
        indexes.byExamId,
        organisation,
        'examIds',
        id
      );

      indexByPath(
        indexes.byJobId,
        organisation,
        'jobIds',
        id
      );

      indexByPath(
        indexes.byLocationId,
        organisation,
        'locationIds',
        id
      );

      indexByPath(
        indexes.byType,
        organisation,
        'type',
        id
      );

      indexByPath(
        indexes.byStatus,
        organisation,
        'status',
        id
      );

      addNestedIndex(
        indexes.bySearchToken,
        getSearchFields(
          organisation,
          'ORGANISATION'
        ).tokens,
        id
      );
    }
  );

  return indexes;
}

function buildSourceIndexes(
  sources
) {
  assertUniqueIds(
    sources,
    'SOURCE'
  );

  const indexes =
    createIndexGroup([
      'byGovernmentId',
      'byStateId',
      'byDepartmentId',
      'byOrganisationId',
      'byExamId',
      'byJobId',
      'byServiceCadreId',
      'bySourceTypeId',
      'byConfidence',
      'byPublicationYear',
      'byEffectiveYear',
      'byDomain',
      'byStatus'
    ]);

  sources.forEach(
    (source) => {
      const id =
        getRecordId(
          source
        );

      setById(
        indexes,
        id
      );

      indexByPath(
        indexes.byGovernmentId,
        source,
        'governmentId',
        id
      );

      indexByPath(
        indexes.byStateId,
        source,
        'stateId',
        id
      );

      indexByPath(
        indexes.byDepartmentId,
        source,
        'departmentId',
        id
      );

      indexByPath(
        indexes.byOrganisationId,
        source,
        'organisationId',
        id
      );

      indexByPath(
        indexes.byExamId,
        source,
        'examIds',
        id
      );

      indexByPath(
        indexes.byJobId,
        source,
        'jobIds',
        id
      );

      indexByPath(
        indexes.byServiceCadreId,
        source,
        'serviceCadreIds',
        id
      );

      indexByPath(
        indexes.bySourceTypeId,
        source,
        'sourceTypeId',
        id
      );

      indexByPath(
        indexes.byConfidence,
        source,
        'confidence',
        id
      );

      const publicationDate =
        firstValue(
          source,
          [
            'publicationDate',
            'publishedDate'
          ]
        );

      const effectiveDate =
        firstValue(
          source,
          [
            'effectiveDate',
            'effectiveFrom'
          ]
        );

      if (
        publicationDate.length >=
        4
      ) {
        addToIndex(
          indexes.byPublicationYear,
          publicationDate.slice(
            0,
            4
          ),
          id
        );
      }

      if (
        effectiveDate.length >=
        4
      ) {
        addToIndex(
          indexes.byEffectiveYear,
          effectiveDate.slice(
            0,
            4
          ),
          id
        );
      }

      indexByPath(
        indexes.byDomain,
        source,
        'domain',
        id
      );

      indexByPath(
        indexes.byStatus,
        source,
        'status',
        id
      );
    }
  );

  return indexes;
}

/* -------------------------------------------------------------------------- */
/* Generic utility indexes                                                    */
/* -------------------------------------------------------------------------- */

function buildGenericIndexes(
  records,
  fields,
  entityType = 'ENTITY'
) {
  assertUniqueIds(
    records,
    entityType
  );

  const indexes =
    createIndexGroup(
      fields
    );

  records.forEach(
    (record) => {
      const id =
        getRecordId(
          record
        );

      setById(
        indexes,
        id
      );

      fields.forEach(
        (fieldName) => {
          const map =
            indexes[
              fieldName
            ];

          if (
            !map
          ) {
            return;
          }

          const property =
            String(
              fieldName
            )
              .replace(
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

          indexByPath(
            map,
            record,
            camelCase,
            id
          );
        }
      );
    }
  );

  return indexes;
}

/* -------------------------------------------------------------------------- */
/* Search index                                                               */
/* -------------------------------------------------------------------------- */

const SEARCH_FIELD_PATHS =
  Object.freeze({
    JOB: [
      'id',
      'identity.post',
      'identity.abbreviation',
      'identity.aliases',
      'identity.historicalNames',
      'identity.roleType',
      'identity.description',
      'recruitment.routeIds',
      'recruitment.mode',
      'eligibility.minimumQualification',
      'eligibility.eligibilitySummary',
      'lifestyle.deskField',
      'sourceIds'
    ],

    EXAM: [
      'id',
      'name',
      'title',
      'officialName',
      'shortName',
      'fullForm',
      'abbreviation',
      'aliases',
      'historicalNames',
      'description',
      'keywords',
      'searchText'
    ],

    SERVICE_CADRE: [
      'id',
      'name',
      'shortName',
      'fullForm',
      'historicalNames',
      'keywords',
      'description',
      'type',
      'serviceGroup',
      'classification',
      'cadreControl',
      'cadreAuthority.authorityName',
      'cadreScope.regionNames',
      'cadreScope.districtNames',
      'postingScope.description',
      'transferControl.description'
    ],

    DEPARTMENT: [
      'id',
      'name',
      'shortName',
      'fullForm',
      'aliases',
      'historicalNames',
      'keywords',
      'description',
      'ministry',
      'organisationNames',
      'serviceNames',
      'jobNames',
      'locationNames'
    ],

    ORGANISATION: [
      'id',
      'name',
      'shortName',
      'fullForm',
      'aliases',
      'historicalNames',
      'keywords',
      'description',
      'type'
    ],

    QUALIFICATION: [
      'id',
      'name',
      'shortName',
      'fullForm',
      'abbreviation',
      'aliases',
      'historicalNames',
      'keywords',
      'description',
      'type',
      'category',
      'level',
      'subject',
      'subjects',
      'searchText'
    ],

    CATEGORY: [
      'id',
      'name',
      'shortName',
      'fullForm',
      'abbreviation',
      'aliases',
      'historicalNames',
      'keywords',
      'description',
      'searchText'
    ],

    LOCATION: [
      'id',
      'name',
      'shortName',
      'fullForm',
      'aliases',
      'historicalNames',
      'keywords',
      'description',
      'city',
      'district',
      'state',
      'region',
      'searchText'
    ],

    GLOSSARY: [
      'id',
      'term',
      'name',
      'title',
      'aliases',
      'definition',
      'description',
      'keywords',
      'searchText'
    ],

    GOVERNMENT: [
      'id',
      'name',
      'shortName',
      'fullForm',
      'abbreviation',
      'aliases',
      'historicalNames',
      'keywords',
      'description',
      'searchText'
    ],

    STATE: [
      'id',
      'name',
      'shortName',
      'fullForm',
      'abbreviation',
      'aliases',
      'historicalNames',
      'keywords',
      'description',
      'searchText'
    ],

    SOURCE: [
      'id',
      'title',
      'name',
      'shortName',
      'fullForm',
      'aliases',
      'description',
      'domain',
      'keywords'
    ]
  });

function getSearchFields(
  record,
  entityType
) {
  const paths =
    SEARCH_FIELD_PATHS[
      entityType
    ] || [
      'id',
      'name',
      'title',
      'description',
      'aliases',
      'keywords',
      'searchText'
    ];

  const fieldValues =
    valuesAtPaths(
      record,
      paths
    );

  const aliases =
    valuesAtPaths(
      record,
      [
        'aliases',
        'identity.aliases',
        'historicalNames',
        'identity.historicalNames',
        'abbreviation',
        'identity.abbreviation',
        'shortName',
        'identity.post'
      ]
    );

  const keywords =
    valuesAtPaths(
      record,
      [
        'keywords',
        'identity.keywords',
        'searchTokens',
        'derived.searchTokens'
      ]
    );

  const allValues = [
    ...fieldValues,
    ...aliases,
    ...keywords
  ];

  const searchText =
    normalizeKey(
      allValues.join(
        ' '
      )
    );

  const tokens =
    tokenizeMany(
      allValues
    );

  return {
    searchText,
    tokens,
    aliases:
      uniqueValues(
        aliases
      ),
    keywords:
      uniqueValues(
        keywords
      ),
    primaryName:
      getPrimaryName(
        record
      )
  };
}

function getPrimaryName(
  record
) {
  const candidateValues =
    valuesAtPaths(
      record,
      [
        'name',
        'title',
        'term',
        'identity.post',
        'identity.name',
        'officialName',
        'shortName'
      ]
    );

  return (
    candidateValues[0] ||
    normalizeId(
      record?.id
    )
  );
}

function getLocalizedDisplayName(
  record
) {
  const candidates = [
    'name',
    'title',
    'term',
    'identity.post',
    'identity.name',
    'officialName',
    'shortName'
  ];

  for (
    const path of candidates
  ) {
    const value =
      getPathValue(
        record,
        path
      );

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(
        value
      )
    ) {
      const output = {};

      if (
        typeof value.en ===
          'string' &&
        value.en.trim()
      ) {
        output.en =
          value.en.trim();
      }

      if (
        typeof value.bn ===
          'string' &&
        value.bn.trim()
      ) {
        output.bn =
          value.bn.trim();
      }

      if (
        Object.keys(
          output
        ).length
      ) {
        return output;
      }
    }
  }

  const primary =
    getPrimaryName(
      record
    );

  return primary
    ? {
        en: primary
      }
    : {};
}

function getSearchRelationships(
  record,
  entityType
) {
  const relationships = {
    governmentId: '',
    stateId: '',
    departmentId: '',
    organisationId: '',
    serviceCadreId: '',
    examIds: [],
    jobIds: [],
    qualificationIds: [],
    locationIds: [],
    sourceIds: []
  };

  if (
    entityType ===
    'JOB'
  ) {
    relationships.governmentId =
      firstValue(
        record,
        'identity.governmentId'
      );

    relationships.stateId =
      firstValue(
        record,
        'identity.stateId'
      );

    relationships.departmentId =
      firstValue(
        record,
        'identity.departmentId'
      );

    relationships.organisationId =
      firstValue(
        record,
        'identity.organisationId'
      );

    relationships.serviceCadreId =
      firstValue(
        record,
        'identity.serviceCadreId'
      );

    relationships.examIds =
      normalizeIdValues(
        getPathValue(
          record,
          'recruitment.examIds'
        )
      );

    relationships.qualificationIds =
      normalizeIdValues(
        [
          ...flattenValues(
            getPathValue(
              record,
              'eligibility.qualificationIds'
            )
          ),
          ...flattenValues(
            getPathValue(
              record,
              'eligibility.minimumQualificationId'
            )
          )
        ]
      );

    relationships.sourceIds =
      normalizeIdValues(
        getPathValue(
          record,
          'sourceIds'
        )
      );

    return relationships;
  }

  relationships.governmentId =
    firstValue(
      record,
      'governmentId'
    );

  relationships.stateId =
    firstValue(
      record,
      'stateId'
    );

  relationships.departmentId =
    firstValue(
      record,
      'departmentId'
    );

  relationships.organisationId =
    firstValue(
      record,
      'organisationId'
    );

  relationships.serviceCadreId =
    firstValue(
      record,
      'serviceCadreId'
    );

  relationships.examIds =
    normalizeIdValues(
      getPathValue(
        record,
        'examIds'
      )
    );

  relationships.jobIds =
    normalizeIdValues(
      getPathValue(
        record,
        'jobIds'
      )
    );

  relationships.qualificationIds =
    normalizeIdValues(
      getPathValue(
        record,
        'qualificationIds'
      )
    );

  relationships.locationIds =
    normalizeIdValues(
      getPathValue(
        record,
        'locationIds'
      )
    );

  relationships.sourceIds =
    normalizeIdValues(
      getPathValue(
        record,
        'sourceIds'
      )
    );

  return relationships;
}

function createSearchDocument(
  record,
  entityType
) {
  const id =
    getRecordId(
      record
    );

  const searchFields =
    getSearchFields(
      record,
      entityType
    );

  const relationships =
    getSearchRelationships(
      record,
      entityType
    );

  return {
    id,
    canonicalId: id,
    entityType,

    displayName:
      getLocalizedDisplayName(
        record
      ),

    primaryName:
      searchFields.primaryName,

    aliases:
      searchFields.aliases,

    keywords:
      searchFields.keywords,

    searchText:
      searchFields.searchText,

    tokens:
      searchFields.tokens,

    ...relationships,

    status:
      firstValue(
        record,
        entityType === 'JOB'
          ? [
              'recruitment.careerStatus',
              'status'
            ]
          : [
              'status'
            ]
      ),

    confidence:
      firstValue(
        record,
        'confidence'
      )
  };
}

function createSearchBucket(
  records,
  entityType
) {
  assertUniqueIds(
    records,
    entityType
  );

  const bucket = {
    entityType,

    documents: {},

    byToken: {},
    byAlias: {},
    byAbbreviation: {},
    byFullForm: {},

    byId: {},

    byGovernmentId: {},
    byStateId: {},
    byDepartmentId: {},
    byOrganisationId: {},
    byServiceCadreId: {}
  };

  const addObjectPosting = (
    objectMap,
    key,
    id
  ) => {
    const normalized =
      normalizeKey(
        key
      );

    if (
      !normalized ||
      !id
    ) {
      return;
    }

    if (
      !Array.isArray(
        objectMap[
          normalized
        ]
      )
    ) {
      objectMap[
        normalized
      ] = [];
    }

    if (
      !objectMap[
        normalized
      ].includes(
        id
      )
    ) {
      objectMap[
        normalized
      ].push(
        id
      );
    }
  };

  records.forEach(
    (record) => {
      const id =
        getRecordId(
          record
        );

      const document =
        createSearchDocument(
          record,
          entityType
        );

      bucket.documents[
        id
      ] =
        document;

      bucket.byId[
        id
      ] = [
        id
      ];

      document.tokens.forEach(
        (token) =>
          addObjectPosting(
            bucket.byToken,
            token,
            id
          )
      );

      document.aliases.forEach(
        (alias) =>
          addObjectPosting(
            bucket.byAlias,
            alias,
            id
          )
      );

      valuesAtPaths(
        record,
        [
          'abbreviation',
          'identity.abbreviation'
        ]
      ).forEach(
        (value) =>
          addObjectPosting(
            bucket.byAbbreviation,
            value,
            id
          )
      );

      valuesAtPaths(
        record,
        [
          'fullForm'
        ]
      ).forEach(
        (value) =>
          addObjectPosting(
            bucket.byFullForm,
            value,
            id
          )
      );

      addObjectPosting(
        bucket.byGovernmentId,
        document.governmentId,
        id
      );

      addObjectPosting(
        bucket.byStateId,
        document.stateId,
        id
      );

      addObjectPosting(
        bucket.byDepartmentId,
        document.departmentId,
        id
      );

      addObjectPosting(
        bucket.byOrganisationId,
        document.organisationId,
        id
      );

      addObjectPosting(
        bucket.byServiceCadreId,
        document.serviceCadreId,
        id
      );
    }
  );

  return bucket;
}

function buildUnifiedSearchIndex(
  collectionsByType
) {
  const searchIndex = {
    indexType:
      'GLOBAL_SEARCH_INDEX',

    indexVersion:
      INDEX_VERSION,

    generated: true,

    generatedAt:
      new Date().toISOString(),

    sourceOfTruth:
      'runtime canonical registry',

    canonicalIdsOnly: true,

    fuzzyMatching: false,

    tokenization: {
      caseSensitive: false,
      unicodeNormalized: true,
      diacriticsInsensitive: true,
      whitespaceNormalized: true,
      punctuationNormalized: true,
      minimumTokenLength:
        MIN_TOKEN_LENGTH
    },

    entities: {},

    documents: [],

    indexes: {
      byId: {},
      byType: {},
      byGovernmentId: {},
      byStateId: {},
      byDepartmentId: {},
      byOrganisationId: {},
      byExamId: {},
      byJobId: {},
      byQualificationId: {},
      byCategoryId: {},
      byLocationId: {},
      bySourceId: {},
      byToken: {},
      byAlias: {},
      byAbbreviation: {},
      byFullForm: {}
    }
  };

  const aggregate = (
    map,
    key,
    posting
  ) => {
    const normalized =
      normalizeKey(
        key
      );

    if (
      !normalized ||
      !posting?.id
    ) {
      return;
    }

    if (
      !Array.isArray(
        map[
          normalized
        ]
      )
    ) {
      map[
        normalized
      ] = [];
    }

    const value = {
      id:
        posting.id,

      entityType:
        posting.entityType
    };

    const exists =
      map[
        normalized
      ].some(
        (item) =>
          item.id ===
            value.id &&
          item.entityType ===
            value.entityType
      );

    if (
      !exists
    ) {
      map[
        normalized
      ].push(
        value
      );
    }
  };

  SEARCHABLE_ENTITY_TYPES.forEach(
    (entityType) => {
      const records =
        Array.isArray(
          collectionsByType?.[
            entityType
          ]
        )
          ? collectionsByType[
              entityType
            ]
          : [];

      const bucket =
        createSearchBucket(
          records,
          entityType
        );

      searchIndex.entities[
        entityType
      ] =
        bucket;

      Object.values(
        bucket.documents
      ).forEach(
        (document) => {
          const compact = {
            ...document,
            entityType
          };

          searchIndex.documents.push(
            compact
          );

          aggregate(
            searchIndex.indexes.byId,
            document.id,
            compact
          );

          aggregate(
            searchIndex.indexes.byGovernmentId,
            document.governmentId,
            compact
          );

          aggregate(
            searchIndex.indexes.byStateId,
            document.stateId,
            compact
          );

          aggregate(
            searchIndex.indexes.byDepartmentId,
            document.departmentId,
            compact
          );

          aggregate(
            searchIndex.indexes.byOrganisationId,
            document.organisationId,
            compact
          );

          document.tokens.forEach(
            (token) =>
              aggregate(
                searchIndex.indexes.byToken,
                token,
                compact
              )
          );

          document.aliases.forEach(
            (alias) =>
              aggregate(
                searchIndex.indexes.byAlias,
                alias,
                compact
              )
          );

          valuesAtPaths(
            compact,
            [
              'abbreviation'
            ]
          ).forEach(
            (value) =>
              aggregate(
                searchIndex.indexes.byAbbreviation,
                value,
                compact
              )
          );

          valuesAtPaths(
            compact,
            [
              'fullForm'
            ]
          ).forEach(
            (value) =>
              aggregate(
                searchIndex.indexes.byFullForm,
                value,
                compact
              )
          );

          document.examIds.forEach(
            (examId) =>
              aggregate(
                searchIndex.indexes.byExamId,
                examId,
                compact
              )
          );

          document.jobIds.forEach(
            (jobId) =>
              aggregate(
                searchIndex.indexes.byJobId,
                jobId,
                compact
              )
          );

          document.qualificationIds.forEach(
            (qualificationId) =>
              aggregate(
                searchIndex.indexes.byQualificationId,
                qualificationId,
                compact
              )
          );

          document.locationIds.forEach(
            (locationId) =>
              aggregate(
                searchIndex.indexes.byLocationId,
                locationId,
                compact
              )
          );

          document.sourceIds.forEach(
            (sourceId) =>
              aggregate(
                searchIndex.indexes.bySourceId,
                sourceId,
                compact
              )
          );
        }
      );
    }
  );

  return searchIndex;
}

/* -------------------------------------------------------------------------- */
/* Runtime construction                                                       */
/* -------------------------------------------------------------------------- */

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

  const categories =
    registry.getAll(
      'CATEGORY'
    );

  const locations =
    registry.getAll(
      'LOCATION'
    );

  const glossary =
    registry.getAll(
      'GLOSSARY'
    );

  const governments =
    registry.getAll(
      'GOVERNMENT'
    );

  const states =
    registry.getAll(
      'STATE'
    );

  const indexes = {
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
      ),

    categories:
      buildGenericIndexes(
        categories,
        [],
        'CATEGORY'
      ),

    locations:
      buildGenericIndexes(
        locations,
        [
          'byStateId',
          'byDistrictId',
          'byType',
          'byStatus'
        ],
        'LOCATION'
      ),

    glossary:
      buildGenericIndexes(
        glossary,
        [
          'byCategory',
          'byStatus'
        ],
        'GLOSSARY'
      ),

    governments:
      buildGenericIndexes(
        governments,
        [
          'byType',
          'byStatus'
        ],
        'GOVERNMENT'
      ),

    states:
      buildGenericIndexes(
        states,
        [
          'byGovernmentId',
          'byStatus'
        ],
        'STATE'
      )
  };

  indexes.search =
    buildUnifiedSearchIndex({
      JOB:
        jobs,

      EXAM:
        exams,

      DEPARTMENT:
        departments,

      ORGANISATION:
        organisations,

      QUALIFICATION:
        qualifications,

      CATEGORY:
        categories,

      LOCATION:
        locations,

      GLOSSARY:
        glossary,

      GOVERNMENT:
        governments,

      STATE:
        states,

      SERVICE_CADRE:
        serviceCadres,

      SOURCE:
        sources
    });

  return indexes;
}

/* -------------------------------------------------------------------------- */
/* Index lookup helpers                                                       */
/* -------------------------------------------------------------------------- */

function getIdsFromIndex(
  indexMap,
  key
) {
  if (
    !indexMap
  ) {
    return [];
  }

  const normalized =
    normalizeKey(
      key
    );

  if (
    !normalized
  ) {
    return [];
  }

  if (
    indexMap instanceof Map
  ) {
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

  if (
    typeof indexMap ===
      'object'
  ) {
    const postings =
      indexMap[
        normalized
      ];

    if (
      !Array.isArray(
        postings
      )
    ) {
      return [];
    }

    return postings
      .map(
        (posting) =>
          typeof posting ===
            'object'
            ? posting.id
            : posting
      )
      .filter(Boolean);
  }

  return [];
}

function getPostingObjectsFromIndex(
  indexMap,
  key
) {
  if (
    !indexMap
  ) {
    return [];
  }

  const normalized =
    normalizeKey(
      key
    );

  if (
    !normalized
  ) {
    return [];
  }

  if (
    typeof indexMap !==
      'object'
  ) {
    return [];
  }

  if (
    indexMap instanceof Map
  ) {
    const values =
      indexMap.get(
        normalized
      );

    return values
      ? [
          ...values
        ].map(
          (id) => ({
            id
          })
        )
      : [];
  }

  const postings =
    indexMap[
      normalized
    ];

  return Array.isArray(
    postings
  )
    ? postings.map(
        (posting) =>
          typeof posting ===
            'object'
            ? {
                ...posting
              }
            : {
                id: posting
              }
      )
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
      (list) =>
        Array.isArray(list)
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
    let index = 1;
    index < usable.length;
    index += 1
  ) {
    const allowed =
      new Set(
        usable[index]
      );

    [
      ...membership
    ].forEach(
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
    !Array.isArray(
      lists
    )
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
        (id) => {
          if (
            id !== undefined &&
            id !== null &&
            id !== ''
          ) {
            result.add(
              id
            );
          }
        }
      );
    }
  );

  return [
    ...result
  ];
}

/* -------------------------------------------------------------------------- */
/* Runtime index store                                                        */
/* -------------------------------------------------------------------------- */

class RuntimeIndexStore {
  constructor() {
    this.indexes =
      null;

    this.createdAt =
      null;

    this.version =
      INDEX_VERSION;
  }

  build() {
    const nextIndexes =
      createRuntimeIndexes();

    this.indexes =
      nextIndexes;

    this.createdAt =
      new Date().toISOString();

    /*
     * `search.js` feature-detects a public `registry.indexes` container.
     * This container contains only derived references and never canonical
     * records, so the source-of-truth boundary remains intact.
     */
    registry.indexes = {
      SEARCH:
        this.indexes.search,

      search:
        this.indexes.search,

      SEARCH_INDEX:
        this.indexes.search,

      jobs:
        this.indexes.jobs,

      exams:
        this.indexes.exams,

      departments:
        this.indexes.departments,

      organisations:
        this.indexes.organisations,

      serviceCadres:
        this.indexes.serviceCadres,

      eligibilityRules:
        this.indexes.eligibilityRules,

      qualifications:
        this.indexes.qualifications,

      sources:
        this.indexes.sources
    };

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
        'recruitmentStatus',
        'byRecruitmentStatus'
      ],
      [
        'careerStatus',
        'byCareerStatus'
      ],
      [
        'educationLevel',
        'byEducationLevel'
      ],
      [
        'confidence',
        'byConfidence'
      ],
      [
        'currentness',
        'byCurrentness'
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
            : [
                value
              ];

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
    return intersectIdLists([
      this.getEligibilityRuleIdsBy(
        'byTargetType',
        targetType
      ),

      this.getEligibilityRuleIdsBy(
        'byTargetId',
        targetId
      )
    ]);
  }

  searchTokens(
    domain,
    tokens
  ) {
    if (
      !Array.isArray(
        tokens
      )
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

  getSearchIndex() {
    return (
      this.indexes?.search ||
      null
    );
  }

  getSearchPostings(
    token
  ) {
    return getPostingObjectsFromIndex(
      this.indexes
        ?.search
        ?.indexes
        ?.byToken,
      token
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

      version:
        this.version,

      domains:
        Object.keys(
          this.indexes
        ),

      searchDocuments:
        this.indexes
          .search
          ?.documents
          ?.length ||
        0
    };
  }
}

const runtimeIndexes =
  new RuntimeIndexStore();

function rebuildIndexes() {
  return runtimeIndexes.build();
}

/* -------------------------------------------------------------------------- */
/* Public exports                                                             */
/* -------------------------------------------------------------------------- */

export {
  INDEX_VERSION,
  SEARCHABLE_ENTITY_TYPES,

  normalizeKey,
  tokenize,

  addToIndex,
  addManyToIndex,
  addNestedIndex,

  buildJobIndexes,
  buildExamIndexes,
  buildServiceCadreIndexes,
  buildEligibilityRuleIndexes,
  buildQualificationIndexes,
  buildDepartmentIndexes,
  buildOrganisationIndexes,
  buildSourceIndexes,
  buildGenericIndexes,
  buildUnifiedSearchIndex,

  createRuntimeIndexes,

  getIdsFromIndex,
  getPostingObjectsFromIndex,
  intersectIdLists,
  unionIdLists,

  RuntimeIndexStore,
  runtimeIndexes,
  rebuildIndexes
};

export default runtimeIndexes;
