import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { AttachmentFileType } from '../../shared/database/enums';

const FILE_TYPES: AttachmentFileType[] = ['pdf', 'image', 'doc'];

export class CreateAttachmentInputDto {
  @IsString()
  name!: string;

  @IsUrl()
  storageUrl!: string;

  @IsString()
  sizeLabel!: string;

  @IsIn(FILE_TYPES)
  fileType!: AttachmentFileType;

  @IsOptional()
  @IsString()
  publicId?: string;
}

export class CreateAttachmentInputListDto {
  @ValidateNested({ each: true })
  @Type(() => CreateAttachmentInputDto)
  attachments!: CreateAttachmentInputDto[];
}
