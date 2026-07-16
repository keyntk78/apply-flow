# Apply Flow

Ứng dụng web giúp người tìm việc quản lý toàn bộ quá trình ứng tuyển tại một
nơi: lưu công việc quan tâm, theo dõi trạng thái từng đơn, ghi chú, và quản lý
pipeline tìm việc bằng giao diện trực quan.

Nói ngắn gọn: thay thế cái file Excel/Google Sheet mà ai cũng đang dùng để theo
dõi đơn ứng tuyển.

MVP v1.0 là **job tracker thuần — chưa có AI**. Các tính năng AI được dời sang
v2/v3 một cách có chủ đích.

Đặc tả sản phẩm đầy đủ: [SPEC.md](SPEC.md).

## Tính năng trong MVP

- **Xác thực** bằng Clerk (Email + Google).
- **Dashboard** — tổng hợp theo trạng thái, đơn mới cập nhật, đơn sắp đến hạn.
- **Quản lý đơn ứng tuyển** — tạo / sửa / xóa / tìm kiếm / lọc / sắp xếp.
- **Kanban** — kéo thả đơn giữa các cột trạng thái.
- **Profile** và **Settings** (giao diện Sáng/Tối/Theo hệ thống; ngôn ngữ VI/EN).

Vòng đời trạng thái của một đơn — cũng chính là các cột Kanban:

`Saved → Preparing → Applied → Interview → Offer → Rejected`, cộng thêm
`Archived`.

Ngoài phạm vi MVP: AI (phân tích JD, so khớp CV↔JD, sinh email/cover letter),
quản lý CV, lịch/nhắc nhở, quản lý phỏng vấn, extension trình duyệt, tích hợp
Gmail/Google Calendar, analytics nâng cao.

## Công nghệ

| Lớp | Lựa chọn |
| --- | --- |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui |
| State/Data | TanStack Query, Zustand |
| Auth | Clerk |
| Database | PostgreSQL (Neon ở production) + Prisma ORM |
| Test | Vitest (unit/integration/db), Playwright (e2e) |
| Deploy | Vercel |

## Yêu cầu

- **Node.js** 20 trở lên
- **pnpm** (`corepack enable`)
- **Docker** — để chạy Postgres cục bộ; không cần nếu bạn tự trỏ vào một Postgres khác
- Một **Clerk application** (bản test miễn phí là đủ)

## Chạy dự án

```bash
# 1. Cài dependency (postinstall tự chạy `prisma generate`)
pnpm install

# 2. Tạo file cấu hình, rồi mở ra điền
cp .env.example .env

# 3. Bật Postgres cục bộ
pnpm db:up

# 4. Tạo schema cho database
pnpm db:migrate

# 5. Chạy dev server → http://localhost:3000
pnpm dev
```

### Điền `.env`

`.env.example` là bản mẫu đã có sẵn chú thích. Hai thứ bạn phải tự lấy:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` và `CLERK_SECRET_KEY` — lấy ở
  [dashboard.clerk.com](https://dashboard.clerk.com) → **API keys**. Trong Clerk,
  bật **Email** và **Google** ở phần *User & Authentication*.
  `CLERK_SECRET_KEY` là credential thật: không commit, không log.
- `DATABASE_URL` / `TEST_DATABASE_URL` — giá trị mặc định trong `.env.example` đã
  khớp với `docker-compose.yml`, thường không cần sửa.

Một lưu ý hay làm mất thời gian: cổng host mặc định là **5433**, không phải 5432.
Nếu máy bạn đã có Postgres cài sẵn chiếm 5432, nó sẽ âm thầm che mất container và
bạn nhận lỗi "password authentication failed" trong khi container vẫn khỏe. Đổi
`POSTGRES_PORT` thì nhớ đổi cả các URL bên dưới nó.

App đọc `.env` (không phải `.env.local`) vì Prisma CLI chỉ đọc những gì
`prisma.config.ts` nạp qua dotenv — dùng một file để app và CLI không bất đồng về
database.

## Kiểm thử

```bash
pnpm verify           # lint + typecheck + toàn bộ test — chạy trước khi commit
```

Hoặc chạy riêng từng lớp:

```bash
pnpm test:unit        # logic thuần: không DOM, không I/O
pnpm test:integration # component ghép với nhau (jsdom)
pnpm test:db          # Prisma + Postgres thật (cần `pnpm db:up`)
pnpm test:e2e         # Playwright, chạy trên bản production build
```

Vài điều nên biết trước khi chạy:

- `pnpm test:db` **truncate** bảng trong `TEST_DATABASE_URL` mỗi lần chạy. Setup
  từ chối chạy nếu nó trùng `DATABASE_URL`, nên bạn không thể vô tình xóa
  database đang phát triển.
- `pnpm test:e2e` tự `pnpm build && pnpm start` trên cổng 3210. Test auth cần key
  Clerk trong `.env`; thiếu key thì chúng tự skip chứ không làm đỏ cả suite.
- Test đăng ký bằng Email dùng quy ước test-mode của Clerk: địa chỉ chứa
  `+clerk_test`, mã xác minh cố định `424242` — không cần hòm thư thật.
- Đăng nhập Google **không** được tự động hóa: Clerk chuyển sang màn hình consent
  của Google, nơi chặn trình duyệt tự động. Phần này phải kiểm tra thủ công.

## Các lệnh khác

| Lệnh | Việc nó làm |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Build và chạy bản production |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm db:up` / `pnpm db:down` | Bật/tắt Postgres trong Docker (`down` giữ nguyên dữ liệu) |
| `pnpm db:migrate` | Áp migration vào database dev |
| `pnpm db:migrate:test` | Áp migration vào `applyflow_test` |
| `pnpm db:studio` | Prisma Studio |

## Cấu trúc thư mục

```text
src/
  app/          Route của App Router (Landing, sign-in, sign-up, Dashboard)
  proxy.ts      Bảo vệ route — tên Next.js 16 dùng thay cho middleware.ts
  features/     Code sản phẩm chia theo feature — xem src/features/README.md
  lib/          Hạ tầng dùng chung: Prisma client, env (zod), i18n, providers
prisma/         schema.prisma + migrations
tests/
  unit/         Logic thuần
  integration/  Component ghép với nhau
  db/           Prisma + Postgres thật
  e2e/          Playwright
docs/           Tài liệu vận hành dành cho coding agent
```

## Đóng góp

Commit theo [Conventional Commits](https://www.conventionalcommits.org/);
commitlint và lint-staged chạy qua husky ở `pre-commit`. Chạy `pnpm verify` trước
khi mở PR.

Repo này còn mang theo một **harness dành cho coding agent** (Claude Code, Codex,
Cursor…): quy ước đọc gì trước, cách phân loại rủi ro, và yêu cầu bằng chứng cho
mỗi thay đổi. Nếu bạn là người, phần trên đã đủ để bắt đầu; nếu bạn là agent, đọc
[CLAUDE.md](CLAUDE.md) (hoặc `AGENTS.md` — hai file giống hệt nhau) và
[docs/HARNESS.md](docs/HARNESS.md).
