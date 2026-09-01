# GovCareer Compass — Source Standards

**File:** `/docs/SOURCE-STANDARDS.md`  
**Document Type:** Canonical Evidence and Source-Governance Standard  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`  
**Applies To:** All government-job, examination, eligibility, pay, service, housing, promotion, recruitment and career-analysis data

---

# 1. Purpose

This document defines the evidence standards GovCareer Compass must use when collecting, validating, storing, updating and displaying government-career information.

The purpose is to ensure that:

- government facts are traceable;
- current information is distinguished from historical information;
- official rules are distinguished from practical analysis;
- estimates are never presented as official facts;
- conflicting sources are resolved systematically;
- every material claim can be traced to supporting evidence where possible;
- obsolete information is not silently presented as current;
- the database remains auditable as it grows.

GovCareer Compass is intended to be a research and decision-support platform.

It is **not** an official recruitment authority.

Therefore:

> The official recruitment notification, applicable recruitment rules, service rules, government orders, gazettes and other controlling official instruments remain authoritative over the information presented by GovCareer Compass.

---

# 2. Evidence Hierarchy

Sources should normally be evaluated according to the following hierarchy.

TIER 1 — PRIMARY CURRENT OFFICIAL SOURCE
    ↓
Current recruitment notification
Current recruitment advertisement
Current recruitment rules
Current service rules
Current regulations
Current government order
Current gazette
Current official pay order
Current official departmental rule

TIER 2 — OTHER PRIMARY OFFICIAL SOURCE
    ↓
Official department page
Official organisational structure
Official sanctioned-strength statement
Official annual report
Official vacancy statement
Official recruitment archive
Official examination page
Official government directory

TIER 3 — OFFICIAL HISTORICAL SOURCE
    ↓
Previous notification
Older service rule
Archived official circular
Historical government order
Historical official recruitment record

TIER 4 — REPUTABLE SECONDARY SOURCE
    ↓
Established publication
Reputable recruitment reference
Established legal/service-rule reference
Other credible secondary source

TIER 5 — ANALYTICAL / ESTIMATED
    ↓
Calculated estimate
Practical assessment
Derived comparison

TIER 6 — UNVERIFIED
    ↓
Claim for which sufficient reliable evidence has not been found

A lower tier must not silently override a higher-tier applicable source.


---

3. Mandatory Source Classification

Every important source-linked fact should be assigned one of the project's standard information types.

3.1 Official Current

Use when the information is supported by an applicable current official source.

Example:

Information Type:
OFFICIAL_CURRENT

Typical evidence:

current recruitment notification;

current official service rule;

current official pay order;

current official department page where the relevant fact remains applicable.



---

3.2 Official Historical

Use when the information is officially documented but relates to an earlier recruitment cycle, historical rule or older structure.

Information Type:
OFFICIAL_HISTORICAL

Historical evidence must not automatically be presented as current.


---

3.3 Official Rule

Use when a fact comes directly from a formal official rule, regulation, service rule, recruitment rule, government order or gazette.

Information Type:
OFFICIAL_RULE

This category may be current or historical.

The source record should indicate both:

sourceType = OFFICIAL_RULE
status = CURRENT / HISTORICAL

where applicable.


---

3.4 Secondary

Use when reliable secondary evidence is used because primary evidence is unavailable, difficult to locate or insufficient for a limited contextual claim.

Information Type:
SECONDARY

Secondary evidence must never be silently represented as an official government fact.


---

3.5 Estimate

Use when a value is calculated or reasonably derived rather than directly published.

Examples:

estimated gross salary;

estimated take-home salary;

estimated annual housing difference;

analytical score;

relative career comparison.


Information Type:
ESTIMATE

The assumptions must be documented.


---

3.6 Not Verified

Use when an assertion could not be sufficiently confirmed from reliable public evidence.

Information Type:
NOT_VERIFIED

This is preferable to inventing certainty.


---

4. Source Record Minimum Requirements

Each important source should ideally contain:

sourceId
organisation
title
documentType
publicationDate
effectiveDate
sourceUrl
sourceAuthority
sourcePriority
status
relevance
supportedClaims
retrievedDate
confidence
notes

Where a field cannot be established:

UNKNOWN

or:

NOT_PUBLICLY_VERIFIED

must be used rather than fabricated data.


---

5. Source URL Rules

Only verified URLs may be stored.

The system must not create plausible-looking URLs based on guesses.

A source URL should be:

copied from the official page;

validated when practical;

associated with the correct document;

preserved exactly enough to remain useful.


When a document moves, the new official URL should be recorded if discovered.


---

6. Official Source Rules

Government sources should generally be preferred for:

Eligibility

educational qualification;

subject requirements;

age;

physical requirements;

medical requirements;

experience;

domicile;

reservation;

language;

professional qualification;

technical qualification.


Recruitment

notification;

application dates;

vacancies;

examination stages;

selection process;

recruitment route.


Pay

pay level;

pay matrix;

starting basic;

applicable allowance rules;

official pay revisions.


Service Conditions

probation;

training;

promotion rules;

transfer provisions;

retirement;

leave;

housing entitlement;

accommodation rules.



---

7. Departmental Discovery Sources

Department websites are not only recruitment sources.

They may also be used to discover:

designations;

cadres;

sanctioned strength;

directorates;

organisational structure;

establishment structure;

annual reports;

service rules;

recruitment rules.


This is especially important for the project's forensic post-discovery process.

A department should not be considered fully audited merely because its recruitment page was checked.


---

8. Government Directory Use

For West Bengal, the official government department directory should be treated as a high-level discovery index.

The directory provides the starting universe of:

departments;

administrative structures;

links to official departmental resources.


However:

> The department directory itself does not prove the eligibility, pay, recruitment route or current status of an individual post.



Those facts require post-level or rule-level verification.


---

9. Designation / Strength Sources

Where available, official:

sanctioned-strength statements;

cadre lists;

establishment schedules;

organisational charts;

manpower statements;

annual reports;

RTI disclosures;


should be used to discover designation families.

Examples:

Inspector
Sub-Inspector
Assistant
Assistant Sub-Inspector
Constable
Typist
Auditor
Accountant
Office Superintendent
Warder
Driver
Group D

Discovery does not automatically establish direct recruitment.

Each discovered designation must subsequently be classified as:

Direct Recruitment
Promotion
Deputation
Transfer
Contract
Temporary
Other


---

10. Recruitment Notification Standard

A recruitment notification is the preferred source for current candidate-facing requirements.

When available, record:

notification number;

notification date;

application opening date;

application closing date;

vacancy;

post;

category;

qualification;

age;

relaxation;

exam pattern;

physical/medical standards;

skill test;

selection method;

application authority;

source URL.



---

11. Service-Rule Standard

Recruitment advertisements may not contain the entire service structure.

Service rules and recruitment rules should therefore be consulted for:

cadre;

post classification;

recruitment method;

qualification;

promotion;

minimum service;

departmental examination;

probation;

pay;

age;

other service conditions.


If a recruitment notification and an older service rule appear inconsistent:

1. determine whether the rule has been amended;


2. locate the amendment;


3. identify the applicable date;


4. use the current applicable rule;


5. document the conflict resolution.




---

12. Historical Source Standard

Historical sources are useful for:

discovering recurring posts;

determining whether a cadre existed;

understanding past recruitment;

identifying older designations;

identifying superseded rules;

examining recruitment frequency.


Historical sources must be labelled.

They must not be used to imply that:

old rule = current rule

unless current applicability has been separately verified.


---

13. Currentness

For every time-sensitive claim, store or determine:

effectiveDate
publicationDate
status

The current research baseline is:

31 August 2026

A source may be old but still current if the underlying rule remains applicable.

Therefore:

> Source age and rule applicability are not identical concepts.




---

14. Current Recruitment Status

Current recruitment status must be kept separate from career existence.

Supported concepts include:

OPEN
CLOSED
UNDER_PROCESS
RECENTLY_COMPLETED
EXPECTED_PERIODIC
IRREGULAR
HISTORICAL
NOT_CURRENTLY_RECRUITING
UNKNOWN

A career may remain valid even when no recruitment is currently open.


---

15. Vacancy Standard

Vacancies must be tied to:

recruitment cycle;

notification;

date;

post;

organisation;

source.


Do not use a historical vacancy number as though it represented permanent sanctioned strength.

Distinguish:

SANCTIONED_STRENGTH
CURRENT_VACANCY
RECRUITMENT_VACANCY
HISTORICAL_VACANCY


---

16. Pay Source Standard

Pay information should preferably come from:

official pay matrix;

finance department order;

government pay rules;

recruitment notification;

service rule.


Store separately:

paySystem
payLevel
startingBasic
maximumBasic
allowances

Never infer salary solely from job title.


---

17. West Bengal Pay

West Bengal pay must use the applicable West Bengal pay structure.

The system must not treat a West Bengal pay level as numerically equivalent to a Central Government 7th Central Pay Commission level.

The database must preserve:

WEST_BENGAL_PAY_SYSTEM

separately from:

CENTRAL_7TH_CPC


---

18. Salary Estimates

Salary estimates must be labelled.

Possible components:

Basic Pay
Dearness Allowance
House Rent Allowance
Transport / Other Applicable Allowances
Gross Salary
Retirement Contribution
Tax / TDS
Other Deductions
Estimated In-Hand

Estimated in-hand must never be presented as an official payroll figure unless an actual official payslip or equivalent official source supports it.


---

19. Housing Evidence

Housing claims must distinguish:

ENTITLEMENT
AVAILABILITY
ALLOTMENT
ACTUAL OCCUPANCY
COST

Evidence may include:

accommodation rules;

departmental housing rules;

police housing provisions;

railway accommodation rules;

allotment rules.


Do not state:

Government Quarter = Guaranteed

unless the applicable official rule genuinely guarantees it.


---

20. Promotion Evidence

Promotion information should preferably come from:

service rules;

recruitment rules;

promotion regulations;

departmental orders.


Every promotion statement should distinguish:

minimum qualifying service
selection method
seniority
departmental examination
vacancy dependence
selection committee
promotion eligibility

A minimum qualifying period is not necessarily the actual time an employee will wait for promotion.


---

21. Job-Profile Evidence

Actual duties should be supported by:

statutory functions;

official recruitment documents;

service rules;

departmental role descriptions;

official organisational documentation.


Analytical "typical day" descriptions must be clearly labelled:

ILLUSTRATIVE TYPICAL DAY

They must not be presented as official fixed schedules.


---

22. Work-Life Evidence

Government authorities frequently do not publish a universal real-world workload schedule.

Therefore distinguish:

OFFICIAL WORKING-HOURS RULE

from:

PRACTICAL ASSESSMENT

and:

ILLUSTRATIVE WORK PATTERN

Claims about night duty, emergencies, festival deployment or irregular schedules should be supported by the operational nature of the post and available official information.

Avoid false precision.


---

23. Family Compatibility Evidence

Family compatibility is normally an analytical assessment.

It may use evidence about:

transfer;

geographic posting;

shift duty;

emergency duty;

work predictability;

housing;

travel requirements.


The resulting score is:

PRACTICAL_ASSESSMENT

not an official government measure.


---

24. Authority Evidence

Authority claims must be based on:

statutory provisions;

service rules;

official departmental responsibilities;

legal powers;

role descriptions.


Avoid vague claims such as:

"Very powerful officer"

without explaining the actual nature of authority.

Authority dimensions may include:

administrative
statutory
investigation
enforcement
inspection
supervisory
financial
decision-making


---

25. Prestige Evidence

Prestige is generally subjective.

Unless there is a defensible objective basis, mark prestige as:

PRACTICAL_ASSESSMENT

It must not be presented as an official government classification.


---

26. Competition Evidence

Competition should be included only where reliable data exists.

Possible evidence:

applicants;

vacancies;

published cut-offs;

official statistics.


Do not invent:

application-to-vacancy ratio

from unsupported assumptions.

If reliable data cannot be established:

Reliable competition data not publicly verified.


---

27. Source Conflict Resolution

When two sources disagree:

1. Identify the exact conflicting claim.
2. Compare publication dates.
3. Determine whether either source is historical.
4. Check amendments and superseding rules.
5. Check whether both sources refer to the same post/cadre.
6. Prefer the applicable authoritative source.
7. Record the resolution.
8. Lower confidence when necessary.

The original conflict should remain visible in the audit record where material.


---

28. Evidence Confidence

Suggested confidence levels:

HIGH
MEDIUM_HIGH
MEDIUM
LOW
NOT_VERIFIED

HIGH

Current official source directly supports the claim.

MEDIUM_HIGH

Strong official support exists but some contextual detail is historical or indirect.

MEDIUM

Official source exists but current applicability or completeness is less certain.

LOW

Reliable secondary evidence supports the claim.

NOT_VERIFIED

Sufficient reliable public evidence has not been located.


---

29. Claim-Level Evidence

Important facts should be traceable at claim level where practical.

Example:

Claim:
B.Ed. required.

Source:
source-wb-education-001

Evidence Type:
OFFICIAL_RULE

Confidence:
HIGH

This is preferable to attaching one generic source to an entire page containing unrelated facts.


---

30. Source Preservation

Do not rewrite or overwrite original source metadata merely to improve presentation.

Preserve:

official title;

notification number;

order number;

publication date;

source authority;

original URL.


Localized display text may be added separately.


---

31. AI Use and Sources

The future AI assistant may retrieve and explain existing project evidence.

It must not invent sources.

The AI must distinguish:

SOURCE-BACKED FACT

from:

ANALYTICAL INTERPRETATION

and:

UNKNOWN / NOT VERIFIED


---

32. Source Quality and Release Policy

A new government fact should not be released into production merely because a web page mentions it.

Before publishing material eligibility, pay or recruitment information:

Discover
    ↓
Verify
    ↓
Classify
    ↓
Record source
    ↓
Validate
    ↓
Publish


---

33. Source Expiration

Some source records become stale.

The data-update workflow must periodically review:

open recruitment;

pay;

eligibility;

current rules;

government orders;

recruitment status.


Historical sources should normally remain preserved.

They should be marked historical rather than deleted simply because newer evidence exists.


---

34. Source Removal

Do not delete an old source solely because a new source supersedes it.

Instead:

old source
    →
HISTORICAL / SUPERSEDED

This maintains the audit trail.


---

35. Minimum Evidence Standard for Major Career Data

For a major career, the preferred evidence set includes:

Eligibility source
Recruitment source
Pay source
Service / recruitment-rule source
Current-status source

Additional evidence should be added where relevant for:

Physical
Medical
Housing
Promotion
Transfer
Benefits


---

36. Final Source Principle

> When evidence is unavailable, uncertainty is a valid result. GovCareer Compass must prefer an explicit "not verified" statement over a confident but unsupported claim.

