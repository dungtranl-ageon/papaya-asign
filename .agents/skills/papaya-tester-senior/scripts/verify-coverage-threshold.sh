#!/usr/bin/env bash
# ==============================================================================
# Papaya QA: Verify Minimum Test Coverage Quality Gates
# ==============================================================================
set -euo pipefail

SUMMARY_FILE="./test-reports/coverage/coverage-summary.json"

echo "===================================================================="
echo "🛡️  PAPAYA QA: Evaluating Test Coverage Quality Gates..."
echo "===================================================================="

if [ ! -f "$SUMMARY_FILE" ]; then
    echo "⚠️  Coverage summary file not found at $SUMMARY_FILE."
    echo "   Please run .agents/skills/papaya-tester-senior/scripts/run-all-tests.sh first."
    exit 1
fi

# Define thresholds
MIN_STATEMENTS=85
MIN_BRANCHES=80
MIN_FUNCTIONS=90
MIN_LINES=85

node -e "
const fs = require('fs');
const summary = JSON.parse(fs.readFileSync('$SUMMARY_FILE', 'utf-8'));
const total = summary.total;

const check = (name, actual, min) => {
  const pct = actual.pct;
  const passed = pct >= min;
  console.log(\`   - \${name.padEnd(12)}: \${pct}% (Required: >=\${min}%) -> \${passed ? '✅ PASSED' : '❌ FAILED'}\`);
  return passed;
};

console.log('📈 Actual Coverage Metrics:');
const s = check('Statements', total.statements, $MIN_STATEMENTS);
const b = check('Branches', total.branches, $MIN_BRANCHES);
const f = check('Functions', total.functions, $MIN_FUNCTIONS);
const l = check('Lines', total.lines, $MIN_LINES);

if (!s || !b || !f || !l) {
  console.error('\n🚨 QA QUALITY GATE FAILED: Code coverage is below defined minimum thresholds!');
  process.exit(1);
} else {
  console.log('\n🎉 ALL QA QUALITY GATES PASSED: Ready for production release.');
}
"
