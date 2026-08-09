import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Permission } from '../types/permission.enum';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { DamageReportsService } from './damage-reports.service';
import { CreateDamageReportDto } from './dto/create-damage-report.dto';
import { ListDamageReportsQueryDto } from './dto/list-damage-reports-query.dto';

@ApiTags('damage-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'damage-reports', version: '1' })
export class DamageReportsController {
  constructor(private readonly reports: DamageReportsService) {}

  @Post()
  @ApiOperation({ summary: 'File a damage report for one of my bookings' })
  create(
    @Body() dto: CreateDamageReportDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.reports.create(dto, req.user.id);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List my damage reports' })
  listMine(
    @Query() query: ListDamageReportsQueryDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.reports.listMine(req.user.id, query);
  }
}

@ApiTags('admin/damage-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'admin/damage-reports', version: '1' })
export class AdminDamageReportsController {
  constructor(private readonly reports: DamageReportsService) {}

  @Get()
  @RequirePermissions(Permission.BOOKINGS_READ)
  @ApiOperation({ summary: 'List damage reports (admin)' })
  list(@Query() query: ListDamageReportsQueryDto) {
    return this.reports.listAdmin(query);
  }

  @Patch(':id/resolve')
  @RequirePermissions(Permission.BOOKINGS_WRITE)
  @ApiOperation({ summary: 'Mark a damage report as resolved' })
  resolve(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.reports.setResolved(id, true, req.user.id);
  }

  @Patch(':id/reopen')
  @RequirePermissions(Permission.BOOKINGS_WRITE)
  @ApiOperation({ summary: 'Reopen a resolved damage report' })
  reopen(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.reports.setResolved(id, false, req.user.id);
  }
}
