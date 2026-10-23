-- ==============================================================================
-- Papaya Claims Copilot - Relational DDL (PostgreSQL & SQLite Compatible)
-- ==============================================================================

-- 1. Policies Table
CREATE TABLE IF NOT EXISTS policies (
    id VARCHAR(36) PRIMARY KEY,
    policy_number VARCHAR(64) UNIQUE NOT NULL,
    insured_name VARCHAR(255) NOT NULL,
    national_id VARCHAR(32) NOT NULL,
    plan_name VARCHAR(128) NOT NULL,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    effective_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    annual_total_limit DOUBLE PRECISION NOT NULL,
    annual_used_amount DOUBLE PRECISION DEFAULT 0.0,
    exclusions_json TEXT DEFAULT '[]',
    benefits_json TEXT DEFAULT '[]',
    waiting_periods_json TEXT DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Claims Table
CREATE TABLE IF NOT EXISTS claims (
    id VARCHAR(36) PRIMARY KEY,
    claim_id VARCHAR(64) UNIQUE NOT NULL,
    policy_number VARCHAR(64) NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    national_id VARCHAR(32) NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    admission_date TIMESTAMP NOT NULL,
    discharge_date TIMESTAMP NOT NULL,
    diagnosis_icd10 VARCHAR(32) NOT NULL,
    diagnosis_description TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'SUBMITTED',
    total_requested DOUBLE PRECISION NOT NULL,
    total_approved DOUBLE PRECISION,
    items_json TEXT DEFAULT '[]',
    documents_json TEXT DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (policy_number) REFERENCES policies(policy_number)
);

-- 3. Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(36) PRIMARY KEY,
    assessment_id VARCHAR(64) UNIQUE NOT NULL,
    claim_id VARCHAR(64) NOT NULL,
    final_recommendation VARCHAR(32) NOT NULL,
    confidence_score DOUBLE PRECISION NOT NULL,
    total_requested DOUBLE PRECISION NOT NULL,
    total_payable DOUBLE PRECISION NOT NULL,
    total_deductions DOUBLE PRECISION NOT NULL,
    executive_summary TEXT NOT NULL,
    steps_json TEXT NOT NULL,
    breakdown_json TEXT NOT NULL,
    missing_documents_json TEXT DEFAULT '[]',
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id)
);

-- 4. Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    claim_id VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action_type VARCHAR(64) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_policy ON claims(policy_number);
CREATE INDEX IF NOT EXISTS idx_claims_diagnosis ON claims(diagnosis_icd10);
CREATE INDEX IF NOT EXISTS idx_claims_national_id ON claims(national_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_status ON claims(policy_number, status);
CREATE INDEX IF NOT EXISTS idx_assessments_claim ON assessments(claim_id);
CREATE INDEX IF NOT EXISTS idx_audit_claim_time ON audit_logs(claim_id, timestamp);
