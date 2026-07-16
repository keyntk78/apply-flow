import type { Metadata } from "next";

import { AuthShell } from "@/features/auth";

export const metadata: Metadata = {
  title: "Đăng nhập · Apply Flow",
};

// Public route (docs/product/auth.md). No form, no session — US-000 mounts
// Clerk's <SignIn/> into the shell's slot.
export default function SignInPage() {
  return <AuthShell variant="sign-in" />;
}
