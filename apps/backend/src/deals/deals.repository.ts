import { Injectable } from '@nestjs/common';
import { Deal, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DealUncheckedCreateInput): Promise<Deal> {
    return this.prisma.deal.create({ data });
  }

  update(id: string, data: Prisma.DealUncheckedUpdateInput): Promise<Deal> {
    return this.prisma.deal.update({ where: { id }, data });
  }

  findById(id: string): Promise<Deal | null> {
    return this.prisma.deal.findFirst({ where: { id, deletedAt: null } });
  }

  findBySlug(slug: string): Promise<Deal | null> {
    return this.prisma.deal.findFirst({ where: { slug, deletedAt: null } });
  }

  findByCode(code: string): Promise<Deal | null> {
    return this.prisma.deal.findFirst({ where: { code, deletedAt: null } });
  }

  findMany(
    where: Prisma.DealWhereInput,
    orderBy: Prisma.DealOrderByWithRelationInput | Prisma.DealOrderByWithRelationInput[],
    skip: number,
    take: number,
  ): Promise<Deal[]> {
    return this.prisma.deal.findMany({ where, orderBy, skip, take });
  }

  count(where: Prisma.DealWhereInput): Promise<number> {
    return this.prisma.deal.count({ where });
  }

  async softDelete(id: string, freedSlug: string): Promise<void> {
    await this.prisma.deal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        slug: freedSlug,
        code: null,
        isActive: false,
      },
    });
  }
}
