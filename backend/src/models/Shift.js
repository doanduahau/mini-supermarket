const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Shift = sequelize.define(
  'Shift',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Thuộc tính ảo (Virtual attribute) để tương thích ngược với Frontend
    _id: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.id;
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Shift name is required' },
      },
    },
    startTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        // Kiểm tra định dạng HH:MM
        is: {
          args: [/^\d{2}:\d{2}$/],
          msg: 'startTime must be in HH:MM format',
        },
      },
    },
    endTime: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        // Kiểm tra định dạng HH:MM
        is: {
          args: [/^\d{2}:\d{2}$/],
          msg: 'endTime must be in HH:MM format',
        },
      },
    },
    maxEmployees: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: 'Must allow at least 1 employee',
        },
      },
    },
    description: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
  }
);

// Ghi đè toJSON để đảm bảo virtual _id luôn xuất hiện
Shift.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

module.exports = Shift;
