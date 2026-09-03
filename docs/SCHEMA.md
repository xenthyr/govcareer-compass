GovCareer Compass — Data Schema Guide

Document status: Permanent
Document version: 1.1.0

---

1. Schema Purpose

The JSON schemas under:

/data/schemas/

are machine-readable contracts for production data.

They exist to ensure that data:

- has the expected structure;
- uses valid types;
- uses valid controlled values;
- preserves required fields;
- prevents malformed records.

Schemas validate structure.

They do not prove that a government fact is true.

Truth still requires source verification.

The machine-readable schema files are the structural source of truth. This document explains those contracts for developers and researchers; it must follow the actual schemas and must not define a separate or older data contract.

---

2. Canonical Production Data

Canonical production records live under:

/data/common/
/data/central/
/data/states/

Research records live under:

/research/

Indexes are derived:

/data/indexes/

Schemas define structure:

/data/schemas/

Canonical entities must remain distinct. Derived indexes, search tokens, rankings, and other generated values must not replace canonical records or authoritative relationships.

---

3. Required Entity Schemas

The schema set includes machine-readable contracts for the production entities used by the application, including:

job.schema.json
exam.schema.json
department.schema.json
organisation.schema.json
recruitment.schema.json
source.schema.json
assessment-question.schema.json
state.schema.json
eligibility-rule.schema.json
service-cadre.schema.json
shared.schema.json

The exact set of schema files under /data/schemas/ is authoritative. This guide must be updated whenever a finalized machine-readable contract changes.

---

4. Job Schema — Canonical Relational Structure

The Job schema is the canonical schema for an individual government post or career entry. A Job record is relational: it keeps post identity, recruitment, eligibility, lifestyle and analysis together where appropriate, while referencing reusable canonical entities instead of embedding duplicate profile objects.

The required top-level Job fields are:

id
identity
recruitment
eligibility
payProfileId
locationProfileId
housingProfileId
promotionProfileId
benefitProfileId
lifestyle
analysis
sourceIds
confidence
currentness
lastVerified
dataVersion

A valid Job record must contain all of these fields.

The Job schema uses additionalProperties: false. Undocumented top-level fields are therefore not part of the canonical Job contract.

---

5. Job Identity Structure

The required identity object contains:

governmentId
departmentId
organisationId
post

It may also contain canonical relationships and descriptive fields such as:

stateId
serviceCadreId
abbreviation
roleType
description
parentPostId
aliases
historicalNames

Important rules:

- governmentId, departmentId and organisationId identify the governing and institutional context of the post.
- stateId is optional because a post may belong to a central or otherwise non-state-specific context.
- serviceCadreId is a reference to a separate Service/Cadre entity; the full cadre record is not duplicated inside the Job.
- parentPostId is a relationship to another canonical Job when a post hierarchy is needed.
- post is the canonical designation/post name.

Job identity establishes what the post is. It does not by itself establish candidate eligibility, current recruitment availability, salary, or recommendation suitability.

---

6. Job Recruitment Structure

The required recruitment object contains:

routeIds
mode
careerStatus
freshEntryEligible

It may also contain:

examIds
recruitmentIds
currentRecruitmentStatus
recruitmentNotes

The recruitment structure distinguishes the existence/status of a career or post from candidate-specific eligibility.

In particular:

- routeIds represent recruitment route identifiers or route classifications.
- examIds reference canonical examination entities where applicable.
- recruitmentIds reference canonical recruitment records.
- mode describes the recruitment/appointment mode defined by the machine-readable schema.
- careerStatus describes whether the career/post is active, historical, abolished, replaced, superseded, not verified, or unknown according to the schema.
- freshEntryEligible is a post/career-level recruitment attribute. It is not a candidate-specific eligibility decision.
- currentRecruitmentStatus describes the modeled current recruitment state and must not be confused with the existence of the career itself.

---

7. Job Eligibility Structure

The required eligibility object contains:

