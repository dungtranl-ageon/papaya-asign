import * as fs from 'fs';
import * as path from 'path';
import { ClaimSchema, PolicySchema } from '../../../../packages/shared/dist';

/**
 * Papaya Data Engineering Integrity & Reconciliation Verifier
 * Audits all JSON fixtures, relational links, and arithmetic conservation.
 */
function verifyDataIntegrity(): boolean {
  console.info('====================================================================');
  console.info('🔍 PAPAYA DATA ENGINEER: Auditing Data Integrity & Reconciliation...');
  console.info('====================================================================\n');

  const rootDir = path.resolve(__dirname, '../../../../');
  const dataDir = path.join(rootDir, 'data');
  const policiesDir = path.join(dataDir, 'policies');
  const fixturesDir = path.join(dataDir, 'fixtures');

  let totalErrors = 0;
  let policiesChecked = 0;
  let claimsChecked = 0;

  const loadedPolicies = new Map<string, any>();

  // 1. Audit Policies
  console.info('📁 [1/3] Auditing Policies Schema & Business Bounds...');
  if (fs.existsSync(policiesDir)) {
    const policyFiles = fs.readdirSync(policiesDir).filter(f => f.endsWith('.json'));
    for (const file of policyFiles) {
      const filePath = path.join(policiesDir, file);
      try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const parseResult = PolicySchema.safeParse(raw);

        if (!parseResult.success) {
          console.error(
            `❌ [POLICY ERROR] ${file} failed schema validation:`,
            parseResult.error.format(),
          );
          totalErrors++;
          continue;
        }

        const policy = parseResult.data;
        policiesChecked++;
        loadedPolicies.set(policy.policyNumber, policy);

        // Audit date validity
        const effective = new Date(policy.effectiveDate).getTime();
        const expiry = new Date(policy.expiryDate).getTime();
        if (effective >= expiry) {
          console.error(
            `❌ [POLICY BOUND ERROR] ${file}: effectiveDate (${policy.effectiveDate}) must be before expiryDate (${policy.expiryDate})`,
          );
          totalErrors++;
        }

        // Audit limit bounds
        if (policy.annualTotalLimit <= 0) {
          console.error(
            `❌ [POLICY BOUND ERROR] ${file}: annualTotalLimit must be positive (got ${policy.annualTotalLimit})`,
          );
          totalErrors++;
        }

        console.info(`  ✅ Validated Policy: ${policy.policyNumber} (${policy.planName})`);
      } catch (err) {
        console.error(`❌ [JSON READ ERROR] ${file}:`, err);
        totalErrors++;
      }
    }
  }

  // 2. Audit Claims
  console.info('\n📁 [2/3] Auditing Claims, Foreign Keys & Arithmetic Conservation...');
  if (fs.existsSync(fixturesDir)) {
    const claimFiles = fs.readdirSync(fixturesDir).filter(f => f.endsWith('.json'));
    for (const file of claimFiles) {
      const filePath = path.join(fixturesDir, file);
      try {
        const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const parseResult = ClaimSchema.safeParse(raw);

        if (!parseResult.success) {
          console.error(
            `❌ [CLAIM ERROR] ${file} failed schema validation:`,
            parseResult.error.format(),
          );
          totalErrors++;
          continue;
        }

        const claim = parseResult.data;
        claimsChecked++;

        // Audit Foreign Key integrity
        if (!loadedPolicies.has(claim.policyNumber)) {
          console.error(
            `❌ [FOREIGN KEY ERROR] ${file}: policyNumber '${claim.policyNumber}' not found in registered policies!`,
          );
          totalErrors++;
        }

        // Audit dates
        const admission = new Date(claim.admissionDate).getTime();
        const discharge = new Date(claim.dischargeDate).getTime();
        if (admission > discharge) {
          console.error(
            `❌ [TEMPORAL ERROR] ${file}: admissionDate must be before or equal to dischargeDate`,
          );
          totalErrors++;
        }

        // Audit Arithmetic Conservation: sum(items.amountRequested) == totalRequested
        const sumItems = claim.items.reduce(
          (acc: number, item: { amountRequested: number }) => acc + item.amountRequested,
          0,
        );
        if (Math.abs(sumItems - claim.totalRequested) > 0.01) {
          console.error(
            `❌ [ARITHMETIC ERROR] ${file}: totalRequested (${claim.totalRequested}) does NOT match sum of items (${sumItems})!`,
          );
          totalErrors++;
        }

        console.info(
          `  ✅ Validated Claim: ${claim.claimId} [${claim.diagnosisIcd10}] - ${claim.totalRequested.toLocaleString()} VND (Math Conserved)`,
        );
      } catch (err) {
        console.error(`❌ [JSON READ ERROR] ${file}:`, err);
        totalErrors++;
      }
    }
  }

  // 3. Summary
  console.info('\n====================================================================');
  if (totalErrors === 0) {
    console.info(`🎉 DATA INTEGRITY AUDIT PASSED: 0 Violations.`);
    console.info(
      `📊 Summary: ${policiesChecked} Policies verified, ${claimsChecked} Claims reconciled.`,
    );
    console.info('====================================================================');
    return true;
  } else {
    console.error(`🚨 DATA INTEGRITY AUDIT FAILED: ${totalErrors} Violations detected!`);
    console.info('====================================================================');
    return false;
  }
}

// Execute check
const isClean = verifyDataIntegrity();
if (!isClean) {
  process.exit(1);
}
