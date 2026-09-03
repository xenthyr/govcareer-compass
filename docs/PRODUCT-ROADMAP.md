GovCareer Compass — Product Roadmap

Document status: Permanent
Document version: 1.1.0
Initial baseline: 31 August 2026
Roadmap status baseline: 3 September 2026

---

1. Roadmap Philosophy

GovCareer Compass is intentionally developed in layers.

The project should not attempt to build:

- every Indian state;
- every government post;
- every language;
- every tool;
- and a fully production-complete AI assistant

simultaneously.

The platform should first establish a reliable architecture, data contract, research system and deterministic application core, then expand user-facing decision surfaces and verified coverage, while introducing advanced services only behind clearly defined boundaries.

The roadmap is a product-sequencing document. It does not replace the machine-readable data schemas, runtime contracts, architecture document, or the Batch-1 specification.

The core product sequence remains:

Architecture
    ↓
Data Contract
    ↓
Research System
    ↓
Application Core
    ↓
Eligibility
    ↓
Recommendation
    ↓
Database Explorer
    ↓
Decision Tools
    ↓
Quality & Validation
    ↓
AI Completion & Expansion
    ↓
State Expansion
    ↓
Language Expansion

Important implementation reality:

- architectural groundwork for several later capabilities may exist before the corresponding product phase is complete;
- partial implementation does not mean production completeness;
- a capability is considered phase-complete only when its required data, logic, UI, validation, source/evidence handling, accessibility, security and regression requirements are satisfied;
- the current repository contains substantial Compass AI groundwork and implementation, but Compass AI remains a later product-completion track rather than a reason to skip foundational application work.

---

2. Current Repository Stage — Transition into Batch 1

The repository has progressed beyond an empty foundation.

The current baseline already includes substantial work across:

- permanent project architecture and repository rules;
- canonical data and machine-readable schema contracts;
- research/evidence conventions;
- runtime loading, normalization, validation and registry infrastructure;
- deterministic eligibility, preference, scoring, ranking and explanation modules;
- routing, navigation, localization and theme services;
- shared component architecture;
- Compass AI browser modules;
- the global Compass AI UI component;
- the server-side /api/chat boundary and server AI configuration;
- the dedicated AI page surface;
- repository validation workflows.

However, the application is not yet production-complete.

In particular, the shared application shell and its page/controller integration still require implementation, integration and validation across the repository.

Therefore the immediate development stage is:

**Batch 1 — Shared Application Shell & Application Integration**

Batch 1 is an implementation batch, not a new product phase. It operationalizes the already-defined architecture and contracts needed for subsequent product phases.

Batch 1 must not be treated as already complete.

The authoritative batch-level scope is:

`docs/BATCH-1-SPECIFICATION.md`

The Batch-1 specification governs exact implementation scope, dependencies, file ownership, testing, acceptance criteria and exit conditions. This roadmap only establishes its place in the larger product sequence.

---

3. Phase 0 — Foundation

Objective

Establish a permanent repository structure that does not need to be redesigned during normal product growth.

Deliverables

- GitHub repository;
- project documentation;
- folder architecture;
- source policy;
- data model;
- recommendation model;
- eligibility model;
- localization model;
- security policy;
- deployment architecture;
- repository governance;
- canonical file/module ownership.

Current status

**Substantially established.**

The repository has a defined architectural and governance foundation. Remaining work in this phase is maintenance and documentation synchronization rather than a reason to redesign the architecture.

Exit condition

The project can accept new jobs, exams, states and languages without architectural redesign.

---

4. Phase 1 — Design System & Application Shell

Objective

Create and operationalize the reusable visual and application shell that all product surfaces consume.

Deliverables

- global header;
- footer;
- responsive navigation;
- desktop layout;
- tablet layout;
- mobile layout;
- light theme;
- dark theme;
- system theme;
- typography;
- cards;
- buttons;
- badges;
- tables;
- forms;
- dialogs;
- drawers;
- score components;
- shared shell mounting;
- canonical application bootstrap;
- page/controller integration;
- global search integration;
- state/language/theme controls;
- shared accessibility behavior.

Current status

**Architecture established; implementation and integration remain in progress.**

The repository already contains shared services and components, but the application shell must be brought to a coherent, reusable, validated implementation state.

Current execution batch

**Batch 1**

Batch 1 is the immediate implementation step for this phase.

Batch-1 work must follow:

`docs/BATCH-1-SPECIFICATION.md`

Exit condition

A new page can be created by reusing existing components and application services rather than reinventing the UI or creating competing bootstrap/navigation/shell implementations.

