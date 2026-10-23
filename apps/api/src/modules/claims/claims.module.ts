import { Module } from '@nestjs/common';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { PoliciesModule } from '../policies/policies.module';
import { MastraModule } from '../mastra/mastra.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PoliciesModule, MastraModule, AuditModule],
  controllers: [ClaimsController],
  providers: [ClaimsService],
  exports: [ClaimsService],
})
export class ClaimsModule {}
