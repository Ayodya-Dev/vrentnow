import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, DamageReport, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import {
  PaginatedResult,
  buildPaginatedResult,
  getPaginationParams,
} from '../common/pagination';
import { CreateDamageReportDto } from './dto/create-damage-report.dto';
import { ListDamageReportsQueryDto } from './dto/list-damage-reports-query.dto';

const REPORT_INCLUDE = {
  booking: {
    select: {
      id: true,
      pickupDate: true,
      returnDate: true,
      status: true,
      vehicle: { select: { id: true, name: true, brand: true, model: true } },
    },
  },
  user: { select: { id: true, username: true, email: true } },
} as const;

export type DamageReportView = Prisma.DamageReportGetPayload<{
  include: typeof REPORT_INCLUDE;
}>;

@Injectable()
export class DamageReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(
    dto: CreateDamageReportDto,
    userId: string,
  ): Promise<DamageReportView> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      select: { id: true, userId: true, status: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) {
      throw new ForbiddenException('Not your booking');
    }
    if (
      booking.status !== BookingStatus.HANDED_OVER &&
      booking.status !== BookingStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Damage can only be reported after the vehicle has been handed over',
      );
    }

    return this.prisma.damageReport.create({
      data: {
        bookingId: booking.id,
        userId,
        description: dto.description.trim(),
      },
      include: REPORT_INCLUDE,
    });
  }

  async listMine(
    userId: string,
    query: ListDamageReportsQueryDto,
  ): Promise<PaginatedResult<DamageReportView>> {
    const where: Prisma.DamageReportWhereInput = { userId };
    if (query.bookingId) where.bookingId = query.bookingId;
    return this.paginate(where, query);
  }

  async listAdmin(
    query: ListDamageReportsQueryDto,
  ): Promise<PaginatedResult<DamageReportView>> {
    const where: Prisma.DamageReportWhereInput = {};
    if (query.bookingId) where.bookingId = query.bookingId;
    if (query.resolved === true) where.resolvedAt = { not: null };
    else if (query.resolved === false) where.resolvedAt = null;
    return this.paginate(where, query);
  }

  async setResolved(
    id: string,
    resolved: boolean,
    actorId: string,
  ): Promise<DamageReportView> {
    const existing = await this.prisma.damageReport.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Damage report not found');

    const report = await this.prisma.damageReport.update({
      where: { id },
      data: { resolvedAt: resolved ? new Date() : null },
      include: REPORT_INCLUDE,
    });

    await this.audit.record({
      actorId,
      action: resolved
        ? 'damage_reports.resolve'
        : 'damage_reports.reopen',
      entity: 'DamageReport',
      entityId: id,
      meta: { bookingId: report.bookingId },
    });

    return report;
  }

  private async paginate(
    where: Prisma.DamageReportWhereInput,
    query: ListDamageReportsQueryDto,
  ): Promise<PaginatedResult<DamageReportView>> {
    const { skip, take, page, limit } = getPaginationParams(query);
    const [items, total] = await Promise.all([
      this.prisma.damageReport.findMany({
        where,
        include: REPORT_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.damageReport.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page, limit);
  }
}
