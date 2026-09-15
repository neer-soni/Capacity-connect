# CAPACITY CONNECT — FULL IMPLEMENTATION TASK

You are working on an existing Next.js project called **CAPACITY CONNECT**, a Digital Capacity Building and Learning Management Portal.

Your job is to **inspect the existing codebase first**, understand what is already implemented, and then implement the missing functionality described below.

## IMPORTANT RULES

1. DO NOT rebuild the application from scratch.
2. DO NOT delete working features.
3. DO NOT replace the existing architecture unnecessarily.
4. Reuse existing Prisma models, routes, components, middleware, authentication, dashboards, and UI wherever possible.
5. Before changing anything, inspect:
   - `package.json`
   - `prisma/schema.prisma`
   - `src/app`
   - `src/components`
   - `src/lib`
   - `src/types`
   - `src/middleware.ts`
6. Determine what already works before implementing it again.
7. Keep the existing visual design consistent.
8. Every feature must work end-to-end, not merely have a page/route.
9. Do not create fake/mock functionality where real database functionality can be implemented.
10. Do not expose secrets or API keys in client-side code.
11. Use server-side authorization for all protected mutations.
12. Maintain proper RBAC:
    - TRAINEE
    - TRAINER
    - ADMIN
13. Validate all user input.
14. Handle loading, empty, success, and error states.
15. After implementation, run:
    - TypeScript checks
    - ESLint
    - Prisma validation
    - Production build
16. Fix all errors before finishing.
17. Update the README with the implemented architecture and setup instructions.

---

# CURRENT PROJECT CONTEXT

The current application already contains substantial architecture.

Current stack includes:

- Next.js
- TypeScript
- NextAuth
- Prisma
- SQLite/dev database
- Tailwind CSS
- Radix UI
- Zustand
- Recharts
- date-fns
- bcryptjs
- Lucide React

Existing route areas include:

```text
src/app/
├── admin/
│   ├── certificates/
│   ├── competency/
│   ├── courses/
│   ├── dashboard/
│   ├── homepage/
│   ├── profile/
│   ├── reports/
│   └── users/
│
├── trainee/
│   ├── certificates/
│   ├── courses/
│   ├── dashboard/
│   ├── notifications/
│   └── profile/
│
├── trainer/
│   ├── courses/
│   ├── dashboard/
│   ├── library/
│   └── profile/
│
├── courses/
├── login/
├── pending/
└── signup/
```

There is also an existing Prisma schema, authentication system, middleware/RBAC system, dashboards, and database models.

---

# TARGET SYSTEM WORKFLOW

Implement the platform so the following workflow actually works:

```text
VISITOR
   ↓
SIGNUP / LOGIN
   ↓
AUTHENTICATION
   ↓
RBAC
   ↓
┌──────────────┬──────────────┬──────────────┐
│   TRAINEE    │   TRAINER    │    ADMIN     │
└──────────────┴──────────────┴──────────────┘

TRAINEE
   ↓
Build Profile
   ↓
Select Skills / Competencies
   ↓
Find Courses
   ↓
Enroll
   ↓
Watch Course Videos
   ↓
Track Video Progress
   ↓
Complete Course Material
   ↓
Take Quiz
   ↓
Automatic Grading
   ↓
Update Competency Profile
   ↓
Calculate Skill Gap
   ↓
Recommend Courses
   ↓
Complete Required Course
   ↓
Generate Certificate
   ↓
Build Professional Portfolio


TRAINER
   ↓
Build Profile
   ↓
Create Course
   ↓
Add Course Content
   ├── Videos
   ├── PDFs
   ├── Lessons
   └── Quizzes
   ↓
Submit Course
   ↓
ADMIN REVIEW
   ↓
APPROVE
   ↓
PUBLISH


ADMIN
   ↓
Manage Users
Manage Courses
Approve Courses
Manage Certificates
Manage Competencies
View Analytics
Manage Homepage
Generate Reports
Moderate Content
```

---

# PHASE 1 — AUDIT EXISTING CODEBASE

Before implementing anything, inspect the existing application.

Create a short internal implementation plan based on:

```text
Existing feature
Already functional?
Partially functional?
Missing?
Files involved
Database models involved
Required changes
```

Do not duplicate existing functionality.

Pay particular attention to:

- Prisma schema
- Course models
- Lesson/content models
- Enrollment models
- Quiz/assessment models
- Question/answer models
- Progress models
- Certificate models
- Competency models
- Notification models
- User roles/status
- Existing API routes
- Existing dashboards
- Existing admin approval workflow

---

# PHASE 2 — COMPLETE THE COURSE CREATION PIPELINE

The trainer must be able to create a complete course.

Required flow:

```text
Trainer Dashboard
      ↓
Create Course
      ↓
Course Details
      ↓
Add Sections
      ↓
Add Lessons
      ↓
Add Video
      ↓
Add PDF / Resource
      ↓
Create Quiz
      ↓
Save Draft
      ↓
Submit for Review
```

Implement:

## Course

Support:

- title
- slug
- description
- thumbnail
- category
- difficulty
- estimated duration
- learning objectives
- skills/competencies taught
- status

Course status should support a controlled lifecycle such as:

```text
DRAFT
PENDING_REVIEW
APPROVED
PUBLISHED
REJECTED
```

Do not allow trainees to enroll in unpublished courses.

---

# PHASE 3 — COURSE CONTENT / VIDEO SYSTEM

The current project does not yet have a complete production video infrastructure.

Implement the architecture so that video lessons support:

- video URL/storage reference
- duration
- lesson title
- lesson description
- ordering
- completion state

Create a reusable video player component.

Prefer:

```text
Vidstack
```

if compatible with the existing project.

If a production video provider is not yet configured, create a clean abstraction:

```text
VideoProvider
```

so the application can later support:

```text
Cloudinary
Mux
```

without rewriting the course system.

Do NOT hard-code a provider throughout the application.

The video player must support:

- play
- pause
- seek
- duration
- current playback position
- progress updates
- completion detection

---

# PHASE 4 — VIDEO PROGRESS TRACKING

This is critical.

A trainee's course progress must be stored in the database.

Implement a progress model if the existing schema does not already provide one.

Track at minimum:

```text
userId
courseId
lessonId
watchedSeconds
duration
percentage
completed
lastWatchedAt
```

The frontend should periodically send progress updates.

Do NOT send a database request on every video frame/time update.

Use throttling/debouncing/batching.

Example:

```text
Video playing
    ↓
Local progress state
    ↓
Periodic progress update
    ↓
API
    ↓
Database
```

When the trainee returns to the course:

```text
Database progress
      ↓
Resume video from previous position
```

When a lesson reaches the completion threshold:

```text
completed = true
```

Prevent progress from being incorrectly marked complete merely by opening the lesson.

---

# PHASE 5 — COURSE COMPLETION ENGINE

Create a reliable course completion calculation.

A course should only be considered completed when all required learning requirements are satisfied.

For example:

```text
Required lessons completed
        +
Required quiz passed
        =
Course completed
```

Do not rely only on frontend state.

The server must calculate/verify completion.

Create reusable service logic such as:

```text
calculateCourseProgress()
isCourseCompleted()
```

These should be used by:

- trainee dashboard
- course page
- certificate generation
- recommendations
- analytics

---

# PHASE 6 — QUIZ SYSTEM

Complete the existing quiz architecture.

Trainer must be able to:

```text
Create Quiz
   ↓
Add Questions
   ↓
Add Options
   ↓
Mark Correct Answer
   ↓
Set Marks
   ↓
Set Passing Score
   ↓
Publish Quiz
```

Support at minimum:

- multiple choice questions
- one correct answer
- question marks
- passing percentage

Trainee flow:

```text
Open Quiz
   ↓
Answer Questions
   ↓
Submit
   ↓
Server-side grading
   ↓
Score
   ↓
Pass / Fail
```

Never trust the correct answer sent by the browser.

Correct answers must be retrieved server-side.

---

# PHASE 7 — AUTOMATIC GRADING

Implement server-side automatic grading.

When a trainee submits a quiz:

```text
Submission
    ↓
Validate enrollment
    ↓
Load quiz/questions
    ↓
Compare answers
    ↓
Calculate score
    ↓
Calculate percentage
    ↓
Determine pass/fail
    ↓
Store attempt
    ↓
Update competency data
    ↓
Check course completion
    ↓
Check certificate eligibility
```

Store:

- attempt ID
- user ID
- quiz ID
- course ID
- answers
- score
- percentage
- passed
- submittedAt

Consider allowing multiple attempts if the existing schema supports it.

Do not destroy previous attempts.

---

# PHASE 8 — COMPETENCY / SKILL SYSTEM

