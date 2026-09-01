# GovCareer Compass — Eligibility Model

**File:** `/docs/ELIGIBILITY-MODEL.md`  
**Document Type:** Canonical Product and Data-Logic Specification  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`  
**Applies To:** Career Finder, Eligibility Checker, Career Results, Job Explorer, Exam Explorer, Recommendation Engine  
**Primary Runtime Module:** `/js/recommendation/eligibility-engine.js`

---

# 1. Purpose

The GovCareer Compass Eligibility Model defines the complete logic used to determine whether a candidate may be considered eligible for a specific government examination, recruitment route, service, cadre, or post.

The primary question answered by this model is:

> **"Based on the candidate profile and the applicable verified recruitment requirements, can this candidate potentially apply for this opportunity?"**

This model is deliberately separate from career recommendation.

A candidate may:

- be eligible for a job but dislike its working conditions;
- be highly interested in a career but fail a mandatory qualification;
- satisfy the academic qualification but fail a physical standard;
- satisfy all currently known requirements but have one condition that still needs verification;
- be interested in an opportunity for which no current recruitment is open.

Therefore the system must never collapse all of these situations into a single generic "recommended" or "not recommended" result.

---

# 2. Core Architectural Principle

GovCareer Compass uses the following separation:

HARD ELIGIBILITY
        ↓
Can the candidate potentially pursue this opportunity?

SOFT PREFERENCE
        ↓
Does this opportunity fit the candidate's priorities?

RECOMMENDATION
        ↓
How strongly should this opportunity be presented to this candidate?

The three concepts are related but are not interchangeable.

The most important permanent rule is:

> Preference can change ranking. Preference cannot override a failed mandatory eligibility requirement.




---

3. Eligibility Is Opportunity-Specific

Eligibility must always be evaluated against a specific opportunity.

The following entities must remain distinct:

Government
    ↓
Ministry / Department
    ↓
Organisation
    ↓
Service / Cadre
    ↓
Post / Rank / Designation
    ↓
Recruitment Route
    ↓
Examination
    ↓
Recruitment Notification / Rule Version

The system must not infer that:

same examination = same eligibility

or:

same department = same qualification

or:

same designation name = same service/cadre

The canonical identifier of the opportunity must be used whenever possible.


---

4. What Counts as Hard Eligibility

Hard eligibility consists of requirements that can formally determine whether a candidate can apply or be considered for the recruitment.

Hard eligibility may include:

minimum educational level;

minimum academic qualification;

exact degree;

degree discipline;

graduation subject;

subject combination;

Class 10 subject requirement;

Class 12 subject requirement;

minimum marks;

honours/major requirement;

postgraduate qualification;

professional qualification;

teacher-education qualification;

technical qualification;

Industrial Training Institute (ITI) qualification;

specific ITI trade;

diploma;

engineering qualification;

law qualification;

medical qualification;

nursing qualification;

pharmacy qualification;

professional registration;

professional licence;

experience;

post-qualification experience;

language qualification;

typing;

shorthand;

computer qualification or formally required computer proficiency;

driving licence;

age;

nationality/citizenship;

domicile/residence;

category-related requirements;

gender-specific eligibility where expressly prescribed;

physical standards;

Physical Efficiency Test;

medical standards;

other recruitment-specific mandatory conditions.


Only verified recruitment evidence should be used to establish a hard requirement.


---

5. What Is Soft Preference

Soft preference represents what the candidate wants rather than what the recruitment authority legally requires.

Examples:

preferred government;

preferred state;

preferred salary;

desired authority;

prestige importance;

family importance;

parent-care importance;

desire to remain near home;

Kolkata preference;

transfer tolerance;

night-duty tolerance;

shift-duty tolerance;

physical-risk preference;

work-life balance;

career-growth importance;

housing importance;

office/field preference;

public-interaction preference;

willingness to prepare for difficult examinations.


Soft preference is handled by:

/js/recommendation/preference-engine.js
/js/recommendation/scoring-engine.js
/js/recommendation/ranking-engine.js

It is not part of the legal eligibility decision.


---

6. Eligibility Result States

The eligibility engine must support the following states.

ELIGIBLE

All mandatory conditions that can currently be evaluated are satisfied.

Interpretation:

> Based on the currently loaded and verified requirements and the information provided by the candidate, no known mandatory eligibility condition is unsatisfied.



This does not mean:

application acceptance is guaranteed;

examination success is guaranteed;

appointment is guaranteed;

document verification is guaranteed;

medical clearance is guaranteed where not yet assessed;

a current vacancy is open.



---

CONDITIONALLY_ELIGIBLE

The candidate appears potentially eligible but one or more conditions remain unresolved, dependent on timing, documentation, completion, or another specific condition.

Examples:

qualification must be completed by the cutoff date;

exact marks need confirmation;

current subject condition needs verification;

a required certificate is pending;

experience needs documentary verification.


The result must explicitly identify the condition.


---

UNKNOWN

The system cannot make a reliable eligibility decision because necessary information is missing or the applicable rule cannot currently be evaluated.

Examples:

subject information not supplied;

age cutoff cannot yet be evaluated;

category information required but unavailable;

professional qualification not entered;

recruitment-specific rule is incomplete.


UNKNOWN must never silently become ELIGIBLE.


---

NOT_ELIGIBLE

At least one verified mandatory requirement is not satisfied.

The system must identify the specific failed requirement.

Example:

NOT_ELIGIBLE

Failed requirement:
Bachelor of Education (B.Ed.) is mandatory.

Candidate profile:
B.Ed. not present.


---

NOT_APPLICABLE

A particular requirement or rule does not apply to the opportunity being evaluated.

This is useful internally when combining rule modules.

It should not normally appear as a primary candidate outcome.


---

7. Hard Requirement Evaluation

Every mandatory condition should conceptually evaluate to:

PASS
FAIL
UNKNOWN
NOT_APPLICABLE

The overall result follows a conservative logic.

Example:

Education       PASS
Subject         PASS
B.Ed.           PASS
Age             PASS
Physical        UNKNOWN
Medical         PASS

Overall:

UNKNOWN

if physical suitability is a mandatory unresolved condition.

Another example:

Education       PASS
Subject         FAIL
B.Ed.           PASS
Age             PASS

Overall:

NOT_ELIGIBLE

A single verified mandatory failure is sufficient to make the opportunity ineligible.


---

8. Evaluation Priority

The engine should evaluate rules in a logical sequence:

1. Identify opportunity
2. Identify applicable recruitment rule
3. Identify effective rule version
4. Evaluate education
5. Evaluate degree
6. Evaluate subject requirements
7. Evaluate additional qualifications
8. Evaluate experience
9. Evaluate skills / licences
10. Evaluate language requirements
11. Evaluate age
12. Evaluate citizenship / domicile
13. Evaluate reservation/category conditions
14. Evaluate physical standards
15. Evaluate medical requirements
16. Evaluate recruitment-route conditions
17. Aggregate result
18. Generate explanation
19. Attach evidence and confidence

The exact internal execution order may vary where dependencies exist, but the hard/soft separation must remain intact.


---

9. Candidate Profile Requirements

The eligibility engine consumes a normalized candidate profile.

The profile should be capable of representing:

Education
Degree
Honours / Major
Subjects
Marks where relevant
Additional qualifications
Professional qualifications
Technical qualifications
ITI trades
Licences
Registrations
Skills
Experience
Languages
Age / DOB
Citizenship
Gender where required
Reservation category
Domicile / residence
Physical profile
Medical information where appropriately collected

The profile must not assume the candidate possesses a qualification merely because it has not been entered.


---

10. Education Model

Education must be multi-dimensional.

The system should distinguish:

Educational Level
Degree
Discipline
Subject
Subject Level
Professional Qualification
Technical Qualification

Examples:

Class 12
Bachelor's Degree
B.A.
B.A. English
B.A. English Honours
M.A. English
ITI
Diploma
B.Ed.
D.El.Ed.

These are not interchangeable.


---

11. Higher Qualification Does Not Automatically Satisfy Specialist Qualification

The system must never implement the simplistic rule:

Higher education
    ↓
Automatically satisfies every lower qualification

Instead:

Candidate qualification
        ↓
Compare with exact recruitment requirement
        ↓
Check equivalence rule
        ↓
Check subject / discipline condition
        ↓
Determine result

Example:

B.A. English Honours

does not automatically imply possession of:

B.Ed.
D.El.Ed.
B.Com.
B.Tech.
LL.B.
ITI
Engineering Diploma
specific professional registration


---

12. Lower Educational Entry Levels

The database may contain jobs with minimum requirements of:

Class 8;

Class 10;

Class 12;

diploma;

ITI;

graduate;

postgraduate;

professional qualification.


For lower-level recruitment, the system must separately evaluate whether a candidate with a higher qualification is allowed to apply.

Supported policy concepts include:

HIGHER_QUALIFICATION_ALLOWED
HIGHER_QUALIFICATION_NOT_RESTRICTED
EXACT_QUALIFICATION_ONLY
HIGHER_QUALIFICATION_RESTRICTED
UNKNOWN

The application must not invent the overqualification policy.


---

13. Subject-Specific Eligibility

Subject requirements must be represented explicitly.

Potential forms include:

EXACT_SUBJECT
ANY_ONE_OF_SUBJECTS
ALL_REQUIRED_SUBJECTS
SUBJECT_AT_CLASS_10
SUBJECT_AT_CLASS_12
SUBJECT_AT_GRADUATION
SUBJECT_AT_POSTGRADUATION
SPECIFIED_SUBJECT_COMBINATION
MINIMUM_SUBJECT_MARK
SUBJECT_STUDY_DURATION

Example:

Mathematics at Higher Secondary

is not the same as:

Mathematics studied in graduation

The level at which the subject was studied must be preserved.


---

14. Marks-Based Eligibility

Where a recruitment requires minimum marks, the engine must support:

total percentage;

degree percentage;

subject percentage;

Class 10 percentage;

Class 12 percentage;

category-specific threshold;

minimum marks in a specified subject.


Marks must be evaluated against the applicable recruitment cutoff.

If the candidate has not entered the required marks:

UNKNOWN

should normally be returned rather than assuming the minimum requirement is satisfied.


---

15. Teacher-Education Qualifications

The system must support teacher-related qualifications independently.

Examples include:

Bachelor of Education (B.Ed.);

Diploma in Elementary Education (D.El.Ed.);

Bachelor of Elementary Education;

recognised special-education qualifications;

other officially recognised teacher-training qualifications.


Teacher eligibility must be evaluated against the exact recruitment pathway.

The system must never assume:

B.Ed. = every teaching post

or:

D.El.Ed. = every primary-teaching post

The relevant recruitment rule controls.


---

16. Technical Qualifications and ITI

The system must support:

Technical Qualification
        ↓
Specific Qualification
        ↓
Specific Trade where applicable

ITI must be trade-aware.

Example:

Required:
ITI Electrician

must not automatically accept:

ITI Fitter

unless the authoritative recruitment rule explicitly accepts both.

The same principle applies to technical diplomas and engineering qualifications.


---

17. Licences and Registrations

Some recruitment opportunities may require:

driving licence;

professional licence;

statutory registration;

other formal registration.


These must be modeled separately from academic qualification.

Example:

Degree = PASS
Driving Licence = FAIL

may result in:

NOT_ELIGIBLE

if driving licence is a mandatory recruitment requirement.


---

18. Skills

Skills may be:

Soft

Examples:

general computer comfort;

general communication.


Hard, when formally prescribed

Examples:

qualifying typing speed;

shorthand speed;

specified computer certificate;

driving ability demonstrated through a required test.


The system must distinguish self-reported comfort from formal qualification standards.


---

19. Experience

Experience rules must support:

minimumDuration
experienceType
relevantField
postQualification
organisationType
cutoffDate
otherRestrictions

The system must not treat any employment as automatically relevant.


---

20. Language Requirements

Language requirements may concern:

reading;

writing;

speaking;

formal qualification;

subject studied;

language certificate;

language test;

residence-linked language requirements.


Self-reported fluency must not automatically satisfy a formal certificate or subject requirement.


---

21. Age

Age eligibility must be evaluated using the recruitment's own cutoff date.

The system should support:

dateOfBirth
minimumAge
maximumAge
ageCutoffDate
relaxationRules

Potential relaxation categories may include those explicitly recognised by the applicable recruitment authority.

The system must not assume that one organisation's relaxation rules apply to another.


---

22. Citizenship / Nationality

Where required, citizenship/nationality must be evaluated independently.

The system must not infer citizenship from:

selected state;

education location;

language;

current residence.



---

23. Domicile and Residence

Domicile/residence may be:

No Special Requirement
State Domicile
District Domicile
Regional Requirement
Residence Requirement
Language-linked Requirement
Other
Unknown

A user's preference to work in West Bengal does not establish West Bengal domicile.

Likewise, living in Kolkata does not automatically satisfy every state-specific requirement.


---

24. Reservation and Category

The eligibility engine must keep reservation data jurisdiction-aware.

For example:

Central Government rules

must not automatically be applied to:

West Bengal Government recruitment

The engine should support the appropriate category and relaxation framework for the recruitment being evaluated.


---

25. Physical Eligibility

Where applicable, physical requirements may include:

height;

chest;

weight;

running;

walking;

cycling;

physical efficiency;

eyesight;

hearing;

colour perception;

medical category;

other formally defined standards.


The system must distinguish:

Physical Standard
Physical Efficiency Test
Medical Examination

These are separate requirements.


---

26. Medical Eligibility

Medical requirements must be modeled independently from academic eligibility.

A candidate may therefore be:

Academically eligible
+
Physical test eligible
+
Medical condition unresolved

which should produce an appropriate conditional or unknown result rather than a false positive.

Medical information should be handled carefully and only where required by the actual evaluation workflow.


---

27. Gender-Specific Conditions

Gender-specific rules must only be applied when explicitly established by the applicable recruitment rules.

The system must not infer:

different height requirements;

gender restrictions;

gender-specific posts;

gender-specific eligibility;


from general assumptions.


---

28. Recruitment Route

Every opportunity must identify its recruitment route.

Supported conceptual values include:

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

Primary candidate opportunities should focus on routes genuinely open to external applicants.

Promotion-only and deputation-only positions should not be presented as ordinary fresh-entry careers.


---

29. Permanent vs Temporary vs Contractual

The eligibility model must not silently treat:

Regular Government Service

as equivalent to:

Contractual Project Employment

or:

Outsourced Employment

Employment type is therefore a separate opportunity attribute.


---

30. Current Recruitment vs Career Existence

Two separate questions must exist:

Is the candidate eligible for this career/recruitment type?

and:

Is recruitment currently open?

A closed recruitment can remain a valid recurring career path.

Therefore:

Eligibility

and:

Current Vacancy Status

must not be merged.


---

31. Current vs Historical Rules

Government rules may change over time.

The system must preserve:

ruleVersion
effectiveFrom
effectiveTo
status
sourceIds

Historical information may be retained for research and auditing.

However:

> When evaluating current eligibility, the currently applicable verified rule takes precedence over an obsolete rule.




---

32. Evidence Priority

Where multiple sources exist, the preferred hierarchy is:

Current Official Recruitment Notification
        ↓
Current Official Recruitment Rule / Regulation
        ↓
Current Gazette / Government Order
        ↓
Applicable Service Rule
        ↓
Official Departmental Record
        ↓
Historical Official Notice
        ↓
Reputable Secondary Source
        ↓
Unverified Source

The database must preserve source references rather than relying on unsupported narrative.


---

33. Conflict Resolution

If sources conflict:

1. identify the conflicting claims;


2. check publication dates;


3. check whether one is historical;


4. check the applicable cadre/post;


5. check whether a newer rule supersedes the older rule;


6. prefer the applicable authoritative source;


7. record the resolution;


8. lower confidence when necessary.



The application must not silently select one conflicting value without documenting the reason.


---

34. Eligibility Confidence

Eligibility confidence represents confidence in the decision evidence, not confidence in the candidate.

Suggested values:

HIGH
MEDIUM_HIGH
MEDIUM
LOW
NOT_VERIFIED

Example:

Eligibility:
ELIGIBLE

Confidence:
MEDIUM_HIGH

This may occur when the relevant current rule is available but some secondary detail remains less certain.


---

35. Explanation Requirements

Every candidate-facing eligibility decision must be explainable.

The result should expose:

Passed Requirements
Failed Requirements
Unknown Requirements
Conditional Requirements
Source References
Confidence

Example:

Eligible

Why:
✓ Bachelor's degree requirement satisfied.
✓ Required subject condition satisfied.
✓ No additional professional qualification required.

Important:
Final eligibility is controlled by the current official recruitment notification.


---

36. Example — B.A. English Without B.Ed.

Candidate:

B.A. English Honours
No B.Ed.

Opportunity:

Recruitment requiring B.Ed.

Result:

NOT_ELIGIBLE

This remains true even if the candidate states:

Teaching interest = very high
Salary importance = very high
Prestige importance = very high

Those are soft preferences and cannot override the mandatory B.Ed. requirement.


---

37. Example — B.A. English With B.Ed.

Candidate:

B.A. English Honours
B.Ed.

Opportunity:

Teaching recruitment

The system must still evaluate:

Relevant subject
Required marks
Required eligibility test
Applicable age
Other recruitment conditions

Possessing B.Ed. alone does not automatically produce ELIGIBLE.


---

38. Example — ITI

Candidate:

ITI Electrician

Opportunity:

Recruitment requiring accepted Electrician trade

Potential result:

ELIGIBLE

if all other conditions are also satisfied.

Candidate:

ITI Fitter

for an Electrician-only recruitment:

NOT_ELIGIBLE

unless the authoritative rule explicitly accepts Fitter as an equivalent/accepted trade.


---

39. Unknown Information

Suppose a recruitment requires:

Mathematics at Class 12

and the candidate has not answered the Class 12 Mathematics question.

The engine must return:

UNKNOWN

or an equivalent "information required" condition.

It must not assume:

BA graduate → Mathematics satisfied


---

40. Hard Eligibility and Soft Preference Interaction

Correct:

Hard eligibility
    ↓
Candidate qualifies

Soft preference
    ↓
Career fit is high

Incorrect:

Candidate strongly wants the career
    ↓
Therefore candidate qualifies


---

41. Eligibility Engine Responsibilities

The primary module:

/js/recommendation/eligibility-engine.js

should eventually perform functions conceptually equivalent to:

loadCandidateProfile()
loadOpportunity()
loadApplicableRules()
resolveRuleVersion()

evaluateEducation()
evaluateDegree()
evaluateSubjects()
evaluateMarks()
evaluateProfessionalQualifications()
evaluateTechnicalQualifications()
evaluateITITrades()
evaluateSkills()
evaluateLicences()
evaluateExperience()
evaluateLanguages()
evaluateAge()
evaluateCitizenship()
evaluateDomicile()
evaluateReservation()
evaluatePhysical()
evaluateMedical()
evaluateRecruitmentRoute()

aggregateRequirementResults()
calculateOverallEligibility()
buildExplanation()
attachEvidence()
calculateConfidence()


---

42. Data Dependencies

The Eligibility Model depends on:

/data/common/
    qualifications.json
    categories.json
    governments.json
    states.json
    locations.json
    statuses.json
    confidence-levels.json
    source-types.json

/data/assessment/
    questions.json
    options.json
    branching.json
    profile-fields.json
    response-scoring.json

/data/central/
    jobs.json
    exams.json
    departments.json
    organisations.json
    recruitment.json
    sources.json

/data/states/west-bengal/
    jobs.json
    exams.json
    departments.json
    organisations.json
    recruitment.json
    sources.json

/data/schemas/
    relevant eligibility/data schemas

As the system expands, additional controlled vocabularies may be added without changing the fundamental model.


---

43. Testing Requirements

The eligibility test suite must include:

General Degree

B.A. English
+
any recognised bachelor's degree required
→ ELIGIBLE

subject to all other conditions.

Specialist Degree

B.A. English
+
specific technical/statistical/etc. degree required
→ NOT_ELIGIBLE

unless an accepted equivalence exists.

B.Ed.

B.A. English
+
B.Ed. required
+
B.Ed. absent
→ NOT_ELIGIBLE

D.El.Ed.

D.El.Ed. required
+
D.El.Ed. absent
→ NOT_ELIGIBLE

ITI Trade

specific ITI trade required
+
different trade
→ NOT_ELIGIBLE

unless formally accepted.

Unknown Subject

subject required
+
subject information absent
→ UNKNOWN

Age

age requirement
+
DOB unavailable
→ UNKNOWN

Physical

academic PASS
+
mandatory physical requirement FAIL
→ NOT_ELIGIBLE

Historical Rule

historical rule = PASS
current applicable rule = FAIL
→ NOT_ELIGIBLE


---

44. Acceptance Criteria

The Eligibility Model is correctly implemented only when:

hard eligibility is distinct from soft preference;

every opportunity has an identifiable recruitment context;

general degrees and specialist qualifications are separated;

subject requirements are supported;

marks requirements are supported;

additional qualifications are supported;

B.Ed. and D.El.Ed. can be evaluated independently;

ITI trades can be evaluated independently;

technical qualifications can be evaluated;

licences and registrations can be evaluated;

experience can be evaluated;

language requirements can be evaluated;

age is cutoff-date aware;

domicile can be evaluated;

reservation is jurisdiction-aware;

physical requirements can be evaluated;

medical requirements can be evaluated;

recruitment routes can be distinguished;

current and historical rules can coexist;

unknown information remains unknown;

every major result is explainable;

evidence can be attached;

preference never overrides a mandatory failure;

lower-qualification opportunities account for overqualification rules;

promotion/deputation-only posts are not falsely treated as fresh-entry recruitment.



---

45. Final Non-Negotiable Rule

> The GovCareer Compass Eligibility Engine determines whether the candidate appears to satisfy the applicable recruitment requirements. It does not decide whether the career is desirable, prestigious, suitable for family life, or worth preparing for. Those decisions belong to the Recommendation and Scoring layers.



---

### `/docs/RECOMMENDATION-MODEL.md`

```markdown
# GovCareer Compass — Recommendation Model

