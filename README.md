# Mini HR - Hệ Thống Quản Lý Nhân Sự Siêu Thị Mini

Mini HR là một hệ thống quản lý nhân sự chuyên dụng dành cho các siêu thị mini và chuỗi cửa hàng bán lẻ. Hệ thống giúp số hóa toàn bộ quy trình từ quản lý ca làm việc, điểm danh, tính lương đến giao tiếp nội bộ một cách mượt mà và trực quan, đặc biệt tối ưu cho người dùng trên thiết bị di động (Mobile-first).

## 🌟 Tính Năng Nổi Bật

- **Phân quyền chặt chẽ**: Hỗ trợ 3 cấp độ phân quyền (Chủ siêu thị, Quản lý ca, Nhân viên).
- **Quản lý Ca làm việc thông minh**: 
  - Quản lý tạo ca và mở đăng ký ca hàng tuần.
  - Nhân viên tự đăng ký ca linh hoạt trên điện thoại.
  - Quản lý duyệt/từ chối hoặc chủ động xếp ca (ép ca) cho nhân viên.
- **Chấm công (Attendance)**:
  - Giao diện dạng thẻ (Card) trực quan cho nhân viên trên mobile.
  - Tự động nhận diện trạng thái: Đúng giờ, Vào muộn, Ra sớm, Sai giờ.
- **Bảng lương tự động (Payroll)**:
  - Tự động tính toán số giờ làm việc thực tế và quy ra tiền lương.
  - Quản lý dễ dàng cộng/trừ các khoản Thưởng/Phạt.
  - Xuất phiếu lương cá nhân ra file PDF chuyên nghiệp.
- **Thông báo Thời gian thực (Real-time Notifications)**:
  - Sử dụng Socket.io để báo ngay lập tức khi ca được duyệt, lương được chốt.
  - Bảng tin (Announcements) toàn hệ thống có thông báo đỏ (Badge) chính xác cho từng nhân viên.
- **Thiết kế Mobile-Responsive**: Giao diện UI/UX được chau chuốt kỹ lưỡng để nhân viên siêu thị có thể thao tác 100% qua điện thoại một cách dễ dàng.

## 🚀 Công Nghệ Sử Dụng

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, PostgreSQL (Sequelize ORM), Socket.io, JWT Authentication.

---

## 💻 Hướng Dẫn Cài Đặt (Cho Developer)

Yêu cầu hệ thống:
- **Node.js** (Khuyến nghị v18+)
- **PostgreSQL 14+** (Local hoặc dịch vụ cloud như Supabase, Railway, Neon)

### Bước 1: Clone mã nguồn
```bash
git clone https://github.com/your-username/mini-supermarket-hr.git
cd mini-supermarket-hr
```

### Bước 2: Cài đặt & Chạy Backend
Mở một terminal mới và di chuyển vào thư mục `backend`:
```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend` với nội dung sau:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/supermarket_hr
JWT_SECRET=mot_chuoi_bi_mat_bat_ky_cua_ban
JWT_REFRESH_SECRET=mot_chuoi_refresh_bi_mat
CLIENT_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Khởi động Backend server:
```bash
npm run dev
```
*(Backend sẽ chạy tại: http://localhost:5000)*

### Bước 3: Cài đặt & Chạy Frontend
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

## 🔑 Thông Tin Đăng Nhập Mẫu

Sau khi hệ thống chạy, bạn có thể tạo một tài khoản đầu tiên thông qua màn hình Đăng ký, hoặc nếu đã có data mẫu, bạn có thể đăng nhập bằng các vai trò tương ứng để trải nghiệm:
- **Chủ siêu thị (Supermarket Owner)**: Có toàn quyền quản trị, xóa nhân viên, tính lương tổng.
- **Quản lý ca (Shift Manager)**: Có quyền tạo ca, duyệt ca, tạo thông báo.
- **Nhân viên (Employee)**: Chỉ xem và đăng ký ca của mình, thao tác điểm danh và xem phiếu lương cá nhân.

## 🤝 Đóng Góp (Contributing)
Mọi đóng góp (Pull Request, Report Bug, Feature Request) đều được hoan nghênh để làm cho dự án hoàn thiện hơn!

## 📝 Giấy Phép (License)
Dự án được phân phối dưới giấy phép MIT. Xem file `LICENSE` để biết thêm chi tiết.
