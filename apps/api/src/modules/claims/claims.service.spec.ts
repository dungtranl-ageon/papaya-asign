import { describe, it, expect } from 'vitest';
import { ClaimsService } from './claims.service';
import { PoliciesService } from '../policies/policies.service';
import { MastraService } from '../mastra/mastra.service';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { PolicyRagService } from '../mastra/rag/policy-rag.service';
import { AssessorCopilotAgent } from '../mastra/agents/assessor.agent';

describe('ClaimsService Unit Tests', () => {
  it('instantiates ClaimsService and reads fixtures successfully', async () => {
    const mockPrisma = {
      claim: {
        findMany: async () => [],
        findUnique: async () => null,
      },
      policy: {
        findMany: async () => [],
        findUnique: async () => null,
      },
      auditLog: {
        create: async () => ({}),
        findMany: async () => [],
      },
      assessment: {
        findFirst: async () => null,
        upsert: async () => ({}),
      },
    } as unknown as PrismaService;

    const policiesService = new PoliciesService(mockPrisma);
    const ragService = new PolicyRagService();
    const copilotAgent = new AssessorCopilotAgent(ragService);
    const mastraService = new MastraService(copilotAgent);
    const auditService = new AuditService(mockPrisma);

    const memoryService = {
      saveMessage: async () => ({}),
      getRecentMessages: async () => [],
      clearMessages: async () => {},
      formatToLlmMessages: () => [],
    } as any;

    const service = new ClaimsService(
      mockPrisma,
      policiesService,
      mastraService,
      auditService,
      memoryService,
    );
    const claims = await service.listClaims();

    expect(claims.length).toBeGreaterThanOrEqual(1);
    expect(claims.some(c => c.claimId === 'CLM-2026-001')).toBe(true);
  });
});
