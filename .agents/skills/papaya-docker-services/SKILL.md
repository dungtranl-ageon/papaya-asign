---
name: papaya-docker-services
description: >-
  Use this skill to launch, health-check, inspect logs, and manage the Docker
  Compose environment for PostgreSQL, Prisma Studio, and auxiliary AI microservices.
---

# Papaya Docker Services Skill

Skill này hướng dẫn quy chuẩn vận hành, quản lý vòng đời container và chẩn đoán sự cố cho cụm dịch vụ Docker Compose trong dự án Papaya.

---

## 1. Các Lệnh Điều Hành Cơ Bản

```bash
# 1. Khởi động các dịch vụ phụ trợ chạy ngầm
docker compose up -d

# 2. Kiểm tra trạng thái hoạt động của các containers
docker compose ps

# 3. Xem log thời gian thực của toàn bộ cụm hoặc dịch vụ cụ thể
docker compose logs -f
docker compose logs -f <service-name>

# 4. Kiểm tra mức tiêu thụ tài nguyên (CPU, RAM, Network I/O)
docker stats --no-stream

# 5. Dừng và dọn dẹp containers
docker compose down
```

---

## 2. Kiểm Tra Sức Khỏe Dịch Vụ (Healthcheck Verification)

Khi một container được khởi chạy, kiểm tra endpoint thực tế để đảm bảo sẵn sàng phục vụ:

```bash
# Kiểm tra health endpoint của Backend API
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health

# Kiểm tra trạng thái healthcheck nội tại của Docker container
docker inspect --format='{{json .State.Health.Status}}' <container-name>
```

---

## 3. Khắc Phục Sự Cố Thường Gặp

1. **Xung đột Cổng (Port Conflict):**
   * Nếu port `8000` hoặc `5432` đã bị ứng dụng khác chiếm: sửa lại port mapping ngoài host trong `docker-compose.yml` (ví dụ: `8005:8000`).
2. **Khởi tạo Database Mới:**
   * Khi cần reset lại toàn bộ dữ liệu SQLite/Postgres: `docker compose down -v` và chạy lại `pnpm prisma db push`.
