GovCareer Compass — Canonical Data Model

Document status: Permanent
Document version: 1.0.0
Initial product scope: Central Government + West Bengal Government
Initial interface languages: English + Bengali
Initial reference candidate: B.A. English Honours graduate
Research baseline: 31 August 2026

---

1. Purpose

This document defines the permanent conceptual data model for GovCareer Compass.

It establishes:

- what entities exist;
- how entities relate to each other;
- which information belongs to which entity;
- how facts are separated from analysis;
- how government systems remain separated;
- how sources are represented;
- how records remain current;
- how future states and languages can be added;
- how recommendation logic consumes the data.

This document is the conceptual contract.

The machine-readable contracts are maintained in:

/data/schemas/

---

2. Core Architectural Principle

The platform must distinguish between:

WHO / WHAT

HOW RECRUITED

WHAT QUALIFICATION IS REQUIRED

HOW MUCH IT PAYS

WHAT THE JOB INVOLVES

WHERE THE JOB IS LOCATED

HOW THE CAREER PROGRESSES

WHAT FAMILY/LIFESTYLE IMPLICATIONS EXIST

WHAT SOURCES SUPPORT THE CLAIM

These concepts must not be collapsed into one unstructured record.

---

3. Core Entity Model

The principal entities are:

1. State
2. Government
3. Department
4. Organisation
5. Service/Cadre
6. Post
7. Exam
8. Recruitment
9. Qualification
10. Pay
11. Location
12. Housing
13. Promotion
14. Benefits
15. Source
16. Assessment Question
17. Candidate Profile
18. Recommendation Rule
19. Ranking
20. Glossary Term

The first eight are the mandatory foundational entities requested for Day 3.

The additional entities are included because the final application architecture requires them.

---

4. Entity Relationship Model

The high-level relationship is:

State
  │
  └── Government Context
          │
          └── Department
                  │
                  └── Organisation
                          │
                          └── Service / Cadre
                                  │
                                  └── Post
                                          ├── Eligibility
                                          ├── Recruitment
                                          ├── Pay
                                          ├── Location
                                          ├── Housing
                                          ├── Promotion
                                          ├── Benefits
                                          ├── Lifestyle
                                          ├── Family Analysis
                                          └── Sources

Examinations are related separately:

Exam
  │
  └── Recruitment Route
          │
          └── Post

One examination may recruit several posts.

One post may have more than one historical/current recruitment route.

---

5. Stable Identifier Rules

Every primary entity must have a permanent machine-readable identifier.

Examples:

west-bengal
central-government
wbpsc
wbcs
kp-si
ssc-cgl

IDs must:

- be unique;
- be stable;
- be language-independent;
- not depend on display text;
- not contain spaces;
- not be changed merely because a name is translated.

A display-name correction does not automatically justify changing the ID.

---

6. Localization Rules

Every user-facing translatable name should support language-specific values.

Example:

{
  "name": {
    "en": "West Bengal",
    "bn": "পশ্চিমবঙ্গ"
  }
}

The canonical ID remains:

west-bengal

Official document titles may retain the original language/title supplied by the source.

Translations must not change legal or recruitment meaning.

---

7. State Entity

A State represents a geographic/political state-level government scope.

Minimum fields:

- "id"
- "name"
- "type"
- "enabled"
- "coverage"
- "lastVerified"

Possible coverage values:

ACTIVE
PLANNED
RESEARCHING
PARTIAL
TEMPORARILY_DISABLED

The initial active state is:

west-bengal

Other states may appear in the state selector as planned but must not be used for active recommendations until their dataset is enabled.

---

8. Government Entity

Government identifies the broad governing system.

Initial types:

CENTRAL
STATE
LOCAL
PSU
STATUTORY_BODY
AUTONOMOUS_BODY
OTHER

Examples:

central-government
state-government

Government type must never be inferred merely from the organisation name.

---

9. Department Entity

Department represents a formal government department or equivalent administrative authority.

Fields may include:

- "id"
- "governmentId"
- "stateId"
- "name"
- "type"
- "website"
- "officialDescription"
- "directorateIds"
- "organisationIds"
- "sourceIds"
- "status"
- "lastVerified"

A department is not necessarily identical to an organisation or directorate.

---

10. Organisation Entity

