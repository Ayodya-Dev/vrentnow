import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import {
  AdminBookingsController,
  BookingsController,
} from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from './bookings.repository';

@Module({
  imports: [PrismaModule, AuditModule, VehiclesModule],
  controllers: [BookingsController, AdminBookingsController],
  providers: [BookingsService, BookingsRepository],
  exports: [BookingsService],
})
export class BookingsModule {}
