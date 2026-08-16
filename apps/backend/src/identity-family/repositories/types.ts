import { Prisma, PrismaClient } from '@prisma/client';

// A repository may be handed either the DI-managed admin PrismaClient
// or an app-role transaction client (rls-context.ts's withRlsContext)
// — both expose the same generated model delegates this layer needs.
export type PrismaClientLike = PrismaClient | Prisma.TransactionClient;
