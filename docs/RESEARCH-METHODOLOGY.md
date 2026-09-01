# GovCareer Compass — Research Methodology

**File:** `/docs/RESEARCH-METHODOLOGY.md`  
**Document Type:** Canonical Research Operations Specification  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`  
**Research Baseline:** 31 August 2026

---

# 1. Purpose

This document defines the research process used to construct and maintain the GovCareer Compass government-career database.

The objective is not merely to collect popular examinations.

The objective is to construct the broadest practical, publicly researchable government-post universe relevant to the project's candidate profile while maintaining evidence quality.

The initial candidate model is:

B.A. English Honours
+
No additional specialist qualification assumed

The research universe includes:

Class 8
Class 10
Class 12
Graduate
Professional / Specialist qualification pathways

The primary implementation scope is:

West Bengal Government
+
Central Government

The architecture remains expandable to other State Governments.


---

2. Research Principles

The methodology is built on the following principles:

1. Discover broadly.


2. Verify narrowly.


3. Prefer primary sources.


4. Never infer eligibility from a job title alone.


5. Never infer currentness from an old notification.


6. Separate career existence from current recruitment.


7. Separate job discovery from recruitment availability.


8. Separate official facts from analysis.


9. Separate basic pay from gross and in-hand pay.


10. Separate entitlement from practical availability.


11. Separate eligibility from recommendation.


12. Preserve uncertainty.


13. Preserve historical evidence.


14. Maintain an audit trail.


15. Do not claim impossible completeness.




---

3. Research Universe

The discovery universe includes:

Departments
Directorates
Ministries
Organisations
Services
Cadres
Posts
Ranks
Designations
Recruitment examinations
Recruitment authorities
District-level establishments
Local government institutions
Statutory bodies
Government-controlled organisations
Central Government attached/subordinate offices

The research is organised by both:

government structure

and:

job family

to reduce omission risk.


---

4. Primary Discovery Strategy

Research is conducted through multiple independent passes.

PASS 1
Department / Ministry Discovery

PASS 2
Designation / Cadre Discovery

PASS 3
Recruitment Authority Discovery

PASS 4
Service / Recruitment Rule Discovery

PASS 5
Qualification Discovery

PASS 6
Pay-Level Discovery

PASS 7
District / Local Government Discovery

PASS 8
Job-Family Discovery

PASS 9
A–Z Discovery

PASS 10
Current Vacancy Discovery

PASS 11
Previous-Database Gap Audit

PASS 12
Saturation Review

A post found through one pass must be tested against the other relevant passes.


---

5. West Bengal Department Discovery

The official Government of West Bengal department directory provides the initial department checklist.

The checklist should cover, as applicable:

Agriculture;

Agricultural Marketing;

Animal Resources Development;

Backward Classes Welfare;

Consumer Affairs;

Co-operation;

Correctional Administration;

Disaster Management and Civil Defence;

Environment;

Finance;

Fire and Emergency Services;

Fisheries;

Food and Supplies;

Food Processing Industries and Horticulture;

Forest;

Health and Family Welfare;

Higher Education;

Home and Hill Affairs;

Housing;

Information and Cultural Affairs;

Information Technology and Electronics;

Irrigation and Waterways;

Judicial;

Labour;

Land and Land Reforms;

Law;

Mass Education Extension and Library Services;

Minority Affairs and Madrasah Education;

North Bengal Development;

Panchayat and Rural Development;

Parliamentary Affairs;

Paschimanchal Unnayan Affairs;

Personnel and Administrative Reforms;

Planning;

Statistics;

Programme Monitoring;

Power;

Public Enterprises;

Public Health Engineering;

Public Works;

School Education;

Science and Technology;

Self Help Group and Self Employment;

Sundarban Affairs;

Technical Education, Training and Skill Development;

Tourism;

Transport;

Tribal Development;

Urban Development and Municipal Affairs;

Water Resources Investigation and Development;

Women and Child Development and Social Welfare;

Youth Services and Sports;

and any additional department appearing in the current official directory.


The list above is a discovery framework, not an assertion that every department contains a BA-compatible post.


---

6. Department Audit

Each department should be evaluated through:

Department Page
    ↓
Directorate / Attached Office
    ↓
Organisation Structure
    ↓
Designation / Cadre Information
    ↓
Service Rules
    ↓
Recruitment Rules
    ↓
Recruitment Archive
    ↓
District / Regional Establishments
    ↓
Current Recruitment

A department is not considered fully audited merely because its recruitment page has been viewed.


---

7. Designation Discovery

Official documents should be searched for:

Sanctioned Strength
Designation
Cadre
Establishment
Staff Strength
Manpower
Organisation Chart
Recruitment Rules
Service Rules
Annual Report

Potentially relevant designation families include:

Assistant
Administrative Assistant
Executive Assistant
Office Assistant
Clerk
Lower Division Assistant
Lower Division Clerk
Upper Division Assistant
Upper Division Clerk
Junior Assistant
Senior Assistant
Head Assistant
Office Superintendent
Superintendent
Record Keeper
Record Assistant
Typist
Stenographer
Personal Assistant
Private Secretary
Auditor
Accountant
Accounts Clerk
Cashier
Inspector
Sub-Inspector
Assistant Sub-Inspector
Constable
Warder
Guard
Forest Guard
Driver
Peon
Office Attendant
Group D
Farash
Darwan
Khalasi
Helper
Revenue Officer
Tax Officer
Welfare Officer
Labour Officer
Employment Officer
Development Officer
Extension Officer
Field Officer
Information Officer
Research Assistant
Programme Officer
Technical Assistant
Investigator
Enforcement Officer
Security Officer

These terms are discovery keywords.

They are not evidence that every such post exists in every department.


---

8. Recruitment Route Verification

Every discovered post must be classified.

Possible values:

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
UNKNOWN

A promotion-only or deputation-only post must not be presented as an ordinary fresh-entry government career.


---

9. Qualification Verification

For every discovered post, determine:

Minimum Education Level
Exact Degree
Degree Discipline
Required Subject
Subject Level
Required Marks
Professional Qualification
Technical Qualification
ITI Trade
Licence
Registration
Experience
Language
Physical
Medical
Other Mandatory Conditions

The researcher must never infer:

Graduate
=
eligible for every graduate-level post


---

10. Candidate Qualification Model

The baseline candidate is:

B.A.
English Honours
No additional specialist qualification assumed

The qualification engine must nonetheless support additional qualifications such as:

B.Ed.
D.El.Ed.
B.El.Ed.
ITI
Specific ITI Trade
Technical Diploma
Engineering Qualification
LL.B.
Computer Qualification
Professional Registration
Professional Licence
Other specialist qualifications

This allows future users to receive more accurate recommendations than the original baseline candidate.


---

11. Hard Eligibility Audit

For each post:

1. Education
2. Degree
3. Subject
4. Marks
5. Professional qualification
6. Technical qualification
7. Skills
8. Licence
9. Registration
10. Experience
11. Language
12. Age
13. Citizenship
14. Domicile
15. Reservation/category
16. Physical
17. Medical
18. Recruitment-route conditions

The result must be one of:

ELIGIBLE
CONDITIONALLY_ELIGIBLE
UNKNOWN
NOT_ELIGIBLE


---

12. Lower-Level Qualification Audit

Class 8, Class 10 and Class 12 opportunities must undergo an overqualification check.

Determine whether:

Higher Qualification Allowed

or:

Exact Qualification Required

or:

Higher Qualification Restricted

or:

Unknown

The candidate must not be automatically assumed eligible simply because they possess a higher degree.


---

13. Teaching Recruitment Audit

Teacher-related recruitment must be audited separately.

Check:

Academic qualification
Subject
Professional teacher qualification
Eligibility test
Required marks
Experience if applicable
Age
Other recruitment conditions

A B.A. English degree must not automatically be treated as sufficient for teaching recruitment.

Likewise:

B.Ed.

does not automatically qualify a person for every teaching post.


---

14. ITI / Technical Audit

ITI must be audited at trade level.

Search:

ITI
Trade
Recognised Trade
Equivalent Trade
Accepted Trade
Technical Qualification
Diploma
Engineering

Do not use:

Any ITI

when the official rule requires:

Specific ITI Trade

unless the source explicitly accepts multiple trades.


---

15. Central Government Discovery

Central Government research must not stop at:

UPSC
SSC
Railways

The discovery universe should include:

Ministries;

Departments;

Attached offices;

Subordinate offices;

statutory organisations;

recruitment boards;

departmental recruitment pages.


Major discovery authorities include:

Union Public Service Commission
Staff Selection Commission
Railway Recruitment Boards
Railway Protection Force
Ministry of Home Affairs
Intelligence Bureau
Central Bureau of Investigation
National Investigation Agency
Narcotics Control Bureau
Central Armed Police Forces
Department of Posts
Ministry of Finance
Central Board of Direct Taxes
Central Board of Indirect Taxes and Customs
Comptroller and Auditor General of India
Controller General of Defence Accounts
Department of Personnel and Training
Employment News
and other official recruiting bodies


---

16. SSC Selection Post Research

Selection Post must never be treated as one generic job.

For every relevant cycle:

Matriculation
Higher Secondary
Graduation & Above

should be independently examined.

For each relevant post determine:

Post
Department
Region
Qualification
Exact Degree
Subject
Experience
Pay Level
Recruitment Route
BA English Eligibility


---

17. Railway Research

Railway research must include:

RRB NTPC Graduate
RRB NTPC Undergraduate
Railway Protection Force
Group D / Level 1
Ministerial and Isolated Categories
Other relevant recruitment

Ministerial and Isolated Categories must be individually examined.

Lower-level railway positions require an overqualification check.


---

18. Postal Research

Relevant pathways include:

Postal Assistant
Sorting Assistant
Postman
Mail Guard
Multi-Tasking Staff
Inspector Posts
Driver
Departmental recruitment
Other relevant posts

Every post requires separate qualification verification.


---

19. UPSC Research

Research separately:

Civil Services Examination
Central Armed Police Forces Assistant Commandant
Combined Defence Services
Other UPSC graduate-compatible examinations

For Civil Services Examination:

List each relevant service separately.

For Combined Defence Services:

Indian Military Academy
Officer Training Academy
Air Force Academy
Indian Naval Academy

must be evaluated separately because qualification conditions may differ.


---

20. Intelligence / Investigation / Enforcement Research

Research separately for:

Intelligence Bureau
Assistant Central Intelligence Officer
Security Assistant
Central Bureau of Investigation
National Investigation Agency
Narcotics Control Bureau
Central Armed Police Forces
Enforcement Directorate
Customs
Central Excise
Preventive Officer
Examiner
Inspector
Investigator
Other enforcement/security roles

For each, determine whether recruitment is through:

Direct Examination
Departmental Recruitment
Promotion
Deputation
Other

Deputation-only roles must not be included as ordinary fresh-entry opportunities.


---

21. District-Level Research

West Bengal district portals should be checked for:

District Magistrate
Collectorate
Zilla Parishad
Panchayat Samiti
Gram Panchayat
District Social Welfare
District Disaster Management
District Child Protection
District Education
Local Authorities
Recruitment

Every district discovery must classify employment as:

Regular
Temporary
Contractual
Project
Scheme
Outsourced
Unknown


---

22. Local Government Research

The research may include:

Municipal Corporations
Municipalities
Panchayat Institutions
Development Authorities
Other Local Statutory Authorities

These must be clearly separated from:

West Bengal State Government Cadre

and:

Central Government


---

23. Job-Family Search

A separate keyword pass should search:

Assistant
Officer
Executive
Inspector
Sub-Inspector
Assistant Sub-Inspector
Constable
Guard
Clerk
Accountant
Auditor
Typist
Stenographer
Attendant
Peon
Warder
Driver
Record
Revenue
Tax
Welfare
Labour
Employment
Development
Youth
Disaster
Extension
Information
Programme
Administrative
Cash
Accounts
Field
Technical Assistant
Superintendent
Controller
Registrar
Examiner
Investigator
Enforcement
Security
Intelligence

This pass is intended to catch posts missed by department-first discovery.


---

24. A–Z Discovery Pass

An independent alphabetical search should be used as an omission-control mechanism.

A
B
C
D
...
Z

Search post names, recruitment notices, service rules and designation documents.

A–Z discovery is supplemental.

It does not replace department and service-rule research.


---

25. Pay-Level Discovery

Search by pay level and pay matrix where possible.

Concept:

Pay Level
    ↓
Which posts exist at this level?
    ↓
Which departments use them?
    ↓
Which recruitment route?
    ↓
What qualification?

This can discover posts absent from current vacancy notices.

West Bengal and Central Government pay systems must be treated separately.


---

26. Qualification Discovery

Search official recruitment documents using phrases such as:

Madhyamik
Class X
Higher Secondary
10+2
Bachelor's Degree
Graduate
Degree from a recognised university
Any Discipline
Statistics
Mathematics
Economics
Commerce
B.Ed.
D.El.Ed.
ITI
Diploma

Then intersect the results with the department/post universe.


---

27. Research Record

Each discovered post should receive a structured research record containing at least:

government
department
organisation
service
cadre
post
recruitmentRoute
qualification
eligibilityStatus
currentStatus
sources
sourceDate
confidence
researchNotes


---

28. Research Status

Each research item may have:

DISCOVERED
UNDER_VERIFICATION
VERIFIED
PARTIALLY_VERIFIED
HISTORICAL
SUPERSEDED
OBSOLETE
NOT_VERIFIED
REQUIRES_RESEARCH

Only appropriately verified information should become a production-quality current claim.


---

29. Source Collection

For material data:

Discovery
   ↓
Source capture
   ↓
Source classification
   ↓
Claim extraction
   ↓
Verification
   ↓
Structured data entry
   ↓
Validation

Do not type data directly into production JSON without recording its source.


---

30. Research vs Analysis

The research layer collects:

What the government source says.

The analytical layer may conclude:

What that information practically means for a candidate.

The two must remain distinguishable.

Example:

Official Fact:
Post requires specified qualification.

Practical Assessment:
This makes the post unavailable to the baseline B.A. English candidate.


---

31. Work-Life Research

Do not invent fixed working hours.

Use:

Official working-hours rule

where published.

Otherwise use:

Practical Assessment

based on:

operational structure;

shift provisions;

emergency functions;

court work;

field responsibilities;

transfer characteristics.


An "illustrative typical day" must always be labelled.


---

32. Family Research

Family compatibility should be derived from verified career characteristics.

Potential factors:

posting stability
transfer
night duty
shift duty
emergency duty
holiday duty
work predictability
housing
travel

This is analytical.

It is not an official government score.


---

33. Housing Research

Housing research should distinguish:

Entitlement
Availability
Allotment
Occupancy
Licence Fee
HRA Impact
Utilities
Maintenance
Private-Housing Alternative

No unsupported statements such as:

"Every employee gets a quarter"

may enter the database.


---

34. Promotion Research

Promotion data should identify:

Entry Post
Promotion Route
Minimum Qualifying Service
Selection Method
Seniority
Vacancy Dependence
Departmental Examination
Training
Senior Career

Never convert minimum qualifying service into a guaranteed promotion date.


---

35. Retirement Research

For major careers investigate:

Retirement Age
Applicable Pension / Retirement Framework
Gratuity
Family Benefits
Leave Encashment
Medical Benefits
Other Service Benefits

Appointment-date differences must be respected.


---

36. Currentness Research

Every current claim must answer:

What is the source?
When was it published?
Is it still applicable?
Has it been superseded?
Does it refer to the same post/cadre?


---

37. Previous Database Audit

Once the independent universe is built, compare it with the previous database.

For every discovered item:

Found previously?
Complete?
Correct?
Current?
Eligibility correct?
Pay correct?
Recruitment route correct?

Classification:

CORRECT
INCOMPLETE
INCORRECT
MISSING
HISTORICAL
OBSOLETE
WRONG_QUALIFICATION
WRONG_PAY
WRONG_ROUTE
WRONG_CLASSIFICATION


---

38. Missing Post Register

Every post not present in the earlier database should be recorded in:

/research/audit/missing-posts/

with:

post
department
organisation
service
qualification
eligibility
recruitment route
pay
source
reason missed
confidence


---

39. Correction Register

Every material correction should be recorded in:

/research/audit/corrections/

with:

previous claim
correct claim
reason
source
verification date
impact


---

40. Research Saturation

Research may be considered to have reached practical saturation only when:

Department searches
        ↓
produce no substantial new relevant posts

Designation searches
        ↓
produce no substantial new relevant posts

Recruitment searches
        ↓
produce no substantial new relevant posts

Qualification searches
        ↓
produce no substantial new relevant posts

Pay-level searches
        ↓
produce no substantial new relevant posts

District searches
        ↓
produce no substantial new relevant posts

A–Z searches
        ↓
produce no substantial new relevant posts

This is:

PRACTICAL RESEARCH SATURATION

not proof of literal completeness.


---

41. Research Stop Rule

Do not continue endlessly after the same information is being rediscovered without material new evidence.

When repeated passes converge:

Document saturation findings.
Record remaining uncertainty.
Stop the research pass.


---

42. Completeness Statement

The project must never state:

> Every government post in India has been discovered.



The correct formulation is:

> GovCareer Compass represents the most comprehensive publicly researchable catalogue discovered through department, ministry, designation, recruitment-authority, service-rule, qualification, pay-level, district, job-family and A–Z cross-checking within the defined research scope.




---

43. Research Outputs

Research should ultimately produce:

Structured Job Data
Structured Exam Data
Structured Department Data
Structured Organisation Data
Recruitment Data
Pay Data
Housing Data
Promotion Data
Benefits Data
Source Data
Audit Records

The application consumes the validated structured data rather than raw research notes.


---

44. Final Research Principle

> Discover broadly enough to minimise omissions, verify specifically enough to minimise false claims, and preserve uncertainty whenever evidence is insufficient.



---

### `/docs/RESEARCH-AUDIT-MODEL.md`

```markdown
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

