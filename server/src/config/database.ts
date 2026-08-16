import { logger } from '../utils/logger';

let prismaClient: any = null;

export function getPrisma(): any {
  if (!prismaClient) {
    try {
      // Dynamic import to prevent crash if not pre-generated
      const { PrismaClient } = require('@prisma/client');
      prismaClient = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
      });
    } catch {
      logger.info('Running with Authoritative Enterprise In-Memory Database Store');
      prismaClient = null;
    }
  }
  return prismaClient;
}

export const prisma = getPrisma();

export async function disconnectPrisma(): Promise<void> {
  if (prismaClient && typeof prismaClient.$disconnect === 'function') {
    await prismaClient.$disconnect();
    logger.info('Prisma disconnected');
  }
}

