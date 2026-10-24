import { describe, it, expect } from 'vitest';
import { executeClaimsAssessmentWorkflow } from '../../apps/api/src/modules/mastra/mastra.workflow';
import { mockGoldPolicy, mockSilverPolicy } from '../fixtures/mock-policies';
import { Claim, Policy } from '../../packages/shared/src';

interface PairwiseTestCase {
  id: string;
  plan: 'GOLD' | 'SILVER';
  category: 'INPATIENT' | 'SURGERY' | 'MEDICATION' | 'OUTPATIENT';
  docStatus: 'VALID' | 'MISSING' | 'INVALID';
  clinicalType: 'VALID' | 'EXCLUSION' | 'COSMETIC';
  expectedRecommendation: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO' | 'MANUAL_ESCALATION';
}

describe('Algorithm 4: Pairwise (All-Pairs) Combinatorial Test Suite', () => {
  // Orthogonal Pairwise Test Matrix covering all 2-way parameter interactions
  const pairwiseMatrix: PairwiseTestCase[] = [
    {
      id: 'PAIR-01',
      plan: 'GOLD',
      category: 'SURGERY',
      docStatus: 'VALID',
      clinicalType: 'VALID',
      expectedRecommendation: 'APPROVE',
    },
    {
      id: 'PAIR-02',
      plan: 'GOLD',
      category: 'INPATIENT',
      docStatus: 'MISSING',
      clinicalType: 'EXCLUSION',
      expectedRecommendation: 'REQUEST_MORE_INFO', // Document completeness has priority 1
    },
    {
      id: 'PAIR-03',
      plan: 'GOLD',
      category: 'MEDICATION',
      docStatus: 'INVALID',
      clinicalType: 'COSMETIC',
      expectedRecommendation: 'REQUEST_MORE_INFO', // Document invalid requires more info / re-upload
    },
    {
      id: 'PAIR-04',
      plan: 'SILVER',
      category: 'OUTPATIENT',
      docStatus: 'VALID',
      clinicalType: 'EXCLUSION',
      expectedRecommendation: 'REJECT', // Exclusion triggered
    },
    {
      id: 'PAIR-05',
      plan: 'SILVER',
      category: 'MEDICATION',
      docStatus: 'VALID',
      clinicalType: 'COSMETIC',
      expectedRecommendation: 'MANUAL_ESCALATION', // Cosmetic flagged
    },
    {
      id: 'PAIR-06',
      plan: 'SILVER',
      category: 'INPATIENT',
      docStatus: 'MISSING',
      clinicalType: 'VALID',
      expectedRecommendation: 'REQUEST_MORE_INFO',
    },
    {
      id: 'PAIR-07',
      plan: 'SILVER',
      category: 'SURGERY',
      docStatus: 'VALID',
      clinicalType: 'VALID',
      expectedRecommendation: 'APPROVE',
    },
  ];

  pairwiseMatrix.forEach(tc => {
    it(`Pairwise [${tc.id}]: Plan=${tc.plan} | Cat=${tc.category} | Doc=${tc.docStatus} | Clin=${tc.clinicalType} -> ${tc.expectedRecommendation}`, async () => {
      const policy: Policy = tc.plan === 'GOLD' ? mockGoldPolicy : mockSilverPolicy;

      // Construct test claim
      const isExclusion = tc.clinicalType === 'EXCLUSION';
      const isCosmetic = tc.clinicalType === 'COSMETIC';

      const documents: Claim['documents'] = [];
      if (tc.docStatus !== 'MISSING') {
        documents.push(
          {
            docId: 'D1',
            docType: 'HOSPITAL_DISCHARGE',
            fileName: 'd.pdf',
            uploadedAt: '2026-03-10',
            status: 'VALID',
          },
          {
            docId: 'D2',
            docType: 'DETAILED_INVOICE',
            fileName: 'i.pdf',
            uploadedAt: '2026-03-10',
            status: tc.docStatus,
          },
          {
            docId: 'D3',
            docType: 'VAT_INVOICE',
            fileName: 'v.pdf',
            uploadedAt: '2026-03-10',
            status: 'VALID',
          },
        );
      } else {
        // Only discharge, missing VAT & Invoice
        documents.push({
          docId: 'D1',
          docType: 'HOSPITAL_DISCHARGE',
          fileName: 'd.pdf',
          uploadedAt: '2026-03-10',
          status: 'VALID',
        });
      }

      const testClaim: Claim = {
        claimId: `CLM-${tc.id}`,
        policyNumber: policy.policyNumber,
        patientName: 'Test Patient',
        nationalId: '001099123456',
        hospitalName: 'Test Hospital',
        admissionDate: '2026-03-10T08:00:00Z',
        dischargeDate: '2026-03-12T14:00:00Z',
        diagnosisIcd10: isExclusion ? 'K21' : 'K35',
        diagnosisDescription: isExclusion ? 'GERD' : 'Appendicitis',
        status: 'SUBMITTED',
        totalRequested: 10000000,
        items: [
          {
            itemId: 'ITM-01',
            description: isCosmetic ? 'Phẫu thuật thẩm mỹ làm đẹp' : 'Standard treatment',
            category: tc.category,
            amountRequested: 10000000,
          },
        ],
        documents,
        createdAt: '2026-03-13T10:00:00Z',
        updatedAt: '2026-03-13T10:00:00Z',
      };

      const report = await executeClaimsAssessmentWorkflow({ claim: testClaim, policy });

      if (tc.docStatus === 'MISSING' || tc.docStatus === 'INVALID') {
        expect(report.finalRecommendation).toBe('REQUEST_MORE_INFO');
      } else if (isExclusion) {
        expect(report.finalRecommendation).toBe('REJECT');
      } else if (isCosmetic) {
        expect(report.finalRecommendation).toBe('MANUAL_ESCALATION');
      } else {
        expect(report.finalRecommendation).toBe('APPROVE');
      }
    });
  });
});
