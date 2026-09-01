/**
 * GovCareer Compass
 * ============================================================
 * Application Configuration
 * ============================================================
 *
 * IMPORTANT:
 *
 * This file may contain PUBLIC configuration only.
 *
 * NEVER place:
 *   - OpenRouter API keys
 *   - authentication secrets
 *   - private tokens
 *   - database passwords
 *   - server credentials
 *
 * in this file.
 *
 * AI secrets belong in the server-side Vercel environment.
 */

const APP_VERSION = '0.1.0';

const RESEARCH_BASELINE =
  '31 August 2026';

const DEFAULT_LANGUAGE =
  'en';

const SUPPORTED_LANGUAGES =
  Object.freeze([
    'en',
    'bn'
  ]);

const DEFAULT_THEME =
  'system';

const SUPPORTED_THEMES =
  Object.freeze([
    'system',
    'light',
    'dark'
  ]);

const DEFAULT_STATE =
  'IN-WB';

const DEFAULT_GOVERNMENT =
  'CENTRAL';

const MAX_COMPARISON_ITEMS =
  5;

const DEFAULT_SEARCH_LIMIT =
  20;

const DEFAULT_PAGE_SIZE =
  20;

/* ============================================================
 * DATA ROOT
 * ============================================================
 */

const DATA_ROOT =
  './data';

/* ============================================================
 * COMMON DATA
 * ============================================================
 */

const COMMON_DATA_PATHS =
  Object.freeze({
    qualifications:
      `${DATA_ROOT}/common/qualifications.json`,

    categories:
      `${DATA_ROOT}/common/categories.json`,

    glossary:
      `${DATA_ROOT}/common/glossary.json`,

    scoringRules:
      `${DATA_ROOT}/common/scoring-rules.json`,

    governments:
      `${DATA_ROOT}/common/governments.json`,

    states:
      `${DATA_ROOT}/common/states.json`,

    locations:
      `${DATA_ROOT}/common/locations.json`,

    statuses:
      `${DATA_ROOT}/common/statuses.json`,

    confidenceLevels:
      `${DATA_ROOT}/common/confidence-levels.json`,

    sourceTypes:
      `${DATA_ROOT}/common/source-types.json`
  });

/* ============================================================
 * ASSESSMENT DATA
 * ============================================================
 */

const ASSESSMENT_DATA_PATHS =
  Object.freeze({
    questions:
      `${DATA_ROOT}/assessment/questions.json`,

    options:
      `${DATA_ROOT}/assessment/options.json`,

    branching:
      `${DATA_ROOT}/assessment/branching.json`,

    profileFields:
      `${DATA_ROOT}/assessment/profile-fields.json`,

    responseScoring:
      `${DATA_ROOT}/assessment/response-scoring.json`
  });

/* ============================================================
 * INTERNATIONALIZATION
 * ============================================================
 */

const I18N_DATA_PATHS =
  Object.freeze({
    en:
      `${DATA_ROOT}/i18n/en.json`,

    bn:
      `${DATA_ROOT}/i18n/bn.json`
  });

/* ============================================================
 * CENTRAL GOVERNMENT DATA
 * ============================================================
 */

const CENTRAL_DATA_PATHS =
  Object.freeze({
    exams:
      `${DATA_ROOT}/central/exams.json`,

    jobs:
      `${DATA_ROOT}/central/jobs.json`,

    departments:
      `${DATA_ROOT}/central/departments.json`,

    organisations:
      `${DATA_ROOT}/central/organisations.json`,

    recruitment:
      `${DATA_ROOT}/central/recruitment.json`,

    pay:
      `${DATA_ROOT}/central/pay.json`,

    locations:
      `${DATA_ROOT}/central/locations.json`,

    housing:
      `${DATA_ROOT}/central/housing.json`,

    promotion:
      `${DATA_ROOT}/central/promotion.json`,

    benefits:
      `${DATA_ROOT}/central/benefits.json`,

    sources:
      `${DATA_ROOT}/central/sources.json`,

    serviceCadres:
      `${DATA_ROOT}/central/service-cadres.json`,

    eligibilityRules:
      `${DATA_ROOT}/central/eligibility-rules.json`
  });

/* ============================================================
 * WEST BENGAL DATA
 * ============================================================
 */

const WEST_BENGAL_DATA_PATHS =
  Object.freeze({
    exams:
      `${DATA_ROOT}/states/west-bengal/exams.json`,

    jobs:
      `${DATA_ROOT}/states/west-bengal/jobs.json`,

    departments:
      `${DATA_ROOT}/states/west-bengal/departments.json`,

    organisations:
      `${DATA_ROOT}/states/west-bengal/organisations.json`,

    recruitment:
      `${DATA_ROOT}/states/west-bengal/recruitment.json`,

    pay:
      `${DATA_ROOT}/states/west-bengal/pay.json`,

    locations:
      `${DATA_ROOT}/states/west-bengal/locations.json`,

    housing:
      `${DATA_ROOT}/states/west-bengal/housing.json`,

    promotion:
      `${DATA_ROOT}/states/west-bengal/promotion.json`,

    benefits:
      `${DATA_ROOT}/states/west-bengal/benefits.json`,

    sources:
      `${DATA_ROOT}/states/west-bengal/sources.json`,

    serviceCadres:
      `${DATA_ROOT}/states/west-bengal/service-cadres.json`,

    eligibilityRules:
      `${DATA_ROOT}/states/west-bengal/eligibility-rules.json`
  });

