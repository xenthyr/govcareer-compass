/**
 * GovCareer Compass
 * Canonical Database Normalizer
 *
 * Purpose:
 * - normalize structurally equivalent values;
 * - preserve canonical information;
 * - provide safe defaults without inventing facts;
 * - create predictable runtime shapes.
 *
 * IMPORTANT:
 * Normalization does not determine eligibility.
 * Normalization does not create government facts.
 */

const UNKNOWN = 'UNKNOWN';

function isPlainObject(value) {
  if (
    value === null ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const prototype =
    Object.getPrototypeOf(
      value
    );

  return (
    prototype ===
      Object.prototype ||
    prototype === null
  );
}

function cleanString(
  value,
  fallback = ''
) {
  if (
    value === undefined ||
    value === null
  ) {
    return fallback;
  }

  const text =
    String(value)
      .replace(/\u00A0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  return text || fallback;
}

function cleanNullableString(
  value
) {
  const result =
    cleanString(
      value,
      ''
    );

  return result || null;
}

function cleanArray(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(
      (item) =>
        item !== undefined &&
        item !== null
    );
  }

  return [
    value
  ];
}

function uniqueArray(
  value
) {
  const items =
    cleanArray(value);

  const seen =
    new Set();

  const result = [];

  items.forEach((item) => {
    const key =
      typeof item === 'object'
        ? JSON.stringify(item)
        : String(item);

    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  });

  return result;
}

function cleanId(
  value,
  fallback = null
) {
  const id =
    cleanNullableString(
      value
    );

  return id || fallback;
}

function cleanLocalizedText(
  value
) {
  if (
    typeof value === 'string'
  ) {
    return {
      en: cleanString(
        value
      )
    };
  }

  if (!isPlainObject(value)) {
    return {
      en: ''
    };
  }

  const normalized = {};

  Object.entries(
    value
  ).forEach(
    ([language, text]) => {
      const cleaned =
        cleanString(
          text,
          ''
        );

      if (cleaned) {
        normalized[
          language
        ] = cleaned;
      }
    }
  );

  if (!normalized.en) {
    const first =
      Object.values(
        normalized
      )[0];

    normalized.en =
      first || '';
  }

  return normalized;
}

function normalizeDate(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  const text =
    cleanString(
      value,
      ''
    );

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      text
    )
  ) {
    const date =
      new Date(
        `${text}T00:00:00Z`
      );

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return text;
    }
  }

  const date =
    new Date(text);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date
    .toISOString()
    .slice(
      0,
      10
    );
}

function normalizeNumber(
  value,
  {
    integer = false,
    min = null,
    max = null
  } = {}
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return null;
  }

  const number =
    Number(value);

  if (
    !Number.isFinite(
      number
    )
  ) {
    return null;
  }

  let result =
    integer
      ? Math.trunc(number)
      : number;

  if (
    min !== null &&
    result < min
  ) {
    result = min;
  }

  if (
    max !== null &&
    result > max
  ) {
    result = max;
  }

  return result;
}

function normalizeBoolean(
  value,
  fallback = false
) {
  if (
    typeof value ===
    'boolean'
  ) {
    return value;
  }

  if (
    value === 'true' ||
    value === 'TRUE' ||
    value === 1 ||
    value === '1'
  ) {
    return true;
  }

  if (
    value === 'false' ||
    value === 'FALSE' ||
    value === 0 ||
    value === '0'
  ) {
    return false;
  }

  return fallback;
}

function normalizeEnum(
  value,
  allowedValues,
  fallback = UNKNOWN
) {
  const normalized =
    cleanString(
      value,
      ''
    );

  if (
    allowedValues.includes(
      normalized
    )
  ) {
    return normalized;
  }

  return fallback;
}

function normalizeIdArray(
  value
) {
  return uniqueArray(
    cleanArray(value)
      .map((item) =>
        cleanId(
          item
        )
      )
      .filter(Boolean)
  );
}

function normalizeSourceReference(
  source
) {
  if (
    typeof source ===
    'string'
  ) {
    return {
      sourceId:
        cleanId(source)
    };
  }

  if (
    !isPlainObject(source)
  ) {
    return null;
  }

  return {
    sourceId:
      cleanId(
        source.sourceId ??
        source.id
      ),
    note:
      cleanNullableString(
        source.note
      ),
    claim:
      cleanNullableString(
        source.claim
      )
  };
}

