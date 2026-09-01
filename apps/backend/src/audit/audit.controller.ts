import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditEvent } from '@prisma/client';
import { AuditService } from './audit.service';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard';

/**
 * M22 (docs/sprints/sprint-04.md, §4) — the first HTTP controller in
 * this backend beyond the default `AppController` stub. Every other
 * M14–M19 module is deliberately "no controller, no HTTP surface" (see
 * audit.module.ts's own comment); this one exists solely to give
 * `apps/admin`'s audit-log view (Founder Decision F.3: audit-log data
 * only) something to call.
 *
 * M25 (docs/sprints/sprint-05.md, §4; Founder Decision G.2) closed the
 * gap this comment used to flag ("no auth guard yet... must be closed
 * before any real deployment"): `AdminAuthGuard` now gates this
 * endpoint, requiring a verified Firebase ID token that resolves to an
 * `AdminUser` — a distinct admin-principal type, not a Parent/Child
 * credential (see admin-auth/admin-auth.service.ts). What this
 * endpoint returns is unchanged; only who may call it changed.
 */
@Controller('audit-events')
@UseGuards(AdminAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(): Promise<AuditEvent[]> {
    return this.auditService.findAll();
  }
}
