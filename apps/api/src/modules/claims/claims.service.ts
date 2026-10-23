import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Claim, AssessmentReport } from '@papaya/shared';
import { PoliciesService } from '../policies/policies.service';
import { MastraService, SseEventPayload } from '../mastra/mastra.service';
import { AuditService, AuditLogItem } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { Observable } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

export interface UpdateClaimStatusDto {
  status: 'SUBMITTED' | 'ASSESSING' | 'PENDING_MORE_INFO' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN';
  totalApproved?: number;
  actorId?: string;
  actorRole?: string;
  reason?: string;
  overrideNotes?: string;
  rejectionReason?: string;
  missingDocuments?: string[];
}

export interface CreateClaimDto {
  claimId?: string;
  policyNumber: string;
  patientName: string;
  nationalId: string;
  hospitalName: string;
  admissionDate: string;
  dischargeDate: string;
  diagnosisIcd10: string;
  diagnosisDescription: string;
  totalRequested: number;
  items?: Array<{
    itemId?: string;
    description: string;
    category: 'INPATIENT' | 'OUTPATIENT' | 'SURGERY' | 'MEDICATION' | 'LABORATORY' | 'DENTAL';
    amountRequested: number;
  }>;
  documents?: Array<{
    docId?: string;
    docType:
      | 'HOSPITAL_DISCHARGE'
      | 'DETAILED_INVOICE'
      | 'VAT_INVOICE'
      | 'SURGICAL_REPORT'
      | 'LAB_RESULT'
      | 'PRESCRIPTION'
      | 'OTHER';
    fileName: string;
    uploadedAt?: string;
    status: 'VALID' | 'INVALID' | 'REQUIRES_REVIEW' | 'PENDING';
    notes?: string;
  }>;
}

@Injectable()
export class ClaimsService {
  private readonly logger = new Logger(ClaimsService.name);
  private readonly fixturesDir: string;

