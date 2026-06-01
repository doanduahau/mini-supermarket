## CHƯƠNG II. PHÂN TÍCH NỘI DUNG, YÊU CẦU

Dựa trên thực tiễn hoạt động tại các siêu thị mini, hệ thống Mini HR được phân tích và thiết kế xoay quanh các quy trình nghiệp vụ cốt lõi, từ đó rút ra các yêu cầu chức năng và phi chức năng tương ứng.

### I. Phân tích các quy trình nghiệp vụ

#### 1) Quy trình Quản lý Ca làm việc (Shift Management)
Đặc thù của siêu thị mini là thời gian mở cửa kéo dài, do đó nhân sự không làm theo giờ hành chính cố định mà phải xoay ca linh hoạt.
*   **Khởi tạo và thiết lập khung ca:** Quản lý siêu thị cần lên kế hoạch các ca làm việc trong tuần hoặc tháng. Mỗi ca quy định rõ khung giờ (Sáng, Chiều, Tối) và số lượng nhân sự tối đa. Hệ thống cho phép "Mở đăng ký" để chờ nhân viên thao tác.
*   **Nhân viên chủ động đăng ký ca:** Trên ứng dụng di động, nhân viên xem danh sách các ca đang mở. Hệ thống tự động bôi xám và khóa nút đăng ký đối với các ca đã "Đủ người" hoặc trùng giờ với ca nhân viên đã đăng ký. Khi đăng ký, yêu cầu chuyển sang "Chờ duyệt".
*   **Phê duyệt và Xếp ca chủ động:** Quản lý xem danh sách xin vào ca và "Duyệt" hoặc "Từ chối". Khi duyệt thành công, hệ thống gửi thông báo (Push Notification) ngay lập tức đến điện thoại của nhân viên. Quản lý cũng có quyền "Thêm nhân viên vào ca" trực tiếp (ép ca).

#### 2) Quy trình Chấm công Thực tế (Attendance Tracking)
Sau khi lịch làm việc được chốt, hệ thống cần ghi nhận chính xác thời gian thực tế nhân viên có mặt tại cửa hàng.
*   **Báo cáo Vào ca / Ra ca:** Màn hình "Chấm công của tôi" hiển thị ca trong ngày. Nút "Vào ca" chỉ cho phép bấm tối đa trước 1 tiếng so với giờ bắt đầu ca. Nếu nhân viên quên bấm "Ra ca", hệ thống tự động kết thúc ca sau khi quá 30 phút.
*   **Đối chiếu và phân loại trạng thái:** Thuật toán tự động phân loại thành 5 trạng thái: Chưa vào, Đúng giờ, Vào muộn, Ra sớm, Sai giờ (vi phạm cả vào muộn và ra sớm) dựa trên việc so sánh thời gian thực và thời gian chuẩn của ca.
*   **Giám sát thời gian thực:** Dashboard của Quản lý tự động cập nhật ngay lập tức trạng thái chấm công của nhân viên tại cửa hàng (thông qua WebSockets) mà không cần làm mới trang, kèm cảnh báo đỏ với người đi muộn.

#### 3) Quy trình Tính lương và Thưởng/Phạt (Payroll & Bonus)
Đây là quy trình chốt chặn cuối cùng mỗi tháng, yêu cầu độ chính xác tuyệt đối.
*   **Ghi nhận Thưởng / Phạt:** Quản lý tạo các phiếu ghi nhận Thưởng/Phạt (Lý do, Số tiền, Ngày) trong quá trình làm việc. Dữ liệu này tự động đồng bộ vào bảng lương cuối tháng.
*   **Tổng hợp giờ làm thực tế:** Thuật toán tính số phút làm việc hợp lệ (cắt bỏ phần thời gian đến quá sớm không tính lương), sau đó nhân với "Mức lương cơ bản theo giờ" đã được cài đặt.
*   **Chốt bảng lương và Trích xuất:** Sau khi cộng Thưởng và trừ Phạt, Quản lý chốt lương. Nhân viên ngay lập tức xem được chi tiết tiền lương trên điện thoại và có thể Tải phiếu lương (PDF) để lưu trữ minh bạch.

---

### II. Yêu cầu chức năng hệ thống và yêu cầu chất lượng

#### 1) Yêu cầu chức năng hệ thống
Dựa trên phân tích quy trình, hệ thống cần đáp ứng các chức năng cụ thể sau:

