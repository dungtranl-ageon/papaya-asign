import { Injectable, Logger } from '@nestjs/common';
import { Claim, Policy, AssessmentReport } from '@papaya/shared';
import { executeClaimsAssessmentWorkflow } from './workflows/assessment.workflow';
import { AssessorCopilotAgent } from './agents/assessor.agent';
import { Observable, Subject } from 'rxjs';

export interface SseEventPayload {
  data: string;
}

@Injectable()
export class MastraService {
  private readonly logger = new Logger(MastraService.name);

  constructor(private readonly copilotAgent: AssessorCopilotAgent) {}

  /**
   * Run assessment workflow with real-time SSE event streaming
   */
  assessClaimStream(claim: Claim, policy: Policy): Observable<SseEventPayload> {
    const subject = new Subject<SseEventPayload>();

    executeClaimsAssessmentWorkflow({ claim, policy }, (stepEvent, data) => {
      this.logger.log(`Workflow step [${stepEvent}] on claim ${claim.claimId}`);
      subject.next({
        data: JSON.stringify({
          event: stepEvent,
          timestamp: new Date().toISOString(),
          payload: data,
        }),
      });
    })
      .then(report => {
        subject.next({
          data: JSON.stringify({
            event: 'WORKFLOW_FINISHED',
            timestamp: new Date().toISOString(),
            payload: report,
          }),
        });
        subject.complete();
      })
      .catch(err => {
        this.logger.error(`Assessment workflow error on claim ${claim.claimId}:`, err);
        subject.error(err);
      });

    return subject.asObservable();
  }

  async assessClaim(claim: Claim, policy: Policy): Promise<AssessmentReport> {
    return executeClaimsAssessmentWorkflow({ claim, policy });
  }

  /**
   * Conversational interaction with Assessor Copilot Agent
   */
  async chatWithCopilot(params: {
    query: string;
    claim: Claim;
    policy: Policy;
    assessmentReport?: AssessmentReport;
  }): Promise<string> {
    return this.copilotAgent.answerAssessorQuery(params);
  }

  /**
   * Streaming interaction with Assessor Copilot Agent
   */
  async streamCopilot(params: {
    query: string;
    claim: Claim;
    policy: Policy;
    assessmentReport?: AssessmentReport;
  }) {
    return this.copilotAgent.streamAssessorQuery(params);
  }
}
