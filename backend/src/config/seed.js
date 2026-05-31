/**
 * seed.js — khởi tạo dữ liệu mẫu cho hệ thống nhân sự siêu thị mini.
 * Chạy: npm run seed
 */

require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');
const { User, Shift, ShiftAssignment, Attendance, SalaryConfig } = require('../models');

// Force Google DNS — tránh VMware/ISP chặn DNS SRV lookup của MongoDB Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);


// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Trả về ngày cách hôm nay n ngày (00:00:00 giờ local) */
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Tạo Date từ một ngày cơ sở + chuỗi "HH:MM" + offset phút.
 * JS tự xử lý overflow/underflow phút (ví dụ: "23:00" - 3 phút → 22:57).
 */
const makeDateTime = (baseDate, timeStr, offsetMinutes = 0) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const d = new Date(baseDate);
  d.setHours(hours, minutes + offsetMinutes, 0, 0);
  return d;
};

/** Số nguyên ngẫu nhiên trong khoảng [min, max] */
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const log = (msg) => console.log(msg);
const sep = () => log('─'.repeat(52));

// ─── Main Seed Function ───────────────────────────────────────────────────────

const seed = async () => {
  // 0. Kết nối MongoDB
  await mongoose.connect(process.env.MONGODB_URI);
  log(`\n✅ MongoDB connected: ${mongoose.connection.host}`);
  sep();
  log('🌱 Bắt đầu seed dữ liệu...\n');

  // ── Bước 1: Xóa sạch (theo thứ tự ngược để tránh lỗi ref) ────────────────
  log('🗑️  Xóa dữ liệu cũ...');
  await Attendance.deleteMany({});
  await ShiftAssignment.deleteMany({});
  await SalaryConfig.deleteMany({});
  await Shift.deleteMany({});
  await User.deleteMany({});
  log('   ✅ Đã xóa toàn bộ collections.\n');

  // ── Bước 2: Seed Users ────────────────────────────────────────────────────
  log('👤 Seeding users...');
  const usersData = [
    {
      fullName: 'Nguyễn Văn Chủ',
      email: 'owner@supermarket.com',
      password: 'Admin@123',
      role: 'supermarket_owner',
      phone: '0901000001',
    },
    {
      fullName: 'Trần Thị Quản',
      email: 'manager1@supermarket.com',
      password: 'Manager@123',
      role: 'shift_manager',
      phone: '0901000002',
    },
    {
      fullName: 'Lê Văn Lý',
      email: 'manager2@supermarket.com',
      password: 'Manager@123',
      role: 'shift_manager',
      phone: '0901000003',
    },
    {
      fullName: 'Phạm Thị Nhân',
      email: 'nv1@supermarket.com',
      password: 'Employee@123',
      role: 'employee',
      phone: '0901000004',
    },
    {
      fullName: 'Hoàng Văn Viên',
      email: 'nv2@supermarket.com',
      password: 'Employee@123',
      role: 'employee',
      phone: '0901000005',
    },
    {
      fullName: 'Vũ Thị Nhân Viên',
      email: 'nv3@supermarket.com',
      password: 'Employee@123',
      role: 'employee',
      phone: '0901000006',
    },
  ];

  // Lưu từng user riêng để kích hoạt pre-save hook (bcrypt hash password)
  const createdUsers = [];
  for (const data of usersData) {
    const user = await new User(data).save();
    createdUsers.push(user);
    log(`   + ${user.role.padEnd(18)} ${user.email}`);
  }
  log(`   ✅ ${createdUsers.length} users đã được tạo.\n`);

  const [owner, manager1, , nv1, nv2, nv3] = createdUsers;
  const employees = [nv1, nv2, nv3];

  // ── Bước 3: Seed Shifts ───────────────────────────────────────────────────
  log('🕐 Seeding shifts...');
  const shiftsData = [
    { name: 'Ca sáng', startTime: '07:00', endTime: '13:00', maxEmployees: 3, description: 'Ca làm việc buổi sáng' },
    { name: 'Ca chiều', startTime: '13:00', endTime: '19:00', maxEmployees: 3, description: 'Ca làm việc buổi chiều' },
    { name: 'Ca tối', startTime: '19:00', endTime: '23:00', maxEmployees: 2, description: 'Ca làm việc buổi tối' },
  ];
  const createdShifts = await Shift.insertMany(shiftsData);
  const [caSang, caChieu] = createdShifts;
  createdShifts.forEach((s) =>
    log(`   + ${s.name} (${s.startTime}–${s.endTime}, tối đa ${s.maxEmployees} NV)`)
  );
  log(`   ✅ ${createdShifts.length} ca làm việc đã được tạo.\n`);

  // ── Bước 4: Seed SalaryConfig ─────────────────────────────────────────────
  log('💰 Seeding salary configs...');
  const salaryData = [
    { role: 'employee', hourlyRate: 25000, createdBy: owner._id },
    { role: 'shift_manager', hourlyRate: 40000, createdBy: owner._id },
    { role: 'supermarket_owner', hourlyRate: 60000, createdBy: owner._id },
  ];
  const createdSalary = await SalaryConfig.insertMany(salaryData);
  createdSalary.forEach((s) =>
    log(`   + ${s.role.padEnd(20)} ${s.hourlyRate.toLocaleString('vi-VN')} VNĐ/giờ`)
  );
  log(`   ✅ ${createdSalary.length} cấu hình lương đã được tạo.\n`);

  // ── Bước 5: ShiftAssignments + Attendance ─────────────────────────────────
  // 3 NV × 5 ngày (hôm nay - 4 → hôm nay) = 15 bản ghi mỗi loại
  // Pattern xen kẽ Ca sáng / Ca chiều theo từng NV
  log('📅 Seeding shift assignments & attendance...');

  const shiftPattern = [
    [caSang, caChieu, caSang, caChieu, caSang],   // nv1
    [caChieu, caSang, caChieu, caSang, caChieu],  // nv2
    [caSang, caChieu, caSang, caChieu, caSang],   // nv3
  ];

  const assignmentDocs = [];
  const attendanceDocs = [];

  // dayOffset: 4 → 0 (từ xa nhất → hôm nay)
  for (let dayOffset = 4; dayOffset >= 0; dayOffset--) {
    const workDate = daysAgo(dayOffset);
    const dayIndex = 4 - dayOffset; // 0–4

    for (let empIdx = 0; empIdx < employees.length; empIdx++) {
      const employee = employees[empIdx];
      const shift = shiftPattern[empIdx][dayIndex];

      assignmentDocs.push({
        employee: employee._id,
        shift: shift._id,
        date: workDate,
        status: 'approved',
        assignedBy: manager1._id,
        note: `Phân công tự động (seed)`,
      });

      // checkIn  = giờ bắt đầu + 0–10 phút trễ
      // checkOut = giờ kết thúc - 0–5 phút sớm
      const checkIn = makeDateTime(workDate, shift.startTime, randInt(0, 10));
      const checkOut = makeDateTime(workDate, shift.endTime, -randInt(0, 5));

      attendanceDocs.push({
        employee: employee._id,
        shift: shift._id,
        date: workDate,
        checkIn,
        checkOut,
        recordedBy: manager1._id,
        note: `Chấm công tự động (seed)`,
      });
    }
  }

  await ShiftAssignment.insertMany(assignmentDocs);
  log(`   ✅ ${assignmentDocs.length} shift assignments đã được tạo.`);

  await Attendance.insertMany(attendanceDocs);
  log(`   ✅ ${attendanceDocs.length} attendance records đã được tạo.\n`);

  // ── Tổng kết ──────────────────────────────────────────────────────────────
  sep();
  log('🎉 Seed hoàn tất!');
  sep();
  log(`  👤 Users             : ${createdUsers.length}`);
  log(`  🕐 Shifts            : ${createdShifts.length}`);
  log(`  💰 Salary configs    : ${createdSalary.length}`);
  log(`  📅 Shift assignments : ${assignmentDocs.length}`);
  log(`  ✅ Attendance        : ${attendanceDocs.length}`);
  sep();
  log('\n📌 Kiểm tra dữ liệu:');
  log('  GET http://localhost:5000/api/users');
  log('  GET http://localhost:5000/api/attendance');
  log('  GET http://localhost:5000/api/shift-assignments\n');

  await mongoose.disconnect();
  log('🔌 Đã ngắt kết nối MongoDB.\n');
  process.exit(0);
};

// ─── Run ──────────────────────────────────────────────────────────────────────
seed().catch((err) => {
  console.error('\n❌ Seed thất bại:', err.message);
  console.error(err.stack);
  mongoose.disconnect();
  process.exit(1);
});
