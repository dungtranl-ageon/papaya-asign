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
  const presentTypes = new Set<string>(input.documents.map(d => d.docType));

  // Medical proof requirement: either HOSPITAL_DISCHARGE (inpatient) or MEDICAL_RECORD / outpatient consultation book
  const hasMedicalConsultationProof =
    presentTypes.has('HOSPITAL_DISCHARGE') ||
    presentTypes.has('MEDICAL_RECORD') ||
    input.documents.some(
      d =>
        d.fileName?.toLowerCase().includes('so_kham') ||
        d.fileName?.toLowerCase().includes('giay_ra_vien') ||
        d.docType?.toLowerCase().includes('kham_benh'),
    );

  const requiredTypes = input.requiredDocTypes ?? [
    'HOSPITAL_DISCHARGE',
    'DETAILED_INVOICE',
    'VAT_INVOICE',
  ];

  const missingTypes = requiredTypes.filter(req => {
    if (req === 'HOSPITAL_DISCHARGE' && hasMedicalConsultationProof) {
      return false;
    }
    return !presentTypes.has(req);
  });

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