```text
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



---

### `/docs/CHANGE-MANAGEMENT.md`

```markdown
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

```text
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



---

### `/docs/DATA-UPDATE-WORKFLOW.md`

```markdown
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

```text
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



---

### `/docs/STATE-EXPANSION-MODEL.md`

```markdown
# GovCareer Compass — State Expansion Model

**File:** `/docs/STATE-EXPANSION-MODEL.md`  
**Document Type:** Canonical Multi-State Architecture Specification  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`

---

# 1. Purpose

GovCareer Compass is initially designed around:

```text
Central Government
+
West Bengal Government

The long-term product vision is to support government-career discovery across India.

This document defines how additional State Government datasets should be added without redesigning the platform's core:

data model;

eligibility engine;

recommendation engine;

scoring engine;

search;

filtering;

comparison;

internationalization.



---

2. Current Scope

The initial detailed State Government dataset is:

West Bengal

Central Government is maintained separately because it is not a State Government.

Current architecture:

/data/central/

/data/states/
    /west-bengal/


---

3. Future Scope

Future state datasets may eventually include:

Andhra Pradesh
Arunachal Pradesh
Assam
Bihar
Chhattisgarh
Goa
Gujarat
Haryana
Himachal Pradesh
Jharkhand
Karnataka
Kerala
Madhya Pradesh
Maharashtra
Manipur
Meghalaya
Mizoram
Nagaland
Odisha
Punjab
Rajasthan
Sikkim
Tamil Nadu
Telangana
Tripura
Uttar Pradesh
Uttarakhand
West Bengal
Other applicable State / Union Territory datasets

