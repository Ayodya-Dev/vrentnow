import {
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
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List my notifications' })
  list(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.notifications.listMine(req.user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Count of my unread notifications' })
  unreadCount(@Request() req: { user: AuthenticatedUser }) {
    return this.notifications.unreadCount(req.user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markRead(
    @Param('id') id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.notifications.markRead(id, req.user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all my notifications as read' })
  markAllRead(@Request() req: { user: AuthenticatedUser }) {
    return this.notifications.markAllRead(req.user.id);
  }
}
