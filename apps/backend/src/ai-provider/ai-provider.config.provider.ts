import { Provider } from '@nestjs/common';
import { loadAiProviderConfig } from './ai-provider.config';

export const AI_PROVIDER_CONFIG = Symbol('AI_PROVIDER_CONFIG');

export const aiProviderConfigProvider: Provider = {
  provide: AI_PROVIDER_CONFIG,
  useFactory: () => loadAiProviderConfig(),
};
