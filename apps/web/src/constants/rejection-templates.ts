export interface RejectionReasonConfig {
  id: string;
  title: string;
  desc: string;
  clauseReference: string;
  generateLetter: (insuredName: string, claimId: string) => string;
}

export const REJECTION_REASONS_CATALOG: RejectionReasonConfig[] = [
  {
    id: 'WAITING_PERIOD',
    title: 'Phát sinh trong Thời gian chờ (Waiting Period)',
    desc: 'Hồ sơ khám/điều trị trong 30 ngày đầu của hợp đồng (TC-02)',
    clauseReference: 'Điều 4.2 - Thời gian chờ đối với Bệnh thông thường (30 ngày)',
    generateLetter: (insuredName, claimId) =>
      `Kính gửi Quý khách hàng ${insuredName},\n\nVề yêu cầu bảo hiểm mã hồ sơ ${claimId}, sau khi xem xét hồ sơ y tế, chúng tôi rất tiếc thông báo hồ sơ không thuộc phạm vi chi trả do sự kiện điều trị phát sinh trong Thời gian chờ 30 ngày theo quy định tại Điều 4.2.\n\nQuý khách có quyền khiếu nại trong vòng 30 ngày kể từ ngày nhận thông báo này.`,
  },
  {
    id: 'POLICY_EXCLUSION',
    title: 'Thuộc danh mục Điều khoản Loại trừ Hợp đồng',
    desc: 'Thực phẩm chức năng, phẫu thuật thẩm mỹ, bệnh bẩm sinh...',
    clauseReference: 'Điều 14.1 - Các điểm loại trừ trách nhiệm bảo hiểm chung',
    generateLetter: (insuredName, claimId) =>
      `Kính gửi Quý khách hàng ${insuredName},\n\nVề yêu cầu bảo hiểm mã hồ sơ ${claimId}, khoản chi phí điều trị yêu cầu thuộc trường hợp Điểm loại trừ trách nhiệm bảo hiểm theo quy định tại Điều 14.1 của Hợp đồng bảo hiểm.\n\nQuý khách có quyền khiếu nại trong vòng 30 ngày kể từ ngày nhận thông báo này.`,
  },
  {
    id: 'FRAUD_SUSPICION',
    title: 'Nghi vấn gian lận chứng từ y tế / Không trung thực',
    desc: 'Chứng từ có dấu hiệu tẩy xóa, trùng hóa đơn với bảo hiểm khác',
    clauseReference: 'Điều 18.3 - Tính trung thực tuyệt đối & Hành vi gian lận hồ sơ',
    generateLetter: (insuredName, claimId) =>
      `Kính gửi Quý khách hàng ${insuredName},\n\nVề yêu cầu bảo hiểm mã hồ sơ ${claimId}, qua quá trình giám định pháp y và đối chiếu dữ liệu hóa đơn, chứng từ cung cấp có dấu hiệu chỉnh sửa hoặc không trùng khớp với dữ liệu gốc của cơ sở y tế. Do đó hồ sơ bị từ chối theo Điều 18.3.`,
  },
  {
    id: 'LIMIT_EXCEEDED',
    title: 'Vượt quá hạn mức bồi thường tối đa trong năm',
    desc: 'Hạn mức bảo hiểm năm đã chạm ngưỡng 100%',
    clauseReference: 'Điều 8.4 - Hạn mức chi trả tối đa trong năm hợp đồng',
    generateLetter: (insuredName, claimId) =>
      `Kính gửi Quý khách hàng ${insuredName},\n\nVề yêu cầu bảo hiểm mã hồ sơ ${claimId}, hạn mức quyền lợi năm của Quý khách đã được chi trả tối đa trước đó, do đó không thể giải quyết thêm chi phí phát sinh.`,
  },
];

export const REJECTION_LEGAL_NOTICE =
  'Quyết định từ chối bồi thường là văn bản có giá trị pháp lý ràng buộc. Khách hàng có quyền khiếu nại hoặc khởi kiện trong vòng 30 ngày làm việc kể từ ngày nhận thông báo.';
