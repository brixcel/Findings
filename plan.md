You are the primary senior full-stack engineer for this project.

Build the complete production-ready web application described below. Do not merely explain what should be built. **Inspect the existing repository first, understand its current architecture, then implement the application directly in the codebase.**

The application is a research data-entry and statistical-analysis system for the undergraduate thesis:

**AR-DUINO-M: AUGMENTED REALITY-DRIVEN USER INTERFACE FOR NAVIGATION AND OPERATION OF MICROCONTROLLERS**

The latest thesis questionnaire has TWO respondent groups:

1. Student / End-User
2. Instructor / Subject Matter Expert

This is NOT an online respondent survey.

Researchers physically distribute printed questionnaires and then manually encode the collected 1–5 responses into this application.

The primary UX goal is therefore:

**FAST, ACCURATE, LOW-FRICTION DATA ENTRY.**

---

## FIRST: INSPECT THE REPOSITORY

Before changing anything:

1. Inspect the complete project structure.
2. Identify the framework, database, ORM, authentication, routing, UI system, and existing components.
3. Reuse existing architecture where appropriate.
4. Do not unnecessarily replace the existing stack.
5. Check package.json and existing dependencies.
6. Check database schema/migrations.
7. Check existing environment variables.
8. Determine how the application is currently run.
9. Identify existing design conventions.
10. Then implement the feature.

Do not create an unnecessary second application inside the repository.

If the repository is empty, establish a clean modern full-stack architecture appropriate for the project.

---

# QUESTIONNAIRE STRUCTURE

There are exactly **33 indicators** across the complete questionnaire:

### Functionality

4 items

### Reliability

5 items

### Usability

5 items

### Efficiency

5 items

### Portability

4 items

### Maintainability

5 items — EXPERTS ONLY

### Educational Effectiveness

5 items — STUDENTS ONLY

Therefore:

Student respondent = 28 applicable items.

Expert respondent = 28 applicable items.

Do NOT turn this into 35 questions per respondent.

---

# RESPONDENT TYPES

## Student / End-User

Answers:

* Functionality — 4
* Reliability — 5
* Usability — 5
* Efficiency — 5
* Portability — 4
* Educational Effectiveness — 5

## Instructor / Subject Matter Expert

Answers:

* Functionality — 4
* Reliability — 5
* Usability — 5
* Efficiency — 5
* Portability — 4
* Maintainability — 5

Maintainability must NEVER appear for students.

Educational Effectiveness must NEVER appear for experts.

---

# RESPONDENT PROFILE

Create a respondent creation/data-entry flow with:

* Automatically generated Respondent ID
* Respondent Type

  * Student / End-User
  * Instructor / Subject Matter Expert
* Academic Program
* Year Level
* Device Used

  * Researcher-provided device
  * Own device / downloaded from website
* Status

  * Draft
  * Completed

Preserve anonymity. Do not add unnecessary personally identifying information.

---

# QUESTION CONFIGURATION

Do not invent the actual questionnaire wording.

The current thesis source provides the number of items and criteria but the application should allow the researchers to enter/modify the exact printed questionnaire wording later.

Create a centralized questionnaire configuration.

Example:

Functionality:

* Functionality 1
* Functionality 2
* Functionality 3
* Functionality 4

Do the same for every criterion.

The statistical engine must depend on item IDs rather than hardcoded UI text.

---

# DATA ENTRY EXPERIENCE

This is the MOST IMPORTANT part.

The researcher should be able to enter a printed questionnaire extremely quickly.

For every question display:

**1  2  3  4  5**

Use large clickable rating controls.

Keyboard support:

* 1 → select rating 1
* 2 → select rating 2
* 3 → select rating 3
* 4 → select rating 4
* 5 → select rating 5
* Tab / arrow navigation where practical

Show:

**Question 12 of 28**

and a progress indicator.

Group questions by criterion.

Allow:

* Save Draft
* Complete & Save
* Save & Add Another Respondent

A completed respondent cannot be saved if any applicable question is unanswered.

Never convert missing answers into zero or any default value.

---

# DATABASE

Store RAW respondent-level answers.

Do NOT only store aggregate statistics.

At minimum preserve:

Respondent:

* id
* respondentType
* academicProgram
* yearLevel
* deviceUsed
* status
* createdAt
* updatedAt

