import { ApiPropertyOptional } from '@nestjs/swagger';
import { FuelType, TransmissionType, VehicleStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListVehiclesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Free-text match on name, brand, model' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by category id' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated category ids (OR match)',
  })
  @IsOptional()
  @IsString()
  categoryIds?: string;

  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({ enum: FuelType })
  @IsOptional()
  @IsEnum(FuelType)
  fuel?: FuelType;

  @ApiPropertyOptional({ enum: TransmissionType })
  @IsOptional()
  @IsEnum(TransmissionType)
  transmission?: TransmissionType;

  @ApiPropertyOptional({ description: 'Exact seat count' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seats?: number;

  @ApiPropertyOptional({ description: 'Minimum seats (e.g. 7 for 7+)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seatsMin?: number;

  @ApiPropertyOptional({ description: 'Minimum price per day' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price per day' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Admin only — when true, include non-AVAILABLE vehicles',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  includeUnavailable?: boolean;

  @ApiPropertyOptional({
    description:
      'Rental start (YYYY-MM-DD). Must be sent with `to` — excludes vehicles with overlapping active bookings.',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    description:
      'Rental end (YYYY-MM-DD). Must be sent with `from` — excludes vehicles with overlapping active bookings.',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
