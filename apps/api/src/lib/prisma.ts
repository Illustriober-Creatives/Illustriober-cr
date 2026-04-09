/**
 * Prisma Database Client
 * Singleton instance of PrismaClient for managing database connections
 * Prevents instantiating multiple instances in production
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Global PrismaClient instance
 * Using a global variable to maintain singleton pattern across module reloads
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Resolve a PostgreSQL connection string for Prisma's pg adapter.
 *
 * Supports:
 * - Standard postgres URLs: `postgresql://...` / `postgres://...`
 * - Prisma Postgres proxy URLs: `prisma+postgres://...?...api_key=<base64url-json>`
 */
function resolvePgConnectionString(): string {
  // Allow an explicit override when running locally or in deployment.
  const directUrl = process.env.DIRECT_DATABASE_URL;
  if (directUrl) {
    return directUrl;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Provide DATABASE_URL or DIRECT_DATABASE_URL."
    );
  }

  if (
    databaseUrl.startsWith("postgresql://") ||
    databaseUrl.startsWith("postgres://")
  ) {
    return databaseUrl;
  }

  // Prisma Postgres local/proxy format.
  if (databaseUrl.startsWith("prisma+postgres://")) {
    const parsed = new URL(databaseUrl);
    const apiKey = parsed.searchParams.get("api_key");

    if (!apiKey) {
      throw new Error(
        "DATABASE_URL uses prisma+postgres:// but is missing api_key. " +
          "Set DIRECT_DATABASE_URL to a postgres:// connection string."
      );
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(apiKey, "base64url").toString("utf8")
      ) as { databaseUrl?: string };

      if (!decoded.databaseUrl) {
        throw new Error("databaseUrl key missing from decoded api_key payload.");
      }

      return decoded.databaseUrl;
    } catch (error) {
      throw new Error(
        "Failed to decode postgres connection from prisma+postgres api_key. " +
          "Set DIRECT_DATABASE_URL to a postgres:// connection string. " +
          `Reason: ${(error as Error).message}`
      );
    }
  }

  throw new Error(
    `Unsupported DATABASE_URL scheme. Received: ${databaseUrl.split(":")[0]}. ` +
      "Use postgres://, postgresql://, or set DIRECT_DATABASE_URL."
  );
}

const adapter = new PrismaPg({
  connectionString: resolvePgConnectionString(),
});

/**
 * Initialize or retrieve the Prisma client instance
 * Handles graceful logging and error scenarios
 */
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
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
