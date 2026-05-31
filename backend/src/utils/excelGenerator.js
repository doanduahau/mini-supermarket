const ExcelJS = require('exceljs');
const { ROLE_LABELS } = require('./constants');

async function generatePayrollExcel(payrolls, month, year) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Mini Supermarket System';

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '';

  // ---------------------------------------------------------
  // SHEET 1: TỔNG HỢP BẢNG LƯƠNG
  // ---------------------------------------------------------
  const sheet1 = workbook.addWorksheet(`Bảng lương tháng ${month}-${year}`, {
    views: [{ state: 'frozen', ySplit: 3 }] // Freeze row 3
  });

  sheet1.columns = [
    { key: 'stt', width: 6 },
    { key: 'name', width: 25 },
    { key: 'role', width: 18 },
    { key: 'totalHours', width: 12 },
    { key: 'hourlyRate', width: 15 },
    { key: 'baseSalary', width: 15 },
    { key: 'bonus', width: 12 },
    { key: 'penalty', width: 12 },
    { key: 'netSalary', width: 18 }
  ];

  // Row 1: Title
  sheet1.mergeCells('A1:I1');
  const titleCell = sheet1.getCell('A1');
  titleCell.value = `BẢNG LƯƠNG THÁNG ${month}/${year} - SIÊU THỊ MINI`;
  titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF004B87' } }; 

  // Row 2: Subtitle
  sheet1.mergeCells('A2:I2');
  const subtitleCell = sheet1.getCell('A2');
  subtitleCell.value = `Ngày xuất: ${formatDate(new Date())} | Tổng nhân viên: ${payrolls.length}`;
  subtitleCell.font = { italic: true, color: { argb: 'FF666666' } };
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  // Row 3: Headers
  const headers = ['STT', 'Họ tên', 'Chức vụ', 'Tổng giờ', 'Đơn giá/giờ', 'Lương CB', 'Thưởng', 'Phạt', 'Thực lĩnh'];
  const headerRow = sheet1.addRow(headers);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }; 
    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  sheet1.autoFilter = 'A3:I3';

  // Data Rows
  const allNet = payrolls.map(p => p.netSalary || 0);
  const avgNet = allNet.length > 0 ? allNet.reduce((a, b) => a + b, 0) / allNet.length : 0;

  payrolls.forEach((payroll, index) => {
    const row = sheet1.addRow([
      index + 1,
      payroll.employee?.fullName || 'N/A',
      ROLE_LABELS[payroll.employee?.role] || payroll.employee?.role || 'N/A',
      payroll.totalHours || 0,
      payroll.hourlyRate || 0,
      payroll.baseSalary || 0,
      payroll.bonusTotal || 0,
      payroll.penaltyTotal || 0,
      payroll.netSalary || 0
    ]);

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        left: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        bottom: { style: 'thin', color: { argb: 'FFEEEEEE' } },
        right: { style: 'thin', color: { argb: 'FFEEEEEE' } }
      };
      
      if (index % 2 !== 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } };
      }

      if (colNumber === 9) { // Net Salary
        const val = cell.value;
        if (val === 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } }; 
        } else if (val > avgNet && avgNet > 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } }; 
        }
      }

      if (colNumber === 4) { // Total Hours
        cell.numFmt = '0.0 " giờ"';
        cell.alignment = { horizontal: 'center' };
      }
      if ([5, 6, 7, 8, 9].includes(colNumber)) { // Currency
        cell.numFmt = '#,##0 "VNĐ"';
      }
      if (colNumber === 1) { // STT
        cell.alignment = { horizontal: 'center' };
      }
    });
  });

  // Footer Row
  const footerRowNumber = payrolls.length + 4;
  sheet1.mergeCells(`A${footerRowNumber}:B${footerRowNumber}`);
  const footerLabelCell = sheet1.getCell(`A${footerRowNumber}`);
  footerLabelCell.value = 'TỔNG CỘNG';
  footerLabelCell.font = { bold: true };
  footerLabelCell.alignment = { horizontal: 'center', vertical: 'middle' };
  
  const netTotalCell = sheet1.getCell(`I${footerRowNumber}`);
  netTotalCell.value = { formula: `SUM(I4:I${footerRowNumber - 1})` };
  netTotalCell.numFmt = '#,##0 "VNĐ"';
  
  sheet1.getRow(footerRowNumber).eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
    cell.border = { top: { style: 'thin' }, bottom: { style: 'double' } };
  });

  // ---------------------------------------------------------
  // SHEET 2: CHI TIẾT TỪNG NHÂN VIÊN
  // ---------------------------------------------------------
  const sheet2 = workbook.addWorksheet('Chi tiết từng nhân viên');
  sheet2.columns = [
    { key: 'name', width: 25 },
    { key: 'date', width: 15 },
    { key: 'shift', width: 20 },
    { key: 'in', width: 12 },
    { key: 'out', width: 12 },
    { key: 'hours', width: 10 }
  ];

  payrolls.forEach(payroll => {
    const employeeName = payroll.employee?.fullName || 'N/A';
    
    const headerRow = sheet2.addRow([employeeName, 'Ngày', 'Ca làm việc', 'Check-in', 'Check-out', 'Giờ']);
    headerRow.font = { bold: true };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } }; 

    const attendanceRecords = payroll.breakdown?.attendanceRecords || [];
    
    if (attendanceRecords.length === 0) {
      const emptyRow = sheet2.addRow(['', 'Không có dữ liệu chấm công']);
      emptyRow.font = { italic: true, color: { argb: 'FF999999' } };
    } else {
      attendanceRecords.forEach(a => {
        sheet2.addRow([
          '',
          formatDate(a.date),
          a.shift?.name || a.shiftName || 'N/A',
          a.checkIn ? new Date(a.checkIn).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '-',
          a.checkOut ? new Date(a.checkOut).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '-',
          a.actualHours?.toFixed(1) || '0'
        ]);
      });
    }
    sheet2.addRow([]); 
  });

  // ---------------------------------------------------------
  // SHEET 3: THƯỞNG PHẠT
  // ---------------------------------------------------------
  const sheet3 = workbook.addWorksheet('Thưởng phạt');
  sheet3.columns = [
    { key: 'name', width: 25 },
    { key: 'type', width: 15 },
    { key: 'amount', width: 15 },
    { key: 'reason', width: 40 },
    { key: 'date', width: 15 }
  ];

  const headerRow3 = sheet3.addRow(['Nhân viên', 'Loại', 'Số tiền', 'Lý do', 'Ngày tạo']);
  headerRow3.font = { bold: true };
  headerRow3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
  sheet3.autoFilter = 'A1:E1';

  payrolls.forEach(payroll => {
    const bonusRecords = payroll.breakdown?.bonusRecords || [];
    bonusRecords.forEach(b => {
      const row = sheet3.addRow([
        payroll.employee?.fullName || 'N/A',
        b.type === 'bonus' ? 'Thưởng' : 'Phạt',
        b.amount || 0,
        b.reason || '',
        formatDate(b.createdAt)
      ]);
      
      row.getCell(3).numFmt = '#,##0 "VNĐ"';
      row.getCell(2).font = { color: { argb: b.type === 'bonus' ? 'FF00B050' : 'FFFF0000' } };
    });
  });

  return await workbook.xlsx.writeBuffer();
}

module.exports = { generatePayrollExcel };