Answer:

* respondentId
* itemId
* criterion
* rating
* timestamps if appropriate

Question:

* itemId
* criterion
* itemNumber
* questionText
* applicableRespondentType

Use proper relationships and constraints.

Raw data must remain available even after statistics are calculated.

---

# STATISTICAL ENGINE

Implement the calculations as reusable functions/services, not UI-specific code.

For every item and criterion calculate:

* N
* Frequency for ratings 1–5
* Percentage for ratings 1–5
* Weighted Mean
* Standard Deviation
* Verbal Interpretation

Weighted Mean:

Σ(f × x) / N

Standard deviation should be calculated from respondent-level observations using sample standard deviation.

---

# VERBAL INTERPRETATION

Use EXACTLY this current thesis scale:

| Mean Range | Interpretation       |
| ---------- | -------------------- |
| 4.21–5.00  | Very Much Acceptable |
| 3.41–4.20  | Much Acceptable      |
| 2.61–3.40  | Acceptable           |
| 1.81–2.60  | Less Acceptable      |
| 1.00–1.80  | Not Acceptable       |

Do NOT use:

* Highly Acceptable
* Moderately Acceptable
* Very Acceptable
* any previous terminology

Use the exact current wording.

---

# GROUP RESULTS

Never treat Students and Experts as one primary population.

Provide separate result views.

## Student Results

Show:

* Functionality
* Reliability
* Usability
* Efficiency
* Portability
* Educational Effectiveness

## Expert Results

Show:

* Functionality
* Reliability
* Usability
* Efficiency
* Portability
* Maintainability

For every criterion show item-level and criterion-level:

* N
* Weighted Mean
* SD
* Interpretation

---

# OBJECTIVE 3 STATISTICAL TEST

The current thesis specifies:

**Independent Samples t-Test**

Use:

* two-tailed test
* α = 0.05

Compare ONLY:

1. Functionality
2. Reliability
3. Usability
4. Efficiency
5. Portability
6. Composite Shared Mean

Do NOT compare:

* Maintainability
* Educational Effectiveness

because these are role-specific.

---

# COMPOSITE SHARED MEAN

For each respondent calculate a respondent-level composite from:

* Functionality
* Reliability
* Usability
* Efficiency
* Portability

Use these individual respondent-level composite observations in the independent samples t-test.

Do NOT perform the t-test using only two aggregated criterion means.

---

# GROUP COMPARISON TABLE

Create:

| Variable | Expert Mean | Student Mean | Difference | t-value | p-value | Result |
| -------- | ----------: | -----------: | ---------: | ------: | ------: | ------ |

For p-value:

p ≤ 0.05:

**Statistically significant difference**

p > 0.05:

**No statistically significant difference**

Also display:

* Expert sample size
* Student sample size
* α = 0.05
* two-tailed test

Use:

**Reject H₀**

or

**Fail to reject H₀**

Do not use “accept H₀.”

---

# DASHBOARD

Create a professional research dashboard.

Cards:

* Total Respondents
* Students
* Experts
* Completed
* Drafts

Navigation:

* Dashboard
* Add Respondent
* Respondents
* Student Results
* Expert Results
* Group Comparison
* Item Analysis
* Export
* Questionnaire Configuration

---

# RESPONDENT MANAGEMENT

Table:

* ID
* Respondent Type
* Academic Program
* Year Level
* Device
* Status
* Date Added
* Actions

Actions:

* View
* Edit
* Delete

Include:

* search
* respondent-type filter
* status filter

Require confirmation before deletion.

---

# ITEM ANALYSIS

Create an analysis page where researchers can select:

* Respondent Group
* Criterion
* Item

Then display:

* N
* Rating 5 frequency/percentage
* Rating 4 frequency/percentage
* Rating 3 frequency/percentage
* Rating 2 frequency/percentage
* Rating 1 frequency/percentage
* Weighted Mean
* SD
* Verbal Interpretation

---

# EXPORT

Implement CSV export.

### Raw Responses

Include:

* respondent metadata
* every item score

### Statistical Results

Include:

* respondent group
* criterion
* item
* N
* weighted mean
* SD
* interpretation

### Group Comparison

Include:

* variable
* Expert N
* Student N
* Expert Mean
* Student Mean
* difference
* t-value
* p-value
* result