Organisation represents a subordinate, attached, statutory, policing, commission, board, directorate, authority, ministry office or other identifiable institutional unit.

Examples may include:

- a recruitment board;
- police organisation;
- directorate;
- attached office;
- railway organisation.

Fields:

- "id"
- "governmentId"
- "stateId"
- "departmentId"
- "name"
- "type"
- "website"
- "sourceIds"
- "status"

---

11. Service/Cadre Entity

A service or cadre represents a structured career/cadre context.

Examples:

- West Bengal Civil Service (Executive);
- West Bengal Police Service;
- a departmental cadre;
- a railway cadre.

A service/cadre is distinct from an individual post.

A post can be associated with a cadre.

A cadre may contain multiple ranks/posts.

---

12. Post Entity

The Post is the core career entity.

Examples:

Kolkata Police Sub-Inspector
Income Tax Inspector
Station Master
Postal Assistant

The Post record should contain the identity and relationships, while detailed information may be stored in referenced entities.

Minimum conceptual components:

Identity
Recruitment
Eligibility
Pay
Job Profile
Lifestyle
Location
Housing
Promotion
Benefits
Family Analysis
Sources
Confidence
Currentness

---

13. Service/Cadre vs Post vs Rank

These must remain distinct.

Service

A career/service system.

Cadre

An organised group of posts governed under a cadre structure.

Rank

A hierarchical position, particularly relevant to services such as police or uniformed organisations.

Post

The specific appointment/designation represented in the career database.

The website may display them together, but the underlying data model must preserve the distinctions.

---

14. Exam Entity

An Exam represents a recruitment examination or selection route.

Examples:

West Bengal Civil Service Examination
Staff Selection Commission Combined Graduate Level Examination
Civil Services Examination
Railway recruitment examination

An exam is not itself a job.

Minimum conceptual fields:

- "id"
- "name"
- "abbreviation"
- "authorityId"
- "governmentId"
- "stateId"
- "eligibility"
- "stages"
- "skillTests"
- "physicalRequirements"
- "syllabus"
- "frequency"
- "currentStatus"
- "recruitmentIds"
- "sourceIds"
- "lastVerified"

---

15. Recruitment Entity

Recruitment is the actual mechanism or recruitment event connecting an authority/exam with one or more posts.

The system must distinguish:

CAREER EXISTS

from:

CURRENT RECRUITMENT EXISTS

A career may exist even when no recruitment is open.

Possible recruitment modes:

DIRECT_RECRUITMENT
PROMOTION
DEPUTATION
TRANSFER
CONTRACT
TEMPORARY
SCHEME_PROJECT
OUTSOURCED
OTHER

Possible recruitment statuses:

OPEN
CLOSED
UNDER_PROCESS
RECENTLY_COMPLETED
EXPECTED_PERIODIC
IRREGULAR
HISTORICAL
CANCELLED
NOT_VERIFIED

---

16. Recruitment History

Recruitment records should preserve historical information rather than overwrite it.

For example:

Post:
Example Post

Recruitment 2024:
closed

Recruitment 2026:
open

Career status:
active

This allows the platform to show both career continuity and current recruitment.

---

17. Qualification Entity

Qualification represents educational or professional requirements.

Education level examples:

CLASS_8
CLASS_10
CLASS_12
DIPLOMA
GRADUATE
POSTGRADUATE
PROFESSIONAL
OTHER

Qualification details may include:

- degree;
- subject;
- marks;
- institution recognition;
- required subjects;
- experience;
- professional credentials.

---

18. Candidate Qualification Representation

The user's profile should not be encoded as a government-job record.

A candidate profile should contain attributes such as:

highestEducationLevel
degrees
subjects
professionalQualifications
languages
typing
computerKnowledge
drivingLicence
experience
physicalEligibility

The baseline development profile is:

Bachelor of Arts
English Honours
No additional specialist qualification assumed

---

19. Eligibility Classification

The platform must use:

A — DIRECTLY_ELIGIBLE
B — CONDITIONALLY_ELIGIBLE
C — NOT_ELIGIBLE

These are application classifications.

They must not be represented as if they were official government labels unless an official source uses those exact labels.

---

20. Eligibility Rule Structure

Conditions may be represented using structured rule objects.

Examples:

