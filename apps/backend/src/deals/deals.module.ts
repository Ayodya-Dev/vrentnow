import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { FilesModule } from '../files/files.module';
import {
  AdminDealsController,
  DealsController,
} from './deals.controller';
import { DealsService } from './deals.service';
import { DealsRepository } from './deals.repository';

@Module({
  imports: [PrismaModule, AuditModule, FilesModule],
  controllers: [DealsController, AdminDealsController],
  providers: [DealsService, DealsRepository],
  exports: [DealsService],
})
export class DealsModule {}
