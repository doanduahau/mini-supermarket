const ShiftAssignmentService = require('../services/shiftAssignment.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await ShiftAssignmentService.getAll({
      ...filters,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 20
    });
    return successResponse(res, result.assignments, 'Shift assignments fetched successfully', 200, result.pagination);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const assignment = await ShiftAssignmentService.create(req.body, req.user._id);
    return successResponse(res, assignment, 'Shift assignment created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const assignment = await ShiftAssignmentService.updateStatus(req.params.id, status, req.user._id);
    return successResponse(res, assignment, 'Shift assignment status updated successfully');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await ShiftAssignmentService.remove(req.params.id);
    return successResponse(res, null, 'Shift assignment deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, updateStatus, remove };
