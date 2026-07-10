# Hướng dẫn kiểm thử hệ thống BSLMS
### (Banking Savings & Loan Management System)

Tài liệu này hướng dẫn bạn kiểm thử **toàn bộ chức năng** của hệ thống theo từng module, theo
đúng thứ tự nên làm để dữ liệu ở các bước sau phụ thuộc đúng vào bước trước.

---

## 0. Chuẩn bị môi trường

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run seed      # LUÔN chạy bước này trước khi test lại từ đầu — xóa DB cũ, tạo dữ liệu mẫu
npm start         # http://localhost:4000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Mở trình duyệt tại `http://localhost:5173`.

### Tài khoản demo

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền chính |
|---|---|---|---|
| Quản trị viên | `admin` | `Admin@123` | Toàn quyền + Quản trị hệ thống |
| Giao dịch viên | `teller1` | `Teller@123` | Khách hàng, Tiết kiệm, Giao dịch |
| Chuyên viên tín dụng | `loanofficer1` | `Loan@123` | Duyệt/giải ngân/thu nợ vay |
| Quản lý | `manager1` | `Manager@123` | Chỉ xem, không thao tác nghiệp vụ |

> 💡 Trang đăng nhập có sẵn 4 nút bấm nhanh để điền tài khoản demo, không cần gõ tay.

---

## 1. Xác thực & Bảo mật (Auth)

**Đăng nhập đúng**
1. Đăng nhập với `admin` / `Admin@123` → vào được Dashboard.

**Đăng nhập sai mật khẩu 5 lần liên tiếp (kiểm tra khóa tài khoản tự động)**
1. Đăng xuất, thử đăng nhập `teller1` với mật khẩu sai 5 lần.
2. ✅ Kết quả mong đợi: lần thứ 5 báo **"Tài khoản đã bị khóa"**.
3. Đăng nhập lại bằng `admin` → vào **Người dùng** → thấy `teller1` ở trạng thái **Đã khóa**.
4. Bấm menu (⋮) trên dòng `teller1` → **Mở khóa tài khoản** → xác nhận.
5. Đăng nhập lại `teller1` với mật khẩu đúng `Teller@123` → phải vào được.

**Quên mật khẩu**
1. Ở trang đăng nhập, bấm **Quên mật khẩu?**
2. Nhập email `teller1@viettrustbank.vn` → **Gửi mã xác nhận**.
3. Hệ thống demo hiển thị luôn mã 6 số (do không có mail server thật) → nhập mã + mật khẩu mới (≥ 8 ký tự) → **Đặt lại mật khẩu**.
4. Đăng nhập lại bằng mật khẩu mới vừa đặt.

**Đổi mật khẩu khi đã đăng nhập**
1. Vào menu avatar (góc phải trên) → **Đổi mật khẩu**.
2. Nhập sai mật khẩu hiện tại → phải báo lỗi.
3. Nhập đúng mật khẩu hiện tại + mật khẩu mới → thành công.

**Hồ sơ cá nhân**
1. Menu avatar → **Hồ sơ cá nhân** → sửa số điện thoại/địa chỉ → **Lưu thay đổi** → refresh trang, kiểm tra dữ liệu vẫn giữ.

---

## 2. Quản lý người dùng *(chỉ Admin thấy menu này)*

Đăng nhập `admin`, vào **Người dùng**.

1. **Thêm người dùng mới**: bấm **Thêm người dùng**, điền đầy đủ, chọn vai trò `TELLER` → tạo thành công, xuất hiện trong danh sách.
2. **Sửa thông tin**: menu (⋮) → **Chỉnh sửa** → đổi vai trò/email → lưu → kiểm tra danh sách cập nhật đúng.
3. **Đặt lại mật khẩu**: menu (⋮) → **Đặt lại mật khẩu** → hệ thống trả về mật khẩu tạm thời hiển thị trên màn hình.
4. **Khóa / Mở khóa**: menu (⋮) → **Khóa tài khoản** → trạng thái đổi thành "Đã khóa"; thử đăng nhập tài khoản đó phải bị từ chối. Sau đó mở khóa lại.
5. **Xóa người dùng**: tạo 1 tài khoản test rồi xóa → biến mất khỏi danh sách. (Lưu ý: không thể tự xóa chính tài khoản đang đăng nhập — kiểm tra menu (⋮) không hiện mục Xóa với chính `admin`.)
6. **Tìm kiếm & lọc**: gõ từ khóa vào ô tìm kiếm, chọn bộ lọc **Vai trò** → danh sách lọc đúng.
7. **Kiểm tra phân quyền**: đăng nhập bằng `teller1` hoặc `manager1` → menu **Người dùng** không hiển thị trong sidebar; nếu cố truy cập URL `/users` trực tiếp → bị chuyển hướng về Dashboard.

