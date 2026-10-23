import { Injectable, Logger } from '@nestjs/common';

export interface CreateAuditLogDto {
  claimId: string;
  actorId: string;
  actorRole: string;
  actionType: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  async logAction(dto: CreateAuditLogDto): Promise<void> {
    this.logger.log(
      `[AUDIT] Claim ${dto.claimId} | ${dto.actorRole} (${dto.actorId}) -> ${dto.actionType} | Reason: ${dto.reason || 'N/A'}`,
    );
  }
}
