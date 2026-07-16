# Hợp đồng sản phẩm — Settings

Dẫn xuất từ [SPEC.md](../../SPEC.md) §6.5.

## Hành vi

Người dùng đã đăng nhập có thể thay đổi tùy chọn hiển thị của ứng dụng:

- **Theme**: Light / Dark / System.
- **Language (Ngôn ngữ)**: Tiếng Việt / English.

## Quy tắc

- Tùy chọn thuộc về người dùng đang đăng nhập.
- `System` cho theme nghĩa là bám theo thiết lập của hệ điều hành/trình duyệt.
- Đổi ngôn ngữ áp dụng cho văn bản giao diện; ngôn ngữ mặc định ban đầu do story
  triển khai quyết định và ghi chú lại.

## Không thuộc phạm vi (MVP)

- Các tùy chọn thông báo, quyền riêng tư, hay cấu hình tài khoản khác.
- Thêm ngôn ngữ ngoài VI/EN.
