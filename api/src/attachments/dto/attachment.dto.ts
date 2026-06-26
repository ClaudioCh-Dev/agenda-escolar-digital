import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AttachmentFileType } from '../../shared/database/enums';

export class AttachmentResponseDto {
  @ApiProperty({ example: '44444444-4444-4444-4444-444444444401' })
  id!: string;

  @ApiProperty({ example: 'comunicado.pdf' })
  name!: string;

  @ApiProperty({ example: '245 KB' })
  size!: string;

  @ApiProperty({ enum: ['image', 'pdf', 'word'], example: 'pdf' })
  fileType!: AttachmentFileType;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/raw/upload/v1/comunicado.pdf',
  })
  url!: string;

  @ApiPropertyOptional({ example: 'agenda/comunicado' })
  publicId?: string;
}

export class UploadAttachmentResponseDto {
  @ApiProperty({ example: 'comunicado.pdf' })
  name!: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/raw/upload/v1/comunicado.pdf',
  })
  storageUrl!: string;

  @ApiProperty({ example: '245 KB' })
  sizeLabel!: string;

  @ApiProperty({ enum: ['image', 'pdf', 'word'], example: 'pdf' })
  fileType!: AttachmentFileType;

  @ApiProperty({ example: 'agenda/staging/comunicado' })
  publicId!: string;
}
