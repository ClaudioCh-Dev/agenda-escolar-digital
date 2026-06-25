import { IsNotEmpty, IsString } from 'class-validator';

export class CancelStagingAttachmentDto {
  @IsString()
  @IsNotEmpty()
  publicId!: string;
}
