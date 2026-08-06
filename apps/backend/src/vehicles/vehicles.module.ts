import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { CategoriesModule } from '../categories/categories.module';
import {
  AdminVehiclesController,
  VehiclesController,
} from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { VehiclesRepository } from './vehicles.repository';

@Module({
  imports: [PrismaModule, AuditModule, CategoriesModule],
  controllers: [VehiclesController, AdminVehiclesController],
  providers: [VehiclesService, VehiclesRepository],
  exports: [VehiclesService],
})
export class VehiclesModule {}
