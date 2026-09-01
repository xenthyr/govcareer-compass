# GovCareer Compass — State Expansion Model

**File:** `/docs/STATE-EXPANSION-MODEL.md`  
**Document Type:** Canonical Multi-State Architecture Specification  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`

---

# 1. Purpose

GovCareer Compass is initially designed around:

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
