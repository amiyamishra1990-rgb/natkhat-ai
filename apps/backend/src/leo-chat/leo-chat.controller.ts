import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Conversation } from '@prisma/client';
import { DecryptedMessage, LeoService } from '../leo/leo.service';
import { LeoChatService, LeoChatTurn } from './leo-chat.service';
import { ParentAuthGuard } from '../auth/parent-auth.guard';
import { CurrentParent, type RequestParent } from '../auth/current-parent.decorator';

export interface StartConversationBody {
  familyId: string;
  childId: string;
}

export interface SendMessageBody {
  familyId: string;
  childId: string;
  content: string;
}

function requireNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException(`"${fieldName}" is required and must be a non-empty string`);
  }
  return value;
}

/**
 * M27 (docs/sprints/sprint-06.md, §7; founder decisions H.2/H.6) — the
 * first HTTP controller for the Leo module (leo.module.ts's own
 * comment previously read "no controller, no HTTP surface" for every
 * M18-M23 Leo capability). Reuses `LeoService`'s existing
 * `startConversation`/`appendMessage`/`listMessages` as-is (not
 * reimplemented) via `LeoChatService` (the boundary-crossing
 * orchestrator, kept outside `src/leo/` — see leo-chat.service.ts's
 * own header comment for why).
 *
 * `@UseGuards(ParentAuthGuard)` at the controller level, same
 * placement `AuditController` already uses for `AdminAuthGuard` — every
 * route requires a real parent-authenticated principal before anything
 * else runs. That guard resolves *identity* only; the M23
 * `interact_with_leo` two-gate authorization check (tenant scope +
 * action permission) still runs independently inside `LeoService` for
 * every call here, reused exactly as M23 built it, not redesigned or
 * weakened (`LeoChatNotAuthorizedError` propagates as a 500 today,
 * same as every other unmapped domain error in this backend — no
 * NestJS exception filter exists yet for domain errors, out of this
 * milestone's plumbing-only scope).
 *
 * No child-login/child-session is introduced or assumed anywhere here
 * — every request is parent-authenticated and (per this milestone's
 * scope) the message content is the parent-relayed child message, not
 * an independent child-issued request (ADR-0009 Decision item 7
 * remains untouched).
 */
@Controller('leo/conversations')
@UseGuards(ParentAuthGuard)
export class LeoChatController {
  constructor(
    private readonly leoService: LeoService,
    private readonly leoChatService: LeoChatService,
  ) {}

  @Post()
  startConversation(
    @Body() body: StartConversationBody,
    @CurrentParent() parent: RequestParent,
  ): Promise<Conversation> {
    const familyId = requireNonEmptyString(body?.familyId, 'familyId');
    const childId = requireNonEmptyString(body?.childId, 'childId');

    return this.leoService.startConversation({
      familyId,
      childId,
      principalId: parent.id,
      principalType: 'Parent',
    });
  }

  @Post(':conversationId/messages')
  sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() body: SendMessageBody,
    @CurrentParent() parent: RequestParent,
  ): Promise<LeoChatTurn> {
    const familyId = requireNonEmptyString(body?.familyId, 'familyId');
    const childId = requireNonEmptyString(body?.childId, 'childId');
    const content = requireNonEmptyString(body?.content, 'content');

    return this.leoChatService.sendMessage({
      conversationId,
      familyId,
      childId,
      content,
      principalId: parent.id,
      principalType: 'Parent',
    });
  }

  @Get(':conversationId/messages')
  listMessages(
    @Param('conversationId') conversationId: string,
    @Query('familyId') familyId: string,
    @Query('childId') childId: string,
    @CurrentParent() parent: RequestParent,
  ): Promise<DecryptedMessage[]> {
    requireNonEmptyString(familyId, 'familyId');
    requireNonEmptyString(childId, 'childId');

    return this.leoChatService.listMessages({
      conversationId,
      familyId,
      childId,
      principalId: parent.id,
      principalType: 'Parent',
    });
  }
}
