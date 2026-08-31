GovCareer Compass — Repository Rules

Document status: Permanent
Document version: 1.0.0

---

1. Purpose

These rules protect the long-term integrity of the GovCareer Compass repository.

They exist to prevent:

- architecture drift;
- duplicated data;
- contradictory sources of truth;
- fabricated information;
- insecure AI integration;
- broken recommendation logic;
- uncontrolled complexity.

These rules apply to all future AI-assisted and human development.

---

2. Source of Truth

The GitHub repository is the authoritative source of the project's code and structured application data.

Vercel is a deployment target, not the permanent source of truth.

---

3. Canonical Data

The canonical government data resides in:

/data/common/
/data/central/
/data/states/

Do not create competing manually maintained databases elsewhere.

---

4. Research vs Production Data

Research workspace:

/research/

Production structured data:

/data/

Research notes must be verified and transformed before becoming production data.

Do not treat raw research notes as authoritative application data.

---

5. No Fabrication

Never invent:

- jobs;
- exams;
- vacancies;
- salaries;
- allowances;
- eligibility conditions;
- promotion periods;
- government quarters;
- licence fees;
- URLs;
- source documents;
- current recruitment status;
- official powers.

When information cannot be verified, explicitly mark it.

---

6. Source Requirement

Important factual records should reference source IDs.

At minimum, major claims should be traceable to:

- official recruitment notification;
- official service/recruitment rule;
- official pay rule;
- official department page;
- official cadre/strength information;
- or clearly labelled secondary/estimated material.

---

7. Fact vs Analysis

Never combine official factual values with analytical scores without distinction.

Example:

startingBasic = official figure
familyCompatibility = analytical score

The UI must preserve this distinction.

---

8. Stable IDs

Every major entity must have a stable ID.

Examples:

kp-si
wbcs
ssc-cgl
west-bengal
central-government

IDs must not change because of:

- translation;
- wording changes;
- redesign;
- page title changes.

---

9. No Duplicate Entities

Do not create two records for the same entity merely because:

- the name is translated;
- an abbreviation differs;
- formatting differs;
- two pages link to it.

However, genuinely different cadres, departments or posts must remain separate.

---

10. Exam vs Post

Do not treat an examination as a job.

Example:

SSC CGL

is an examination/recruitment route.

It can recruit multiple posts.

Likewise:

Kolkata Police Sub-Inspector

is a post/career entity.

These concepts must remain distinct.

---

11. Government Type Separation

Do not silently mix:

- Central Government;
- State Government;
- Local Government;
- PSU;
- statutory body;
- autonomous institution.

Every record must identify its government/organisation type.

---

12. Pay-System Separation

Never infer salary equivalence from identical level numbers.

Always preserve the pay system.

Example:

West Bengal pay system

and:

Central 7th CPC

are different systems.

Do not merge them into one generic “Level” concept without retaining the originating pay system.

---

13. Salary Separation

Never use one generic "salary" value when the underlying concepts differ.

Keep distinct:

- basic;
- DA;
- HRA;
- other allowances;
- gross;
- deductions;
- take-home estimate.

An estimate must remain an estimate.

---

14. Housing Separation

Distinguish:

Entitlement
Availability
Eligibility
Allotment
Practical likelihood

Never represent government accommodation as automatically free.

Keep separate:

- HRA;
- licence fee;
- utilities;
- maintenance;
- commuting.

---

15. Promotion Rules

Do not invent fixed promotion timelines.

Where relevant, distinguish:

- minimum qualifying service;
- selection;
- seniority;
- vacancy dependence;
- departmental examination;
- training;
- practical uncertainty.

---

16. Recruitment Route Rules

Every job record must distinguish:

- direct recruitment;
- promotion;
- deputation;
- transfer;
- contract;
- temporary;
- scheme/project;
- outsourced.

Promotion-only or deputation-only roles must not be represented as ordinary fresh-entry jobs.

---

17. Currentness

Every important record should track:

- source date;
- last verification date;
- current/historical status.

Do not treat an old notification as current merely because no newer information was found.

---

18. Data Status

Preferred controlled statuses include:

ACTIVE_CAREER
CURRENT_RECRUITMENT
RECENTLY_COMPLETED
PERIODIC
IRREGULAR
HISTORICAL
ABOLISHED
REPLACED
PROMOTION_ONLY
DEPUTATION_ONLY
CONTRACTUAL
NOT_VERIFIED

---

19. Confidence

Use:

HIGH
MEDIUM_HIGH
MEDIUM
LOW
ESTIMATE
NOT_VERIFIED

Confidence must describe the quality of evidence, not personal confidence.

---

20. Scoring Changes

Do not silently change the recommendation formula.

Any meaningful scoring change must:

1. update the scoring-model version;
2. update the scoring methodology;
3. update relevant tests;
4. be recorded in the changelog.

---

21. Recommendation Engine

The recommendation engine must remain generic.

Do not write hundreds of career-specific conditions into the core engine.

Prefer:

data
+
rules
+
weights
=
recommendation

rather than:

if candidate then recommend particular job

---

22. Negative Metrics

The following are burden metrics:

- stress;
- physical risk;
- transfer burden;
- night-duty burden.

Higher burden must not accidentally produce a better recommendation.

Every such field must have a declared direction.

---

23. Localization

Do not hard-code large amounts of UI text directly into JavaScript or HTML when a translation key is appropriate.

