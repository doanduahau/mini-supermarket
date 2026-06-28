const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Setting = sequelize.define(
  'Setting',
  {
    key: {
      type: DataTypes.STRING,
      primaryKey: true, // Sử dụng key làm khóa chính
      allowNull: false,
    },
    value: {
      type: DataTypes.JSONB, // Sử dụng JSONB tối ưu thay cho Mixed của Mongoose
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Setting;
