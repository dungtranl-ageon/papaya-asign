import { z } from 'zod';
import { ClaimDocumentSchema } from '@papaya/shared';

export const VerifyDocumentInputSchema = z.object({
  claimId: z.string(),
  documents: z.array(ClaimDocumentSchema),
  requiredDocTypes: z
    .array(z.string())
    .default(['HOSPITAL_DISCHARGE', 'DETAILED_INVOICE', 'VAT_INVOICE']),
});

export type VerifyDocumentInput = z.infer<typeof VerifyDocumentInputSchema>;

export interface VerifyDocumentOutput {
  claimId: string;
  isComplete: boolean;
  missingTypes: string[];
  invalidDocuments: Array<{ docId: string; reason: string }>;
  verifiedDocumentsCount: number;
}

/**
 * Pure function: Verifies mandatory documents for insurance claim
 */
export async function verifyDocument(input: VerifyDocumentInput): Promise<VerifyDocumentOutput> {
  const presentTypes = new Set(input.documents.map(d => d.docType));
  const requiredTypes = input.requiredDocTypes ?? [
    'HOSPITAL_DISCHARGE',
    'DETAILED_INVOICE',
    'VAT_INVOICE',
  ];
  const missingTypes = requiredTypes.filter(req => !presentTypes.has(req as any));

  const invalidDocuments: Array<{ docId: string; reason: string }> = [];
  let verifiedDocumentsCount = 0;

  for (const doc of input.documents) {
    if (doc.status === 'INVALID') {
      invalidDocuments.push({
        docId: doc.docId,
        reason: doc.notes || 'Document marked as INVALID',
      });
    } else if (doc.status === 'VALID') {
      verifiedDocumentsCount++;
    }
  }

  return {
    claimId: input.claimId,
    isComplete: missingTypes.length === 0 && invalidDocuments.length === 0,
    missingTypes,
    invalidDocuments,
    verifiedDocumentsCount,
  };
}
