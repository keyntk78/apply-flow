import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer reads `url = env("DATABASE_URL")` from schema.prisma; the
// CLI takes the datasource from here. Note there is no `directUrl` in this
// config shape (Prisma 6 had one). When migrations run against Neon rather than
// the local container, DATABASE_URL must be Neon's *unpooled* connection
// string — schema changes cannot go through pgbouncer.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
