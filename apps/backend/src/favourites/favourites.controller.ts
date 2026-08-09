import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { FavouritesService } from './favourites.service';

@ApiTags('favourites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'favourites', version: '1' })
export class FavouritesController {
  constructor(private readonly favourites: FavouritesService) {}

  @Get()
  @ApiOperation({ summary: 'List my favourite vehicles' })
  list(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.favourites.list(req.user.id, query);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Vehicle ids I have favourited' })
  ids(@Request() req: { user: AuthenticatedUser }) {
    return this.favourites.ids(req.user.id);
  }

  @Put(':vehicleId')
  @ApiOperation({ summary: 'Add a vehicle to my favourites' })
  add(
    @Param('vehicleId') vehicleId: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.favourites.add(req.user.id, vehicleId);
  }

  @Delete(':vehicleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a vehicle from my favourites' })
  remove(
    @Param('vehicleId') vehicleId: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.favourites.remove(req.user.id, vehicleId);
  }
}
