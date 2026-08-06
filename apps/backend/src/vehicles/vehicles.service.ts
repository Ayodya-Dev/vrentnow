import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, VehicleStatus } from '@prisma/client';
import {
  VehiclesRepository,
  VehicleWithCategory,
} from './vehicles.repository';
import { CategoriesRepository } from '../categories/categories.repository';
import { AuditService } from '../audit/audit.service';
import { FilesService } from '../files/files.service';
import { slugify } from '../common/slug';
import { buildOrderBy } from '../common/sorting';
import {
  PaginatedResult,
  buildPaginatedResult,
  getPaginationParams,
} from '../common/pagination';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ListVehiclesQueryDto } from './dto/list-vehicles-query.dto';

export type VehiclePublic = VehicleWithCategory & { imageUrls: string[] };

const SORTABLE = [
  'name',
  'brand',
  'pricePerDay',
  'year',
  'createdAt',
  'updatedAt',
] as const;

function isUniqueViolation(err: unknown, field: string): boolean {
  if (
    !(err instanceof Prisma.PrismaClientKnownRequestError) ||
    err.code !== 'P2002'
  ) {
    return false;
  }
  const target = (err.meta as { target?: string[] } | undefined)?.target;
  return Array.isArray(target) ? target.includes(field) : true;
}

@Injectable()
export class VehiclesService {
  constructor(
    private readonly repo: VehiclesRepository,
    private readonly categories: CategoriesRepository,
    private readonly audit: AuditService,
    private readonly files: FilesService,
  ) {}

  private async withImageUrls(
    vehicle: VehicleWithCategory,
  ): Promise<VehiclePublic> {
    const assets = await this.files.getManyWithUrls(vehicle.imageFileIds);
    return {
      ...vehicle,
      imageUrls: assets.map((a) => a.accessUrl),
    };
  }

  private async withImageUrlsMany(
    vehicles: VehicleWithCategory[],
  ): Promise<VehiclePublic[]> {
    return Promise.all(vehicles.map((v) => this.withImageUrls(v)));
  }

  async create(
    dto: CreateVehicleDto,
    actorId: string,
  ): Promise<VehiclePublic> {
    const category = await this.categories.findById(dto.categoryId);
    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const slug = slugify(dto.name);
    if (await this.repo.findBySlug(slug)) {
      throw new ConflictException(
        `A vehicle with the slug "${slug}" already exists`,
      );
    }

    let vehicle: VehicleWithCategory;
    try {
      vehicle = await this.repo.create({
        name: dto.name,
        slug,
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        seats: dto.seats,
        fuel: dto.fuel,
        transmission: dto.transmission,
        pricePerDay: dto.pricePerDay,
        status: dto.status ?? VehicleStatus.AVAILABLE,
        description: dto.description ?? null,
        imageFileIds: dto.imageFileIds ?? [],
        categoryId: dto.categoryId,
      });
    } catch (err) {
      if (isUniqueViolation(err, 'slug')) {
        throw new ConflictException(
          `A vehicle with the slug "${slug}" already exists`,
        );
      }
      throw err;
    }

    await this.audit.record({
      actorId,
      action: 'vehicles.create',
      entity: 'Vehicle',
      entityId: vehicle.id,
      meta: { name: vehicle.name },
    });

    return this.withImageUrls(vehicle);
  }

  async update(
    id: string,
    dto: UpdateVehicleDto,
    actorId: string,
  ): Promise<VehiclePublic> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    if (dto.categoryId !== undefined) {
      const category = await this.categories.findById(dto.categoryId);
      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    const data: Prisma.VehicleUncheckedUpdateInput = {};
    if (dto.brand !== undefined) data.brand = dto.brand;
    if (dto.model !== undefined) data.model = dto.model;
    if (dto.year !== undefined) data.year = dto.year;
    if (dto.seats !== undefined) data.seats = dto.seats;
    if (dto.fuel !== undefined) data.fuel = dto.fuel;
    if (dto.transmission !== undefined) data.transmission = dto.transmission;
    if (dto.pricePerDay !== undefined) data.pricePerDay = dto.pricePerDay;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.imageFileIds !== undefined) data.imageFileIds = dto.imageFileIds;
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;