---

# DATA INTEGRITY

This is academic research data.

Never:

* invent responses
* invent respondents
* invent findings
* invent p-values
* silently fill missing answers
* mix demo data with real data
* mix expert-only and student-only criteria
* calculate group comparison from aggregate means

If there is insufficient data for a calculation, clearly show:

**Insufficient data**

rather than fabricating a result.

---

# DEMO DATA

You may create an optional demo-data mechanism for development.

If implemented:

* clearly label it as DEMO
* never include it in real results
* provide a clear way to delete it
* never automatically create fake research respondents

---

# UI / UX

Make it look like a serious academic research application.

Avoid:

* AI-generated SaaS aesthetics
* excessive gradients
* glowing cards
* giant hero sections
* unnecessary animations
* chatbot UI
* excessive rounded cards
* decorative dashboards that reduce usability

Prioritize:

* readable tables
* fast forms
* clear hierarchy
* compact spacing
* keyboard accessibility
* obvious save states
* clear statistical presentation

Desktop is the primary environment.

Responsive behavior should still work on tablet/mobile.

---

# QUALITY REQUIREMENTS

Before finishing:

1. Run the application.
2. Run type checking.
3. Run linting if available.
4. Run tests if available.
5. Verify database migrations.
6. Test creating a Student.
7. Verify exactly 28 questions appear.
8. Test creating an Expert.
9. Verify exactly 28 questions appear.
10. Verify Student does not see Maintainability.
11. Verify Expert does not see Educational Effectiveness.
12. Enter known test data and manually verify weighted mean.
13. Verify standard deviation.
14. Verify frequency and percentages.
15. Verify interpretation boundaries.
16. Verify t-test calculations.
17. Verify composite shared mean.
18. Verify CSV exports.
19. Verify incomplete responses cannot be completed.
20. Check for TypeScript/runtime errors.

Do not stop after creating the UI.

The feature is only complete when the underlying data model, calculations, persistence, validation, and analysis work together.

If you encounter an implementation decision not explicitly specified above, choose the simplest maintainable solution that preserves the thesis requirements and existing project architecture.

Implement the entire feature now.


## RESEARCH DATA VOLUME / 150+ RESPONDENTS

This application must be designed to comfortably handle **150+ real thesis respondents** without requiring any architectural changes.

Expected initial dataset:

* 150+ respondents
* 28 responses per respondent
* 4,200+ individual response records
* Two respondent groups: Students and Experts
* Multiple statistical calculations across all respondents

The architecture must NOT assume that only a small number of respondents will exist.

Use proper database-backed persistence rather than storing research data only in frontend state, localStorage, static JSON, or browser memory.

Requirements:

* Store every respondent in the database.
* Store every individual questionnaire answer in the database.
* Use indexed foreign keys for respondent/question relationships.
* Query aggregate statistics from the database or efficiently process the retrieved respondent-level data.
* Do not load the entire dataset unnecessarily on every page.
* Paginate the Respondents table.
* Keep filtering/searching server-side or database-backed where appropriate.
* Do not calculate statistics repeatedly on every UI render.
* Keep raw responses separate from derived statistical results.
* Ensure statistical calculations operate correctly when there are 150+ respondents.
* Ensure Student and Expert datasets remain separate.
* Ensure the Independent Samples t-Test uses the respondent-level observations for each common criterion.
* Ensure the Composite Shared Mean is calculated per respondent before the t-test.
* Exports must work with 150+ respondents and thousands of response records.

Test the application using at least **150 synthetic test respondents** during development.

The synthetic data must be clearly marked as test/demo data and must never be mixed with actual thesis data.

After testing, verify that:

1. 150 respondents can be stored.
2. 150 respondents appear correctly in the respondent management system.
3. Pagination works.
4. Search/filtering works.
5. All 4,200+ response records are preserved.
6. Student and Expert counts are correct.
7. Criterion means are correct.
8. Standard deviations are correct.
9. Frequency and percentage distributions are correct.
10. The Independent Samples t-Test receives the correct respondent-level datasets.
11. CSV export contains all respondents and responses.
12. Deleting or editing a respondent does not corrupt unrelated responses.

Do not optimize prematurely for millions of records; the immediate requirement is reliable handling of **150–1,000 respondents** with room for future growth.
