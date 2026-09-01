# GovCareer Compass — West Bengal Research Workspace

## 1. Purpose

This directory is the authoritative **research workspace** for discovering, investigating, verifying, auditing and maintaining government-service information relating to the Government of West Bengal.

It exists to support the GovCareer Compass production data layer.

This directory is not the website's final database.

The relationship is:

    Official Evidence
          ↓
    Research Record
          ↓
    Verification
          ↓
    Audit
          ↓
    Normalization
          ↓
    /data/states/west-bengal/
          ↓
    Website
          ↓
    Eligibility Engine
          ↓
    Recommendation Engine

The research workspace must preserve enough evidence that a later reviewer can understand:

- where a fact came from
- when it was verified
- what post/cadre it belongs to
- whether it is current or historical
- whether it is direct recruitment, promotion, deputation, contract or another route
- whether B.A. English Honours is eligible
- whether additional qualifications are required
- whether the information is official, historical, estimated or unresolved
- why a particular conclusion was made

---

## 2. Research Baseline

Research baseline:

**31 August 2026**

All current-status claims in this workspace must be interpreted relative to this research baseline unless a later update is explicitly recorded.

A document published before the baseline may still be current if the underlying rule remains applicable.

A document published after the baseline must not be incorporated into the 31 August 2026 production baseline without an explicit version/update decision.

---

## 3. Scope

The West Bengal research workspace covers:

### State-level government

- West Bengal Public Service Commission (WBPSC) recruitment
- State services
- State cadres
- Directorates
- Departments
- Attached offices
- Statutory authorities
- State recruitment boards
- Regular state-government posts

### Police and security

- Kolkata Police
- West Bengal Police
- West Bengal Police Recruitment Board (WBPRB)
- Eastern Frontier Rifles
- Correctional Administration
- Other officially verified police/security recruitment

### Rural and local administration

- Panchayats and Rural Development
- Zilla Parishads
- Panchayat Samitis
- Gram Panchayats
- Blocks
- District administration
- Local-government recruitment

### Education

- School Education
- School Service Commission
- Primary education
- Upper-primary education
- Secondary and higher-secondary teaching recruitment
- Non-teaching recruitment
- Clerical/support posts
- Librarian-related posts
- Other officially verified education-sector recruitment

### Revenue and enforcement

- Land and Land Reforms
- Revenue
- Excise
- Agricultural income tax
- Commercial-tax-related offices
- Consumer affairs
- Co-operation
- Labour
- Employment
- Other verified inspection/enforcement cadres

### Development and welfare

- Women and Child Development
- Social Welfare
- Backward Classes Welfare
- Tribal Development
- Minority Affairs
- Youth Services
- Sports
- Disaster Management
- North Bengal Development
- Paschimanchal Unnayan
- Sundarban Affairs
- Other verified development cadres

### Infrastructure and other departments

The official West Bengal department directory is used as the initial discovery universe for:

- Agriculture
- Agricultural Marketing
- Animal Resources Development
- Backward Classes Welfare
- Consumer Affairs
- Co-operation
- Correctional Administration
- Disaster Management and Civil Defence
- Environment
- Finance
- Fire and Emergency Services
- Fisheries
- Food and Supplies
- Food Processing Industries and Horticulture
- Forests
- Health and Family Welfare
- Higher Education
- Home and Hill Affairs
- Housing
- Industry, Commerce and Enterprises
- Information and Cultural Affairs
- Information Technology and Electronics
- Irrigation and Waterways
- Judicial
- Labour
- Land and Land Reforms and Refugee Relief and Rehabilitation
- Law
- Mass Education Extension and Library Services
- Micro, Small and Medium Enterprises and Textiles
- Minority Affairs and Madrasah Education
- Non-Conventional and Renewable Energy Sources
- North Bengal Development
- Panchayats and Rural Development
- Parliamentary Affairs
- Paschimanchal Unnayan Affairs
- Personnel and Administrative Reforms
- Planning and Statistics
- Power
- Programme Monitoring
- Public Enterprises and Industrial Reconstruction
- Public Health Engineering
- Public Works
- School Education
- Science and Technology and Biotechnology
- Self Help Group and Self Employment
- Sundarban Affairs
- Technical Education, Training and Skill Development
- Tourism
- Transport
- Tribal Development
- Urban Development and Municipal Affairs
- Water Resources Investigation and Development
- Women and Child Development and Social Welfare
- Youth Services and Sports

The directory is a discovery checklist, not proof that every department contains a B.A.-eligible post.

---

## 4. Candidate Target

The primary target candidate for GovCareer Compass is:

    B.A. (Bachelor of Arts)
    English Honours
    No additional specialist qualification assumed

The research must therefore specifically investigate:

