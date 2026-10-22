---
trigger: always_on
description: "Ràng buộc bắt buộc ưu tiên MCP của dự án và bảo vệ cấu hình MCP toàn cục"
---

# Ràng Buộc Bắt Buộc Về Cấu Hình MCP (MCP Scope & Precedence Boundary)

Mọi agent, subagent và conversation trong workspace này **BẮT BUỘC** phải tuân thủ nghiêm ngặt 2 nguyên tắc sau:

1. **Ưu tiên tuyệt đối MCP cấp Dự án (Project-First MCP Precedence):**
   * Mọi công cụ MCP (như GitHub MCP, SQLite MCP, Filesystem MCP...) phải được ưu tiên đọc và cấu hình từ [.agents/mcp_config.json](file:///Users/tranquocdung/Projects/papaya-asign/.agents/mcp_config.json).
   * Cấu hình trong dự án luôn là **chân lý duy nhất (Source of Truth)** và ghi đè hoàn toàn cấu hình ở cấp toàn cục (Global).

2. **Nghiêm cấm can thiệp MCP Global (Global MCP Protection Boundary):**
   * **Tuyệt đối không được phép chỉnh sửa, ghi đè, xóa hoặc can thiệp vào file cấu hình toàn cục `~/.gemini/config/mcp_config.json`**.
   * Mọi chỉnh sửa, thêm bớt server hoặc đổi token MCP chỉ được phép thực hiện bên trong [.agents/mcp_config.json](file:///Users/tranquocdung/Projects/papaya-asign/.agents/mcp_config.json).
