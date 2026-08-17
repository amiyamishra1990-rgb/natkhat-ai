import { Module } from '@nestjs/common';
import { IdentityFamilyModule } from '../identity-family/identity-family.module';
import { SupabaseAuthService } from './supabase-auth.service';

// M15 — Authorization & Session Implementation
// (docs/sprints/sprint-03.md, §4). No HTTP surface (no login-flow
// controller) is added in this milestone — same "no API endpoints"
// posture M14 held for identity-family, extended here: this module
// provides the token-verification service other application code
// will call, not a public route.
@Module({
  imports: [IdentityFamilyModule],
  providers: [SupabaseAuthService],
  exports: [SupabaseAuthService],
})
export class AuthModule {}