This is one of the most important missing features.

Build a proper relationship between:

```text
Course
    ↓
Skills / Competencies
    ↓
Quiz Performance
    ↓
Trainee Skill Level
```

Each course should be able to define competencies it teaches.

Example:

```text
Course: Advanced Excel

Competencies:
- Spreadsheet Fundamentals
- Data Analysis
- Pivot Tables
- Data Visualization
```

A trainee profile should contain:

```text
Competency
Current level
Target level
Evidence
Last assessed
```

Use the existing competency models if possible.

Do not create duplicate competency models.

---

# PHASE 9 — SKILL GAP ENGINE

Implement a real skill-gap calculation.

Conceptually:

```text
Target Skill Level
        -
Current Skill Level
        =
Skill Gap
```

Example:

```text
Python        Current: 2   Target: 4   Gap: 2
SQL           Current: 4   Target: 4   Gap: 0
Data Analysis Current: 1   Target: 3   Gap: 2
```

Create a server-side service:

```text
calculateSkillGap(userId)
```

Return:

```text
skill
currentLevel
targetLevel
gap
priority
```

Priority should be derived from the gap.

Display the results in the trainee dashboard.

---

# PHASE 10 — COURSE RECOMMENDATION ENGINE

Use the skill-gap data to recommend courses.

Recommendation logic should consider:

```text
Trainee skill gap
       +
Course competencies
       +
Course difficulty
       +
Course completion status
       ↓
Recommended Courses
```

Example:

```text
Skill Gap:
Python = High

Recommended:
Python Fundamentals
Python for Data Analysis
Advanced Python
```

Recommendations should be generated from actual database relationships.

Do NOT simply display hard-coded recommendations.

Create a reusable server-side function:

```text
getRecommendedCourses(userId)
```

Return useful metadata:

```text
course
matchingSkills
reason
priority
```

Example reason:

```text
"Recommended because this course improves your Python competency."
```

---

# PHASE 11 — CERTIFICATE AUTOMATION

Complete the certificate workflow.

Certificate should be generated when:

```text
Course completed
AND
Required quiz passed
```

Do not allow trainees to manually create certificates for incomplete courses.

Certificate should contain:

```text
Certificate ID
Trainee name
Course name
Completion date
Course/competency information
Verification identifier
```

Implement a verification mechanism.

For example:

```text
/certificates/verify/[certificateId]
```

The verification page should display:

```text
Valid Certificate
Recipient
Course
Issue Date
Certificate ID
```

If certificate does not exist:

```text
Certificate not found / invalid
```

---

# PHASE 12 — TRAINEE PORTFOLIO

Create a dedicated portfolio section.

Example route:

```text
/trainee/portfolio
```

Portfolio should automatically aggregate:

```text
Profile
Skills
Completed Courses
Certificates
Achievements
Competencies
```

Do not require the trainee to manually enter every completed course.

Use database relationships.

Portfolio should have:

```text
Profile header
About
Skills
Competency levels
Completed courses
Certificates
Achievements
```

Add a public/shareable portfolio architecture if practical.

For example:

```text
/portfolio/[username]
```

Ensure private information is not exposed.

---

# PHASE 13 — TRAINER ANALYTICS

Use the existing Recharts dependency.

Trainer should be able to see:

```text
Total courses
Published courses
Total learners
Enrollment count
Average completion rate
Average quiz score
Course performance
```

Charts may include:

```text
Enrollments over time
Completion rate
Quiz performance
Learner progress
```

All numbers must come from actual database data.

Do not hard-code analytics.

---

# PHASE 14 — ADMIN COURSE APPROVAL

Complete the workflow:

```text
TRAINER
Course DRAFT
    ↓
Submit
    ↓
PENDING_REVIEW
    ↓
ADMIN
Review
    ↓
APPROVE / REJECT
    ↓
APPROVED
    ↓
PUBLISHED
```

Admin must be able to see:

- course information
- trainer
- lessons
- content
- competencies
- quiz
- status

Admin actions:

```text
Approve
Reject
```

If rejected, store a rejection reason.

Trainer should be able to see the status.

---

# PHASE 15 — NOTIFICATIONS

Use the existing notification system.

Generate notifications for important events.

Examples:

```text
Trainer:
"Your course has been approved."

Trainer:
"Your course has been rejected."

Trainee:
"You successfully completed the course."

Trainee:
"Your certificate is ready."

Trainee:
"New course recommended for your skill gap."

Admin:
"New course awaiting review."
```