**File:** `/docs/RECOMMENDATION-MODEL.md`  
**Document Type:** Canonical Product and Decision-Logic Specification  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`  
**Applies To:** Career Finder, Results, Career Comparison, Rankings, Personalized Recommendations  
**Primary Modules:**  
- `/js/recommendation/preference-engine.js`
- `/js/recommendation/scoring-engine.js`
- `/js/recommendation/ranking-engine.js`
- `/js/recommendation/explanation-engine.js`

---

# 1. Purpose

The GovCareer Compass Recommendation Model defines how the platform selects and ranks government careers for an individual candidate after applying the hard eligibility layer.

The Recommendation Model answers:

> **"Among the opportunities that this candidate can potentially pursue, which careers best match the candidate's preferences, priorities, circumstances and desired lifestyle?"**

The system is intended to help an aspirant resolve common government-exam and government-career confusion.

Examples:

- Which government should I target?
- Which exams fit my qualification?
- Should I prioritise State or Central Government?
- Which careers match my salary expectations?
- Which careers fit my family responsibilities?
- Which careers allow better geographic stability?
- Which careers are more compatible with caring for parents?
- Which careers involve less night duty?
- Which careers are better for someone who prefers office work?
- Which careers provide more authority?
- Which careers make the best use of my English background?

The recommendation engine must answer these questions transparently rather than simply displaying a generic "best jobs" list.

---

# 2. Fundamental Separation

The architecture is:

```text
HARD ELIGIBILITY
        ↓
