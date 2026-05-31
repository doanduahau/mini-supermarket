const emailTemplates = {
  shiftApproved: ({ employeeName, shiftName, date, startTime, endTime }) => ({
    subject: '✅ Ca làm việc đã được duyệt',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <div style="background-color: #2563eb; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">SIÊU THỊ MINI</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Xin chào <strong>${employeeName}</strong>,</p>
          <p>Ca làm việc của bạn đã được quản lý phê duyệt. Dưới đây là thông tin chi tiết:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Ca:</strong> ${shiftName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Ngày:</strong> ${new Date(date).toLocaleDateString('vi-VN')}</p>
            <p style="margin: 0;"><strong>Giờ làm việc:</strong> ${startTime} - ${endTime}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/my/schedule" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Xem lịch của tôi</a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
          <p style="font-size: 12px; color: #6b7280; text-align: center;">Nếu bạn có thắc mắc, vui lòng liên hệ trực tiếp với quản lý ca.</p>
        </div>
      </div>
    `
  }),

  shiftRejected: ({ employeeName, shiftName, date, reason }) => ({
    subject: '❌ Ca làm việc bị từ chối',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <div style="background-color: #dc2626; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">SIÊU THỊ MINI</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Xin chào <strong>${employeeName}</strong>,</p>
          <p>Rất tiếc, yêu cầu đăng ký ca làm việc của bạn đã bị từ chối.</p>
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fecaca;">
            <p style="margin: 0 0 10px 0;"><strong>Ca:</strong> ${shiftName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Ngày:</strong> ${new Date(date).toLocaleDateString('vi-VN')}</p>
            <p style="margin: 0; color: #dc2626;"><strong>Lý do:</strong> ${reason || 'Không có lý do'}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/my/schedule" style="background-color: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Xem lịch của tôi</a>
          </div>
        </div>
      </div>
    `
  }),

  payrollReady: ({ employeeName, month, year, netSalary, status }) => ({
    subject: `💰 Phiếu lương tháng ${month}/${year} đã sẵn sàng`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <div style="background-color: #059669; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">SIÊU THỊ MINI</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Xin chào <strong>${employeeName}</strong>,</p>
          <p>${status === 'confirmed' ? 'Bảng lương của bạn đã được chốt chính thức.' : 'Bảng lương dự kiến của bạn đã được tạo.'}</p>
          <div style="background-color: #ecfdf5; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #a7f3d0;">
            <p style="margin: 0 0 10px 0;"><strong>Tháng tính lương:</strong> ${month}/${year}</p>
            <p style="margin: 0 0 10px 0; font-size: 18px;"><strong>Thực lĩnh:</strong> <span style="color: #059669; font-weight: bold;">${netSalary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} VNĐ</span></p>
            <p style="margin: 0;"><strong>Trạng thái:</strong> ${status === 'confirmed' ? 'Đã chốt' : 'Tạm tính'}</p>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:3000/my/salary" style="background-color: #059669; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Xem chi tiết thu nhập</a>
          </div>
        </div>
      </div>
    `
  }),

  accountLocked: ({ employeeName }) => ({
    subject: '⚠️ Tài khoản đã bị khóa',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <div style="background-color: #f59e0b; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">SIÊU THỊ MINI</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Xin chào <strong>${employeeName}</strong>,</p>
          <p>Tài khoản truy cập hệ thống của bạn đã bị <strong style="color: #d97706;">TẠM KHÓA</strong> bởi Quản trị viên.</p>
          <p>Bạn sẽ không thể đăng nhập vào ứng dụng cũng như thực hiện các nghiệp vụ chấm công, đăng ký ca từ lúc này.</p>
          <div style="text-align: center; margin-top: 30px; padding: 15px; background-color: #fffbeb; border-radius: 8px;">
            <p style="margin: 0; color: #d97706; font-weight: bold;">Vui lòng liên hệ với Quản lý hoặc Chủ siêu thị để biết thêm chi tiết và mở khóa tài khoản.</p>
          </div>
        </div>
      </div>
    `
  })
};

module.exports = emailTemplates;
