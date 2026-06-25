import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CancelStagingAttachmentDto {
  @ApiProperty({ example: 'agenda/staging/comunicado' })
  @IsString()
  @IsNotEmpty()
  publicId!: string;
}
