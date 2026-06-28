const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Bonus = sequelize.define(
  'Bonus',
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
    // Khóa ngoại liên kết tới User (nhân viên nhận thưởng/phạt)
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 12,
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.NUMERIC(14, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: 'Amount must be positive' },
      },
    },
    type: {
      type: DataTypes.ENUM('bonus', 'penalty'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Reason is required' },
      },
    },
    // Khóa ngoại liên kết tới User (người tạo)
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        fields: ['employeeId', 'year', 'month'],
      },
    ],
  }
);

// Ghi đè toJSON để đảm bảo virtual _id luôn có mặt
Bonus.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

module.exports = Bonus;