---

5. Phase 2 — Internationalization

Objective

Make English and Bengali first-class interface languages.

Deliverables

- English translation catalogue;
- Bengali translation catalogue;
- language selector;
- persistent language preference;
- fallback language;
- translation-key validation;
- shared component localization;
- page-level localization integration.

Current status

**Core architecture and language service established; full product-wide integration remains part of application completion.**

The language architecture must remain logic-independent: language changes presentation text and locale behavior, not government facts or eligibility logic.

Exit condition

The interface can switch between English and Bengali without duplicating application logic.

---

6. Phase 3 — Data Foundation

Objective

Build the structured government-career dataset.

Initial geographic coverage

- Central Government;
- West Bengal Government.

Initial data areas

- examinations;
- posts;
- departments;
- organisations;
- service/cadre;
- recruitment routes;
- qualifications;
- eligibility rules;
- pay profiles;
- locations;
- housing;
- promotion;
- benefits;
- sources.

Research priority

1. major recurring examinations;
2. major B.A.-compatible jobs;
3. major police/security careers;
4. major office/administrative careers;
5. major railway careers;
6. major revenue/tax/audit careers;
7. lower educational-entry careers;
8. department-level and district-level discoveries.

Data architecture principle

Canonical entities remain separated and relational.

A Job references canonical profile entities such as pay, location, housing, promotion and benefits rather than duplicating those full profiles inside the Job record.

Eligibility rules remain separate canonical entities. Job `eligibility.ruleIds` identifies the applicable rules; runtime eligibility is determined by the Eligibility Engine.

Analytical values remain distinct from official/factual fields.

Exit condition

Initial priority careers have structured records with source and confidence metadata and pass the repository's validation requirements.

---

7. Phase 4 — Eligibility Intelligence

Objective

Answer:

«“Can I apply?”»

Deliverables

- education rules;
- degree rules;
- qualification rules;
- subject rules;
- language rules;
- typing rules;
- shorthand rules;
- physical requirements;
- medical requirements;
- licence requirements;
- experience requirements;
- reservation conditions;
- domicile conditions;
- age and age-reference handling;
- overqualification rules;
- rule dependencies;
- deterministic eligibility evaluation;
- explanation of eligibility results.

Result states

- Directly Eligible;
- Conditionally Eligible;
- Not Eligible;
- Review Required;
- Unknown where the underlying information cannot be established.

Architectural rule

Eligibility is authoritative through the structured eligibility-rule system and Eligibility Engine.

The system must distinguish:

career existence
from
current recruitment availability

and:

eligibility
from
preference fit.

Compass AI may explain a structured eligibility result but must not replace or redefine the Eligibility Engine.

Current status

**Core engine architecture established; continued dataset coverage, validation and product integration remain required.**

Exit condition

The platform can distinguish “qualified but poor fit” from “not eligible,” with deterministic rule evaluation and traceable supporting evidence.

---

8. Phase 5 — Career-Fit Recommendation Engine

Objective

Answer:

«“Which eligible careers fit me best?”»

Deliverables

- candidate profile;
- preference weights;
- positive metrics;
- negative/burden metrics;
- weighted scoring;
- ranking;
- explanation generation;
- conflict detection;
- confidence display;
- eligibility gating.

Primary preference dimensions

- salary;
- authority;
- family;
- parents;
- location;
- safety;
- work-life;
- career growth;
- housing;
- stress;
- transfer;
- night duty.

Architectural rule

Eligibility remains a gate.

Preference scoring must not make an ineligible career appear eligible.

Current status

**Core deterministic engine architecture established; full production integration and validated coverage remain ongoing.**

Exit condition

Different candidate profiles produce meaningfully different recommendations without hard-coded career favoritism.

---

9. Phase 6 — Career Finder

Objective

Make the recommendation system accessible through a guided experience.

User flow

Start
 ↓
Education
 ↓
Qualification
 ↓
State
 ↓
Government preference
 ↓
Career preference
 ↓
Salary
 ↓
Family
 ↓
Parents
 ↓
Location
 ↓
Transfer
 ↓
Night duty
 ↓
Physical risk
 ↓
Work-life
 ↓
Career goals
 ↓
Results

Exit condition

A new user can complete the assessment without prior knowledge of government recruitment terminology and receive an explainable result grounded in the deterministic engines.

---

10. Phase 7 — Job & Exam Explorer

Objective

Allow users who already know what they want to browse directly.

Job Explorer

- search;
- filters;
- sort;
- eligibility;
- pay;
- location;
- family;
- physical;
- confidence;
- currentness;
- recruitment status.

