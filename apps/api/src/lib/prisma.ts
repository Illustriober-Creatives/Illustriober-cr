/**
 * Prisma Database Client
 * Singleton instance of PrismaClient for managing database connections
 * Prevents instantiating multiple instances in production
 */

import { PrismaClient } from "@prisma/client";

/**
 * Global PrismaClient instance
 * Using a global variable to maintain singleton pattern across module reloads
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Initialize or retrieve the Prisma client instance
 * Handles graceful logging and error scenarios
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Ensure we don't create new instances on module reload in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Graceful shutdown handler
 * Disconnects Prisma client when the process terminates
 */
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, disconnecting Prisma...");
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;

