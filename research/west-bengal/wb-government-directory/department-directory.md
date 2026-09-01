# GovCareer Compass — West Bengal Government Department Directory

## Document Status

- Document ID: `research-wb-department-directory`
- Scope: Government of West Bengal department discovery
- Research baseline: `2026-08-31`
- Evidence priority: Primary official source
- Current status: `ACTIVE_DISCOVERY_REGISTER`
- Production status: `NOT_A_PRODUCTION_DATA_FILE`

---

# 1. Purpose

This file is the master department-discovery register for the West Bengal research program.

Its purpose is to establish:

1. which Government of West Bengal departments/portfolios are currently exposed through the official government portal;
2. which department websites must be investigated;
3. which departments contain or may contain government-service posts;
4. which departments require designation/cadre investigation;
5. which departments require recruitment-rule investigation;
6. which departments require district/directorate investigation;
7. which departments have already been transferred into the production data layer;
8. which departments remain partially audited.

This document is a **research index**, not a claim that each department contains a B.A.-eligible government post.

---

# 2. Canonical Official Discovery Source

Primary source:

Government of West Bengal — Government Departments

URL:

https://wb.gov.in/government-departments-page.aspx

Supporting official directory:

https://wb.gov.in/government-directories.aspx

Supporting official contact directory:

https://wb.gov.in/contact-directories.aspx

These sources are the initial department-discovery anchors for this project.

---

# 3. Department ID Policy

Production department IDs must remain stable.

Use:

    dept-wb-<stable-slug>

Examples:

    dept-wb-agriculture
    dept-wb-finance
    dept-wb-home-hill-affairs
    dept-wb-panchayat-rural
    dept-wb-school-education

Do not change an existing ID merely because the public-facing department title is reformatted.

If an official portfolio is renamed or reorganised:

1. preserve the historical name in research;
2. record the new official name;
3. determine whether the production ID should remain stable;
4. record the change in `CHANGE-MANAGEMENT.md`;
5. do not silently overwrite historical evidence.

---

# 4. Official Department Universe

The following is the baseline department universe currently exposed through the official Government of West Bengal department directory.

## 4.1 Agriculture

- Production ID: `dept-wb-agriculture`
- Official directory name: `Agriculture`
- Research area: `research/west-bengal/departments/agriculture/`
- Primary questions:
  - What directorates exist?
  - What cadres exist?
  - What non-specialist posts exist?
  - Are there clerical/administrative posts?
  - Are there B.A.-eligible posts?
  - Do posts require Agriculture/Science qualifications?
- Audit status: `PARTIAL`

---

## 4.2 Agricultural Marketing

- Production ID: `dept-wb-agricultural-marketing`
- Official directory name: `Agriculture Marketing`
- Research area: `research/west-bengal/departments/agricultural-marketing/`
- Key discovery terms:
  - Agricultural Marketing
  - Assistant Agricultural Marketing Officer
  - administrative posts
  - marketing inspector/field posts
  - clerical posts
- Audit status: `PARTIAL`

---

## 4.3 Animal Resources Development

- Production ID: `dept-wb-animal-resources`
- Official directory name: `Animal Resources Development`
- Research area: `research/west-bengal/departments/animal-resources-development/`
- Specialist-qualification caution: `HIGH`
- Audit status: `PARTIAL`

---

## 4.4 Backward Classes Welfare

- Production ID: `dept-wb-backward-classes`
- Official directory name: `Backward Classes Welfare`
- Research area: `research/west-bengal/departments/backward-classes-welfare/`
- Discovery terms:
  - Welfare Officer
  - Inspector
  - administrative
  - clerical
  - district welfare
- Audit status: `PARTIAL`

---

## 4.5 Consumer Affairs

- Production ID: `dept-wb-consumer-affairs`
- Official directory name: `Consumer Affairs`
- Research area: `research/west-bengal/departments/consumer-affairs/`
- Discovery terms:
  - Consumer Welfare Officer
  - inspection
  - administrative
  - district consumer structures
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.6 Co-operation

- Production ID: `dept-wb-cooperation`
- Official directory name: `Co-operation`
- Research area: `research/west-bengal/departments/cooperation/`
- Discovery terms:
  - cooperative service
  - auditor
  - inspector
  - assistant auditor
  - administrative
  - cooperative field offices
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.7 Correctional Administration

- Production ID: `dept-wb-correctional`
- Official directory name: `Correctional Administration`
- Research area: `research/west-bengal/correctional/`
- Key organisation:
  - `org-west-bengal-correctional`
- Key recruitment authority:
  - `org-wbprb`
