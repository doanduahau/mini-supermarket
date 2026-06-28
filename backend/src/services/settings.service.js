const { Op } = require('sequelize');
const { Setting } = require('../models');

const getSettings = async () => {
  const settings = await Setting.findAll();
  const result = {};
  settings.forEach(s => {
    result[s.key] = s.value;
  });
  return result;
};

const updateSettings = async (payload) => {
  const keys = Object.keys(payload);
  for (const key of keys) {
    await Setting.upsert({ key, value: payload[key] });
  }
  return getSettings();
};

const getPublicSettings = async () => {
  const keysToExpose = ['shiftRegistrationDate'];
  const settings = await Setting.findAll({ 
    where: { 
      key: { [Op.in]: keysToExpose } 
    } 
  });
  const result = {};
  settings.forEach(s => {
    result[s.key] = s.value;
  });
  return result;
};

module.exports = {
  getSettings,
  updateSettings,
  getPublicSettings
};
