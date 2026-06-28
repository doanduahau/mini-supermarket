const { Op } = require('sequelize');
const { SalaryConfig } = require('../models');

const getAll = async () => {
  const configs = await SalaryConfig.findAll({ order: [['effectiveFrom', 'DESC']] });

  // Group by role
  const grouped = {};
  configs.forEach(c => {
    const json = c.toJSON();
    if (!grouped[json.role]) {
      grouped[json.role] = { current: null, history: [] };
    }
    grouped[json.role].history.push(json);
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
  const config = await SalaryConfig.findOne({ 
    where: { 
      role, 
      effectiveFrom: { [Op.lte]: now } 
    },
    order: [['effectiveFrom', 'DESC']]
  });
  
  if (!config) {
    throw Object.assign(new Error(`Chưa có cấu hình lương cho role ${role}`), { statusCode: 404 });
  }
  return config.toJSON();
};

const create = async ({ role, hourlyRate, effectiveFrom }, createdBy) => {
  const effDate = effectiveFrom ? new Date(effectiveFrom) : new Date();

  const config = await SalaryConfig.create({
    role,
    hourlyRate,
    effectiveFrom: effDate,
    createdById: createdBy
  });

  return config.toJSON();
};

const getHistory = async (role) => {
  const configs = await SalaryConfig.findAll({ 
    where: { role }, 
    order: [['effectiveFrom', 'DESC']] 
  });
  return configs.map(c => c.toJSON());
};

module.exports = { getAll, getCurrentByRole, create, getHistory };
