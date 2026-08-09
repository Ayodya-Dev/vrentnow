import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import {
  AdminInquiriesController,
  InquiriesController,
} from './inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { InquiriesRepository } from './inquiries.repository';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [InquiriesController, AdminInquiriesController],
  providers: [InquiriesService, InquiriesRepository],
  exports: [InquiriesService],
})
export class InquiriesModule {}
