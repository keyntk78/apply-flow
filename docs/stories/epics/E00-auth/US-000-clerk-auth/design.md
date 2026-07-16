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
- Chỉ mục **duy nhất trên `clerkUserId`** — đây là khóa danh tính, và là cột mà
  `EnsureLocalUser` upsert lên.
- `email` chỉ có **chỉ mục thường, không unique**. Bản trước của tài liệu này ghi
  unique cho cả hai; đã đổi khi triển khai. Lý do: `email` là bản sao đồng bộ từ
  Clerk chứ không phải khóa danh tính. Clerk đã đảm bảo duy nhất phía nó, còn ràng
  buộc unique cục bộ sẽ biến một lần đổi email trên Clerk (hoặc hai identity cùng
  địa chỉ chưa được link) thành lỗi P2002 **chặn đăng nhập** — tức để ràng buộc DB
  làm hỏng luồng auth.
- `fullName` / `avatarUrl` nullable: Clerk không bắt buộc có tên hay ảnh; đăng ký
  bằng email không tên là luồng phổ biến, không phải ngoại lệ.
- Migration đầu tiên chỉ tạo bảng `User`. Bảng `Application` để cho epic E01.

Ghi chú phiên bản (Prisma 7, khác với giả định lúc viết design):

- URL datasource nằm ở `prisma.config.ts`, không còn `url = env("DATABASE_URL")`
  trong schema. Config **không có `directUrl`** — khi migrate lên Neon phải trỏ
  `DATABASE_URL` vào connection string *unpooled*.
- Prisma 7 bắt buộc driver adapter (`@prisma/adapter-pg`); không còn engine gói sẵn.
- Type sinh ra tên là `UserModel`, không phải `User`.

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

1. **Đồng bộ lười khi request đầu tiên** (✅ đã chọn và triển khai): đơn giản,
   không cần cấu hình webhook/endpoint công khai; đánh đổi là dữ liệu profile chỉ
   cập nhật khi user quay lại app.
2. **Webhook Clerk**: dữ liệu luôn mới, nhưng thêm endpoint công khai + xác minh
   chữ ký + cấu hình secret. Cân nhắc nếu cần đồng bộ tức thời.
3. **Không có bảng User cục bộ, chỉ dùng `clerkUserId` trực tiếp**: loại bỏ vì
   Application cần khóa ngoài ổn định và truy vấn theo chủ sở hữu.
