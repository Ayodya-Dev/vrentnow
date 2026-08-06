import { Injectable } from '@nestjs/common';
import { Prisma, Vehicle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type VehicleWithCategory = Vehicle & {
  category: { id: string; name: string; slug: string };
};

@Injectable()
export class VehiclesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly withCategory = {
    category: { select: { id: true, name: true, slug: true } },
  } as const;

  create(
    data: Prisma.VehicleUncheckedCreateInput,
  ): Promise<VehicleWithCategory> {
    return this.prisma.vehicle.create({
      data,
      include: this.withCategory,
    });
  }

  update(
    id: string,
    data: Prisma.VehicleUncheckedUpdateInput,
  ): Promise<VehicleWithCategory> {
    return this.prisma.vehicle.update({
      where: { id },
      data,
      include: this.withCategory,
    });
  }

  findById(id: string): Promise<VehicleWithCategory | null> {
    return this.prisma.vehicle.findFirst({
      where: { id, deletedAt: null },
      include: this.withCategory,
    });
  }

  findBySlug(slug: string): Promise<VehicleWithCategory | null> {
    return this.prisma.vehicle.findFirst({
      where: { slug, deletedAt: null },
      include: this.withCategory,
    });
  }

  findMany(
    where: Prisma.VehicleWhereInput,
    orderBy: Prisma.VehicleOrderByWithRelationInput,
    skip: number,
    take: number,
  ): Promise<VehicleWithCategory[]> {
    return this.prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take,
      include: this.withCategory,
    });
  }

  count(where: Prisma.VehicleWhereInput): Promise<number> {
    return this.prisma.vehicle.count({ where });
  }

  async softDelete(id: string, freedSlug: string): Promise<void> {
    await this.prisma.vehicle.update({
      where: { id },
      data: { deletedAt: new Date(), slug: freedSlug },
    });
  }
}
