/**

GovCareer Compass

============================================================

Application Configuration

============================================================

PUBLIC / BROWSER-SAFE CONFIGURATION ONLY

Never place secrets in this file.

Secrets such as:

OpenRouter API keys


authentication tokens


private credentials


database passwords


server-only environment variables


belong exclusively in the server-side environment.

Architectural role


---

This module is the single public configuration source for:

config

├── application identity / locale / theme

├── routes / deployment base path

├── data dataset locations

├── derived-index locations

├── schema locations

├── public AI client contract

├── search defaults

├── UI defaults

└── browser storage keys

This file contains configuration only.

It does not contain recommendation, eligibility, ranking,

validation, database, or AI business logic. */


const APP_VERSION = '0.1.0';

const RESEARCH_BASELINE = '31 August 2026';

const DEFAULT_LANGUAGE = 'en';

const FALLBACK_LANGUAGE = 'en';

const SUPPORTED_LANGUAGES = Object.freeze([ 'en', 'bn' ]);

const DEFAULT_THEME = 'system';

const SUPPORTED_THEMES = Object.freeze([ 'system', 'light', 'dark' ]);

const DEFAULT_STATE = 'IN-WB';

const DEFAULT_GOVERNMENT = 'CENTRAL';

const MAX_COMPARISON_ITEMS = 5;

const DEFAULT_SEARCH_LIMIT = 20;

const DEFAULT_PAGE_SIZE = 20;

/* ============================================================

APPLICATION DEPLOYMENT

============================================================

basePath is intentionally public and static.

Empty string:

root-domain deployment

Example future GitHub Pages deployment:

'/govcareer-compass'

The router uses this value when resolving named routes. */


const BASE_PATH = '';

const STORAGE_NAMESPACE = 'govcareer-compass';

/* ============================================================

APPLICATION LANGUAGE METADATA

============================================================

These are language properties, not UI translation strings.

Translation content belongs in:

data/i18n/en.json

data/i18n/bn.json

direction is kept explicit so the language service can update

<html dir=""> without hard-coding locale behavior elsewhere.
*/

const LANGUAGE_METADATA = Object.freeze({ en: Object.freeze({ code: 'en',

name:
      'English',

    nativeName:
      'English',

    direction:
      'ltr'
  }),

bn:
  Object.freeze({
    code:
      'bn',

    name:
      'Bengali',

    nativeName:
      'বাংলা',

    direction:
      'ltr'
  })

});

/* ============================================================

ROUTES

============================================================

Named routes are aligned with the existing router contract:

home

careerFinder

careerResults

exams

examDetails

jobs

jobDetails

compare

rankings

salary

eligibility

family

parents

location

housing

preparation

confusionCenter

states

ai

sources

glossary

methodology

about

privacy

notFound

Existing physical page filenames are preserved.

No additional route names are introduced. */


