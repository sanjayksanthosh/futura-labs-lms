const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/my-courses', progressController.getCourseProgress);
router.get('/:courseId', progressController.getProgress);
router.put('/:courseId/update', authorize('student'), progressController.updateProgress);

module.exports = router;