/* ============================================================
 * INDEX DATA
 * ============================================================
 */

const INDEX_DATA_PATHS =
  Object.freeze({
    jobs:
      `${DATA_ROOT}/indexes/job-index.json`,

    exams:
      `${DATA_ROOT}/indexes/exam-index.json`,

    departments:
      `${DATA_ROOT}/indexes/department-index.json`,

    sources:
      `${DATA_ROOT}/indexes/source-index.json`,

    search:
      `${DATA_ROOT}/indexes/search-index.json`,

    serviceCadres:
      `${DATA_ROOT}/indexes/service-cadre-index.json`,

    eligibilityRules:
      `${DATA_ROOT}/indexes/eligibility-rule-index.json`,

    qualifications:
      `${DATA_ROOT}/indexes/qualification-index.json`
  });

/* ============================================================
 * SCHEMA PATHS
 * ============================================================
 *
 * Used by validation tooling and documentation. Browser
 * runtime normally does not need to fetch schemas.
 */

const SCHEMA_PATHS =
  Object.freeze({
    shared:
      `${DATA_ROOT}/schemas/shared.schema.json`,

    government:
      `${DATA_ROOT}/schemas/government.schema.json`,

    state:
      `${DATA_ROOT}/schemas/state.schema.json`,

    department:
      `${DATA_ROOT}/schemas/department.schema.json`,

    organisation:
      `${DATA_ROOT}/schemas/organisation.schema.json`,

    serviceCadre:
      `${DATA_ROOT}/schemas/service-cadre.schema.json`,

    qualification:
      `${DATA_ROOT}/schemas/qualification.schema.json`,

    eligibilityRule:
      `${DATA_ROOT}/schemas/eligibility-rule.schema.json`,

    job:
      `${DATA_ROOT}/schemas/job.schema.json`,

    exam:
      `${DATA_ROOT}/schemas/exam.schema.json`,

    recruitment:
      `${DATA_ROOT}/schemas/recruitment.schema.json`,

    pay:
      `${DATA_ROOT}/schemas/pay.schema.json`,

    location:
      `${DATA_ROOT}/schemas/location.schema.json`,

    housing:
      `${DATA_ROOT}/schemas/housing.schema.json`,

    promotion:
      `${DATA_ROOT}/schemas/promotion.schema.json`,

    benefits:
      `${DATA_ROOT}/schemas/benefits.schema.json`,

    source:
      `${DATA_ROOT}/schemas/source.schema.json`,

    assessmentQuestion:
      `${DATA_ROOT}/schemas/assessment-question.schema.json`,

    assessmentOption:
      `${DATA_ROOT}/schemas/assessment-option.schema.json`,

    assessmentBranching:
      `${DATA_ROOT}/schemas/assessment-branching.schema.json`,

    assessmentProfileField:
      `${DATA_ROOT}/schemas/assessment-profile-field.schema.json`,

    assessmentResponseScoring:
      `${DATA_ROOT}/schemas/assessment-response-scoring.schema.json`,

    candidateProfile:
      `${DATA_ROOT}/schemas/candidate-profile.schema.json`
  });

/* ============================================================
 * GOVERNMENT JURISDICTIONS
 * ============================================================
 */

const GOVERNMENT_DATASETS =
  Object.freeze({
    CENTRAL: Object.freeze({
      id:
        'CENTRAL',

      label:
        'Central Government',

      type:
        'CENTRAL',

      paths:
        CENTRAL_DATA_PATHS
    }),

    'IN-WB': Object.freeze({
      id:
        'IN-WB',

      label:
        'West Bengal Government',

      type:
        'STATE',

      stateId:
        'IN-WB',

      paths:
        WEST_BENGAL_DATA_PATHS
    })
  });

/* ============================================================
 * PUBLIC AI CONFIGURATION
 * ============================================================
 *
 * These values are safe for browser use.
 *
 * NEVER put an API key here.
 */

const AI_CONFIG =
  Object.freeze({
    enabled:
      true,

    assistantName:
      'Compass AI',

    mode:
      'career-research-only',

    endpoint:
      '/api/ai',

    timeoutMs:
      30000,

    maxConversationMessages:
      20,

    maxInputCharacters:
      8000,

    maxOutputCharacters:
      12000,

    supportedLanguages:
      [
        ...SUPPORTED_LANGUAGES
      ],

    scope:
      Object.freeze({
        governmentCareers:
          true,

        eligibility:
          true,

        exams:
          true,

        jobs:
          true,

        salary:
          true,

        familyCompatibility:
          true,

        location:
          true,

        housing:
          true,

        promotion:
          true,

        preparation:
          true,

        sources:
          true,

        unrelatedGeneralChat:
          false
      })
  });

