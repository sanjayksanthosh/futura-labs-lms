export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MENTOR: 'mentor',
  STUDENT: 'student',
};

export const ROLE_LABELS = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  mentor: 'Mentor',
  student: 'Student',
};

export const ROLE_COLORS = {
  super_admin: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  admin: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  mentor: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  student: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30',
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
};

export const ASSIGNMENT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  RETURNED: 'returned',
  LATE: 'late',
};

export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const QUIZ_STATUS = {
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
};

export const NOTIFICATION_TYPES = {
  ASSIGNMENT: 'assignment',
  QUIZ: 'quiz',
  ATTENDANCE: 'attendance',
  COURSE: 'course',
  GRADE: 'grade',
  CERTIFICATE: 'certificate',
  ANNOUNCEMENT: 'announcement',
  SYSTEM: 'system',
  MESSAGE: 'message',
  REMINDER: 'reminder',
};

export const SIDEBAR_WIDTH = 280;
export const HEADER_HEIGHT = 64;
