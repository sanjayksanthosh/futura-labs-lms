const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const aiController = require('../controllers/aiController');
const { upload } = require('../middleware/upload');

router.use(authenticate);

// Quiz Generation
router.post('/quiz/generate', authorize('mentor', 'admin', 'super_admin'), aiController.generateQuiz);
router.post('/quiz/save', authorize('mentor', 'admin', 'super_admin'), aiController.saveGeneratedQuiz);
router.post('/quiz/adaptive', authorize('student', 'mentor', 'admin'), aiController.generateAdaptiveQuiz);
router.post('/quiz/revision', authorize('student'), aiController.generateRevisionQuiz);
router.post('/quiz/from-lesson', authorize('mentor', 'admin', 'super_admin'), aiController.generateFromLesson);
router.post('/explain', authorize('student', 'mentor', 'admin'), aiController.generateExplanation);

// Assignment Evaluation
router.post('/assignment/evaluate/:submissionId', authorize('mentor', 'admin', 'super_admin'), aiController.evaluateAssignment);

// Student Analytics
router.get('/weak-topics', authorize('student'), aiController.getWeakTopics);

// AI Doubt Solver
router.post('/ask-doubt', authorize('student', 'mentor', 'admin', 'super_admin'), aiController.askDoubt);

module.exports = router;
