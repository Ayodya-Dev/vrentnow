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
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { Permission } from '../types/permission.enum';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { THROTTLER_IP } from '../auth/throttle.config';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { ListInquiriesQueryDto } from './dto/list-inquiries-query.dto';

@ApiTags('inquiries')
@Controller({ path: 'inquiries', version: '1' })
export class InquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Post()
  // Unauthenticated endpoint; keep it too slow to be a spam vector.
  @Throttle({ [THROTTLER_IP]: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Submit a contact-form inquiry' })
  @ApiResponse({ status: 201, description: 'Inquiry received.' })
  create(@Body() dto: CreateInquiryDto) {
    return this.inquiries.create(dto);
  }
}

@ApiTags('admin/inquiries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller({ path: 'admin/inquiries', version: '1' })
export class AdminInquiriesController {
  constructor(private readonly inquiries: InquiriesService) {}

  @Get()
  @RequirePermissions(Permission.INQUIRIES_READ)
  @ApiOperation({ summary: 'List inquiries (admin inbox)' })
  list(@Query() query: ListInquiriesQueryDto) {
    return this.inquiries.list(query);
  }

  @Get('unread-count')
  @RequirePermissions(Permission.INQUIRIES_READ)
  @ApiOperation({ summary: 'Count of unread inquiries' })
  unreadCount() {
    return this.inquiries.unreadCount();
  }

  @Get(':id')
  @RequirePermissions(Permission.INQUIRIES_READ)
  @ApiOperation({ summary: 'Get one inquiry' })
  findOne(@Param('id') id: string) {
    return this.inquiries.findById(id);
  }

  @Patch(':id/read')
  @RequirePermissions(Permission.INQUIRIES_WRITE)
  @ApiOperation({ summary: 'Mark an inquiry as read' })
  markRead(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.inquiries.setRead(id, true, req.user.id);
  }

  @Patch(':id/unread')
  @RequirePermissions(Permission.INQUIRIES_WRITE)
  @ApiOperation({ summary: 'Mark an inquiry as unread' })
  markUnread(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.inquiries.setRead(id, false, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.INQUIRIES_WRITE)
  @ApiOperation({ summary: 'Soft-delete an inquiry' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.inquiries.remove(id, req.user.id);
  }
}
