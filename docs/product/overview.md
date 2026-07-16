# Tổng quan sản phẩm — Apply Flow

Dẫn xuất từ [SPEC.md](../../SPEC.md) §1–§5, §13. File này là hợp đồng sản phẩm
tóm tắt để định hướng nhanh; hợp đồng chi tiết theo từng domain nằm cạnh file này.

## Đây là gì

Ứng dụng web giúp **một** người tìm việc quản lý toàn bộ quá trình ứng tuyển ở
một nơi: lưu job, theo dõi trạng thái từng đơn, ghi chú và làm việc trên pipeline
trực quan. Mục tiêu MVP: thay thế file Excel/Google Sheets. **v1 không có AI.**

## Người dùng chính

Người tìm việc cá nhân (sinh viên, fresher, junior/senior, người chuyển ngành).
MVP chỉ hỗ trợ tài khoản cá nhân đơn người dùng — không có team, không có phạm vi
tổ chức.

## Luồng chính

```text
Đăng ký → Đăng nhập → Dashboard → Tạo Job → Quản lý Job → Chuyển trạng thái → Theo dõi đến khi hoàn thành
```

## Các domain trong MVP (mỗi domain có file hợp đồng riêng)

| Domain | Hợp đồng | Màn hình |
| --- | --- | --- |
| Xác thực (Authentication) | [auth.md](auth.md) | Login, Register, Profile |
| Job Application (lõi) | [applications.md](applications.md) | Danh sách, Tạo, Sửa |
| Dashboard | [dashboard.md](dashboard.md) | Dashboard |
| Kanban | [kanban.md](kanban.md) | Kanban Board |
| Settings | [settings.md](settings.md) | Settings |
| Marketing (public) | — (chỉ nội dung; chưa có hợp đồng) | Landing, Pricing |

Tổng cộng khoảng 9 màn hình.

## Vòng đời trạng thái (dùng chung giữa các domain)

```text
Saved → Preparing → Applied → Interview → Offer → Rejected
```

Cộng thêm `Archived` (trạng thái lưu trữ, kết thúc). Đây chính là các cột Kanban.
Bất kỳ domain nào hiển thị hoặc thay đổi trạng thái đều phải dùng đúng bộ giá trị
này.

## Rõ ràng nằm ngoài phạm vi MVP

AI (phân tích job, so khớp CV↔JD, sinh email/cover letter), quản lý CV/resume,
lịch/nhắc hẹn, quản lý phỏng vấn, quản lý công ty, tiện ích trình duyệt,
Gmail/Google Calendar, analytics nâng cao. **Không** xây các phần này ở v1.
Xem SPEC §11.

## Tiêu chí hoàn thành (SPEC §12)

Người dùng có thể: đăng ký, đăng nhập, tạo/sửa/xóa job, xem danh sách/tìm
kiếm/lọc job, kéo thả job trên Kanban, và theo dõi toàn bộ quá trình ứng tuyển.
