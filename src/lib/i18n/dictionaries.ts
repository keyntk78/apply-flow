import type { Locale } from "./locales";

/**
 * UI copy for VI/EN.
 *
 * `vi` is the source of truth for the key set; `en` is typed as `typeof vi`, so
 * a missing or misspelled translation is a compile error rather than a runtime
 * blank. That type check is the "dictionaries share one key set" proof named in
 * the US-001 validation table.
 */
const vi = {
  nav: {
    signIn: "Đăng nhập",
    signUp: "Bắt đầu",
    languageLabel: "Ngôn ngữ",
  },
  theme: {
    label: "Giao diện",
    light: "Sáng",
    dark: "Tối",
    system: "Theo hệ thống",
  },
  hero: {
    eyebrow: "Thay cho file Excel theo dõi job",
    title: "Mọi đơn ứng tuyển, trên một dòng chảy.",
    body: "Lưu job bạn quan tâm, theo dõi từng đơn qua sáu trạng thái, và giữ ghi chú ngay cạnh đơn — thay cho file Excel bạn đang dùng.",
    ctaPrimary: "Bắt đầu miễn phí",
    ctaSecondary: "Đăng nhập",
  },
  rail: {
    caption: "Vòng đời của một đơn",
    note: "Đơn kết thúc có thể chuyển sang Lưu trữ.",
    demoRole: "Lập trình viên Frontend",
    demoCompany: "Tiki",
    demoMeta: "Hà Nội · 20–30 triệu",
    deadlineLabel: "Hạn nộp",
    deadlineValue: "còn 6 ngày",
  },
  status: {
    saved: "Đã lưu",
    preparing: "Đang chuẩn bị",
    applied: "Đã nộp",
    interview: "Phỏng vấn",
    offer: "Nhận offer",
    rejected: "Bị từ chối",
    archived: "Lưu trữ",
  },
  features: {
    eyebrow: "Có gì trong bản đầu tiên",
    items: [
      {
        title: "Theo dõi từng đơn",
        body: "Tạo, sửa, tìm kiếm và lọc. Công ty, mức lương, nơi làm việc, hạn nộp và ghi chú nằm cùng một chỗ.",
      },
      {
        title: "Bảng Kanban",
        body: "Kéo đơn sang cột tiếp theo khi có tin mới. Nhìn một cái là biết pipeline đang ra sao.",
      },
      {
        title: "Dashboard",
        body: "Tổng số theo trạng thái, những đơn vừa cập nhật, và những đơn sắp đến hạn.",
      },
    ],
  },
  closing: {
    title: "Bắt đầu theo dõi đơn của bạn",
    body: "Miễn phí. Đăng ký bằng email hoặc Google.",
    cta: "Tạo tài khoản",
  },
  footer: {
    tagline: "Quản lý ứng tuyển cho người đi tìm việc.",
  },
  auth: {
    backHome: "Về trang chủ",
    signIn: {
      title: "Đăng nhập vào Apply Flow",
      body: "Tiếp tục theo dõi các đơn ứng tuyển của bạn.",
      switchPrompt: "Chưa có tài khoản?",
      switchCta: "Đăng ký",
    },
    signUp: {
      title: "Tạo tài khoản Apply Flow",
      body: "Bắt đầu theo dõi đơn ứng tuyển đầu tiên của bạn.",
      switchPrompt: "Đã có tài khoản?",
      switchCta: "Đăng nhập",
    },
    placeholder: {
      label: "Chưa nối",
      body: "Form đăng nhập bằng Email và Google do Clerk cung cấp sẽ được gắn vào đây ở story US-000.",
    },
  },
};

const en: typeof vi = {
  nav: {
    signIn: "Sign in",
    signUp: "Get started",
    languageLabel: "Language",
  },
  theme: {
    label: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
  },
  hero: {
    eyebrow: "Instead of a job-tracking spreadsheet",
    title: "Every application, on one flow.",
    body: "Save the jobs you care about, track each one through six statuses, and keep your notes beside them — instead of the spreadsheet you use now.",
    ctaPrimary: "Start free",
    ctaSecondary: "Sign in",
  },
  rail: {
    caption: "The life of one application",
    note: "Finished applications can move to Archived.",
    demoRole: "Frontend Developer",
    demoCompany: "Tiki",
    demoMeta: "Hanoi · 20–30M VND",
    deadlineLabel: "Deadline",
    deadlineValue: "in 6 days",
  },
  status: {
    saved: "Saved",
    preparing: "Preparing",
    applied: "Applied",
    interview: "Interview",
    offer: "Offer",
    rejected: "Rejected",
    archived: "Archived",
  },
  features: {
    eyebrow: "What ships first",
    items: [
      {
        title: "Track every application",
        body: "Create, edit, search and filter. Company, salary, location, deadline and notes all live in one place.",
      },
      {
        title: "Kanban board",
        body: "Drag an application to the next column when news arrives. One look tells you where your pipeline stands.",
      },
      {
        title: "Dashboard",
        body: "Totals by status, what you updated recently, and what's due soon.",
      },
    ],
  },
  closing: {
    title: "Start tracking your applications",
    body: "Free. Sign up with email or Google.",
    cta: "Create account",
  },
  footer: {
    tagline: "Application tracking for job seekers.",
  },
  auth: {
    backHome: "Back to home",
    signIn: {
      title: "Sign in to Apply Flow",
      body: "Pick up tracking your applications where you left off.",
      switchPrompt: "No account yet?",
      switchCta: "Sign up",
    },
    signUp: {
      title: "Create your Apply Flow account",
      body: "Start tracking your first application.",
      switchPrompt: "Already have an account?",
      switchCta: "Sign in",
    },
    placeholder: {
      label: "Not wired up",
      body: "The Clerk-hosted Email and Google form gets mounted here in story US-000.",
    },
  },
};

export type Dictionary = typeof vi;

export const dictionaries: Record<Locale, Dictionary> = { vi, en };
