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
Which suitable options should I consider first?ted attributes become more influential.

Kolka
