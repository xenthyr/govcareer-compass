/**
 * GovCareer Compass
 * ============================================================
 * Global Application Configuration
 * ============================================================
 *
 * PURPOSE
 * -------
 * This file is the single public configuration registry for the
 * GovCareer Compass frontend.
 *
 * It defines:
 * - application identity
 * - deployment/base-path handling
 * - page routes
 * - data sources
 * - schema locations
 * - storage keys
 * - UI limits
 * - feature flags
 * - localization
 * - database entity configuration
 * - public AI configuration
 *
 * SECURITY
 * --------
 * NEVER place any secret in this file.
 *
 * Forbidden:
 * - OpenRouter API key
 * - API secrets
 * - access tokens
 * - passwords
 * - private credentials
 *
 * Public model information may be stored here, but calls requiring
 * a secret must go through a server-side/Vercel endpoint.
 *
 * DEPLOYMENT TARGETS
 * ------------------
 * This configuration supports:
 * - GitHub Pages
 * - Vercel
 * - other static hosting
 *
 * No Node.js build process is required for the frontend.
 */

const APP_VERSION = '1.0.0';
const CONFIG_VERSION = '1.0.0';

/**
 * ------------------------------------------------------------
 * BASE PATH RESOLUTION
 * ------------------------------------------------------------
 *
 * GitHub Pages commonly serves the project under:
 *
 *   /repository-name/
 *
 * while Vercel commonly serves it under:
 *
 *   /
 *
 * We derive the base path from the location of this module so
 * internal paths do not need to be rewritten when deployment
 * changes.
 */
function resolveBasePath() {
  try {
    const moduleUrl = new URL(
      import.meta.url,
      window.location.href
    );

    const modulePath =
      moduleUrl.pathname;

    const marker = '/js/';

    const markerIndex =
      modulePath.lastIndexOf(marker);

    if (markerIndex === -1) {
      return '/';
    }

    const root =
      modulePath.slice(
        0,
        markerIndex + 1
      );

    return root || '/';
  } catch {
    return '/';
  }
}

/**
 * Ensure generated internal paths use exactly one slash
 * between the base path and relative path.
 */
const BASE_PATH =
  resolveBasePath();

function normalizeRelativePath(
  path = ''
) {
  return String(path)
    .replace(/\\/g, '/')
    .replace(/^\/+/, '');
}

function withBasePath(
  path = ''
) {
  const relative =
    normalizeRelativePath(
      path
    );

  if (BASE_PATH === '/') {
    return `/${relative}`;
  }

  return `${BASE_PATH}${relative}`;
}

/**
 * Resolve an internal path into an absolute URL.
 */
function resolveUrl(
  path = ''
) {
  return new URL(
    withBasePath(path),
    window.location.origin
  ).href;
}

/**
 * ------------------------------------------------------------
 * ENUMERATIONS
 * ------------------------------------------------------------
 *
 * These are public vocabulary definitions used by multiple
 * frontend modules.
 */

const LANGUAGES = Object.freeze([
  'en',
  'bn'
]);

const THEMES = Object.freeze([
  'light',
  'dark',
  'system'
]);

const ELIGIBILITY_STATUSES =
  Object.freeze([
    'DIRECT',
    'CONDITIONAL',
    'NOT_ELIGIBLE',
    'MANUAL_VERIFICATION',
    'UNKNOWN'
  ]);

const CONFIDENCE_LEVELS =
  Object.freeze([
    'HIGH',
    'MEDIUM_HIGH',
    'MEDIUM',
    'LOW',
    'ESTIMATE',
    'NOT_VERIFIED',
    'UNKNOWN'
  ]);

const JOB_STATUSES =
  Object.freeze([
    'ACTIVE',
    'CURRENT_NO_RECRUITMENT',
    'HISTORICAL',
    'RENAMED',
    'MERGED',
    'REPLACED',
    'ABOLISHED',
    'TEMPORARY',
    'UNKNOWN'
  ]);

