import { Injectable, NotFoundException } from '@nestjs/common';
import { Inquiry, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import {
  PaginatedResult,
  buildPaginatedResult,
  getPaginationParams,
} from '../common/pagination';
import { InquiriesRepository } from './inquiries.repository';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { ListInquiriesQueryDto } from './dto/list-inquiries-query.dto';

@Injectable()
export class InquiriesService {
  constructor(
    private readonly repo: InquiriesRepository,
    private readonly audit: AuditService,
  ) {}

  /** Public contact-form submission — no auth, no audit actor. */
  create(dto: CreateInquiryDto): Promise<Inquiry> {
    return this.repo.create({
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone?.trim() || null,
      subject: dto.subject?.trim() || null,
      message: dto.message.trim(),
    });
  }

  async list(query: ListInquiriesQueryDto): Promise<PaginatedResult<Inquiry>> {
    const { skip, take, page, limit } = getPaginationParams(query);

    const where: Prisma.InquiryWhereInput = { deletedAt: null };
    if (query.isRead !== undefined) where.isRead = query.isRead;
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { subject: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.repo.findMany(where, { createdAt: 'desc' }, skip, take),
      this.repo.count(where),
    ]);

    return buildPaginatedResult(items, total, page, limit);
  }

  async findById(id: string): Promise<Inquiry> {
    const inquiry = await this.repo.findById(id);
    if (!inquiry) throw new NotFoundException('Inquiry not found');
    return inquiry;
  }

  /** Unread inquiries count — drives the admin nav badge. */
  async unreadCount(): Promise<{ count: number }> {
    const count = await this.repo.count({ deletedAt: null, isRead: false });
    return { count };
  }

  async setRead(id: string, isRead: boolean, actorId: string): Promise<Inquiry> {
    await this.findById(id);
    const inquiry = await this.repo.update(id, { isRead });

    await this.audit.record({
      actorId,
      action: isRead ? 'inquiries.read' : 'inquiries.unread',
      entity: 'Inquiry',
      entityId: inquiry.id,
      meta: { email: inquiry.email },
    });

    return inquiry;
  }

  async remove(id: string, actorId: string): Promise<void> {
    const inquiry = await this.findById(id);
    await this.repo.softDelete(id);

    await this.audit.record({
      actorId,
      action: 'inquiries.delete',
      entity: 'Inquiry',
      entityId: inquiry.id,
      meta: { email: inquiry.email, subject: inquiry.subject },
    });
  }
}
