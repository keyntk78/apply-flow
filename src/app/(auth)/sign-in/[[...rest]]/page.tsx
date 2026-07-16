import type { Metadata } from "next";

import { AuthShell, ClerkSignInForm } from "@/features/auth";

export const metadata: Metadata = {
  title: "Đăng nhập · Apply Flow",
};

/**
 * Public route (docs/product/auth.md). The shell is chrome only; Clerk owns the
 * form, the credentials and the session.
 *
 * The `[[...rest]]` segment is required, not decoration: <SignIn/> routes its
 * own sub-steps (factor-one, factor-two, SSO callback, reset password) as real
 * paths under /sign-in. A plain page.tsx here throws "component is not
 * configured correctly" at runtime the moment the form mounts.
 */
export default function SignInPage() {
  return (
    <AuthShell variant="sign-in">
      <ClerkSignInForm />
    </AuthShell>
  );
}
