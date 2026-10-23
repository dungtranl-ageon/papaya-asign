import { Injectable, Logger } from '@nestjs/common';
import { Policy } from '@papaya/shared';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);
  private readonly policiesDir: string;

  constructor(private readonly prisma: PrismaService) {
    const candidates = [
      path.resolve(process.cwd(), 'data/policies'),
      path.resolve(process.cwd(), '../../data/policies'),
      path.resolve(__dirname, '../../../../data/policies'),
    ];
    this.policiesDir = candidates.find(c => fs.existsSync(c)) || candidates[0]!;
  }

  async listPolicies(): Promise<Policy[]> {
    try {
      const records = await this.prisma.policy.findMany();
      if (records.length > 0) {
        return records.map(r => this.mapDbToPolicy(r));
      }
    } catch (err) {
      this.logger.warn('Error reading policies from Prisma, falling back to JSON:', err);
    }

    // Fallback to disk
    const policies: Policy[] = [];
    try {
      if (fs.existsSync(this.policiesDir)) {
        const files = fs.readdirSync(this.policiesDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          const raw = fs.readFileSync(path.join(this.policiesDir, file), 'utf-8');
          policies.push(JSON.parse(raw) as Policy);
        }
      }
    } catch (err) {
      this.logger.error('Failed to read policy files from disk:', err);
    }
    return policies;
  }

  async findByNumber(policyNumber: string): Promise<Policy | null> {
    try {
      const record = await this.prisma.policy.findUnique({
        where: { policyNumber },
      });
      if (record) {
        return this.mapDbToPolicy(record);
      }
    } catch (err) {
      this.logger.warn(`Error querying policy ${policyNumber} from Prisma:`, err);
    }

    // Fallback to disk
    try {
      const filePath = path.join(this.policiesDir, `${policyNumber}.json`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as Policy;
      }
    } catch (err) {
      this.logger.error(`Error reading policy file for ${policyNumber}:`, err);
    }
    return null;
  }

  private mapDbToPolicy(r: {
    policyNumber: string;
    insuredName: string;
    nationalId: string;
    planName: string;
    status: string;
    effectiveDate: Date;
    expiryDate: Date;
    annualTotalLimit: number;
    annualUsedAmount: number;
    exclusionsJson: string;
    benefitsJson: string;
    waitingPeriodsJson: string;
  }): Policy {
    let waitingPeriods: Record<string, number> = {};
    let exclusions: string[] = [];
    let benefits = [];

    try {
      waitingPeriods = JSON.parse(r.waitingPeriodsJson || '{}');
    } catch {
      waitingPeriods = {};
    }
    try {
      exclusions = JSON.parse(r.exclusionsJson || '[]');
    } catch {
      exclusions = [];
    }
    try {
      benefits = JSON.parse(r.benefitsJson || '[]');
    } catch {
      benefits = [];
    }

    return {
      policyNumber: r.policyNumber,
      insuredName: r.insuredName,
      nationalId: r.nationalId,
      planName: r.planName,
      status: r.status as 'ACTIVE' | 'LAPSED' | 'TERMINATED',
      effectiveDate: r.effectiveDate.toISOString(),
      expiryDate: r.expiryDate.toISOString(),
      annualTotalLimit: r.annualTotalLimit,
      annualUsedAmount: r.annualUsedAmount,
      waitingPeriods,
      exclusions,
      benefits,
    };
  }
}
