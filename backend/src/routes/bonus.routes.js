const express = require('express');
const router = express.Router();
const BonusController = require('../controllers/bonus.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createBonusValidator } = require('../validators/bonus.validator');

// Lấy danh sách bonus chung và báo cáo
router.get('/',               protect, authorize('supermarket_owner', 'shift_manager'), BonusController.getAll);
router.get('/summary',        protect, authorize('supermarket_owner', 'shift_manager'), BonusController.getSummaryByMonth);
router.get('/employee/:id',   protect, authorize('supermarket_owner', 'shift_manager'), BonusController.getByEmployee);

// Quyền quản trị cho bonus
router.post('/',              protect, authorize('supermarket_owner'), validate(createBonusValidator), BonusController.create);
router.put('/:id',            protect, authorize('supermarket_owner'), BonusController.update);
router.delete('/:id',         protect, authorize('supermarket_owner'), BonusController.remove);

module.exports = router;
