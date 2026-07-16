# Validation — US-000 Xác thực bằng Clerk

## Proof Strategy (chiến lược bằng chứng)

Story hoàn thành khi: luồng đăng ký/đăng nhập bằng Email và Google hoạt động,
bản ghi `User` cục bộ được tạo/đồng bộ đúng, và route được bảo vệ chặn người dùng
chưa đăng nhập. Vì đây là hard gate (auth), cần bằng chứng ở nhiều lớp, không chỉ
unit.

## Test Plan

| Lớp | Trường hợp |
| --- | --- |
| Unit | Use-case EnsureLocalUser: tạo mới khi chưa có; cập nhật email/tên/avatar khi đã có; ánh xạ đúng từ danh tính Clerk. |
| Integration | Truy vấn `getCurrentUser()` trả về User đúng theo `clerkUserId`; ràng buộc duy nhất `clerkUserId` được tôn trọng; ghi vào Neon/Prisma thành công. |
| E2E | Đăng ký bằng Email → vào Dashboard; đăng nhập bằng Google → vào Dashboard; truy cập route được bảo vệ khi chưa đăng nhập → chuyển hướng về đăng nhập. |
| Platform | Middleware Clerk chạy đúng trên Next.js App Router; biến môi trường có mặt khi build/deploy Vercel. |
| Performance | (Không phải trọng tâm MVP.) |
| Logs/Audit | Không log token/secret; lỗi đồng bộ user được ghi vào application log. |

## Fixtures

- Người dùng test xác định trước trong Clerk (một Email, một Google).
- Cơ sở dữ liệu Neon/Prisma test sạch cho integration.
- (Nếu dùng webhook) payload `user.created`/`user.updated` mẫu đã ký để test xác
  minh chữ ký.

## Commands

Bổ sung sau khi có scaffold Next.js + script. Dự kiến:

```text
TBD — ví dụ: pnpm test:unit, pnpm test:integration, pnpm test:e2e
```

Cập nhật proof durable (numeric booleans):

```text
scripts\bin\harness-cli.exe story update --id US-000-clerk-auth --unit 1 --integration 1 --e2e 1 --platform 1
```

## Acceptance Evidence

Bổ sung kết quả (log chạy test, ảnh chụp luồng đăng nhập) sau khi verify.
