/**
 * GovCareer Compass — Compass AI Intent Router
 * File: /js/ai/intent-router.js
 *
 * Purpose
 * -------
 * Classify a Compass AI user request before context-building and prompt
 * construction.
 *
 * This module is intentionally deterministic.
 *
 * It does NOT:
 *   - call an LLM;
 *   - call an API;
 *   - access secrets;
 *   - calculate eligibility;
 *   - calculate recommendations;
 *   - calculate salary;
 *   - mutate database records.
 *
 * It only determines:
 *   - the most likely intent;
 *   - the confidence of that classification;
 *   - the likely language;
 *   - whether the request is GovCareer Compass-domain focused;
 *   - which data domains should be retrieved;
 *   - whether current-page/conversation context matters;
 *   - whether the request is a platform-identity request;
 *   - whether the request should be treated as general information.
 *
 * Expected pipeline
 * -----------------
 *
 * User question
 *      ↓
 * intent-router.js
 *      ↓
 * context-builder.js
 *      ↓
 * eligibility / recommendation / calculator context
 *      ↓
 * prompt-builder.js
 *      ↓
 * API / model
 *      ↓
 * response-parser.js
 *      ↓
 * Compass AI UI
 *
 * Public API
 * ----------
 *
 * window.GovCareerCompassAIIntentRouter
 *
 * Examples:
 *
 * const result =
 *   window.GovCareerCompassAIIntentRouter.route({
 *     message: "Am I eligible for SSC CGL?",
 *     mode: "auto",
 *     locale: "en",
 *     conversation: [],
 *     pageContext: {},
 *     clientContext: {}
 *   });
 *
 * Or:
 *
 * const intent =
 *   window.GovCareerCompassAIIntentRouter.classify(
 *     "আমি BA English Honours করেছি। কোন সরকারি চাকরি ভালো?"
 *   );
 */

