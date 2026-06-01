## CHƯƠNG II. PHÂN TÍCH NỘI DUNG, YÊU CẦU

Dựa trên thực tiễn hoạt động tại các siêu thị mini, hệ thống Mini HR được phân tích và thiết kế xoay quanh 3 quy trình nghiệp vụ cốt lõi: Quản lý ca làm việc, Chấm công thực tế, và Tính lương.

### I. Quy trình Quản lý Ca làm việc (Shift Management)
Đặc thù của siêu thị mini là thời gian mở cửa kéo dài (thường từ 6h sáng đến 23h đêm hoặc 24/24), do đó nhân sự không làm theo giờ hành chính cố định mà phải xoay ca linh hoạt.

#### 1) Khởi tạo và thiết lập khung ca làm việc
*   **Yêu cầu nghiệp vụ:** Quản lý siêu thị cần lên kế hoạch các ca làm việc trong tuần hoặc tháng. Mỗi ca cần quy định rõ khung giờ (ví dụ: Ca Sáng 06:00 - 12:00, Ca Chiều 12:00 - 18:00, Ca Tối 18:00 - 23:00) và số lượng nhân sự tối đa cần thiết để đảm bảo vận hành cửa hàng.
*   **Giải pháp hệ thống:** Giao diện Quản lý cung cấp chức năng "Tạo ca làm việc". Quản lý nhập thời gian bắt đầu, thời gian kết thúc và số lượng giới hạn. Trạng thái mặc định của ca khi mới tạo là "Mở đăng ký" để chờ nhân viên thao tác.

#### 2) Nhân viên chủ động đăng ký ca
*   **Yêu cầu nghiệp vụ:** Nhân viên (đặc biệt là sinh viên làm thêm) cần được linh động chọn ca làm phù hợp với lịch cá nhân. Quá trình đăng ký phải trực quan, dễ dàng thao tác trên điện thoại, đồng thời phải ngăn chặn việc đăng ký trùng lịch hoặc đăng ký vào ca đã đủ người.
*   **Giải pháp hệ thống:** Trên ứng dụng di động (giao diện Mobile-first), nhân viên truy cập màn hình "Lịch của tôi" để xem danh sách các ca đang mở. Hệ thống tự động bôi xám và khóa nút đăng ký đối với các ca đã "Đủ người" hoặc trùng giờ với ca nhân viên đã đăng ký trước đó. Khi nhân viên ấn đăng ký, yêu cầu sẽ được chuyển đến trạng thái "Chờ duyệt" (Pending).

#### 3) Phê duyệt, Từ chối và Xếp ca chủ động (Ép ca)
*   **Yêu cầu nghiệp vụ:** Quản lý cần kiểm soát cuối cùng xem ai làm ca nào để đảm bảo chất lượng nhân sự (ví dụ: mỗi ca phải có ít nhất 1 thu ngân cứng). Đôi khi, nếu một ca bị thiếu người do không ai đăng ký, Quản lý phải có quyền "ép ca" (chỉ định trực tiếp nhân viên vào ca đó).
*   **Giải pháp hệ thống:** Quản lý truy cập bảng "Duyệt đăng ký ca", xem danh sách các nhân viên đang xin vào ca. Hệ thống hỗ trợ thao tác "Duyệt" (Approve) hoặc "Từ chối" (Reject). Khi duyệt thành công, hệ thống gửi thông báo (Push Notification qua Socket.io) ngay lập tức đến điện thoại của nhân viên. Ngoài ra, Quản lý có một công cụ riêng để "Thêm nhân viên vào ca" trực tiếp mà không cần nhân viên đăng ký trước.

---

### II. Quy trình Chấm công Thực tế (Attendance Tracking)
Sau khi lịch làm việc được chốt, hệ thống cần ghi nhận chính xác thời gian thực tế nhân viên có mặt tại cửa hàng.

#### 1) Báo cáo Vào ca / Ra ca (Check-in / Check-out)
*   **Yêu cầu nghiệp vụ:** Nhân viên thao tác điểm danh bằng điện thoại ngay tại cửa hàng. Quá trình điểm danh cần ngăn chặn việc điểm danh quá sớm (giữ kỷ luật) hoặc quên điểm danh khi về.
*   **Giải pháp hệ thống:** Màn hình "Chấm công của tôi" hiển thị danh sách ca làm việc trong ngày. Hệ thống áp dụng quy tắc: Nút "Vào ca" chỉ sáng lên và cho phép bấm **tối đa trước 1 tiếng** so với giờ bắt đầu ca. Tương tự, nếu nhân viên quên bấm "Ra ca", hệ thống sẽ **tự động kết thúc ca** sau khi quá 30 phút kể từ giờ kết thúc ca dự kiến.

