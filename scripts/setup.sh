#!/usr/bin/env bash
# Repository bootstrap — Sprint 01, Milestone 1.
# Installs dependencies and prepares a local .env. No app-specific
# setup exists yet (apps/ is not scaffolded until Milestone 8).
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found. Enable it via corepack: corepack enable && corepack prepare pnpm@9.15.4 --activate" >&2
  exit 1
fi

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "Created .env from .env.example."
fi

pnpm install

echo "Setup complete. Run 'pnpm check-env' to verify your environment."
