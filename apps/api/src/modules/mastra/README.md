# Papaya Mastra Engine Module

Module tích hợp **Mastra Core (`@mastra/core`)** vào hệ thống Backend NestJS phục vụ quy trình Giám định & Thẩm định Bồi thường Bảo hiểm Y tế tự động.

## Cấu trúc Module

- **[mastra.instance.ts](file:///Users/tranquocdung/Projects/papaya-asign/apps/api/src/modules/mastra/mastra.instance.ts):** Khởi tạo instance trung tâm `mastra = new Mastra({ agents, workflows })`.
- **[agents/assessor.agent.ts](file:///Users/tranquocdung/Projects/papaya-asign/apps/api/src/modules/mastra/agents/assessor.agent.ts):** Trợ lý Thẩm định Bồi thường (Assessor Copilot Agent) hỗ trợ chuyên viên đối thoại và tra cứu điều khoản.
- **[workflows/assessment.workflow.ts](file:///Users/tranquocdung/Projects/papaya-asign/apps/api/src/modules/mastra/workflows/assessment.workflow.ts):** Đồ thị 4 bước thẩm định tất định tuần tự (`verifyDocument` -> `lookupPolicy` -> `checkMedicalNecessity` -> `calculateBenefit`).
- **[guardrails/jargon-filter.guardrail.ts](file:///Users/tranquocdung/Projects/papaya-asign/apps/api/src/modules/mastra/guardrails/jargon-filter.guardrail.ts):** Rào chắn an toàn kiểm soát và thanh lọc toàn bộ thuật ngữ công nghệ nội bộ khỏi giao diện người dùng.
- **[prompts/assessor.prompts.ts](file:///Users/tranquocdung/Projects/papaya-asign/apps/api/src/modules/mastra/prompts/assessor.prompts.ts):** Mẫu câu lệnh hệ thống và persona nghiệp vụ chuẩn mực.
- **[scorers/assessment.scorers.ts](file:///Users/tranquocdung/Projects/papaya-asign/apps/api/src/modules/mastra/scorers/assessment.scorers.ts):** 4 bộ tiêu chí đánh giá chất lượng (Bảo toàn số học, Căn cứ điều khoản, Tính hợp lý y khoa, Điểm tin cậy).

Chi tiết quy chuẩn vận hành và phát triển: xem tại [MASTRA_ENGINEERING_GUIDELINES.md](file:///Users/tranquocdung/Projects/papaya-asign/apps/api/src/modules/mastra/MASTRA_ENGINEERING_GUIDELINES.md).
