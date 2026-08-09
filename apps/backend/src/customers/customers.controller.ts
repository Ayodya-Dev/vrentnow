import {
  Controller,
  Get,
  Param,
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
import { CustomersService } from './customers.service';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';

@ApiTags('admin/customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'admin/customers', version: '1' })
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'List customer (Role.USER) accounts' })
  list(@Query() query: ListCustomersQueryDto) {
    return this.customers.list(query);
  }

  @Get(':id')
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: 'Get one customer account' })
  findOne(@Param('id') id: string) {
    return this.customers.findOne(id);
  }

  @Post(':id/disable')
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Disable a customer login and revoke sessions' })
  disable(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.customers.disable(id, req.user.id);
  }

  @Post(':id/enable')
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Re-enable a disabled customer login' })
  enable(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.customers.enable(id, req.user.id);
  }

  @Post(':id/unlock')
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: 'Clear temporary login lockout' })
  unlock(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.customers.unlock(id, req.user.id);
  }
}
