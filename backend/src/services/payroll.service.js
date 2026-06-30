const { Op } = require('sequelize');
const { User, SalaryConfig, Attendance, Bonus, Payroll, PayrollAttendanceRecord, PayrollBonusRecord, Shift } = require('../models');
const { sendMail } = require('../utils/mailer');
const templates = require('../utils/emailTemplates');
const { sendNotificationToUser } = require('../socket/socket.handler');
const { sequelize } = require('../config/db');

const mapPayrollOutput = (p) => {
  if (!p) return null;
  const json = p.toJSON ? p.toJSON() : p;
  json.breakdown = {
    attendanceRecords: json.attendanceRecords || [],
    bonusRecords: json.bonusRecords || []
  };
  delete json.attendanceRecords;
  delete json.bonusRecords;
  return json;
};

const calculateForEmployee = async (employeeId, month, year, isPreview = false) => {
  const user = await User.findByPk(employeeId);
  if (!user) throw Object.assign(new Error('Không tìm thấy nhân viên'), { statusCode: 404 });

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const config = await SalaryConfig.findOne({
    where: {
      role: user.role,
      effectiveFrom: { [Op.lte]: endDate }
    },
    order: [['effectiveFrom', 'DESC']]
  });

  if (!config && !isPreview) {
    throw Object.assign(new Error(`Chưa có cấu hình lương cho vai trò ${user.role}`), { statusCode: 400 });
  }

  const attendances = await Attendance.findAll({
    where: {
      employeeId,
      date: { [Op.between]: [startDate, endDate] },
      actualHours: { [Op.gt]: 0 }
    },
    include: [{ model: Shift, as: 'shift', attributes: ['id', '_id', 'name', 'startTime', 'endTime'] }]
  });

  let totalHours = 0;
  const attendanceRecords = [];

  let baseSalary = 0;

  for (const attendance of attendances) {
    const attendanceDay = new Date(attendance.date);
    attendanceDay.setUTCHours(23, 59, 59, 999);

    const attendanceConfig = await SalaryConfig.findOne({
      where: {
        role: user.role,
        effectiveFrom: { [Op.lte]: attendanceDay }
      },
      order: [['effectiveFrom', 'DESC']]
    });
    
    // Ưu tiên dùng lương riêng của user, nếu không có mới lấy lương chung theo role
    const appliedHourlyRate = user.hourlyRate 
      ? Number(user.hourlyRate) 
      : (attendanceConfig ? Number(attendanceConfig.hourlyRate) : 0);

    if (appliedHourlyRate === 0) continue;
    
    const salary = Math.round(Number(attendance.actualHours) * appliedHourlyRate);
    baseSalary += salary;
    totalHours += Number(attendance.actualHours);

    attendanceRecords.push({
      date: attendance.date,
      shiftId: attendance.shift ? attendance.shift.id : null,
      shiftName: attendance.shift ? attendance.shift.name : null,
      actualHours: attendance.actualHours,
      hourlyRate: appliedHourlyRate,
      salary,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut
    });
  }
  totalHours = Math.round(totalHours * 100) / 100;
  baseSalary = Math.round(baseSalary);

  const bonuses = await Bonus.findAll({ 
    where: { employeeId, month, year } 
  });

  let bonusTotal = 0;
  let penaltyTotal = 0;
  const bonusRecords = bonuses.map(b => {
    if (b.type === 'bonus') bonusTotal += Number(b.amount);
    else if (b.type === 'penalty') penaltyTotal += Number(b.amount);
    
    return {
      type: b.type,
      amount: b.amount,
      reason: b.reason,
      date: b.createdAt
    };
  });

  const netSalary = Math.max(0, baseSalary + bonusTotal - penaltyTotal);
  
  return {
    employeeId: user.id,
    month,
    year,
    totalHours,
    hourlyRate: config ? config.hourlyRate : 0, // NOTE: Chỉ dùng để hiển thị (display-only), baseSalary thực tế được tính theo rate từng ngày
    baseSalary,
    bonusTotal,
    penaltyTotal,
    netSalary,
    breakdown: {
      attendanceRecords,
      bonusRecords
    }
  };
};

const previewPayroll = async (employeeId, month, year) => {
  return calculateForEmployee(employeeId, month, year, true);
};

