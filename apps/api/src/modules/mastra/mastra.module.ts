import { Module } from '@nestjs/common';
import { MastraService } from './mastra.service';
import { PolicyRagService } from './rag/policy-rag.service';
import { AssessorCopilotAgent } from './agents/assessor.agent';

@Module({
  providers: [MastraService, PolicyRagService, AssessorCopilotAgent],
  exports: [MastraService, PolicyRagService, AssessorCopilotAgent],
})
export class MastraModule {}
