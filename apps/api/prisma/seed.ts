import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.info('Starting Prisma database seeding...');

  const dataDir = path.resolve(__dirname, '../../../data');
  const policiesDir = path.join(dataDir, 'policies');
  const fixturesDir = path.join(dataDir, 'fixtures');

  // Seed Policies
  if (fs.existsSync(policiesDir)) {
    const policyFiles = fs.readdirSync(policiesDir).filter((f) => f.endsWith('.json'));
    for (const file of policyFiles) {
      const content = JSON.parse(fs.readFileSync(path.join(policiesDir, file), 'utf-8'));
      await prisma.policy.upsert({
        where: { policyNumber: content.policyNumber },
        update: {},
        create: {
          policyNumber: content.policyNumber,
          insuredName: content.insuredName,
          nationalId: content.nationalId,
          planName: content.planName,
          status: content.status,
          effectiveDate: new Date(content.effectiveDate),
          expiryDate: new Date(content.expiryDate),
          annualTotalLimit: content.annualTotalLimit,
          annualUsedAmount: content.annualUsedAmount || 0,
          exclusionsJson: JSON.stringify(content.exclusions || []),
          benefitsJson: JSON.stringify(content.benefits || []),
          waitingPeriodsJson: JSON.stringify(content.waitingPeriods || {}),
        },
      });
      console.info(`Seeded Policy: ${content.policyNumber}`);
    }
  }

  // Seed Claims
  if (fs.existsSync(fixturesDir)) {
    const claimFiles = fs.readdirSync(fixturesDir).filter((f) => f.endsWith('.json'));
    for (const file of claimFiles) {
      const content = JSON.parse(fs.readFileSync(path.join(fixturesDir, file), 'utf-8'));
      await prisma.claim.upsert({
        where: { claimId: content.claimId },
        update: {},
        create: {
          claimId: content.claimId,
          policyNumber: content.policyNumber,
          patientName: content.patientName,
          nationalId: content.nationalId,
          hospitalName: content.hospitalName,
          admissionDate: new Date(content.admissionDate),
          dischargeDate: new Date(content.dischargeDate),
          diagnosisIcd10: content.diagnosisIcd10,
          diagnosisDescription: content.diagnosisDescription,
          status: content.status,
          totalRequested: content.totalRequested,
          totalApproved: content.totalApproved || null,
          itemsJson: JSON.stringify(content.items || []),
          documentsJson: JSON.stringify(content.documents || []),
        },
      });
      console.info(`Seeded Claim: ${content.claimId}`);
    }
  }

  console.info('Prisma database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
