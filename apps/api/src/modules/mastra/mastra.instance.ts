import { Mastra } from '@mastra/core';
import { assessorCopilotAgent } from './agents/assessor.agent';
import { claimsAssessmentWorkflow } from './workflows/assessment.workflow';

/**
 * =============================================================================
 * PAPAYA MASTRA CORE ENGINE INSTANCE (SINGLETON REGISTRY)
 * =============================================================================
 * Explicit central declaration of the Mastra Engine.
 * Registers all Agents and Workflows to ensure complete transparency,
 * traceability, and reusability across NestJS services, unit tests, and CLI tools.
 */
export const mastra = new Mastra({
  agents: {
    assessorCopilotAgent,
  },
  workflows: {
    claimsAssessmentWorkflow,
  },
});

export type MastraInstance = typeof mastra;