const EXAM_STATUSES =
  Object.freeze([
    'OPEN',
    'CLOSED',
    'UNDER_PROCESS',
    'RECENTLY_COMPLETED',
    'EXPECTED_PERIODIC',
    'IRREGULAR',
    'HISTORICAL',
    'DISCONTINUED',
    'UNKNOWN'
  ]);

const EMPLOYMENT_STATUSES =
  Object.freeze([
    'REGULAR',
    'TEMPORARY',
    'CONTRACTUAL',
    'OUTSOURCED',
    'SCHEME_PROJECT',
    'AD_HOC',
    'UNKNOWN'
  ]);

const PHYSICAL_REQUIREMENT_STATUSES =
  Object.freeze([
    'NONE',
    'REQUIRED',
    'ROLE_DEPENDENT',
    'UNKNOWN'
  ]);

const DIFFICULTY_LEVELS =
  Object.freeze([
    'EASY',
    'MODERATE',
    'HARD',
    'VERY_HARD',
    'EXTREME',
    'UNKNOWN'
  ]);

/**
 * ------------------------------------------------------------
 * ROUTES
 * ------------------------------------------------------------
 *
 * Store relative paths here.
 * router.js resolves them against BASE_PATH.
 */
const ROUTES = Object.freeze({
  home: 'index.html',

  careerFinder:
    'pages/career-finder.html',

  careerResults:
    'pages/career-results.html',

  exams:
    'pages/exams.html',

  examDetails:
    'pages/exam-details.html',

  jobs:
    'pages/jobs.html',

  jobDetails:
    'pages/job-details.html',

  compare:
    'pages/compare.html',

  rankings:
    'pages/rankings.html',

  salary:
    'pages/salary.html',

  eligibility:
    'pages/eligibility.html',

  family:
    'pages/family.html',

  parents:
    'pages/parents.html',

  location:
    'pages/location.html',

  housing:
    'pages/housing.html',

  preparation:
    'pages/preparation.html',

  confusionCenter:
    'pages/confusion-center.html',

  states:
    'pages/states.html',

  ai:
    'pages/ai.html',

  sources:
    'pages/sources.html',

  glossary:
    'pages/glossary.html',

  methodology:
    'pages/methodology.html',

  about:
    'pages/about.html',

  privacy:
    'pages/privacy.html',

  notFound:
    'pages/404.html'
});

/**
 * ------------------------------------------------------------
 * DATA PATHS
 * ------------------------------------------------------------
 *
 * These paths correspond to the canonical data architecture
 * established for the project.
 *
 * Important:
 * /data/indexes/ is a derived layer.
 * Canonical records remain under /data/common/,
 * /data/central/ and /data/states/west-bengal/.
 */
