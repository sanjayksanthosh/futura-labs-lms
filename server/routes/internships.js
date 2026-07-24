const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internshipController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', internshipController.getInternships);
router.get('/:id', internshipController.getInternship);
router.post('/', authorize('super_admin', 'admin', 'mentor'), internshipController.createInternship);
router.put('/:id', authorize('super_admin', 'admin', 'mentor'), internshipController.updateInternship);
router.delete('/:id', authorize('super_admin', 'admin'), internshipController.deleteInternship);
router.put('/:id/complete', authorize('super_admin', 'admin', 'mentor'), internshipController.completeInternship);

module.exports = router;
