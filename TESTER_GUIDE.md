# Futura Labs AI Tutor LMS — Complete Tester Guide

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Access & Login](#2-access--login)
3. [Admin Panel (super_admin / admin)](#3-admin-panel)
4. [Mentor Panel](#4-mentor-panel)
5. [Student Panel](#5-student-panel)
6. [AI Features](#6-ai-features)
7. [Shared Features (All Roles)](#7-shared-features)
8. [API Endpoints Reference](#8-api-endpoints-reference)
9. [Technology Stack](#9-technology-stack)
10. [Known Limitations](#10-known-limitations)

---

## 1. Application Overview

**Futura Labs AI Tutor LMS** is a full-stack Learning Management System with AI-powered tools, role-based access, and multi-institute support.

| Component | Detail |
|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS + Redux Toolkit + React Query + Framer Motion + Recharts |
| **Backend** | Node.js + Express + Mongoose (MongoDB) + JWT + Socket.IO |
| **AI Provider** | Claude AI (primary) → OpenAI (fallback) → Intelligent simulation (no key needed) |
| **Deployment** | Render.com (auto-deploy from GitHub `master` branch) |
| **Live URL** | https://futura-labs-lms.onrender.com |
| **GitHub** | https://github.com/sanjayksanthosh/futura-labs-lms |

### Features at a Glance

- 3 roles: Admin, Mentor, Student (with `super_admin` elevated admin)
- Course management with modules and lessons
- Assignment creation, submission, and AI-assisted grading
- Quiz creation, taking, auto-grading, and AI generation
- Attendance marking (single + bulk)
- Batch management with student enrollment
- Certificate generation, approval, and download
- Internship tracking
- Notification system (in-app)
- Institute management (super_admin only)
- AI Quiz Generator, AI Assignment Evaluator, AI Doubt Solver, AI Adaptive Quiz, AI Weak Topics Analysis
- Real-time Socket.IO updates
- Dark/Light theme toggle
- Responsive design (mobile + desktop)
- Swagger API documentation

---

## 2. Access & Login

### Demo Accounts

| Role | Email | Password | Name |
|---|---|---|---|
| **Super Admin** | `admin@futuralabs.com` | `Admin@123` | Super Admin |
| **Admin** | `institute@futuralabs.com` | `Admin@123` | Institute Admin |
| **Mentor** | `john@futuralabs.com` | `Mentor@123` | John Mentor |
| **Mentor** | `sarah@futuralabs.com` | `Mentor@123` | Sarah Mentor |
| **Mentor** | `mike@futuralabs.com` | `Mentor@123` | Mike Mentor |
| **Student** | `alice@example.com` | `Student@123` | Alice Student |
| **Student** | `bob@example.com` | `Student@123` | Bob Student |
| **Student** | `charlie@example.com` | `Student@123` | Charlie Student |
| **Student** | `diana@example.com` | `Student@123` | Diana Student |
| **Student** | `eve@example.com` | `Student@123` | Eve Student |

### Pre-seeded Data

On first boot, the database is auto-seeded with:
- **1 Institute**: Futura Labs Institute
- **5 Courses**: Python Programming, JavaScript & React, Data Science & ML, Full Stack Development, UI/UX Design
- **25 Modules**: 5 per course
- **67 Lessons**: Spread across all modules
- **25 Quizzes**: One per course module
- **25 Study Notes**: One per course module
- **1 Batch**: FS-2026 (all students enrolled)

### Login Flow

1. Navigate to the live URL
2. You'll be redirected to `/login`
3. Enter email + password from demo accounts above
4. Click "Sign In"
5. Redirects to role-based dashboard:
   - Admin/Super Admin → `/admin/dashboard`
   - Mentor → `/mentor/dashboard`
   - Student → `/student/dashboard`

### Registration

- New users can register at `/register`
- Default role on registration is `student`
- Admin can create users of any role from the Users page

### Password Reset

- Click "Forgot Password" on login page
- Enter email → receives reset token (check server logs if no email service)
- Navigate to `/reset-password/:token` → enter new password

---

## 3. Admin Panel

> **Access**: `super_admin` and `admin` roles
> **URL prefix**: `/admin/*`

### 3.1 Dashboard (`/admin/dashboard`)

**What to test:**
- [ ] Stats cards load: Total Students, Total Mentors, Total Courses, Certificates
- [ ] Trend values display on stats cards
- [ ] Enrollment trend bar chart renders with monthly data
- [ ] Course distribution pie chart renders
- [ ] Recent activity list shows recent users
- [ ] Page shows loading spinner while fetching data

### 3.2 Students Management (`/admin/students`)

**What to test:**
- [ ] Student list loads with pagination (10 per page)
- [ ] Stats cards show correct Total, Active, Inactive counts (uses pagination.total for total)
- [ ] Search works (type in search bar, results filter)
- [ ] **Add Student**: Click "Add Student" → fill form → submit → new student appears in list
  - Required fields: Name, Email, Password
  - Optional: Phone, Gender, Date of Birth
  - "Active Account" checkbox defaults to checked
- [ ] **Edit Student**: Click edit icon → modify fields → save → changes reflected
- [ ] **Delete Student**: Click delete icon → confirm dialog → student removed
- [ ] Pagination works (next/prev page buttons)
- [ ] Toast notifications appear on success/failure

### 3.3 Mentors Management (`/admin/mentors`)

**What to test:**
- [ ] Mentor list loads (shows both mentor and admin role users)
- [ ] Pagination works
- [ ] **Add Mentor**: Click "Add Mentor" → fill form → submit
  - Required: Name, Email, Password
  - Role dropdown: Mentor or Admin
  - Optional: Phone
- [ ] Mentor appears in list after creation
- [ ] Role badge shows correct role

### 3.4 Courses Management (`/admin/courses`)

**What to test:**
- [ ] Course grid loads (card layout, 3 columns)
- [ ] Stats: Total Courses, Published count, Free Courses count
- [ ] Each course card shows: title, description, level badge, published status, student count, lesson count
- [ ] Click a course card → navigates to course detail page
- [ ] **Create Course**: Click "New Course" → navigates to `/admin/courses/create`
  - Fill title, description, select level, set price
  - Toggle "Free Course" checkbox
  - Submit → course created

### 3.5 Course Creator (`/admin/courses/create` or `/course/create`)

**What to test:**
- [ ] Course form loads with all fields
- [ ] Fill in: Title, Description, Short Description, Level, Category, Price
- [ ] Toggle Free Course checkbox
- [ ] Submit creates course
- [ ] **Edit mode**: When editing an existing course, form pre-fills with existing data
- [ ] **Module management**: Add modules with title + description
- [ ] **Lesson management**: Inside each module, add lessons with:
  - Title, Description, Type (video/text/document/quiz/link), Duration, Order
  - Video URL (if video type)
  - Content body (if text type)
- [ ] Reorder lessons by changing order numbers
- [ ] Delete modules and lessons

### 3.6 Course Detail (`/admin/courses/:courseId`)

**What to test:**
- [ ] Course info displays: title, description, level, published status
- [ ] Module list shows with expandable lessons
- [ ] Enrolled students list (if any)
- [ ] Edit button navigates to edit mode
- [ ] Delete course functionality (with confirmation)

### 3.7 Batches (`/admin/batches`)

**What to test:**
- [ ] Batch list loads with pagination
- [ ] Stats: Total Batches, Active, Upcoming, Total Students
- [ ] **Create Batch**: Click "New Batch" → fill form
  - Name, Code, Mentor ID, Max Students, Start Date, End Date, Status
  - Submit → batch created
- [ ] **Edit Batch**: Click edit icon → modify → save
- [ ] **Delete Batch**: Click delete → confirm → removed
- [ ] **Add Students**: Click UserPlus icon → enter student IDs (comma-separated) → submit
- [ ] **Remove Students**: From batch detail
- [ ] Status badge shows correct variant (active=green, upcoming=blue, completed=yellow, cancelled=red)

### 3.8 Attendance (`/admin/attendance`)

**What to test:**
- [ ] Attendance records load with pagination
- [ ] Filter by date, batch
- [ ] **Mark Attendance**: Select batch, date, mark each student present/absent
- [ ] **Bulk Mark**: Submit multiple attendance records at once
- [ ] Attendance shows in list after marking

### 3.9 Assignments (`/admin/assignments`)

**What to test:**
- [ ] Assignment list loads with pagination
- [ ] Stats: Total, Published, Submissions count, Avg Score
- [ ] **Create Assignment**: Click "New Assignment" → fill form
  - Title, Type (file upload/text/quiz/coding/presentation), Description
  - Course ID, Total Points, Passing Points, Due Date
  - Toggle Published
  - Submit → assignment created
- [ ] **Edit Assignment**: Click edit icon → modify → save
- [ ] **Delete Assignment**: Click delete → confirm → removed
- [ ] **View Submissions**: Click eye icon → submissions modal opens
  - Shows student name, submission date, status (Pending/Graded)
  - Shows text submission content or file download link
- [ ] **Grade Submission**: Enter score + feedback → click "Grade" → status changes to graded
  - Score updates immediately in the modal

### 3.10 Quizzes (`/admin/quizzes`)

**What to test:**
- [ ] Quiz list loads with pagination
- [ ] Stats: Total Quizzes, Published, Total Questions, Avg Pass Rate
- [ ] **Create Quiz**: Click "New Quiz" → fill form
  - Title, Description, Course ID (optional)
  - Time Limit (minutes), Pass %, Max Attempts
  - **Add Questions**: Click "Add Question" for each
    - Question text
    - Type: Single Choice / Multi Select / True-False / Short Answer / Fill in Blank
    - Points value
    - Options (add/remove options)
    - Select correct answer (radio button)
  - Submit → quiz created
- [ ] **Edit Quiz**: Click edit → modify → save
- [ ] **Delete Quiz**: Click delete → confirm → removed
- [ ] Numeric fields (timeLimit, passingScore, maxAttempts, points) are saved as numbers, not strings

### 3.11 Certificates (`/admin/certificates`)

**What to test:**
- [ ] Certificate list loads with pagination
- [ ] Stats: Total, Approved, Pending, Rejected
- [ ] **Approve Certificate**: Click green checkmark on pending certificate → status changes to approved
- [ ] **Reject Certificate**: Click red X → rejection reason modal → enter reason → submit → status changes to rejected
- [ ] Status badges: approved=green, pending=yellow, rejected=red

### 3.12 Internships (`/admin/internships`)

**What to test:**
- [ ] Internship list loads (card layout)
- [ ] Stats: Total, Active, Completed, Pending
- [ ] **Create Internship**: Click "New Internship" → fill form
  - Company, Position, Student ID, Start/End Date, Description
  - Skills (comma-separated), Stipend, Status
  - Submit → internship created
- [ ] **Edit/Delete**: Available on each card
- [ ] Status badge shows correct color

### 3.13 Institutes (`/admin/institutes`)

> **Note**: Only `super_admin` can create/edit/delete institutes.

**What to test:**
- [ ] Institute list loads
- [ ] **Create Institute** (super_admin only): Name, Description, Contact Email, Phone, Address, Website
- [ ] **Edit Institute**: Modify fields → save
- [ ] **Delete Institute**: Confirm → removed

### 3.14 Notifications (`/admin/notifications`)

**What to test:**
- [ ] Notification list loads
- [ ] **Send Notification**: Fill form
  - Title, Message, Type (info/warning/success/error)
  - Recipient (user ID or "Send to All" checkbox)
  - Link (optional)
  - Submit → notification sent
- [ ] **Mark as Read**: Click notification → marks as read
- [ ] **Mark All as Read**: Button clears all unread
- [ ] **Delete Notification**: Remove from list

### 3.15 Settings (`/admin/settings`)

**What to test:**
- [ ] Profile section shows current name, email, phone
- [ ] **Update Profile**: Change name/phone → click Save → toast success → data persisted
- [ ] **Change Password**: Enter current password + new password + confirm → "Update Password" → success toast
  - Error if current password is wrong
  - Error if passwords don't match
  - Error if new password < 6 characters
- [ ] **Theme Toggle**: Click Light/Dark → theme changes instantly
- [ ] **Notification Preferences**: Toggle email/push/sms checkboxes (UI only, not persisted)

### 3.16 Analytics (`/admin/analytics`)

**What to test:**
- [ ] System analytics load
- [ ] Stats cards: New Users, Active Courses, Completion Rate, Revenue
- [ ] Monthly trend chart renders
- [ ] Course performance data displays

---

## 4. Mentor Panel

> **Access**: `mentor` role only
> **URL prefix**: `/mentor/*`

### 4.1 Dashboard (`/mentor/dashboard`)

**What to test:**
- [ ] Performance stats load: Courses, Students, Assignments, Avg Grade
- [ ] Course performance chart renders (bar chart with student counts per course)
- [ ] Recent assignments list shows
- [ ] Loading spinner during fetch

### 4.2 My Courses (`/mentor/courses`)

**What to test:**
- [ ] Course grid loads (courses created by or assigned to this mentor)
- [ ] Stats: Total Courses, Published, Total Students
- [ ] **Create Course**: Click → navigates to `/course/create` (shared route)
- [ ] **View Course**: Click eye icon → navigates to course detail
- [ ] **Edit Course**: Click edit icon → navigates to `/course/:id/edit` (shared route)
- [ ] Course cards show gradient header, level badge, published status

### 4.3 Assignments (`/mentor/assignments`)

**What to test:**
- [ ] Assignment list loads (assignments created by this mentor)
- [ ] Stats: Total, Open, Submissions
- [ ] **Create/Edit/Delete**: Same functionality as admin
- [ ] **View Submissions**: Modal with student submissions
- [ ] **Grade Submissions**: Enter score + feedback → grade → status updates immediately
- [ ] Pagination works

### 4.4 Quizzes (`/mentor/quizzes`)

**What to test:**
- [ ] Quiz list loads (quizzes created by this mentor)
- [ ] **Create Quiz**: Same form as admin
- [ ] **Edit/Delete**: Available
- [ ] Numeric fields saved correctly as numbers

### 4.5 Attendance (`/mentor/attendance`)

**What to test:**
- [ ] Batch selector loads all batches
- [ ] Select a batch → student list loads
- [ ] Select date
- [ ] Mark each student: Present / Absent / Late
- [ ] Click "Mark Attendance" → records saved
- [ ] Success toast appears

### 4.6 Students (`/mentor/students`)

**What to test:**
- [ ] Student list loads with pagination
- [ ] Stats: Total (uses pagination.total), Active, Avg Progress
- [ ] Search works
- [ ] **View Student**: Click eye icon → modal with student details (name, email, phone, batch, join date)
- [ ] Progress bar shows for each student

### 4.7 Internships (`/mentor/internships`)

**What to test:**
- [ ] Internship list loads
- [ ] **Create/Edit/Delete**: Available for mentor-created internships
- [ ] **Mark Complete**: Button to mark internship as completed

### 4.8 Notifications (`/mentor/notifications`)

**What to test:**
- [ ] Notification list loads
- [ ] Unread notifications highlighted
- [ ] Click to mark as read
- [ ] Send notification to students

### 4.9 Settings (`/mentor/settings`)

**What to test:**
- [ ] Same as admin settings: profile update, password change, theme toggle, notification preferences
- [ ] Email field is disabled (cannot change email)

### 4.10 Analytics (`/mentor/analytics`)

**What to test:**
- [ ] Mentor performance data loads
- [ ] Course-level analytics display

---

## 5. Student Panel

> **Access**: `student` role only
> **URL prefix**: `/student/*`

### 5.1 Dashboard (`/student/dashboard`)

**What to test:**
- [ ] Progress stats load: Enrolled Courses, Completed Lessons, Quiz Avg, Pending Assignments
- [ ] Course progress bars show for each enrolled course
- [ ] Recent assignments list
- [ ] Recent quizzes with attempt status
- [ ] Loading spinner during initial fetch

### 5.2 My Courses (`/student/courses`)

**What to test:**
- [ ] Enrolled courses grid loads
- [ ] Stats: Total Courses, In Progress, Completed
- [ ] Each card shows progress percentage
- [ ] Click course → navigates to `/course/:courseId` (course detail)

### 5.3 Assignments (`/student/assignments`)

**What to test:**
- [ ] Assignment list loads (assignments from enrolled courses)
- [ ] Stats: Pending, Submitted, Graded
- [ ] Each assignment shows: title, course, type, due date, points, submission status
- [ ] Overdue assignments show red "Overdue" badge
- [ ] **Submit Assignment**: Click "Submit" → navigates to `/assignment/submit/:assignmentId`
  - Upload file or enter text submission
  - Submit → success toast
- [ ] **View Submission**: Click "View" → shows submission details, grade, feedback
- [ ] Graded assignments show score (e.g., "85/100")

### 5.4 Quizzes (`/student/quizzes`)

**What to test:**
- [ ] Quiz list loads (published quizzes from enrolled courses)
- [ ] Stats: Available count, Attempted count, Avg Score (computed client-side)
- [ ] Each quiz shows: title, question count, time limit, passing score, attempt status
- [ ] Attempted quizzes show "Attempted" badge and best score
- [ ] **Start Quiz**: Click → navigates to `/quiz/take/:quizId`
- [ ] **Retake Quiz**: If already attempted, button says "Retake"

### 5.5 My Progress (`/student/progress`)

**What to test:**
- [ ] Progress data loads for all enrolled courses
- [ ] Each course shows: completion percentage, completed lessons count, total lessons
- [ ] Progress bars render correctly
- [ ] Quiz scores section shows recent quiz results
- [ ] Loading state while fetching

### 5.6 Attendance (`/student/attendance`)

**What to test:**
- [ ] Attendance records load
- [ ] Shows attendance history with dates and status
- [ ] Attendance percentage calculated

### 5.7 Certificates (`/student/certificates`)

**What to test:**
- [ ] Certificate list loads (or "No certificates yet" message)
- [ ] Each certificate shows: title, issued date, status badge
- [ ] **Download button**: Only visible for approved certificates
  - If `certificateUrl` exists → opens in new tab
  - If no URL → shows error toast "Certificate not available yet"
- [ ] Loading spinner during fetch

### 5.8 My Internships (`/student/internships`)

**What to test:**
- [ ] Internship list loads (or "No internships yet" message)
- [ ] Each card shows: company, position, date range, status badge, skills
- [ ] Loading spinner during fetch

### 5.9 Notifications (`/student/notifications`)

**What to test:**
- [ ] Notification list loads (or "All clear!" message)
- [ ] Unread notifications have blue highlight
- [ ] Click notification → marks as read
- [ ] Shows title, message, time ago
- [ ] Loading spinner during fetch

### 5.10 Settings (`/student/settings`)

**What to test:**
- [ ] Profile update works (name, phone)
- [ ] Password change works (current + new + confirm)
- [ ] Theme toggle (light/dark)
- [ ] All buttons show disabled state during loading

---

## 6. AI Features

> **Access**: Varies by feature (see below)
> **URL prefix**: `/ai/*`
> **AI Provider**: Claude AI (primary) → OpenAI (fallback) → Intelligent simulation (no API key)

### 6.1 AI Dashboard (`/ai`)

**What to test:**
- [ ] Dashboard loads with role-based feature cards
- [ ] **Admin/Mentor sees**: Quiz Generator, Assignment Evaluation, Doubt Solver
- [ ] **Student sees**: Adaptive Quiz, Weak Topic Analysis, Ask AI Doubt
- [ ] Clicking a card navigates to the feature

### 6.2 AI Quiz Generator (`/ai/quiz-generator`)

> **Access**: admin, mentor, super_admin

**What to test:**
- [ ] Three tabs: "From Topic", "From Content", "From Lesson"
- [ ] **From Topic tab**:
  - Enter topic (e.g., "JavaScript closures")
  - Select difficulty: beginner / intermediate / advanced
  - Select question type: MCQ / Descriptive / Mixed
  - Set question count (1-20)
  - Select course (optional)
  - Set time limit
  - Click "Generate Quiz" → AI generates questions
  - Preview shows generated questions with options and correct answers
  - Edit questions inline (modify text, options, correct answer)
  - Remove questions
  - Click "Save Quiz" → saves to database → success toast
- [ ] **From Content tab**:
  - Paste content text
  - Configure same options
  - Generate → questions based on provided content
- [ ] **From Lesson tab**:
  - Select a lesson from enrolled courses
  - Generate quiz based on lesson content
- [ ] Loading spinner during generation
- [ ] Error toast if generation fails

### 6.3 AI Assignment Evaluator (`/ai/assignment-eval`)

> **Access**: admin, mentor, super_admin

**What to test:**
- [ ] List of ungraded submissions loads
- [ ] Each submission shows: student name, assignment title, submission preview
- [ ] **Evaluate**: Click "Evaluate" on a submission
  - AI analyzes the submission
  - Returns scores across dimensions:
    - Overall Score (0-100)
    - Concept Understanding
    - Completion Quality
    - Presentation Structure
    - Practical Understanding
    - Code Quality (if applicable)
  - Returns: Feedback, Strengths, Improvements, Weak Areas, Mentor Recommendation
  - Results display in a formatted card
- [ ] Loading state during evaluation ("Evaluating...")
- [ ] Error handling if AI fails

### 6.4 AI Adaptive Quiz (`/ai/adaptive-quiz`)

> **Access**: student (primarily), also admin/mentor for testing

**What to test:**
- [ ] Page loads with topic configuration
- [ ] Select topic or enter custom topic
- [ ] Set difficulty and question count
- [ ] Click "Start Adaptive Quiz"
- [ ] Questions adapt based on previous answers (harder if correct, easier if wrong)
- [ ] Timer counts down
- [ ] Auto-submit when timer reaches zero
- [ ] Results show score + weak areas
- [ ] Option to retake or review

### 6.5 AI Weak Topics Analysis (`/ai/weak-topics`)

> **Access**: student

**What to test:**
- [ ] Page loads and analyzes student's quiz history
- [ ] Displays weak topics with:
  - Topic name
  - Number of incorrect answers
  - Accuracy percentage
  - Suggested improvement actions
- [ ] "Review Course Content" button navigates to courses
- [ ] "Generate Revision Quiz" button → creates targeted quiz for weak areas

### 6.6 AI Doubt Solver (`/ai/ask-doubt`)

> **Access**: All roles (student, mentor, admin, super_admin)

**What to test:**
- [ ] Input form loads with: Topic (optional), Question (required), Context (optional)
- [ ] Course dropdown shows available courses
- [ ] **Ask Question**: Type a doubt → click "Ask AI"
  - Answer renders with formatted text (headings, bold, code blocks, lists)
  - Code examples section shows syntax-highlighted code
  - Key takeaways displayed as bullet points
  - Related topics listed
  - Recommended resources shown
- [ ] **Copy Code**: Click copy icon on code block → copies to clipboard → icon changes to checkmark
- [ ] **History sidebar**: Shows previous questions (stored in localStorage)
  - Click history item → loads that Q&A
  - "Clear History" button removes all
- [ ] **Ctrl+Enter**: Keyboard shortcut to submit
- [ ] Loading state during AI response ("Getting Answer...")
- [ ] HTML output is sanitized (XSS protection)

---

## 7. Shared Features (All Roles)

### 7.1 Course Detail (`/course/:courseId`)

**What to test:**
- [ ] Course info displays: title, description, level, thumbnail
- [ ] Module accordion expands/collapses
- [ ] Lesson list shows inside each module
- [ ] Click lesson → navigates to `/lesson/:lessonId`
- [ ] Enrollment status shows

### 7.2 Lesson Viewer (`/lesson/:lessonId`)

**What to test:**
- [ ] Lesson content loads: title, description, type
- [ ] **Video lessons**: YouTube embed plays (URL auto-converts to embed format)
- [ ] **Text lessons**: Rich text content renders
- [ ] **Document lessons**: Document viewer/link
- [ ] Navigation: Previous/Next lesson buttons
- [ ] "Mark Complete" button (for students) → updates progress
- [ ] Back to course link

### 7.3 Quiz Taking (`/quiz/take/:quizId`)

**What to test:**
- [ ] Quiz loads with questions
- [ ] Timer counts down (if time limit set)
- [ ] Question types work:
  - **MCQ**: Radio buttons, one selection
  - **Multi Select**: Checkboxes, multiple selections
  - **True/False**: Two radio options
  - **Short Answer**: Text input
  - **Fill in Blank**: Text input
- [ ] Navigate between questions (if paginated)
- [ ] **Submit Quiz**: Click submit → answers graded automatically
- [ ] **Auto-submit**: When timer reaches zero, quiz auto-submits
- [ ] Results show: Score, correct/incorrect counts, pass/fail status
- [ ] Question-by-question review with correct answers

### 7.4 Assignment Submission (`/assignment/submit/:assignmentId`)

**What to test:**
- [ ] Assignment details load: title, description, due date, total points
- [ ] **File Upload**: Drag-drop or click to upload file
- [ ] **Text Submission**: Enter text in textarea
- [ ] Submit → success toast
- [ ] Cannot submit twice (duplicate check)
- [ ] After submission, shows submission status

### 7.5 Sidebar Navigation

**What to test:**
- [ ] Sidebar shows correct links for each role
- [ ] Active link highlighted
- [ ] Sidebar collapses on mobile (hamburger menu)
- [ ] Sidebar toggle button works
- [ ] AI section links present for all roles
- [ ] User info + avatar displayed at bottom
- [ ] Logout button works → redirects to login

### 7.6 Header/Topbar

**What to test:**
- [ ] User name and avatar displayed
- [ ] Notification bell with unread count badge
- [ ] Click bell → navigates to notifications page
- [ ] Theme toggle (light/dark) in header
- [ ] Responsive: collapses on mobile

### 7.7 Dark/Light Theme

**What to test:**
- [ ] Toggle switches between light and dark mode
- [ ] Theme persists across page navigations
- [ ] All components adapt: backgrounds, text, borders, cards
- [ ] Charts and graphs adapt to theme
- [ ] Glassmorphism effect works in dark mode

### 7.8 Toast Notifications

**What to test:**
- [ ] Success toasts appear (green) on successful operations
- [ ] Error toasts appear (red) on failed operations
- [ ] Toasts auto-dismiss after a few seconds
- [ ] Toasts show appropriate messages from server

### 7.9 Responsive Design

**What to test:**
- [ ] Desktop (1200px+): Full sidebar + content
- [ ] Tablet (768px-1199px): Collapsible sidebar
- [ ] Mobile (< 768px): Hidden sidebar with hamburger menu
- [ ] Tables convert to card layout on mobile
- [ ] Forms are usable on mobile
- [ ] Modals are scrollable on small screens

### 7.10 Error Handling

**What to test:**
- [ ] 404: Unknown routes redirect to dashboard
- [ ] 401: Expired token → redirect to login
- [ ] 403: Unauthorized access → redirect to appropriate dashboard
- [ ] Network error → toast error message
- [ ] Empty states: "No data yet" messages when lists are empty

---

## 8. API Endpoints Reference

Base URL: `https://futura-labs-lms.onrender.com/api/v1`

### Health Check

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Server health check |

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Register new user |
| `POST` | `/auth/login` | No | Login (returns JWT) |
| `POST` | `/auth/refresh-token` | No | Refresh access token |
| `POST` | `/auth/logout` | Yes | Logout |
| `POST` | `/auth/forgot-password` | No | Request password reset |
| `POST` | `/auth/reset-password/:token` | No | Reset password |
| `GET` | `/auth/profile` | Yes | Get own profile |
| `PUT` | `/auth/profile` | Yes | Update own profile |
| `PUT` | `/auth/change-password` | Yes | Change own password |

### Users

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/users` | Yes | admin, super_admin, mentor | List users (filterable by role, paginated, searchable) |
| `GET` | `/users/stats` | Yes | admin, super_admin | User statistics |
| `POST` | `/users/bulk` | Yes | admin, super_admin | Bulk create users |
| `GET` | `/users/:id` | Yes | admin, super_admin, mentor | Get single user |
| `POST` | `/users` | Yes | admin, super_admin | Create user |
| `PUT` | `/users/:id` | Yes | admin, super_admin | Update user |
| `PUT` | `/users/:id/change-password` | Yes | Any authenticated | Change password (requires currentPassword) |
| `DELETE` | `/users/:id` | Yes | super_admin | Delete user |

### Courses

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/courses` | Yes | All | List courses (role-filtered) |
| `GET` | `/courses/:id` | Yes | All | Get course with modules |
| `POST` | `/courses` | Yes | admin, mentor | Create course |
| `PUT` | `/courses/:id` | Yes | admin, mentor | Update course |
| `DELETE` | `/courses/:id` | Yes | admin | Delete course |
| `POST` | `/courses/:id/enroll` | Yes | admin, mentor | Enroll student |
| `POST` | `/courses/:courseId/modules` | Yes | admin, mentor | Create module |
| `PUT` | `/courses/:courseId/modules/:moduleId` | Yes | admin, mentor | Update module |
| `DELETE` | `/courses/:courseId/modules/:moduleId` | Yes | admin, mentor | Delete module |
| `POST` | `/courses/:courseId/modules/:moduleId/lessons` | Yes | admin, mentor | Create lesson |
| `PUT` | `/courses/:courseId/modules/:moduleId/lessons/:lessonId` | Yes | admin, mentor | Update lesson |
| `DELETE` | `/courses/:courseId/modules/:moduleId/lessons/:lessonId` | Yes | admin, mentor | Delete lesson |

### Assignments

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/assignments` | Yes | All | List assignments (student sees enrolled course assignments) |
| `GET` | `/assignments/:id` | Yes | All | Get single assignment |
| `POST` | `/assignments` | Yes | admin, mentor | Create assignment |
| `PUT` | `/assignments/:id` | Yes | admin, mentor | Update assignment |
| `DELETE` | `/assignments/:id` | Yes | admin, mentor | Delete assignment |
| `POST` | `/assignments/:id/submit` | Yes | student | Submit assignment |
| `GET` | `/assignments/:assignmentId/submissions` | Yes | admin, mentor | List submissions |
| `PUT` | `/assignments/submissions/:submissionId/grade` | Yes | admin, mentor | Grade submission |

### Quizzes

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/quizzes` | Yes | All | List quizzes (student sees published only) |
| `GET` | `/quizzes/:id` | Yes | All | Get quiz (answers hidden for students) |
| `POST` | `/quizzes` | Yes | admin, mentor | Create quiz |
| `PUT` | `/quizzes/:id` | Yes | admin, mentor | Update quiz |
| `DELETE` | `/quizzes/:id` | Yes | admin, mentor | Delete quiz |
| `POST` | `/quizzes/:id/submit` | Yes | student | Submit answers (auto-graded) |
| `GET` | `/quizzes/:quizId/results` | Yes | All | Get quiz results |

### Attendance

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/attendance` | Yes | admin, mentor | List attendance records |
| `POST` | `/attendance` | Yes | admin, mentor | Mark single attendance |
| `POST` | `/attendance/bulk` | Yes | admin, mentor | Bulk mark attendance |
| `GET` | `/attendance/report` | Yes | admin, mentor | Attendance report |
| `GET` | `/attendance/student/:studentId` | Yes | Any | Student attendance |
| `GET` | `/attendance/my-attendance` | Yes | student | Own attendance |

### Batches

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/batches` | Yes | All | List batches |
| `GET` | `/batches/:id` | Yes | All | Get batch |
| `POST` | `/batches` | Yes | admin | Create batch |
| `PUT` | `/batches/:id` | Yes | admin, mentor | Update batch |
| `DELETE` | `/batches/:id` | Yes | admin | Delete batch |
| `POST` | `/batches/:id/students` | Yes | admin, mentor | Add students |
| `DELETE` | `/batches/:id/students/:studentId` | Yes | admin, mentor | Remove student |

### Notifications

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/notifications` | Yes | All | Get notifications (role-filtered) |
| `PUT` | `/notifications/:id/read` | Yes | All | Mark as read |
| `PUT` | `/notifications/read-all` | Yes | All | Mark all as read |
| `POST` | `/notifications/send` | Yes | All | Send notification |
| `DELETE` | `/notifications/:id` | Yes | All | Delete notification |

### Certificates

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/certificates` | Yes | All | List certificates |
| `POST` | `/certificates` | Yes | admin, mentor | Generate certificate |
| `PUT` | `/certificates/:id/approve` | Yes | admin | Approve |
| `PUT` | `/certificates/:id/reject` | Yes | admin | Reject |
| `PUT` | `/certificates/:id/revoke` | Yes | super_admin | Revoke |

### Internships

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/internships` | Yes | All | List internships |
| `GET` | `/internships/:id` | Yes | All | Get internship |
| `POST` | `/internships` | Yes | admin, mentor | Create |
| `PUT` | `/internships/:id` | Yes | admin, mentor | Update |
| `DELETE` | `/internships/:id` | Yes | admin | Delete |
| `PUT` | `/internships/:id/complete` | Yes | admin, mentor | Mark complete |

### Analytics

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/analytics/dashboard` | Yes | admin, mentor | Dashboard overview |
| `GET` | `/analytics/students/:studentId` | Yes | admin, mentor | Student analytics |
| `GET` | `/analytics/my-progress` | Yes | student | Own progress |
| `GET` | `/analytics/courses/:courseId` | Yes | admin, mentor | Course analytics |
| `GET` | `/analytics/mentors/:mentorId` | Yes | admin | Mentor analytics |
| `GET` | `/analytics/my-performance` | Yes | mentor | Own performance |
| `GET` | `/analytics/system` | Yes | admin | System analytics |

### Progress

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/progress/my-courses` | Yes | All | All course progress |
| `GET` | `/progress/:courseId` | Yes | All | Course-specific progress |
| `PUT` | `/progress/:courseId/update` | Yes | student | Mark lesson complete |

### Institutes

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/institutes` | Yes | All | List institutes |
| `GET` | `/institutes/:id` | Yes | All | Get institute |
| `POST` | `/institutes` | Yes | super_admin | Create |
| `PUT` | `/institutes/:id` | Yes | super_admin | Update |
| `DELETE` | `/institutes/:id` | Yes | super_admin | Delete |

### Notes

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `GET` | `/notes` | Yes | All | List notes |
| `GET` | `/notes/:id` | Yes | All | Get note |
| `POST` | `/notes` | Yes | admin, mentor | Create |
| `PUT` | `/notes/:id` | Yes | admin, mentor | Update |
| `DELETE` | `/notes/:id` | Yes | admin, mentor | Delete |

### AI

| Method | Path | Auth | Roles | Description |
|---|---|---|---|---|
| `POST` | `/ai/quiz/generate` | Yes | admin, mentor | Generate quiz from topic/content |
| `POST` | `/ai/quiz/save` | Yes | admin, mentor | Save generated quiz |
| `POST` | `/ai/quiz/adaptive` | Yes | All | Adaptive quiz generation |
| `POST` | `/ai/quiz/revision` | Yes | student | Revision quiz for weak topics |
| `POST` | `/ai/quiz/from-lesson` | Yes | admin, mentor | Generate quiz from lesson |
| `POST` | `/ai/explain` | Yes | All | Explain quiz answer |
| `POST` | `/ai/assignment/evaluate/:submissionId` | Yes | admin, mentor | AI evaluation |
| `GET` | `/ai/weak-topics` | Yes | student | Weak topic analysis |
| `POST` | `/ai/ask-doubt` | Yes | All | AI doubt solver |

---

## 9. Technology Stack

### Frontend
- React 18.2 + Vite 5
- React Router DOM 6.21
- Redux Toolkit 2 + React Redux 9
- TanStack React Query 5
- Tailwind CSS 3.4
- Framer Motion 10
- Recharts 2
- Axios 1.6
- Socket.IO Client 4.7
- Lucide React icons
- React Hot Toast
- date-fns 3

### Backend
- Node.js + Express 4.18
- Mongoose 8 (MongoDB)
- JWT (bcryptjs, jsonwebtoken)
- Socket.IO 4.7
- @anthropic-ai/sdk (Claude AI)
- OpenAI SDK 6.39
- Multer + Cloudinary (file uploads)
- Joi 17 (validation)
- Helmet (security)
- Morgan (logging)
- Swagger (API docs)
- node-cron (scheduling)

### Database
- MongoDB Atlas (cloud-hosted)
- Auto-seed on first boot

---

## 10. Known Limitations

1. **AI requires API key**: Full AI features require a Claude API key (`CLAUDE_API_KEY` env var). Without it, the system falls back to intelligent template-based generation.
2. **Redis not available**: Real-time features degrade gracefully on Render free tier (no Redis).
3. **File uploads**: Cloudinary required for file upload features. Without it, file uploads will fail.
4. **Email service**: Password reset emails require email service configuration. Without it, reset tokens are logged to console.
5. **Socket.IO**: WebSocket connection may not persist on Render free tier (sleeps after inactivity).
6. **Quiz auto-grading**: Only auto-grades MCQ, True/False, Multi-Select, Short Answer, Fill in Blank. No auto-grading for essay/descriptive.
7. **Certificate download**: Requires `certificateUrl` to be set on the certificate. Without it, download shows an error.
8. **Search**: Basic text search on name/email fields. No full-text search.
9. **Bulk operations**: Limited to 100 users per bulk create.
10. **Pagination**: Server-side pagination for lists (10-50 items per page depending on endpoint).

---

## Testing Checklist Summary

### Quick Smoke Test (5 minutes)
1. [ ] Open the URL → redirects to login
2. [ ] Login as admin → dashboard loads with stats
3. [ ] Navigate to Students → list loads
4. [ ] Login as mentor → dashboard loads
5. [ ] Navigate to Courses → list loads
6. [ ] Login as student → dashboard loads
7. [ ] Navigate to Quizzes → list loads
8. [ ] Toggle dark mode → theme changes
9. [ ] Click AI Doubt Solver → page loads

### Full Regression Test (30 minutes)
- Test each section listed in sections 3-7 above
- Verify CRUD operations create, read, update, and delete correctly
- Verify role-based access (student can't access admin routes)
- Verify pagination, search, and filtering
- Verify loading states and error handling
- Verify toast notifications
- Verify responsive design at different breakpoints

### AI Feature Test (10 minutes)
1. [ ] AI Quiz Generator → generate from topic → save
2. [ ] AI Doubt Solver → ask question → get formatted answer
3. [ ] AI Adaptive Quiz → take quiz → see results
4. [ ] AI Weak Topics → view analysis
5. [ ] AI Assignment Evaluator → evaluate a submission

---

*Last updated: July 2026*
*Application URL: https://futura-labs-lms.onrender.com*
*Repository: https://github.com/sanjayksanthosh/futura-labs-lms*
