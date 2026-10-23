-- ==============================================================================
-- Papaya Claims Copilot - Useful SQL Analytic & Audit Queries
-- ==============================================================================

-- 1. Query all pending claims with insured and policy limits
SELECT 
    c.claim_id,
    c.patient_name,
    c.status,
    c.total_requested,
    p.plan_name,
    (p.annual_total_limit - p.annual_used_amount) AS remaining_annual_limit
FROM claims c
JOIN policies p ON c.policy_number = p.policy_number
WHERE c.status IN ('SUBMITTED', 'PENDING_MORE_INFO')
ORDER BY c.created_at ASC;

-- 2. Audit Assessor Overrides vs AI Recommendations
SELECT 
    a.claim_id,
    a.final_recommendation AS ai_recommendation,
    a.confidence_score AS ai_confidence,
    al.actor_id AS assessor_id,
    al.new_value AS override_decision,
    al.reason AS override_reason,
    al.timestamp
FROM assessments a
JOIN audit_logs al ON a.claim_id = al.claim_id
WHERE al.action_type = 'OVERRIDE_DECISION'
ORDER BY al.timestamp DESC;

-- 3. Calculate approval rate and total payout metrics
SELECT 
    final_recommendation,
    COUNT(*) AS total_count,
    ROUND(AVG(confidence_score)::numeric, 2) AS avg_confidence,
    SUM(total_payable) AS total_paid_out
FROM assessments
GROUP BY final_recommendation;
