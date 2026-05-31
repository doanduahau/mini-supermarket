const express = require('express');
const router = express.Router();
const PayrollController = require('../controllers/payroll.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/',               protect, authorize('supermarket_owner', 'shift_manager'), PayrollController.getAll);
router.get('/preview',        protect, authorize('supermarket_owner', 'shift_manager'), PayrollController.preview);
router.get('/export-excel',   protect, authorize('supermarket_owner'), PayrollController.exportExcel);
router.get('/:id',            protect, authorize('supermarket_owner', 'shift_manager'), PayrollController.getById);
router.get('/:id/export-pdf', protect, authorize('supermarket_owner', 'shift_manager'), PayrollController.exportPDF);

router.post('/calculate',     protect, authorize('supermarket_owner'), PayrollController.createOrUpdateDraft);
router.post('/calculate-all', protect, authorize('supermarket_owner'), PayrollController.createMonthlyPayroll);
router.patch('/:id/confirm',  protect, authorize('supermarket_owner'), PayrollController.confirmPayroll);

module.exports = router;
