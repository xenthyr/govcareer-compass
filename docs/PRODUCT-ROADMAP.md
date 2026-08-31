GovCareer Compass — Product Roadmap

Document status: Permanent
Document version: 1.0.0
Initial baseline: 31 August 2026

---

1. Roadmap Philosophy

GovCareer Compass is intentionally developed in layers.

The project should not attempt to build:

- every Indian state;
- every government post;
- every language;
- every tool;
- and the AI assistant

simultaneously.

The platform should first establish a reliable architecture, then build the recommendation engine, then expand data coverage, and finally add more advanced services.

The core development sequence is:

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
AI
    ↓
State Expansion
    ↓
Language Expansion

---

2. Phase 0 — Foundation

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
- deployment architecture.

Exit condition

The project can accept new jobs, exams, states and languages without architectural redesign.

---

3. Phase 1 — Design System & Application Shell

Objective

Create the visual identity and reusable application framework.

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
- score components.

Exit condition

A new page can be created by reusing existing components rather than reinventing the UI.

---

4. Phase 2 — Internationalization

Objective

Make English and Bengali first-class interface languages.

Deliverables

- English translation catalogue;
- Bengali translation catalogue;
- language selector;
- persistent language preference;
- fallback language;
- translation-key validation.

Exit condition

The interface can switch between English and Bengali without duplicating application logic.

---

5. Phase 3 — Data Foundation

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
- recruitment routes;
- pay;
- locations;
- housing;
- promotion;
- benefits;
- sources.

Research priority

1. major recurring examinations;
2. major BA-compatible jobs;
3. major police/security careers;
4. major office/administrative careers;
5. major railway careers;
6. major revenue/tax/audit careers;
7. lower educational-entry careers;
8. department-level and district-level discoveries.

Exit condition

Initial priority careers have structured records with source and confidence metadata.

---

6. Phase 4 — Eligibility Intelligence

Objective

Answer:

«“Can I apply?”»

Deliverables

- education rules;
- degree rules;
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
- overqualification rules.

Result states

- Directly Eligible;
- Conditionally Eligible;
- Not Eligible;
- Current Notification Required;
- Not Publicly Verified.

Exit condition

The platform can distinguish “qualified but poor fit” from “not eligible.”

---

7. Phase 5 — Career-Fit Recommendation Engine

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
- confidence display.

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

Exit condition

Different candidate profiles produce meaningfully different recommendations.

---

8. Phase 6 — Career Finder

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

A new user can complete the assessment without prior knowledge of government recruitment terminology.

---

9. Phase 7 — Job & Exam Explorer

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
- currentness.

Exam Explorer

- authority;
- eligibility;
- stages;
- syllabus;
- posts;
- physical;
- preparation;
- recruitment frequency;
- history.

Exit condition

The database is useful without the Career Finder.

---

10. Phase 8 — Comparison System

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
- career ceiling.

Special mode

Compare Kolkata Police Sub-Inspector

against major comparable careers.

Exit condition

Users can understand trade-offs between career choices.

---

11. Phase 9 — Financial Tools

Objective

Help users understand compensation without false precision.

Salary Calculator

Inputs:

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

Exit condition

Official figures and estimates remain visually and logically separate.

---

12. Phase 10 — Family & Lifestyle Intelligence

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
- housing suitability.

Exit condition

A family-first candidate can find suitable careers without manually reading every job profile.

---

13. Phase 11 — Preparation Intelligence

Objective

Help users prepare for multiple compatible examinations efficiently.

Deliverables

- syllabus overlap;
- common subjects;
- unique subjects;
- preparation bundles;
- difficulty;
- preparation burden;
- examination strategy.

Example bundles

UPSC + WBCS

WBCS + WBPSC Miscellaneous

KP SI + WBP SI + SSC CPO + RPF SI

SSC CGL + RRB NTPC

Exit condition

The platform can show how one preparation strategy can support multiple career routes.

---

14. Phase 12 — Research & Evidence System

Objective

Make the database auditable.

Deliverables

- source explorer;
- source IDs;
- publication dates;
- verification dates;
- confidence;
- source type;
- supported claims;
- change history;
- audit records;
- missing-post register;
- correction register.

Exit condition

Important factual claims can be traced back to their source record.

---

15. Phase 13 — Quality & Testing

Objective

Prevent errors from entering production.

Data tests

- schema;
- duplicate IDs;
- missing fields;
- invalid scores;
- invalid statuses;
- missing sources;
- broken URLs.

Eligibility tests

- direct;
- conditional;
- not eligible;
- specialist subject;
- physical;
- language;
- typing;
- lower qualification.

Recommendation tests

- family-first;
- salary-first;
- authority-first;
- Kolkata-first;
- police-oriented;
- office-oriented;
- low-risk;
- Central-focused;
- West Bengal-focused.

UI tests

- mobile;
- tablet;
- desktop;
- accessibility;
- regression.

---

16. Phase 14 — AI Career Assistant

Objective

Provide conversational assistance while keeping factual authority in the structured data/source system.

Capabilities

The assistant may answer questions such as:

- Can I apply?
- Which exams fit me?
- Why did you recommend this career?
- Which careers are alternatives?
- What does this job actually involve?
- Which exam preparation overlaps?
- What are the trade-offs?
- What changes if I prioritize family over salary?

AI principles

The AI must:

- use verified platform data;
- identify uncertainty;
- preserve source references;
- avoid unsupported claims;
- avoid exposing secret API credentials;
- avoid pretending to be an official recruitment authority.

Security requirement

Private API credentials must never exist in public client-side JavaScript.

---

17. Phase 15 — State Expansion

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

---

18. Phase 16 — Language Expansion

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

---

19. Phase 17 — Advanced Platform

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

These are future capabilities and must not compromise the simpler architecture of Version 1.

---

20. Release Strategy

Version 0.x

Internal development.

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
- sources.

Version 1.x

Quality improvements and additional verified coverage.

Version 2.x

AI assistant and expanded analytical capabilities.

Version 3.x+

Additional state governments and languages.

---

21. Roadmap Priority Rules

When deciding what to build next, prioritize:

Highest priority

1. factual accuracy;
2. eligibility correctness;
3. recommendation correctness;
4. source integrity;
5. usability.

Medium priority

6. comparison tools;
7. financial tools;
8. family/location analysis;
9. preparation tools.

Lower priority

10. decorative animations;
11. purely cosmetic features;
12. features that increase complexity without improving decisions.

---

22. Permanent Roadmap Principle

The roadmap is not a promise that every planned feature will be implemented exactly as listed.

Features may be:

- delayed;
- redesigned;
- merged;
- removed;
- replaced.

However, the underlying architectural principles remain stable.

---

23. Ultimate Product Goal

The long-term goal is:

«A trustworthy, multilingual, state-expandable government-career intelligence platform that helps an aspirant understand what they can pursue, what best fits their life, and how to prepare for it.»
