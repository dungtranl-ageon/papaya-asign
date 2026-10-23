#!/usr/bin/env bash
# ==============================================================================
# Papaya Claims Copilot - Automated Service Healthcheck & Readiness Script
# ==============================================================================
set -euo pipefail

echo "=================================================="
echo "🔍 PAPAYA DEVOPS: Running Automated Healthcheck..."
echo "=================================================="

FAILED=0

# 1. Check Docker Containers if docker is running
if command -v docker &> /dev/null && docker info &> /dev/null; then
    echo -n "[DOCKER] Checking running containers... "
    RUNNING_CONTAINERS=$(docker ps --filter "name=papaya" --format "{{.Names}}: {{.Status}}")
    if [ -n "$RUNNING_CONTAINERS" ]; then
        echo "✅ OK"
        echo "$RUNNING_CONTAINERS" | sed 's/^/   -> /'
    else
        echo "ℹ️  No papaya containers currently running (SQLite local mode active)."
    fi
else
    echo "ℹ️  Docker daemon not running or not available. Skipping container check."
fi

# 2. Check NestJS API Service (Port 3001)
echo -n "[API] Checking NestJS API (http://localhost:3001/claims)... "
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/claims || echo "000")
if [ "$API_STATUS" -eq 200 ]; then
    echo "✅ OK (HTTP $API_STATUS)"
else
    echo "⚠️  DOWN or NOT RUNNING (HTTP $API_STATUS)"
fi

# 3. Check Next.js Frontend (Port 3000)
echo -n "[WEB] Checking Next.js Workstation (http://localhost:3000)... "
WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$WEB_STATUS" -eq 200 ] || [ "$WEB_STATUS" -eq 304 ]; then
    echo "✅ OK (HTTP $WEB_STATUS)"
else
    echo "⚠️  DOWN or NOT RUNNING (HTTP $WEB_STATUS)"
fi

# 4. Check Local SQLite Database file
echo -n "[DATABASE] Checking SQLite DB file... "
if [ -f "./data/papaya_claims.db" ]; then
    DB_SIZE=$(du -h ./data/papaya_claims.db | cut -f1)
    echo "✅ Found ($DB_SIZE)"
else
    echo "ℹ️  ./data/papaya_claims.db not found (Run 'pnpm db:push && pnpm db:seed' to initialize)."
fi

# 5. Check Test Fixtures
echo -n "[DATA] Checking test cases (tc01, tc02, tc03)... "
if [ -f "./data/fixtures/tc01-approve.json" ] && [ -f "./data/fixtures/tc02-reject.json" ] && [ -f "./data/fixtures/tc03-request-info.json" ]; then
    echo "✅ All 3 test cases present"
else
    echo "❌ Missing test fixtures in ./data/fixtures"
    FAILED=1
fi

echo "=================================================="
if [ "$FAILED" -eq 0 ]; then
    echo "🎉 HEALTHCHECK PASSED: System definitions intact."
else
    echo "⚠️  HEALTHCHECK FINISHED WITH WARNINGS."
fi
echo "=================================================="
exit $FAILED
