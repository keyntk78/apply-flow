import { NextRequest } from "next/server";
import { type Mock, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Route protection — which paths require a session.
 *
 * Only `clerkMiddleware` is mocked, to capture the handler it wraps.
 * `createRouteMatcher` stays real: it owns the pattern semantics ("/sign-in(.*)"
 * covering Clerk's own sub-steps), and mocking it would leave this test
 * asserting against itself.
 *
 * This lives under `unit` rather than `integration` for the reason
 * vitest.config.ts already splits `db` out: the integration project runs in
 * jsdom, and NextRequest needs Node.
 */
const { mockClerkMiddleware } = vi.hoisted(() => ({ mockClerkMiddleware: vi.fn() }));

vi.mock("@clerk/nextjs/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@clerk/nextjs/server")>()),
  clerkMiddleware: mockClerkMiddleware,
}));

const { config } = await import("@/proxy");

type Protect = () => Promise<void>;

type ProxyHandler = (auth: { protect: Protect }, request: NextRequest) => Promise<void>;

const handler = mockClerkMiddleware.mock.calls[0][0] as ProxyHandler;

let protect: Mock<Protect>;

beforeEach(() => {
  protect = vi.fn<Protect>(async () => {});
});

/** Runs the proxy for a path and reports whether it demanded a session. */
async function requiresSession(path: string): Promise<boolean> {
  await handler({ protect }, new NextRequest(new URL(path, "http://localhost:3000")));

  return protect.mock.calls.length > 0;
}

describe("proxy route protection", () => {
  it.each([
    ["/", "Landing"],
    ["/pricing", "Pricing"],
    ["/sign-in", "Login"],
    ["/sign-up", "Register"],
  ])("leaves %s public (%s)", async (path) => {
    // The public surface, straight from docs/product/auth.md.
    expect(await requiresSession(path)).toBe(false);
  });

  it.each([
    "/sign-in/factor-one",
    "/sign-up/verify-email-address",
    "/sign-up/continue",
  ])("leaves Clerk's own sub-step %s public", async (path) => {
    // Clerk drives multi-step flows through catch-all child routes. Protecting
    // these would redirect the visitor back to sign-in mid-sign-in — a loop.
    expect(await requiresSession(path)).toBe(false);
  });

  it("protects the Dashboard", async () => {
    expect(await requiresSession("/dashboard")).toBe(true);
  });

  it("protects a route nobody has added to the allowlist", async () => {
    // The allowlist is the point: forgetting a new route locks it down rather
    // than exposing it. If this ever fails, the default has flipped.
    expect(await requiresSession("/applications/new")).toBe(true);
  });

  it("does not treat a path merely containing 'sign-in' as public", async () => {
    expect(await requiresSession("/dashboard/sign-in-history")).toBe(true);
  });
});

describe("proxy matcher", () => {
  const matches = (path: string) =>
    config.matcher.some((pattern) => new RegExp(`^${pattern}$`).test(path));

  it("runs on app routes", () => {
    expect(matches("/dashboard")).toBe(true);
  });

  it("runs on API routes", () => {
    expect(matches("/api/applications")).toBe(true);
  });

  it("skips Next.js internals and static files", () => {
    // Running the proxy on these costs a Clerk call per asset request.
    expect(matches("/_next/static/chunk.js")).toBe(false);
    expect(matches("/logo.svg")).toBe(false);
  });
});