educationLevel
minimumQualification
ruleIds
baEnglishAssessment

It may also contain:

qualificationIds
minimumQualificationId
overqualification
eligibilitySummary
notes

The distinction between descriptive qualification information and authoritative rules is mandatory.

educationLevel and minimumQualification provide structured/human-readable summaries of the qualification level and minimum qualification.

qualificationIds and minimumQualificationId reference canonical Qualification entities where applicable.

ruleIds are the authoritative runtime eligibility relationship. The Eligibility Engine evaluates the referenced canonical eligibility rules; the descriptive fields in the Job record must never override, replace, or silently redefine those rules.

The eligibility-rule schema defines reusable rules that can target Jobs, Exams, Service Cadres, or Recruitment records. Rule semantics include the hard/soft distinction, condition type, operator, effect, dependencies, and verification requirements.

Candidate-specific eligibility outcomes are application results. They are not canonical facts stored in the Job record.

---

8. B.A. English Assessment Is Not Runtime Authority

baEnglishAssessment is a research-time/display classification for the baseline B.A. English Honours profile.

Allowed values are defined by the machine-readable Job schema, including:

DIRECT
CONDITIONAL
NOT_ELIGIBLE
CURRENT_NOTIFICATION_REQUIRED
NOT_VERIFIED
NOT_APPLICABLE

This field is not the authoritative runtime eligibility decision.

The application must use eligibility.ruleIds and the canonical Eligibility Engine for runtime eligibility. A baEnglishAssessment value may be displayed as a research assessment or convenience classification, but it must not be used as a substitute for rule evaluation.

---

9. Job Profile References

The Job record contains these required canonical profile references:

payProfileId
locationProfileId
housingProfileId
promotionProfileId
benefitProfileId

These fields reference separate canonical entities. The referenced profile objects are not embedded as duplicate nested objects inside the Job record.

This relational structure is required for consistency, reuse, updateability, source tracking, and cross-job relationships.

Conceptually:

Job
├── payProfileId ───────> Pay entity
├── locationProfileId ──> Location entity
├── housingProfileId ───> Housing entity
├── promotionProfileId ─> Promotion entity
└── benefitProfileId ───> Benefits entity

The Job schema therefore must not be documented as if it contains canonical nested pay, location, housing, promotion, or benefit profile objects.

The same principle applies to other first-class entities referenced by ID, including the Service/Cadre, Exam, Recruitment, Qualification, and Eligibility Rule relationships defined by the live schemas.

---

10. Job Lifestyle Structure

The required lifestyle object is an analytical work-profile structure. It is not an eligibility rule and is not an official recruitment entitlement by itself.

The machine-readable Job schema supports characteristics such as:

deskField
publicInteractionScore
computerWorkScore
legalWorkScore
accountsWorkScore
investigationScore
inspectionScore
supervisionScore
workLifeScore
predictabilityScore
stressBurden
riskBurden
nightDutyBurden
shiftDutyBurden
holidayDutyBurden
emergencyDutyBurden
travelBurden
courtDutyBurden
uniformStatus
uniformScore
nightDutyStatus
shiftDutyStatus
holidayDutyStatus
emergencyDutyStatus

These values are analytical characteristics derived from documented service/post conditions. They are not themselves government rules establishing eligibility, pay, appointment status, or legal entitlement.

---

11. Job Analysis Structure

The required analysis object is also analytical. It is used by comparison, recommendation, ranking, and explanatory systems rather than serving as an official recruitment document.

The machine-readable schema supports analytical measures such as:

familyCompatibilityBase
parentCareCompatibilityBase
authority
socialStatus
careerGrowth
safety
housingAdvantage
kolkataStability
ruralPostingBurden
transferBurden
postingPredictability
parentCareRisk
physicalRisk
workLife
stress
risk
familyCompatibility
parentCareCompatibility
physicalSafety
englishAdvantage
analyticalNotes

