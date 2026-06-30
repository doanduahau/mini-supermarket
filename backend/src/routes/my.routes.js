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
router.patch('/change-password', MyController.changePassword);
router.get('/schedule', MyController.getSchedule);
router.get('/shift-availability', MyController.getShiftAvailability);
router.get('/attendance', MyController.getAttendance);
router.patch('/attendance/:id/checkin', MyController.selfCheckIn);
router.patch('/attendance/:id/checkout', MyController.selfCheckOut);
router.get('/estimated-salary', MyController.getEstimatedSalary);
router.post('/shift-register/bulk', MyController.selfRegisterBulk);
router.post('/shift-register', validate(selfRegisterValidator), MyController.selfRegister);
router.delete('/shift-register/:id', MyController.cancelSelfRegister);
router.get('/coworkers', MyController.getCoworkers);
router.get('/coworker-shifts/:id', MyController.getCoworkerShifts);

module.exports = router;
