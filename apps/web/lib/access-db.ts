import { PrismaClient } from "@prisma/client";

declare global {
  var __qaraqutuAccessPrisma: PrismaClient | undefined;
}

export const accessPrisma =
  global.__qaraqutuAccessPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__qaraqutuAccessPrisma = accessPrisma;
}
