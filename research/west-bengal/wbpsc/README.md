# GovCareer Compass — West Bengal Public Service Commission Research

## Document ID

`research-wb-wbpsc`

## Research Scope

This directory contains research evidence and analysis relating to recruitment conducted through the:

**Public Service Commission, West Bengal (WBPSC)**

Official website:

https://psc.wb.gov.in/

Official notification/announcement archive:

https://psc.wb.gov.in/notification_announcement.jsp

Official syllabus archive:

https://psc.wb.gov.in/syllabus.jsp

Official answer-key archive:

https://psc.wb.gov.in/answer_key.jsp

---

# 1. Purpose

The purpose of this directory is to preserve the complete research trail for WBPSC recruitment that may be relevant to the GovCareer Compass government-career database.

The directory must support:

- examination discovery;
- post discovery;
- service/cadre discovery;
- qualification verification;
- age verification;
- reservation verification;
- language-condition verification;
- physical-condition verification;
- recruitment-stage verification;
- pay verification;
- current-status tracking;
- historical-status tracking;
- answer-key tracking;
- result tracking;
- recommendation tracking;
- source traceability.

---

# 2. Important Distinction

WBPSC is a:

**Recruitment Authority / Constitutional Public Service Commission**

It is not itself the employing department for every post.

For example:

    WBPSC
       ↓
    WBCS Examination
       ↓
    Multiple Services / Posts
       ↓
    Different Government Departments

Therefore:

    Examination
    ≠
    Service
    ≠
    Cadre
    ≠
    Post
    ≠
    Department

These relationships must remain distinct throughout the project.

---

# 3. Major WBPSC Research Families

At minimum investigate:

- West Bengal Civil Service (Executive) etc. Examination;
- Miscellaneous Services Recruitment Examination;
- Clerkship Examination;
- West Bengal Audit and Accounts Service Recruitment Examination;
- West Bengal Judicial Service Examination;
- department-specific recruitment;
- directorate-specific recruitment;
- specialist recruitment;
- technical recruitment;
- education-sector recruitment;
- other direct recruitment conducted through WBPSC.

A specialist examination must not automatically be included in the B.A. English candidate's eligible-career set.

---

# 4. B.A. English Candidate Rule

The candidate profile is:

    B.A.
    English Honours
    No additional specialist qualification assumed

WBPSC eligibility must therefore be checked post by post.

Possible outcomes:

### DIRECT

The academic qualification is satisfied without an additional specialist credential.

### CONDITIONAL

The academic qualification is satisfied but an additional condition is required.

### NOT_ELIGIBLE

A mandatory qualification is missing.

### MANUAL_VERIFICATION

The available official evidence is insufficient to safely determine eligibility.

---

# 5. Hard Eligibility

The following may constitute hard eligibility:

- required degree;
- required subject;
- required marks;
- Bengali;
- other language;
- Mathematics;
- Statistics;
- Economics;
- Commerce;
- Science;
- B.Ed.;
- D.El.Ed.;
- B.El.Ed.;
- ITI;
- trade qualification;
- diploma;
- professional qualification;
- experience;
- age;
- physical standard;
- medical standard;
- driving licence;
- other mandatory condition.

Hard eligibility must be evaluated before preference scoring.

---

# 6. Soft Preference

The following belong to the recommendation layer rather than legal eligibility:

- salary preference;
- authority preference;
- prestige;
- family life;
- elderly-parent care;
- Kolkata preference;
- transfer tolerance;
- night-duty tolerance;
- physical-risk tolerance;
- career growth;
- housing;
- work-life balance.

A soft preference must never override a failed hard eligibility requirement.

---

# 7. Evidence Priority

Use:

1. Current official recruitment advertisement
2. Current official amendment/corrigendum
3. Official recruitment rule
4. Official service rule
5. Official government order/gazette
6. Official examination notice
7. Official answer key/result
8. Official departmental page
9. Official annual report
10. Reputable secondary source

Lower-priority evidence must not override contradictory primary evidence.

---

# 8. Currentness

Research baseline:

**31 August 2026**

Every research finding must identify whether it is:

- current;
- historical;
- superseded;
- current but recruitment not open;
- under process;
- unknown.

---

# 9. Historical Preservation

Never delete historical WBCS material merely because a newer examination has changed the syllabus or recruitment structure.

Example:

    WBCS 2024
        = old scheme/syllabus

    WBCS 2025 onward
        = revised scheme/syllabus

These are different examination-cycle configurations and must remain separately documented.

---

# 10. Source ID Convention

Use stable source IDs:

    src-wbpsc-<exam>-<year>-<document>

Examples:

    src-wbpsc-wbcs-2024-advertisement
    src-wbpsc-wbcs-2024-scheme
    src-wbpsc-wbcs-2024-prelim-notice
    src-wbpsc-wbcs-2024-answer-key
    src-wbpsc-wbcs-2024-final-answer-key

Do not create an ID unless the underlying official source has actually been located.

---

# 11. Document Naming Convention

Use:

    <exam>-<year>-<document-type>-<date>.<extension>

Examples:

    wbcs-2024-advertisement-2025-11-14.pdf
    wbcs-2024-preliminary-notice-2026-05-14.pdf
    wbcs-2024-answer-key-2026-06-24.pdf
    wbcs-2024-final-answer-key-2026-08-27.pdf

If the exact publication date is unknown:

    wbcs-2024-<document-type>-undated.pdf

Do not invent a date merely for filename consistency.

---

# 12. Production Data Relationship

Verified WBCS research feeds:

    /data/states/west-bengal/exams.json
    /data/states/west-bengal/jobs.json
    /data/states/west-bengal/service-cadres.json
    /data/states/west-bengal/eligibility-rules.json
    /data/states/west-bengal/recruitment.json
    /data/states/west-bengal/pay.json
    /data/states/west-bengal/sources.json

Research documents remain the evidence layer.

---

# 13. No-Fabrication Rule

Never fabricate:

- advertisement numbers;
- vacancy numbers;
- publication dates;
- examination dates;
- pay;
- eligibility;
- syllabus;
- answer-key answers;
- result statistics;
- cut-offs;
- promotion rules.

When unavailable:

    NOT_VERIFIED

---

# 14. Current WBCS 2024 Research Anchor

The official Commission record confirms:

- Advertisement No. 08/2024;
- WBCS Examination 2024;
- old scheme and syllabus applied to the 2024 examination;
- revised scheme applies from Examination 2025.

See:

    examinations/wbcs/findings.md

for the detailed research record.

---

# 15. Related Research

See:

- `/docs/SOURCE-STANDARDS.md`
- `/docs/RESEARCH-METHODOLOGY.md`
- `/docs/RESEARCH-AUDIT-MODEL.md`
- `/docs/DATA-UPDATE-WORKFLOW.md`
- `/docs/ELIGIBILITY-MODEL.md`

---

# 16. Directory Maintenance

Whenever WBPSC publishes a new WBCS notice:

1. save the official document;
2. assign a source ID;
3. record it in the source register;
4. update findings;
5. determine whether the current data changes;
6. run eligibility validation;
7. run schema validation;
8. update production JSON only when justified;
9. preserve the old research record.
