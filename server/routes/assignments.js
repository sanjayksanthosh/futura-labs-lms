const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createAssignmentSchema, gradeSubmissionSchema } = require('../validators/assignment');

router.use(authenticate);

router.get('/', assignmentController.getAssignments);
router.get('/:id', assignmentController.getAssignment);
router.post('/', authorize('super_admin', 'admin', 'mentor'), validate(createAssignmentSchema), assignmentController.createAssignment);
router.put('/:id', authorize('super_admin', 'admin', 'mentor'), assignmentController.updateAssignment);
router.delete('/:id', authorize('super_admin', 'admin', 'mentor'), assignmentController.deleteAssignment);

router.post('/:id/submit', authorize('student'), assignmentController.submitAssignment);
router.get('/:assignmentId/submissions', authorize('super_admin', 'admin', 'mentor'), assignmentController.getSubmissions);
router.put('/submissions/:submissionId/grade', authorize('super_admin', 'admin', 'mentor'), validate(gradeSubmissionSchema), assignmentController.gradeSubmission);

module.exports = router;