- Discovery terms:
  - Warder
  - Female Warder
  - correctional officer
  - administrative
  - clerical
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.8 Disaster Management and Civil Defence

- Production ID: `dept-wb-disaster-management`
- Official directory name: `Disaster Management and Civil Defence`
- Research area: `research/west-bengal/departments/disaster-management-civil-defence/`
- Discovery terms:
  - Disaster Management Officer
  - Block Disaster Management Officer
  - Civil Defence
  - district disaster management
  - control-room/support roles
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.9 Environment

- Production ID: `dept-wb-environment`
- Official directory name: `Environment`
- Research area: `research/west-bengal/departments/environment/`
- Specialist caution: `HIGH`
- Audit status: `PARTIAL`

---

## 4.10 Finance

- Production ID: `dept-wb-finance`
- Official directory name: `Finance`
- Research area: `research/west-bengal/departments/finance/`
- Discovery terms:
  - treasury
  - accounts
  - audit
  - finance administration
  - clerical
  - cash
- Major cross-reference:
  - ROPA/pay rules
- Audit status: `PARTIAL`

---

## 4.11 Fire and Emergency Services

- Production ID: `dept-wb-fire`
- Official directory name: `Fire and Emergency Services`
- Research area: `research/west-bengal/fire/`
- Discovery terms:
  - Fire Operator
  - Fireman-type roles
  - Driver
  - Control Room
  - station/support staff
- Audit status: `PARTIAL`

---

## 4.12 Fisheries

- Production ID: `dept-wb-fisheries`
- Official directory name: `Fisheries`
- Research area: `research/west-bengal/departments/fisheries/`
- Specialist caution: `HIGH`
- Audit status: `PARTIAL`

---

## 4.13 Food and Supplies

- Production ID: `dept-wb-food-supplies`
- Official directory name: `Food and Supplies`
- Research area: `research/west-bengal/departments/food-supplies/`
- Discovery terms:
  - food supply administration
  - inspector
  - field inspection
  - administrative
  - clerical
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.14 Food Processing Industries and Horticulture

- Production ID: `dept-wb-food-processing-horticulture`
- Official directory name: `Food Processing Industries and Horticulture`
- Research area: `research/west-bengal/departments/food-processing-horticulture/`
- Specialist caution: `HIGH`
- Audit status: `PARTIAL`

---

## 4.15 Forest

- Production ID: `dept-wb-forest`
- Official directory name: `Forest`
- Research area: `research/west-bengal/forest/`
- Discovery terms:
  - Forest Guard
  - field staff
  - wildlife
  - clerical
  - administration
- Physical/medical audit: `REQUIRED`
- Audit status: `PARTIAL`

---

## 4.16 Health and Family Welfare

- Production ID: `dept-wb-health`
- Official directory name: `Health and Family Welfare`
- Research area: `research/west-bengal/departments/health-family-welfare/`
- Specialist caution: `VERY_HIGH`
- Non-specialist administrative posts still require separate research.
- Audit status: `PARTIAL`

---

## 4.17 Higher Education

- Production ID: `dept-wb-higher-education`
- Official directory name: `Higher Education`
- Research area: `research/west-bengal/departments/higher-education/`
- Discovery terms:
  - administrative
  - college/university non-teaching
  - clerical
  - assistant
- Audit status: `PARTIAL`

---

## 4.18 Home and Hill Affairs

- Production ID: `dept-wb-home-hill-affairs`
- Official directory name: `Home and Hill Affairs`
- Research area: `research/west-bengal/departments/home-hill-affairs/`
- Key organisations:
  - `org-kolkata-police`
  - `org-west-bengal-police`
- Key recruitment authority:
  - `org-wbprb`
- Major career families:
  - Police
  - Security
  - Correctional
  - other home/security organisations
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.19 Housing

- Production ID: `dept-wb-housing`
- Official directory name: `Housing`
- Research area: `research/west-bengal/departments/housing/`
- Discovery terms:
  - administrative
  - housing boards
  - clerical
  - field/inspection
- Audit status: `PARTIAL`

---

## 4.20 Industry, Commerce and Enterprises

- Production ID: `dept-wb-industry-commerce`
- Official directory name: `Industry Commerce and Enterprises`
- Research area: `research/west-bengal/departments/industry-commerce-enterprises/`
- Audit status: `PARTIAL`

---

## 4.21 Information and Cultural Affairs

- Production ID: `dept-wb-information-cultural`
- Official directory name: `Information and Cultural Affairs`
- Research area: `research/west-bengal/departments/information-cultural-affairs/`
- Discovery terms:
  - information
  - publicity
  - cultural administration
  - administrative
  - clerical
