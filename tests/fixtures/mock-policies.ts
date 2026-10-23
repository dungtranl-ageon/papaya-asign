import { Policy } from '../../packages/shared/src';

export const mockGoldPolicy: Policy = {
  policyNumber: 'POL-GOLD-99882',
  insuredName: 'Nguyen Van A',
  nationalId: '001099012345',
  planName: 'Healthcare Gold',
  status: 'ACTIVE',
  effectiveDate: '2026-01-01T00:00:00Z',
  expiryDate: '2026-12-31T23:59:59Z',
  annualTotalLimit: 500000000,
  annualUsedAmount: 15000000,
  waitingPeriods: {
    PRE_EXISTING: 365,
    MATERNITY: 270,
    SPECIAL_DISEASE: 180,
  },
  exclusions: ['K21', 'Z41.1', 'F32'],
  benefits: [
    {
      category: 'INPATIENT',
      maxLimitPerClaim: 60000000,
      maxLimitPerYear: 200000000,
      copayRate: 0.1, // 10%
      subLimitPerDay: 3000000,
    },
    {
      category: 'SURGERY',
      maxLimitPerClaim: 50000000,
      maxLimitPerYear: 150000000,
      copayRate: 0.2, // 20%
    },
    {
      category: 'MEDICATION',
      maxLimitPerClaim: 15000000,
      maxLimitPerYear: 50000000,
      copayRate: 0.1, // 10%
    },
    {
      category: 'LABORATORY',
      maxLimitPerClaim: 10000000,
      maxLimitPerYear: 30000000,
      copayRate: 0.1, // 10%
    },
  ],
};

export const mockSilverPolicy: Policy = {
  policyNumber: 'POL-SILVER-11223',
  insuredName: 'Tran Thi B',
  nationalId: '079198054321',
  planName: 'Healthcare Silver',
  status: 'ACTIVE',
  effectiveDate: '2026-01-01T00:00:00Z',
  expiryDate: '2026-12-31T23:59:59Z',
  annualTotalLimit: 200000000,
  annualUsedAmount: 50000000,
  waitingPeriods: {
    PRE_EXISTING: 365,
    SPECIAL_DISEASE: 180,
  },
  exclusions: ['K21', 'K29', 'M54.5'],
  benefits: [
    {
      category: 'INPATIENT',
      maxLimitPerClaim: 20000000,
      maxLimitPerYear: 80000000,
      copayRate: 0.2, // 20%
      subLimitPerDay: 1500000,
    },
    {
      category: 'OUTPATIENT',
      maxLimitPerClaim: 3000000,
      maxLimitPerYear: 15000000,
      copayRate: 0.2, // 20%
    },
    {
      category: 'MEDICATION',
      maxLimitPerClaim: 5000000,
      maxLimitPerYear: 20000000,
      copayRate: 0.2, // 20%
    },
  ],
};
