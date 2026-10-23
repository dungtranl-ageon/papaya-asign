import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PoliciesService } from './policies.service';
import { Policy } from '@papaya/shared';

@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  async listPolicies(): Promise<Policy[]> {
    return this.policiesService.listPolicies();
  }

  @Get(':policyNumber')
  async getPolicy(@Param('policyNumber') policyNumber: string): Promise<Policy> {
    const policy = await this.policiesService.findByNumber(policyNumber);
    if (!policy) {
      throw new NotFoundException(`Policy ${policyNumber} not found`);
    }
    return policy;
  }
}
