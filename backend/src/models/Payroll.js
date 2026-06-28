const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

// Model chính: Payroll
const Payroll = sequelize.define(
  'Payroll',
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
    totalHours: {
      type: DataTypes.NUMERIC(8, 2),
      defaultValue: 0,
    },
    hourlyRate: {
      type: DataTypes.NUMERIC(14, 2),
      allowNull: false,
    },
    baseSalary: {
      type: DataTypes.NUMERIC(14, 2),
      allowNull: false,
    },
    bonusTotal: {
      type: DataTypes.NUMERIC(14, 2),
      defaultValue: 0,
    },
    penaltyTotal: {
      type: DataTypes.NUMERIC(14, 2),
      defaultValue: 0,
    },
    netSalary: {
      type: DataTypes.NUMERIC(14, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'confirmed'),
      defaultValue: 'draft',
    },
    note: {
      type: DataTypes.TEXT,
    },
    confirmedById: {
      type: DataTypes.INTEGER,
    },
    confirmedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['employeeId', 'month', 'year'],
      },
      {
        fields: ['month', 'year'],
      },
    ],
  }
);

Payroll.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

// Model phụ 1: PayrollAttendanceRecord (thay thế cho mảng breakdown.attendanceRecords)
const PayrollAttendanceRecord = sequelize.define(
  'PayrollAttendanceRecord',
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
    payrollId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
    },
    shiftId: {
      type: DataTypes.INTEGER,
    },
    shiftName: {
      type: DataTypes.STRING,
    },
    actualHours: {
      type: DataTypes.NUMERIC(6, 2),
    },
    hourlyRate: {
      type: DataTypes.NUMERIC(14, 2),
    },
    salary: {
      type: DataTypes.NUMERIC(14, 2),
    },
    checkIn: {
      type: DataTypes.DATE,
    },
    checkOut: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: false,
  }
);

PayrollAttendanceRecord.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

// Model phụ 2: PayrollBonusRecord (thay thế cho mảng breakdown.bonusRecords)
const PayrollBonusRecord = sequelize.define(
  'PayrollBonusRecord',
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
    payrollId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
    },
    amount: {
      type: DataTypes.NUMERIC(14, 2),
    },
    reason: {
      type: DataTypes.TEXT,
    },
    date: {
      type: DataTypes.DATE,
    },
  },
  {
    timestamps: false,
  }
);

PayrollBonusRecord.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

module.exports = { Payroll, PayrollAttendanceRecord, PayrollBonusRecord };
