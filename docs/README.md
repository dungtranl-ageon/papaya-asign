# Papaya Insurtech Assignment — Technical Documentation Hub

Tài liệu thiết kế kiến trúc và phân tích chi tiết cho bài toán **AI Engineering Challenge** của **Papaya Insurtech** (Chi nhánh Nguyễn Văn Đậu, Bình Thạnh, TP.HCM).

---

## Danh mục tài liệu

| File | Tên tài liệu & Mô tả | Trọng tâm |
| :--- | :--- | :--- |
| **[01. Phân tích & Lựa chọn Thử thách](01_CHALLENGE_EVALUATION_AND_SELECTION.md)** | So sánh tổng quan 15 bài thử thách trong repo `pumpkin`, đánh giá chiến lược đạt 3 points tối ưu. | Đánh giá chiến lược, độ khó, tính khả thi, phân loại tech stack |
| **[02. Chi tiết Yêu cầu AI Challenge 11](02_CHALLENGE_11_SPECIFICATION_AND_REQUIREMENTS.md)** | Phân tích chuyên sâu đề bài 11: Làm rõ bản chất Copilot, RAG, Guardrails, Direct UI và AI phụ trợ. | Yêu cầu cốt lõi, bẫy chấm điểm, trả lời 6 câu hỏi kỹ thuật lớn |
| **[03. Kiến trúc Hệ thống Tổng thể](03_ENTERPRISE_SYSTEM_ARCHITECTURE.md)** | Bản thiết kế kiến trúc phân tán cấp doanh nghiệp: Data & Search Layer, Security & Data Deletion, Agent Workflow. | Enterprise Architecture, S3 KMS Cryptographic Erasure, OpenSearch |
| **[04. Các AI Phụ trợ & Đặc tả Docker](04_AUXILIARY_AI_AND_DOCKER_SPEC.md)** | Đặc tả 5 AI phụ trợ độc lập, Dockerfile, tài nguyên CPU/RAM và file `docker-compose.yml` chuẩn. | Microservices, Microsoft Presidio, FastEmbed, ImageHash, PaddleOCR |
| **[05. Mô hình Dữ liệu & 3 Kịch bản Thẩm định](05_DATA_MODELS_AND_TEST_CASES.md)** | Định nghĩa chi tiết Data Contracts (Zod/TypeScript), 4 Tool Schemas, và 3 Test Cases mẫu (Approve, Reject, Missing Info). | Data Models, Math Logic, Báo cáo thẩm định chuẩn |
| **[06. Đặc tả Thiết kế UI/UX & Wireframe](06_UI_UX_WIREFRAME_AND_SPECIFICATION.md)** | Thiết kế toàn diện Wireframe, Bố cục Dual-Pane Workstation, Direct Generative UI trong chat, và 4 Action Modals. | UX/UI Wireframe, Vercel AI SDK Cards, HITL Actions, Design System |
| **[07. Thiết kế Công nghệ & Kế hoạch](07_TECH_STACK_AND_IMPLEMENTATION_BLUEPRINT.md)** | Thống nhất tech stack (Mastra, NestJS, Next.js, MCP Tools, Prisma SQLite), kiến trúc Monorepo và Sequence Diagram luồng Hybrid. | Monorepo, Mastra Workflow/Agent, Dual-Export MCP, SSE Streaming |

---

## Tóm tắt định hướng giải pháp đã thống nhất

```
+-----------------------------------------------------------------------------------+
|               ASSESSOR COPILOT WORKSTATION (Next.js + TailwindCSS)                |
|           [Direct Generative UI: Interactive In-Chat Cards & HITL Actions]         |
+-----------------------------------------------------------------------------------+
                                         │
                                         ▼ (Vercel AI SDK / Tool Calling)
+-----------------------------------------------------------------------------------+
|                     CLAIM ASSESSMENT AI AGENT ORCHESTRATOR                        |
|  Strict Sequence: verifyDocument -> lookupPolicy -> checkNecessity -> calculate   |
+-----------------------------------------------------------------------------------+
         │                        │                        │                        │
         ▼ (Tool 1)               ▼ (Tool 2)               ▼ (Tool 3)               ▼ (Tool 4)
+------------------+     +------------------+     +------------------+     +------------------+
| verifyDocument() |     |  lookupPolicy()  |     | checkNecessity() |     |calculateBenefit()|
|  - Doc Forensics |     |  - Policy T&C    |     |  - ICD-10 Mapper |     |  - Math Engine   |
|  - Completeness  |     |  - Exclusions    |     |  - Clinical Rules|     |  - Limit/Balance |
+------------------+     +------------------+     +------------------+     +------------------+
         │                        │                        │                        │
         └────────────────────────┴───────────┬────────────┴────────────────────────┘
                                              │
                                              ▼
+-----------------------------------------------------------------------------------+
|                         DOCKERIZED AUXILIARY AI SERVICES                          |
|  [PII Redactor: 8001] | [OCR Service: 8002] | [ICD-10: 8003] | [Forensics: 8004]  |
+-----------------------------------------------------------------------------------+
```

1. **Thử thách lựa chọn:** **[AI_Challenge_11 — Claim Assessment AI Agent](02_CHALLENGE_11_SPECIFICATION_AND_REQUIREMENTS.md)** (3 Điểm — Cấp độ Advanced).
2. **Hình thái giao diện:** **Assessment Copilot Web UI** sử dụng **Vercel AI SDK** để hỗ trợ **Direct UI / Generative UI** ngay bên trong khung chat (hiển thị thẻ chiết tính tiền viện phí trực quan và nút duyệt action cho chuyên viên bồi thường).
3. **Chiến lược Tri thức & RAG:** Cấu trúc phân cấp điều khoản theo mã (`CLAUSE-ID`) kết hợp Workflow-based Retrieval để Agent trích dẫn điều khoản chính xác tuyệt đối, không bịa đặt (Zero Hallucination).
4. **Hạ tầng AI Phụ trợ:** Đóng gói độc lập trên Docker (`docker-compose.yml`) gồm: Ẩn danh hóa PII (Presidio), Mã hóa y tế ICD-10 (FastEmbed), Giám định ảnh giả mạo (ImageHash + ELA), và OCR bóc tách tài liệu.
5. **Tuân thủ quy chuẩn Papaya:** Đáp ứng nghiêm ngặt chính sách [Data Deletion Whitepaper](../requirements/Whitepapers/Data_Deletion.md) (Cryptographic Erasure cho Claim Documents) và thuật ngữ [Medical Insurance 101](../requirements/Software_Artisan_Handbook/resources/Medical_Insurance_101.md).
