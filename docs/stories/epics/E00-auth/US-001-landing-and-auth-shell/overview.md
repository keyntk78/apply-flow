# US-001 — Landing page + khung UI đăng nhập/đăng ký + nền tảng i18n

## Status

implemented

## Lane

normal

## Product Contract

Khách chưa đăng nhập vào được trang Landing công khai giới thiệu Apply Flow, đọc
được nội dung bằng **Tiếng Việt hoặc English**, và bấm được nút dẫn tới
`/sign-in` / `/sign-up`. Hai route đó tồn tại và hiển thị khung giao diện
(branding + tiêu đề + vùng trống chờ form), **chưa xác thực gì cả**.

## Relevant Product Docs

- [docs/product/overview.md](../../../../product/overview.md) — Marketing
  (public) domain: Landing, Pricing. Ranh giới màn hình public.
- [docs/product/auth.md](../../../../product/auth.md) — Landing/Login/Register là
  route public. Story này **không** hiện thực hành vi auth trong đó.
- [docs/product/settings.md](../../../../product/settings.md) — Language VI/EN.

## Ranh giới với US-000 (quan trọng)

Story này **không chạm hard gate auth**:

- Không có input mật khẩu, không có form đăng nhập tự xây.
- Không có session, cookie, token, middleware bảo vệ route.
- Không cài `@clerk/nextjs`, không gọi Clerk SDK.

`/sign-in` và `/sign-up` chỉ là **vỏ UI**: một slot rỗng để
[US-000](../US-000-clerk-auth/overview.md) thả `<SignIn/>` / `<SignUp/>` của
Clerk vào sau. Điều này giữ đúng
[decision 0008](../../../../decisions/0008-clerk-authentication.md) (Clerk sở hữu
toàn bộ đăng ký/đăng nhập/phiên — app không tự xây auth).

Con người đã xác nhận hướng này ở intake #3.

## Acceptance Criteria

- `/` hiển thị landing giới thiệu: hero, nêu vấn đề (thay thế Excel), các trạng
  thái job trong SPEC, CTA dẫn tới `/sign-up` và `/sign-in`.
- Chuyển ngôn ngữ VI ↔ EN trên landing đổi toàn bộ văn bản giao diện, không
  reload trang.
- Ngôn ngữ mặc định ban đầu là **Tiếng Việt** (settings.md ủy quyền cho story
  triển khai chọn + ghi chú lại — đây là ghi chú đó).
- Lựa chọn ngôn ngữ còn giữ sau khi refresh, lưu bằng **cookie** (không phải
  localStorage): root layout đọc cookie ở phía server nên lần sơn đầu tiên đã
  đúng ngôn ngữ. localStorage chỉ đọc được sau khi hydrate → hoặc lệch hydrate,
  hoặc người dùng EN thấy nháy tiếng Việt.
- Người dùng đổi được giao diện **Sáng / Tối / Theo hệ thống** bằng nút trên
  header; lựa chọn còn giữ sau refresh.
- `/sign-in` và `/sign-up` render khung UI + link qua lại, **không** có form
  mật khẩu.
- Landing dùng đúng bộ trạng thái job của overview.md:
  `Saved → Preparing → Applied → Interview → Offer → Rejected` (+ `Archived`).
- Không có route nào bị bảo vệ, không có gọi mạng, không cần biến môi trường.

## Design Notes

- Commands: (không có — story chỉ có UI đọc.)
- Queries: (không có — chưa có dữ liệu thật.)
- API: (không có.)
- Tables: (không có — không đụng schema/migration.)
- Domain rules: bộ trạng thái job chỉ được hiển thị, lấy từ overview.md.
- UI surfaces:
  - `src/features/marketing/` — feature mới cho domain Marketing (public).
  - `src/features/auth/components/auth-shell.tsx` — vỏ UI dùng chung cho
    sign-in/sign-up.
  - `src/lib/i18n/` — shared: từ điển VI/EN + Zustand store locale (được cả
    marketing và settings dùng sau này → lift lên shared theo features/README).
  - `src/lib/providers/query-provider.tsx` — QueryClientProvider (từ intake #2).
  - `src/lib/providers/theme-provider.tsx` — next-themes, chiến lược `class`.
  - `src/components/logo-mark.tsx` + `src/app/icon.svg` — logo dạng SVG.

## Quyết định thiết kế đáng ghi lại

- **Theme dùng hệ token của shadcn làm nguồn duy nhất** (`background`,
  `foreground`, `primary`, `muted`, …). Ban đầu có một bộ token song song
  (`paper`/`ink`/`signal`); `shadcn init` định nghĩa đè `--muted` (của mình là
  màu *chữ*, của shadcn là màu *nền*) → gộp về một bộ để không có hai bảng màu
  đánh nhau.
- **Không dùng Geist.** `shadcn init` tự cắm Geist làm `--font-sans`, nhưng Geist
  **không có subset `vietnamese`** — chữ Việt sẽ rơi về font hệ thống giữa câu.
  Thay bằng **Be Vietnam Pro** (body, vẽ riêng cho dấu tiếng Việt),
  **Bricolage Grotesque** (display), **JetBrains Mono** (dữ liệu tracker). Cả ba
  đều có subset `vietnamese`.
- **Màu status phải né màu brand.** Logo là xanh dương + xanh lá, trùng với
  `applied` (blue) và `offer` (green). `applied` đổi sang cyan; `offer` giữ xanh
  lá vì đó là chỗ duy nhất màu brand và màu status nói cùng một nghĩa.
- **Bỏ skip-link** theo yêu cầu người dùng. Đây vốn là tiện ích cho người dùng
  bàn phím (ẩn tới khi Tab) — nếu cần khôi phục thì đặt lại ở dạng ít lộ hơn.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Từ điển VI/EN có cùng bộ khóa (không thiếu bản dịch); store locale đổi + persist đúng. |
| Integration | (Chưa có backend/dữ liệu — không áp dụng ở story này.) |
| E2E | Landing render; bấm đổi VI↔EN đổi văn bản; điều hướng `/` → `/sign-up` → `/sign-in`. |
| Platform | `pnpm build` pass; landing là static/server component, không lỗi hydrate. |
| Release | (Chưa deploy.) |

## Harness Delta

- CLAUDE.md / AGENTS.md §2 nói "There is no application code yet" — **đã lỗi
  thời**, repo đã có scaffold Next.js. §5 nói harness-cli bị Windows Application
  Control chặn — cũng đã lỗi thời, CLI chạy được trên máy này.
- `docs/product/` chưa có hợp đồng cho domain Marketing (overview.md ghi "chưa có
  hợp đồng"). Story này tạo màn hình Landing trước khi có hợp đồng — đề xuất
  backlog: viết `docs/product/marketing.md`.

## Evidence

Bổ sung sau khi verify.
