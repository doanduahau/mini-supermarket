const express = require('express');
const router = express.Router();
const LeaveRequestController = require('../controllers/leaveRequest.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Cả Quản lý và Nhân viên đều có thể lấy danh sách xin nghỉ
router.get('/', protect, LeaveRequestController.getAll);

// Nhân viên tạo yêu cầu xin nghỉ
router.post('/', protect, authorize('employee'), LeaveRequestController.create);

// Quản lý duyệt/từ chối xin nghỉ
router.patch('/:id/status', protect, authorize('supermarket_owner', 'shift_manager'), LeaveRequestController.updateStatus);

module.exports = router;