---

## 3. Quản lý khách hàng

Đăng nhập `admin` hoặc `teller1`.

1. **Xem danh sách**: vào **Khách hàng** → thấy 8 khách hàng mẫu đã seed sẵn.
2. **Tìm kiếm**: gõ tên/CCCD/SĐT vào ô tìm kiếm → danh sách lọc đúng theo thời gian thực.
3. **Thêm khách hàng mới**:
   - Bấm **Thêm khách hàng**, điền: Họ tên, CCCD (số mới chưa tồn tại), SĐT hợp lệ (bắt đầu `0` hoặc `+84`), ngày sinh, giới tính...
   - Thử nhập SĐT sai định dạng (vd: `123`) → phải báo lỗi validate.
   - Thử nhập CCCD trùng với khách hàng đã có → phải báo lỗi "đã tồn tại".
   - Nhập đúng → tạo thành công, chuyển vào danh sách với mã KH tự sinh (dạng `KHyymm#####`).
4. **Xem chi tiết khách hàng**: bấm vào 1 dòng khách hàng → xem đủ 3 tab:
   - **Sổ tiết kiệm**: danh sách sổ của khách hàng này.
   - **Khoản vay**: danh sách khoản vay của khách hàng này.
   - **Lịch sử giao dịch**: có phân trang.
5. **Sửa thông tin khách hàng**: bấm **Chỉnh sửa** ở trang chi tiết → đổi SĐT/địa chỉ → lưu → kiểm tra cập nhật đúng.
6. **Xóa khách hàng** *(chỉ Admin)*:
   - Thử xóa khách hàng **đang có sổ tiết kiệm hoạt động** (vd. khách hàng đầu tiên trong danh sách seed) → phải báo lỗi **không thể xóa**.
   - Tạo 1 khách hàng mới chưa có giao dịch gì → xóa được ngay.
7. **Kiểm tra phân quyền**: đăng nhập `manager1` → vào trang khách hàng vẫn xem được nhưng **không thấy nút Thêm/Chỉnh sửa/Xóa**.

---

## 4. Quản lý tiết kiệm

Đăng nhập `admin` hoặc `teller1`.

### 4.1. Mở sổ tiết kiệm mới
1. Vào **Tiết kiệm** → **Mở sổ tiết kiệm**.
2. Chọn khách hàng (gõ tên để tìm kiếm), chọn kỳ hạn (vd. `Kỳ hạn 6 tháng`) → hệ thống tự hiển thị lãi suất áp dụng hiện hành.
3. Nhập số tiền gửi ban đầu → **Mở sổ tiết kiệm** → được chuyển thẳng vào trang chi tiết sổ vừa tạo, mã sổ dạng `TKyymmdd#####`.

### 4.2. Gửi thêm tiền
1. Ở trang chi tiết sổ, bấm **Gửi tiền** → nhập số tiền → xác nhận.
2. ✅ Kiểm tra: số dư tăng đúng, xuất hiện dòng giao dịch mới trong "Lịch sử giao dịch" bên dưới.

### 4.3. Rút tiền
1. Bấm **Rút tiền** trên 1 sổ **không kỳ hạn** (vd. sổ của khách hàng "Ngô Thị Lan" trong dữ liệu mẫu) → nhập số tiền ≤ số dư → thành công.
2. Thử rút tiền trên sổ **có kỳ hạn chưa đến hạn** → phải báo lỗi yêu cầu dùng chức năng tất toán trước hạn.
3. Thử rút số tiền lớn hơn số dư hiện có → phải báo lỗi "số dư không đủ".

