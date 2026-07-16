# Apply Flow - Product Specification (MVP v1.0)

Version: 1.0

Status: Draft

---

# 1. Giới thiệu

## 1.1 Tên sản phẩm

**Apply Flow**

## 1.2 Mô tả

Apply Flow là ứng dụng web giúp người tìm việc quản lý toàn bộ quá trình ứng tuyển tại một nơi.

Người dùng có thể lưu các công việc quan tâm, theo dõi trạng thái ứng tuyển, ghi chú và quản lý pipeline tìm việc bằng giao diện trực quan.

Phiên bản MVP tập trung vào trải nghiệm quản lý công việc, chưa tập trung vào AI.

---

# 2. Mục tiêu

Giúp người dùng:

* Không quên đã ứng tuyển công ty nào.
* Theo dõi trạng thái của từng công việc.
* Quản lý toàn bộ quá trình tìm việc.
* Có giao diện đẹp, dễ sử dụng.
* Thay thế Excel hoặc Google Sheets.

---

# 3. Đối tượng sử dụng

* Sinh viên.
* Fresher.
* Junior.
* Senior.
* Người chuyển ngành.
* Bất kỳ ai đang tìm việc.

MVP chỉ hỗ trợ người dùng cá nhân.

---

# 4. Phạm vi MVP

Bao gồm:

* Authentication.
* Dashboard.
* Quản lý Job Application.
* Kanban Board.
* Profile.
* Settings.

Không bao gồm:

* AI.
* CV Management.
* Calendar.
* Interview Management.
* Company Management.
* Browser Extension.
* Gmail.
* Google Calendar.
* Analytics nâng cao.

---

# 5. User Flow

Đăng ký

↓

Đăng nhập

↓

Dashboard

↓

Tạo Job

↓

Quản lý Job

↓

Chuyển trạng thái

↓

Hoàn thành

---

# 6. Chức năng

## 6.1 Authentication

Sử dụng Clerk.

### Đăng ký

* Email
* Google

### Đăng nhập

* Email
* Google

### Hồ sơ

* Avatar
* Họ tên
* Email

---

## 6.2 Dashboard

Dashboard hiển thị tổng quan.

Bao gồm:

* Tổng số Job
* Saved
* Preparing
* Applied
* Interview
* Offer
* Rejected

Ngoài ra hiển thị:

* Danh sách Job mới cập nhật
* Job sắp đến deadline

Không có biểu đồ ở phiên bản MVP.

---

## 6.3 Job Application

Đây là module chính.

Người dùng có thể:

* Tạo Job
* Chỉnh sửa
* Xóa
* Tìm kiếm
* Lọc
* Sắp xếp

Thông tin mỗi Job gồm:

* Job Title *
* Company Name *
* Job URL
* Location
* Salary
* Status
* Priority
* Applied Date
* Deadline
* Notes

---

## 6.4 Kanban Board

Hiển thị Job theo trạng thái.

Các cột:

* Saved
* Preparing
* Applied
* Interview
* Offer
* Rejected
* Archived

Người dùng có thể kéo thả Job giữa các cột.

---

## 6.5 Settings

Người dùng có thể thay đổi:

* Theme (Light/Dark/System)
* Language (Tiếng Việt / English)

---

# 7. Trạng thái Job

## Saved

Đã lưu nhưng chưa chuẩn bị.

## Preparing

Đang chuẩn bị CV hoặc tài liệu.

## Applied

Đã gửi hồ sơ.

## Interview

Đang trong quá trình phỏng vấn.

## Offer

Đã nhận Offer.

## Rejected

Không đạt.

## Archived

Đã lưu trữ.

---

# 8. Màn hình

## Public

* Landing Page
* Pricing

## Authentication

* Login
* Register

## Dashboard

* Dashboard

## Applications

* Applications List
* Create Application
* Edit Application

## Kanban

* Kanban Board

## Profile

* Profile

## Settings

* Settings

Tổng cộng khoảng 9 màn hình.

---

# 9. Database

## User

* id
* clerkUserId
* email
* fullName
* avatarUrl
* createdAt
* updatedAt

## Application

* id
* userId
* title
* company
* jobUrl
* location
* salary
* status
* priority
* appliedAt
* deadline
* notes
* createdAt
* updatedAt

---

# 10. Công nghệ

Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

Authentication

* Clerk

Database

* Neon PostgreSQL
* Prisma ORM

Storage

* Vercel Blob (chuẩn bị cho các phiên bản sau)

Deployment

* Vercel

Payment

* Stripe (chuẩn bị cho Pro Plan)

---

# 11. Phiên bản tương lai

Sau khi MVP hoàn thành sẽ phát triển thêm:

### AI

* AI Job Analysis
* Resume vs JD Matching
* Email Generator
* Cover Letter Generator

### Resume

* Upload nhiều CV
* Resume Version
* Resume Preview

### Interview

* Interview Management
* Interview Notes

### Calendar

* Google Calendar
* Reminder

### Analytics

* Response Rate
* Offer Rate
* Interview Rate

### Browser Extension

* Lưu Job từ LinkedIn
* Lưu Job từ ITviec
* Lưu Job từ TopCV

---

# 12. Tiêu chí hoàn thành MVP

Người dùng có thể:

* Đăng ký tài khoản.
* Đăng nhập.
* Tạo Job Application.
* Chỉnh sửa Job.
* Xóa Job.
* Xem danh sách Job.
* Tìm kiếm Job.
* Lọc Job theo trạng thái.
* Kéo thả Job trên Kanban.
* Theo dõi toàn bộ quá trình ứng tuyển.

Nếu hoàn thành các chức năng trên, Apply Flow MVP được xem là sẵn sàng phát hành phiên bản đầu tiên.

---

# 13. Định hướng phát triển

Apply Flow được xây dựng theo hướng phát triển từng bước:

* **v1:** Job Tracker đơn giản và ổn định.
* **v2:** Bổ sung AI hỗ trợ phân tích và tạo nội dung.
* **v3:** AI Career Assistant với phân tích kỹ năng, CV và lộ trình nghề nghiệp.

Ưu tiên của dự án là xây dựng một trải nghiệm quản lý ứng tuyển mượt mà trước khi mở rộng sang các tính năng AI.
