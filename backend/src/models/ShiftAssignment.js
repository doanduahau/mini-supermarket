const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ShiftAssignment = sequelize.define(
  'ShiftAssignment',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Thuộc tính ảo _id cho Frontend
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.id;
      },
    },
    // Khóa ngoại liên kết tới bảng User (nhân viên)
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Khóa ngoại liên kết tới bảng Shift (ca làm việc)
    shiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Ngày diễn ra ca làm việc
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    // Khóa ngoại liên kết tới User (người phân công)
    assignedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['employeeId', 'shiftId', 'date'],
      },
    ],
  }
);

// Ghi đè toJSON để đảm bảo virtual _id luôn có mặt
ShiftAssignment.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

module.exports = ShiftAssignment;
