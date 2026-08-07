import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
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
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

/** Customer bookings — any signed-in user; scoped to req.user.id. */
@ApiTags('bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'bookings', version: '1' })
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

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
  @ApiOperation({ summary: 'Get one of my bookings' })
  findMine(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.findMine(id, req.user.id);
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
    summary: 'Complete sandbox payment (PayHere / KokoPay / Payzy demo)',
  })
  paySandbox(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.bookings.completeSandboxPayment(id, req.user.id);
  }
}

@ApiTags('admin/bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'admin/bookings', version: '1' })
export class AdminBookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  @RequirePermissions(Permission.BOOKINGS_READ)
  @ApiOperation({ summary: 'List all bookings' })
  list(@Query() query: ListBookingsQueryDto) {
    return this.bookings.list(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.BOOKINGS_READ)
  @ApiOperation({ summary: 'Get one booking by id' })
  findOne(@Param('id') id: string) {
    return this.bookings.findById(id);
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
