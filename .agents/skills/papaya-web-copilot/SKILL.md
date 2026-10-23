---
name: papaya-web-copilot
description: >-
  Use this skill to develop the Next.js 15+ Dual-Pane Workstation, integrating
  Vercel AI SDK (useChat), pure TailwindCSS + Lucide, and rendering Direct Generative
  UI cards and Action Modals.
---

# Papaya Web Copilot Skill

Skill này hướng dẫn xây dựng giao diện **Claims Assessment Workstation** trên **Next.js 15+ App Router (`apps/web`)** theo đặc tả tại [docs/06_UI_UX_WIREFRAME_AND_SPECIFICATION.md](file:///Users/tranquocdung/Projects/papaya-asign/docs/06_UI_UX_WIREFRAME_AND_SPECIFICATION.md).

---

## 1. Kiến Trúc Giao Diện Chia Đôi (Dual-Pane Layout)

Giao diện làm việc chính chia thành 2 phần:
* **Cột Trái (Ground-Truth Dossier - 50% width):**
  * Thẻ thông tin Hợp đồng & Thành viên.
  * Thẻ chẩn đoán y khoa & Badge chuẩn hóa ICD-10.
  * Trình xem tài liệu tương tác (PDF/Image Viewer, nút phóng to/thu nhỏ, xoay ảnh, toggle lớp OCR).
* **Cột Phải (AI Copilot Chatbox - 50% width):**
  * Tích hợp hook `useChat` từ **Vercel AI SDK (`ai/react`)**.
  * Nhận luồng SSE từ NestJS backend và render các thẻ Generative UI.

---

## 2. Danh Mục Các Component Generative UI (In-Chat Direct UI)

1. **`<ToolExecutionTimeline />`:**
   * Hiển thị trạng thái 4 bước: `verifyDocument` -> `lookupPolicy` -> `checkMedicalNecessity` -> `calculateBenefit`.
   * Icon trạng thái: Spinner xoay khi đang chạy, Tick xanh khi hoàn thành, Dấu than đỏ khi có lỗi.
2. **`<BenefitCalculationCard />`:**
   * Bảng chiết tính viện phí: Số tiền yêu cầu, Mức miễn thường, Đồng chi trả, Số tiền duyệt.
   * Thanh Bar thể hiện hạn mức năm còn lại (`Progress Bar`).
3. **`<PolicyCitationPill />`:**
   * Badge trích dẫn điều khoản hợp đồng (`Clause ID`).
   * Click mở Popover hiển thị nguyên văn đoạn luật được trích dẫn (chống 100% ảo giác).
4. **`<AssessmentDecisionBox />`:**
   * Khối đề xuất quyết định: `APPROVE`, `REJECT`, hoặc `REQUEST_MORE_INFO`.
   * Nút bấm kích hoạt các Action Modals tương ứng.

---

## 3. Quy Chuẩn Công Nghệ & Styling

* **Styling:** Sử dụng **TailwindCSS thuần túy**. Không cài Shadcn CLI hay Ant Design cồng kềnh.
* **Icons:** Nhập khẩu trực tiếp từ **`lucide-react`** (`CheckCircle2`, `AlertTriangle`, `ShieldAlert`, `FileText`, `DollarSign`).
* **Modals:** Dùng `@radix-ui/react-dialog` bọc bằng các class TailwindCSS gọn nhẹ.
