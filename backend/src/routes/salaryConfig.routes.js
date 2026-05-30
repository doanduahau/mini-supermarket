const express = require('express');
const router = express.Router();
const SalaryConfigController = require('../controllers/salaryConfig.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createConfigValidator } = require('../validators/salaryConfig.validator');

router.get ('/',       protect, authorize('supermarket_owner', 'shift_manager'), SalaryConfigController.getAll);
router.get ('/:role',  protect, SalaryConfigController.getHistory);
router.post('/',       protect, authorize('supermarket_owner'), validate(createConfigValidator), SalaryConfigController.create);

module.exports = router;
