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
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ListVehiclesQueryDto } from './dto/list-vehicles-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Permission } from '../types/permission.enum';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';

/** Public catalogue — AVAILABLE vehicles only. */
@ApiTags('vehicles')
@Controller({ path: 'vehicles', version: '1' })
export class VehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'List available vehicles' })
  list(@Query() query: ListVehiclesQueryDto) {
    return this.vehicles.listAvailable(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get one available vehicle by slug' })
  @ApiResponse({ status: 404, description: 'Vehicle not found.' })
  findOne(@Param('slug') slug: string) {
    return this.vehicles.findAvailableBySlug(slug);
  }
}

@ApiTags('admin/vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'admin/vehicles', version: '1' })
export class AdminVehiclesController {
  constructor(private readonly vehicles: VehiclesService) {}

  @Get()
  @RequirePermissions(Permission.VEHICLES_READ)
  @ApiOperation({ summary: 'List vehicles (all statuses)' })
  list(@Query() query: ListVehiclesQueryDto) {
    return this.vehicles.list(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.VEHICLES_READ)
  @ApiOperation({ summary: 'Get one vehicle by id' })
  findOne(@Param('id') id: string) {
    return this.vehicles.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.VEHICLES_WRITE)
  @ApiOperation({ summary: 'Create a vehicle' })
  @ApiResponse({ status: 201, description: 'Vehicle created.' })
  create(
    @Body() dto: CreateVehicleDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.vehicles.create(dto, req.user.id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.VEHICLES_WRITE)
  @ApiOperation({ summary: 'Update a vehicle' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.vehicles.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.VEHICLES_WRITE)
  @ApiOperation({ summary: 'Soft-delete a vehicle' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.vehicles.remove(id, req.user.id);
  }
}
