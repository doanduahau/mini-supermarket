/**
 * seed.js — khởi tạo dữ liệu mẫu cho hệ thống nhân sự siêu thị mini.
 * Chạy: npm run seed
 */

require('dotenv').config();
const { sequelize } = require('./db');
const { User, Shift, SalaryConfig } = require('../models');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const log = (msg) => console.log(msg);
const sep = () => log('─'.repeat(52));

// ─── Main Seed Function ───────────────────────────────────────────────────────

const seed = async () => {
  // 0. Kết nối PostgreSQL
  await sequelize.authenticate();
  const dbName = process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1].split('/')[0] : 'localhost';
  log(`\n✅ Database connected: ${dbName}`);
  
  // Sync schema trước khi seed (tạo bảng nếu chưa có)
  await sequelize.sync({ alter: false });
  log('✅ Schema synced\n');

  sep();
  log('🌱 Bắt đầu seed dữ liệu...\n');

  // ── Bước 1: Xóa sạch (theo thứ tự ngược để tránh lỗi ref) ────────────────
  log('🗑️  Xóa dữ liệu cũ...');

  await SalaryConfig.destroy({ where: {}, truncate: true, cascade: true });
  await Shift.destroy({ where: {}, truncate: true, cascade: true });
  await User.destroy({ where: {}, truncate: true, cascade: true });
  log('   ✅ Đã xóa toàn bộ tables.\n');

  // ── Bước 2: Seed Users ────────────────────────────────────────────────────
  log('👤 Seeding users...');
  const usersData = [
    { fullName: 'Nguyễn Văn Chủ', email: 'owner@supermarket.com', password: 'Admin@123', role: 'supermarket_owner', phone: '0901000001' },
    { fullName: 'Trần Thị Quản', email: 'manager1@supermarket.com', password: 'Manager@123', role: 'shift_manager', phone: '0901000002' },
    { fullName: 'Lê Văn Lý', email: 'manager2@supermarket.com', password: 'Manager@123', role: 'shift_manager', phone: '0901000003' },
    { fullName: 'Phạm Thị Nhân', email: 'nv1@supermarket.com', password: 'Employee@123', role: 'employee', phone: '0901000004' },
    { fullName: 'Hoàng Văn Viên', email: 'nv2@supermarket.com', password: 'Employee@123', role: 'employee', phone: '0901000005' },
    { fullName: 'Vũ Thị Nhân Viên', email: 'nv3@supermarket.com', password: 'Employee@123', role: 'employee', phone: '0901000006' },
  ];

  const createdUsers = [];
  for (const data of usersData) {
    const user = await User.create(data);
    createdUsers.push(user);
    log(`   + ${user.role.padEnd(18)} ${user.email}`);
  }
  log(`   ✅ ${createdUsers.length} users đã được tạo.\n`);

  const owner = createdUsers[0];

  // ── Bước 3: Seed Shifts ───────────────────────────────────────────────────
  log('🕐 Seeding shifts...');
  const shiftsData = [
    { name: 'Ca sáng', startTime: '07:00', endTime: '13:00', maxEmployees: 3, description: 'Ca làm việc buổi sáng' },
    { name: 'Ca chiều', startTime: '13:00', endTime: '19:00', maxEmployees: 3, description: 'Ca làm việc buổi chiều' },
    { name: 'Ca tối', startTime: '19:00', endTime: '23:00', maxEmployees: 2, description: 'Ca làm việc buổi tối' },
  ];
  const createdShifts = await Shift.bulkCreate(shiftsData, { returning: true });
  createdShifts.forEach((s) => log(`   + ${s.name} (${s.startTime}–${s.endTime}, tối đa ${s.maxEmployees} NV)`));
  log(`   ✅ ${createdShifts.length} ca làm việc đã được tạo.\n`);

  // ── Bước 4: Seed SalaryConfig ─────────────────────────────────────────────
  log('💰 Seeding salary configs...');
  const salaryData = [
    { role: 'employee', hourlyRate: 25000, createdById: owner.id },
    { role: 'shift_manager', hourlyRate: 40000, createdById: owner.id },
    { role: 'supermarket_owner', hourlyRate: 60000, createdById: owner.id },
  ];
  const createdSalary = await SalaryConfig.bulkCreate(salaryData);
  createdSalary.forEach((s) => log(`   + ${s.role.padEnd(20)} ${s.hourlyRate.toLocaleString('vi-VN')} VNĐ/giờ`));
  log(`   ✅ ${createdSalary.length} cấu hình lương đã được tạo.\n`);

  // ── Tổng kết ──────────────────────────────────────────────────────────────
  sep();
  log('🎉 Seed hoàn tất!');
  sep();
  log(`  👤 Users             : ${createdUsers.length}`);
  log(`  🕐 Shifts            : ${createdShifts.length}`);
  log(`  💰 Salary configs    : ${createdSalary.length}`);

  sep();
  log('\n📌 Kiểm tra dữ liệu:');
  log('  GET http://localhost:5000/api/users');

  await sequelize.close();
  log('🔌 Đã ngắt kết nối DB.\n');
  process.exit(0);
};

// ─── Run ──────────────────────────────────────────────────────────────────────
seed().catch((err) => {
  console.error('\n❌ Seed thất bại:', err.message);
  console.error(err.stack);
  sequelize.close();
  process.exit(1);
});
