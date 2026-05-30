const { Attendance } = require('../models');

const getAll = async ({ date, employeeId, shiftId, month, year, page = 1, limit = 20 }) => {
  const query = {};

  if (date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const endD = new Date(d);
    endD.setUTCHours(23, 59, 59, 999);
    query.date = { $gte: d, $lte: endD };
  } else if (month && year) {
    const m = parseInt(month);
    const y = parseInt(year);
    const startDate = new Date(Date.UTC(y, m - 1, 1));
    const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
    query.date = { $gte: startDate, $lte: endDate };
  }

  if (employeeId) query.employee = employeeId;
  if (shiftId) query.shift = shiftId;

  const skip = (page - 1) * limit;

  const [attendances, total] = await Promise.all([
    Attendance.find(query)
      .populate('employee', 'fullName email avatar role')
      .populate('shift', 'name startTime endTime')
      .sort({ date: -1, 'shift.startTime': 1 })
      .skip(skip)
      .limit(limit),
    Attendance.countDocuments(query),
  ]);

  return {
    attendances,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
  };
};

const getById = async (id) => {
  const attendance = await Attendance.findById(id)
    .populate('employee', 'fullName email avatar role')
    .populate('shift', 'name startTime endTime')
    .populate('recordedBy', 'fullName role')
    .populate('editHistory.updatedBy', 'fullName role');

  if (!attendance) throw Object.assign(new Error('Không tìm thấy bản ghi chấm công'), { statusCode: 404 });
  return attendance;
};

const calcActualHours = (checkIn, checkOut) => {
  let diff = (new Date(checkOut) - new Date(checkIn)) / 3_600_000;
  if (diff > 6) diff -= 0.5;
  return Math.round(diff * 100) / 100;
};

const checkIn = async (attendanceId, checkInTime, recordedBy) => {
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) throw Object.assign(new Error('Không tìm thấy bản ghi chấm công'), { statusCode: 404 });
  if (attendance.checkIn) throw Object.assign(new Error('Nhân viên đã được check-in'), { statusCode: 400 });

  attendance.checkIn = checkInTime ? new Date(checkInTime) : new Date();
  attendance.recordedBy = recordedBy;
  await attendance.save();

  return getById(attendanceId);
};

const checkOut = async (attendanceId, checkOutTime, recordedBy) => {
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) throw Object.assign(new Error('Không tìm thấy bản ghi chấm công'), { statusCode: 404 });
  if (!attendance.checkIn) throw Object.assign(new Error('Chưa có check-in, không thể check-out'), { statusCode: 400 });
  if (attendance.checkOut) throw Object.assign(new Error('Nhân viên đã được check-out'), { statusCode: 400 });

  const cOut = checkOutTime ? new Date(checkOutTime) : new Date();

  if ((cOut - new Date(attendance.checkIn)) < 30 * 60 * 1000) {
    throw Object.assign(new Error('Thời gian check-out phải sau check-in ít nhất 30 phút'), { statusCode: 400 });
  }

  attendance.checkOut = cOut;
  attendance.actualHours = calcActualHours(attendance.checkIn, attendance.checkOut);
  // Ensure recordedBy is maintained or updated to the check-out user if required
  attendance.recordedBy = recordedBy;
  await attendance.save();

  return getById(attendanceId);
};

const manualUpdate = async (id, { checkIn, checkOut, note }, updatedBy) => {
  const attendance = await Attendance.findById(id);
  if (!attendance) throw Object.assign(new Error('Không tìm thấy bản ghi chấm công'), { statusCode: 404 });

  if (checkIn) attendance.checkIn = new Date(checkIn);
  if (checkOut) attendance.checkOut = new Date(checkOut);

  if (attendance.checkIn && attendance.checkOut) {
    if ((new Date(attendance.checkOut) - new Date(attendance.checkIn)) < 0) {
      throw Object.assign(new Error('Thời gian check-out phải sau check-in'), { statusCode: 400 });
    }
    attendance.actualHours = calcActualHours(attendance.checkIn, attendance.checkOut);
  } else {
    attendance.actualHours = null;
  }

  attendance.editHistory.push({
    updatedBy,
    updatedAt: new Date(),
    note
  });

  await attendance.save();
  return getById(id);
};

const getDailyReport = async ({ date, shiftId }) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const endD = new Date(d);
  endD.setUTCHours(23, 59, 59, 999);

  const query = { date: { $gte: d, $lte: endD } };
  if (shiftId) query.shift = shiftId;

  const attendances = await Attendance.find(query);

  let checkedIn = 0;
  let checkedOut = 0;
  let notCheckedIn = 0;
  let totalHours = 0;

  attendances.forEach(att => {
    if (!att.checkIn) notCheckedIn++;
    else if (att.checkIn && !att.checkOut) checkedIn++;
    else if (att.checkIn && att.checkOut) {
      checkedOut++;
      if (att.actualHours) totalHours += att.actualHours;
    }
  });

  return {
    total: attendances.length,
    checkedIn,
    checkedOut,
    notCheckedIn,
    totalHours: Math.round(totalHours * 100) / 100
  };
};

module.exports = { getAll, getById, checkIn, checkOut, manualUpdate, getDailyReport };