Can the candidate potentially pursue the opportunity?

SOFT PREFERENCES
        ↓
What does the candidate actually want?

CAREER ATTRIBUTES
        ↓
What is the opportunity actually like?

SCORING
        ↓
How closely do the two match?

RANKING
        ↓
Which suitable opportunities come first?

EXPLANATION
        ↓
Why did the system recommend them?

The most important rule is:

> Eligibility determines the opportunity pool. Preferences determine the ordering within that pool.




---

3. No Universal "Best Job"

GovCareer Compass must never assume that one government career is universally best.

A career may be:

high salary
high authority
high prestige

but simultaneously:

high transfer burden
high operational unpredictability
poor family compatibility

Another career may have:

lower salary
moderate authority

but:

better geographic stability
better work-life compatibility
lower physical risk

Different candidates can therefore receive different recommendations.


---

4. Recommendation Pipeline

The canonical pipeline is:

User
  ↓
Assessment
  ↓
Candidate Profile
  ↓
Eligibility Engine
  ↓
Opportunity Pool
  ↓
Preference Profile
  ↓
Career Attributes
  ↓
Dimension Matching
  ↓
Weighted Scoring
  ↓
Trade-Off Analysis
  ↓
Confidence Analysis
  ↓
Ranking
  ↓
Explanation
  ↓
Personalized Results


---

5. Eligibility Gate

Before an opportunity enters the primary recommendation ranking:

ELIGIBLE
    ↓
Normal recommendation ranking

CONDITIONALLY_ELIGIBLE
    ↓
Recommendation allowed with visible condition

UNKNOWN
    ↓
Verification-required recommendation area

NOT_ELIGIBLE
    ↓
Excluded from primary recommendations

A NOT_ELIGIBLE opportunity may still be shown for educational transparency under:

Why this career was excluded

but must never look like a normal recommendation.


---

6. Candidate Preference Inputs

The recommendation system may use preferences concerning:

Government

Central Government;

West Bengal Government;

another supported state;

both Central and State Government.


Career

administrative;

police;

investigation;

intelligence;

enforcement;

revenue;

taxation;

audit;

accounts;

railway;

postal;

Panchayat;

education;

teaching;

clerical;

welfare;

forest;

fire/emergency;

other supported categories.


Lifestyle

family;

parent care;

children;

geographic stability;

Kolkata;

West Bengal;

transfer;

night duty;

shift duty;

holiday duty;

emergency duty;

work-life;

physical risk;

stress;

housing.


Career Qualities

salary;

authority;

prestige;

career growth;

job security;

English fit.


Preparation

exam difficulty tolerance;

preparation burden tolerance;

willingness to compete for highly selective opportunities.



---

7. Importance vs Tolerance

The system must distinguish between:

Importance

What the candidate wants.

Example:

Avoiding frequent transfer = 10/10 importance

Tolerance

What the candidate can personally accept.

Example:

Transfer tolerance = 7/10

These values are not identical.

A candidate may strongly prefer stable posting while still being willing to accept some transfers for a high-value career.


---

8. Candidate Preference Structure

Conceptually, the profile may contain:

preferences:
    salaryImportance
    authorityImportance
    prestigeImportance
    familyImportance
    parentCareImportance
    locationImportance
    jobSecurityImportance
    workLifeImportance
    careerGrowthImportance
    housingImportance
    lowStressImportance
    lowPhysicalRiskImportance
    lowTransferImportance
    lowNightDutyImportance
    lowShiftDutyImportance
    lowHolidayDutyImportance
    lowEmergencyDutyImportance
    publicDealing
    officeField
    examCompetitionTolerance

Tolerance-related fields may exist separately:

tolerance:
    nightDuty
    physicalRisk
    transfers


---

9. Candidate Preference Is Not Candidate Eligibility

Example:

Candidate:
B.A. English
No B.Ed.

Preference:
Teaching = very high

If a specific recruitment requires B.Ed., the opportunity remains:



The recommendation engine cannot override this.


---

10. Career Attribute Model

Each job/exam opportunity should expose verified or appropriately labelled career attributes.

Examples:

salary
authority
prestige
familyCompatibility
parentCareCompatibility
locationStability
kolkataStability
jobSecurity
workLife
careerGrowth
housing
physicalSafety
stress
transferBurden
nightDutyBurden
shiftDutyBurden
holidayDutyBurden
emergencyDutyBurden
publicInteraction
workStyle
examDifficulty
englishFit
governmentType
stateId
careerCategories

Not every opportunity will have every field.

Missing data must remain identifiable.


---

11. Attribute Direction

Every numerical attribute must have a declared direction.

Higher is Better

Examples:

salary
authority
familyCompatibility
parentCareCompatibility
locationStability
kolkataStability
jobSecurity
workLife
careerGrowth
housing
physicalSafety
englishFit

Higher is Worse

Examples:

stress
physicalRisk
transferBurden
nightDutyBurden
shiftDutyBurden
holidayDutyBurden
emergencyDutyBurden

The scoring engine must never infer direction from a field name alone.


---

12. Government Preference

Government preference affects ranking.

Potential user choices:

CENTRAL_ONLY
STATE_ONLY
WEST_BENGAL_PRIORITY
BOTH
NO_STRONG_PREFERENCE

The exact controlled vocabulary must be maintained in the data layer.

Government preference is normally not a hard eligibility criterion.


---

13. State Preference

The current product is designed to support:

Central Government
+
West Bengal Government

while allowing future expansion.

The architecture should support:

/data/states/<state-slug>/

without redesigning the recommendation engine.

A state appearing in a selector does not imply that a complete state-government dataset already exists.


---

14. Salary Preference

Salary importance represents how strongly the candidate values compensation.

The scoring system may consider:

starting basic pay;

relevant pay structure;

known allowances;

gross estimate;

in-hand estimate where available;

compensation comparison context.


The system must not confuse:

Starting Basic

with:

Gross

or:

Take-Home


---

15. Salary Comparison Principle

Where salary is normalized:

Salary score
=
relative compensation compatibility

not:

official government ranking

Salary normalization must remain aware that:

West Bengal pay structure

and:

Central 7th Central Pay Commission structure

are different systems.

Identical level numbers do not imply identical salaries.


---

16. Authority Preference

Authority should be decomposed where possible.

Potential components:

administrativeAuthority
statutoryAuthority
enforcementAuthority
investigationAuthority
inspectionAuthority
supervisoryAuthority
financialAuthority
publicDecisionAuthority

A composite score may be derived from these components.

Authority is not the same as:

prestige
salary
popularity


---

17. Prestige Preference

Prestige is comparatively subjective.

Therefore prestige-related data should normally be identified as:

PRACTICAL_ASSESSMENT

unless an objective measurement or authoritative basis is available.

The system must not present subjective prestige judgments as official classifications.


---

18. Family Preference

Family compatibility may consider:

work-life balance;

geographic stability;

transfer burden;

night-duty burden;

shift burden;

emergency duty;

holiday/festival duty;

housing;

work predictability;

local posting characteristics.


The family score is analytical.

It is not a promise about the candidate's future personal life.


---

19. Parent-Care Preference

Parent-care compatibility may consider:

geographic stability;

transfer burden;

emergency duty;

night duty;

work-life;

housing;

location;

travel burden where supported.


The system must not infer:

West Bengal = near parents

or:

Kolkata = guaranteed family convenience

These are separate characteristics.


---

20. Family Circumstances

The platform may allow users to disclose:

elderly-parent responsibility;

spouse/family responsibilities;

childcare responsibilities;

financial dependants.


These are used as user preferences and context.

The application must avoid diagnosing or making unsupported assumptions about the user's family.


---

21. Kolkata Preference

Kolkata preference is a soft suitability factor unless a specific recruitment rule makes geography a hard condition.

The system may compare:

candidate KolkataImportance

with:

career KolkataStability

The result should be communicated as compatibility, not certainty.

Example:

Strong Kolkata fit

does not mean:

Kolkata posting guaranteed


---

22. Location Preference

Location may include:

Kolkata
West Bengal
Home-region preference
Urban preference
Rural preference
Open to relocation

The recommendation system should differentiate:

preferred location

from:

actual recruitment jurisdiction

and:

likely posting scope


---

23. Transfer Preference

Transfer should be evaluated as a burden.

A candidate may state:

I strongly want to avoid transfers

while a career has:

High transfer burden

The result should be:

Low transfer compatibility

not:

Not eligible

unless transfer is somehow part of a formal recruitment condition.


---

24. Night Duty

Night duty is a lifestyle factor.

Where supported, career data may distinguish:

