const express = require('express');
const router = express.Router();
const instituteController = require('../controllers/instituteController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', instituteController.getInstitutes);
router.get('/:id', instituteController.getInstitute);
router.post('/', authorize('super_admin'), instituteController.createInstitute);
router.put('/:id', authorize('super_admin'), instituteController.updateInstitute);
router.delete('/:id', authorize('super_admin'), instituteController.deleteInstitute);

module.exports = router;
