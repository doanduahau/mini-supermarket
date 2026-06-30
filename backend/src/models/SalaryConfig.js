const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SalaryConfig = sequelize.define(
  'SalaryConfig',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Thuộc tính ảo _id để tương thích ngược với Frontend
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.id;
      },
    },
    role: {
      type: DataTypes.ENUM('supermarket_owner', 'shift_manager', 'employee'),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Role is required' },
      },
    },
    hourlyRate: {
      type: DataTypes.NUMERIC(12, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Hourly rate cannot be negative' },
      },
    },
    effectiveFrom: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // Khóa ngoại liên kết tới bảng User (người tạo)
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['role', 'effectiveFrom'],
      },
    ],
  }
);

// Ghi đè toJSON để đảm bảo virtual _id luôn có mặt
SalaryConfig.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

module.exports = SalaryConfig;
