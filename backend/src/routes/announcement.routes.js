const express = require('express');
const router  = express.Router();
const AnnouncementController = require('../controllers/announcement.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', protect, AnnouncementController.getAll);
router.post('/', protect, authorize('supermarket_owner', 'shift_manager'), AnnouncementController.create);
router.put('/:id', protect, authorize('supermarket_owner', 'shift_manager'), AnnouncementController.update);
router.delete('/:id', protect, authorize('supermarket_owner', 'shift_manager'), AnnouncementController.remove);

module.exports = router;