This is a future architecture list, not a claim that these datasets are currently implemented.


---

4. State Selector vs State Dataset

The user interface may show all Indian states in a selector before their full datasets are implemented.

This creates two independent concepts:

STATE IS LISTED

and:

STATE DATASET IS AVAILABLE

They must not be treated as equivalent.

Example:

Maharashtra

may appear in the selector while its detailed government-job dataset is:

NOT_YET_IMPLEMENTED


---

5. State Data Availability

Each state should eventually have a dataset status such as:

PLANNED
DISCOVERY
PARTIAL
RESEARCHING
SUBSTANTIALLY_COMPLETE
PRODUCTION
TEMPORARILY_UNAVAILABLE

This allows the UI to communicate state coverage honestly.


---

6. Repository Structure

The canonical pattern is:

/data/states/
    /<state-slug>/
        exams.json
        jobs.json
        departments.json
        organisations.json
        recruitment.json
        pay.json
        locations.json
        housing.json
        promotion.json
        benefits.json
        sources.json

For example:

/data/states/west-bengal/

is the initial implementation.


---

7. What Must Remain Common

The following should remain centrally shared:

/data/common/
    qualifications.json
    categories.json
    glossary.json
    scoring-rules.json
    governments.json
    states.json
    locations.json
    statuses.json
    confidence-levels.json
    source-types.json

