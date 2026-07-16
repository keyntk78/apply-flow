# Hợp đồng sản phẩm — Xác thực (Authentication)

Dẫn xuất từ [SPEC.md](../../SPEC.md) §6.1, §9 (User). Quyết định về nhà cung cấp:
[decisions/0008-clerk-authentication.md](../decisions/0008-clerk-authentication.md).

## Hành vi

Việc xác thực do **Clerk** đảm nhiệm. Ứng dụng không tự lưu mật khẩu và không tự
quản lý phiên đăng nhập; app tin tưởng Clerk là nhà cung cấp danh tính.

### Đăng ký / Đăng nhập

- Phương thức: **Email** và **Google**.
- Đăng ký và đăng nhập dùng chung hai phương thức này.
- Sau khi xác thực thành công, người dùng vào thẳng Dashboard.

### Hồ sơ (Profile)

Người dùng có thể xem và quản lý danh tính của mình:

- Avatar
- Họ tên
- Email

### Bản ghi User (SPEC §9)

App giữ một bản ghi `User` cục bộ, được đồng bộ từ Clerk:

| Trường | Ghi chú |
| --- | --- |
| id | Khóa chính cục bộ |
| clerkUserId | Duy nhất; liên kết tới danh tính Clerk |
| email | Lấy từ Clerk |
| fullName | Lấy từ Clerk |
| avatarUrl | Lấy từ Clerk |
| createdAt / updatedAt | Mốc thời gian |

## Quy tắc

- Mọi màn hình không public đều yêu cầu người dùng đã đăng nhập. Màn hình public:
  Landing, Pricing, Login, Register.
- Phải tồn tại một bản ghi `User` cục bộ cho người dùng Clerk đang đăng nhập
  **trước khi** tạo bất kỳ Application nào (Application thuộc sở hữu theo `userId`).
- Bản ghi `User` cục bộ được tạo/đồng bộ ở request đã xác thực đầu tiên (hoặc qua
  webhook của Clerk) — cơ chế cụ thể là quyết định thiết kế trong story auth.

## Không thuộc phạm vi (MVP)

- Vai trò / phân quyền / phạm vi đa tổ chức (chỉ một người dùng cá nhân).
- Chính sách mật khẩu riêng, cấu hình MFA, hay quản lý phiên (thuộc về Clerk).
- Luồng xóa tài khoản / xuất dữ liệu.