English and Bengali should use the same stable key system.

Example:

career.start
career.compare
career.salary
career.family

Do not create different logic for different languages.

---

24. Official Names

Translated names may be shown to users.

However, where legal/recruitment terminology matters, preserve the official source terminology.

Translation must not alter the legal meaning of a qualification or post.

---

25. AI Security

Never commit:

- API keys;
- provider secrets;
- private tokens;
- passwords.

Never place them in:

- public JavaScript;
- JSON data;
- HTML;
- GitHub Issues;
- documentation.

The AI layer must use a secure server-side/serverless boundary when credentials are required.

---

26. Public Repository Safety

Assume that anything committed to this repository may become publicly visible.

Do not commit:

- personal candidate data;
- private research credentials;
- private documents unnecessarily;
- sensitive internal notes;
- secrets.

---

27. File Ownership

Use this conceptual ownership model:

/pages/       = user-facing page shells
/css/         = visual system
/js/          = application logic
/data/        = production structured information
/research/    = research workspace
/docs/        = permanent specifications
/tests/       = verification
.github/      = repository automation

Do not put business logic into CSS or research facts into random page HTML.

---

28. Component Reuse

Before creating a new UI component, check whether an existing component can be reused.

Examples:

- one badge system;
- one score bar;
- one modal system;
- one source-card system;
- one filter component.

Do not create multiple incompatible versions of the same concept.

---

29. Page Reuse

Pages should consume shared components and data.

Do not copy an entire header/footer implementation separately into every page if the application architecture provides a shared mechanism.

---

30. Generated Indexes

Files under:

/data/indexes/

should be considered derived data when generated automatically.

Do not manually maintain duplicated copies of the entire job database there.

---

31. Schema First

When adding a new field to a major entity:

1. update schema;
2. update data model documentation;
3. update normalizer/validator;
4. update relevant components;
5. update tests;
6. update translations if needed.

Do not silently introduce incompatible fields.

---

32. Missing Data

Do not use empty strings to hide uncertainty.

Use explicit semantic states such as:

NOT_PUBLICLY_VERIFIED
NOT_APPLICABLE
ESTIMATE
HISTORICAL
CURRENTLY_UNCLEAR

The UI must translate these into human-readable labels.

---

33. Testing Requirement

New logic should be accompanied by tests where practical.

Especially:

- eligibility;
- scoring;
- ranking;
- salary;
- housing;
- source validation;
- localization.

---

34. Golden Profiles

The repository should maintain standard recommendation test profiles.

Examples:

- salary-first;
- family-first;
- parent-care-first;
- Kolkata-first;
- police-oriented;
- office-oriented;
- low-risk;
- Central-focused;
- West Bengal-focused.

A scoring-model change should be checked against these profiles.

---

35. Commit Discipline

Prefer small, meaningful commits.

Examples:

feat: add global search
feat: add Bengali localization
feat: add eligibility engine
feat: add career comparison
data: update West Bengal Police records
audit: correct salary metadata
fix: prevent burden metrics from increasing ranking

Avoid giant commits with unrelated changes.

---

36. Branch Discipline

Use:

main

as the production branch.

Feature work may use temporary branches such as:

feature/career-finder
feature/search
feature/west-bengal-data
feature/localization
feature/ai

Merge only after validation.

---

37. Pull Request Principle

Every substantive change should explain:

- what changed;
- why;
- affected files;
- affected data;
- testing;
- source changes if applicable.

Data changes should identify their source documents.

---

38. AI-Assisted Coding Rules

AI may write:

- HTML;
- CSS;
- JavaScript;
- JSON;
- tests;
- documentation.

But AI-generated code must be reviewed.

Never assume generated code is correct simply because it compiles or visually works.

For government data, source verification remains mandatory.

---

39. No Architecture Drift

Before creating a new top-level folder, ask:

«Does this represent a permanent architectural concern?»

If not, keep it inside an existing subsystem.

Do not create folders merely because one feature needs two files.

---

40. Documentation Synchronization

When architecture changes, update the relevant documentation.

For example:

- data change → "DATA-MODEL.md";
- scoring change → "SCORING-METHODOLOGY.md";
- page change → "PAGE-MAP.md";
- deployment change → "ARCHITECTURE.md";
- source policy change → "SOURCE-STANDARDS.md".

---

41. Release Rule

Before a public release, check:

Data
Logic
UI
Accessibility
Security
Sources
Currentness
Mobile
Desktop
Language
Performance

A visually polished site with incorrect recruitment data is not a successful release.

---

42. Permanent Golden Rule

«Accuracy first. Architecture second. Usability third. Visual polish fourth.»

All four matter.

However, visual quality must never conceal uncertainty or factual weakness.

---

43. Final Repository Principle

The repository should remain:

Stable
Modular
Auditable
Expandable
Testable
Source-backed
Secure
Language-ready
State-ready
AI-ready

The objective is to make future changes additive rather than destructive.

---

44. Final Rule for Future Developers and AI Agents

Before making a significant change:

1. Read the relevant documentation.
2. Reuse the existing architecture.
3. Preserve stable IDs.
4. Preserve source metadata.
5. Preserve fact/analysis separation.
6. Update tests.
7. Update documentation if behaviour changes.
8. Do not introduce duplicate sources of truth.

The repository is a long-term product system, not a disposable prototype.
