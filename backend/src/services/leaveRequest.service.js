const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { LeaveRequest, User, Shift, ShiftAssignment, Attendance, Payroll } = require('../models');

const getAll = async ({ employeeId, status, page = 1, limit = 20 }) => {
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (status) where.status = status;

  const offset = (page - 1) * limit;

  const { rows, count } = await LeaveRequest.findAndCountAll({
    where,
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'avatar'] },
      { 
        model: ShiftAssignment, 
        as: 'shiftAssignment',
        include: [
          { model: Shift, as: 'shift', attributes: ['id', '_id', 'name', 'startTime', 'endTime'] }
        ]
      },
      { model: User, as: 'reviewer', attributes: ['id', '_id', 'fullName'] },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  return {
    requests: rows.map((r) => r.toJSON()),
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
  };
};

const create = async ({ employeeId, shiftAssignmentId, reason }) => {
  const assignment = await ShiftAssignment.findOne({
    where: { id: shiftAssignmentId, employeeId, status: 'approved' },
    include: [{ model: Shift, as: 'shift' }]
  });

  if (!assignment) {
    throw Object.assign(new Error('Ca làm việc không tồn tại hoặc chưa được duyệt'), { statusCode: 400 });
  }

  const shiftTimeStr = assignment.shift ? assignment.shift.startTime : '00:00';
  const [sh, sm] = shiftTimeStr.split(':').map(Number);
  const shiftDateTime = new Date(assignment.date);
  shiftDateTime.setHours(sh, sm, 0, 0);

  if (shiftDateTime < new Date()) {
    throw Object.assign(new Error('Ca làm việc này đã bắt đầu hoặc đã qua, không thể xin nghỉ'), { statusCode: 400 });
  }

  const existingAtt = await Attendance.findOne({ where: { employeeId, shiftId: assignment.shiftId, date: assignment.date } });
  if (existingAtt && (existingAtt.checkIn !== null || existingAtt.checkOut !== null)) {
    throw Object.assign(new Error('Không thể xin nghỉ ca vì đã có dữ liệu chấm công cho ca này'), { statusCode: 400 });
  }

  const payroll = await Payroll.findOne({ where: { employeeId, month: shiftDateTime.getMonth() + 1, year: shiftDateTime.getFullYear(), status: 'confirmed' } });
  if (payroll) {
    throw Object.assign(new Error('Không thể xin nghỉ ca cho tháng đã chốt lương'), { statusCode: 400 });
  }

  const existingRequest = await LeaveRequest.findOne({
    where: { employeeId, shiftAssignmentId, status: 'pending' },
  });

  if (existingRequest) {
    throw Object.assign(new Error('Bạn đã có một yêu cầu xin nghỉ đang chờ duyệt cho ca này'), { statusCode: 400 });
  }

  const request = await LeaveRequest.create({
    employeeId,
    shiftAssignmentId,
    reason,
  });

  return request.toJSON();
};

const updateStatus = async (id, status, reviewerId, reviewNote) => {
  if (!['approved', 'rejected'].includes(status)) {
    throw Object.assign(new Error("Trạng thái chỉ có thể là 'approved' hoặc 'rejected'"), { statusCode: 400 });
  }

  const request = await LeaveRequest.findByPk(id, {
    include: [{ model: ShiftAssignment, as: 'shiftAssignment' }]
  });
  
  if (!request) {
    throw Object.assign(new Error('Không tìm thấy yêu cầu xin nghỉ'), { statusCode: 404 });
  }

  if (request.status !== 'pending') {
    throw Object.assign(new Error('Yêu cầu này đã được xử lý trước đó'), { statusCode: 400 });
  }

  const assignment = request.shiftAssignment;
  if (!assignment) {
    throw Object.assign(new Error('Lịch phân công không còn tồn tại'), { statusCode: 400 });
  }

  const shiftDateTime = new Date(assignment.date);
  
  const payroll = await Payroll.findOne({ where: { employeeId: request.employeeId, month: shiftDateTime.getMonth() + 1, year: shiftDateTime.getFullYear(), status: 'confirmed' } });
  if (payroll) {
    throw Object.assign(new Error('Không thể duyệt nghỉ ca cho tháng đã chốt lương'), { statusCode: 400 });
  }

  const existingAtt = await Attendance.findOne({ where: { employeeId: request.employeeId, shiftId: assignment.shiftId, date: assignment.date } });
  if (existingAtt && (existingAtt.checkIn !== null || existingAtt.checkOut !== null)) {
    throw Object.assign(new Error('Không thể duyệt nghỉ ca vì nhân viên đã có dữ liệu chấm công thật sự cho ca này'), { statusCode: 400 });
  }

  await sequelize.transaction(async (t) => {
    if (status === 'approved') {
      await ShiftAssignment.update(
        { status: 'cancelled_by_leave', note: (assignment.note ? assignment.note + ' | ' : '') + 'Đã duyệt xin nghỉ phép' },
        { where: { id: assignment.id }, transaction: t }
      );
      
      // Xóa bản ghi chấm công rỗng (placeholder) nếu tồn tại
      if (existingAtt) {
        await Attendance.destroy({ where: { id: existingAtt.id }, transaction: t });
      }
    }
    
    await request.update({
      status,
      reviewedBy: reviewerId,
      reviewNote,
      reviewedAt: new Date()
    }, { transaction: t });
  });

  const updatedRequest = await LeaveRequest.findByPk(id, {
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email'] },
      { 
        model: ShiftAssignment, 
        as: 'shiftAssignment',
        include: [{ model: Shift, as: 'shift', attributes: ['name'] }]
      },
    ],
  });

  return updatedRequest.toJSON();
};

module.exports = { getAll, create, updateStatus };