Assessment architecture is also shared:

/data/assessment/

and schemas are shared:

/data/schemas/


---

8. State-Specific Data

State datasets should contain state-specific:

Exams
Jobs
Departments
Organisations
Recruitment
Pay
Locations
Housing
Promotion
Benefits
Sources

State-specific information should not be forced into generic Central Government structures when the semantics genuinely differ.


---

9. Government Identity

Every State Government record should identify:

governmentId
stateId

Example conceptually:

governmentId:
west-bengal-government

stateId:
west-bengal

Central Government records may use:

governmentId:
central-government

and:

stateId:
null / not applicable

according to the schema.


---

10. Stable State IDs

State IDs must be language-independent.

Example:

west-bengal

must remain identical in:

English
Bengali
Hindi
Marathi
Tamil

The displayed state name may be translated.


---

11. State Qualification Differences

State recruitment systems may use different qualification wording.

Example:

State A:
Bachelor's degree

State B:
Specific subject requirement

State C:
State-specific teaching credential

The common qualification model must be flexible enough to represent these differences.

Do not create state-specific logic that cannot be represented in the common data model unless genuinely necessary.


---

12. State Reservation Differences

State reservation systems are not automatically equivalent.

The data model must preserve:

jurisdiction
category
reservation rules
domicile implications
relaxation

