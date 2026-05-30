const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: [true, 'Attendance date is required'],
    },
    // Actual clock-in timestamp
    checkIn: {
      type: Date,
      default: null,
    },
    // Actual clock-out timestamp
    checkOut: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      trim: true,
    },
    // Manager who recorded this attendance entry
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actualHours: {
      type: Number,
      default: null,
    },
    editHistory: [
      {
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        updatedAt: {
          type: Date,
        },
        note: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ employee: 1, date: 1 });
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
