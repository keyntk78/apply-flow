# Hợp đồng sản phẩm — Kanban Board

Dẫn xuất từ [SPEC.md](../../SPEC.md) §6.4, §7. Thao tác trên các bản ghi của
[applications.md](applications.md).

## Hành vi

Bảng Kanban hiển thị job của người dùng dưới dạng thẻ, gom theo các cột trạng
thái, và cho phép người dùng kéo thẻ từ cột này sang cột khác để đổi trạng thái.

### Các cột (thứ tự quan trọng)

```text
Saved | Preparing | Applied | Interview | Offer | Rejected | Archived
```

Đây là bộ trạng thái đầy đủ bao gồm cả `Archived` (khác với tổng số "đang hoạt
động" ở Dashboard, bảng Kanban hiển thị `Archived` thành một cột riêng).

## Quy tắc

- Mọi thẻ đều giới hạn theo `userId` đã xác thực.
- Kéo một thẻ sang cột khác sẽ đặt `status` của job đó thành cột đích và cập nhật
  `updatedAt`.
- Ở MVP, bất kỳ trạng thái nào cũng có thể chuyển sang trạng thái khác — không ép
  chuyển tiếp một chiều. (Nếu sau này muốn ràng buộc chuyển trạng thái thì đó là
  một quyết định mới.)
- Bảng Kanban và danh sách Application đọc cùng một nguồn dữ liệu; thay đổi ở bên
  này phản ánh sang bên kia.

## Không thuộc phạm vi (MVP)

- Cột tùy chỉnh / trạng thái do người dùng tự định nghĩa.
- Giới hạn WIP theo cột, swimlane, hay lưu thứ tự thẻ ngoài trạng thái.
