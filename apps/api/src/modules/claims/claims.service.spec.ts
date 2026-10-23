import { describe, it, expect } from 'vitest';
import { ClaimsService } from './claims.service';
import { PoliciesService } from '../policies/policies.service';
import { MastraService } from '../mastra/mastra.service';
import { AuditService } from '../audit/audit.service';
import { ConfigService } from '@nestjs/config';

describe('ClaimsService Unit Tests', () => {
  it('instantiates ClaimsService and reads fixtures successfully', async () => {
    const configService = new ConfigService();
    const policiesService = new PoliciesService();
    const mastraService = new MastraService(configService);
    const auditService = new AuditService();

    const service = new ClaimsService(policiesService, mastraService, auditService);
    const claims = await service.listClaims();

    expect(claims.length).toBeGreaterThanOrEqual(1);
    expect(claims.some(c => c.claimId === 'CLM-2026-001')).toBe(true);
  });
});
