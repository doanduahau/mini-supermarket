const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { loginValidator } = require('../validators/auth.validator');

router.post('/login', validate(loginValidator), AuthController.login);

router.post('/refresh', AuthController.refreshToken);
router.post('/logout', protect, AuthController.logout);
router.get('/me', protect, AuthController.me);

module.exports = router;