None known
Occasional
Operational
Frequent
Highly operational
Unknown

The exact mapping should be centrally configured.

The application must not invent night-duty frequency based merely on the job title.


---

25. Physical-Risk Preference

Physical-risk tolerance is a soft preference.

A candidate may be fully academically eligible for a police career while strongly preferring low-risk work.

The recommendation engine may therefore produce:

Eligibility: ELIGIBLE
Physical-safety fit: LOW

This is correct.


---

26. Work-Life Preference

Work-life suitability may incorporate:

predictability;

working hours;

shift structure;

emergency duty;

holiday duty;

night duty;

transfer;

workload;

travel.


Work-life information should be based on verified job structure wherever possible.

It must not be presented as a guarantee.


---

27. Career Growth

Career-growth suitability may consider:

promotion structure;

senior posts;

service hierarchy;

career ceiling;

departmental progression;

vacancy dependence;

selection requirements.


The model must not manufacture promotion timelines.


---

28. Housing

Housing compatibility may consider:

government accommodation;

departmental accommodation;

police housing;

railway accommodation;

hostel/barrack arrangements;

availability;

vacancy dependence;

HRA implications;

private-rent burden.


Housing must never be treated as automatically free.


---

29. English Honours Fit

The system may recognise practical relevance of an English background in:

English comprehension;

descriptive writing;

essay writing;

communication;

report writing;

interview communication;

language-heavy examinations;

language-related job duties.


This is an analytical suitability factor.

The system must not claim official bonus marks or preferential recruitment solely because the candidate studied English unless the relevant rules explicitly provide such treatment.


---

30. Career Interest Fit

The candidate may select multiple interests.

Examples:

POLICE
INVESTIGATION
INTELLIGENCE
ADMINISTRATIVE
REVENUE_TAX
RAILWAY
POSTAL
PANCHAYAT
CLERICAL
TEACHING
WELFARE
FOREST
FIRE_EMERGENCY

The engine compares user interest with the opportunity's validated career categories.

Interest increases suitability.

Lack of interest does not create ineligibility.


---

31. Exam Difficulty

Exam difficulty belongs to the preparation layer.

A career may simultaneously be:

excellent career fit

and:

very difficult examination

The system should show both.

The candidate's preparation tolerance may modify exam-fit.


---

32. Preparation Burden

Preparation burden may consider:

examination stages;

syllabus breadth;

specialist knowledge;

physical preparation;

descriptive writing;

interview;

skill tests;

competition where reliable data exists.


It should not be used to claim a guaranteed probability of selection.


---

33. Recommendation Categories

The system may use:

TOP_MATCH
STRONG_MATCH
GOOD_MATCH
MIXED_MATCH
LOW_MATCH
CONDITIONAL_MATCH
VERIFY_FIRST
NOT_ELIGIBLE

These are application-level analytical labels.

They are not official recruitment classifications.


---

34. Personalized Ranking

The personalized ranking should be based on:

Eligibility
+
Candidate Preferences
+
Career Attributes
+
Scoring Methodology

not on:

Popularity
Developer preference
Social-media reputation
Generic prestige


---

35. Trade-Off Analysis

A good recommendation must disclose trade-offs.

Example:

Career: Police Sub-Inspector

Strong matches:
+ Strong police-interest alignment
+ Strong authority alignment
+ Good career-growth alignment

Important trade-offs:
− Higher operational burden
− Greater night-duty exposure
− Lower geographic predictability

Overall:
Strong fit, but with significant lifestyle trade-offs.

This is more useful than a single score.


---

36. Recommendation Explanation

Every recommended career should explain:

Why it matches

What candidate preferences align.

What conflicts

Which important preferences are poorly matched.

What was verified

Relevant eligibility conditions.

What is uncertain

Missing or lower-confidence information.

What to verify

Current official notification or recruitment source where appropriate.


---

37. Negative Recommendations

If a career ranks low, explain why.

Example:

Why this career ranks lower:

1. You strongly prioritise geographic stability.
2. The career has substantial transfer burden.
3. You prefer minimal night duty.
4. The role has a significant operational component.

This explanation must be based on actual candidate preferences and career data.


---

38. Confidence

Recommendation confidence is separate from recommendation score.

Example:

Suitability: 87/100
Confidence: Medium

This means the career appears highly compatible, but some underlying information is not fully verified or complete.

Confidence should reflect:

data quality;

source quality;

currentness;

completeness;

eligibility certainty;

candidate-profile completeness.



---

39. Missing Data

Missing data must remain distinguishable from poor data.

Correct:

Housing: UNKNOWN

Incorrect:

Housing: 0

when zero would imply a verified absence of housing advantage.

The scoring layer should use an explicit unknown-data policy.


---

40. Preference Profiles

The system may derive analytical profile tags such as:

FAMILY_FIRST
PARENT_CARE_PRIORITY
SALARY_PRIORITY
AUTHORITY_PRIORITY
LOCATION_SENSITIVE
LOW_OPERATIONAL_BURDEN
OFFICE_ORIENTED
FIELD_ORIENTED
POLICE_INTEREST
CENTRAL_GOVERNMENT_PRIORITY
STATE_GOVERNMENT_PRIORITY
HIGH_COMPETITION_TOLERANCE

These are explanatory labels.

They are not psychological diagnoses.


---

41. Family-First Logic

A candidate may become a family-first analytical profile when they assign high importance to combinations such as:

familyImportance
parentCareImportance
locationImportance
workLifeImportance
lowTransferImportance
lowNightDutyImportance
lowEmergencyDutyImportance

The result should explain the underlying preference rather than simply declaring:




---

42. Authority-First Logic

A candidate may become an authority-priority profile when they strongly prioritise:

authority
prestige
career growth

This should be interpreted as a stated career priority.

It must not be described as a psychological diagnosis.


---

43. Location-Sensitive Logic

A candidate may be classified analytically as location-sensitive when they show:

high location importance
+
low transfer tolerance
+
strong Kolkata or state preference

This affects ranking only.


---

44. Recommendation vs Current Vacancy

A highly suitable career may currently have:

Current recruitment: CLOSED

It may still remain a strong recurring career recommendation.

The UI must distinguish:

Career suitability

from:

Current recruitment status


---

45. Recommendation vs Competition

A highly suitable career may have extreme competition.

The result should therefore expose, when available:

Exam difficulty
Preparation burden
Recruitment frequency
Competition information
Current status

without automatically declaring the career unsuitable.


---

46. Recommendation vs Selection Probability

The platform must not claim:

"Your chance of selection is 87%."

unless a separate validated predictive model is explicitly implemented.

The personalized score means:

> Compatibility with the candidate's stated preferences under the current scoring methodology.




---

47. AI Assistant Integration

The future AI layer may explain results, answer questions and compare careers.

However:

Verified Data
        ↓
Eligibility Engine
        ↓
Scoring Engine
        ↓
Ranking
        ↓
Structured Result
        ↓
AI Explanation

The AI must not override structured eligibility or silently invent factual attributes.


---

48. Engine Responsibilities

Preference Engine

/js/recommendation/preference-engine.js

Responsibilities:

normalize candidate preferences;

calculate active preference weights;

identify preference profiles;

preserve unknown values.


Scoring Engine

/js/recommendation/scoring-engine.js

Responsibilities:

normalize career attributes;

calculate dimension fit;

apply preference weights;

handle positive and negative dimensions;

handle missing data.


Ranking Engine

/js/recommendation/ranking-engine.js

Responsibilities:

sort opportunities;

create ranking groups;

handle ties;

generate category-specific views.


Explanation Engine

/js/recommendation/explanation-engine.js

Responsibilities:

explain strong matches;

explain trade-offs;

explain low scores;

explain uncertainty;

produce candidate-facing reasoning.



---

49. Data Dependencies

The Recommendation Model depends on:

/data/common/
    categories.json
    governments.json
    states.json
    locations.json
    scoring-rules.json
    confidence-levels.json

/data/assessment/
    profile-fields.json
    response-scoring.json

/data/central/
    jobs.json
    exams.json
    recruitment.json
    pay.json
    locations.json
    housing.json
    promotion.json
    benefits.json

