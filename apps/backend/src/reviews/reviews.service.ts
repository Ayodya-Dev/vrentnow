import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma, Review, ReviewStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  PaginatedResult,
  buildPaginatedResult,
  getPaginationParams,
} from '../common/pagination';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListReviewsQueryDto } from './dto/list-reviews-query.dto';

export type ReviewPublic = Pick<
  Review,
  'id' | 'rating' | 'comment' | 'createdAt'
> & {
  user: { username: string };
};

export type VehicleReviewsPage = PaginatedResult<ReviewPublic> & {
  stats: { average: number | null; count: number };
};

const ADMIN_INCLUDE = {
  user: { select: { id: true, username: true, email: true } },
  vehicle: {
    select: { id: true, name: true, brand: true, model: true, slug: true },
  },
  booking: { select: { id: true, status: true } },
} as const;

export type ReviewAdminView = Prisma.ReviewGetPayload<{
  include: typeof ADMIN_INCLUDE;
}>;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateReviewDto, userId: string): Promise<Review> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { review: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new ForbiddenException('Not your booking');
    }
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException(
        'You can review a rental once it is completed',
      );
    }
    if (booking.review) {
      throw new BadRequestException('You already reviewed this rental');
    }

    return this.prisma.review.create({
      data: {
        userId,
        vehicleId: booking.vehicleId,
        bookingId: booking.id,
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        status: ReviewStatus.PENDING,
      },
    });
  }

  /** My review for a booking, or null — includes moderation status. */
  forBooking(bookingId: string, userId: string): Promise<Review | null> {
    return this.prisma.review.findFirst({
      where: { bookingId, userId },
    });
  }

  /** Public vehicle page — approved reviews only. */
  async listForVehicle(
    vehicleId: string,
    query: PaginationQueryDto,
  ): Promise<VehicleReviewsPage> {
    const { skip, take, page, limit } = getPaginationParams(query);
    const where: Prisma.ReviewWhereInput = {
      vehicleId,
      status: ReviewStatus.APPROVED,
    };

    const [rows, total, agg] = await Promise.all([
      this.prisma.review.findMany({
        where,
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.review.count({ where }),
      this.prisma.review.aggregate({ where, _avg: { rating: true } }),
    ]);

    const average = agg._avg.rating;
    return {
      ...buildPaginatedResult(rows, total, page, limit),
      stats: {
        average: average === null ? null : Math.round(average * 10) / 10,
        count: total,
      },
    };
  }

  async listAdmin(
    query: ListReviewsQueryDto,
  ): Promise<PaginatedResult<ReviewAdminView>> {
    const { skip, take, page, limit } = getPaginationParams(query);
    const where: Prisma.ReviewWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.vehicleId) where.vehicleId = query.vehicleId;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: ADMIN_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.review.count({ where }),
    ]);

    return buildPaginatedResult(items, total, page, limit);
  }

  async setStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    actorId: string,
  ): Promise<ReviewAdminView> {
    const existing = await this.prisma.review.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Review not found');

    const review = await this.prisma.review.update({
      where: { id },
      data: { status },
      include: ADMIN_INCLUDE,
    });

    await this.audit.record({
      actorId,
      action: status === 'APPROVED' ? 'reviews.approve' : 'reviews.reject',
      entity: 'Review',
      entityId: id,
      meta: { bookingId: review.bookingId, vehicleId: review.vehicleId },
    });

    return review;
  }
}
