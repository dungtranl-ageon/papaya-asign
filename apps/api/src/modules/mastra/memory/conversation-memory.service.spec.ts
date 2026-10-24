import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConversationMemoryService } from './conversation-memory.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ConversationMemoryService Unit Tests', () => {
  let service: ConversationMemoryService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      chatMessage: {
        create: vi.fn(),
        findMany: vi.fn(),
        deleteMany: vi.fn(),
      },
    };
    service = new ConversationMemoryService(mockPrisma as unknown as PrismaService);
  });

  it('persists a user message in database memory', async () => {
    const mockRecord = {
      id: 'msg-1',
      claimId: 'CLM-001',
      role: 'user',
      content: 'Tại sao từ chối khoản thuốc?',
      citationsJson: '[]',
      createdAt: new Date(),
    };
    mockPrisma.chatMessage.create.mockResolvedValue(mockRecord);

    const result = await service.saveMessage({
      claimId: 'CLM-001',
      role: 'user',
      content: 'Tại sao từ chối khoản thuốc?',
    });

    expect(result.id).toBe('msg-1');
    expect(mockPrisma.chatMessage.create).toHaveBeenCalledWith({
      data: {
        claimId: 'CLM-001',
        role: 'user',
        content: 'Tại sao từ chối khoản thuốc?',
        citationsJson: '[]',
      },
    });
  });

  it('retrieves recent conversation messages in chronological order', async () => {
    const mockMessages = [
      { id: '1', role: 'user', content: 'Câu hỏi 1' },
      { id: '2', role: 'assistant', content: 'Trả lời 1' },
    ];
    mockPrisma.chatMessage.findMany.mockResolvedValue(mockMessages);

    const history = await service.getRecentMessages('CLM-001', 10);
    expect(history.length).toBe(2);
    expect(mockPrisma.chatMessage.findMany).toHaveBeenCalledWith({
      where: { claimId: 'CLM-001' },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });
  });

  it('formats multi-turn history into CoreMessage structure for LLM with sliding window', () => {
    const history = [
      {
        id: '1',
        claimId: 'C1',
        role: 'user' as const,
        content: 'Q1',
        citationsJson: '[]',
        createdAt: new Date(),
      },
      {
        id: '2',
        claimId: 'C1',
        role: 'assistant' as const,
        content: 'A1',
        citationsJson: '[]',
        createdAt: new Date(),
      },
      {
        id: '3',
        claimId: 'C1',
        role: 'user' as const,
        content: 'Q2',
        citationsJson: '[]',
        createdAt: new Date(),
      },
      {
        id: '4',
        claimId: 'C1',
        role: 'assistant' as const,
        content: 'A2',
        citationsJson: '[]',
        createdAt: new Date(),
      },
    ];

    const llmMessages = service.formatToLlmMessages({
      systemPrompt: 'System instructions',
      history,
      currentQuery: 'Q3',
      maxHistoryTurns: 2, // only keep last 2 turns
    });

    expect(llmMessages.length).toBe(4); // system + Q2 + A2 + Q3
    expect(llmMessages[0]).toEqual({ role: 'system', content: 'System instructions' });
    expect(llmMessages[1]).toEqual({ role: 'user', content: 'Q2' });
    expect(llmMessages[2]).toEqual({ role: 'assistant', content: 'A2' });
    expect(llmMessages[3]).toEqual({ role: 'user', content: 'Q3' });
  });

  it('clears conversation memory when requested', async () => {
    mockPrisma.chatMessage.deleteMany.mockResolvedValue({ count: 5 });

    await service.clearMessages('CLM-001');
    expect(mockPrisma.chatMessage.deleteMany).toHaveBeenCalledWith({
      where: { claimId: 'CLM-001' },
    });
  });
});
