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
