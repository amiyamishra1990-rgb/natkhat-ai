import { Module } from '@nestjs/common';
import { IdentityFamilyModule } from '../identity-family/identity-family.module';
import { FirebaseAuthService } from './firebase-auth.service';

// M15 — Authorization & Session Implementation
// (docs/sprints/sprint-03.md, §4; ADR-0016). No HTTP surface (no
// login-flow controller) is added in this milestone — same "no API
// endpoints" posture M14 held for identity-family, extended here: this
// module provides the token-verification service other application
// code will call, not a public route.
@Module({
  imports: [IdentityFamilyModule],
  providers: [FirebaseAuthService],
  exports: [FirebaseAuthService],
})
export class AuthModule {}
