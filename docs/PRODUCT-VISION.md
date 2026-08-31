GovCareer Compass — Product Vision

Document status: Permanent
Document version: 1.0.0
Initial research baseline: 31 August 2026
Initial active coverage: Central Government + West Bengal Government
Initial languages: English + Bengali
Primary platform: Responsive web application
Primary repository: GitHub
Primary deployment target: Vercel

---

1. Product Identity

GovCareer Compass is a personalized Government Career Discovery & Intelligence Platform designed to help Indian government-exam aspirants make informed career decisions.

The platform is not merely:

- a government-job listing website;
- a government-exam notification website;
- a salary calculator;
- a comparison website;
- a career quiz;
- an artificial-intelligence chatbot.

These are individual capabilities of a larger system.

The central purpose of the platform is:

«To help an aspirant understand which government careers they can pursue, which careers best fit their personal priorities, and how they should prepare for those careers.»

The platform therefore operates around three core questions:

CAN I?

Can I apply?

This covers:

- educational qualification;
- degree;
- subject;
- marks;
- age;
- reservation conditions;
- domicile;
- language;
- typing;
- shorthand;
- computer requirements;
- experience;
- driving licence;
- physical standards;
- medical standards;
- gender-specific requirements;
- other recruitment conditions.

SHOULD I?

Should I pursue this career?

This covers:

- salary;
- authority;
- prestige;
- work-life balance;
- family compatibility;
- elderly-parent compatibility;
- geographic stability;
- Kolkata preference;
- transfer tolerance;
- night-duty tolerance;
- physical-risk tolerance;
- stress;
- career growth;
- housing;
- personal preferences.

HOW DO I?

How do I reach this career?

This covers:

- examination;
- recruitment authority;
- eligibility;
- stages;
- syllabus;
- preparation burden;
- syllabus overlap;
- physical tests;
- skill tests;
- interview;
- medical;
- document verification;
- training;
- probation;
- career progression.

---

2. Problem the Product Solves

Government-exam aspirants frequently face information overload.

A candidate may know that examinations such as:

- West Bengal Civil Service;
- Staff Selection Commission Combined Graduate Level;
- Kolkata Police Sub-Inspector;
- West Bengal Police Sub-Inspector;
- Railway Recruitment Board examinations;
- Union Public Service Commission examinations;
- Intelligence Bureau recruitment;
- Railway Protection Force;
- other Central or State Government examinations

exist, but still not know:

«Which one actually fits me?»

Eligibility alone does not answer that question.

Salary alone does not answer that question.

Prestige alone does not answer that question.

The platform therefore combines objective career facts with transparent preference-based analysis.

---

3. Product Philosophy

The platform follows five principles.

3.1 Eligibility Before Recommendation

A career that the user cannot legally or officially pursue must not receive a normal preference ranking.

The system first determines:

- eligible;
- conditionally eligible;
- not eligible.

Only appropriate careers proceed to preference scoring.

---

3.2 Facts Before Interpretation

Government recruitment facts must be distinguished from analytical conclusions.

Examples of factual information:

- minimum qualification;
- pay level;
- starting basic pay;
- age;
- examination stages;
- physical standards;
- recruitment authority;
- service rule.

Examples of analytical information:

- family compatibility score;
- parent-care compatibility;
- location stability;
- stress assessment;
- English Honours advantage;
- personalized career-fit score.

The system must never represent analytical scoring as an official government ranking.

---

3.3 Transparency Before False Precision

The platform must clearly distinguish:

- Official Fact;
- Historical Official Fact;
- Current Estimate;
- Practical Assessment;
- Secondary Source;
- Not Publicly Verified.

Where exact information is unavailable, the platform must say so.

It must never invent certainty.

---

3.4 Personalization Without Pretending to Diagnose

The Career Finder may use preference-based and psychology-inspired decision modelling.

However, it must not claim to perform:

- medical diagnosis;
- psychological diagnosis;
- personality diagnosis;
- mental-health assessment.

The product should describe the output as:

«Preference-based career matching»

or:

«Career-fit assessment»

The user's answers identify stated priorities and preferences; they do not establish a clinical or psychological diagnosis.

---

3.5 Long-Term Expandability

The architecture must support future expansion without requiring a fundamental rebuild.

Future expansion includes:

- additional Indian states;
- additional languages;
- additional examinations;
- additional government departments;
- larger job databases;
- current recruitment monitoring;
- additional analysis tools;
- secure AI functionality;
- optional future accounts.

---

4. Initial Target User

The first major use case is an Indian government-exam aspirant who wants to understand available government careers according to their personal circumstances.

The first implementation must work especially well for:

- candidates from West Bengal;
- Central Government aspirants;
- graduates;
- candidates with general academic degrees;
- candidates who are unsure which exam to prepare for.

The architecture must not be restricted to graduates.

It must support:

- Class 8;
- Class 10;
- Class 12;
- Diploma;
- Graduate;
- Postgraduate;
- Professional qualification.

---

5. Initial Candidate Example

The project is initially designed around a reference use case:

B.A. English Honours graduate

with:

- no assumed professional qualification;
- no assumed specialist qualification;
- interest in West Bengal Government and Central Government;
- concern for salary;
- career growth;
- family stability;
- elderly-parent considerations;
- location;
- work-life balance;
- authority;
- government housing;
- long-term career prospects.

This reference candidate is a development/test profile.

The platform itself must remain general enough to support many different candidates.

---

6. Government Coverage Model

The platform separates government coverage into distinct categories.

Central Government

Examples include:

- Union Public Service Commission;
- Staff Selection Commission;
- Railways;
- Railway Protection Force;
- Intelligence Bureau;
- Central Bureau of Investigation;
- National Investigation Agency;
- Narcotics Control Bureau;
- India Post;
- Central ministries;
- attached and subordinate offices.

State Government

Initially:

West Bengal Government

Future:

- Bihar;
- Odisha;
- Jharkhand;
- Assam;
- Maharashtra;
- Uttar Pradesh;
- Tamil Nadu;
- Karnataka;
- and other states.

Local Government

Potential future coverage:

- municipalities;
- municipal corporations;
- Panchayats;
- local statutory authorities.

Public Sector Undertakings

These may be covered separately and must never silently be presented as ordinary civil-service posts.

---

7. State Expansion Philosophy

All Indian states may be displayed in the state selector from the beginning.

However:

«A state must not be represented as researched or active merely because it appears in the selector.»

Each state has an explicit status such as:

- Active;
- Planned;
- Researching;
- Partially Covered;
- Temporarily Disabled.

The recommendation engine must only use a state's data when that state's dataset is explicitly enabled.

---

8. Language Vision

The default interface language is:

English

The first additional language is:

Bengali

Future languages may include:

- Hindi;
- Marathi;
- Tamil;
- Telugu;
- Gujarati;
- Odia;
- Assamese;
- Kannada;
- Malayalam;
- other supported Indian languages.

Language support must be implemented through a localization system rather than duplicated pages.

Stable database IDs must never change because of translation.

---

9. Core Product Systems

The platform consists of the following major systems.

Career Finder

A guided questionnaire that captures:

- education;
- subject;
- government preference;
- state;
- salary priority;
- authority priority;
- family priority;
- parent-care priority;
- location priority;
- transfer tolerance;
- night-duty tolerance;
- physical-risk tolerance;
- work-life priority;
- career-growth priority;
- other career preferences.

---

Eligibility Engine

Determines whether a candidate may pursue a career based on objective conditions.

---

Recommendation Engine

Ranks eligible careers according to user preferences.

---

Government Job Database

Stores structured information about posts.

---

Government Exam Database

Stores examination information separately from job information.

---

Search Engine

Allows users to search jobs, exams, departments, organisations, qualifications, locations, keywords and related information.