### 4.4. Tất toán sổ tiết kiệm
1. Chọn 1 sổ có kỳ hạn **chưa đến ngày đáo hạn** → bấm **Tất toán** → xác nhận.
2. ✅ Kiểm tra: hệ thống tính **lãi suất không kỳ hạn + phạt rút trước hạn** (số lãi nhận được thấp hơn nhiều so với lãi trọn kỳ hạn), hiển thị rõ số lãi và số phạt, trạng thái sổ chuyển thành **Đã tất toán**.
3. (Nếu muốn test trường hợp đáo hạn đủ kỳ, có thể sửa tạm ngày hệ thống hoặc kiểm tra logic qua code — phần này khó test UI vì phụ thuộc thời gian thực).

### 4.5. Tái tục sổ tiết kiệm
1. Chọn 1 sổ có kỳ hạn đang **Đang hoạt động** → bấm **Tái tục**.
2. ✅ Kiểm tra: lãi được cộng dồn vào gốc, ngày mở sổ + ngày đáo hạn được cập nhật lại, lãi suất áp dụng theo mức hiện hành.

### 4.6. Kiểm tra phân quyền
- Đăng nhập `loanofficer1` hoặc `manager1` → vào **Tiết kiệm** vẫn xem được danh sách nhưng không có nút thao tác (Mở sổ/Gửi/Rút/Tất toán/Tái tục).

---

## 5. Quản lý cho vay

Đăng nhập lần lượt các vai trò theo từng bước bên dưới để test đúng luồng phê duyệt.

### 5.1. Đăng ký khoản vay (Teller / Loan Officer / Admin)
1. Đăng nhập `teller1` → **Cho vay** → **Đăng ký khoản vay**.
2. Chọn khách hàng, loại vay, nhập số tiền vay và kỳ hạn (tháng) → hệ thống hiển thị lãi suất áp dụng và ước tính trả kỳ đầu.
3. Gửi hồ sơ → trạng thái khoản vay là **Chờ duyệt**.
4. ✅ Kiểm tra thông báo: đăng nhập `loanofficer1` → bấm chuông thông báo góc phải trên → phải thấy thông báo "Hồ sơ vay mới cần thẩm định".

### 5.2. Duyệt / Từ chối hồ sơ (Loan Officer / Admin)
1. Đăng nhập `loanofficer1` → vào khoản vay vừa tạo (trạng thái Chờ duyệt).
2. **Test từ chối**: bấm **Từ chối**, nhập lý do → xác nhận → trạng thái chuyển **Từ chối**, lý do hiển thị trên trang chi tiết.
3. Tạo thêm 1 hồ sơ vay khác, lần này bấm **Duyệt hồ sơ** → trạng thái chuyển **Đã duyệt**.
4. ✅ Kiểm tra thông báo: đăng nhập lại tài khoản đã tạo hồ sơ (`teller1`) → có thông báo kết quả duyệt/từ chối.

### 5.3. Giải ngân (Loan Officer / Admin)
1. Với khoản vay đã **Đã duyệt**, bấm **Giải ngân** → xác nhận.
2. ✅ Kiểm tra: trạng thái chuyển **Đã giải ngân**; tab **Lịch trả nợ** xuất hiện đầy đủ số kỳ = số tháng vay, mỗi kỳ có Gốc/Lãi/Tổng phải trả tính theo phương pháp dư nợ giảm dần; vào **Giao dịch** thấy 1 giao dịch loại "Giải ngân vay".

### 5.4. Thu nợ (Teller / Loan Officer / Admin)
1. Dùng khoản vay mẫu **đã giải ngân sẵn** trong dữ liệu seed (tìm khoản vay của khách hàng "Phan Văn Đức", đã trả 3/12 kỳ).
2. Bấm **Thu nợ** → hệ thống hiển thị kỳ tiếp theo cần trả (kỳ thứ 4) và số tiền còn phải trả.
3. Nhập đúng số tiền của kỳ đó → xác nhận → kiểm tra:
   - Kỳ đó chuyển trạng thái **Đã trả** trong tab Lịch trả nợ.
   - Tab **Lịch sử thanh toán** có thêm 1 dòng mới, phân bổ đúng Gốc/Lãi.
   - Dư nợ còn lại (thanh trên cùng) giảm đúng theo phần gốc đã trả.
4. **Test trả một phần**: ở kỳ tiếp theo, nhập số tiền **nhỏ hơn** số phải trả → kiểm tra trạng thái kỳ đó chuyển thành **Trả một phần**, số "Đã trả" đúng, phần còn thiếu vẫn hiển thị.

