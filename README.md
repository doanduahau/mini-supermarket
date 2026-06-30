# Mini HR - Hệ Thống Quản Lý Nhân Sự Siêu Thị Mini 🏪

Mini HR là một hệ thống quản lý nhân sự chuyên dụng dành cho các siêu thị mini và chuỗi cửa hàng bán lẻ. Hệ thống giúp số hóa toàn bộ quy trình từ quản lý ca làm việc, điểm danh, tính lương đến giao tiếp nội bộ một cách mượt mà và trực quan, đặc biệt tối ưu cho người dùng trên thiết bị di động (Mobile-first).

---

## 🌟 Tính Năng Nổi Bật

- **Phân quyền chặt chẽ**: Hỗ trợ 3 cấp độ phân quyền (Chủ siêu thị, Quản lý ca, Nhân viên).
- **Quản lý Ca làm việc thông minh**: 
  - Quản lý tạo ca và mở đăng ký ca hàng tuần.
  - Nhân viên tự đăng ký ca linh hoạt trên điện thoại.
  - Quản lý duyệt/từ chối hoặc chủ động xếp ca (ép ca) cho nhân viên.
- **Xin Nghỉ & Đổi Ca (Mới hoàn thiện)**:
  - Cho phép nhân viên tạo đơn xin nghỉ ca kèm theo lý do, Quản lý sẽ nhận được thông báo để duyệt/từ chối trực tiếp.
  - Hỗ trợ đổi ca chéo giữa các nhân viên hoặc nhường ca cho người khác một cách thông minh (có xác thực chống trùng lặp giờ, khóa ca khi đã chấm công).
  - Tự động kiểm tra và báo lỗi nếu người nhận ca không có lịch phù hợp hoặc vi phạm số giờ công.
- **Chấm công (Attendance)**:
  - Giao diện dạng thẻ (Card) trực quan cho nhân viên trên mobile.
  - Tự động nhận diện 5 trạng thái: Đúng giờ, Vào muộn, Ra sớm, Sai giờ, Chưa vào.
  - Tự động Check-out nếu nhân viên quên bấm sau khi hết ca 30 phút.
- **Bảng lương tự động (Payroll)**:
  - Tự động tính toán số giờ làm việc thực tế (loại bỏ phần đi quá sớm).
  - Quản lý dễ dàng cộng/trừ các khoản Thưởng/Phạt.
  - Xuất phiếu lương cá nhân ra file PDF chuyên nghiệp.
- **Thông báo Thời gian thực (Real-time Notifications)**:
  - Sử dụng Socket.io để báo ngay lập tức khi ca được duyệt, lương được chốt.
  - Bảng tin (Announcements) toàn hệ thống có thông báo đỏ (Badge) chính xác cho từng nhân viên.

---

## 🚀 Công Nghệ Sử Dụng

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, PostgreSQL (Sequelize ORM), Socket.io, JWT.
- **Infrastructure**: Docker & Docker Compose (Dành cho Database Local).

---

## 💻 Hướng Dẫn Cài Đặt (Cho Giảng Viên / Người Mới)

Yêu cầu hệ thống:
- **Node.js** (Khuyến nghị v18+)
- **Docker & Docker Desktop** (Dùng để chạy Database nhanh chóng mà không cần cài PostgreSQL vào máy)

### Bước 1: Khởi động Cơ Sở Dữ Liệu (Database)
Di chuyển vào thư mục gốc của dự án `mini-supermarket` và chạy lệnh sau để khởi động PostgreSQL qua Docker (chạy ở cổng 5433 để tránh xung đột):
```bash
docker-compose up -d
```

### Bước 2: Cấu hình và Chạy Backend
Mở một terminal mới và di chuyển vào thư mục `backend`:
```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend` với nội dung sau:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password123@localhost:5433/mini_hr
JWT_SECRET=mot_chuoi_bi_mat_bat_ky_cua_ban
JWT_REFRESH_SECRET=mot_chuoi_refresh_bi_mat
CLIENT_URL=http://localhost:3000
```

**Chạy Migration & Khởi tạo dữ liệu mẫu (Seeding):** Chạy lệnh sau để tự động tạo các Bảng (Tables) và điền sẵn dữ liệu mẫu (Tài khoản, Ca làm việc...):
```bash
npm run seed
```

Khởi động Backend server:
```bash
npm run dev
```
*(Backend sẽ chạy tại: http://localhost:5000)*

### Bước 3: Cấu hình và Chạy Frontend
Mở một terminal mới (giữ backend tiếp tục chạy) và di chuyển vào thư mục `frontend`:
```bash
cd frontend
npm install
```

Tạo file `.env.local` trong thư mục `frontend` với nội dung sau:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Khởi động Frontend server:
```bash
npm run dev
```
*(Frontend sẽ chạy tại: http://localhost:3000)*

---

## 🔑 Thông Tin Đăng Nhập Mẫu (Dữ liệu sau khi chạy Seed)

Sau khi hệ thống chạy, bạn có thể đăng nhập bằng các tài khoản mẫu sau để trải nghiệm các vai trò khác nhau:

- **Chủ siêu thị (Supermarket Owner)**: Có toàn quyền quản trị, xóa nhân viên, chốt lương.
  - Email: `owner@supermarket.com`
  - Mật khẩu: `Admin@123`
- **Quản lý ca (Shift Manager)**: Tạo ca, duyệt ca, tạo thông báo.
  - Email: `manager1@supermarket.com`
  - Mật khẩu: `Manager@123`
- **Nhân viên (Employee)**: Điểm danh, xem ca, tải phiếu lương, xin nghỉ & đổi ca.
  - Email: `nv1@supermarket.com` (hoặc nv2, nv3)
  - Mật khẩu: `Employee@123`
