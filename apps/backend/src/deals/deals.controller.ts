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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Permission } from '../types/permission.enum';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { ListDealsQueryDto } from './dto/list-deals-query.dto';

@ApiTags('deals')
@Controller({ path: 'deals', version: '1' })
export class DealsController {
  constructor(private readonly deals: DealsService) {}

  @Get()
  @ApiOperation({ summary: 'List active public deals' })
  list(@Query() query: ListDealsQueryDto) {
    return this.deals.listPublic(query);
  }
}

@ApiTags('admin/deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'admin/deals', version: '1' })
export class AdminDealsController {
  constructor(private readonly deals: DealsService) {}

  @Get()
  @RequirePermissions(Permission.DEALS_READ)
  @ApiOperation({ summary: 'List deals (admin)' })
  list(@Query() query: ListDealsQueryDto) {
    return this.deals.listAdmin(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.DEALS_READ)
  @ApiOperation({ summary: 'Get one deal by id' })
  findOne(@Param('id') id: string) {
    return this.deals.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.DEALS_WRITE)
  @ApiOperation({ summary: 'Create a deal' })
  @ApiResponse({ status: 201, description: 'Deal created.' })
  create(
    @Body() dto: CreateDealDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.deals.create(dto, req.user.id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.DEALS_WRITE)
  @ApiOperation({ summary: 'Update a deal' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.deals.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.DEALS_WRITE)
  @ApiOperation({ summary: 'Soft-delete a deal' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.deals.remove(id, req.user.id);
  }
}