MATHEMATICS_IN_12
STATISTICS_REQUIRED
BENGALI_REQUIRED
TYPING_REQUIRED
SHORT_HAND_REQUIRED
COMPUTER_PROFICIENCY_REQUIRED
DRIVING_LICENCE_REQUIRED
PHYSICAL_STANDARD_REQUIRED
MEDICAL_STANDARD_REQUIRED
EXPERIENCE_REQUIRED
PROFESSIONAL_DEGREE_REQUIRED
DOMICILE_REQUIRED

---

21. Higher Qualification / Overqualification

For lower-entry posts, the system must separately record:

HIGHER_QUALIFICATION_ALLOWED
HIGHER_QUALIFICATION_NOT_ADDRESSED
HIGHER_QUALIFICATION_RESTRICTED
EXACT_QUALIFICATION_REQUIRED
CURRENT_NOTIFICATION_REQUIRED

The application must never assume that a graduate can automatically apply for a lower-entry post.

---

22. Pay Entity

Pay must always be linked to a specific pay system.

Example:

West Bengal Government Pay System

versus:

Central Government 7th CPC

The data model must never use an isolated field such as:

payLevel: 10

without the originating pay system.

---

23. Pay Components

A pay record may contain:

- pay system;
- level;
- starting basic;
- maximum basic;
- DA;
- HRA;
- transport allowance;
- special allowance;
- other regular allowances;
- deductions;
- NPS/retirement contribution;
- estimated gross;
- estimated take-home.

Each value must identify whether it is:

OFFICIAL
CALCULATED
ESTIMATED
NOT_VERIFIED

---

24. Salary Concepts

The system must preserve:

STARTING_BASIC
GROSS
DEDUCTIONS
TAKE_HOME_ESTIMATE

These are not interchangeable.

The website must never label a basic-pay figure as “salary received”.

---

25. Location Entity

Location information may describe:

- city;
- district;
- state;
- metropolitan;
- rural;
- remote;
- all-India;
- ministry/Delhi-heavy;
- headquarters;
- likely posting pattern.

Location must not be invented from assumptions.

---

26. Location Stability

Analytical fields may include:

kolkataStability
stateStability
geographicStability
ruralBurden
remoteBurden
transferBurden

These are analytical assessments, not official entitlements.

---

27. Housing Entity

Housing information must distinguish:

ENTITLEMENT
ELIGIBILITY
AVAILABILITY
ALLOTMENT
PRACTICAL_LIKELIHOOD

Possible accommodation types:

GOVERNMENT_QUARTER
DEPARTMENTAL_QUARTER
POLICE_HOUSING
RAILWAY_QUARTER
BARRACK
HOSTEL
OTHER
NONE

Housing records may include:

- licence fee;
- HRA effect;
- utility cost;
- maintenance;
- allotment system;
- vacancy dependence;
- waiting list information where verified.

---

28. Promotion Entity

Promotion must model:

- next designation;
- required qualifying service where officially specified;
- promotion method;
- seniority;
- selection;
- departmental examination;
- vacancy dependence;
- training;
- uncertainty.

The model must allow:

UNKNOWN

when a reliable current promotion route has not been publicly verified.

---

29. Benefits Entity

Benefits may include:

- retirement framework;
- pension framework;
- gratuity;
- family benefits;
- leave;
- medical;
- insurance;
- employee welfare;
- travel-related benefits;
- accommodation-related benefits.

Benefits should be tagged with:

- source;
- date;
- applicable service/appointment conditions.

---

30. Lifestyle Entity

Lifestyle records may contain:

- desk/field ratio;
- public interaction;
- computer use;
- investigation;
- inspection;
- legal work;
- accounts work;
- supervision;
- night duty;
- shift duty;
- holiday duty;
- emergency duty;
- court work;
- travel.

---

31. Work-Life Scoring

The system should store separate values for:

workLifeScore
predictabilityScore
nightDutyBurden
holidayDutyBurden
emergencyDutyBurden
travelBurden

Positive suitability and burden values must not be confused.

---

32. Family Analysis

Family analysis may include:

- family compatibility;
- spouse compatibility;
- childcare compatibility;
- parent-care compatibility;
- festival availability;
- emergency availability;
- geographic stability.

These are analytical assessments.

They must never be represented as government-guaranteed conditions.

---

33. Authority Analysis

Authority data should distinguish:

