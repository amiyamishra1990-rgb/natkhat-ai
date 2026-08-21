import { Prisma, PrismaClient } from '@prisma/client';

// Mirrors identity-family/repositories/types.ts, audit/repositories/
// types.ts, consent/repositories/types.ts — see those files' comments.
// Duplicated, not imported cross-module, so each domain module's
// repository layer stays self-contained.
export type PrismaClientLike = PrismaClient | Prisma.TransactionClient;
