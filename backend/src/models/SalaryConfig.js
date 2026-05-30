const mongoose = require('mongoose');

const salaryConfigSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['supermarket_owner', 'shift_manager', 'employee'],
      required: [true, 'Role is required'],
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative'],
    },
    // The date from which this rate becomes active
    effectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// ─── Index: quickly look up latest config per role ────────────────────────────
salaryConfigSchema.index({ role: 1, effectiveFrom: -1 });

module.exports = mongoose.model('SalaryConfig', salaryConfigSchema);
