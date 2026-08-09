import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDamageReportDto {
  @ApiProperty({ description: 'A handed-over or completed booking of yours' })
  @IsString()
  bookingId!: string;

  @ApiProperty({ example: 'Scratch on the rear left door after parking.' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;
}
