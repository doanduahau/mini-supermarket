const { Op } = require('sequelize');
const { Attendance, AttendanceEditHistory, User, Shift, Payroll } = require('../models');

const getAll = async ({ date, employeeId, shiftId, month, year, page = 1, limit = 20 }) => {
  const where = {};

  if (date) {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    const endD = new Date(d);
    endD.setUTCHours(23, 59, 59, 999);
    where.date = { [Op.between]: [d, endD] };
  } else if (month && year) {
    const m = parseInt(month);
    const y = parseInt(year);
    const startDate = new Date(Date.UTC(y, m - 1, 1));
    const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
    where.date = { [Op.between]: [startDate, endDate] };
  }

  if (employeeId) where.employeeId = employeeId;
  if (shiftId) where.shiftId = shiftId;

  const offset = (page - 1) * limit;

  const { rows, count } = await Attendance.findAndCountAll({
    where,
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'avatar', 'role'] },
      { model: Shift, as: 'shift', attributes: ['id', '_id', 'name', 'startTime', 'endTime'] },
      { 
        model: AttendanceEditHistory, 
        as: 'editHistory',
        include: [{ model: User, as: 'updatedBy', attributes: ['id', '_id', 'fullName'] }]
      }
    ],
    order: [['date', 'DESC'], [{ model: Shift, as: 'shift' }, 'startTime', 'ASC']],
    offset,
    limit,
  });

  const attendances = rows.map(r => r.toJSON());
  await processAutoCheckOut(attendances);

  return {
    attendances,
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
  };
};

const getById = async (id) => {
  const attendance = await Attendance.findByPk(id, {
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'avatar', 'role'] },
      { model: Shift, as: 'shift', attributes: ['id', '_id', 'name', 'startTime', 'endTime'] },
      { model: User, as: 'recordedBy', attributes: ['id', '_id', 'fullName', 'role'] },
      { 
        model: AttendanceEditHistory, 
        as: 'editHistory',
        include: [{ model: User, as: 'updatedBy', attributes: ['id', '_id', 'fullName', 'role'] }]
      }
    ]
  });

  if (!attendance) throw Object.assign(new Error('Không tìm thấy bản ghi chấm công'), { statusCode: 404 });
  return attendance.toJSON();
};

const getShiftTimes = (date, shift) => {
  if (!shift || !shift.startTime || !shift.endTime) return { start: null, end: null };
  const [sh, sm] = shift.startTime.split(':').map(Number);
  const [eh, em] = shift.endTime.split(':').map(Number);
  
  const start = new Date(date);
  start.setHours(sh, sm, 0, 0);
  
  const end = new Date(date);
  end.setHours(eh, em, 0, 0);
  
  if (eh < sh) {
    end.setDate(end.getDate() + 1);
  }
  
  return { start, end };
};

const calcActualHours = (checkIn, checkOut, shiftStart, shiftEnd) => {
  let inTime = new Date(checkIn);
  let outTime = new Date(checkOut);

  if (shiftStart && inTime < shiftStart) {
    inTime = shiftStart;
  }
  if (shiftEnd && outTime > shiftEnd) {
    outTime = shiftEnd;
  }

  if (outTime < inTime) return 0;

  let diff = (outTime - inTime) / 3_600_000;
  if (diff > 6) diff -= 0.5;
  return Math.round(diff * 100) / 100;
};

const processAutoCheckOut = async (attendances) => {
  const now = new Date();
  const updates = [];

  for (const att of attendances) {
    if (att.checkIn && !att.checkOut && att.shift && att.shift.endTime) {
      const [endH, endM] = att.shift.endTime.split(':').map(Number);
      const shiftEndTime = new Date(att.date);
      shiftEndTime.setHours(endH, endM, 0, 0);

      if (att.shift.startTime) {
        const [startH] = att.shift.startTime.split(':').map(Number);
        if (endH < startH) {
          shiftEndTime.setDate(shiftEndTime.getDate() + 1);
        }
      }

      const diffMinutes = (now.getTime() - shiftEndTime.getTime()) / 60000;

      if (diffMinutes > 30) {
        att.checkOut = shiftEndTime;
        const { start, end } = getShiftTimes(att.date, att.shift);
        att.actualHours = calcActualHours(att.checkIn, att.checkOut, start, end);
        att.note = (att.note ? att.note + '\n' : '') + '[Hệ thống tự động Check-out]';

        updates.push(
          Attendance.update(
            { checkOut: att.checkOut, actualHours: att.actualHours, note: att.note },
            { where: { id: att.id } }
          )
        );
      }
    }
  }

  if (updates.length > 0) {
    await Promise.all(updates);
  }
  return attendances;
};

const checkPayrollLock = async (employeeId, date) => {
  const d = new Date(date);
  const payroll = await Payroll.findOne({
    where: {
      employeeId,
      month: d.getMonth() + 1,
      year: d.getFullYear(),
      status: 'confirmed'
    }
  });
  if (payroll) {
    throw Object.assign(new Error('Tháng này đã chốt lương, không thể thay đổi dữ liệu chấm công'), { statusCode: 400 });
  }
};

