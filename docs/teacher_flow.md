# Teacher Flow Implementation

This document details the architecture, file structure, and implementation of the Teacher Flow feature, enabling educators to create and manage their assigned exams, utilize AI for grading criteria, perform seating arrangements, and manually review graded results directly inside Grad-E.

## Overview of Changes

The implementation introduces dedicated views tailored exclusively for users carrying the `teacher` role. It connects directly with assigned Classes and Subjects, restricting teacher access only to resources they maintain. 

## Database Additions

Two pivotal schemas have been added to the MongoDB hierarchy:

1. **`Exam` (`models/Exam.js`)**
   - Stores metadata including Date, Total Marks, Subject, Class, and Teacher.
   - Encompasses `criteria` as a nested array where each object contains a question's points and AI-defined valuation notes.
   - Embeds a `seatingArrangement` Object tracking matrix dimensions (`rows`, `columns`) and an array mapping specific Student IDs to coordinates.

2. **`Submission` (`models/Submission.js`)**
   - Individual representation of a student's answer sheet tied to an `Exam`.
   - Stores the Base64 representation of the uploaded file inside the `pdfData` field (future implementations will shift this to AWS S3 / Cloud Storage).
   - Contains a rich `feedback` array matching the Exam's criteria, providing per-question marks and textual feedback.

## Backend APIs

The Express API expands the ecosystem handling the Teacher operations:

- **`examRoutes.js` (`/api/exams`)**: 
   - Facilitates Exam CRUD operations.
   - AI Criteria Endpoints: `POST /api/exams/:id/generate-criteria` leverages Google Gemini using Base64 buffers extracted from uploaded `Multer` fields to map out intelligent JSON grading rubrics from provided Question Papers and Answer Keys.
   - Mock Grading Endpoints: Currently, `POST /api/exams/:id/grade-all` utilizes a `setTimeout` simulated processor updating all Ungraded submissions sequentially. Real auto-grading is scheduled externally.
- **`teacherRoutes.js` (`/api/teacher`)**: Unique aggregate endpoints mapped strictly for context filtering (e.g. `GET /api/teacher/assignments/:teacherId` building distinct Subject and Class dropdowns).

## Frontend Architecture

Housed within `App.jsx`, Teacher routing inherits the protected `TeacherLayout` which acts functionally identically to the Admin variant.

### Key Interfaces

- **`TeacherDashboard.jsx`**: Greets instructors summarizing their active `Exams` intelligently grouped by `Subject` displaying conditional status badges.
- **`CreateExam.jsx`**: A two-stage stepper allowing form metadata generation, directly transitioning to a twin document-upload zone feeding the Gemini API to harvest rubric criteria which the teacher edits before saving.
- **`ExamDetail.jsx`**: Represents the bulk configuration hub divided strictly across 3 logic components (Answer Sheets Tab, Seating Tab, Overview Tab).
    - Features Chart.js visualization maps on Class metrics.
    - Features a dynamic CSS Grid click-to-assign matrix mapping local Class rosters sequentially to desks.
    - Features submission file pipelines supporting dummy assignments.
- **`GradingView.jsx`**: The culmination of the process; splits the horizontal viewport evenly between standard document `<iframe>` rendering for the Submission PDF, alongside interactive Question feedback cards where the Teacher exercises grading overrides.

## Future Integration Outlook

1. Implementing the real Grade Processing pipeline (replacing the simulated Timeout endpoint).
2. Implementing the JSON Web Token Firebase validation middleware universally.
3. Refining `classRoutes.js` dependencies directly querying `assignments`. 
