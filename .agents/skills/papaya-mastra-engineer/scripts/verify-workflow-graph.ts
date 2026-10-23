import { executeClaimsAssessmentWorkflow } from '../../../../apps/api/src/modules/mastra/mastra.workflow';
import { Claim, Policy } from '../../../../packages/shared/src';
import * as fs from 'fs';
import * as path from 'path';

console.log('====================================================================');
console.log('🚀 PAPAYA MASTRA ENGINEER: Verifying Deterministic Workflow Graph...');
console.log('====================================================================\n');

const FIXTURES_DIR = path.resolve(__dirname, '../../../../data/fixtures');
const POLICIES_DIR = path.resolve(__dirname, '../../../../data/policies');

interface TestCaseConfig {
  name: string;
  claimFile: string;
  policyFile: string;
  expectedRecommendation: string;
}

const TEST_CASES: TestCaseConfig[] = [
  {
    name: 'TC01: Appendicitis Surgery (Approve with 20% Copay)',
    claimFile: 'tc01-approve.json',
    policyFile: 'POL-GOLD-99882.json',
    expectedRecommendation: 'APPROVE',
  },
  {
    name: 'TC02: GERD (Reject - Excluded Disease K21)',
    claimFile: 'tc02-reject.json',
    policyFile: 'POL-SILVER-11223.json',
    expectedRecommendation: 'REJECT',
  },
  {
    name: 'TC03: Bronchitis (Request Info - Unclear Detailed Invoice)',
    claimFile: 'tc03-request-info.json',
    policyFile: 'POL-GOLD-99882.json',
    expectedRecommendation: 'REQUEST_MORE_INFO',
  },
];

async function runVerification() {
  let passedCount = 0;

  for (const tc of TEST_CASES) {
    console.log(`📋 Running: ${tc.name}`);
    const claimPath = path.join(FIXTURES_DIR, tc.claimFile);
    const policyPath = path.join(POLICIES_DIR, tc.policyFile);

    const claim: Claim = JSON.parse(fs.readFileSync(claimPath, 'utf-8'));
    const policy: Policy = JSON.parse(fs.readFileSync(policyPath, 'utf-8'));

    const observedSteps: string[] = [];

    const report = await executeClaimsAssessmentWorkflow({ claim, policy }, (step, _data) => {
      observedSteps.push(step);
    });

    // 1. Verify all 4 mandatory steps were executed
    const expectedEvents = [
      'VERIFY_DOCUMENT_COMPLETE',
      'LOOKUP_POLICY_COMPLETE',
      'CHECK_MEDICAL_NECESSITY_COMPLETE',
      'CALCULATE_BENEFIT_COMPLETE',
      'REPORT_COMPLETE',
    ];

    const missingEvents = expectedEvents.filter(e => !observedSteps.includes(e));
    if (missingEvents.length > 0) {
      console.error(`  ❌ Graph skipped events: ${missingEvents.join(', ')}`);
      process.exit(1);
    }

    // 2. Verify recommendation matches expectation
    if (report.finalRecommendation !== tc.expectedRecommendation) {
      console.error(
        `  ❌ Recommendation mismatch: Expected ${tc.expectedRecommendation}, got ${report.finalRecommendation}`,
      );
      process.exit(1);
    }

    // 3. Verify arithmetic conservation
    const mathDelta = Math.abs(
      report.totalRequested - (report.totalPayable + report.totalDeductions),
    );
    if (mathDelta > 0.01) {
      console.error(
        `  ❌ Math conservation violated: Requested ${report.totalRequested} != Payable ${report.totalPayable} + Deductions ${report.totalDeductions}`,
      );
      process.exit(1);
    }

    console.log(
      `  ✅ PASSED: Recommendation = ${report.finalRecommendation} | Payable = ${report.totalPayable.toLocaleString()} VND | Confidence = ${report.confidenceScore}%`,
    );
    passedCount++;
  }

  console.log('\n====================================================================');
  console.log(
    `🎉 WORKFLOW GRAPH VERIFICATION PASSED: ${passedCount}/${TEST_CASES.length} Test Cases Succeeded.`,
  );
  console.log('====================================================================');
}

runVerification().catch(err => {
  console.error('❌ Verification failed with error:', err);
  process.exit(1);
});
