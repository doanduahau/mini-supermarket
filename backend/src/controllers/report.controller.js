const ReportService = require('../services/report.service');
const { successResponse } = require('../utils/response');

const getSalarySummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const report = await ReportService.getSalarySummary(month, year);
    return successResponse(res, report, 'Lấy báo cáo tổng hợp lương thành công');
  } catch (err) {
    next(err);
  }
};

const getAttendanceSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const report = await ReportService.getAttendanceSummary(month, year);
    return successResponse(res, report, 'Lấy báo cáo tổng hợp điểm danh thành công');
  } catch (err) {
    next(err);
  }
};

const getHeadcountReport = async (req, res, next) => {
  try {
    const report = await ReportService.getHeadcountReport();
    return successResponse(res, report, 'Lấy báo cáo nhân sự thành công');
  } catch (err) {
    next(err);
  }
};

const getShiftUtilization = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const report = await ReportService.getShiftUtilization(month, year);
    return successResponse(res, report, 'Lấy báo cáo hiệu suất ca làm việc thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getSalarySummary, getAttendanceSummary, getHeadcountReport, getShiftUtilization };