Exam Explorer

- authority;
- eligibility;
- stages;
- syllabus;
- posts;
- physical;
- preparation;
- recruitment frequency;
- history;
- source/evidence context.

Exit condition

The database is useful without the Career Finder.

---

11. Phase 8 — Comparison System

Objective

Allow 2–5 careers to be compared.

Comparison fields

- qualification;
- pay;
- gross;
- estimated take-home;
- authority;
- family;
- parent care;
- work-life;
- stress;
- risk;
- location;
- transfer;
- housing;
- promotion;
- physical requirements;
- difficulty;
- English advantage;
- retirement;
- career ceiling;
- confidence/currentness.

Special mode

Compare Kolkata Police Sub-Inspector

against major comparable careers.

Architectural rule

Comparison is a presentation and decision-support layer. It must consume canonical data and derived analytical values without creating a second source of truth.

Exit condition

Users can understand trade-offs between career choices.

---

12. Phase 9 — Financial Tools

Objective

Help users understand compensation without false precision.

Salary Calculator

Inputs may include:

- basic;
- DA;
- HRA;
- other allowances;
- quarter status;
- deductions;
- NPS/retirement contribution;
- tax;
- other costs.

Housing Calculator

Compare:

- private rent;
- HRA;
- government accommodation;
- licence fee;
- utilities;
- commuting.

Affordability Tool

Illustrative household budgeting:

- food;
- housing;
- utilities;
- transport;
- education;
- medical;
- insurance;
- savings;
- EMI.

Architectural rule

Official values, calculated values and estimates must remain visibly and logically distinguishable.

Exit condition

Users can model compensation and housing scenarios without the interface presenting estimates as official government figures.

---

13. Phase 10 — Family & Lifestyle Intelligence

Objective

Help candidates evaluate careers in terms of real-life compatibility.

Deliverables

- family compatibility;
- parent-care compatibility;
- location stability;
- night-duty burden;
- holiday-duty burden;
- emergency-duty burden;
- transfer burden;
- housing suitability;
- practical work-life interpretation.

Architectural rule

Lifestyle and family assessments are analytical values. They are not government-guaranteed entitlements or facts.

Exit condition

A family-first candidate can find suitable careers without manually reading every job profile.

---

14. Phase 11 — Preparation Intelligence

Objective

Help users prepare for multiple compatible examinations efficiently.

Deliverables

- syllabus overlap;
- common subjects;
- unique subjects;
- preparation bundles;
- difficulty;
- preparation burden;
- examination strategy;
- related career pathways.

Example bundles

UPSC + WBCS

WBCS + WBPSC Miscellaneous

KP SI + WBP SI + SSC CPO + RPF SI

SSC CGL + RRB NTPC

Exit condition

The platform can show how one preparation strategy can support multiple career routes while keeping official syllabus information separate from analytical preparation advice.

---

15. Phase 12 — Research & Evidence System

Objective

Make the database auditable and maintainable.

Deliverables

- source explorer;
- source IDs;
- publication dates;
- verification dates;
- confidence;
- currentness;
- source type;
- supported claims;
- claim-to-source relationships;
- change history;
- audit records;
- missing-post register;
- correction register.

Source principle

Canonical records should reference source entities.

Source metadata qualifies evidence; it does not itself create eligibility or recommendation outcomes.

Exit condition

Important factual claims can be traced to their source record, with currentness and confidence visible where relevant.

---

16. Phase 13 — Quality & Testing

Objective

Prevent errors from entering production and prevent repository evolution from silently breaking established contracts.

Data tests

- schema;
- duplicate IDs;
- missing fields;
- invalid scores;
- invalid statuses;
- invalid or broken references;
- missing sources;
- broken URLs;
- currentness/date consistency;
- derived-index integrity.

Eligibility tests

- direct;
- conditional;
- not eligible;
- review required;
- specialist subject;
- physical;
- medical;
- language;
- typing;
- lower qualification;
- overqualification;
- dependent rules.

Recommendation tests

- family-first;
- salary-first;
- authority-first;
- Kolkata-first;
- police-oriented;
- office-oriented;
- low-risk;
- Central-focused;
- West Bengal-focused;
- eligibility-gated ranking.

Application/UI tests

- bootstrap smoke checks;
- route/controller checks;
- mobile;
- tablet;
- desktop;
- accessibility;
- localization;
- theme;
- state selection;
- search and filtering;
- regression;
- shared component integration.

AI boundary tests

