const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL connected: ${sequelize.config.host}`);
    // Tự động đồng bộ schema với database (tạo bảng nếu chưa có)
    await sequelize.sync({ alter: false });
    console.log('✅ Database schema synced');
  } catch (error) {
    console.error(`❌ PostgreSQL connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
module.exports.sequelize = sequelize;
