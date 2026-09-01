/**
 * GovCareer Compass
 * Global application configuration
 *
 * IMPORTANT:
 * - This file contains public configuration only.
 * - Never place API keys, tokens, passwords, or secrets here.
 * - The application is designed for static GitHub Pages / Vercel hosting.
 */

const VERSION = '1.0.0';

/**
 * Resolve the deployed site root from the current module URL.
 *
 * Examples:
 * GitHub Pages:
 *   https://user.github.io/govcareer-compass/js/config.js
 *   -> /govcareer-compass/
 *
 * Vercel:
 *   https://govcareer-compass.vercel.app/js/config.js
 *   -> /
 *
 * This avoids hard-coding a repository path.
 */
function resolveSiteBasePath() {
  try {
    const currentScriptUrl = new URL(import.meta.url);
    const jsDirectory = currentScriptUrl.pathname.substring(
      0,
      currentScriptUrl.pathname.lastIndexOf('/') + 1
    );

    const jsMarker = '/js/';

    const markerIndex = jsDirectory.lastIndexOf(jsMarker);

    if (markerIndex >= 0) {
      return jsDirectory.substring(0, markerIndex + 1);
    }

    return '/';
  } catch {
    return '/';
  }
}

const basePath = resolveSiteBasePath();

function withBasePath(path = '') {
  const normalizedPath = String(path).replace(/^\/+/, '');
  return `${basePath}${normalizedPath}`;
}

