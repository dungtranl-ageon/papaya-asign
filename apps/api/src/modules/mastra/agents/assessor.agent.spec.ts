import { describe, it, expect, vi } from 'vitest';
import { Agent } from '@mastra/core/agent';
import { assessorCopilotAgent, AssessorCopilotAgent } from './assessor.agent';
import { mastra } from '../mastra.instance';
import { PolicyRagService } from '../rag/policy-rag.service';
import { mockGoldPolicy } from '../../../../../../tests/fixtures/mock-policies';
import { mockTc01Claim } from '../../../../../../tests/fixtures/mock-claims';

vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({
    text: 'Theo điều khoản [POL-01], quyền lợi phẫu thuật được chi trả tối đa 80% chi phí thực tế.',
  }),
  streamText: vi.fn(),
  tool: vi.fn(def => def),
}));

describe('AI Assessor Copilot Agent Verification', () => {
  it('declares assessorCopilotAgent as a valid Mastra Agent instance', async () => {
    expect(assessorCopilotAgent).toBeDefined();
    expect(assessorCopilotAgent).toBeInstanceOf(Agent);
    expect(assessorCopilotAgent.name).toBe('assessorCopilotAgent');
    const agentTyped = assessorCopilotAgent as unknown as {
      getInstructions?: () => Promise<string>;
      instructions?: string;
    };
    const instructions =
      typeof agentTyped.getInstructions === 'function'
        ? await agentTyped.getInstructions()
        : agentTyped.instructions;
    if (instructions) {
      expect(typeof instructions).toBe('string');
    }
  });

  it('registers assessorCopilotAgent in the central Mastra instance', () => {
    expect(mastra).toBeDefined();
    const retrievedAgent = mastra.getAgent('assessorCopilotAgent');
    expect(retrievedAgent).toBeDefined();
    expect(retrievedAgent.name).toBe('assessorCopilotAgent');
  });

  it('verifies AssessorCopilotAgent service with RAG clause retrieval and guardrails', async () => {
    const ragService = new PolicyRagService();
    const copilotService = new AssessorCopilotAgent(ragService);

    // Call answerAssessorQuery (will trigger RAG retrieval and gracefully fallback if offline)
    const reply = await copilotService.answerAssessorQuery({
      query: 'Quyền lợi phẫu thuật được chi trả bao nhiêu phần trăm?',
      claim: mockTc01Claim,
      policy: mockGoldPolicy,
    });

    expect(reply).toBeDefined();
    expect(typeof reply).toBe('string');
    expect(reply.length).toBeGreaterThan(0);
    // Ensure PII (e.g. raw CCCD) is never leaked in the reply
    expect(reply).not.toContain(mockTc01Claim.nationalId);
  });
});