Central Government reservation rules must not be automatically copied to State Government recruitment.


---

13. State Domicile

State-specific domicile or residence requirements must be represented explicitly.

The system must distinguish:

State Preference

from:

Official Domicile Requirement

A user selecting a state does not prove domicile.


---

14. State Language Requirements

Some state recruitments may include:

regional-language requirements;

language tests;

local-language subject requirements.


These must be represented as formal eligibility rules when applicable.

The common eligibility engine should consume them through structured data.


---

15. State Pay Systems

State Government pay systems differ.

For each state, retain:

paySystemId
payLevel
startingBasic
maximumBasic
allowances

The application must never assume:

State A Level 10
=
State B Level 10

or:

State Level 10
=
Central Level 10

without actual evidence.


---

16. State Pay Comparison

Cross-state comparisons should preferably use actual compensation values and clearly labelled analytical normalization.

The UI must warn that:

> State pay structures are independent systems and equal numerical level labels do not establish equivalent compensation.




---

17. State Recruitment Authorities

Every state may have a different recruitment ecosystem.

Examples of authority types:

State Public Service Commission
State Staff Selection Commission / Board
Police Recruitment Board
School Service Commission
Teacher Recruitment Board
Departmental Recruitment Board
District Recruitment Authority
Local Government Recruitment Authority
Other Statutory Authority

