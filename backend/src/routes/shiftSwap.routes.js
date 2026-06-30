const express = require('express');
const router = express.Router();
const ShiftSwapController = require('../controllers/shiftSwap.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', protect, ShiftSwapController.getAll);
router.post('/', protect, authorize('employee'), ShiftSwapController.create);
router.patch('/:id/status', protect, ShiftSwapController.updateStatus);

module.exports = router;
