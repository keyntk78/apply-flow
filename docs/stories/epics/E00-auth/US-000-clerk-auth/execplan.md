# Exec Plan — US-000 Xác thực bằng Clerk

## Goal (mục tiêu)

Người dùng đăng ký/đăng nhập bằng Email hoặc Google qua Clerk; có bản ghi `User`
cục bộ; route không public được bảo vệ.

## Scope (phạm vi)

In scope:

- Tích hợp Clerk vào Next.js (provider + middleware).
- Màn hình đăng nhập/đăng ký (component Clerk).
- Prisma model `User` + migration đầu tiên trên Neon.
- Use-case đồng bộ `User` cục bộ + truy vấn `getCurrentUser()`.
- Bảo vệ route và chuyển hướng khi chưa đăng nhập.

Out of scope:

- CRUD Application (E01) và mọi hành vi trạng thái job.
- Vai trò/phân quyền, xóa tài khoản, MFA.
- UI Profile/Settings đầy đủ.

## Risk Classification

Risk flags:

- Auth (đăng nhập/đăng ký/phiên).
- Data model (bảng `User` + migration đầu tiên).
- External systems (Clerk, Neon).
- Multi-domain (chạm auth + nền tảng dữ liệu).

Hard gates:

- **Auth** → high-risk.
- **External provider** (Clerk) → high-risk.
- **Data migration** (migration khởi tạo) → high-risk.

Vì có hard gate: cần quyết định durable —
[decisions/0008-clerk-authentication.md](../../../../decisions/0008-clerk-authentication.md).

## Work Phases (các pha công việc)

1. Discovery — xác nhận stack Next.js App Router, chuẩn bị dự án Clerk + Neon.
2. Design — chốt cơ chế đồng bộ user (lazy vs webhook) — mặc định lazy.
3. Validation planning — xem [validation.md](validation.md).
4. Implementation — dựng Next.js app, cài Clerk, Prisma schema `User`, middleware.
5. Verification — chạy test theo test plan; kiểm tra thủ công luồng đăng nhập.
6. Harness update — cập nhật proof qua CLI, ghi trace.

## Stop Conditions (điều kiện dừng để hỏi người)

Dừng và hỏi xác nhận nếu:

- Cần chuyển sang cơ chế webhook (thêm endpoint công khai + secret).
- Yêu cầu về xác thực/bảo mật thay đổi so với hợp đồng auth.
- Phát sinh rủi ro mất/di trú dữ liệu ngoài migration khởi tạo.
- Hướng kiến trúc thay đổi (ví dụ bỏ bảng User cục bộ).
