import { Module } from '@nestjs/common';
import { aiProviderConfigProvider } from './ai-provider.config.provider';
import { AdapterRegistry } from './adapter-registry';
import { MockAiProviderAdapter } from './adapters/mock.adapter';

// M19 — AI Provider Boundary & Mock Adapter
// (docs/sprints/sprint-03.md, §4; ADR-0013). Self-contained, like
// LeoModule/ConsentModule — its own config, no dependency on any
// other domain module (and, per ai-provider-boundary-contract.spec.ts,
// no other domain module may depend on this one either). No
// controller, no HTTP surface, no database — this milestone has none
// of the three (§26's explicit exclusions). `MockAiProviderAdapter` is
// exported alongside `AdapterRegistry` so a future consumer can
// `registry.register(mockAdapter)`; this module does not auto-register
// it itself, since nothing in this milestone's scope yet calls
// `AdapterRegistry.execute()` for a real product feature.
@Module({
  providers: [aiProviderConfigProvider, AdapterRegistry, MockAiProviderAdapter],
  exports: [AdapterRegistry, MockAiProviderAdapter],
})
export class AiProviderModule {}
