# GovCareer Compass — Internationalization Model

**File:** `/docs/I18N-MODEL.md`  
**Document Type:** Canonical Architecture Specification  
**Version:** `1.0.0`  
**Status:** Final Baseline  
**Last Updated:** `2026-08-31`  
**Current Languages:** English, Bengali  
**Future Languages:** Hindi, Marathi, Tamil, Telugu, Gujarati, Odia, Assamese and other supported languages

---

# 1. Purpose

The GovCareer Compass Internationalization Model defines how the application supports multiple interface languages without duplicating application logic, data identifiers, eligibility rules, scoring rules or recommendation logic.

The system is initially designed for:

English
+
Bengali

The architecture must remain capable of adding additional Indian languages later without requiring a redesign of the application's core logic.

Potential future languages include:

Hindi
Marathi
Tamil
Telugu
Gujarati
Odia
Assamese
Malayalam
Kannada
Punjabi
Urdu
Other supported languages

Future language support must be additive.


---

2. Fundamental Principle

GovCareer Compass must strictly separate:

LANGUAGE

from:

IDENTITY

and:

GOVERNMENT DATA

Stable identifiers must never change merely because the interface language changes.

For example:

job ID:
kolkata-police-si

must remain:

kolkata-police-si

in:

English
Bengali
Hindi
Marathi
Tamil

The display name may change.

The identifier must not.


---

3. Canonical Language Architecture

The localization architecture is:

Application UI
      ↓
Translation Key
      ↓
Current Language File
      ↓
Localized String

Example:

header.jobs
      ↓
en.json
      ↓
"Jobs"

and:

header.jobs
      ↓
bn.json
      ↓
"চাকরি"

The application code must use translation keys rather than embedding user-facing text directly wherever practical.


---

4. Language Files

Current files:

/data/i18n/
    en.json
    bn.json

Future files may be added:

/data/i18n/
    hi.json
    mr.json
    ta.json
    te.json
    gu.json
    or.json
    as.json
    ...

Adding a language should not require changes to:

jobs.json
exams.json
eligibility rules
recommendation rules
scoring rules

unless the new language introduces a genuine data-specific requirement.


---

5. Language Identifier

Every language must have a stable identifier.

Recommended examples:

en
bn
hi
mr
ta
te
gu
or
as

The identifier should follow an established language-code convention.

The language code must not be translated.

For example:

bn

remains:

bn

inside both English and Bengali interface contexts.


---

6. Locale

The application may distinguish:

language

from:

locale

For example:

en
en-IN
bn
bn-IN

where appropriate.

Locale affects formatting such as:

numbers;

dates;

currencies;

pluralisation;

browser language integration;

locale-sensitive text handling.


Language selection and locale formatting should remain logically separate.


---

7. Direction

Current supported languages:

English → LTR
Bengali → LTR

The language contract must nevertheless include:

direction

so that future right-to-left languages can be supported.

Possible values:

ltr
rtl

The UI must obtain direction from the selected language configuration rather than assuming ltr permanently.


---

8. Default Language

The default interface language is:

en

Therefore:

/data/i18n/en.json

is the default translation catalogue.

Bengali:

/data/i18n/bn.json

is the second currently supported language.

If no stored user preference exists, the application should start in English.


---

9. Language Selection Persistence

The selected language should be persisted using the existing storage architecture:

/js/storage.js

A recommended localStorage key is:

govcareer.language

Example:

govcareer.language = "bn"

The stored value must contain only a stable language ID.


---

10. No User Account Required

Language preference should work without login.

The project is a static website and should therefore store language preference locally.

No server-side language profile is required for the basic implementation.


---

11. Translation Key Architecture

Translation keys must be hierarchical and semantic.

Preferred:

header.jobs
careerFinder.title
eligibility.directlyEligible
salary.inHand
housing.warning
footer.privacy

Avoid:

text001
text002
text003

Semantic keys are easier to maintain.


---

12. Translation Keys Are Stable

Once a production translation key is published, its meaning should not be casually changed.

Example:

eligibility.directlyEligible

should consistently mean:

> Directly Eligible



If the wording needs to change, modify the translated value, not the identifier.


---

13. Translation Keys Must Not Contain Language-Specific IDs

Bad:

bangla_jobs

Good:

jobs.title

Bad:

chakriDetails

Good:

jobs.viewFullDetails

Identifiers should be language-independent.


