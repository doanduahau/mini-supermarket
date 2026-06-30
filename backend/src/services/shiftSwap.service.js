const { Op } = require('sequelize');
const { sequelize } = require('../config/db');
const { ShiftSwapRequest, User, ShiftAssignment, Shift, Attendance, Payroll } = require('../models');

const getAll = async ({ userId, role, status, page = 1, limit = 20 }) => {
  const where = {};
  if (role === 'employee') {
    where[Op.or] = [{ requesterId: userId }, { receiverId: userId }];
  }
  if (status) where.status = status;

  const offset = (page - 1) * limit;

  const { rows, count } = await ShiftSwapRequest.findAndCountAll({
    where,
    include: [
      { model: User, as: 'requester', attributes: ['id', '_id', 'fullName', 'email', 'avatar'] },
      { model: User, as: 'receiver', attributes: ['id', '_id', 'fullName', 'email', 'avatar'] },
      {
        model: ShiftAssignment,
        as: 'sourceAssignment',
        include: [{ model: Shift, as: 'shift', attributes: ['name', 'startTime', 'endTime'] }]
      },
      {
        model: ShiftAssignment,
        as: 'targetAssignment',
        include: [{ model: Shift, as: 'shift', attributes: ['name', 'startTime', 'endTime'] }]
      },
      { model: User, as: 'reviewer', attributes: ['id', '_id', 'fullName'] },
    ],
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  return {
    requests: rows.map(r => r.toJSON()),
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
  };
};

const checkAssignmentValidity = async (assignment, employeeId) => {
  if (!assignment) return;
  const shiftTimeStr = assignment.shift ? assignment.shift.startTime : '00:00';
  const [sh, sm] = shiftTimeStr.split(':').map(Number);
  const shiftDateTime = new Date(assignment.date);
  shiftDateTime.setHours(sh, sm, 0, 0);

  if (shiftDateTime < new Date()) {
    throw Object.assign(new Error('Không thể đổi ca làm việc đã bắt đầu hoặc trong quá khứ'), { statusCode: 400 });
  }

  const existingAtt = await Attendance.findOne({ where: { employeeId, shiftId: assignment.shiftId, date: assignment.date } });
  if (existingAtt && (existingAtt.checkIn !== null || existingAtt.checkOut !== null)) {
    throw Object.assign(new Error('Không thể đổi ca vì nhân viên đã có dữ liệu chấm công cho ca này'), { statusCode: 400 });
  }

  const payroll = await Payroll.findOne({ where: { employeeId, month: shiftDateTime.getMonth() + 1, year: shiftDateTime.getFullYear(), status: 'confirmed' } });
  if (payroll) {
    throw Object.assign(new Error('Không thể đổi ca cho tháng đã chốt lương'), { statusCode: 400 });
  }
};

const create = async ({ requesterId, receiverId, sourceAssignmentId, targetAssignmentId, reason }) => {
  if (requesterId === receiverId) {
    throw Object.assign(new Error('Không thể đổi ca với chính mình'), { statusCode: 400 });
  }

  const source = await ShiftAssignment.findOne({ 
    where: { id: sourceAssignmentId, employeeId: requesterId, status: 'approved' },
    include: [{ model: Shift, as: 'shift' }]
  });
  if (!source) throw Object.assign(new Error('Ca làm việc của bạn không tồn tại hoặc chưa được duyệt'), { statusCode: 400 });
  await checkAssignmentValidity(source, requesterId);

  let target = null;
  if (targetAssignmentId) {
    target = await ShiftAssignment.findOne({ 
      where: { id: targetAssignmentId, employeeId: receiverId, status: 'approved' },
      include: [{ model: Shift, as: 'shift' }]
    });
    if (!target) throw Object.assign(new Error('Ca làm việc của người đổi không tồn tại hoặc chưa được duyệt'), { statusCode: 400 });
    
    if (source.date === target.date && source.shiftId === target.shiftId) {
      throw Object.assign(new Error('Hai người đang có chung một ca làm việc, không thể đổi'), { statusCode: 400 });
    }

    await checkAssignmentValidity(target, receiverId);
  }

  const existing = await ShiftSwapRequest.findOne({
    where: { sourceAssignmentId, status: { [Op.in]: ['pending_receiver', 'pending_manager'] } }
  });
  if (existing) {
    throw Object.assign(new Error('Bạn đã tạo một yêu cầu đổi ca cho ca này rồi'), { statusCode: 400 });
  }

  const request = await ShiftSwapRequest.create({
    requesterId,
    receiverId,
    sourceAssignmentId,
    targetAssignmentId: targetAssignmentId || null,
    reason
  });

  return request.toJSON();
};

const updateStatus = async (id, status, actorId, role, note) => {
  const request = await ShiftSwapRequest.findByPk(id, {
    include: [
      { model: ShiftAssignment, as: 'sourceAssignment' },
      { model: ShiftAssignment, as: 'targetAssignment' }
    ]
  });
  if (!request) throw Object.assign(new Error('Không tìm thấy yêu cầu đổi ca'), { statusCode: 404 });

  if (role === 'employee') {
    if (request.receiverId !== actorId) {
      throw Object.assign(new Error('Bạn không có quyền phản hồi yêu cầu này'), { statusCode: 403 });
    }
    if (request.status !== 'pending_receiver') {
      throw Object.assign(new Error('Yêu cầu này không ở trạng thái chờ bạn phản hồi'), { statusCode: 400 });
    }
    if (!['pending_manager', 'rejected'].includes(status)) {
      throw Object.assign(new Error('Trạng thái phản hồi không hợp lệ'), { statusCode: 400 });
    }
    await request.update({ 
      status, 
      receiverNote: note,
      receiverReviewedAt: new Date()
    });
  } else {
    // Manager
    if (request.status !== 'pending_manager') {
      throw Object.assign(new Error('Yêu cầu chưa được người đổi đồng ý'), { statusCode: 400 });
    }
    if (!['approved', 'rejected'].includes(status)) {
      throw Object.assign(new Error('Trạng thái quản lý không hợp lệ'), { statusCode: 400 });
    }
    
    await sequelize.transaction(async (t) => {
      if (status === 'approved') {
        const source = request.sourceAssignment;
        const target = request.targetAssignment;

        await checkAssignmentValidity(source, request.requesterId);
        if (target) await checkAssignmentValidity(target, request.receiverId);

        const existingReceiverShift = await ShiftAssignment.findOne({ where: { employeeId: request.receiverId, date: source.date, shiftId: source.shiftId } });
        if (existingReceiverShift) {
           throw Object.assign(new Error('Người nhận đã có ca này trong ngày, không thể nhận thêm'), { statusCode: 400 });
        }
        
        if (target) {
          const existingRequesterShift = await ShiftAssignment.findOne({ where: { employeeId: request.requesterId, date: target.date, shiftId: target.shiftId } });
          if (existingRequesterShift) {
             throw Object.assign(new Error('Người xin đổi đã có ca được nhắm tới trong ngày, không thể đổi'), { statusCode: 400 });
          }
          // Mark old as swapped, create new ones
          await source.update({ status: 'swapped', note: (source.note ? source.note + ' | ' : '') + 'Đã đổi ca' }, { transaction: t });
          await target.update({ status: 'swapped', note: (target.note ? target.note + ' | ' : '') + 'Đã đổi ca' }, { transaction: t });

          await ShiftAssignment.create({
            employeeId: request.receiverId,
            shiftId: source.shiftId,
            date: source.date,
            status: 'approved',
            assignedById: actorId,
            note: 'Nhận từ đổi ca'
          }, { transaction: t });

          await ShiftAssignment.create({
            employeeId: request.requesterId,
            shiftId: target.shiftId,
            date: target.date,
            status: 'approved',
            assignedById: actorId,
            note: 'Nhận từ đổi ca'
          }, { transaction: t });

        } else {
          // Just give away
          await source.update({ status: 'swapped', note: (source.note ? source.note + ' | ' : '') + 'Đã nhường ca' }, { transaction: t });
          await ShiftAssignment.create({
            employeeId: request.receiverId,
            shiftId: source.shiftId,
            date: source.date,
            status: 'approved',
            assignedById: actorId,
            note: 'Nhận từ nhường ca'
          }, { transaction: t });
        }
      }
      
      await request.update({ 
        status, 
        reviewedBy: actorId,
        reviewNote: note,
        reviewedAt: new Date()
      }, { transaction: t });
    });
  }

  const updated = await ShiftSwapRequest.findByPk(id, {
    include: [
      { model: User, as: 'requester', attributes: ['id', '_id', 'fullName'] },
      { model: User, as: 'receiver', attributes: ['id', '_id', 'fullName'] }
    ]
  });
  return updated.toJSON();
};

module.exports = { getAll, create, updateStatus };
