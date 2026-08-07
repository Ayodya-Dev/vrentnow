import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  status!: BookingStatus;

  @ApiPropertyOptional({ description: 'Required when cancelling' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  cancelReason?: string;
}