- plain bachelor's-degree eligibility
- English-related advantage
- Bengali-language requirements
- subject-specific degree requirements
- B.Ed requirements
- D.El.Ed requirements
- B.El.Ed requirements
- TET requirements
- ITI requirements
- Diploma requirements
- computer requirements
- typing requirements
- shorthand requirements
- driving licence requirements
- experience requirements
- physical standards
- medical standards
- gender-specific requirements
- domicile/residency conditions
- reservation-related conditions
- minimum marks
- age requirements

---

## 5. Core Research Principle

Never infer eligibility from a post title.

For example:

    "Officer"
    "Assistant"
    "Inspector"
    "Clerk"
    "Development Officer"

does not itself establish qualification.

Every post must be checked against the relevant:

- recruitment advertisement
- recruitment rules
- service rules
- gazette
- government order
- official cadre document
- official establishment document
- official departmental source

---

## 6. Research Hierarchy

Use sources in this order wherever possible:

### Priority 1 — Primary official source

- Government of West Bengal
- West Bengal Finance Department
- WBPSC
- WBPRB
- Kolkata Police
- West Bengal Police
- relevant state department
- relevant directorate
- official district portal
- official board/commission
- official statutory authority
- official gazette
- official recruitment rule
- official service rule

### Priority 2 — Official historical source

Used when an active/current rule is not available but the historical record is necessary to understand the cadre.

### Priority 3 — Reputable secondary source

Used only to assist discovery or cross-checking.

### Priority 4 — Estimate

Used only when an analytical estimate is genuinely necessary.

No estimate may be promoted into an official fact.

---

## 7. Evidence Labels

Every research record must use one of these evidence classes:

### OFFICIAL_CURRENT

Current official information that is applicable or appears applicable as of the research baseline.

### OFFICIAL_HISTORICAL

Official material from an earlier recruitment cycle or earlier rule.

### OFFICIAL_RULE

Official service/recruitment/pay/gazette rule even where there is no current vacancy.

### SECONDARY

Information from a reputable non-government source used for discovery or cross-checking.

### ESTIMATE

Analytical calculation or reasoned estimate.

### NOT_VERIFIED

A claim for which sufficient public official evidence has not yet been located.

---

## 8. Recruitment Route Classification

Every post must be classified as one or more of:

- DIRECT_RECRUITMENT
- PROMOTION
- DEPUTATION
- TRANSFER
- CONTRACT
- OUTSOURCED
- TEMPORARY
- SCHEME_PROJECT
- COMBINED_ROUTE
- UNKNOWN

For the main candidate database:

DIRECT_RECRUITMENT should be clearly distinguished from other routes.

A promotion-only or deputation-only designation must not be presented as a fresh-entry career.

---

## 9. Employment Status Classification

Every post must be classified as:

- REGULAR
- TEMPORARY
- CONTRACTUAL
- OUTSOURCED
- SCHEME_PROJECT
- AD_HOC
- DEPUTATION
- UNKNOWN

Regular service is the primary category for the main career database.

---

## 10. Eligibility Classification

The research layer must ultimately support:

### A — DIRECTLY ELIGIBLE

B.A. English Honours satisfies the essential academic qualification and no undisclosed mandatory specialist qualification prevents application.

### B — CONDITIONALLY ELIGIBLE

B.A. English Honours satisfies the basic academic threshold but another condition must also be satisfied.

Examples:

- Bengali
- Mathematics in a specific school stage
- minimum marks
- typing
- shorthand
- computer skill
- driving licence
- physical standard
- medical standard
- experience
- particular subject combination
- domicile

### C — NOT ELIGIBLE WITH B.A. ENGLISH ALONE

A mandatory qualification is missing.

Examples:

- B.Ed where mandatory
- D.El.Ed where mandatory
- ITI trade where mandatory
- engineering degree
- law degree
- specialist science qualification
- specialist commerce qualification
- master's degree
- professional qualification

---

## 11. Hard Eligibility vs Soft Preference

This project must keep two systems completely separate.

### HARD ELIGIBILITY

Determines whether the candidate may apply.

Examples:

- required degree
- required subject
- B.Ed
- D.El.Ed
- ITI
- age
- physical standard
- medical standard
- required language
- required licence
- mandatory experience

Failure of a hard requirement must prevent the post from being recommended as an eligible career.

### SOFT PREFERENCE

Determines whether the candidate would prefer the job.

Examples:

- salary importance
- family time
- parent-care
- Kolkata preference
- lower transfer
- lower stress
- authority
- prestige
- housing
- career growth
- office work
- police interest

Soft preferences may rank eligible posts but may not override hard eligibility.

---

## 12. Discovery Methods

Every newly discovered post should record the discovery route.

Allowed discovery methods include:

