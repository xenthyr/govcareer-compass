# GovCareer Compass — Research Audit Model

**File:** `/docs/RESEARCH-AUDIT-MODEL.md`  
**Document Type:** Canonical Research Audit and Forensic Verification Specification  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`

---

# 1. Purpose

The Research Audit Model defines how GovCareer Compass audits the completeness, correctness, currentness and evidence quality of its government-career database.

The purpose is not merely to validate JSON syntax.

The audit must determine whether the underlying government-career information is:

- complete enough for the defined scope;
- correctly classified;
- supported by appropriate evidence;
- correctly associated with the candidate's qualification;
- correctly separated by government;
- correctly separated by recruitment route;
- current or appropriately historical;
- internally consistent;
- free from unsupported certainty.

---

# 2. Audit Philosophy

The project must operate on:

DISCOVER
    ↓
CLASSIFY
    ↓
VERIFY
    ↓
COMPARE
    ↓
CORRECT
    ↓
EXPAND
    ↓
RECHECK

The previous database is treated as a baseline for comparison only.

It is not treated as authoritative.


---

3. Audit Dimensions

Every major audit should test:

Existence
Identity
Classification
Qualification
Eligibility
Recruitment Route
Currentness
Pay
Job Profile
Physical
Medical
Posting
Transfer
Housing
Promotion
Benefits
Family Analysis
Sources
Confidence


---

4. Audit Universe

The audit universe consists of:

West Bengal Government
Central Government
State / Local Government where explicitly within scope
Constitutional / Statutory bodies where relevant
Government-controlled organisations where explicitly classified

PSUs, autonomous institutions and contractual bodies must remain separately classified.


---

5. Government Structural Audit

For each West Bengal department:

Department Directory
    ↓
Department Website
    ↓
Directorates
    ↓
Attached / Subordinate Offices
    ↓
Organisation Structure
    ↓
Designation / Cadre Information
    ↓
Rules
    ↓
Recruitment
    ↓
District Structures

For Central Government:

Ministry
    ↓
Department
    ↓
Attached Office
    ↓
Subordinate Office
    ↓
Organisation / Cadre
    ↓
Rules
    ↓
Recruitment


---

6. Audit Status Values

Each department or research unit should receive one of:

NOT_STARTED
DISCOVERY_ONLY
PARTIAL
SUBSTANTIALLY_COMPLETE
COMPLETE
REQUIRES_RECHECK
NOT_APPLICABLE
NOT_PUBLICLY_VERIFIABLE

COMPLETE means complete within the defined research method and available public evidence, not absolute completeness.


---

7. Post-Level Audit

Every discovered post should be checked independently.

Minimum audit fields:

Post Identity
Department
Organisation
Service
Cadre
Recruitment Route
Qualification
Eligibility
Pay
Current Status
Source
Confidence

A post should not be considered fully verified because another post with a similar name has been verified.


---

8. Identity Audit

Ensure that:

Government
Department
Organisation
Service
Cadre
Post
Rank
Designation
Exam
Recruitment Authority

are not incorrectly merged.

Example:

SSC CGL

is an examination.

Income Tax Inspector

is a post.

CBDT

is an organisation / department context.

These records must remain distinct.


---

9. Duplicate Audit

Potential duplicates should be flagged when:

names are identical;

names are similar;

departments differ;

pay differs;

cadres differ;

recruitment routes differ.


The system must not merge two records merely because their names look similar.


---

10. Qualification Audit

For every major post verify:

Minimum Qualification
Exact Degree
Discipline
Subject
Subject Level
Minimum Marks
Professional Qualification
Technical Qualification
ITI Trade
Skill
Licence
Experience
Language
Physical
Medical

The audit should compare the database against the cited recruitment rule.


---

11. B.A. English Audit

The baseline candidate:

B.A. English Honours

must be evaluated separately from:

B.A. Economics
B.A. Mathematics
B.A. Statistics
B.Com.
B.Tech.
M.A.
B.Ed.
D.El.Ed.
ITI

The audit must ensure that the system has not accidentally generalized specialist eligibility to the English Honours candidate.


---

12. Additional-Qualification Audit

The audit must ensure that the data model can represent:

B.Ed.
D.El.Ed.
B.El.Ed.
ITI
Specific ITI Trade
Diploma
Engineering
LL.B.
Computer qualification
Professional licence
Professional registration
Other specialist qualification

A user without such qualifications must not be incorrectly shown specialist opportunities as directly eligible.


---

13. Teacher Eligibility Audit

Teacher-related posts should be checked for:

Academic Degree
Subject
B.Ed. / D.El.Ed. / other teacher qualification
Eligibility Test
Marks
Age
Other Conditions

The system must correctly distinguish:

Teacher Career

from:

Teacher Career Currently Eligible


---

14. Technical / ITI Audit

Check:

Qualification Type
ITI Trade
Accepted Trades
Equivalent Trades
Diploma
Engineering Discipline
Other Technical Conditions

Do not assume every ITI certificate is interchangeable.


---

15. Lower-Level Eligibility Audit

For Class 8, Class 10 and Class 12 recruitment:

Check overqualification policy
Check exact qualification wording
Check whether higher education is prohibited
Check current notification

Possible result:

ALLOWED
NOT_RESTRICTED
RESTRICTED
EXACT_ONLY
UNKNOWN


---

16. Recruitment Route Audit

Every post must be checked for:

DIRECT_RECRUITMENT
PROMOTION
DEPUTATION
TRANSFER
CONTRACT
OUTSOURCED
TEMPORARY
PROJECT
SCHEME
OTHER

Common audit error:

Promotion-only designation
→ incorrectly shown as direct-entry career

This must be explicitly tested.


---

17. Currentness Audit

For every current claim:

Source Date
Effective Date
Current Status
Superseding Rule
Amendment
Current Recruitment Cycle

Check whether:

historical

has incorrectly been labelled:

current


---

18. Pay Audit

Check:

Government
Pay System
Pay Level
Starting Basic
Maximum Basic
Allowance Framework
Source
Source Date

Critical test:

West Bengal Level X
≠
Central 7th CPC Level X

unless actual salary values independently establish a comparison.


---

19. Salary Audit

Ensure separate fields for:

Basic
DA
HRA
Other Allowances
Gross
Deductions
Retirement Contribution
Tax
Estimated In-Hand

Never replace:

in-hand

with:

basic

or:

gross


---

20. Housing Audit

For every major housing claim check:

Entitlement
Availability
Allotment
Waiting / Vacancy Information
Licence Fee
HRA Impact
Utilities
Maintenance

Do not infer:

Entitlement = Allocation

or:

Allocation = Immediate Occupancy


---

21. Promotion Audit

Check:

Entry
Promotion 1
Promotion 2
Promotion 3
Senior Career

and:

Minimum service
Seniority
Selection
Departmental exam
Vacancy dependence

Do not convert:

minimum qualifying service

into:

guaranteed promotion year


---

22. Posting and Transfer Audit

Check:

Posting Scope
Kolkata Relevance
West Bengal Scope
District Posting
Rural Posting
Remote Posting
All-India Posting
Transfer
Request Transfer
Promotion-related movement

Avoid invented transfer frequencies.


---

23. Family Audit

Family-related scores should be traced to actual career attributes.

Check whether scores are being influenced by:

location
transfer
night duty
shift duty
emergency duty
holiday duty
work predictability
housing

They must be labelled:

PRACTICAL_ASSESSMENT

unless objectively supported.


---

24. Authority Audit

Authority claims must correspond to actual responsibilities or statutory powers.

Audit:

Administrative
Statutory
Investigation
Enforcement
Inspection
Supervision
Financial
Decision-Making

Prevent unsupported statements such as:

"unlimited power"

or:

"equivalent to IAS"

for unrelated cadres.


---

25. Physical / Medical Audit

Verify separately:

Physical Standard
Physical Efficiency Test
Medical
Height
Chest
Weight
Running
Walking
Cycling
Eyesight
Hearing
Colour Vision
Gender-specific conditions
Medical Category

Never substitute one requirement for another.


---

26. Source Audit

Every major factual claim should have at least one traceable source where publicly available.

Audit:

Source ID
URL
Organisation
Document
Date
Type
Confidence
Claim Relationship


---

27. Source Conflict Audit

The system should flag:

Two different qualifications
Two different pay values
Two different ages
Two different physical standards
Two different recruitment routes
Two different current statuses

The researcher must resolve or document the conflict.


---

28. Previous Database Comparison

The baseline comparison table is:

Post	Department	Previously Present	Complete	Correct	Current	Eligibility Correct	Pay Correct	Recruitment Route Correct	Audit Result



Possible result values:

CORRECT
INCOMPLETE
INCORRECT
MISSING
HISTORICAL
OBSOLETE
WRONG_ELIGIBILITY
WRONG_PAY
WRONG_ROUTE
WRONG_CLASSIFICATION


---

29. Missing-Post Audit

Every missing post must record:

post
department
organisation
service
cadre
qualification
BA eligibility
recruitment route
pay
current status
reason previously missed
source
confidence


---

30. Correction Audit

Every correction should record:

previous value
correct value
reason
source
verification date
affected files
affected application logic
severity


---

31. Correction Severity

Suggested severity:

CRITICAL
HIGH
MEDIUM
LOW
INFORMATIONAL

CRITICAL

May change legal eligibility or fundamentally misrepresent a career.

Examples:

wrong qualification;

wrong recruitment route;

current post incorrectly marked obsolete;

promotion-only post shown as direct entry.


HIGH

Material impact on career comparison.

Examples:

wrong pay;

wrong current status;

wrong physical requirement.


MEDIUM

Meaningful but limited practical effect.

Examples:

incomplete housing details.


LOW

Presentation or contextual issue.


---

32. Data Integrity Audit

Check:

Broken IDs
Duplicate IDs
Missing relationships
Invalid references
Missing source IDs
Invalid qualification IDs
Invalid government IDs
Invalid state IDs
Invalid pay references
Invalid recruitment references

These checks complement JSON Schema validation.


---

33. Cross-File Audit

Cross-check relationships such as:

jobs.json
    ↓
exams.json

jobs.json
    ↓
departments.json

jobs.json
    ↓
organisations.json

jobs.json
    ↓
recruitment.json

jobs.json
    ↓
sources.json

jobs.json
    ↓
pay.json

jobs.json
    ↓
housing.json

jobs.json
    ↓
promotion.json

A valid JSON document with a broken relationship is still a data-quality failure.


---

34. Assessment Compatibility Audit

Ensure that assessment data can collect the information required by the eligibility engine.

Examples:

Education
Degree
Subject
B.Ed.
D.El.Ed.
ITI
ITI Trade
Computer qualification
Driving licence
Language
Experience

If the eligibility engine needs a field that the assessment never collects, the system should represent the result as:

UNKNOWN

rather than guessing.


---

35. Recommendation Compatibility Audit

Ensure recommendation data receives:

eligibilityStatus
careerAttributes
candidatePreferences

and does not bypass the eligibility engine.


---

36. Scoring Audit

Check:

Direction
Weight
Normalization
Unknown Handling
Negative Metric Handling
Category Balancing

Test:

Stress = higher burden
Risk = higher burden
Transfer = higher burden
Night Duty = higher burden

These must not accidentally become "higher is better."


---

37. Internationalization Audit

Check:

English keys
Bengali keys
Stable IDs
Source titles
Placeholders
Status values
Qualification IDs
Job IDs
Exam IDs

Changing language must not change:

eligibility
score
job ID
exam ID
source ID


---

38. Security / AI Audit

Ensure that:

AI cannot modify canonical eligibility;

AI cannot invent sources;

AI cannot fabricate current recruitment;

AI cannot fabricate salary;

AI cannot silently change scores;

untrusted translation content cannot execute arbitrary HTML/script.



---

39. Audit Evidence

Audit findings should preserve enough information to reproduce the conclusion.

Recommended record:

auditId
date
auditor
scope
finding
oldValue
newValue
sourceIds
severity
resolution
status
notes


---

40. Audit States

Possible finding states:

OPEN
UNDER_REVIEW
VERIFIED
CORRECTED
REJECTED
SUPERSEDED
ACCEPTED_AS_UNCERTAIN
CLOSED


---

41. Department Audit Matrix

A future audit matrix should contain:

Department	Website Checked	Recruitment Checked	Rules Checked	Designations Checked	Directorates Checked	Districts Checked	Posts Found	Missing Posts Checked	Audit Status



This is a research-control document, not application data.


---

42. Research Saturation Audit

Before declaring practical saturation, verify that:

Department Pass
Designation Pass
Recruitment Pass
Qualification Pass
Pay Pass
District Pass
A–Z Pass
Job-Family Pass
Current-Vacancy Pass
Previous-Database Comparison

have all been completed to the intended scope.


---

43. No False Completeness

The audit must never claim:

> No government posts are missing.



Instead:

> No substantial new relevant posts were identified through the completed research passes within the defined public-evidence scope.




---

44. Final Audit Certificate

A research release may include a statement:

PRACTICAL RESEARCH SATURATION REACHED

The database has undergone department, designation, recruitment,
qualification, pay-level, district, job-family and A–Z omission checks
within the defined research scope.

Remaining uncertainty is documented rather than concealed.


---

45. Final Audit Principle

> The purpose of the audit is not to prove perfection. It is to make omissions, contradictions, outdated information, unsupported claims and uncertainty visible enough that they can be corrected systematically.
