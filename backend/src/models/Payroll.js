const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    hourlyRate: {
      type: Number,
      required: true,
    },
    baseSalary: {
      type: Number,
      required: true,
    },
    bonusTotal: {
      type: Number,
      default: 0,
    },
    penaltyTotal: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'confirmed'],
      default: 'draft',
    },
    note: {
      type: String,
    },
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    confirmedAt: {
      type: Date,
    },
    breakdown: {
      attendanceRecords: [
        {
           date: Date,
    	   shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift' },
    	   shiftName: String,
    	   actualHours: Number,
   	   hourlyRate: Number,
   	   salary: Number,
   	   checkIn: Date,
   	   checkOut: Date,
        },
      ],
      bonusRecords: [
        {
          type: { type: String, enum: ['bonus', 'penalty'] },
          amount: Number,
          reason: String,
          date: Date,
        },
      ],
    },
  },
  { timestamps: true }
);

// Ensure an employee only has one payroll per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ month: 1, year: 1 });

module.exports = mongoose.model('Payroll', payrollSchema);