const checkIn = async (attendanceId, checkInTime, recordedBy) => {
  const attendance = await Attendance.findByPk(attendanceId, { include: [{ model: Shift, as: 'shift' }] });
  if (!attendance) throw Object.assign(new Error('Không tìm thấy bản ghi chấm công'), { statusCode: 404 });
  if (attendance.checkIn) throw Object.assign(new Error('Nhân viên đã được check-in'), { statusCode: 400 });

  await checkPayrollLock(attendance.employeeId, attendance.date);

  const cIn = checkInTime ? new Date(checkInTime) : new Date();

  if (attendance.shift && attendance.shift.startTime) {
    const [startH, startM] = attendance.shift.startTime.split(':').map(Number);
    const shiftStartTime = new Date(attendance.date);
    shiftStartTime.setHours(startH, startM, 0, 0);

    const timeDiffMs = shiftStartTime.getTime() - cIn.getTime();
    if (timeDiffMs > 60 * 60 * 1000) {
      const minStart = new Date(shiftStartTime.getTime() - 60 * 60 * 1000);
      const minTimeStr = minStart.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      throw Object.assign(new Error(`Chỉ có thể vào ca sớm tối đa 1 tiếng (từ ${minTimeStr})`), { statusCode: 400 });
    }
  }

  await Attendance.update(
    { checkIn: cIn, recordedById: recordedBy },
    { where: { id: attendanceId } }
  );

  return getById(attendanceId);
};

const checkOut = async (attendanceId, checkOutTime, recordedBy) => {
  const attendance = await Attendance.findByPk(attendanceId, { include: [{ model: Shift, as: 'shift' }] });
  if (!attendance) throw Object.assign(new Error('Không tìm thấy bản ghi chấm công'), { statusCode: 404 });
  if (!attendance.checkIn) throw Object.assign(new Error('Chưa có check-in, không thể check-out'), { statusCode: 400 });
  if (attendance.checkOut) throw Object.assign(new Error('Nhân viên đã được check-out'), { statusCode: 400 });

  await checkPayrollLock(attendance.employeeId, attendance.date);

  const cOut = checkOutTime ? new Date(checkOutTime) : new Date();

  if ((cOut - new Date(attendance.checkIn)) < 30 * 60 * 1000) {
    throw Object.assign(new Error('Thời gian check-out phải sau check-in ít nhất 30 phút'), { statusCode: 400 });
  }

  const { start, end } = getShiftTimes(attendance.date, attendance.shift);
  const actualHours = calcActualHours(attendance.checkIn, cOut, start, end);

  await Attendance.update(
    { checkOut: cOut, actualHours, recordedById: recordedBy },
    { where: { id: attendanceId } }
  );

  return getById(attendanceId);
};

const manualUpdate = async (id, { checkInTime, checkOutTime, note }, updatedBy) => {
  const attendance = await Attendance.findByPk(id, { include: [{ model: Shift, as: 'shift' }] });
  if (!attendance) throw Object.assign(new Error('Không tìm thấy bản ghi chấm công'), { statusCode: 404 });

  await checkPayrollLock(attendance.employeeId, attendance.date);

  const oldCheckIn = attendance.checkIn;
  const oldCheckOut = attendance.checkOut;

  const updates = {};
  if (checkInTime) updates.checkIn = new Date(checkInTime);
  if (checkOutTime) updates.checkOut = new Date(checkOutTime);

  const finalCheckIn = checkInTime ? new Date(checkInTime) : attendance.checkIn;
  const finalCheckOut = checkOutTime ? new Date(checkOutTime) : attendance.checkOut;

  if (finalCheckIn && finalCheckOut) {
    if ((new Date(finalCheckOut) - new Date(finalCheckIn)) < 0) {
      throw Object.assign(new Error('Thời gian check-out phải sau check-in'), { statusCode: 400 });
    }
    const { start, end } = getShiftTimes(attendance.date, attendance.shift);
    updates.actualHours = calcActualHours(finalCheckIn, finalCheckOut, start, end);
  } else {
    updates.actualHours = null;
  }

  await Attendance.update(updates, { where: { id } });

  // Thay vì push vào mảng Mongoose, tạo mới bản ghi ở AttendanceEditHistory
  await AttendanceEditHistory.create({
    attendanceId: id,
    updatedById: updatedBy,
    oldCheckIn,
    oldCheckOut,
    newCheckIn: finalCheckIn,
    newCheckOut: finalCheckOut,
    note
  });

  return getById(id);
};

const getDailyReport = async ({ date, shiftId }) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const endD = new Date(d);
  endD.setUTCHours(23, 59, 59, 999);

  const where = { date: { [Op.between]: [d, endD] } };
  if (shiftId) where.shiftId = shiftId;

  const attendances = await Attendance.findAll({ where });

  let checkedIn = 0;
  let checkedOut = 0;
  let notCheckedIn = 0;
  let totalHours = 0;

  attendances.forEach(att => {
    if (!att.checkIn) notCheckedIn++;
    else if (att.checkIn && !att.checkOut) checkedIn++;
    else if (att.checkIn && att.checkOut) {
      checkedOut++;
      if (att.actualHours) totalHours += Number(att.actualHours);
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

module.exports = { getAll, getById, checkIn, checkOut, manualUpdate, getDailyReport, processAutoCheckOut };
