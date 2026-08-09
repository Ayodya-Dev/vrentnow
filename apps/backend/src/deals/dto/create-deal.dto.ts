import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDealDto {
  @ApiProperty({ example: 'Summer Special' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'LIMITED TIME' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  badge?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: '25% OFF' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  discountLabel!: string;

  @ApiPropertyOptional({ example: 'SUMMER25' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  code?: string;

  @ApiPropertyOptional({ description: 'Public image file asset id' })
  @IsOptional()
  @IsString()
  imageFileId?: string;

  @ApiPropertyOptional({ example: 'Valid until Aug 31, 2026' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  validUntilLabel?: string;

  @ApiPropertyOptional({ example: '2026-08-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional({ example: '2026-08-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null || value === ''
      ? undefined
      : Number(value),
  )
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
