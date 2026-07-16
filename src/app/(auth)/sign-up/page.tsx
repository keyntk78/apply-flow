import type { Metadata } from "next";

import { AuthShell } from "@/features/auth";

export const metadata: Metadata = {
  title: "Đăng ký · Apply Flow",
};

// Public route (docs/product/auth.md). No form, no session — US-000 mounts
// Clerk's <SignUp/> into the shell's slot.
export default function SignUpPage() {
  return <AuthShell variant="sign-up" />;
}
