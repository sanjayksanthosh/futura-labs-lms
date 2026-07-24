const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/dashboard', authorize('super_admin', 'admin', 'mentor'), analyticsController.getDashboardStats);
router.get('/students/:studentId', authorize('super_admin', 'admin', 'mentor'), analyticsController.getStudentAnalytics);
router.get('/my-progress', authorize('student'), analyticsController.getStudentAnalytics);
router.get('/courses/:courseId', authorize('super_admin', 'admin', 'mentor'), analyticsController.getCourseAnalytics);
router.get('/mentors/:mentorId', authorize('super_admin', 'admin'), analyticsController.getMentorAnalytics);
router.get('/my-performance', authorize('mentor'), analyticsController.getMentorAnalytics);
router.get('/system', authorize('super_admin', 'admin'), analyticsController.getSystemAnalytics);

module.exports = router;
