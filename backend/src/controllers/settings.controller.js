const SettingsService = require('../services/settings.service');
const { successResponse } = require('../utils/response');

const getSettings = async (req, res, next) => {
  try {
    const settings = await SettingsService.getSettings();
    return successResponse(res, settings, 'Lấy cài đặt thành công');
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const settings = await SettingsService.updateSettings(req.body);
    return successResponse(res, settings, 'Cập nhật cài đặt thành công');
  } catch (err) {
    next(err);
  }
};

const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await SettingsService.getPublicSettings();
    return successResponse(res, settings, 'Lấy cài đặt thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getPublicSettings
};