/data/states/west-bengal/
    jobs.json
    exams.json
    recruitment.json
    pay.json
    locations.json
    housing.json
    promotion.json
    benefits.json


---

50. Recommendation Testing

The system must test at least:

Family-first profile

Increasing family and parent-care priority should increase the influence of compatible careers.

Salary-first profile

Increasing salary importance should increase salary influence.

Authority-first profile

Increasing authority importance should increase authority influence.

Kolkata-first profile

Increasing Kolkata importance should increase the influence of validated Kolkata stability.

Low-risk profile

Increasing low-risk importance should reduce the suitability of high-risk careers.

Low-night-duty profile

Increasing night-duty avoidance should reduce the suitability of careers with higher validated night-duty burden.

Low-transfer profile

Increasing transfer avoidance should reduce suitability of transfer-heavy careers.

Central Government profile

Central Government careers should receive stronger government-fit when Central preference is high.

Eligibility protection

Preference changes must never turn:

NOT_ELIGIBLE

into:

ELIGIBLE


---

51. Recommendation Acceptance Criteria

The Recommendation Model is correctly implemented when:

hard eligibility is evaluated before normal recommendation;

soft preferences remain separate;

State and Central preferences work independently;

Kolkata preference works independently from general state preference;

family and parent-care priorities can influence ranking;

salary can be prioritised;

authority can be prioritised;

prestige can be prioritised;

work-life can be prioritised;

transfer can be considered;

night duty can be considered;

physical risk can be considered;

housing can be considered;

career growth can be considered;

English background can be considered;

exam difficulty can be shown;

uncertainty is preserved;

major trade-offs are visible;

recommendation explanations are data-derived;

no universal winner is hard-coded;

the engine remains expandable to additional states;

AI does not override deterministic eligibility logic.



---

52. Final Recommendation Rule

> GovCareer Compass should recommend careers because their verified characteristics align with the candidate's explicitly stated priorities, not because the system assumes those careers are universally superior.



The recommendation engine must optimise for:

Candidate priorities
        +
Verified career characteristics
        +
Eligibility status
        +
Transparent scoring
        +
Evidence quality
        +
Explicit uncertainty

and never for:

Popularity
Salary alone
Prestige alone
Developer preference
Hidden assumptions
Unverified claims

---

### `/docs/SCORING-METHODOLOGY.md`

```markdown
# GovCareer Compass — Scoring Methodology

**File:** `/docs/SCORING-METHODOLOGY.md`  
**Document Type:** Canonical Product and Mathematical Logic Specification  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`  
**Primary Implementation:** `/js/recommendation/scoring-engine.js`  
**Supporting Modules:**  
- `/js/recommendation/preference-engine.js`
- `/js/recommendation/ranking-engine.js`
- `/js/recommendation/explanation-engine.js`

---

# 1. Purpose

This document defines the mathematical and logical methodology used by GovCareer Compass to calculate personalized career suitability scores.

The purpose of scoring is:

> **To measure how closely an eligible or potentially eligible government career matches the candidate's stated priorities and preferences.**

The resulting score is:

