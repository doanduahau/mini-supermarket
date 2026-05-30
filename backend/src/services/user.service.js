const { User, ShiftAssignment } = require('../models');

/**
 * List users with optional search/role/status filter + pagination.
 */
const getAll = async (filters = {}, page = 1, limit = 10) => {
  const query = {};
  
  if (filters.search) {
    query.$or = [
      { fullName: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } }
    ];
  }
  if (filters.role)   query.role   = filters.role;
  if (filters.status) query.status = filters.status;

  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  };
};

/**
 * Find a single user by _id.
 */
const getById = async (id) => {
  const user = await User.findById(id).select('-password -refreshToken');
  if (!user) throw Object.assign(new Error('Không tìm thấy nhân viên'), { statusCode: 404 });
  return user;
};

/**
 * Create a new user.
 */
const create = async (data, createdBy) => {
  const existing = await User.findOne({ email: data.email?.toLowerCase() });
  if (existing) throw Object.assign(new Error('Email đã được sử dụng'), { statusCode: 400 });

  const user = await User.create(data);
  return User.findById(user._id).select('-password -refreshToken');
};

/**
 * Update user fields.
 */
const update = async (id, data) => {
  delete data.password;
  delete data.role;
  delete data.refreshToken;

  if (data.email) {
    const existing = await User.findOne({ email: data.email.toLowerCase(), _id: { $ne: id } });
    if (existing) throw Object.assign(new Error('Email đã được sử dụng'), { statusCode: 400 });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');
  
  if (!user) throw Object.assign(new Error('Không tìm thấy nhân viên'), { statusCode: 404 });
  return user;
};

/**
 * Soft-delete: lock the account instead of removing the document.
 */
const remove = async (id, actorId) => {
  if (id.toString() === actorId.toString()) {
    throw Object.assign(new Error('Không thể xóa tài khoản của chính mình'), { statusCode: 403 });
  }

  const futureAssignments = await ShiftAssignment.countDocuments({
    employee: id,
    date: { $gte: new Date() },
    status: 'approved'
  });

  if (futureAssignments > 0) {
    throw Object.assign(new Error('Không thể xóa nhân viên đang có ca làm việc'), { statusCode: 400 });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { status: 'locked', deletedAt: Date.now() },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) throw Object.assign(new Error('Không tìm thấy nhân viên'), { statusCode: 404 });
  return user;
};

/**
 * Toggle between 'active' ↔ 'locked'.
 */
const toggleStatus = async (id, actorId) => {
  if (id.toString() === actorId.toString()) {
    throw Object.assign(new Error('Không thể khóa tài khoản của chính mình'), { statusCode: 403 });
  }

  const user = await User.findById(id);
  if (!user) throw Object.assign(new Error('Không tìm thấy nhân viên'), { statusCode: 404 });

  user.status = user.status === 'active' ? 'locked' : 'active';
  await user.save();
  
  return { 
    user: await User.findById(user._id).select('-password -refreshToken'), 
    message: `Đã ${user.status === 'locked' ? 'khóa' : 'mở khóa'} tài khoản` 
  };
};

module.exports = { getAll, getById, create, update, remove, toggleStatus };
