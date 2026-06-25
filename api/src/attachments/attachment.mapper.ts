import type { AttachmentEntity } from './entities/attachment.entity';
import { AttachmentResponseDto } from './dto/attachment.dto';

export function toAttachmentResponse(
  attachment: AttachmentEntity,
): AttachmentResponseDto {
  return {
    id: attachment.id,
    name: attachment.name,
    size: attachment.sizeLabel,
    fileType: attachment.fileType,
    url: attachment.storageUrl,
    publicId: attachment.cloudinaryPublicId ?? undefined,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function resolveAttachmentFileType(
  mimeType: string,
  filename: string,
): 'pdf' | 'image' | 'doc' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf') || mimeType === 'application/pdf') {
    return 'pdf';
  }

  return 'doc';
}
