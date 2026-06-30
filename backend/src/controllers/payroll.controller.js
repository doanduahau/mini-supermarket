const PayrollService = require('../services/payroll.service');
const { successResponse } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await PayrollService.getPayroll({
      ...filters,
      page: Number(filters.page) || 1,
      limit: Number(filters.limit) || 20
    });
    return successResponse(res, result.payrolls, 'Lấy danh sách bảng lương thành công', 200, result.pagination);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const payroll = await PayrollService.getPayrollById(req.params.id);
    return successResponse(res, payroll, 'Lấy chi tiết bảng lương thành công');
  } catch (err) {
    next(err);
  }
};

const preview = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.query;
    if (!employeeId || !month || !year) {
      throw Object.assign(new Error('Vui lòng cung cấp employeeId, month, year'), { statusCode: 400 });
    }
    const result = await PayrollService.previewPayroll(employeeId, Number(month), Number(year));
    return successResponse(res, result, 'Lấy bản xem trước lương thành công');
  } catch (err) {
    next(err);
  }
};

const createOrUpdateDraft = async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.body;
    if (!employeeId || !month || !year) {
      throw Object.assign(new Error('Vui lòng cung cấp đầy đủ thông tin'), { statusCode: 400 });
    }
    const payroll = await PayrollService.createOrUpdateDraft(employeeId, Number(month), Number(year), req.user._id);
    return successResponse(res, payroll, 'Tính toán và lưu nháp lương thành công', 201);
  } catch (err) {
    next(err);
  }
};

const createMonthlyPayroll = async (req, res, next) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      throw Object.assign(new Error('Vui lòng cung cấp month và year'), { statusCode: 400 });
    }
    const result = await PayrollService.createMonthlyPayroll(Number(month), Number(year), req.user._id);
    return successResponse(res, result, 'Tính toán lương toàn hệ thống hoàn tất', 201);
  } catch (err) {
    next(err);
  }
};

const confirmPayroll = async (req, res, next) => {
  try {
    const payroll = await PayrollService.confirmPayroll(req.params.id, req.user._id);
    return successResponse(res, payroll, 'Chốt bảng lương thành công');
  } catch (err) {
    next(err);
  }
};

const { generatePayrollPDF } = require('../utils/pdfGenerator');
const { generatePayrollExcel } = require('../utils/excelGenerator');
const { Payroll, User, PayrollAttendanceRecord, PayrollBonusRecord } = require('../models');

const exportPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payroll = await Payroll.findByPk(id, {
      include: [
        { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'role', 'phone', 'status'] },
        { model: PayrollAttendanceRecord, as: 'attendanceRecords' },
        { model: PayrollBonusRecord, as: 'bonusRecords' }
      ]
    });
    
    if (!payroll) {
      throw Object.assign(new Error('Không tìm thấy bảng lương'), { statusCode: 404 });
    }

    // Check permission: employee can only see their own
    if (req.user.role === 'employee' && payroll.employee.id !== req.user.id && payroll.employee._id !== req.user._id) {
      throw Object.assign(new Error('Bạn không có quyền xem phiếu lương này'), { statusCode: 403 });
    }

    const payrollJson = payroll.toJSON();
    payrollJson.breakdown = {
      attendanceRecords: payrollJson.attendanceRecords || [],
      bonusRecords: payrollJson.bonusRecords || []
    };
   
    const pdfBuffer = await generatePayrollPDF(payrollJson, payrollJson.employee);

    const safeName = payrollJson.employee.fullName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/\s+/g, "-")
      .toLowerCase();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="phieu-luong-${safeName}-${payrollJson.month}-${payrollJson.year}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
      console.error(err);
      console.error(err.stack);
      return res.status(500).json(err.message);
  }
};

const exportExcel = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      throw Object.assign(new Error('Vui lòng cung cấp month và year'), { statusCode: 400 });
    }

    const payrolls = await Payroll.findAll({
      where: { month: Number(month), year: Number(year) },
      include: [
        { model: User, as: 'employee', attributes: ['id', '_id', 'fullName', 'email', 'role', 'status'] },
        { model: PayrollAttendanceRecord, as: 'attendanceRecords' },
        { model: PayrollBonusRecord, as: 'bonusRecords' }
      ]
    });

    const mappedPayrolls = payrolls.map(p => {
      const json = p.toJSON();
      json.breakdown = {
        attendanceRecords: json.attendanceRecords || [],
        bonusRecords: json.bonusRecords || []
      };
      return json;
    });

    const buffer = await generatePayrollExcel(mappedPayrolls, Number(month), Number(year));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="bang-luong-${month}-${year}.xlsx"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, preview, createOrUpdateDraft, createMonthlyPayroll, confirmPayroll, exportPDF, exportExcel };
