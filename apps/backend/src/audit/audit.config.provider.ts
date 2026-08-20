import { Provider } from '@nestjs/common';
import { loadAuditConfig } from './audit.config';

export const AUDIT_CONFIG = Symbol('AUDIT_CONFIG');

export const auditConfigProvider: Provider = {
  provide: AUDIT_CONFIG,
  useFactory: () => loadAuditConfig(),
};
