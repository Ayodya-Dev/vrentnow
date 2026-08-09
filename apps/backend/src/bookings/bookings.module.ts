import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';
import { FilesModule } from '../files/files.module';
import { MailModule } from '../mail/mail.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  AdminBookingsController,
  BookingsController,
} from './bookings.controller';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from './bookings.repository';
import { ReceiptService } from './receipt.service';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    FilesModule,
    MailModule,
    VehiclesModule,
    NotificationsModule,
  ],
  controllers: [BookingsController, AdminBookingsController],
  providers: [BookingsService, BookingsRepository, ReceiptService],
  exports: [BookingsService],
})
export class BookingsModule {}
