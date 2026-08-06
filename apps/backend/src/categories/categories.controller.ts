import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Permission } from '../types/permission.enum';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

/** Public categories list — no auth. */
@ApiTags('categories')
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List categories' })
  list(@Query() query: ListCategoriesQueryDto) {
    return this.categories.list(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get one category by slug' })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  findOne(@Param('slug') slug: string) {
    return this.categories.findBySlug(slug);
  }
}

@ApiTags('admin/categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'admin/categories', version: '1' })
export class AdminCategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  @RequirePermissions(Permission.CATEGORIES_READ)
  @ApiOperation({ summary: 'List categories (admin)' })
  list(@Query() query: ListCategoriesQueryDto) {
    return this.categories.list(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.CATEGORIES_READ)
  @ApiOperation({ summary: 'Get one category by id' })
  findOne(@Param('id') id: string) {
    return this.categories.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.CATEGORIES_WRITE)
  @ApiOperation({ summary: 'Create a category' })
  @ApiResponse({ status: 201, description: 'Category created.' })
  create(
    @Body() dto: CreateCategoryDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.categories.create(dto, req.user.id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.CATEGORIES_WRITE)
  @ApiOperation({ summary: 'Update a category' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.categories.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.CATEGORIES_WRITE)
  @ApiOperation({ summary: 'Soft-delete a category' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.categories.remove(id, req.user.id);
  }
}
