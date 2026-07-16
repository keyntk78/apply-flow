import type { Metadata } from "next";

import { requireCurrentUser } from "@/features/auth/server";

export const metadata: Metadata = {
  title: "Dashboard · Apply Flow",
};

/**
 * Protected route — middleware redirects anonymous visitors to sign-in.
 *
 * Intentionally bare. The real Dashboard (status totals, recent jobs, jobs near
 * a deadline) is its own story against docs/product/dashboard.md, and building
 * it here would be work US-000 was told not to do. What this page does carry is
 * the piece US-000 owns: it is the first authenticated request after sign-in, so
 * it is where the lazy sync creates the local User row.
 */
export default async function DashboardPage() {
  const user = await requireCurrentUser();

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8">
      <h1 className="display-md">Dashboard</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Bạn đã đăng nhập. Nội dung Dashboard thuộc story riêng.
      </p>

      <dl className="mt-8 grid gap-3 rounded-xl border border-border bg-card p-6 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Họ tên</dt>
          <dd className="font-medium">{user.fullName ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Email</dt>
          <dd className="font-mono text-xs">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">User ID (cục bộ)</dt>
          <dd className="font-mono text-xs">{user.id}</dd>
        </div>
      </dl>
    </main>
  );
}
