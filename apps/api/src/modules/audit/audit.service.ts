import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogDto {
  claimId: string;
  actorId: string;
  actorRole: string;
  actionType: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

export interface AuditLogItem {
  id: string;
  claimId: string;
  actorId: string;
  actorRole: string;
  actionType: string;
  oldValue: string | null;
  newValue: string | null;
  reason: string | null;
  timestamp: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logAction(dto: CreateAuditLogDto): Promise<void> {
    this.logger.log(
      `[AUDIT] Claim ${dto.claimId} | ${dto.actorRole} (${dto.actorId}) -> ${dto.actionType} | Reason: ${dto.reason || 'N/A'}`,
    );

    try {
      await this.prisma.auditLog.create({
        data: {
          claimId: dto.claimId,
          actorId: dto.actorId,
          actorRole: dto.actorRole,
          actionType: dto.actionType,
          oldValue: dto.oldValue || null,
          newValue: dto.newValue || null,
          reason: dto.reason || null,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to save audit log to DB for claim ${dto.claimId}:`, err);
    }
  }

  async getAuditLogs(claimId: string): Promise<AuditLogItem[]> {
    try {
      const logs = await this.prisma.auditLog.findMany({
        where: { claimId },
        orderBy: { timestamp: 'desc' },
      });
      return logs.map(l => ({
        id: l.id,
        claimId: l.claimId,
        actorId: l.actorId,
        actorRole: l.actorRole,
        actionType: l.actionType,
        oldValue: l.oldValue,
        newValue: l.newValue,
        reason: l.reason,
        timestamp: l.timestamp.toISOString(),
      }));
    } catch (err) {
      this.logger.error(`Failed to read audit logs for claim ${claimId}:`, err);
      return [];
    }
  }
}