The system must not assume every state uses WBPSC-like architecture.


---

18. State Examination Model

The common exam model must support:

Preliminary
Mains
Descriptive
Interview
Physical
Medical
Skill
Typing
Document Verification
Other

A state may use a different combination.

The data must describe the actual recruitment.


---

19. State Department Discovery

Each new state requires a fresh department-directory research pass.

The process is:

Official State Department Directory
        ↓
Departments
        ↓
Directorates
        ↓
Boards
        ↓
Authorities
        ↓
Cadres
        ↓
Designations
        ↓
Recruitment Rules
        ↓
Recruitment Notifications

No state should be considered complete merely because the public-service commission was checked.


---

20. State Designation Discovery

Each state should undergo a designation/strength audit similar to the West Bengal forensic method.

Search:

Sanctioned Strength
Cadre
Designation
Organisation Chart
Establishment
Manpower
Service Rules
Recruitment Rules
Annual Report
RTI


---

21. State Job-Family Audit

Repeat the generic job-family discovery process for each state:

Assistant
Clerk
Officer
Inspector
Sub-Inspector
Constable
Typist
Stenographer
Auditor
Accountant
Guard
Warder
Driver
Revenue
Tax
Welfare
Labour
Employment
Development
Forest
Fire
Disaster
Information
Administrative
Field
Enforcement
Security
Other


