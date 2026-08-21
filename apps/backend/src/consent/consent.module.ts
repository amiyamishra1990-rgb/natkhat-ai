import { Module } from '@nestjs/common';
import { LifecycleModule } from '../lifecycle/lifecycle.module';
import { consentPrismaClientProvider } from './prisma-client.provider';
import { consentConfigProvider } from './consent.config.provider';
import { ConsentEventRepository } from './repositories/consent-event.repository';
import { ConsentService } from './consent.service';

// M17 — Consent & Privacy Gate, Track A scaffold
// (docs/sprints/sprint-03.md, §4). Self-contained, like AuditModule —
// its own Prisma provider, its own repository. Imports LifecycleModule
// for withdrawConsent's reuse of M16's Child soft-delete cascade
// (consent-architecture.md §5.2). No controller, no HTTP surface (same
// M14-M16 "repository/service layer only" convention).
@Module({
  imports: [LifecycleModule],
  providers: [
    consentPrismaClientProvider,
    consentConfigProvider,
    ConsentEventRepository,
    ConsentService,
  ],
  exports: [ConsentService],
})
export class ConsentModule {}
