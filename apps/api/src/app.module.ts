import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ClaimsModule } from './modules/claims/claims.module';
import { PoliciesModule } from './modules/policies/policies.module';
import { MastraModule } from './modules/mastra/mastra.module';
import { AuditModule } from './modules/audit/audit.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    PrismaModule,
    ClaimsModule,
    PoliciesModule,
    MastraModule,
    AuditModule,
    StorageModule,
  ],
})
export class AppModule {}
