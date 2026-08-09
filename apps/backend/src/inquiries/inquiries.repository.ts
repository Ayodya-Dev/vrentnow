import { Injectable } from '@nestjs/common';
import { Inquiry, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InquiriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.InquiryUncheckedCreateInput): Promise<Inquiry> {
    return this.prisma.inquiry.create({ data });
  }

  update(id: string, data: Prisma.InquiryUncheckedUpdateInput): Promise<Inquiry> {
    return this.prisma.inquiry.update({ where: { id }, data });
  }

  findById(id: string): Promise<Inquiry | null> {
    return this.prisma.inquiry.findFirst({ where: { id, deletedAt: null } });
  }

  findMany(
    where: Prisma.InquiryWhereInput,
    orderBy:
      | Prisma.InquiryOrderByWithRelationInput
      | Prisma.InquiryOrderByWithRelationInput[],
    skip: number,
    take: number,
  ): Promise<Inquiry[]> {
    return this.prisma.inquiry.findMany({ where, orderBy, skip, take });
  }

  count(where: Prisma.InquiryWhereInput): Promise<number> {
    return this.prisma.inquiry.count({ where });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.inquiry.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