const createOrUpdateDraft = async (employeeId, month, year, createdBy) => {
  let payroll = await Payroll.findOne({ where: { employeeId, month, year } });
  if (payroll && payroll.status === 'confirmed') {
    throw Object.assign(new Error('Bảng lương đã được chốt, không thể tính lại'), { statusCode: 400 });
  }

  const calculated = await calculateForEmployee(employeeId, month, year);
  const { breakdown, ...payrollData } = calculated;

  await sequelize.transaction(async (t) => {
    if (payroll) {
      await Payroll.update(
        { ...payrollData, status: 'draft', note: '' },
        { where: { id: payroll.id }, transaction: t }
      );
    } else {
      payroll = await Payroll.create({ ...payrollData, status: 'draft', note: '' }, { transaction: t });
    }

    await PayrollAttendanceRecord.destroy({ where: { payrollId: payroll.id }, transaction: t });
    await PayrollBonusRecord.destroy({ where: { payrollId: payroll.id }, transaction: t });

    const attRecordsToInsert = breakdown.attendanceRecords.map(r => ({ ...r, payrollId: payroll.id }));
    const bonusRecordsToInsert = breakdown.bonusRecords.map(r => ({ ...r, payrollId: payroll.id }));

    if (attRecordsToInsert.length) await PayrollAttendanceRecord.bulkCreate(attRecordsToInsert, { transaction: t });
    if (bonusRecordsToInsert.length) await PayrollBonusRecord.bulkCreate(bonusRecordsToInsert, { transaction: t });
  });

  return getPayrollById(payroll.id);
};

const createMonthlyPayroll = async (month, year, createdBy) => {
  const users = await User.findAll();

  const results = await Promise.allSettled(
    users.map(u => createOrUpdateDraft(u.id, month, year, createdBy))
  );

  const success = [];
  const failed = [];

  for (let index = 0; index < results.length; index++) {
    const res = results[index];
    const user = users[index];
    if (res.status === 'fulfilled') {
      success.push({ employee: user.id, payroll: res.value });
      
      const mailOptions = templates.payrollReady({
        employeeName: user.fullName,
        month, year,
        netSalary: res.value.netSalary,
        status: 'draft'
      });
      sendMail({ to: user.email, ...mailOptions });

      sendNotificationToUser(
        user.id,
        'notification:payroll_ready',
        {
          payrollId: res.value.id,
          month, year,
          netSalary: res.value.netSalary,
          message: `Phiếu lương dự kiến tháng ${month}/${year} đã sẵn sàng`
        }
      );
    } else {
      failed.push({ employee: user.id, reason: res.reason.message || res.reason });
    }
  }

  return { success, failed };
};

const confirmPayroll = async (payrollId, confirmedBy) => {
  const payroll = await Payroll.findByPk(payrollId);
  if (!payroll) throw Object.assign(new Error('Không tìm thấy bảng lương'), { statusCode: 404 });
  if (payroll.status === 'confirmed') {
    throw Object.assign(new Error('Bảng lương này đã được chốt trước đó'), { statusCode: 400 });
  }

  await Payroll.update(
    { status: 'confirmed', confirmedById: confirmedBy, confirmedAt: new Date() },
    { where: { id: payrollId } }
  );

  const populatedPayroll = await getPayrollById(payrollId);
  const mailOptions = templates.payrollReady({
    employeeName: populatedPayroll.employee.fullName,
    month: populatedPayroll.month,
    year: populatedPayroll.year,
    netSalary: populatedPayroll.netSalary,
    status: 'confirmed'
  });
  sendMail({ to: populatedPayroll.employee.email, ...mailOptions });

  sendNotificationToUser(
    populatedPayroll.employee.id,
    'notification:payroll_ready',
    {
      payrollId: populatedPayroll.id,
      month: populatedPayroll.month,
      year: populatedPayroll.year,
      netSalary: populatedPayroll.netSalary,
      message: `Phiếu lương chính thức tháng ${populatedPayroll.month}/${populatedPayroll.year} đã được chốt`
    }
  );

  return populatedPayroll;
};

const getPayroll = async ({ employeeId, month, year, status, page = 1, limit = 20 }) => {
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);
  if (status) where.status = status;

  const offset = (page - 1) * limit;

  const { rows, count } = await Payroll.findAndCountAll({
    where,
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'role', 'avatar'] },
      { model: PayrollAttendanceRecord, as: 'attendanceRecords' },
      { model: PayrollBonusRecord, as: 'bonusRecords' }
    ],
    order: [['year', 'DESC'], ['month', 'DESC']],
    offset,
    limit,
  });

  return {
    payrolls: rows.map(mapPayrollOutput),
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
  };
};

const getPayrollById = async (id) => {
  const payroll = await Payroll.findByPk(id, {
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'role', 'avatar'] },
      { model: PayrollAttendanceRecord, as: 'attendanceRecords' },
      { model: PayrollBonusRecord, as: 'bonusRecords' }
    ]
  });
  if (!payroll) throw Object.assign(new Error('Không tìm thấy bảng lương'), { statusCode: 404 });
  return mapPayrollOutput(payroll);
};

module.exports = {
  calculateForEmployee,
  previewPayroll,
  createOrUpdateDraft,
  createMonthlyPayroll,
  confirmPayroll,
  getPayroll,
  getPayrollById
};
