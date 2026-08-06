import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { CategoriesRepository } from './categories.repository';
import { AuditService } from '../audit/audit.service';
import { slugify } from '../common/slug';
import { buildOrderBy } from '../common/sorting';
import {
  PaginatedResult,
  buildPaginatedResult,
  getPaginationParams,
} from '../common/pagination';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';

const SORTABLE = ['name', 'createdAt', 'updatedAt'] as const;

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
export class CategoriesService {
  constructor(
    private readonly repo: CategoriesRepository,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateCategoryDto, actorId: string): Promise<Category> {
    const slug = slugify(dto.name);
    if (await this.repo.findBySlug(slug)) {
      throw new ConflictException(
        `A category with the slug "${slug}" already exists`,
      );
    }

    let category: Category;
    try {
      category = await this.repo.create({
        name: dto.name,
        slug,
        icon: dto.icon ?? null,
        description: dto.description ?? null,
      });
    } catch (err) {
      if (isUniqueViolation(err, 'slug') || isUniqueViolation(err, 'name')) {
        throw new ConflictException(
          `A category with the slug "${slug}" already exists`,
        );
      }
      throw err;
    }

    await this.audit.record({
      actorId,
      action: 'categories.create',
      entity: 'Category',
      entityId: category.id,
      meta: { name: category.name },
    });

    return category;
  }

  async update(
    id: string,
    dto: UpdateCategoryDto,
    actorId: string,
  ): Promise<Category> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Category not found');

    const data: Prisma.CategoryUncheckedUpdateInput = {};
    if (dto.icon !== undefined) data.icon = dto.icon;
    if (dto.description !== undefined) data.description = dto.description;

    if (dto.name !== undefined && dto.name !== existing.name) {
      const slug = slugify(dto.name);
      const clash = await this.repo.findBySlug(slug);
      if (clash && clash.id !== id) {
        throw new ConflictException(
          `A category with the slug "${slug}" already exists`,
        );
      }
      data.name = dto.name;
      data.slug = slug;
    }

    const category = await this.repo.update(id, data);

    await this.audit.record({
      actorId,
      action: 'categories.update',
      entity: 'Category',
      entityId: id,
      meta: { changed: Object.keys(data) },
    });

    return category;
  }

  async remove(id: string, actorId: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Category not found');

    await this.repo.softDelete(id, `${existing.slug}--deleted-${id}`);

    await this.audit.record({
      actorId,
      action: 'categories.delete',
      entity: 'Category',
      entityId: id,
      meta: { name: existing.name },
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.repo.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.repo.findBySlug(slug);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  list(query: ListCategoriesQueryDto): Promise<PaginatedResult<Category>> {
    return this.paginate({ deletedAt: null }, query);
  }

  private async paginate(
    where: Prisma.CategoryWhereInput,
    query: ListCategoriesQueryDto,
  ): Promise<PaginatedResult<Category>> {
    if (query.q) {
      where.name = { contains: query.q, mode: 'insensitive' };
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

    return buildPaginatedResult(rows, total, page, limit);
  }
}
