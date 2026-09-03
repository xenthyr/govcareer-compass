/**
 * GovCareer Compass — Compass AI Assistant
 * ============================================================
 *
 * File:
 * /js/components/ai-assistant.js
 *
 * Purpose
 * -------
 * Canonical global, responsive Compass AI interface used from the
 * shared site shell.
 *
 * Architectural boundary
 * ----------------------
 * This component owns:
 * - open/close state
 * - floating desktop/tablet panel
 * - mobile bottom-sheet behavior
 * - conversation presentation
 * - input handling
 * - mode selection UI
 * - bounded local session history
 * - copy actions
 * - source display when supplied by the canonical pipeline
 * - confidence display when supplied by the canonical pipeline
 * - warning rendering when supplied by the canonical pipeline
 * - accessibility/focus behavior
 * - orchestration of the existing AI client/context contracts
 *
 * This component does NOT own:
 * - eligibility decisions
 * - career scoring
 * - ranking
 * - canonical career facts
 * - authoritative salary data
 * - recommendation logic
 * - AI prompt policy
 * - backend secrets
 * - the /api/chat implementation
 * - a second storage namespace
 *
 * Canonical intelligence pipeline
 * -------------------------------
 *
 * ai-assistant.js
 *      ↓
 * intent-router.js
 *      ↓
 * context-builder.js
 *      ↓
 * safety.js
 *      ↓
 * client.js
 *      ↓
 * /api/chat
 *      ↓
 * server-side configuration / prompt policy
 *      ↓
 * OpenRouter
 *      ↓
 * response-parser.js
 *      ↓
 * ai-assistant.js
 *      ↓
 * UI
 *
 * Contract notes
 * -------------
 * The current live AI modules use the following public APIs:
 *
 * intent-router.js
 *   window.GovCareerCompassAIIntentRouter.route(...)
 *
 * context-builder.js
 *   buildCompassContext(...)
 *
 * client.js
 *   askCompassAI(...)
 *
 * response-parser.js
 *   parseCompassResponse(...)
 *
 * safety.js
 *   isIdentityQuestion(...)
 *   getIdentityResponse(...)
 *   normalizeLanguage(...)
 *
 * storage.js
 *   getItem(...)
 *   setItem(...)
 *   removeItem(...)
 *
 * There is intentionally no guessed multi-name AI adapter layer.
 *
 * Required integration hooks
 * --------------------------
 * Header:
 * [data-ai-trigger]
 * [data-header-ai-trigger]
 * [data-compass-ai-trigger]
 * #compassAiTrigger
 *
 * AI:
 * [data-ai-panel]
 * [data-ai-input]
 * [data-ai-send]
 * [data-ai-mode]
 *
 * Optional page context:
 * [data-ai-page-context]
 *
 * Events:
 * gcc:languagechange
 * gcc:ai:open
 * gcc:ai:close
 * gcc:ai:statechange
 *
 * Lifecycle integration
 * ---------------------
 * The component exposes initializeCompassAI() so the canonical app
 * bootstrap can initialize the global assistant explicitly.
 *
 * The existing auto-mount behavior is retained for compatibility with
 * direct imports and pages that load the component independently.
 */

import * as ContextBuilder
  from '../ai/context-builder.js';

import * as AIClient
  from '../ai/client.js';

import * as ResponseParser
  from '../ai/response-parser.js';

import * as Safety
  from '../ai/safety.js';

import {
  translate,
  getCurrentLanguage
} from '../language.js';

import {
  getItem,
  setItem,
  removeItem
} from '../storage.js';

import config from '../config.js';


/* ============================================================
 * CONFIGURATION-DERIVED PUBLIC IDENTITY
 * ============================================================ */

/*
 * Product and assistant identity are public configuration values.
 *
 * The client must never contain server secrets.
 *
 * The optional nested identity object allows the public configuration
 * contract to provide owner metadata when that metadata is explicitly
 * exposed for public UI use.
 *
 * The server-side configuration remains the authoritative source for
 * server-side identity and prompt behavior.
 */
const PUBLIC_IDENTITY =
  Object.freeze({
    productName:
      String(
        config?.ai?.identity?.productName ||
        config?.app?.name ||
        'GovCareer Compass'
      ).trim(),

    assistantName:
      String(
        config?.ai?.identity?.assistantName ||
        config?.ai?.assistantName ||
        'Compass AI'
      ).trim(),

    ownerPublicName:
      String(
        config?.ai?.identity?.ownerPublicName ||
        ''
      ).trim(),

    ownerPublicRole:
      String(
        config?.ai?.identity?.ownerPublicRole ||
        ''
      ).trim()
  });


const APP_NAME =
  PUBLIC_IDENTITY.productName;

const AI_NAME =
  PUBLIC_IDENTITY.assistantName;


/* ============================================================
 * CONSTANTS
 * ============================================================ */

const STORAGE =
  Object.freeze({
    history:
      config?.storage?.aiConversation ||
      'gcc_ai_conversation',

    mode:
      'gcc.compass-ai.mode'
  });


const LIMITS =
  Object.freeze({
    maxInputLength:
      Number.isInteger(
        config?.ai?.maxInputCharacters
      ) &&
      config.ai.maxInputCharacters > 0
        ? Math.min(
            config.ai.maxInputCharacters,
            8000
          )
        : 4000,

    maxHistoryItems:
      Number.isInteger(
        config?.ai?.maxConversationMessages
      ) &&
      config.ai.maxConversationMessages > 0
        ? Math.min(
            config.ai.maxConversationMessages,
            20
          )
        : 20,

    maxStoredMessages:
      40,

    maxVisibleSources:
      6,

    maxRelatedItems:
      6
  });


const MODES =
  Object.freeze([
    Object.freeze({
      id:
        'auto',

      translationKey:
        'ai.modes.auto',

      fallbackKey:
        'Auto'
    }),

    Object.freeze({
      id:
        'career',

      translationKey:
        'ai.modes.career',

      fallbackKey:
        'Career'
    }),

    Object.freeze({
      id:
        'eligibility',

      translationKey:
        'ai.modes.eligibility',

      fallbackKey:
        'Eligibility'
    }),

    Object.freeze({
      id:
        'exams',

      translationKey:
        'ai.modes.exams',

      fallbackKey:
        'Exams'
    }),

    Object.freeze({
      id:
        'jobs',

      translationKey:
        'ai.modes.jobs',

      fallbackKey:
        'Jobs'
    }),

    Object.freeze({
      id:
        'salary',

      translationKey:
        'ai.modes.salary',

      fallbackKey:
        'Salary'
    }),

    Object.freeze({
      id:
        'compare',

      translationKey:
        'ai.modes.compare',

      fallbackKey:
        'Compare'
    })
  ]);


/* ============================================================
 * TRANSLATION
 * ============================================================ */

function t(
  key,
  variables = {},
  fallback = ''
) {
  return translate(
    key,
    variables,
    fallback
  );
}


function currentLocale() {
  const language =
    getCurrentLanguage() ||
    'en';

  return normalizeLocale(
    language
  );
}


function normalizeLocale(
  language
) {
  try {
    const normalized =
      Safety.normalizeLanguage(
        language
      );

    if (
      typeof normalized ===
        'string' &&
      normalized.trim()
    ) {
      return normalized
        .toLowerCase()
        .startsWith('bn')
        ? 'bn'
        : 'en';
    }
  } catch {
    /*
     * Fall through to deterministic locale handling.
     */
  }

  return String(
    language || 'en'
  )
    .toLowerCase()
    .startsWith('bn')
    ? 'bn'
    : 'en';
}


/* ============================================================
 * STORAGE
 * ============================================================ */

/*
 * Storage ownership is intentionally delegated to js/storage.js.
 *
 * This component does not:
 * - construct a second application namespace;
 * - directly manage localStorage keys;
 * - duplicate serialization/deserialization;
 * - maintain a separate memory fallback.
 *
 * storage.js already:
 * - applies the canonical application namespace;
 * - serializes values;
 * - deserializes values;
 * - provides a memory fallback when browser storage is unavailable.
 */

function loadHistory() {
  const value =
    getItem(
      STORAGE.history,
      []
    );

  return normalizeHistory(
    value
  );
}


function saveHistory(
  history
) {
  setItem(
    STORAGE.history,
    normalizeHistory(
      history
    )
  );
}


function clearStoredHistory() {
  removeItem(
    STORAGE.history
  );
}


/* ============================================================
 * HTML / DISPLAY SAFETY
 * ============================================================ */

function escapeHTML(
  value
) {
  return String(
    value ?? ''
  )
    .replace(
      /&/g,
      '&amp;'
    )
    .replace(
      /</g,
      '&lt;'
    )
    .replace(
      />/g,
      '&gt;'
    )
    .replace(
      /"/g,
      '&quot;'
    )
    .replace(
      /'/g,
      '&#039;'
    );
}


function escapeAttribute(
  value
) {
  return escapeHTML(
    value
  );
}


function truncateText(
  text,
  max = 600
) {
  const value =
    String(
      text ?? ''
    );

  return value.length >
    max
    ? `${value.slice(
        0,
        max - 1
      )}…`
    : value;
}


function safeArray(
  value
) {
  return Array.isArray(
    value
  )
    ? value
    : [];
}


function isSafeUrl(
  value
) {
  if (
    typeof value !==
      'string'
  ) {
    return false;
  }

  const trimmed =
    value.trim();

  if (
    !trimmed
  ) {
    return false;
  }

  if (
    trimmed.startsWith('/')
  ) {
    return true;
  }

  try {
    const url =
      new URL(
        trimmed,
        globalThis.location?.href ||
          'http://localhost/'
      );

    return (
      url.protocol ===
        'http:' ||
      url.protocol ===
        'https:'
    );
  } catch {
    return false;
  }
}


/* ============================================================
 * MODE HELPERS
 * ============================================================ */

function getMode(
  modeId
) {
  return (
    MODES.find(
      mode =>
        mode.id ===
        modeId
    ) ||
    MODES[0]
  );
}


function isValidMode(
  modeId
) {
  return MODES.some(
    mode =>
      mode.id ===
      modeId
  );
}


function getModeLabel(
  modeId
) {
  const mode =
    getMode(
      modeId
    );

  return t(
    mode.translationKey,
    {},
    mode.fallbackKey
  );
}


/* ============================================================
 * DETERMINISTIC PLATFORM IDENTITY
 * ============================================================ */

/*
 * Identity answers are handled locally only when their required public
 * metadata is available through the configuration contract.
 *
 * This keeps identity responses deterministic without embedding private
 * server configuration in browser JavaScript.
 *
 * Generic assistant identity can always be answered from the public
 * product/assistant configuration.
 *
 * Owner-specific responses require the optional public owner metadata.
 * When those values are not present in public config, the request is not
 * fabricated locally and may continue through the normal server path.
 */

function createAssistantIdentityAnswer(
  locale
) {
  if (
    locale ===
    'bn'
  ) {
    return `আমি ${AI_NAME}, ${APP_NAME}-এর AI assistant।`;
  }

  return `I’m ${AI_NAME}, the AI assistant for ${APP_NAME}.`;
}


function createOwnerIdentityAnswer(
  locale
) {
  const ownerName =
    PUBLIC_IDENTITY.ownerPublicName;

  const ownerRole =
    PUBLIC_IDENTITY.ownerPublicRole;

  if (
    !ownerName ||
    !ownerRole
  ) {
    return null;
  }

  if (
    locale ===
    'bn'
  ) {
    return `${ownerName} ${ownerRole}-এর সঙ্গে ${APP_NAME}-এর মালিক হিসেবে পরিচিত।`;
  }

  return `${ownerName} is ${ownerRole}.`;
}