- Specialist qualification audit: `REQUIRED`
- Audit status: `PARTIAL`

---

## 4.22 Information Technology and Electronics

- Production ID: `dept-wb-it-electronics`
- Official directory name: `Information Technology and Electronics`
- Research area: `research/west-bengal/departments/information-technology-electronics/`
- Specialist caution: `VERY_HIGH`
- General administrative posts still require separate research.
- Audit status: `PARTIAL`

---

## 4.23 Irrigation and Waterways

- Production ID: `dept-wb-irrigation-waterways`
- Official directory name: `Irrigation and Waterways`
- Research area: `research/west-bengal/departments/irrigation-waterways/`
- Specialist caution: `HIGH`
- Audit status: `PARTIAL`

---

## 4.24 Judicial

- Production ID: `dept-wb-judicial`
- Official directory name: `Judicial`
- Research area: `research/west-bengal/departments/judicial/`
- Law-specialist caution: `HIGH`
- Non-law administrative jobs require separate verification.
- Audit status: `PARTIAL`

---

## 4.25 Labour

- Production ID: `dept-wb-labour`
- Official directory name: `Labour`
- Research area: `research/west-bengal/departments/labour/`
- Discovery terms:
  - Labour Service
  - Labour Inspector
  - welfare
  - employment administration
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.26 Land and Land Reforms and Refugee Relief and Rehabilitation

- Production ID: `dept-wb-land`
- Official directory name: `Land and Land Reforms & Refugee Relief and Rehabilitation`
- Research area: `research/west-bengal/departments/land-land-reforms/`
- Discovery terms:
  - revenue
  - land
  - records
  - rehabilitation
  - field administration
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.27 Law

- Production ID: `dept-wb-law`
- Official directory name: `Law`
- Research area: `research/west-bengal/departments/law/`
- LL.B/law-specialist caution: `VERY_HIGH`
- Audit status: `PARTIAL`

---

## 4.28 Mass Education Extension and Library Services

- Production ID: `dept-wb-mass-education-library`
- Official directory name: `Mass Education Extension and Library Services`
- Research area: `research/west-bengal/departments/mass-education-library/`
- Discovery terms:
  - Extension Officer
  - Lady Extension Officer
  - library
  - librarian
  - clerical
- Library Science qualification must be checked separately.
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.29 Micro, Small and Medium Enterprises and Textiles

- Production ID: `dept-wb-msme-textiles`
- Official directory name: `Micro Small and Medium Enterprise and Textile`
- Research area: `research/west-bengal/departments/msme-textiles/`
- Audit status: `PARTIAL`

---

## 4.30 Minority Affairs and Madrasah Education

- Production ID: `dept-wb-minority`
- Official directory name: `Minorities Affairs and Madrasah Education`
- Research area: `research/west-bengal/departments/minority-affairs-madrasah-education/`
- Education/welfare specialist audit: `REQUIRED`
- Audit status: `PARTIAL`

---

## 4.31 Non-Conventional and Renewable Energy Sources

- Production ID: `dept-wb-non-conventional-energy`
- Research area: `research/west-bengal/departments/non-conventional-renewable-energy/`
- Specialist caution: `HIGH`
- Audit status: `PARTIAL`

---

## 4.32 North Bengal Development

- Production ID: `dept-wb-north-bengal-development`
- Official directory name: `North Bengal Development`
- Research area: `research/west-bengal/departments/north-bengal-development/`
- Discovery terms:
  - development administration
  - programme
  - field
  - clerical
- Audit status: `PARTIAL`

---

## 4.33 Panchayats and Rural Development

- Production ID: `dept-wb-panchayat-rural`
- Official directory name: `Panchayat and Rural Development`
- Research area: `research/west-bengal/panchayat/`
- Discovery levels:
  - State
  - District
  - Block
  - Panchayat Samiti
  - Zilla Parishad
  - Gram Panchayat
- Major career families:
  - Panchayat Development Officer
  - Executive Assistant
  - Panchayat Secretary
  - Accounts Clerk
  - Sahayak
  - Gram Panchayat support cadres
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.34 Parliamentary Affairs

- Production ID: `dept-wb-parliamentary-affairs`
- Official directory name: `Parliamentary Affairs`
- Research area: `research/west-bengal/departments/parliamentary-affairs/`
- Audit status: `PARTIAL`

---

## 4.35 Paschimanchal Unnayan Affairs

- Production ID: `dept-wb-paschimanchal`
- Official directory name: `Paschimanchal Unnayan Affairs`
- Research area: `research/west-bengal/departments/paschimanchal-unnayan/`
- Audit status: `PARTIAL`

