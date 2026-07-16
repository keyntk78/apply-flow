import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { getDatabaseUrl } from "@/lib/env";

// Prisma 7 talks to Postgres through a driver adapter rather than a bundled
// engine, so the pool is ours to hand over. The same adapter serves the local
// Docker container and Neon — both speak stock Postgres.
function createPrismaClient() {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseUrl() }),
    // Queries are noise in normal runs; failures are not.
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

// Next.js hot-reload re-evaluates modules on every edit. Without this cache each
// reload would build another pool against the same database and eventually
// exhaust its connection limit — which Neon reaches far sooner than Postgres in
// Docker does, so it would surface in production first.
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
