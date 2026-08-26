import { Controller, Get } from '@nestjs/common';
import { AuditEvent } from '@prisma/client';
import { AuditService } from './audit.service';

/**
 * M22 (docs/sprints/sprint-04.md, §4) — the first HTTP controller in
 * this backend beyond the default `AppController` stub. Every other
 * M14–M19 module is deliberately "no controller, no HTTP surface" (see
 * audit.module.ts's own comment); this one exists solely to give
 * `apps/admin`'s audit-log view (Founder Decision F.3: audit-log data
 * only) something to call.
 *
 * No auth guard yet — M22 explicitly excludes admin authentication
 * (`docs/sprints/sprint-04.md`, §4, M22). This endpoint MUST be gated
 * before any real deployment; it is safe only because this repository
 * remains non-production, synthetic-data-only throughout Sprint 04
 * (see PROJECT.md's synthetic-data-only discipline).
 */
@Controller('audit-events')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  findAll(): Promise<AuditEvent[]> {
    return this.auditService.findAll();
  }
}
