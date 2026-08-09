import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import {
  AdminDamageReportsController,
  DamageReportsController,
} from './damage-reports.controller';
import { DamageReportsService } from './damage-reports.service';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [DamageReportsController, AdminDamageReportsController],
  providers: [DamageReportsService],
})
export class DamageReportsModule {}
