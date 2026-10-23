import { Controller, Get, Post, Patch, Param, Sse, Body } from '@nestjs/common';
import { ClaimsService, CreateClaimDto, UpdateClaimStatusDto } from './claims.service';
import { Claim, AssessmentReport } from '@papaya/shared';
import { AuditLogItem } from '../audit/audit.service';
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

  @Post()
  async createClaim(@Body() body: CreateClaimDto): Promise<Claim> {
    return this.claimsService.createClaim(body);
  }

  @Patch(':id/status')
  async updateClaimStatus(
    @Param('id') id: string,
    @Body() body: UpdateClaimStatusDto,
  ): Promise<Claim> {
    return this.claimsService.updateClaimStatus(id, body);
  }

  @Get(':id/audit')
  async getClaimAudit(@Param('id') id: string): Promise<AuditLogItem[]> {
    return this.claimsService.getClaimAudit(id);
  }

  @Get(':id/assessment')
  async getLatestAssessment(@Param('id') id: string): Promise<AssessmentReport | null> {
    return this.claimsService.getLatestAssessment(id);
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
