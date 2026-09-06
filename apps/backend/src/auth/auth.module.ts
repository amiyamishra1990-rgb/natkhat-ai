import { Module } from '@nestjs/common';
import { IdentityFamilyModule } from '../identity-family/identity-family.module';
import { FirebaseAuthService } from './firebase-auth.service';
import { ParentAuthGuard } from './parent-auth.guard';

// M15 — Authorization & Session Implementation
// (docs/sprints/sprint-03.md, §4; ADR-0016). No HTTP surface (no
// login-flow controller) is added in this milestone — same "no API
// endpoints" posture M14 held for identity-family, extended here: this
// module provides the token-verification service other application
// code will call, not a public route.
//
// M27 — exports ParentAuthGuard alongside FirebaseAuthService (same
// "module provides the guard, not a route of its own" posture
// admin-auth.module.ts already established for AdminAuthGuard) so any
// controller elsewhere in the app — leo-chat.controller.ts, first —
// can apply `@UseGuards(ParentAuthGuard)`.
@Module({
  imports: [IdentityFamilyModule],
  providers: [FirebaseAuthService, ParentAuthGuard],
  exports: [FirebaseAuthService, ParentAuthGuard],
})
export class AuthModule {}
