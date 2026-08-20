import { Prisma, PrismaClient } from '@prisma/client';

// Mirrors identity-family/repositories/types.ts — see that file's
// comment. Duplicated, not imported cross-module, so each domain
// module's repository layer stays self-contained (identity-family
// does not export this type either).
export type PrismaClientLike = PrismaClient | Prisma.TransactionClient;
