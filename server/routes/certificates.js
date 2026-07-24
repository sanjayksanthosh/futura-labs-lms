const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', certificateController.getCertificates);
router.post('/', authorize('super_admin', 'admin', 'mentor'), certificateController.generateCertificate);
router.put('/:id/approve', authorize('super_admin', 'admin'), certificateController.approveCertificate);
router.put('/:id/reject', authorize('super_admin', 'admin'), certificateController.rejectCertificate);
router.put('/:id/revoke', authorize('super_admin'), certificateController.revokeCertificate);

module.exports = router;
