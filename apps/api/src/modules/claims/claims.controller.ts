import { Controller, Get, Post, Param, Sse } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { Claim, AssessmentReport } from '@papaya/shared';
import { Observable } from 'rxjs';
import { SseEventPayload } from '../mastra/mastra.service';

@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Get()
  async listClaims(): Promise<Claim[]> {
    return this.claimsService.listClaims();
  }

  @Get(':id')
  async getClaim(@Param('id') id: string): Promise<Claim> {
    return this.claimsService.getClaimById(id);
  }

  @Post(':id/assess')
  async assessClaim(@Param('id') id: string): Promise<AssessmentReport> {
    return this.claimsService.assessClaim(id);
  }

  @Sse(':id/assess/stream')
  assessClaimStream(@Param('id') id: string): Observable<SseEventPayload> {
    return this.claimsService.assessClaimStream(id);
  }
}
