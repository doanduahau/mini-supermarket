const ShiftService = require('../services/shift.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const shifts = await ShiftService.getAll();
    return successResponse(res, shifts, 'Shifts fetched successfully');
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const shift = await ShiftService.create(req.body);
    return successResponse(res, shift, 'Shift created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const shift = await ShiftService.update(req.params.id, req.body);
    return successResponse(res, shift, 'Shift updated successfully');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await ShiftService.remove(req.params.id);
    return successResponse(res, null, 'Shift deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, update, remove };
