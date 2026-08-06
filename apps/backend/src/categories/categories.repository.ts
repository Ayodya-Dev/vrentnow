import { Injectable } from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CategoryUncheckedCreateInput): Promise<Category> {
    return this.prisma.category.create({ data });
  }

  update(
    id: string,
    data: Prisma.CategoryUncheckedUpdateInput,
  ): Promise<Category> {
    return this.prisma.category.update({ where: { id }, data });
  }

  findById(id: string): Promise<Category | null> {
    return this.prisma.category.findFirst({ where: { id, deletedAt: null } });
  }

  findBySlug(slug: string): Promise<Category | null> {
    return this.prisma.category.findFirst({ where: { slug, deletedAt: null } });
  }

  findMany(
    where: Prisma.CategoryWhereInput,
    orderBy: Prisma.CategoryOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<Category[]> {
    return this.prisma.category.findMany({ where, orderBy, skip, take });
  }

  count(where: Prisma.CategoryWhereInput): Promise<number> {
    return this.prisma.category.count({ where });
  }

  async softDelete(id: string, freedSlug: string): Promise<void> {
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), slug: freedSlug },
    });
  }
}
