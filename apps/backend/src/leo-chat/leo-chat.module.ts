import { Module } from '@nestjs/common';
import { LeoModule } from '../leo/leo.module';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { AiProviderModule } from '../ai-provider/ai-provider.module';
import { LeoChatController } from './leo-chat.controller';
import { LeoChatService } from './leo-chat.service';

/**
 * M27 (docs/sprints/sprint-06.md, §7; founder decisions H.2/H.6) — the
 * first module in this backend that intentionally sits on both sides
 * of the AI-provider boundary: it imports `LeoModule` (core domain,
 * exports `LeoService` unmodified) and `AiProviderModule` (the
 * boundary, exports `AdapterRegistry`/`MockAiProviderAdapter`)
 * together, which `ai-provider-boundary-contract.spec.ts` explicitly
 * permits — that check only scans the fixed `src/leo/` (and other
 * M14-M18) directory for an `ai-provider` import, not this one. This
 * module is exactly the "boundary-crossing orchestration" layer
 * ai-provider-boundary.md always assumed would exist outside core
 * domain (§3's diagram), now real for the first time. `AuthModule` is
 * imported for `ParentAuthGuard`; `AuthorizationModule` for
 * `AuthorizationService` (leo-chat.service.ts's own
 * `listMessages` gate — see that file's comment for why it's needed
 * there specifically).
 */
@Module({
  imports: [LeoModule, AuthModule, AuthorizationModule, AiProviderModule],
  controllers: [LeoChatController],
  providers: [LeoChatService],
})
export class LeoChatModule {}
