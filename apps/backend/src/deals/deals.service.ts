import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Deal, Prisma } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { FilesService } from '../files/files.service';
import { slugify } from '../common/slug';
import { buildOrderBy } from '../common/sorting';
import {
  PaginatedResult,
  buildPaginatedResult,
  getPaginationParams,
} from '../common/pagination';
import { DealsRepository } from './deals.repository';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { ListDealsQueryDto } from './dto/list-deals-query.dto';

const SORTABLE = ['sortOrder', 'title', 'createdAt', 'updatedAt'] as const;

export type DealView = Deal & { imageUrl: string | null };

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
export class DealsService {
  constructor(
    private readonly repo: DealsRepository,
    private readonly audit: AuditService,
    private readonly files: FilesService,
  ) {}

  private async withImageUrl(deal: Deal): Promise<DealView> {
    if (!deal.imageFileId) return { ...deal, imageUrl: null };
    try {
      const asset = await this.files.getWithUrl(deal.imageFileId);
      return { ...deal, imageUrl: asset.accessUrl };
    } catch {
      return { ...deal, imageUrl: null };
    }
  }

  private async assertReadyImage(fileId: string | null | undefined): Promise<void> {
    if (!fileId) return;
    await this.files.getWithUrl(fileId);
  }

  private normalizeCode(
    code: string | null | undefined,
  ): string | null | undefined {
    if (code === undefined) return undefined;
    if (code === null) return null;
    const trimmed = code.trim();
    return trimmed ? trimmed.toUpperCase() : null;
  }

  async create(dto: CreateDealDto, actorId: string): Promise<DealView> {
    const slug = slugify(dto.title);
    if (!slug) throw new BadRequestException('Title must produce a valid slug');
    if (await this.repo.findBySlug(slug)) {
      throw new ConflictException(`A deal with the slug "${slug}" already exists`);
    }

    const code = this.normalizeCode(dto.code ?? null);
    if (code && (await this.repo.findByCode(code))) {
      throw new ConflictException(`A deal with the code "${code}" already exists`);
    }

    await this.assertReadyImage(dto.imageFileId);

    let deal: Deal;
    try {
      deal = await this.repo.create({
        title: dto.title.trim(),
        slug,
        badge: dto.badge?.trim() || null,
        description: dto.description?.trim() || null,
        discountLabel: dto.discountLabel.trim(),
        code,
        imageFileId: dto.imageFileId || null,
        validUntilLabel: dto.validUntilLabel?.trim() || null,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      });
    } catch (err) {
      if (isUniqueViolation(err, 'slug') || isUniqueViolation(err, 'code')) {
        throw new ConflictException('A deal with that slug or code already exists');
      }
      throw err;
    }

    await this.audit.record({
      actorId,
      action: 'deals.create',
      entity: 'Deal',
      entityId: deal.id,
      meta: { title: deal.title },
    });

    return this.withImageUrl(deal);
  }

  async update(
    id: string,
    dto: UpdateDealDto,
    actorId: string,
  ): Promise<DealView> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Deal not found');

    const data: Prisma.DealUncheckedUpdateInput = {};

    if (dto.title !== undefined && dto.title !== existing.title) {
      const slug = slugify(dto.title);
      if (!slug) throw new BadRequestException('Title must produce a valid slug');
      const clash = await this.repo.findBySlug(slug);
      if (clash && clash.id !== id) {
        throw new ConflictException(
          `A deal with the slug "${slug}" already exists`,
        );
      }
      data.title = dto.title.trim();
      data.slug = slug;
    }

    if (dto.badge !== undefined) data.badge = dto.badge?.trim() || null;
    if (dto.description !== undefined) {
      data.description = dto.description?.trim() || null;
    }
    if (dto.discountLabel !== undefined) {
      data.discountLabel = dto.discountLabel.trim();
    }
    if (dto.validUntilLabel !== undefined) {
      data.validUntilLabel = dto.validUntilLabel?.trim() || null;
    }
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;
    if (dto.startsAt !== undefined) {
      data.startsAt = dto.startsAt ? new Date(dto.startsAt) : null;
    }
    if (dto.endsAt !== undefined) {
      data.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }

    if (dto.code !== undefined) {
      const code = this.normalizeCode(dto.code);
      if (code) {
        const clash = await this.repo.findByCode(code);
        if (clash && clash.id !== id) {
          throw new ConflictException(
            `A deal with the code "${code}" already exists`,
          );
        }
      }
      data.code = code;
    }

    if (dto.imageFileId !== undefined) {
      await this.assertReadyImage(dto.imageFileId);
      data.imageFileId = dto.imageFileId || null;
    }

    const deal = await this.repo.update(id, data);
    await this.audit.record({
      actorId,
      action: 'deals.update',
      entity: 'Deal',
      entityId: id,
      meta: { changed: Object.keys(data) },
    });
    return this.withImageUrl(deal);
  }

  async remove(id: string, actorId: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Deal not found');

    await this.repo.softDelete(id, `${existing.slug}--deleted-${id}`);
    await this.audit.record({
      actorId,
      action: 'deals.delete',
      entity: 'Deal',
      entityId: id,
      meta: { title: existing.title },
    });
  }

  async findById(id: string): Promise<DealView> {
    const deal = await this.repo.findById(id);
    if (!deal) throw new NotFoundException('Deal not found');
    return this.withImageUrl(deal);
  }

  /** Public catalogue: active + inside optional date window. */
  async listPublic(
    query: ListDealsQueryDto,
  ): Promise<PaginatedResult<DealView>> {
    const now = new Date();
    const and: Prisma.DealWhereInput[] = [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
    ];
    if (query.q?.trim()) {
      and.push({
        OR: [
          { title: { contains: query.q.trim(), mode: 'insensitive' } },
          { code: { contains: query.q.trim(), mode: 'insensitive' } },
        ],
      });
    }
    const where: Prisma.DealWhereInput = {
      deletedAt: null,
      isActive: true,
      AND: and,
    };

    const { skip, take, page, limit } = getPaginationParams(query);
    const [rows, total] = await Promise.all([
      this.repo.findMany(
        where,
        [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
      ),
      this.repo.count(where),
    ]);

    return buildPaginatedResult(
      await Promise.all(rows.map((d) => this.withImageUrl(d))),
      total,
      page,
      limit,
    );
  }

  async listAdmin(
    query: ListDealsQueryDto,
  ): Promise<PaginatedResult<DealView>> {
    const where: Prisma.DealWhereInput = { deletedAt: null };
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.q?.trim()) {
      where.OR = [
        { title: { contains: query.q.trim(), mode: 'insensitive' } },
        { code: { contains: query.q.trim(), mode: 'insensitive' } },
      ];
    }

    const { skip, take, page, limit } = getPaginationParams(query);
    const orderBy = buildOrderBy(
      query.sortBy,
      query.order,
      SORTABLE,
      'sortOrder',
    );

    const [rows, total] = await Promise.all([
      this.repo.findMany(where, orderBy, skip, take),
      this.repo.count(where),
    ]);

    return buildPaginatedResult(
      await Promise.all(rows.map((d) => this.withImageUrl(d))),
      total,
      page,
      limit,
    );
  }
}
