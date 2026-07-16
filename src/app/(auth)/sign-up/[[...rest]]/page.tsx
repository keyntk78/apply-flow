import type { Metadata } from "next";

import { AuthShell, ClerkSignUpForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Đăng ký · Apply Flow",
};

/**
 * Public route (docs/product/auth.md). The shell is chrome only; Clerk owns the
 * form, the credentials and the session.
 *
 * The `[[...rest]]` segment is required, not decoration: <SignUp/> routes its
 * own sub-steps (email verification, SSO callback) as real paths under /sign-up.
 * A plain page.tsx here throws "component is not configured correctly" at
 * runtime the moment the form mounts.
 */
export default function SignUpPage() {
  return (
    <AuthShell variant="sign-up">
      <ClerkSignUpForm />
    </AuthShell>
  );
}
