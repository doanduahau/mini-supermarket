const express = require('express');
const router  = express.Router();
const AttendanceController = require('../controllers/attendance.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { checkInValidator, checkOutValidator, manualUpdateValidator } = require('../validators/attendance.validator');

router.get ('/',              protect, authorize('supermarket_owner', 'shift_manager'), AttendanceController.getAll);
router.get ('/daily-report',  protect, authorize('supermarket_owner', 'shift_manager'), AttendanceController.getDailyReport);
router.get ('/:id',           protect, authorize('supermarket_owner', 'shift_manager'), AttendanceController.getById);

router.patch('/:id/checkin',  protect, authorize('supermarket_owner', 'shift_manager'), validate(checkInValidator), AttendanceController.checkIn);
router.patch('/:id/checkout', protect, authorize('supermarket_owner', 'shift_manager'), validate(checkOutValidator), AttendanceController.checkOut);
router.put ('/:id',           protect, authorize('supermarket_owner', 'shift_manager'), validate(manualUpdateValidator), AttendanceController.manualUpdate);

module.exports = router;
