import type { AttachmentFileType } from '../../shared/database/enums';

export class AttachmentResponseDto {
  id!: string;
  name!: string;
  size!: string;
  fileType!: AttachmentFileType;
  url!: string;
  publicId?: string;
}

export class UploadAttachmentResponseDto {
  name!: string;
  storageUrl!: string;
  sizeLabel!: string;
  fileType!: AttachmentFileType;
  publicId!: string;
}