administrativeAuthority
policeAuthority
investigationAuthority
enforcementAuthority
financialAuthority
inspectionAuthority
supervisoryAuthority
statutoryPowers
publicDecisionMaking

Do not collapse all authority into one number without preserving the component dimensions.

---

34. Physical / Medical Data

A post may contain:

- height;
- chest;
- running;
- walking;
- cycling;
- physical efficiency test;
- physical measurement test;
- medical category;
- eyesight;
- gender-specific standards.

Each should include applicability:

ALL
MALE
FEMALE
CATEGORY_SPECIFIC
POST_SPECIFIC

Unknown values must remain explicitly unknown.

---

35. Research Confidence

Each important entity should carry confidence metadata.

Suggested values:

HIGH
MEDIUM_HIGH
MEDIUM
LOW
ESTIMATE
NOT_VERIFIED

Confidence refers to evidence quality.

It does not mean that the government itself is “uncertain”.

---

36. Information Type

Important facts should support an information-type label:

OFFICIAL_FACT
HISTORICAL_FACT
CURRENT_ESTIMATE
PRACTICAL_ASSESSMENT
SECONDARY_SOURCE
NOT_PUBLICLY_VERIFIED

This label should be visible to the user where relevant.

---

37. Source Entity

Every source is a first-class entity.

Minimum fields:

- "id"
- "organisation"
- "title"
- "documentType"
- "publicationDate"
- "verificationDate"
- "url"
- "sourcePriority"
- "confidence"
- "currentness"
- "supportedClaims"

A source may support multiple posts.

A post may reference multiple sources.

---

38. Source-to-Claim Relationship

The ideal model is not:

post → one source

but:

post
 ├── eligibility source
 ├── pay source
 ├── physical source
 ├── housing source
 ├── promotion source
 └── recruitment source

This allows each claim to be supported by the most relevant document.

---

39. Assessment Question Entity

An assessment question represents a question displayed to the candidate.

It should include:

- "id"
- "type"
- "question"
- "helpText"
- "required"
- "options"
- "validation"
- "branching"
- "profileField"
- "version"

Examples:

education level
salary importance
family importance
parent care importance
location importance
transfer tolerance
night duty tolerance
physical-risk tolerance
authority importance
work-life importance

---

40. Candidate Profile Entity

Candidate profile represents the information required for eligibility and matching.

It must be separated from assessment questions.

Questions collect information.

The profile stores the normalized answers.

---

41. Recommendation Rule Entity

Recommendation rules determine how candidate profile data interacts with career characteristics.

Rules should distinguish:

HARD_RULE

from:

SOFT_RULE

Hard rules affect eligibility.

Soft rules affect suitability.

---

42. Ranking Entity

A ranking is a calculated output.

It must contain:

- career ID;
- score;
- ranking model version;
- input profile;
- score components;
- explanation;
- conflicts.

Rankings are not permanent facts.

They are generated analytical outputs.

---

43. Data Versioning

Every production record should support:

createdAt
updatedAt
lastVerified
dataVersion

A major model change should increase the relevant version.

---

44. Currentness

Currentness may use:

CURRENT
HISTORICAL
CURRENT_WITH_HISTORICAL_SUPPORT
REPLACED
ABOLISHED
NOT_VERIFIED

Currentness must be determined independently from recruitment frequency.

---

45. Current Recruitment vs Career Existence

Example conceptual distinction:

Post:
ACTIVE_CAREER

and:

Recruitment:
CLOSED

Both can be true simultaneously.

---

46. Direct Entry vs Promotion/Deputation

The platform should always expose recruitment mode.

For the primary Career Finder:

DIRECT_RECRUITMENT

is the default fresh-entry universe.

Promotion/deputation records may remain available for career ladders and reference but must not be silently treated as fresh recruitment.

---

47. Central vs State Data

Central Government data belongs under:

/data/central/

State-specific data belongs under:

/data/states/<state-id>/

Common reference information belongs under:

/data/common/

---

48. No Manual Duplicate Master Database

Do not create separate manually maintained:

data/jobs.json
data/exams.json

as a second copy of all state and Central records.

Canonical records live in their respective government/state packs.

Indexes are derived.

---

49. Future State Expansion

Adding a state should require:

new state registry entry
+
new state data package
+
research
+
validation
+
activation

not a rewrite of the recommendation engine.

---

50. Future Language Expansion

