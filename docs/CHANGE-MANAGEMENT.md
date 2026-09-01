# GovCareer Compass — Change Management

**File:** `/docs/CHANGE-MANAGEMENT.md`  
**Document Type:** Canonical Change-Control Specification  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`

---

# 1. Purpose

This document defines how GovCareer Compass manages changes to:

- government data;
- recruitment information;
- eligibility rules;
- pay information;
- career attributes;
- scoring methodology;
- recommendation logic;
- assessment questions;
- translations;
- application code;
- schemas;
- documentation.

The project is intended to be maintained for a long period.

Therefore changes must be:

Traceable
Reviewable
Reproducible
Reversible
Source-backed
Versioned


---

2. Core Principle

Changes to government information are data changes.

Changes to application behaviour are code changes.

Changes to research methodology are methodology changes.

Changes to scoring are model changes.

These must not be mixed casually.


---

3. Change Categories

Each change should be classified as one or more of:

DATA
RESEARCH
ELIGIBILITY
RECOMMENDATION
SCORING
ASSESSMENT
I18N
SCHEMA
UI
ACCESSIBILITY
SECURITY
SEO
INFRASTRUCTURE
DOCUMENTATION
RELEASE


---

4. Source-Backed Data Changes

Any material government-data change should identify:

sourceId
sourceDate
changeDate
affectedRecord
previousValue
newValue
reason
confidence

Example:

Post:
Example Post

Previous:
Pay Level A

New:
Pay Level B

Reason:
New official notification / rule

Source:
source-xxxx


---

5. No Silent Data Changes

Do not silently overwrite material facts.

For important data:

Old Value
    ↓
New Evidence
    ↓
New Value
    ↓
Audit Record

The previous value may be retained in research/audit history where appropriate.


---

6. Current Data vs Historical Data

When a government rule changes:

Old record
    ↓
Historical / Superseded

rather than:

Delete old record

unless there is a legitimate data-removal reason.


---

7. Eligibility Changes

Eligibility changes are high-impact.

Examples:

new degree requirement;

new B.Ed. requirement;

new subject restriction;

changed marks;

changed age;

new physical standard;

changed ITI trade;

changed recruitment route.


These require:

Source Verification
+
Eligibility Engine Test
+
Affected Recommendation Review


---

8. Pay Changes

Pay changes require:

Pay Source
+
Effective Date
+
Affected Posts
+
Salary Calculation Review

Check both:

Basic Pay

and:

Derived Salary Estimates

where applicable.


---

9. Housing Changes

Housing changes must consider:

Entitlement
Availability
Licence Fee
HRA Impact
Housing Cost

If a housing rule changes, affected salary/housing calculations should be retested.


---

10. Promotion Changes

Promotion-rule changes require review of:

Promotion Path
Minimum Qualifying Service
Selection Method
Career Ceiling
Recommendation Growth Score

Do not silently leave old promotion information attached to the current career record.


---

11. Recruitment-Status Changes

Current recruitment changes are time-sensitive.

Example:

OPEN
    ↓
CLOSED

or:

EXPECTED
    ↓
OFFICIALLY NOTIFIED

These should be treated as status data changes rather than changes to the underlying existence of the career.


---

12. Schema Changes

Schema changes are high-impact because they can affect:

data validation;

loaders;

normalizers;

indexes;

calculators;

recommendation engine;

UI components.


Before changing a schema:

Identify Consumers
    ↓
Update Documentation
    ↓
Update Schema
    ↓
Update Data
    ↓
Update Validators
    ↓
Update Tests


---

13. Breaking Changes

A breaking change is one that requires existing data or code to be rewritten to continue functioning.

Examples:

renaming a required property;

changing an ID;

changing data type;

changing enum semantics;

removing a mandatory field.


Breaking changes require explicit review.


---

14. Stable IDs

The following should normally never be renamed casually:

jobId
examId
departmentId
organisationId
sourceId
qualificationId
stateId
questionId
optionId
profileFieldId
scoringRuleId

Changing stable IDs can break:

bookmarks;

comparisons;

references;

recommendations;

historical records;

links.


If a rename is unavoidable, use an explicit migration or alias strategy.


---

15. Assessment Changes

Assessment changes include:

new questions;

deleted questions;

changed wording;

new options;

changed branching;

changed profile mapping;

changed response scoring.


Changing wording is not always logically harmless.

The system must determine whether the underlying interpretation changed.


---

16. Hard Eligibility Question Changes

If an assessment question collects information needed for formal eligibility, changing its meaning may affect eligibility.

Examples:

Do you have B.Ed.?

or:

Did you study Mathematics in Class 12?

These changes require review against the Eligibility Model.


---

17. Preference Question Changes

Preference questions can influence recommendations without changing legal eligibility.

Examples:

How important is salary?
How willing are you to accept transfers?

Changes should be checked against:

response-scoring.json
scoring-rules.json


---

18. Scoring Changes

Scoring changes require:

Scoring Model Version
+
Documentation Update
+
Golden Profile Tests
+
Before/After Review

A scoring change should not silently alter user results without a traceable version.


---

19. Recommendation Changes

Changes to recommendation logic should be tested for:

Eligibility Protection
Preference Sensitivity
Unknown Handling
Negative Metrics
Tie Behaviour
Ranking Stability


---

20. Internationalization Changes

Translation-only changes generally do not require data-model changes.

However, changes to:

translation keys
placeholders
language IDs
language metadata

must be validated.

Changing:

translation key

may be a breaking change if application code depends on it.


---

21. Documentation Changes

Documentation should be updated whenever implementation changes materially affect:

Architecture
Data Model
Eligibility
Recommendation
Scoring
Internationalization
Research
Security
State Expansion

Documentation should not describe functionality that the application does not actually implement.


---

22. Commit Convention

The project should use clear conventional commit prefixes.

Examples:

feat:
fix:
docs:
data:
research:
refactor:
test:
chore:
build:
ci:
security:

Project examples:

docs: establish research and evidence standards
data: update west bengal recruitment records
research: verify excise recruitment rules
fix: correct eligibility mapping for specialist qualification
feat: add Bengali localization
test: expand eligibility regression coverage


---

23. Commit Scope

Where practical, one commit should represent one coherent change.

Avoid a commit that simultaneously:

changes eligibility
changes scoring
redesigns UI
updates translations

unless the changes are genuinely inseparable.


---

24. Pull Request / Review Rule

Even for a personal project, significant changes should be reviewable.

A material change should explain:

What changed?
Why?
Source?
Affected records?
Affected logic?
Tests performed?
Any uncertainty?


---

25. Data Review Workflow

Preferred workflow:

Research Source Found
        ↓
Create / Update Research Record
        ↓
Verify
        ↓
Update Structured Data
        ↓
Run Schema Validation
        ↓
Run Integrity Validation
        ↓
Run Relevant Eligibility Tests
        ↓
Run Recommendation Tests if necessary
        ↓
Review UI
        ↓
Commit


---

26. High-Risk Change Workflow

High-risk changes include:

eligibility
qualification
age
physical standards
recruitment route
pay
pension
housing
promotion
current recruitment status

These should receive more stringent checking than presentation-only changes.


---

27. Reversion

Every significant change should be reversible through Git history.

Do not modify history destructively merely to hide a mistake.

When a source-backed change is reversed:

Reversion Reason
+
Source / Evidence

should be recorded where appropriate.


---

28. Changelog

Material user-facing changes should be recorded in:

/CHANGELOG.md

Especially:

methodology changes;

scoring changes;

eligibility logic changes;

major data corrections;

new state datasets;

new language support;

major UI capabilities.



---

29. Versioning

Recommended version dimensions:

Application Version
Data Version
Schema Version
Assessment Version
Eligibility Model Version
Recommendation Model Version
Scoring Model Version
Translation Version

These may evolve independently where useful.


---

30. Model Versioning

Recommendation results should ideally be traceable to:

assessment version
data version
eligibility version
recommendation version
scoring version

This enables reproducibility.


---

31. Data Release

A data release should pass:

JSON Syntax
Schema Validation
Reference Integrity
Source Integrity
Currentness Review
Eligibility Regression
Recommendation Regression
Localization Validation

where applicable.


---

32. Emergency Correction

A critical factual error should be corrected promptly.

Examples:

incorrect eligibility;

wrong qualification;

misleading recruitment route;

materially incorrect pay;

obsolete post marked current.


Process:

Identify
    ↓
Verify
    ↓
Correct
    ↓
Test
    ↓
Document
    ↓
Release


---

33. Privacy

The website should not commit personal candidate profiles to the repository.

Candidate preferences stored via browser localStorage are user-side application state.

Research data must not contain personal user information.


---

34. AI Code Changes

AI-generated code is subject to the same standards as manually written code.

Before accepting AI-generated changes:

Read
Review
Validate
Test
Compare Against Architecture

The fact that AI generated the code is not evidence that it is correct.


---

35. AI Research Changes

AI-assisted research must not be accepted directly as authoritative.

The source must be independently checked.

Workflow:

AI Discovery
    ↓
Official Source Retrieval
    ↓
Verification
    ↓
Structured Data


---

36. Future State Addition

Adding another State Government dataset should generally be additive.

For example:

data/states/
    west-bengal/
    maharashtra/
    tamil-nadu/

A new state should not require rewriting the recommendation engine.

However, each state's:

recruitment system;

reservation rules;

pay system;

eligibility rules;

source structure;


must be independently researched.


---

37. New Language Addition

Adding a language should generally require:

/data/i18n/<language>.json

plus:

translation validation
UI testing
accessibility testing

It should not require:

new eligibility engine
new scoring engine


---

38. Change Impact Matrix

Before making a material change, determine whether it affects:

Change	Data	Eligibility	Recommendation	Scoring	UI	Tests	Docs

New source only	✅	Maybe	Maybe	Maybe	No	✅	✅
Qualification change	✅	✅	✅	Possibly	✅	✅	✅
Pay change	✅	No	Possibly	✅	✅	✅	✅
Translation	✅	No	No	No	✅	✅	Possibly
Scoring weight	✅	No	✅	✅	✅	✅	✅
New state	✅	✅	✅	Possibly	✅	✅	✅
New exam	✅	✅	✅	Possibly	✅	✅	✅
UI-only change	No	No	No	No	✅	✅	✅



---

39. Final Change Principle

> Every material change must be traceable to either evidence, an explicit product decision, or a documented technical requirement. No important behaviour should change accidentally because an unrelated file was edited.
