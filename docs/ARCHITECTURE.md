GovCareer Compass — System Architecture

Document status: Permanent
Document version: 1.1.0

---

1. Architectural Objective

The platform must remain maintainable as it grows from:

West Bengal + Central Government

to potentially:

All Indian States
+
Central Government
+
Multiple Languages
+
Large Government Career Database
+
Compass AI

The architecture therefore separates:

DATA
RULES
APPLICATION LOGIC
PRESENTATION
RESEARCH
TESTING
DEPLOYMENT

These layers must not be unnecessarily mixed.

The system remains static-first: ordinary application pages are served as HTML/CSS/JavaScript, with server-side services introduced only where a secure boundary is required.

---

2. Core Architecture

                         USER
                           │
                           ▼
                    PRESENTATION
                  HTML + CSS + UI
                           │
                           ▼
                  APPLICATION LAYER
                           │
          ┌────────────────┼────────────────┬────────────────────┐
          │                │                │                    │
          ▼                ▼                ▼                    ▼
      SEARCH          ELIGIBILITY       RECOMMENDATION       COMPASS AI UI
                         ENGINE             ENGINE                │
          │                │                │                    │
          └────────────────┼────────────────┘                    │
                           ▼                                     │
                    COMPARISON / TOOLS                           │
                           │                                     │
                           ▼                                     │
                       DATA LAYER                                │
                           │                                     │
          ┌────────────────┼─────────────────┐                   │
          │                │                 │                   │
          ▼                ▼                 ▼                   │
       COMMON          CENTRAL            STATES                 │
                                          │                      │
                                    WEST BENGAL                   │
                                          │                      │
                                    FUTURE STATES                │
                           │                                     │
                           ▼                                     │
                     SOURCE SYSTEM                              │
                           │                                     │
                           ▼                                     │
                    RESEARCH SYSTEM                              │
                                                                 │
                                                                 ▼
                    AI APPLICATION PIPELINE
                 Intent → Context → Safety
                           │
                           ▼
                      Browser Client
                           │
                           ▼
                        /api/chat
                           │
                           ▼
                  Server AI Configuration
                           │
                           ▼
                       OpenRouter
                           │
                           ▼
                    Selected AI Model
                           │
                           ▼
                 Response Parsing / UI

---

3. Source-of-Truth Hierarchy

The information hierarchy is:

Official Government Source
        ↓
Research Record
        ↓
Verification / Audit
        ↓
Canonical JSON
        ↓
Runtime Validator / Registry
        ↓
Derived Indexes
        ↓
Application
        ↓
User

AI is downstream of the structured application context. It must never become the primary factual source for canonical government-career data.

For career facts, the structured data, eligibility rules, recruitment records, and application engines remain authoritative according to their respective responsibilities.

---

4. Data Architecture

The canonical production data structure is:

data/
├── common/
├── assessment/
├── i18n/
├── central/
├── states/
│   └── west-bengal/
├── indexes/
└── schemas/

Canonical records are stored in their domain datasets. Schemas define their machine-readable structure. Indexes are derived and must not become a second manually maintained database.

---

5. Common Data

"data/common/" contains shared reference information.

Examples:

- qualification categories;
- job categories;
- governments;
- states;
- locations;
- statuses;
- confidence levels;
- source types;
- glossary;
- shared scoring terminology.

Common data must not contain duplicated individual job records.

---

6. Assessment Data

"data/assessment/" contains:

- questions;
- options;
- branching;
- candidate profile fields;
- scoring rules.

Assessment data defines how the user is questioned.

It does not define government recruitment facts.

---

7. Language Data

"data/i18n/" contains UI translation strings.

Stable entity IDs must remain identical across languages.

Example:

kp-si

must remain:

kp-si

in English and Bengali.

Only display text changes.

The AI layer also respects the selected application language. Initial supported AI languages are English and Bengali.

---

8. Central Government Data

"data/central/" contains Central Government records.

Recommended entities:

- exams;
- jobs;
- departments;
- organisations;
- recruitment;
- pay;
- locations;
- housing;
- promotion;
- benefits;
- sources.

---

9. State Government Data

Each state gets an isolated package.

Example:

data/states/west-bengal/

The package contains:

- exams;
- jobs;
- departments;
- organisations;
- recruitment;
- pay;
- locations;
- housing;
- promotion;
- benefits;
- sources.

A future state should use the same conceptual structure.

---

10. Index Architecture

"data/indexes/" contains searchable/indexed representations.

Indexes should be generated from canonical datasets where practical.

They must not become a second manually maintained database.

Derived search or recommendation structures are not canonical facts.

---

11. Schema Architecture

"data/schemas/" defines valid data structures.

Schemas should validate:

- required fields;
- field types;
- allowed values;
- score ranges;
- identifiers;
- references.

The goal is to catch data errors before publication.

The machine-readable schemas are the structural source of truth. Permanent documentation must follow the actual schema files rather than defining a competing contract.

---

12. Facts and Analysis

Production records should distinguish:

Facts

Examples:

- qualification;
- age;
- pay;
- recruitment;
- physical standards;
- official duties;
- source.

Analysis

Examples:

- family compatibility;
- parent-care compatibility;
- stress score;
- location score;
- English advantage;
- overall fit.

Analysis must never overwrite facts.

Candidate-specific eligibility outcomes and recommendation scores are application results, not canonical government facts.

---

13. Application Layer

The application layer is responsible for:

- loading data;
- filtering;
- searching;
- eligibility;
- recommendation;
- comparison;
- calculators;
- user preferences;
- page rendering;
- application-context construction for Compass AI.

Application logic must not hard-code individual careers where generic rules can be used.

Bad design:

if user.familyPriority > 8
    recommend career X

Preferred design:

eligible careers
→ metric scoring
→ user weights
→ ranking
→ explanation

For AI interactions, the application layer may provide structured context such as the candidate profile, selected career/exam, current eligibility outcome, recommendation result, comparison state, and current page.

---

14. Eligibility Architecture

Eligibility is a hard decision layer.

Candidate Profile
       ↓
Eligibility Rules
       ↓
Direct
Conditional
Not Eligible
Review Required / Unknown
       ↓
Preference Scoring

A career excluded by eligibility must not receive a normal preference score.

Canonical eligibility rules remain in the eligibility-rule data and are evaluated by the Eligibility Engine. Compass AI may explain an eligibility result, but it must not redefine the underlying rule.

---

15. Recommendation Architecture

The recommendation system consists of:

Preference Engine
        ↓
Scoring Engine
        ↓
Ranking Engine
        ↓
Explanation Engine

The system must preserve score direction.

Example:

Salary
higher = better

Family
higher = better

Safety
higher = better

Stress
higher = worse

Risk
higher = worse

Transfer Burden
higher = worse

Compass AI may explain a grounded recommendation result or comparison, but the recommendation engine remains the source of the result itself.

---

16. State Architecture

The generic application must not require state-specific code everywhere.

Instead, state data is loaded according to a state registry.

Conceptually:

state = west-bengal
        ↓
load west-bengal dataset
        ↓
combine with Central Government
        ↓
recommend

Future:

state = bihar
        ↓
load Bihar dataset
        ↓
combine with Central Government

The AI context must not imply detailed state coverage that is not actually supplied by the active application data.

---

17. Government Type Architecture

The system must distinguish:

- Central Government;
- State Government;
- Local Government;
- Public Sector Undertaking;
- statutory body;
- autonomous institution.

No category should silently be treated as another.

---

18. Compass AI Architecture

Compass AI is an existing application capability, not a future architecture layer.

Its canonical user-interface owner is:

js/components/ai-assistant.js

This is the global Compass AI component used from the shared site shell. It owns:

- open/close state;
- responsive desktop/tablet panel behavior;
- mobile bottom-sheet behavior;
- conversation presentation;
- input and mode-selection UI;
- bounded local AI session history;
- copy actions;
- source/confidence/warning presentation when supplied;
- accessibility and focus behavior.

It does not own:

- canonical career facts;
- authoritative salary data;
- eligibility decisions;
- scoring;
- ranking;
- recommendation logic;
- backend secrets;
- canonical prompt policy.

The browser-side AI architecture is modular:

js/components/ai-assistant.js
        ↓
js/ai/intent-router.js
        ↓
js/ai/context-builder.js
        ↓
js/ai/safety.js
        ↓
js/ai/client.js
        ↓
/api/chat
        ↓
server-side configuration / prompt policy
        ↓
OpenRouter
        ↓
selected model
        ↓
response parsing
        ↓
global Compass AI UI

The roles are:

Intent routing

"js/ai/intent-router.js" deterministically classifies the user's request and identifies the relevant application context and retrieval needs. It does not contain an LLM secret or replace application engines.

Context building

"js/ai/context-builder.js" turns available application state into structured context for the AI request. This can include candidate information, selected career or exam, comparison state, eligibility result, recommendation result, source information, and current application/page context.

Safety helpers

"js/ai/safety.js" provides bounded client-side safety and identity helpers. It does not become the authoritative career-data validator.

Client transport

"js/ai/client.js" sends the normalized conversation, language, and application context to "/api/chat". It contains no OpenRouter API key.

Server boundary

"api/chat.mjs" is the secure server-side boundary. It validates the request, sanitizes messages and context, loads server configuration and prompt policy, calls the upstream model, and returns a controlled response.

Server configuration

"api/_lib/config.mjs" contains the server-side CompassAI configuration. Secrets are supplied through server environment variables, not public JavaScript or JSON. In particular, the OpenRouter API key is read from "OPENROUTER_API_KEY" on the server only; the selected model is supplied by "OPENROUTER_MODEL".

Prompt policy

"api/_lib/compass-prompt.mjs" is the canonical server-side behavior definition. It establishes the assistant identity, government-career grounding requirements, uncertainty rules, source handling, language behavior, and security boundaries.