- public client contains no AI secret;
- `/api/chat` boundary validates requests;
- server configuration is not exposed to browser code;
- AI uses structured application context;
- AI does not replace deterministic engines;
- identity and language behavior remain bounded;
- response parsing remains controlled.

Exit condition

Critical data, engine, shell and security behavior is covered sufficiently to support a reliable public release.

---

17. Phase 14 — Compass AI Career Assistant: Completion & Expansion

Objective

Provide conversational assistance over the established government-career intelligence system while keeping canonical factual authority in structured data, sources and deterministic application engines.

Current implementation status

**Architectural groundwork and partial implementation already exist.**

The repository already contains:

- the global Compass AI UI component;
- browser-side intent routing;
- context building;
- safety helpers;
- browser client transport;
- response parsing;
- serverless `/api/chat`;
- server-side Compass AI configuration;
- server-side prompt/behavior policy;
- server-side security/request sanitization;
- the dedicated `pages/ai.html` surface.

This does **not** mean Phase 14 is complete.

Production completion still requires integration quality, validated grounding behavior, consistent source/confidence presentation, complete page/shell integration, testing, security review, and product-level acceptance.

Canonical architecture

```text
Global shell / header trigger
        ↓
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
api/_lib/config.mjs
api/_lib/security.mjs
api/_lib/compass-prompt.mjs
        ↓
OpenRouter
        ↓
selected model
        ↓
response parsing
        ↓
global Compass AI UI
```

AI grounding requirements

Compass AI may explain:

- canonical career facts;
- structured eligibility results;
- recommendation outputs;
- comparisons;
- exam information;
- preparation information;
- source/confidence metadata;
- current application/page context.

The following remain outside AI authority:

- canonical government facts;
- authoritative eligibility decisions;
- recommendation scoring;
- ranking;
- source-of-truth ownership;
- server secrets.

AI must explain grounded application results rather than replacing the Eligibility Engine, Scoring Engine or Ranking Engine.

Current-page context

The active page, selected entity and current application state may be supplied as context when relevant.

For example:

- job details;
- exam details;
- eligibility;
- comparison;
- salary;
- housing;
- preparation;
- Career Finder results.

The AI must not imply context that was not actually supplied.

Source and confidence

Where structured source or confidence metadata is available, the AI may surface or explain it.

The AI must not invent:

- source URLs;
- notification numbers;
- vacancies;
- salary values;
- promotion rules;
- physical standards;
- accommodation availability;
- confidence values.

Language

The current AI interface supports:

- English;
- Bengali.

Language handling changes the response/presentation language but must not change the underlying government facts or rules.

Identity

Compass AI has one canonical product identity. Identity must remain configuration/policy-driven and consistent between server and UI surfaces.

Global UI versus page surface

`js/components/ai-assistant.js` is the canonical global AI UI component.

`pages/ai.html` is a product page surface, not a separate AI architecture.

It must not create a competing backend, prompt policy, eligibility implementation, recommendation engine or source of truth.

Security

The OpenRouter API key must exist only in server-side environment configuration.

The browser must communicate through `/api/chat` and must never receive or embed the secret.

Future Phase 14 work

- complete global-shell integration;
- complete page-surface integration without duplication;
- validate grounded career-context behavior;
- improve source/confidence presentation;
- establish robust AI regression tests;
- verify prompt/security behavior;
- expand appropriate career-intelligence conversational flows;
- support grounded general informational questions where product policy permits;
- improve explanations and uncertainty handling;
- expand model/service capabilities only after the existing boundary is stable.

Exit condition

Compass AI is production-complete only when the global component, application context, secure API boundary, grounding behavior, source/confidence semantics, language behavior, testing and security controls are all validated and the AI consistently remains subordinate to canonical data and deterministic engines.

---

18. Phase 15 — State Expansion

States are added sequentially.

Recommended workflow:

Research
 ↓
Audit
 ↓
Data modelling
 ↓
Eligibility validation
 ↓
Pay validation
 ↓
Source validation
 ↓
Testing
 ↓
Enable state
 ↓
Publish

A state must not be activated until its minimum quality threshold is met.

The existence of state-selection UI does not mean that a state's detailed dataset is available.

Future state expansion must remain data/package driven and must not require repeated rewrites of core application logic.

---

19. Phase 16 — Language Expansion

Each new language follows:

Translation
 ↓
Terminology review
 ↓
Recruitment terminology validation
 ↓
Missing-key validation
 ↓
UI testing
 ↓
Enable language

Translation must not modify underlying government facts.

The initial supported languages remain:

- English;
- Bengali.

