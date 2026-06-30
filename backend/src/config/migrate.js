require('dotenv').config();
const { sequelize } = require('./db');
require('../models'); // Load all models

const migrate = async () => {
  try {
    console.log('🔄 Bắt đầu chạy Migration...');
    await sequelize.authenticate();
    console.log('✅ Đã kết nối DB thành công!');
    
    // Sử dụng alter: true ĐỂ MIGRATION, server thực tế không dùng cờ này
    await sequelize.sync({ alter: true });
    
    console.log('✅ Migration hoàn tất. Schema DB đã được cập nhật.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi Migration:', error);
    process.exit(1);
  }
};

migrate();
