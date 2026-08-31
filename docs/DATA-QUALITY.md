GovCareer Compass — Data Quality Standard

Document status: Permanent
Document version: 1.0.0
Applies to: All production JSON data

---

1. Purpose

GovCareer Compass is an information-heavy product.

Its largest risk is not visual design failure.

Its largest risk is incorrect or stale government information.

This document defines the quality controls required before data can become production data.

---

2. Quality Principle

The quality sequence is:

DISCOVER
   ↓
RESEARCH
   ↓
VERIFY
   ↓
STRUCTURE
   ↓
VALIDATE
   ↓
AUDIT
   ↓
PUBLISH

Never:

SEARCH ENGINE
   ↓
COPY
   ↓
PUBLISH

---

3. Source Priority

Preferred order:

1. Current official recruitment notification
2. Official recruitment/service rule
3. Official pay/finance rule
4. Official department/directorate page
5. Official cadre/strength/annual report
6. Reputable secondary source
7. Analytical estimate

---

4. Data Classification

Each major information item must be classifiable as:

OFFICIAL_FACT

Directly confirmed by an official source.

HISTORICAL_FACT

Official information from an earlier period that is retained for historical context.

CURRENT_ESTIMATE

An estimate derived from current official information.

PRACTICAL_ASSESSMENT

Analytical interpretation of job structure.

SECONDARY_SOURCE

Information from a reputable non-primary source.

NOT_PUBLICLY_VERIFIED

Sufficient public verification was not found.

---

5. Confidence

HIGH

Current official recruitment/service rule or equivalent primary evidence.

MEDIUM_HIGH

Official historical rule or authoritative material that remains apparently applicable.

MEDIUM

Official departmental evidence exists, but current recruitment applicability needs caution.

LOW

Reputable secondary evidence with limited primary confirmation.

ESTIMATE

Reasoned calculation or analytical estimate.

NOT_VERIFIED

No sufficient public verification.

---

6. Required Source Metadata

Important source records should include:

- source ID;
- organisation;
- title;
- document type;
- publication date;
- verification date;
- exact URL;
- source priority;
- confidence;
- supported claims.

---

7. Currentness

The following concepts must be distinguished:

ACTIVE_CAREER
CURRENT_RECRUITMENT
RECENTLY_COMPLETED
HISTORICAL
REPLACED
ABOLISHED
NOT_VERIFIED

A post may be an active career even when there is no current recruitment notice.

---

8. Recruitment Status

Do not use one field to represent both:

career existence

and:

current vacancy

These are different facts.

---

9. Eligibility Quality

Every major job must specify:

- minimum qualification;
- BA English classification where relevant;
- additional conditions;
- age rules;
- reservation rules;
- domicile rules;
- physical/medical requirements;
- language requirements;
- subject-specific requirements;
- skill requirements.

---

10. Eligibility Verification

A candidate is not marked directly eligible merely because:

«“Graduation is required.”»

The exact qualification wording must be checked.

Subject-specific requirements override generic graduation assumptions.

---

11. Lower-Qualification Quality

Class 8/10/12 posts must include an explicit overqualification assessment.

Do not automatically assume a graduate may apply.

Use:

HIGHER_QUALIFICATION_ALLOWED
HIGHER_QUALIFICATION_NOT_ADDRESSED
HIGHER_QUALIFICATION_RESTRICTED
EXACT_QUALIFICATION_REQUIRED
CURRENT_NOTIFICATION_REQUIRED

---

12. Pay Quality

Each pay figure must identify:

- pay system;
- level;
- basic;
- maximum/basic range where applicable;
- allowance basis;
- source date.

West Bengal and Central Government pay systems must never be merged merely because level numbers appear similar.

---

13. Salary Estimate Quality

Every estimated take-home calculation must preserve:

Basic
+
Known allowances
-
Applicable deductions
=
Estimated take-home

Assumptions must be documented.

---

14. Housing Quality

Housing information must distinguish:

- entitlement;
- eligibility;
- availability;
- allotment;
- practical likelihood.

Do not write:

«“Government quarter is free”»

unless the specific conditions actually establish that conclusion.