const config = Object.freeze({
  app: Object.freeze({
    name: 'GovCareer Compass',
    version: VERSION,
    researchBaseline: '31 August 2026',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'bn'],
    defaultTheme: 'system',
    storageNamespace: 'govcareer-compass',
    environment: 'static'
  }),

  site: Object.freeze({
    basePath,
    productionUrl: '',
    home: withBasePath('index.html')
  }),

  paths: Object.freeze({
    pages: withBasePath('pages/'),
    assets: withBasePath('assets/'),
    css: withBasePath('css/'),
    js: withBasePath('js/'),
    data: withBasePath('data/'),
    research: withBasePath('research/'),
    schemas: withBasePath('data/schemas/')
  }),

  data: Object.freeze({
    common: Object.freeze({
      qualifications: withBasePath('data/common/qualifications.json'),
      categories: withBasePath('data/common/categories.json'),
      glossary: withBasePath('data/common/glossary.json'),
      scoringRules: withBasePath('data/common/scoring-rules.json'),
      governments: withBasePath('data/common/governments.json'),
      states: withBasePath('data/common/states.json'),
      locations: withBasePath('data/common/locations.json'),
      statuses: withBasePath('data/common/statuses.json'),
      confidenceLevels: withBasePath(
        'data/common/confidence-levels.json'
      ),
      sourceTypes: withBasePath('data/common/source-types.json')
    }),

    assessment: Object.freeze({
      questions: withBasePath('data/assessment/questions.json'),
      options: withBasePath('data/assessment/options.json'),
      branching: withBasePath('data/assessment/branching.json'),
      profileFields: withBasePath(
        'data/assessment/profile-fields.json'
      ),
      responseScoring: withBasePath(
        'data/assessment/response-scoring.json'
      )
    }),

    i18n: Object.freeze({
      en: withBasePath('data/i18n/en.json'),
      bn: withBasePath('data/i18n/bn.json')
    }),

    central: Object.freeze({
      exams: withBasePath('data/central/exams.json'),
      jobs: withBasePath('data/central/jobs.json'),
      departments: withBasePath('data/central/departments.json'),
      organisations: withBasePath(
        'data/central/organisations.json'
      ),
      serviceCadres: withBasePath(
        'data/central/service-cadres.json'
      ),
      eligibilityRules: withBasePath(
        'data/central/eligibility-rules.json'
      ),
      recruitment: withBasePath(
        'data/central/recruitment.json'
      ),
      pay: withBasePath('data/central/pay.json'),
      locations: withBasePath(
        'data/central/locations.json'
      ),
      housing: withBasePath('data/central/housing.json'),
      promotion: withBasePath(
        'data/central/promotion.json'
      ),
      benefits: withBasePath(
        'data/central/benefits.json'
      ),
      sources: withBasePath('data/central/sources.json')
    }),

    westBengal: Object.freeze({
      exams: withBasePath(
        'data/states/west-bengal/exams.json'
      ),
      jobs: withBasePath(
        'data/states/west-bengal/jobs.json'
      ),
      departments: withBasePath(
        'data/states/west-bengal/departments.json'
      ),
      organisations: withBasePath(
        'data/states/west-bengal/organisations.json'
      ),
      serviceCadres: withBasePath(
        'data/states/west-bengal/service-cadres.json'
      ),
      eligibilityRules: withBasePath(
        'data/states/west-bengal/eligibility-rules.json'
      ),
      recruitment: withBasePath(
        'data/states/west-bengal/recruitment.json'
      ),
      pay: withBasePath(
        'data/states/west-bengal/pay.json'
      ),
      locations: withBasePath(
        'data/states/west-bengal/locations.json'
      ),
      housing: withBasePath(
        'data/states/west-bengal/housing.json'
      ),
      promotion: withBasePath(
        'data/states/west-bengal/promotion.json'
      ),
      benefits: withBasePath(
        'data/states/west-bengal/benefits.json'
      ),
      sources: withBasePath(
        'data/states/west-bengal/sources.json'
      )
    }),

    indexes: Object.freeze({
      jobs: withBasePath('data/indexes/job-index.json'),
      exams: withBasePath('data/indexes/exam-index.json'),
      departments: withBasePath(
        'data/indexes/department-index.json'
      ),
      sources: withBasePath('data/indexes/source-index.json'),
      search: withBasePath(
        'data/indexes/search-index.json'
      )
    })
  }),

  storageKeys: Object.freeze({
    theme: 'theme',
    language: 'language',
    preferences: 'preferences',
    candidateProfile: 'candidate-profile',
    bookmarks: 'bookmarks',
    comparison: 'comparison',
    recentlyViewed: 'recently-viewed',
    filters: 'filters',
    searchHistory: 'search-history',
    assessmentProgress: 'assessment-progress'
  }),

  ui: Object.freeze({
    maxComparisonItems: 5,
    maxRecentlyViewedItems: 10,
    maxSearchHistoryItems: 10,
    toastDuration: 3500,
    searchDebounceMs: 180,
    animationDuration: 220
  }),

  routes: Object.freeze({
    home: 'index.html',
    careerFinder: 'pages/career-finder.html',
    careerResults: 'pages/career-results.html',
    exams: 'pages/exams.html',
    examDetails: 'pages/exam-details.html',
    jobs: 'pages/jobs.html',
    jobDetails: 'pages/job-details.html',
    compare: 'pages/compare.html',
    rankings: 'pages/rankings.html',
    salary: 'pages/salary.html',
    eligibility: 'pages/eligibility.html',
    family: 'pages/family.html',
    parents: 'pages/parents.html',
    location: 'pages/location.html',
    housing: 'pages/housing.html',
    preparation: 'pages/preparation.html',
    confusionCenter: 'pages/confusion-center.html',
    states: 'pages/states.html',
    ai: 'pages/ai.html',
    sources: 'pages/sources.html',
    glossary: 'pages/glossary.html',
    methodology: 'pages/methodology.html',
    about: 'pages/about.html',
    privacy: 'pages/privacy.html',
    notFound: 'pages/404.html'
  }),

  features: Object.freeze({
    search: true,
    filters: true,
    comparison: true,
    bookmarks: true,
    recentlyViewed: true,
    sharing: true,
    csvExport: true,
    localization: true,
    themeSwitching: true,
    offlineCaching: false,
    ai: true
  })
});

export { config, withBasePath };
export default config;
