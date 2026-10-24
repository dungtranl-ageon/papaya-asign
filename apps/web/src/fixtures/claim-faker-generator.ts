import { fakerVI, faker } from '@faker-js/faker';
import { ClaimPreset, ClaimPresetItem } from './claim-presets';

/**
 * Utility to convert Vietnamese string with accents to lowercase ascii slug
 */
export function slugifyVietnamese(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Top Vietnamese accredited hospitals
 */
const VIETNAM_HOSPITALS = [
  'FV Hospital (Bệnh viện FV TP.HCM)',
  'Bệnh viện Chợ Rẫy (TP.HCM)',
  'Bệnh viện Đại học Y Dược TP.HCM',
  'Bệnh viện Bạch Mai (Hà Nội)',
  'Bệnh viện Vinmec Central Park',
  'Bệnh viện Hữu nghị Việt Đức',
  'Bệnh viện Tâm Đức (Viện Tim TP.HCM)',
  'Bệnh viện Quân Y 175',
  'Bệnh viện Đa khoa Quốc tế Hoàn Mỹ Sài Gòn',
  'Bệnh viện Thống Nhất TP.HCM',
];

/**
 * Vietnamese CCCD generator (12 digits):
 * 0 + [3-digit province] + [1-digit century/gender] + [2-digit birth year] + [6-digit random sequence]
 */
export function generateVietnameseCCCD(birthYear = 1990, isMale = true): string {
  const provinces = ['001', '079', '048', '031', '092', '038', '075', '060'];
  const province = provinces[Math.floor(Math.random() * provinces.length)]!;

  // Century 20th: male=0, female=1; Century 21st: male=2, female=3
  const centuryGender = birthYear < 2000 ? (isMale ? '0' : '1') : isMale ? '2' : '3';
  const yearSuffix = birthYear.toString().slice(-2);
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();

  return `${province}${centuryGender}${yearSuffix}${randomSuffix}`;
}

/**
 * Vietnamese phone number generator (09xx, 08xx, 07xx, 03xx)
 */
export function generateVietnamesePhone(): string {
  const prefixes = ['090', '091', '098', '097', '089', '088', '079', '077', '038', '039'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]!;
  const suffix = Math.floor(1000000 + Math.random() * 9000000)
    .toString()
    .slice(0, 7);
  return `${prefix}${suffix}`;
}

/**
 * Randomize amount rounded to hundreds of thousands or millions
 */
function roundTo100k(amount: number): number {
  return Math.round(amount / 100000) * 100000;
}

/**
 * Format Date to YYYY-MM-DD
 */
function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]!;
}

/**
 * Dynamic Claim Generator using Faker with Vietnamese locale
 * Generates fresh synthetic medical claims tailored to project scenarios (TC01, TC02, TC03)
 */