---

14. Stable Government Data IDs

Government data should use language-neutral identifiers.

Example:

{
  "id": "ssc-cgl"
}

The Bengali page must not change this to:

ssc-cgl-bn

The same ID is used everywhere.


---

15. Display Names

Localized display names may be supported through localized fields in the relevant data schema.

For example:

{
  "name": {
    "en": "Staff Selection Commission",
    "bn": "স্টাফ সিলেকশন কমিশন"
  }
}

However, official names should not be altered merely to create a translation.


---

16. Official Source Titles

Official source titles must be preserved.

The project has established the rule:

> Official source titles are evidence and should not be silently translated in a way that changes the identifiable source title.



Therefore the interface may display:

Original official title

and optionally:

Localized explanatory label

Example:

Official title:
"Recruitment to the post of ..."

Bengali UI may add:

সরকারি নথির মূল শিরোনাম

but must not replace the authoritative title in the source record with an invented translation.


---

17. Government Notifications

Government recruitment notifications are source material, not ordinary UI strings.

Their:

notification number;

document title;

order number;

issuing authority;

source URL;

publication date;


must remain attached to the source data.

Localization may provide explanatory text around them.


---

18. Eligibility Rules Are Language-Independent

Eligibility rules must use stable IDs.

Example:

qualificationId:
"b-ed"

The English interface can display:

Bachelor of Education (B.Ed.)

The Bengali interface can display:

Bachelor of Education (B.Ed.) / B.Ed. ডিগ্রি

The rule itself remains:

b-ed


---

19. Recommendation Rules Are Language-Independent

The recommendation engine must never contain:

if Bengali text == "পরিবার খুব গুরুত্বপূর্ণ"

Instead it should process stable values such as:

familyImportance = 10

This is essential for multi-language support.


---

20. Scoring Rules Are Language-Independent

Scoring must use stable IDs.

Example:

salaryImportance
familyImportance
parentCareImportance
locationImportance

The scoring engine must not depend on:

"Salary is very important"

or:

"বেতন খুব গুরুত্বপূর্ণ"

The user-facing wording belongs to translation files.


---

21. Assessment Questions

Assessment questions should use stable question IDs.

Example:

government_preference

The English file provides the English question.

The Bengali file provides the Bengali question.

The question's ID remains unchanged.

Example:

questionId:
government_preference

must remain the same in every language.


---

22. Assessment Option IDs

Options must also use stable IDs.

Example:

central_government
state_government
both_governments

English:

Central Government
State Government
Both

Bengali:

কেন্দ্রীয় সরকার
রাজ্য সরকার
উভয়

The stored response remains:

central_government

not the translated label.


---

23. User Responses

User responses must store stable values.

Incorrect:

{
  "governmentPreference": "কেন্দ্রীয় সরকার"
}

Correct:

{
  "governmentPreference": "CENTRAL"
}

or the project's canonical controlled value.

This ensures the same response can be evaluated regardless of interface language.


---

24. Career Category IDs

Career categories must remain language-independent.

For example:

ADMINISTRATIVE
POLICE
INVESTIGATION
INTELLIGENCE
REVENUE
TAX
AUDIT
ACCOUNTS
CLERICAL
RAILWAY
SECURITY
PANCHAYAT
CORRECTIONS
WELFARE
POSTAL
FIELD_DEVELOPMENT

The localized interface supplies the display wording.


---

25. Qualification IDs

Qualifications must also use stable IDs.

Examples:

secondary
higher_secondary
bachelor_degree
ba
ba_english
bed
deled
iti
technical_diploma
llb
btech

The display labels may change by language.

The IDs must not.


---

26. State IDs

States must use stable identifiers.

Example:

west-bengal

must remain:

west-bengal

in English and Bengali.

The display name may be:

West Bengal

or:

পশ্চিমবঙ্গ


---

27. Government IDs

Government IDs must remain language-independent.

Examples:

central-government
west-bengal-government

The user-visible names are translated.


---

28. Job IDs

Job identifiers must remain stable across:

languages;

pages;

URLs;

comparison lists;

bookmarks;

recommendation results;

localStorage;

exported data.


Changing language must never break bookmarked or compared jobs.


---

29. Exam IDs

Exam IDs must also remain stable.

Example:

upsc-cse
ssc-cgl
rrb-ntpc-graduate
rpf-si
wbpsc-wbcs

