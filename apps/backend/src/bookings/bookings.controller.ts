import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Permission } from '../types/permission.enum';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { BookingsService } from './bookings.service';
import { ReceiptService } from './receipt.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { UpdateHandoverDocsDto } from './dto/update-handover-docs.dto';

/** Customer bookings — any signed-in user; scoped to req.user.id. */
@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(
    private readonly bookings: BookingsService,
    private readonly receipts: ReceiptService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking for the signed-in customer' })
  @ApiResponse({ status: 201, description: 'Booking created (PENDING).' })
  create(
    @Body() dto: CreateBookingDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List my bookings' })
  listMine(
    @Query() query: ListBookingsQueryDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.listMine(req.user.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one of my bookings (agreement image only — no ID docs)',
  })
  findMine(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.findMineForCustomer(id, req.user.id);
  }

  @Get(':id/receipt')
  @ApiOperation({ summary: 'Download the PDF payment receipt (paid bookings)' })
  async receipt(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const booking = await this.bookings.findMine(id, req.user.id);
    const { buffer, filename } = await this.receipts.generate(booking);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel one of my pending/confirmed bookings' })
  cancelMine(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.cancelMine(id, req.user.id, body?.reason);
  }

  @Post(':id/pay/sandbox')
  @ApiOperation({
    summary: 'Complete sandbox payment (KokoPay / Payzy demo only)',
  })
  paySandbox(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.completeSandboxPayment(id, req.user.id);
  }

  @Post(':id/pay/payhere/initiate')
  @ApiOperation({
    summary: 'Start PayHere checkout — returns form fields + checkout URL',
  })
  initiatePayHere(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.initiatePayHere(id, req.user.id);
  }
}

@ApiTags('admin/bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'admin/bookings', version: '1' })
export class AdminBookingsController {
  constructor(
    private readonly bookings: BookingsService,
    private readonly receipts: ReceiptService,
  ) {}

  @Get()
  @RequirePermissions(Permission.BOOKINGS_READ)
  @ApiOperation({ summary: 'List all bookings' })
  list(@Query() query: ListBookingsQueryDto) {
    return this.bookings.list(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.BOOKINGS_READ)
  @ApiOperation({ summary: 'Get one booking by id (includes handover docs)' })
  findOne(@Param('id') id: string) {
    return this.bookings.findByIdForAdmin(id);
  }

  @Post(':id/payment/paid')
  @RequirePermissions(Permission.BOOKINGS_WRITE)
  @ApiOperation({
    summary: 'Mark the payment as paid (offline / cash payment)',
  })
  markPaid(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.markPaidByAdmin(id, req.user.id);
  }

  @Get(':id/receipt')
  @RequirePermissions(Permission.BOOKINGS_READ)
  @ApiOperation({ summary: 'Download the PDF payment receipt (admin)' })
  async receipt(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const booking = await this.bookings.findByIdForAdmin(id);
    const { buffer, filename } = await this.receipts.generate(booking);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    return new StreamableFile(buffer);
  }

  @Patch(':id/handover-docs')
  @RequirePermissions(Permission.BOOKINGS_WRITE)
  @ApiOperation({
    summary: 'Attach office-scanned NIC / licence / agreement photos',
  })
  updateHandoverDocs(
    @Param('id') id: string,
    @Body() dto: UpdateHandoverDocsDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.updateHandoverDocs(id, dto, req.user.id);
  }

  @Patch(':id/status')
  @RequirePermissions(Permission.BOOKINGS_WRITE)
  @ApiOperation({ summary: 'Advance or cancel a booking status' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.updateStatus(id, dto, req.user.id);
  }
}
