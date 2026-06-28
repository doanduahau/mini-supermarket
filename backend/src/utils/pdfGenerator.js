const PDFDocument = require('pdfkit-table');
const path = require('path');
const { ROLE_LABELS } = require('./constants');

function formatVND(amount) {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + ' VNĐ';
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('vi-VN');
}

async function generatePayrollPDF(payroll, user) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const fontRegular = path.join(__dirname, 'fonts', 'Roboto-Regular.ttf');
      const fontBold = path.join(__dirname, 'fonts', 'Roboto-Bold.ttf');

      // Add fonts
      doc.registerFont('Roboto', fontRegular);
      doc.registerFont('Roboto-Bold', fontBold);

      // Default font
      doc.font('Roboto');

      // 1. HEADER
      doc.font('Roboto-Bold').fontSize(24).text('SIÊU THỊ MINI', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(18).text(`PHIẾU LƯƠNG THÁNG ${payroll.month}/${payroll.year}`, { align: 'center' });
      doc.moveDown(1);
      
      doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
      doc.moveDown(1);

      // 2. THÔNG TIN NHÂN VIÊN
      const startY = doc.y;
      doc.font('Roboto').fontSize(12);
      
      const roleLabel = ROLE_LABELS[user.role] || user.role;
      const statusLabel = payroll.status === 'confirmed' ? 'Đã chốt' : 'Tạm tính';
      
      doc.text(`Họ tên: ${user.fullName}`, 40, startY);
      doc.text(`Mã NV: ${user._id.toString().slice(-8)}`, 40, startY + 20);
      doc.text(`Chức vụ: ${roleLabel}`, 40, startY + 40);

      doc.text(`Tháng tính lương: ${payroll.month}/${payroll.year}`, 300, startY);
      doc.text(`Ngày xuất: ${formatDate(new Date())}`, 300, startY + 20);
      doc.text(`Trạng thái: ${statusLabel}`, 300, startY + 40);

      doc.moveDown(3);

      // 3. BẢNG CHI TIẾT NGÀY LÀM
      const attendanceRecords = payroll.breakdown?.attendanceRecords || [];
      if (attendanceRecords.length > 0) {
        doc.font('Roboto-Bold').fontSize(14).text('1. Chi tiết ngày làm', 40, doc.y);
        doc.moveDown(0.5);

        const tableAttendance = {
          headers: ['Ngày', 'Ca', 'Check-in', 'Check-out', 'Giờ'],
          rows: attendanceRecords.map(a => [
            formatDate(a.date),
            a.shift?.name || 'N/A',
            a.checkIn ? new Date(a.checkIn).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '-',
            a.checkOut ? new Date(a.checkOut).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'}) : '-',
            a.actualHours?.toFixed(1) || '0'
          ])
        };

        // Add footer row for attendance
        tableAttendance.rows.push(['Tổng cộng', '', '', '', `${payroll.totalHours?.toFixed(1)} giờ`]);

        doc.table(tableAttendance, {
          prepareHeader: () => doc.font('Roboto-Bold').fontSize(10),
          prepareRow: (row, i) => doc.font(i === tableAttendance.rows.length - 1 ? 'Roboto-Bold' : 'Roboto').fontSize(10)
        });
        doc.moveDown(1);
      }

      // 4. BẢNG THƯỞNG / PHẠT
      const bonusRecords = payroll.breakdown?.bonusRecords || [];
      if (bonusRecords.length > 0) {
        doc.font('Roboto-Bold').fontSize(14).text('2. Thưởng / Phạt', 40, doc.y);
        doc.moveDown(0.5);

        const tableBonus = {
          headers: ['Ngày', 'Loại', 'Lý do', 'Số tiền'],
          rows: bonusRecords.map(b => [
            formatDate(b.date),
            b.type === 'bonus' ? 'Thưởng' : 'Phạt',
            b.reason || '',
            formatVND(b.amount)
          ])
        };

        tableBonus.rows.push(['Tổng thưởng', '', '', formatVND(payroll.bonusTotal || 0)]);
        tableBonus.rows.push(['Tổng phạt', '', '', formatVND(payroll.penaltyTotal || 0)]);

        doc.table(tableBonus, {
          prepareHeader: () => doc.font('Roboto-Bold').fontSize(10),
          prepareRow: (row, i) => doc.font(i >= tableBonus.rows.length - 2 ? 'Roboto-Bold' : 'Roboto').fontSize(10)
        });
        doc.moveDown(1);
      }

      // 5. TỔNG KẾT
      doc.moveDown(1);
      const summaryY = doc.y;
      
      // Draw box
      doc.rect(250, summaryY, 300, 120).stroke();
      
      doc.font('Roboto').fontSize(12);
      doc.text(`Lương cơ bản:`, 270, summaryY + 15);
      doc.text(`${formatVND(payroll.baseSalary || 0)}`, 430, summaryY + 15, { width: 100, align: 'right' });
      
      doc.text(`Thưởng:`, 270, summaryY + 35);
      doc.text(`+ ${formatVND(payroll.bonusTotal || 0)}`, 430, summaryY + 35, { width: 100, align: 'right' });
      
      doc.text(`Phạt:`, 270, summaryY + 55);
      doc.text(`- ${formatVND(payroll.penaltyTotal || 0)}`, 430, summaryY + 55, { width: 100, align: 'right' });
      
      doc.moveTo(270, summaryY + 75).lineTo(530, summaryY + 75).stroke();
      
      doc.font('Roboto-Bold').fontSize(14);
      doc.text(`THỰC LĨNH:`, 270, summaryY + 90);
      doc.text(`${formatVND(payroll.netSalary || 0)}`, 410, summaryY + 90, { width: 120, align: 'right' });

      // 6. CHỮ KÝ
      doc.moveDown(4);
      const signatureY = doc.y;
      doc.font('Roboto-Bold').fontSize(12);
      doc.text('Nhân viên', 100, signatureY, { align: 'center', width: 150 });
      doc.text('Người lập bảng lương', 350, signatureY, { align: 'center', width: 150 });
      
      doc.font('Roboto').fontSize(10).fillColor('gray');
      doc.text('(Ký và ghi rõ họ tên)', 100, signatureY + 15, { align: 'center', width: 150 });
      doc.text('(Ký và ghi rõ họ tên)', 350, signatureY + 15, { align: 'center', width: 150 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  generatePayrollPDF
};
