# BSLMS – Banking Savings & Loan Management System

Hệ thống quản lý Tiết kiệm &amp; Cho vay ngân hàng — xây dựng lại theo tài liệu SRS bạn cung cấp,
sử dụng **Node.js / Express / SQLite** cho backend (thay cho Java Spring Boot / MySQL để có thể
chạy thử ngay lập tức mà không cần cài đặt Maven/MySQL) và **React + Vite + Material UI** cho
frontend.

Kiến trúc phân lớp **Controller → Service → Model (Repository)** được giữ nguyên như thiết kế gốc,
cùng đầy đủ các module: Xác thực & RBAC, Quản lý người dùng, Khách hàng, Tiết kiệm, Cho vay,
Lãi suất, Giao dịch & biên lai, Báo cáo thống kê, Thông báo, Nhật ký hệ thống (Audit Log), Cấu
hình hệ thống.

## 1. Yêu cầu môi trường

- Node.js 18 trở lên (khuyến nghị 20+)
- npm 9 trở lên

Không cần cài đặt MySQL — dữ liệu được lưu trong file SQLite tại `backend/data/bslms.sqlite`
(tự động tạo khi chạy).

## 2. Cài đặt & chạy Backend

```bash
cd backend
npm install
npm run seed     # tạo lại CSDL + dữ liệu mẫu (bắt buộc chạy lần đầu)
npm start        # khởi động API tại http://localhost:4000
```

Kiểm tra: mở `http://localhost:4000/api/health` phải trả về `{"status":"UP"}`.

### Tài khoản đăng nhập mẫu (sau khi seed)

| Vai trò              | Tên đăng nhập  | Mật khẩu     |
|-----------------------|----------------|--------------|
| Quản trị viên          | `admin`        | `Admin@123`  |
| Giao dịch viên         | `teller1`      | `Teller@123` |
| Chuyên viên tín dụng   | `loanofficer1` | `Loan@123`   |
| Quản lý                | `manager1`     | `Manager@123`|

## 3. Cài đặt & chạy Frontend

Mở một terminal khác (giữ backend đang chạy):

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

Frontend đã cấu hình sẵn proxy `/api` → `http://localhost:4000` (xem `vite.config.js`), nên
không cần chỉnh sửa gì thêm. Truy cập `http://localhost:5173` và đăng nhập bằng tài khoản mẫu ở
trên (trang đăng nhập cũng có nút điền nhanh tài khoản demo).

## 4. Cấu trúc thư mục

```
bslms/
├── backend/
│   ├── src/
│   │   ├── config/        # cấu hình DB, hằng số hệ thống
│   │   ├── models/        # Sequelize models (User, Customer, SavingAccount, Loan, ...)
│   │   ├── middleware/     # auth (JWT), rbac, error handler
│   │   ├── services/       # nghiệp vụ (business logic)
│   │   ├── controllers/    # xử lý HTTP request/response
│   │   ├── routes/         # định tuyến REST API
│   │   ├── utils/          # tính lãi suất, sinh mã, phân trang...
│   │   └── seed/           # script tạo dữ liệu mẫu
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/            # axios client + endpoint definitions
    │   ├── components/     # layout, common components, form dialogs theo module
    │   ├── context/        # AuthContext (JWT, user state)
    │   ├── pages/           # các trang chính của ứng dụng
    │   ├── theme/           # MUI theme (bản sắc thị giác Navy + Gold)
    │   └── utils/           # format, labels, hooks dùng chung
    └── package.json
```

## 5. Các nghiệp vụ đã triển khai

- **Xác thực & phân quyền**: đăng nhập JWT, khóa tài khoản sau N lần sai mật khẩu, quên/đặt lại
  mật khẩu qua mã xác nhận, đổi mật khẩu, RBAC theo 4 vai trò (Admin/Teller/Loan Officer/Manager).
- **Quản lý người dùng** (Admin): CRUD, khóa/mở khóa, đặt lại mật khẩu tạm thời.
- **Quản lý khách hàng**: CRUD, tìm kiếm/phân trang, xem hồ sơ 360° (sổ tiết kiệm, khoản vay,
  lịch sử giao dịch).
- **Tiết kiệm**: mở sổ, gửi thêm, rút tiền, tất toán (tự tính lãi đáo hạn hoặc phạt rút trước
  hạn), tái tục tự động nhập lãi vào gốc.
- **Cho vay**: đăng ký hồ sơ, thẩm định (duyệt/từ chối), giải ngân (tự sinh lịch trả nợ theo
  phương pháp dư nợ giảm dần), thu nợ từng kỳ (tự tính phạt trễ hạn), tất toán sớm, quét khoản
  vay quá hạn.
- **Lãi suất**: cấu hình lãi suất theo loại sản phẩm, lịch sử hiệu lực.
- **Giao dịch & biên lai**: nhật ký giao dịch hợp nhất, in biên lai.
- **Báo cáo thống kê**: dashboard tổng quan, doanh số theo tháng, cơ cấu tiết kiệm/cho vay, báo
  cáo theo khoảng thời gian tùy chọn.
- **Thông báo**: thông báo theo vai trò/người dùng (hồ sơ vay mới, quá hạn, đáo hạn...).
- **Nhật ký hệ thống (Audit Log)**: ghi lại mọi thao tác quan trọng, có thể tra cứu (Admin).
- **Cấu hình hệ thống**: các tham số vận hành (số lần đăng nhập sai tối đa, lãi phạt trễ hạn...).

## 6. Ghi chú chuyển sang Java Spring Boot / MySQL (nếu cần)

Toàn bộ nghiệp vụ được viết trong tầng `services/` độc lập với framework, có thể dùng làm đặc tả
để chuyển đổi 1:1 sang Spring Boot: mỗi service tương ứng một `@Service`, mỗi model Sequelize
tương ứng một `@Entity` JPA, mỗi route tương ứng một `@RestController`. Nếu bạn cần bản Java đầy
đủ, hãy yêu cầu ở lượt chat tiếp theo.