function getLocalIdentityAnswer(
  question
) {
  const locale =
    currentLocale();

  const text =
    String(
      question || ''
    )
      .trim()
      .toLowerCase();

  const ownerPatterns =
    [
      'who made you',
      'who created you',
      'who built you',
      'who developed you',
      'who is your creator',
      'who is your owner',
      'who owns you',
      'who made compass ai',
      'who created compass ai',
      'who built compass ai',
      'who developed compass ai',

      'কে তোমাকে বানিয়েছে',
      'কে তোমাকে তৈরি করেছে',
      'কে তোমাকে বানিয়েছে',
      'তোমাকে কে বানিয়েছে',
      'তোমাকে কে তৈরি করেছে',
      'তোমার নির্মাতা কে',
      'তোমার মালিক কে',
      'কম্পাস এআই কে বানিয়েছে',
      'কম্পাস এআই কে তৈরি করেছে',
      'কম্পাস AI কে বানিয়েছে',
      'কম্পাস AI কে তৈরি করেছে'
    ];

  const aboutOwnerPatterns =
    [
      'who is abhijit dutta',
      'about abhijit dutta',
      'abhijit dutta কে',
      'অভিজিৎ দত্ত কে',
      'অভিজিত দত্ত কে'
    ];

  if (
    ownerPatterns.some(
      pattern =>
        text.includes(
          pattern
        )
    )
  ) {
    const answer =
      createOwnerIdentityAnswer(
        locale
      );

    if (
      answer
    ) {
      return {
        answer,

        intent:
          'platform_identity',

        confidence:
          'high',

        local:
          true
      };
    }

    /*
     * Owner metadata is intentionally not invented on the client.
     * Allow the normal server-side identity policy to answer if the
     * public configuration does not expose owner metadata.
     */
    return null;
  }

  if (
    aboutOwnerPatterns.some(
      pattern =>
        text.includes(
          pattern
        )
    )
  ) {
    const answer =
      createOwnerIdentityAnswer(
        locale
      );

    if (
      answer
    ) {
      return {
        answer,

        intent:
          'platform_identity',

        confidence:
          'high',

        local:
          true
      };
    }

    return null;
  }

  let safetyIdentity =
    false;

  try {
    safetyIdentity =
      Safety.isIdentityQuestion(
        text
      );
  } catch {
    safetyIdentity =
      false;
  }

  if (
    safetyIdentity
  ) {
    return {
      answer:
        createAssistantIdentityAnswer(
          locale
        ),

      intent:
        'platform_identity',

      confidence:
        'high',

      local:
        true
    };
  }

  return null;
}


/* ============================================================
 * HISTORY
 * ============================================================ */

function normalizeHistory(
  rawHistory
) {
  if (
    !Array.isArray(
      rawHistory
    )
  ) {
    return [];
  }

  return rawHistory
    .filter(
      item =>
        item &&
        (
          item.role ===
            'user' ||
          item.role ===
            'assistant'
        ) &&
        typeof item.content ===
          'string' &&
        item.content.trim()
    )
    .slice(
      -LIMITS.maxStoredMessages
    )
    .map(
      item => ({
        role:
          item.role,

        content:
          truncateText(
            item.content.trim(),
            LIMITS.maxInputLength
          ),

        timestamp:
          typeof item.timestamp ===
            'string'
            ? item.timestamp
            : new Date()
                .toISOString(),

        intent:
          typeof item.intent ===
            'string'
            ? item.intent
            : '',

        confidence:
          typeof item.confidence ===
            'string'
            ? item.confidence
            : ''
      })
    );
}


/* ============================================================
 * PAGE / APPLICATION CONTEXT
 * ============================================================ */

function collectPageContext() {
  const body =
    document.body;

  const context = {
    pathname:
      globalThis.location?.pathname ||
      '',

    title:
      document.title ||
      '',

    language:
      currentLocale(),

    pageId:
      body?.dataset?.page ||
      '',

    pageType:
      body?.dataset?.pageType ||
      '',

    entityId:
      body?.dataset?.entityId ||
      '',

    entityType:
      body?.dataset?.entityType ||
      ''
  };

  const contextElement =
    document.querySelector(
      '[data-ai-page-context]'
    );

  if (
    contextElement
  ) {
    const raw =
      contextElement.getAttribute(
        'data-ai-page-context'
      );

    if (
      raw
    ) {
      try {
        const parsed =
          JSON.parse(
            raw
          );

        if (
          parsed &&
          typeof parsed ===
            'object' &&
          !Array.isArray(
            parsed
          )
        ) {
          context.domContext =
            parsed;
        }
      } catch {
        /*
         * Optional page context must never break the assistant.
         */
      }
    }
  }

  try {
    const app =
      globalThis.GovCareerCompass;

    if (
      app &&
      typeof app.getPageContext ===
        'function'
    ) {
      const supplied =
        app.getPageContext();

      if (
        supplied &&
        typeof supplied ===
          'object'
      ) {
        context.applicationContext =
          supplied;
      }
    }
  } catch {
    /*
     * Optional application integration.
     */
  }

  return context;
}


function collectCandidateContext() {
  try {
    const app =
      globalThis.GovCareerCompass;

    if (
      app &&
      typeof app.getCandidateContext ===
        'function'
    ) {
      const candidate =
        app.getCandidateContext();

      if (
        candidate &&
        typeof candidate ===
          'object'
      ) {
        return candidate;
      }
    }
  } catch {
    /*
     * Candidate context is optional.
     */
  }

  return {};
}


function getStructuredPageValue(
  pageContext,
  key
) {
  const domContext =
    pageContext?.domContext;

  if (
    domContext &&
    typeof domContext ===
      'object' &&
    Object.prototype.hasOwnProperty.call(
      domContext,
      key
    )
  ) {
    return domContext[
      key
    ];
  }

  const applicationContext =
    pageContext?.applicationContext;

  if (
    applicationContext &&
    typeof applicationContext ===
      'object' &&
    Object.prototype.hasOwnProperty.call(
      applicationContext,
      key
    )
  ) {
    return applicationContext[
      key
    ];
  }

  return null;
}


function buildStructuredContextInput({
  candidateContext,
  pageContext,
  routeResult
}) {
  const selectedCareer =
    getStructuredPageValue(
      pageContext,
      'selectedCareer'
    );

  const selectedExam =
    getStructuredPageValue(
      pageContext,
      'selectedExam'
    );

  const comparison =
    getStructuredPageValue(
      pageContext,
      'comparison'
    );

  const eligibility =
    getStructuredPageValue(
      pageContext,
      'eligibility'
    );

  const recommendation =
    getStructuredPageValue(
      pageContext,
      'recommendation'
    );

  const preferences =
    candidateContext?.preferences ||
    candidateContext?.preferenceProfile ||
    getStructuredPageValue(
      pageContext,
      'preferences'
    );

  return {
    candidateProfile:
      candidateContext,

    preferences:
      preferences ||
      null,

    selectedCareer:
      selectedCareer ||
      null,

    selectedExam:
      selectedExam ||
      null,

    comparison:
      Array.isArray(
        comparison
      )
        ? comparison
        : [],

    eligibility:
      eligibility ||
      null,

    recommendation:
      recommendation ||
      null,

    language:
      routeResult?.language ||
      currentLocale()
  };
}


/* ============================================================
 * AI PIPELINE
 * ============================================================ */

function routeIntent({
  message,
  mode,
  language,
  conversation,
  pageContext
}) {
  const router =
    globalThis.GovCareerCompassAIIntentRouter;

  if (
    !router ||
    typeof router.route !==
      'function'
  ) {
    throw createPipelineError(
      'Compass AI intent routing is unavailable.',
      'AI_INTENT_ROUTER_UNAVAILABLE'
    );
  }

  const result =
    router.route({
      message,

      mode,

      locale:
        language,

      conversation,

      pageContext
    });

  if (
    !result ||
    typeof result !==
      'object' ||
    typeof result.intent !==
      'string'
  ) {
    throw createPipelineError(
      'Compass AI returned an invalid routing result.',
      'AI_INVALID_INTENT_RESULT'
    );
  }

  return result;
}


function buildCanonicalContext({
  candidateContext,
  pageContext,
  routeResult
}) {
  if (
    typeof ContextBuilder.buildCompassContext !==
      'function'
  ) {
    throw createPipelineError(
      'Compass AI context builder is unavailable.',
      'AI_CONTEXT_BUILDER_UNAVAILABLE'
    );
  }

  const structured =
    buildStructuredContextInput({
      candidateContext,

      pageContext,

      routeResult
    });

  return ContextBuilder.buildCompassContext(
    structured
  );
}


function normalizeRequestInput(
  message,
  language
) {
  const text =
    String(
      message ?? ''
    )
      .replace(
        /\u0000/g,
        ''
      )
      .trim()
      .slice(
        0,
        LIMITS.maxInputLength
      );

  let normalizedLanguage =
    'en';

  try {
    const normalized =
      Safety.normalizeLanguage(
        language
      );

    normalizedLanguage =
      String(
        normalized || 'en'
      )
        .toLowerCase()
        .startsWith('bn')
        ? 'bn'
        : 'en';
  } catch {
    normalizedLanguage =
      normalizeLocale(
        language
      );
  }

  return {
    message:
      text,

    language:
      normalizedLanguage
  };
}


function callAIClient({
  messages,
  context,
  language,
  signal
}) {
  if (
    typeof AIClient.askCompassAI !==
      'function'
  ) {
    throw createPipelineError(
      'Compass AI client is unavailable.',
      'AI_CLIENT_UNAVAILABLE'
    );
  }

  /*
   * client.js owns the actual network endpoint and HTTP contract.
   *
   * This component deliberately does not construct a second API client.
   */
  return AIClient.askCompassAI({
    messages,

    context,

    language,

    signal
  });
}


function parseAIResponse(
  response
) {
  if (
    typeof ResponseParser.parseCompassResponse !==
      'function'
  ) {
    throw createPipelineError(
      'Compass AI response parser is unavailable.',
      'AI_RESPONSE_PARSER_UNAVAILABLE'
    );
  }

  return ResponseParser.parseCompassResponse(
    response
  );
}


function createPipelineError(
  message,
  code
) {
  const error =
    new Error(
      message
    );

  error.code =
    code;

  return error;
}


/* ============================================================
 * RESPONSE PRESENTATION
 * ============================================================ */

function enrichParsedResponse(
  parsed,
  rawResponse,
  locale
) {
  const raw =
    rawResponse &&
    typeof rawResponse ===
      'object'
      ? rawResponse
      : {};

  const response =
    parsed &&
    typeof parsed ===
      'object'
      ? parsed
      : {};

  return {
    answer:
      String(
        response.answer ||
          ''
      ).trim(),

    assistant:
      response.assistant ||
      AI_NAME,

    provider:
      response.provider ||
      'OpenRouter',

    model:
      response.model ||
      null,

    language:
      response.language ||
      locale,

    scope:
      safeArray(
        response.scope
      ),

    researchBaseline:
      response.researchBaseline ||
      null,

    usage:
      response.usage ||
      null,

    /*
     * These are optional display values.
     *
     * They are only displayed when the actual backend/parser response
     * supplies them. No values are fabricated here.
     */
    intent:
      typeof raw.intent ===
        'string'
        ? raw.intent
        : '',

    confidence:
      typeof raw.confidence ===
        'string'
        ? raw.confidence
        : '',

    sources:
      safeArray(
        raw.sources
      )
        .slice(
          0,
          LIMITS.maxVisibleSources
        )
        .map(
          normalizeSource
        )
        .filter(Boolean),

    relatedItems:
      safeArray(
        raw.relatedItems
      )
        .slice(
          0,
          LIMITS.maxRelatedItems
        )
        .map(
          normalizeRelatedItem
        )
        .filter(Boolean),

    warnings:
      safeArray(
        raw.warnings
      )
        .filter(
          item =>
            typeof item ===
              'string'
        )
        .map(
          item =>
            truncateText(
              item,
              700
            )
        )
        .slice(
          0,
          5
        )
  };
}


