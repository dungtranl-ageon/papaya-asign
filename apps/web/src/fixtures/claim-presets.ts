export interface ClaimPresetItem {
  itemId: string;
  description: string;
  category: 'INPATIENT' | 'OUTPATIENT' | 'SURGERY' | 'MEDICATION' | 'LABORATORY' | 'DENTAL';
  amountRequested: number;
}

export interface ClaimPreset {
  id: 'TC01' | 'TC02' | 'TC03';
  label: string;
  policyId: string;
  insuredName: string;
  nationalId: string;
  phone: string;
  email: string;
  hospitalName: string;
  admissionDate: string;
  dischargeDate: string;
  icd10Code: string;
  icd10Description: string;
  treatmentType: 'INPATIENT' | 'OUTPATIENT' | 'DENTAL';
  claimedAmount: number;
  items: ClaimPresetItem[];
  documents: Array<{
    id: string;
    docType: string;
    fileName: string;
    status: 'VALID' | 'INVALID' | 'PENDING';
    note: string;
  }>;
}

export const CLAIM_PRESETS: Record<'TC01' | 'TC02' | 'TC03', ClaimPreset> = {
  TC01: {
    id: 'TC01',
    label: 'TC-01: Cấp cứu Ruột thừa (Approve)',
    policyId: 'POL-GOLD-99882',
    insuredName: 'Nguyen Van A',
    nationalId: '001099012345',
    phone: '0908123456',
    email: 'nguyenvana@gmail.com',
    hospitalName: 'FV Hospital',
    admissionDate: '2026-03-10',
    dischargeDate: '2026-03-13',
    icd10Code: 'K35',
    icd10Description: 'Acute appendicitis with localized peritonitis',
    treatmentType: 'INPATIENT',
    claimedAmount: 45000000,
    items: [
      {
        itemId: 'ITM-001',
        description: 'Laparoscopic Appendectomy (Phẫu thuật nội soi cắt ruột thừa)',
        category: 'SURGERY',
        amountRequested: 25000000,
      },
      {
        itemId: 'ITM-002',
        description: 'Inpatient Room & Board (Phòng nội trú tiêu chuẩn 3 ngày)',
        category: 'INPATIENT',
        amountRequested: 9000000,
      },
      {
        itemId: 'ITM-003',
        description: 'Post-op Antibiotics & Analgesics (Thuốc kháng sinh và giảm đau sau mổ)',
        category: 'MEDICATION',
        amountRequested: 6000000,
      },
      {
        itemId: 'ITM-004',
        description:
          'Pre-operative Ultrasound & Blood Tests (Siêu âm bụng và xét nghiệm máu cấp cứu)',
        category: 'LABORATORY',
        amountRequested: 5000000,
      },
    ],
    documents: [
      {
        id: 'doc-1',
        docType: 'Giấy ra viện (Bản gốc)',
        fileName: 'giay_ra_vien_nguyen_van_a.pdf',
        status: 'VALID',
        note: 'Đầy đủ chữ ký BS & Mộc đỏ BV',
      },
      {
        id: 'doc-2',
        docType: 'Bảng kê viện phí chi tiết',
        fileName: 'bang_ke_chi_tiet_vien_phi.pdf',
        status: 'VALID',
        note: 'Khớp danh mục phẫu thuật và ngày nằm viện',
      },
      {
        id: 'doc-3',
        docType: 'Hóa đơn VAT điện tử',
        fileName: 'hoa_don_vat_dien_tu_fv.pdf',
        status: 'VALID',
        note: 'Mã tra cứu hóa đơn hợp lệ trên TCT',
      },
      {
        id: 'doc-4',
        docType: 'Phiếu phẫu thuật nội soi',
        fileName: 'phieu_phau_thuat_noi_soi.pdf',
        status: 'VALID',
        note: 'Xác nhận cấp cứu ngoại khoa ruột thừa',
      },
    ],
  },
  TC02: {
    id: 'TC02',
    label: 'TC-02: Bệnh Loại trừ / Thời gian chờ (Reject)',
    policyId: 'POL-GOLD-99882',
    insuredName: 'Nguyen Van A',
    nationalId: '001099012345',
    phone: '0908123456',
    email: 'nguyenvana@gmail.com',
    hospitalName: 'Tam Duc Heart Hospital',
    admissionDate: '2026-03-01',
    dischargeDate: '2026-03-01',
    icd10Code: 'K21',
    icd10Description: 'Gastro-esophageal reflux disease (GERD) with esophagitis',
    treatmentType: 'OUTPATIENT',
    claimedAmount: 8500000,
    items: [
      {
        itemId: 'ITM-005',
        description: 'Gastroscopy and biopsy (Nội soi thực quản dạ dày sinh thiết)',
        category: 'OUTPATIENT',
        amountRequested: 4500000,
      },
      {
        itemId: 'ITM-006',
        description:
          'Prescription PPI and mucosal protectants (Thuốc ức chế bơm proton và bảo vệ niêm mạc)',
        category: 'MEDICATION',
        amountRequested: 4000000,
      },
    ],
    documents: [
      {
        id: 'doc-1',
        docType: 'Sổ khám bệnh ngoại trú',
        fileName: 'so_kham_benh.pdf',
        status: 'VALID',
        note: 'Hồ sơ khám chữa bệnh trong ngày',
      },
      {
        id: 'doc-2',
        docType: 'Bảng kê tiền thuốc',
        fileName: 'hoa_don_thuoc.pdf',
        status: 'VALID',
        note: 'Tổng chi phí 4.000.000 đ',
      },
      {
        id: 'doc-3',
        docType: 'Hóa đơn VAT điện tử',
        fileName: 'vat_outpatient.pdf',
        status: 'VALID',
        note: 'Khớp mã tra cứu',
      },
    ],
  },
  TC03: {
    id: 'TC03',
    label: 'TC-03: Chứng từ mờ / Thiếu VAT (Request More Info)',
    policyId: 'POL-SILVER-11223',
    insuredName: 'Tran Thi B',
    nationalId: '079198054321',
    phone: '0912345678',
    email: 'tranthib@gmail.com',
    hospitalName: 'Cho Ray Hospital',
    admissionDate: '2026-02-15',
    dischargeDate: '2026-02-18',
    icd10Code: 'J20',
    icd10Description: 'Acute bronchitis due to unspecified organism',
    treatmentType: 'INPATIENT',
    claimedAmount: 12000000,
    items: [
      {
        itemId: 'ITM-007',
        description: 'Khám và điều trị nội trú viêm phế quản cấp',
        category: 'INPATIENT',
        amountRequested: 12000000,
      },
    ],
    documents: [
      {
        id: 'doc-1',
        docType: 'Giấy ra viện (Bản scan)',
        fileName: 'giay_ra_vien_cho_ray.pdf',
        status: 'VALID',
        note: 'Chữ ký bác sĩ đầy đủ',
      },
      {
        id: 'doc-2',
        docType: 'Bảng kê viện phí mẫu 01/BV',
        fileName: 'bang_ke_mo_nhoe.pdf',
        status: 'INVALID',
        note: 'Bản scan nhòe số tiền, không đọc được OCR',
      },
    ],
  },
};
