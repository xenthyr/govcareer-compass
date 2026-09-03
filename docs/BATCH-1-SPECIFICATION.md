# GovCareer Compass — Batch 1 Specification

**File:** `/docs/BATCH-1-SPECIFICATION.md`  
**Document Type:** Canonical Batch Development Specification  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-09-03`  
**Applies To:** Batch 1 implementation and all implementation decisions made under Batch 1  
**Repository:** `xenthyr/govcareer-compass`

---

# 1. Purpose

This document is the authoritative repository-level specification for **Batch 1** of GovCareer Compass.

Its purpose is to define exactly what Batch 1 is expected to accomplish, what it must not attempt to accomplish, which existing contracts it depends on, which files it may update or create, how the work must integrate with the existing application architecture, and what conditions must be satisfied before Batch 1 is considered complete.

Batch 1 exists to move the repository from its established architectural and contract foundation into the next implementation layer **without introducing a competing architecture or requiring implementation decisions to be reconstructed from previous conversation history**.

The repository remains the source of truth for code and structured application data. This document is the source of truth for Batch 1 scope and execution boundaries.

---

# 2. Relationship to Permanent Project Documents

Batch 1 does not replace or redefine permanent project specifications.

The following documents remain authoritative for their respective subjects:

- `/docs/PRODUCT-VISION.md` — product purpose, principles, initial audience and broad scope;
- `/docs/PRODUCT-ROADMAP.md` — long-term development sequencing and product stages;
- `/docs/ARCHITECTURE.md` — system architecture and module boundaries;
- `/docs/PAGE-MAP.md` — page and navigation architecture;
- `/docs/REPOSITORY-RULES.md` — repository governance and development rules;
- `/docs/SCHEMA.md` — human-readable schema guidance, synchronized with the machine-readable schemas;
- `/data/schemas/*.json` — machine-readable canonical data contracts;
- `/docs/ELIGIBILITY-MODEL.md` — eligibility logic;
- `/docs/RECOMMENDATION-MODEL.md` — recommendation, scoring and ranking logic;
- `/docs/SOURCE-STANDARDS.md` — source and evidence standards;
- `/docs/DATA-QUALITY.md` — production data quality requirements;
- `/docs/DATA-UPDATE-WORKFLOW.md` — governed data-update workflow;
- `/docs/STATE-EXPANSION-MODEL.md` — multi-state architecture;
- `/docs/RESEARCH-METHODOLOGY.md` — research and verification methodology.

Where this document describes implementation sequencing, it must be interpreted together with the permanent documents above. It must not contradict them.

---

# 3. Batch 1 Objective

Batch 1 shall establish the **first complete, reusable application-shell implementation layer over the already-defined project contracts**.

The objective is not to redesign the platform. The objective is to make the existing architecture executable and reusable through a coherent shared shell and its foundational page/application integration points.

Batch 1 must leave the repository in a state where subsequent batches can add page-specific functionality and decision tools by consuming established shared infrastructure rather than creating competing versions of the shell, routing, state, language, theme, storage, search, AI trigger, overlays, or data-access conventions.

The Batch 1 outcome must therefore emphasize:

- a coherent shared application shell;
- canonical bootstrap ownership;
- stable routing/navigation integration;
- shared header/footer integration;
- language and theme integration;
- reusable global UI infrastructure;
- canonical page/controller integration boundaries;
- accessibility and responsive-shell behavior;
- minimum smoke/regression coverage for the infrastructure touched by Batch 1.

Batch 1 is complete only when those foundations can be reused by later batches without introducing a second competing implementation path.

---

# 4. Batch 1 Scope

## 4.1 Shared Application Shell

Batch 1 includes implementation and integration of the shared application shell represented by the existing repository architecture.

This includes, where required by the existing contracts:

- application bootstrap;
- global header;
- global footer;
- primary navigation;
- responsive navigation/drawer integration;
- global search trigger/mount;
- language selector integration;
- theme selector integration;
- state selector integration;
- shared overlay/dialog/drawer infrastructure required by the shell;
- consistent page-level shell mounting.

The shell must consume existing components and services rather than duplicating their logic.

## 4.2 Canonical Bootstrap

Batch 1 includes finalizing and validating the existing bootstrap contract:

```text
HTML/module entry
      ↓
js/app.js
      ↓
shared application initialization
      ↓
page/controller initialization
```

`js/app.js` remains the **single canonical bootstrap owner**.

`js/init.js`, where retained, remains a compatibility/entry-layer module and must not become a second independent bootstrap implementation.

No second application initialization lifecycle may be introduced.

## 4.3 Route and Page Integration

Batch 1 includes establishing the reusable page/controller contract for the routes already defined in the repository.

Existing route definitions must remain configuration/routing driven.

Page-specific controllers must:

- be loaded through the canonical application lifecycle;
- receive a stable page/controller context;
- consume shared services rather than reproducing global infrastructure;
- remain independent of unrelated page implementations;
- preserve the existing multi-page application architecture.

Batch 1 may implement the page/controller surfaces required by the current Batch 1 scope, but it must not attempt to fully implement every product feature defined for later phases.

## 4.4 Shared UI and Interaction Contracts

Batch 1 includes stabilization of shared UI contracts that later pages depend on, including:

- reusable header/footer mounting;
- search mounting;
- responsive navigation;
- theme/language/state controls;
- modal/drawer interaction contracts;
- loading, error and empty-state conventions where needed for shell infrastructure;
- accessibility hooks and keyboard behavior for shared controls.

## 4.5 Compass AI Shell Integration

The repository already contains Compass AI architectural and implementation groundwork. Batch 1 therefore treats the **global AI shell integration contract** as a shared infrastructure concern rather than creating a separate page-only chatbot architecture.

Batch 1 may integrate the existing canonical global Compass AI component into the shared shell where required.

The canonical boundary is:

```text
Global header trigger
        ↓
js/components/ai-assistant.js
        ↓
js/ai/* client/context/safety/parsing
        ↓
/api/chat
        ↓
server-side AI configuration
```

A dedicated AI page may remain as a public discovery surface, but it must not become a competing AI implementation.

Batch 1 does **not** constitute a full AI feature expansion. It only establishes or preserves the shared integration boundary necessary for the shell.

## 4.6 Localization Integration

Batch 1 includes integration of the already-defined localization architecture into the shared shell.

Initial supported interface languages remain:

- English;
- Bengali.

The implementation must use stable translation keys and the existing language service.

No language-specific application logic may be introduced.

## 4.7 Theme Integration

Batch 1 includes integration of:

- light theme;
- dark theme;
- system theme;

through the existing theme service and selector architecture.

Theme persistence remains owned by the existing storage/theme services.

## 4.8 State Selection Integration

Batch 1 may expose the existing state-selection architecture through the shared shell.

The state selector must distinguish:

```text
state listed
    ≠
state dataset available
```

No unavailable state may be represented as fully researched merely because it is selectable.

## 4.9 Testing and Validation Foundation

Batch 1 includes minimum testing and validation necessary to protect the infrastructure it introduces or modifies.

This includes, where practical:

- bootstrap smoke checks;
- route/controller existence checks;
- shared component initialization checks;
- localization key/integration checks for touched shell content;
- theme/language/state persistence checks where those modules are touched;
- accessibility-oriented structural checks for shared controls;
- regression tests for critical shared behavior.

The batch must not attempt to create the entire future end-to-end testing suite.

---

# 5. Explicitly Out of Scope

The following are **not Batch 1 objectives** unless a later specification explicitly supersedes this document.

## 5.1 Full Career Finder Implementation

The complete guided Career Finder flow, assessment branching, candidate profiling and personalized results remain later functionality unless explicitly included by a separate Batch 1 sub-specification.

## 5.2 Full Job and Exam Explorer Functionality

Batch 1 does not require full production implementation of:

- job filtering interfaces;
- exam explorer workflows;
- job-detail intelligence;
- exam-detail intelligence;
- advanced comparison;
- ranking pages.

Shared shell integration may be prepared for these surfaces without implementing all feature behavior.

## 5.3 New Eligibility Logic

Batch 1 must not redesign or replace the eligibility engine.

Existing eligibility architecture and canonical rule schemas remain authoritative.

## 5.4 New Recommendation Logic

Batch 1 must not redesign scoring, ranking or recommendation methodology.

## 5.5 New Government Data Research

Batch 1 is not a research expansion batch.

No new government facts should be introduced merely to populate UI placeholders.

Where data is required for implementation validation, use existing verified repository data.

## 5.6 New State Datasets

No new state-government dataset is required by Batch 1.

West Bengal and Central Government remain the initial detailed coverage.

## 5.7 New Languages

No additional interface language is required by Batch 1.

## 5.8 Authentication / Accounts

No login, cloud profile, account system or identity management is part of Batch 1.

## 5.9 Notifications and Monitoring

No recruitment-alert service, notification engine, source-change watcher, email delivery system or scheduled monitoring feature is part of Batch 1.

## 5.10 Framework Migration

Batch 1 must not migrate the project to React, Vue, Svelte, Next.js, Nuxt, a new CSS framework, a new state-management framework, or another application architecture merely for convenience.

## 5.11 Database Replacement

Batch 1 must not replace the existing JSON/static-first data architecture with a server database.

## 5.12 AI Model Expansion

Batch 1 must not introduce a new AI provider abstraction, retrieval platform, vector database, agent framework or speculative AI orchestration layer.

---

# 6. Repository State Required Before Batch 1 Starts

Before implementation begins, the repository must satisfy the following prerequisites.

## 6.1 Documentation Baseline

The following must describe the same architecture:

- product vision;
- roadmap;
- architecture;
- page map;
- repository rules;
- schema guide;
- Batch 1 specification.

Material contradictions must be resolved before implementation where they would force implementation assumptions.

## 6.2 Schema Baseline

The machine-readable schemas under `/data/schemas/` remain authoritative.

Batch 1 must consume the finalized nested/relational canonical model and must not reintroduce retired flat Job fields as an alternative canonical structure.

## 6.3 Runtime Data Baseline

The existing loader, normalizer, validator, registry and index architecture must remain available.

Batch 1 must not create a parallel data-access mechanism merely to serve the UI.

## 6.4 Bootstrap Baseline

`js/app.js` is the single owner of actual application startup.

`js/init.js` must not create a competing startup mechanism.

## 6.5 Routing Baseline

`js/router.js` remains the routing authority.

`js/navigation.js` remains the navigation integration layer.

Route definitions remain configuration-driven.

## 6.6 Shared Component Baseline

Existing shared components should be reused where they already provide the required contract:

- header;
- footer;
- drawer;
- modal;
- search bar;
- filter components;
- state selector;
- language selector;
- theme selector;
- AI assistant.

No duplicate component should be created for an already-covered responsibility.

## 6.7 Quality Baseline

Repository CI must remain functional.

New logic introduced by Batch 1 must have appropriate automated checks where practical.

---

# 7. Dependencies on Existing Repository Files

The following existing files are Batch 1 dependencies.

## Application core

- `/js/app.js`
- `/js/init.js`
- `/js/config.js`
- `/js/router.js`
- `/js/navigation.js`
- `/js/storage.js`
- `/js/theme.js`
- `/js/language.js`

## Shared UI

- `/js/components/header.js`
- `/js/components/footer.js`
- `/js/components/drawer.js`
- `/js/components/modal.js`
- `/js/components/search-bar.js`
- `/js/components/state-selector.js`
- `/js/components/language-selector.js`
- `/js/components/theme-selector.js`
- `/js/components/ai-assistant.js`

## Data/runtime infrastructure

- `/js/database/loader.js`
- `/js/database/normalizer.js`
- `/js/database/validators.js`
- `/js/database/registry.js`
- `/js/database/indexes.js`
- `/js/database/cache.js`

## AI integration

- `/js/ai/client.js`
- `/js/ai/context-builder.js`
- `/js/ai/response-parser.js`
- `/js/ai/safety.js`
- `/js/ai/intent-router.js`
- `/api/chat.mjs`
- `/api/_lib/config.mjs`
- `/api/_lib/security.mjs`
- `/api/_lib/compass-prompt.mjs`

## Data contracts

- `/data/schemas/job.schema.json`
- `/data/schemas/eligibility-rule.schema.json`
- `/data/schemas/service-cadre.schema.json`
- other existing canonical schemas required by the feature being implemented.

## Permanent specifications

- `/docs/PRODUCT-VISION.md`
- `/docs/PRODUCT-ROADMAP.md`
- `/docs/ARCHITECTURE.md`
- `/docs/PAGE-MAP.md`
- `/docs/REPOSITORY-RULES.md`
- `/docs/SCHEMA.md`
- `/docs/ELIGIBILITY-MODEL.md`
- `/docs/RECOMMENDATION-MODEL.md`
- `/docs/SOURCE-STANDARDS.md`
- `/docs/DATA-QUALITY.md`

No dependency listed above authorizes Batch 1 to redesign that file's responsibility.

---

# 8. Expected Existing Files to Update During Batch 1

The exact implementation subset is determined by the work items inside Batch 1, but the likely existing integration files are:

- `/js/app.js` — only for canonical bootstrap/shared-shell integration required by Batch 1;
- `/js/init.js` — only if compatibility behavior requires adjustment;
- `/js/config.js` — only when a configuration contract required by Batch 1 has already been defined;
- `/js/components/header.js` — only for shared-shell integration;
- `/js/components/footer.js` — only for shared-shell integration;
- `/js/navigation.js` — only for navigation integration;
- `/js/components/drawer.js` — only where an existing shell contract requires it;
- `/js/components/ai-assistant.js` — only for global AI shell integration;
- `/pages/ai.html` — only to ensure it uses the canonical AI architecture;
- relevant page shell/controller files introduced by Batch 1;
- `.github/workflows/static-check.yml` — only if its declared architectural checks must be extended to cover Batch 1 dependencies;
- test files under `/tests/` for new Batch 1 behavior.

This list is not permission to rewrite every listed file. Only files directly affected by an accepted Batch 1 work item should change.

---

# 9. Genuinely New Files Expected for Batch 1

New files may be created only when they represent a permanent Batch 1 implementation responsibility that does not already have an appropriate home.

Potential examples include:

- page controller modules under `/js/pages/` when a declared route genuinely requires a controller and no existing controller exists;
- test files under `/tests/` for Batch 1 behavior;
- additional narrowly-scoped documentation or configuration files only when an existing file cannot reasonably own the contract.

No new top-level architecture directory may be introduced unless a permanent architectural concern is demonstrated.

The creation of a file solely to avoid understanding or reusing an existing module is prohibited.

---

# 10. Frontend Integration Boundaries

## 10.1 `app.js`

Owns application bootstrap and lifecycle.

It may coordinate initialization but must not contain page-specific business logic.

## 10.2 Components

Components own presentation and local interaction behavior.

They must consume services rather than reimplement them.

## 10.3 Services

Existing services remain responsible for their established domains:

- routing → router;
- storage → storage;
- language → language;
- theme → theme;
- search → search;
- filters → filters;
- recommendation → recommendation modules;
- AI transport → AI client/API boundary.

## 10.4 Page Controllers

Page controllers own page-specific composition and interactions.

They must not recreate the global shell.

## 10.5 Data

Frontend code must consume canonical data through the existing data layer where applicable.

It must not silently create a second hard-coded data store.

---

# 11. Backend / API Boundaries

Batch 1 does not require a new backend architecture.

Existing server-side boundaries remain authoritative.

For Compass AI:

```text
browser
  ↓
/api/chat
  ↓
server-only configuration
  ↓
OpenRouter
```

API secrets must never be placed in:

- browser JavaScript;
- HTML;
- public JSON;
- configuration intended for the browser;
- documentation.

Batch 1 must not create a direct browser-to-provider AI connection.

No new backend service should be introduced unless a concrete Batch 1 requirement cannot be met through the current boundaries.

---

# 12. Localization Requirements

Batch 1 interface text must use the established localization system.

Requirements:

1. English remains the default language.
2. Bengali remains a first-class supported interface language.
3. Stable translation keys must be used.
4. New translatable shell text must exist in both `en.json` and `bn.json`.
5. Language selection must not require duplicate application logic.
6. Stable entity IDs must never change because of translation.
7. Official government terminology must remain semantically accurate.
8. Where legal/recruitment terminology is important, official terminology should remain available as required by the source standards.

No Batch-1 feature may introduce language-specific branching merely to render translated text.

---

# 13. Accessibility Requirements

Shared Batch-1 UI must follow the existing accessibility principles.

At minimum:

- semantic HTML;
- valid heading hierarchy;
- keyboard operation for interactive controls;
- visible focus states;
- accessible names for icon-only buttons;
- correct `aria-expanded` and `aria-controls` relationships where applicable;
- accessible dialog/drawer semantics;
- Escape-key handling for dismissible overlays where appropriate;
- focus restoration after closing overlays;
- no information conveyed by color alone;
- responsive layouts must remain operable at mobile widths;
- reduced-motion expectations must not be violated;
- critical information must not depend exclusively on hover.

The existing shared drawer/modal contracts must be reused rather than bypassed.

---

# 14. Source and Confidence Requirements

Batch 1 is primarily a shell/application batch and should not add large volumes of factual government data.

Where Batch 1 displays existing factual information:

1. use the existing canonical production data;
2. preserve source IDs and confidence metadata;
3. do not invent missing government facts for visual completeness;
4. distinguish factual information from analytical information;
5. retain currentness/historical status where applicable;
6. use explicit uncertainty states where the data is unresolved.

If Batch 1 requires a new factual field, the repository's schema-first rules apply:

```text
schema
  ↓
data model documentation
  ↓
normalizer / validator
  ↓
application consumers
  ↓
tests
```

No undocumented production field may be introduced as a hidden shortcut.

---

# 15. Testing Requirements

Batch 1 must establish confidence in the shared infrastructure it touches.

## Required

At minimum, appropriate tests/checks should cover:

- canonical bootstrap can initialize once;
- initialization does not create duplicate global startup paths;
- declared route/controller dependencies exist;
- shared shell components can initialize without throwing fatal errors under normal conditions;
- language switching preserves the established contract;
- theme switching preserves the established contract;
- state-selection events preserve the established contract;
- shared drawer/modal interactions retain their accessibility/lifecycle contracts where modified;
- AI shell integration does not expose secrets and does not create a second AI transport path where modified;
- new Batch-1 logic has syntax/import validation.

## Strongly Recommended

Where practical, add focused regression tests for:

- app-ready/error lifecycle;
- page-controller loading;
- shared component idempotency;
- localization key completeness for newly added keys;
- storage-backed shell preferences.

## Not Required in Batch 1

Do not require a complete automated browser test suite for every future page or feature.

---

# 16. Error Handling Requirements

Batch 1 must preserve the project's user-facing error philosophy.

Technical errors must not be displayed directly to normal users.

Infrastructure failures should:

- be recorded through the existing error path where appropriate;
- expose a useful internal diagnostic;
- present an understandable UI state;
- avoid revealing private configuration or credentials.

Initialization of one optional subsystem should not unnecessarily prevent unrelated shell functionality from starting unless the dependency is genuinely mandatory for the current page.

Fatal application bootstrap errors must continue to use the canonical application lifecycle rather than creating a second error event system.

---

# 17. Performance Requirements

Batch 1 must preserve the static-first performance model.

Do not introduce:

- unnecessary runtime frameworks;
- duplicated datasets;
- duplicate API requests;
- oversized client bundles;
- continuous polling;
- speculative background work.

Existing caching and derived-index mechanisms should be reused where relevant.

The shell should not block unnecessarily on functionality that is not required for the current page.

---

# 18. Security Requirements

Batch 1 must comply with the repository's public-repository security rules.

Never commit:

- API keys;
- provider secrets;
- private tokens;
- passwords;
- personal candidate data that is not intentionally public;
- private research credentials.

For AI:

- browser code may call only the controlled application API;
- provider credentials remain server-side;
- application context must be sanitized at the server boundary;
- prompt/security policy remains server-owned.

---

# 19. Static-First Architecture Requirement

Batch 1 must preserve the project's static-first architecture.

The default implementation model remains:

```text
HTML
 +
CSS
 +
ES Modules
 +
JSON data
 +
serverless API only where required
```

A framework migration, SPA conversion, database replacement or new application platform is out of scope.

The existence of `api/` for Compass AI does not authorize moving unrelated application logic to a server.

---

# 20. No Speculative Architecture Rule

Batch 1 must not introduce architecture merely because it might be useful someday.

Do not introduce:

- generic plugin systems without a current use case;
- dependency injection frameworks without a concrete requirement;
- event buses when existing DOM/application events are sufficient;
- global state managers when existing modules are sufficient;
- service workers without a product requirement;
- new database layers;
- AI agent frameworks;
- vector retrieval systems;
- feature-flag platforms;
- build systems solely for convention;
- abstraction layers that only wrap one existing function without architectural benefit.

The correct default is the smallest existing architectural mechanism that satisfies the Batch-1 requirement.

---

# 21. File Ownership Rules During Batch 1

The existing conceptual ownership remains:

```text
/pages/       = user-facing page shells
/css/         = visual system
/js/          = application logic
/data/        = production structured information
/research/    = research workspace
/docs/        = permanent specifications
/tests/       = verification
.github/      = repository automation
/api/         = server-side/serverless boundaries where required
```

Do not move files between these areas as a Batch-1 cleanup exercise.

Do not put:

- business logic into HTML-only page shells;
- research facts into random JavaScript modules;
- UI translation catalogs into business logic;
- secrets into public configuration;
- recommendation logic into global shell components.

---

# 22. Expected Dependency Order of Implementation

Batch 1 work should proceed in dependency order.

## Step 1 — Repository contract

Confirm:

- this Batch-1 specification;
- synchronized permanent documentation;
- machine-readable schemas;
- repository rules.

## Step 2 — Bootstrap contract

Verify/finalize:

- `js/app.js` canonical ownership;
- `js/init.js` compatibility boundary;
- application lifecycle events;
- idempotency.

## Step 3 — Shared shell

Implement/integrate:

- header;
- footer;
- navigation;
- drawer;
- search mount;
- state/language/theme controls.

## Step 4 — Routing/page integration

Establish:

- route resolution;
- page/controller loading;
- controller context;
- missing-controller diagnostics.

## Step 5 — Global AI shell integration

Where required by Batch 1:

- global trigger;
- canonical assistant component;
- no duplicate page-only transport;
- configured server boundary.

## Step 6 — Localization/accessibility validation

Verify:

- English;
- Bengali;
- keyboard/focus behavior;
- responsive shell;
- accessible labels and overlay semantics.

## Step 7 — Tests and CI

Add/update focused tests and repository checks for the changed contracts.

## Step 8 — Batch validation

Run the available syntax, reference, data and targeted behavior validation before marking Batch 1 complete.

---

# 23. Acceptance Criteria

Batch 1 is acceptable only when all applicable criteria below are satisfied.

## Architecture

- `js/app.js` remains the single canonical bootstrap owner.
- No competing initialization lifecycle exists.
- Existing module ownership remains intact.
- Static-first architecture remains intact.

## Shell

- Shared header mounts consistently.
- Shared footer mounts consistently.
- Navigation works through the established routing/navigation boundary.
- Responsive drawer behavior remains accessible.
- Search has a stable shared mount/trigger contract.
- State/language/theme controls remain integrated through their canonical services.

## Routing

- Declared Batch-1 page/controller dependencies resolve correctly.
- Page controllers receive a stable context.
- Page-specific logic does not recreate the global shell.

## Localization

- English works.
- Bengali works.
- Newly added translatable keys are present in both language catalogs.
- Language changes do not require duplicate application logic.

## Accessibility

- Keyboard operation works for shared interactive controls.
- Focus is visible.
- Overlay/drawer semantics remain correct.
- Focus restoration works where required.
- Shared buttons have accessible names.

## AI integration

Where AI shell integration is included:

- the global AI trigger resolves to the canonical assistant component;
- no duplicate browser-to-provider AI transport exists;
- no credentials are exposed client-side;
- AI page surfaces do not introduce a second independent AI implementation;
- existing context/client/parser/safety boundaries are preserved.

## Data

- Existing canonical schemas remain valid.
- No unsupported production fields are introduced.
- No fabricated government data is added to make Batch 1 appear complete.

## Testing

- Repository syntax checks pass.
- Relevant import/reference checks pass.
- Relevant data validation passes.
- Batch-1-specific tests/checks pass.
- No known Batch-1 blocker remains undisclosed.

---

# 24. Batch 1 Exit Criteria

Batch 1 may be declared complete only when:

1. All accepted Batch-1 scope items are implemented or explicitly marked complete.
2. No known P0 blocker remains in the Batch-1 scope.
3. The canonical bootstrap remains singular and idempotent.
4. Shared shell integration does not depend on duplicated infrastructure.
5. Route/controller dependencies are verifiable.
6. English/Bengali shared-shell behavior works.
7. Shared accessibility requirements are satisfied.
8. Relevant automated checks pass.
9. No secrets or prohibited sensitive data were introduced.
10. Documentation is updated when Batch-1 changes a permanent architectural contract.
11. Any deferred work is explicitly recorded rather than silently left ambiguous.
12. The repository is ready for the next batch without requiring a redefinition of the architecture introduced here.

---

# 25. Definition of Done

A Batch-1 implementation item is **Done** only when all of the following are true:

- the implementation matches the established contract;
- the correct existing module owns the behavior;
- no duplicate source of truth was introduced;
- localization is handled correctly when user-facing text is involved;
- accessibility is handled for interactive UI;
- error behavior is defined;
- required tests/checks exist;
- no speculative dependency was added;
- valid existing behavior was preserved;
- relevant documentation is synchronized.

"It renders" is not sufficient for completion of shared infrastructure.

---

# 26. Change-Control Rules During Batch 1

If implementation reveals that this specification itself is insufficient, do not silently expand scope.

The correct process is:

```text
Identify ambiguity
      ↓
Determine whether existing permanent architecture already answers it
      ↓
If yes → follow the existing contract
      ↓
If no → update the appropriate source-of-truth document
      ↓
Update this Batch-1 specification if the batch boundary changed
      ↓
Only then implement the affected work
```

A Batch-1 coding pass must not use an implementation shortcut to conceal an unresolved architecture decision.

---

# 27. Explicit Preservation Requirements

The following existing decisions are intentionally preserved:

- static-first web architecture;
- multi-page route structure;
- shared component architecture;
- configuration-driven routing;
- centralized language service;
- centralized theme service;
- centralized storage service;
- canonical database loader/normalizer/validator/registry pipeline;
- derived indexes separated from canonical data;
- hard eligibility separated from preferences and ranking;
- source/confidence/currentness model;
- server-only AI credentials;
- English + Bengali initial interface support;
- Central Government + West Bengal initial detailed data scope.

Batch 1 must not reopen these decisions unless a separate authoritative project-level change explicitly supersedes them.

---

# 28. Explicit Non-Goals for Code Quality

Batch 1 must not become a generic cleanup exercise.

Do not refactor working code solely because:

- another pattern looks cleaner;
- a newer library is popular;
- a file could be shorter;
- a naming preference differs;
- an abstraction could theoretically be more generic.

A code change belongs in Batch 1 only when it is required for correctness, contract consistency, maintainability of a Batch-1 dependency, accessibility, security, testing, or a clearly defined Batch-1 requirement.

---

# 29. Final Batch Principle

> **Batch 1 establishes a reusable, executable shared application foundation over the existing GovCareer Compass architecture. It must reduce ambiguity, not create another layer of it.**

The batch succeeds when future feature work can proceed by adding page functionality, data, rules and tests on top of stable shared infrastructure rather than rebuilding the shell or inventing parallel application conventions.

---

# 30. Final Authority Rule

When a future implementation decision conflicts with this document:

1. check the relevant permanent project specification;
2. check the machine-readable schema where data structure is involved;
3. check the existing live implementation;
4. determine whether the apparent conflict is intentional evolution or stale documentation;
5. update the appropriate source-of-truth document before introducing a contradictory implementation.

Batch 1 must not rely on undocumented assumptions.
