import { describe, expect, it } from "vitest";

import { toClerkIdentity } from "@/features/auth/services/clerk-identity";

/**
 * Clerk is an external provider, so these are the rules for what we believe from
 * its payload (docs/ARCHITECTURE.md: parse at the boundary). The mapper is pure,
 * so none of this needs a database or a Clerk account.
 */
describe("toClerkIdentity", () => {
  const base = {
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

  it("maps a complete Clerk user onto the identity DTO", () => {
    expect(toClerkIdentity(base)).toEqual({
      clerkUserId: "user_2abc",
      email: "primary@example.com",
      fullName: "Mai Nguyễn",
      avatarUrl: "https://img.clerk.com/avatar.png",
    });
  });

  it("picks the primary address, not the first one", () => {
    // A Google sign-up can carry several addresses. Taking emailAddresses[0]
    // would show a different address than Clerk's own UI does.
    expect(toClerkIdentity(base).email).toBe("primary@example.com");
  });

  it("falls back to the only address when Clerk marks no primary", () => {
    const identity = toClerkIdentity({
      ...base,
      primaryEmailAddressId: null,
      emailAddresses: [{ id: "idn_other", emailAddress: "only@example.com" }],
    });

    expect(identity.email).toBe("only@example.com");
  });

  it("returns null names for an email sign-up that gave none", () => {
    // The common path, not an edge case: Clerk does not require a name.
    const identity = toClerkIdentity({
      ...base,
      firstName: null,
      lastName: null,
    });

    expect(identity.fullName).toBeNull();
  });

  it("keeps a first name when the last name is missing", () => {
    const identity = toClerkIdentity({ ...base, lastName: null });

    expect(identity.fullName).toBe("Mai");
  });

  it("treats a whitespace-only name as no name", () => {
    const identity = toClerkIdentity({ ...base, firstName: "  ", lastName: "  " });

    expect(identity.fullName).toBeNull();
  });

  it("rejects a payload with no email at all", () => {
    // Such a row could never be matched back to a person.
    expect(() => toClerkIdentity({ ...base, emailAddresses: [] })).toThrow();
  });

  it("rejects a payload with no id", () => {
    expect(() => toClerkIdentity({ ...base, id: "" })).toThrow();
  });

  it("ignores unknown fields Clerk may add later", () => {
    // A strict schema would turn an unrelated upstream addition into a failed
    // sign-in, so this must keep working.
    const identity = toClerkIdentity({ ...base, someNewClerkField: "whatever" });

    expect(identity.clerkUserId).toBe("user_2abc");
  });
});