Localized names must be display-layer information.


---

30. Source IDs

Source identifiers must remain stable.

Example:

source-wbpsc-2026-001

The source title itself remains tied to the original evidence.


---

31. Pluralisation

The localization system should be capable of plural-aware messages.

Where necessary, use a structured translation approach instead of manually concatenating numbers.

For example:

"{count} results"

must eventually support language-specific plural rules.

The implementation should preferably use Intl.PluralRules for languages where plural handling differs.


---

32. Interpolation

Translation strings may contain placeholders.

Example:

"Question {current} of {total}"

The placeholder names must remain stable across languages.

English:

Question {current} of {total}

Bengali:

প্রশ্ন {current} / {total}

The JavaScript code supplies:

current
total

in both cases.


---

33. Placeholder Integrity

A translation validator must check that every language contains the same required placeholders as the reference language.

Example:

English:
"{count} results"

Bengali must not accidentally become:

"ফলাফল"

if {count} is required by the component.

The localization validation process should flag missing placeholders.


---

34. HTML Inside Translations

Translations should normally contain plain text.

Avoid embedding arbitrary HTML inside translation strings.

Bad:

"Read <strong>official</strong> source"

Preferred:

source.readOfficial

with semantic HTML handled by the component.

This improves accessibility and security.


---

35. Rich Text

Where formatted text is genuinely necessary, the application should use structured content rather than arbitrary HTML strings.

For example:

{
  "segments": [...]
}

may be introduced later if required.

Do not allow arbitrary HTML from translation JSON to be injected directly with unsafe innerHTML.


---

36. Missing Translation Policy

If a Bengali translation is missing, the application should use a controlled fallback.

Recommended fallback:

bn
  ↓
en

The interface may show the English translation when Bengali is unavailable.

It must not show:

undefined
null
[missing.key]

to ordinary users.


---

37. Missing Translation Logging

During development, missing translations should be logged or surfaced through development diagnostics.

Production behaviour should remain graceful.

Recommended development message:

Missing translation:
careerFinder.newKey
language:
bn


---

38. Translation Loading

js/language.js is responsible for:

loadLanguage()
setLanguage()
getLanguage()
translate()
hasTranslation()
fallbackTranslation()
applyDocumentDirection()
persistLanguage()

The language loader must be asynchronous because translation files are JSON resources.


---

39. Translation Cache

Translation data may be cached in memory after loading.

Example:

translationCache = {
    en: {...},
    bn: {...}
}

This prevents unnecessary repeated fetches when the user switches languages.


---

40. Offline / Static Hosting Compatibility

The website must be designed for:

GitHub Pages
Vercel

and other static hosting environments.

However, browser fetch() behaviour when opening files directly through:

file://

can differ from hosted HTTP(S) environments.

Therefore:

> The production application should be tested through GitHub Pages or another local HTTP server rather than assuming every browser permits unrestricted JSON fetches from file://.



The localization architecture itself remains static-hosting compatible.


---

41. Language Selector

The language selector should display native names where practical:

English
বাংলা
हिन्दी
मराठी
தமிழ்
తెలుగు
ગુજરાતી
ଓଡ଼ିଆ
অসমীয়া

The selected language should be represented by its stable ID.

The selector must not alter URLs or job IDs merely because the user changes language.


---

42. Browser Language Detection

The application may optionally inspect:

navigator.language
navigator.languages

on first launch.

However, explicit user choice must take precedence.

Recommended order:

Saved user preference
        ↓
Explicit current selection
        ↓
Supported browser language
        ↓
English default

The application must not unexpectedly change languages after the user manually selects one.


---

43. Language Preference Persistence

A recommended storage key is:

govcareer.language

Stored value:

en

or:

bn

Do not store the entire translation catalogue in localStorage unless specifically required.


---

44. Document Language Attribute

The application must update:

<html lang="...">

when the language changes.

English:

<html lang="en">

Bengali:

<html lang="bn">

This is important for:

accessibility;

screen readers;

search engines;

browser language processing.



---

45. Document Direction

The application must update:

dir="ltr"

or:

dir="rtl"

according to the active language.

Current English and Bengali both use:

ltr

but the implementation must not hard-code this assumption permanently.


---

46. Typography

The UI must support Bengali script correctly.

The CSS architecture should provide suitable system-font fallback stacks.

The application must not assume that an English-only font can render Bengali adequately.

Recommended strategy:

