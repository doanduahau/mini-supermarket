const { Op } = require('sequelize');
const { ShiftAssignment, Shift, User, Attendance } = require('../models');
const { sendMail } = require('../utils/mailer');
const templates = require('../utils/emailTemplates');
const { sendNotificationToUser } = require('../socket/socket.handler');
const SettingsService = require('./settings.service');
const { sequelize } = require('../config/db');

const getAll = async ({ date, startDate, endDate, employeeId, shiftId, status, month, year, page = 1, limit = 20 }) => {
  const where = {};

  if (startDate && endDate) {
    const s = new Date(startDate);
    s.setUTCHours(0, 0, 0, 0);
    const e = new Date(endDate);
    e.setUTCHours(23, 59, 59, 999);
    where.date = { [Op.between]: [s, e] };
  } else if (date) {
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
  if (status) where.status = status;

  const offset = (page - 1) * limit;

  const { rows, count } = await ShiftAssignment.findAndCountAll({
    where,
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'role', 'avatar', 'status'] },
      { model: Shift, as: 'shift', attributes: ['id', '_id', 'name', 'startTime', 'endTime'] }
    ],
    order: [['date', 'ASC']],
    offset,
    limit,
  });

  return {
    assignments: rows.map(r => r.toJSON()),
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
  };
};

const create = async ({ employeeId, shiftId, date, note }, assignedBy) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(d);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const shift = await Shift.findByPk(shiftId);
  if (!shift) throw Object.assign(new Error('Ca làm việc không tồn tại'), { statusCode: 404 });

  const user = await User.findByPk(employeeId);
  if (!user || user.status === 'locked') {
    throw Object.assign(new Error('Nhân viên không tồn tại hoặc đã bị khóa'), { statusCode: 400 });
  }

  return await sequelize.transaction(async (t) => {
    // Khóa dòng Shift để ngăn race condition thay vì khóa hàm Count
    await Shift.findByPk(shiftId, { transaction: t, lock: t.LOCK.UPDATE });

    const existingInShift = await ShiftAssignment.count({
      where: {
        shiftId: shiftId,
        date: { [Op.between]: [d, endOfDay] },
        status: { [Op.in]: ['pending', 'approved'] }
      },
      transaction: t
    });

    if (existingInShift >= shift.maxEmployees) {
      throw Object.assign(new Error(`Ca ${shift.name} ngày này đã đủ ${shift.maxEmployees} nhân viên`), { statusCode: 400 });
    }

    const existingAssignments = await ShiftAssignment.findAll({
      where: {
        employeeId: employeeId,
        date: { [Op.between]: [d, endOfDay] },
        status: { [Op.in]: ['pending', 'approved'] }
      },
      transaction: t
    });

    if (existingAssignments.length >= 2) {
      throw Object.assign(new Error('Nhân viên đã đăng ký tối đa 2 ca trong ngày này'), { statusCode: 400 });
    }

    let assignment = await ShiftAssignment.findOne({ 
      where: { employeeId: employeeId, shiftId: shiftId, date: d },
      transaction: t
    });

    if (assignment) {
      if (['pending', 'approved'].includes(assignment.status)) {
        throw Object.assign(new Error('Nhân viên đã đăng ký ca này trong ngày rồi'), { statusCode: 400 });
      }
      await ShiftAssignment.update(
        { status: assignedBy ? 'approved' : 'pending', assignedById: assignedBy, note },
        { where: { id: assignment.id }, transaction: t }
      );
      assignment = await ShiftAssignment.findByPk(assignment.id, { transaction: t });
    } else {
      assignment = await ShiftAssignment.create({
        employeeId: employeeId,
        shiftId: shiftId,
        date: d,
        status: assignedBy ? 'approved' : 'pending',
        assignedById: assignedBy,
        note
      }, { transaction: t });
    }

    if (assignedBy) {
      const existingAtt = await Attendance.findOne({ 
        where: { employeeId: employeeId, shiftId: shiftId, date: d },
        transaction: t
      });
      if (!existingAtt) {
        await Attendance.create({
          employeeId: employeeId,
          shiftId: shiftId,
          date: d,
          recordedById: assignedBy
        }, { transaction: t });
      }
    }

    const populatedAssignment = await ShiftAssignment.findByPk(assignment.id, {
      include: [
        { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'role', 'avatar', 'status'] },
        { model: Shift, as: 'shift', attributes: ['id', '_id', 'name', 'startTime', 'endTime'] }
      ],
      transaction: t
    });

    return populatedAssignment.toJSON();
  });
};

