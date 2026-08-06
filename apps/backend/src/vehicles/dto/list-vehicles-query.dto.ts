import { ApiPropertyOptional } from '@nestjs/swagger';
import { FuelType, TransmissionType, VehicleStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'Admin only — when true, include non-AVAILABLE vehicles',
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  includeUnavailable?: boolean;
}