system Bengali-compatible fonts
+
system sans-serif fallback

The project must not redistribute font files unless licensing permits it.


---

47. Numbers

The application must distinguish:

stored numeric value

from:

displayed localized number

For example:

100000

can be rendered using:

Intl.NumberFormat

depending on the selected locale.

The underlying numeric value remains numeric.


---

48. Currency

Currency data must remain:

numeric
+
currency code

Example:

amount: 50000
currency: "INR"

Do not store:

"₹50,000"

as the canonical numeric value.

Localization controls display formatting.


---

49. Dates

Dates should be stored in an unambiguous machine-readable format.

Recommended canonical format:

YYYY-MM-DD

or a complete ISO 8601 timestamp where time is required.

The interface can then format dates according to locale.


---

50. Government Data vs Translation Data

The project must preserve this distinction:

DATA
    = factual government information

I18N
    = language-specific presentation

For example:

startingBasic

belongs to government/job data.

"Starting Basic"

belongs to the translation layer.

The translation file must not become a second database of government facts.


---

51. Source Titles and Official Names

The localization layer should not silently rewrite:

official government organisation names;

notification numbers;

order numbers;

legal document titles;

official examination titles;


when the original title is needed for source identification.

Localized explanatory text may be provided alongside them.


---

52. Long-Form Content

For large analytical descriptions, there are two supported approaches:

Localized structured content

Use localized fields:

{
  "en": "...",
  "bn": "..."
}

Translation keys

Use:

jobDetails.responsibilityExplanation

For government-specific factual data, localized structured fields in the job data schema may be preferable when the actual content itself is part of the dataset.

For reusable interface strings, use translation files.


---

53. What Must Not Be Localized

The following should remain stable identifiers or evidence values:

database IDs;

job IDs;

exam IDs;

department IDs;

organisation IDs;

source IDs;

state IDs;

category IDs;

qualification IDs;

scoring rule IDs;

question IDs;

option IDs;

branching rule IDs;

schema IDs;

version identifiers;

URLs;

notification numbers;

official reference numbers.



---

54. What Should Be Localized

The following should normally be localized:

navigation labels;

button labels;

headings;

explanatory UI text;

instructions;

form labels;

assessment question wording;

assessment option labels;

filter labels;

error messages;

status descriptions;

score explanations;

help text;

accessibility labels;

methodology explanations;

disclaimer text.



---

55. Official Source Preservation Rule

The permanent product rule is:

> Localize the interface around the official source; do not silently replace the authoritative source identity.



This is important because GovCareer Compass is intended to be a research-oriented platform.

The user must be able to identify the original source behind important government facts.


---

56. Eligibility Localization

An eligibility state may have stable values:

ELIGIBLE
CONDITIONALLY_ELIGIBLE
UNKNOWN
NOT_ELIGIBLE
NOT_APPLICABLE

The English UI translates those values.

The Bengali UI translates those values.

The underlying JavaScript must continue to use the stable values.


---

57. Scoring Localization

Score semantics must also be stable.

Example:

stressBurden = 8

remains:

8

in every language.

English may display:

Stress Burden: High

Bengali may display:

চাপের মাত্রা: বেশি

The underlying data is unchanged.


---

58. Recommendation Localization

Recommendation categories remain stable:

TOP_MATCH
STRONG_MATCH
GOOD_MATCH
MIXED_MATCH
LOW_MATCH
VERIFY_FIRST
NOT_ELIGIBLE

The UI translates their display labels.

The recommendation engine must never compare translated text.


---

59. Search Behaviour Across Languages

Search should ideally support:

English terms;

Bengali terms;

official abbreviations;

full forms;

alternate names;

stable IDs.


Where practical, searchable records may contain language-specific search aliases.

Example:

searchAliases:
{
  "en": ["Kolkata Police", "KP"],
  "bn": ["কলকাতা পুলিশ"]
}

These aliases are search metadata, not canonical identifiers.


---

60. Search Must Not Translate IDs

A search for:

ssc cgl

and:

এসএসসি সিজিএল

may resolve to the same:

ssc-cgl

job/exam identifier.

The search layer handles the language differences.


---

61. Accessibility

Localization must preserve accessibility.

The application must ensure:

translated aria-label;

translated form instructions;

correct lang;

correct dir;

readable Bengali typography;

sufficient text space;

no clipped labels;

no critical information conveyed only through colour;

