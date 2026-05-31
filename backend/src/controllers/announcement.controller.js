const AnnouncementService = require('../services/announcement.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const filters = req.query;
    if (req.user.role === 'employee') {
      filters.isActive = true;
    }
    const announcements = await AnnouncementService.getAll(filters);
    return successResponse(res, announcements, 'Lấy danh sách thông báo thành công');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const announcement = await AnnouncementService.create(req.body, req.user._id);
    return successResponse(res, announcement, 'Tạo thông báo thành công', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const announcement = await AnnouncementService.update(req.params.id, req.body);
    return successResponse(res, announcement, 'Cập nhật thông báo thành công');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await AnnouncementService.remove(req.params.id);
    return successResponse(res, null, 'Xóa thông báo thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove };
