const mongoose = require('mongoose');

const shiftAssignmentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee is required'],
    },
    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
      required: [true, 'Shift is required'],
    },
    // The specific calendar date for this assignment (time part should be midnight UTC)
    date: {
      type: Date,
      required: [true, 'Assignment date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    // Manager/owner who assigned; null = employee self-registered
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// ─── Compound Unique Index: one employee per shift per day ────────────────────
shiftAssignmentSchema.index({ employee: 1, shift: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('ShiftAssignment', shiftAssignmentSchema);
