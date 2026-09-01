/**
 * GovCareer Compass
 * ============================================================
 * Runtime Database Registry
 * ============================================================
 *
 * The registry is the application's normalized runtime data store.
 *
 * Canonical JSON remains the source of truth.
 *
 * Pipeline:
 *
 * canonical JSON
 *      ↓
 * loader
 *      ↓
 * normalizer
 *      ↓
 * validator
 *      ↓
 * registry
 *      ↓
 * indexes / application logic
 *
 * IMPORTANT
 * ----------
 * The registry does not determine legal eligibility and does not
 * perform recommendation scoring.
 */

import {
  cleanId
} from './normalizer.js';

function cloneRecord(record) {
  if (
    record === undefined ||
    record === null
  ) {
    return record;
  }

  if (
    typeof structuredClone ===
    'function'
  ) {
    try {
      return structuredClone(record);
    } catch {
      // Fall through to JSON cloning.
    }
  }

  try {
    return JSON.parse(
      JSON.stringify(record)
    );
  } catch {
    return record;
  }
}

function normalizeEntityType(entityType) {
  return String(
    entityType || ''
  )
    .trim()
    .toUpperCase();
}

function createMap(records) {
  const map = new Map();

  if (!Array.isArray(records)) {
    return map;
  }

  records.forEach((record) => {
    const id = cleanId(
      record?.id
    );

    if (id) {
      map.set(
        id,
        record
      );
    }
  });

  return map;
}

class DatabaseRegistry {
  constructor() {
    this.collections = new Map();

    this.meta = {
      loadedAt: null,
      version: null,
      validated: false,
      warnings: [],
      errors: []
    };
  }

  register(entityType, records) {
    const type =
      normalizeEntityType(
        entityType
      );

    if (!type) {
      throw new Error(
        'Registry entity type cannot be empty.'
      );
    }

    const map =
      createMap(records);

    this.collections.set(
      type,
      map
    );

    return map.size;
  }

  registerMany(collections = {}) {
    Object.entries(
      collections
    ).forEach(
      ([entityType, records]) => {
        this.register(
          entityType,
          records
        );
      }
    );

    return this;
  }

  unregister(entityType) {
    return this.collections.delete(
      normalizeEntityType(
        entityType
      )
    );
  }

  clear() {
    this.collections.clear();

    this.meta = {
      loadedAt: null,
      version: null,
      validated: false,
      warnings: [],
      errors: []
    };
  }

  hasCollection(entityType) {
    return this.collections.has(
      normalizeEntityType(
        entityType
      )
    );
  }

  getCollection(entityType) {
    return (
      this.collections.get(
        normalizeEntityType(
          entityType
        )
      ) ||
      new Map()
    );
  }

  has(entityType, id) {
    const normalizedId =
      cleanId(id);

    if (!normalizedId) {
      return false;
    }

    return this.getCollection(
      entityType
    ).has(
      normalizedId
    );
  }

  get(entityType, id) {
    const normalizedId =
      cleanId(id);

    if (!normalizedId) {
      return null;
    }

    const record =
      this.getCollection(
        entityType
      ).get(
        normalizedId
      );

    return record
      ? cloneRecord(record)
      : null;
  }

  getAll(entityType) {
    return [
      ...this.getCollection(
        entityType
      ).values()
    ].map(
      cloneRecord
    );
  }

  count(entityType) {
    return this.getCollection(
      entityType
    ).size;
  }

  getCounts() {
    const result = {};

    this.collections.forEach(
      (map, entityType) => {
        result[entityType] =
          map.size;
      }
    );

    return result;
  }

  find(entityType, predicate) {
    if (
      typeof predicate !==
      'function'
    ) {
      return [];
    }

    return this.getAll(
      entityType
    ).filter(
      predicate
    );
  }

