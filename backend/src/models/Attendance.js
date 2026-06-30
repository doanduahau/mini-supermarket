const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Model chính: Attendance
const Attendance = sequelize.define(
  'Attendance',
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
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shiftId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    note: {
      type: DataTypes.TEXT,
    },
    recordedById: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    actualHours: {
      type: DataTypes.NUMERIC(6, 2),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['employeeId', 'shiftId', 'date'],
      },
      { fields: ['employeeId', 'date'] },
      { fields: ['date'] },
    ],
  }
);

Attendance.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

// Model phụ: AttendanceEditHistory (thay thế cho mảng editHistory của Mongoose)
const AttendanceEditHistory = sequelize.define(
  'AttendanceEditHistory',
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
    attendanceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updatedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    oldCheckIn: {
      type: DataTypes.DATE,
    },
    oldCheckOut: {
      type: DataTypes.DATE,
    },
    newCheckIn: {
      type: DataTypes.DATE,
    },
    newCheckOut: {
      type: DataTypes.DATE,
    },
    note: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true, // updatedAt sẽ tự động được sinh ra
  }
);

AttendanceEditHistory.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

module.exports = { Attendance, AttendanceEditHistory };
