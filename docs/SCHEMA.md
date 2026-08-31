GovCareer Compass — Data Schema Guide

Document status: Permanent
Document version: 1.0.0

---

1. Schema Purpose

The JSON schemas under:

/data/schemas/

are machine-readable contracts for the production data.

They exist to ensure that data:

- has the expected structure;
- uses valid types;
- uses valid controlled values;
- preserves required fields;
- prevents malformed records.

Schemas validate structure.

They do not prove that a government fact is true.

Truth still requires source verification.

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

---

3. Required Entity Schemas

The first schema set covers:

job.schema.json
exam.schema.json
department.schema.json
organisation.schema.json
recruitment.schema.json
source.schema.json
assessment-question.schema.json
state.schema.json

---

4. Job Schema Concept

A job record must support:

id
identity
recruitment
eligibility
pay
lifestyle
location
housing
promotion
benefits
analysis
sources
confidence
currentness
lastVerified
dataVersion

---

5. Exam Schema Concept

An exam record must support:

id
identity
authority
government
state
qualification
age
stages
skillTests
physical
syllabus
frequency
status
recruitments
sources
confidence
lastVerified
dataVersion

---

6. Department Schema Concept

A department record should support:

id
governmentId
stateId
name
type
website
directorateIds
organisationIds
sourceIds
status
confidence
lastVerified
dataVersion

---

7. Organisation Schema Concept

An organisation record should support:

id
governmentId
stateId
departmentId
name
type
website
sourceIds
status
confidence
lastVerified
dataVersion

---

8. Recruitment Schema Concept

A recruitment record should support:

id
authorityId
examId
postIds
mode
status
notificationDate
applicationDates
vacancy
sourceIds
currentness
confidence
lastVerified
dataVersion

Vacancy fields must allow an unavailable state.

---

9. Source Schema Concept

A source record must support:

id
organisation
title
documentType
publicationDate
verificationDate
url
sourcePriority
confidence
currentness
supportedClaims
dataVersion

---

10. Assessment Question Schema Concept

An assessment question should support:

id
type
question
helpText
required
profileField
options
validation
branching
version
status

---

11. State Schema Concept

A state record should support:

id
name
type
enabled
coverage
website
sourceIds
lastVerified
dataVersion

---

12. Schema Version

Each schema should use JSON Schema Draft 2020-12.

Schema files should contain:

$schema
$id
title
description
type
properties
required
additionalProperties

---

13. Additional Properties

Production entities should normally use:

additionalProperties: false

This prevents accidental undocumented fields.

When extensibility is required, explicitly define an extension structure rather than silently permitting arbitrary data.

---

14. Date Format

Dates should use ISO-style date strings:

YYYY-MM-DD

Date-time values should use ISO 8601 when needed.

---

15. URL Format

Source URLs should be validated as URLs.

Do not store fabricated or placeholder government URLs in production source records.

---

16. Score Format

Analytical scores should use:

minimum: 0
maximum: 10

and should be numeric.

---

17. Confidence Enum

Allowed values:

HIGH
MEDIUM_HIGH
MEDIUM
LOW
ESTIMATE
NOT_VERIFIED

---

18. Important Validation Principle

A schema-valid object can still be factually wrong.

Therefore:

Schema validation
≠
Government fact verification

Both are required.

---

19. Final Schema Principle

«Schemas protect structural integrity. Sources protect factual integrity. Research audits protect contextual integrity. Tests protect behavioural integrity.»
