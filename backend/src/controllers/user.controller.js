const UserService = require('../services/user.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    const result = await UserService.getAll({ role, status, search }, Number(page), Number(limit));

    return successResponse(res, result.users, 'Users fetched successfully', 200, result.pagination);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await UserService.getById(req.params.id);
    return successResponse(res, user, 'User fetched successfully');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const user = await UserService.create(req.body, req.user._id);
    return successResponse(res, user, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await UserService.update(req.params.id, req.body);
    return successResponse(res, user, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const user = await UserService.remove(req.params.id, req.user._id);
    return successResponse(res, user, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const { user, message } = await UserService.toggleStatus(req.params.id, req.user._id);
    return successResponse(res, user, message);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove, toggleStatus };
