import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Claim, AssessmentReport } from '@papaya/shared';
import { PoliciesService } from '../policies/policies.service';
import { MastraService, SseEventPayload } from '../mastra/mastra.service';
import { AuditService } from '../audit/audit.service';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);
  private readonly fixturesDir: string;

  constructor(
    private readonly policiesService: PoliciesService,
    private readonly mastraService: MastraService,
    private readonly auditService: AuditService,
  ) {
    const candidates = [
      path.resolve(process.cwd(), 'data/fixtures'),
      path.resolve(process.cwd(), '../../data/fixtures'),
      path.resolve(__dirname, '../../../../data/fixtures'),
    ];
    this.fixturesDir = candidates.find(c => fs.existsSync(c)) || candidates[0]!;
  }

  async listClaims(): Promise<Claim[]> {
    const claims: Claim[] = [];
    try {
      if (fs.existsSync(this.fixturesDir)) {
        const files = fs.readdirSync(this.fixturesDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          const raw = fs.readFileSync(path.join(this.fixturesDir, file), 'utf-8');
          claims.push(JSON.parse(raw) as Claim);
        }
      }
    } catch (err) {
      this.logger.error('Failed to read claim fixtures:', err);
    }
    return claims;
  }

  async getClaimById(claimId: string): Promise<Claim> {
    const claims = await this.listClaims();
    const found = claims.find(c => c.claimId === claimId);
    if (!found) {
      throw new NotFoundException(`Claim ${claimId} not found`);
    }
    return found;
  }

  async assessClaim(claimId: string): Promise<AssessmentReport> {
    const claim = await this.getClaimById(claimId);
    const policy = await this.policiesService.findByNumber(claim.policyNumber);
    if (!policy) {
      throw new NotFoundException(`Associated policy ${claim.policyNumber} not found`);
    }

    const report = await this.mastraService.assessClaim(claim, policy);
    await this.auditService.logAction({
      claimId,
      actorId: 'MASTRA_WORKFLOW_ENGINE',
      actorRole: 'AI_AGENT',
      actionType: 'ASSESSMENT_RUN',
      newValue: JSON.stringify(report),
      reason: `Automated 4-step assessment completed with decision: ${report.finalRecommendation}`,
    });

    return report;
  }

  assessClaimStream(claimId: string): Observable<SseEventPayload> {
    const subject = new Observable<SseEventPayload>(subscriber => {
      this.getClaimById(claimId)
        .then(async claim => {
          const policy = await this.policiesService.findByNumber(claim.policyNumber);
          if (!policy) {
            subscriber.error(new NotFoundException(`Policy ${claim.policyNumber} not found`));
            return;
          }
          this.mastraService.assessClaimStream(claim, policy).subscribe({
            next: event => subscriber.next(event),
            error: err => subscriber.error(err),
            complete: () => subscriber.complete(),
          });
        })
        .catch(err => subscriber.error(err));
    });

    return subject;
  }

  /**
   * Interact with Assessor Copilot Agent for a specific claim
   */
  async chatWithAgent(claimId: string, query: string): Promise<string> {
    const claim = await this.getClaimById(claimId);
    const policy = await this.policiesService.findByNumber(claim.policyNumber);
    if (!policy) {
      throw new NotFoundException(`Policy ${claim.policyNumber} not found`);
    }

    return this.mastraService.chatWithCopilot({
      query,
      claim,
      policy,
    });
  }
}
