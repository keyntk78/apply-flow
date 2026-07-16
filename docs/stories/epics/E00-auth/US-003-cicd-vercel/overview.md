# US-003 — CI/CD: test gate trên GitHub Actions, deploy production lên Vercel

## Status

implemented

## Lane

normal

Việc này chạm **external provider** (Vercel) và cầm quyền deploy production —
theo [FEATURE_INTAKE.md](../../../../FEATURE_INTAKE.md) đó là hard gate, mặc
định high-risk. Human đã **thu hẹp scope một cách rõ ràng** (intake #6): đây là
pipeline vận hành, không đổi hành vi sản phẩm, không đụng domain/schema/auth.
Tiền lệ: intake #5 (toolchain) cũng là normal.

## Product Contract

Không phải hành vi sản phẩm. Đây là **cổng phát hành**: US-002 đã biến proof
thành lệnh chạy được ở máy local; story này bắt các lệnh đó chạy trên máy CI
trung lập, và biến chúng thành điều kiện cần để code lên production.

Xử lý dòng `Release` mà [US-002](../US-002-toolchain-and-proof/overview.md) còn
để trống ("Chưa deploy").

## Relevant Product Docs

- [docs/TEST_MATRIX.md](../../../../TEST_MATRIX.md) — ba lớp proof mà CI chạy.
- [US-002](../US-002-toolchain-and-proof/overview.md) — các script mà CI gọi.

## Acceptance Criteria

- Push/PR vào `main` hoặc `develop` chạy lint → typecheck → unit+integration → e2e.
- Deploy production **chỉ** chạy khi push vào `main`, và **chỉ** sau khi job
  test xanh. Test đỏ ⇒ không có deploy.
- PR không deploy. `develop` không deploy.
- Deploy dùng Vercel CLI với secrets, không phải Vercel Git integration.

## Design Notes

- **Một workflow, hai job**: `test` → `deploy`. Cổng nằm ở `needs: test` cộng
  `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`. Hai điều
  kiện này độc lập nhau: `needs` lo *chất lượng*, `if` lo *nhánh nào được phát
  hành*.
- **Vercel CLI chứ không phải Git integration** — đây là quyết định trung tâm.
  Nếu bật auto-deploy của Vercel, Vercel build ngay khi nhận commit, song song và
  không hề biết CI có xanh hay không; test lúc đó chỉ là trang trí. Đưa deploy
  vào trong Actions là cách duy nhất để `needs: test` thật sự chặn được.
  **Hệ quả bắt buộc: phải tắt auto-deploy bên Vercel**, nếu không sẽ có hai
  đường deploy song song và đường không qua test vẫn lên production.
- `vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod`:
  build xảy ra trên runner, Vercel chỉ nhận output. Cùng một Node version với
  job test.
- **concurrency**: push mới huỷ run cũ trên cùng nhánh, *trừ* `main` — deploy
  production bị cắt giữa chừng tệ hơn là phí một phút runner.
- E2E nằm trong CI (khác với pre-commit hook của US-002 cố ý bỏ nó ra): CI có
  thời gian, máy local thì không.
- `retries: 2` và `workers: 1` khi `process.env.CI` đã có sẵn trong
  [playwright.config.ts](../../../../../playwright.config.ts) từ US-002 — không
  cần sửa gì.

## Validation

| Layer | Expected proof | Kết quả |
| --- | --- | --- |
| Unit | Chạy trong job `test` | ✅ 29 tests pass (local, cùng lệnh CI gọi) |
| Integration | Chạy trong job `test` | ✅ (nằm trong 29 trên) |
| E2E | Playwright + Chromium trên bản build | ✅ 8/8 pass |
| Platform | YAML parse được, `lint`+`typecheck` sạch | ✅ |
| Release | Job deploy chạy thật trên `main` | ⏳ **chưa** — cần secrets + push main |

**Chưa được chứng minh:** job `deploy` chưa từng chạy. Nó cần
`VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` trong GitHub secrets và
một lần push vào `main`. Cho tới lúc đó, cột Release vẫn là dự định, không phải
bằng chứng.

## Harness Delta

- **CLAUDE.md / AGENTS.md đã lỗi thời ở hai chỗ** (phát hiện khi làm story này):
  - §2 nói "There is no application code yet" — thực tế repo đã có Next.js app,
    9 test file, 3 lớp proof.
  - §5 nói `harness-cli.exe` bị Windows Application Control chặn trên máy này —
    thực tế nó chạy bình thường (`harness-cli 0.1.17`).
  Hai câu này khiến agent đọc file sẽ tin sai về cả trạng thái repo lẫn khả năng
  ghi durable state. Đề xuất sửa cả hai file (chúng phải giống hệt nhau).
- Intake là append-only, không có `intake update`. Row #6 trỏ tới story slug sai
  (`US-001-cicd-vercel`, đã bị chiếm); phải ghi intervention #2 để đính chính.
  Nếu chuyện này lặp lại, cân nhắc thêm `intake amend`.

## Evidence

```text
pnpm lint         → 0 problems
pnpm typecheck    → clean
pnpm test         → 7 files, 29 tests passed
pnpm test:e2e     → 8 passed (chromium, production build, 31.0s)
js-yaml parse .github/workflows/ci.yml
                  → jobs: test, deploy
                  → deploy.needs: test
                  → deploy.if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```
