#!/usr/bin/env bash
# ==============================================================================
# Papaya Claims Copilot - One-Click Local Development & Deployment Runner
# ==============================================================================
set -euo pipefail

echo "=================================================="
echo "🚀 PAPAYA DEVOPS: Preparing Local Environment..."
echo "=================================================="

# 1. Ensure .env exists
if [ ! -f ".env" ]; then
    echo "ℹ️  .env file not found. Copying from .env.example..."
    cp .env.example .env
fi

# 2. Check dependencies
echo "📦 Checking and linking pnpm dependencies..."
pnpm install --frozen-lockfile=false

# 3. Build Shared Packages
echo "⚙️  Building @papaya/shared and @papaya/mcp-server..."
pnpm --filter @papaya/shared build
pnpm --filter @papaya/mcp-server build

# 4. Generate & Seed Prisma DB
echo "🗄️  Generating Prisma Client & seeding default data..."
pnpm --filter @papaya/api db:generate
pnpm --filter @papaya/api db:push
pnpm --filter @papaya/api db:seed

# 5. Run Healthcheck
echo "🔍 Validating environment health..."
bash .agents/skills/papaya-devops/scripts/healthcheck.sh

echo "=================================================="
echo "✨ Setup complete! To launch the developer workstation:"
echo "   run: pnpm dev"
echo "=================================================="
