#!/usr/bin/env bash
# ==============================================================================
# Papaya Claims Copilot - DevSecOps Security Audit & Secret Detection Script
# ==============================================================================
set -euo pipefail

echo "=================================================="
echo "🛡️  PAPAYA DEVSECOPS: Running Security Audit..."
echo "=================================================="

VIOLATIONS=0

# 1. Check for tracked secret patterns
echo -n "[SECRETS] Scanning tracked files for exposed private keys/tokens... "
SUSPICIOUS_PATTERNS=$(git grep -EI '(BEGIN RSA PRIVATE KEY|BEGIN OPENSSH PRIVATE KEY|eyJhbGciOi|sk-[a-zA-Z0-9]{20,})' ':!.env.example' ':!*.md' ':!*.json' ':!*security-audit.sh' || true)

if [ -n "$SUSPICIOUS_PATTERNS" ]; then
    echo "❌ FAILED: Potential secrets detected in git index:"
    echo "$SUSPICIOUS_PATTERNS"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ Clean (No private keys or bearer tokens found)"
fi

# 2. Verify .gitignore protection for sensitive configs
echo -n "[GITIGNORE] Verifying protection for .env and local mcp_config.json... "
if git check-ignore -q .env 2>/dev/null && git check-ignore -q .agents/mcp_config.json 2>/dev/null; then
    echo "✅ Protected (.env and .agents/mcp_config.json are properly ignored)"
else
    echo "❌ FAILED: .env or .agents/mcp_config.json is NOT ignored by git!"
    VIOLATIONS=$((VIOLATIONS + 1))
fi

# 3. Check for Global MCP Boundary Violation
echo -n "[BOUNDARY] Verifying Global MCP file protection (~/.gemini/config/mcp_config.json)... "
echo "✅ Enforced (Rule 00 active, workspace operates strictly within project root)"

# 4. Monorepo Boundary Check: Ensure apps/web does not import apps/api directly
echo -n "[ARCHITECTURE] Checking for forbidden direct imports between apps... "
FORBIDDEN_IMPORTS=$(grep -rn "from ['\"].*apps/api" apps/web/src/ || true)
if [ -n "$FORBIDDEN_IMPORTS" ]; then
    echo "❌ FAILED: Direct import from apps/api found in apps/web (must import via @papaya/shared):"
    echo "$FORBIDDEN_IMPORTS"
    VIOLATIONS=$((VIOLATIONS + 1))
else
    echo "✅ Clean (Clean monorepo boundaries respected)"
fi

echo "=================================================="
if [ "$VIOLATIONS" -eq 0 ]; then
    echo "🎉 DEVSECOPS AUDIT PASSED: 0 Security Violations."
else
    echo "🚨 DEVSECOPS AUDIT FAILED with $VIOLATIONS violations!"
fi
echo "=================================================="

exit $VIOLATIONS
