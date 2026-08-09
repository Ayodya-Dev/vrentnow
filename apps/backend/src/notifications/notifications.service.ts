import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Notification } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  PaginatedResult,
  buildPaginatedResult,
  getPaginationParams,
} from '../common/pagination';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fire-and-forget: a failed notification must never break the flow that
   * triggered it (payment, status change, ...).
   */
  async notify(userId: string, title: string, message: string): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: { userId, title, message },
      });
    } catch (err) {
      this.logger.warn(
        `Could not create notification for user ${userId}: ${String(err)}`,
      );
    }
  }

  async listMine(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<Notification>> {
    const { skip, take, page, limit } = getPaginationParams(query);
    const where = { userId };
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.notification.count({ where }),
    ]);
    return buildPaginatedResult(items, total, page, limit);
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    const existing = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { count: result.count };
  }
}