const DATA = Object.freeze({
  common: Object.freeze({
    qualifications:
      withBasePath(
        'data/common/qualifications.json'
      ),

    categories:
      withBasePath(
        'data/common/categories.json'
      ),

    glossary:
      withBasePath(
        'data/common/glossary.json'
      ),

    scoringRules:
      withBasePath(
        'data/common/scoring-rules.json'
      ),

    governments:
      withBasePath(
        'data/common/governments.json'
      ),

    states:
      withBasePath(
        'data/common/states.json'
      ),

    locations:
      withBasePath(
        'data/common/locations.json'
      ),

    statuses:
      withBasePath(
        'data/common/statuses.json'
      ),

    confidenceLevels:
      withBasePath(
        'data/common/confidence-levels.json'
      ),

    sourceTypes:
      withBasePath(
        'data/common/source-types.json'
      )
  }),

  assessment: Object.freeze({
    questions:
      withBasePath(
        'data/assessment/questions.json'
      ),

    options:
      withBasePath(
        'data/assessment/options.json'
      ),

    branching:
      withBasePath(
        'data/assessment/branching.json'
      ),

    profileFields:
      withBasePath(
        'data/assessment/profile-fields.json'
      ),

    responseScoring:
      withBasePath(
        'data/assessment/response-scoring.json'
      )
  }),

  i18n: Object.freeze({
    en:
      withBasePath(
        'data/i18n/en.json'
      ),

    bn:
      withBasePath(
        'data/i18n/bn.json'
      )
  }),

  central: Object.freeze({
    exams:
      withBasePath(
        'data/central/exams.json'
      ),

    jobs:
      withBasePath(
        'data/central/jobs.json'
      ),

    departments:
      withBasePath(
        'data/central/departments.json'
      ),

    organisations:
      withBasePath(
        'data/central/organisations.json'
      ),

    serviceCadres:
      withBasePath(
        'data/central/service-cadres.json'
      ),

    eligibilityRules:
      withBasePath(
        'data/central/eligibility-rules.json'
      ),

    recruitment:
      withBasePath(
        'data/central/recruitment.json'
      ),

    pay:
      withBasePath(
        'data/central/pay.json'
      ),

    locations:
      withBasePath(
        'data/central/locations.json'
      ),

    housing:
      withBasePath(
        'data/central/housing.json'
      ),

    promotion:
      withBasePath(
        'data/central/promotion.json'
      ),

    benefits:
      withBasePath(
        'data/central/benefits.json'
      ),

    sources:
      withBasePath(
        'data/central/sources.json'
      )
  }),

  westBengal: Object.freeze({
    exams:
      withBasePath(
        'data/states/west-bengal/exams.json'
      ),

    jobs:
      withBasePath(
        'data/states/west-bengal/jobs.json'
      ),

    departments:
      withBasePath(
        'data/states/west-bengal/departments.json'
      ),

    organisations:
      withBasePath(
        'data/states/west-bengal/organisations.json'
      ),

    serviceCadres:
      withBasePath(
        'data/states/west-bengal/service-cadres.json'
      ),

    eligibilityRules:
      withBasePath(
        'data/states/west-bengal/eligibility-rules.json'
      ),

    recruitment:
      withBasePath(
        'data/states/west-bengal/recruitment.json'
      ),

    pay:
      withBasePath(
        'data/states/west-bengal/pay.json'
      ),

    locations:
      withBasePath(
        'data/states/west-bengal/locations.json'
      ),

    housing:
      withBasePath(
        'data/states/west-bengal/housing.json'
      ),

    promotion:
      withBasePath(
        'data/states/west-bengal/promotion.json'
      ),

    benefits:
      withBasePath(
        'data/states/west-bengal/benefits.json'
      ),

    sources:
      withBasePath(
        'data/states/west-bengal/sources.json'
      )
  }),

  indexes: Object.freeze({
    jobs:
      withBasePath(
        'data/indexes/job-index.json'
      ),

    exams:
      withBasePath(
        'data/indexes/exam-index.json'
      ),

    departments:
      withBasePath(
        'data/indexes/department-index.json'
      ),

    sources:
      withBasePath(
        'data/indexes/source-index.json'
      ),

    search:
      withBasePath(
        'data/indexes/search-index.json'
      )
  })
});

/**
 * ------------------------------------------------------------
 * SCHEMA PATHS
 * ------------------------------------------------------------
 *
 * These are primarily useful for:
 * - validation tooling;
 * - development tools;
 * - documentation;
 * - future browser-side diagnostic tooling.
 *
 * Production runtime does not need to fetch every schema file.
 */
const SCHEMAS = Object.freeze({
  root:
    withBasePath(
      'data/schemas/'
    ),

  shared:
    withBasePath(
      'data/schemas/shared.schema.json'
    ),

  government:
    withBasePath(
      'data/schemas/government.schema.json'
    ),

  state:
    withBasePath(
      'data/schemas/state.schema.json'
    ),

  department:
    withBasePath(
      'data/schemas/department.schema.json'
    ),

  organisation:
    withBasePath(
      'data/schemas/organisation.schema.json'
    ),

  serviceCadre:
    withBasePath(
      'data/schemas/service-cadre.schema.json'
    ),

  qualification:
    withBasePath(
      'data/schemas/qualification.schema.json'
    ),

  eligibilityRule:
    withBasePath(
      'data/schemas/eligibility-rule.schema.json'
    ),

  job:
    withBasePath(
      'data/schemas/job.schema.json'
    ),

  exam:
    withBasePath(
      'data/schemas/exam.schema.json'
    ),

  recruitment:
    withBasePath(
      'data/schemas/recruitment.schema.json'
    ),

  pay:
    withBasePath(
      'data/schemas/pay.schema.json'
    ),

  location:
    withBasePath(
      'data/schemas/location.schema.json'
    ),

  housing:
    withBasePath(
      'data/schemas/housing.schema.json'
    ),

  promotion:
    withBasePath(
      'data/schemas/promotion.schema.json'
    ),

  benefits:
    withBasePath(
      'data/schemas/benefits.schema.json'
    ),

  source:
    withBasePath(
      'data/schemas/source.schema.json'
    ),

  assessmentQuestion:
    withBasePath(
      'data/schemas/assessment-question.schema.json'
    ),

  candidateProfile:
    withBasePath(
      'data/schemas/candidate-profile.schema.json'
    )
});

