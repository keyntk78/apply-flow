# Hợp đồng sản phẩm — Job Application (module lõi)

Dẫn xuất từ [SPEC.md](../../SPEC.md) §6.3, §9 (Application), §7. Đây là module lõi
của MVP; Dashboard và Kanban đều đọc dữ liệu từ đây.

## Hành vi

Người dùng đã đăng nhập quản lý các job của chính mình. Mọi thao tác đều giới hạn
theo người dùng hiện tại (`userId`); một người dùng không bao giờ thấy hoặc sửa
job của người khác.

Các thao tác:

- **Tạo** job.
- **Sửa** job.
- **Xóa** job.
- **Tìm kiếm** job (theo văn bản tiêu đề / công ty).
- **Lọc** job (theo trạng thái; priority là ứng viên cho bộ lọc).
- **Sắp xếp** job (ví dụ theo deadline, appliedAt, updatedAt, priority).

## Các trường của Application (SPEC §9)

| Trường | Bắt buộc | Ghi chú |
| --- | --- | --- |
| id | — | Khóa chính |
| userId | có | Chủ sở hữu; giới hạn mọi truy vấn |
| title | **có** | Tên công việc |
| company | **có** | Tên công ty |
| jobUrl | không | Link tin tuyển dụng |
| location | không | |
| salary | không | Ở MVP là văn bản tự do |
| status | có | Một giá trị trong vòng đời (mặc định `Saved`) |
| priority | không | ví dụ Low / Medium / High |
| appliedAt | không | Ngày nộp |
| deadline | không | Dùng cho mục "sắp đến deadline" ở Dashboard |
| notes | không | Văn bản tự do |
| createdAt / updatedAt | — | Mốc thời gian |

Bắt buộc khi tạo: **title** và **company**. Các trường còn lại là tùy chọn.

## Giá trị trạng thái (dùng chung)

`Saved → Preparing → Applied → Interview → Offer → Rejected`, cộng `Archived`.
Xem [overview.md](overview.md) và [kanban.md](kanban.md). Job mới mặc định là
`Saved` nếu không chỉ định khác.

## Quy tắc

- Sở hữu: mọi thao tác đọc/ghi đều lọc theo `userId` đã xác thực.
- Xóa sẽ loại bỏ job (MVP: chấp nhận xóa cứng; trạng thái `Archived` là cơ chế
  "cất đi" mềm, khác với xóa).
- `updatedAt` thay đổi mỗi khi sửa, kể cả khi đổi trạng thái — mục "mới cập nhật"
  của Dashboard và Kanban phụ thuộc vào trường này.

## Không thuộc phạm vi (MVP)

- Thao tác hàng loạt, nhãn/tag ngoài `priority`, tệp đính kèm, hay liên kết CV.
- Lương có cấu trúc (khoảng lương/tiền tệ) — v1 chỉ dùng văn bản tự do.
