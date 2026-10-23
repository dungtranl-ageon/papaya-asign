import { z } from 'zod';

export const ClaimItemSchema = z.object({
  itemId: z.string(),
  description: z.string(),
  category: z.enum(['INPATIENT', 'OUTPATIENT', 'DENTAL', 'SURGERY', 'MEDICATION', 'LABORATORY', 'SPECIALIST_FEE', 'OTHER']),
  amountRequested: z.number().positive(),
  amountApproved: z.number().nonnegative().optional(),
  rejectionReason: z.string().optional(),
});

export const ClaimDocumentSchema = z.object({
  docId: z.string(),
  docType: z.enum([
    'HOSPITAL_DISCHARGE',
    'DETAILED_INVOICE',
    'VAT_INVOICE',
    'MEDICAL_RECORD',
    'PRESCRIPTION',
    'LAB_RESULT',
    'SURGICAL_REPORT',
    'CLAIM_FORM',
    'OTHER'
  ]),
  fileName: z.string(),
  fileUrl: z.string().optional(),
  uploadedAt: z.string(),
  status: z.enum(['VALID', 'INVALID', 'MISSING', 'REQUIRES_REVIEW']),
  notes: z.string().optional(),
});

export const ClaimStatusSchema = z.enum([
  'SUBMITTED',
  'ASSESSING',
  'PENDING_MORE_INFO',
  'APPROVED',
  'REJECTED',
  'OVERRIDDEN',
  'PAID'
]);

export const ClaimSchema = z.object({
  claimId: z.string(),
  policyNumber: z.string(),
  patientName: z.string(),
  nationalId: z.string(),
  hospitalName: z.string(),
  admissionDate: z.string(),
  dischargeDate: z.string(),
  diagnosisIcd10: z.string(),
  diagnosisDescription: z.string(),
  status: ClaimStatusSchema,
  totalRequested: z.number().nonnegative(),
  totalApproved: z.number().nonnegative().optional(),
  items: z.array(ClaimItemSchema),
  documents: z.array(ClaimDocumentSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ClaimItem = z.infer<typeof ClaimItemSchema>;
export type ClaimDocument = z.infer<typeof ClaimDocumentSchema>;
export type ClaimStatus = z.infer<typeof ClaimStatusSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