### 5.5. Kiểm tra khoản vay quá hạn (đã có sẵn trong dữ liệu mẫu)
1. Vào **Cho vay**, lọc trạng thái = **Quá hạn** → thấy khoản vay của khách hàng "Đỗ Anh Tuấn" (được seed sẵn ở trạng thái quá hạn kỳ đầu).
2. Mở chi tiết → tab Lịch trả nợ, kỳ 1 có trạng thái **Quá hạn**.
3. Bấm **Thu nợ** cho khoản vay này → kiểm tra hệ thống **tự tính thêm tiền phạt trễ hạn** cộng vào số phải trả.
4. (Tùy chọn — cần quyền Admin/Loan Officer) Gọi API quét quá hạn thủ công: có thể gọi trực tiếp `POST /api/loans/detect-overdue` bằng Postman với token Admin để xem toàn bộ khoản vay quá hạn được quét và tạo thông báo.

### 5.6. Tất toán sớm khoản vay
1. Chọn 1 khoản vay đang **Đã giải ngân** hoặc **Quá hạn** → bấm **Tất toán sớm**.
2. ✅ Kiểm tra: toàn bộ các kỳ còn lại chuyển thành **Đã trả** trong 1 lần, trạng thái khoản vay chuyển **Đã tất toán**, dư nợ về 0.

### 5.7. Kiểm tra phân quyền
- `manager1`: chỉ xem, không có bất kỳ nút thao tác nào trên trang Cho vay.
- `teller1`: có thể đăng ký hồ sơ vay và thu nợ, nhưng **không** có nút Duyệt/Từ chối/Giải ngân (chỉ Loan Officer/Admin có).

---

## 6. Lãi suất

Đăng nhập `admin` (các vai trò khác chỉ xem được, không sửa).

1. Vào **Lãi suất** → xem 2 nhóm: **Lãi suất tiết kiệm** (6 mức theo kỳ hạn) và **Lãi suất cho vay** (5 loại vay).
2. Bấm **Sửa** trên 1 thẻ lãi suất → đổi giá trị % → lưu → kiểm tra thẻ cập nhật ngay.
3. Thử tắt công tắc **Đang áp dụng** của 1 mức lãi suất → lưu → mở lại trang **Mở sổ tiết kiệm** → kiểm tra loại kỳ hạn đó không còn hiển thị lãi suất hợp lệ (hoặc báo lỗi khi chọn).
4. Đăng nhập `teller1` → vào trang Lãi suất → xem được nhưng không thấy nút **Sửa**.

---

## 7. Giao dịch & biên lai

1. Vào **Giao dịch** (mọi vai trò đều xem được) → thấy nhật ký hợp nhất của mọi loại giao dịch (gửi tiền, rút tiền, giải ngân, thu nợ...) đã thực hiện ở các bước trên.
2. Lọc theo **Loại giao dịch**, tìm theo **số biên lai**.
3. Bấm vào 1 dòng giao dịch → xem **biên lai điện tử** hiện lên dạng dialog, đầy đủ thông tin khách hàng, số tiền, thời gian.
4. Bấm **In biên lai** → kiểm tra hộp thoại in của trình duyệt hiện ra đúng nội dung biên lai (phần nút bấm tự ẩn khi in nhờ CSS `@media print`).

---

## 8. Báo cáo thống kê

1. **Dashboard** (trang chủ sau khi đăng nhập): kiểm tra các thẻ số liệu (tổng khách hàng, số dư tiết kiệm, dư nợ cho vay, khoản vay quá hạn...) và 4 biểu đồ (doanh số theo tháng, cơ cấu dư nợ theo loại vay, cơ cấu tiết kiệm theo kỳ hạn, trạng thái khoản vay) hiển thị đúng dữ liệu vừa thao tác ở các bước trên.
2. Vào **Báo cáo thống kê** → chọn khoảng **Từ ngày / Đến ngày** (vd. từ đầu tháng đến hôm nay) → bấm **Xem báo cáo**.
3. ✅ Kiểm tra: biểu đồ tròn tổng hợp theo loại giao dịch, biểu đồ cơ cấu khách hàng theo giới tính, và bảng chi tiết giao dịch trong khoảng thời gian đã chọn — số liệu phải khớp với các giao dịch bạn vừa tạo trong khoảng thời gian test.

---

## 9. Thông báo

