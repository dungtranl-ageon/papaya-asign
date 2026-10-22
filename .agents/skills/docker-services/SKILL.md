---
name: docker-services
description: >-
  Use this skill to build, launch, health-check, inspect logs, and manage Docker
  containers and Docker Compose services within the workspace.
---

# Docker Services Management Skill

Skill này hướng dẫn quy chuẩn vận hành, quản lý vòng đời container và chẩn đoán sự cố cho các dịch vụ Docker Compose trong workspace.

---

## 1. Các Thao tác Điều hành Cơ bản

```bash
# 1. Khởi động toàn bộ cụm dịch vụ chạy ngầm
docker compose up -d

# 2. Kiểm tra trạng thái hoạt động của các containers
docker compose ps

# 3. Xem log thời gian thực của toàn bộ cụm hoặc dịch vụ cụ thể
docker compose logs -f
docker compose logs -f <service-name>

# 4. Kiểm tra mức tiêu thụ tài nguyên (CPU, RAM, Network I/O)
docker stats --no-stream

# 5. Khởi động lại một dịch vụ cụ thể
docker compose restart <service-name>

# 6. Dừng và dọn dẹp containers
docker compose down
```

---

## 2. Quy trình Kiểm tra Sức khỏe Dịch vụ (Healthcheck Verification)

Khi một container được khởi chạy, không dựa vào cờ "running" đơn thuần. Phải kiểm tra endpoint sức khỏe thực tế:

```bash
# Gửi yêu cầu HTTP kiểm tra health endpoint
curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>/health

# Hoặc kiểm tra trạng thái healthcheck nội tại của Docker
docker inspect --format='{{json .State.Health.Status}}' <container-name>
```

---

## 3. Chẩn đoán & Xử lý Sự cố (Troubleshooting Runbook)

1. **Xung đột Cổng (Port Conflict):**
   * Triệu chứng: `bind: address already in use`.
   * Chẩn đoán: `lsof -i :<port>` để xác định tiến trình đang chiếm cổng.
   * Giải pháp: Điều chỉnh port mapping ngoài host trong `docker-compose.yml` (ví dụ: `8080:<internal-port>`).

2. **Container Thoát Đột ngột (CrashLoop / Exit code non-zero):**
   * Xem 50 dòng log cuối cùng trước khi sập: `docker compose logs --tail=50 <service-name>`.
   * Kiểm tra thiếu biến môi trường trong file `.env`.