---

## 4.36 Personnel and Administrative Reforms

- Production ID: `dept-wb-personnel`
- Official directory name: `Personnel and Administrative Reforms`
- Research area: `research/west-bengal/departments/personnel-administrative-reforms/`
- Critical research role:
  - state service rules
  - cadre rules
  - personnel rules
  - administrative structure
- Audit status: `PARTIAL`

---

## 4.37 Planning and Statistics

- Production ID: `dept-wb-planning-statistics`
- Official directory name: `Planning, Statistics`
- Research area: `research/west-bengal/departments/planning-statistics/`
- Statistics-specialist caution: `HIGH`
- General administrative posts require separate audit.
- Audit status: `PARTIAL`

---

## 4.38 Power

- Production ID: `dept-wb-power`
- Official directory name: `Power`
- Research area: `research/west-bengal/departments/power/`
- Specialist caution: `HIGH`
- State-owned corporations must be separately classified.
- Audit status: `PARTIAL`

---

## 4.39 Programme Monitoring

- Production ID: `dept-wb-programme-monitoring`
- Official directory name: `Programme Monitoring`
- Research area: `research/west-bengal/departments/programme-monitoring/`
- Discovery terms:
  - Programme Officer
  - administrative
  - monitoring
  - field
- Audit status: `PARTIAL`

---

## 4.40 Public Enterprises and Industrial Reconstruction

- Production ID: `dept-wb-public-enterprises`
- Official directory name: `Public Enterprises and Industrial Reconstruction`
- Research area: `research/west-bengal/departments/public-enterprises/`
- Important classification:
  - Department
  - Government-controlled enterprise
  - PSU/corporation
- These must not be silently mixed.
- Audit status: `PARTIAL`

---

## 4.41 Public Health Engineering

- Production ID: `dept-wb-public-health-engineering`
- Official directory name: `Public Health Engineering`
- Research area: `research/west-bengal/departments/public-health-engineering/`
- Specialist caution: `VERY_HIGH`
- Administrative/non-technical posts still require investigation.
- Audit status: `PARTIAL`

---

## 4.42 Public Works

- Production ID: `dept-wb-public-works`
- Official directory name: `Public Works`
- Research area: `research/west-bengal/departments/public-works/`
- Engineering-specialist caution: `VERY_HIGH`
- General administrative posts require separate research.
- Audit status: `PARTIAL`

---

## 4.43 School Education

- Production ID: `dept-wb-school-education`
- Official directory name: `School Education`
- Research area: `research/west-bengal/school/`
- Organisations:
  - West Bengal Central School Service Commission
  - West Bengal Board of Primary Education
- Major qualification dependencies:
  - B.Ed
  - D.El.Ed
  - B.El.Ed
  - TET
  - subject qualification
  - marks
- Major recruitment families:
  - Primary
  - Upper Primary
  - IX–X
  - XI–XII
  - non-teaching
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.44 Science and Technology and Biotechnology

- Production ID: `dept-wb-science-technology`
- Research area: `research/west-bengal/departments/science-technology-biotechnology/`
- Specialist caution: `VERY_HIGH`
- Audit status: `PARTIAL`

---

## 4.45 Self Help Group and Self Employment

- Production ID: `dept-wb-self-help`
- Official directory name: `Self Help Group and Self Employment`
- Research area: `research/west-bengal/departments/self-help-self-employment/`
- Audit status: `PARTIAL`

---

## 4.46 Sundarban Affairs

- Production ID: `dept-wb-sundarban`
- Official directory name: `Sundarban Affairs`
- Research area: `research/west-bengal/departments/sundarban-affairs/`
- Geographic focus: Sundarban region
- Audit status: `PARTIAL`

---

## 4.47 Technical Education, Training and Skill Development

- Production ID: `dept-wb-technical-education`
- Official directory name: `Technical Education, Training & Skill Development`
- Research area: `research/west-bengal/departments/technical-education-training-skill-development/`
- Critical qualification discovery:
  - ITI
  - trade certificates
  - diplomas
  - technical degrees
  - administrative posts
- Audit status: `PARTIAL`

---

## 4.48 Tourism

- Production ID: `dept-wb-tourism`
- Official directory name: `Tourism`
- Research area: `research/west-bengal/departments/tourism/`
- Government corporation/enterprise distinction required.
- Audit status: `PARTIAL`

---

## 4.49 Transport

