# Student Flow Implementation

This document details the architecture, file structure, and implementation of the Student Flow feature, enabling students to securely log into Grad-E, view their upcoming/processed exams filtered strictly by cohorts they belong to, and review their highly-detailed AI-graded papers in a native interface.

## Data Pipelines

The Student Flow hinges on intelligent database aggregation, since students don't directly "own" exams (Exams belong to a Teacher and Class). 

### 1. `studentRoutes.js` (`backend/routes/studentRoutes.js`)
Instead of directly matching `Exam.studentId`, which does not exist, the student dashboard relies on a 4-step pipeline:
1. **Fetch Classes**: Locate all `Class` documents where `students` includes the logged-in user.
2. **Fetch Exams**: Extract the derived array of `classIds`, and map all `Exams` assigned to those Classes globally.
3. **Fetch Submissions**: Query the isolated `Submission` table matching the derived `examIds` combined with the explicit `studentId`.
4. **Merge Strategy**: Iterate the global exams, injecting the mapped submission directly as `examObj.mySubmission`. Strip out the heavy `.pdfData` field (Base64 buffers) preventing heavy API payload crashes on list renders. 

## Frontend Architecture

Housed within `App.jsx`, Student routing utilizes the protected `StudentLayout` confirming the user carries the `"student"` clearance role.

### Key Interfaces

- **`StudentDashboard.jsx`**: Generates visual summary cards listing upcoming and graded exams via `GET /api/student/dashboard/:studentId`. Grouped natively by subject. Cards dynamically render contextual lockouts (e.g. `opacity: 0.5` missing pointer events on processing exams) and green Checkmarks linking to the detailed View if `status === "Graded"`. Draft exams are completely hidden from discovery.
  
- **`StudentExamResult.jsx`**: Represents the final destination mirroring the Teacher `GradingView.jsx`, but locked heavily to read-only constraints. Splits the horizontal screen evenly:
    - **Left Screen**: Injects the student's raw uploaded Answer Sheet PDF natively via an `<iframe>` wrapping the MongoDB Base64 buffer `data:application/pdf;base64,{}` minimizing dependencies.
    - **Right Screen**: Displays a massive static Total Score card followed by a scrollable list of the detailed itemized AI feedback logic validating exact point drops and descriptive rationale. Colors highlight correct/incorrect logic natively (Red/Green/Amber edges).

## Future Integration Outlook
1. Plagiarism flags generated on the Teacher's end should explicitly remain hidden from the Student View permanently to prevent contestation mapping.
2. Ensure Firebase tokens remain verified upstream on the `/dashboard` mapping call.
