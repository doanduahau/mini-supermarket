const express = require('express');
const router  = express.Router();
const UserController = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createUserValidator, updateUserValidator } = require('../validators/user.validator');

router.get   ('/',           protect, authorize('supermarket_owner', 'shift_manager'), UserController.getAll);
router.get   ('/:id',        protect, authorize('supermarket_owner', 'shift_manager'), UserController.getById);
router.post  ('/',           protect, authorize('supermarket_owner'), validate(createUserValidator), UserController.create);
router.put   ('/:id',        protect, authorize('supermarket_owner'), validate(updateUserValidator), UserController.update);
router.delete('/:id',        protect, authorize('supermarket_owner'), UserController.remove);
router.patch ('/:id/status', protect, authorize('supermarket_owner'), UserController.toggleStatus);

module.exports = router;
