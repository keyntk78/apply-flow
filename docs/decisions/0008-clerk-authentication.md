# 0008 Xác thực bằng Clerk với bản ghi User cục bộ

Date: 2026-07-15

## Status

Accepted

## Context

MVP Apply Flow cần xác thực (Email + Google) — đây là hard gate về auth và phụ
thuộc nhà cung cấp bên ngoài. SPEC §6.1 và §10 chỉ định Clerk làm nhà cung cấp
danh tính, còn §9 định nghĩa một thực thể `User` với `clerkUserId`. Cần chốt cách
danh tính Clerk liên kết với dữ liệu ứng dụng (Application thuộc sở hữu theo
người dùng) trước khi viết mã.

## Decision

- Dùng **Clerk** cho toàn bộ đăng ký/đăng nhập/phiên (Email + Google). App không
  tự lưu mật khẩu hay quản lý phiên.
- Giữ một bảng **`User` cục bộ** (Prisma/Neon) đồng bộ từ Clerk, khóa theo
  `clerkUserId` (duy nhất). `User` cục bộ là chủ sở hữu của mọi `Application`.
- Cơ chế đồng bộ mặc định cho MVP: **đồng bộ lười** ở request đã xác thực đầu
  tiên (không dùng webhook trừ khi phát sinh nhu cầu đồng bộ tức thời).
- Mọi route không public yêu cầu đăng nhập; public gồm Landing, Pricing, Login,
  Register.

## Alternatives Considered

1. **Webhook Clerk để đồng bộ** — dữ liệu profile luôn mới, nhưng thêm endpoint
   công khai + xác minh chữ ký + secret. Hoãn; cân nhắc lại nếu cần realtime.
2. **Chỉ dùng `clerkUserId` trực tiếp, không bảng User cục bộ** — loại bỏ vì
   Application cần khóa ngoài ổn định và truy vấn theo chủ sở hữu.
3. **Nhà cung cấp auth khác / tự xây** — trái SPEC và tăng rủi ro bảo mật.

## Consequences

Positive:

- Giảm rủi ro bảo mật (Clerk lo mật khẩu/phiên/OAuth Google).
- Ranh giới sở hữu dữ liệu rõ ràng qua `User.clerkUserId`.
- Không cần hạ tầng công khai cho MVP (đồng bộ lười).

Tradeoffs:

- Phụ thuộc nhà cung cấp bên ngoài (Clerk) và cấu hình biến môi trường của họ.
- Đồng bộ lười khiến thay đổi profile chỉ cập nhật khi user quay lại app.

## Follow-Up

- Triển khai trong story
  [US-000-clerk-auth](../stories/epics/E00-auth/US-000-clerk-auth/overview.md).
- Xem lại quyết định đồng bộ lười vs webhook nếu MVP cần dữ liệu profile realtime.
- Bảng `Application` và ràng buộc khóa ngoài `userId` được hoàn thiện ở epic E01.
