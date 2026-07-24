import api from './api';

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  changePassword: (id, data) => api.put(`/users/${id}/change-password`, data),
  delete: (id) => api.delete(`/users/${id}`),
  bulkCreate: (users) => api.post('/users/bulk', { users }),
  getStats: () => api.get('/users/stats'),
};

export const courseService = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id, studentId) => api.post(`/courses/${id}/enroll`, { studentId }),
  createModule: (courseId, data) => api.post(`/courses/${courseId}/modules`, data),
  updateModule: (courseId, moduleId, data) => api.put(`/courses/${courseId}/modules/${moduleId}`, data),
  deleteModule: (courseId, moduleId) => api.delete(`/courses/${courseId}/modules/${moduleId}`),
  createLesson: (courseId, moduleId, data) => api.post(`/courses/${courseId}/modules/${moduleId}/lessons`, data),
  updateLesson: (courseId, moduleId, lessonId, data) => api.put(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, data),
  deleteLesson: (courseId, moduleId, lessonId) => api.delete(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`),
};

export const assignmentService = {
  getAll: (params) => api.get('/assignments', { params }),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  getSubmissions: (assignmentId, params) => api.get(`/assignments/${assignmentId}/submissions`, { params }),
  gradeSubmission: (submissionId, data) => api.put(`/assignments/submissions/${submissionId}/grade`, data),
};

export const quizService = {
  getAll: (params) => api.get('/quizzes', { params }),
  getById: (id) => api.get(`/quizzes/${id}`),
  create: (data) => api.post('/quizzes', data),
  update: (id, data) => api.put(`/quizzes/${id}`, data),
  delete: (id) => api.delete(`/quizzes/${id}`),
  submit: (id, data) => api.post(`/quizzes/${id}/submit`, data),
  getResults: (quizId, params) => api.get(`/quizzes/${quizId}/results`, { params }),
};

export const attendanceService = {
  getAll: (params) => api.get('/attendance', { params }),
  mark: (data) => api.post('/attendance', data),
  bulkMark: (data) => api.post('/attendance/bulk', data),
  getReport: (params) => api.get('/attendance/report', { params }),
  getStudentAttendance: (studentId) => api.get(`/attendance/student/${studentId}`),
  getMyAttendance: () => api.get('/attendance/my-attendance'),
};

export const batchService = {
  getAll: (params) => api.get('/batches', { params }),
  getById: (id) => api.get(`/batches/${id}`),
  create: (data) => api.post('/batches', data),
  update: (id, data) => api.put(`/batches/${id}`, data),
  delete: (id) => api.delete(`/batches/${id}`),
  addStudents: (id, studentIds) => api.post(`/batches/${id}/students`, { studentIds }),
  removeStudent: (id, studentId) => api.delete(`/batches/${id}/students/${studentId}`),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  send: (data) => api.post('/notifications/send', data),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const certificateService = {
  getAll: (params) => api.get('/certificates', { params }),
  generate: (data) => api.post('/certificates', data),
  approve: (id, certificateUrl) => api.put(`/certificates/${id}/approve`, { certificateUrl }),
  reject: (id, reason) => api.put(`/certificates/${id}/reject`, { reason }),
  revoke: (id, reason) => api.put(`/certificates/${id}/revoke`, { reason }),
};

export const internshipService = {
  getAll: (params) => api.get('/internships', { params }),
  getById: (id) => api.get(`/internships/${id}`),
  create: (data) => api.post('/internships', data),
  update: (id, data) => api.put(`/internships/${id}`, data),
  delete: (id) => api.delete(`/internships/${id}`),
  complete: (id, data) => api.put(`/internships/${id}/complete`, data),
};

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getStudentAnalytics: (studentId) => api.get(`/analytics/students/${studentId}`),
  getMyProgress: () => api.get('/analytics/my-progress'),
  getCourseAnalytics: (courseId) => api.get(`/analytics/courses/${courseId}`),
  getMentorAnalytics: (mentorId) => api.get(`/analytics/mentors/${mentorId}`),
  getMyPerformance: () => api.get('/analytics/my-performance'),
  getSystem: () => api.get('/analytics/system'),
};

export const progressService = {
  getMyCourses: () => api.get('/progress/my-courses'),
  getCourseProgress: (courseId) => api.get(`/progress/${courseId}`),
  updateProgress: (courseId, data) => api.put(`/progress/${courseId}/update`, data),
};

export const instituteService = {
  getAll: () => api.get('/institutes'),
  getById: (id) => api.get(`/institutes/${id}`),
  create: (data) => api.post('/institutes', data),
  update: (id, data) => api.put(`/institutes/${id}`, data),
  delete: (id) => api.delete(`/institutes/${id}`),
};

export const noteService = {
  getAll: (params) => api.get('/notes', { params }),
  getById: (id) => api.get(`/notes/${id}`),
  create: (data) => api.post('/notes', data),
  update: (id, data) => api.put(`/notes/${id}`, data),
  delete: (id) => api.delete(`/notes/${id}`),
};

export const aiService = {
  generateQuiz: (data) => api.post('/ai/quiz/generate', data),
  saveQuiz: (data) => api.post('/ai/quiz/save', data),
  generateAdaptive: (data) => api.post('/ai/quiz/adaptive', data),
  generateRevision: (data) => api.post('/ai/quiz/revision', data),
  generateFromLesson: (data) => api.post('/ai/quiz/from-lesson', data),
  getExplanation: (data) => api.post('/ai/explain', data),
  evaluateAssignment: (submissionId, data) => api.post(`/ai/assignment/evaluate/${submissionId}`, data),
  getWeakTopics: () => api.get('/ai/weak-topics'),
  askDoubt: (data) => api.post('/ai/ask-doubt', data),
};
