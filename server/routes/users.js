const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/stats', authorize('super_admin', 'admin'), userController.getUserStats);
router.post('/bulk', authorize('super_admin', 'admin'), userController.bulkCreateUsers);
router.get('/', authorize('super_admin', 'admin', 'mentor'), userController.getUsers);
router.get('/:id', authorize('super_admin', 'admin', 'mentor'), userController.getUser);
router.post('/', authorize('super_admin', 'admin'), userController.createUser);
router.put('/:id', authorize('super_admin', 'admin'), userController.updateUser);
router.put('/:id/change-password', userController.changePassword);
router.delete('/:id', authorize('super_admin'), userController.deleteUser);

module.exports = router;
