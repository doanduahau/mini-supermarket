const { Shift, ShiftAssignment } = require('../models');

// Helper
const parseTime = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const getAll = async () => {
  return Shift.find().sort({ startTime: 1 });
};

const create = async (data) => {
  const { name, startTime, endTime } = data;
  
  if (parseTime(endTime) <= parseTime(startTime)) {
    throw Object.assign(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'), { statusCode: 400 });
  }

  const existing = await Shift.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) {
    throw Object.assign(new Error('Tên ca làm việc đã tồn tại'), { statusCode: 400 });
  }

  return Shift.create(data);
};

const update = async (id, data) => {
  const shift = await Shift.findById(id);
  if (!shift) throw Object.assign(new Error('Không tìm thấy ca làm việc'), { statusCode: 404 });

  const newStartTime = data.startTime || shift.startTime;
  const newEndTime = data.endTime || shift.endTime;

  if (parseTime(newEndTime) <= parseTime(newStartTime)) {
    throw Object.assign(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'), { statusCode: 400 });
  }

  if (data.startTime !== shift.startTime || data.endTime !== shift.endTime) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureAssignments = await ShiftAssignment.countDocuments({
      shift: id,
      date: { $gte: today }
    });

    if (futureAssignments > 0) {
      throw Object.assign(new Error('Không thể sửa giờ của ca đang có lịch phân công'), { statusCode: 400 });
    }
  }

  if (data.name && data.name.toLowerCase() !== shift.name.toLowerCase()) {
    const existing = await Shift.findOne({ name: { $regex: new RegExp(`^${data.name}$`, 'i') }, _id: { $ne: id } });
    if (existing) {
      throw Object.assign(new Error('Tên ca làm việc đã tồn tại'), { statusCode: 400 });
    }
  }

  Object.assign(shift, data);
  await shift.save();
  return shift;
};

const remove = async (id) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const futureAssignments = await ShiftAssignment.countDocuments({
    shift: id,
    date: { $gte: today }
  });

  if (futureAssignments > 0) {
    throw Object.assign(new Error('Không thể xóa ca đang có lịch phân công'), { statusCode: 400 });
  }

  const shift = await Shift.findByIdAndDelete(id);
  if (!shift) throw Object.assign(new Error('Không tìm thấy ca làm việc'), { statusCode: 404 });
  return true;
};

module.exports = { getAll, create, update, remove };
