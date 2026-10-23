export interface PolicyClause {
  title: string;
  content: string;
  chapter: string;
}

export const POLICY_CLAUSE_DICTIONARY: Record<string, PolicyClause> = {
  'POLICY-SEC-1.1': {
    chapter: 'Chương I: Định nghĩa & Quy định Chung',
    title: 'Điều 1.1: Người được bảo hiểm hợp pháp',
    content:
      'Người được bảo hiểm là công dân Việt Nam hoặc người nước ngoài đang cư trú hợp pháp tại Việt Nam từ đủ 15 ngày tuổi đến 65 tuổi tại thời điểm tham gia hợp đồng.',
  },
  'POLICY-SEC-2.1': {
    chapter: 'Chương I: Định nghĩa & Quy định Chung',
    title: 'Điều 2.1: Cơ sở Y tế Hợp pháp',
    content:
      'Cơ sở y tế được công nhận phải là bệnh viện, phòng khám được thành lập và hoạt động hợp pháp theo Luật Khám bệnh, chữa bệnh Việt Nam, có đầy đủ giấy phép hoạt động và mã số cơ sở y tế do Bộ Y tế cấp.',
  },
  'POLICY-SEC-4.2': {
    chapter: 'Chương III: Thời gian chờ (Waiting Period)',
    title: 'Điều 4.2: Thời gian chờ Bệnh thông thường (30 ngày)',
    content:
      'Áp dụng thời gian chờ 30 ngày kể từ ngày hợp đồng có hiệu lực đối với các bệnh lý nội khoa thông thường (viêm loét dạ dày tá tràng, viêm phế quản, cảm cúm). Mọi sự kiện phát sinh trước hoặc trong thời gian 30 ngày này đều không được bảo hiểm.',
  },
  'POLICY-SEC-5.1': {
    chapter: 'Chương II: Phạm vi Bảo hiểm & Quyền lợi Nội trú',
    title: 'Điều 5.1: Chi phí Tiền phòng & Giường bệnh',
    content:
      'Chi trả chi phí tiền phòng và giường bệnh nội trú thực tế theo hạn mức quy định của từng chương trình bảo hiểm (Silver, Gold, Platinum).',
  },
  'POLICY-SEC-5.2': {
    chapter: 'Chương II: Phạm vi Bảo hiểm & Quyền lợi Nội trú',
    title: 'Điều 5.2: Chi phí Phẫu thuật & Thủ thuật Nội trú',
    content:
      'Chi trả các chi phí phẫu thuật bao gồm tiền công phẫu thuật viên, bác sĩ gây mê, phòng mổ, vật tư tiêu hao y tế thông thường trong danh mục cho phép.',
  },
  'POLICY-SEC-6.1': {
    chapter: 'Chương III: Thời gian chờ (Waiting Period)',
    title: 'Điều 6.1: Miễn áp dụng Thời gian chờ cho Cấp cứu Ngoại khoa',
    content:
      'Các trường hợp cấp cứu y khoa đe dọa trực tiếp đến tính mạng người được bảo hiểm (bao gồm viêm ruột thừa cấp, xoắn ruột, thủng dạ dày, đa chấn thương do tai nạn) được MIỄN HOÀN TOÀN thời gian chờ 30 ngày và được bảo hiểm ngay từ ngày hiệu lực đầu tiên của hợp đồng.',
  },
  'POLICY-SEC-7.1': {
    chapter: 'Chương III: Thời gian chờ (Waiting Period)',
    title: 'Điều 7.1: Thời gian chờ Bệnh Đặc biệt & Bệnh có sẵn (365 ngày)',
    content:
      'Thời gian chờ 365 ngày (1 năm) áp dụng cho các bệnh lý đặc biệt như ung thư, tiểu đường, tim mạch, bệnh lý mạch máu não và các bệnh có sẵn đã tồn tại trước ngày tham gia bảo hiểm.',
  },
  'POLICY-SEC-8.2': {
    chapter: 'Chương IV: Điểm Loại trừ Trách nhiệm Bảo hiểm',
    title: 'Điều 8.2: Phẫu thuật Thẩm mỹ & Chỉnh hình không do tai nạn',
    content:
      'Không chi trả cho các chi phí phẫu thuật tạo hình thẩm mỹ, làm đẹp, chỉnh nha, hoặc can thiệp không mang tính cấp thiết y tế.',
  },
  'POLICY-SEC-14.1': {
    chapter: 'Chương IV: Điểm Loại trừ Trách nhiệm Bảo hiểm',
    title: 'Điều 14.1: Các điểm loại trừ trách nhiệm bảo hiểm chung',
    content:
      'Không chi trả cho các hành vi cố ý gây thương tích, sử dụng chất gây nghiện, rượu bia vượt nồng độ cồn quy định khi tham gia giao thông, hoặc tham gia các hoạt động thể thao mạo hiểm có nguy cơ cao.',
  },
  'POLICY-SEC-14.2': {
    chapter: 'Chương II: Phạm vi Bảo hiểm & Quyền lợi Nội trú',
    title: 'Điều 14.2: Tỷ lệ Đồng chi trả (Co-payment) Viện phí',
    content:
      'Mức đồng chi trả tiêu chuẩn áp dụng theo hợp đồng đối với chi phí khám chữa bệnh nội trú. Doanh nghiệp bảo hiểm chi trả phần chi phí hợp lệ còn lại sau khi khấu trừ tỷ lệ đồng chi trả.',
  },
  'POLICY-SEC-14.3': {
    chapter: 'Chương IV: Điểm Loại trừ Trách nhiệm Bảo hiểm',
    title: 'Điều 14.3: Loại trừ Thực phẩm chức năng & Dược mỹ phẩm',
    content:
      'Các chế phẩm dinh dưỡng, thực phẩm chức năng bổ gan, vitamin bồi bổ cơ thể, khoáng chất tổng hợp, sữa dinh dưỡng y học và mỹ phẩm điều trị da liễu không thuộc danh mục chi trả, bất kể có được bác sĩ chuyên khoa kê trong đơn hay không.',
  },
  'POLICY-SEC-15.1': {
    chapter: 'Chương IV: Điểm Loại trừ Trách nhiệm Bảo hiểm',
    title: 'Điều 15.1: Phẫu thuật Thẩm mỹ & Chữa tật khúc xạ',
    content:
      'Không chi trả cho các can thiệp thẩm mỹ tạo hình, phẫu thuật Lasik, chỉnh nha thẩm mỹ, trừ trường hợp phẫu thuật tái tạo bắt buộc sau tai nạn giao thông.',
  },
  'POLICY-SEC-16.1': {
    chapter: 'Chương V: Quy định Hồ sơ & Chứng từ Hợp lệ',
    title: 'Điều 16.1: Nghĩa vụ cung cấp Hóa đơn tài chính VAT hợp lệ',
    content:
      'Người yêu cầu bồi thường có nghĩa vụ cung cấp đầy đủ hóa đơn điện tử VAT hợp pháp có mã tra cứu trên hệ thống Tổng cục Thuế đối với mọi khoản chi phí yêu cầu thanh toán trên 200.000 VNĐ.',
  },
  'POLICY-SEC-18.3': {
    chapter: 'Chương VI: Tính Trung thực Tuyệt đối & Chống Trục lợi',
    title: 'Điều 18.3: Hành vi gian lận chứng từ y tế',
    content:
      'Trường hợp phát hiện chứng từ giả mạo, chỉnh sửa số tiền, hoặc trục lợi bảo hiểm, doanh nghiệp bảo hiểm có quyền từ chối toàn bộ hồ sơ và chấm dứt hiệu lực hợp đồng.',
  },
};
