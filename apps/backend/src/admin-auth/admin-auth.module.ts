import { Module } from '@nestjs/common';
import { adminAuthPrismaClientProvider } from './prisma-client.provider';
import { AdminUserRepository } from './repositories/admin-user.repository';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthGuard } from './admin-auth.guard';

// M25 (docs/sprints/sprint-05.md, §4; Founder Decision G.2).
// Self-contained, like AuditModule/IdentityFamilyModule — its own
// Prisma provider, its own repository. No controller: this module
// provides AdminAuthGuard for other controllers to apply
// (`@UseGuards(AdminAuthGuard)`), not a public route of its own — same
// "no HTTP surface" posture auth.module.ts holds for
// FirebaseAuthService.
@Module({
  providers: [adminAuthPrismaClientProvider, AdminUserRepository, AdminAuthService, AdminAuthGuard],
  exports: [AdminAuthService, AdminAuthGuard],
})
export class AdminAuthModule {}
