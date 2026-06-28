const { Op } = require('sequelize');
const { Bonus, Payroll, User } = require('../models');

const getAll = async ({ employeeId, month, year, type, page = 1, limit = 20 }) => {
  const where = {};
  if (employeeId) where.employeeId = employeeId;
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);
  if (type) where.type = type;

  const skip = (page - 1) * limit;

  const allFiltered = await Bonus.findAll({ where });
  let bonusTotal = 0;
  let penaltyTotal = 0;
  allFiltered.forEach(b => {
    if (b.type === 'bonus') bonusTotal += Number(b.amount);
    else if (b.type === 'penalty') penaltyTotal += Number(b.amount);
  });

  const { rows, count } = await Bonus.findAndCountAll({
    where,
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'role'] },
      { model: User, as: 'createdBy', attributes: ['id', '_id', 'fullName'] }
    ],
    order: [['year', 'DESC'], ['month', 'DESC'], ['createdAt', 'DESC']],
    offset: skip,
    limit,
  });

  return {
    bonuses: rows.map(r => r.toJSON()),
    summary: {
      bonusTotal,
      penaltyTotal,
      netTotal: bonusTotal - penaltyTotal
    },
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    }
  };
};

const getByEmployee = async (employeeId, { month, year }) => {
  const where = { employeeId };
  if (month) where.month = parseInt(month);
  if (year) where.year = parseInt(year);

  const bonuses = await Bonus.findAll({
    where,
    include: [{ model: User, as: 'createdBy', attributes: ['id', '_id', 'fullName'] }],
    order: [['year', 'DESC'], ['month', 'DESC'], ['createdAt', 'DESC']]
  });

  let bonusTotal = 0;
  let penaltyTotal = 0;
  bonuses.forEach(b => {
    if (b.type === 'bonus') bonusTotal += Number(b.amount);
    else if (b.type === 'penalty') penaltyTotal += Number(b.amount);
  });

  return {
    bonuses: bonuses.map(b => b.toJSON()),
    summary: {
      bonusTotal,
      penaltyTotal,
      netTotal: bonusTotal - penaltyTotal
    }
  };
};

const checkPayrollConfirmed = async (employeeId, month, year) => {
  const payroll = await Payroll.findOne({ 
    where: { employeeId, month, year, status: 'confirmed' } 
  });
  if (payroll) {
    throw Object.assign(new Error('Bảng lương tháng này đã được chốt, không thể thêm/sửa thưởng phạt'), { statusCode: 400 });
  }
};

const create = async (data, createdBy) => {
  const { employeeId, month, year, amount, type, reason } = data;

  const user = await User.findByPk(employeeId);
  if (!user || user.status !== 'active') {
    throw Object.assign(new Error('Nhân viên không tồn tại hoặc không hoạt động'), { statusCode: 400 });
  }

  const inputDate = new Date(year, month - 1);
  const now = new Date();
  if (inputDate > now && (inputDate.getFullYear() > now.getFullYear() || inputDate.getMonth() > now.getMonth())) {
    throw Object.assign(new Error('Không thể tạo thưởng/phạt cho tháng tương lai'), { statusCode: 400 });
  }

  if (amount <= 0) {
    throw Object.assign(new Error('Số tiền phải lớn hơn 0'), { statusCode: 400 });
  }

  await checkPayrollConfirmed(employeeId, month, year);

  const bonus = await Bonus.create({
    employeeId,
    month,
    year,
    amount,
    type,
    reason,
    createdById: createdBy
  });

  const fetched = await Bonus.findByPk(bonus.id, {
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'role'] },
      { model: User, as: 'createdBy', attributes: ['id', '_id', 'fullName'] }
    ]
  });

  return fetched.toJSON();
};

const update = async (id, { amount, reason }, updatedBy) => {
  const bonus = await Bonus.findByPk(id);
  if (!bonus) throw Object.assign(new Error('Không tìm thấy khoản thưởng/phạt'), { statusCode: 404 });

  if (amount !== undefined && amount <= 0) {
    throw Object.assign(new Error('Số tiền phải lớn hơn 0'), { statusCode: 400 });
  }

  await checkPayrollConfirmed(bonus.employeeId, bonus.month, bonus.year);

  const updates = {};
  if (amount !== undefined) updates.amount = amount;
  if (reason !== undefined) updates.reason = reason;
  
  await Bonus.update(updates, { where: { id } });
  
  const fetched = await Bonus.findByPk(id, {
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'role'] },
      { model: User, as: 'createdBy', attributes: ['id', '_id', 'fullName'] }
    ]
  });
  return fetched.toJSON();
};

const remove = async (id, deletedBy) => {
  const bonus = await Bonus.findByPk(id);
  if (!bonus) throw Object.assign(new Error('Không tìm thấy khoản thưởng/phạt'), { statusCode: 404 });

  await checkPayrollConfirmed(bonus.employeeId, bonus.month, bonus.year);

  await Bonus.destroy({ where: { id } });
  return { message: 'Đã xóa khoản thưởng/phạt' };
};

const getSummaryByMonth = async (month, year) => {
  const m = parseInt(month);
  const y = parseInt(year);

  const bonuses = await Bonus.findAll({
    where: { month: m, year: y },
    include: [{ model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'role'] }]
  });

  const map = {};
  bonuses.forEach(b => {
    const empId = b.employeeId.toString();
    if (!map[empId]) {
      map[empId] = {
        employee: {
          _id: b.employee.id,
          fullName: b.employee.fullName,
          role: b.employee.role
        },
        bonusTotal: 0,
        penaltyTotal: 0,
        net: 0
      };
    }
    
    if (b.type === 'bonus') {
      map[empId].bonusTotal += Number(b.amount);
    } else {
      map[empId].penaltyTotal += Number(b.amount);
    }
    map[empId].net = map[empId].bonusTotal - map[empId].penaltyTotal;
  });

  return Object.values(map);
};

module.exports = { getAll, getByEmployee, create, update, remove, getSummaryByMonth };