| STT | Nội dung | Mô tả chi tiết | Ghi chú |
| :--- | :--- | :--- | :--- |
| 1 | **Quản lý Tài khoản & Phân quyền** | Hệ thống cung cấp chức năng đăng nhập, đăng ký và quản lý hồ sơ. Phân tách rõ 3 Role: `supermarket_owner` (toàn quyền), `shift_manager` (quản lý ca), `employee` (nhân viên). | Sử dụng JWT để phân quyền bảo mật |
| 2 | **Quản lý Nhân viên** | Thêm, sửa, xóa, tìm kiếm nhân viên. Cài đặt mức lương cơ bản (Base Salary) cho từng cá nhân hoặc theo mặt bằng chung. | Chỉ Role Owner mới có quyền xóa |
| 3 | **Tạo và Quản lý Ca làm việc** | Cho phép quản lý tạo các ca làm việc (khung giờ, số lượng người). Xóa, sửa ca hoặc đóng/mở đăng ký ca. | Áp dụng Validation logic chặt chẽ |
| 4 | **Đăng ký ca làm việc** | Nhân viên xem danh sách ca trống và thao tác "Đăng ký". Hệ thống tự động chặn đăng ký trùng giờ hoặc ca đã đủ người. | Mobile-First UI (Thao tác trên điện thoại) |
| 5 | **Duyệt ca làm việc** | Quản lý xem danh sách chờ duyệt, thực hiện Chấp nhận/Từ chối hoặc chủ động Gán nhân viên vào ca cụ thể. | Bắn thông báo Real-time cho nhân viên |
| 6 | **Chấm công (Check-in/out)** | Nhân viên bấm Vào ca/Ra ca trên điện thoại. Nút Vào ca chỉ mở trước 1 tiếng. Tự động kết thúc ca nếu quên bấm sau 30 phút. | Xác định 5 trạng thái (Đúng giờ, Đi muộn...) |
| 7 | **Quản lý Thưởng / Phạt** | Tạo các phiếu thưởng/phạt cho nhân viên (cộng/trừ tiền). Các khoản này tự động link tới bảng lương tháng. | |
| 8 | **Tính Lương tự động** | Thuật toán quét toàn bộ giờ làm thực tế hợp lệ trong tháng, nhân với lương cơ bản và áp dụng thưởng/phạt để ra lương thực lãnh. | |
| 9 | **Xuất Phiếu lương PDF** | Nhân viên xem chi tiết cấu thành lương trên điện thoại và có thể bấm tải file PDF bảng lương làm bằng chứng minh bạch. | Render PDF tại Client-side |
| 10 | **Hệ thống Thông báo (Bảng tin)** | Quản lý đăng thông báo chung. Biểu tượng "Cái chuông" hiện số đỏ (Badge) nếu nhân viên chưa đọc thông báo mới. | Cập nhật số đỏ tức thời |

#### 2) Yêu cầu chất lượng (Phi chức năng)
Bên cạnh các chức năng nghiệp vụ, hệ thống cần đảm bảo các tiêu chuẩn kỹ thuật sau để duy trì hoạt động ổn định và mang lại trải nghiệm tốt nhất:

| STT | Nội dung | Tiêu chuẩn | Mô tả chi tiết | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Giao diện Người dùng (UI/UX)** | Mobile-First, Trực quan, Tốc độ | Giao diện phải tương thích 100% với màn hình điện thoại di động (Responsive). Các thao tác chấm công, đăng ký ca phải to, rõ ràng, dễ chạm (dạng Card thay vì Table). Tự động đóng Menu khi chuyển trang. | Tailwind CSS |
| 2 | **Hiệu năng & Tốc độ (Performance)** | Load trang < 2s, Real-time | Hệ thống không được có độ trễ lớn. Các thao tác duyệt ca, thông báo, hoặc chấm công phải được đồng bộ ngay lập tức sang máy của người khác mà không cần F5 trang. | Next.js SSR & Socket.io |
| 3 | **Bảo mật (Security)** | Stateless, Mã hóa mật khẩu | Toàn bộ mật khẩu lưu trong CSDL phải được băm (Hash) một chiều. Các API nhạy cảm (Tính lương, Xóa nhân sự) phải chặn tuyệt đối nếu token không đủ quyền hạn. | Bcrypt & JWT Auth |
| 4 | **Tính Ràng buộc Dữ liệu** | Data Integrity, Chống lỗi Logic | Backend phải tự bắt lỗi: Không cho phép tạo ca có Giờ kết thúc nhỏ hơn Giờ bắt đầu; Không cho phép nhân viên đăng ký 2 ca trùng thời gian; Không cho phép duyệt vượt quá số lượng tối đa. | Mongoose Validation |
| 5 | **Tính Sẵn sàng & Mở rộng** | Scalability, Modularity | Cấu trúc code Frontend và Backend phải chia theo từng Module (Component, Service, Controller) rõ ràng, dễ bảo trì, dễ dàng tích hợp thêm chức năng "Xin nghỉ phép" hay "Camera AI điểm danh" trong tương lai. | Kiến trúc RESTful & App Router |
