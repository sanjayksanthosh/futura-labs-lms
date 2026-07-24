const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createQuizSchema, submitQuizSchema } = require('../validators/quiz');

router.use(authenticate);

router.get('/', quizController.getQuizzes);
router.get('/:id', quizController.getQuiz);
router.post('/', authorize('super_admin', 'admin', 'mentor'), validate(createQuizSchema), quizController.createQuiz);
router.put('/:id', authorize('super_admin', 'admin', 'mentor'), quizController.updateQuiz);
router.delete('/:id', authorize('super_admin', 'admin', 'mentor'), quizController.deleteQuiz);

router.post('/:id/submit', authorize('student'), validate(submitQuizSchema), quizController.submitQuiz);
router.get('/:quizId/results', quizController.getQuizResults);

module.exports = router;