const updateStatus = async (id, status, actorId) => {
  if (!['approved', 'rejected'].includes(status)) {
    throw Object.assign(new Error("Trạng thái chỉ có thể là 'approved' hoặc 'rejected'"), { statusCode: 400 });
  }

  const assignment = await ShiftAssignment.findByPk(id, { include: [{ model: Shift, as: 'shift' }] });
  if (!assignment) throw Object.assign(new Error('Không tìm thấy lịch phân công'), { statusCode: 404 });

  await sequelize.transaction(async (t) => {
    if (status === 'approved' && assignment.status !== 'approved') {
      const d = new Date(assignment.date);
      d.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setUTCHours(23, 59, 59, 999);

      // Khóa dòng Shift để ngăn chặn Race condition
      await Shift.findByPk(assignment.shiftId, { transaction: t, lock: t.LOCK.UPDATE });

      const existingInShift = await ShiftAssignment.count({
        where: {
          shiftId: assignment.shiftId,
          date: { [Op.between]: [d, endOfDay] },
          status: 'approved'
        },
        transaction: t
      });

      if (existingInShift >= assignment.shift.maxEmployees) {
        throw Object.assign(new Error(`Ca ${assignment.shift.name} ngày này đã đủ ${assignment.shift.maxEmployees} nhân viên`), { statusCode: 400 });
      }

      const att = await Attendance.findOne({
        where: { employeeId: assignment.employeeId, shiftId: assignment.shiftId, date: assignment.date },
        transaction: t
      });
      
      if (!att) {
        await Attendance.create({
          employeeId: assignment.employeeId,
          shiftId: assignment.shiftId,
          date: assignment.date,
          recordedById: actorId
        }, { transaction: t });
      }
    }

    await ShiftAssignment.update({ status }, { where: { id }, transaction: t });
  });

  const populatedAssignment = await ShiftAssignment.findByPk(id, {
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'role', 'avatar', 'status'] },
      { model: Shift, as: 'shift', attributes: ['id', '_id', 'name', 'startTime', 'endTime'] }
    ]
  });

  const assignmentJson = populatedAssignment.toJSON();

  if (status === 'approved') {
    const mailOptions = templates.shiftApproved({
      employeeName: assignmentJson.employee.fullName,
      shiftName: assignmentJson.shift.name,
      date: assignmentJson.date,
      startTime: assignmentJson.shift.startTime,
      endTime: assignmentJson.shift.endTime
    });
    sendMail({ to: assignmentJson.employee.email, ...mailOptions });
  } else if (status === 'rejected') {
    const mailOptions = templates.shiftRejected({
      employeeName: assignmentJson.employee.fullName,
      shiftName: assignmentJson.shift.name,
      date: assignmentJson.date,
      reason: 'Quản lý từ chối duyệt ca'
    });
    sendMail({ to: assignmentJson.employee.email, ...mailOptions });
  }

  sendNotificationToUser(
    assignmentJson.employeeId,
    status === 'approved' ? 'notification:shift_approved' : 'notification:shift_rejected',
    {
      assignmentId: assignmentJson.id,
      shiftName: assignmentJson.shift.name,
      date: assignmentJson.date,
      startTime: assignmentJson.shift.startTime,
      endTime: assignmentJson.shift.endTime,
      message: status === 'approved' 
        ? `Ca ${assignmentJson.shift.name} ngày ${new Date(assignmentJson.date).toLocaleDateString('vi-VN')} đã được duyệt` 
        : `Ca ${assignmentJson.shift.name} ngày ${new Date(assignmentJson.date).toLocaleDateString('vi-VN')} bị từ chối`
    }
  );

  return assignmentJson;
};

const selfRegister = async ({ shiftId, date }, employeeId) => {
  const settings = await SettingsService.getPublicSettings();
  if (settings.shiftRegistrationDate) {
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (settings.shiftRegistrationDate !== todayStr) {
      throw Object.assign(new Error('Hôm nay chưa phải ngày mở đăng ký ca'), { statusCode: 400 });
    }
  }

  const registerDate = new Date(date);
  registerDate.setUTCHours(0,0,0,0);
  
  const tomorrow = new Date();
  tomorrow.setUTCHours(0,0,0,0);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (registerDate < tomorrow) {
    throw Object.assign(new Error('Chỉ được đăng ký ca làm việc từ ngày mai trở đi'), { statusCode: 400 });
  }

  return create({ employeeId, shiftId, date, note: 'Nhân viên tự đăng ký' }, null);
};

const remove = async (id) => {
  const assignment = await ShiftAssignment.findByPk(id);
  if (!assignment) throw Object.assign(new Error('Không tìm thấy lịch phân công'), { statusCode: 404 });

  const today = new Date();
  today.setUTCHours(0,0,0,0);

  if (assignment.status === 'approved' && new Date(assignment.date) < today) {
    throw Object.assign(new Error('Không thể xóa phân công đã thực hiện trong quá khứ'), { statusCode: 400 });
  }

  const attendance = await Attendance.findOne({
    where: {
      employeeId: assignment.employeeId,
      shiftId: assignment.shiftId,
      date: assignment.date
    }
  });

  if (attendance) {
    if (attendance.checkIn) {
      throw Object.assign(new Error('Không thể xóa phân công vì nhân viên đã check-in'), { statusCode: 400 });
    }
    await Attendance.destroy({ where: { id: attendance.id } });
  }

  await ShiftAssignment.destroy({ where: { id } });
  return true;
};

module.exports = { getAll, create, updateStatus, selfRegister, remove };
