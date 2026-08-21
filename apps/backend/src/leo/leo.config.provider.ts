import { Provider } from '@nestjs/common';
import { loadLeoConfig } from './leo.config';

export const LEO_CONFIG = Symbol('LEO_CONFIG');

export const leoConfigProvider: Provider = {
  provide: LEO_CONFIG,
  useFactory: () => loadLeoConfig(),
};