---

22. State District Audit

Where practical, each state should be audited through:

District Portals
District Magistrate / Collectorate
Local Bodies
Panchayat Institutions
Municipal Institutions
District Recruitment Pages

This helps discover posts that central state portals do not expose clearly.


---

23. State Local Government

Local-government careers should remain separately classified from state-cadre government careers.

Possible entities:

Municipal Corporation
Municipality
Panchayat
Development Authority
Other Local Statutory Body


---

24. State Data Quality Threshold

A state should not be marked:

PRODUCTION

until it has passed minimum checks for:

Department Discovery
Designation Discovery
Recruitment Discovery
Eligibility Verification
Pay Verification
Source Verification
Currentness Review
Schema Validation
Reference Integrity

The precise threshold may evolve.


---

25. State Research Workflow

The recommended process is:

PHASE 1
Official department discovery

PHASE 2
Recruitment-authority discovery

PHASE 3
Designation / cadre discovery

PHASE 4
Service-rule discovery

PHASE 5
Qualification discovery

PHASE 6
Recruitment notification discovery

PHASE 7
Pay discovery

PHASE 8
District discovery

PHASE 9
Current recruitment review

PHASE 10
Eligibility audit

PHASE 11
Data validation

PHASE 12
Production release


---

26. State Eligibility Integration

The same Eligibility Engine should evaluate all states.

Conceptually:

Candidate Profile
      ↓
Government / State Context
      ↓
Applicable Rule
      ↓
Eligibility Engine
      ↓
Result

The eligibility engine should not contain:

if state == West Bengal

for every rule.

Instead it should consume structured state-specific rule data.


---

27. State Recommendation Integration

The Recommendation Engine should treat:

Central Government
West Bengal Government
Other State Governments

as structured career datasets.

The recommendation model should not be rewritten when a new state is added.


---

28. State Scoring

State-specific career data should provide the same conceptual career attributes where meaningful:

salary
authority
familyCompatibility
parentCareCompatibility
locationStability
transferBurden
workLife
housing
careerGrowth
physicalSafety
stress

Where a state lacks reliable evidence for a particular attribute:

UNKNOWN

must be used.


---

29. Cross-State Location Logic

Location suitability must remain candidate-specific.

For example:

Candidate prefers West Bengal

may lower compatibility of another State Government career.

This is a soft preference, not a legal ineligibility condition.


---

30. State Selector Behaviour

When the user selects an unavailable state:

