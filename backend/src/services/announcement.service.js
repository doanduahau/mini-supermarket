const { Announcement } = require('../models');

const getAll = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  
  const announcements = await Announcement.find(query)
    .populate('author', 'fullName role avatar');
  const priorityMap = {
    urgent: 3,
    high: 2,
    normal: 1
  };

  announcements.sort((a, b) => {
    if (priorityMap[b.priority] !== priorityMap[a.priority]) {
      return priorityMap[b.priority] - priorityMap[a.priority];
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return announcements;
};

const create = async (data, authorId) => {
  const announcement = await Announcement.create({
    ...data,
    author: authorId,
  });
  return announcement;
};

const update = async (id, data) => {
  const announcement = await Announcement.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!announcement) {
    throw Object.assign(new Error('Không tìm thấy thông báo'), { statusCode: 404 });
  }
  return announcement;
};

const remove = async (id) => {
  const announcement = await Announcement.findByIdAndDelete(id);
  if (!announcement) {
    throw Object.assign(new Error('Không tìm thấy thông báo'), { statusCode: 404 });
  }
  return announcement;
};

module.exports = { getAll, create, update, remove };
