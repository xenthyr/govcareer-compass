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
