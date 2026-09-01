/**
 * GovCareer Compass
 * ============================================================
 * Canonical Data Registry
 * ============================================================
 *
 * The registry describes the entity/data universe.
 *
 * It does NOT contain the actual government records.
 */

import config from '../config.js';

const ENTITY_TYPES =
  Object.freeze([
    'governments',
    'states',
    'qualifications',
    'categories',
    'locations',
    'statuses',
    'confidenceLevels',
    'sourceTypes',
    'glossary',

    'exams',
    'jobs',
    'departments',
    'organisations',
    'recruitment',
    'pay',
    'housing',
    'promotion',
    'benefits',
    'sources',
    'serviceCadres',
    'eligibilityRules',

    'assessmentQuestions',
    'assessmentOptions',
    'assessmentBranching',
    'assessmentProfileFields',
    'assessmentResponseScoring'
  ]);

const DATASETS =
  Object.freeze({
    common:
      Object.freeze({
        scope:
          'common',

        paths:
          config.data.common
      }),

    assessment:
      Object.freeze({
        scope:
          'assessment',

        paths:
          config.data.assessment
      }),

    central:
      Object.freeze({
        scope:
          'central',

        paths:
          config.data.governments.CENTRAL.paths
      }),

    'IN-WB':
      Object.freeze({
        scope:
          'state',

        stateId:
          'IN-WB',

        paths:
          config.data.governments[
            'IN-WB'
          ].paths
      })
  });

function getDataset(
  datasetId
) {
  return (
    DATASETS[
      datasetId
    ] ||
    null
  );
}

function getDatasetPath(
  datasetId,
  entity
) {
  const dataset =
    getDataset(
      datasetId
    );

  if (
    !dataset ||
    !dataset.paths
  ) {
    return null;
  }

  return (
    dataset.paths[
      entity
    ] ||
    null
  );
}

function getDatasetIds() {
  return Object.keys(
    DATASETS
  );
}

function getEntityTypes() {
  return [
    ...ENTITY_TYPES
  ];
}

function hasEntity(
  datasetId,
  entity
) {
  return Boolean(
    getDatasetPath(
      datasetId,
      entity
    )
  );
}

function getRegistrySnapshot() {
  return {
    datasets:
      Object.fromEntries(
        Object.entries(
          DATASETS
        ).map(
          (
            [
              id,
              dataset
            ]
          ) => [
            id,
            {
              ...dataset,
              paths:
                {
                  ...dataset.paths
                }
            }
          ]
        )
      ),

    entityTypes:
      getEntityTypes()
  };
}

export {
  ENTITY_TYPES,
  DATASETS,

  getDataset,
  getDatasetPath,
  getDatasetIds,
  getEntityTypes,
  hasEntity,
  getRegistrySnapshot
};

export default {
  DATASETS,
  getDataset,
  getDatasetPath
};