function normalizeSource(
  source
) {
  if (
    !source
  ) {
    return null;
  }

  if (
    typeof source ===
      'string'
  ) {
    return {
      id:
        '',

      title:
        truncateText(
          source,
          160
        ),

      url:
        isSafeUrl(
          source
        )
          ? source.trim()
          : ''
    };
  }

  if (
    typeof source !==
      'object'
  ) {
    return null;
  }

  const url =
    isSafeUrl(
      source.url
    )
      ? String(
          source.url
        ).trim()
      : '';

  return {
    id:
      String(
        source.id ??
          ''
      ),

    title:
      truncateText(
        source.title ||
          source.name ||
          source.label ||
          source.description ||
          t(
            'ai.sources.unknown',
            {},
            'Source'
          ),
        160
      ),

    url
  };
}


function normalizeRelatedItem(
  item
) {
  if (
    typeof item ===
      'string'
  ) {
    return {
      id:
        '',

      title:
        truncateText(
          item,
          160
        ),

      description:
        '',

      url:
        ''
    };
  }

  if (
    !item ||
    typeof item !==
      'object'
  ) {
    return null;
  }

  return {
    id:
      String(
        item.id ??
          item.entityId ??
          ''
      ),

    title:
      truncateText(
        item.title ||
          item.name ||
          item.label ||
          t(
            'ai.related.unknown',
            {},
            'Related item'
          ),
        160
      ),

    description:
      truncateText(
        item.description ||
          item.reason ||
          '',
        500
      ),

    url:
      isSafeUrl(
        item.url
      )
        ? String(
            item.url
          ).trim()
        : ''
  };
}


/* ============================================================
 * OUTPUT FORMATTING
 * ============================================================ */

function formatResponseText(
  text
) {
  /*
   * Model output is untrusted text.
   *
   * It is HTML-escaped before display. No model-generated HTML is
   * executed.
   */
  return escapeHTML(
    String(
      text ?? ''
    )
  ).replace(
    /\n/g,
    '<br>'
  );
}


/* ============================================================
 * STYLES
 * ============================================================ */

function injectStyles() {
  if (
    document.querySelector(
      '[data-gcc-compass-ai-style]'
    )
  ) {
    return;
  }

  const style =
    document.createElement(
      'style'
    );

  style.setAttribute(
    'data-gcc-compass-ai-style',
    'true'
  );

  style.textContent = `
    .gcc-ai {
      --gcc-ai-z: 1000;
      position: fixed;
      inset: 0;
      z-index: var(--gcc-ai-z);
      pointer-events: none;
      font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    .gcc-ai[hidden] {
      display: none;
    }

    .gcc-ai__backdrop {
      position: absolute;
      inset: 0;
      background: rgba(3, 10, 20, .38);
      opacity: 0;
      transition:
        opacity .2s ease;
      pointer-events: none;
      backdrop-filter: blur(0);
      -webkit-backdrop-filter: blur(0);
    }

    .gcc-ai.is-open .gcc-ai__backdrop {
      opacity: 1;
      pointer-events: auto;
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    }

    .gcc-ai__panel {
      position: absolute;
      top: max(76px, env(safe-area-inset-top));
      right: clamp(12px, 2vw, 28px);
      width: min(480px, calc(100vw - 24px));
      height: min(760px, calc(100dvh - 92px));
      display: grid;
      grid-template-rows:
        auto
        auto
        1fr
        auto
        auto;
      overflow: hidden;
      pointer-events: auto;
      border:
        1px solid
        var(--line, rgba(159,190,225,.18));
      border-radius: 24px;
      background:
        linear-gradient(
          155deg,
          rgba(255,255,255,.10),
          rgba(255,255,255,.035)
        ),
        var(--panel, rgba(18,32,54,.90));
      color:
        var(--text, #edf5ff);
      box-shadow:
        0 30px 90px rgba(0,0,0,.34),
        0 0 0 1px rgba(18,183,211,.04) inset;
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      transform:
        translateY(16px)
        scale(.985);
      opacity: 0;
      visibility: hidden;
      transition:
        opacity .2s ease,
        transform .2s ease,
        visibility .2s ease;
    }

    .gcc-ai.is-open .gcc-ai__panel {
      transform:
        translateY(0)
        scale(1);
      opacity: 1;
      visibility: visible;
    }

    .gcc-ai__header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 16px 13px;
      border-bottom:
        1px solid
        var(--line, rgba(159,190,225,.14));
      background:
        radial-gradient(
          circle at 12% 0%,
          rgba(18,183,211,.13),
          transparent 42%
        ),
        radial-gradient(
          circle at 100% 0%,
          rgba(94,104,229,.12),
          transparent 40%
        );
    }

    .gcc-ai__brand {
      min-width: 0;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 11px;
    }

    .gcc-ai__brand-mark {
      flex: 0 0 auto;
      width: 38px;
      height: 38px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      background:
        linear-gradient(
          135deg,
          #12B7D3,
          #5E68E5
        );
      color: #07111f;
      box-shadow:
        0 8px 24px
        rgba(18,183,211,.18);
    }

    .gcc-ai__brand-mark svg {
      width: 21px;
      height: 21px;
      stroke: currentColor;
    }

    .gcc-ai__title {
      min-width: 0;
    }

    .gcc-ai__title strong {
      display: block;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: -.015em;
    }

    .gcc-ai__subtitle {
      display: block;
      margin-top: 2px;
      color:
        var(--muted, #9db0c8);
      font-size: 11px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gcc-ai__status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 4px;
      color:
        var(--muted, #9db0c8);
      font-size: 10px;
    }

    .gcc-ai__status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10A875;
      box-shadow:
        0 0 0 4px
        rgba(16,168,117,.10);
    }

    .gcc-ai__status-dot.is-error {
      background: #DA4A5C;
      box-shadow:
        0 0 0 4px
        rgba(218,74,92,.10);
    }

    .gcc-ai__header-actions {
      display: flex;
      gap: 5px;
      flex: 0 0 auto;
    }

    .gcc-ai__icon-button {
      width: 34px;
      height: 34px;
      padding: 0;
      display: inline-grid;
      place-items: center;
      border:
        1px solid
        var(--line, rgba(159,190,225,.15));
      border-radius: 10px;
      background:
        rgba(255,255,255,.025);
      color:
        var(--text, #edf5ff);
      cursor: pointer;
    }

    .gcc-ai__icon-button:hover {
      background:
        rgba(18,183,211,.08);
      border-color:
        rgba(18,183,211,.22);
    }

    .gcc-ai__icon-button svg {
      width: 16px;
      height: 16px;
    }

    .gcc-ai__modebar {
      display: flex;
      gap: 7px;
      padding: 11px 13px;
      overflow-x: auto;
      scrollbar-width: thin;
      border-bottom:
        1px solid
        var(--line, rgba(159,190,225,.10));
    }

    .gcc-ai__mode {
      flex: 0 0 auto;
      min-height: 32px;
      border:
        1px solid
        var(--line, rgba(159,190,225,.15));
      border-radius: 999px;
      padding: 6px 11px;
      color:
        var(--muted, #9db0c8);
      background:
        rgba(255,255,255,.018);
      cursor: pointer;
      font: inherit;
      font-size: 11px;
      font-weight: 700;
    }

    .gcc-ai__mode:hover {
      border-color:
        rgba(18,183,211,.26);
      color:
        var(--text, #edf5ff);
    }

    .gcc-ai__mode.is-active {
      color: #07111f;
      border-color: transparent;
      background:
        linear-gradient(
          135deg,
          #12B7D3,
          #5E68E5
        );
      box-shadow:
        0 6px 18px
        rgba(18,183,211,.14);
    }

    .gcc-ai__conversation {
      min-height: 0;
      overflow-y: auto;
      padding: 16px 14px 18px;
      scroll-behavior: smooth;
      overscroll-behavior: contain;
    }

    .gcc-ai__welcome {
      padding: 8px 4px 16px;
    }

    .gcc-ai__welcome-heading {
      margin: 0 0 6px;
      font-size: 20px;
      line-height: 1.2;
      letter-spacing: -.025em;
    }

    .gcc-ai__welcome-text {
      margin: 0;
      color:
        var(--muted, #9db0c8);
      font-size: 12px;
      line-height: 1.65;
    }

    .gcc-ai__suggestions {
      display: grid;
      gap: 8px;
      margin-top: 14px;
    }

    .gcc-ai__suggestion {
      width: 100%;
      text-align: left;
      padding: 10px 12px;
      border:
        1px solid
        var(--line, rgba(159,190,225,.13));
      border-radius: 13px;
      background:
        rgba(255,255,255,.018);
      color:
        var(--text, #edf5ff);
      font: inherit;
      font-size: 11px;
      line-height: 1.45;
      cursor: pointer;
    }

    .gcc-ai__suggestion:hover {
      border-color:
        rgba(18,183,211,.23);
      background:
        rgba(18,183,211,.05);
    }

    .gcc-ai__message {
      display: flex;
      gap: 9px;
      margin: 0 0 14px;
      animation:
        gcc-ai-in .16s ease;
    }

    @keyframes gcc-ai-in {
      from {
        opacity: 0;
        transform:
          translateY(5px);
      }

      to {
        opacity: 1;
        transform:
          translateY(0);
      }
    }

    .gcc-ai__message.is-user {
      justify-content: flex-end;
    }

    .gcc-ai__bubble {
      max-width: 88%;
      padding: 11px 12px;
      border:
        1px solid
        var(--line, rgba(159,190,225,.13));
      border-radius: 15px;
      font-size: 12px;
      line-height: 1.65;
      overflow-wrap: anywhere;
    }

    .gcc-ai__message.is-assistant
      .gcc-ai__bubble {
      background:
        rgba(255,255,255,.035);
      border-top-left-radius: 6px;
    }

    .gcc-ai__message.is-user
      .gcc-ai__bubble {
      color: #07111f;
      background:
        linear-gradient(
          135deg,
          #12B7D3,
          #79E2F2
        );
      border-color: transparent;
      border-top-right-radius: 6px;
    }

    .gcc-ai__meta {
      margin: 0 0 5px;
      color:
        var(--muted, #9db0c8);
      font-size: 9px;
      font-weight: 700;
      letter-spacing: .045em;
      text-transform: uppercase;
    }

    .gcc-ai__message.is-user
      .gcc-ai__meta {
      color:
        rgba(7,17,31,.64);
    }

    .gcc-ai__typing {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 2px 1px;
    }

    .gcc-ai__typing span {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: currentColor;
      opacity: .45;
      animation:
        gcc-ai-dot 1.1s
        infinite
        ease-in-out;
    }

    .gcc-ai__typing span:nth-child(2) {
      animation-delay: .13s;
    }

    .gcc-ai__typing span:nth-child(3) {
      animation-delay: .26s;
    }

    @keyframes gcc-ai-dot {
      0%, 60%, 100% {
        transform:
          translateY(0);
        opacity: .3;
      }

      30% {
        transform:
          translateY(-3px);
        opacity: .9;
      }
    }

    .gcc-ai__result-block {
      margin-top: 12px;
      padding-top: 10px;
      border-top:
        1px solid
        var(--line, rgba(159,190,225,.10));
    }

    .gcc-ai__result-label {
      margin: 0 0 7px;
      color:
        var(--muted, #9db0c8);
      font-size: 9px;
      font-weight: 800;
      letter-spacing: .08em;
      text-transform: uppercase;
    }

    .gcc-ai__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .gcc-ai__chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 27px;
      padding: 5px 8px;
      border:
        1px solid
        var(--line, rgba(159,190,225,.13));
      border-radius: 999px;
      color:
        var(--muted, #9db0c8);
      background:
        rgba(255,255,255,.018);
      font-size: 9px;
    }

    .gcc-ai__source-list,
    .gcc-ai__related-list {
      display: grid;
      gap: 7px;
    }

    .gcc-ai__source,
    .gcc-ai__related {
      display: block;
      padding: 8px 9px;
      border:
        1px solid
        var(--line, rgba(159,190,225,.12));
      border-radius: 10px;
      color: inherit;
      text-decoration: none;
      background:
        rgba(255,255,255,.015);
    }

    .gcc-ai__source:hover,
    .gcc-ai__related:hover {
      border-color:
        rgba(18,183,211,.22);
      background:
        rgba(18,183,211,.04);
    }

    .gcc-ai__source-title,
    .gcc-ai__related-title {
      display: block;
      font-size: 10px;
      font-weight: 750;
    }

    .gcc-ai__source-url {
      display: block;
      margin-top: 3px;
      color:
        var(--muted, #9db0c8);
      font-size: 9px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .gcc-ai__warning {
      margin-top: 9px;
      padding: 9px 10px;
      border:
        1px solid
        rgba(215,151,24,.22);
      border-radius: 11px;
      color:
        var(--muted, #9db0c8);
      background:
        rgba(215,151,24,.055);
      font-size: 10px;
      line-height: 1.5;
    }

    .gcc-ai__message-actions {
      display: flex;
      gap: 5px;
      margin-top: 7px;
    }

    .gcc-ai__small-button {
      border: 0;
      padding: 0;
      background: transparent;
      color:
        var(--muted, #9db0c8);
      cursor: pointer;
      font: inherit;
      font-size: 9px;
    }

    .gcc-ai__small-button:hover {
      color:
        var(--text, #edf5ff);
    }

    .gcc-ai__composer {
      padding: 10px 12px 12px;
      border-top:
        1px solid
        var(--line, rgba(159,190,225,.11));
      background:
        rgba(0,0,0,.06);
    }

    .gcc-ai__composer-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 7px;
    }

    .gcc-ai__composer-mode {
      color:
        var(--muted, #9db0c8);
      font-size: 9px;
      font-weight: 700;
    }

    .gcc-ai__char-count {
      color:
        var(--muted, #9db0c8);
      font-size: 9px;
    }

    .gcc-ai__input-wrap {
      display: grid;
      grid-template-columns:
        1fr
        auto;
      gap: 8px;
      align-items: end;
      padding: 8px;
      border:
        1px solid
        var(--line, rgba(159,190,225,.16));
      border-radius: 15px;
      background:
        rgba(255,255,255,.025);
      transition:
        border-color .15s ease,
        box-shadow .15s ease;
    }

    .gcc-ai__input-wrap:focus-within {
      border-color:
        rgba(18,183,211,.34);
      box-shadow:
        0 0 0 3px
        rgba(18,183,211,.07);
    }

    .gcc-ai__textarea {
      width: 100%;
      min-height: 40px;
      max-height: 130px;
      resize: none;
      border: 0;
      outline: 0;
      padding: 5px 6px;
      background: transparent;
      color:
        var(--text, #edf5ff);
      font: inherit;
      font-size: 12px;
      line-height: 1.5;
    }

    .gcc-ai__textarea::placeholder {
      color:
        var(--muted, #9db0c8);
      opacity: .8;
    }

    .gcc-ai__send {
      width: 40px;
      height: 40px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 11px;
      background:
        linear-gradient(
          135deg,
          #12B7D3,
          #5E68E5
        );
      color: #07111f;
      cursor: pointer;
      box-shadow:
        0 7px 20px
        rgba(18,183,211,.17);
    }

    .gcc-ai__send:disabled {
      cursor:
        not-allowed;
      opacity: .45;
      box-shadow:
        none;
    }

    .gcc-ai__send svg {
      width: 17px;
      height: 17px;
    }

    .gcc-ai__footnote {
      margin: 8px 2px 0;
      color:
        var(--muted, #9db0c8);
      font-size: 8px;
      line-height: 1.4;
      text-align: center;
    }

    .gcc-ai__confirm {
      position: absolute;
      left: 50%;
      top: 50%;
      width: min(
        320px,
        calc(100vw - 34px)
      );
      transform:
        translate(-50%, -46%);
      padding: 18px;
      border:
        1px solid
        var(--line, rgba(159,190,225,.18));
      border-radius: 18px;
      background:
        var(--panel, rgba(18,32,54,.96));
      box-shadow:
        0 30px 80px
        rgba(0,0,0,.34);
      opacity: 0;
      visibility: hidden;
      transition:
        opacity .18s ease,
        transform .18s ease,
        visibility .18s ease;
      pointer-events: none;
    }

    .gcc-ai.has-confirm
      .gcc-ai__confirm {
      opacity: 1;
      visibility: visible;
      transform:
        translate(-50%, -50%);
      pointer-events: auto;
    }

    .gcc-ai__confirm-title {
      margin: 0 0 8px;
      font-size: 15px;
      font-weight: 800;
    }

    .gcc-ai__confirm-text {
      margin: 0;
      color:
        var(--muted, #9db0c8);
      font-size: 11px;
      line-height: 1.55;
    }

    .gcc-ai__confirm-actions {
      display: flex;
      justify-content: flex-end;
      gap: 7px;
      margin-top: 14px;
    }

    .gcc-ai__confirm-button {
      min-height: 34px;
      padding: 7px 11px;
      border-radius: 10px;
      border:
        1px solid
        var(--line, rgba(159,190,225,.15));
      background:
        rgba(255,255,255,.025);
      color:
        var(--text, #edf5ff);
      cursor: pointer;
      font: inherit;
      font-size: 10px;
      font-weight: 700;
    }

    .gcc-ai__confirm-button.is-primary {
      color: #fff;
      border-color: transparent;
      background: #DA4A5C;
    }

    .gcc-ai__error {
      padding: 11px 12px;
      border:
        1px solid
        rgba(218,74,92,.22);
      border-radius: 13px;
      background:
        rgba(218,74,92,.05);
      color:
        var(--muted, #9db0c8);
      font-size: 11px;
      line-height: 1.55;
    }

    @media (max-width: 760px) {
      .gcc-ai__backdrop {
        background:
          rgba(3,10,20,.52);
      }

      .gcc-ai__panel {
        top: auto;
        right: 0;
        bottom: 0;
        width: 100%;
        height:
          min(94dvh, 900px);
        max-height: 100dvh;
        border-radius:
          24px 24px 0 0;
        border-bottom: 0;
        transform:
          translateY(28px);
      }

      .gcc-ai__header {
        padding-top:
          max(
            13px,
            env(safe-area-inset-top)
          );
      }

      .gcc-ai__conversation {
        padding-bottom: 14px;
      }

      .gcc-ai__bubble {
        max-width: 91%;
      }

      .gcc-ai__composer {
        padding-bottom:
          max(
            12px,
            env(safe-area-inset-bottom)
          );
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .gcc-ai__panel,
      .gcc-ai__backdrop,
      .gcc-ai__confirm,
      .gcc-ai__message {
        animation: none !important;
        transition: none !important;
      }

      .gcc-ai__conversation {
        scroll-behavior: auto;
      }
    }
  `;

  document.head.appendChild(
    style
  );
}