export function generateDynamicClaimPreset(presetType: 'TC01' | 'TC02' | 'TC03'): ClaimPreset {
  const isMale = faker.datatype.boolean();
  const firstName = isMale ? fakerVI.person.firstName('male') : fakerVI.person.firstName('female');
  const lastName = fakerVI.person.lastName();
  const middleName = isMale
    ? faker.helpers.arrayElement(['Văn', 'Hữu', 'Đức', 'Quốc', 'Hoàng', 'Minh', 'Đình'])
    : faker.helpers.arrayElement(['Thị', 'Ngọc', 'Phương', 'Mai', 'Thanh', 'Như', 'Hồng']);

  const insuredName = `${lastName} ${middleName} ${firstName}`;
  const slug = slugifyVietnamese(insuredName);
  const birthYear = faker.number.int({ min: 1975, max: 2002 });
  const nationalId = generateVietnameseCCCD(birthYear, isMale);
  const phone = generateVietnamesePhone();
  const emailDomain = faker.helpers.arrayElement([
    'gmail.com',
    'outlook.com',
    'yahoo.com',
    'papaya.vn',
  ]);
  const email = `${slug}${birthYear % 100}@${emailDomain}`;
  const hospitalName = faker.helpers.arrayElement(VIETNAM_HOSPITALS);

  // Generate admission date in 2026 (Feb - Apr 2026)
  const admissionMonth = faker.number.int({ min: 2, max: 4 });
  const admissionDay = faker.number.int({ min: 1, max: 20 });
  const admissionDateObj = new Date(2026, admissionMonth - 1, admissionDay);
  const admissionDate = formatDate(admissionDateObj);

  switch (presetType) {
    case 'TC01': {
      // SCENARIO 1: Acute Appendicitis Surgery (Approve)
      // Stay length: 3 - 5 days
      const stayDays = faker.number.int({ min: 3, max: 5 });
      const dischargeDateObj = new Date(admissionDateObj);
      dischargeDateObj.setDate(dischargeDateObj.getDate() + stayDays);
      const dischargeDate = formatDate(dischargeDateObj);

      const surgeryCost = roundTo100k(faker.number.int({ min: 22000000, max: 28000000 }));
      const roomPerDay = roundTo100k(faker.number.int({ min: 2500000, max: 3500000 }));
      const roomCost = roomPerDay * stayDays;
      const medsCost = roundTo100k(faker.number.int({ min: 4500000, max: 7500000 }));
      const labCost = roundTo100k(faker.number.int({ min: 3500000, max: 6000000 }));
      const totalAmount = surgeryCost + roomCost + medsCost + labCost;

      const icd10 = faker.helpers.arrayElement([
        { code: 'K35', desc: 'Acute appendicitis with localized peritonitis (Viêm ruột thừa cấp)' },
        {
          code: 'K35.2',
          desc: 'Acute appendicitis with generalized peritonitis (Viêm ruột thừa cấp có viêm phúc mạc)',
        },
        { code: 'K35.8', desc: 'Other acute appendicitis (Viêm ruột thừa cấp hoại tử)' },
      ]);

      const items: ClaimPresetItem[] = [
        {
          itemId: 'ITM-001',
          description: 'Laparoscopic Appendectomy (Phẫu thuật nội soi cắt ruột thừa cấp)',
          category: 'SURGERY',
          amountRequested: surgeryCost,
        },
        {
          itemId: 'ITM-002',
          description: `Inpatient Room & Board (Phòng nội trú tiêu chuẩn ${stayDays} ngày)`,
          category: 'INPATIENT',
          amountRequested: roomCost,
        },
        {
          itemId: 'ITM-003',
          description:
            'Post-op Antibiotics & Analgesics (Thuốc kháng sinh phổ rộng và giảm đau sau mổ)',
          category: 'MEDICATION',
          amountRequested: medsCost,
        },
        {
          itemId: 'ITM-004',
          description:
            'Pre-operative Ultrasound & Emergency Blood Panel (Siêu âm ổ bụng và xét nghiệm máu cấp cứu)',
          category: 'LABORATORY',
          amountRequested: labCost,
        },
      ];

      return {
        id: 'TC01',
        label: 'TC-01: Cấp cứu Ruột thừa (Approve)',
        policyId: 'POL-GOLD-99882',
        insuredName,
        nationalId,
        phone,
        email,
        hospitalName,
        admissionDate,
        dischargeDate,
        icd10Code: icd10.code,
        icd10Description: icd10.desc,
        treatmentType: 'INPATIENT',
        claimedAmount: totalAmount,
        items,
        documents: [
          {
            id: 'doc-1',
            docType: 'Giấy ra viện (Bản gốc)',
            fileName: `giay_ra_vien_${slug}.pdf`,
            status: 'VALID',
            note: 'Đầy đủ chữ ký BS điều trị & Mộc tròn bệnh viện',
          },
          {
            id: 'doc-2',
            docType: 'Bảng kê viện phí chi tiết',
            fileName: `bang_ke_chi_tiet_${slug}.pdf`,
            status: 'VALID',
            note: `Khớp danh mục phẫu thuật và ${stayDays} ngày nằm viện`,
          },
          {
            id: 'doc-3',
            docType: 'Hóa đơn VAT điện tử',
            fileName: `hoa_don_vat_dien_tu_${slug}.pdf`,
            status: 'VALID',
            note: 'Mã tra cứu hóa đơn hợp lệ trên Cục Thuế',
          },
          {
            id: 'doc-4',
            docType: 'Phiếu phẫu thuật nội soi',
            fileName: `phieu_phau_thuat_noi_soi_${slug}.pdf`,
            status: 'VALID',
            note: 'Xác nhận cấp cứu ngoại khoa ruột thừa',
          },
        ],
      };
    }

    case 'TC02': {
      // SCENARIO 2: Excluded Conditions (Reject via policy exclusion list)
      // POL-GOLD-99882 exclusions: ["K21", "Z41.1", "F32"]
      // Treatment type: OUTPATIENT (Same day)
      const dischargeDate = admissionDate;

      const exclusionCandidates = [
        {
          code: 'K21',
          desc: 'Gastro-esophageal reflux disease (GERD) with esophagitis (Trào ngược dạ dày thực quản)',
          generateItems: () => {
            const endoscopyCost = roundTo100k(faker.number.int({ min: 3500000, max: 5500000 }));
            const medsCost = roundTo100k(faker.number.int({ min: 3000000, max: 5000000 }));
            return {
              items: [
                {
                  itemId: 'ITM-005',
                  description:
                    'Gastroscopy and mucosal biopsy (Nội soi thực quản - dạ dày có sinh thiết)',
                  category: 'OUTPATIENT' as const,
                  amountRequested: endoscopyCost,
                },
                {
                  itemId: 'ITM-006',
                  description:
                    'Prescription PPI & mucosal protectants (Thuốc ức chế bơm proton và bảo vệ niêm mạc dạ dày)',
                  category: 'MEDICATION' as const,
                  amountRequested: medsCost,
                },
              ],
              medsNote: `Chi tiết thuốc điều trị GERD: ${medsCost.toLocaleString('vi-VN')} đ`,
            };
          },
        },
        {
          code: 'Z41.1',
          desc: 'Other plastic surgery for unacceptable cosmetic appearance (Phẫu thuật tạo hình thẩm mỹ không do bệnh lý)',
          generateItems: () => {
            const surgeryCost = roundTo100k(faker.number.int({ min: 18000000, max: 28000000 }));
            const medsCost = roundTo100k(faker.number.int({ min: 2500000, max: 4000000 }));
            return {
              items: [
                {
                  itemId: 'ITM-005',
                  description:
                    'Rhinoplasty & Septal cosmetic contouring (Phẫu thuật nâng sống mũi và tạo hình vách ngăn thẩm mỹ)',
                  category: 'OUTPATIENT' as const,
                  amountRequested: surgeryCost,
                },
                {
                  itemId: 'ITM-006',
                  description:
                    'Post-operative anti-inflammatory and pain relief (Thuốc giảm phù nề, kháng viêm sau phẫu thuật thẩm mỹ)',
                  category: 'MEDICATION' as const,
                  amountRequested: medsCost,
                },
              ],
              medsNote: `Chi tiết chi phí can thiệp thẩm mỹ tạo hình: ${surgeryCost.toLocaleString('vi-VN')} đ`,
            };
          },
        },
        {
          code: 'F32',
          desc: 'Depressive episode (Giai đoạn trầm cảm vừa và nặng / Trị liệu tâm thần)',
          generateItems: () => {
            const therapyCost = roundTo100k(faker.number.int({ min: 3500000, max: 6000000 }));
            const medsCost = roundTo100k(faker.number.int({ min: 2500000, max: 4500000 }));
            return {
              items: [
                {
                  itemId: 'ITM-005',
                  description:
                    'Clinical psychological assessment & Cognitive Behavioral Therapy (Đánh giá tâm lý lâm sàng & trị liệu CBT)',
                  category: 'OUTPATIENT' as const,
                  amountRequested: therapyCost,
                },
                {
                  itemId: 'ITM-006',
                  description:
                    'Antidepressant & Neuroprotective prescription (Đơn thuốc chống trầm cảm SSRI và dưỡng thần kinh)',
                  category: 'MEDICATION' as const,
                  amountRequested: medsCost,
                },
              ],
              medsNote: `Chi tiết thuốc điều trị tâm thần kinh: ${medsCost.toLocaleString('vi-VN')} đ`,
            };
          },
        },
      ];

      const chosen = faker.helpers.arrayElement(exclusionCandidates);
      const { items, medsNote } = chosen.generateItems();
      const totalAmount = items.reduce((sum, it) => sum + it.amountRequested, 0);

      return {
        id: 'TC02',
        label: `TC-02: Bệnh Loại trừ [${chosen.code}] (Reject)`,
        policyId: 'POL-GOLD-99882',
        insuredName,
        nationalId,
        phone,
        email,
        hospitalName,
        admissionDate,
        dischargeDate,
        icd10Code: chosen.code,
        icd10Description: chosen.desc,
        treatmentType: 'OUTPATIENT',
        claimedAmount: totalAmount,
        items,
        documents: [
          {
            id: 'doc-1',
            docType: 'Sổ khám bệnh ngoại trú',
            fileName: `so_kham_benh_${slug}.pdf`,
            status: 'VALID',
            note: 'Hồ sơ khám chữa bệnh ngoại trú trong ngày',
          },
          {
            id: 'doc-2',
            docType: 'Bảng kê tiền thuốc & dịch vụ',
            fileName: `don_thuoc_va_bang_ke_${slug}.pdf`,
            status: 'VALID',
            note: medsNote,
          },
          {
            id: 'doc-3',
            docType: 'Hóa đơn VAT điện tử',
            fileName: `hoa_don_vat_ngoai_tru_${slug}.pdf`,
            status: 'VALID',
            note: 'Mã tra cứu hóa đơn hợp lệ trên Cục Thuế',
          },
        ],
      };
    }

    case 'TC03': {
      // SCENARIO 3: Incomplete / Blurred Document, Missing VAT (Request Info)
      // Stay length: 3 - 4 days
      const stayDays = faker.number.int({ min: 3, max: 4 });
      const dischargeDateObj = new Date(admissionDateObj);
      dischargeDateObj.setDate(dischargeDateObj.getDate() + stayDays);
      const dischargeDate = formatDate(dischargeDateObj);

      const inpatientCost = roundTo100k(faker.number.int({ min: 7000000, max: 10000000 }));
      const medsCost = roundTo100k(faker.number.int({ min: 4000000, max: 7000000 }));
      const totalAmount = inpatientCost + medsCost;

      const items: ClaimPresetItem[] = [
        {
          itemId: 'ITM-007',
          description: `Khám và điều trị nội trú viêm phế quản cấp (${stayDays} ngày)`,
          category: 'INPATIENT',
          amountRequested: inpatientCost,
        },
        {
          itemId: 'ITM-008',
          description: 'Kháng sinh tiêm truyền và khí dung trị liệu phế quản',
          category: 'MEDICATION',
          amountRequested: medsCost,
        },
      ];

      return {
        id: 'TC03',
        label: 'TC-03: Chứng từ mờ / Thiếu VAT (Request More Info)',
        policyId: 'POL-SILVER-11223',
        insuredName,
        nationalId,
        phone,
        email,
        hospitalName,
        admissionDate,
        dischargeDate,
        icd10Code: 'J20',
        icd10Description: 'Acute bronchitis due to unspecified organism (Viêm phế quản cấp)',
        treatmentType: 'INPATIENT',
        claimedAmount: totalAmount,
        items,
        documents: [
          {
            id: 'doc-1',
            docType: 'Giấy ra viện (Bản scan)',
            fileName: `giay_ra_vien_${slug}.pdf`,
            status: 'VALID',
            note: 'Chữ ký bác sĩ đầy đủ',
          },
          {
            id: 'doc-2',
            docType: 'Bảng kê viện phí mẫu 01/BV',
            fileName: `bang_ke_mo_nhoe_${slug}.pdf`,
            status: 'INVALID',
            note: 'Bản scan nhòe số tiền, không đọc được OCR',
          },
        ],
      };
    }
  }
}