Additional languages remain future expansion work and must not be pulled forward merely because the localization architecture already supports extensibility.

---

20. Phase 17 — Advanced Platform

Potential future capabilities:

- user accounts;
- cloud-saved profiles;
- personalized dashboards;
- notification system;
- recruitment alerts;
- saved searches;
- exam calendars;
- deadline reminders;
- personalized preparation plans;
- source-change notifications;
- AI-assisted research maintenance.

These are future capabilities and must not compromise the simpler static-first architecture of Version 1.

---

21. Release Strategy

The release model distinguishes architectural groundwork from production-complete product capability.

Version 0.x

Internal development, architecture stabilization, data/engine development and shell integration.

Current transition

**Batch 1**

The repository is entering Batch 1 to establish the reusable application shell and foundational application integration described in:

`docs/BATCH-1-SPECIFICATION.md`

Batch 1 completion must not be confused with Version 1.0 product completion.

Version 1.0

First reliable public release with:

- Central Government;
- West Bengal Government;
- English;
- Bengali;
- Career Finder;
- eligibility engine;
- recommendation engine;
- job/exam explorer;
- core comparisons;
- salary/family/location tools;
- sources;
- production-quality shell, accessibility and validation.

AI architectural groundwork may exist before Version 1.0, but Version 1.0 must not claim production-complete AI merely because the repository contains AI modules.

Version 1.x

Quality improvements, additional verified coverage, product refinement, stronger testing, and incremental analytical capabilities.

Version 2.x

Compass AI production completion and expanded AI-assisted career-intelligence capabilities, built over the secure architecture already established.

Version 3.x+

Additional state governments and languages.

Release sequencing rule

A capability may be implemented technically before its planned release family, but it must not be advertised as release-complete until its complete product acceptance criteria are met.

---

22. Roadmap Priority Rules

When deciding what to build next, prioritize:

Highest priority

1. factual accuracy;
2. eligibility correctness;
3. recommendation correctness;
4. source integrity;
5. data/currentness integrity;
6. application correctness;
7. usability and accessibility;
8. security.

Medium priority

9. comparison tools;
10. financial tools;
11. family/location analysis;
12. preparation tools;
13. AI quality improvements after grounding and security requirements are satisfied.

Lower priority

14. decorative animations;
15. purely cosmetic features;
16. speculative infrastructure;
17. features that increase complexity without improving decisions.

No AI capability may move above foundational correctness merely because an AI implementation already exists.

---

23. Batch and Phase Relationship

Phases define product capability sequencing.

Batches define concrete implementation work.

The two concepts must not be conflated.

Batch 1 is currently the implementation bridge into Phase 1 application-shell completion.

For Batch 1, the authoritative execution document is:

`docs/BATCH-1-SPECIFICATION.md`

Later batches may implement portions of multiple product phases when that reduces duplication or completes shared infrastructure, but a batch must not silently redefine the roadmap phases.

Batch completion must be measured against its own acceptance and exit criteria, not by assuming that the corresponding product phase is automatically complete.

---

24. Roadmap Maintenance and Status Rules

This roadmap must distinguish at least three states:

**Architectural groundwork exists**

The repository contains the contracts, modules or boundaries needed for the capability.

**Partial implementation**

Some executable functionality exists, but one or more required integration, data, testing, security, accessibility or product-completeness requirements remain unfinished.

**Production-complete**

The capability satisfies its defined product, architecture, data, validation, testing, accessibility, security and acceptance requirements.

Presence of a file, module or endpoint alone is never sufficient evidence of production completion.

When repository maturity changes, this roadmap should be updated so that future/funded work and current implementation status remain distinguishable.

---

25. Permanent Roadmap Principle

The roadmap is not a promise that every planned feature will be implemented exactly as listed.

Features may be:

- delayed;
- redesigned;
- merged;
- removed;
- replaced.

However, the underlying architectural principles remain stable.

In particular:

- canonical data remains the source of truth for structured government information;
- eligibility remains deterministic and rule-based;
- recommendation remains separate from eligibility;
- sources and confidence remain first-class evidence metadata;
- AI remains a downstream interaction/explanation layer;
- state and language expansion remain sequential, quality-gated and data-driven;
- the system remains static-first except where a secure server boundary is required;
- documentation must remain synchronized with actual repository architecture and implementation maturity.

---

26. Ultimate Product Goal

The long-term goal is:

«A trustworthy, multilingual, state-expandable government-career intelligence platform that helps an aspirant understand what they can pursue, what best fits their life, how the decision was derived, what evidence supports it, and how to prepare for it.»
