import * as fs from 'fs';
import * as path from 'path';

/**
 * Papaya Synthetic Data Generator
 * Generates realistic health insurance claim dossiers based on Vietnamese clinical data.
 */
interface GeneratorOptions {
  count?: number;
  policyNumber?: string;
  outputDir?: string;
}

export function generateSyntheticClaims(options: GeneratorOptions = {}) {
  const count = options.count ?? 3;
  const policyNumber = options.policyNumber ?? 'POL-GOLD-99882';
  const targetDir = options.outputDir ?? path.resolve(__dirname, '../../../../data/fixtures');

  console.info(`Generating ${count} synthetic claims for policy ${policyNumber}...`);

  const samplePatients = [
    { name: 'Hoang Van E', nationalId: '001099887766' },
    { name: 'Nguyen Thi Mai', nationalId: '079198334455' },
    { name: 'Pham Quoc Huy', nationalId: '048200998877' },
  ];

  const sampleHospitals = [
    'Benh Vien Bach Mai',
    'Benh Vien Cho Ray',
    'Benh Vien Viet Duc',
    'Benh Vien Vinmec Ha Noi',
  ];

  const generated = [];

  for (let i = 0; i < count; i++) {
    const patient = samplePatients[i % samplePatients.length];
    const hospital = sampleHospitals[i % sampleHospitals.length];
    const claimId = `CLM-SYNTH-${Date.now().toString().slice(-4)}-${i + 1}`;

    const claim = {
      claimId,
      policyNumber,
      patientName: patient.name,
      nationalId: patient.nationalId,
      hospitalName: hospital,
      admissionDate: '2026-04-10T08:00:00Z',
      dischargeDate: '2026-04-13T14:00:00Z',
      diagnosisIcd10: 'K35',
      diagnosisDescription: 'Viem ruot thua cap the thong thuong',
      status: 'SUBMITTED',
      totalRequested: 28000000,
      items: [
        {
          itemId: `ITM-SYN-${i}-1`,
          description: 'Phau thuat noi soi cat ruot thua',
          category: 'SURGERY',
          amountRequested: 18000000,
        },
        {
          itemId: `ITM-SYN-${i}-2`,
          description: 'Tien giuong noi tru (3 ngay)',
          category: 'INPATIENT',
          amountRequested: 6000000,
        },
        {
          itemId: `ITM-SYN-${i}-3`,
          description: 'Thuoc khang sinh va giam dau',
          category: 'MEDICATION',
          amountRequested: 4000000,
        },
      ],
      documents: [
        {
          docId: `DOC-SYN-${i}-1`,
          docType: 'HOSPITAL_DISCHARGE',
          fileName: `giay_ra_vien_${patient.name.toLowerCase().replace(/ /g, '_')}.pdf`,
          uploadedAt: '2026-04-14T09:00:00Z',
          status: 'VALID',
        },
        {
          docId: `DOC-SYN-${i}-2`,
          docType: 'DETAILED_INVOICE',
          fileName: `bang_ke_chi_tiet_${claimId}.pdf`,
          uploadedAt: '2026-04-14T09:00:00Z',
          status: 'VALID',
        },
        {
          docId: `DOC-SYN-${i}-3`,
          docType: 'VAT_INVOICE',
          fileName: `hoa_don_vat_${claimId}.pdf`,
          uploadedAt: '2026-04-14T09:00:00Z',
          status: 'VALID',
        },
      ],
      createdAt: '2026-04-14T10:00:00Z',
      updatedAt: '2026-04-14T10:00:00Z',
    };

    generated.push(claim);
  }

  console.info(`Successfully generated ${generated.length} synthetic claims.`);
  return generated;
}

if (require.main === module) {
  generateSyntheticClaims();
}
