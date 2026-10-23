import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClaimsModule } from './modules/claims/claims.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { MastraModule } from './modules/mastra/mastra.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    ClaimsModule,
    PoliciesModule,
    MastraModule,
    AuditModule,
  ],
})
export class AppModule {}
