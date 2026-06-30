const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const LeaveRequest = sequelize.define(
  'LeaveRequest',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shiftAssignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    reviewedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reviewNote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

LeaveRequest.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

module.exports = LeaveRequest;