/**
 * ------------------------------------------------------------
 * STORAGE KEYS
 * ------------------------------------------------------------
 *
 * These are logical keys only.
 * storage.js adds the application namespace.
 */
const STORAGE_KEYS = Object.freeze({
  theme:
    'theme',

  language:
    'language',

  preferences:
    'preferences',

  candidateProfile:
    'candidate-profile',

  bookmarks:
    'bookmarks',

  comparison:
    'comparison',

  recentlyViewed:
    'recently-viewed',

  filters:
    'filters',

  searchHistory:
    'search-history',

  assessmentProgress:
    'assessment-progress',

  assessmentResult:
    'assessment-result',

  lastSearch:
    'last-search'
});

/**
 * ------------------------------------------------------------
 * DATABASE ENTITY TYPES
 * ------------------------------------------------------------
 */
const ENTITY_TYPES = Object.freeze([
  'JOB',
  'EXAM',
  'DEPARTMENT',
  'ORGANISATION',
  'SERVICE_CADRE',
  'ELIGIBILITY_RULE',
  'RECRUITMENT',
  'PAY',
  'LOCATION',
  'HOUSING',
  'PROMOTION',
  'BENEFIT',
  'SOURCE',
  'GOVERNMENT',
  'STATE',
  'QUALIFICATION',
  'CATEGORY',
  'GLOSSARY',
  'SCORING_RULE',
  'STATUS',
  'CONFIDENCE_LEVEL',
  'SOURCE_TYPE',
  'ASSESSMENT_QUESTION',
  'ASSESSMENT_OPTION',
  'ASSESSMENT_BRANCHING',
  'ASSESSMENT_PROFILE_FIELD',
  'ASSESSMENT_RESPONSE_SCORING'
]);

/**
 * ------------------------------------------------------------
 * APPLICATION METADATA
 * ------------------------------------------------------------
 */
const APP = Object.freeze({
  name:
    'GovCareer Compass',

  shortName:
    'GovCareer Compass',

  version:
    APP_VERSION,

  configVersion:
    CONFIG_VERSION,

  researchBaseline:
    '2026-08-31',

  defaultLanguage:
    'en',

  supportedLanguages:
    LANGUAGES,

  defaultTheme:
    'system',

  supportedThemes:
    THEMES,

  environment:
    'static',

  copyrightYear:
    2026,

  storageNamespace:
    'govcareer-compass'
});

/**
 * ------------------------------------------------------------
 * UI CONFIGURATION
 * ------------------------------------------------------------
 */
const UI = Object.freeze({
  toastDuration:
    3500,

  animationDuration:
    220,

  searchDebounceMs:
    180,

  maxComparisonItems:
    5,

  maxRecentlyViewedItems:
    10,

  maxSearchHistoryItems:
    10,

  maxBookmarks:
    100,

  maxSearchResults:
    50,

  maxAutocompleteResults:
    8,

  maxRecommendedCareers:
    10,

  pageSize:
    20,

  mobileBreakpoint:
    768,

  tabletBreakpoint:
    1024
});

/**
 * ------------------------------------------------------------
 * FEATURE FLAGS
 * ------------------------------------------------------------
 *
 * These must describe frontend capabilities only.
 * They do not constitute security controls.
 */
