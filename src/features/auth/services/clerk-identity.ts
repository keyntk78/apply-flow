import { z } from "zod";

/**
 * What the app is willing to believe about a Clerk user.
 *
 * Clerk is an external provider, so its payload is parsed into this typed shape
 * at the boundary before any of our code touches it (docs/ARCHITECTURE.md).
 */
export type ClerkIdentity = {
  clerkUserId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
};

/**
 * The slice of Clerk's user object we actually read.
 *
 * Loose on purpose — `.optional().nullable()` everywhere except `id` and the
 * email list. Clerk adds fields freely, and a strict schema would turn an
 * unrelated upstream addition into a failed sign-in.
 */
const clerkUserSchema = z.object({
  id: z.string().min(1),
  primaryEmailAddressId: z.string().nullish(),
  emailAddresses: z
    .array(
      z.object({
        id: z.string(),
        emailAddress: z.string(),
      }),
    )
    .min(1, "Clerk user has no email address"),
  firstName: z.string().nullish(),
  lastName: z.string().nullish(),
  imageUrl: z.string().nullish(),
});

export type ClerkUserLike = z.input<typeof clerkUserSchema>;

/**
 * Maps a Clerk user onto our identity DTO.
 *
 * Pure: no database, no network, no Clerk SDK call — which is what lets the
 * mapping rules below be unit-tested directly.
 *
 * @throws if the payload lacks an id or any email at all, which would mean a
 * User row we could never match back to a person.
 */
export function toClerkIdentity(user: unknown): ClerkIdentity {
  const parsed = clerkUserSchema.parse(user);

  // Prefer the address Clerk marks primary. A Google sign-up can carry several
  // addresses, and picking emailAddresses[0] would show a different one than
  // Clerk's own UI does.
  const primary =
    parsed.emailAddresses.find((address) => address.id === parsed.primaryEmailAddressId) ??
    parsed.emailAddresses[0];

  return {
    clerkUserId: parsed.id,
    email: primary.emailAddress,
    fullName: joinName(parsed.firstName, parsed.lastName),
    avatarUrl: parsed.imageUrl ?? null,
  };
}

/**
 * Email sign-ups often have neither name, and Google sign-ups sometimes have
 * only a first name. Null means "Clerk has no name for this person" and stays
 * distinct from an empty string, so the UI can decide what to show.
 */
function joinName(firstName: string | null | undefined, lastName: string | null | undefined) {
  const full = [firstName, lastName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" ");

  return full.length > 0 ? full : null;
}
