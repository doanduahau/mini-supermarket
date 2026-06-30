const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ShiftSwapRequest = sequelize.define(
  'ShiftSwapRequest',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    requesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sourceAssignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    targetAssignmentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Lịch của người nhận (nếu đổi ca 1-1). Nếu null là xin nhường ca.',
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending_receiver', 'pending_manager', 'approved', 'rejected'),
      defaultValue: 'pending_receiver',
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
    receiverNote: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    receiverReviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

ShiftSwapRequest.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  values._id = this.id;
  return values;
};

module.exports = ShiftSwapRequest;