/* ============================================================
 * MAIN ASSISTANT
 * ============================================================ */

class CompassAIAssistant {
  constructor(
    options = {}
  ) {
    this.options = {
      triggerSelector:
        options.triggerSelector ||
        '[data-ai-trigger], [data-header-ai-trigger], [data-compass-ai-trigger], #compassAiTrigger',

      mountTarget:
        options.mountTarget ||
        document.body,

      persistHistory:
        typeof options.persistHistory ===
          'boolean'
          ? options.persistHistory
          : true,

      autoMount:
        typeof options.autoMount ===
          'boolean'
          ? options.autoMount
          : true
    };

    this.locale =
      currentLocale();

    const storedMode =
      getItem(
        STORAGE.mode,
        'auto'
      );

    this.mode =
      isValidMode(
        storedMode
      )
        ? storedMode
        : 'auto';

    this.history =
      this.options.persistHistory
        ? loadHistory()
        : [];

    this.abortController =
      null;

    this.openState =
      false;

    this.isBusy =
      false;

    this.dom =
      {};

    this.boundTriggers =
      new WeakSet();

    this.lastFocusedElement =
      null;

    this.initialized =
      false;

    this.globalEventsBound =
      false;

    this.destroyed =
      false;

    this.boundResizeHandler =
      null;

    this.boundEscapeHandler =
      null;

    this.boundLanguageHandler =
      null;

    this.boundAIEventHandler =
      null;

    if (
      this.options.autoMount
    ) {
      this.init();
    }
  }


  /* ==========================================================
   * INITIALIZATION
   * ======================================================== */

  init() {
    if (
      this.initialized
    ) {
      this.refreshTriggerBinding();

      return this;
    }

    this.destroyed =
      false;

    injectStyles();

    this.createRoot();

    this.bindGlobalEvents();

    this.bindTriggerElements();

    this.applyLocale();

    this.renderHistory();

    this.initialized =
      true;

    return this;
  }


  /* ==========================================================
   * DOM CREATION
   * ======================================================== */

  createRoot() {
    const existing =
      document.querySelector(
        '[data-gcc-compass-ai-root]'
      );

    if (
      existing
    ) {
      this.dom.root =
        existing;

      this.cacheDom();

      return;
    }

    const root =
      document.createElement(
        'section'
      );

    root.className =
      'gcc-ai';

    root.setAttribute(
      'data-gcc-compass-ai-root',
      'true'
    );

    root.hidden =
      true;

    root.setAttribute(
      'aria-label',
      AI_NAME
    );

    root.setAttribute(
      'aria-hidden',
      'true'
    );

    root.innerHTML = `
      <div
        class="gcc-ai__backdrop"
        data-ai-backdrop
      ></div>

      <aside
        class="gcc-ai__panel"
        data-ai-panel
        role="dialog"
        aria-modal="true"
        aria-labelledby="gcc-ai-title"
        tabindex="-1"
      >

        <header
          class="gcc-ai__header"
        >
          <div
            class="gcc-ai__brand"
          >
            <div
              class="gcc-ai__brand-mark"
              aria-hidden="true"
            >
              ${this.icon(
                'compass'
              )}
            </div>

            <div
              class="gcc-ai__title"
            >
              <strong
                id="gcc-ai-title"
              >
                ${escapeHTML(
                  AI_NAME
                )}
              </strong>

              <span
                class="gcc-ai__subtitle"
                data-ai-subtitle
              ></span>

              <span
                class="gcc-ai__status"
              >
                <span
                  class="gcc-ai__status-dot"
                  data-ai-status-dot
                ></span>

                <span
                  data-ai-status
                ></span>
              </span>
            </div>
          </div>

          <div
            class="gcc-ai__header-actions"
          >
            <button
              type="button"
              class="gcc-ai__icon-button"
              data-ai-new
            >
              ${this.icon(
                'plus'
              )}
            </button>

            <button
              type="button"
              class="gcc-ai__icon-button"
              data-ai-close
            >
              ${this.icon(
                'close'
              )}
            </button>
          </div>
        </header>

        <div
          class="gcc-ai__modebar"
          data-ai-modebar
          role="tablist"
          aria-label="Compass AI modes"
        ></div>

        <div
          class="gcc-ai__conversation"
          data-ai-conversation
          tabindex="0"
          aria-live="polite"
          aria-relevant="additions text"
        ></div>

        <div
          class="gcc-ai__composer"
        >
          <div
            class="gcc-ai__composer-top"
          >
            <span
              class="gcc-ai__composer-mode"
              data-ai-current-mode
            ></span>

            <span
              class="gcc-ai__char-count"
              data-ai-char-count
            >
              0 /
              ${LIMITS.maxInputLength}
            </span>
          </div>

          <div
            class="gcc-ai__input-wrap"
          >
            <textarea
              class="gcc-ai__textarea"
              data-ai-input
              rows="1"
              maxlength="${LIMITS.maxInputLength}"
              autocomplete="off"
              spellcheck="true"
            ></textarea>

            <button
              type="button"
              class="gcc-ai__send"
              data-ai-send
            >
              ${this.icon(
                'send'
              )}
            </button>
          </div>

          <div
            class="gcc-ai__footnote"
            data-ai-footnote
          ></div>
        </div>

        <div
          class="gcc-ai__confirm"
          data-ai-confirm
          role="dialog"
          aria-modal="true"
          aria-labelledby="gcc-ai-confirm-title"
        >
          <h2
            class="gcc-ai__confirm-title"
            id="gcc-ai-confirm-title"
            data-ai-confirm-title
          ></h2>

          <p
            class="gcc-ai__confirm-text"
            data-ai-confirm-text
          ></p>

          <div
            class="gcc-ai__confirm-actions"
          >
            <button
              type="button"
              class="gcc-ai__confirm-button"
              data-ai-confirm-no
            ></button>

            <button
              type="button"
              class="gcc-ai__confirm-button is-primary"
              data-ai-confirm-yes
            ></button>
          </div>
        </div>
      </aside>
    `;

    this.options.mountTarget.appendChild(
      root
    );

    this.dom.root =
      root;

    this.cacheDom();
  }


