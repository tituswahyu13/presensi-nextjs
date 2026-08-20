import { PrismaClient } from "@prisma-sso/client";

const globalForSsoPrisma = global as unknown as { prismaSso: PrismaClient };

export const ssoPrisma =
  globalForSsoPrisma.prismaSso ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForSsoPrisma.prismaSso = ssoPrisma;
