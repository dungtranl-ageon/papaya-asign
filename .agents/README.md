# Antigravity Local Workspace Customization Suite

Thư mục `.agents/` này chứa toàn bộ cấu hình **chuẩn hóa cho Google Antigravity Agent** áp dụng độc quyền trong workspace này, phục vụ thuần túy cho việc hỗ trợ AI phát triển phần mềm theo các chuẩn mực kỹ thuật cao cấp, hoàn toàn không chứa nghiệp vụ riêng của dự án.

---

## 1. Cấu trúc Thư mục

```text
.agents/
├── rules/                                   # Workspace Rules (Luật & Ràng buộc Kỹ thuật)
│   ├── 00_mcp_priority_boundary.md          # Ranh giới ưu tiên MCP dự án & Bảo vệ MCP toàn cục
│   ├── 01_software_craftsmanship.md         # Phân rã bài toán, Clean Architecture, Diff discipline
│   ├── 02_code_standards_and_hygiene.md     # Type safety, Zod schema validation, Bảo mật & Secrets
│   └── 03_testing_and_verification.md       # Kỷ luật Verification-First, Tái hiện lỗi, Test coverage
│
├── skills/                                  # Workspace Skills (Kỹ năng Vận hành Kỹ thuật)
│   └── docker-services/SKILL.md             # Runbook quản lý & kiểm tra sức khỏe Docker Compose
│
├── mcp_config.json                          # Cấu hình Model Context Protocol (MCP) cấp dự án
└── README.md                                # Hướng dẫn này
```

---

## 2. Nguyên tắc Phân định Ranh giới (Scope Boundaries)

1. **Ranh giới Kỹ thuật vs Nghiệp vụ (No Business Logic in Rules):**
   * Các file trong `.agents/` và `AGENTS.md` chỉ đóng vai trò là **kim chỉ nam về kỹ thuật lập trình, chất lượng code, bảo mật và kiểm thử** cho Antigravity.
   * Toàn bộ tài liệu nghiệp vụ, kiến trúc domain và kịch bản nghiệp vụ của dự án được lưu trữ riêng biệt tại thư mục [docs/](file:///Users/tranquocdung/Projects/papaya-asign/docs).
2. **Ranh giới MCP Dự án vs Toàn cục:**
   * Mọi công cụ MCP phục vụ dự án được cấu hình độc lập tại `.agents/mcp_config.json`.
   * Nghiêm cấm mọi can thiệp vào file cấu hình MCP toàn cục của máy (`~/.gemini/config/mcp_config.json`).
