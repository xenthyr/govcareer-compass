/**
 * GovCareer Compass
 * Runtime Database Registry
 *
 * The registry owns normalized records after they have passed
 * through loading and validation.
 *
 * It provides:
 * - CRUD-like runtime lookup;
 * - cross-entity lookup;
 * - snapshot access;
 * - immutable-return semantics.
 */

import {
  cleanId
} from './normalizer.js';

function createMap(
  records
) {
  const map =
    new Map();

  if (!Array.isArray(records)) {
    return map;
  }

  records.forEach(
    (record) => {
      const id =
        cleanId(
          record?.id
        );

      if (id) {
        map.set(
          id,
          record
        );
      }
    }
  );

  return map;
}

function cloneRecord(
  record
) {
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
      return structuredClone(
        record
      );
    } catch {
      // Fall through.
    }
  }

  try {
    return JSON.parse(
      JSON.stringify(
        record
      )
    );
  } catch {
    return record;
  }
}

class DatabaseRegistry {
  constructor() {
    this.collections =
      new Map();

    this.meta = {
      loadedAt: null,
      version: null,
      validated: false,
      warnings: [],
      errors: []
    };
  }

  register(
    entityType,
    records
  ) {
    const type =
      String(
        entityType
      ).toUpperCase();

    const map =
      createMap(
        records
      );

    this.collections.set(
      type,
      map
    );

    return map.size;
  }

  registerMany(
    collections
  ) {
    Object.entries(
      collections || {}
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

  unregister(
    entityType
  ) {
    return this.collections.delete(
      String(
        entityType
      ).toUpperCase()
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

  hasCollection(
    entityType
  ) {
    return this.collections.has(
      String(
        entityType
      ).toUpperCase()
    );
  }

  getCollection(
    entityType
  ) {
    return (
      this.collections.get(
        String(
          entityType
        ).toUpperCase()
      ) || new Map()
    );
  }

  get(
    entityType,
    id
  ) {
    const normalizedId =
      cleanId(
        id
      );

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
      ? cloneRecord(
          record
        )
      : null;
  }

  has(
    entityType,
    id
  ) {
    const normalizedId =
      cleanId(
        id
      );

    return (
      normalizedId !== null &&
      this.getCollection(
        entityType
      ).has(
        normalizedId
      )
    );
  }

  getAll(
    entityType
  ) {
    return [
      ...this.getCollection(
        entityType
      ).values()
    ].map(
      cloneRecord
    );
  }

  count(
    entityType
  ) {
    return this.getCollection(
      entityType
    ).size;
  }

  find(
    entityType,
    predicate
  ) {
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

  first(
    entityType,
    predicate
  ) {
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

  getJobsByExam(
    examId
  ) {
    const id =
      cleanId(
        examId
      );

    if (!id) {
      return [];
    }

    return this.find(
      'JOB',
      (job) =>
        Array.isArray(
          job.examIds
        ) &&
        job.examIds.includes(
          id
        )
    );
  }

  getJobsByDepartment(
    departmentId
  ) {
    const id =
      cleanId(
        departmentId
      );

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
      cleanId(
        organisationId
      );

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

  getExamsByJob(
    jobId
  ) {
    const id =
      cleanId(
        jobId
      );

    if (!id) {
      return [];
    }

    const job =
      this.get(
        'JOB',
        id
      );

    if (!job) {
      return [];
    }

    return this.getAll(
      'EXAM'
    ).filter(
      (exam) =>
        Array.isArray(
          exam.postIds
        ) &&
        exam.postIds.includes(
          id
        )
    );
  }

  getSourcesByIds(
    sourceIds
  ) {
    const ids =
      Array.isArray(
        sourceIds
      )
        ? sourceIds
        : [];

    return ids
      .map(
        (id) =>
          this.get(
            'SOURCE',
            id
          )
      )
      .filter(Boolean);
  }

  setMeta(
    meta
  ) {
    this.meta = {
      ...this.meta,
      ...(meta || {})
    };

    return this;
  }

  getMeta() {
    return {
      ...this.meta,
      warnings: [
        ...(
          this.meta
            .warnings || []
        )
      ],
      errors: [
        ...(
          this.meta
            .errors || []
        )
      ]
    };
  }

  getSnapshot() {
    const snapshot = {};

    this.collections.forEach(
      (map, type) => {
        snapshot[
          type
        ] = [
          ...map.values()
        ].map(
          cloneRecord
        );
      }
    );

    return snapshot;
  }

  getCounts() {
    const counts = {};

    this.collections.forEach(
      (map, type) => {
        counts[type] =
          map.size;
      }
    );

    return counts;
  }
}

const registry =
  new DatabaseRegistry();

export {
  DatabaseRegistry,
  registry
};

export default registry;
