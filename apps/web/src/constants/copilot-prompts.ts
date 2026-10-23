export const DEFAULT_COPILOT_QUICK_PROMPTS = [
  'Tại sao từ chối khoản thuốc bổ gan 2.000.000đ?',
  'Kiểm tra lại thời hạn hiệu lực hợp đồng & thời gian chờ',
  'Trích dẫn điều khoản đồng chi trả 20%',
  'Khách hàng có lịch sử gian lận trục lợi không?',
];

export const DYNAMIC_ASSESSMENT_PROMPTS = {
  APPROVE: [
    'Giải thích công thức tính mức đồng chi trả',
    'Kiểm tra thời gian chờ cấp cứu theo Điều 6.1',
    'Hạn mức năm còn lại sau khi thanh toán là bao nhiêu?',
  ],
  REJECT: [
    'Trích dẫn nguyên văn điều khoản loại trừ đã vi phạm',
    'Soạn công văn từ chối bồi thường gửi khách hàng',
    'Khách hàng có quyền khiếu nại trong bao lâu?',
  ],
  PENDING_MORE_INFO: [
    'Những chứng từ nào đang thiếu hoặc bị mờ nhòe?',
    'Soạn thông báo yêu cầu bổ sung hồ sơ gửi khách hàng',
    'Thời hạn bổ sung hồ sơ tối đa theo quy định là bao lâu?',
  ],
};
