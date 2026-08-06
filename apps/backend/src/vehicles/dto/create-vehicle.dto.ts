import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  FuelType,
  TransmissionType,
  VehicleStatus,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Toyota Aqua Hybrid' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  brand!: string;

  @ApiProperty({ example: 'Aqua' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  model!: string;

  @ApiProperty({ example: 2022 })
  @Type(() => Number)
  @IsInt()
  @Min(1990)
  @Max(2100)
  year!: number;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(60)
  seats!: number;

  @ApiProperty({ enum: FuelType, example: FuelType.HYBRID })
  @IsEnum(FuelType)
  fuel!: FuelType;

  @ApiProperty({ enum: TransmissionType, example: TransmissionType.AUTOMATIC })
  @IsEnum(TransmissionType)
  transmission!: TransmissionType;

  @ApiProperty({ example: 8500, description: 'Rental price per day (LKR)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pricePerDay!: number;

  @ApiProperty({
    description: 'Category id from POST /v1/admin/categories',
    example: 'clxxxxxxxx',
  })
  @IsString()
  categoryId!: string;

  @ApiPropertyOptional({ enum: VehicleStatus, default: VehicleStatus.AVAILABLE })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'FileAsset ids from POST /v1/admin/files/uploads',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageFileIds?: string[];
}
