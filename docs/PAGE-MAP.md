GovCareer Compass — Page Map

Document status: Permanent
Document version: 1.0.0

---

1. Page Architecture Principle

Pages are presentation surfaces over a shared data and application system.

The platform must avoid creating independent logic for every page.

---

2. Primary Navigation

The permanent primary navigation is:

Home
Career Finder
Exams
Jobs
Compare
Rankings
States
Guides
Career AI

The header may also provide direct access to:

- Search;
- Language;
- Theme;
- saved careers;
- comparison.

---

3. Core Public Pages

"/"

Landing page.

Purpose:

- explain the platform;
- establish trust;
- present Career Finder;
- provide exam/job search;
- introduce states;
- introduce AI;
- direct users to major tools.

---

"/pages/career-finder.html"

Interactive career assessment.

Purpose:

- collect candidate profile;
- collect preferences;
- apply branching;
- produce recommendation input.

---

"/pages/career-results.html"

Personalized result.

Purpose:

- display eligible careers;
- rank careers;
- explain recommendations;
- explain conflicts;
- display alternatives;
- provide next actions.

---

"/pages/exams.html"

Exam database.

Purpose:

- search exams;
- filter exams;
- compare examinations;
- inspect eligibility;
- inspect stages and preparation.

---

"/pages/exam-details.html"

Individual examination detail.

Purpose:

- eligibility;
- age;
- stages;
- syllabus;
- physical/skill requirements;
- posts;
- recruitment history;
- sources;
- preparation information.

---

"/pages/jobs.html"

Government job database.

Purpose:

- search posts;
- filter posts;
- sort posts;
- compare jobs;
- open detailed records.

---

"/pages/job-details.html"

Individual career detail.

Permanent sections:

- Overview;
- Eligibility;
- Pay;
- Job Profile;
- Lifestyle;
- Authority;
- Posting;
- Housing;
- Promotion;
- Family;
- Exam;
- Physical/Medical;
- Benefits/Retirement;
- Advantages/Disadvantages;
- Sources.

---

"/pages/compare.html"

Multi-career comparison.

Target:

2–5 careers.

---

"/pages/rankings.html"

Analytical rankings.

Examples:

- salary;
- authority;
- family;
- location;
- safety;
- work-life;
- BA English fit;
- overall fit.

All rankings must be labelled as analytical.

---

4. Decision Tool Pages

"/pages/salary.html"

Salary and take-home analysis.

---

"/pages/eligibility.html"

Eligibility checker.

---

"/pages/family.html"

Family compatibility.

---

"/pages/parents.html"

Elderly-parent compatibility.

---

"/pages/location.html"

Location and transfer intelligence.

---

"/pages/housing.html"

Government accommodation and housing analysis.

---

"/pages/preparation.html"

Exam-preparation and syllabus-overlap tools.

---

"/pages/confusion-center.html"

Common career dilemmas.

Examples:

- State vs Central;
- police vs office;
- salary vs family;
- Kolkata vs all-India;
- authority vs work-life.

---

5. Geographic Page

"/pages/states.html"

Purpose:

- state selection;
- coverage status;
- active states;
- planned states;
- future expansion.

Only states with verified datasets may be marked active.

---

6. AI Page

"/pages/ai.html"

Purpose:

Future conversational Government Career AI.

The page may exist before the backend is activated, but AI credentials must never be placed in the frontend.

---

7. Trust & Information Pages

"/pages/sources.html"

Source registry.

"/pages/glossary.html"

Abbreviations and terminology.

"/pages/methodology.html"

Research and scoring methodology.

"/pages/about.html"

Project identity.

"/pages/privacy.html"

Privacy practices.

"/pages/404.html"

Fallback page.

---

8. Future Detail URL Structure

When routing is mature, the preferred semantic patterns are:

/jobs/<job-id>

/exams/<exam-id>

/states/<state-id>

Stable IDs must remain unchanged across languages.

---

9. Page-to-System Relationship

Home
 ↓
Career Finder
 ↓
Career Results
 ↓
Jobs / Exams
 ↓
Comparison
 ↓
Salary / Family / Location / Housing
 ↓
Preparation
 ↓
Sources

A user must be able to enter the platform from several points.

---

10. Navigation Philosophy

The primary navigation should remain compact.

Detailed secondary information should be accessed through:

- page sections;
- tabs;
- filters;
- drawers;
- modals;
- contextual links.

The navigation must not expose every database feature simultaneously.

---

11. Mobile Navigation

On mobile:

Brand
Search
Menu

The menu should contain:

- Career Finder;
- Exams;
- Jobs;
- Compare;
- Rankings;
- States;
- Guides;
- AI;
- Language;
- Theme.

---

12. Cross-Linking

Every important job should connect to:

- its examination;
- department;
- organisation;
- sources;
- related careers;
- comparisons;
- preparation where applicable.

Every important examination should connect to:

- recruited posts;
- eligibility;
- preparation;
- related examinations.

This creates a connected career-information graph.

---

13. Page Completion Standard

A page is not complete merely because it visually exists.

It is complete only when:

- its data source is defined;
- its interactions are defined;
- its responsive behaviour is defined;
- its error state exists;
- its accessibility requirements are handled;
- its source/evidence behaviour is defined where necessary.
