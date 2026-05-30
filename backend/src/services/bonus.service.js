const { Bonus, Payroll, User } = require('../models');

const getAll = async ({ employeeId, month, year, type, page = 1, limit = 20 }) => {
  const query = {};
  if (employeeId) query.employee = employeeId;
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);
  if (type) query.type = type;

  const skip = (page - 1) * limit;

  const allFiltered = await Bonus.find(query);
  let bonusTotal = 0;
  let penaltyTotal = 0;
  allFiltered.forEach(b => {
    if (b.type === 'bonus') bonusTotal += b.amount;
    else if (b.type === 'penalty') penaltyTotal += b.amount;
  });

  const [bonuses, total] = await Promise.all([
    Bonus.find(query)
      .populate('employee', 'fullName email role')
      .populate('createdBy', 'fullName')
      .sort({ year: -1, month: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Bonus.countDocuments(query),
  ]);

  return {
    bonuses,
    summary: {
      bonusTotal,
      penaltyTotal,
      netTotal: bonusTotal - penaltyTotal
    },
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getByEmployee = async (employeeId, { month, year }) => {
  const query = { employee: employeeId };
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);

  const bonuses = await Bonus.find(query)
    .populate('createdBy', 'fullName')
    .sort({ year: -1, month: -1, createdAt: -1 });

  let bonusTotal = 0;
  let penaltyTotal = 0;
  bonuses.forEach(b => {
    if (b.type === 'bonus') bonusTotal += b.amount;
    else if (b.type === 'penalty') penaltyTotal += b.amount;
  });

  return {
    bonuses,
    summary: {
      bonusTotal,
      penaltyTotal,
      netTotal: bonusTotal - penaltyTotal
    }
  };
};

const checkPayrollConfirmed = async (employeeId, month, year) => {
  const payroll = await Payroll.findOne({ employee: employeeId, month, year, status: 'confirmed' });
  if (payroll) {
    throw Object.assign(new Error('Bảng lương tháng này đã được chốt, không thể thêm/sửa thưởng phạt'), { statusCode: 400 });
  }
};

const create = async (data, createdBy) => {
  const { employeeId, month, year, amount, type, reason } = data;

  const user = await User.findById(employeeId);
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
    employee: employeeId,
    month,
    year,
    amount,
    type,
    reason,
    createdBy
  });

  return Bonus.findById(bonus._id).populate('employee', 'fullName email role').populate('createdBy', 'fullName');
};

const update = async (id, { amount, reason }, updatedBy) => {
  const bonus = await Bonus.findById(id);
  if (!bonus) throw Object.assign(new Error('Không tìm thấy khoản thưởng/phạt'), { statusCode: 404 });

  if (amount !== undefined && amount <= 0) {
    throw Object.assign(new Error('Số tiền phải lớn hơn 0'), { statusCode: 400 });
  }

  await checkPayrollConfirmed(bonus.employee, bonus.month, bonus.year);

  if (amount !== undefined) bonus.amount = amount;
  if (reason !== undefined) bonus.reason = reason;
  
  await bonus.save();
  return Bonus.findById(id).populate('employee', 'fullName email role').populate('createdBy', 'fullName');
};

const remove = async (id, deletedBy) => {
  const bonus = await Bonus.findById(id);
  if (!bonus) throw Object.assign(new Error('Không tìm thấy khoản thưởng/phạt'), { statusCode: 404 });

  await checkPayrollConfirmed(bonus.employee, bonus.month, bonus.year);

  await Bonus.findByIdAndDelete(id);
  return { message: 'Đã xóa khoản thưởng/phạt' };
};

const getSummaryByMonth = async (month, year) => {
  const m = parseInt(month);
  const y = parseInt(year);

  const agg = await Bonus.aggregate([
    { $match: { month: m, year: y } },
    {
      $group: {
        _id: { employee: '$employee', type: '$type' },
        total: { $sum: '$amount' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id.employee',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' }
  ]);

  const map = {};
  agg.forEach(item => {
    const empId = item._id.employee.toString();
    if (!map[empId]) {
      map[empId] = {
        employee: {
          _id: item.userInfo._id,
          fullName: item.userInfo.fullName,
          role: item.userInfo.role
        },
        bonusTotal: 0,
        penaltyTotal: 0,
        net: 0
      };
    }
    
    if (item._id.type === 'bonus') {
      map[empId].bonusTotal += item.total;
    } else {
      map[empId].penaltyTotal += item.total;
    }
    map[empId].net = map[empId].bonusTotal - map[empId].penaltyTotal;
  });

  return Object.values(map);
};

module.exports = { getAll, getByEmployee, create, update, remove, getSummaryByMonth };
