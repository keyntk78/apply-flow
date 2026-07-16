# Design — US-000 Xác thực bằng Clerk

## Domain Model (mô hình domain)

- **User** (value/entity cục bộ): `id`, `clerkUserId` (duy nhất), `email`,
  `fullName`, `avatarUrl`, `createdAt`, `updatedAt`.
- Bất biến: mỗi phiên đăng nhập ứng với đúng một `User` cục bộ khớp
  `clerkUserId`. `User` cục bộ là chủ sở hữu của mọi `Application` (khóa ngoài
  `userId` — được dùng ở epic E01).

## Application Flow (luồng ứng dụng)

- **EnsureLocalUser** (use-case đồng bộ): đầu vào là danh tính Clerk đã xác thực
  → tạo mới nếu chưa có, hoặc cập nhật `email`/`fullName`/`avatarUrl` nếu đã có.
- Query: `getCurrentUser()` trả về `User` cục bộ cho request đã xác thực.
- Điểm gọi đồng bộ: middleware/route đã xác thực đầu tiên **hoặc** webhook Clerk
  (`user.created` / `user.updated`). Chọn cơ chế ở phần Alternatives.

## Interface Contract (hợp đồng giao diện)

- Route public: `/`, `/pricing`, `/sign-in`, `/sign-up` (dùng component Clerk).
- Route được bảo vệ: mọi thứ khác (Dashboard, Applications, Kanban, Profile,
  Settings) → chưa đăng nhập thì chuyển hướng về đăng nhập.
- (Nếu dùng webhook) Endpoint: `POST /api/webhooks/clerk` — xác minh chữ ký từ
  Clerk, phân tích payload tại boundary thành DTO có kiểu trước khi vào domain.
- Lỗi: chữ ký webhook không hợp lệ → 400; request không xác thực vào route được
  bảo vệ → redirect (không phải 500).

## Data Model (mô hình dữ liệu)

- Prisma model `User` trên Neon PostgreSQL, khớp SPEC §9.
- Chỉ mục duy nhất trên `clerkUserId` (và `email`).
- Migration đầu tiên tạo bảng `User`. Bảng `Application` để cho epic E01 (có thể
  tạo cùng migration khởi tạo nếu thuận tiện, nhưng hành vi của nó nằm ngoài
  story này).

## UI / Platform Impact

- Next.js App Router + `@clerk/nextjs`: `<ClerkProvider>`, middleware bảo vệ
  route, các component `<SignIn/>` `<SignUp/>` `<UserButton/>`.
- Triển khai trên Vercel: cần biến môi trường Clerk (publishable/secret key,
  webhook signing secret nếu dùng webhook).

## Observability

- Log ứng dụng (vận hành): sự kiện đồng bộ user, lỗi xác minh webhook.
- Không ghi audit log sản phẩm ở MVP (chưa có yêu cầu). Không log dữ liệu nhạy
  cảm (token, secret).

## Alternatives Considered (phương án đã cân nhắc)

1. **Đồng bộ lười khi request đầu tiên** (khuyến nghị MVP): đơn giản, không cần
   cấu hình webhook/endpoint công khai; đánh đổi là dữ liệu profile chỉ cập nhật
   khi user quay lại app.
2. **Webhook Clerk**: dữ liệu luôn mới, nhưng thêm endpoint công khai + xác minh
   chữ ký + cấu hình secret. Cân nhắc nếu cần đồng bộ tức thời.
3. **Không có bảng User cục bộ, chỉ dùng `clerkUserId` trực tiếp**: loại bỏ vì
   Application cần khóa ngoài ổn định và truy vấn theo chủ sở hữu.
