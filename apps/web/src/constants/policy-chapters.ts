export interface PolicyChapterClause {
  id: string;
  title: string;
  content: string;
}

export interface PolicyChapter {
  chapterTitle: string;
  clauses: PolicyChapterClause[];
}

export const POLICY_CHAPTERS_DATA: PolicyChapter[] = [
  {
    chapterTitle: 'Chương I: Định nghĩa & Quy định Chung',
    clauses: [
      {
        id: 'POLICY-SEC-1.1',
        title: 'Điều 1.1: Định nghĩa Người được Bảo hiểm & Đối tượng tham gia',
        content:
          'Người được bảo hiểm là công dân Việt Nam hoặc người nước ngoài đang cư trú hợp pháp tại Việt Nam từ đủ 15 ngày tuổi đến 65 tuổi tại thời điểm tham gia hợp đồng.',
      },
      {
        id: 'POLICY-SEC-2.1',
        title: 'Điều 2.1: Cơ sở Y tế Hợp pháp',
        content:
          'Cơ sở y tế được công nhận phải là bệnh viện, phòng khám được thành lập và hoạt động hợp pháp theo Luật Khám bệnh, chữa bệnh Việt Nam, có đầy đủ giấy phép hoạt động và mã số cơ sở y tế do Bộ Y tế cấp.',
      },
    ],
  },
  {
    chapterTitle: 'Chương II: Phạm vi Bảo hiểm & Quyền lợi Nội trú',
    clauses: [
      {
        id: 'POLICY-SEC-5.1',
        title: 'Điều 5.1: Chi phí Nằm viện & Phòng chăm sóc đặc biệt (ICU)',
        content:
          'Chi trả tiền phòng và giường bệnh tối đa theo hạn mức chương trình. Trường hợp nằm tại khoa chăm sóc đặc biệt (ICU), mức chi trả tối đa nhân đôi, tối đa 30 ngày/năm.',
      },
      {
        id: 'POLICY-SEC-5.2',
        title: 'Điều 5.2: Chi phí Phẫu thuật & Thủ thuật Nội trú',
        content:
          'Chi trả các chi phí phẫu thuật bao gồm tiền công phẫu thuật viên, bác sĩ gây mê, phòng mổ, vật tư tiêu hao y tế thông thường trong danh mục cho phép. Hạn mức chi trả phẫu thuật tối đa 50.000.000 đ/năm.',
      },
      {
        id: 'POLICY-SEC-14.2',
        title: 'Điều 14.2: Tỷ lệ Đồng chi trả (Co-payment) Viện phí',
        content:
          'Mức đồng chi trả tiêu chuẩn 20% áp dụng cho toàn bộ chi phí khám chữa bệnh nội trú tại các bệnh viện tư nhân và quốc tế không thuộc mạng lưới bảo lãnh trực tiếp. Doanh nghiệp bảo hiểm chi trả 80% phần chi phí hợp lệ còn lại sau khi trừ đi các khoản loại trừ.',
      },
    ],
  },
  {
    chapterTitle: 'Chương III: Thời gian chờ (Waiting Period)',
    clauses: [
      {
        id: 'POLICY-SEC-4.2',
        title: 'Điều 4.2: Thời gian chờ Bệnh Thông thường (30 ngày)',
        content:
          'Áp dụng thời gian chờ 30 ngày kể từ ngày hợp đồng có hiệu lực đối với các bệnh lý nội khoa thông thường (viêm loét dạ dày tá tràng, viêm phế quản, cảm cúm). Mọi sự kiện phát sinh trước hoặc trong thời gian 30 ngày này đều không được bảo hiểm.',
      },
      {
        id: 'POLICY-SEC-6.1',
        title: 'Điều 6.1: Miễn áp dụng Thời gian chờ cho Cấp cứu Ngoại khoa',
        content:
          'Các trường hợp cấp cứu y khoa đe dọa trực tiếp đến tính mạng người được bảo hiểm (bao gồm viêm ruột thừa cấp, xoắn ruột, thủng dạ dày, đa chấn thương do tai nạn) được MIỄN HOÀN TOÀN thời gian chờ 30 ngày và được bảo hiểm ngay từ ngày hiệu lực đầu tiên của hợp đồng.',
      },
      {
        id: 'POLICY-SEC-7.1',
        title: 'Điều 7.1: Thời gian chờ Bệnh Đặc biệt & Bệnh có sẵn (365 ngày)',
        content:
          'Thời gian chờ 365 ngày (1 năm) áp dụng cho các bệnh lý đặc biệt như ung thư, tiểu đường, tim mạch, bệnh lý mạch máu não và các bệnh có sẵn đã tồn tại trước ngày tham gia bảo hiểm.',
      },
    ],
  },
  {
    chapterTitle: 'Chương IV: Điểm Loại trừ Trách nhiệm Bảo hiểm',
    clauses: [
      {
        id: 'POLICY-SEC-14.1',
        title: 'Điều 14.1: Các điểm loại trừ trách nhiệm bảo hiểm chung',
        content:
          'Không chi trả cho các hành vi cố ý gây thương tích, sử dụng chất gây nghiện, rượu bia vượt nồng độ cồn quy định khi tham gia giao thông, hoặc tham gia các hoạt động thể thao mạo hiểm có nguy cơ cao.',
      },
      {
        id: 'POLICY-SEC-14.3',
        title: 'Điều 14.3: Loại trừ Thực phẩm chức năng & Dược mỹ phẩm',
        content:
          'Các chế phẩm dinh dưỡng, thực phẩm chức năng bổ gan (Hepa-Care), vitamin bồi bổ cơ thể, khoáng chất tổng hợp, sữa dinh dưỡng y học và mỹ phẩm điều trị da liễu không thuộc danh mục chi trả, bất kể có được bác sĩ chuyên khoa kê trong đơn hay không.',
      },
      {
        id: 'POLICY-SEC-15.1',
        title: 'Điều 15.1: Phẫu thuật Thẩm mỹ & Chữa tật khúc xạ',
        content:
          'Không chi trả cho các can thiệp thẩm mỹ tạo hình, phẫu thuật Lasik, chỉnh nha thẩm mỹ, trừ trường hợp phẫu thuật tái tạo bắt buộc sau tai nạn giao thông được quy định rõ tại Điều 12.',
      },
    ],
  },
];
