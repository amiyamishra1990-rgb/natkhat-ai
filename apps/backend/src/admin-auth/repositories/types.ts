import { Prisma, PrismaClient } from '@prisma/client';

// Mirrors audit/repositories/types.ts and identity-family/repositories/
// types.ts — duplicated, not imported cross-module, so each domain
// module's repository layer stays self-contained (same convention
// those two modules already follow).
export type PrismaClientLike = PrismaClient | Prisma.TransactionClient;