  constructor(
    private readonly prisma: PrismaService,
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
    try {
      const records = await this.prisma.claim.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (records.length > 0) {
        return records.map(r => this.mapDbToClaim(r));
      }
    } catch (err) {
      this.logger.warn('Error reading claims from Prisma, falling back to fixtures:', err);
    }

    // Fallback to disk fixtures
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
      this.logger.error('Failed to read claim fixtures from disk:', err);
    }
    return claims;
  }

  async getClaimById(claimId: string): Promise<Claim> {
    try {
      const record = await this.prisma.claim.findUnique({
        where: { claimId },
      });
      if (record) {
        return this.mapDbToClaim(record);
      }
    } catch (err) {
      this.logger.warn(`Error querying claim ${claimId} from Prisma:`, err);
    }

    // Fallback to disk fixtures
    const claims = await this.listClaims();
    const found = claims.find(c => c.claimId === claimId);
    if (!found) {
      throw new NotFoundException(`Claim ${claimId} not found`);
    }
    return found;
  }

  async createClaim(dto: CreateClaimDto): Promise<Claim> {
    const generatedId =
      dto.claimId || `CLM-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;

    const items = (dto.items || []).map((it, idx) => ({
      itemId: it.itemId || `ITM-${idx + 1}`,
      description: it.description,
      category: it.category,
      amountRequested: it.amountRequested,
    }));

    const documents = (dto.documents || []).map((doc, idx) => ({
      docId: doc.docId || `DOC-${idx + 1}`,
      docType: doc.docType,
      fileName: doc.fileName,
      uploadedAt: doc.uploadedAt || new Date().toISOString(),
      status: doc.status,
      notes: doc.notes || '',
    }));

    const created = await this.prisma.claim.create({
      data: {
        claimId: generatedId,
        policyNumber: dto.policyNumber,
        patientName: dto.patientName,
        nationalId: dto.nationalId,
        hospitalName: dto.hospitalName,
        admissionDate: new Date(dto.admissionDate),
        dischargeDate: new Date(dto.dischargeDate),
        diagnosisIcd10: dto.diagnosisIcd10,
        diagnosisDescription: dto.diagnosisDescription,
        status: 'SUBMITTED',
        totalRequested: dto.totalRequested,
        itemsJson: JSON.stringify(items),
        documentsJson: JSON.stringify(documents),
      },
    });

    await this.auditService.logAction({
      claimId: generatedId,
      actorId: dto.patientName,
      actorRole: 'CUSTOMER',
      actionType: 'CLAIM_SUBMISSION',
      newValue: JSON.stringify({
        totalRequested: dto.totalRequested,
        documentsCount: documents.length,
      }),
      reason: 'Khách hàng khởi tạo hồ sơ yêu cầu bồi thường trực tuyến thành công.',
    });

    return this.mapDbToClaim(created);
  }

  async updateClaimStatus(claimId: string, dto: UpdateClaimStatusDto): Promise<Claim> {
    const current = await this.getClaimById(claimId);

    const updateData: { status: string; totalApproved?: number } = {
      status: dto.status,
    };
    if (typeof dto.totalApproved === 'number') {
      updateData.totalApproved = dto.totalApproved;
    }

    const updated = await this.prisma.claim.update({
      where: { claimId },
      data: updateData,
    });

    await this.auditService.logAction({
      claimId,
      actorId: dto.actorId || 'ASSESSOR_PORTAL',
      actorRole: dto.actorRole || 'ASSESSOR',
      actionType: `UPDATE_STATUS_${dto.status}`,
      oldValue: JSON.stringify({ status: current.status }),
      newValue: JSON.stringify({
        status: dto.status,
        totalApproved: dto.totalApproved,
        notes: dto.overrideNotes || dto.reason,
      }),
      reason: dto.reason || dto.overrideNotes || `Trạng thái hồ sơ chuyển sang ${dto.status}`,
    });

    return this.mapDbToClaim(updated);
  }

  async getClaimAudit(claimId: string): Promise<AuditLogItem[]> {
    return this.auditService.getAuditLogs(claimId);
  }

  async assessClaim(claimId: string): Promise<AssessmentReport> {
    const claim = await this.getClaimById(claimId);
    const policy = await this.policiesService.findByNumber(claim.policyNumber);
    if (!policy) {
      throw new NotFoundException(`Associated policy ${claim.policyNumber} not found`);
    }

    const report = await this.mastraService.assessClaim(claim, policy);

    // Save assessment to Prisma DB
    try {
      await this.prisma.assessment.upsert({
        where: { assessmentId: report.assessmentId },
        update: {
          finalRecommendation: report.finalRecommendation,
          confidenceScore: report.confidenceScore,
          totalRequested: report.totalRequested,
          totalPayable: report.totalPayable,
          totalDeductions: report.totalDeductions,
          executiveSummary: report.executiveSummary,
          stepsJson: JSON.stringify(report.steps),
          breakdownJson: JSON.stringify(report.breakdown),
          missingDocumentsJson: JSON.stringify(report.missingDocuments || []),
        },
        create: {
          assessmentId: report.assessmentId,
          claimId: claim.claimId,
          finalRecommendation: report.finalRecommendation,
          confidenceScore: report.confidenceScore,
          totalRequested: report.totalRequested,
          totalPayable: report.totalPayable,
          totalDeductions: report.totalDeductions,
          executiveSummary: report.executiveSummary,
          stepsJson: JSON.stringify(report.steps),
          breakdownJson: JSON.stringify(report.breakdown),
          missingDocumentsJson: JSON.stringify(report.missingDocuments || []),
        },
      });

      // Update claim status to ASSESSING or recommendation
      await this.prisma.claim.update({
        where: { claimId },
        data: {
          status: 'ASSESSING',
          totalApproved: report.finalRecommendation === 'APPROVE' ? report.totalPayable : null,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to save assessment to Prisma for claim ${claimId}:`, err);
    }

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

  async getLatestAssessment(claimId: string): Promise<AssessmentReport | null> {
    try {
      const record = await this.prisma.assessment.findFirst({
        where: { claimId },
        orderBy: { assessedAt: 'desc' },
      });
      if (record) {
        return {
          assessmentId: record.assessmentId,
          claimId: record.claimId,
          policyNumber: '',
          finalRecommendation: record.finalRecommendation as
            'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO' | 'MANUAL_ESCALATION',
          confidenceScore: record.confidenceScore,
          totalRequested: record.totalRequested,
          totalPayable: record.totalPayable,
          totalDeductions: record.totalDeductions,
          executiveSummary: record.executiveSummary,
          steps: JSON.parse(record.stepsJson || '[]'),
          breakdown: JSON.parse(record.breakdownJson || '[]'),
          missingDocuments: JSON.parse(record.missingDocumentsJson || '[]'),
          policyExclusionsMatched: [],
          assessedAt: record.assessedAt.toISOString(),
        };
      }
    } catch (err) {
      this.logger.warn(`Failed to fetch latest assessment for ${claimId}:`, err);
    }
    return null;
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

  private mapDbToClaim(r: {
    claimId: string;
    policyNumber: string;
    patientName: string;
    nationalId: string;
    hospitalName: string;
    admissionDate: Date;
    dischargeDate: Date;
    diagnosisIcd10: string;
    diagnosisDescription: string;
    status: string;
    totalRequested: number;
    totalApproved: number | null;
    itemsJson: string;
    documentsJson: string;
    createdAt: Date;
    updatedAt: Date;
  }): Claim {
    let items = [];
    let documents = [];

    try {
      items = JSON.parse(r.itemsJson || '[]');
    } catch {
      items = [];
    }
    try {
      documents = JSON.parse(r.documentsJson || '[]');
    } catch {
      documents = [];
    }

    return {
      claimId: r.claimId,
      policyNumber: r.policyNumber,
      patientName: r.patientName,
      nationalId: r.nationalId,
      hospitalName: r.hospitalName,
      admissionDate: r.admissionDate.toISOString(),
      dischargeDate: r.dischargeDate.toISOString(),
      diagnosisIcd10: r.diagnosisIcd10,
      diagnosisDescription: r.diagnosisDescription,
      status: r.status as
        'SUBMITTED' | 'ASSESSING' | 'PENDING_MORE_INFO' | 'APPROVED' | 'REJECTED' | 'OVERRIDDEN',
      totalRequested: r.totalRequested,
      totalApproved: r.totalApproved ?? undefined,
      items,
      documents,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}
