/**
 * GovCareer Compass — Compass AI Assistant
 * File: /js/components/ai-assistant.js
 *
 * Purpose
 * -------
 * Global, responsive Compass AI interface used from the shared site header.
 *
 * Design
 * ------
 * - Floating glassmorphism panel on desktop/tablet.
 * - Bottom-sheet / near-full-screen experience on small screens.
 * - English + Bengali UI support.
 * - Auto / Career / Eligibility / Exams / Jobs / Salary / Compare modes.
 * - Current-page awareness.
 * - Conversation persistence during the browser session.
 * - Safe default fallback behavior when the backend is unavailable.
 * - No API secrets are stored or transmitted from this component.
 *
 * Backend contract
 * ----------------
 * POST /api/chat
 *
 * Request:
 * {
 *   message: string,
 *   mode: string,
 *   locale: string,
 *   conversation: Array,
 *   pageContext: object,
 *   clientContext: object
 * }
 *
 * Expected response may contain:
 * {
 *   answer: string,
 *   language: string,
 *   intent: string,
 *   confidence: string,
 *   sources: Array,
 *   recommendations: Array,
 *   relatedItems: Array,
 *   warnings: Array,
 *   actions: Array
 * }
 *
 * The component intentionally tolerates a few response-shape variations so
 * the backend can evolve without breaking the UI.
 */

