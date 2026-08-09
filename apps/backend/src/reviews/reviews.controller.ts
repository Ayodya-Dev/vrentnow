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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Permission } from '../types/permission.enum';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListReviewsQueryDto } from './dto/list-reviews-query.dto';
import { ListVehicleReviewsQueryDto } from './dto/list-vehicle-reviews-query.dto';

@ApiTags('reviews')
@Controller({ path: 'reviews', version: '1' })
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List approved public reviews for a vehicle' })
  list(@Query() query: ListVehicleReviewsQueryDto) {
    return this.reviews.listForVehicle(query.vehicleId, query);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Review one of my completed bookings (awaits approval)' })
  create(
    @Body() dto: CreateReviewDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.reviews.create(dto, req.user.id);
  }

  @Get('booking/:bookingId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'My review for a booking (null if none yet)' })
  forBooking(
    @Param('bookingId') bookingId: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.reviews.forBooking(bookingId, req.user.id);
  }
}

@ApiTags('admin/reviews')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'admin/reviews', version: '1' })
export class AdminReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  @RequirePermissions(Permission.BOOKINGS_READ)
  @ApiOperation({ summary: 'List reviews for moderation' })
  list(@Query() query: ListReviewsQueryDto) {
    return this.reviews.listAdmin(query);
  }

  @Patch(':id/approve')
  @RequirePermissions(Permission.BOOKINGS_WRITE)
  @ApiOperation({ summary: 'Approve a review (makes it public)' })
  approve(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.reviews.setStatus(id, 'APPROVED', req.user.id);
  }

  @Patch(':id/reject')
  @RequirePermissions(Permission.BOOKINGS_WRITE)
  @ApiOperation({ summary: 'Reject a review (hides it from public)' })
  reject(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.reviews.setStatus(id, 'REJECTED', req.user.id);
  }
}