keyboard navigation remains intact.



---

62. Responsive UI and Localization

Bengali and future languages may require different text lengths.

The CSS must not assume that English labels determine component width.

Avoid fixed-width UI controls where translated text may overflow.

Use:

flex
grid
min-width
max-width
overflow-wrap

appropriately.


---

63. Navigation Labels

Translated navigation labels must fit on:

mobile;

tablet;

desktop.


The mobile menu should allow wrapping where necessary.

Do not truncate important labels simply because an English label happened to be short.


---

64. Text Expansion

Future languages may be longer than English.

The UI should support text expansion without:

breaking cards;

overlapping icons;

clipping buttons;

destroying table layouts.


Components must be designed around flexible content.


---

65. Translation Validation

The repository should eventually validate:

1. Every expected translation key exists in the default language.


2. Every supported language contains required production keys.


3. No unexpected keys exist without being intentional.


4. Placeholders are preserved.


5. Translation values are strings or valid structured values according to schema.


6. Language metadata is valid.


7. Duplicate keys do not occur.


8. JSON is syntactically valid.




---

66. Default-Language Authority

en.json is the structural reference language for the initial implementation.

This means:

en.json

defines the expected set of UI translation keys.

Other language files should remain structurally aligned with it.

A future language may temporarily omit translations during development, but production release should not knowingly publish incomplete critical UI strings.


---

67. Bengali Translation Standard

Bengali translations should aim for:

natural modern Bengali;

clear educational language;

terminology appropriate for Indian government recruitment;

preservation of official abbreviations;

readability on mobile;

consistent translation of repeated concepts.


Do not translate every English government acronym into an invented Bengali acronym.

For example:

B.Ed.
D.El.Ed.
ITI
SSC
UPSC
WBCS

should generally preserve their recognised abbreviations.


---

68. Government Terminology

Where an English government term is the recognised official terminology, the Bengali UI may use:

Bengali explanation + official English term

where this improves clarity.

Example:

পদোন্নতি (Promotion)

rather than inventing an unfamiliar translation that makes the government term difficult to recognise.


---

69. Glossary Integration

/data/common/glossary.json should remain the canonical terminology database for abbreviations and government terms.

Translation files provide UI wording.

The glossary may later contain localized display names.

Do not duplicate complete glossary definitions into every language file unnecessarily.


---

70. AI Assistant Localization

The future AI assistant must receive the active language context.

Conceptually:

User Language
      ↓
AI Context
      ↓
Prompt Language Instruction
      ↓
AI Response

If the user selects Bengali, the AI interface should normally respond in Bengali unless the user explicitly requests another language.

However, factual government data must still be sourced from the structured project data and authoritative source references.


---

71. AI Must Not Change Canonical Data

Language switching or AI translation must never modify:

eligibility rules;

scores;

source IDs;

job IDs;

exam IDs;

government values;

pay values;

dates;

notification numbers.


AI may translate or explain these values.

It must not redefine them.


---

72. URLs and Routing

Changing language should not require creating a separate copy of every HTML page.

For the current static architecture, language can be maintained through application state and localStorage.

Future SEO-oriented localized routes may be introduced later if necessary.

The underlying page architecture must remain compatible with:

/pages/jobs.html
/pages/exams.html

and the existing repository layout.


---

73. SEO

The application should update localized:

<title>
<meta name="description">
<html lang="">

when appropriate.

Localized SEO metadata should remain separate from structured government data.

Future language-specific canonical and alternate links may be introduced when a dedicated multilingual URL architecture is adopted.


---

74. Translation of Numerical and Scoring Labels

Labels such as:

8/10
84/100
₹50,000
31 August 2026

must be generated from structured values.

The translation layer controls surrounding text, while locale-aware formatting handles numbers and dates.


---

75. Data Export

CSV exports should preserve canonical underlying values.

Where practical, exports may include localized display columns.

For example:

jobId
postName
postName_en
postName_bn

rather than replacing the canonical identifier.

This helps preserve data interoperability.


---

76. Bookmark Compatibility

Bookmarks stored in localStorage must use stable IDs.

Example:

govcareer.bookmarks = [
  "ssc-cgl-aso",
  "kolkata-police-si"
]

Changing English → Bengali must not invalidate them.


---

77. Comparison Compatibility

Comparison selections must use stable IDs.

Example:

govcareer.compare = [
  "kolkata-police-si",
  "wbpsc-wbcs-executive",
  "ssc-cgl-aso"
]

Translations should only affect presentation.


---

78. Recently Viewed Compatibility

Recently viewed jobs and exams must use stable IDs.

The language should never become part of the primary identity.


---

79. Localized Error Handling

All user-facing errors must use translation keys.

Bad:

throw new Error("Failed to load Bengali data");

as a user-visible message.

Preferred:

errors.translationLoadFailed

The JavaScript can log technical details separately for development.


---

80. Language Fallback Chain

Initial fallback:

Selected Language
        ↓
English
        ↓
Generic hard-coded accessibility-safe fallback

The final fallback must be used sparingly.

The preferred production state is that all critical translations exist.


---

81. Translation Loader Responsibilities

/js/language.js should eventually provide:

initLanguage()
loadTranslations(languageId)
setLanguage(languageId)
getCurrentLanguage()
translate(key, variables)
hasTranslation(key)
getFallbackTranslation(key)
getLanguageMetadata(languageId)
updateDocumentLanguage()
updateDocumentDirection()
persistLanguagePreference()

The module must remain independent from:

eligibility-engine.js
scoring-engine.js
ranking-engine.js

except through display-layer integration.


---

82. Translation File Validation

A schema for translation files should eventually be added to:

/data/schemas/i18n.schema.json

This schema should validate at least:

language.id
language.locale
language.name
language.nativeName
language.direction
language.status
metadata.version
metadata.lastUpdated

and the supported structure of translation values.


---

83. Translation Key Consistency

A repository check should compare:

en.json

against:

bn.json

and eventually every future language file.

The system should detect:

missing keys;

unexpected keys;

mismatched placeholders;

invalid values.


Recommended workflow:

edit en.json
      ↓
run localization validation
      ↓
update bn.json
      ↓
run placeholder validation
      ↓
commit


---

84. Data Validation Integration

The localization validation workflow should eventually be included in:

.github/workflows/localization-check.yml

It should run independently of government-data validation.

A translation error must not be confused with a recruitment-data error.


---

85. Versioning

Each translation file carries its own version.

Example:

version: 1.0.0

A content-only translation correction may be handled according to the project's semantic-versioning policy.

The project-level change should also be recorded in:

CHANGELOG.md

when appropriate.


---

86. Translation Ownership

The repository should treat translations as maintained product assets.

A translation is not automatically considered authoritative merely because it exists.

For factual government terminology:

official source
        ↓
canonical government data
        ↓
localized explanation

This preserves factual integrity.


---

87. What Must Never Happen

The internationalization system must never:

change a job ID by language;

change an exam ID by language;

change a qualification ID by language;

translate a source URL;

alter a notification number;

alter a pay value;

alter an eligibility rule;

alter a scoring rule;

use translated strings as machine logic;

silently substitute a different government entity;

allow a missing translation to become undefined;

allow language switching to erase user preferences;

mix factual source data with UI translation content.



---

88. Current Language Scope

The current production language scope is:

English
Bengali

Detailed government-job datasets currently remain focused on:

Central Government
West Bengal Government

This language architecture must not imply that complete government-job databases exist for every state merely because their future language and state selectors exist.


---

89. Future State Expansion

The future state architecture:

data/states/<state-slug>/

and future language architecture:

data/i18n/<language>.json

are independent systems.

For example:

West Bengal
+
Bengali

does not imply:



Similarly:



does not imply:



Language availability and government-data availability must remain independent.


---

90. Localization and Recommendation Results

The recommendation engine must return structured values.

Example:

{
  "careerId": "kolkata-police-si",
  "eligibilityStatus": "ELIGIBLE",
  "overallScore": 82,
  "confidence": "HIGH"
}

The English interface translates the labels.

The Bengali interface translates the labels.

The structured result remains unchanged.


---

91. Localization and Eligibility Results

The eligibility engine should return:

ELIGIBLE
CONDITIONALLY_ELIGIBLE
UNKNOWN
NOT_ELIGIBLE

The localization layer turns those into human-readable messages.

The eligibility engine must never return:



or:



as its canonical machine value.


---

92. Localization and Scoring

The scoring engine should return numeric and stable semantic values.

Example:

familyFit = 8
stressBurden = 6
transferBurden = 4

The localization layer decides how these appear in the UI.

This keeps mathematics independent of language.


---

93. Localization and Search