(function bootstrapCompassAI(global, document) {
  "use strict";

  const APP_NAME = "GovCareer Compass";
  const AI_NAME = "Compass AI";
  const OWNER_NAME = "Abhijit Dutta";
  const OWNER_PUBLIC_ROLE = "Developer and owner of GovCareer Compass";

  const ENDPOINT = "/api/chat";

  const STORAGE = {
    locale: "gcc.locale",
    history: "gcc.compass-ai.history",
    mode: "gcc.compass-ai.mode"
  };

  const LIMITS = {
    maxInputLength: 4000,
    maxHistoryItems: 30,
    maxStoredMessages: 40,
    maxVisibleSources: 6,
    maxRelatedItems: 6
  };

  const MODES = [
    {
      id: "auto",
      label: {
        en: "Auto",
        bn: "অটো"
      }
    },
    {
      id: "career",
      label: {
        en: "Career",
        bn: "ক্যারিয়ার"
      }
    },
    {
      id: "eligibility",
      label: {
        en: "Eligibility",
        bn: "যোগ্যতা"
      }
    },
    {
      id: "exams",
      label: {
        en: "Exams",
        bn: "পরীক্ষা"
      }
    },
    {
      id: "jobs",
      label: {
        en: "Jobs",
        bn: "চাকরি"
      }
    },
    {
      id: "salary",
      label: {
        en: "Salary",
        bn: "বেতন"
      }
    },
    {
      id: "compare",
      label: {
        en: "Compare",
        bn: "তুলনা"
      }
    }
  ];

  const TRANSLATIONS = {
    en: {
      assistantSubtitle: "Government Career Intelligence",
      online: "Ready",
      offline: "Unavailable",
      close: "Close Compass AI",
      minimize: "Minimize",
      newChat: "New conversation",
      clearChat: "Clear conversation",
      suggestionsTitle: "Try asking",
      suggestion1: "Which government jobs fit my qualification?",
      suggestion2: "Check my eligibility for a government job",
      suggestion3: "Compare two government careers",
      suggestion4: "Which exams should I target?",
      suggestion5: "Explain the salary and promotion of this post",
      inputPlaceholder: "Ask Compass AI about government careers...",
      send: "Send",
      stop: "Stop",
      thinking: "Analyzing your question…",
      errorTitle: "Compass AI could not complete that request.",
      errorGeneric: "Something went wrong. Please try again.",
      errorNetwork: "The AI service is temporarily unavailable. Please try again.",
      emptyQuestion: "Please enter a question first.",
      tooLong: "Your message is too long. Please shorten it.",
      noRelevantData:
        "I could not find enough verified GovCareer Compass data to answer that precisely.",
      outOfScope:
        "I’m Compass AI, focused primarily on government careers, exams, eligibility, recruitment, salary, postings, promotion, work-life and related GovCareer Compass information.",
      sources: "Sources",
      related: "Related",
      confidence: "Confidence",
      high: "High",
      medium: "Medium",
      low: "Low",
      verified: "Verified platform data",
      general: "General information",
      mode: "Mode",
      footer: "GovCareer Compass",
      createdBy: `Created by ${OWNER_NAME}`,
      clearConfirm: "Clear this conversation?",
      yes: "Clear",
      no: "Cancel",
      goTo: "Open",
      copied: "Copied",
      copy: "Copy",
      responseFailed: "The response could not be displayed safely.",
      ownerAnswer:
        `I’m Compass AI, the AI assistant of GovCareer Compass. I was created by ${OWNER_NAME}, the owner of GovCareer Compass.`,
      ownerAboutAnswer:
        `${OWNER_NAME} is a ${OWNER_PUBLIC_ROLE.toLowerCase()}.`,
      welcome:
        "Hello. I’m Compass AI, your GovCareer Compass assistant. Ask me about government jobs, exams, eligibility, salary, recruitment, career fit, comparisons or related information."
    },

    bn: {
      assistantSubtitle: "সরকারি ক্যারিয়ার ইন্টেলিজেন্স",
      online: "প্রস্তুত",
      offline: "সাময়িকভাবে unavailable",
      close: "Compass AI বন্ধ করুন",
      minimize: "ছোট করুন",
      newChat: "নতুন কথোপকথন",
      clearChat: "কথোপকথন মুছুন",
      suggestionsTitle: "এভাবে জিজ্ঞাসা করতে পারেন",
      suggestion1: "আমার যোগ্যতার জন্য কোন সরকারি চাকরি উপযুক্ত?",
      suggestion2: "কোনো সরকারি চাকরির জন্য আমার eligibility পরীক্ষা করুন",
      suggestion3: "দুটি সরকারি চাকরির তুলনা করুন",
      suggestion4: "আমার কোন কোন সরকারি পরীক্ষা লক্ষ্য করা উচিত?",
      suggestion5: "এই পদের বেতন ও promotion বুঝিয়ে বলুন",
      inputPlaceholder: "সরকারি ক্যারিয়ার সম্পর্কে Compass AI-কে জিজ্ঞাসা করুন...",
      send: "পাঠান",
      stop: "বন্ধ করুন",
      thinking: "আপনার প্রশ্ন বিশ্লেষণ করা হচ্ছে…",
      errorTitle: "Compass AI এই অনুরোধটি সম্পূর্ণ করতে পারেনি।",
      errorGeneric: "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।",
      errorNetwork: "AI পরিষেবাটি বর্তমানে সাময়িকভাবে unavailable। আবার চেষ্টা করুন।",
      emptyQuestion: "প্রথমে একটি প্রশ্ন লিখুন।",
      tooLong: "আপনার বার্তাটি খুব বড়। অনুগ্রহ করে ছোট করুন।",
      noRelevantData:
        "এই প্রশ্নের সঠিক উত্তর দেওয়ার জন্য পর্যাপ্ত যাচাইকৃত GovCareer Compass তথ্য পাওয়া যায়নি।",
      outOfScope:
        "আমি Compass AI—মূলত সরকারি চাকরি, পরীক্ষা, eligibility, recruitment, salary, posting, promotion, work-life এবং GovCareer Compass-সম্পর্কিত তথ্যের জন্য তৈরি।",
      sources: "উৎস",
      related: "সম্পর্কিত",
      confidence: "বিশ্বাসযোগ্যতা",
      high: "উচ্চ",
      medium: "মাঝারি",
      low: "কম",
      verified: "যাচাইকৃত প্ল্যাটফর্ম ডেটা",
      general: "সাধারণ তথ্য",
      mode: "মোড",
      footer: "GovCareer Compass",
      createdBy: `${OWNER_NAME} দ্বারা তৈরি`,
      clearConfirm: "এই কথোপকথনটি মুছে ফেলবেন?",
      yes: "মুছুন",
      no: "বাতিল",
      goTo: "খুলুন",
      copied: "কপি হয়েছে",
      copy: "কপি",
      responseFailed: "উত্তরটি নিরাপদভাবে প্রদর্শন করা যায়নি।",
      ownerAnswer:
        `আমি GovCareer Compass-এর AI সহকারী Compass AI। আমাকে GovCareer Compass-এর মালিক ${OWNER_NAME} তৈরি করেছেন।`,
      ownerAboutAnswer:
        `${OWNER_NAME} একজন ${OWNER_PUBLIC_ROLE === "Developer and owner of GovCareer Compass" ? "ডেভেলপার এবং GovCareer Compass-এর মালিক" : "ডেভেলপার"}।`,
      welcome:
        "নমস্কার। আমি Compass AI, GovCareer Compass-এর সহকারী। সরকারি চাকরি, পরীক্ষা, eligibility, salary, recruitment, career fit, comparison বা সম্পর্কিত তথ্য সম্পর্কে প্রশ্ন করুন।"
    }
  };

  function safeStorageGet(key, fallback = null) {
    try {
      const value = global.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function safeStorageSet(key, value) {
    try {
      global.localStorage.setItem(key, value);
    } catch {
      // Storage may be unavailable in private/restricted contexts.
    }
  }

  function safeStorageRemove(key) {
    try {
      global.localStorage.removeItem(key);
    } catch {
      // Ignore storage failures.
    }
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHTML(value);
  }

  function normaliseLocale(value) {
    const raw = String(value || "").toLowerCase();

    if (raw === "bn" || raw.startsWith("bn-")) {
      return "bn";
    }

    return "en";
  }

  function getCurrentLocale() {
    const stored = safeStorageGet(STORAGE.locale);
    if (stored) {
      return normaliseLocale(stored);
    }

    const htmlLang = document.documentElement?.getAttribute("lang");
    if (htmlLang) {
      return normaliseLocale(htmlLang);
    }

    return "en";
  }

  function getTranslation(locale) {
    return TRANSLATIONS[normaliseLocale(locale)] || TRANSLATIONS.en;
  }

  function truncateText(text, max = 600) {
    const value = String(text ?? "");
    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normaliseHistory(rawHistory) {
    if (!Array.isArray(rawHistory)) {
      return [];
    }

    return rawHistory
      .filter((item) => {
        return (
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.content === "string" &&
          item.content.trim()
        );
      })
      .slice(-LIMITS.maxStoredMessages)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, LIMITS.maxInputLength),
        timestamp:
          typeof item.timestamp === "string"
            ? item.timestamp
            : new Date().toISOString(),
        intent: typeof item.intent === "string" ? item.intent : "",
        confidence:
          typeof item.confidence === "string" ? item.confidence : ""
      }));
  }

  function loadHistory() {
    const raw = safeStorageGet(STORAGE.history);
    if (!raw) {
      return [];
    }

    try {
      return normaliseHistory(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  function saveHistory(history) {
    safeStorageSet(
      STORAGE.history,
      JSON.stringify(normaliseHistory(history))
    );
  }

  function detectLocalIdentityAnswer(question, locale) {
    const text = String(question || "").trim().toLowerCase();

    const ownerPatterns = [
      "who made you",
      "who created you",
      "who built you",
      "who is your creator",
      "who owns you",
      "who made compass ai",
      "who created compass ai",
      "who built compass ai",
      "কে তোমাকে বানিয়েছে",
      "কে তোমাকে তৈরি করেছে",
      "তোমাকে কে বানিয়েছে",
      "কম্পাস ai কে বানিয়েছে",
      "কম্পাস এআই কে তৈরি করেছে",
      "তোমার নির্মাতা কে",
      "তোমার মালিক কে"
    ];

    const aboutOwnerPatterns = [
      "who is abhijit dutta",
      "who is abhi jit dutta",
      "abhijit dutta কে",
      "অভিজিৎ দত্ত কে",
      "অভিজিত দত্ত কে"
    ];

    if (ownerPatterns.some((pattern) => text.includes(pattern))) {
      return {
        answer: getTranslation(locale).ownerAnswer,
        intent: "platform_identity",
        confidence: "high",
        local: true
      };
    }

    if (aboutOwnerPatterns.some((pattern) => text.includes(pattern))) {
      return {
        answer: getTranslation(locale).ownerAboutAnswer,
        intent: "platform_identity",
        confidence: "high",
        local: true
      };
    }

    return null;
  }

  function getMode(modeId) {
    return MODES.find((mode) => mode.id === modeId) || MODES[0];
  }

  function getModeLabel(modeId, locale) {
    return getMode(modeId).label[normaliseLocale(locale)];
  }

  function getPageContext() {
    const body = document.body;

    const context = {
      pathname: global.location?.pathname || "",
      href: global.location?.href || "",
      title: document.title || "",
      language: getCurrentLocale(),
      pageId: body?.dataset?.page || "",
      pageType: body?.dataset?.pageType || "",
      entityId: body?.dataset?.entityId || "",
      entityType: body?.dataset?.entityType || ""
    };

    /*
     * Allow page controllers to expose richer context without coupling this
     * component to any one page implementation.
     */
    try {
      if (
        global.GovCareerCompass &&
        typeof global.GovCareerCompass.getPageContext === "function"
      ) {
        const supplied = global.GovCareerCompass.getPageContext();

        if (supplied && typeof supplied === "object") {
          Object.assign(context, supplied);
        }
      }
    } catch {
      // Page-specific context is optional.
    }

    /*
     * Optional DOM metadata:
     * <main data-ai-page-context='{"jobId":"..."}'>
     */
    const contextElement = document.querySelector("[data-ai-page-context]");
    if (contextElement) {
      const raw = contextElement.getAttribute("data-ai-page-context");

      if (raw) {
        try {
          const parsed = JSON.parse(raw);

          if (parsed && typeof parsed === "object") {
            context.domContext = parsed;
          }
        } catch {
          // Invalid optional metadata should never break the AI component.
        }
      }
    }

    return context;
  }

  function getClientContext() {
    return {
      platform: APP_NAME,
      assistant: AI_NAME,
      ownerName: OWNER_NAME,
      locale: getCurrentLocale(),
      viewport: {
        width: global.innerWidth || 0,
        height: global.innerHeight || 0
      },
      colorScheme:
        global.matchMedia &&
        global.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
    };
  }

  function formatResponseText(text) {
    /*
     * Do not inject model output as HTML.
     *
     * We intentionally render text safely and then apply only a very small
     * presentation layer for line breaks. Markdown rendering should be handled
     * by a dedicated trusted parser later if the backend contract explicitly
     * adopts one.
     */
    return escapeHTML(String(text ?? "")).replace(/\n/g, "<br>");
  }

  function formatSource(source) {
    if (!source) {
      return null;
    }

    if (typeof source === "string") {
      return {
        title: truncateText(source, 160),
        url: ""
      };
    }

    if (typeof source === "object") {
      return {
        title: truncateText(
          source.title ||
            source.name ||
            source.label ||
            source.description ||
            "Source",
          160
        ),
        url:
          typeof source.url === "string" && /^https?:\/\//i.test(source.url)
            ? source.url
            : ""
      };
    }

    return null;
  }

  function normaliseAIResponse(payload, locale) {
    const fallback = getTranslation(locale);

    if (!payload || typeof payload !== "object") {
      return {
        answer: fallback.responseFailed,
        language: locale,
        intent: "",
        confidence: "low",
        sources: [],
        recommendations: [],
        relatedItems: [],
        warnings: []
      };
    }

    let answer =
      typeof payload.answer === "string"
        ? payload.answer.trim()
        : typeof payload.message === "string"
          ? payload.message.trim()
          : typeof payload.content === "string"
            ? payload.content.trim()
            : "";

    if (!answer) {
      answer = fallback.responseFailed;
    }

    const sources = safeArray(payload.sources)
      .map(formatSource)
      .filter(Boolean)
      .slice(0, LIMITS.maxVisibleSources);

    const recommendations = safeArray(payload.recommendations)
      .slice(0, LIMITS.maxRelatedItems)
      .map((item) => {
        if (typeof item === "string") {
          return {
            title: item,
            description: "",
            url: ""
          };
        }

        return {
          title: truncateText(item?.title || item?.name || "Recommendation", 160),
          description: truncateText(
            item?.description || item?.reason || "",
            500
          ),
          url:
            typeof item?.url === "string" &&
            /^(https?:\/\/|\/)/i.test(item.url)
              ? item.url
              : ""
        };
      });

    const relatedItems = safeArray(payload.relatedItems)
      .slice(0, LIMITS.maxRelatedItems)
      .map((item) => {
        if (typeof item === "string") {
          return {
            title: truncateText(item, 160),
            description: "",
            url: ""
          };
        }

        return {
          title: truncateText(item?.title || item?.name || "Related item", 160),
          description: truncateText(
            item?.description || item?.reason || "",
            500
          ),
          url:
            typeof item?.url === "string" &&
            /^(https?:\/\/|\/)/i.test(item.url)
              ? item.url
              : ""
        };
      });

    return {
      answer,
      language: normaliseLocale(payload.language || locale),
      intent: typeof payload.intent === "string" ? payload.intent : "",
      confidence:
        typeof payload.confidence === "string"
          ? payload.confidence.toLowerCase()
          : "",
      sources,
      recommendations,
      relatedItems,
      warnings: safeArray(payload.warnings)
        .filter((item) => typeof item === "string")
        .slice(0, 5)
    };
  }

  class CompassAIAssistant {
    constructor(options = {}) {
      this.options = {
        endpoint: options.endpoint || ENDPOINT,
        triggerSelector:
          options.triggerSelector || "[data-compass-ai-trigger], #compassAiTrigger",
        mountTarget: options.mountTarget || document.body,
        persistHistory:
          typeof options.persistHistory === "boolean"
            ? options.persistHistory
            : true,
        autoMount:
          typeof options.autoMount === "boolean" ? options.autoMount : true
      };

      this.locale = getCurrentLocale();
      this.mode =
        safeStorageGet(STORAGE.mode, "auto") &&
        getMode(safeStorageGet(STORAGE.mode, "auto"))
          ? safeStorageGet(STORAGE.mode, "auto")
          : "auto";

      this.history = this.options.persistHistory ? loadHistory() : [];
      this.abortController = null;
      this.openState = false;
      this.isBusy = false;
      this.dom = {};
      this.styleInjected = false;

      if (this.options.autoMount) {
        this.init();
      }
    }

    init() {
      if (this.dom.root) {
        return this;
      }

      this.injectStyles();
      this.createRoot();
      this.bindTrigger();
      this.bindEvents();
      this.applyLocale();
      this.renderHistory();

      return this;
    }

    injectStyles() {
      if (this.styleInjected || document.querySelector("[data-gcc-compass-ai-style]")) {
        this.styleInjected = true;
        return;
      }

      const style = document.createElement("style");
      style.setAttribute("data-gcc-compass-ai-style", "true");

      style.textContent = `
        .gcc-ai {
          --gcc-ai-z: 1000;
          position: fixed;
          inset: 0;
          z-index: var(--gcc-ai-z);
          pointer-events: none;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        .gcc-ai[hidden] {
          display: none;
        }

        .gcc-ai__backdrop {
          position: absolute;
          inset: 0;
          background: rgba(3, 10, 20, .38);
          opacity: 0;
          transition: opacity .2s ease;
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
          grid-template-rows: auto auto 1fr auto auto;
          overflow: hidden;
          pointer-events: auto;
          border: 1px solid var(--line, rgba(159,190,225,.18));
          border-radius: 24px;
          background:
            linear-gradient(
              155deg,
              rgba(255,255,255,.10),
              rgba(255,255,255,.035)
            ),
            var(--panel, rgba(18,32,54,.90));
          color: var(--text, #edf5ff);
          box-shadow:
            0 30px 90px rgba(0,0,0,.34),
            0 0 0 1px rgba(18,183,211,.04) inset;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          transform: translateY(16px) scale(.985);
          opacity: 0;
          visibility: hidden;
          transition:
            opacity .2s ease,
            transform .2s ease,
            visibility .2s ease;
        }

        .gcc-ai.is-open .gcc-ai__panel {
          transform: translateY(0) scale(1);
          opacity: 1;
          visibility: visible;
        }

        .gcc-ai__header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 16px 13px;
          border-bottom: 1px solid var(--line, rgba(159,190,225,.14));
          background:
            radial-gradient(circle at 12% 0%, rgba(18,183,211,.13), transparent 42%),
            radial-gradient(circle at 100% 0%, rgba(94,104,229,.12), transparent 40%);
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
          background: linear-gradient(135deg, #12B7D3, #5E68E5);
          color: #07111f;
          box-shadow: 0 8px 24px rgba(18,183,211,.18);
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
          color: var(--muted, #9db0c8);
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
          color: var(--muted, #9db0c8);
          font-size: 10px;
        }

        .gcc-ai__status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10A875;
          box-shadow: 0 0 0 4px rgba(16,168,117,.10);
        }

        .gcc-ai__status-dot.is-error {
          background: #DA4A5C;
          box-shadow: 0 0 0 4px rgba(218,74,92,.10);
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
          border: 1px solid var(--line, rgba(159,190,225,.15));
          border-radius: 10px;
          background: rgba(255,255,255,.025);
          color: var(--text, #edf5ff);
          cursor: pointer;
        }

        .gcc-ai__icon-button:hover {
          background: rgba(18,183,211,.08);
          border-color: rgba(18,183,211,.22);
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
          border-bottom: 1px solid var(--line, rgba(159,190,225,.10));
        }

        .gcc-ai__mode {
          flex: 0 0 auto;
          min-height: 32px;
          border: 1px solid var(--line, rgba(159,190,225,.15));
          border-radius: 999px;
          padding: 6px 11px;
          color: var(--muted, #9db0c8);
          background: rgba(255,255,255,.018);
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
        }

        .gcc-ai__mode:hover {
          border-color: rgba(18,183,211,.26);
          color: var(--text, #edf5ff);
        }

        .gcc-ai__mode.is-active {
          color: #07111f;
          border-color: transparent;
          background: linear-gradient(135deg, #12B7D3, #5E68E5);
          box-shadow: 0 6px 18px rgba(18,183,211,.14);
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
          color: var(--muted, #9db0c8);
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
          border: 1px solid var(--line, rgba(159,190,225,.13));
          border-radius: 13px;
          background: rgba(255,255,255,.018);
          color: var(--text, #edf5ff);
          font: inherit;
          font-size: 11px;
          line-height: 1.45;
          cursor: pointer;
        }

        .gcc-ai__suggestion:hover {
          border-color: rgba(18,183,211,.23);
          background: rgba(18,183,211,.05);
        }

        .gcc-ai__message {
          display: flex;
          gap: 9px;
          margin: 0 0 14px;
          animation: gcc-ai-in .16s ease;
        }

        @keyframes gcc-ai-in {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .gcc-ai__message.is-user {
          justify-content: flex-end;
        }

        .gcc-ai__bubble {
          max-width: 88%;
          padding: 11px 12px;
          border-radius: 15px;
          border: 1px solid var(--line, rgba(159,190,225,.13));
          font-size: 12px;
          line-height: 1.65;
          overflow-wrap: anywhere;
        }

        .gcc-ai__message.is-assistant .gcc-ai__bubble {
          background: rgba(255,255,255,.035);
          border-top-left-radius: 6px;
        }

        .gcc-ai__message.is-user .gcc-ai__bubble {
          color: #07111f;
          background: linear-gradient(135deg, #12B7D3, #79E2F2);
          border-color: transparent;
          border-top-right-radius: 6px;
        }

        .gcc-ai__meta {
          margin: 0 0 5px;
          color: var(--muted, #9db0c8);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: .045em;
          text-transform: uppercase;
        }

        .gcc-ai__message.is-user .gcc-ai__meta {
          color: rgba(7,17,31,.64);
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
          animation: gcc-ai-dot 1.1s infinite ease-in-out;
        }

        .gcc-ai__typing span:nth-child(2) {
          animation-delay: .13s;
        }

        .gcc-ai__typing span:nth-child(3) {
          animation-delay: .26s;
        }

        @keyframes gcc-ai-dot {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: .3;
          }
          30% {
            transform: translateY(-3px);
            opacity: .9;
          }
        }

        .gcc-ai__result-block {
          margin-top: 12px;
          padding-top: 10px;
          border-top: 1px solid var(--line, rgba(159,190,225,.10));
        }

        .gcc-ai__result-label {
          margin: 0 0 7px;
          color: var(--muted, #9db0c8);
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
          border: 1px solid var(--line, rgba(159,190,225,.13));
          border-radius: 999px;
          color: var(--muted, #9db0c8);
          background: rgba(255,255,255,.018);
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
          border: 1px solid var(--line, rgba(159,190,225,.12));
          border-radius: 10px;
          color: inherit;
          text-decoration: none;
          background: rgba(255,255,255,.015);
        }

        .gcc-ai__source:hover,
        .gcc-ai__related:hover {
          border-color: rgba(18,183,211,.22);
          background: rgba(18,183,211,.04);
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
          color: var(--muted, #9db0c8);
          font-size: 9px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .gcc-ai__warning {
          margin-top: 9px;
          padding: 9px 10px;
          border: 1px solid rgba(215,151,24,.22);
          border-radius: 11px;
          color: var(--muted, #9db0c8);
          background: rgba(215,151,24,.055);
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
          color: var(--muted, #9db0c8);
          cursor: pointer;
          font: inherit;
          font-size: 9px;
        }

        .gcc-ai__small-button:hover {
          color: var(--text, #edf5ff);
        }

        .gcc-ai__composer {
          padding: 10px 12px 12px;
          border-top: 1px solid var(--line, rgba(159,190,225,.11));
          background: rgba(0,0,0,.06);
        }

        .gcc-ai__composer-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 7px;
        }

        .gcc-ai__composer-mode {
          color: var(--muted, #9db0c8);
          font-size: 9px;
          font-weight: 700;
        }

        .gcc-ai__char-count {
          color: var(--muted, #9db0c8);
          font-size: 9px;
        }

        .gcc-ai__input-wrap {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 8px;
          align-items: end;
          padding: 8px;
          border: 1px solid var(--line, rgba(159,190,225,.16));
          border-radius: 15px;
          background: rgba(255,255,255,.025);
          transition: border-color .15s ease, box-shadow .15s ease;
        }

        .gcc-ai__input-wrap:focus-within {
          border-color: rgba(18,183,211,.34);
          box-shadow: 0 0 0 3px rgba(18,183,211,.07);
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
          color: var(--text, #edf5ff);
          font: inherit;
          font-size: 12px;
          line-height: 1.5;
        }

        .gcc-ai__textarea::placeholder {
          color: var(--muted, #9db0c8);
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
          background: linear-gradient(135deg, #12B7D3, #5E68E5);
          color: #07111f;
          cursor: pointer;
          box-shadow: 0 7px 20px rgba(18,183,211,.17);
        }

        .gcc-ai__send:disabled {
          cursor: not-allowed;
          opacity: .45;
          box-shadow: none;
        }

        .gcc-ai__send svg {
          width: 17px;
          height: 17px;
        }

        .gcc-ai__footnote {
          margin: 8px 2px 0;
          color: var(--muted, #9db0c8);
          font-size: 8px;
          line-height: 1.4;
          text-align: center;
        }

        .gcc-ai__confirm {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(320px, calc(100vw - 34px));
          transform: translate(-50%, -46%);
          padding: 18px;
          border: 1px solid var(--line, rgba(159,190,225,.18));
          border-radius: 18px;
          background: var(--panel, rgba(18,32,54,.96));
          box-shadow: 0 30px 80px rgba(0,0,0,.34);
          opacity: 0;
          visibility: hidden;
          transition: opacity .18s ease, transform .18s ease, visibility .18s ease;
          pointer-events: none;
        }

        .gcc-ai.has-confirm .gcc-ai__confirm {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, -50%);
          pointer-events: auto;
        }

        .gcc-ai__confirm-title {
          margin: 0 0 8px;
          font-size: 15px;
          font-weight: 800;
        }

        .gcc-ai__confirm-text {
          margin: 0;
          color: var(--muted, #9db0c8);
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
          border: 1px solid var(--line, rgba(159,190,225,.15));
          background: rgba(255,255,255,.025);
          color: var(--text, #edf5ff);
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
          border: 1px solid rgba(218,74,92,.22);
          border-radius: 13px;
          background: rgba(218,74,92,.05);
          color: var(--muted, #9db0c8);
          font-size: 11px;
          line-height: 1.55;
        }

        @media (max-width: 760px) {
          .gcc-ai__backdrop {
            background: rgba(3,10,20,.52);
          }

          .gcc-ai__panel {
            top: auto;
            right: 0;
            bottom: 0;
            width: 100%;
            height: min(94dvh, 900px);
            max-height: 100dvh;
            border-radius: 24px 24px 0 0;
            border-bottom: 0;
            transform: translateY(28px);
          }

          .gcc-ai__header {
            padding-top: max(13px, env(safe-area-inset-top));
          }

          .gcc-ai__conversation {
            padding-bottom: 14px;
          }

          .gcc-ai__bubble {
            max-width: 91%;
          }

          .gcc-ai__composer {
            padding-bottom: max(12px, env(safe-area-inset-bottom));
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

      document.head.appendChild(style);
      this.styleInjected = true;
    }

    createRoot() {
      const root = document.createElement("section");
      root.className = "gcc-ai";
      root.hidden = true;
      root.setAttribute("aria-label", AI_NAME);
      root.setAttribute("aria-hidden", "true");

      root.innerHTML = `
        <div class="gcc-ai__backdrop" data-ai-backdrop></div>

        <aside
          class="gcc-ai__panel"
          data-ai-panel
          role="dialog"
          aria-modal="true"
          aria-labelledby="gcc-ai-title"
          tabindex="-1"
        >
          <header class="gcc-ai__header">
            <div class="gcc-ai__brand">
              <div class="gcc-ai__brand-mark" aria-hidden="true">
                ${this.icon("compass")}
              </div>

              <div class="gcc-ai__title">
                <strong id="gcc-ai-title">${AI_NAME}</strong>
                <span class="gcc-ai__subtitle" data-ai-subtitle></span>
                <span class="gcc-ai__status">
                  <span class="gcc-ai__status-dot" data-ai-status-dot></span>
                  <span data-ai-status></span>
                </span>
              </div>
            </div>

            <div class="gcc-ai__header-actions">
              <button
                type="button"
                class="gcc-ai__icon-button"
                data-ai-new
                title=""
                aria-label=""
              >
                ${this.icon("plus")}
              </button>

              <button
                type="button"
                class="gcc-ai__icon-button"
                data-ai-close
                title=""
                aria-label=""
              >
                ${this.icon("close")}
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

          <div class="gcc-ai__composer">
            <div class="gcc-ai__composer-top">
              <span class="gcc-ai__composer-mode" data-ai-current-mode></span>
              <span class="gcc-ai__char-count" data-ai-char-count>0 / ${LIMITS.maxInputLength}</span>
            </div>

            <div class="gcc-ai__input-wrap">
              <textarea
                class="gcc-ai__textarea"
                data-ai-input
                rows="1"
                maxlength="${LIMITS.maxInputLength}"
              ></textarea>

              <button
                type="button"
                class="gcc-ai__send"
                data-ai-send
                aria-label=""
              >
                ${this.icon("send")}
              </button>
            </div>

            <div class="gcc-ai__footnote" data-ai-footnote></div>
          </div>
        </aside>

        <div class="gcc-ai__confirm" data-ai-confirm>
          <h2 class="gcc-ai__confirm-title" data-ai-confirm-title></h2>
          <p class="gcc-ai__confirm-text" data-ai-confirm-text></p>

          <div class="gcc-ai__confirm-actions">
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
      `;

      this.options.mountTarget.appendChild(root);

      this.dom.root = root;
      this.dom.panel = root.querySelector("[data-ai-panel]");
      this.dom.backdrop = root.querySelector("[data-ai-backdrop]");
      this.dom.modebar = root.querySelector("[data-ai-modebar]");
      this.dom.conversation = root.querySelector("[data-ai-conversation]");
      this.dom.input = root.querySelector("[data-ai-input]");
      this.dom.send = root.querySelector("[data-ai-send]");
      this.dom.charCount = root.querySelector("[data-ai-char-count]");
      this.dom.currentMode = root.querySelector("[data-ai-current-mode]");
      this.dom.subtitle = root.querySelector("[data-ai-subtitle]");
      this.dom.status = root.querySelector("[data-ai-status]");
      this.dom.statusDot = root.querySelector("[data-ai-status-dot]");
      this.dom.footnote = root.querySelector("[data-ai-footnote]");
      this.dom.newButton = root.querySelector("[data-ai-new]");
      this.dom.closeButton = root.querySelector("[data-ai-close]");
      this.dom.confirm = root.querySelector("[data-ai-confirm]");
      this.dom.confirmTitle = root.querySelector("[data-ai-confirm-title]");
      this.dom.confirmText = root.querySelector("[data-ai-confirm-text]");
      this.dom.confirmYes = root.querySelector("[data-ai-confirm-yes]");
      this.dom.confirmNo = root.querySelector("[data-ai-confirm-no]");
    }

    bindTrigger() {
      const triggers = document.querySelectorAll(this.options.triggerSelector);

      triggers.forEach((trigger) => {
        if (trigger.dataset.gccAITriggerBound === "true") {
          return;
        }

        trigger.dataset.gccAITriggerBound = "true";

        trigger.addEventListener("click", (event) => {
          event.preventDefault();
          this.toggle();
        });
      });
    }

    bindEvents() {
      this.dom.closeButton.addEventListener("click", () => this.close());

      this.dom.backdrop.addEventListener("click", () => this.close());

      this.dom.newButton.addEventListener("click", () => {
        this.requestClearHistory();
      });

      this.dom.send.addEventListener("click", () => {
        this.submit();
      });

      this.dom.input.addEventListener("input", () => {
        this.resizeTextarea();
        this.updateComposerState();
      });

      this.dom.input.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          this.submit();
        }
      });

      this.dom.confirmYes.addEventListener("click", () => {
        this.clearHistory();
        this.closeConfirm();
      });

      this.dom.confirmNo.addEventListener("click", () => {
        this.closeConfirm();
      });

      document.addEventListener("keydown", (event) => {
        if (!this.openState) {
          return;
        }

        if (event.key === "Escape") {
          if (this.dom.confirm?.classList.contains("is-open")) {
            this.closeConfirm();
            return;
          }

          this.close();
        }
      });

      window.addEventListener("popstate", () => {
        if (this.openState) {
          this.close();
        }
      });

      window.addEventListener("resize", () => {
        if (!this.dom.input) {
          return;
        }

        this.resizeTextarea();
      });
    }

    icon(name) {
      /*
       * The project can use Lucide when it is available. The fallback SVGs
       * ensure this component still functions before the shared icon library
       * is loaded.
       */
      const fallback = {
        compass: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="m15.6 8.4-2.2 4.9-4.9 2.2 2.2-4.9 4.9-2.2Z"></path>
          </svg>
        `,
        plus: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
        `,
        close: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="m6 6 12 12"></path>
            <path d="m18 6-12 12"></path>
          </svg>
        `,
        send: `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
               aria-hidden="true">
            <path d="m22 2-7 20-4-9-9-4Z"></path>
            <path d="M22 2 11 13"></path>
          </svg>
        `
      };

      return fallback[name] || "";
    }

    applyLocale(locale = this.locale) {
      this.locale = normaliseLocale(locale);
      safeStorageSet(STORAGE.locale, this.locale);

      const t = getTranslation(this.locale);

      document.documentElement.setAttribute("data-ai-locale", this.locale);

      this.dom.subtitle.textContent = t.assistantSubtitle;
      this.dom.status.textContent = t.online;
      this.dom.newButton.title = t.newChat;
      this.dom.newButton.setAttribute("aria-label", t.newChat);
      this.dom.closeButton.title = t.close;
      this.dom.closeButton.setAttribute("aria-label", t.close);
      this.dom.send.setAttribute("aria-label", t.send);
      this.dom.input.placeholder = t.inputPlaceholder;
      this.dom.footnote.textContent = `${t.verified} · ${t.createdBy}`;
      this.dom.confirmTitle.textContent = t.clearChat;
      this.dom.confirmText.textContent = t.clearConfirm;
      this.dom.confirmYes.textContent = t.yes;
      this.dom.confirmNo.textContent = t.no;

      this.renderModes();
      this.updateComposerState();
    }

    setLocale(locale) {
      this.applyLocale(locale);
      this.renderHistory();
    }

    renderModes() {
      const locale = this.locale;

      this.dom.modebar.innerHTML = MODES.map((mode) => {
        const isActive = mode.id === this.mode;

        return `
          <button
            type="button"
            class="gcc-ai__mode${isActive ? " is-active" : ""}"
            data-ai-mode="${escapeAttribute(mode.id)}"
            role="tab"
            aria-selected="${isActive ? "true" : "false"}"
          >
            ${escapeHTML(mode.label[locale])}
          </button>
        `;
      }).join("");

      this.dom.modebar.querySelectorAll("[data-ai-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          this.setMode(button.dataset.aiMode || "auto");
        });
      });
    }

    setMode(modeId) {
      if (!MODES.some((mode) => mode.id === modeId)) {
        modeId = "auto";
      }

      this.mode = modeId;
      safeStorageSet(STORAGE.mode, this.mode);

      this.renderModes();
      this.updateComposerState();
    }

    updateComposerState() {
      const t = getTranslation(this.locale);
      const length = this.dom.input?.value?.length || 0;

      if (this.dom.charCount) {
        this.dom.charCount.textContent = `${length} / ${LIMITS.maxInputLength}`;
      }

      if (this.dom.currentMode) {
        this.dom.currentMode.textContent = `${t.mode}: ${getModeLabel(
          this.mode,
          this.locale
        )}`;
      }

      if (this.dom.send) {
        this.dom.send.disabled =
          this.isBusy || !String(this.dom.input?.value || "").trim();
        this.dom.send.setAttribute(
          "aria-label",
          this.isBusy ? t.stop : t.send
        );
        this.dom.send.title = this.isBusy ? t.stop : t.send;
      }
    }

    resizeTextarea() {
      const textarea = this.dom.input;

      if (!textarea) {
        return;
      }

      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 130)}px`;
    }

    renderHistory() {
      if (!this.dom.conversation) {
        return;
      }

      if (!this.history.length) {
        this.renderWelcome();
        return;
      }

      this.dom.conversation.innerHTML = "";

      this.history.forEach((item) => {
        this.appendStoredMessage(item);
      });

      this.scrollConversationToBottom(false);
    }

    renderWelcome() {
      const t = getTranslation(this.locale);

      const suggestions = [
        t.suggestion1,
        t.suggestion2,
        t.suggestion3,
        t.suggestion4,
        t.suggestion5
      ];

      this.dom.conversation.innerHTML = `
        <div class="gcc-ai__welcome">
          <h2 class="gcc-ai__welcome-heading">${escapeHTML(AI_NAME)}</h2>

          <p class="gcc-ai__welcome-text">
            ${escapeHTML(t.welcome)}
          </p>

          <div class="gcc-ai__suggestions">
            <div class="gcc-ai__result-label">${escapeHTML(t.suggestionsTitle)}</div>

            ${suggestions
              .map(
                (text) => `
                  <button
                    type="button"
                    class="gcc-ai__suggestion"
                    data-ai-suggestion="${escapeAttribute(text)}"
                  >
                    ${escapeHTML(text)}
                  </button>
                `
              )
              .join("")}
          </div>
        </div>
      `;

      this.dom.conversation
        .querySelectorAll("[data-ai-suggestion]")
        .forEach((button) => {
          button.addEventListener("click", () => {
            this.dom.input.value = button.dataset.aiSuggestion || "";
            this.updateComposerState();
            this.resizeTextarea();
            this.dom.input.focus();
            this.submit();
          });
        });
    }

    appendStoredMessage(item) {
      const wrapper = document.createElement("div");

      wrapper.className = `gcc-ai__message ${
        item.role === "user" ? "is-user" : "is-assistant"
      }`;

      const label =
        item.role === "user"
          ? this.locale === "bn"
            ? "আপনি"
            : "You"
          : AI_NAME;

      wrapper.innerHTML = `
        <div class="gcc-ai__bubble">
          <div class="gcc-ai__meta">${escapeHTML(label)}</div>
          <div>${formatResponseText(item.content)}</div>
        </div>
      `;

      this.dom.conversation.appendChild(wrapper);
    }

    appendUserMessage(text) {
      const message = {
        role: "user",
        content: text,
        timestamp: new Date().toISOString()
      };

      this.history.push(message);

      if (this.options.persistHistory) {
        saveHistory(this.history);
      }

      const wrapper = document.createElement("div");

      wrapper.className = "gcc-ai__message is-user";

      wrapper.innerHTML = `
        <div class="gcc-ai__bubble">
          <div class="gcc-ai__meta">
            ${this.locale === "bn" ? "আপনি" : "You"}
          </div>
          <div>${formatResponseText(text)}</div>
        </div>
      `;

      this.dom.conversation.appendChild(wrapper);
      this.scrollConversationToBottom();

      return message;
    }

    appendAssistantPlaceholder() {
      const wrapper = document.createElement("div");

      wrapper.className = "gcc-ai__message is-assistant";
      wrapper.dataset.aiPlaceholder = "true";

      const t = getTranslation(this.locale);

      wrapper.innerHTML = `
        <div class="gcc-ai__bubble">
          <div class="gcc-ai__meta">${AI_NAME}</div>
          <div class="gcc-ai__typing" aria-label="${escapeAttribute(t.thinking)}">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      `;

      this.dom.conversation.appendChild(wrapper);
      this.scrollConversationToBottom();

      return wrapper;
    }

    replaceAssistantPlaceholder(element, response) {
      if (!element) {
        return;
      }

      const confidenceLabel = this.getConfidenceLabel(response.confidence);

      const sourcesHTML = response.sources.length
        ? `
          <div class="gcc-ai__result-block">
            <div class="gcc-ai__result-label">
              ${escapeHTML(getTranslation(this.locale).sources)}
            </div>

            <div class="gcc-ai__source-list">
              ${response.sources
                .map((source) => {
                  const content = `
                    <span class="gcc-ai__source-title">
                      ${escapeHTML(source.title)}
                    </span>
                    ${
                      source.url
                        ? `<span class="gcc-ai__source-url">${escapeHTML(
                            source.url
                          )}</span>`
                        : ""
                    }
                  `;

                  if (source.url) {
                    return `
                      <a
                        class="gcc-ai__source"
                        href="${escapeAttribute(source.url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ${content}
                      </a>
                    `;
                  }

                  return `
                    <div class="gcc-ai__source">
                      ${content}
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>
        `
        : "";

      const related = [...response.recommendations, ...response.relatedItems]
        .slice(0, LIMITS.maxRelatedItems);

      const relatedHTML = related.length
        ? `
          <div class="gcc-ai__result-block">
            <div class="gcc-ai__result-label">
              ${escapeHTML(getTranslation(this.locale).related)}
            </div>

            <div class="gcc-ai__related-list">
              ${related
                .map((item) => {
                  const body = `
                    <span class="gcc-ai__related-title">
                      ${escapeHTML(item.title)}
                    </span>
                    ${
                      item.description
                        ? `<span class="gcc-ai__source-url">${escapeHTML(
                            item.description
                          )}</span>`
                        : ""
                    }
                  `;

                  if (item.url) {
                    return `
                      <a
                        class="gcc-ai__related"
                        href="${escapeAttribute(item.url)}"
                      >
                        ${body}
                      </a>
                    `;
                  }

                  return `<div class="gcc-ai__related">${body}</div>`;
                })
                .join("")}
            </div>
          </div>
        `
        : "";

      const warningsHTML = response.warnings.length
        ? response.warnings
            .map(
              (warning) => `
                <div class="gcc-ai__warning">
                  ${escapeHTML(warning)}
                </div>
              `
            )
            .join("")
        : "";

      element.dataset.aiPlaceholder = "false";

      element.innerHTML = `
        <div class="gcc-ai__bubble">
          <div class="gcc-ai__meta">${AI_NAME}</div>

          <div>${formatResponseText(response.answer)}</div>

          ${
            response.confidence || response.intent
              ? `
                <div class="gcc-ai__result-block">
                  <div class="gcc-ai__chips">
                    ${
                      response.confidence
                        ? `
                          <span class="gcc-ai__chip">
                            ${escapeHTML(
                              getTranslation(this.locale).confidence
                            )}: ${escapeHTML(confidenceLabel)}
                          </span>
                        `
                        : ""
                    }

                    ${
                      response.intent
                        ? `
                          <span class="gcc-ai__chip">
                            ${escapeHTML(
                              getModeLabel(this.mapIntentToMode(response.intent), this.locale)
                            )}
                          </span>
                        `
                        : ""
                    }
                  </div>
                </div>
              `
              : ""
          }

          ${sourcesHTML}
          ${relatedHTML}
          ${warningsHTML}

          <div class="gcc-ai__message-actions">
            <button
              type="button"
              class="gcc-ai__small-button"
              data-copy-ai-response
            >
              ${escapeHTML(getTranslation(this.locale).copy)}
            </button>
          </div>
        </div>
      `;

      const copyButton = element.querySelector("[data-copy-ai-response]");

      if (copyButton) {
        copyButton.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(response.answer);
            copyButton.textContent = getTranslation(this.locale).copied;

            global.setTimeout(() => {
              copyButton.textContent = getTranslation(this.locale).copy;
            }, 1200);
          } catch {
            // Clipboard API may be unavailable.
          }
        });
      }
    }

    appendErrorMessage(message) {
      const wrapper = document.createElement("div");

      wrapper.className = "gcc-ai__message is-assistant";

      wrapper.innerHTML = `
        <div class="gcc-ai__bubble">
          <div class="gcc-ai__meta">${AI_NAME}</div>
          <div class="gcc-ai__error">
            ${escapeHTML(message)}
          </div>
        </div>
      `;

      this.dom.conversation.appendChild(wrapper);
      this.scrollConversationToBottom();
    }

    getConfidenceLabel(value) {
      const t = getTranslation(this.locale);

      switch (String(value || "").toLowerCase()) {
        case "high":
          return t.high;
        case "medium":
        case "moderate":
          return t.medium;
        case "low":
          return t.low;
        default:
          return value || "";
      }
    }

    mapIntentToMode(intent) {
      const value = String(intent || "").toLowerCase();

      if (
        value.includes("eligib") ||
        value.includes("qualification")
      ) {
        return "eligibility";
      }

      if (value.includes("exam")) {
        return "exams";
      }

      if (
        value.includes("salary") ||
        value.includes("pay")
      ) {
        return "salary";
      }

      if (
        value.includes("compar") ||
        value.includes("versus") ||
        value === "compare"
      ) {
        return "compare";
      }

      if (value.includes("job")) {
        return "jobs";
      }

      if (
        value.includes("career") ||
        value.includes("recommend")
      ) {
        return "career";
      }

      return "auto";
    }

    scrollConversationToBottom(smooth = true) {
      if (!this.dom.conversation) {
        return;
      }

      requestAnimationFrame(() => {
        this.dom.conversation.scrollTo({
          top: this.dom.conversation.scrollHeight,
          behavior: smooth ? "smooth" : "auto"
        });
      });
    }

    setBusy(isBusy) {
      this.isBusy = Boolean(isBusy);

      if (this.isBusy) {
        this.dom.send.innerHTML = this.icon("close");
      } else {
        this.dom.send.innerHTML = this.icon("send");
      }

      this.updateComposerState();
    }

    async submit() {
      if (this.isBusy) {
        this.stopGeneration();
        return;
      }

      const raw = String(this.dom.input?.value || "");
      const question = raw.trim();
      const t = getTranslation(this.locale);

      if (!question) {
        this.appendErrorMessage(t.emptyQuestion);
        return;
      }

      if (question.length > LIMITS.maxInputLength) {
        this.appendErrorMessage(t.tooLong);
        return;
      }

      this.dom.input.value = "";
      this.resizeTextarea();
      this.updateComposerState();

      const localIdentity = detectLocalIdentityAnswer(question, this.locale);

      this.appendUserMessage(question);

      if (localIdentity) {
        const placeholder = this.appendAssistantPlaceholder();

        global.setTimeout(() => {
          this.replaceAssistantPlaceholder(placeholder, {
            answer: localIdentity.answer,
            language: this.locale,
            intent: localIdentity.intent,
            confidence: localIdentity.confidence,
            sources: [],
            recommendations: [],
            relatedItems: [],
            warnings: []
          });

          this.history.push({
            role: "assistant",
            content: localIdentity.answer,
            timestamp: new Date().toISOString(),
            intent: localIdentity.intent,
            confidence: localIdentity.confidence
          });

          if (this.options.persistHistory) {
            saveHistory(this.history);
          }

          this.scrollConversationToBottom();
        }, 180);

        return;
      }

      const placeholder = this.appendAssistantPlaceholder();

      this.setBusy(true);

      try {
        const response = await this.requestAI(question);

        if (!response.ok) {
          throw new Error(response.errorMessage || t.errorGeneric);
        }

        const payload = await response.json();
        const normalised = normaliseAIResponse(payload, this.locale);

        this.replaceAssistantPlaceholder(placeholder, normalised);

        this.history.push({
          role: "assistant",
          content: normalised.answer,
          timestamp: new Date().toISOString(),
          intent: normalised.intent,
          confidence: normalised.confidence
        });

        if (this.options.persistHistory) {
          saveHistory(this.history);
        }

        this.scrollConversationToBottom();
      } catch (error) {
        placeholder?.remove();

        const message =
          error?.name === "AbortError"
            ? ""
            : error?.message || t.errorNetwork;

        if (message) {
          this.appendErrorMessage(message);
        }
      } finally {
        this.setBusy(false);
      }
    }

    async requestAI(question) {
      this.abortController = new AbortController();

      const payload = {
        message: question,
        mode: this.mode,
        locale: this.locale,
        conversation: this.history.slice(-LIMITS.maxHistoryItems),
        pageContext: getPageContext(),
        clientContext: getClientContext()
      };

      /*
       * The backend must enforce the real system prompt, privacy policy,
       * identity rules and source/data rules. Anything supplied by the
       * browser is untrusted context.
       */
      let result;

      try {
        result = await fetch(this.options.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          credentials: "same-origin",
          signal: this.abortController.signal,
          body: JSON.stringify(payload)
        });
      } catch (error) {
        if (error?.name === "AbortError") {
          throw error;
        }

        throw new Error(getTranslation(this.locale).errorNetwork);
      } finally {
        this.abortController = null;
      }

      if (!result.ok) {
        let serverMessage = "";

        try {
          const errorPayload = await result.json();

          if (typeof errorPayload?.error === "string") {
            serverMessage = errorPayload.error;
          }
        } catch {
          // Ignore malformed/non-JSON server errors.
        }

        throw new Error(
          serverMessage || getTranslation(this.locale).errorGeneric
        );
      }

      return {
        ok: true,
        json: () => result.json()
      };
    }

    stopGeneration() {
      if (this.abortController) {
        this.abortController.abort();
        this.abortController = null;
      }

      this.setBusy(false);
    }

    requestClearHistory() {
      const t = getTranslation(this.locale);

      if (!this.history.length) {
        this.clearHistory();
        return;
      }

      this.dom.confirmTitle.textContent = t.clearChat;
      this.dom.confirmText.textContent = t.clearConfirm;
      this.dom.confirmYes.textContent = t.yes;
      this.dom.confirmNo.textContent = t.no;

      this.dom.root.classList.add("has-confirm");
      this.dom.confirm.classList.add("is-open");
    }

    closeConfirm() {
      this.dom.root.classList.remove("has-confirm");
      this.dom.confirm.classList.remove("is-open");
    }

    clearHistory() {
      this.history = [];
      safeStorageRemove(STORAGE.history);

      this.renderWelcome();
      this.closeConfirm();

      this.dom.input.value = "";
      this.resizeTextarea();
      this.updateComposerState();
    }

    open() {
      if (!this.dom.root) {
        this.init();
      }

      this.openState = true;

      this.dom.root.hidden = false;
      this.dom.root.removeAttribute("aria-hidden");

      requestAnimationFrame(() => {
        this.dom.root.classList.add("is-open");
        this.dom.panel.focus();
      });

      document.documentElement.style.setProperty("--gcc-ai-open", "1");
      document.body.dataset.compassAiOpen = "true";

      this.refreshTriggerBinding();

      this.scrollConversationToBottom(false);

      return this;
    }

    close() {
      if (!this.dom.root) {
        return;
      }

      this.openState = false;
      this.stopGeneration();
      this.closeConfirm();

      this.dom.root.classList.remove("is-open");
      this.dom.root.setAttribute("aria-hidden", "true");

      global.setTimeout(() => {
        if (!this.openState) {
          this.dom.root.hidden = true;
        }
      }, 220);

      document.body.removeAttribute("data-compass-ai-open");
      document.documentElement.style.removeProperty("--gcc-ai-open");

      return this;
    }

    toggle() {
      return this.openState ? this.close() : this.open();
    }

    refreshTriggerBinding() {
      const triggers = document.querySelectorAll(this.options.triggerSelector);

      triggers.forEach((trigger) => {
        trigger.setAttribute("aria-expanded", this.openState ? "true" : "false");
      });
    }

    destroy() {
      this.stopGeneration();

      if (this.dom.root) {
        this.dom.root.remove();
      }

      this.dom = {};
      this.openState = false;
    }
  }

  function createCompassAI(options = {}) {
    return new CompassAIAssistant(options);
  }

  /*
   * Public namespace.
   *
   * Header.js can use:
   *
   *   window.GovCareerCompassAI.toggle();
   *
   * Page controllers can use:
   *
   *   window.GovCareerCompassAI.open();
   *
   * Language selector can use:
   *
   *   window.GovCareerCompassAI.setLocale("bn");
   */
  global.GovCareerCompassAI = createCompassAI({
    autoMount: true
  });

  global.GovCareerCompassAI.create = createCompassAI;

  /*
   * Optional integration bridge for projects that already use a global
   * GovCareerCompass application namespace.
   */
  global.GovCareerCompass = global.GovCareerCompass || {};

  global.GovCareerCompass.openAI = () =>
    global.GovCareerCompassAI.open();

  global.GovCareerCompass.closeAI = () =>
    global.GovCareerCompassAI.close();

  global.GovCareerCompass.toggleAI = () =>
    global.GovCareerCompassAI.toggle();

  /*
   * Automatically synchronize with a shared language system when that system
   * emits a custom event. This avoids a hard dependency on language.js.
   */
  document.addEventListener("gcc:languagechange", (event) => {
    const locale =
      event?.detail?.locale ||
      event?.detail?.language ||
      getCurrentLocale();

    global.GovCareerCompassAI.setLocale(locale);
  });

  /*
   * Backward-compatible generic custom event:
   *
   * window.dispatchEvent(
   *   new CustomEvent("govcareercompass:open-ai")
   * );
   */
  document.addEventListener("govcareercompass:open-ai", () => {
    global.GovCareerCompassAI.open();
  });

  document.addEventListener("govcareercompass:close-ai", () => {
    global.GovCareerCompassAI.close();
  });

  /*
   * If the component is loaded after DOMContentLoaded, init immediately;
   * otherwise the constructor already created the component but trigger
   * discovery is refreshed here so dynamically inserted header buttons can
   * still be connected.
   */
  if (document.readyState !== "loading") {
    global.GovCareerCompassAI.bindTrigger();
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      global.GovCareerCompassAI.bindTrigger();
    }, { once: true });
  }

})(window, document);
