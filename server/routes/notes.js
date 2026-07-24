const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', noteController.getNotes);
router.get('/:id', noteController.getNote);
router.post('/', authorize('super_admin', 'admin', 'mentor'), noteController.createNote);
router.put('/:id', authorize('super_admin', 'admin', 'mentor'), noteController.updateNote);
router.delete('/:id', authorize('super_admin', 'admin', 'mentor'), noteController.deleteNote);

module.exports = router;
