const express = require('express');
const router  = express.Router();
const ShiftController = require('../controllers/shift.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get   ('/',    protect, ShiftController.getAll);
router.post  ('/',    protect, authorize('supermarket_owner', 'shift_manager'), ShiftController.create);
router.put   ('/:id', protect, authorize('supermarket_owner', 'shift_manager'), ShiftController.update);
router.delete('/:id', protect, authorize('supermarket_owner'), ShiftController.remove);

module.exports = router;
