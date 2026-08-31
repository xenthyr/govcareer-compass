GovCareer Compass — System Architecture

Document status: Permanent
Document version: 1.0.0

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
AI Assistant

The architecture therefore separates:

DATA
RULES
APPLICATION LOGIC
PRESENTATION
RESEARCH
TESTING
DEPLOYMENT

These layers must not be unnecessarily mixed.

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
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
      SEARCH          ELIGIBILITY       RECOMMENDATION
                         ENGINE             ENGINE
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                    COMPARISON ENGINE
                           │
                           ▼
                       DATA LAYER
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
       COMMON          CENTRAL            STATES
                                          │
                                    WEST BENGAL
                                          │
                                    FUTURE STATES
                           │
                           ▼
                     SOURCE SYSTEM
                           │
                           ▼
                    RESEARCH SYSTEM

Future:

                       SECURE AI LAYER
                              │
                              ▼
                         AI ASSISTANT

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
Indexes
        ↓
Application
        ↓
User

The AI assistant must never become the primary factual source.

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
- page rendering.

Application logic must not hard-code individual careers where generic rules can be used.

Bad design:

if user.familyPriority > 8
    recommend career X

Preferred design:

eligible careers
→ metric scoring
→ user weights
→ ranking

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
       ↓
Preference Scoring

A career excluded by eligibility must not receive a normal preference score.

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

18. AI Architecture

The future AI system is an additional layer.

Conceptual flow:

User Question
      ↓
User Profile
      +
Career Database
      +
Exam Database
      +
Source Metadata
      ↓
Context Builder
      ↓
AI API
      ↓
Response Parser
      ↓
Safety / Validation
      ↓
User

The AI must never expose private API credentials.

---

19. Storage Architecture

Version 1 may use browser "localStorage" for:

- theme;
- language;
- state;
- questionnaire state;
- bookmarks;
- recently viewed careers;
- comparison selections;
- user preference profile.

No login is required for Version 1.

---

20. Future Server Boundary

Server-side capabilities should only be added when necessary.

Potential future server requirements:

- secure AI API;
- authentication;
- cloud profiles;
- notifications;
- current recruitment services.

Until required, keep the system static-first.

---

21. Deployment Architecture

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

22. Architectural Stability Rule

Normal feature development must not require moving existing data into a new model.

New functionality should normally be implemented by:

- adding data;
- adding a module;
- adding a component;
- adding a page;
- adding a rule;
- adding tests.

Architectural rewrites should be exceptional.

---

23. Security Boundary

Never put:

- API keys;
- tokens;
- passwords;
- private credentials;

inside public JavaScript or public JSON.

Sensitive configuration belongs outside the public repository.

---

24. Performance Principle

Large data must not make the website unusable.

Use:

- indexed search;
- lazy rendering where useful;
- pagination or virtualized presentation where needed;
- caching;
- lightweight assets;
- modular page rendering.

Do not duplicate entire datasets into multiple files unnecessarily.

---

25. Architecture Completion Standard

The architecture is considered stable when:

- new jobs can be added without changing the core UI;
- new exams can be added without rewriting the recommendation engine;
- new states can be added as data packages;
- new languages can be added as translation packages;
- scoring can evolve through versioned rules;
- sources can be updated independently;
- AI can be added without exposing secrets.
