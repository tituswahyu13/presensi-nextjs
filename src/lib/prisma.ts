import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientKep } from '@prisma/client_kep';

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  prismaKep: PrismaClientKep;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

export const prismaKep =
  globalForPrisma.prismaKep ||
  new PrismaClientKep({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaKep = prismaKep;
}
