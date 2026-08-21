import { Prisma, PrismaClient } from '@prisma/client';

// Mirrors identity-family/repositories/types.ts and
// audit/repositories/types.ts — see those files' comments. Duplicated,
// not imported cross-module, so each domain module's repository layer
// stays self-contained.
export type PrismaClientLike = PrismaClient | Prisma.TransactionClient;
