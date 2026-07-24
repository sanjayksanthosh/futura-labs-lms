const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/courses', require('./courses'));
router.use('/assignments', require('./assignments'));
router.use('/quizzes', require('./quizzes'));
router.use('/attendance', require('./attendance'));
router.use('/batches', require('./batches'));
router.use('/notifications', require('./notifications'));
router.use('/certificates', require('./certificates'));
router.use('/internships', require('./internships'));
router.use('/analytics', require('./analytics'));
router.use('/progress', require('./progress'));
router.use('/institutes', require('./institutes'));
router.use('/notes', require('./notes'));
router.use('/ai', require('./ai'));

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