  cacheDom() {
    const root =
      this.dom.root;

    this.dom.panel =
      root?.querySelector(
        '[data-ai-panel]'
      );

    this.dom.backdrop =
      root?.querySelector(
        '[data-ai-backdrop]'
      );

    this.dom.modebar =
      root?.querySelector(
        '[data-ai-modebar]'
      );

    this.dom.conversation =
      root?.querySelector(
        '[data-ai-conversation]'
      );

    this.dom.input =
      root?.querySelector(
        '[data-ai-input]'
      );

    this.dom.send =
      root?.querySelector(
        '[data-ai-send]'
      );

    this.dom.charCount =
      root?.querySelector(
        '[data-ai-char-count]'
      );

    this.dom.currentMode =
      root?.querySelector(
        '[data-ai-current-mode]'
      );

    this.dom.subtitle =
      root?.querySelector(
        '[data-ai-subtitle]'
      );

    this.dom.status =
      root?.querySelector(
        '[data-ai-status]'
      );

    this.dom.statusDot =
      root?.querySelector(
        '[data-ai-status-dot]'
      );

    this.dom.footnote =
      root?.querySelector(
        '[data-ai-footnote]'
      );

    this.dom.newButton =
      root?.querySelector(
        '[data-ai-new]'
      );

    this.dom.closeButton =
      root?.querySelector(
        '[data-ai-close]'
      );

    this.dom.confirm =
      root?.querySelector(
        '[data-ai-confirm]'
      );

    this.dom.confirmTitle =
      root?.querySelector(
        '[data-ai-confirm-title]'
      );

    this.dom.confirmText =
      root?.querySelector(
        '[data-ai-confirm-text]'
      );

    this.dom.confirmYes =
      root?.querySelector(
        '[data-ai-confirm-yes]'
      );

    this.dom.confirmNo =
      root?.querySelector(
        '[data-ai-confirm-no]'
      );
  }


