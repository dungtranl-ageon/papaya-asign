import { Module } from '@nestjs/common';
import { MastraService } from './mastra.service';
import { PolicyRagService } from './rag/policy-rag.service';
import { AssessorCopilotAgent } from './agents/assessor.agent';
import { ConversationMemoryService } from './memory/conversation-memory.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MastraService, PolicyRagService, AssessorCopilotAgent, ConversationMemoryService],
  exports: [MastraService, PolicyRagService, AssessorCopilotAgent, ConversationMemoryService],
})
export class MastraModule {}
