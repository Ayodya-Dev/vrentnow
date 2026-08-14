import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

/** Coerce form / JSON numbers so whitelist validation always sees strings. */
const toString = ({ value }: { value: unknown }) =>
  value === undefined || value === null ? value : String(value);

/**
 * PayHere IPN payload (application/x-www-form-urlencoded).
 * Extra known fields are optional so whitelist validation does not 422 the webhook.
 */
export class PayHereNotifyDto {
  @ApiProperty()
  @Transform(toString)
  @IsString()
  merchant_id!: string;

  @ApiProperty()
  @Transform(toString)
  @IsString()
  order_id!: string;

  @ApiProperty()
  @Transform(toString)
  @IsString()
  payhere_amount!: string;

  @ApiProperty()
  @Transform(toString)
  @IsString()
  payhere_currency!: string;

  @ApiProperty({ description: '2 = success' })
  @Transform(toString)
  @IsString()
  status_code!: string;

  @ApiProperty()
  @Transform(toString)
  @IsString()
  md5sig!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toString)
  @IsString()
  payment_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toString)
  @IsString()
  method?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toString)
  @IsString()
  status_message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toString)
  @IsString()
  card_holder_name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toString)
  @IsString()
  card_no?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toString)
  @IsString()
  card_expiry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toString)
  @IsString()
  custom_1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toString)
  @IsString()
  custom_2?: string;
}
