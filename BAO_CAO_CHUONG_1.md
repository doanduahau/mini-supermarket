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
    *   Hỗ trợ tương tác thời gian thực (real-time) bằng thư viện **Socket.io** (để bắn thông báo chấm công, duyệt ca, thông báo tin tức...).
*   **Cơ sở dữ liệu (Database):** 
    *   Sử dụng **MongoDB** – một cơ sở dữ liệu NoSQL linh hoạt, phù hợp với việc lưu trữ cấu trúc dữ liệu đa dạng của lịch làm việc và bảng lương. Tương tác qua thư viện **Mongoose (ODM)**.
*   **Bảo mật & Tiện ích:**
    *   Xác thực người dùng (Authentication) & Phân quyền (Authorization) bằng **JSON Web Token (JWT)**.
    *   Mã hóa mật khẩu bằng **Bcrypt**.
    *   Xử lý xuất báo cáo lương ra định dạng PDF ngay trên trình duyệt (Client-side generation).

---

### II. Cơ sở lý thuyết

Để xây dựng hệ thống quản lý nhân sự hiệu quả và đáp ứng tốt các yêu cầu nghiệp vụ thực tế, dự án đã áp dụng các cơ sở lý thuyết về công nghệ phần mềm và kiến trúc hệ thống mạng như sau:

#### 1) Lý thuyết về Mô hình Client - Server và kiến trúc RESTful API
*   **Mô hình Client - Server:** Là mô hình mạng máy tính trong đó các máy tính được phân chia thành hai loại: máy khách (Client) và máy chủ (Server). Trong dự án Mini HR, giao diện người dùng (Next.js) đóng vai trò là Client tiếp nhận thao tác của người dùng (như bấm điểm danh, đăng ký ca), sau đó gửi yêu cầu xử lý đến Server (Node.js/Express.js). Server xử lý logic nghiệp vụ, tương tác với cơ sở dữ liệu và trả kết quả về cho Client. Mô hình này giúp tách biệt rõ ràng giữa giao diện hiển thị và logic xử lý dữ liệu, dễ dàng bảo trì và mở rộng.
*   **Kiến trúc RESTful API (Representational State Transfer):** Là một bộ các nguyên tắc kiến trúc để thiết kế các dịch vụ Web. Hệ thống Mini HR tuân thủ chặt chẽ REST API bằng cách sử dụng các phương thức HTTP tiêu chuẩn (`GET`, `POST`, `PUT`, `DELETE`) để tương tác với các tài nguyên (như `users`, `shifts`, `attendances`, `payrolls`). Dữ liệu trao đổi giữa Client và Server được định dạng dưới dạng JSON (JavaScript Object Notation), giúp tốc độ truyền tải nhanh và dễ dàng phân tích cú pháp.

#### 2) Lý thuyết về Kiến trúc Server-Side Rendering (SSR) và Single Page Application (SPA) với React/Next.js
*   **React và Single Page Application (SPA):** React là thư viện JavaScript sử dụng Virtual DOM (DOM ảo) để tối ưu hóa việc kết xuất (render) giao diện. Ứng dụng SPA chỉ tải một trang HTML duy nhất ở lần truy cập đầu tiên, sau đó tự động cập nhật lại các phần giao diện khi người dùng chuyển trang hoặc có dữ liệu mới mà không cần tải lại toàn bộ trang (no-reload). Điều này mang lại trải nghiệm mượt mà như một ứng dụng điện thoại gốc (native app) cho nhân viên siêu thị.
*   **Next.js (App Router):** Mở rộng từ React, Next.js cung cấp cơ chế kết xuất hỗn hợp bao gồm Server-Side Rendering (SSR) và Client-Side Rendering (CSR). Nhờ kiến trúc App Router mới nhất, hệ thống Mini HR có thể tối ưu hiệu năng trang web (load nội dung nhanh hơn ở các trang báo cáo, bảng tin) và đảm bảo an toàn dữ liệu, giấu kín các biến môi trường nhạy cảm khỏi phía Client.

#### 3) Lý thuyết về Cơ sở dữ liệu NoSQL (MongoDB)
Khác với cơ sở dữ liệu quan hệ truyền thống (SQL) lưu trữ dữ liệu dưới dạng các bảng cứng nhắc, **MongoDB** lưu trữ dữ liệu dưới dạng các tài liệu (Document) có cấu trúc BSON (tương tự JSON).
*   **Lý do áp dụng trong dự án:** Nghiệp vụ quản lý ca làm việc và bảng lương có cấu trúc dữ liệu không đồng nhất và thay đổi thường xuyên (ví dụ: một phiếu tính lương có thể chứa nhiều loại phụ cấp, tiền phạt khác nhau tùy tháng). MongoDB cho phép lưu trữ cấu trúc động này một cách tự nhiên.
*   **Mongoose ODM:** Hệ thống sử dụng Mongoose (Object Data Modeling) để định nghĩa các Schema, tạo ra các ràng buộc chặt chẽ (Validation) ở tầng ứng dụng (ví dụ: ràng buộc giờ kết thúc ca phải lớn hơn giờ bắt đầu ca) trước khi dữ liệu được ghi vào cơ sở dữ liệu, đảm bảo tính toàn vẹn dữ liệu.

#### 4) Lý thuyết về Xác thực và Phân quyền (Authentication & Authorization) bằng JSON Web Token (JWT)
Bảo mật thông tin nhân sự và tiền lương là yêu cầu tối quan trọng của hệ thống HR. 
*   **Chuẩn JSON Web Token (JWT):** Là một chuỗi mã hóa bao gồm 3 phần (Header, Payload, Signature). Khi người dùng đăng nhập thành công, Server sẽ cấp phát một mã JWT. Khác với Session truyền thống lưu trạng thái trên Server, JWT mang tính chất "Stateless", toàn bộ thông tin định danh (ID nhân viên, Vai trò) được chứa gọn trong Payload của token.
*   **Quá trình hoạt động:** Ở mỗi lần người dùng gửi yêu cầu (ví dụ: xin duyệt ca, xem bảng lương), token này sẽ được đính kèm vào HTTP Header (`Authorization: Bearer <token>`). Middleware của Express.js sẽ giải mã token để xác thực danh tính và kiểm tra vai trò (Role-based Access Control) xem người này là `employee` hay `shift_manager` có quyền thực hiện hành động đó hay không, từ đó chặn các truy cập trái phép.

#### 5) Lý thuyết về Truyền thông Thời gian thực (Real-time Communication) với WebSockets
Trong mô hình HTTP truyền thống, Client phải chủ động gửi yêu cầu thì Server mới trả lời (Polling), gây lãng phí tài nguyên mạng và có độ trễ.
*   **Giao thức WebSocket:** Cung cấp kênh liên lạc hai chiều, liên tục và toàn thời gian giữa Client và Server qua một kết nối TCP duy nhất. 
*   **Áp dụng Socket.io trong dự án:** Khi Quản lý bấm "Duyệt ca" hoặc tạo "Thông báo mới", sự kiện này được ghi vào database, đồng thời Server sẽ lập tức phát (emit) một tín hiệu (Event) thông qua Socket.io trực tiếp đến trình duyệt của các nhân viên có liên quan. Kết quả là biểu tượng hình "Cái chuông" trên màn hình điện thoại của nhân viên sẽ lập tức rung lên hiển thị chấm đỏ báo hiệu có thông báo mới mà không cần nhân viên phải tải lại trang (F5). Điều này giải quyết bài toán cần tính tức thời cao trong môi trường làm việc siêu thị.
