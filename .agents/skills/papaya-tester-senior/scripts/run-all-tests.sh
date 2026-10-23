#!/usr/bin/env bash
# ==============================================================================
# Papaya QA: Automated Comprehensive Test Suite & Report Generator
# ==============================================================================
set -euo pipefail

REPORT_DIR="./test-reports"
COVERAGE_DIR="$REPORT_DIR/coverage"

echo "===================================================================="
echo "🧪 PAPAYA SENIOR QA: Executing Full Test Suite & Coverage Analysis..."
echo "===================================================================="

# 1. Prepare reports directory
mkdir -p "$COVERAGE_DIR"

# 2. Execute Vitest with reporters and coverage output to test-reports/
echo "📊 Running tests and writing reports to $REPORT_DIR..."
pnpm vitest run \
  --coverage \
  --coverage.reportsDirectory="$COVERAGE_DIR" \
  --coverage.reporter=text \
  --coverage.reporter=html \
  --coverage.reporter=lcov \
  --coverage.reporter=json-summary \
  --outputFile.junit="$REPORT_DIR/junit.xml" \
  --outputFile.json="$REPORT_DIR/summary.json"

echo "===================================================================="
echo "✅ Testing execution finished successfully!"
echo "📁 Generated Reports:"
echo "   - HTML Coverage: $COVERAGE_DIR/index.html"
echo "   - LCOV Data:     $COVERAGE_DIR/lcov.info"
echo "   - JUnit XML:     $REPORT_DIR/junit.xml"
echo "   - Summary JSON:  $REPORT_DIR/summary.json"
echo "===================================================================="
