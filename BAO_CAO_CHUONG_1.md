# BÁO CÁO DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÂN SỰ SIÊU THỊ MINI (MINI HR)

## CHƯƠNG I. TỔNG QUAN

### I. Giới thiệu đề tài
Sự phát triển mạnh mẽ của mô hình chuỗi siêu thị mini và cửa hàng tiện lợi đòi hỏi một quy trình quản lý nhân sự linh hoạt, chính xác và tự động hóa cao. Hệ thống "Mini HR - Quản lý nhân sự siêu thị mini" được xây dựng nhằm giải quyết những bài toán đặc thù của ngành bán lẻ như: lịch làm việc xoay ca phức tạp, nhân sự chủ yếu thao tác qua điện thoại di động, và nhu cầu tính lương/chấm công liên tục. 

#### 1) Mục tiêu của đề tài
Đề tài hướng tới việc xây dựng một hệ thống phần mềm quản lý nhân sự hoàn chỉnh, số hóa toàn bộ quy trình quản lý nhân viên tại các siêu thị mini. Các mục tiêu cụ thể bao gồm:
*   **Tối ưu hóa quản lý ca làm việc:** Cung cấp công cụ cho phép Quản lý tạo ca, thiết lập số lượng nhân sự tối đa, và cho phép Nhân viên chủ động đăng ký ca làm việc linh hoạt theo tuần/tháng. Hỗ trợ Quản lý phê duyệt hoặc ép ca khi cần thiết.
*   **Tự động hóa chấm công và tính lương:** Xây dựng thuật toán chấm công theo thời gian thực (Real-time), tự động nhận diện các trạng thái (Đúng giờ, Vào muộn, Ra sớm, Sai giờ) dựa trên khung giờ chuẩn của ca làm. Tự động quy đổi số giờ làm thực tế và các khoản thưởng/phạt thành bảng lương hoàn chỉnh.
*   **Giao tiếp thông suốt:** Xây dựng hệ thống thông báo tức thời (Real-time Notification) và bảng tin (Announcements) để đảm bảo mọi chủ trương, thông báo từ Ban quản lý đến được với nhân viên ngay lập tức.
*   **Nâng cao trải nghiệm người dùng (UX/UI):** Áp dụng triết lý thiết kế Mobile-First, đảm bảo nhân viên (vốn chủ yếu sử dụng smartphone) có thể thao tác mượt mà, trực quan nhất (đặc biệt là giao diện đăng ký ca và điểm danh dạng thẻ - Card UI).

#### 2) Phạm vi áp dụng
*   **Về mặt quy mô:** Hệ thống phù hợp áp dụng cho các siêu thị mini, cửa hàng tiện lợi hoặc chuỗi bán lẻ có quy mô nhân sự từ nhỏ đến trung bình (từ 10 đến vài trăm nhân viên), nơi có cấu trúc làm việc theo ca (Shift-based).
*   **Về đối tượng sử dụng:**
    *   **Chủ siêu thị (Supermarket Owner):** Quản trị toàn quyền, xem báo cáo tổng quan, quản lý danh sách nhân sự, thiết lập mức lương cơ bản và chốt bảng lương cuối tháng.
    *   **Quản lý ca (Shift Manager):** Tổ chức ca làm việc, duyệt/từ chối yêu cầu đăng ký ca của nhân viên, tạo thông báo hệ thống và ghi nhận các khoản thưởng/phạt.
    *   **Nhân viên (Employee):** Theo dõi lịch làm việc cá nhân, đăng ký ca, thực hiện "Vào ca/Ra ca" (Check-in/Check-out) hàng ngày và xem phiếu lương (hỗ trợ xuất PDF).
*   **Về mặt chức năng:** Bao gồm các module cốt lõi: Quản lý Tài khoản & Phân quyền, Quản lý Ca làm việc, Chấm công, Tính lương & Thưởng phạt, Thông báo Hệ thống (Announcements).

#### 3) Nền tảng kỹ thuật
Dự án được phát triển theo mô hình Client-Server hiện đại, sử dụng các công nghệ tiên tiến nhất nhằm đảm bảo hiệu năng, tính bảo mật và khả năng mở rộng trong tương lai:
*   **Kiến trúc hệ thống:** Ứng dụng Web tĩnh (Frontend) giao tiếp với RESTful API (Backend) và duy trì kết nối WebSocket cho các tính năng thời gian thực.
*   **Frontend (Giao diện người dùng):** 
    *   Sử dụng Framework **Next.js 15 (App Router)** kết hợp **React** để xây dựng giao diện tương tác cao.
    *   Sử dụng **Tailwind CSS** để thiết kế giao diện Responsive, đặc biệt chú trọng tối ưu hóa cho màn hình điện thoại (Mobile-First).
    *   Quản lý State và gọi API thông qua **Axios** và **Custom Hooks**.
*   **Backend (Xử lý nghiệp vụ):**
    *   Được xây dựng trên môi trường **Node.js** với Framework **Express.js**.
    *   Hỗ trợ tương tác thời gian thực (real-time) bằng thư viện **Socket.io** (để bắn thông báo chấm công, duyệt ca).
*   **Cơ sở dữ liệu (Database):** 
    *   Sử dụng **MongoDB** – một cơ sở dữ liệu NoSQL linh hoạt, phù hợp với việc lưu trữ cấu trúc dữ liệu đa dạng của lịch làm việc và bảng lương. Tương tác qua thư viện **Mongoose (ODM)**.
*   **Bảo mật & Tiện ích:**
    *   Xác thực người dùng (Authentication) & Phân quyền (Authorization) bằng **JSON Web Token (JWT)**.
    *   Mã hóa mật khẩu bằng **Bcrypt**.
    *   Xử lý xuất báo cáo lương ra định dạng PDF ngay trên trình duyệt.
