import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of Prisma Client in development.
// In production there is only one instance so this is fine.
// In development, hot reload would create a new instance on every
// file change without this pattern, exhausting the connection pool.

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;