  icon(
    name
  ) {
    const icons = {
      compass: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          ></circle>
          <path
            d="m15.6 8.4-2.2 4.9-4.9 2.2 2.2-4.9 4.9-2.2Z"
          ></path>
        </svg>
      `,

      plus: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path
            d="M12 5v14"
          ></path>
          <path
            d="M5 12h14"
          ></path>
        </svg>
      `,

      close: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <path
            d="m6 6 12 12"
          ></path>
          <path
            d="m18 6-12 12"
          ></path>
        </svg>
      `,

      send: `
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path
            d="m22 2-7 20-4-9-9-4Z"
          ></path>
          <path
            d="M22 2 11 13"
          ></path>
        </svg>
      `
    };

    return (
      icons[
        name
      ] ||
      ''
    );
  }


  /* ==========================================================
   * GLOBAL EVENTS
   * ======================================================== */

  bindGlobalEvents() {
    if (
      this.globalEventsBound
    ) {
      return;
    }

    this.globalEventsBound =
      true;

    this.dom.closeButton?.addEventListener(
      'click',
      () =>
        this.close()
    );

    this.dom.backdrop?.addEventListener(
      'click',
      () =>
        this.close()
    );

    this.dom.newButton?.addEventListener(
      'click',
      () =>
        this.requestClearHistory()
    );

    this.dom.send?.addEventListener(
      'click',
      () =>
        void this.submit()
    );

    this.dom.input?.addEventListener(
      'input',
      () => {
        this.resizeTextarea();
        this.updateComposerState();
      }
    );

    this.dom.input?.addEventListener(
      'keydown',
      event => {
        if (
          event.key ===
            'Enter' &&
          !event.shiftKey
        ) {
          event.preventDefault();

          void this.submit();
        }
      }
    );

    this.dom.confirmYes?.addEventListener(
      'click',
      () =>
        this.clearHistory()
    );

    this.dom.confirmNo?.addEventListener(
      'click',
      () =>
        this.closeConfirm()
    );

    this.boundEscapeHandler =
      event => {
        if (
          !this.openState
        ) {
          return;
        }

        if (
          event.key ===
          'Escape'
        ) {
          if (
            this.dom.root?.classList.contains(
              'has-confirm'
            )
          ) {
            this.closeConfirm();
          } else {
            this.close();
          }

          return;
        }

        if (
          event.key ===
            'Tab'
        ) {
          this.trapFocus(
            event
          );
        }
      };

    document.addEventListener(
      'keydown',
      this.boundEscapeHandler
    );

    /*
     * Listen to the canonical language event only.
     *
     * language.js emits both:
     *   gcc:languagechange
     *   govcareer:languagechange
     *
     * Listening to both creates duplicate UI refreshes.
     */
    this.boundLanguageHandler =
      event => {
        const language =
          event.detail?.language ||
          event.detail?.locale ||
          getCurrentLanguage();

        this.setLocale(
          language
        );
      };

    document.addEventListener(
      'gcc:languagechange',
      this.boundLanguageHandler
    );

    /*
     * External callers can open the canonical global assistant by dispatching
     * gcc:ai:open. The assistant itself remains the owner of visual state.
     */
    this.boundAIEventHandler =
      () => {
        if (
          !this.openState
        ) {
          this.open();
        }
      };

    document.addEventListener(
      'gcc:ai:open',
      this.boundAIEventHandler
    );

    /*
     * app.js accessibility integration can request a global escape close.
     */
    document.addEventListener(
      'govcareer:escape',
      () => {
        if (
          this.openState
        ) {
          this.close();
        }
      }
    );

    this.boundResizeHandler =
      () => {
        this.resizeTextarea();
      };

    window.addEventListener(
      'resize',
      this.boundResizeHandler
    );
  }


  bindTriggerElements() {
    document
      .querySelectorAll(
        this.options.triggerSelector
      )
      .forEach(
        trigger => {
          if (
            this.boundTriggers.has(
              trigger
            )
          ) {
            trigger.setAttribute(
              'aria-expanded',
              String(
                this.openState
              )
            );

            return;
          }

          this.boundTriggers.add(
            trigger
          );

          trigger.setAttribute(
            'aria-haspopup',
            'dialog'
          );

          trigger.setAttribute(
            'aria-expanded',
            String(
              this.openState
            )
          );

          trigger.setAttribute(
            'aria-controls',
            this.dom.panel?.id ||
              'gcc-ai-panel'
          );

          trigger.addEventListener(
            'click',
            event => {
              /*
               * The stable AI trigger owns the opening action.
               *
               * A header link is prevented from navigating when it is
               * intentionally marked as the AI trigger.
               */
              if (
                trigger.matches(
                  'a'
                )
              ) {
                event.preventDefault();
              }

              this.toggle(
                trigger
              );
            }
          );
        }
      );
  }


  /* ==========================================================
   * LOCALE
   * ======================================================== */

  applyLocale(
    locale =
      currentLocale()
  ) {
    this.locale =
      normalizeLocale(
        locale
      );

    this.dom.root?.setAttribute(
      'data-ai-locale',
      this.locale
    );

    if (
      this.dom.subtitle
    ) {
      this.dom.subtitle.textContent =
        t(
          'ai.subtitle',
          {},
          this.locale ===
            'bn'
            ? 'সরকারি ক্যারিয়ার ইন্টেলিজেন্স'
            : 'Government Career Intelligence'
        );
    }

    if (
      this.dom.status
    ) {
      this.dom.status.textContent =
        t(
          'ai.status.ready',
          {},
          this.locale ===
            'bn'
            ? 'প্রস্তুত'
            : 'Ready'
        );
    }

    if (
      this.dom.newButton
    ) {
      const label =
        t(
          'ai.newConversation',
          {},
          this.locale ===
            'bn'
            ? 'নতুন কথোপকথন'
            : 'New conversation'
        );

      this.dom.newButton.title =
        label;

      this.dom.newButton.setAttribute(
        'aria-label',
        label
      );
    }

    if (
      this.dom.closeButton
    ) {
      const label =
        t(
          'ai.close',
          {},
          this.locale ===
            'bn'
            ? 'Compass AI বন্ধ করুন'
            : 'Close Compass AI'
        );

      this.dom.closeButton.title =
        label;

      this.dom.closeButton.setAttribute(
        'aria-label',
        label
      );
    }

    if (
      this.dom.send
    ) {
      this.dom.send.setAttribute(
        'aria-label',
        t(
          this.isBusy
            ? 'ai.stop'
            : 'ai.send',
          {},
          this.isBusy
            ? this.locale ===
                'bn'
              ? 'বন্ধ করুন'
              : 'Stop'
            : this.locale ===
                'bn'
              ? 'পাঠান'
              : 'Send'
        )
      );
    }

    if (
      this.dom.input
    ) {
      this.dom.input.placeholder =
        t(
          'ai.inputPlaceholder',
          {},
          this.locale ===
            'bn'
            ? `${AI_NAME}-কে সরকারি ক্যারিয়ার সম্পর্কে জিজ্ঞাসা করুন...`
            : `Ask ${AI_NAME} about government careers...`
        );
    }

    if (
      this.dom.modebar
    ) {
      this.dom.modebar.setAttribute(
        'aria-label',
        t(
          'ai.modeList',
          {},
          `${AI_NAME} modes`
        )
      );
    }

    if (
      this.dom.footnote
    ) {
      const verifiedLabel =
        t(
          'ai.verifiedPlatformData',
          {},
          this.locale ===
            'bn'
            ? 'যাচাইকৃত প্ল্যাটফর্ম ডেটা'
            : 'Verified platform data'
        );

      const ownerName =
        PUBLIC_IDENTITY.ownerPublicName;

      if (
        ownerName
      ) {
        this.dom.footnote.textContent =
          `${verifiedLabel} · ${t(
            'ai.createdBy',
            {
              owner:
                ownerName
            },
            this.locale ===
              'bn'
              ? `${ownerName} দ্বারা তৈরি`
              : `Created by ${ownerName}`
          )}`;
      } else {
        this.dom.footnote.textContent =
          verifiedLabel;
      }
    }

    this.renderModes();

    this.updateComposerState();
  }


  setLocale(
    locale
  ) {
    const normalized =
      normalizeLocale(
        locale
      );

    this.applyLocale(
      normalized
    );

    this.renderHistory();
  }


  /* ==========================================================
   * MODES
   * ======================================================== */

  renderModes() {
    if (
      !this.dom.modebar
    ) {
      return;
    }

    this.dom.modebar.innerHTML =
      MODES.map(
        mode => {
          const active =
            mode.id ===
            this.mode;

          return `
            <button
              type="button"
              class="gcc-ai__mode${active ? ' is-active' : ''}"
              data-ai-mode="${escapeAttribute(
                mode.id
              )}"
              role="tab"
              aria-selected="${active ? 'true' : 'false'}"
              aria-label="${escapeAttribute(
                getModeLabel(
                  mode.id
                )
              )}"
            >
              ${escapeHTML(
                getModeLabel(
                  mode.id
                )
              )}
            </button>
          `;
        }
      ).join('');

    this.dom.modebar
      .querySelectorAll(
        '[data-ai-mode]'
      )
      .forEach(
        button => {
          button.addEventListener(
            'click',
            () => {
              this.setMode(
                button.dataset.aiMode
              );
            }
          );
        }
      );
  }


  setMode(
    modeId
  ) {
    const normalized =
      isValidMode(
        modeId
      )
        ? modeId
        : 'auto';

    this.mode =
      normalized;

    setItem(
      STORAGE.mode,
      this.mode
    );

    this.renderModes();

    this.updateComposerState();
  }


  /* ==========================================================
   * COMPOSER
   * ======================================================== */

  updateComposerState() {
    const value =
      String(
        this.dom.input?.value ||
          ''
      );

    if (
      this.dom.charCount
    ) {
      this.dom.charCount.textContent =
        `${value.length} / ${LIMITS.maxInputLength}`;
    }

    if (
      this.dom.currentMode
    ) {
      this.dom.currentMode.textContent =
        `${t(
          'ai.mode',
          {},
          this.locale ===
            'bn'
            ? 'মোড'
            : 'Mode'
        )}: ${getModeLabel(
          this.mode
        )}`;
    }

    if (
      this.dom.send
    ) {
      this.dom.send.disabled =
        this.isBusy ||
        !value.trim();

      this.dom.send.innerHTML =
        this.isBusy
          ? this.icon(
              'close'
            )
          : this.icon(
              'send'
            );

      this.dom.send.setAttribute(
        'aria-label',
        t(
          this.isBusy
            ? 'ai.stop'
            : 'ai.send',
          {},
          this.isBusy
            ? this.locale ===
                'bn'
              ? 'বন্ধ করুন'
              : 'Stop'
            : this.locale ===
                'bn'
              ? 'পাঠান'
              : 'Send'
        )
      );
    }
  }


  resizeTextarea() {
    const textarea =
      this.dom.input;

    if (
      !textarea
    ) {
      return;
    }

    textarea.style.height =
      'auto';

    textarea.style.height =
      `${Math.min(
        textarea.scrollHeight,
        130
      )}px`;
  }


  /* ==========================================================
   * CONVERSATION
   * ======================================================== */

  renderHistory() {
    if (
      !this.dom.conversation
    ) {
      return;
    }

    this.dom.conversation.innerHTML =
      '';

    if (
      !this.history.length
    ) {
      this.renderWelcome();

      return;
    }

    this.history.forEach(
      item =>
        this.appendStoredMessage(
          item
        )
    );

    this.scrollConversationToBottom(
      false
    );
  }


  renderWelcome() {
    const suggestions = [
      t(
        'ai.suggestion1',
        {},
        this.locale ===
          'bn'
          ? 'আমার যোগ্যতার জন্য কোন সরকারি চাকরি উপযুক্ত?'
          : 'Which government jobs fit my qualification?'
      ),

      t(
        'ai.suggestion2',
        {},
        this.locale ===
          'bn'
          ? 'কোনো সরকারি চাকরির জন্য আমার eligibility পরীক্ষা করুন'
          : 'Check my eligibility for a government job'
      ),

      t(
        'ai.suggestion3',
        {},
        this.locale ===
          'bn'
          ? 'দুটি সরকারি ক্যারিয়ারের তুলনা করুন'
          : 'Compare two government careers'
      ),

      t(
        'ai.suggestion4',
        {},
        this.locale ===
          'bn'
          ? 'আমার কোন কোন সরকারি পরীক্ষা লক্ষ্য করা উচিত?'
          : 'Which exams should I target?'
      ),

      t(
        'ai.suggestion5',
        {},
        this.locale ===
          'bn'
          ? 'এই পদের বেতন ও promotion বুঝিয়ে বলুন'
          : 'Explain the salary and promotion of this post'
      )
    ];

    this.dom.conversation.innerHTML = `
      <div
        class="gcc-ai__welcome"
      >
        <h2
          class="gcc-ai__welcome-heading"
        >
          ${escapeHTML(
            AI_NAME
          )}
        </h2>

        <p
          class="gcc-ai__welcome-text"
        >
          ${escapeHTML(
            t(
              'ai.welcome',
              {},
              this.locale ===
                'bn'
                ? `নমস্কার। আমি ${AI_NAME}, ${APP_NAME}-এর সহকারী। সরকারি চাকরি, পরীক্ষা, eligibility, salary, recruitment, career fit, comparison বা সম্পর্কিত তথ্য সম্পর্কে প্রশ্ন করুন।`
                : `Hello. I’m ${AI_NAME}, your ${APP_NAME} assistant. Ask me about government jobs, exams, eligibility, salary, recruitment, career fit, comparisons or related information.`
            )
          )}
        </p>

        <div
          class="gcc-ai__suggestions"
        >
          <div
            class="gcc-ai__result-label"
          >
            ${escapeHTML(
              t(
                'ai.suggestionsTitle',
                {},
                this.locale ===
                  'bn'
                  ? 'এভাবে জিজ্ঞাসা করতে পারেন'
                  : 'Try asking'
              )
            )}
          </div>

          ${suggestions
            .map(
              suggestion => `
                <button
                  type="button"
                  class="gcc-ai__suggestion"
                  data-ai-suggestion="${escapeAttribute(
                    suggestion
                  )}"
                >
                  ${escapeHTML(
                    suggestion
                  )}
                </button>
              `
            )
            .join('')}
        </div>
      </div>
    `;

    this.dom.conversation
      .querySelectorAll(
        '[data-ai-suggestion]'
      )
      .forEach(
        button => {
          button.addEventListener(
            'click',
            () => {
              if (
                !this.dom.input
              ) {
                return;
              }

              this.dom.input.value =
                button.dataset.aiSuggestion ||
                '';

              this.updateComposerState();

              this.resizeTextarea();

              this.dom.input.focus();

              void this.submit();
            }
          );
        }
      );
  }


  appendStoredMessage(
    item
  ) {
    const wrapper =
      document.createElement(
        'div'
      );

    wrapper.className =
      `gcc-ai__message ${
        item.role ===
          'user'
          ? 'is-user'
          : 'is-assistant'
      }`;

    wrapper.innerHTML = `
      <div
        class="gcc-ai__bubble"
      >
        <div
          class="gcc-ai__meta"
        >
          ${escapeHTML(
            item.role ===
              'user'
              ? t(
                  'ai.you',
                  {},
                  this.locale ===
                    'bn'
                    ? 'আপনি'
                    : 'You'
                )
              : AI_NAME
          )}
        </div>

        <div>
          ${formatResponseText(
            item.content
          )}
        </div>
      </div>
    `;

    this.dom.conversation.appendChild(
      wrapper
    );
  }


  appendUserMessage(
    text
  ) {
    const message = {
      role:
        'user',

      content:
        text,

      timestamp:
        new Date()
          .toISOString()
    };

    this.history.push(
      message
    );

    this.trimHistory();

    if (
      this.options.persistHistory
    ) {
      saveHistory(
        this.history
      );
    }

    const wrapper =
      document.createElement(
        'div'
      );

    wrapper.className =
      'gcc-ai__message is-user';

    wrapper.innerHTML = `
      <div
        class="gcc-ai__bubble"
      >
        <div
          class="gcc-ai__meta"
        >
          ${escapeHTML(
            t(
              'ai.you',
              {},
              this.locale ===
                'bn'
                ? 'আপনি'
                : 'You'
            )
          )}
        </div>

        <div>
          ${formatResponseText(
            text
          )}
        </div>
      </div>
    `;

    this.dom.conversation.appendChild(
      wrapper
    );

    this.scrollConversationToBottom();

    return message;
  }


  appendAssistantPlaceholder() {
    const wrapper =
      document.createElement(
        'div'
      );

    wrapper.className =
      'gcc-ai__message is-assistant';

    wrapper.dataset.aiPlaceholder =
      'true';

    wrapper.innerHTML = `
      <div
        class="gcc-ai__bubble"
      >
        <div
          class="gcc-ai__meta"
        >
          ${escapeHTML(
            AI_NAME
          )}
        </div>

        <div
          class="gcc-ai__typing"
          aria-label="${escapeAttribute(
            t(
              'ai.thinking',
              {},
              this.locale ===
                'bn'
                ? 'আপনার প্রশ্ন বিশ্লেষণ করা হচ্ছে…'
                : 'Analyzing your question…'
            )
          )}"
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;

    this.dom.conversation.appendChild(
      wrapper
    );

    this.scrollConversationToBottom();

    return wrapper;
  }


  /* ==========================================================
   * RESPONSE RENDERING
   * ======================================================== */

  replaceAssistantPlaceholder(
    element,
    response
  ) {
    if (
      !element
    ) {
      return;
    }

    const confidenceHTML =
      response.confidence
        ? `
          <span
            class="gcc-ai__chip"
          >
            ${escapeHTML(
              t(
                'ai.confidence',
                {},
                this.locale ===
                  'bn'
                  ? 'বিশ্বাসযোগ্যতা'
                  : 'Confidence'
              )
            )}:
            ${escapeHTML(
              this.getConfidenceLabel(
                response.confidence
              )
            )}
          </span>
        `
        : '';

    const intentHTML =
      response.intent
        ? `
          <span
            class="gcc-ai__chip"
          >
            ${escapeHTML(
              this.getIntentLabel(
                response.intent
              )
            )}
          </span>
        `
        : '';

    const metadataHTML =
      confidenceHTML ||
      intentHTML
        ? `
          <div
            class="gcc-ai__result-block"
          >
            <div
              class="gcc-ai__chips"
            >
              ${confidenceHTML}
              ${intentHTML}
            </div>
          </div>
        `
        : '';

    const sourcesHTML =
      this.renderSources(
        response.sources
      );

    const relatedHTML =
      this.renderRelated(
        response.relatedItems
      );

    const warningsHTML =
      this.renderWarnings(
        response.warnings
      );

    const scopeHTML =
      this.renderScope(
        response
      );

    element.dataset.aiPlaceholder =
      'false';

    element.innerHTML = `
      <div
        class="gcc-ai__bubble"
      >
        <div
          class="gcc-ai__meta"
        >
          ${escapeHTML(
            response.assistant ||
              AI_NAME
          )}
        </div>

        <div>
          ${formatResponseText(
            response.answer
          )}
        </div>

        ${metadataHTML}

        ${scopeHTML}

        ${sourcesHTML}

        ${relatedHTML}

        ${warningsHTML}

        <div
          class="gcc-ai__message-actions"
        >
          <button
            type="button"
            class="gcc-ai__small-button"
            data-copy-ai-response
          >
            ${escapeHTML(
              t(
                'ai.copy',
                {},
                this.locale ===
                  'bn'
                  ? 'কপি'
                  : 'Copy'
              )
            )}
          </button>
        </div>
      </div>
    `;

    const copyButton =
      element.querySelector(
        '[data-copy-ai-response]'
      );

    copyButton?.addEventListener(
      'click',
      () => {
        void this.copyResponse(
          response.answer,
          copyButton
        );
      }
    );
  }


  renderScope(
    response
  ) {
    const scope =
      safeArray(
        response.scope
      );

    if (
      !scope.length
    ) {
      return '';
    }

    return `
      <div
        class="gcc-ai__result-block"
      >
        <div
          class="gcc-ai__result-label"
        >
          ${escapeHTML(
            t(
              'ai.scope',
              {},
              this.locale ===
                'bn'
                ? 'পরিসর'
                : 'Scope'
            )
          )}
        </div>

        <div
          class="gcc-ai__chips"
        >
          ${scope
            .map(
              item => `
                <span
                  class="gcc-ai__chip"
                >
                  ${escapeHTML(
                    item
                  )}
                </span>
              `
            )
            .join('')}
        </div>
      </div>
    `;
  }


  renderSources(
    sources
  ) {
    if (
      !Array.isArray(
        sources
      ) ||
      !sources.length
    ) {
      return '';
    }

    return `
      <div
        class="gcc-ai__result-block"
      >
        <div
          class="gcc-ai__result-label"
        >
          ${escapeHTML(
            t(
              'ai.sources',
              {},
              this.locale ===
                'bn'
                ? 'উৎস'
                : 'Sources'
            )
          )}
        </div>

        <div
          class="gcc-ai__source-list"
        >
          ${sources
            .map(
              source => {
                const content = `
                  <span
                    class="gcc-ai__source-title"
                  >
                    ${escapeHTML(
                      source.title
                    )}
                  </span>

                  ${
                    source.url
                      ? `
                        <span
                          class="gcc-ai__source-url"
                        >
                          ${escapeHTML(
                            source.url
                          )}
                        </span>
                      `
                      : ''
                  }
                `;

                return source.url
                  ? `
                    <a
                      class="gcc-ai__source"
                      href="${escapeAttribute(
                        source.url
                      )}"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ${content}
                    </a>
                  `
                  : `
                    <div
                      class="gcc-ai__source"
                    >
                      ${content}
                    </div>
                  `;
              }
            )
            .join('')}
        </div>
      </div>
    `;
  }


  renderRelated(
    related
  ) {
    if (
      !Array.isArray(
        related
      ) ||
      !related.length
    ) {
      return '';
    }

    return `
      <div
        class="gcc-ai__result-block"
      >
        <div
          class="gcc-ai__result-label"
        >
          ${escapeHTML(
            t(
              'ai.related',
              {},
              this.locale ===
                'bn'
                ? 'সম্পর্কিত'
                : 'Related'
            )
          )}
        </div>

        <div
          class="gcc-ai__related-list"
        >
          ${related
            .map(
              item => {
                const content = `
                  <span
                    class="gcc-ai__related-title"
                  >
                    ${escapeHTML(
                      item.title
                    )}
                  </span>

                  ${
                    item.description
                      ? `
                        <span
                          class="gcc-ai__source-url"
                        >
                          ${escapeHTML(
                            item.description
                          )}
                        </span>
                      `
                      : ''
                  }
                `;

                return item.url
                  ? `
                    <a
                      class="gcc-ai__related"
                      href="${escapeAttribute(
                        item.url
                      )}"
                      ${
                        item.url.startsWith('/')
                          ? ''
                          : 'target="_blank" rel="noopener noreferrer"'
                      }
                    >
                      ${content}
                    </a>
                  `
                  : `
                    <div
                      class="gcc-ai__related"
                    >
                      ${content}
                    </div>
                  `;
              }
            )
            .join('')}
        </div>
      </div>
    `;
  }


  renderWarnings(
    warnings
  ) {
    if (
      !Array.isArray(
        warnings
      ) ||
      !warnings.length
    ) {
      return '';
    }

    return warnings
      .map(
        warning => `
          <div
            class="gcc-ai__warning"
          >
            ${escapeHTML(
              warning
            )}
          </div>
        `
      )
      .join('');
  }


  getConfidenceLabel(
    confidence
  ) {
    const value =
      String(
        confidence ||
          ''
      ).toLowerCase();

    switch (
      value
    ) {
      case 'high':
        return t(
          'ai.confidence.high',
          {},
          this.locale ===
            'bn'
            ? 'উচ্চ'
            : 'High'
        );

      case 'medium':
      case 'moderate':
        return t(
          'ai.confidence.medium',
          {},
          this.locale ===
            'bn'
            ? 'মাঝারি'
            : 'Medium'
        );

      case 'low':
        return t(
          'ai.confidence.low',
          {},
          this.locale ===
            'bn'
            ? 'কম'
            : 'Low'
        );

      default:
        return confidence;
    }
  }


  getIntentLabel(
    intent
  ) {
    const normalized =
      String(
        intent ||
          ''
      ).toLowerCase();

    const modeMap = [
      [
        'eligib',
        'eligibility'
      ],

      [
        'qualification',
        'eligibility'
      ],

      [
        'exam',
        'exams'
      ],

      [
        'salary',
        'salary'
      ],

      [
        'pay',
        'salary'
      ],

      [
        'compar',
        'compare'
      ],

      [
        'job',
        'jobs'
      ],

      [
        'career',
        'career'
      ]
    ];

    for (
      const [
        fragment,
        mode
      ] of modeMap
    ) {
      if (
        normalized.includes(
          fragment
        )
      ) {
        return getModeLabel(
          mode
        );
      }
    }

    return getModeLabel(
      'auto'
    );
  }


  /* ==========================================================
   * REQUEST ORCHESTRATION
   * ======================================================== */

  async submit() {
    if (
      this.isBusy
    ) {
      this.stopGeneration();

      return;
    }

    const rawQuestion =
      String(
        this.dom.input?.value ||
          ''
      ).trim();

    if (
      !rawQuestion
    ) {
      this.appendErrorMessage(
        t(
          'ai.emptyQuestion',
          {},
          this.locale ===
            'bn'
            ? 'প্রথমে একটি প্রশ্ন লিখুন।'
            : 'Please enter a question first.'
        )
      );

      return;
    }

    if (
      rawQuestion.length >
      LIMITS.maxInputLength
    ) {
      this.appendErrorMessage(
        t(
          'ai.tooLong',
          {},
          this.locale ===
            'bn'
            ? 'আপনার বার্তাটি খুব বড়। অনুগ্রহ করে ছোট করুন।'
            : 'Your message is too long. Please shorten it.'
        )
      );

      return;
    }

    const safeRequest =
      normalizeRequestInput(
        rawQuestion,
        this.locale
      );

    if (
      !safeRequest.message
    ) {
      return;
    }

    if (
      this.dom.input
    ) {
      this.dom.input.value =
        '';

      this.resizeTextarea();

      this.updateComposerState();
    }

    const localIdentity =
      getLocalIdentityAnswer(
        safeRequest.message
      );

    this.appendUserMessage(
      safeRequest.message
    );

    if (
      localIdentity?.local
    ) {
      await this.renderLocalIdentityAnswer(
        localIdentity
      );

      return;
    }

    const placeholder =
      this.appendAssistantPlaceholder();

    this.setBusy(
      true
    );

    try {
      const result =
        await this.processAIRequest(
          safeRequest.message,
          safeRequest.language
        );

      const normalized =
        this.normalizePipelineResult(
          result,
          safeRequest.language
        );

      this.replaceAssistantPlaceholder(
        placeholder,
        normalized
      );

      this.history.push({
        role:
          'assistant',

        content:
          normalized.answer,

        timestamp:
          new Date()
            .toISOString(),

        intent:
          normalized.intent,

        confidence:
          normalized.confidence
      });

      this.trimHistory();

      if (
        this.options.persistHistory
      ) {
        saveHistory(
          this.history
        );
      }

      this.scrollConversationToBottom();
    } catch (
      error
    ) {
      placeholder?.remove();

      if (
        error?.name ===
        'AbortError'
      ) {
        return;
      }

      this.appendErrorMessage(
        this.getRequestErrorMessage(
          error
        )
      );

      this.setAIStatus(
        false
      );
    } finally {
      this.setBusy(
        false
      );

      if (
        this.openState
      ) {
        this.setAIStatus(
          true
        );
      }
    }
  }


  async processAIRequest(
    question,
    language
  ) {
    this.setAIStatus(
      true
    );

    const pageContext =
      collectPageContext();

    const candidateContext =
      collectCandidateContext();

    const conversation =
      this.history
        .slice(
          -LIMITS.maxHistoryItems
        )
        .map(
          item => ({
            role:
              item.role,

            content:
              item.content
          })
        );

    const routeResult =
      routeIntent({
        message:
          question,

        mode:
          this.mode,

        language,

        conversation,

        pageContext
      });

    /*
     * Platform identity should normally have been handled before entering
     * the network path. This is a defensive compatibility guard.
     */
    if (
      routeResult.intent ===
      'platform_identity'
    ) {
      const local =
        getLocalIdentityAnswer(
          question
        );

      if (
        local
      ) {
        return {
          parsed:
            local,

          rawResponse:
            local,

          routeResult
        };
      }
    }

    const canonicalContext =
      buildCanonicalContext({
        candidateContext,

        pageContext,

        routeResult
      });

    const requestContext =
      {
        intent:
          routeResult.intent,

        secondaryIntents:
          Array.isArray(
            routeResult.secondaryIntents
          )
            ? routeResult.secondaryIntents
            : [],

        retrievalPlan:
          routeResult.retrievalPlan ||
          null,

        page:
          pageContext,

        mode:
          this.mode
      };

    /*
     * The actual browser → /api/chat request remains owned by client.js.
     *
     * The additional requestContext is placed inside the structured
     * application context so the component does not create a second API
     * abstraction.
     */
    const contextForRequest =
      {
        ...canonicalContext,

        requestContext
      };

    this.abortController =
      new AbortController();

    try {
      const rawResponse =
        await callAIClient({
          messages: [
            ...conversation,
            {
              role:
                'user',

              content:
                question
            }
          ],

          context:
            contextForRequest,

          language,

          signal:
            this.abortController.signal
        });

      return {
        parsed:
          parseAIResponse(
            rawResponse
          ),

        rawResponse,

        routeResult
      };
    } finally {
      this.abortController =
        null;
    }
  }


  normalizePipelineResult(
    result,
    language
  ) {
    if (
      !result
    ) {
      throw createPipelineError(
        'Compass AI did not return a result.',
        'AI_EMPTY_RESULT'
      );
    }

    const enriched =
      enrichParsedResponse(
        result.parsed,
        result.rawResponse,
        language
      );

    if (
      !enriched.answer
    ) {
      throw createPipelineError(
        'Compass AI returned an empty answer.',
        'AI_EMPTY_ANSWER'
      );
    }

    /*
     * Router metadata may be used for UI explanation only.
     *
     * It is never used to calculate eligibility, scores or rankings.
     */
    if (
      !enriched.intent &&
      result.routeResult?.intent
    ) {
      enriched.intent =
        result.routeResult.intent;
    }

    return enriched;
  }


  getRequestErrorMessage(
    error
  ) {
    if (
      error?.name ===
      'AbortError'
    ) {
      return t(
        'ai.error.aborted',
        {},
        this.locale ===
          'bn'
          ? 'অনুরোধটি বাতিল করা হয়েছে।'
          : 'The request was cancelled.'
      );
    }

    const fallback =
      this.locale ===
        'bn'
        ? 'AI পরিষেবাটি বর্তমানে unavailable। আবার চেষ্টা করুন।'
        : 'The AI service is temporarily unavailable. Please try again.';

    const code =
      String(
        error?.code ||
          ''
      );

    if (
      code ===
        'AI_INTENT_ROUTER_UNAVAILABLE' ||
      code ===
        'AI_CONTEXT_BUILDER_UNAVAILABLE' ||
      code ===
        'AI_CLIENT_UNAVAILABLE' ||
      code ===
        'AI_RESPONSE_PARSER_UNAVAILABLE'
    ) {
      return t(
        'ai.error.unavailable',
        {},
        fallback
      );
    }

    const message =
      String(
        error?.message ||
          ''
      ).trim();

    if (
      code ===
        'EMPTY_MESSAGES' ||
      code ===
        'INVALID_RESPONSE' ||
      code ===
        'EMPTY_AI_ANSWER'
    ) {
      return message ||
        fallback;
    }

    return message ||
      fallback;
  }


  /* ==========================================================
   * LOCAL IDENTITY
   * ======================================================== */

  async renderLocalIdentityAnswer(
    answer
  ) {
    const placeholder =
      this.appendAssistantPlaceholder();

    this.setBusy(
      true
    );

    await new Promise(
      resolve => {
        globalThis.setTimeout(
          resolve,
          80
        );
      }
    );

    this.replaceAssistantPlaceholder(
      placeholder,
      {
        answer:
          answer.answer,

        language:
          this.locale,

        intent:
          answer.intent,

        confidence:
          answer.confidence,

        scope:
          [],

        sources:
          [],

        relatedItems:
          [],

        warnings:
          []
      }
    );

    this.history.push({
      role:
        'assistant',

      content:
        answer.answer,

      timestamp:
        new Date()
          .toISOString(),

      intent:
        answer.intent,

      confidence:
        answer.confidence
    });

    this.trimHistory();

    if (
      this.options.persistHistory
    ) {
      saveHistory(
        this.history
      );
    }

    this.setBusy(
      false
    );

    this.scrollConversationToBottom();
  }


  /* ==========================================================
   * ERROR / STATUS
   * ======================================================== */

  appendErrorMessage(
    message
  ) {
    const wrapper =
      document.createElement(
        'div'
      );

    wrapper.className =
      'gcc-ai__message is-assistant';

    wrapper.innerHTML = `
      <div
        class="gcc-ai__bubble"
      >
        <div
          class="gcc-ai__meta"
        >
          ${escapeHTML(
            AI_NAME
          )}
        </div>

        <div
          class="gcc-ai__error"
        >
          ${escapeHTML(
            message
          )}
        </div>
      </div>
    `;

    this.dom.conversation?.appendChild(
      wrapper
    );

    this.scrollConversationToBottom();
  }


  setAIStatus(
    available
  ) {
    if (
      this.dom.status
    ) {
      this.dom.status.textContent =
        available
          ? t(
              'ai.status.ready',
              {},
              this.locale ===
                'bn'
                ? 'প্রস্তুত'
                : 'Ready'
            )
          : t(
              'ai.status.unavailable',
              {},
              this.locale ===
                'bn'
                ? 'সাময়িকভাবে unavailable'
                : 'Unavailable'
            );
    }

    this.dom.statusDot?.classList.toggle(
      'is-error',
      !available
    );
  }


  /* ==========================================================
   * COPY
   * ======================================================== */

  async copyResponse(
    answer,
    button
  ) {
    if (
      !answer ||
      !button
    ) {
      return;
    }

    try {
      if (
        navigator.clipboard &&
        typeof navigator
          .clipboard
          .writeText ===
          'function'
      ) {
        await navigator.clipboard.writeText(
          answer
        );

        button.textContent =
          t(
            'ai.copied',
            {},
            this.locale ===
              'bn'
              ? 'কপি হয়েছে'
              : 'Copied'
          );

        globalThis.setTimeout(
          () => {
            if (
              button &&
              button.isConnected
            ) {
              button.textContent =
                t(
                  'ai.copy',
                  {},
                  this.locale ===
                    'bn'
                    ? 'কপি'
                    : 'Copy'
                );
            }
          },
          1200
        );
      }
    } catch {
      /*
       * Clipboard access is optional.
       */
    }
  }


  /* ==========================================================
   * HISTORY
   * ======================================================== */

  trimHistory() {
    this.history =
      normalizeHistory(
        this.history
      );
  }


  requestClearHistory() {
    if (
      !this.history.length
    ) {
      this.clearHistory();

      return;
    }

    this.dom.confirmTitle.textContent =
      t(
        'ai.clearChat',
        {},
        this.locale ===
          'bn'
          ? 'কথোপকথন মুছুন'
          : 'Clear conversation'
      );

    this.dom.confirmText.textContent =
      t(
        'ai.clearConfirm',
        {},
        this.locale ===
          'bn'
          ? 'এই কথোপকথনটি মুছে ফেলবেন?'
          : 'Clear this conversation?'
      );

    this.dom.confirmYes.textContent =
      t(
        'ai.confirmClear',
        {},
        this.locale ===
          'bn'
          ? 'মুছুন'
          : 'Clear'
      );

    this.dom.confirmNo.textContent =
      t(
        'ai.confirmCancel',
        {},
        this.locale ===
          'bn'
          ? 'বাতিল'
          : 'Cancel'
      );

    this.dom.root?.classList.add(
      'has-confirm'
    );
  }


  closeConfirm() {
    this.dom.root?.classList.remove(
      'has-confirm'
    );
  }


  clearHistory() {
    this.history =
      [];

    if (
      this.options.persistHistory
    ) {
      clearStoredHistory();
    }

    this.closeConfirm();

    this.renderWelcome();

    if (
      this.dom.input
    ) {
      this.dom.input.value =
        '';
    }

    this.resizeTextarea();

    this.updateComposerState();
  }


  /* ==========================================================
   * FOCUS / SCROLL
   * ======================================================== */

  scrollConversationToBottom(
    smooth = true
  ) {
    if (
      !this.dom.conversation
    ) {
      return;
    }

    globalThis.requestAnimationFrame(
      () => {
        if (
          !this.dom.conversation
        ) {
          return;
        }

        this.dom.conversation.scrollTo({
          top:
            this.dom.conversation
              .scrollHeight,

          behavior:
            smooth
              ? 'smooth'
              : 'auto'
        });
      }
    );
  }


  trapFocus(
    event
  ) {
    if (
      !this.dom.panel
    ) {
      return;
    }

    const focusable =
      [
        ...this.dom.panel.querySelectorAll(
          'button:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )
      ].filter(
        element =>
          element.offsetParent !==
          null
      );

    if (
      focusable.length ===
      0
    ) {
      return;
    }

    const first =
      focusable[0];

    const last =
      focusable[
        focusable.length -
          1
      ];

    if (
      event.shiftKey &&
      document.activeElement ===
        first
    ) {
      event.preventDefault();

      last.focus();

      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement ===
        last
    ) {
      event.preventDefault();

      first.focus();
    }
  }


  /* ==========================================================
   * OPEN / CLOSE
   * ======================================================== */

  open(
    trigger = null
  ) {
    if (
      !this.initialized
    ) {
      this.init();
    }

    this.lastFocusedElement =
      trigger ||
      document.activeElement;

    this.openState =
      true;

    this.dom.root.hidden =
      false;

    this.dom.root.setAttribute(
      'aria-hidden',
      'false'
    );

    this.dom.root.classList.add(
      'is-open'
    );

    document.body.dataset.compassAiOpen =
      'true';

    document.documentElement.dataset.compassAiOpen =
      'true';

    document.documentElement.style.setProperty(
      '--gcc-ai-open',
      '1'
    );

    this.refreshTriggerBinding();

    /*
     * Do not dispatch gcc:ai:open here.
     *
     * gcc:ai:open is an external open request event in this architecture.
     * Dispatching the same event from open() would recursively trigger
     * the listener that calls open().
     *
     * State changes are emitted through gcc:ai:statechange.
     */
    this.emitState(
      true
    );

    globalThis.requestAnimationFrame(
      () => {
        this.dom.panel?.focus();
      }
    );

    this.scrollConversationToBottom(
      false
    );

    return this;
  }


  close() {
    if (
      !this.dom.root
    ) {
      return this;
    }

    this.openState =
      false;

    this.stopGeneration();

    this.closeConfirm();

    this.dom.root.classList.remove(
      'is-open'
    );

    this.dom.root.setAttribute(
      'aria-hidden',
      'true'
    );

    globalThis.setTimeout(
      () => {
        if (
          !this.openState &&
          this.dom.root
        ) {
          this.dom.root.hidden =
            true;
        }
      },
      220
    );

    delete document.body
      .dataset
      .compassAiOpen;

    delete document.documentElement
      .dataset
      .compassAiOpen;

    document.documentElement.style.removeProperty(
      '--gcc-ai-open'
    );

    this.refreshTriggerBinding();

    this.emitState(
      false
    );

    if (
      this.lastFocusedElement &&
      typeof this.lastFocusedElement.focus ===
        'function' &&
      this.lastFocusedElement.isConnected !==
        false
    ) {
      this.lastFocusedElement.focus();
    }

    return this;
  }


  toggle(
    trigger = null
  ) {
    return this.openState
      ? this.close()
      : this.open(
          trigger
        );
  }


  refreshTriggerBinding() {
    document
      .querySelectorAll(
        this.options.triggerSelector
      )
      .forEach(
        trigger => {
          trigger.setAttribute(
            'aria-expanded',
            String(
              this.openState
            )
          );

          trigger.setAttribute(
            'aria-controls',
            this.dom.panel?.id ||
              'gcc-ai-panel'
          );
        }
      );
  }


  emitState(
    open
  ) {
    const detail = {
      open:
        Boolean(
          open
        ),

      expanded:
        Boolean(
          open
        ),

      assistant:
        AI_NAME
    };

    document.dispatchEvent(
      new CustomEvent(
        'gcc:ai:statechange',
        {
          detail
        }
      )
    );
  }


  /* ==========================================================
   * ABORT / CLEANUP
   * ======================================================== */

  setBusy(
    busy
  ) {
    this.isBusy =
      Boolean(
        busy
      );

    this.updateComposerState();
  }


  stopGeneration() {
    if (
      this.abortController
    ) {
      this.abortController.abort();

      this.abortController =
        null;
    }

    this.setBusy(
      false
    );
  }


  destroy() {
    this.stopGeneration();

    this.close();

    if (
      this.boundEscapeHandler
    ) {
      document.removeEventListener(
        'keydown',
        this.boundEscapeHandler
      );
    }

    if (
      this.boundLanguageHandler
    ) {
      document.removeEventListener(
        'gcc:languagechange',
        this.boundLanguageHandler
      );
    }

    if (
      this.boundAIEventHandler
    ) {
      document.removeEventListener(
        'gcc:ai:open',
        this.boundAIEventHandler
      );
    }

    if (
      this.boundResizeHandler
    ) {
      window.removeEventListener(
        'resize',
        this.boundResizeHandler
      );
    }

    this.dom.root?.remove();

    this.dom =
      {};

    this.initialized =
      false;

    this.globalEventsBound =
      false;

    this.openState =
      false;

    this.destroyed =
      true;
  }
}


