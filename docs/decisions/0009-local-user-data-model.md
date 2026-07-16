# 0009 Mô hình dữ liệu User cục bộ và nền tảng Postgres cục bộ

Date: 2026-07-16

## Status

Accepted

## Context

US-000 cần bảng `User` cục bộ (SPEC §9) làm bản sao danh tính Clerk, để
`Application` (epic E01) có khóa ngoại ổn định. Story thuộc lane high-risk với ba
hard gate: auth, external provider (Clerk), và migration khởi tạo.

Ba điểm cần chốt:

1. `email` có nên là unique không — [design.md](../stories/epics/E00-auth/US-000-clerk-auth/design.md)
   bản đầu ghi unique cho cả `clerkUserId` và `email`.
2. Dev local chạy DB gì, khi production là Neon.
3. Cơ chế đồng bộ `User` từ Clerk.

Ràng buộc phát sinh khi triển khai: Prisma cài về là **v7**, khác đáng kể so với
giả định trong design (viết theo cú pháp v6).

## Decision

1. **`clerkUserId` unique; `email` chỉ index thường.** `email` là bản sao đồng bộ,
   không phải khóa danh tính.
2. **Postgres thuần trong Docker cho local** (`docker-compose.yml`), Neon giữ vai
   trò production/preview. Không dùng Neon Local — nó là proxy tới Neon cloud, cần
   `NEON_API_KEY` + `NEON_PROJECT_ID` và internet, tức không phải môi trường offline.
3. **Đồng bộ lười** ở request đã xác thực đầu tiên (`requireCurrentUser`), không
   dùng webhook. Đúng khuyến nghị MVP của design.
4. Env được **parse bằng zod** tại boundary (`src/lib/env.ts`), fail sớm với tên
   biến thiếu thay vì lỗi mờ từ Prisma/Clerk.

## Alternatives Considered

1. **`email` unique** (như design bản đầu): loại bỏ. Clerk đã đảm bảo duy nhất phía
   nó; ràng buộc cục bộ sẽ biến một lần đổi email trên Clerk — hoặc hai identity
   cùng địa chỉ chưa link — thành P2002 **chặn đăng nhập**. Để ràng buộc DB làm
   hỏng luồng auth là cái giá không tương xứng với lợi ích.
2. **Neon Local qua Docker**: cần tài khoản Neon + API key + internet; không đáp
   ứng mục tiêu "chạy được offline".
3. **Webhook Clerk**: dữ liệu tươi hơn, nhưng thêm endpoint công khai + secret ký.
   Là stop condition trong execplan; để dành khi thực sự cần đồng bộ tức thời.
4. **Không có bảng User cục bộ**: loại bỏ — Application cần khóa ngoại ổn định.

## Consequences

Positive:

- Đăng nhập không thể bị chặn bởi ràng buộc email cục bộ; có test chứng minh hai
  identity dùng chung email vẫn tạo được hai row.
- `EnsureLocalUser` idempotent (upsert theo `clerkUserId`), an toàn khi gọi mỗi
  request; đã test 3 lần gọi đồng thời không sinh trùng, không ném P2002.
- Dev và test chạy offline; test dùng database `applyflow_test` riêng nên không
  bao giờ xóa dữ liệu dev.

Tradeoffs:

- Profile chỉ cập nhật khi user quay lại app (hệ quả của đồng bộ lười).
- Local là Postgres 17 thuần, không có storage layer/branching của Neon — khác biệt
  hành vi (ví dụ giới hạn connection, độ trễ) chỉ lộ ra ở môi trường thật.
- Prisma 7: URL datasource nằm ở `prisma.config.ts`, **không có `directUrl`**. Khi
  migrate lên Neon phải trỏ `DATABASE_URL` vào connection string *unpooled*.
- Prisma 7 bắt buộc driver adapter (`@prisma/adapter-pg`).

## Follow-Up

- Chạy E2E khi có key Clerk thật; hiện cột `e2e` = 0.
- Cấu hình env Clerk + `DATABASE_URL` (Neon, unpooled cho migrate) trên Vercel.
- Cân nhắc `@clerk/themes` để form Clerk khớp theme sáng/tối.
- Nếu cần đồng bộ tức thời, mở lại phương án webhook (kèm xác nhận của người).