Adding a language should require:

translation catalogue
+
terminology review
+
validation
+
enablement

not new data IDs or duplicated business logic.

---

51. Database Loading

The database loader should:

1. load common data;
2. detect enabled states;
3. load active government packs;
4. normalize records;
5. validate references;
6. build indexes;
7. expose a unified read model to the application.

---

52. Referential Integrity

References must point to existing IDs.

Examples:

job.departmentId

must exist in the appropriate department dataset.

job.sourceIds[]

must reference existing source records.

Broken references should be validation errors.

---

53. Duplicate Prevention

The following must be unique within their relevant namespace:

- entity ID;
- source ID;
- exam ID;
- post ID;
- department ID;
- organisation ID.

Similarity of names does not determine duplication.

---

54. Search Representation

Search should index:

- English name;
- Bengali name;
- abbreviation;
- department;
- organisation;
- exam;
- category;
- qualification;
- location;
- selected job-description text;
- source title;
- keywords.

Search indexes are derived and may be rebuilt.

---

55. Analytical Score Boundaries

All normal analytical scores use:

0–10

unless a specific model defines another scale.

The meaning of the direction must be recorded.

Examples:

familyCompatibility:
10 = highly compatible

stressBurden:
10 = highly stressful

---

56. Salary Estimates

Salary estimates may depend on:

- posting;
- HRA;
- accommodation;
- applicable allowances;
- deductions;
- tax;
- retirement contributions.

Therefore the data model should support assumptions.

Never represent an estimated take-home value as an official figure.

---

57. Household Affordability

Household affordability is analytical.

It must never be stored as an intrinsic property of a government post.

Instead:

Candidate profile
+
salary estimate
+
household assumptions
=
affordability result

---

58. Family Scores

Family and parent-care scores depend partly on candidate preferences.

The career record should provide objective/analytical attributes.

The recommendation system should combine those attributes with the user's weight.

This avoids treating family compatibility as universally identical for every person.

---

59. Example Conceptual Job Record

{
  "id": "example-job",
  "identity": {
    "governmentId": "state-government",
    "stateId": "west-bengal",
    "departmentId": "example-department",
    "organisationId": "example-organisation",
    "serviceCadreId": "example-cadre",
    "post": {
      "en": "Example Post",
      "bn": "উদাহরণ পদ"
    }
  },

  "recruitment": {
    "routeIds": ["example-recruitment"],
    "mode": "DIRECT_RECRUITMENT",
    "status": "ACTIVE_CAREER"
  },

  "eligibility": {
    "educationLevel": "GRADUATE",
    "classification": "A",
    "conditions": []
  },

  "pay": {
    "payProfileId": "example-pay"
  },

  "lifestyle": {
    "workLifeScore": 7,
    "stressBurden": 5,
    "riskBurden": 2
  },

  "location": {
    "locationProfileId": "example-location"
  },

  "housing": {
    "housingProfileId": "example-housing"
  },

  "promotion": {
    "promotionProfileId": "example-promotion"
  },

  "benefits": {
    "benefitProfileId": "example-benefits"
  },

  "analysis": {
    "familyCompatibilityBase": 8,
    "parentCareCompatibilityBase": 8,
    "englishAdvantage": "MODERATE"
  },

  "sourceIds": ["example-source"],

  "confidence": "HIGH",
  "currentness": "CURRENT_WITH_HISTORICAL_SUPPORT",
  "lastVerified": "2026-08-31",
  "dataVersion": "1.0.0"
}

This is a structural example only. It must not be used to invent government facts.

---

60. Permanent Data Principle

The data model must allow the website to answer:

Can I apply?
Why?
What qualification is missing?
What will I earn?
Where can I be posted?
What work will I actually do?
How predictable is the job?
What is the physical requirement?
How much authority exists?
What is the promotion route?
What housing may be available?
What does family life look like?
What supports these claims?
How current is this information?

without requiring the application to reconstruct facts from prose.

---

61. Model Stability Rule

Before adding a new top-level field, determine whether the information belongs to an existing entity.

Do not add duplicate fields because a UI component needs a different display format.

The data model should represent the underlying concept once and allow multiple views.

---

62. Final Canonical Rule

«The database describes government careers. The rule engine determines eligibility. The recommendation engine evaluates fit. The UI presents the result. The source system establishes evidence.»
