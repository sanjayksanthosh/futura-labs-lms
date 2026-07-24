const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createBatchSchema } = require('../validators/batch');

router.use(authenticate);

router.get('/', batchController.getBatches);
router.get('/:id', batchController.getBatch);
router.post('/', authorize('super_admin', 'admin'), validate(createBatchSchema), batchController.createBatch);
router.put('/:id', authorize('super_admin', 'admin', 'mentor'), batchController.updateBatch);
router.delete('/:id', authorize('super_admin', 'admin'), batchController.deleteBatch);
router.post('/:id/students', authorize('super_admin', 'admin', 'mentor'), batchController.addStudentsToBatch);
router.delete('/:id/students/:studentId', authorize('super_admin', 'admin', 'mentor'), batchController.removeStudentFromBatch);

module.exports = router;
