const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { monthYearValidator } = require('../validators/report.validator');

// All reports are protected and restricted to owner/manager
router.use(protect, authorize('supermarket_owner', 'shift_manager'));

router.get('/salary-summary', validate(monthYearValidator), ReportController.getSalarySummary);
router.get('/attendance-summary', validate(monthYearValidator), ReportController.getAttendanceSummary);
router.get('/headcount', ReportController.getHeadcountReport);
router.get('/shift-utilization', validate(monthYearValidator), ReportController.getShiftUtilization);

module.exports = router;
