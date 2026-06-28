const { Announcement, User } = require('../models');

const getAll = async (filters = {}) => {
  const where = {};
  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }
  
  const announcements = await Announcement.findAll({
    where,
    include: [{ model: User, as: 'author', attributes: ['id', '_id', 'fullName', 'role', 'avatar'] }]
  });

  const priorityMap = {
    urgent: 3,
    high: 2,
    normal: 1
  };

  const results = announcements.map(a => a.toJSON());
  results.sort((a, b) => {
    if (priorityMap[b.priority] !== priorityMap[a.priority]) {
      return priorityMap[b.priority] - priorityMap[a.priority];
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return results;
};

const create = async (data, authorId) => {
  const announcement = await Announcement.create({
    ...data,
    authorId,
  });
  const fetched = await Announcement.findByPk(announcement.id);
  return fetched.toJSON();
};

const update = async (id, data) => {
  const [updatedCount] = await Announcement.update(data, { where: { id } });
  if (updatedCount === 0) {
    throw Object.assign(new Error('Không tìm thấy thông báo'), { statusCode: 404 });
  }
  const announcement = await Announcement.findByPk(id);
  return announcement.toJSON();
};

const remove = async (id) => {
  const announcement = await Announcement.findByPk(id);
  if (!announcement) {
    throw Object.assign(new Error('Không tìm thấy thông báo'), { statusCode: 404 });
  }
  await Announcement.destroy({ where: { id } });
  return announcement.toJSON();
};

module.exports = { getAll, create, update, remove };