- DEPARTMENT_DIRECTORY
- DIRECTORATE_DIRECTORY
- ORGANISATION_CHART
- SANCTIONED_STRENGTH
- CADRE_LIST
- SERVICE_RULE
- RECRUITMENT_RULE
- GAZETTE
- RECRUITMENT_ADVERTISEMENT
- CORRIGENDUM
- OFFICIAL_RESULT
- OFFICIAL_ANSWER_KEY
- OFFICIAL_NOTICE
- DISTRICT_PORTAL
- RECRUITMENT_BOARD
- PAY_STRUCTURE
- A_Z_SEARCH
- JOB_FAMILY_SEARCH
- QUALIFICATION_SEARCH
- PAY_LEVEL_SEARCH
- SECONDARY_DISCOVERY

---

## 13. No-Vacancy Rule

Absence of a current vacancy does not mean a cadre or post does not exist.

Therefore:

    CURRENT VACANCY
        ≠
    EXISTING CAREER

The database must separately store:

- existence of cadre/post
- latest known recruitment
- current vacancy status
- recruitment frequency
- historical status

---

## 14. Historical Control

A post may be:

- ACTIVE
- CURRENT_NO_RECRUITMENT
- HISTORICAL
- RENAMED
- MERGED
- REPLACED
- ABOLISHED
- TEMPORARY
- UNKNOWN

Historical evidence must remain in the research workspace even if the production database later excludes the post.

---

## 15. Relationship with Production Data

Research files feed:

    data/states/west-bengal/exams.json
    data/states/west-bengal/jobs.json
    data/states/west-bengal/departments.json
    data/states/west-bengal/organisations.json
    data/states/west-bengal/service-cadres.json
    data/states/west-bengal/eligibility-rules.json
    data/states/west-bengal/recruitment.json
    data/states/west-bengal/pay.json
    data/states/west-bengal/locations.json
    data/states/west-bengal/housing.json
    data/states/west-bengal/promotion.json
    data/states/west-bengal/benefits.json
    data/states/west-bengal/sources.json

Research is not automatically production-ready.

A finding must pass the applicable quality and verification rules before promotion.

---

## 16. Research Integrity Rules

Never:

- invent posts
- infer a qualification without evidence
- infer current vacancies from historical vacancies
- convert a promotion post into a direct-recruitment post
- treat a contract post as regular service
- equate similar titles automatically
- use one department's recruitment rule for another department
- reuse a physical standard from another recruitment cycle without verification
- reuse a historical pay scale as a current value without labelling it
- claim guaranteed housing without evidence
- claim guaranteed promotion timelines without evidence
- claim exact take-home salary without adequate allowance/deduction information
- claim a post is Kolkata-based merely because the department has a Kolkata office
- claim that B.A. English qualifies for a specialist post merely because "graduation" appears in a secondary source

---

## 17. Research-to-Production Promotion Rule

A finding may move from:

    research/
        ↓
    production data/

only when:

1. the post identity is established;
2. department/organisation identity is established;
3. recruitment route is established;
4. qualification is verified;
5. current/historical status is established;
6. source record exists;
7. relevant uncertainty is recorded;
8. conflicting evidence has been reviewed;
9. machine-readable identifiers are assigned;
10. schema validation succeeds.

---

## 18. Research Ownership Principle

This workspace is the project's evidence memory.

When a production JSON value changes, the corresponding research source and rationale should remain traceable.

Never overwrite historical research simply because the production value changed.

Instead:

    Old Evidence
        ↓
    New Evidence
        ↓
    Change Decision
        ↓
    Updated Production Value

---

## 19. Current Research State

The West Bengal research program is considered:

**IN PROGRESS**

Core recruitment authorities and several major recruitment streams have been identified, but the universe must continue expanding through:

- department-by-department discovery
- directorate discovery
- sanctioned-designation discovery
- service-rule discovery
- recruitment-rule discovery
- district discovery
- designation-family discovery
- A–Z discovery
- qualification discovery
- pay-level discovery

The research workspace must not claim absolute completeness.

---

## 20. Related Documentation

Primary governing documents:

- `/docs/RESEARCH-METHODOLOGY.md`
- `/docs/RESEARCH-AUDIT-MODEL.md`
- `/docs/SOURCE-STANDARDS.md`
- `/docs/CHANGE-MANAGEMENT.md`
- `/docs/DATA-UPDATE-WORKFLOW.md`
- `/docs/DATA-MODEL.md`
- `/docs/DATA-QUALITY.md`
- `/docs/ELIGIBILITY-MODEL.md`
- `/docs/RECOMMENDATION-MODEL.md`
- `/docs/SCORING-METHODOLOGY.md`
- `/docs/STATE-EXPANSION-MODEL.md`

---

## 21. Research Baseline Statement

This directory should always preserve the following principle:

> GovCareer Compass does not attempt to claim that it contains every government post that has ever existed. It aims to maintain the most comprehensive publicly researchable, evidence-traceable government-career catalogue that can be responsibly constructed from official and corroborated sources.
