# US-002 — Toolchain: lint, git hooks, và ba lớp bằng chứng

## Status

implemented

## Lane

normal

## Product Contract

Không phải hành vi sản phẩm. Đây là **hạ tầng bằng chứng**: biến các cột proof
trong `docs/TEST_MATRIX.md` (unit / integration / e2e) từ khái niệm thành lệnh
chạy được, và chặn code hỏng trước khi vào lịch sử git.

Trực tiếp xử lý risk flag **weak proof**: trước story này repo không có test
runner nào.

## Relevant Product Docs

- [docs/TEST_MATRIX.md](../../../../TEST_MATRIX.md) — từ vựng proof: unit phủ
  domain/application thuần; integration phủ ràng buộc và hành vi provider; e2e
  phủ luồng người dùng thấy được trên trình duyệt.

## Acceptance Criteria

- `pnpm test:unit` / `pnpm test:integration` / `pnpm test:e2e` chạy được — đúng
  tên script mà [US-000 validation.md](../US-000-clerk-auth/validation.md) đã ghi
  là "TBD" từ trước.
- Commit sai quy ước bị từ chối; commit đúng được chấp nhận.
- Trước mỗi commit: lint (staged), typecheck (toàn dự án), test (unit +
  integration).

## Design Notes

- **Vitest**, hai project:
  - `unit` — môi trường node, `tests/unit/**`. Không DOM, không I/O.
  - `integration` — jsdom, `tests/integration/**`. Component ráp với nhau.
  - Tách project (không phải một suite) vì harness ghi proof theo từng cột riêng.
- **Playwright** (`tests/e2e/**`) chạy trên **production build**, không phải
  `next dev`: locale cookie được đọc ở root layout phía server, và dev khác
  production đủ nhiều về cache/hydrate để bằng chứng dev không trung thực.
- **Husky**:
  - `pre-commit` — `lint-staged` → `typecheck` → `test`. E2E **cố ý không** nằm
    ở đây: nó build production + mở browser, tính bằng phút.
  - `commit-msg` — commitlint (Conventional Commits).
- `scope-enum` của commitlint bám đúng các seam thật của repo (feature slices +
  shared + repo-level), nên scope sai thường là dấu hiệu thay đổi đã lan ra ngoài
  chỗ nó khai báo.

## Validation

| Layer | Expected proof | Kết quả |
| --- | --- | --- |
| Unit | Runner chạy; dictionaries/locales/job-status có test | ✅ `pnpm test:unit` |
| Integration | jsdom + Testing Library render được component thật | ✅ `pnpm test:integration` |
| E2E | Playwright điều khiển Chromium thật trên bản build | ✅ 8/8 pass |
| Platform | `pnpm build` + `pnpm typecheck` sạch | ✅ |
| Release | (Chưa deploy.) | — |

## Harness Delta

- `docs/TEST_MATRIX.md` mô tả từ vựng proof nhưng không nói lệnh nào hiện thực
  hóa chúng. Nay đã có: `pnpm test:unit|test:integration|test:e2e`.
- Đề xuất: [US-000 validation.md](../US-000-clerk-auth/validation.md) đang ghi
  `Commands: TBD` — có thể thay bằng tên script thật.

## Evidence

```text
pnpm test        → 7 files, 29 tests passed (unit + integration)
pnpm test:e2e    → 8 passed (chromium, production build)
pnpm lint        → 0 problems
pnpm typecheck   → clean

echo "added some stuff"       | commitlint → ✖ type-empty, subject-empty
echo "feat(nonsense): thing"  | commitlint → ✖ scope-enum
echo "feat(marketing): ..."   | commitlint → accepted
```
