import { Provider } from '@nestjs/common';
import { loadLifecycleConfig } from './lifecycle.config';

export const LIFECYCLE_CONFIG = Symbol('LIFECYCLE_CONFIG');

export const lifecycleConfigProvider: Provider = {
  provide: LIFECYCLE_CONFIG,
  useFactory: () => loadLifecycleConfig(),
};