function normalizeSources(
  sources
) {
  return uniqueArray(
    cleanArray(
      sources
    )
      .map(
        normalizeSourceReference
      )
      .filter(
        (item) =>
          item?.sourceId
      )
  );
}

function normalizeRequirement(
  requirement
) {
  if (
    typeof requirement ===
    'string'
  ) {
    return {
      id: null,
      type: 'UNSPECIFIED',
      value: requirement,
      hard: true
    };
  }

  if (
    !isPlainObject(
      requirement
    )
  ) {
    return null;
  }

  return {
    id:
      cleanId(
        requirement.id
      ),
    type:
      cleanString(
        requirement.type,
        'UNSPECIFIED'
      ),
    value:
      requirement.value ??
      null,
    hard:
      normalizeBoolean(
        requirement.hard,
        true
      ),
    sourceIds:
      normalizeIdArray(
        requirement.sourceIds
      )
  };
}

function normalizeRequirements(
  requirements
) {
  return cleanArray(
    requirements
  )
    .map(
      normalizeRequirement
    )
    .filter(Boolean);
}

function normalizeRecord(
  record,
  {
    entityType = 'UNKNOWN'
  } = {}
) {
  if (
    !isPlainObject(record)
  ) {
    return null;
  }

  const normalized = {
    ...record
  };

  normalized.id =
    cleanId(
      record.id
    );

  normalized.entityType =
    cleanString(
      record.entityType,
      entityType
    );

  if (
    record.name !== undefined
  ) {
    normalized.name =
      normalizeLocalizedText(
        record.name
      );
  }

  if (
    record.title !== undefined
  ) {
    normalized.title =
      normalizeLocalizedText(
        record.title
      );
  }

  if (
    record.fullForm !== undefined
  ) {
    normalized.fullForm =
      cleanNullableString(
        record.fullForm
      );
  }

  normalized.aliases =
    uniqueArray(
      cleanArray(
        record.aliases
      ).map(
        (item) =>
          cleanString(
            item,
            ''
          )
      ).filter(Boolean)
    );

  normalized.keywords =
    uniqueArray(
      cleanArray(
        record.keywords
      ).map(
        (item) =>
          cleanString(
            item,
            ''
          )
      ).filter(Boolean)
    );

  normalized.governmentId =
    cleanId(
      record.governmentId
    );

  normalized.stateId =
    cleanId(
      record.stateId
    );

  normalized.departmentId =
    cleanId(
      record.departmentId
    );

  normalized.organisationId =
    cleanId(
      record.organisationId
    );

  normalized.serviceCadreId =
    cleanId(
      record.serviceCadreId
    );

  normalized.examIds =
    normalizeIdArray(
      record.examIds ??
      record.examId
    );

  normalized.jobIds =
    normalizeIdArray(
      record.jobIds ??
      record.jobId
    );

  normalized.departmentIds =
    normalizeIdArray(
      record.departmentIds
    );

  normalized.organisationIds =
    normalizeIdArray(
      record.organisationIds
    );

  normalized.sourceIds =
    normalizeIdArray(
      record.sourceIds
    );

  normalized.sources =
    normalizeSources(
      record.sources
    );

  normalized.requirements =
    normalizeRequirements(
      record.requirements
    );

  if (
    record.createdAt !==
    undefined
  ) {
    normalized.createdAt =
      normalizeDate(
        record.createdAt
      );
  }

  if (
    record.updatedAt !==
    undefined
  ) {
    normalized.updatedAt =
      normalizeDate(
        record.updatedAt
      );
  }

  if (
    record.publicationDate !==
    undefined
  ) {
    normalized.publicationDate =
      normalizeDate(
        record.publicationDate
      );
  }

  if (
    record.effectiveDate !==
    undefined
  ) {
    normalized.effectiveDate =
      normalizeDate(
        record.effectiveDate
      );
  }

  return normalized;
}

function normalizeLocalizedText(
  value
) {
  return cleanLocalizedText(
    value
  );
}

