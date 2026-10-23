import { Controller, Get, Post, Param, Sse, Body } from '@nestjs/common';
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

  @Post(':id/chat')
  async chatWithAgent(
    @Param('id') id: string,
    @Body()
    body: {
      message?: string;
      query?: string;
      messages?: Array<{ content: string; role: string }>;
    },
  ): Promise<{ reply: string }> {
    const query =
      body.message ||
      body.query ||
      (body.messages && body.messages[body.messages.length - 1]?.content) ||
      '';
    const reply = await this.claimsService.chatWithAgent(id, query);
    return { reply };
  }
}