    if (dto.name !== undefined && dto.name !== existing.name) {
      const slug = slugify(dto.name);
      const clash = await this.repo.findBySlug(slug);
      if (clash && clash.id !== id) {
        throw new ConflictException(
          `A vehicle with the slug "${slug}" already exists`,
        );
      }
      data.name = dto.name;
      data.slug = slug;
    }

    const vehicle = await this.repo.update(id, data);

    await this.audit.record({
      actorId,
      action: 'vehicles.update',
      entity: 'Vehicle',
      entityId: id,
      meta: { changed: Object.keys(data) },
    });

    return this.withImageUrls(vehicle);
  }

  async remove(id: string, actorId: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Vehicle not found');

    await this.repo.softDelete(id, `${existing.slug}--deleted-${id}`);

    await this.audit.record({
      actorId,
      action: 'vehicles.delete',
      entity: 'Vehicle',
      entityId: id,
      meta: { name: existing.name },
    });
  }

  async findById(id: string): Promise<VehiclePublic> {
    const vehicle = await this.repo.findById(id);
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return this.withImageUrls(vehicle);
  }

  /** Public: only AVAILABLE vehicles. */
  async findAvailableBySlug(slug: string): Promise<VehiclePublic> {
    const vehicle = await this.repo.findBySlug(slug);
    if (!vehicle || vehicle.status !== VehicleStatus.AVAILABLE) {
      throw new NotFoundException('Vehicle not found');
    }
    return this.withImageUrls(vehicle);
  }

  list(query: ListVehiclesQueryDto): Promise<PaginatedResult<VehiclePublic>> {
    const where: Prisma.VehicleWhereInput = { deletedAt: null };
    if (query.status) where.status = query.status;
    this.applyFilters(where, query);
    return this.paginate(where, query);
  }

  listAvailable(
    query: ListVehiclesQueryDto,
  ): Promise<PaginatedResult<VehiclePublic>> {
    const where: Prisma.VehicleWhereInput = {
      deletedAt: null,
      status: VehicleStatus.AVAILABLE,
    };
    this.applyFilters(where, query);
    return this.paginate(where, query);
  }

  private applyFilters(
    where: Prisma.VehicleWhereInput,
    query: ListVehiclesQueryDto,
  ): void {
    const ids = [
      ...(query.categoryId ? [query.categoryId] : []),
      ...(query.categoryIds
        ? query.categoryIds
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : []),
    ];
    if (ids.length === 1) where.categoryId = ids[0];
    else if (ids.length > 1) where.categoryId = { in: ids };

    if (query.fuel) where.fuel = query.fuel;
    if (query.transmission) where.transmission = query.transmission;

    if (query.seatsMin) {
      where.seats = { gte: query.seatsMin };
    } else if (query.seats) {
      where.seats = query.seats;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.pricePerDay = {};
      if (query.minPrice !== undefined) where.pricePerDay.gte = query.minPrice;
      if (query.maxPrice !== undefined) where.pricePerDay.lte = query.maxPrice;
    }
  }

  private async paginate(
    where: Prisma.VehicleWhereInput,
    query: ListVehiclesQueryDto,
  ): Promise<PaginatedResult<VehiclePublic>> {
    if (query.q) {
      where.OR = [
        { name: { contains: query.q, mode: 'insensitive' } },
        { brand: { contains: query.q, mode: 'insensitive' } },
        { model: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const { skip, take, page, limit } = getPaginationParams(query);
    const orderBy = buildOrderBy(
      query.sortBy,
      query.order,
      SORTABLE,
      'createdAt',
    );

    const [rows, total] = await Promise.all([
      this.repo.findMany(where, orderBy, skip, take),
      this.repo.count(where),
    ]);

    const items = await this.withImageUrlsMany(rows);
    return buildPaginatedResult(items, total, page, limit);
  }
}