---

15. Promotion Quality

Never add a fixed promotion period unless supported by a rule.

When vacancy/seniority/selection affects promotion, the record must say so.

---

16. Source-to-Claim Accuracy

A source should support the claim it is attached to.

Example:

A recruitment notification may support:

- qualification;
- age;
- recruitment stages.

It may not necessarily support:

- current housing availability;
- practical transfer frequency;
- long-term promotion ceiling.

Those should have their own evidence or be marked as analytical/not verified.

---

17. No Silent Conflict Resolution

If two credible sources conflict:

1. compare dates;
2. check whether one supersedes the other;
3. check whether the posts/cadres differ;
4. check for later government orders;
5. document the resolution.

Never silently delete the conflict.

---

18. Duplicate Prevention

Duplicate records are data-quality errors.

The same post should not be duplicated merely because it appears under multiple views.

However, two similar-looking designations from different cadres may legitimately be separate records.

---

19. Referential Integrity

Every foreign ID must resolve to a valid entity.

Examples:

departmentId
organisationId
examId
sourceId
payProfileId
housingProfileId
promotionProfileId

Broken references are release-blocking errors for production data.

---

20. Score Quality

Normal analytical score ranges are:

0–10

Score validation must reject:

-1
11
NaN
Infinity
undefined
null

unless a field explicitly permits an unavailable state.

---

21. Missing Value Quality

Use explicit semantic values:

NOT_PUBLICLY_VERIFIED
NOT_APPLICABLE
CURRENTLY_UNCLEAR
HISTORICAL
ESTIMATE

Do not use a blank string when the reason for absence matters.

---

22. Translation Quality

Every translatable UI key should exist in:

en.json
bn.json

The same key must represent the same concept.

Missing translation keys must be detected before release.

---

23. Government Terminology

Translated government terminology should be checked for semantic accuracy.

Official source terminology must remain available where legal precision matters.

---

24. Data Change Review

A production factual change should identify:

- old value;
- new value;
- reason;
- source;
- verification date.

---

25. Release Blocking Errors

The following should block publication:

- missing source for a major factual field;
- duplicate primary ID;
- broken reference;
- invalid JSON;
- invalid score;
- unsupported current claim;
- exposed secret;
- missing mandatory qualification classification;
- invalid pay-system relationship;
- broken source URL where the source is required;
- missing translation key for required UI text.

---

26. Quality Status

Each data pack may be assigned:

DRAFT
RESEARCHING
VERIFIED
PARTIALLY_VERIFIED
READY_FOR_REVIEW
PUBLISHED
STALE
REVIEW_REQUIRED

---

27. Staleness

A record should not be marked stale solely because it is old.

Age is a signal.

Currentness depends on whether a newer:

- law;
- rule;
- notification;
- finance order;
- recruitment structure;
- organisational change

has superseded it.

---

28. Research Completeness

A department should not be marked fully audited merely because its recruitment page was checked.

Where possible, also inspect:

- organisational structure;
- designation lists;
- sanctioned strength;
- cadre rules;
- recruitment rules;
- historical recruitment;
- district/directorate information.

---

29. Career vs Vacancy Quality

The database should preserve:

CAREER_RECORD

and:

RECRUITMENT_EVENT

separately.

A temporary vacancy must never become the definition of the career.

---

30. Analytical Score Quality

Analytical scores must document:

- what the score means;
- whether higher is better or worse;
- what evidence informs the score;
- whether the value is job-level or user-dependent.

---

31. User-Dependent Values

Scores such as:

familyCompatibility
parentCareCompatibility

may depend on both:

career characteristics

and:

candidate preferences

Therefore the raw career record should, where possible, provide base attributes rather than pretending every candidate receives the same universal score.

---

32. Quality Gate

Before publishing a new government career record:

Identity ✓
Qualification ✓
Recruitment ✓
Pay ✓
Currentness ✓
Source ✓
Confidence ✓
References ✓
Analysis ✓
Validation ✓

---

33. Final Quality Rule

«A missing fact is preferable to an invented fact. An explicitly uncertain fact is preferable to false precision.»
