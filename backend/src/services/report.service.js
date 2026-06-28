const { Op } = require('sequelize');
const { Payroll, Attendance, User, Shift, ShiftAssignment } = require('../models');
const PayrollService = require('./payroll.service');

const getSalarySummary = async (month, year) => {
  const m = parseInt(month);
  const y = parseInt(year);

  let payrolls = await Payroll.findAll({
    where: { month: m, year: y },
    include: [{ model: User, as: 'employee', attributes: ['id', '_id', 'role', 'fullName'] }]
  });
  
  if (payrolls.length === 0) {
    const users = await User.findAll({ where: { status: 'active' } });
    const calculated = await Promise.allSettled(
      users.map(u => PayrollService.previewPayroll(u.id, m, y))
    );
    const tempPayrolls = [];
    calculated.forEach((res) => {
      if (res.status === 'fulfilled') {
        const value = res.value;
        const u = users.find(user => user.id === value.employeeId);
        tempPayrolls.push({
          ...value,
          employee: { role: u.role, fullName: u.fullName }
        });
      }
    });
    payrolls = tempPayrolls;
  } else {
    payrolls = payrolls.map(p => p.toJSON());
  }

  let totalHours = 0;
  let totalBaseSalary = 0;
  let totalBonus = 0;
  let totalPenalty = 0;
  let totalNetSalary = 0;
  const roleGroups = {};
  
  const sorted = [...payrolls].sort((a, b) => Number(b.netSalary) - Number(a.netSalary));
  const topEarners = sorted.slice(0, 3).map(p => ({
    fullName: p.employee.fullName,
    netSalary: Number(p.netSalary)
  }));

  payrolls.forEach(p => {
    const hours = Number(p.totalHours);
    const base = Number(p.baseSalary);
    const bonus = Number(p.bonusTotal);
    const penalty = Number(p.penaltyTotal);
    const net = Number(p.netSalary);

    totalHours += hours;
    totalBaseSalary += base;
    totalBonus += bonus;
    totalPenalty += penalty;
    totalNetSalary += net;
    
    const role = p.employee.role;
    if (!roleGroups[role]) {
      roleGroups[role] = { role, count: 0, totalHours: 0, totalNetSalary: 0 };
    }
    roleGroups[role].count++;
    roleGroups[role].totalHours += hours;
    roleGroups[role].totalNetSalary += net;
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

  const attendances = await Attendance.findAll({
    where: { date: { [Op.between]: [startDate, endDate] } },
    include: [
      { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'role'] },
      { model: Shift, as: 'shift', attributes: ['startTime'] }
    ]
  });

  const empMap = {};
  
  attendances.forEach(att => {
    const empId = att.employeeId;
    // Bỏ qua nếu không tìm thấy thông tin nhân viên
    if (!att.employee) return;
    
    if (!empMap[empId]) {
      empMap[empId] = {
        employee: att.employee.toJSON(),
        totalDays: 0,
        presentDays: 0,
        totalHours: 0,
        lateDays: 0
      };
    }
    const empData = empMap[empId];
    empData.totalDays++;
    
    if (att.checkIn) {
      empData.presentDays++;
      if (att.actualHours) {
        empData.totalHours += Number(att.actualHours);
      }
      
      const shiftStartStr = att.shift ? att.shift.startTime : null;
      if (shiftStartStr) {
        const [sh, sm] = shiftStartStr.split(':').map(Number);
        const checkIn = new Date(att.checkIn);
        const shiftStartMins = sh * 60 + sm;
        const checkInMins = checkIn.getUTCHours() * 60 + checkIn.getUTCMinutes();
        if (checkInMins > shiftStartMins + 15) {
          empData.lateDays++;
        }
      }
    }
  });

  let totalWorkingDays = 0;
  let totalPresent = 0;
  let totalAbsentAll = 0;

  const employees = Object.values(empMap).map(item => {
    const absentDays = item.totalDays - item.presentDays;
    
    totalWorkingDays += item.totalDays;
    totalPresent += item.presentDays;
    totalAbsentAll += absentDays;

    return {
      employee: item.employee,
      totalDays: item.totalDays,
      presentDays: item.presentDays,
      absentDays,
      lateDays: item.lateDays,
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
  const users = await User.findAll({});
  
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

  const shifts = await Shift.findAll({});
  const result = [];

  for (const shift of shifts) {
    const totalSlots = shift.maxEmployees * daysInMonth;

    const assignments = await ShiftAssignment.findAll({
      where: {
        shiftId: shift.id,
        date: { [Op.between]: [startDate, endDate] },
        status: 'approved'
      }
    });

    const dateCountMap = {};
    assignments.forEach(a => {
      const dStr = typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0];
      dateCountMap[dStr] = (dateCountMap[dStr] || 0) + 1;
    });

    const assignedDates = Object.keys(dateCountMap).map(date => ({
      date,
      count: dateCountMap[date]
    })).sort((a, b) => a.count - b.count);

    let totalAssigned = assignments.length;
    const utilizationRate = totalSlots > 0 ? Math.round((totalAssigned / totalSlots) * 100) : 0;

    let leastStaffedDate = null;
    if (assignedDates.length > 0) {
      if (assignedDates.length < daysInMonth) {
         leastStaffedDate = "Có ngày trống 100%";
      } else {
         leastStaffedDate = assignedDates[0].date + ` (${assignedDates[0].count} người)`;
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