Analytical fields must be clearly distinguished from factual government data. They may summarize or assess documented conditions, but they must not be presented as official government labels, guarantees, or recruitment rules.

---

12. Derived Values

The canonical Job record must remain distinct from generated application/index data.

Where the finalized schema provides a derived structure or the application builds search/index data, those values are non-canonical and must not replace the underlying entity, relationship, source, or rule.

Examples of derived information include search/index artifacts and application-generated recommendation or ranking outputs.

A derived value may be useful for performance or display, but the canonical source record remains authoritative.

---

13. Exam Schema Concept

An exam record is a distinct canonical entity rather than a Job embedded inside another record.

The exact required and optional fields are defined by data/schemas/exam.schema.json. This guide should summarize that schema without inventing fields or diverging from the machine-readable contract.

An exam may relate to one or more recruitment records and posts through canonical IDs.

---

14. Department, Organisation and Service/Cadre Schemas

Department and Organisation remain separate canonical entities.

Service/Cadre is also a distinct canonical entity. Its machine-readable schema contains its own identity, governance relationships, scope, entry routes, post/exam/recruitment relationships, service-rule references, sources, confidence, status and version metadata.

A Job may reference a Service/Cadre through identity.serviceCadreId. The full Service/Cadre record must not be duplicated inside the Job.

The live service-cadre schema is authoritative for its exact field names and constraints.

---

15. Recruitment Schema Concept

A recruitment record represents a concrete recruitment mechanism or event and remains separate from the Job's recruitment relationship data.

A Job can reference recruitment records through recruitment.recruitmentIds.

This allows the data model to distinguish:

CAREER EXISTS

from:

CURRENT RECRUITMENT EXISTS

Historical recruitment records should remain representable without overwriting the canonical career/post identity.

The exact recruitment contract is defined by data/schemas/recruitment.schema.json.

---

16. Eligibility Rule Schema Concept

Eligibility rules are reusable canonical rule entities.

The live eligibility-rule schema supports rules for:

JOB
EXAM
SERVICE_CADRE
RECRUITMENT

A rule contains its own condition semantics, including ruleClass, conditionType, operator, optional value, logic, effect, verification requirements, qualification/subject requirements, language/skill requirements, experience, age, citizenship/domicile/reservation/category/gender requirements, physical/medical requirements, recruitment references, dependencies, sources, status, priority, mandatory/conditional flags, review requirements, and version metadata where defined by the schema.

HARD rules express eligibility constraints. SOFT rules do not independently establish hard eligibility.

The Job's eligibility.ruleIds provide the authoritative relationship from a Job to the rules used for runtime eligibility evaluation.

---

17. Source References and Provenance

Source information is canonical, not decorative metadata.

The Job schema requires:

sourceIds

sourceIds reference canonical Source entities.

The Source entity is a first-class record and can support multiple claims or multiple jobs. A Job may reference multiple sources because different claims may require different evidence.

Where source references include a claim or note, they should identify what the source supports. The machine-readable shared schema defines source-reference structure; application code must not invent alternate source-reference semantics.

A source-backed field is still a data record, not proof that the source is correct in perpetuity. Source verification, publication/revision dates, currentness, and research review remain necessary.

---

18. Confidence and Currentness Metadata

Job records require:

confidence
currentness
lastVerified

The shared machine-readable definitions establish the controlled confidence values:

HIGH
MEDIUM_HIGH
MEDIUM
LOW
ESTIMATE
NOT_VERIFIED

Confidence refers to evidence quality and verification strength. It does not mean that the government authority itself is uncertain.

currentness uses the controlled data-status semantics defined by the live shared schema, including statuses such as:

ACTIVE
CURRENT_NO_RECRUITMENT
HISTORICAL
RENAMED
MERGED
REORGANISED
REPLACED
ABOLISHED
TEMPORARY
UNKNOWN

lastVerified identifies the date on which the record was last verified/reviewed in the dataset process.

These metadata fields must be preserved when records are transformed, indexed, displayed, or explained.

