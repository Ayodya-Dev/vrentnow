import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListCategoriesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text match on the name' })
  @IsOptional()
  @IsString()
  q?: string;
}