const ROUTES = Object.freeze({ home: 'index.html',

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

/* ============================================================

DATA ROOT

============================================================ */


const DATA_ROOT = './data';

/* ============================================================

COMMON DATA

============================================================ */


const COMMON_DATA_PATHS = Object.freeze({ qualifications: ${DATA_ROOT}/common/qualifications.json,

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

ASSESSMENT DATA

============================================================ */


const ASSESSMENT_DATA_PATHS = Object.freeze({ questions: ${DATA_ROOT}/assessment/questions.json,

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

INTERNATIONALIZATION DATA

============================================================ */


const I18N_DATA_PATHS = Object.freeze({ en: ${DATA_ROOT}/i18n/en.json,

bn:
  `${DATA_ROOT}/i18n/bn.json`

});

/* ============================================================

CENTRAL GOVERNMENT DATA

============================================================ */


const CENTRAL_DATA_PATHS = Object.freeze({ exams: ${DATA_ROOT}/central/exams.json,

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

WEST BENGAL DATA

============================================================ */


const WEST_BENGAL_DATA_PATHS = Object.freeze({ exams: ${DATA_ROOT}/states/west-bengal/exams.json,

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

ACTIVE STATE DATASET REGISTRY

============================================================

loader.js consumes:

config.activeStateIds

config.data.states

The legacy data.westBengal entry is retained as a compatibility

alias because the loader explicitly supports it while the

canonical runtime contract uses the state map below. */


const ACTIVE_STATE_IDS = Object.freeze([ DEFAULT_STATE ]);

const STATE_DATASETS = Object.freeze({ 'IN-WB': Object.freeze({ id: 'IN-WB',

label:
      'West Bengal Government',

    type:
      'STATE',

    stateId:
      'IN-WB',

    root:
      'states/west-bengal',

    paths:
      WEST_BENGAL_DATA_PATHS,

    exams:
      WEST_BENGAL_DATA_PATHS.exams,

    jobs:
      WEST_BENGAL_DATA_PATHS.jobs,

    departments:
      WEST_BENGAL_DATA_PATHS.departments,

    organisations:
      WEST_BENGAL_DATA_PATHS.organisations,

    recruitment:
      WEST_BENGAL_DATA_PATHS.recruitment,

    pay:
      WEST_BENGAL_DATA_PATHS.pay,

    locations:
      WEST_BENGAL_DATA_PATHS.locations,

    housing:
      WEST_BENGAL_DATA_PATHS.housing,

    promotion:
      WEST_BENGAL_DATA_PATHS.promotion,

    benefits:
      WEST_BENGAL_DATA_PATHS.benefits,

    sources:
      WEST_BENGAL_DATA_PATHS.sources,

    serviceCadres:
      WEST_BENGAL_DATA_PATHS.serviceCadres,

    eligibilityRules:
      WEST_BENGAL_DATA_PATHS.eligibilityRules
  })

});

/* ============================================================

GOVERNMENT JURISDICTIONS

============================================================

Both the legacy jurisdiction map and the canonical state map

intentionally point at the same immutable path definitions. */


const GOVERNMENT_DATASETS = Object.freeze({ CENTRAL: Object.freeze({ id: 'CENTRAL',

label:
      'Central Government',

    type:
      'CENTRAL',

    root:
      'central',

    paths:
      CENTRAL_DATA_PATHS,

    exams:
      CENTRAL_DATA_PATHS.exams,

    jobs:
      CENTRAL_DATA_PATHS.jobs,

    departments:
      CENTRAL_DATA_PATHS.departments,

    organisations:
      CENTRAL_DATA_PATHS.organisations,

    recruitment:
      CENTRAL_DATA_PATHS.recruitment,

    pay:
      CENTRAL_DATA_PATHS.pay,

    locations:
      CENTRAL_DATA_PATHS.locations,

    housing:
      CENTRAL_DATA_PATHS.housing,

    promotion:
      CENTRAL_DATA_PATHS.promotion,

    benefits:
      CENTRAL_DATA_PATHS.benefits,

    sources:
      CENTRAL_DATA_PATHS.sources,

    serviceCadres:
      CENTRAL_DATA_PATHS.serviceCadres,

    eligibilityRules:
      CENTRAL_DATA_PATHS.eligibilityRules
  }),

'IN-WB':
  STATE_DATASETS['IN-WB']

});

/* ============================================================

INDEX DATA

============================================================ */


const INDEX_DATA_PATHS = Object.freeze({ jobs: ${DATA_ROOT}/indexes/job-index.json,

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

SCHEMA PATHS

============================================================

Used by validation tooling and documentation.

Browser runtime normally does not fetch schemas directly. */


const SCHEMA_PATHS = Object.freeze({ shared: ${DATA_ROOT}/schemas/shared.schema.json,

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

AI CONFIGURATION

============================================================

PUBLIC FRONTEND CONTRACT ONLY.

The browser sends:

POST /api/chat

Request:

{

messages,

context,

language

}

The server-side endpoint is responsible for secrets,

OpenRouter configuration, system prompts, request validation,

and upstream communication. */


const AI_ENDPOINT = '/api/chat';

const AI_CONFIG = Object.freeze({ enabled: true,

assistantName:
  'Compass AI',

serverAssistantName:
  'CompassAI',

mode:
  'career-research-only',

endpoint:
  AI_ENDPOINT,

method:
  'POST',

contentType:
  'application/json',

timeoutMs:
  30000,

maxConversationMessages:
  20,

maxInputCharacters:
  8000,

maxOutputCharacters:
  12000,

supportedLanguages:
  Object.freeze([
    ...SUPPORTED_LANGUAGES
  ]),

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
  }),

response:
  Object.freeze({
    format:
      'json',

    requiredAnswerField:
      'answer',

    successField:
      'ok'
  })

});

/* ============================================================

SEARCH CONFIGURATION

============================================================

The search module owns tokenization, normalization, indexing,

ranking and candidate resolution. config only supplies public

defaults and searchable field declarations. */


const SEARCH_CONFIG = Object.freeze({ defaultLimit: DEFAULT_SEARCH_LIMIT,

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
    'aliases',
    'historicalNames',
    'keywords',
    'searchText',
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

DATABASE / RUNTIME CONFIGURATION

============================================================

This section contains only runtime configuration contracts.

The registry owns canonical entities.

indexes.js owns derived runtime indexes.

loader.js owns loading.

normalizer.js owns structural normalization.

validators.js owns validation.

No business logic is placed here. */


const DATABASE_CONFIG = Object.freeze({ defaultGovernment: DEFAULT_GOVERNMENT,

defaultState:
  DEFAULT_STATE,

activeStateIds:
  ACTIVE_STATE_IDS,

canonicalEntityCollections:
  Object.freeze([
    'governments',
    'states',
    'qualifications',
    'categories',
    'glossary',
    'scoringRules',
    'statuses',
    'confidenceLevels',
    'sourceTypes',
    'jobs',
    'exams',
    'departments',
    'organisations',
    'recruitment',
    'pay',
    'locations',
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
  ]),

derivedIndexCollections:
  Object.freeze([
    'jobIndex',
    'examIndex',
    'departmentIndex',
    'sourceIndex',
    'searchIndex',
    'serviceCadreIndex',
    'eligibilityRuleIndex',
    'qualificationIndex'
  ]),

indexPaths:
  INDEX_DATA_PATHS

});

/* ============================================================

UI CONFIGURATION

============================================================ */


const UI_CONFIG = Object.freeze({ comparison: Object.freeze({ minimum: 2,

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

STORAGE KEYS

============================================================

These values are logical application keys.

storage.js adds:

<storageNamespace>:

before persisting them, so all application-managed storage

remains inside one namespace. */


const STORAGE_KEYS = Object.freeze({ theme: 'gcc_theme',

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

APPLICATION CONFIG

============================================================ */


const config = Object.freeze({ app: Object.freeze({ name: 'GovCareer Compass',

version:
      APP_VERSION,

    environment:
      'production',

    researchBaseline:
      RESEARCH_BASELINE,

    basePath:
      BASE_PATH,

    storageNamespace:
      STORAGE_NAMESPACE,

    defaultLanguage:
      DEFAULT_LANGUAGE,

    fallbackLanguage:
      FALLBACK_LANGUAGE,

    supportedLanguages:
      Object.freeze([
        ...SUPPORTED_LANGUAGES
      ]),

    languages:
      LANGUAGE_METADATA,

    languageMeta:
      LANGUAGE_METADATA,

    languageMetadata:
      LANGUAGE_METADATA,

    languageDirections:
      Object.freeze({
        en:
          'ltr',

        bn:
          'ltr'
      }),

    defaultTheme:
      DEFAULT_THEME,

    supportedThemes:
      Object.freeze([
        ...SUPPORTED_THEMES
      ]),

    defaultGovernment:
      DEFAULT_GOVERNMENT,

    defaultState:
      DEFAULT_STATE
  }),

routes:
  ROUTES,

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

    central:
      CENTRAL_DATA_PATHS,

    westBengal:
      WEST_BENGAL_DATA_PATHS,

    states:
      STATE_DATASETS,

    activeStateIds:
      ACTIVE_STATE_IDS,

    indexes:
      INDEX_DATA_PATHS,

    schemas:
      SCHEMA_PATHS
  }),

activeStateIds:
  ACTIVE_STATE_IDS,

ai:
  AI_CONFIG,

database:
  DATABASE_CONFIG,

search:
  SEARCH_CONFIG,

ui:
  UI_CONFIG,

storage:
  STORAGE_KEYS

});

/* ============================================================

ROUTE HELPERS

============================================================

These helpers are intentionally small configuration adapters.

They do not implement routing behavior; router.js remains the

owner of navigation. */


function normalizeBasePath( value ) { return String( value ?? '' ) .trim() .replace( //+/g, '/' ) .replace( /^/+/, '' ) .replace( //+$/g, ''); }

function withBasePath( routeOrPath ) { const value = String( routeOrPath ?? '' ) .trim() .replace( /^/+/, '' );

if (!value) { return ( normalizeBasePath( BASE_PATH ) ? /${normalizeBasePath(BASE_PATH)}/ : '' ); }

const base = normalizeBasePath( BASE_PATH );

if (!base) { return value; }

if ( value === base ) { return /${base}; }

if ( value.startsWith( ${base}/ ) ) { return /${value}; }

return /${base}/${value}; }

function getRoute( routeName ) { const key = String( routeName ?? '' ).trim();

const route = ROUTES[ key ];

if ( typeof route !== 'string' ) { return null; }

return withBasePath( route ); }

/* ============================================================

GOVERNMENT / STATE DATASET HELPERS

============================================================ */


function getGovernmentDataset( governmentId ) { return ( GOVERNMENT_DATASETS[ governmentId ] || null ); }

function getStateDataset( stateId ) { if ( !stateId ) { return null; }

return ( STATE_DATASETS[ stateId ] || null ); }

/* ============================================================

PUBLIC EXPORTS

============================================================ */


export { APP_VERSION, RESEARCH_BASELINE,

DEFAULT_LANGUAGE, FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES,

DEFAULT_THEME, SUPPORTED_THEMES,

DEFAULT_STATE, DEFAULT_GOVERNMENT,

MAX_COMPARISON_ITEMS, DEFAULT_SEARCH_LIMIT, DEFAULT_PAGE_SIZE,

BASE_PATH, STORAGE_NAMESPACE,

LANGUAGE_METADATA, ROUTES,

DATA_ROOT,

COMMON_DATA_PATHS, ASSESSMENT_DATA_PATHS, I18N_DATA_PATHS, CENTRAL_DATA_PATHS, WEST_BENGAL_DATA_PATHS, INDEX_DATA_PATHS, SCHEMA_PATHS,

ACTIVE_STATE_IDS, STATE_DATASETS, GOVERNMENT_DATASETS,

AI_CONFIG, DATABASE_CONFIG, SEARCH_CONFIG, UI_CONFIG, STORAGE_KEYS,

getRoute, withBasePath,

getGovernmentDataset, getStateDataset };

export default config;
