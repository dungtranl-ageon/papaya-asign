import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CoreMessage } from 'ai';

export interface ChatMessageRecord {
  id: string;
  claimId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citationsJson: string;
  createdAt: Date;
}

export interface StoredCitation {
  clauseId: string;
  clauseTitle: string;
  clauseSnippet: string;
}

@Injectable()
export class ConversationMemoryService {
  private readonly logger = new Logger(ConversationMemoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Save a chat message to persistent database memory scoped to the Claim ID
   */
  async saveMessage(params: {
    claimId: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    citations?: StoredCitation[];
  }): Promise<ChatMessageRecord> {
    const { claimId, role, content, citations = [] } = params;
    try {
      const record = await this.prisma.chatMessage.create({
        data: {
          claimId,
          role,
          content,
          citationsJson: JSON.stringify(citations),
        },
      });
      return record as ChatMessageRecord;
    } catch (error) {
      this.logger.warn(
        `Failed to persist chat message in DB memory for claim ${claimId}: ${error instanceof Error ? error.message : error}`,
      );
      // Fallback in-memory representation
      return {
        id: `mem-${Date.now()}`,
        claimId,
        role,
        content,
        citationsJson: JSON.stringify(citations),
        createdAt: new Date(),
      };
    }
  }

  /**
   * Retrieve recent conversation history for a given Claim (Sliding Window Memory)
   */
  async getRecentMessages(claimId: string, limit = 20): Promise<ChatMessageRecord[]> {
    try {
      const messages = await this.prisma.chatMessage.findMany({
        where: { claimId },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });
      return messages as ChatMessageRecord[];
    } catch (error) {
      this.logger.warn(
        `Failed to fetch chat messages from DB memory for claim ${claimId}: ${error instanceof Error ? error.message : error}`,
      );
      return [];
    }
  }

  /**
   * Clear all conversation messages for a claim (Reset conversation)
   */
  async clearMessages(claimId: string): Promise<void> {
    try {
      await this.prisma.chatMessage.deleteMany({
        where: { claimId },
      });
      this.logger.log(`Cleared conversation memory for claim ${claimId}`);
    } catch (error) {
      this.logger.error(`Failed to clear chat memory for claim ${claimId}:`, error);
    }
  }

  /**
   * Format persistent conversation history into standard CoreMessage array for LLM
   * with Sliding Window memory management (up to maxHistoryTurns turns)
   */
  formatToLlmMessages(params: {
    systemPrompt: string;
    history: ChatMessageRecord[];
    currentQuery: string;
    maxHistoryTurns?: number;
  }): CoreMessage[] {
    const { systemPrompt, history, currentQuery, maxHistoryTurns = 10 } = params;

    const messages: CoreMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
    ];

    // Take the most recent N history turns (excluding system messages)
    const recentHistory = history
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .slice(-maxHistoryTurns);

    for (const msg of recentHistory) {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    }

    // Append the latest user query
    messages.push({
      role: 'user',
      content: currentQuery,
    });

    return messages;
  }
}
