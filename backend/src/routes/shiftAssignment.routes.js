const express = require('express');
const router  = express.Router();
const ShiftAssignmentController = require('../controllers/shiftAssignment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createAssignmentValidator } = require('../validators/shiftAssignment.validator');

router.get   ('/',              protect, authorize('supermarket_owner', 'shift_manager'), ShiftAssignmentController.getAll);
router.post  ('/',              protect, authorize('supermarket_owner', 'shift_manager'), validate(createAssignmentValidator), ShiftAssignmentController.create);
router.patch ('/:id/status',    protect, authorize('supermarket_owner', 'shift_manager'), ShiftAssignmentController.updateStatus);
router.delete('/:id',           protect, authorize('supermarket_owner', 'shift_manager'), ShiftAssignmentController.remove);

module.exports = router;