  first(entityType, predicate) {
    if (
      typeof predicate !==
      'function'
    ) {
      return null;
    }

    const collection =
      this.getCollection(
        entityType
      );

    for (
      const record of
        collection.values()
    ) {
      if (
        predicate(record)
      ) {
        return cloneRecord(
          record
        );
      }
    }

    return null;
  }

  /**
   * ----------------------------------------------------------
   * JOB RELATIONSHIPS
   * ----------------------------------------------------------
   */

  getJobsByExam(examId) {
    const id =
      cleanId(examId);

    if (!id) {
      return [];
    }

    return this.find(
      'JOB',
      (job) =>
        Array.isArray(
          job.examIds
        ) &&
        job.examIds.includes(id)
    );
  }

  getJobsByDepartment(
    departmentId
  ) {
    const id =
      cleanId(departmentId);

    if (!id) {
      return [];
    }

    return this.find(
      'JOB',
      (job) =>
        job.departmentId ===
        id
    );
  }

  getJobsByOrganisation(
    organisationId
  ) {
    const id =
      cleanId(organisationId);

    if (!id) {
      return [];
    }

    return this.find(
      'JOB',
      (job) =>
        job.organisationId ===
        id
    );
  }

  getJobsByServiceCadre(
    serviceCadreId
  ) {
    const id =
      cleanId(serviceCadreId);

    if (!id) {
      return [];
    }

    return this.find(
      'JOB',
      (job) =>
        job.serviceCadreId ===
        id
    );
  }

  getJobsByEligibilityRule(
    ruleId
  ) {
    const id =
      cleanId(ruleId);

    if (!id) {
      return [];
    }

    return this.find(
      'JOB',
      (job) =>
        Array.isArray(
          job.eligibilityRuleIds
        ) &&
        job.eligibilityRuleIds.includes(
          id
        )
    );
  }

  /**
   * ----------------------------------------------------------
   * EXAM RELATIONSHIPS
   * ----------------------------------------------------------
   */

  getExamsByJob(jobId) {
    const id =
      cleanId(jobId);

    if (!id) {
      return [];
    }

    return this.find(
      'EXAM',
      (exam) =>
        Array.isArray(
          exam.postIds
        ) &&
        exam.postIds.includes(id)
    );
  }

  getExamsByServiceCadre(
    serviceCadreId
  ) {
    const id =
      cleanId(serviceCadreId);

    if (!id) {
      return [];
    }

    return this.find(
      'EXAM',
      (exam) =>
        exam.serviceCadreId ===
        id ||
        (
          Array.isArray(
            exam.serviceCadreIds
          ) &&
          exam.serviceCadreIds.includes(
            id
          )
        )
    );
  }

  /**
   * ----------------------------------------------------------
   * SERVICE / CADRE RELATIONSHIPS
   * ----------------------------------------------------------
   */

  getServiceCadre(
    serviceCadreId
  ) {
    return this.get(
      'SERVICE_CADRE',
      serviceCadreId
    );
  }

  getServiceCadresByDepartment(
    departmentId
  ) {
    const id =
      cleanId(departmentId);

    if (!id) {
      return [];
    }

    return this.find(
      'SERVICE_CADRE',
      (serviceCadre) =>
        serviceCadre.departmentId ===
        id
    );
  }

  getServiceCadresByOrganisation(
    organisationId
  ) {
    const id =
      cleanId(organisationId);

    if (!id) {
      return [];
    }

    return this.find(
      'SERVICE_CADRE',
      (serviceCadre) =>
        serviceCadre.organisationId ===
        id
    );
  }

  getJobsAndServiceCadre(
    serviceCadreId
  ) {
    const serviceCadre =
      this.getServiceCadre(
        serviceCadreId
      );

    if (!serviceCadre) {
      return {
        serviceCadre: null,
        jobs: []
      };
    }

    return {
      serviceCadre,
      jobs:
        this.getJobsByServiceCadre(
          serviceCadreId
        )
    };
  }

