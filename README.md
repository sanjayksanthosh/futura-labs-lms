# Futura Labs Ai Tutor LMS

A complete, production-ready Learning Management System (LMS) platform built with React, Node.js, MongoDB, and modern web technologies. Features role-based access for Super Admin, Mentors, and Students with AI-ready architecture.

## Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** with glassmorphism design
- **Redux Toolkit** for state management
- **React Query** for server state
- **React Router v6** for routing
- **Framer Motion** for animations
- **Recharts** for analytics
- **React Hook Form + Zod** for forms
- **Socket.IO Client** for real-time features
- **Lucide React** for icons

### Backend
- **Node.js + Express.js**
- **MongoDB + Mongoose** ODM
- **JWT Authentication** with refresh tokens
- **Redis** for caching
- **Socket.IO** for real-time communication
- **Cloudinary** for file uploads
- **Helmet, CORS, Rate Limiting** for security
- **Winston** for logging
- **Swagger** for API documentation

## Features

### Role-Based Access
- **Super Admin**: Full platform control
- **Admin**: Institute management
- **Mentor**: Course creation, grading, student management
- **Student**: Learning, assignments, quizzes, certificates

### Core Modules
- **Course Management** with modules and lessons
- **Assignment System** with submission and grading
- **Quiz Engine** with auto-grading
- **Attendance Tracking** with bulk marking
- **Batch Management** for student groups
- **Certificate Generation** and approval workflow
- **Internship Tracking**
- **Analytics Dashboard** with charts
- **Notification System** (in-app + real-time)
- **Multi-Institute Support**

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7+
- Redis 7+ (optional for caching)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd futura-labs-ai-tutor-lms

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### Environment Setup

```bash
# Backend
cp server/.env.example server/.env
# Edit .env with your settings

# Frontend
# Edit client/.env or use defaults
```

### Seed Database

```bash
cd server
npm run seed
```

### Run Development

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### Access the Application
- **Frontend**: http://localhost:5173
- **API**: http://localhost:5000/api/v1
- **Swagger Docs**: http://localhost:5000/api-docs

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@futuralabs.com | Admin@123 |
| Admin | institute@futuralabs.com | Admin@123 |
| Mentor | john@futuralabs.com | Mentor@123 |
| Student | alice@example.com | Student@123 |

## Docker Deployment

```bash
docker-compose up -d
```

This starts:
- MongoDB
- Redis
- Backend API
- Frontend (React)
- Nginx reverse proxy

Access at http://localhost

## Project Structure

```
futura-labs-ai-tutor-lms/
├── server/                    # Backend
│   ├── config/               # Configuration
│   ├── controllers/          # Route handlers
│   ├── models/               # Mongoose models
│   ├── routes/               # Express routes
│   ├── middleware/           # Auth, validation, upload
│   ├── validators/           # Joi schemas
│   ├── sockets/              # Socket.IO events
│   ├── utils/                # Helpers, logger
│   ├── database/             # Connection, seed
│   ├── docs/                 # Swagger
│   ├── jobs/                 # Cron jobs
│   ├── tests/                # Jest tests
│   ├── app.js               # Express app
│   └── server.js            # Entry point
├── client/                    # Frontend
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # UI components
│   │   ├── layouts/         # Layouts
│   │   ├── pages/           # Page components
│   │   │   ├── admin/       # Admin pages
│   │   │   ├── mentor/      # Mentor pages
│   │   │   ├── student/     # Student pages
│   │   │   └── auth/        # Auth pages
│   │   ├── redux/           # Redux store
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # API services
│   │   ├── routes/          # Route config
│   │   ├── utils/           # Helpers
│   │   ├── context/         # React context
│   │   └── types/           # Type definitions
│   └── public/              # Static assets
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh JWT
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password/:token` - Reset password

### Users
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Courses
- `GET /api/v1/courses` - List courses
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses/:id` - Get course (modules + lessons)
- `PUT /api/v1/courses/:id` - Update course
- `DELETE /api/v1/courses/:id` - Delete course
- `POST /api/v1/courses/:id/enroll` - Enroll student

### Assignments
- `GET /api/v1/assignments` - List assignments
- `POST /api/v1/assignments` - Create assignment
- `POST /api/v1/assignments/:id/submit` - Submit assignment
- `PUT /api/v1/assignments/submissions/:id/grade` - Grade submission

### Quizzes
- `GET /api/v1/quizzes` - List quizzes
- `POST /api/v1/quizzes` - Create quiz
- `POST /api/v1/quizzes/:id/submit` - Submit quiz (auto-graded)

### Attendance
- `POST /api/v1/attendance` - Mark attendance
- `POST /api/v1/attendance/bulk` - Bulk mark attendance

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard stats
- `GET /api/v1/analytics/students/:id` - Student analytics
- `GET /api/v1/analytics/courses/:id` - Course analytics
- `GET /api/v1/analytics/system` - System analytics

## License

MIT