function normalizeCollection(
  data,
  entityType
) {
  if (
    Array.isArray(data)
  ) {
    return data
      .map((record) =>
        normalizeRecord(
          record,
          {
            entityType
          }
        )
      )
      .filter(Boolean);
  }

  if (
    isPlainObject(data)
  ) {
    /*
     * Support either:
     *
     * { records: [...] }
     *
     * or:
     *
     * { data: [...] }
     *
     * or:
     * { jobs: [...] }
     */
    const possibleArrays = [
      data.records,
      data.data,
      data.jobs,
      data.exams,
      data.departments,
      data.organisations,
      data.sources,
      data.items
    ];

    const firstArray =
      possibleArrays.find(
        Array.isArray
      );

    if (firstArray) {
      return normalizeCollection(
        firstArray,
        entityType
      );
    }
  }

  return [];
}

function buildSearchText(
  record,
  additionalValues = []
) {
  const values = [
    record.name,
    record.title,
    record.fullForm,
    record.post,
    record.postName,
    record.officialName,
    record.shortName,
    record.description,
    record.departmentName,
    record.organisationName,
    record.examName,
    record.serviceName,
    record.category,
    record.keywords,
    record.aliases,
    additionalValues
  ];

  const flattened =
    values
      .flat(Infinity)
      .filter(
        (value) =>
          value !== undefined &&
          value !== null
      );

  return flattened
    .map((value) => {
      if (
        typeof value ===
        'object'
      ) {
        return Object.values(
          value
        ).join(' ');
      }

      return String(
        value
      );
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeJob(
  job
) {
  const result =
    normalizeRecord(
      job,
      {
        entityType: 'JOB'
      }
    );

  if (!result) {
    return null;
  }

  result.jobId =
    result.id;

  result.eligibilityStatus =
    normalizeEnum(
      result.eligibilityStatus ??
        result.baEligibility,
      [
        'DIRECT',
        'CONDITIONAL',
        'NOT_ELIGIBLE',
        'MANUAL_VERIFICATION'
      ],
      UNKNOWN
    );

  result.status =
    normalizeEnum(
      result.status,
      [
        'ACTIVE',
        'CURRENT_NO_RECRUITMENT',
        'HISTORICAL',
        'RENAMED',
        'MERGED',
        'REPLACED',
        'ABOLISHED',
        'TEMPORARY',
        'UNKNOWN'
      ],
      UNKNOWN
    );

  result.employmentStatus =
    normalizeEnum(
      result.employmentStatus,
      [
        'REGULAR',
        'TEMPORARY',
        'CONTRACTUAL',
        'OUTSOURCED',
        'SCHEME_PROJECT',
        'AD_HOC',
        'UNKNOWN'
      ],
      UNKNOWN
    );

  result.startingBasic =
    normalizeNumber(
      result.startingBasic
    );

  result.maximumBasic =
    normalizeNumber(
      result.maximumBasic
    );

  result.workLife =
    normalizeNumber(
      result.workLife,
      {
        min: 0,
        max: 10
      }
    );

  result.stress =
    normalizeNumber(
      result.stress,
      {
        min: 0,
        max: 10
      }
    );

  result.physicalRisk =
    normalizeNumber(
      result.physicalRisk ??
        result.risk,
      {
        min: 0,
        max: 10
      }
    );

  result.authority =
    normalizeNumber(
      result.authority,
      {
        min: 0,
        max: 10
      }
    );

  result.familyCompatibility =
    normalizeNumber(
      result.familyCompatibility,
      {
        min: 0,
        max: 10
      }
    );

  result.parentCareCompatibility =
    normalizeNumber(
      result.parentCareCompatibility,
      {
        min: 0,
        max: 10
      }
    );

  result.kolkataStability =
    normalizeNumber(
      result.kolkataStability,
      {
        min: 0,
        max: 10
      }
    );

  result.transferBurden =
    normalizeNumber(
      result.transferBurden,
      {
        min: 0,
        max: 10
      }
    );

  result.searchText =
    buildSearchText(
      result
    );

  return result;
}

function normalizeExam(
  exam
) {
  const result =
    normalizeRecord(
      exam,
      {
        entityType: 'EXAM'
      }
    );

  if (!result) {
    return null;
  }

  result.examId =
    result.id;

  result.status =
    normalizeEnum(
      result.status,
      [
        'OPEN',
        'CLOSED',
        'UNDER_PROCESS',
        'RECENTLY_COMPLETED',
        'EXPECTED_PERIODIC',
        'IRREGULAR',
        'HISTORICAL',
        'DISCONTINUED',
        'UNKNOWN'
      ],
      UNKNOWN
    );

  result.difficulty =
    normalizeEnum(
      result.difficulty,
      [
        'EASY',
        'MODERATE',
        'HARD',
        'VERY_HARD',
        'EXTREME',
        'UNKNOWN'
      ],
      UNKNOWN
    );

  result.year =
    normalizeNumber(
      result.year,
      {
        integer: true
      }
    );

  result.postIds =
    normalizeIdArray(
      result.postIds ??
        result.jobIds
    );

  result.searchText =
    buildSearchText(
      result
    );

  return result;
}

function normalizeDepartment(
  department
) {
  const result =
    normalizeRecord(
      department,
      {
        entityType: 'DEPARTMENT'
      }
    );

  if (!result) {
    return null;
  }

  result.departmentId =
    result.id;

  result.status =
    normalizeEnum(
      result.status,
      [
        'ACTIVE',
        'HISTORICAL',
        'RENAMED',
        'MERGED',
        'REORGANISED',
        'ABOLISHED',
        'UNKNOWN'
      ],
      UNKNOWN
    );

  result.searchText =
    buildSearchText(
      result
    );

  return result;
}

function normalizeOrganisation(
  organisation
) {
  const result =
    normalizeRecord(
      organisation,
      {
        entityType:
          'ORGANISATION'
      }
    );

  if (!result) {
    return null;
  }

  result.organisationId =
    result.id;

  result.type =
    cleanString(
      result.type,
      UNKNOWN
    );

  result.searchText =
    buildSearchText(
      result
    );

  return result;
}

function normalizeSource(
  source
) {
  const result =
    normalizeRecord(
      source,
      {
        entityType: 'SOURCE'
      }
    );

  if (!result) {
    return null;
  }

  result.sourceId =
    result.id;

  result.confidence =
    normalizeEnum(
      result.confidence,
      [
        'HIGH',
        'MEDIUM_HIGH',
        'MEDIUM',
        'LOW',
        'ESTIMATE',
        'NOT_VERIFIED'
      ],
      UNKNOWN
    );

  result.sourceTypeId =
    cleanId(
      result.sourceTypeId
    );

  result.status =
    cleanString(
      result.status,
      UNKNOWN
    );

  result.searchText =
    buildSearchText(
      result
    );

  return result;
}

function normalizeGovernment(
  government
) {
  const result =
    normalizeRecord(
      government,
      {
        entityType:
          'GOVERNMENT'
      }
    );

  return result;
}

function normalizeState(
  state
) {
  const result =
    normalizeRecord(
      state,
      {
        entityType: 'STATE'
      }
    );

  return result;
}

function normalizeGeneric(
  record,
  entityType
) {
  return normalizeRecord(
    record,
    {
      entityType
    }
  );
}

function normalizeByType(
  data,
  entityType
) {
  const normalizedType =
    String(
      entityType || 'UNKNOWN'
    ).toUpperCase();

  const collection =
    normalizeCollection(
      data,
      normalizedType
    );

  return collection.map(
    (record) => {
      switch (
        normalizedType
      ) {
        case 'JOB':
          return normalizeJob(
            record
          );

        case 'EXAM':
          return normalizeExam(
            record
          );

        case 'DEPARTMENT':
          return normalizeDepartment(
            record
          );

        case 'ORGANISATION':
          return normalizeOrganisation(
            record
          );

        case 'SOURCE':
          return normalizeSource(
            record
          );

        case 'GOVERNMENT':
          return normalizeGovernment(
            record
          );

        case 'STATE':
          return normalizeState(
            record
          );

        default:
          return normalizeGeneric(
            record,
            normalizedType
          );
      }
    }
  ).filter(Boolean);
}

export {
  isPlainObject,
  cleanString,
  cleanNullableString,
  cleanArray,
  uniqueArray,
  cleanId,
  normalizeLocalizedText,
  normalizeDate,
  normalizeNumber,
  normalizeBoolean,
  normalizeEnum,
  normalizeIdArray,
  normalizeSources,
  normalizeRequirements,
  normalizeRecord,
  normalizeCollection,
  normalizeJob,
  normalizeExam,
  normalizeDepartment,
  normalizeOrganisation,
  normalizeSource,
  normalizeGovernment,
  normalizeState,
  normalizeGeneric,
  normalizeByType,
  buildSearchText
};

export default {
  normalizeByType,
  normalizeJob,
  normalizeExam,
  normalizeDepartment,
  normalizeOrganisation,
  normalizeSource,
  normalizeGovernment,
  normalizeState,
  normalizeGeneric
};
