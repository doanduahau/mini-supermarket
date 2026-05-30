const { Payroll, Attendance, User, Shift, ShiftAssignment } = require('../models');
const PayrollService = require('./payroll.service');

const getSalarySummary = async (month, year) => {
  const m = parseInt(month);
  const y = parseInt(year);

  let payrolls = await Payroll.find({ month: m, year: y }).populate('employee', 'role fullName');
  
  if (payrolls.length === 0) {
    const users = await User.find({ status: 'active' });
    const calculated = await Promise.allSettled(
      users.map(u => PayrollService.previewPayroll(u._id, m, y))
    );
    payrolls = calculated
      .filter(res => res.status === 'fulfilled')
      .map(res => {
        const value = res.value;
        const u = users.find(user => user._id.toString() === value.employee.toString());
        return {
          ...value,
          employee: { role: u.role, fullName: u.fullName }
        };
      });
  }

  let totalHours = 0;
  let totalBaseSalary = 0;
  let totalBonus = 0;
  let totalPenalty = 0;
  let totalNetSalary = 0;
  const roleGroups = {};
  
  const sorted = [...payrolls].sort((a, b) => b.netSalary - a.netSalary);
  const topEarners = sorted.slice(0, 3).map(p => ({
    fullName: p.employee.fullName,
    netSalary: p.netSalary
  }));

  payrolls.forEach(p => {
    totalHours += p.totalHours;
    totalBaseSalary += p.baseSalary;
    totalBonus += p.bonusTotal;
    totalPenalty += p.penaltyTotal;
    totalNetSalary += p.netSalary;
    
    const role = p.employee.role;
    if (!roleGroups[role]) {
      roleGroups[role] = { role, count: 0, totalHours: 0, totalNetSalary: 0 };
    }
    roleGroups[role].count++;
    roleGroups[role].totalHours += p.totalHours;
    roleGroups[role].totalNetSalary += p.netSalary;
  });

  return {
    month: m,
    year: y,
    totalEmployees: payrolls.length,
    totalHours: Math.round(totalHours * 100) / 100,
    totalBaseSalary,
    totalBonus,
    totalPenalty,
    totalNetSalary,
    byRole: Object.values(roleGroups),
    topEarners
  };
};

const getAttendanceSummary = async (month, year) => {
  const m = parseInt(month);
  const y = parseInt(year);

  const startDate = new Date(Date.UTC(y, m - 1, 1));
  const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

  const agg = await Attendance.aggregate([
    { $match: { date: { $gte: startDate, $lte: endDate } } },
    {
      $lookup: {
        from: 'shifts',
        localField: 'shift',
        foreignField: '_id',
        as: 'shiftInfo'
      }
    },
    { $unwind: '$shiftInfo' },
    {
      $group: {
        _id: '$employee',
        totalDays: { $sum: 1 },
        presentDays: {
          $sum: { $cond: [{ $ifNull: ['$checkIn', false] }, 1, 0] }
        },
        totalHours: { $sum: { $ifNull: ['$actualHours', 0] } },
        docs: { $push: '$$ROOT' }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' }
  ]);

  let totalWorkingDays = 0;
  let totalPresent = 0;
  let totalAbsentAll = 0;

  const employees = agg.map(item => {
    let lateDays = 0;
    let absentDays = item.totalDays - item.presentDays;

    item.docs.forEach(doc => {
      if (doc.checkIn) {
        const shiftStartStr = doc.shiftInfo.startTime;
        if (shiftStartStr) {
          const [sh, sm] = shiftStartStr.split(':').map(Number);
          const checkIn = new Date(doc.checkIn);
          const shiftStartMins = sh * 60 + sm;
          const checkInMins = checkIn.getUTCHours() * 60 + checkIn.getUTCMinutes();
          if (checkInMins > shiftStartMins + 15) {
            lateDays++;
          }
        }
      }
    });

    totalWorkingDays += item.totalDays;
    totalPresent += item.presentDays;
    totalAbsentAll += absentDays;

    return {
      employee: {
        _id: item.userInfo._id,
        fullName: item.userInfo.fullName,
        role: item.userInfo.role
      },
      totalDays: item.totalDays,
      presentDays: item.presentDays,
      absentDays,
      lateDays,
      totalHours: Math.round(item.totalHours * 100) / 100,
      avgHoursPerDay: item.presentDays > 0 ? Math.round((item.totalHours / item.presentDays) * 100) / 100 : 0
    };
  });

  const avgAttendanceRate = totalWorkingDays > 0 ? Math.round((totalPresent / totalWorkingDays) * 100) : 0;

  return {
    employees,
    summary: {
      totalWorkingDays,
      avgAttendanceRate,
      totalAbsent: totalAbsentAll
    }
  };
};

const getHeadcountReport = async () => {
  const users = await User.find({});
  
  let total = 0;
  let active = 0;
  let locked = 0;
  const roleGroups = {};
  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let newThisMonth = 0;

  users.forEach(u => {
    total++;
    if (u.status === 'active') active++;
    else locked++;

    if (!roleGroups[u.role]) {
      roleGroups[u.role] = { role: u.role, total: 0, active: 0, locked: 0 };
    }
    roleGroups[u.role].total++;
    if (u.status === 'active') roleGroups[u.role].active++;
    else roleGroups[u.role].locked++;

    if (new Date(u.createdAt) >= currentMonthStart) {
      newThisMonth++;
    }
  });

  const recentJoined = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(u => ({ fullName: u.fullName, role: u.role, startDate: u.createdAt }));

  return {
    total,
    active,
    locked,
    byRole: Object.values(roleGroups),
    newThisMonth,
    recentJoined
  };
};

const getShiftUtilization = async (month, year) => {
  const m = parseInt(month);
  const y = parseInt(year);

  const startDate = new Date(Date.UTC(y, m - 1, 1));
  const endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  
  const daysInMonth = new Date(y, m, 0).getDate();

  const shifts = await Shift.find({});
  const result = [];

  for (const shift of shifts) {
    const totalSlots = shift.maxEmployees * daysInMonth;

    const assignedAgg = await ShiftAssignment.aggregate([
      { 
        $match: { 
          shift: shift._id, 
          date: { $gte: startDate, $lte: endDate }, 
          status: 'approved' 
        } 
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: 1 } }
    ]);

    let totalAssigned = 0;
    assignedAgg.forEach(a => totalAssigned += a.count);

    const utilizationRate = totalSlots > 0 ? Math.round((totalAssigned / totalSlots) * 100) : 0;

    let leastStaffedDate = null;
    if (assignedAgg.length > 0) {
      if (assignedAgg.length < daysInMonth) {
         leastStaffedDate = "Có ngày trống 100%";
      } else {
         leastStaffedDate = assignedAgg[0]._id.toISOString().split('T')[0] + ` (${assignedAgg[0].count} người)`;
      }
    } else {
      leastStaffedDate = "Tất cả các ngày đều trống";
    }

    result.push({
      shift: { name: shift.name, startTime: shift.startTime, endTime: shift.endTime },
      utilizationRate,
      totalAssigned,
      totalSlots,
      leastStaffedDate
    });
  }

  return result;
};

module.exports = { getSalarySummary, getAttendanceSummary, getHeadcountReport, getShiftUtilization };
