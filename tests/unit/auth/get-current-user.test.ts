import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The two read paths onto the local User row.
 *
 * Clerk and Prisma are the only things mocked here. `toClerkIdentity` and
 * `ensureLocalUser` run for real, so these tests prove the wiring — that a Clerk
 * session turns into the right upsert — rather than restating the mapping rules
 * already covered in clerk-identity.test.ts.
 */
const { mockAuth, mockCurrentUser, mockFindUnique, mockUpsert } = vi.hoisted(() => ({
  mockAuth: vi.fn(),
  mockCurrentUser: vi.fn(),
  mockFindUnique: vi.fn(),
  mockUpsert: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mockAuth,
  currentUser: mockCurrentUser,
}));

vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: mockFindUnique, upsert: mockUpsert } },
}));

const { getCurrentUser, requireCurrentUser } = await import(
  "@/features/auth/services/get-current-user"
);

const clerkUser = {
  id: "user_2abc",
  primaryEmailAddressId: "idn_primary",
  emailAddresses: [
    { id: "idn_other", emailAddress: "old@example.com" },
    { id: "idn_primary", emailAddress: "primary@example.com" },
  ],
  firstName: "Mai",
  lastName: "Nguyễn",
  imageUrl: "https://img.clerk.com/avatar.png",
};

const userRow = {
  id: "usr_local",
  clerkUserId: "user_2abc",
  email: "primary@example.com",
  fullName: "Mai Nguyễn",
  avatarUrl: "https://img.clerk.com/avatar.png",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getCurrentUser", () => {
  it("returns null when nobody is signed in", async () => {
    mockAuth.mockResolvedValue({ userId: null });

    expect(await getCurrentUser()).toBeNull();
  });

  it("does not touch the database without a session", async () => {
    // "No user" is an ordinary answer here, so an anonymous page render should
    // cost zero queries.
    mockAuth.mockResolvedValue({ userId: null });

    await getCurrentUser();

    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("looks the row up by clerkUserId, not by email", async () => {
    mockAuth.mockResolvedValue({ userId: "user_2abc" });
    mockFindUnique.mockResolvedValue(userRow);

    expect(await getCurrentUser()).toEqual(userRow);
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { clerkUserId: "user_2abc" } });
  });

  it("returns null for a session whose row has not been synced yet", async () => {
    // Read-only by contract: it reports the absence instead of creating the row.
    mockAuth.mockResolvedValue({ userId: "user_never_seen" });
    mockFindUnique.mockResolvedValue(null);

    expect(await getCurrentUser()).toBeNull();
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});

describe("requireCurrentUser", () => {
  it("throws when called without a session", async () => {
    // Middleware already redirects anonymous requests, so reaching here means a
    // route escaped the matcher — surface it, do not return null.
    mockCurrentUser.mockResolvedValue(null);

    await expect(requireCurrentUser()).rejects.toThrow(/without a Clerk session/);
  });

  it("writes nothing when there is no session", async () => {
    mockCurrentUser.mockResolvedValue(null);

    await expect(requireCurrentUser()).rejects.toThrow();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("upserts the mapped identity keyed on clerkUserId and returns the row", async () => {
    mockCurrentUser.mockResolvedValue(clerkUser);
    mockUpsert.mockResolvedValue(userRow);

    expect(await requireCurrentUser()).toEqual(userRow);

    const fields = {
      email: "primary@example.com",
      fullName: "Mai Nguyễn",
      avatarUrl: "https://img.clerk.com/avatar.png",
    };

    expect(mockUpsert).toHaveBeenCalledWith({
      where: { clerkUserId: "user_2abc" },
      create: { clerkUserId: "user_2abc", ...fields },
      update: fields,
    });
  });

  it("carries a refreshed Clerk profile into the update", async () => {
    // The lazy sync from design.md: a name changed in Clerk lands on the next
    // authenticated request, because update always rewrites the profile fields.
    mockCurrentUser.mockResolvedValue({ ...clerkUser, firstName: "Mai Anh" });
    mockUpsert.mockResolvedValue(userRow);

    await requireCurrentUser();

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining({ fullName: "Mai Anh Nguyễn" }) }),
    );
  });

  it("rejects a Clerk payload with no email instead of writing a row", async () => {
    // A row we could never match back to a person is worse than a failed request.
    mockCurrentUser.mockResolvedValue({ ...clerkUser, emailAddresses: [] });

    await expect(requireCurrentUser()).rejects.toThrow();
    expect(mockUpsert).not.toHaveBeenCalled();
  });
});