- Production ID: `dept-wb-transport`
- Official directory name: `Transport`
- Research area: `research/west-bengal/departments/transport/`
- Discovery terms:
  - inspector
  - motor-vehicle administration
  - clerical
  - enforcement
  - driver
- Licence/technical requirements must be individually checked.
- Audit status: `PARTIAL`

---

## 4.50 Tribal Development

- Production ID: `dept-wb-tribal-development`
- Official directory name: `Tribal Development`
- Research area: `research/west-bengal/departments/tribal-development/`
- Audit status: `PARTIAL`

---

## 4.51 Urban Development and Municipal Affairs

- Production ID: `dept-wb-urban-development`
- Official directory name: `Urban Development and Municipal Affairs`
- Research area: `research/west-bengal/departments/urban-development-municipal-affairs/`
- Must be separated into:
  - state department
  - municipalities
  - municipal corporations
  - development authorities
- Audit status: `PARTIAL`

---

## 4.52 Water Resources Investigation and Development

- Production ID: `dept-wb-water-resources`
- Official directory name: `Water resource Investigation and Development`
- Research area: `research/west-bengal/departments/water-resources-investigation-development/`
- Specialist caution: `HIGH`
- Audit status: `PARTIAL`

---

## 4.53 Women and Child Development and Social Welfare

- Production ID: `dept-wb-women-child-social-welfare`
- Official directory name: `Women and Child Development and Social Welfare`
- Research area: `research/west-bengal/departments/women-child-development-social-welfare/`
- Discovery terms:
  - welfare
  - child protection
  - women/child development
  - supervisory roles
  - administrative roles
- Scheme/contractual distinction required.
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

## 4.54 Youth Services and Sports

- Production ID: `dept-wb-youth-sports`
- Official directory name: `Youth Services and Sports`
- Research area: `research/west-bengal/departments/youth-services-sports/`
- Discovery terms:
  - Block Youth Officer
  - Municipal Youth Officer
  - Borough Youth Officer
  - sports administration
- Audit status: `SUBSTANTIALLY_RESEARCHED`

---

# 5. Department Audit Requirements

For every department the researcher must check:

## Identity

- official department name
- official URL
- ministry/administrative control if applicable
- Secretary/Principal Secretary page where useful
- official contact details

## Organisation

- directorates
- attached offices
- boards
- commissions
- corporations
- field offices

## Establishment

- sanctioned strength
- designation list
- cadre list
- organisational chart
- manpower statement

## Recruitment

- recruitment authority
- direct recruitment
- promotion
- deputation
- transfer
- contract
- outsourcing
- project/scheme recruitment

## Eligibility

- Class 8
- Class 10
- Class 12
- graduate
- postgraduate
- specialist qualification
- skill qualification
- language
- physical
- medical
- experience

## Pay

- ROPA level
- basic pay
- maximum basic
- DA
- HRA
- special allowances
- other benefits

## Career

- posting
- transfer
- promotion
- probation
- training
- retirement

## Family

- office/field
- night duty
- weekend duty
- emergency duty
- geographic stability
- housing

---

# 6. Department Status Rules

A department must not be marked COMPLETE merely because its recruitment page was visited.

COMPLETE requires:

- department identity checked;
- organisations checked;
- directorates checked where available;
- designation/cadre structure checked where available;
- recruitment sources checked;
- service/recruitment rules checked where applicable;
- district/field structure checked where applicable;
- B.A. eligibility implications investigated;
- unresolved issues documented.

---

# 7. Official Directory Change Detection

Whenever the Government of West Bengal changes the department directory:

1. capture the new directory;
2. compare the department list;
3. identify renamed departments;
4. identify merged departments;
5. identify split portfolios;
6. identify new departments;
7. identify discontinued portfolios;
8. update this file;
9. update `data/common/governments.json` or related production data only where necessary;
10. update `CHANGELOG.md`;
11. preserve historical research.

---

# 8. Important Warning

Department presence does not establish employment eligibility.

For example:

    Department exists
        ↓
    Organisation exists
        ↓
    Cadre exists
        ↓
    Post exists
        ↓
    Recruitment route exists
        ↓
    Qualification verified
        ↓
    B.A. English eligibility determined

Every step is necessary.

---

# 9. Official Discovery Anchors

Primary:

https://wb.gov.in/government-departments-page.aspx

Secondary official directory:

https://wb.gov.in/government-directories.aspx

Official government portal:

https://wb.gov.in/

Official government contact directory:

https://wb.gov.in/contact-directories.aspx

---

# 10. Current Audit Conclusion

The department-level universe is sufficiently established for systematic research.

The department directory must remain a **living discovery index**.

It must not be treated as a complete government-post catalogue.
