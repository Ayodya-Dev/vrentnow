import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateHandoverDocsDto {
  @ApiPropertyOptional({ description: 'FileAsset id for NIC photo' })
  @IsOptional()
  @IsString()
  nicFileId?: string;

  @ApiPropertyOptional({ description: 'FileAsset id for driving licence photo' })
  @IsOptional()
  @IsString()
  licenceFileId?: string;

  @ApiPropertyOptional({
    description: 'FileAsset id for signed rental agreement photo',
  })
  @IsOptional()
  @IsString()
  agreementFileId?: string;
}
