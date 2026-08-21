import { Module } from '@nestjs/common';
import { IdentityFamilyModule } from '../identity-family/identity-family.module';
import { AuditModule } from '../audit/audit.module';
import { LeoModule } from '../leo/leo.module';
import { lifecycleConfigProvider } from './lifecycle.config.provider';
import { LifecycleService } from './lifecycle.service';
import { ExportService } from './export.service';

// M16 — Data Lifecycle & Auditability Implementation
// (docs/sprints/sprint-03.md, §4). Depends on IdentityFamilyModule's
// exported repositories (M14) and AuditModule's exported AuditService
// — no repository or Prisma provider of its own, same pattern
// AuthorizationModule (M15) already established.
//
// M18 adds LeoModule: LifecycleService's Child/Family soft-delete
// cascades and hard-delete sweep now also reach
// Conversation/Message/LeoMemory (ai-memory-isolation.md §5.3) via
// LeoModule's exported LeoLifecycleService — extending, not
// replacing, this module's own M16 cascade logic.
@Module({
  imports: [IdentityFamilyModule, AuditModule, LeoModule],
  providers: [lifecycleConfigProvider, LifecycleService, ExportService],
  exports: [LifecycleService, ExportService],
})
export class LifecycleModule {}
