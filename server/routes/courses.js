const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createCourseSchema, updateCourseSchema, createModuleSchema, createLessonSchema } = require('../validators/course');
const { upload } = require('../middleware/upload');

router.use(authenticate);

router.get('/', courseController.getCourses);
router.get('/:id', courseController.getCourse);

router.post('/', authorize('super_admin', 'admin', 'mentor'), validate(createCourseSchema), courseController.createCourse);
router.put('/:id', authorize('super_admin', 'admin', 'mentor'), validate(updateCourseSchema), courseController.updateCourse);
router.delete('/:id', authorize('super_admin', 'admin'), courseController.deleteCourse);
router.post('/:id/enroll', authorize('super_admin', 'admin', 'mentor'), courseController.enrollStudent);

router.post('/:courseId/modules', authorize('super_admin', 'admin', 'mentor'), validate(createModuleSchema), courseController.createModule);
router.put('/:courseId/modules/:moduleId', authorize('super_admin', 'admin', 'mentor'), courseController.updateModule);
router.delete('/:courseId/modules/:moduleId', authorize('super_admin', 'admin', 'mentor'), courseController.deleteModule);

router.post('/:courseId/modules/:moduleId/lessons', authorize('super_admin', 'admin', 'mentor'), validate(createLessonSchema), courseController.createLesson);
router.put('/:courseId/modules/:moduleId/lessons/:lessonId', authorize('super_admin', 'admin', 'mentor'), courseController.updateLesson);
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', authorize('super_admin', 'admin', 'mentor'), courseController.deleteLesson);

module.exports = router;
