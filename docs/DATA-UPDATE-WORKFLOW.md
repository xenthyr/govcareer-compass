# GovCareer Compass — Data Update Workflow

**File:** `/docs/DATA-UPDATE-WORKFLOW.md`  
**Document Type:** Canonical Government Data Maintenance Workflow  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`  
**Applies To:** Government jobs, exams, departments, recruitment, pay, locations, housing, promotion, benefits and sources

---

# 1. Purpose

This document defines the standard process for discovering, verifying, updating and releasing government-career data in GovCareer Compass.

The project contains information that can change over time.

Examples:

- recruitment notifications;
- vacancies;
- age rules;
- qualifications;
- physical standards;
- pay;
- allowances;
- recruitment routes;
- promotion rules;
- housing provisions;
- posting information.

The workflow ensures that the database remains maintainable and evidence-backed.

---

# 2. Canonical Principle

Never update production data directly from memory.

The required path is:

SOURCE
   ↓
RESEARCH
   ↓
VERIFICATION
   ↓
STRUCTURED DATA
   ↓
VALIDATION
   ↓
TESTING
   ↓
RELEASE


---

3. Source Discovery

Sources may be discovered through:

Official government websites
Official recruitment portals
Government notifications
Government gazettes
Service rules
Recruitment rules
Government orders
Annual reports
Official vacancy pages
Official archives
District portals
Centralised official job indexes

Secondary sources may help discover information but should not replace primary verification where primary evidence is available.


---

4. Source Capture

When a source is found, record:

sourceId
organisation
title
documentType
publicationDate
effectiveDate
URL
sourcePriority
status
relevance
retrievedDate
notes

Do not begin production-data editing until the source can be identified.


---

5. Determine Source Status

Classify the source as:

OFFICIAL_CURRENT
OFFICIAL_HISTORICAL
OFFICIAL_RULE
SECONDARY
ESTIMATE
NOT_VERIFIED

OFFICIAL_RULE should also identify whether the rule is current or historical where relevant.


---

6. Extract Claims

A source may contain multiple claims.

Example:

Qualification
Age
Pay
Physical Standard
Selection Process
Vacancy

Each claim should be extracted separately when practical.

This avoids attaching a source to a fact it does not actually support.


---

7. Claim Verification

For each claim ask:

Does the source explicitly support this?
Does it refer to the same post?
Does it refer to the same recruitment cycle?
Is it still applicable?
Has it been amended?
Is there a newer official source?


---

8. Resolve Conflicts

When conflicting evidence exists:

1. Compare dates.
2. Check amendments.
3. Check applicable post/cadre.
4. Check recruitment cycle.
5. Prefer current authoritative evidence.
6. Record the conflict.
7. Record the resolution.
8. Reduce confidence where appropriate.


---

9. Update the Correct Data File

Use the repository's separation of concerns.

For example:

/data/central/jobs.json
/data/central/exams.json
/data/central/recruitment.json
/data/central/pay.json
/data/central/housing.json
/data/central/promotion.json
/data/central/benefits.json
/data/central/sources.json

and:

/data/states/west-bengal/jobs.json
/data/states/west-bengal/exams.json
/data/states/west-bengal/recruitment.json
/data/states/west-bengal/pay.json
/data/states/west-bengal/housing.json
/data/states/west-bengal/promotion.json
/data/states/west-bengal/benefits.json
/data/states/west-bengal/sources.json

Common controlled vocabularies remain under:

/data/common/


---

10. Do Not Duplicate Facts Unnecessarily

A canonical fact should ideally have one authoritative storage location.

For example:

Qualification definition
    →
/data/common/qualifications.json

while a job refers to:

qualificationId

rather than reproducing the entire qualification definition.


---

11. Job Update Workflow

For a job change:

Open source
    ↓
Identify job
    ↓
Verify job identity
    ↓
Compare existing data
    ↓
Update changed fields
    ↓
Preserve unaffected data
    ↓
Attach source
    ↓
Run validation


---

12. Exam Update Workflow

For an examination:

Verify examination identity
    ↓
Verify current notification
    ↓
Update qualification
    ↓
Update age
    ↓
Update stages
    ↓
Update physical / skill conditions
    ↓
Update vacancy/status
    ↓
Update source
    ↓
Test dependent job records


---

13. Qualification Update Workflow

Qualification changes are high-impact.

Process:

Source Verification
    ↓
Identify affected jobs
    ↓
Update requirement
    ↓
Review B.A. English eligibility
    ↓
Review conditional eligibility
    ↓
Run eligibility tests
    ↓
Review recommendation impact


---

14. Additional Qualification Update

When adding qualifications such as:

B.Ed.
D.El.Ed.
ITI
Specific ITI Trade
Technical Diploma
LL.B.
Computer Qualification
Professional Licence

ensure they are represented as reusable controlled qualifications.

Do not hard-code the qualification independently inside multiple jobs.


---

15. Eligibility Data Update

Eligibility-related updates should include:

requiredQualificationIds
subjectRequirements
marksRequirements
professionalQualifications
technicalQualifications
skills
licences
experience
language
age
domicile
physical
medical

The relevant source must accompany material changes.


---

16. Pay Update

For a pay change:

Verify Pay Rule
    ↓
Record effective date
    ↓
Update pay data
    ↓
Review salary estimates
    ↓
Review comparison/ranking impact
    ↓
Validate

Do not change the pay level merely because a secondary website lists a new figure.


---

17. Allowance Update

For allowance changes, keep:

Basic
DA
HRA
Other Allowance

separate.

Do not replace basic pay with gross salary.


---

18. Salary Estimate Recalculation

Whenever relevant salary components change:

Basic
+
Known Allowances
−
Known Deductions
=
Updated Estimate

The estimate must retain its assumptions.

Where an exact current in-hand value cannot be established:

Current exact take-home not publicly verified.

should remain a valid outcome.


---

19. Recruitment Status Update

Status updates should distinguish:

Career Exists

from:

Current Recruitment Open

A closed recruitment must not result in deleting the career.


---

20. Vacancy Update

Vacancy data must be tied to:

notificationId
recruitmentCycle
postId
date

Do not overwrite an entire career's vacancy history with the latest number.


---

21. Housing Update

Housing changes should update relevant components:

entitlement
availability
allotment
licenceFee
HRAImpact
utilities
maintenance

Never write:

quarter = free

as a generic value.


---

22. Promotion Update

When promotion rules change:

Update promotion data
    ↓
Review career ladder
    ↓
Review career-growth attributes
    ↓
Review recommendation scoring
    ↓
Run regression tests


---

23. Current vs Historical Data

When old information is replaced:

Historical Record
    ↓
status = HISTORICAL / SUPERSEDED

New information becomes:

CURRENT

The previous record may remain available for audit purposes.


---

24. Source Date and Verification Date

Every important update should distinguish:

source publication date

from:

date the project verified the source

These are different.

Example:

Source published:
2026-07-10

Verified by project:
2026-08-31


---

25. Update Frequency

Different data types require different review frequency.

High Frequency

current recruitment;

application dates;

vacancies;

current notices.


Medium Frequency

pay;

eligibility rules;

recruitment patterns;

examination structure.


Lower Frequency

service structure;

career ladders;

departmental history.


Historical information should remain preserved unless demonstrably incorrect.


---

26. Pre-Release Validation

Before releasing updated data, run:

JSON validation
Schema validation
Reference integrity
Source integrity
Duplicate detection
Required-field checks
Eligibility tests
Recommendation tests
Localization checks where affected


---

27. Affected-Record Analysis

When one record changes, identify dependent records.

Example:

Qualification
    ↓
Jobs
    ↓
Eligibility
    ↓
Recommendations
    ↓
Rankings

A qualification change may therefore affect many pages even if only one JSON file was edited.


---

28. Index Regeneration

After relevant data changes, regenerate or validate:

/data/indexes/job-index.json
/data/indexes/exam-index.json
/data/indexes/department-index.json
/data/indexes/source-index.json
/data/indexes/search-index.json

Indexes must never become a conflicting second source of truth.

They are derived data.


---

29. Derived Data

Derived files may include:

search indexes
aggregations
cached summaries
ranking snapshots

The canonical source data remains authoritative.

Derived data should be regenerated rather than manually edited wherever possible.


---

30. Data Validation Failure

If validation fails:

Do not publish.

Identify:

schema error
reference error
missing source
invalid identifier
invalid value
logic regression

Correct the underlying problem first.


---

31. Eligibility Regression

After material eligibility changes, test:

B.A. English baseline
B.A. English + B.Ed.
B.A. English + D.El.Ed.
B.A. English + ITI
B.A. English + specific ITI trade
B.A. English + other specialist qualifications

where relevant.


---

32. Recommendation Regression

Test representative profiles:

Family First
Parent-Care First
Salary First
Authority First
Kolkata First
Low Risk
Office First
Police Interest
Central Government Priority
State Government Priority

Ensure the change does not create unintended ranking changes.


---

33. Version the Update

Every material release should identify appropriate versions.

For example:

Data Version: 1.4.0
Eligibility Model: 1.0.0
Scoring Model: 1.0.1

The actual project versioning policy may evolve.


---

34. Changelog Entry

A material update should produce an entry in:

/CHANGELOG.md

Example:

### 2026-08-31

- Updated recruitment requirements for [post].
- Reclassified eligibility due to newly verified qualification rule.
- Updated source references.
- Re-ran eligibility regression tests.


---

35. Data Update Commit

Recommended commit style:

data: update <scope>

Examples:

data: update west bengal police recruitment
data: update central railway pay records
data: correct teacher eligibility mappings
data: refresh current recruitment statuses


---

36. Research Correction Commit

Use:

research: correct <topic>

when the change originates from research correction.

Example:

research: correct excise designation classification


---

37. Emergency Correction

For a critical factual error:

Verify
Correct
Validate
Test
Commit
Document
Release

Do not wait for the normal periodic update cycle.


---

38. Update Responsibility

The person performing an update is responsible for:

source accuracy
data accuracy
classification
references
testing
documentation

AI assistance does not transfer responsibility.


---

39. Final Data-Update Principle

> Government data should enter the product only through an evidence-backed, validation-tested update path. The database should be treated as maintained research infrastructure, not as a manually edited list of facts.
