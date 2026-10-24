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
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
    {
      category: 'SURGERY',
      maxLimitPerClaim: 50000000,
      maxLimitPerYear: 150000000,
      copayRate: 0.2, // 20%
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
    {
      category: 'MEDICATION',
      maxLimitPerClaim: 15000000,
      maxLimitPerYear: 50000000,
      copayRate: 0.1, // 10%
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
    {
      category: 'LABORATORY',
      maxLimitPerClaim: 10000000,
      maxLimitPerYear: 30000000,
      copayRate: 0.1, // 10%
      waitingPeriodDays: 0,
      requiresPreAuth: false,
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
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
    {
      category: 'OUTPATIENT',
      maxLimitPerClaim: 3000000,
      maxLimitPerYear: 15000000,
      copayRate: 0.2, // 20%
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
    {
      category: 'MEDICATION',
      maxLimitPerClaim: 5000000,
      maxLimitPerYear: 20000000,
      copayRate: 0.2, // 20%
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
  ],
};

export const mockBronzePolicy: Policy = {
  policyNumber: 'POL-BRONZE-55441',
  insuredName: 'Le Van C',
  nationalId: '048200112233',
  planName: 'Healthcare Bronze',
  status: 'ACTIVE',
  effectiveDate: '2026-01-01T00:00:00Z',
  expiryDate: '2026-12-31T23:59:59Z',
  annualTotalLimit: 100000000,
  annualUsedAmount: 10000000,
  waitingPeriods: {
    PRE_EXISTING: 365,
    SPECIAL_DISEASE: 180,
  },
  exclusions: ['K21', 'M54.5', 'Q21'],
  benefits: [
    {
      category: 'INPATIENT',
      maxLimitPerClaim: 15000000,
      maxLimitPerYear: 50000000,
      copayRate: 0.3, // 30% copay
      subLimitPerDay: 1000000,
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
    {
      category: 'SURGERY',
      maxLimitPerClaim: 30000000,
      maxLimitPerYear: 60000000,
      copayRate: 0.3, // 30% copay
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
    {
      category: 'MEDICATION',
      maxLimitPerClaim: 5000000,
      maxLimitPerYear: 20000000,
      copayRate: 0.3, // 30% copay
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
  ],
};

export const mockPlatinumPolicy: Policy = {
  policyNumber: 'POL-PLATINUM-88888',
  insuredName: 'Dang Thi D',
  nationalId: '001199554433',
  planName: 'Healthcare Platinum VIP',
  status: 'ACTIVE',
  effectiveDate: '2026-01-01T00:00:00Z',
  expiryDate: '2026-12-31T23:59:59Z',
  annualTotalLimit: 1000000000, // 1 Billion VND
  annualUsedAmount: 0,
  waitingPeriods: {
    PRE_EXISTING: 180,
    SPECIAL_DISEASE: 90,
  },
  exclusions: ['Z41.1'],
  benefits: [
    {
      category: 'INPATIENT',
      maxLimitPerClaim: 100000000,
      maxLimitPerYear: 500000000,
      copayRate: 0.0, // 0% copay - 100% covered
      subLimitPerDay: 5000000,
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
    {
      category: 'SURGERY',
      maxLimitPerClaim: 100000000,
      maxLimitPerYear: 400000000,
      copayRate: 0.0, // 0% copay
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
    {
      category: 'MEDICATION',
      maxLimitPerClaim: 30000000,
      maxLimitPerYear: 100000000,
      copayRate: 0.0, // 0% copay
      waitingPeriodDays: 0,
      requiresPreAuth: false,
    },
  ],
};