const FEATURES = Object.freeze({
  search:
    true,

  filters:
    true,

  comparison:
    true,

  bookmarks:
    true,

  recentlyViewed:
    true,

  sharing:
    true,

  csvExport:
    true,

  localization:
    true,

  themeSwitching:
    true,

  responsive:
    true,

  accessibility:
    true,

  analytics:
    false,

  offlineCache:
    false,

  ai:
    true,

  aiStreaming:
    true
});

/**
 * ------------------------------------------------------------
 * PUBLIC AI CONFIGURATION
 * ------------------------------------------------------------
 *
 * IMPORTANT:
 * No secret is stored here.
 *
 * The browser should call a server-side endpoint, for example:
 *
 *   /api/compass-ai
 *
 * The server-side implementation should obtain the OpenRouter
 * credential from a Vercel environment variable.
 */
const AI = Object.freeze({
  assistantName:
    'Compass AI',

  enabled:
    true,

  endpoint:
    '/api/compass-ai',

  provider:
    'OpenRouter',

  /*
   * Keep the model configurable.
   *
   * This is public information, not a credential.
   * The final model should be selected in the server-side AI
   * configuration and can be overridden there.
   */
  model:
    'openrouter/auto',

  temperature:
    0.2,

  maxTokens:
    1200,

  timeoutMs:
    30000,

  streaming:
    true,

  scope:
    'GOVERNMENT_CAREER_GUIDANCE_ONLY',

  languageAware:
    true,

  usesCanonicalDatabase:
    true,

  usesSourceAwareContext:
    true
});

/**
 * ------------------------------------------------------------
 * DATA POLICY
 * ------------------------------------------------------------
 */
const DATA_POLICY = Object.freeze({
  canonicalDataDirectories: [
    'data/common/',
    'data/central/',
    'data/states/west-bengal/'
  ],

  derivedDataDirectories: [
    'data/indexes/'
  ],

  researchDirectories: [
    'research/'
  ],

  researchIsRuntimeSource:
    false,

  indexesAreCanonicalSource:
    false,

  canonicalIdsAreLanguageIndependent:
    true,

  sourceTitlesRemainOfficial:
    true,

  neverInventMissingValues:
    true,

  distinguishUnknownFromNotApplicable:
    true,

  distinguishHistoricalFromCurrent:
    true,

  distinguishHardEligibilityFromPreference:
    true
});

/**
 * ------------------------------------------------------------
 * SCORE SEMANTICS
 * ------------------------------------------------------------
 *
 * Explicitly defines which direction is favorable.
 * This prevents the UI from accidentally interpreting
 * high-stress or high-risk scores as positive.
 */
const SCORE_SEMANTICS = Object.freeze({
  salary:
    'HIGHER_IS_BETTER',

  authority:
    'HIGHER_IS_BETTER',

  careerGrowth:
    'HIGHER_IS_BETTER',

  prestige:
    'HIGHER_IS_BETTER',

  jobSecurity:
    'HIGHER_IS_BETTER',

  workLifeBalance:
    'HIGHER_IS_BETTER',

  familyCompatibility:
    'HIGHER_IS_BETTER',

  parentCareCompatibility:
    'HIGHER_IS_BETTER',

  physicalSafety:
    'HIGHER_IS_BETTER',

  geographicStability:
    'HIGHER_IS_BETTER',

  housingAdvantage:
    'HIGHER_IS_BETTER',

  stress:
    'HIGHER_IS_WORSE',

  physicalRisk:
    'HIGHER_IS_WORSE',

  transferBurden:
    'HIGHER_IS_WORSE',

  nightDutyBurden:
    'HIGHER_IS_WORSE',

  weekendDutyBurden:
    'HIGHER_IS_WORSE'
});

/**
 * ------------------------------------------------------------
 * PUBLIC SITE PATHS
 * ------------------------------------------------------------
 */
const SITE = Object.freeze({
  basePath:
    BASE_PATH,

  home:
    withBasePath(
      ROUTES.home
    ),

  pages:
    withBasePath(
      'pages/'
    ),

  assets:
    withBasePath(
      'assets/'
    ),

  css:
    withBasePath(
      'css/'
    ),

  js:
    withBasePath(
      'js/'
    ),

  data:
    withBasePath(
      'data/'
    ),

  research:
    withBasePath(
      'research/'
    )
});

