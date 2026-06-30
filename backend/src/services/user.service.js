const { Op } = require('sequelize');
const { User, ShiftAssignment } = require('../models');
const { sendMail } = require('../utils/mailer');
const templates = require('../utils/emailTemplates');

/**
 * List users with optional search/role/status filter + pagination.
 */
const getAll = async (filters = {}, page = 1, limit = 10) => {
  const where = {};
  
  if (filters.search) {
    where[Op.or] = [
      { fullName: { [Op.iLike]: `%${filters.search}%` } },
      { email: { [Op.iLike]: `%${filters.search}%` } }
    ];
  }
  if (filters.role)   where.role   = filters.role;
  if (filters.status) where.status = filters.status;

  const offset = (page - 1) * limit;

  const { rows, count } = await User.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    offset,
    limit,
  });

  return {
    users: rows.map(u => u.toJSON()),
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    }
  };
};

/**
 * Find a single user by _id.
 */
const getById = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw Object.assign(new Error('Không tìm thấy nhân viên'), { statusCode: 404 });
  return user.toJSON();
};

/**
 * Create a new user.
 */
const create = async (data, createdBy) => {
  const existing = await User.findOne({ where: { email: data.email?.toLowerCase() } });
  if (existing) throw Object.assign(new Error('Email đã được sử dụng'), { statusCode: 400 });

  const user = await User.create(data);
  const fetchedUser = await User.findByPk(user.id);
  return fetchedUser.toJSON();
};

/**
 * Update user fields.
 */
const update = async (id, data) => {
  delete data.refreshToken;

  if (data.email) {
    const existing = await User.findOne({ 
      where: { 
        email: data.email.toLowerCase(), 
        id: { [Op.ne]: id } 
      } 
    });
    if (existing) throw Object.assign(new Error('Email đã được sử dụng'), { statusCode: 400 });
  }

  const user = await User.findByPk(id, { scope: 'withPassword' });
  if (!user) throw Object.assign(new Error('Không tìm thấy nhân viên'), { statusCode: 404 });

  await user.update(data);
  
  const updatedUser = await User.findByPk(id);
  return updatedUser.toJSON();
};

/**
 * Soft-delete: lock the account instead of removing the document.
 */
const remove = async (id, actorId) => {
  if (id.toString() === actorId.toString()) {
    throw Object.assign(new Error('Không thể xóa tài khoản của chính mình'), { statusCode: 403 });
  }

  const futureAssignments = await ShiftAssignment.count({
    where: {
      employeeId: id,
      date: { [Op.gte]: new Date() },
      status: 'approved'
    }
  });

  if (futureAssignments > 0) {
    throw Object.assign(new Error('Không thể xóa nhân viên đang có ca làm việc'), { statusCode: 400 });
  }

  await User.update(
    { status: 'locked', deletedAt: new Date() },
    { where: { id } }
  );

  const user = await User.findByPk(id);
  if (!user) throw Object.assign(new Error('Không tìm thấy nhân viên'), { statusCode: 404 });
  return user.toJSON();
};

/**
 * Toggle between 'active' ↔ 'locked'.
 */
const toggleStatus = async (id, actorId) => {
  if (id.toString() === actorId.toString()) {
    throw Object.assign(new Error('Không thể khóa tài khoản của chính mình'), { statusCode: 403 });
  }

  const user = await User.findByPk(id);
  if (!user) throw Object.assign(new Error('Không tìm thấy nhân viên'), { statusCode: 404 });

  user.status = user.status === 'active' ? 'locked' : 'active';
  await user.save();
  
  if (user.status === 'locked') {
    const mailOptions = templates.accountLocked({ employeeName: user.fullName });
    sendMail({ to: user.email, ...mailOptions });
  }

  const updatedUser = await User.findByPk(id);
  return { 
    user: updatedUser.toJSON(), 
    message: `Đã ${user.status === 'locked' ? 'khóa' : 'mở khóa'} tài khoản` 
  };
};

module.exports = { getAll, getById, create, update, remove, toggleStatus };
