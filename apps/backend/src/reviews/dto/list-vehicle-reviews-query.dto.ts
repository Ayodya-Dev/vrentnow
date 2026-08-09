import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class ListVehicleReviewsQueryDto extends PaginationQueryDto {
  @ApiProperty({ description: 'Vehicle to list approved reviews for' })
  @IsString()
  vehicleId!: string;
}
