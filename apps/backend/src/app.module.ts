import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityFamilyModule } from './identity-family/identity-family.module';
import { AuthModule } from './auth/auth.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { LifecycleModule } from './lifecycle/lifecycle.module';
import { AuditModule } from './audit/audit.module';
import { ConsentModule } from './consent/consent.module';
import { LeoModule } from './leo/leo.module';
import { AiProviderModule } from './ai-provider/ai-provider.module';
import { AdminAuthModule } from './admin-auth/admin-auth.module';

@Module({
  imports: [
    IdentityFamilyModule,
    AuthModule,
    AuthorizationModule,
    LifecycleModule,
    AuditModule,
    ConsentModule,
    LeoModule,
    AiProviderModule,
    AdminAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
