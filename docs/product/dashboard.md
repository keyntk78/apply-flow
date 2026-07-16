# Hợp đồng sản phẩm — Dashboard

Dẫn xuất từ [SPEC.md](../../SPEC.md) §6.2. Là view chỉ đọc trên
[applications.md](applications.md).

## Hành vi

Dashboard cho người dùng đã đăng nhập cái nhìn tổng quan nhanh về pipeline của họ.

### Tổng số theo trạng thái

Số lượng job của người dùng, tổng và theo từng trạng thái:

- Tổng số job
- Saved
- Preparing
- Applied
- Interview
- Offer
- Rejected

(`Archived` là trạng thái lưu trữ; việc hiển thị nó là tùy chọn và không nên làm
phồng con số "pipeline đang hoạt động".)

### Danh sách

- **Job mới cập nhật** — sắp xếp theo `updatedAt` giảm dần.
- **Job sắp đến deadline** — job có `deadline` đang tới gần, gần nhất trước.

## Quy tắc

- Mọi con số và danh sách đều giới hạn theo `userId` đã xác thực.
- MVP không có biểu đồ (SPEC §6.2 nói rõ). Số liệu chỉ ở dạng số/card.
- Ngưỡng "sắp đến deadline" (ví dụ N ngày tới) là chi tiết thiết kế của story
  Dashboard; giữ nó là một hằng số được ghi chú rõ ràng.

## Không thuộc phạm vi (MVP)

- Biểu đồ, đồ thị, analytics tỉ lệ phản hồi/offer/phỏng vấn (hoãn sang Analytics
  tương lai, SPEC §11).