---

Comparison Engine

Allows users to compare multiple careers.

---

Salary Tools

Separates:

- starting basic;
- DA;
- HRA;
- other allowances;
- gross;
- deductions;
- estimated take-home.

---

Housing Tools

Separates:

- private rent;
- HRA;
- government accommodation;
- licence fee;
- utilities;
- commuting;
- effective cost.

---

Family Analysis

Evaluates:

- spouse/family compatibility;
- childcare;
- parent care;
- geographic stability;
- night-duty impact;
- festival/holiday availability;
- transfer implications.

---

Preparation Strategy

Connects examinations by:

- shared subjects;
- unique subjects;
- difficulty;
- preparation burden;
- complementary preparation routes.

---

Source & Evidence System

Every significant factual record should connect to source metadata.

---

Future AI Career Assistant

The AI layer will provide conversational assistance using verified platform information.

The AI must not replace the source/database layer.

---

10. Differentiating Product Capability

The strongest differentiator is:

«Personalized government-career decision support rather than simple job discovery.»

The platform should help a user understand:

“What can I apply for?”

“What fits my life?”

“What am I giving up by choosing this career?”

“What alternatives exist?”

“What should I prepare for?”

“Why did the system recommend this?”

This transparency is a central part of the product identity.

---

11. Recommendation Result Philosophy

The result must never simply say:

«“Exam X is the best.”»

Instead, the result should explain:

- match score;
- eligibility;
- primary reasons;
- conflicts;
- trade-offs;
- alternatives;
- confidence;
- supporting sources.

Example conceptual result:

Career: Example Government Career

Fit: 91%

Why it matches:

- strong location compatibility;
- strong family compatibility;
- acceptable salary;
- strong English-related preparation advantage.

Why it is not 100%:

- transfer burden;
- moderate competition;
- specific posting uncertainty.

The result is a decision aid, not a promise.

---

12. Trust Model

The platform's credibility depends on factual accuracy.

Therefore the following are mandatory design principles:

- no fabricated vacancy figures;
- no fabricated salaries;
- no invented sources;
- no unsupported promotion claims;
- no unsupported quarter guarantees;
- no false eligibility claims;
- no silent mixing of pay systems;
- no false “current” claims based on old notifications.

---

13. Long-Term Product Direction

The long-term product may evolve toward:

Government Career Search
        +
Eligibility Intelligence
        +
Career Matching
        +
Career Comparison
        +
Preparation Intelligence
        +
Evidence System
        +
AI Career Assistant
        =
Government Career Intelligence Platform

The purpose of future growth is not to make the platform larger merely for its own sake.

The purpose is to make career decisions more understandable, accurate and personalized.

---

14. Success Definition

The product succeeds when an aspirant can enter their circumstances and leave with:

1. a clear eligible-career universe;
2. a ranked set of suitable careers;
3. understandable reasons for those rankings;
4. realistic trade-offs;
5. links to authoritative information;
6. preparation options;
7. a clear next step.

The product should reduce confusion rather than simply provide more information.

---

15. Non-Goals

The platform is not intended to:

- guarantee selection;
- predict examination results;
- replace official government recruitment portals;
- replace official notifications;
- provide legal guarantees of eligibility;
- guarantee salary or take-home income;
- guarantee government accommodation;
- guarantee promotion timelines;
- guarantee a specific posting;
- diagnose personality or psychology;
- replace professional career counselling when specialized counselling is necessary.

---

16. Permanent Product Rule

The following principle should govern future development:

«Add complexity only when it makes government-career decisions clearer, more accurate or more useful.»

If a feature increases visual complexity without improving decision quality, it should not be prioritized.

---

17. Product Statement

GovCareer Compass helps aspirants move from government-exam confusion to evidence-based career direction by combining eligibility intelligence, career facts, lifestyle analysis, transparent preference matching, comparison tools and preparation guidance.
