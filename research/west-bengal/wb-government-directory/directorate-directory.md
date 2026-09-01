# GovCareer Compass — West Bengal Directorate Directory

## Document Status

- Document ID: `research-wb-directorate-directory`
- Scope: Directorate and field-office discovery
- Research baseline: `2026-08-31`
- Status: `ACTIVE`
- Evidence standard: Primary official source preferred

---

# 1. Purpose

Government departments are not sufficient for discovering all posts.

Many posts are located inside:

- directorates
- commissionerates
- directorates of specific functions
- regional offices
- divisional offices
- district offices
- field formations
- attached offices

This file therefore acts as the second-level organisation-discovery register.

---

# 2. Core Principle

Use:

    Department
        ↓
    Directorate / Attached Office
        ↓
    Organisational structure
        ↓
    Designations
        ↓
    Recruitment Rules
        ↓
    Recruitment
        ↓
    Eligibility

Do not assume the department name represents the complete establishment.

---

# 3. Official Directorate Discovery Anchors

Official West Bengal directory:

https://wb.gov.in/government-directories.aspx

Official contact directory:

https://wb.gov.in/contact-directories.aspx

Official department directory:

https://wb.gov.in/government-departments-page.aspx

Official department/organisation links discovered through government portals must be recorded in:

    SOURCE-REGISTER.md

before becoming a production source.

---

# 4. Known High-Priority Directorates / Organisations

The following are initial high-priority discovery targets identified through official government directory material.

## 4.1 Directorate of Commercial Taxes, West Bengal

Research location:

    research/west-bengal/directorates/commercial-taxes/

Discovery requirements:

- organisational structure
- posts
- inspectors
- clerical cadres
- administrative cadres
- recruitment rules
- current recruitment
- promotion rules

Official link discovered through Government of West Bengal related-directory material:

http://wbcomtax.nic.in

Status:

`PARTIAL`

---

## 4.2 Directorate of Land Records and Surveys

Research location:

    research/west-bengal/directorates/land-records-surveys/

Discovery requirements:

- survey establishment
- records staff
- field staff
- administrative posts
- technical vs non-technical separation
- recruitment rules
- promotion

Official directory link:

Use the current official Government of West Bengal directory entry rather than hard-coding an unverified replacement URL.

Status:

`PARTIAL`

---

## 4.3 Directorate of Library Services

Research location:

    research/west-bengal/directorates/library-services/

Discovery requirements:

- librarian
- library assistant
- library field administration
- clerical
- district library establishment
- Library Science qualification
- direct recruitment

Status:

`SUBSTANTIALLY_RESEARCHED`

---

## 4.4 West Bengal Forest Directorate / Wildlife Wing

Research location:

    research/west-bengal/directorates/forests/

Discovery requirements:

- Forest Guard
- field cadres
- wildlife cadres
- administrative staff
- clerical staff
- physical requirements
- medical requirements
- recruitment rules

Official directory link:

Use the current official Government of West Bengal directory entry.

Status:

`PARTIAL`

---

## 4.5 Directorate of Micro, Small and Medium Enterprises

Research location:

    research/west-bengal/directorates/msme/

Discovery requirements:

- officer cadres
- field cadres
- administrative
- clerical
- technical posts
- specialist qualifications

Official related-link source:

https://trainingss.wb.gov.in/related-links

Status:

`PARTIAL`

---

## 4.6 Directorate of Factories

Research location:

    research/west-bengal/directorates/factories/

Discovery requirements:

- inspector cadres
- technical inspector roles
- administrative/support cadres
- specialist qualification conditions

Official related-link source:

https://trainingss.wb.gov.in/related-links

Status:

`PARTIAL`

---

## 4.7 Directorate of Boilers

Research location:

    research/west-bengal/directorates/boilers/

Discovery requirements:

- inspection cadres
- technical requirements
- administrative posts
- support cadres

Official related-link source:

https://trainingss.wb.gov.in/related-links

Status:

`PARTIAL`

---

## 4.8 Directorate of Professional Tax

Research location:

    research/west-bengal/directorates/professional-tax/

Discovery requirements:

- tax administration
- inspector
- assessment
- clerical
- enforcement
- specialist conditions

Official related-link source:

https://trainingss.wb.gov.in/related-links

Status:

`PARTIAL`

---

