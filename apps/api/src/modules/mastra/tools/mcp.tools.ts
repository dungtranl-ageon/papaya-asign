import {
  verifyDocument,
  lookupPolicy,
  checkMedicalNecessity,
  calculateBenefit,
  VerifyDocumentInput,
  VerifyDocumentOutput,
  LookupPolicyInput,
  LookupPolicyOutput,
  CheckNecessityInput,
  CheckNecessityOutput,
  CalculateBenefitInput,
  CalculateBenefitOutput,
} from '@papaya/mcp-server';
import { Policy } from '@papaya/shared';

/**
 * Mastra Tool Adapters wrapping MCP pure functions
 * Provides standard input/output execution interface
 */
export const mastraMcpTools = {
  verifyDocument: {
    id: 'verifyDocument',
    description: 'Verify document completeness, required types, and stamp validity',
    execute: async (input: VerifyDocumentInput): Promise<VerifyDocumentOutput> => {
      return verifyDocument(input);
    },
  },

  lookupPolicy: {
    id: 'lookupPolicy',
    description: 'Lookup policy validity, exclusions, and coverage dates',
    execute: async (input: LookupPolicyInput, policy?: Policy): Promise<LookupPolicyOutput> => {
      return lookupPolicy(input, policy);
    },
  },

  checkMedicalNecessity: {
    id: 'checkMedicalNecessity',
    description: 'Check medical necessity of diagnosis vs treatments and length of stay',
    execute: async (input: CheckNecessityInput): Promise<CheckNecessityOutput> => {
      return checkMedicalNecessity(input);
    },
  },

  calculateBenefit: {
    id: 'calculateBenefit',
    description: 'Calculate deductible, copay, sublimits, and final payable amount',
    execute: async (input: CalculateBenefitInput): Promise<CalculateBenefitOutput> => {
      return calculateBenefit(input);
    },
  },
};
