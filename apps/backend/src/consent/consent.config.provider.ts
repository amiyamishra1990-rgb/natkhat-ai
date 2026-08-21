import { Provider } from '@nestjs/common';
import { loadConsentConfig } from './consent.config';

export const CONSENT_CONFIG = Symbol('CONSENT_CONFIG');

export const consentConfigProvider: Provider = {
  provide: CONSENT_CONFIG,
  useFactory: () => loadConsentConfig(),
};
