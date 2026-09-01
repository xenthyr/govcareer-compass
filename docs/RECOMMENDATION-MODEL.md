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
    stat
