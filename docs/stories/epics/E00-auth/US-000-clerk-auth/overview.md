# US-000 — Xác thực bằng Clerk (Email + Google)

## Trạng thái

in_progress — code đã xong và có proof unit/integration; **chờ key Clerk để chạy
E2E** rồi mới `story complete`.

## Current Behavior (hiện trạng)

Đã có: Postgres cục bộ qua Docker, Prisma model `User` + migration đầu tiên,
`EnsureLocalUser` (đồng bộ lười, idempotent), `getCurrentUser`/`requireCurrentUser`,
Clerk provider + form đăng nhập/đăng ký, bảo vệ route qua `src/proxy.ts`, và
`/dashboard` tối thiểu làm điểm đồng bộ.

Chưa có: key Clerk thật trong `.env`, nên luồng đăng nhập chưa chạy end-to-end.

## Target Behavior (mục tiêu)

Người dùng có thể đăng ký và đăng nhập bằng **Email** hoặc **Google** thông qua
Clerk. Sau khi đăng nhập, một bản ghi `User` cục bộ tồn tại (đồng bộ từ Clerk) và
người dùng vào được Dashboard. Các màn hình không public đều yêu cầu đăng nhập.

## Affected Users (đối tượng ảnh hưởng)

- Người tìm việc cá nhân (người dùng duy nhất của MVP).

## Affected Product Docs

- [docs/product/auth.md](../../../../product/auth.md) — hợp đồng chính.
- [docs/product/overview.md](../../../../product/overview.md) — luồng đăng nhập,
  ranh giới màn hình public/không public.

## Non-Goals (không làm trong story này)

- CRUD Application (thuộc epic E01).
- Vai trò / phân quyền / đa tổ chức.
- Xóa tài khoản, xuất dữ liệu, cấu hình MFA.
- Màn hình Profile đầy đủ (chỉ cần đủ để hiển thị danh tính; UI hoàn chỉnh có thể
  tách story riêng nếu cần).
