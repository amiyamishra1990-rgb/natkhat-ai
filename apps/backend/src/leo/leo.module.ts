import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module';
import { leoPrismaClientProvider } from './prisma-client.provider';
import { leoConfigProvider } from './leo.config.provider';
import { ConversationRepository } from './repositories/conversation.repository';
import { MessageRepository } from './repositories/message.repository';
import { LeoMemoryRepository } from './repositories/leo-memory.repository';
import { FamilyEncryptionKeyRepository } from './repositories/family-encryption-key.repository';
import { LeoEncryptionService } from './leo-encryption.service';
import { LeoService } from './leo.service';
import { LeoLifecycleService } from './leo-lifecycle.service';

// M18 — Leo Foundation & Memory Isolation
// (docs/sprints/sprint-03.md, §4). Self-contained, like AuditModule/
// ConsentModule — its own Prisma provider, its own repositories. No
// controller, no HTTP surface (same M14-M17 "repository/service layer
// only" convention). Exports LeoLifecycleService separately from
// LeoService so LifecycleModule (M16) can depend on the cascade/sweep
// surface without gaining access to conversation/memory read-write
// methods it has no business calling.
//
// M23 — imports AuthorizationModule (M15) so LeoService can call
// AuthorizationService.authorize(...) for the new `interact_with_leo`
// Action; AuthorizationModule itself only imports IdentityFamilyModule
// and AuditModule, so this introduces no circular dependency.
@Module({
  imports: [AuthorizationModule],
  providers: [
    leoPrismaClientProvider,
    leoConfigProvider,
    ConversationRepository,
    MessageRepository,
    LeoMemoryRepository,
    FamilyEncryptionKeyRepository,
    LeoEncryptionService,
    LeoService,
    LeoLifecycleService,
  ],
  exports: [LeoService, LeoLifecycleService],
})
export class LeoModule {}
