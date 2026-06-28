const { sequelize } = require('../config/db');

// Import models
const User = require('./User');
const Shift = require('./Shift');
const Setting = require('./Setting');
const SalaryConfig = require('./SalaryConfig');
const Bonus = require('./Bonus');
const Announcement = require('./Announcement');
const ShiftAssignment = require('./ShiftAssignment');

// Models export objects with sub-models
const { Attendance, AttendanceEditHistory } = require('./Attendance');
const { Payroll, PayrollAttendanceRecord, PayrollBonusRecord } = require('./Payroll');

// ==========================================
// THIẾT LẬP CÁC QUAN HỆ (ASSOCIATIONS)
// ==========================================

// SHIFT ASSIGNMENT
User.hasMany(ShiftAssignment, { foreignKey: 'employeeId', as: 'assignments' });
ShiftAssignment.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
ShiftAssignment.belongsTo(Shift, { foreignKey: 'shiftId', as: 'shift' });
ShiftAssignment.belongsTo(User, { foreignKey: 'assignedById', as: 'assignedBy' });

// ATTENDANCE
Attendance.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
Attendance.belongsTo(Shift, { foreignKey: 'shiftId', as: 'shift' });
Attendance.belongsTo(User, { foreignKey: 'recordedById', as: 'recordedBy' });
Attendance.hasMany(AttendanceEditHistory, { foreignKey: 'attendanceId', as: 'editHistory' });
AttendanceEditHistory.belongsTo(User, { foreignKey: 'updatedById', as: 'updatedBy' });

// SALARY CONFIG & BONUS
SalaryConfig.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
Bonus.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
Bonus.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });

// PAYROLL
Payroll.belongsTo(User, { foreignKey: 'employeeId', as: 'employee' });
Payroll.belongsTo(User, { foreignKey: 'confirmedById', as: 'confirmedBy' });
Payroll.hasMany(PayrollAttendanceRecord, { foreignKey: 'payrollId', as: 'attendanceRecords' });
Payroll.hasMany(PayrollBonusRecord, { foreignKey: 'payrollId', as: 'bonusRecords' });

// ANNOUNCEMENT
Announcement.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

// ==========================================
// EXPORT
// ==========================================
module.exports = {
  sequelize,
  User,
  Shift,
  Setting,
  SalaryConfig,
  Bonus,
  Announcement,
  ShiftAssignment,
  Attendance,
  AttendanceEditHistory,
  Payroll,
  PayrollAttendanceRecord,
  PayrollBonusRecord,
};