#### 2) Thuật toán đối chiếu và phân loại trạng thái chấm công
*   **Yêu cầu nghiệp vụ:** Không chỉ ghi nhận thời gian, hệ thống phải tự động đánh giá ý thức tuân thủ giờ giấc của nhân viên dựa trên sự chênh lệch giữa giờ thực tế và giờ chuẩn của ca làm.
*   **Giải pháp hệ thống:** Dữ liệu chấm công được tính toán theo thời gian thực và phân loại thành 5 trạng thái:
    *   **Chưa vào:** Ca làm việc chưa bắt đầu hoặc nhân viên chưa điểm danh.
    *   **Đúng giờ:** Check-in trước/đúng giờ bắt đầu VÀ Check-out sau/đúng giờ kết thúc.
    *   **Vào muộn:** Check-in sau giờ bắt đầu ca.
    *   **Ra sớm:** Check-out trước giờ kết thúc ca.
    *   **Sai giờ:** Vi phạm cả hai lỗi (Vừa vào muộn, vừa ra sớm).

#### 3) Giám sát thời gian thực từ phía Quản lý
*   **Yêu cầu nghiệp vụ:** Quản lý cửa hàng (không có mặt tại siêu thị) vẫn phải nắm được tình hình nhân sự hiện tại: ai đang làm, ai vắng mặt.
*   **Giải pháp hệ thống:** Bảng điều khiển (Dashboard) của Quản lý cung cấp danh sách "Chấm công hôm nay". Mỗi khi nhân viên bấm check-in/check-out ở điện thoại, Dashboard của Quản lý sẽ tự động cập nhật ngay lập tức trạng thái (thông qua WebSockets) mà không cần làm mới trang, kèm theo cảnh báo nhãn đỏ đối với các trường hợp "Vào muộn".

---

### III. Quy trình Tính lương và Thưởng/Phạt (Payroll & Bonus)
Đây là quy trình chốt chặn cuối cùng mỗi tháng, yêu cầu độ chính xác tuyệt đối về số liệu tài chính.

#### 1) Ghi nhận Thưởng / Phạt phát sinh
*   **Yêu cầu nghiệp vụ:** Trong quá trình làm việc, nhân viên có thể vi phạm nội quy (làm rơi vỡ hàng hóa, thái độ không tốt) hoặc đạt thành tích (thưởng doanh số, chuyên cần). Các khoản này cần được lưu trữ để cộng/trừ vào kỳ lương.
*   **Giải pháp hệ thống:** Quản lý sử dụng Module "Thưởng / Phạt" để tạo các phiếu ghi nhận. Mỗi phiếu gồm: Tên nhân viên, Ngày phát sinh, Loại (Thưởng hoặc Phạt), Số tiền và Lý do. Dữ liệu này sẽ được tự động đồng bộ vào bảng lương cuối tháng.

#### 2) Tổng hợp và tính toán số giờ làm việc thực tế
*   **Yêu cầu nghiệp vụ:** Việc tính lương của nhân viên Part-time dựa trên số giờ làm thực tế, chứ không phải số giờ danh nghĩa của ca làm. Nếu đi muộn/về sớm, hệ thống phải tự động khấu trừ thời gian tương ứng.
*   **Giải pháp hệ thống:** Khi Quản lý bấm "Tính lương", hệ thống quét toàn bộ dữ liệu chấm công trong tháng. Thuật toán sẽ tính số phút làm việc hợp lệ: `Thời gian kết thúc hợp lệ - Thời gian bắt đầu hợp lệ` (cắt bỏ phần thời gian đến quá sớm không được tính lương). Tổng số giờ sẽ được nhân với "Mức lương cơ bản theo giờ" được cài đặt chung trong hệ thống.

#### 3) Chốt bảng lương và Trích xuất dữ liệu
*   **Yêu cầu nghiệp vụ:** Sau khi có số liệu tổng hợp (Lương cơ bản + Thưởng - Phạt = Thực lãnh), Quản lý cần kiểm tra lại, chốt lương và gửi phiếu lương chi tiết cho từng cá nhân.
*   **Giải pháp hệ thống:** Bảng lương hiển thị chi tiết các con số thành phần. Sau khi duyệt, trạng thái chuyển thành "Đã chốt" (Finalized). Lúc này, nhân viên có thể mở ứng dụng trên điện thoại, vào mục "Thu nhập" để xem chi tiết tiền lương của mình. Hệ thống còn tích hợp tính năng **Tải phiếu lương PDF** trực tiếp, giúp nhân viên có biên lai điện tử minh bạch, rõ ràng.