Search indexes may contain multilingual text, but canonical IDs remain unchanged.

Search index concept:

jobId
searchTerms
searchTermsByLanguage

This lets the system search English and Bengali terms without duplicating job records.


---

94. Translation Security

Translation JSON is repository-controlled application data.

The application must:

validate JSON;

escape text appropriately;

avoid unsafe HTML injection;

avoid executable content;

avoid dynamic script evaluation;

treat translations as data, not code.



---

95. Accessibility Requirements

Every translated interface must maintain:

sufficient contrast;

keyboard access;

screen-reader compatibility;

readable line lengths;

correct language metadata;

correct direction;

accessible labels;

visible focus states.


Translation must never sacrifice accessibility.


---

96. Quality Assurance

Before releasing a new language, test:

Functional

language switching;

persistence;

page navigation;

search;

filters;

career cards;

comparison;

eligibility;

recommendation;

calculators.


Visual

mobile;

tablet;

desktop;

long labels;

long paragraphs;

cards;

tables;

navigation.


Accessibility

screen reader language recognition;

keyboard navigation;

focus order;

translated labels;

correct lang;

correct dir.


Data

IDs unchanged;

source URLs unchanged;

numbers unchanged;

rules unchanged.



---

97. Acceptance Criteria

The Internationalization Model is correctly implemented when:

English is the default language;

Bengali is the second supported language;

stable IDs remain language-independent;

translation keys are semantic;

UI strings live in translation files;

assessment question IDs do not change by language;

assessment option IDs do not change by language;

eligibility values remain language-independent;

scoring values remain language-independent;

recommendation values remain language-independent;

official source titles can be preserved;

source URLs remain unchanged;

missing translations have a controlled fallback;

placeholders remain intact;

language preference persists locally;

<html lang> updates correctly;

document direction is configurable;

Bengali text renders correctly;

responsive layouts handle translation length;

data exports preserve canonical values;

bookmarks and comparisons survive language switching;

localization validation can run in continuous integration;

future languages can be added without redesigning the core engines;

language availability does not imply government-data availability;

AI can use the selected language without becoming the source of government facts.



---

98. Canonical File Responsibilities

/data/i18n/en.json
    ↓
English UI translations

/data/i18n/bn.json
    ↓
Bengali UI translations

/js/language.js
    ↓
Loading, switching, fallback, persistence and locale application

/data/common/glossary.json
    ↓
Canonical government terminology

/data/assessment/questions.json
    ↓
Stable question definitions

/data/assessment/options.json
    ↓
Stable option definitions

/data/assessment/profile-fields.json
    ↓
Stable candidate-profile fields

/data/assessment/response-scoring.json
    ↓
Language-independent answer-to-profile transformations

/js/recommendation/eligibility-engine.js
    ↓
Language-independent hard eligibility

/js/recommendation/scoring-engine.js
    ↓
Language-independent scoring

/js/recommendation/ranking-engine.js
    ↓
Language-independent ranking

/js/recommendation/explanation-engine.js
    ↓
Structured explanations
    ↓
Localized UI presentation


---

99. Final Internationalization Principle

The permanent architecture is:

STABLE DATA
        +
STABLE LOGIC
        +
STABLE IDENTIFIERS
        ↓
LANGUAGE-NEUTRAL APPLICATION STATE
        ↓
LOCALIZED PRESENTATION

The system must therefore behave the same logically whether the user views it in English, Bengali or a future supported language.

Only the human-readable presentation changes.


---

100. Final Non-Negotiable Rule

> Language is a presentation layer, not a data-identity layer and not a business-logic layer.



Therefore:

English
Bengali
Hindi
Marathi
Tamil
Telugu
Gujarati
Odia
Assamese
...

may all present the same underlying:

Job
Exam
Qualification
Eligibility Rule
Candidate Profile
Score
Recommendation
Source

without changing the canonical identifiers or logic.

The GovCareer Compass platform must always preserve:

FACT
    ≠
TRANSLATION

ID
    ≠
DISPLAY LABEL

ELIGIBILITY
    ≠
PREFERENCE

SCORING
    ≠
LANGUAGE

OFFICIAL SOURCE
    ≠
LOCALIZED SUMMARY

This separation is the foundation that allows the project to expand from a bilingual West Bengal + Central Government platform into a multilingual, multi-state government-career intelligence system without rebuilding its core architecture.
