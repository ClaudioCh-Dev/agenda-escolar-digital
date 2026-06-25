export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const MAX_ATTACHMENT_LABEL = '10 MB';
export const MAX_ATTACHMENT_HINT =
  'Máximo 10 MB (comunicados cortos, aprox. 10 páginas)';

export class AttachmentSizeError extends Error {
  constructor(message = MAX_ATTACHMENT_HINT) {
    super(message);
    this.name = 'AttachmentSizeError';
  }
}

export function assertAttachmentSize(bytes: number | undefined): void {
  if (bytes !== undefined && bytes > MAX_ATTACHMENT_BYTES) {
    throw new AttachmentSizeError();
  }
}
