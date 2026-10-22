# 04. Các AI Phụ trợ & Đặc tả Docker (Auxiliary AI & Docker Specifications)

Tài liệu này đặc tả chi tiết 5 dịch vụ AI phụ trợ độc lập, hoàn toàn mã nguồn mở, không phụ thuộc cloud bên thứ ba, và có thể đóng gói triển khai tức thì bằng Docker trên máy cá nhân hoặc hạ tầng máy chủ của Papaya.

---

## 1. Danh mục 5 Dịch vụ AI Phụ trợ

```
+─────────────────────────────────────────────────────────────────────────────────+
|                           DOCKER MICROSERVICES CLUSTER                          |
|                                                                                 |
|  [Port 8001] PII Redactor Service (Microsoft Presidio)                          |
|      └── Nhận diện và che giấu PII (CCCD, BHYT, Tên bệnh nhân, SĐT)             |
|                                                                                 |
|  [Port 8002] Vision / OCR Extractor Service (PaddleOCR / Surya)                 |
|      └── Bóc tách chữ, số tiền, bảng viện phí, kiểm tra mộc đỏ                  |
|                                                                                 |
|  [Port 8003] Medical Normalizer Service (FastEmbed + ICD-10 Vector)             |
|      └── Chuẩn hóa chẩn đoán tự do của bác sĩ sang mã ICD-10 quốc tế            |
|                                                                                 |
|  [Port 8004] Document Forensics Service (ImageHash + OpenCV ELA)                |
|      └── Phát hiện sửa số tiền bằng Photoshop, phát hiện nộp ảnh trùng lặp      |
|                                                                                 |
|  [Port 8005] Guardrails & Evals Judge Service (DeepEval / Guardrails AI)        |
|      └── Thẩm định tính toàn vẹn toán học và kiểm tra chéo trích dẫn hợp đồng   |
+─────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Chi tiết Đặc tả Từng Dịch vụ

### Dịch vụ 1: PII Redactor Service (Port 8001)
* **Thư viện nền tảng:** Microsoft Presidio (`presidio-analyzer`, `presidio-anonymizer`) + `spacy`.
* **Mục đích:** Đảm bảo tuân thủ Luật Bảo vệ Dữ liệu Cá nhân (PDPA Việt Nam, PDPA Thái Lan) và [Data Deletion Whitepaper](../requirements/Whitepapers/Data_Deletion.md).
* **API Endpoint:** `POST /api/v1/redact`
* **Input:**
  ```json
  { "text": "Bệnh nhân Nguyễn Văn A, số CCCD 079198001234, khám tại BV Chợ Rẫy" }
  ```
* **Output:**
  ```json
  { "redacted_text": "Bệnh nhân <PERSON>, số CCCD <VIETNAM_ID>, khám tại BV Chợ Rẫy" }
  ```
* **Tài nguyên yêu cầu:** 1 vCPU, 800MB RAM.

### Dịch vụ 2: Vision / OCR Extractor Service (Port 8002)
* **Thư viện nền tảng:** `PaddleOCR` (Inference CPU qua `onnxruntime`).
* **Mục đích:** Đọc hình ảnh phiếu thu viện phí, giấy ra viện, phát hiện dấu mộc tròn.
* **API Endpoint:** `POST /api/v1/ocr/extract`
* **Input:** `multipart/form-data` (file ảnh JPG/PNG/PDF).
* **Output:**
  ```json
  {
    "document_type": "hospital_receipt",
    "has_official_stamp": true,
    "confidence": 0.94,
    "extracted_fields": {
      "hospital_name": "Bệnh viện Đa khoa Quốc tế Vinmec",
      "patient_name": "Trần Quốc Dũng",
      "grand_total": 4500000,
      "date": "2024-03-15"
    }
  }
  ```
* **Tài nguyên yêu cầu:** 2 vCPU, 1.8GB RAM.

### Dịch vụ 3: Medical Normalizer Service (Port 8003)
* **Thư viện nền tảng:** `FastEmbed` (Qdrant) + `RapidFuzz` + File cơ sở dữ liệu ICD-10 WHO (`icd10.parquet`).
* **Mục đích:** Ánh xạ chẩn đoán lâm sàng tự do của bác sĩ sang mã ICD-10 chuẩn để đối chiếu với quyền lợi bảo hiểm.
* **API Endpoint:** `POST /api/v1/medical/map-icd10`
* **Input:**
  ```json
  { "raw_diagnosis": "viêm phế quản phổi cấp" }
  ```
* **Output:**
  ```json
  {
    "matched_code": "J20.9",
    "standard_name_en": "Acute bronchitis, unspecified",
    "standard_name_vi": "Viêm phế quản cấp không đặc hiệu",
    "similarity_score": 0.96,
    "category": "RESPIRATORY"
  }
  ```
* **Tài nguyên yêu cầu:** 1 vCPU, 1GB RAM.

### Dịch vụ 4: Document Forensics Service (Port 8004)
* **Thư viện nền tảng:** `ImageHash` (Perceptual Hashing) + `OpenCV-Python-Headless` (Error Level Analysis - ELA).
* **Mục đích:**
  1. Tính mã băm `pHash` để phát hiện một hóa đơn viện phí bị nộp 2 lần trong 2 claim khác nhau (Double Claim Fraud).
  2. Phân tích ELA phát hiện chỉnh sửa số tiền bằng Photoshop/phần mềm đồ họa.
* **API Endpoint:** `POST /api/v1/forensics/analyze`
* **Input:** `multipart/form-data` (ảnh hóa đơn).
* **Output:**
  ```json
  {
    "phash": "a7b3c9d1e2f4",
    "is_duplicate": false,
    "tampering_detected": false,
    "ela_anomaly_score": 0.08,
    "verdict": "CLEAN"
  }
  ```
* **Tài nguyên yêu cầu:** 0.5 vCPU, 400MB RAM.

### Dịch vụ 5: Guardrails & Evals Judge Service (Port 8005)
* **Thư viện nền tảng:** `Guardrails AI` / `DeepEval`.
* **Mục đích:** Kiểm tra tính hợp lệ của báo cáo thẩm định trước khi trả về cho người dùng (kiểm tra toán học: số tiền duyệt + copay = tổng hóa đơn; kiểm tra điều khoản trích dẫn có tồn tại trong danh mục hợp đồng hay không).
* **Tài nguyên yêu cầu:** 1 vCPU, 800MB RAM.

---

## 3. File Điều phối Tổng thể `docker-compose.yml`

File cấu hình này sẵn sàng khởi chạy toàn bộ cụm dịch vụ chỉ với một lệnh duy nhất: `docker compose up -d`.

```yaml
version: '3.8'

services:
  # -------------------------------------------------------------
  # 1. Frontend Web Workstation (Next.js + Vercel AI SDK Direct UI)
  # -------------------------------------------------------------
  papaya-claims-web:
    build:
      context: ../frontend
      dockerfile: Dockerfile
    container_name: papaya-claims-web
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - claims-agent-core

  # -------------------------------------------------------------
  # 2. Agent Core Orchestrator (Backend API)
  # -------------------------------------------------------------
  claims-agent-core:
    build:
      context: ../backend
      dockerfile: Dockerfile
    container_name: claims-agent-core
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - PII_SERVICE_URL=http://pii-redactor:8001
      - OCR_SERVICE_URL=http://ocr-service:8002
      - MEDICAL_NORMALIZER_URL=http://medical-normalizer:8003
      - FORENSICS_SERVICE_URL=http://doc-forensics:8004
      - DATABASE_URL=postgresql://papaya:papaya_secret@postgres:5432/papaya_claims
    depends_on:
      - postgres
      - pii-redactor
      - medical-normalizer
      - doc-forensics

  # -------------------------------------------------------------
  # 3. AI Phụ trợ: PII Anonymizer (Presidio)
  # -------------------------------------------------------------
  pii-redactor:
    image: mcr.microsoft.com/presidio-analyzer:latest
    container_name: pii-redactor
    restart: unless-stopped
    ports:
      - "8001:3000"

  # -------------------------------------------------------------
  # 4. AI Phụ trợ: Medical Normalizer (FastEmbed + ICD-10)
  # -------------------------------------------------------------
  medical-normalizer:
    build:
      context: ../services/medical-normalizer
      dockerfile: Dockerfile
    container_name: medical-normalizer
    restart: unless-stopped
    ports:
      - "8003:8003"

  # -------------------------------------------------------------
  # 5. AI Phụ trợ: Document Forensics (Tamper & Duplicate Detection)
  # -------------------------------------------------------------
  doc-forensics:
    build:
      context: ../services/doc-forensics
      dockerfile: Dockerfile
    container_name: doc-forensics
    restart: unless-stopped
    ports:
      - "8004:8004"

  # -------------------------------------------------------------
  # 6. Database: PostgreSQL (Policies, Claims, Balances, Audit Log)
  # -------------------------------------------------------------
  postgres:
    image: postgres:16-alpine
    container_name: papaya-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=papaya
      - POSTGRES_PASSWORD=papaya_secret
      - POSTGRES_DB=papaya_claims
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 4. Đánh giá Mức độ Tiêu thụ Tài nguyên (Resource Footprint)

Toàn bộ cụm Docker trên được tối ưu hóa đặc biệt:
* **Tổng lượng RAM cần thiết:** ~3.8 GB.
* **Tổng CPU:** Chạy mượt mà trên 2–4 Cores CPU thông thường.
* **Khả năng tương thích:** Chạy hoàn hảo trên MacBook chip Apple Silicon (M1/M2/M3) cũng như các máy trạm Linux/Windows Intel/AMD mà **hoàn toàn không cần GPU rời**.