  /**
   * ----------------------------------------------------------
   * ELIGIBILITY RELATIONSHIPS
   * ----------------------------------------------------------
   */

  getEligibilityRule(
    ruleId
  ) {
    return this.get(
      'ELIGIBILITY_RULE',
      ruleId
    );
  }

  getEligibilityRulesByTarget(
    targetType,
    targetId
  ) {
    const normalizedType =
      String(
        targetType || ''
      )
        .trim()
        .toUpperCase();

    const id =
      cleanId(targetId);

    if (
      !normalizedType ||
      !id
    ) {
      return [];
    }

    return this.find(
      'ELIGIBILITY_RULE',
      (rule) =>
        String(
          rule.targetType ||
          ''
        )
          .toUpperCase() ===
          normalizedType &&
        rule.targetId === id
    );
  }

  getEligibilityRulesByJob(
    jobId
  ) {
    return this.getEligibilityRulesByTarget(
      'JOB',
      jobId
    );
  }

  getEligibilityRulesByExam(
    examId
  ) {
    return this.getEligibilityRulesByTarget(
      'EXAM',
      examId
    );
  }

  getEligibilityRulesByServiceCadre(
    serviceCadreId
  ) {
    return this.getEligibilityRulesByTarget(
      'SERVICE_CADRE',
      serviceCadreId
    );
  }

  getEligibilityRulesByQualification(
    qualificationId
  ) {
    const id =
      cleanId(
        qualificationId
      );

    if (!id) {
      return [];
    }

    return this.find(
      'ELIGIBILITY_RULE',
      (rule) =>
        (
          Array.isArray(
            rule.qualificationIds
          ) &&
          rule.qualificationIds.includes(
            id
          )
        ) ||
        (
          Array.isArray(
            rule.requiredQualificationIds
          ) &&
          rule.requiredQualificationIds.includes(
            id
          )
        )
    );
  }

  /**
   * ----------------------------------------------------------
   * QUALIFICATION RELATIONSHIPS
   * ----------------------------------------------------------
   */

  getQualification(
    qualificationId
  ) {
    return this.get(
      'QUALIFICATION',
      qualificationId
    );
  }

  getQualificationsByIds(
    qualificationIds
  ) {
    if (
      !Array.isArray(
        qualificationIds
      )
    ) {
      return [];
    }

    return qualificationIds
      .map(
        (id) =>
          this.get(
            'QUALIFICATION',
            id
          )
      )
      .filter(Boolean);
  }

  /**
   * ----------------------------------------------------------
   * SOURCE RELATIONSHIPS
   * ----------------------------------------------------------
   */

  getSourcesByIds(sourceIds) {
    if (
      !Array.isArray(
        sourceIds
      )
    ) {
      return [];
    }

    return sourceIds
      .map(
        (id) =>
          this.get(
            'SOURCE',
            id
          )
      )
      .filter(Boolean);
  }

  /**
   * ----------------------------------------------------------
   * METADATA
   * ----------------------------------------------------------
   */

  setMeta(meta = {}) {
    this.meta = {
      ...this.meta,
      ...meta,

      warnings: Array.isArray(
        meta.warnings
      )
        ? [
            ...meta.warnings
          ]
        : this.meta.warnings,

      errors: Array.isArray(
        meta.errors
      )
        ? [
            ...meta.errors
          ]
        : this.meta.errors
    };

    return this;
  }

  getMeta() {
    return {
      ...this.meta,
      warnings: [
        ...this.meta
          .warnings
      ],
      errors: [
        ...this.meta
          .errors
      ]
    };
  }

  getSnapshot() {
    const snapshot = {};

    this.collections.forEach(
      (map, entityType) => {
        snapshot[
          entityType
        ] = [
          ...map.values()
        ].map(
          cloneRecord
        );
      }
    );

    return snapshot;
  }
}

const registry =
  new DatabaseRegistry();

export {
  DatabaseRegistry,
  registry
};

export default registry;