/* ============================================================
 * GLOBAL FACTORY / INITIALIZATION
 * ============================================================ */

function createCompassAI(
  options = {}
) {
  return new CompassAIAssistant(
    options
  );
}


/*
 * A single canonical singleton is retained.
 *
 * This prevents multiple global AI overlays from being created when
 * multiple modules request the shared assistant.
 */
let assistant =
  null;


function initializeCompassAI(
  options = {}
) {
  if (
    assistant &&
    !assistant.destroyed
  ) {
    assistant.init();

    assistant.refreshTriggerBinding();

    return assistant;
  }

  assistant =
    createCompassAI({
      autoMount:
        true,

      ...options
    });

  globalThis.GovCareerCompassAI =
    assistant;

  return assistant;
}


/*
 * Preserve the existing compatibility behavior:
 *
 * - direct module import automatically creates the global component;
 * - app.js can later explicitly initialize the same singleton.
 */
assistant =
  initializeCompassAI();


/* ============================================================
 * GLOBAL INTEGRATION CONTRACT
 * ============================================================ */

globalThis.GovCareerCompassAI =
  assistant;

globalThis.GovCareerCompassAI.create =
  createCompassAI;

globalThis.GovCareerCompassAI.initialize =
  initializeCompassAI;

globalThis.GovCareerCompassAI.getIdentity =
  () =>
    Object.freeze({
      productName:
        PUBLIC_IDENTITY.productName,

      assistantName:
        PUBLIC_IDENTITY.assistantName,

      ownerPublicName:
        PUBLIC_IDENTITY.ownerPublicName,

      ownerPublicRole:
        PUBLIC_IDENTITY.ownerPublicRole
    });

globalThis.GovCareerCompass =
  globalThis.GovCareerCompass ||
  {};

globalThis.GovCareerCompass.openAI =
  () =>
    assistant.open();

globalThis.GovCareerCompass.closeAI =
  () =>
    assistant.close();

globalThis.GovCareerCompass.toggleAI =
  () =>
    assistant.toggle();


/* ============================================================
 * DOM-READINESS COMPATIBILITY
 * ============================================================ */

function bindAfterDomReady() {
  if (
    !assistant
  ) {
    return;
  }

  assistant.bindTriggerElements();

  assistant.refreshTriggerBinding();
}


if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    bindAfterDomReady,
    {
      once:
        true
    }
  );
} else {
  bindAfterDomReady();
}


/* ============================================================
 * EXPORTS
 * ============================================================ */

export {
  CompassAIAssistant,
  createCompassAI,
  initializeCompassAI
};


export default assistant;
