import { Injectable, Logger } from '@nestjs/common';
import { Policy } from '@papaya/shared';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PoliciesService {
  private readonly logger = new Logger(PoliciesService.name);
  private readonly policiesDir = path.resolve(process.cwd(), '../../data/policies');

  async findByNumber(policyNumber: string): Promise<Policy | null> {
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
}