Response parsing

"js/ai/response-parser.js" validates and normalizes the server response for the UI. Presentation logic must not reinterpret a response into new canonical facts.

Grounding

Compass AI must use structured application context when discussing GovCareer Compass career facts. Canonical career data remains in the database; deterministic eligibility and recommendation engines remain authoritative for their results. AI is an explanation and interaction layer over those systems, not a replacement for them.

Current-page context

The current page and current application state are valid context inputs. For example, an AI question asked from a job-details, exam-details, comparison, eligibility, salary, housing, or preparation surface may be grounded using the relevant current page/entity context when that context is explicitly supplied.

Source and confidence handling

When source or confidence metadata is available in canonical data or application context, Compass AI may surface or explain that metadata. It must not invent sources, confidence levels, notification numbers, vacancies, pay values, promotion rules, physical standards, or accommodation availability. Lack of verified context must be represented as uncertainty rather than false precision.

Language

Compass AI follows the selected application language. The current supported languages are English and Bengali. Official names and abbreviations should be preserved where translation could introduce factual ambiguity.

Identity

Compass AI has one product identity. The identity is configuration-driven in the server-side AI configuration and canonical prompt policy, with the presentation layer using that identity rather than creating a second assistant identity. Public ownership/creator statements must remain deterministic and consistent with the product configuration.

Security

No AI secret may appear in public JavaScript, HTML, JSON, browser storage, or client requests. The browser knows only the "/api/chat" interface; secret credentials exist only in server-side environment configuration.

---

19. Global AI UI and "pages/ai.html"

The global assistant component is the canonical AI UI implementation.

"pages/ai.html" is a navigable product surface for Compass AI, not a second canonical AI component.

Its architectural role is to provide an AI-focused page surface within the existing page architecture. It may host explanatory content and a dedicated AI interaction surface, but it must not define a separate AI backend, eligibility engine, recommendation engine, source-of-truth, or divergent AI policy.

The global header AI trigger must continue to target the canonical "js/components/ai-assistant.js" experience. Page-level AI content should reuse the same AI contracts and identity rather than creating competing implementations.

---

20. Storage Architecture

Version 1 may use browser "localStorage" for:

- theme;
- language;
- state;
- questionnaire state;
- bookmarks;
- recently viewed careers;
- comparison selections;
- user preference profile;
- bounded non-secret Compass AI conversation state.

No login is required for Version 1.

AI storage must never contain API keys or other server secrets.

---

21. Server Boundary

Server-side capabilities are introduced only where a secure or non-static boundary is required.

Current required server capability:

- secure Compass AI API at "/api/chat".

Potential future server requirements:

- authentication;
- cloud profiles;
- notifications;
- current recruitment services.

Until required, keep the rest of the system static-first.

---

22. Deployment Architecture

Primary:

GitHub
 ↓
Vercel
 ↓
Live Website

Secondary/static compatibility:

GitHub
 ↓
GitHub Pages

GitHub remains the project source of truth even when Vercel is used for production deployment.

---

23. Architectural Stability Rule

Normal feature development must not require moving existing data into a new model.

New functionality should normally be implemented by:

- adding data;
- adding a module;
- adding a component;
- adding a page;
- adding a rule;
- adding tests.

Architectural rewrites should be exceptional.

Adding AI capabilities must not move canonical career facts into the AI layer.

---

24. Security Boundary

Never put:

- API keys;
- tokens;
- passwords;
- private credentials;

inside public JavaScript or public JSON.

Sensitive configuration belongs outside the public repository.

For Compass AI specifically:

Browser
  → public "/api/chat" contract
  → server
  → environment configuration
  → OpenRouter

The OpenRouter API key must exist only in server-side environment configuration.

---

25. Performance Principle

Large data must not make the website unusable.

Use:

- indexed search;
- lazy rendering where useful;
- pagination or virtualized presentation where needed;
- caching;
- lightweight assets;
- modular page rendering.

Do not duplicate entire datasets into multiple files unnecessarily.

AI requests should also use bounded message, context, request-size, and timeout limits as defined by the server configuration/security boundary.

---

26. Architecture Completion Standard

The architecture is considered stable when:

- new jobs can be added without changing the core UI;
- new exams can be added without rewriting the recommendation engine;
- new states can be added as data packages;
- new languages can be added as translation packages;
- scoring can evolve through versioned rules;
- sources can be updated independently;
- Compass AI can explain grounded application results without exposing secrets;
- the global AI UI remains a single canonical component;
- page surfaces do not create competing AI implementations.

---

27. Final Architectural Principle

GovCareer Compass is a data-first, rules-first, static-first government-career intelligence system.

Canonical facts belong to canonical data.

Eligibility belongs to eligibility rules and the Eligibility Engine.

Preference fit, scoring and ranking belong to their dedicated application engines.

Sources and confidence qualify the evidence.

Compass AI is a secure, global interaction and explanation layer over those systems.

The AI can help the user understand the application, but it must not become the application’s source of truth.