## 4.9 Directorate of Registration and Stamp Revenue

Research location:

    research/west-bengal/directorates/registration-stamp-revenue/

Discovery requirements:

- registration administration
- inspector/field positions
- clerical cadres
- district offices
- service rules
- recruitment rules

Official related-link source:

https://trainingss.wb.gov.in/related-links

Status:

`PARTIAL`

---

## 4.10 Fire and Emergency Services Directorate/Organisation

Research location:

    research/west-bengal/fire/

Discovery requirements:

- Fire Operator
- fireman-type posts
- driver
- control room
- administrative
- clerical
- physical
- medical
- shift requirements

Official related-link source:

https://trainingss.wb.gov.in/related-links

Status:

`PARTIAL`

---

# 5. Directorate Discovery Method

For each department:

1. open official department page;
2. inspect organisation/administration pages;
3. inspect department links;
4. inspect official directory links;
5. search official documents for:
   - "Directorate"
   - "Director"
   - "Joint Director"
   - "Deputy Director"
   - "Assistant Director"
   - "Regional Office"
   - "Divisional Office"
   - "District Office"
   - "Field Office"
6. record discovered organisation;
7. locate establishment structure;
8. locate designation/cadre documents;
9. locate recruitment rules;
10. locate direct-recruitment advertisements.

---

# 6. Directorate Status Values

Each directorate must be classified as:

- DISCOVERED
- IDENTITY_VERIFIED
- ORGANISATION_VERIFIED
- DESIGNATION_AUDITED
- RECRUITMENT_AUDITED
- RULES_AUDITED
- PRODUCTION_MAPPED
- PARTIAL
- NOT_VERIFIED
- HISTORICAL

---

# 7. Directorate-Level Designation Search

Search for:

- Director
- Joint Director
- Deputy Director
- Assistant Director
- Administrative Officer
- Superintendent
- Inspector
- Sub-Inspector
- Assistant Sub-Inspector
- Auditor
- Accountant
- Assistant
- Clerk
- Typist
- Stenographer
- Record Keeper
- Field Officer
- Extension Officer
- Programme Officer
- Research Assistant
- Guard
- Driver
- support posts

These are discovery terms only.

Qualification must be verified separately.

---

# 8. Directorate-to-Department Relationship

Every directorate record must eventually identify:

    departmentId

and, where appropriate:

    organisationId

Example:

    Department
        dept-wb-forest

    Directorate
        forest-directorate

    Organisation
        forest-directorate

    Posts
        Forest Guard
        other verified cadres

Do not place the directorate itself into `jobs.json` unless it is an actual recruitable organisation/post.

---

# 9. Directorate Recruitment Rule

A directorate recruitment notice is not automatically evidence of a permanent cadre.

The researcher must determine:

- regular
- temporary
- contract
- scheme/project
- deputation
- outsourced

---

# 10. Directorate Qualification Rule

A directorate may contain both:

    technical posts

and:

    general administrative posts

Therefore:

    "department is technical"
        ≠
    "every post requires technical qualification"

Each post must be checked independently.

---

# 11. Production Mapping

Verified directorates should map to:

    data/states/west-bengal/organisations.json

and relevant jobs to:

    data/states/west-bengal/jobs.json

Rules to:

    data/states/west-bengal/eligibility-rules.json

Sources to:

    data/states/west-bengal/sources.json

---

# 12. No-Fabrication Requirement

If a directorate is mentioned by a secondary source but the official organisational existence cannot be confirmed:

    status = NOT_VERIFIED

Do not create a production organisation solely from a secondary source.

---

# 13. Current Directorate Research Priority

High priority:

1. Land Records and Surveys
2. Commercial Taxes
3. Registration and Stamp Revenue
4. Forest/Wildlife
5. Library Services
6. Labour/Employment
7. Food and Supplies
8. Social Welfare
9. Fire and Emergency Services
10. Transport
11. Urban/Municipal directorates
12. Agriculture-related directorates
13. other department-linked directorates

---

# 14. Research Conclusion

Directorate research is a necessary second-level discovery mechanism.

The absence of a recruitment notice does not prove that a directorate has no government posts.

A directorate must remain in research until:

- its organisational status is understood;
- its major designation families are investigated;
- recruitment routes are checked;
- relevant rules are checked;
- unresolved issues are documented.
