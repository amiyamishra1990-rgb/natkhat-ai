import type { NextConfig } from 'next';

// agentRules disabled: `next dev`/`next build` otherwise auto-generates
// AGENTS.md/CLAUDE.md in this directory on every run (Next 16's
// agent-rules feature) — noise this repo does not want committed or
// repeatedly regenerated as untracked files.
const nextConfig: NextConfig = { agentRules: false };

export default nextConfig;
