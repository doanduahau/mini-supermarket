const { SalaryConfig } = require('../models');

const getAll = async () => {
  const configs = await SalaryConfig.find().sort({ effectiveFrom: -1 });

  // Group by role
  const grouped = {};
  configs.forEach(c => {
    if (!grouped[c.role]) {
      grouped[c.role] = { current: null, history: [] };
    }
    grouped[c.role].history.push(c);
  });

  // Find the latest effective config
  const now = new Date();
  Object.keys(grouped).forEach(role => {
    const effectiveConfigs = grouped[role].history.filter(c => new Date(c.effectiveFrom) <= now);
    grouped[role].current = effectiveConfigs.length > 0 ? effectiveConfigs[0] : null;
  });

  return grouped;
};

const getCurrentByRole = async (role) => {
  const now = new Date();
  const config = await SalaryConfig.findOne({ role, effectiveFrom: { $lte: now } })
    .sort({ effectiveFrom: -1 });
  
  if (!config) {
    throw Object.assign(new Error(`Chưa có cấu hình lương cho role ${role}`), { statusCode: 404 });
  }
  return config;
};

const create = async ({ role, hourlyRate, effectiveFrom }, createdBy) => {
  const effDate = effectiveFrom ? new Date(effectiveFrom) : new Date();

  const config = await SalaryConfig.create({
    role,
    hourlyRate,
    effectiveFrom: effDate,
    createdBy
  });

  return config;
};

const getHistory = async (role) => {
  return SalaryConfig.find({ role }).sort({ effectiveFrom: -1 });
};

module.exports = { getAll, getCurrentByRole, create, getHistory };