/**
 * ------------------------------------------------------------
 * PUBLIC UTILITY HELPERS
 * ------------------------------------------------------------
 */

function getRoute(
  routeName
) {
  const route =
    ROUTES[
      routeName
    ];

  if (!route) {
    throw new Error(
      `Unknown GovCareer Compass route: ${routeName}`
    );
  }

  return withBasePath(
    route
  );
}

function getDataPath(
  scope,
  dataset
) {
  const scopeData =
    DATA[
      scope
    ];

  if (!scopeData) {
    throw new Error(
      `Unknown data scope: ${scope}`
    );
  }

  const path =
    scopeData[
      dataset
    ];

  if (!path) {
    throw new Error(
      `Unknown dataset "${dataset}" in scope "${scope}".`
    );
  }

  return path;
}

function getSchemaPath(
  schemaName
) {
  const path =
    SCHEMAS[
      schemaName
    ];

  if (!path) {
    throw new Error(
      `Unknown schema: ${schemaName}`
    );
  }

  return path;
}

/**
 * Deep-freeze public configuration objects where practical.
 * The configuration is already constructed using Object.freeze
 * at each major layer; this helper is kept private intentionally.
 */
function isPlainObject(
  value
) {
  if (
    value === null ||
    typeof value !==
      'object'
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

function deepFreeze(
  object
) {
  if (
    !isPlainObject(
      object
    ) &&
    !Array.isArray(
      object
    )
  ) {
    return object;
  }

  Reflect.ownKeys(
    object
  ).forEach(
    (key) => {
      const value =
        object[
          key
        ];

      if (
        (
          isPlainObject(
            value
          ) ||
          Array.isArray(
            value
          )
        ) &&
        !Object.isFrozen(
          value
        )
      ) {
        deepFreeze(
          value
        );
      }
    }
  );

  return Object.freeze(
    object
  );
}

/**
 * ------------------------------------------------------------
 * FINAL CONFIGURATION OBJECT
 * ------------------------------------------------------------
 */
const config = deepFreeze({
  app: APP,

  site: SITE,

  routes: ROUTES,

  data: DATA,

  schemas: SCHEMAS,

  storageKeys:
    STORAGE_KEYS,

  entityTypes:
    ENTITY_TYPES,

  ui: UI,

  features:
    FEATURES,

  ai: AI,

  dataPolicy:
    DATA_POLICY,

  scoreSemantics:
    SCORE_SEMANTICS,

  enums: {
    languages:
      LANGUAGES,

    themes:
      THEMES,

    eligibilityStatuses:
      ELIGIBILITY_STATUSES,

    confidenceLevels:
      CONFIDENCE_LEVELS,

    jobStatuses:
      JOB_STATUSES,

    examStatuses:
      EXAM_STATUSES,

    employmentStatuses:
      EMPLOYMENT_STATUSES,

    physicalRequirementStatuses:
      PHYSICAL_REQUIREMENT_STATUSES,

    difficultyLevels:
      DIFFICULTY_LEVELS
  },

  helpers: {
    withBasePath,
    resolveUrl,
    getRoute,
    getDataPath,
    getSchemaPath
  }
});

/**
 * Named exports
 */
export {
  config,

  APP,
  SITE,
  ROUTES,
  DATA,
  SCHEMAS,
  STORAGE_KEYS,
  ENTITY_TYPES,
  UI,
  FEATURES,
  AI,
  DATA_POLICY,
  SCORE_SEMANTICS,

  LANGUAGES,
  THEMES,
  ELIGIBILITY_STATUSES,
  CONFIDENCE_LEVELS,
  JOB_STATUSES,
  EXAM_STATUSES,
  EMPLOYMENT_STATUSES,
  PHYSICAL_REQUIREMENT_STATUSES,
  DIFFICULTY_LEVELS,

  withBasePath,
  resolveUrl,
  getRoute,
  getDataPath,
  getSchemaPath
};

export default config;