---

19. Information Type and Analytical Distinction

The repository must clearly distinguish factual government information from analysis.

Factual/canonical information includes things such as:

- post identity;
- government, department and organisation relationships;
- recruitment routes and statuses represented by the schema;
- qualification requirements and references;
- pay/location/housing/promotion/benefit entity references;
- source relationships;
- currentness and verification metadata.

Analytical information includes things such as:

- lifestyle scores;
- family and parent-care compatibility assessments;
- authority or career-growth assessments;
- work-life/stress/risk assessments;
- other recommendation-oriented analytical measures.

Analytical values must not be promoted into factual government rules merely because they are stored inside a canonical Job record.

---

20. Schema Version and Dialect

All live machine-readable schemas use JSON Schema Draft 2020-12.

A schema file should provide the machine-readable contract elements appropriate to that schema, including:

$schema
$id
title
description
type
properties
required
additionalProperties

The `$id` identifies the schema contract. It must remain stable unless the schema itself is intentionally versioned as a separate contract.

Record/version fields such as `dataVersion` are data/record metadata defined by the individual schema and shared definitions. They are not a replacement for `$schema` or `$id`.

Where an individual schema defines its own required `version` field, that field must follow the live schema. Developers must not invent a universal `schemaVersion` field where the machine-readable contract does not define one.

This document must never be used to infer fields that are absent from the actual schema files.

---

21. Additional Properties

Production entities should normally use:

additionalProperties: false

This prevents accidental undocumented fields.

When extensibility is required, explicitly define an extension structure in the machine-readable schema rather than silently permitting arbitrary data.

Do not weaken an existing schema constraint merely to accommodate stale data, a legacy representation, or an undocumented field.

---

22. Date Format

Dates should use ISO-style date strings:

YYYY-MM-DD

Date-time values should use ISO 8601 when needed.

The live shared schema defines date and date-time formats for referenced fields. Individual entity schemas remain authoritative for where those definitions apply.

---

23. URL Format

Source URLs should be validated according to the live source schema and shared definitions.

Do not store fabricated or placeholder government URLs in production source records.

---

24. Score Format

Analytical scores defined by the live schemas use the shared score definition and are bounded from 0 to 10.

Scores are analytical values unless the relevant machine-readable schema explicitly defines another meaning.

---

25. Confidence Enum

The canonical confidence values defined by the live shared schema are:

HIGH
MEDIUM_HIGH
MEDIUM
LOW
ESTIMATE
NOT_VERIFIED

Runtime code may expose additional internal/derived states where explicitly implemented, but canonical production records must follow the machine-readable schema values.

---

26. Structural Validation vs Factual Verification

A schema-valid object can still be factually wrong.

Therefore:

Schema validation
≠
Government fact verification

Both are required.

Structural validation checks whether the record conforms to the machine-readable contract.

Runtime validation may additionally check relationships and semantic integrity that are not fully expressed by JSON Schema, such as:

- minimum <= maximum;
- effectiveFrom <= effectiveTo;
- eligibility dependency integrity;
- eligibility dependency cycles;
- hierarchical relationship cycles;
- cross-entity reference integrity;
- duplicate IDs;
- cross-namespace ID collisions;
- derived-index references to canonical IDs.

These runtime checks complement, but do not replace, JSON Schema validation or source verification.

---

27. Documentation Must Follow the Machine-Readable Schema

The machine-readable schemas under /data/schemas/ are the single structural source of truth.

When this guide and a live schema differ, the live schema takes precedence and this guide must be corrected.

Developers must not implement against this document while knowingly ignoring a finalized machine-readable field definition.

Documentation may explain the schema, relationships, provenance, and design principles, but it must not introduce obsolete fields, rename canonical fields, or reintroduce an earlier embedded-profile model.

---

28. Final Schema Principle

«Schemas protect structural integrity. Sources protect factual integrity. Research audits protect contextual integrity. Tests protect behavioural integrity.»