/* ============================================================
 * SEARCH CONFIGURATION
 * ============================================================
 */

const SEARCH_CONFIG =
  Object.freeze({
    defaultLimit:
      DEFAULT_SEARCH_LIMIT,

    minimumQueryLength:
      1,

    debounceMs:
      160,

    searchFields:
      Object.freeze([
        'id',
        'name',
        'title',
        'post',
        'postName',
        'fullForm',
        'abbreviation',
        'department',
        'departmentName',
        'organisation',
        'organisationName',
        'exam',
        'examName',
        'qualification',
        'category',
        'jobProfile',
        'conditions',
        'location',
        'posting',
        'housing',
        'promotion',
        'notes'
      ])
  });

/* ============================================================
 * UI CONFIGURATION
 * ============================================================
 */

const UI_CONFIG =
  Object.freeze({
    comparison:
      Object.freeze({
        minimum:
          2,

        maximum:
          MAX_COMPARISON_ITEMS
      }),

    pagination:
      Object.freeze({
        defaultPageSize:
          DEFAULT_PAGE_SIZE,

        allowedPageSizes:
          Object.freeze([
            10,
            20,
            50,
            100
          ])
      }),

    toast:
      Object.freeze({
        durationMs:
          4500,

        maximumVisible:
          4
      }),

    modal:
      Object.freeze({
        closeOnBackdrop:
          true,

        closeOnEscape:
          true
      })
  });

/* ============================================================
 * STORAGE KEYS
 * ============================================================
 */

const STORAGE_KEYS =
  Object.freeze({
    theme:
      'gcc_theme',

    language:
      'gcc_language',

    state:
      'gcc_state',

    government:
      'gcc_government',

    bookmarks:
      'gcc_bookmarks',

    comparison:
      'gcc_comparison',

    preferences:
      'gcc_preferences',

    recentViews:
      'gcc_recent_views',

    assessment:
      'gcc_assessment',

    filters:
      'gcc_filters',

    aiConversation:
      'gcc_ai_conversation'
  });

/* ============================================================
 * APPLICATION CONFIG
 * ============================================================
 */

const config =
  Object.freeze({
    app:
      Object.freeze({
        name:
          'GovCareer Compass',

        version:
          APP_VERSION,

        environment:
          'production',

        researchBaseline:
          RESEARCH_BASELINE,

        defaultLanguage:
          DEFAULT_LANGUAGE,

        supportedLanguages:
          [
            ...SUPPORTED_LANGUAGES
          ],

        defaultTheme:
          DEFAULT_THEME,

        supportedThemes:
          [
            ...SUPPORTED_THEMES
          ],

        defaultGovernment:
          DEFAULT_GOVERNMENT,

        defaultState:
          DEFAULT_STATE
      }),

    data:
      Object.freeze({
        root:
          DATA_ROOT,

        common:
          COMMON_DATA_PATHS,

        assessment:
          ASSESSMENT_DATA_PATHS,

        i18n:
          I18N_DATA_PATHS,

        governments:
          GOVERNMENT_DATASETS,

        indexes:
          INDEX_DATA_PATHS,

        schemas:
          SCHEMA_PATHS
      }),

    ai:
      AI_CONFIG,

    search:
      SEARCH_CONFIG,

    ui:
      UI_CONFIG,

    storage:
      STORAGE_KEYS
  });

/* ============================================================
 * HELPER FUNCTIONS
 * ============================================================
 */

function getGovernmentDataset(
  governmentId
) {
  return (
    GOVERNMENT_DATASETS[
      governmentId
    ] ||
    null
  );
}

function getStateDataset(
  stateId
) {
  if (
    !stateId
  ) {
    return null;
  }

  if (
    stateId ===
    'IN-WB'
  ) {
    return GOVERNMENT_DATASETS[
      'IN-WB'
    ];
  }

  return null;
}

/* ============================================================
 * PUBLIC EXPORTS
 * ============================================================
 */

export {
  APP_VERSION,
  RESEARCH_BASELINE,

  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,

  DEFAULT_THEME,
  SUPPORTED_THEMES,

  DEFAULT_STATE,
  DEFAULT_GOVERNMENT,

  MAX_COMPARISON_ITEMS,
  DEFAULT_SEARCH_LIMIT,
  DEFAULT_PAGE_SIZE,

  DATA_ROOT,

  COMMON_DATA_PATHS,
  ASSESSMENT_DATA_PATHS,
  I18N_DATA_PATHS,
  CENTRAL_DATA_PATHS,
  WEST_BENGAL_DATA_PATHS,
  INDEX_DATA_PATHS,
  SCHEMA_PATHS,

  GOVERNMENT_DATASETS,
  AI_CONFIG,
  SEARCH_CONFIG,
  UI_CONFIG,
  STORAGE_KEYS,

  getGovernmentDataset,
  getStateDataset
};

export default config;
