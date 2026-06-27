const { User, SalaryConfig, Attendance, Bonus, Payroll } = require('../models');
const { sendMail } = require('../utils/mailer');
const templates = require('../utils/emailTemplates');
const { sendNotificationToUser } = require('../socket/socket.handler');

const calculateForEmployee = async (employeeId, month, year, isPreview = false) => {
  const user = await User.findById(employeeId);
  if (!user) throw Object.assign(new Error('Không tìm thấy nhân viên'), { statusCode: 404 });

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const config = await SalaryConfig.findOne({
    role: user.role,
    effectiveFrom: { $lte: endDate }
  }).sort({ effectiveFrom: -1 });

  if (!config && !isPreview) {
    throw Object.assign(new Error(`Chưa có cấu hình lương cho vai trò ${user.role}`), { statusCode: 400 });
  }

  const attendances = await Attendance.find({
    employee: employeeId,
    date: { $gte: startDate, $lte: endDate },
    actualHours: { $gt: 0 }
  }).populate('shift', 'name startTime endTime');

  let totalHours = 0;
  const attendanceRecords = [];

  let baseSalary = 0;

  for (const attendance of attendances) {

    const attendanceDay = new Date(attendance.date);
    attendanceDay.setUTCHours(23, 59, 59, 999);

    const attendanceConfig = await SalaryConfig.findOne({
      role: user.role,
      effectiveFrom: { $lte: attendanceDay }
    }).sort({ effectiveFrom: -1 });
    if (!attendanceConfig) continue;
    const salary = Math.round(
      attendance.actualHours * attendanceConfig.hourlyRate
    );
    baseSalary += salary;
    totalHours += attendance.actualHours;

    attendanceRecords.push({
      date: attendance.date,
      shift: attendance.shift ? attendance.shift._id : null,
      actualHours: attendance.actualHours,
      hourlyRate: attendanceConfig.hourlyRate,
      salary,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut
    });
  }
  totalHours = Math.round(totalHours * 100) / 100;
  baseSalary = Math.round(baseSalary);

  const bonuses = await Bonus.find({ employee: employeeId, month, year });

  let bonusTotal = 0;
  let penaltyTotal = 0;
  const bonusRecords = bonuses.map(b => {
    if (b.type === 'bonus') bonusTotal += b.amount;
    else if (b.type === 'penalty') penaltyTotal += b.amount;
    
    return {
      type: b.type,
      amount: b.amount,
      reason: b.reason,
      createdAt: b.createdAt
    };
  });

  const netSalary = Math.max(0, baseSalary + bonusTotal - penaltyTotal);
  
  return {
    employee: user._id,
    month,
    year,
    totalHours,
    hourlyRate: config ? config.hourlyRate : 0,
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
  const existing = await Payroll.findOne({ employee: employeeId, month, year });
  if (existing && existing.status === 'confirmed') {
    throw Object.assign(new Error('Bảng lương đã được chốt, không thể tính lại'), { statusCode: 400 });
  }

  const calculated = await calculateForEmployee(employeeId, month, year);

  const payroll = await Payroll.findOneAndUpdate(
    { employee: employeeId, month, year },
    { $set: { ...calculated, status: 'draft', note: '' } },
    { new: true, upsert: true }
  );

  return payroll;
};

const createMonthlyPayroll = async (month, year, createdBy) => {
  const users = await User.find({});

  const results = await Promise.allSettled(
    users.map(u => createOrUpdateDraft(u._id, month, year, createdBy))
  );

  const success = [];
  const failed = [];

  for (let index = 0; index < results.length; index++) {
    const res = results[index];
    const user = users[index];
    if (res.status === 'fulfilled') {
      success.push({ employee: user._id, payroll: res.value });
      
      const mailOptions = templates.payrollReady({
        employeeName: user.fullName,
        month, year,
        netSalary: res.value.netSalary,
        status: 'draft'
      });
      sendMail({ to: user.email, ...mailOptions });

      sendNotificationToUser(
        user._id,
        'notification:payroll_ready',
        {
          payrollId: res.value._id,
          month, year,
          netSalary: res.value.netSalary,
          message: `Phiếu lương dự kiến tháng ${month}/${year} đã sẵn sàng`
        }
      );
    } else {
      failed.push({ employee: user._id, reason: res.reason.message || res.reason });
    }
  }

  return { success, failed };
};

const confirmPayroll = async (payrollId, confirmedBy) => {
  const payroll = await Payroll.findById(payrollId);
  if (!payroll) throw Object.assign(new Error('Không tìm thấy bảng lương'), { statusCode: 404 });
  if (payroll.status === 'confirmed') {
    throw Object.assign(new Error('Bảng lương này đã được chốt trước đó'), { statusCode: 400 });
  }

  payroll.status = 'confirmed';
  payroll.confirmedBy = confirmedBy;
  payroll.confirmedAt = Date.now();
  await payroll.save();

  const populatedPayroll = await Payroll.findById(payroll._id).populate('employee');
  const mailOptions = templates.payrollReady({
    employeeName: populatedPayroll.employee.fullName,
    month: populatedPayroll.month,
    year: populatedPayroll.year,
    netSalary: populatedPayroll.netSalary,
    status: 'confirmed'
  });
  sendMail({ to: populatedPayroll.employee.email, ...mailOptions });

  sendNotificationToUser(
    populatedPayroll.employee._id,
    'notification:payroll_ready',
    {
      payrollId: populatedPayroll._id,
      month: populatedPayroll.month,
      year: populatedPayroll.year,
      netSalary: populatedPayroll.netSalary,
      message: `Phiếu lương chính thức tháng ${populatedPayroll.month}/${populatedPayroll.year} đã được chốt`
    }
  );

  return payroll;
};

const getPayroll = async ({ employeeId, month, year, status, page = 1, limit = 20 }) => {
  const query = {};
  if (employeeId) query.employee = employeeId;
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);
  if (status) query.status = status;

  const skip = (page - 1) * limit;

  const [payrolls, total] = await Promise.all([
    Payroll.find(query)
      .populate('employee', 'fullName email role avatar')
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(limit),
    Payroll.countDocuments(query),
  ]);

  return {
    payrolls,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};

const getPayrollById = async (id) => {
  const payroll = await Payroll.findById(id).populate('employee', 'fullName email role avatar');
  if (!payroll) throw Object.assign(new Error('Không tìm thấy bảng lương'), { statusCode: 404 });
  return payroll;
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
