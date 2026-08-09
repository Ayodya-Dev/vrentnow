import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  PaginatedResult,
  buildPaginatedResult,
  getPaginationParams,
} from '../common/pagination';

type FavouriteVehicle = Prisma.VehicleGetPayload<{
  include: { category: { select: { id: true; name: true; slug: true } } };
}> & { imageUrls: string[] };

@Injectable()
export class FavouritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly files: FilesService,
  ) {}

  /** Vehicle ids the user has favourited — drives heart states in the UI. */
  async ids(userId: string): Promise<string[]> {
    const rows = await this.prisma.favourite.findMany({
      where: { userId, vehicle: { deletedAt: null } },
      select: { vehicleId: true },
    });
    return rows.map((r) => r.vehicleId);
  }

  async add(userId: string, vehicleId: string): Promise<{ vehicleId: string }> {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id: vehicleId, deletedAt: null },
      select: { id: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');

    await this.prisma.favourite.upsert({
      where: { userId_vehicleId: { userId, vehicleId } },
      create: { userId, vehicleId },
      update: {},
    });
    return { vehicleId };
  }

  async remove(userId: string, vehicleId: string): Promise<void> {
    await this.prisma.favourite.deleteMany({ where: { userId, vehicleId } });
  }

  async list(
    userId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedResult<FavouriteVehicle>> {
    const { skip, take, page, limit } = getPaginationParams(query);
    const where: Prisma.FavouriteWhereInput = {
      userId,
      vehicle: { deletedAt: null },
    };

    const [rows, total] = await Promise.all([
      this.prisma.favourite.findMany({
        where,
        include: {
          vehicle: {
            include: { category: { select: { id: true, name: true, slug: true } } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.favourite.count({ where }),
    ]);

    const items = await Promise.all(
      rows.map(async (row) => {
        const assets = await this.files.getManyWithUrls(
          row.vehicle.imageFileIds,
        );
        return {
          ...row.vehicle,
          imageUrls: assets.map((a) => a.accessUrl),
        };
      }),
    );

    return buildPaginatedResult(items, total, page, limit);
  }
}
