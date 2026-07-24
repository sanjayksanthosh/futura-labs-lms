const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { markAttendanceSchema, bulkAttendanceSchema } = require('../validators/attendance');

router.use(authenticate);

router.get('/', authorize('super_admin', 'admin', 'mentor'), attendanceController.getAttendance);
router.post('/', authorize('super_admin', 'admin', 'mentor'), validate(markAttendanceSchema), attendanceController.markAttendance);
router.post('/bulk', authorize('super_admin', 'admin', 'mentor'), validate(bulkAttendanceSchema), attendanceController.bulkMarkAttendance);
router.get('/report', authorize('super_admin', 'admin', 'mentor'), attendanceController.getAttendanceReport);
router.get('/student/:studentId', attendanceController.getStudentAttendance);
router.get('/my-attendance', authorize('student'), attendanceController.getStudentAttendance);

module.exports = router;
