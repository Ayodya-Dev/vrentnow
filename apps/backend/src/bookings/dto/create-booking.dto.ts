import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({ example: 'clxxxxxxxx' })
  @IsString()
  vehicleId!: string;

  @ApiProperty({ example: 'Nimal' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Perera' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ example: '+94771234567' })
  @IsString()
  @MinLength(9)
  @MaxLength(20)
  @Matches(/^[+0-9\s()-]+$/, {
    message: 'Phone must contain only digits and + ( ) - spaces',
  })
  phone!: string;

  @ApiProperty({ example: 'nimal@example.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: '2026-08-10',
    description: 'Pickup date (YYYY-MM-DD)',
  })
  @IsDateString()
  pickupDate!: string;

  @ApiProperty({
    example: '2026-08-12',
    description: 'Return date (YYYY-MM-DD), on or after pickup',
  })
  @IsDateString()
  returnDate!: string;

  @ApiProperty({ example: 'Colombo Fort branch' })
  @IsString()
  @MinLength(2)
  @MaxLength(300)
  pickupLocation!: string;

  @ApiProperty({
    enum: PaymentProvider,
    example: PaymentProvider.PAYHERE,
  })
  @IsEnum(PaymentProvider)
  paymentMethod!: PaymentProvider;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
