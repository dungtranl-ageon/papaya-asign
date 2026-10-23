---
name: papaya-devops
description: >-
  Use this skill for DevOps and DevSecOps engineering across the project:
  managing CI/CD pipelines, container orchestration (Docker/K8s), infrastructure as code (IaaS/PaaS),
  Git branching & release automation, secret governance, container security scanning, and deployment runs.
---

# Papaya DevOps & DevSecOps Engineer Skill

Skill này đóng vai trò là kim chỉ nam dành cho **Senior DevOps & DevSecOps Specialist / Infrastructure Architect**, phụ trách toàn bộ vòng đời phân phối phần mềm (SDLC), tự động hóa CI/CD, chuẩn hóa Git, bảo mật hạ tầng, container hóa (Docker/K8s), quản lý nền tảng đám mây (PaaS/IaaS), và đảm bảo vận hành tin cậy cao (Site Reliability).

---

## 1. Trọng Trách & Triết Lý Vận Hành (DevSecOps Mindset)

1. **Security Shift-Left (Bảo mật ngay từ khâu viết mã):**
   * Tích hợp kiểm tra bảo mật (Static Analysis, Secret Detection, Dependency Vulnerability Scanning) vào ngay từng commit và pull request.
   * Tuyệt đối không để lọt credentials, API keys, certificates vào git history (`Zero Secret Leaks`).
2. **Infrastructure as Code (IaC) & Tự động hóa Tuyệt đối:**
   * Mọi môi trường (Development, Staging, Production) phải được định nghĩa bằng mã (Docker Compose, Dockerfile, Kubernetes Manifests, Helm, Terraform).
   * Không cấu hình thủ công (no manual snowflakes) trên máy chủ sản xuất.
3. **Immutable & Minimal Containers:**
   * Xây dựng container image với cơ chế Multi-Stage Build tối ưu dung lượng (chỉ giữ lại production artifacts và runtime).
   * Luôn chạy container dưới người dùng phi đặc quyền (non-root user: `USER node` hoặc `USER 1001`), áp dụng `read-only root filesystem` khi có thể.
4. **Resilience & High Availability:**
   * Cấu hình health checks, readiness probes, liveness probes chuẩn mực.
   * Xử lý graceful shutdown (bắt tín hiệu `SIGTERM`, `SIGINT`) để không gián đoạn các luồng stream SSE đang phục vụ Assessor.

---

## 2. Quản Lý Git & Chiến Lược Nhánh (Git & Release Governance)

### Branching Strategy (Git Flow Chuẩn hóa)
* **`main` (Production):** Nhánh bất biến, luôn sẵn sàng release, chỉ nhận code thông qua Pull Request có kiểm thử tự động 100% PASSED. Gắn tag semantic versioning (`v1.0.0`).
* **`develop` (Staging / Integration):** Nhánh tích hợp chính của đội ngũ kỹ sư.
* **`feature/<name>`:** Nhánh phát triển tính năng mới tách từ `develop`.
* **`fix/<issue-name>` / `hotfix/<patch>`:** Nhánh vá lỗi trực tiếp.

### Quy chuẩn Conventional Commits
Bắt buộc tuân thủ chuẩn commit message để tự động hóa changelog và versioning:
* `feat:` Tính năng mới (VD: `feat(api): integrate mastra sse streaming`)
* `fix:` Vá lỗi nghiệp vụ hoặc kỹ thuật (VD: `fix(mcp): resolve sublimit copay rounding`)
* `docs:` Tài liệu và đặc tả (VD: `docs: update deployment blueprint`)
* `test:` Bổ sung hoặc sửa đổi bộ test (VD: `test(e2e): add tc03 missing vat test case`)
* `ci:` Cấu hình CI/CD, workflows (VD: `ci: add trivy container security scan`)
* `chore:` Công việc bảo trì dependencies hoặc config (VD: `chore: update prisma to v6.2.1`)

---

## 3. Containerization & Điều Phối Đa Dịch Vụ (Docker & K8s)

### 1. Docker Multi-Stage Builds Tối Ưu
* Tham chiếu mẫu Dockerfile NestJS API: [references/Dockerfile.api](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-devops/references/Dockerfile.api)
* Tham chiếu mẫu Dockerfile Next.js Web: [references/Dockerfile.web](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-devops/references/Dockerfile.web)

### 2. Quản Lý Docker Compose Cục Bộ
```bash
# Khởi động cụm dịch vụ phụ trợ cơ bản (Postgres):
docker compose up -d

# Khởi động kèm container Ollama cục bộ (profile ai):
docker compose --profile ai up -d

# Kiểm tra trạng thái và tài nguyên:
docker compose ps
docker stats --no-stream

# Kiểm tra healthcheck cụm:
bash .agents/skills/papaya-devops/scripts/healthcheck.sh

# Dừng và dọn dẹp volumes khi cần reset dữ liệu:
docker compose down -v
```

### 3. Kubernetes Orchestration (K8s Ready)
Khi triển khai lên cụm Kubernetes (EKS, GKE hoặc K3s):
* Tham chiếu Manifest K8s hoàn chỉnh: [references/k8s-deployment.yaml](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-devops/references/k8s-deployment.yaml)
* Áp dụng `Deployment`, `Service`, `ConfigMap`, `Secret`, và `HorizontalPodAutoscaler` (HPA).

---

## 4. Tự Động Hóa CI/CD (Continuous Integration & Delivery)

Mọi pipeline CI/CD phải trải qua 5 cổng kiểm soát chất lượng (Quality Gates):

$$\text{Gate 1 (Lint \& Secret Scan)} \rightarrow \text{Gate 2 (Typecheck)} \rightarrow \text{Gate 3 (Automated Tests)} \rightarrow \text{Gate 4 (Container Build \& Vulnerability Scan)} \rightarrow \text{Gate 5 (Deploy)}$$

* **GitHub Actions Pipeline Mẫu:** [references/github-actions-ci.yml](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-devops/references/github-actions-ci.yml)
* Tận dụng triệt để tính năng cache của Turborepo (`turbo run build --cache-dir=.turbo`) và pnpm store để rút ngắn thời gian build xuống dưới 3 phút.

---

## 5. DevSecOps Guardrails (Bảo Mật & Tuân Thủ)

1. **Quét Mã Độc & Lỗ Hổng Phụ Thuộc (SCA):**
   ```bash
   pnpm audit --audit-level=high
   ```
2. **Kiểm Tra Rò Rỉ Bí Mật (Secret Detection):**
   * Sử dụng Gitleaks hoặc script quét cục bộ:
   ```bash
   bash .agents/skills/papaya-devops/scripts/security-audit.sh
   ```
3. **Quét Lỗ Hổng Container Image (Container Scanning):**
   * Chạy Trivy scan trước khi đẩy image lên Container Registry:
   ```bash
   trivy image --severity HIGH,CRITICAL papaya-api:latest
   ```

---

## 6. Nền Tảng Đám Mây: PaaS vs IaaS Strategy

| Hạng mục | Môi trường Khuyến nghị | Ghi chú Triển khai |
| :--- | :--- | :--- |
| **Frontend (`apps/web`)** | **Vercel / Cloudflare Pages (PaaS)** | Triển khai Edge SSR tự động, kết nối trực tiếp repository GitHub |
| **Backend API (`apps/api`)** | **Google Cloud Run / AWS ECS (CaaS/PaaS)** | Chạy container không máy chủ (Serverless Container), tự động scale-to-zero khi không có claims |
| **Cơ sở dữ liệu** | **Supabase / AWS RDS PostgreSQL (PaaS/DBaaS)** | Cung cấp High Availability, Point-in-time recovery (PITR), auto-backup hàng ngày |
| **LLM Gateway** | **Ollama Cloud / OpenRouter / Private vLLM** | Kết nối an toàn qua HTTPS endpoint với Bearer Token trong bí mật môi trường |

---

## 7. Bộ Scripts Tham Chiếu Vận Hành (Operational Scripts)

Skill này cung cấp sẵn các scripts thực thi tự động hóa trong thư mục [scripts/](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-devops/scripts):
1. **[scripts/healthcheck.sh](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-devops/scripts/healthcheck.sh):** Kiểm tra trạng thái sống còn của containers, database connection, và API endpoints.
2. **[scripts/security-audit.sh](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-devops/scripts/security-audit.sh):** Quét an ninh toàn diện monorepo (secrets, permissions, unpinned versions, audit dependencies).
3. **[scripts/deploy-local.sh](file:///Users/tranquocdung/Projects/papaya-asign/.agents/skills/papaya-devops/scripts/deploy-local.sh):** Script 1-click build toàn bộ monorepo, migrate DB, nạp seed test cases và chạy kiểm tra tích hợp.
