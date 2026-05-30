const express = require('express');
const router = express.Router();
const MyController = require('../controllers/my.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { updateProfileValidator, selfRegisterValidator } = require('../validators/my.validator');

// Tất cả my routes đều dùng protect middleware
router.use(protect);

router.get('/profile', MyController.getProfile);
router.put('/profile', validate(updateProfileValidator), MyController.updateProfile);
router.get('/schedule', MyController.getSchedule);
router.get('/attendance', MyController.getAttendance);
router.get('/estimated-salary', MyController.getEstimatedSalary);
router.post('/shift-register', validate(selfRegisterValidator), MyController.selfRegister);

module.exports = router;