Show:
State dataset not yet available.

Do not show:
invented jobs
placeholder government exams
fake salary data

The selector is allowed to be broader than the current database.


---

31. Search Behaviour

Search must support:

All supported states
Central Government
State Government
State name
Department
Exam
Post

Unavailable state datasets should not produce fabricated results.


---

32. Comparison Behaviour

Comparison should permit:

Central Government
vs
West Bengal Government
vs
Other State Government

provided actual datasets exist.

The UI must clearly identify different pay systems.


---

33. State Sources

Each state should have its own:

sources.json

while sharing the common source schema.

Sources must identify:

stateId
governmentId
organisation
title
URL
date
sourceType
confidence


---

34. State Historical Data

Historical state recruitment should remain clearly labelled.

For example:

ACTIVE

versus:

HISTORICAL

The database should not delete historical evidence simply because a new recruitment system appears.


---

35. State Versioning

Each state dataset should be independently versionable where practical.

Conceptually:

West Bengal data version
Maharashtra data version
Tamil Nadu data version

This improves update management.


---

36. State Release Gate

Before enabling a state in production:

Research Complete to Threshold
+
Source Audit Passed
+
Schema Passed
+
Eligibility Tests Passed
+
Recommendation Tests Passed
+
Search / Index Validation
+
UI Validation

then:

stateStatus = PRODUCTION


---

37. State Expansion and Internationalization

State expansion and language expansion are independent.

Adding:

Bengali

does not imply:

West Bengal only

and adding:

Maharashtra dataset

does not require:

Marathi interface

The two architectures remain separate.


---

38. State Expansion and AI

The AI assistant should determine available state data from structured metadata.

The AI must not imply:

complete Maharashtra data

if only a partial dataset exists.

AI responses should respect:

datasetStatus
confidence
source evidence


---

39. State Expansion Without Core Rewrites

The desired architecture is:

New State Dataset
       ↓
Existing Schemas
       ↓
Existing Loader
       ↓
Existing Validator
       ↓
Existing Eligibility Engine
       ↓
Existing Recommendation Engine
       ↓
Existing Scoring Engine
       ↓
Existing UI

Only genuinely state-specific data or rules should require new implementation.


---

40. State-Specific Exceptions

A state-specific implementation may be justified when:

the recruitment system is structurally unique;

the rule cannot be represented by the existing data model;

the official data format requires a special adapter;

a unique examination process exists.


Such exceptions must be documented.

They must not become the default architecture.


---

41. State Expansion Audit

For each new state create an audit record containing:

State
Department Coverage
Recruitment Authority Coverage
Designation Coverage
Qualification Coverage
Current Recruitment Coverage
Pay Coverage
District Coverage
Source Coverage
Eligibility Coverage
Currentness
Confidence
Open Gaps


---

42. State Expansion Priority

The project should add states progressively rather than attempting to launch every state simultaneously.

A sensible strategy is:

West Bengal
    ↓
Validate architecture
    ↓
Add next state
    ↓
Repeat

This keeps data quality manageable.


---

43. Future Union Territory Support

The architecture may later support Union Territories.

The same principles apply:

governmentId
jurisdictionId
jurisdictionType

should be capable of distinguishing:

STATE
UNION_TERRITORY
CENTRAL
LOCAL

where necessary.


---

44. No Artificial Uniformity

The platform must not force every state into identical:

exam patterns;

pay scales;

reservation rules;

recruitment authorities;

service ladders;

physical standards.


The common schema defines interoperability, not identical government systems.


---

45. Final State Expansion Principle

> GovCareer Compass should scale by adding verified state datasets, not by rewriting the application for every state. The common architecture provides structure; each state's official government system provides the actual rules and facts.



No mandatory repository-structure change is required by this Phase 6 specification. The existing `research/`, `data/`, `docs/`, `tests/`, and `.github/workflows/` structure is sufficient for the research-governance layer; these six documents establish the rules that the existing directories and validation workflow should follow.
