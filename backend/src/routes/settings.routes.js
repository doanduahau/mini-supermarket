const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settings.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', protect, authorize('supermarket_owner', 'shift_manager'), SettingsController.getSettings);
router.put('/', protect, authorize('supermarket_owner', 'shift_manager'), SettingsController.updateSettings);

// Public route to get specific settings needed for employees
router.get('/public', protect, SettingsController.getPublicSettings);

module.exports = router;
