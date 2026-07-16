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

```text
pnpm db:up              # Postgres cục bộ (Docker)
pnpm db:migrate:test    # áp migration lên applyflow_test
pnpm test:unit          # mapping danh tính Clerk (thuần, không cần DB)
pnpm test:db            # Prisma + Postgres thật: upsert, ràng buộc, đồng thời
pnpm verify             # lint + typecheck + toàn bộ test
```

Cập nhật proof durable (numeric booleans):

```text
scripts\bin\harness-cli.exe story update --id US-000-clerk-auth --unit 1 --integration 1 --platform 1
```

## Acceptance Evidence

Đã chạy ngày 2026-07-16:

- `pnpm verify` → lint sạch, typecheck sạch, **78 test / 12 file đều pass**.
- `pnpm test:db` → **8/8 pass** trên Postgres 17 thật, gồm: tạo mới, idempotent,
  làm mới profile, giữ `createdAt`, xóa tên khi Clerk xóa, **hai identity dùng
  chung email** (chứng minh quyết định bỏ unique trên `email`), **ba lần gọi đồng
  thời không sinh trùng và không ném P2002**, và ràng buộc unique trên
  `clerkUserId` được tôn trọng.
- `pnpm build` → build thành công; `/dashboard`, `/sign-in`, `/sign-up` được sinh,
  proxy (route protection) đăng ký đúng.

Bổ sung cùng ngày (lấp phần unit/e2e còn thiếu):

- `tests/unit/auth/get-current-user.test.ts` → wiring của `getCurrentUser` /
  `requireCurrentUser`: chỉ mock Clerk và Prisma, còn `toClerkIdentity` +
  `ensureLocalUser` chạy thật, nên test chứng minh một session Clerk sinh ra đúng
  lệnh upsert khóa trên `clerkUserId`.
- `tests/unit/auth/proxy.test.ts` → allowlist route: Landing/Pricing/sign-in/
  sign-up public (kể cả sub-step của Clerk như `/sign-in/factor-one`), Dashboard
  và route chưa khai báo đều bị bảo vệ. `createRouteMatcher` để thật, chỉ mock
  `clerkMiddleware`.
- `tests/unit/env.test.ts` → `getServerEnv` gọi tên đúng biến thiếu, bắt được lỗi
  tráo `sk_`/`pk_`, và **không bao giờ in giá trị biến ra message** (đây là
  Logs/Audit proof trong bảng trên).
- `pnpm test:e2e` → **11/11 pass** trên bản production build với Clerk test
  instance thật:
  - Đăng ký bằng Email → vào `/dashboard` (dùng địa chỉ `+clerk_test` và mã
    `424242` của Clerk test mode; `setupClerkTestingToken` để vượt bot
    protection).
  - Truy cập `/dashboard` khi chưa đăng nhập → redirect về `/sign-in`.
  - Form Clerk mount thật trên `/sign-in` và `/sign-up`.

Đã sửa một **false green**: `tests/e2e/landing.spec.ts` khẳng định `/sign-in` có
0 input — đúng ở thời US-001 (chỉ có shell), nhưng US-000 đã mount form Clerk.
Test vẫn xanh chỉ vì nó chạy trước khi Clerk render xong. Thực tế `/sign-in` có 2
input (`identifier`, `password`). Đã thay bằng assertion form Clerk mount được;
luật "shell của ta không thu thập credential" (decision 0008) vẫn được giữ ở
`tests/integration/auth-shell.test.tsx`, nơi kiểm được một cách trung thực.

Chưa có (nêu rõ, không tính là proof):

- **Đăng nhập Google chưa tự động hóa được**: Clerk chuyển sang màn hình consent
  của Google, nơi chặn trình duyệt tự động và testing token không áp dụng. Đánh
  dấu `test.fixme` trong `tests/e2e/auth.spec.ts`; cần một lượt kiểm thủ công.
- Platform proof mới ở mức build cục bộ; chưa deploy Vercel với env thật. Cột
  `plat` vì vậy vẫn để `0`.
