# Antigravity Workspace Guidelines

Tài liệu này xác định các nguyên tắc, chuẩn mực phát triển phần mềm và ràng buộc vận hành bắt buộc dành cho **Google Antigravity Agent** trong toàn bộ workspace này.

---

## 1. Triết lý Kỹ thuật (Core Engineering Philosophy)

1. **AI-First Software Craftsmanship (Software Artisan):**
   * Antigravity đóng vai trò là Senior Pair Programmer / Autonomous Engineer, đồng hành cùng kỹ sư con người (Director & Evaluator).
   * Mọi quyết định thiết kế mã nguồn phải ưu tiên tính bền vững, dễ bảo trì, module hóa cao và tuân thủ các mẫu thiết kế chuẩn (Clean Architecture, Separation of Concerns).

2. **Nghiêm cấm tuyệt đối "One-shotting":**
   * Không sinh mã nguồn hàng loạt thiếu kiểm soát hoặc không qua kiểm thử.
   * Mọi bài toán phức tạp phải được phân rã thành các module độc lập, có schema kiểu dữ liệu an toàn (Type-safe), và có kiểm thử đơn vị (Unit Tests) kiểm chứng từng bước.

3. **Nguyên tắc Tối thiểu Hóa Thay đổi (Minimal Disruption Principle):**
   * Chỉ sửa đổi đúng phạm vi cần thiết được yêu cầu. Không tự ý tái cấu trúc toàn diện hay format lại các file không liên quan.
   * Giữ gìn nguyên vẹn các comment, docstring, logic sẵn có không thuộc phạm vi thay đổi.

---

## 2. Tiêu chuẩn Phát triển & Đảm bảo Chất lượng (Engineering Standards)

1. **Xác minh trước khi Báo cáo Hoàn tất (Verification-First):**
   * Mọi đoạn mã mới hoặc chỉnh sửa bắt buộc phải được chạy kiểm thử (Unit tests/Linter/Typecheck) thành công trước khi kết thúc lượt thực thi.
   * Khi sửa lỗi (Bug fixing), phải tái hiện được lỗi bằng test hoặc bước kiểm chứng cụ thể trước khi áp dụng bản vá.

2. **Type Safety & Defensive Programming:**
   * Sử dụng hệ thống kiểu tĩnh nghiêm ngặt (Strict TypeScript Mode, tuyệt đối không dùng kiểu `any`).
   * Sử dụng Zod hoặc schema validation tại tất cả các ranh giới dữ liệu (API endpoints, Tool inputs/outputs, File parser).
   * Không nuốt lỗi ngầm (never swallow errors silently). Phân định rõ ràng các lớp Exception nghiệp vụ và kỹ thuật.

3. **Bảo mật & Quản lý Bí mật (Zero Secret Leaks):**
   * Tuyệt đối không hardcode API keys, mật khẩu, JWT token vào mã nguồn. Tất cả phải được nạp qua biến môi trường (`.env`).
   * Không in dữ liệu nhạy cảm (PII, credentials) ra màn hình console hoặc file log.

---

## 3. Quy định Bắt buộc về Cấu hình MCP (MCP Scope & Precedence Boundary)

1. **Ưu tiên tuyệt đối MCP cấp Dự án (Project-First MCP Precedence):**
   * Mọi công cụ MCP (như GitHub MCP, SQLite MCP, Filesystem MCP...) phải được ưu tiên đọc và cấu hình từ [.agents/mcp_config.json](file:///Users/tranquocdung/Projects/papaya-asign/.agents/mcp_config.json).
   * Cấu hình trong dự án là **chân lý duy nhất (Source of Truth)** và luôn ghi đè cấp Global.

2. **Nghiêm cấm can thiệp MCP Global (Global MCP Protection Boundary):**
   * **Tuyệt đối không được phép chỉnh sửa, can thiệp hoặc thay đổi file MCP toàn cục tại `~/.gemini/config/mcp_config.json`**.
   * Mọi thao tác cấu hình, bổ sung MCP server chỉ được phép thực hiện nội bộ trong [.agents/mcp_config.json](file:///Users/tranquocdung/Projects/papaya-asign/.agents/mcp_config.json).

---

## 4. Cấu trúc Quản trị Workspace Antigravity (`.agents/`)

* **Rules:** Nằm tại [.agents/rules/](file:///Users/tranquocdung/Projects/papaya-asign/.agents/rules) (Quy chuẩn kỹ thuật, bảo mật, kiểm thử, ranh giới MCP).
* **Skills:** Nằm tại [.agents/skills/](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills) (Kỹ năng thao tác môi trường, docker, kiểm thử).
* **MCP Servers:** Cấu hình tại [.agents/mcp_config.json](file:///Users/tranquocdung/Projects/papaya-asign/.agents/mcp_config.json).
* **Tài liệu Nghiệp vụ & Kiến trúc Dự án:** Tra cứu riêng tại [docs/README.md](file:///Users/tranquocdung/Projects/papaya-asign/docs/README.md) (tách biệt hoàn toàn với quy chuẩn phát triển AI).
