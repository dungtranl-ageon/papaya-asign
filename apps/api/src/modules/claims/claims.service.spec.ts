import { describe, it, expect } from 'vitest';
import { ClaimsService } from './claims.service';
import { PoliciesService } from '../policies/policies.service';
import { MastraService } from '../mastra/mastra.service';
import { AuditService } from '../audit/audit.service';

import { PolicyRagService } from '../mastra/rag/policy-rag.service';
import { AssessorCopilotAgent } from '../mastra/agents/assessor.agent';

describe('ClaimsService Unit Tests', () => {
  it('instantiates ClaimsService and reads fixtures successfully', async () => {
    const policiesService = new PoliciesService();
    const ragService = new PolicyRagService();
    const copilotAgent = new AssessorCopilotAgent(ragService);
    const mastraService = new MastraService(copilotAgent);
    const auditService = new AuditService();

    const service = new ClaimsService(policiesService, mastraService, auditService);
    const claims = await service.listClaims();

    expect(claims.length).toBeGreaterThanOrEqual(1);
    expect(claims.some(c => c.claimId === 'CLM-2026-001')).toBe(true);
  });
});