Notifications must be linked to actual events.

Do not generate fake notifications.

If realtime infrastructure is not currently available, build the notification service cleanly so Supabase Realtime or Socket.io can be added later.

---

# PHASE 16 — SEARCH

Implement course search using the existing database.

Support:

```text
course title
description
category
skills
competencies
```

Minimum functionality:

```text
search
filter
sort
```

Example filters:

```text
Category
Difficulty
Duration
Competency
```

Use PostgreSQL full-text search only if/when PostgreSQL is introduced.

For the current SQLite environment, use a compatible implementation rather than breaking development.

---

# PHASE 17 — DATABASE MIGRATION ARCHITECTURE

The planned production architecture uses:

```text
PostgreSQL
+
Prisma
```

The current development environment may use SQLite.

Do NOT blindly replace the database before ensuring the application still works.

First make the Prisma schema database-portable where practical.

Avoid SQLite-only logic.

Use Prisma for all application database access.

Document the migration path to:

```text
Supabase PostgreSQL
```

or

```text
Neon PostgreSQL
```

Production deployment should be compatible with PostgreSQL.

---

# PHASE 18 — FILE STORAGE ABSTRACTION

Course resources require storage.

Create an abstraction for:

```text
FileStorageProvider
```

Support architecture for:

```text
UploadThing
```

and/or:

```text
S3-compatible storage
```

Video storage should remain separate from normal document storage.

Do not embed provider-specific code throughout course components.

---

# PHASE 19 — SECURITY

Review the entire application for authorization vulnerabilities.

Important rules:

### Trainee

Can only:

- edit own profile
- access own enrollments
- submit own quizzes
- access own certificates
- access own progress

### Trainer

Can only:

- edit own courses
- access own analytics
- manage own course content

### Admin

Can manage:

- users
- courses
- certificates
- competencies
- reports
- moderation

Never rely only on frontend route protection.

Every sensitive API route must verify:

```text
authenticated user
+
role
+
resource ownership
```

---

# PHASE 20 — API ARCHITECTURE

Keep API routes organized.

Use a structure similar to:

```text
/api
├── auth
├── courses
│   ├── [id]
│   ├── enroll
│   ├── progress
│   └── publish
├── quizzes
│   ├── [id]
│   └── submit
├── competencies
├── recommendations
├── certificates
│   └── verify
├── portfolio
├── notifications
└── admin
```

Do not create unnecessary endpoints.

Keep business logic out of UI components.

Prefer service modules such as:

```text
src/lib/services/
├── course.service.ts
├── progress.service.ts
├── quiz.service.ts
├── competency.service.ts
├── recommendation.service.ts
├── certificate.service.ts
└── portfolio.service.ts
```

Adapt this structure to the existing project rather than blindly creating duplicate files.

---

# PHASE 21 — FORM VALIDATION

If appropriate, introduce:

```text
React Hook Form
+
Zod
```

for complex forms.

Use validation for:

- signup
- profile
- course creation
- lesson creation
- quiz builder
- quiz submission
- admin actions

Validation must exist server-side for security.

---

# PHASE 22 — STATE / DATA MANAGEMENT

The project already uses Zustand.

Keep Zustand for client-side UI/application state where appropriate.

If the application becomes complex enough, use TanStack Query for:

- server state
- caching
- mutations
- refetching

Do not add libraries simply for the sake of adding them.

---

# PHASE 23 — PWA / OFFLINE SUPPORT

Do not make this the first priority.

After the core learning workflow is functional, prepare the application for PWA support.

At minimum:

```text
manifest
service worker architecture
offline-friendly static assets
```

Potential future functionality:

```text
Recently accessed course content
Course progress synchronization
```

Do not implement unreliable offline video downloading unless there is a clear secure architecture for it.

---

# PHASE 24 — ADMIN REPORTING

Complete admin reports.

Useful reports:

```text
Total users
Users by role
Pending approvals
Total courses
Published courses
Total enrollments
Course completion rate
Average quiz scores
Certificates issued
Competency distribution
```

Use Recharts for useful visualizations.

Provide export architecture where practical:

```text
CSV
PDF
```

Do not expose unauthorized personal information in reports.

---

# PHASE 25 — UI / UX

Keep the current design language.

Improve UX around:

- dashboards
- course cards
- progress bars
- course player
- quizzes
- skill gaps
- recommendations
- certificates
- portfolio
- admin tables

Every important page needs:

```text
Loading state
Empty state
Error state
Success feedback
```

Make the application responsive for:

```text
Desktop
Tablet
Mobile
```

Do not introduce a completely different visual design unless necessary.

---

# PHASE 26 — TESTING

After implementation, manually verify these exact journeys.

## JOURNEY 1 — TRAINEE

```text
Create trainee account
↓
Login
↓
Complete profile
↓
Select skills
↓
Browse published course
↓
Enroll
↓
Open lesson
↓
Play video
↓
Watch part of video
↓
Leave course
↓
Return
↓
Verify progress persisted
↓
Complete all lessons
↓
Take quiz
↓
Submit
↓
Verify score
↓
Verify pass/fail
↓
Verify competency update
↓
Verify skill gap changes
↓
Verify recommendation changes
↓
Complete course
↓
Verify certificate generated
↓
Open portfolio
↓
Verify course + certificate + skills appear
```

## JOURNEY 2 — TRAINER

```text
Create trainer account
↓
Pending approval
↓
Admin approves trainer
↓
Trainer login
↓
Create course
↓
Add competencies
↓
Add lessons
↓
Add video/resource
↓
Create quiz
↓
Save draft
↓
Submit course
↓
Verify PENDING_REVIEW
```

## JOURNEY 3 — ADMIN

```text
Admin login
↓
View pending course
↓
Review course
↓
Approve
↓
Verify course becomes published
↓
Verify trainee can discover it
↓
View analytics
↓
View competency data
↓
View certificates
↓
View reports
```

---

# PHASE 27 — IMPORTANT IMPLEMENTATION ORDER

Do NOT attempt every feature simultaneously.

Implement in this order:

## STEP 1

Audit current codebase.

## STEP 2

Complete:

```text
Course
→ Lessons
→ Video
→ Enrollment
```

## STEP 3

Complete:

```text
Video
→ Progress
→ Course Completion
```

## STEP 4

Complete:

```text
Quiz
→ Submission
→ Auto Grading
```

## STEP 5

Complete:

```text
Course
→ Competencies
→ Quiz Performance
→ Skill Level
```

## STEP 6

Complete:

```text
Skill Gap
→ Recommendations
```

## STEP 7

Complete:

```text
Course Completion
→ Certificate
```

## STEP 8

Complete:

```text
Portfolio
```

## STEP 9

Complete:

```text
Trainer Analytics
Admin Analytics
Reports
```

## STEP 10

Infrastructure improvements:

```text
PostgreSQL
File Storage
Video Provider
Realtime Notifications
PWA
```

---

# DEFINITION OF DONE

Do not consider the task complete simply because pages exist.

The following must actually work:

```text
Trainer creates course
        ↓
Course enters review
        ↓
Admin approves
        ↓
Course becomes available
        ↓
Trainee enrolls
        ↓
Trainee watches lessons
        ↓
Progress is persisted
        ↓
Trainee completes course content
        ↓
Trainee submits quiz
        ↓
Quiz is automatically graded
        ↓
Competency data updates
        ↓
Skill gap recalculates
        ↓
Recommendations update
        ↓
Certificate becomes available
        ↓
Portfolio reflects achievement
```

This is the core success criterion.

---

# FINAL DELIVERABLE

At the end, provide a concise implementation report containing:

## 1. Implemented

List every major feature completed.

## 2. Modified Files

List important files changed/created.

## 3. Database Changes

Explain Prisma schema changes.

## 4. API Changes

List major API endpoints.

## 5. Dependencies Added

List any packages added and why.

## 6. Remaining Limitations

Be completely honest about anything that still requires:

- external API keys
- cloud storage
- PostgreSQL
- video provider
- realtime infrastructure
- deployment configuration

## 7. Verification

Report results of:

```text
TypeScript
ESLint
Prisma validation
Production build
```

## 8. End-to-End Test

Confirm which of these workflows were successfully tested:

```text
Trainer → Course → Admin Approval
Admin → Publish
Trainee → Enrollment
Trainee → Video
Trainee → Progress
Trainee → Quiz
Quiz → Auto Grade
Quiz → Competency
Competency → Skill Gap
Skill Gap → Recommendations
Course → Certificate
Certificate → Portfolio
```

Do not claim a feature works unless you actually verified it.