```text
ANALYTICAL
PERSONALIZED
EXPLAINABLE
CONFIGURABLE
NON-OFFICIAL

It is not:

a government recruitment score;

an examination score;

a selection probability;

a legal eligibility decision;

a guarantee of appointment;

a guarantee of posting;

a psychological score;

an official career ranking.



---

2. Three-Layer Decision System

The entire platform uses three distinct layers.

LAYER 1 — ELIGIBILITY

Can the candidate pursue this opportunity?

        ↓

LAYER 2 — CAREER ATTRIBUTES

What is this opportunity actually like?

        ↓

LAYER 3 — PREFERENCES

How important are those characteristics to this candidate?

        ↓

PERSONALIZED SCORING

This architecture must remain stable.


---

3. Scoring Cannot Override Eligibility

A career cannot receive a normal positive recommendation merely because it matches the candidate's preferences if the candidate fails a mandatory requirement.

Example:

Eligibility = NOT_ELIGIBLE
Preference Fit = 100

must not become:

Recommended = YES

The correct state is:

NOT_ELIGIBLE

with optional educational explanation.


---

4. Canonical Scoring Pipeline

Candidate Profile
        ↓
Eligibility Result
        ↓
Eligible Opportunity Pool
        ↓
Candidate Preference Normalization
        ↓
Career Attribute Normalization
        ↓
Criterion Fit Calculation
        ↓
Weight Calculation
        ↓
Weighted Aggregation
        ↓
Missing-Data Handling
        ↓
Trade-Off Analysis
        ↓
Confidence
        ↓
Final Suitability Score
        ↓
Ranking
        ↓
Explanation


---

5. Public Suitability Score

The recommended public score range is:

0–100

Conceptual interpretation:

90–100  Exceptional Fit
80–89   Very Strong Fit
70–79   Strong Fit
60–69   Good / Workable Fit
50–59   Mixed Fit
40–49   Weak Fit
0–39    Poor Fit

These descriptions are product terminology.

They do not represent:

official recruitment categories;

official government rankings;

probability of selection.



---

6. Criterion Score

Internal criterion-level suitability should generally use:

0–10

where:

0 = very poor compatibility
10 = excellent compatibility

The raw career attribute may have a different semantic direction.

For example:

Stress burden = 8

does not mean:

Stress suitability = 8


---

7. Metric Direction

Every career metric must specify whether higher values are better or worse.

Higher Is Better

Examples:

salary
authority
familyCompatibility
parentCareCompatibility
locationStability
kolkataStability
jobSecurity
workLife
careerGrowth
housing
physicalSafety
englishFit

Higher Is Worse

Examples:

stressBurden
physicalRiskBurden
transferBurden
nightDutyBurden
shiftDutyBurden
holidayDutyBurden
emergencyDutyBurden

Direction metadata is mandatory.


---

8. Positive Metric Normalization

For a positive metric:

suitability = normalizedCareerAttribute

Example:

Career family compatibility = 9/10

means:

Family suitability = 9/10

before candidate-specific weighting.


---

9. Negative Metric Normalization

For a burden metric:

suitability = 10 - burden

Example:

Stress burden = 8/10

becomes:

Stress suitability = 2/10

The original burden must remain visible to the user.

Preferred UI:

Stress level: High
Stress suitability for you: Low

rather than:

Stress: 8/10

without context.


---

10. Candidate Importance

Candidate importance values should normally use:

0–10

where:

0 = not important
10 = extremely important

Typical fields:

salaryImportance
authorityImportance
prestigeImportance
familyImportance
parentCareImportance
locationImportance
jobSecurityImportance
workLifeImportance
careerGrowthImportance
housingImportance
lowStressImportance
lowPhysicalRiskImportance
lowTransferImportance
lowNightDutyImportance
lowShiftDutyImportance
lowHolidayDutyImportance
lowEmergencyDutyImportance


---

11. Importance Is Not Suitability

Example:

salaryImportance = 10

means:

> The candidate considers salary extremely important.



It does not mean:

salarySuitability = 10

A career might have:

salarySuitability = 7

and still receive substantial weight because salary is very important to the candidate.


---

12. Preference Weight Normalization

A simple initial normalization is:

normalizedImportance = importance / 10

Therefore:

8/10 → 0.80

This normalized value can participate in weight calculation.

The final production weighting method must be defined centrally in:

/data/common/scoring-rules.json

rather than duplicated across application modules.


---

13. Base Dimension Weights

Each dimension may have a configurable base weight.

Conceptually:

effectiveWeight
=
baseWeight
×
candidatePriorityMultiplier

This allows the same career database to serve different users.

Example:

Candidate:
Family importance = 10
Salary importance = 6
Authority importance = 4

The family dimension should carry more influence than authority.


---

14. Weighted Suitability Formula

The canonical conceptual formula is:

Overall Suitability
=
Σ(fit_i × weight_i)
───────────────────
Σ(weight_i)

where each:

fit_i

is a normalized suitability value.

The final public score can then be represented on a 0–100 scale.


---

15. Active Dimensions

Only dimensions with usable values should participate in the denominator.

Conceptually:

activeWeightSum
=
sum of usable dimension weights

Then:

finalNormalizedScore
=
weightedContribution
/
activeWeightSum

This prevents missing information from automatically lowering the score.


---

16. Unknown Data

Unknown must not be treated as zero.

For example:

Housing = UNKNOWN

must not silently become:

Housing = 0

unless the central scoring configuration explicitly specifies a neutral-imputation policy.

Recommended default:

Exclude unknown dimension from aggregation
+
reduce confidence


---

17. Missing Candidate Preference

If the user has not supplied a preference:

UNKNOWN

should normally mean that the dimension is unavailable for personalization.

The engine must not assume:

unknown = low importance

or:

unknown = maximum importance


---

18. Missing Career Attribute

If a career attribute is unavailable:

UNKNOWN

should remain distinguishable from a verified low or high value.

Example:

Government accommodation:
UNKNOWN

is not the same as:

No meaningful accommodation advantage:
VERIFIED

This distinction is essential for trustworthy recommendations.


---

19. Category Balancing

Several variables can measure related concepts.

For example:

Family
Parent Care
Work-Life
Transfer
Night Duty
Shift Duty
Holiday Duty
Emergency Duty
Location

may all influence the candidate's desire for lifestyle stability.

Without category balancing, one concern could dominate the final result unintentionally.

The scoring system should therefore support:

category weights
category caps
dimension normalization

The exact production values belong in:

/data/common/scoring-rules.json


---

20. Recommended High-Level Categories

The initial scoring framework may group criteria into:

Financial
Authority
Career Growth
Lifestyle
Family
Location
Safety
Housing
Interest
Exam Fit
English Fit
Government Fit

The category structure is an internal scoring aid.

The UI can still display individual dimensions.


---

21. Family Category

Potential family-related dimensions:

familyCompatibility
parentCareCompatibility
workLife
locationStability
transferSuitability
nightDutySuitability
shiftDutySuitability
holidayDutySuitability
emergencyDutySuitability

These must be balanced to avoid accidental over-weighting.


---

22. Salary Category

Potential financial dimensions:

startingBasic
grossEstimate
inHandEstimate
knownAllowances
salarySuitability

The methodology must identify what compensation measure is being used.

The system must not silently switch between:

basic
gross
take-home

within the same comparison.


---

23. West Bengal and Central Pay Systems

Scoring must preserve the distinction between:

West Bengal Government pay structure

and:

Central Government 7th Central Pay Commission structure

Identical numerical pay-level labels do not establish salary equivalence.

The scoring system should compare actual compensation attributes.


---

24. Authority Category

Potential authority dimensions:

administrativeAuthority
statutoryAuthority
enforcementAuthority
investigationAuthority
inspectionAuthority
supervisoryAuthority
financialAuthority
publicDecisionAuthority

The composite authority measure must be transparent.


---

25. Prestige Category

Prestige values should generally carry an explicit evidence type:

PRACTICAL_ASSESSMENT

unless there is a documented objective basis.

A subjective prestige score should not be mistaken for a government-defined classification.


---

26. Location Category

Potential location dimensions:

locationStability
kolkataStability
stateStability
transferSuitability
ruralPostingCompatibility
remotePostingCompatibility

Not every career requires every dimension.

Unknown values must remain unknown.


---

27. Transfer Suitability

For a burden measure:

transferSuitability
=
10 - transferBurden

unless an alternative tolerance-based method is configured.

Example:

Transfer burden = 8

produces:

Transfer suitability = 2

before user weighting.


---

28. Tolerance-Based Matching

For dimensions where a candidate tolerance exists:

candidateTolerance

may be compared with:

careerBurden

For example:

nightDutyTolerance

can be compared to:

nightDutyBurden

The exact mathematical function must be centrally configured.

The system should not create inconsistent formulas independently for different dimensions.


---

29. Importance and Tolerance Are Different

Example:

Low night-duty importance = 10
Night-duty tolerance = 7

This means:

> The candidate strongly prefers to avoid night duty, but could tolerate some night duty when necessary.



The scoring system should preserve that nuance.


---

30. Physical Safety

A candidate can be:

Eligible

for a physically demanding career while having:

Low physical-risk preference

Therefore:

Eligibility
=
PASS

and:

Physical-safety fit
=
LOW

can coexist.

This is intentional.


---

31. Stress

Stress burden must be separated from stress preference.

Career:

stressBurden = 8

Candidate:

lowStressImportance = 10

should produce poor stress-fit.

However, a candidate with:

highStressTolerance

may be less negatively affected.

The exact interaction is configuration-driven.


---

32. Night Duty

Night-duty burden must be separated from general work-life.

For example:

nightDutyBurden

may influence:

night-duty fit
family fit
work-life fit

but should not be counted repeatedly at full strength without category balancing.


---

33. Emergency Duty

Emergency duty may independently affect:

family compatibility;

work-life;

predictability.


Its effect must be normalized to prevent double counting.


---

34. Housing

Housing suitability may consider:

governmentQuarter
departmentalAccommodation
railwayAccommodation
policeAccommodation
availability
vacancyDependence
HRAEffect
housingCost

The scoring system must never encode:

government employment
=
free accommodation

as a generic assumption.


---

35. English Fit

The English-fit score may include:

English examination relevance
descriptive writing relevance
essay relevance
communication relevance
report-writing relevance
interview communication relevance
language-heavy duties

It must remain an analytical compatibility measure.

No unofficial bonus should be invented.


---

36. Exam-Fit

Exam-fit compares:

Candidate preparation tolerance

against:

Exam difficulty
Preparation burden

A candidate may therefore receive:

Career Fit: Excellent
Exam Fit: Difficult

This is desirable because it keeps career attractiveness and entry difficulty separate.


---

37. Competition

Competition data, when reliable, may be displayed separately.

It should not automatically become a large hidden penalty.

A career can be:

Highly suitable
+
Highly competitive

The candidate should be shown both facts.


---

38. Confidence

Confidence and suitability are independent.

Example:

Suitability = 90/100
Confidence = Medium

may occur when:

preferences are clear;

the career structure strongly matches;

but some current career attributes are not completely verified.


The system should not transform confidence into an unexplained percentage.


---

39. Confidence Inputs

Confidence may consider:

candidate profile completeness
career data completeness
source quality
source currentness
eligibility certainty
salary data quality
posting data quality
housing data quality
work-life data quality

The confidence algorithm should remain transparent and configurable.


---

40. Suitability Bands

Suggested interpretation:

90–100
Exceptional Fit

80–89
Very Strong Fit

70–79
Strong Fit

60–69
Good / Workable Fit

50–59
Mixed Fit

40–49
Weak Fit

0–39
Poor Fit

These bands should not be confused with:

ELIGIBLE / NOT_ELIGIBLE

or government recruitment categories.


---

41. Ranking Logic

Within the primary eligible pool, ranking should generally consider:

1. Eligibility status
2. Suitability score
3. Confidence
4. Deterministic tie-break rule

One recommended conceptual priority is:

ELIGIBLE
    >
CONDITIONALLY_ELIGIBLE
    >
UNKNOWN

with NOT_ELIGIBLE excluded from the normal ranking.

The exact implementation must remain consistent throughout the application.


---

42. Conditional Opportunity Ranking

Conditionally eligible careers may be displayed separately.

Example:

Strong Match
Conditionally Eligible

Required action:
Confirm the subject/qualification condition before applying.

This is preferable to hiding potentially relevant opportunities.


---

43. Recommendation Explanation

The score should be decomposable.

Example:

Overall: 84/100

Positive contributors:
+ Strong family compatibility
+ Strong location compatibility
+ Good salary compatibility

Trade-offs:
− Moderate authority
− Some transfer burden

The explanation engine should derive these statements from actual contribution data.


---

44. Major Positive Contributors

The engine should be able to identify the dimensions contributing most positively.

Examples:

Salary
Family
Authority
Location
Work-life
Career Growth

Only genuinely material contributors should be displayed.


---

45. Major Negative Contributors

Likewise, the engine should identify the dimensions reducing suitability.

Examples:

Transfer
Night Duty
Stress
Physical Risk
Housing

Negative contributions must be described neutrally.


---

46. Trade-Off Statement

A good result may say:

This is a strong overall match, but the career has a significant
conflict with your preference for geographic stability.

This is preferable to hiding the conflict behind one aggregate score.


---

47. No Hidden Penalty

The scoring system should avoid arbitrary unexplained deductions such as:

−17 points because transfers are bad

unless the methodology explicitly documents the formula.

The candidate should be able to understand how major factors influence the result.


---

48. Preference Sensitivity

Changing an important preference should produce a logically meaningful ranking change.

Example:

Family importance:
3 → 10

should increase the influence of family-compatible careers.

Similarly:

Salary importance:
3 → 10

should increase the influence of compensation.


---

49. Eligibility Protection Test

Changing preferences must never create:

NOT_ELIGIBLE

→

ELIGIBLE

The eligibility engine remains authoritative for formal qualification.


---

50. Category-Specific Rankings

The platform should support separate ranking modes:

Highest Salary
Highest Authority
Best Family
Best Parent-Care
Best Kolkata Fit
Best Work-Life
Lowest Physical Risk
Lowest Stress
Best Housing
Best Career Growth
Best Police Career
Best Intelligence Career
Best Administrative Career
Best Central Government Career
Best State Government Career
Best BA English Fit
Best Backup
Best Overall

Each ranking mode should use an appropriate methodology.

It must not automatically reuse the personalized score unchanged for every category.


---

51. General Ranking vs Personal Ranking

These must be separate.

General Analytical Ranking

Example:

Best starting salary

Personalized Ranking

Example:

Best salary-to-family-life combination for this candidate

The same career can rank differently under the two systems.


---

52. Ranking Tie Handling

If two careers are extremely close:

82.4
82.3

the UI may describe them as:

Very close match

rather than pretending that the 0.1 difference has major practical significance.

The underlying numbers may still remain available.


---

53. No Popularity Bias

Popularity must not silently affect scoring.

The engine must not increase score merely because:

users search for the job often;

social media discusses the job;

the job is famous;

the job is perceived as prestigious.


Popularity may be shown as separate information where valid.


---

54. No Developer Bias

Developers must not encode a universal ranking such as:

IAS always first

or:

Police jobs always above clerical jobs

unless the ranking mode explicitly represents that criterion.

Personalized ranking must emerge from the configured model and candidate preferences.


---

55. Scoring Configuration

Changing score weights should be possible through configuration.

Primary configuration:

/data/common/scoring-rules.json

Assessment-derived preference transformations:

/data/assessment/response-scoring.json

This separation allows the methodology to evolve without rewriting the user interface.


---

56. Scoring Versioning

Every material scoring-methodology change should increase the scoring-model version.

Conceptually:

scoringModelVersion = 1.0.0

A material methodology change should be documented in:

/CHANGELOG.md

and the active configuration should identify the applicable version.


---

57. Reproducibility

A recommendation should be reproducible from:

Candidate Profile
+
Career Dataset Version
+
Scoring Rules Version
+
Recommendation Model Version
+
Assessment Version

This is important for debugging and auditability.


---

58. Golden Test Profiles

The repository should eventually include deterministic test profiles such as:

GOLDEN_PROFILE_FAMILY_FIRST
GOLDEN_PROFILE_PARENT_CARE
GOLDEN_PROFILE_SALARY_FIRST
GOLDEN_PROFILE_AUTHORITY_FIRST
GOLDEN_PROFILE_KOLKATA_FIRST
GOLDEN_PROFILE_POLICE_INTEREST
GOLDEN_PROFILE_OFFICE_FIRST
GOLDEN_PROFILE_LOW_RISK
GOLDEN_PROFILE_CENTRAL_ONLY
GOLDEN_PROFILE_STATE_ONLY

The purpose is to ensure that later scoring changes do not unexpectedly break the intended behaviour.


---

59. Required Scoring Tests

Salary Test

Increase salary importance.

Expected:

Salary-related differences become more influential.

Family Test

Increase family importance.

Expected:

Family-compatible opportunities become relatively stronger.

Parent-Care Test

Increase parent-care importance.

Expected:

Location, transfer and operational predictability become more influential.

Authority Test

Increase authority importance.

Expected:

Authority-related attributes become more influential.

Kolkata Test

Increase Kolkata importance.

Expected:

Kolkata stability becomes more influential.

Transfer Test

Increase low-transfer importance.

Expected:

Transfer-heavy careers become less suitable.

Night-Duty Test

Increase night-duty avoidance.

Expected:

High night-duty careers become less suitable.

Physical-Risk Test

Increase low-risk importance.

Expected:

Physically risky careers become less suitable.

Unknown Data Test

Expected:

UNKNOWN ≠ 0

Eligibility Test

Expected:

Preference changes cannot override NOT_ELIGIBLE.


---

60. Negative Metric Safety

The UI and engine must distinguish:

Stress Burden = 8/10

from:

Stress Suitability = 2/10

and:

Safety = 8/10

from:

Risk = 2/10

The underlying semantics must be explicit.

This prevents an accidental implementation where a higher stress or risk number is interpreted as a better career.


---

61. Family Scoring Safety

Family scoring must not accidentally double-count:

family
parent care
work-life
location
transfer
night duty
emergency duty

The model should support category-level balancing and documented weights.


---

62. Salary Scoring Safety

Salary scoring must not:

treat basic pay as take-home;

compare unrelated pay-level numbers as identical;

ignore pay-system differences;

assume HRA is always received;

assume government housing is free;

fabricate current salary.



---

63. Recommendation Safety

The recommendation engine must not:

invent eligibility;

invent job duties;

invent housing availability;

invent transfer frequency;

invent promotion timelines;

invent current vacancies;

invent salary;

use stale information without labelling it;

present estimates as official facts.



---

64. AI Safety

The AI assistant may explain a structured score but must not silently modify:

eligibilityStatus
careerAttributes
source evidence
scoring rules

The recommended architecture is:

Structured Data
      ↓
Deterministic Engines
      ↓
Structured Recommendation
      ↓
AI Explanation

The AI is an explanation and assistance layer, not the canonical database.


---

65. Acceptance Criteria

The Scoring Methodology is correctly implemented when:

positive metrics have explicit positive direction;

negative metrics have explicit negative/burden direction;

importance is distinct from suitability;

tolerance is distinct from importance;

unknown values remain unknown;

weights are configurable;

active dimensions are normalized;

correlated categories can be balanced;

salary systems remain distinct;

family and parent-care preferences work;

Kolkata and location preferences work;

transfer preference works;

night-duty preference works;

physical-risk preference works;

housing preference works;

career-growth preference works;

English-fit is analytical rather than falsely official;

exam difficulty remains separate from career quality;

confidence remains separate from suitability;

recommendation scores can be explained;

trade-offs are visible;

ranking is reproducible;

scoring versions are trackable;

eligibility remains protected from preference scoring;

the system can expand to additional government datasets and states without rewriting the scoring architecture.



---

66. Methodology Disclosure Text

The website should provide a concise explanation similar to:

> GovCareer Compass suitability scores are analytical decision-support scores calculated from the candidate's stated preferences, the structured characteristics of the selected career and the current scoring methodology. They are not official government rankings, selection probabilities, guarantees of appointment, or guarantees of posting.




---

67. Final Mathematical Principle

The scoring engine fundamentally implements:

Candidate Preference
        ×
Verified Career Attribute
        =
Criterion Contribution

then:

All usable criterion contributions
        ↓
Weighted Normalization
        ↓
Overall Suitability

with:

Eligibility
        ↓
Hard gate

and:

Confidence
        ↓
Separate reliability indicator


---

68. Final Non-Negotiable Rule

> A high GovCareer Compass score means that a career appears highly compatible with the candidate's stated preferences under the current methodology. It does not mean that the career is objectively best, that the candidate is guaranteed to qualify, or that the candidate is guaranteed to be selected.



The permanent decision architecture is therefore:

ELIGIBILITY
    ↓
What can I pursue?

SCORING
    ↓
How well does it fit me?

RANKING
    ↓
Which suitable options should I consider first?

EXPLANATION
    ↓
Why did the system reach this result?

EVIDENCE
    ↓
What supports the underlying facts?
