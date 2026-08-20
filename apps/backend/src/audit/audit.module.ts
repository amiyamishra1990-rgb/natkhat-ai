import { Module } from '@nestjs/common';
import { auditPrismaClientProvider } from './prisma-client.provider';
import { auditConfigProvider } from './audit.config.provider';
import { AuditEventRepository } from './repositories/audit-event.repository';
import { AuditService } from './audit.service';

// M16 — Data Lifecycle & Auditability Implementation
// (docs/sprints/sprint-03.md, §4). Self-contained, like
// IdentityFamilyModule — its own Prisma provider, its own repository.
// No controller, no HTTP surface (same M14/M15 "repository/service
// layer only" convention, restated in the M16 milestone entry via
// its "Expected files/directories" not naming a controller).
@Module({
  providers: [auditPrismaClientProvider, auditConfigProvider, AuditEventRepository, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