(function bootstrapCompassAIIntentRouter(global) {
  "use strict";

  const VERSION = "1.0.0";

  const INTENTS = Object.freeze({
    PLATFORM_IDENTITY: "platform_identity",
    CAREER_RECOMMENDATION: "career_recommendation",
    ELIGIBILITY: "eligibility",
    JOB_INFORMATION: "job_information",
    EXAM_INFORMATION: "exam_information",
    RECRUITMENT: "recruitment",
    SALARY_PAY: "salary_pay",
    COMPARISON: "comparison",
    LOCATION_POSTING: "location_posting",
    HOUSING: "housing",
    PROMOTION: "promotion",
    WORK_LIFE: "work_life",
    FAMILY: "family",
    PARENT_CARE: "parent_care",
    PHYSICAL_MEDICAL: "physical_medical",
    PREPARATION: "preparation",
    QUALIFICATION: "qualification",
    SEARCH_DISCOVERY: "search_discovery",
    SOURCE_VERIFICATION: "source_verification",
    GENERAL_INFORMATION: "general_information",
    OUT_OF_SCOPE: "out_of_scope",
    CLARIFICATION: "clarification"
  });

  const MODES = Object.freeze({
    AUTO: "auto",
    CAREER: "career",
    ELIGIBILITY: "eligibility",
    EXAMS: "exams",
    JOBS: "jobs",
    SALARY: "salary",
    COMPARE: "compare"
  });

  const LANGUAGES = Object.freeze({
    ENGLISH: "en",
    BENGALI: "bn"
  });

  const DOMAIN_TYPES = Object.freeze({
    CAREER: "career",
    GENERAL: "general",
    PLATFORM: "platform",
    OUT_OF_SCOPE: "out_of_scope"
  });

  /*
   * Weighting strategy
   * ------------------
   *
   * Strong signals are intentionally weighted more heavily than generic
   * words. For example, "salary" strongly suggests salary_pay, whereas
   * "good" should contribute almost nothing.
   */
  const INTENT_DEFINITIONS = Object.freeze({
    [INTENTS.PLATFORM_IDENTITY]: {
      domain: DOMAIN_TYPES.PLATFORM,
      priority: 100,
      requiredContext: ["platformIdentity"],
      keywords: {
        en: [
          "who made you",
          "who created you",
          "who built you",
          "who developed you",
          "who is your creator",
          "who is your owner",
          "who owns you",
          "who made compass ai",
          "who created compass ai",
          "who built compass ai",
          "who developed compass ai",
          "who is abhijit dutta",
          "about abhijit dutta"
        ],
        bn: [
          "কে তোমাকে বানিয়েছে",
          "কে তোমাকে তৈরি করেছে",
          "কে তোমাকে বানিয়েছে",
          "কে তোমাকে তৈরি করেছে",
          "তোমাকে কে বানিয়েছে",
          "তোমাকে কে তৈরি করেছে",
          "তোমার নির্মাতা কে",
          "তোমার মালিক কে",
          "কম্পাস এআই কে বানিয়েছে",
          "কম্পাস এআই কে তৈরি করেছে",
          "কম্পাস AI কে বানিয়েছে",
          "কম্পাস AI কে তৈরি করেছে",
          "অভিজিৎ দত্ত কে",
          "অভিজিত দত্ত কে"
        ]
      },
      exactPatterns: [
        /\bwho\s+(made|created|built|developed)\s+(you|compass\s*ai)\b/i,
        /\bwho\s+(is|was)\s+abhijit\s+dutta\b/i,
        /কে\s+(তোমাকে|আপনাকে)\s+(বানিয়েছে|বানিয়েছে|তৈরি করেছে)/i,
        /অভিজিৎ?\s+দত্ত\s+কে/i
      ]
    },

    [INTENTS.ELIGIBILITY]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 95,
      requiredContext: [
        "job",
        "exam",
        "qualification",
        "eligibilityRules",
        "candidateProfile"
      ],
      keywords: {
        en: [
          "eligible",
          "eligibility",
          "can i apply",
          "am i eligible",
          "whether i can apply",
          "qualification required",
          "required qualification",
          "minimum qualification",
          "educational qualification",
          "age limit",
          "age eligibility",
          "marks required",
          "percentage required",
          "subject requirement",
          "degree requirement",
          "b.ed required",
          "d.el.ed required",
          "iti required",
          "license required",
          "experience required",
          "domicile requirement",
          "language requirement",
          "physical eligibility",
          "medical eligibility"
        ],
        bn: [
          "যোগ্য",
          "যোগ্যতা",
          "আমি কি আবেদন করতে পারি",
          "আমি কি আবেদন করতে পারব",
          "আমি কি যোগ্য",
          "কী যোগ্যতা লাগে",
          "যোগ্যতা কী",
          "শিক্ষাগত যোগ্যতা",
          "বয়সসীমা",
          "বয়সসীমা",
          "কত নম্বর লাগে",
          "কত শতাংশ লাগে",
          "বিষয় প্রয়োজন",
          "ডিগ্রি প্রয়োজন",
          "বি এড লাগবে",
          "বিএড লাগবে",
          "ডিএলএড লাগবে",
          "আইটিআই লাগবে",
          "অভিজ্ঞতা লাগবে",
          "ডোমিসাইল",
          "ভাষাগত যোগ্যতা",
          "শারীরিক যোগ্যতা",
          "মেডিকেল যোগ্যতা"
        ]
      }
    },

    [INTENTS.CAREER_RECOMMENDATION]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 90,
      requiredContext: [
        "jobs",
        "exams",
        "qualifications",
        "eligibilityRules",
        "candidateProfile",
        "preferences",
        "recommendationResults"
      ],
      keywords: {
        en: [
          "which job is best for me",
          "best government job for me",
          "best government jobs for me",
          "which government job should i choose",
          "what job should i target",
          "which job should i target",
          "which exams should i target",
          "what should i prepare for",
          "suitable job",
          "suitable career",
          "good career for me",
          "career for my qualification",
          "jobs for my degree",
          "jobs after my degree",
          "government jobs after graduation",
          "recommend a job",
          "recommend jobs",
          "recommendation",
          "career recommendation",
          "career fit",
          "career match",
          "best option for me",
          "which route is better for me"
        ],
        bn: [
          "আমার জন্য কোন চাকরি ভালো",
          "আমার জন্য কোন সরকারি চাকরি ভালো",
          "কোন সরকারি চাকরি আমার জন্য ভালো",
          "কোন চাকরি বেছে নেব",
          "কোন চাকরি লক্ষ্য করা উচিত",
          "কোন পরীক্ষার প্রস্তুতি নেব",
          "কোন পরীক্ষাগুলি দেব",
          "আমার জন্য উপযুক্ত চাকরি",
          "আমার যোগ্যতার জন্য চাকরি",
          "আমার ডিগ্রির পর কোন চাকরি",
          "স্নাতকের পর কোন সরকারি চাকরি",
          "চাকরি সাজেস্ট করুন",
          "চাকরি সুপারিশ করুন",
          "ক্যারিয়ার পরামর্শ",
          "ক্যারিয়ার পরামর্শ",
          "আমার জন্য কোনটা ভালো",
          "কোনটা আমার জন্য উপযুক্ত"
        ]
      }
    },

    [INTENTS.COMPARISON]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 88,
      requiredContext: [
        "jobs",
        "exams",
        "pay",
        "locations",
        "housing",
        "promotion",
        "benefits",
        "comparison"
      ],
      keywords: {
        en: [
          "compare",
          "comparison",
          "versus",
          "vs",
          "difference between",
          "which is better",
          "better than",
          "better for me",
          "side by side",
          "pros and cons",
          "advantages and disadvantages",
          "compare these jobs",
          "compare these exams"
        ],
        bn: [
          "তুলনা",
          "তুলনা করুন",
          "কোনটা ভালো",
          "কোনটি ভালো",
          "কোনটা বেশি ভালো",
          "দুটির পার্থক্য",
          "দুইটির পার্থক্য",
          "তফাৎ কী",
          "ভালো কোনটি",
          "আমার জন্য কোনটি ভালো"
        ]
      }
    },

    [INTENTS.SALARY_PAY]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 87,
      requiredContext: [
        "job",
        "exam",
        "pay",
        "benefits",
        "salaryCalculator"
      ],
      keywords: {
        en: [
          "salary",
          "pay",
          "basic pay",
          "basic salary",
          "pay level",
          "pay scale",
          "grade pay",
          "allowance",
          "da",
          "hra",
          "in hand salary",
          "take home",
          "gross salary",
          "net salary",
          "starting salary",
          "maximum salary",
          "salary progression"
        ],
        bn: [
          "বেতন",
          "স্যালারি",
          "মূল বেতন",
          "বেসিক পে",
          "পে লেভেল",
          "বেতন স্কেল",
          "ভাতা",
          "ডিএ",
          "এইচআরএ",
          "হাতে কত পাব",
          "ইন হ্যান্ড",
          "শুরুতে কত বেতন",
          "সর্বোচ্চ বেতন"
        ]
      }
    },

    [INTENTS.JOB_INFORMATION]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 82,
      requiredContext: [
        "job",
        "department",
        "organisation",
        "locations",
        "promotion",
        "benefits",
        "sources"
      ],
      keywords: {
        en: [
          "job",
          "post",
          "position",
          "role",
          "what does this job do",
          "job profile",
          "duties",
          "responsibilities",
          "work profile",
          "daily work",
          "day to day work",
          "department",
          "organisation",
          "organization",
          "officer role",
          "clerk role",
          "inspector role"
        ],
        bn: [
          "চাকরি",
          "পদ",
          "পোস্ট",
          "দায়িত্ব",
          "দায়িত্ব",
          "কাজ কী",
          "কাজের ধরন",
          "চাকরির কাজ",
          "ডিউটি",
          "দৈনন্দিন কাজ",
          "কোন দপ্তর",
          "কোন বিভাগ",
          "পদের কাজ"
        ]
      }
    },

    [INTENTS.EXAM_INFORMATION]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 84,
      requiredContext: [
        "exam",
        "recruitment",
        "job",
        "eligibilityRules",
        "sources"
      ],
      keywords: {
        en: [
          "exam",
          "examination",
          "test",
          "tier",
          "paper",
          "prelims",
          "preliminary",
          "mains",
          "main examination",
          "personality test",
          "interview",
          "exam pattern",
          "exam stages",
          "syllabus",
          "question paper",
          "marks",
          "negative marking",
          "exam difficulty"
        ],
        bn: [
          "পরীক্ষা",
          "এক্সাম",
          "পরীক্ষার ধাপ",
          "পরীক্ষার প্যাটার্ন",
          "সিলেবাস",
          "প্রশ্নপত্র",
          "নেগেটিভ মার্কিং",
          "প্রিলিমস",
          "মেইনস",
          "ইন্টারভিউ",
          "পরীক্ষার নম্বর"
        ]
      }
    },

    [INTENTS.RECRUITMENT]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 83,
      requiredContext: [
        "exam",
        "recruitment",
        "jobs",
        "sources"
      ],
      keywords: {
        en: [
          "recruitment",
          "recruitment notification",
          "notification",
          "advertisement",
          "vacancy",
          "vacancies",
          "application date",
          "apply date",
          "last date",
          "application form",
          "when will recruitment come",
          "recruitment cycle",
          "current recruitment",
          "latest recruitment",
          "2026 recruitment",
          "2026 notification",
          "2027 recruitment"
        ],
        bn: [
          "নিয়োগ",
          "নিয়োগ",
          "নিয়োগ বিজ্ঞপ্তি",
          "নিয়োগ বিজ্ঞপ্তি",
          "বিজ্ঞপ্তি",
          "ভ্যাকেন্সি",
          "শূন্যপদ",
          "আবেদনের তারিখ",
          "শেষ তারিখ",
          "কবে নিয়োগ হবে",
          "কবে নিয়োগ হবে",
          "বর্তমান নিয়োগ",
          "বর্তমান নিয়োগ"
        ]
      }
    },

    [INTENTS.LOCATION_POSTING]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 80,
      requiredContext: [
        "job",
        "locations",
        "state",
        "posting",
        "transfer"
      ],
      keywords: {
        en: [
          "posting",
          "place of posting",
          "location",
          "where will i be posted",
          "where can i get posted",
          "kolkata posting",
          "kolkata",
          "west bengal posting",
          "all india",
          "district posting",
          "rural posting",
          "urban posting",
          "transfer",
          "transfers",
          "transfer frequency",
          "home district",
          "near home"
        ],
        bn: [
          "পোস্টিং",
          "কোথায় পোস্টিং",
          "কোথায় পোস্টিং",
          "কোথায় চাকরি হবে",
          "কোথায় চাকরি হবে",
          "কলকাতা",
          "পশ্চিমবঙ্গে পোস্টিং",
          "জেলা পোস্টিং",
          "গ্রামাঞ্চলে পোস্টিং",
          "শহরে পোস্টিং",
          "ট্রান্সফার",
          "বদলি",
          "বাড়ির কাছে",
          "বাড়ির কাছে"
        ]
      }
    },

    [INTENTS.HOUSING]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 78,
      requiredContext: [
        "job",
        "housing",
        "locations",
        "benefits",
        "pay"
      ],
      keywords: {
        en: [
          "housing",
          "house",
          "government house",
          "quarter",
          "quarters",
          "government quarter",
          "residence",
          "accommodation",
          "official accommodation",
          "staff quarter",
          "rent",
          "hra versus quarter"
        ],
        bn: [
          "বাড়ি",
          "বাড়ি",
          "সরকারি বাড়ি",
          "সরকারি বাড়ি",
          "কোয়ার্টার",
          "কোয়ার্টার",
          "আবাসন",
          "থাকার ব্যবস্থা",
          "সরকারি বাসস্থান",
          "ভাড়া",
          "ভাড়া"
        ]
      }
    },

    [INTENTS.PROMOTION]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 77,
      requiredContext: [
        "job",
        "serviceCadres",
        "promotion",
        "recruitment",
        "sources"
      ],
      keywords: {
        en: [
          "promotion",
          "promotions",
          "career progression",
          "promotion path",
          "next promotion",
          "promotion timeline",
          "career growth",
          "career ceiling",
          "higher post",
          "departmental promotion"
        ],
        bn: [
          "প্রমোশন",
          "পদোন্নতি",
          "পদোন্নতির সুযোগ",
          "পরের পদ",
          "ক্যারিয়ার গ্রোথ",
          "ক্যারিয়ার গ্রোথ",
          "কত বছরে প্রমোশন",
          "উচ্চ পদ"
        ]
      }
    },

    [INTENTS.WORK_LIFE]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 76,
      requiredContext: [
        "job",
        "workLife",
        "stress",
        "nightDuty",
        "shiftDuty",
        "holidayDuty",
        "emergencyDuty"
      ],
      keywords: {
        en: [
          "work life balance",
          "work-life balance",
          "work life",
          "stress",
          "stressful",
          "working hours",
          "office hours",
          "night duty",
          "night shift",
          "shift duty",
          "holiday duty",
          "emergency duty",
          "weekend work",
          "overtime",
          "work pressure",
          "job stress"
        ],
        bn: [
          "ওয়ার্ক লাইফ ব্যালেন্স",
          "ওয়ার্ক লাইফ ব্যালেন্স",
          "কাজের চাপ",
          "স্ট্রেস",
          "চাপ",
          "কাজের সময়",
          "কাজের সময়",
          "রাতের ডিউটি",
          "নাইট ডিউটি",
          "শিফট",
          "ছুটির দিনে কাজ",
          "জরুরি ডিউটি",
          "ওভারটাইম"
        ]
      }
    },

    [INTENTS.FAMILY]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 75,
      requiredContext: [
        "job",
        "familyCompatibility",
        "workLife",
        "locations",
        "transfer",
        "housing"
      ],
      keywords: {
        en: [
          "family",
          "family friendly",
          "family life",
          "spouse",
          "children",
          "family compatibility",
          "family responsibilities",
          "family support"
        ],
        bn: [
          "পরিবার",
          "পরিবারের জন্য",
          "পরিবারবান্ধব",
          "ফ্যামিলি ফ্রেন্ডলি",
          "সংসার",
          "স্ত্রী",
          "স্বামী",
          "সন্তান",
          "পরিবারের দায়িত্ব",
          "পরিবারের দায়িত্ব"
        ]
      }
    },

    [INTENTS.PARENT_CARE]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 76,
      requiredContext: [
        "job",
        "parentCareCompatibility",
        "locations",
        "transfer",
        "workLife",
        "housing"
      ],
      keywords: {
        en: [
          "parents",
          "parent care",
          "elderly parents",
          "old parents",
          "take care of my parents",
          "stay near parents",
          "care for parents",
          "parents at home",
          "elderly care"
        ],
        bn: [
          "বাবা-মা",
          "বাবা মা",
          "মা-বাবা",
          "মা বাবা",
          "বৃদ্ধ বাবা-মা",
          "বয়স্ক বাবা-মা",
          "বাবা মায়ের দেখাশোনা",
          "বাবা মায়ের দেখাশোনা",
          "মায়ের দেখাশোনা",
          "মায়ের দেখাশোনা",
          "বাবার দেখাশোনা",
          "বাড়িতে বাবা-মা"
        ]
      }
    },

    [INTENTS.PHYSICAL_MEDICAL]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 74,
      requiredContext: [
        "job",
        "eligibilityRules",
        "physicalCriteria",
        "medicalCriteria"
      ],
      keywords: {
        en: [
          "physical test",
          "physical eligibility",
          "pet",
          "pmt",
          "medical test",
          "medical standard",
          "height",
          "chest",
          "running",
          "fitness",
          "vision",
          "eyesight",
          "medical",
          "physical risk"
        ],
        bn: [
          "শারীরিক পরীক্ষা",
          "ফিজিক্যাল টেস্ট",
          "পিইটি",
          "পিএমটি",
          "মেডিকেল",
          "মেডিকেল টেস্ট",
          "উচ্চতা",
          "বুকের মাপ",
          "দৌড়",
          "দৌড়",
          "ফিটনেস",
          "চোখের পাওয়ার",
          "চোখের পাওয়ার"
        ]
      }
    },

    [INTENTS.PREPARATION]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 73,
      requiredContext: [
        "exam",
        "syllabus",
        "preparation"
      ],
      keywords: {
        en: [
          "prepare",
          "preparation",
          "study plan",
          "study strategy",
          "how should i prepare",
          "how to prepare",
          "books",
          "resources",
          "subjects",
          "strategy",
          "preparation strategy",
          "exam strategy",
          "mock test",
          "revision",
          "study routine"
        ],
        bn: [
          "প্রস্তুতি",
          "কীভাবে প্রস্তুতি নেব",
          "কীভাবে পড়ব",
          "কীভাবে পড়ব",
          "স্টাডি প্ল্যান",
          "পড়াশোনার পরিকল্পনা",
          "পড়াশোনার পরিকল্পনা",
          "বই",
          "রিসোর্স",
          "বিষয়",
          "বিষয়",
          "প্রস্তুতির কৌশল",
          "পরীক্ষার প্রস্তুতি"
        ]
      }
    },

    [INTENTS.QUALIFICATION]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 79,
      requiredContext: [
        "qualifications",
        "eligibilityRules",
        "jobs",
        "exams"
      ],
      keywords: {
        en: [
          "qualification",
          "qualifications",
          "degree",
          "graduation",
          "graduate",
          "class 10",
          "class 12",
          "higher secondary",
          "bachelor",
          "bachelors",
          "honours",
          "english honours",
          "b.ed",
          "d.el.ed",
          "iti",
          "llb",
          "ll.b",
          "professional qualification",
          "specialist qualification"
        ],
        bn: [
          "যোগ্যতা",
          "ডিগ্রি",
          "স্নাতক",
          "গ্র্যাজুয়েশন",
          "গ্র্যাজুয়েশন",
          "দশম",
          "দ্বাদশ",
          "উচ্চমাধ্যমিক",
          "অনার্স",
          "ইংরেজি অনার্স",
          "বি এড",
          "বিএড",
          "ডিএলএড",
          "আইটিআই",
          "এলএলবি",
          "বিশেষ যোগ্যতা"
        ]
      }
    },

    [INTENTS.SOURCE_VERIFICATION]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 72,
      requiredContext: [
        "sources",
        "job",
        "exam",
        "recruitment"
      ],
      keywords: {
        en: [
          "source",
          "sources",
          "official source",
          "official notification",
          "official website",
          "where did this come from",
          "proof",
          "evidence",
          "verify",
          "verified",
          "is this official",
          "citation",
          "reference"
        ],
        bn: [
          "উৎস",
          "সোর্স",
          "অফিশিয়াল সোর্স",
          "অফিসিয়াল বিজ্ঞপ্তি",
          "সরকারি ওয়েবসাইট",
          "সরকারি ওয়েবসাইট",
          "প্রমাণ",
          "তথ্যের উৎস",
          "যাচাই",
          "এটি কি সরকারি"
        ]
      }
    },

    [INTENTS.LOCATION_POSTING]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 80,
      requiredContext: [
        "job",
        "locations",
        "state",
        "posting",
        "transfer"
      ],
      keywords: {
        en: [
          "posting",
          "place of posting",
          "location",
          "where will i be posted",
          "where can i get posted",
          "kolkata posting",
          "kolkata",
          "west bengal posting",
          "all india",
          "district posting",
          "rural posting",
          "urban posting",
          "transfer",
          "transfers",
          "transfer frequency",
          "home district",
          "near home"
        ],
        bn: [
          "পোস্টিং",
          "কোথায় পোস্টিং",
          "কোথায় পোস্টিং",
          "কোথায় চাকরি হবে",
          "কোথায় চাকরি হবে",
          "কলকাতা",
          "পশ্চিমবঙ্গে পোস্টিং",
          "জেলা পোস্টিং",
          "গ্রামাঞ্চলে পোস্টিং",
          "শহরে পোস্টিং",
          "ট্রান্সফার",
          "বদলি",
          "বাড়ির কাছে",
          "বাড়ির কাছে"
        ]
      }
    },

    [INTENTS.SEARCH_DISCOVERY]: {
      domain: DOMAIN_TYPES.CAREER,
      priority: 68,
      requiredContext: [
        "searchIndex",
        "jobs",
        "exams",
        "departments",
        "qualifications"
      ],
      keywords: {
        en: [
          "find",
          "search",
          "show me",
          "list",
          "what jobs are there",
          "which jobs are available",
          "find jobs",
          "find exams",
          "show government jobs",
          "show me jobs",
          "what options are there"
        ],
        bn: [
          "খুঁজে দিন",
          "খুঁজুন",
          "দেখান",
          "কোন কোন চাকরি আছে",
          "কোন চাকরি আছে",
          "চাকরির তালিকা",
          "পরীক্ষার তালিকা",
          "কী কী অপশন আছে",
          "কোন কোন অপশন আছে"
        ]
      }
    },

    [INTENTS.GENERAL_INFORMATION]: {
      domain: DOMAIN_TYPES.GENERAL,
      priority: 30,
      requiredContext: [],
      keywords: {
        en: [
          "what is",
          "what are",
          "meaning of",
          "definition",
          "explain",
          "explain this",
          "how does",
          "why does",
          "tell me about",
          "general information"
        ],
        bn: [
          "কী",
          "কি",
          "মানে কী",
          "অর্থ কী",
          "ব্যাখ্যা করুন",
          "বুঝিয়ে বলুন",
          "বুঝিয়ে বলুন",
          "কেন",
          "কীভাবে",
          "কি ভাবে",
          "সাধারণ তথ্য"
        ]
      }
    },

    [INTENTS.OUT_OF_SCOPE]: {
      domain: DOMAIN_TYPES.OUT_OF_SCOPE,
      priority: 0,
      requiredContext: [],
      keywords: {
        en: [
          "hack",
          "malware",
          "password theft",
          "steal password",
          "phishing",
          "make a bomb",
          "weapon construction",
          "illegal drugs",
          "credit card fraud"
        ],
        bn: [
          "হ্যাক করুন",
          "পাসওয়ার্ড চুরি",
          "পাসওয়ার্ড চুরি",
          "ফিশিং",
          "বোমা বানানো",
          "অস্ত্র বানানো",
          "কার্ড জালিয়াতি",
          "কার্ড জালিয়াতি"
        ]
      }
    }
  });

  /*
   * Some definitions share concepts intentionally. The classifier resolves
   * conflicts using:
   *
   * 1. explicit mode;
   * 2. exact platform identity patterns;
   * 3. strong phrase matches;
   * 4. weighted keyword scores;
   * 5. current page context;
   * 6. conversation context;
   * 7. fallback classification.
   */

  const MODE_TO_INTENT = Object.freeze({
    [MODES.CAREER]: INTENTS.CAREER_RECOMMENDATION,
    [MODES.ELIGIBILITY]: INTENTS.ELIGIBILITY,
    [MODES.EXAMS]: INTENTS.EXAM_INFORMATION,
    [MODES.JOBS]: INTENTS.JOB_INFORMATION,
    [MODES.SALARY]: INTENTS.SALARY_PAY,
    [MODES.COMPARE]: INTENTS.COMPARISON
  });

  const CONTEXT_INTENT_HINTS = Object.freeze({
    job: INTENTS.JOB_INFORMATION,
    exam: INTENTS.EXAM_INFORMATION,
    eligibility: INTENTS.ELIGIBILITY,
    salary: INTENTS.SALARY_PAY,
    compare: INTENTS.COMPARISON,
    comparison: INTENTS.COMPARISON,
    location: INTENTS.LOCATION_POSTING,
    housing: INTENTS.HOUSING,
    promotion: INTENTS.PROMOTION,
    family: INTENTS.FAMILY,
    parents: INTENTS.PARENT_CARE,
    parentCare: INTENTS.PARENT_CARE,
    preparation: INTENTS.PREPARATION,
    sources: INTENTS.SOURCE_VERIFICATION
  });

  function asString(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function normaliseWhitespace(value) {
    return asString(value).replace(/\s+/g, " ").trim();
  }

  function normaliseEnglish(text) {
    return normaliseWhitespace(text)
      .toLowerCase()
      .replace(/[’']/g, "'")
      .replace(/[“”]/g, '"');
  }

  function normaliseBengali(text) {
    return normaliseWhitespace(text)
      .replace(/[“”]/g, '"')
      .replace(/\u200c|\u200d/g, "")
      .trim();
  }

  function normaliseForMatching(text) {
    return normaliseEnglish(text)
      .replace(/[^\p{L}\p{N}\s.+/&-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function countBengaliCharacters(text) {
    return (String(text || "").match(/[\u0980-\u09FF]/g) || []).length;
  }

  function countLatinCharacters(text) {
    return (String(text || "").match(/[A-Za-z]/g) || []).length;
  }

  function detectLanguage(text, preferredLocale) {
    const value = asString(text);

    if (!value) {
      return preferredLocale === LANGUAGES.BENGALI
        ? LANGUAGES.BENGALI
        : LANGUAGES.ENGLISH;
    }

    const bengaliCount = countBengaliCharacters(value);
    const latinCount = countLatinCharacters(value);

    if (bengaliCount > 0 && bengaliCount >= latinCount * 0.25) {
      return LANGUAGES.BENGALI;
    }

    if (latinCount > 0) {
      return LANGUAGES.ENGLISH;
    }

    return preferredLocale === LANGUAGES.BENGALI
      ? LANGUAGES.BENGALI
      : LANGUAGES.ENGLISH;
  }

  function normaliseLocale(value) {
    const locale = asString(value).toLowerCase();

    if (locale === "bn" || locale.startsWith("bn-")) {
      return LANGUAGES.BENGALI;
    }

    return LANGUAGES.ENGLISH;
  }

  function getLocale(options) {
    const preferred = normaliseLocale(options?.locale);

    if (options?.locale) {
      return preferred;
    }

    try {
      const htmlLocale =
        global.document?.documentElement?.getAttribute("lang");

      if (htmlLocale) {
        return normaliseLocale(htmlLocale);
      }
    } catch {
      // Ignore unavailable DOM.
    }

    return LANGUAGES.ENGLISH;
  }

  function getMode(value) {
    const mode = asString(value).toLowerCase();

    return Object.values(MODES).includes(mode)
      ? mode
      : MODES.AUTO;
  }

  function getPageContext(options) {
    if (!options || typeof options.pageContext !== "object") {
      return {};
    }

    return options.pageContext;
  }

  function getConversation(options) {
    return Array.isArray(options?.conversation)
      ? options.conversation.filter(Boolean).slice(-20)
      : [];
  }

  function getLastConversationUserMessage(conversation) {
    for (let i = conversation.length - 1; i >= 0; i -= 1) {
      const item = conversation[i];

      if (
        item &&
        item.role === "user" &&
        typeof item.content === "string" &&
        item.content.trim()
      ) {
        return item.content.trim();
      }
    }

    return "";
  }

  function getConversationTopics(conversation) {
    const text = conversation
      .map((item) => (typeof item?.content === "string" ? item.content : ""))
      .join(" ");

    return normaliseForMatching(text);
  }

  function isShortFollowUp(message) {
    const value = normaliseWhitespace(message);

    if (!value) {
      return false;
    }

    const wordCount = value.split(/\s+/).length;

    if (wordCount <= 7) {
      return true;
    }

    const followUpPatterns = [
      /^(and|what about|how about|then what|why|which one|what about this)\b/i,
      /^(আর|তাহলে|তাহলে কী|এটার ক্ষেত্রে|এটা সম্পর্কে|কোনটা|কেন)$/i
    ];

    return followUpPatterns.some((pattern) => pattern.test(value));
  }

  function hasPronounOnlyReference(message) {
    const value = normaliseEnglish(message);

    const patterns = [
      /\b(this|that|it|they|them|the previous one|the above one)\b/i,
      /^(আর এটা|এটা|ওটা|সেটা|ওইটা|এগুলোর ক্ষেত্রে)/i
    ];

    return patterns.some((pattern) => pattern.test(value));
  }

  function buildCandidateText(message, conversation, pageContext) {
    const parts = [message];

    const previousUserMessage = getLastConversationUserMessage(conversation);

    if (previousUserMessage) {
      parts.push(previousUserMessage);
    }

    const conversationText = getConversationTopics(conversation);

    if (conversationText) {
      parts.push(conversationText);
    }

    /*
     * Page metadata is used only for routing hints; it is not treated as
     * factual career data.
     */
    if (pageContext?.pageType) {
      parts.push(String(pageContext.pageType));
    }

    if (pageContext?.entityType) {
      parts.push(String(pageContext.entityType));
    }

    return normaliseForMatching(parts.join(" "));
  }

  function phraseMatches(text, phrase) {
    const target = normaliseForMatching(phrase);

    if (!target) {
      return false;
    }

    /*
     * Multi-word phrases are matched as phrases where possible. Very short
     * Bengali/English terms are matched directly because word-boundary rules
     * can behave poorly for some scripts.
     */
    if (target.length <= 3 || /[\u0980-\u09FF]/u.test(target)) {
      return text.includes(target);
    }

    const escaped = target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return new RegExp(`(?:^|\\s)${escaped}(?:$|\\s)`, "iu").test(text);
  }

  function scoreKeywords(text, definition, locale) {
    const localized =
      definition.keywords?.[locale] ||
      definition.keywords?.en ||
      [];

    let score = 0;
    const matches = [];

    localized.forEach((keyword) => {
      const normalizedKeyword = normaliseForMatching(keyword);

      if (!normalizedKeyword) {
        return;
      }

      if (phraseMatches(text, normalizedKeyword)) {
        const wordCount = normalizedKeyword.split(/\s+/).length;

        let weight = 1;

        if (wordCount >= 4) {
          weight = 7;
        } else if (wordCount === 3) {
          weight = 5;
        } else if (wordCount === 2) {
          weight = 3;
        } else {
          weight = 2;
        }

        matches.push({
          keyword,
          weight
        });

        score += weight;
      }
    });

    /*
     * When the user asks in Bengali but uses English government terminology,
     * also evaluate the English keyword set.
     */
    if (locale === LANGUAGES.BENGALI) {
      const englishKeywords = definition.keywords?.en || [];

      englishKeywords.forEach((keyword) => {
        const normalizedKeyword = normaliseForMatching(keyword);

        if (
          normalizedKeyword &&
          phraseMatches(text, normalizedKeyword) &&
          !localized.includes(keyword)
        ) {
          const wordCount = normalizedKeyword.split(/\s+/).length;

          let weight = 1;

          if (wordCount >= 4) {
            weight = 5;
          } else if (wordCount === 3) {
            weight = 4;
          } else if (wordCount === 2) {
            weight = 3;
          } else {
            weight = 2;
          }

          matches.push({
            keyword,
            weight
          });

          score += weight;
        }
      });
    }

    return {
      score,
      matches
    };
  }

  function detectEntitySignals(text) {
    const value = normaliseForMatching(text);

    const entities = {
      hasGovernmentCareerSignal: false,
      hasJobSignal: false,
      hasExamSignal: false,
      hasQualificationSignal: false,
      hasSalarySignal: false,
      hasLocationSignal: false,
      hasFamilySignal: false,
      hasParentSignal: false,
      hasComparisonSignal: false,
      hasSourceSignal: false,
      hasPreparationSignal: false,
      hasIdentitySignal: false
    };

    const signalGroups = {
      governmentCareer: [
        "government",
        "govt",
        "government job",
        "সরকারি",
        "সরকারী",
        "চাকরি",
        "পদ"
      ],
      job: [
        "job",
        "post",
        "position",
        "role",
        "চাকরি",
        "পদ",
        "পোস্ট"
      ],
      exam: [
        "exam",
        "examination",
        "test",
        "tier",
        "পরীক্ষা",
        "এক্সাম"
      ],
      qualification: [
        "degree",
        "graduate",
        "qualification",
        "bachelor",
        "honours",
        "যোগ্যতা",
        "ডিগ্রি",
        "স্নাতক",
        "অনার্স"
      ],
      salary: [
        "salary",
        "pay",
        "basic pay",
        "in hand",
        "বেতন",
        "স্যালারি"
      ],
      location: [
        "kolkata",
        "posting",
        "location",
        "transfer",
        "পোস্টিং",
        "কলকাতা",
        "ট্রান্সফার",
        "বদলি"
      ],
      family: [
        "family",
        "family friendly",
        "পরিবার",
        "পরিবারবান্ধব"
      ],
      parent: [
        "parents",
        "parent care",
        "elderly parents",
        "বাবা-মা",
        "মা-বাবা",
        "বাবা মা",
        "মা বাবা"
      ],
      comparison: [
        "compare",
        "comparison",
        "versus",
        "vs",
        "তুলনা",
        "পার্থক্য"
      ],
      source: [
        "source",
        "official",
        "verify",
        "citation",
        "উৎস",
        "অফিশিয়াল",
        "সরকারি",
        "যাচাই"
      ],
      preparation: [
        "prepare",
        "preparation",
        "study plan",
        "syllabus",
        "প্রস্তুতি",
        "স্টাডি প্ল্যান",
        "সিলেবাস"
      ],
      identity: [
        "who made you",
        "who created you",
        "abhijit dutta",
        "কে তোমাকে বানিয়েছে",
        "অভিজিৎ দত্ত",
        "অভিজিত দত্ত"
      ]
    };

    entities.hasGovernmentCareerSignal =
      signalGroups.governmentCareer.some((term) =>
        phraseMatches(value, normaliseForMatching(term))
      );

    entities.hasJobSignal = signalGroups.job.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    entities.hasExamSignal = signalGroups.exam.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    entities.hasQualificationSignal = signalGroups.qualification.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    entities.hasSalarySignal = signalGroups.salary.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    entities.hasLocationSignal = signalGroups.location.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    entities.hasFamilySignal = signalGroups.family.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    entities.hasParentSignal = signalGroups.parent.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    entities.hasComparisonSignal = signalGroups.comparison.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    entities.hasSourceSignal = signalGroups.source.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    entities.hasPreparationSignal = signalGroups.preparation.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    entities.hasIdentitySignal = signalGroups.identity.some((term) =>
      phraseMatches(value, normaliseForMatching(term))
    );

    return entities;
  }

  function detectQuestionType(text) {
    const value = normaliseEnglish(text);

    return {
      isQuestion:
        /\?|^(who|what|when|where|which|why|how|can|could|should|does|do|is|are|am|will|would)\b/i.test(
          value
        ) ||
        /^(কে|কি|কী|কেন|কখন|কোথায়|কোথায়|কোন|কোনটি|কীভাবে|পারব|পারেন|হবে)\b/u.test(
          value
        ),

      asksWho:
        /\bwho\b/i.test(value) ||
        /\bকে\b/u.test(value),

      asksWhat:
        /\bwhat\b/i.test(value) ||
        /\bকী\b/u.test(value) ||
        /\bকি\b/u.test(value),

      asksWhen:
        /\bwhen\b/i.test(value) ||
        /\bকখন\b/u.test(value),

      asksWhere:
        /\bwhere\b/i.test(value) ||
        /\bকোথায়\b/u.test(value) ||
        /\bকোথায়\b/u.test(value),

      asksWhy:
        /\bwhy\b/i.test(value) ||
        /\bকেন\b/u.test(value),

      asksHow:
        /\bhow\b/i.test(value) ||
        /\bকীভাবে\b/u.test(value) ||
        /\bকিভাবে\b/u.test(value)
    };
  }

  function detectHardContextSignals(text) {
    const value = normaliseForMatching(text);

    return {
      hasBAEnglish:
        value.includes("ba english") ||
        value.includes("english honours") ||
        value.includes("english hons") ||
        value.includes("ইংরেজি অনার্স"),

      hasBEd:
        value.includes("b.ed") ||
        value.includes("bed ") ||
        value.includes("বি এড") ||
        value.includes("বিএড"),

      hasDElEd:
        value.includes("d.el.ed") ||
        value.includes("deled") ||
        value.includes("ডিএলএড"),

      hasITI:
        value.includes("iti") ||
        value.includes("আইটিআই"),

      hasLLB:
        value.includes("llb") ||
        value.includes("ll.b") ||
        value.includes("এলএলবি"),

      hasKolkataPreference:
        value.includes("kolkata") ||
        value.includes("কলকাতা"),

      hasTransferPreference:
        value.includes("transfer") ||
        value.includes("বদলি") ||
        value.includes("ট্রান্সফার"),

      hasParentCareNeed:
        value.includes("parents") ||
        value.includes("parent care") ||
        value.includes("বাবা-মা") ||
        value.includes("মা-বাবা"),

      hasNightDutyConcern:
        value.includes("night duty") ||
        value.includes("night shift") ||
        value.includes("নাইট ডিউটি") ||
        value.includes("রাতের ডিউটি")
    };
  }

  function getCurrentPageHint(pageContext) {
    const explicitPageType = asString(pageContext?.pageType).toLowerCase();
    const entityType = asString(pageContext?.entityType).toLowerCase();

    if (explicitPageType) {
      if (
        explicitPageType.includes("eligibility") ||
        explicitPageType.includes("career-finder")
      ) {
        return INTENTS.ELIGIBILITY;
      }

      if (explicitPageType.includes("compare")) {
        return INTENTS.COMPARISON;
      }

      if (
        explicitPageType.includes("salary") ||
        explicitPageType.includes("pay")
      ) {
        return INTENTS.SALARY_PAY;
      }

      if (explicitPageType.includes("exam")) {
        return INTENTS.EXAM_INFORMATION;
      }

      if (explicitPageType.includes("job")) {
        return INTENTS.JOB_INFORMATION;
      }

      if (
        explicitPageType.includes("housing") ||
        explicitPageType.includes("location")
      ) {
        return INTENTS.LOCATION_POSTING;
      }

      if (explicitPageType.includes("preparation")) {
        return INTENTS.PREPARATION;
      }
    }

    if (entityType) {
      if (entityType.includes("job")) {
        return INTENTS.JOB_INFORMATION;
      }

      if (entityType.includes("exam")) {
        return INTENTS.EXAM_INFORMATION;
      }

      if (entityType.includes("department")) {
        return INTENTS.JOB_INFORMATION;
      }
    }

    return "";
  }

  function getContextIntentHint(pageContext) {
    /*
     * Allows page controllers to provide an explicit semantic hint without
     * forcing the router to understand every page implementation.
     *
     * Example:
     * data-ai-intent="eligibility"
     */
    const explicit =
      asString(
        pageContext?.aiIntent ||
          pageContext?.intent ||
          pageContext?.focus
      ).toLowerCase();

    const mapping = {
      career: INTENTS.CAREER_RECOMMENDATION,
      recommendation: INTENTS.CAREER_RECOMMENDATION,
      eligibility: INTENTS.ELIGIBILITY,
      job: INTENTS.JOB_INFORMATION,
      exam: INTENTS.EXAM_INFORMATION,
      recruitment: INTENTS.RECRUITMENT,
      salary: INTENTS.SALARY_PAY,
      pay: INTENTS.SALARY_PAY,
      compare: INTENTS.COMPARISON,
      comparison: INTENTS.COMPARISON,
      location: INTENTS.LOCATION_POSTING,
      posting: INTENTS.LOCATION_POSTING,
      housing: INTENTS.HOUSING,
      promotion: INTENTS.PROMOTION,
      worklife: INTENTS.WORK_LIFE,
      family: INTENTS.FAMILY,
      parents: INTENTS.PARENT_CARE,
      preparation: INTENTS.PREPARATION,
      physical: INTENTS.PHYSICAL_MEDICAL,
      sources: INTENTS.SOURCE_VERIFICATION,
      qualification: INTENTS.QUALIFICATION
    };

    return mapping[explicit] || "";
  }

  function applyIntentScore(scores, intent, amount, reason, matches) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    scores[intent] = scores[intent] || {
      score: 0,
      reasons: [],
      matches: []
    };

    scores[intent].score += amount;

    if (reason) {
      scores[intent].reasons.push(reason);
    }

    if (Array.isArray(matches) && matches.length) {
      scores[intent].matches.push(...matches);
    }
  }

  function scoreAllIntents(text, locale) {
    const scores = {};

    Object.entries(INTENT_DEFINITIONS).forEach(([intent, definition]) => {
      const keywordResult = scoreKeywords(text, definition, locale);

      if (keywordResult.score > 0) {
        applyIntentScore(
          scores,
          intent,
          keywordResult.score,
          "keyword-match",
          keywordResult.matches
        );
      }
    });

    return scores;
  }

  function boostBySignals(scores, entities, questionType, hardContext) {
    if (entities.hasIdentitySignal) {
      applyIntentScore(
        scores,
        INTENTS.PLATFORM_IDENTITY,
        40,
        "identity-signal"
      );
    }

    if (entities.hasComparisonSignal) {
      applyIntentScore(
        scores,
        INTENTS.COMPARISON,
        16,
        "comparison-signal"
      );
    }

    if (entities.hasSalarySignal) {
      applyIntentScore(
        scores,
        INTENTS.SALARY_PAY,
        16,
        "salary-signal"
      );
    }

    if (entities.hasParentSignal) {
      applyIntentScore(
        scores,
        INTENTS.PARENT_CARE,
        18,
        "parent-care-signal"
      );
    }

    if (entities.hasFamilySignal) {
      applyIntentScore(
        scores,
        INTENTS.FAMILY,
        15,
        "family-signal"
      );
    }

    if (entities.hasLocationSignal) {
      applyIntentScore(
        scores,
        INTENTS.LOCATION_POSTING,
        14,
        "location-signal"
      );
    }

    if (entities.hasExamSignal) {
      applyIntentScore(
        scores,
        INTENTS.EXAM_INFORMATION,
        11,
        "exam-signal"
      );
    }

    if (entities.hasQualificationSignal) {
      applyIntentScore(
        scores,
        INTENTS.QUALIFICATION,
        10,
        "qualification-signal"
      );
    }

    if (entities.hasPreparationSignal) {
      applyIntentScore(
        scores,
        INTENTS.PREPARATION,
        13,
        "preparation-signal"
      );
    }

    if (entities.hasSourceSignal) {
      applyIntentScore(
        scores,
        INTENTS.SOURCE_VERIFICATION,
        12,
        "source-signal"
      );
    }

    if (hardContext.hasBAEnglish) {
      applyIntentScore(
        scores,
        INTENTS.CAREER_RECOMMENDATION,
        7,
        "candidate-profile-signal"
      );
    }

    if (hardContext.hasParentCareNeed) {
      applyIntentScore(
        scores,
        INTENTS.PARENT_CARE,
        6,
        "parent-care-profile-signal"
      );
    }

    if (hardContext.hasKolkataPreference) {
      applyIntentScore(
        scores,
        INTENTS.LOCATION_POSTING,
        5,
        "location-preference-signal"
      );
    }

    if (hardContext.hasTransferPreference) {
      applyIntentScore(
        scores,
        INTENTS.LOCATION_POSTING,
        5,
        "transfer-preference-signal"
      );
    }

    if (hardContext.hasNightDutyConcern) {
      applyIntentScore(
        scores,
        INTENTS.WORK_LIFE,
        5,
        "schedule-signal"
      );
    }

    if (questionType.asksWhen) {
      applyIntentScore(
        scores,
        INTENTS.RECRUITMENT,
        5,
        "when-question"
      );
    }

    if (questionType.asksWhere) {
      applyIntentScore(
        scores,
        INTENTS.LOCATION_POSTING,
        5,
        "where-question"
      );
    }
  }

  function applyModeHint(scores, mode) {
    const intent = MODE_TO_INTENT[mode];

    if (!intent) {
      return;
    }

    applyIntentScore(
      scores,
      intent,
      22,
      "explicit-mode"
    );
  }

  function applyPageHint(scores, pageIntent) {
    if (!pageIntent) {
      return;
    }

    applyIntentScore(
      scores,
      pageIntent,
      12,
      "current-page-context"
    );
  }

  function applyConversationHint(scores, conversation, message) {
    if (!conversation.length) {
      return;
    }

    const previous = getLastConversationUserMessage(conversation);

    if (!previous) {
      return;
    }

    /*
     * Follow-up questions should inherit some topic context, but not so much
     * that they permanently lock a conversation to an old subject.
     */
    if (isShortFollowUp(message) || hasPronounOnlyReference(message)) {
      const previousResult = scoreAllIntents(
        normaliseForMatching(previous),
        detectLanguage(previous, LANGUAGES.ENGLISH)
      );

      Object.entries(previousResult).forEach(([intent, value]) => {
        const contribution = Math.min(value.score * 0.55, 18);

        applyIntentScore(
          scores,
          intent,
          contribution,
          "conversation-follow-up"
        );
      });
    }
  }

  function shouldTreatAsCareerRequest(
    text,
    entities,
    scores,
    pageContext
  ) {
    if (entities.hasGovernmentCareerSignal) {
      return true;
    }

    if (
      entities.hasJobSignal ||
      entities.hasExamSignal ||
      entities.hasQualificationSignal ||
      entities.hasSalarySignal ||
      entities.hasLocationSignal ||
      entities.hasFamilySignal ||
      entities.hasParentSignal ||
      entities.hasComparisonSignal ||
      entities.hasPreparationSignal ||
      entities.hasSourceSignal
    ) {
      return true;
    }

    const pageHint = getCurrentPageHint(pageContext);

    if (pageHint && pageHint !== INTENTS.GENERAL_INFORMATION) {
      return true;
    }

    const topIntent = getTopIntent(scores);

    return Boolean(
      topIntent.intent &&
        topIntent.intent !== INTENTS.GENERAL_INFORMATION &&
        topIntent.intent !== INTENTS.OUT_OF_SCOPE
    );
  }

  function getTopIntent(scores) {
    const entries = Object.entries(scores)
      .filter(([, value]) => value && Number(value.score) > 0)
      .sort((a, b) => b[1].score - a[1].score);

    if (!entries.length) {
      return {
        intent: "",
        score: 0,
        secondScore: 0,
        margin: 0,
        reasons: [],
        matches: []
      };
    }

    const [topIntent, top] = entries[0];
    const secondScore = entries[1]?.[1]?.score || 0;

    return {
      intent: topIntent,
      score: top.score,
      secondScore,
      margin: top.score - secondScore,
      reasons: [...new Set(top.reasons || [])],
      matches: top.matches || []
    };
  }

  function calculateConfidence(score, secondScore, isCareerRequest) {
    if (!score) {
      return "low";
    }

    const margin = score - secondScore;

    if (score >= 35 && margin >= 12) {
      return "high";
    }

    if (score >= 20 && margin >= 6) {
      return "medium";
    }

    if (isCareerRequest && score >= 15) {
      return "medium";
    }

    return "low";
  }

  function getRequiredContext(intent) {
    return [
      ...(INTENT_DEFINITIONS[intent]?.requiredContext || [])
    ];
  }

  function getSecondaryIntents(scores, primaryIntent) {
    return Object.entries(scores)
      .filter(([intent, value]) => {
        return (
          intent !== primaryIntent &&
          value &&
          value.score >= 7
        );
      })
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 4)
      .map(([intent]) => intent);
  }

  function getPreferredDomain(intent, isCareerRequest) {
    if (intent === INTENTS.OUT_OF_SCOPE) {
      return DOMAIN_TYPES.OUT_OF_SCOPE;
    }

    if (intent === INTENTS.PLATFORM_IDENTITY) {
      return DOMAIN_TYPES.PLATFORM;
    }

    if (
      isCareerRequest ||
      INTENT_DEFINITIONS[intent]?.domain === DOMAIN_TYPES.CAREER
    ) {
      return DOMAIN_TYPES.CAREER;
    }

    return DOMAIN_TYPES.GENERAL;
  }

  function getContextPriority(intent) {
    const priorityMap = {
      [INTENTS.PLATFORM_IDENTITY]: "local_config",
      [INTENTS.ELIGIBILITY]: "rule_first",
      [INTENTS.CAREER_RECOMMENDATION]: "engine_first",
      [INTENTS.SALARY_PAY]: "calculator_first",
      [INTENTS.COMPARISON]: "comparison_first",
      [INTENTS.SOURCE_VERIFICATION]: "source_first",
      [INTENTS.RECRUITMENT]: "current_data_first"
    };

    return priorityMap[intent] || "data_first";
  }

  function getNeedsLiveData(intent, text) {
    /*
     * This router does not perform web retrieval. It only marks requests that
     * normally require fresh/current data so that the backend/context layer
     * can handle them correctly.
     */
    const value = normaliseForMatching(text);

    const freshnessSignals = [
      "latest",
      "current",
      "today",
      "now",
      "currently",
      "recent",
      "newest",
      "2026",
      "2027",
      "২০২৬",
      "২০২৭",
      "বর্তমান",
      "এখন",
      "সাম্প্রতিক"
    ];

    return (
      intent === INTENTS.RECRUITMENT ||
      intent === INTENTS.SOURCE_VERIFICATION ||
      freshnessSignals.some((signal) =>
        phraseMatches(value, normaliseForMatching(signal))
      )
    );
  }

  function getNeedsCandidateProfile(intent) {
    return [
      INTENTS.CAREER_RECOMMENDATION,
      INTENTS.ELIGIBILITY,
      INTENTS.COMPARISON,
      INTENTS.FAMILY,
      INTENTS.PARENT_CARE
    ].includes(intent);
  }

  function getNeedsCurrentPage(intent, message, pageContext) {
    const hasPageContext =
      pageContext &&
      typeof pageContext === "object" &&
      Object.keys(pageContext).length > 0;

    if (!hasPageContext) {
      return false;
    }

    if (
      isShortFollowUp(message) ||
      hasPronounOnlyReference(message)
    ) {
      return true;
    }

    return [
      INTENTS.JOB_INFORMATION,
      INTENTS.EXAM_INFORMATION,
      INTENTS.ELIGIBILITY,
      INTENTS.COMPARISON,
      INTENTS.SALARY_PAY,
      INTENTS.LOCATION_POSTING,
      INTENTS.HOUSING,
      INTENTS.PROMOTION,
      INTENTS.SOURCE_VERIFICATION
    ].includes(intent);
  }

  function isLikelyOutOfScope(text, scores) {
    const value = normaliseForMatching(text);

    const definition = INTENT_DEFINITIONS[INTENTS.OUT_OF_SCOPE];

    const result = scoreKeywords(
      value,
      definition,
      LANGUAGES.ENGLISH
    );

    if (result.score >= 2) {
      return true;
    }

    /*
     * This is intentionally conservative. A general question is not treated
     * as out-of-scope merely because it is not about government careers.
     *
     * The safety module/backend remains responsible for actual safety policy.
     */
    return false;
  }

  function classify(options = {}) {
    const message = normaliseWhitespace(options.message);

    if (!message) {
      return {
        intent: INTENTS.CLARIFICATION,
        domain: DOMAIN_TYPES.CAREER,
        confidence: "high",
        score: 0,
        language: getLocale(options),
        isCareerRelated: true,
        isGeneralInformation: false,
        isOutOfScope: false,
        requiresClarification: true,
        reason: "empty-message",
        requiredContext: [],
        secondaryIntents: [],
        needsCurrentData: false,
        needsCandidateProfile: false,
        needsCurrentPage: false,
        contextPriority: "clarification",
        entities: {}
      };
    }

    const locale = detectLanguage(
      message,
      getLocale(options)
    );

    const normalized = normaliseForMatching(message);
    const conversation = getConversation(options);
    const pageContext = getPageContext(options);
    const mode = getMode(options.mode);

    const entities = detectEntitySignals(normalized);
    const questionType = detectQuestionType(normalized);
    const hardContext = detectHardContextSignals(normalized);

    /*
     * Always score first, then apply contextual boosts.
     */
    const scores = scoreAllIntents(normalized, locale);

    /*
     * Explicit platform identity gets the strongest deterministic treatment.
     */
    const platformDefinition =
      INTENT_DEFINITIONS[INTENTS.PLATFORM_IDENTITY];

    const hasExplicitIdentityPattern =
      platformDefinition.exactPatterns?.some((pattern) =>
        pattern.test(message)
      ) || false;

    if (hasExplicitIdentityPattern) {
      applyIntentScore(
        scores,
        INTENTS.PLATFORM_IDENTITY,
        100,
        "exact-identity-pattern"
      );
    }

    /*
     * Out-of-scope signals are only strong enough to route when they are
     * explicit. A generic question remains eligible for general information.
     */
    if (isLikelyOutOfScope(normalized, scores)) {
      applyIntentScore(
        scores,
        INTENTS.OUT_OF_SCOPE,
        80,
        "explicit-out-of-scope-signal"
      );
    }

    applyModeHint(scores, mode);

    applyPageHint(
      scores,
      getContextIntentHint(pageContext)
    );

    applyPageHint(
      scores,
      getCurrentPageHint(pageContext)
    );

    boostBySignals(
      scores,
      entities,
      questionType,
      hardContext
    );

    applyConversationHint(
      scores,
      conversation,
      message
    );

    const isCareerRequest = shouldTreatAsCareerRequest(
      normalized,
      entities,
      scores,
      pageContext
    );

    let top = getTopIntent(scores);

    /*
     * Explicitly prefer platform identity when identified. It should never be
     * accidentally overridden by a weak career/general keyword.
     */
    if (
      entities.hasIdentitySignal ||
      hasExplicitIdentityPattern
    ) {
      top = {
        ...top,
        intent: INTENTS.PLATFORM_IDENTITY
      };
    }

    /*
     * If the user explicitly selected a mode, that mode is a strong hint,
     * but platform identity and explicit out-of-scope signals retain priority.
     */
    if (
      mode !== MODES.AUTO &&
      top.intent !== INTENTS.PLATFORM_IDENTITY &&
      top.intent !== INTENTS.OUT_OF_SCOPE
    ) {
      const modeIntent = MODE_TO_INTENT[mode];

      if (modeIntent) {
        top = {
          ...top,
          intent: modeIntent
        };
      }
    }

    /*
     * General informational questions are valid Compass AI requests.
     *
     * Example:
     * "What is inflation?"
     *
     * This is not treated as a failure or out-of-scope. It becomes a general
     * information request unless the career context says otherwise.
     */
    if (
      !top.intent ||
      (
        top.score < 5 &&
        !isCareerRequest &&
        !entities.hasIdentitySignal
      )
    ) {
      top = {
        intent: INTENTS.GENERAL_INFORMATION,
        score: 1,
        secondScore: 0,
        margin: 1,
        reasons: ["no-strong-domain-signal"],
        matches: []
      };
    }

    /*
     * Very short follow-ups can be ambiguous. If no strong topic survived
     * conversation/page context, ask for clarification rather than guessing.
     */
    const ambiguousFollowUp =
      isShortFollowUp(message) &&
      top.score < 10 &&
      !getCurrentPageHint(pageContext) &&
      !getContextIntentHint(pageContext) &&
      conversation.length === 0;

    if (ambiguousFollowUp) {
      top = {
        ...top,
        intent: INTENTS.CLARIFICATION,
        reasons: [
          ...(top.reasons || []),
          "ambiguous-follow-up-without-context"
        ]
      };
    }

    const intent = top.intent;

    const confidence =
      intent === INTENTS.PLATFORM_IDENTITY
        ? "high"
        : intent === INTENTS.CLARIFICATION
          ? "high"
          : calculateConfidence(
              top.score,
              top.secondScore,
              isCareerRequest
            );

    const isOutOfScope = intent === INTENTS.OUT_OF_SCOPE;
    const isGeneralInformation =
      intent === INTENTS.GENERAL_INFORMATION;

    const requiredContext = getRequiredContext(intent);

    return {
      version: VERSION,

      intent,

      secondaryIntents: getSecondaryIntents(
        scores,
        intent
      ),

      domain: getPreferredDomain(
        intent,
        isCareerRequest
      ),

      confidence,

      score: Number(top.score || 0),

      language: locale,

      languageSource:
        detectLanguage(
          message,
          getLocale(options)
        ) === getLocale(options)
          ? "message_or_preference"
          : "message",

      mode,

      isCareerRelated: isCareerRequest,

      isGeneralInformation,

      isOutOfScope,

      requiresClarification:
        intent === INTENTS.CLARIFICATION,

      isFollowUp:
        isShortFollowUp(message) ||
        hasPronounOnlyReference(message),

      questionType,

      entities,

      candidateSignals: hardContext,

      reason:
        top.reasons?.[0] ||
        "best-scoring-intent",

      matchedSignals: (top.matches || [])
        .map((item) => item.keyword)
        .slice(0, 12),

      requiredContext,

      contextPriority:
        getContextPriority(intent),

      needsLiveData:
        getNeedsLiveData(
          intent,
          message
        ),

      needsCandidateProfile:
        getNeedsCandidateProfile(intent),

      needsCurrentPage:
        getNeedsCurrentPage(
          intent,
          message,
          pageContext
        ),

      pageHint:
        getCurrentPageHint(pageContext) ||
        getContextIntentHint(pageContext) ||
        null,

      previousUserMessage:
        getLastConversationUserMessage(
          conversation
        ) || null,

      /*
       * The following object is useful to context-builder.js. It gives the
       * builder a declarative set of retrieval targets without embedding
       * actual database records here.
       */
      retrievalPlan: buildRetrievalPlan({
        intent,
        secondaryIntents: getSecondaryIntents(
          scores,
          intent
        ),
        needsCandidateProfile:
          getNeedsCandidateProfile(intent),
        needsCurrentPage:
          getNeedsCurrentPage(
            intent,
            message,
            pageContext
          ),
        needsLiveData:
          getNeedsLiveData(
            intent,
            message
          )
      })
    };
  }

  function buildRetrievalPlan({
    intent,
    secondaryIntents,
    needsCandidateProfile,
    needsCurrentPage,
    needsLiveData
  }) {
    const plan = {
      common: false,
      jobs: false,
      exams: false,
      departments: false,
      organisations: false,
      serviceCadres: false,
      qualifications: false,
      eligibilityRules: false,
      recruitment: false,
      pay: false,
      locations: false,
      housing: false,
      promotion: false,
      benefits: false,
      sources: false,
      assessment: false,
      recommendation: false,
      calculators: false,
      candidateProfile: false,
      currentPage: false,
      searchIndex: false,
      liveData: false
    };

    const activate = (...fields) => {
      fields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(plan, field)) {
          plan[field] = true;
        }
      });
    };

    switch (intent) {
      case INTENTS.PLATFORM_IDENTITY:
        activate("common");
        break;

      case INTENTS.CAREER_RECOMMENDATION:
        activate(
          "common",
          "jobs",
          "exams",
          "departments",
          "organisations",
          "serviceCadres",
          "qualifications",
          "eligibilityRules",
          "recruitment",
          "pay",
          "locations",
          "housing",
          "promotion",
          "benefits",
          "sources",
          "recommendation",
          "candidateProfile"
        );
        break;

      case INTENTS.ELIGIBILITY:
        activate(
          "jobs",
          "exams",
          "qualifications",
          "eligibilityRules",
          "serviceCadres",
          "recruitment",
          "sources",
          "candidateProfile"
        );
        break;

      case INTENTS.JOB_INFORMATION:
        activate(
          "jobs",
          "departments",
          "organisations",
          "serviceCadres",
          "locations",
          "housing",
          "promotion",
          "benefits",
          "pay",
          "sources"
        );
        break;

      case INTENTS.EXAM_INFORMATION:
        activate(
          "exams",
          "jobs",
          "qualifications",
          "eligibilityRules",
          "recruitment",
          "sources"
        );
        break;

      case INTENTS.RECRUITMENT:
        activate(
          "exams",
          "jobs",
          "recruitment",
          "sources"
        );
        break;

      case INTENTS.SALARY_PAY:
        activate(
          "jobs",
          "pay",
          "benefits",
          "locations",
          "calculators",
          "sources"
        );
        break;

      case INTENTS.COMPARISON:
        activate(
          "jobs",
          "exams",
          "pay",
          "locations",
          "housing",
          "promotion",
          "benefits",
          "sources",
          "comparison",
          "candidateProfile"
        );
        break;

      case INTENTS.LOCATION_POSTING:
        activate(
          "jobs",
          "locations",
          "housing",
          "serviceCadres",
          "recruitment",
          "sources"
        );
        break;

      case INTENTS.HOUSING:
        activate(
          "jobs",
          "locations",
          "housing",
          "pay",
          "benefits",
          "sources"
        );
        break;

      case INTENTS.PROMOTION:
        activate(
          "jobs",
          "serviceCadres",
          "promotion",
          "recruitment",
          "sources"
        );
        break;

      case INTENTS.WORK_LIFE:
        activate(
          "jobs",
          "locations",
          "promotion",
          "benefits",
          "sources"
        );
        break;

      case INTENTS.FAMILY:
        activate(
          "jobs",
          "locations",
          "housing",
          "benefits",
          "promotion",
          "sources",
          "candidateProfile"
        );
        break;

      case INTENTS.PARENT_CARE:
        activate(
          "jobs",
          "locations",
          "housing",
          "benefits",
          "sources",
          "candidateProfile"
        );
        break;

      case INTENTS.PHYSICAL_MEDICAL:
        activate(
          "jobs",
          "eligibilityRules",
          "qualifications",
          "recruitment",
          "sources"
        );
        break;

      case INTENTS.PREPARATION:
        activate(
          "exams",
          "jobs",
          "qualifications",
          "recruitment",
          "sources",
          "assessment"
        );
        break;

      case INTENTS.QUALIFICATION:
        activate(
          "qualifications",
          "jobs",
          "exams",
          "eligibilityRules",
          "sources"
        );
        break;

      case INTENTS.SEARCH_DISCOVERY:
        activate(
          "searchIndex",
          "jobs",
          "exams",
          "departments",
          "organisations",
          "qualifications"
        );
        break;

      case INTENTS.SOURCE_VERIFICATION:
        activate(
          "sources",
          "jobs",
          "exams",
          "recruitment"
        );
        break;

      case INTENTS.GENERAL_INFORMATION:
        activate("common");
        break;

      case INTENTS.OUT_OF_SCOPE:
        /*
         * Do not retrieve sensitive or unnecessary career data when the
         * request has been routed out of scope.
         */
        break;

      case INTENTS.CLARIFICATION:
        activate("common");
        break;

      default:
        activate("common");
        break;
    }

    if (needsCandidateProfile) {
      plan.candidateProfile = true;
    }

    if (needsCurrentPage) {
      plan.currentPage = true;
    }

    if (needsLiveData) {
      plan.liveData = true;
    }

    /*
     * Secondary intents can add retrieval requirements.
     */
    secondaryIntents.forEach((secondaryIntent) => {
      switch (secondaryIntent) {
        case INTENTS.SALARY_PAY:
          plan.pay = true;
          plan.calculators = true;
          break;

        case INTENTS.ELIGIBILITY:
          plan.eligibilityRules = true;
          plan.qualifications = true;
          break;

        case INTENTS.LOCATION_POSTING:
          plan.locations = true;
          plan.housing = true;
          break;

        case INTENTS.PROMOTION:
          plan.promotion = true;
          plan.serviceCadres = true;
          break;

        case INTENTS.SOURCE_VERIFICATION:
          plan.sources = true;
          break;

        default:
          break;
      }
    });

    return plan;
  }

  function classify(message, options = {}) {
    if (typeof message === "object" && message !== null) {
      return classifyRequest(message);
    }

    return classifyRequest({
      ...options,
      message
    });
  }

  function classifyRequest(options = {}) {
    return classifyInternal(options);
  }

  function classifyInternal(options) {
    /*
     * Keep the implementation in a separate local function so the public API
     * remains stable if internal classification evolves.
     */
    return classifyCore(options);
  }

  function classifyCore(options) {
    return classifyImplementation(options);
  }

  function classifyImplementation(options) {
    /*
     * The actual classifier is intentionally referenced through the
     * standalone internal implementation below. Keeping the public method
     * path shallow makes future refactors safer.
     */
    const message = normaliseWhitespace(options.message);

    /*
     * Use the main classification implementation directly.
     *
     * This section is populated below by delegating to routeRequest, which is
     * the canonical public-level operation.
     */
    return routeRequest(options, message);
  }

  function routeRequest(options, message) {
    const locale = detectLanguage(
      message,
      getLocale(options)
    );

    const conversation = getConversation(options);
    const pageContext = getPageContext(options);

    const result = performRouting({
      ...options,
      message,
      locale,
      conversation,
      pageContext
    });

    return result;
  }

  function performRouting(options) {
    /*
     * This function contains the complete classification algorithm.
     *
     * It is separate from the public wrappers above so callers can use
     * route(), classify(), or classifyRequest() without depending on the
     * internal implementation.
     */
    const message = normaliseWhitespace(options.message);

    if (!message) {
      return {
        version: VERSION,
        intent: INTENTS.CLARIFICATION,
        secondaryIntents: [],
        domain: DOMAIN_TYPES.CAREER,
        confidence: "high",
        score: 0,
        language: options.locale,
        languageSource: "locale",
        mode: getMode(options.mode),
        isCareerRelated: true,
        isGeneralInformation: false,
        isOutOfScope: false,
        requiresClarification: true,
        isFollowUp: false,
        questionType: {
          isQuestion: false,
          asksWho: false,
          asksWhat: false,
          asksWhen: false,
          asksWhere: false,
          asksWhy: false,
          asksHow: false
        },
        entities: {},
        candidateSignals: {},
        reason: "empty-message",
        matchedSignals: [],
        requiredContext: [],
        contextPriority: "clarification",
        needsLiveData: false,
        needsCandidateProfile: false,
        needsCurrentPage: false,
        pageHint: null,
        previousUserMessage: null,
        retrievalPlan: buildRetrievalPlan({
          intent: INTENTS.CLARIFICATION,
          secondaryIntents: [],
          needsCandidateProfile: false,
          needsCurrentPage: false,
          needsLiveData: false
        })
      };
    }

    const locale = options.locale;
    const conversation = options.conversation || [];
    const pageContext = options.pageContext || {};
    const mode = getMode(options.mode);

    const normalized = normaliseForMatching(message);

    const entities = detectEntitySignals(normalized);
    const questionType = detectQuestionType(normalized);
    const hardContext = detectHardContextSignals(normalized);

    const scores = scoreAllIntents(
      normalized,
      locale
    );

    const platformDefinition =
      INTENT_DEFINITIONS[INTENTS.PLATFORM_IDENTITY];

    const explicitIdentity =
      Boolean(
        entities.hasIdentitySignal ||
        platformDefinition.exactPatterns?.some((pattern) =>
          pattern.test(message)
        )
      );

    if (explicitIdentity) {
      applyIntentScore(
        scores,
        INTENTS.PLATFORM_IDENTITY,
        100,
        "explicit-platform-identity"
      );
    }

    if (isLikelyOutOfScope(normalized, scores)) {
      applyIntentScore(
        scores,
        INTENTS.OUT_OF_SCOPE,
        80,
        "explicit-out-of-scope-signal"
      );
    }

    applyModeHint(scores, mode);

    const explicitContextIntent =
      getContextIntentHint(pageContext);

    const pageIntent =
      explicitContextIntent ||
      getCurrentPageHint(pageContext);

    applyPageHint(
      scores,
      explicitContextIntent
    );

    applyPageHint(
      scores,
      getCurrentPageHint(pageContext)
    );

    boostBySignals(
      scores,
      entities,
      questionType,
      hardContext
    );

    applyConversationHint(
      scores,
      conversation,
      message
    );

    const careerRelated =
      shouldTreatAsCareerRequest(
        normalized,
        entities,
        scores,
        pageContext
      );

    let top = getTopIntent(scores);

    if (explicitIdentity) {
      top = {
        ...top,
        intent: INTENTS.PLATFORM_IDENTITY,
        score: Math.max(top.score, 100)
      };
    }

    if (
      mode !== MODES.AUTO &&
      !explicitIdentity &&
      top.intent !== INTENTS.OUT_OF_SCOPE
    ) {
      const modeIntent = MODE_TO_INTENT[mode];

      if (modeIntent) {
        top = {
          ...top,
          intent: modeIntent
        };
      }
    }

    if (
      !top.intent ||
      (
        top.score < 5 &&
        !careerRelated &&
        !explicitIdentity
      )
    ) {
      top = {
        ...top,
        intent: INTENTS.GENERAL_INFORMATION,
        score: Math.max(top.score, 1),
        reasons: [
          ...(top.reasons || []),
          "general-information-fallback"
        ]
      };
    }

    const followUp =
      isShortFollowUp(message) ||
      hasPronounOnlyReference(message);

    if (
      followUp &&
      top.score < 10 &&
      !pageIntent &&
      !conversation.length
    ) {
      top = {
        ...top,
        intent: INTENTS.CLARIFICATION,
        score: 10,
        reasons: [
          ...(top.reasons || []),
          "ambiguous-follow-up"
        ]
      };
    }

    const intent = top.intent;

    const isOutOfScope =
      intent === INTENTS.OUT_OF_SCOPE;

    const isGeneralInformation =
      intent === INTENTS.GENERAL_INFORMATION;

    const confidence =
      intent === INTENTS.PLATFORM_IDENTITY
        ? "high"
        : intent === INTENTS.CLARIFICATION
          ? "high"
          : calculateConfidence(
              top.score,
              top.secondScore,
              careerRelated
            );

    const secondaryIntents =
      getSecondaryIntents(
        scores,
        intent
      );

    const needsCandidateProfile =
      getNeedsCandidateProfile(intent);

    const needsCurrentPage =
      getNeedsCurrentPage(
        intent,
        message,
        pageContext
      );

    const needsLiveData =
      getNeedsLiveData(
        intent,
        message
      );

    return {
      version: VERSION,

      intent,

      secondaryIntents,

      domain: getPreferredDomain(
        intent,
        careerRelated
      ),

      confidence,

      score: Math.round(
        Number(top.score || 0) * 100
      ) / 100,

      language: locale,

      languageSource:
        locale === detectLanguage(message, locale)
          ? "message"
          : "locale",

      mode,

      isCareerRelated: careerRelated,

      isGeneralInformation,

      isOutOfScope,

      requiresClarification:
        intent === INTENTS.CLARIFICATION,

      isFollowUp: followUp,

      questionType,

      entities,

      candidateSignals: hardContext,

      reason:
        top.reasons?.[0] ||
        "best-scoring-intent",

      matchedSignals: (top.matches || [])
        .map((match) => match.keyword)
        .filter(Boolean)
        .slice(0, 12),

      requiredContext:
        getRequiredContext(intent),

      contextPriority:
        getContextPriority(intent),

      needsLiveData,

      needsCandidateProfile,

      needsCurrentPage,

      pageHint:
        pageIntent || null,

      previousUserMessage:
        getLastConversationUserMessage(
          conversation
        ) || null,

      retrievalPlan:
        buildRetrievalPlan({
          intent,
          secondaryIntents,
          needsCandidateProfile,
          needsCurrentPage,
          needsLiveData
        })
    };
  }

  /*
   * Public helpers
   */

  function route(options = {}) {
    return classifyRequest(options);
  }

  function getIntentDefinitions() {
    return JSON.parse(
      JSON.stringify(INTENT_DEFINITIONS)
    );
  }

  function getSupportedIntents() {
    return Object.values(INTENTS);
  }

  function getSupportedModes() {
    return Object.values(MODES);
  }

  function isCareerIntent(intent) {
    return (
      INTENT_DEFINITIONS[intent]?.domain ===
      DOMAIN_TYPES.CAREER
    );
  }

  function isGeneralIntent(intent) {
    return (
      intent === INTENTS.GENERAL_INFORMATION
    );
  }

  function isSafeRoutingResult(result) {
    if (!result || typeof result !== "object") {
      return false;
    }

    return Boolean(
      result.intent &&
      Object.values(INTENTS).includes(result.intent)
    );
  }

  /*
   * Public namespace
   */
  const api = Object.freeze({
    version: VERSION,

    intents: INTENTS,
    modes: MODES,
    languages: LANGUAGES,
    domains: DOMAIN_TYPES,

    route,

    classify: classifyRequest,

    getIntentDefinitions,

    getSupportedIntents,

    getSupportedModes,

    isCareerIntent,

    isGeneralIntent,

    isSafeRoutingResult
  });

  global.GovCareerCompassAIIntentRouter = api;

  /*
   * Backward-friendly aliases for internal project code.
   *
   * Prefer GovCareerCompassAIIntentRouter in new code.
   */
  global.GovCareerCompass = global.GovCareerCompass || {};

  global.GovCareerCompass.routeAIIntent = route;
  global.GovCareerCompass.classifyAIIntent = classifyRequest;

})(window);
