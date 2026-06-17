import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function buildClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  // In production the Neon/Vercel integration exposes a pooled DATABASE_URL.
  // Use it (with PgBouncer mode) so each serverless request reuses pooled
  // connections instead of opening a fresh direct connection — much faster.
  // Locally (SQLite) we fall back to the schema datasource.
  if (url && /^postgres(ql)?:\/\//i.test(url)) {
    const pooled = url.includes("pgbouncer=")
      ? url
      : url + (url.includes("?") ? "&" : "?") + "pgbouncer=true";
    return new PrismaClient({ datasourceUrl: pooled });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? buildClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/** Minimal surface of the Prisma client used by the service layer. */
export type Db = typeof prisma;
