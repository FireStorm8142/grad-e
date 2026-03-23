# Admin Flow Implementation

This document details the architecture, file structure, and implementation of the Admin Flow feature, allowing administrators to seamlessly manage Users, Classes, Subjects, and Teaching Assignments within Grad-E.

## Overview of Changes

The full-stack implementation introduces a complete CRUD interface for managing the fundamental entities within the platform. Administrator roles gain exclusive access to a protected routing group, showcasing real-time overview statistics and specialized management grids.

## Database Additions

Three new fundamental schemas have been added to the MongoDB hierarchy:

1. **`Class` (`models/Class.js`)**
   - Represents student cohorts (e.g., Grade 10 A).
   - Fields: `name` (String), `students` (Array of ObjectIds referencing the User collection).

2. **`Subject` (`models/Subject.js`)**
   - Represents the various learning topics on the platform.
   - Fields: `name` (String).

3. **`Assignment` (`models/Assignment.js`)**
   - A unifying junction model allocating a distinct Teacher to a specific Subject and Class.
   - Fields: `classId`, `subjectId`, `teacherId` (all ObjectIds).
   - Enforces a unique compound index to prevent duplicate identical assignments.

## Backend APIs

The Express API has been expanded with dedicated routers:

- **`classRoutes.js` (`/api/classes`)**: Facilitates class CRUD operations and the `POST /:id/students` and `DELETE /:id/students/:studentId` for dynamic drag-and-drop roster management.
- **`subjectRoutes.js` (`/api/subjects`)**: Facilitates subject CRUD.
- **`assignmentRoutes.js` (`/api/assignments`)**: Orchestrates linking users, subjects, and classes together. Populates linked ID fields recursively for easy frontend consumption.
- **`adminRoutes.js` (`/api/admin/stats`)**: A specialized high-level query endpoint yielding total sums of teachers, students, available classes, and subjects.
- **`userRoutes.js` (Updated)**: The `GET /api/users` function now parses standard `?role=` and `?search=` URL query parameters for straightforward dataset filtering.

## Frontend Architecture

The frontend routing relies on `react-router-dom`, encapsulated strictly behind an `AdminLayout` higher-order pattern checking for the `role === "admin"` identity. 

### Key Interfaces

- **`AdminLayout.jsx`**: Provides the structural sidebar and contextual navigation layout persistent across all admin pages.
- **`AdminDashboard.jsx`**: Generates visual summary statistic cards.
- **`UserManagement.jsx`**: A tabbed table splitting users intelligently. Includes a localized search query bar and modals to seed new account entities.
- **`SubjectManagement.jsx` & `ClassManagement.jsx`**: Straightforward List/Create interfaces. 
- **`AssignmentManagement.jsx`**: A streamlined form assigning Teachers accurately combining fetched dropdown data from Classes, Subjects, and Teachers.
- **`ClassDetail.jsx`**: An advanced interface integrated with `@hello-pangea/dnd` orchestrating interactive student assignment. Administrators drag floating "Unassigned Student" cards dropping them sequentially into the synchronized "Class Roster" dropping zones—which directly triggers the backend roster insertion endpoints.

## Future Integration Outlook

This implementation relies on open `/api` routes locally. Later implementation cycles will necessitate adding Firebase JWT validation middleware aggressively across all these new endpoints to secure mutations. 
