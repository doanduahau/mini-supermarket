const { Op } = require('sequelize');
const { Shift, ShiftAssignment } = require('../models');

// Helper
const parseTime = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const getAll = async () => {
  const shifts = await Shift.findAll({
    order: [['startTime', 'ASC']]
  });
  return shifts.map(s => s.toJSON());
};

const create = async (data) => {
  const { name, startTime, endTime } = data;
  
  if (parseTime(endTime) <= parseTime(startTime)) {
    throw Object.assign(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'), { statusCode: 400 });
  }

  const max = data.maxEmployees !== undefined ? Number(data.maxEmployees) : 3;
  const min = data.minEmployees !== undefined ? Number(data.minEmployees) : 1;
  if (min > max) {
    throw Object.assign(new Error('Số nhân viên tối thiểu không thể lớn hơn tối đa'), { statusCode: 400 });
  }

  const existing = await Shift.findOne({ 
    where: { 
      name: { [Op.iLike]: name } 
    } 
  });
  if (existing) {
    throw Object.assign(new Error('Tên ca làm việc đã tồn tại'), { statusCode: 400 });
  }

  const shift = await Shift.create(data);
  const fetched = await Shift.findByPk(shift.id);
  return fetched.toJSON();
};

const update = async (id, data) => {
  const shift = await Shift.findByPk(id);
  if (!shift) throw Object.assign(new Error('Không tìm thấy ca làm việc'), { statusCode: 404 });

  const newStartTime = data.startTime || shift.startTime;
  const newEndTime = data.endTime || shift.endTime;

  if (parseTime(newEndTime) <= parseTime(newStartTime)) {
    throw Object.assign(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'), { statusCode: 400 });
  }

  const newMax = data.maxEmployees !== undefined ? Number(data.maxEmployees) : shift.maxEmployees;
  const newMin = data.minEmployees !== undefined ? Number(data.minEmployees) : shift.minEmployees;
  if (newMin > newMax) {
    throw Object.assign(new Error('Số nhân viên tối thiểu không thể lớn hơn tối đa'), { statusCode: 400 });
  }

  if (data.startTime !== shift.startTime || data.endTime !== shift.endTime) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureAssignments = await ShiftAssignment.count({
      where: {
        shiftId: id,
        date: { [Op.gte]: today }
      }
    });

    if (futureAssignments > 0) {
      throw Object.assign(new Error('Không thể sửa giờ của ca đang có lịch phân công'), { statusCode: 400 });
    }
  }

  if (data.name && data.name.toLowerCase() !== shift.name.toLowerCase()) {
    const existing = await Shift.findOne({ 
      where: { 
        name: { [Op.iLike]: data.name }, 
        id: { [Op.ne]: id } 
      } 
    });
    if (existing) {
      throw Object.assign(new Error('Tên ca làm việc đã tồn tại'), { statusCode: 400 });
    }
  }

  await Shift.update(data, { where: { id } });
  const updatedShift = await Shift.findByPk(id);
  return updatedShift.toJSON();
};

const remove = async (id) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureAssignments = await ShiftAssignment.count({
    where: {
      shiftId: id,
      date: { [Op.gte]: today }
    }
  });

  if (futureAssignments > 0) {
    throw Object.assign(new Error('Không thể xóa ca đang có lịch phân công'), { statusCode: 400 });
  }

  const shift = await Shift.findByPk(id);
  if (!shift) throw Object.assign(new Error('Không tìm thấy ca làm việc'), { statusCode: 404 });
  
  await Shift.destroy({ where: { id } });
  return true;
};

module.exports = { getAll, create, update, remove };
