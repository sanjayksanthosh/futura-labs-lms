import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';

// Shared Pages
import { CourseDetail } from '../pages/Courses/CourseDetail';
import { LessonViewer } from '../pages/Courses/LessonViewer';
import { CourseCreator } from '../pages/Courses/CourseCreator';
import { QuizTaking } from '../pages/Quizzes/QuizTaking';
import { AssignmentSubmission } from '../pages/Assignments/AssignmentSubmission';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminStudents } from '../pages/admin/AdminStudents';
import { AdminMentors } from '../pages/admin/AdminMentors';
import { AdminCourses } from '../pages/admin/AdminCourses';
import { AdminCourseDetail } from '../pages/admin/AdminCourseDetail';
import { AdminBatches } from '../pages/admin/AdminBatches';
import { AdminAttendance } from '../pages/admin/AdminAttendance';
import { AdminAssignments } from '../pages/admin/AdminAssignments';
import { AdminQuizzes } from '../pages/admin/AdminQuizzes';
import { AdminCertificates } from '../pages/admin/AdminCertificates';
import { AdminInternships } from '../pages/admin/AdminInternships';
import { AdminAnalytics } from '../pages/admin/AdminAnalytics';
import { AdminInstitutes } from '../pages/admin/AdminInstitutes';
import { AdminNotifications } from '../pages/admin/AdminNotifications';
import { AdminSettings } from '../pages/admin/AdminSettings';

// Mentor Pages
import { MentorDashboard } from '../pages/mentor/MentorDashboard';
import { MentorCourses } from '../pages/mentor/MentorCourses';
import { MentorAssignments } from '../pages/mentor/MentorAssignments';
import { MentorQuizzes } from '../pages/mentor/MentorQuizzes';
import { MentorAttendance } from '../pages/mentor/MentorAttendance';
import { MentorStudents } from '../pages/mentor/MentorStudents';
import { MentorInternships } from '../pages/mentor/MentorInternships';
import { MentorAnalytics } from '../pages/mentor/MentorAnalytics';
import { MentorNotifications } from '../pages/mentor/MentorNotifications';
import { MentorSettings } from '../pages/mentor/MentorSettings';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentCourses } from '../pages/student/StudentCourses';
import { StudentAssignments } from '../pages/student/StudentAssignments';
import { StudentQuizzes } from '../pages/student/StudentQuizzes';
import { StudentProgress } from '../pages/student/StudentProgress';
import { StudentAttendance } from '../pages/student/StudentAttendance';
import { StudentCertificates } from '../pages/student/StudentCertificates';
import { StudentInternships } from '../pages/student/StudentInternships';
import { StudentNotifications } from '../pages/student/StudentNotifications';
import { StudentSettings } from '../pages/student/StudentSettings';

// AI Pages
import { AiDashboard } from '../pages/ai/AiDashboard';
import { AiQuizGenerator } from '../pages/ai/AiQuizGenerator';
import { AiAssignmentEval } from '../pages/ai/AiAssignmentEval';
import { AiAdaptiveQuiz } from '../pages/ai/AiAdaptiveQuiz';
import { AiWeakTopics } from '../pages/ai/AiWeakTopics';
import { AiDoubtSolver } from '../pages/ai/AiDoubtSolver';

export const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const getDefaultRedirect = () => {
    if (!user) return '/login';
    const redirects = {
      super_admin: '/admin/dashboard',
      admin: '/admin/dashboard',
      mentor: '/mentor/dashboard',
      student: '/student/dashboard',
    };
    return redirects[user.role] || '/login';
  };

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRedirect()} /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={getDefaultRedirect()} /> : <Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route
        element={
          <ProtectedRoute roles={['super_admin', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/mentors" element={<AdminMentors />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/courses/create" element={<CourseCreator />} />
        <Route path="/admin/courses/:courseId" element={<AdminCourseDetail />} />
        <Route path="/admin/courses/:courseId/edit" element={<CourseCreator />} />
        <Route path="/admin/batches" element={<AdminBatches />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/assignments" element={<AdminAssignments />} />
        <Route path="/admin/assignments/submit/:assignmentId" element={<AssignmentSubmission />} />
        <Route path="/admin/quizzes" element={<AdminQuizzes />} />
        <Route path="/admin/quizzes/take/:quizId" element={<QuizTaking />} />
        <Route path="/admin/certificates" element={<AdminCertificates />} />
        <Route path="/admin/internships" element={<AdminInternships />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/institutes" element={<AdminInstitutes />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route
        element={
          <ProtectedRoute roles={['mentor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/mentor/dashboard" element={<MentorDashboard />} />
        <Route path="/mentor/courses" element={<MentorCourses />} />
        <Route path="/mentor/assignments" element={<MentorAssignments />} />
        <Route path="/mentor/quizzes" element={<MentorQuizzes />} />
        <Route path="/mentor/attendance" element={<MentorAttendance />} />
        <Route path="/mentor/students" element={<MentorStudents />} />
        <Route path="/mentor/internships" element={<MentorInternships />} />
        <Route path="/mentor/analytics" element={<MentorAnalytics />} />
        <Route path="/mentor/notifications" element={<MentorNotifications />} />
        <Route path="/mentor/settings" element={<MentorSettings />} />
      </Route>

      <Route
        element={
          <ProtectedRoute roles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/courses" element={<StudentCourses />} />
        <Route path="/student/assignments" element={<StudentAssignments />} />
        <Route path="/student/quizzes" element={<StudentQuizzes />} />
        <Route path="/student/progress" element={<StudentProgress />} />
        <Route path="/student/attendance" element={<StudentAttendance />} />
        <Route path="/student/certificates" element={<StudentCertificates />} />
        <Route path="/student/internships" element={<StudentInternships />} />
        <Route path="/student/notifications" element={<StudentNotifications />} />
        <Route path="/student/settings" element={<StudentSettings />} />
      </Route>

      {/* Shared authenticated routes (any role) */}
      <Route
        element={
          <ProtectedRoute roles={['super_admin', 'admin', 'mentor', 'student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/lesson/:lessonId" element={<LessonViewer />} />
        <Route path="/quiz/take/:quizId" element={<QuizTaking />} />
        <Route path="/assignment/submit/:assignmentId" element={<AssignmentSubmission />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/course/create" element={<CourseCreator />} />
        <Route path="/course/:courseId/edit" element={<CourseCreator />} />
        <Route path="/ai" element={<AiDashboard />} />
        <Route path="/ai/quiz-generator" element={<AiQuizGenerator />} />
        <Route path="/ai/assignment-eval" element={<AiAssignmentEval />} />
        <Route path="/ai/adaptive-quiz" element={<AiAdaptiveQuiz />} />
        <Route path="/ai/weak-topics" element={<AiWeakTopics />} />
        <Route path="/ai/ask-doubt" element={<AiDoubtSolver />} />
        <Route path="/ai/analytics" element={<AiDashboard />} />
      </Route>

      <Route path="/" element={<Navigate to={getDefaultRedirect()} />} />
      <Route path="*" element={<Navigate to={getDefaultRedirect()} />} />
    </Routes>
  );
};
