const { Setting } = require('../models');

const getSettings = async () => {
  const settings = await Setting.find();
  const result = {};
  settings.forEach(s => {
    result[s.key] = s.value;
  });
  return result;
};

const updateSettings = async (payload) => {
  const keys = Object.keys(payload);
  for (const key of keys) {
    await Setting.findOneAndUpdate(
      { key },
      { value: payload[key] },
      { upsert: true, new: true }
    );
  }
  return getSettings();
};

const getPublicSettings = async () => {
  const keysToExpose = ['shiftRegistrationDate'];
  const settings = await Setting.find({ key: { $in: keysToExpose } });
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
