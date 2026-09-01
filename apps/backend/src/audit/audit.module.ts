import { Module } from '@nestjs/common';
import { auditPrismaClientProvider } from './prisma-client.provider';
import { auditConfigProvider } from './audit.config.provider';
import { AuditEventRepository } from './repositories/audit-event.repository';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';

// M16 — Data Lifecycle & Auditability Implementation
// (docs/sprints/sprint-03.md, §4). Self-contained, like
// IdentityFamilyModule — its own Prisma provider, its own repository.
//
// M22 (docs/sprints/sprint-04.md, §4) added AuditController — the
// module's first HTTP surface, scoped strictly to this module's own
// data (see audit.controller.ts). Every other domain module (M14/M15/
// M17–M19) remains controller-free; this one gained a read endpoint
// specifically because Founder Decision F.3 bounds `apps/admin` to
// audit-log data only.
//
// M25 (docs/sprints/sprint-05.md, §4) imports AdminAuthModule so
// AuditController can inject AdminAuthGuard — closing the no-auth-guard
// gap M22 deliberately left open (see audit.controller.ts's own
// updated comment).
@Module({
  imports: [AdminAuthModule],
  controllers: [AuditController],
  providers: [auditPrismaClientProvider, auditConfigProvider, AuditEventRepository, AuditService],
  exports: [AuditService],
})
export class AuditModule {}