1. Thực hiện lại vài hành động sinh thông báo: đăng ký hồ sơ vay mới, duyệt/từ chối hồ sơ, để 1 khoản vay quá hạn.
2. Bấm biểu tượng 🔔 ở góc phải Topbar (mọi trang) → kiểm tra danh sách thông báo hiện đúng, thông báo chưa đọc có nền vàng nhạt và số đếm đỏ (badge) trên chuông.
3. Bấm **Đánh dấu đã đọc** → badge số lượng chưa đọc về 0, nền thông báo cũ trở về trắng.

---

## 10. Nhật ký hệ thống (Audit Log) *(chỉ Admin)*

1. Đăng nhập `admin` → vào **Nhật ký hệ thống**.
2. ✅ Kiểm tra toàn bộ hành động bạn đã thực hiện xuyên suốt quá trình test ở trên đều được ghi lại: đăng nhập/đăng xuất, đăng nhập sai mật khẩu, mở sổ tiết kiệm, gửi/rút tiền, tất toán, duyệt/từ chối/giải ngân/thu nợ khoản vay, tạo/sửa/khóa người dùng, tạo/sửa khách hàng, đổi lãi suất...
3. Tìm theo **tên đăng nhập** để lọc nhật ký của 1 người dùng cụ thể.
4. Đăng nhập `teller1`/`manager1` → menu **Nhật ký hệ thống** không hiển thị; truy cập trực tiếp URL `/audit-logs` → bị chuyển hướng.

---

## 11. Cấu hình hệ thống *(chỉ Admin)*

1. Vào **Cấu hình hệ thống** → thấy các tham số: tên ngân hàng, số lần đăng nhập sai tối đa, độ dài mật khẩu tối thiểu, lãi phạt trễ hạn vay/ngày, tỉ lệ lãi suất không kỳ hạn khi rút trước hạn, đơn vị tiền tệ, chế độ bảo trì.
2. Đổi **Số lần đăng nhập sai tối đa** từ `5` xuống `3` → lưu.
3. ✅ Kiểm tra hiệu lực ngay: đăng xuất, thử đăng nhập 1 tài khoản bất kỳ sai mật khẩu 3 lần → phải bị khóa (thay vì 5 lần như trước).
4. Thử bật/tắt công tắc **Chế độ bảo trì** → kiểm tra lưu thành công (giá trị Boolean).

---

## 12. Kiểm tra tổng thể giao diện (UI/UX)

- **Responsive**: thu nhỏ trình duyệt xuống độ rộng điện thoại → sidebar chuyển thành menu ẩn (bấm icon ☰ ở góc trái Topbar để mở).
- **Phân trang**: ở các bảng danh sách (Khách hàng, Tiết kiệm, Cho vay, Giao dịch...), đổi số dòng/trang, chuyển trang → dữ liệu load đúng, không lỗi.
- **Trạng thái rỗng**: lọc dữ liệu theo điều kiện chắc chắn không có kết quả → kiểm tra hiển thị thông báo "Không có dữ liệu" thay vì bảng trắng hoặc lỗi.
- **Trạng thái loading**: khi chuyển trang danh sách, kiểm tra vòng xoay loading hiển thị ngắn gọn trước khi dữ liệu hiện ra.

---

## 13. Kiểm thử qua API trực tiếp (tuỳ chọn, dành cho kiểm thử kỹ hơn)

Nếu muốn kiểm thử tầng backend độc lập với giao diện, dùng Postman/curl:

```bash
# Đăng nhập lấy token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Dùng token cho các API khác
curl http://localhost:4000/api/reports/summary \
  -H "Authorization: Bearer <TOKEN>"
```

Toàn bộ danh sách endpoint nằm trong `backend/src/routes/`, mỗi file tương ứng 1 module
(`authRoutes.js`, `customerRoutes.js`, `savingRoutes.js`, `loanRoutes.js`...).

---

## Ghi chú khi test lại từ đầu

Mỗi khi muốn có bộ dữ liệu sạch để test lại toàn bộ luồng, chạy lại:

```bash
cd backend
npm run seed
```

Lệnh này sẽ **xóa toàn bộ dữ liệu cũ** và tạo lại dữ liệu mẫu ban đầu (4 người dùng, 8 khách
hàng, 5 sổ tiết kiệm, 3 khoản vay ở các trạng thái khác nhau).
