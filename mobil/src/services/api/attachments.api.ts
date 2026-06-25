import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { Attachment } from '@/types';
import {
  assertAttachmentSize,
  AttachmentSizeError,
  MAX_ATTACHMENT_HINT,
} from '@/constants/attachments';
import { apiFetch, apiUpload } from './client';
import { mapAttachment } from './mappers';
import type { AttachmentResponseDto, UploadAttachmentResponseDto } from './types';

export type PickedAttachmentFile = {
  uri: string;
  name: string;
  mimeType: string;
  fileSize?: number;
};

export { AttachmentSizeError, MAX_ATTACHMENT_HINT };

const IMAGE_PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 0.85,
};

function buildFormData(file: PickedAttachmentFile): FormData {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);
  return formData;
}

function toStagingAttachment(uploaded: UploadAttachmentResponseDto): Attachment {
  return {
    name: uploaded.name,
    size: uploaded.sizeLabel,
    fileType: uploaded.fileType,
    storageUrl: uploaded.storageUrl,
    url: uploaded.storageUrl,
    publicId: uploaded.publicId,
  };
}

export async function pickImageAttachment(
  source: 'library' | 'camera',
): Promise<PickedAttachmentFile | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error('permission_denied');
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(IMAGE_PICKER_OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(IMAGE_PICKER_OPTIONS);

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.fileName ?? `foto_${Date.now()}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
    fileSize: asset.fileSize,
  };
}

export async function pickDocumentAttachment(): Promise<PickedAttachmentFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name ?? 'archivo',
    mimeType: asset.mimeType ?? 'application/octet-stream',
    fileSize: asset.size,
  };
}

function validateFileBeforeUpload(file: PickedAttachmentFile): void {
  assertAttachmentSize(file.fileSize);
}

export async function uploadAttachment(
  file: PickedAttachmentFile,
  options?: { onProgress?: (percent: number) => void },
): Promise<Attachment> {
  validateFileBeforeUpload(file);
  const uploaded = await apiUpload<UploadAttachmentResponseDto>(
    '/attachments/upload',
    buildFormData(file),
    options,
  );
  return toStagingAttachment(uploaded);
}

export async function uploadAttachmentToEntry(
  entryId: string,
  file: PickedAttachmentFile,
  options?: { onProgress?: (percent: number) => void },
): Promise<Attachment> {
  validateFileBeforeUpload(file);
  const uploaded = await apiUpload<AttachmentResponseDto>(
    `/entries/${entryId}/attachments`,
    buildFormData(file),
    options,
  );
  return mapAttachment(uploaded);
}

export async function uploadAttachmentToCalendarEvent(
  eventId: string,
  file: PickedAttachmentFile,
  options?: { onProgress?: (percent: number) => void },
): Promise<Attachment> {
  validateFileBeforeUpload(file);
  const uploaded = await apiUpload<AttachmentResponseDto>(
    `/calendar/events/${eventId}/attachments`,
    buildFormData(file),
    options,
  );
  return mapAttachment(uploaded);
}

export async function deleteAttachment(id: string): Promise<void> {
  await apiFetch<null>(`/attachments/${id}`, { method: 'DELETE' });
}

export async function cancelStagingAttachment(publicId: string): Promise<void> {
  await apiFetch<null>('/attachments/staging', {
    method: 'DELETE',
    body: JSON.stringify({ publicId }),
  });
}

export async function pickAndUploadAttachment(options?: {
  onProgress?: (percent: number) => void;
}): Promise<Attachment | null> {
  const file = await pickDocumentAttachment();
  if (!file) {
    return null;
  }
  return uploadAttachment(file, options);
}
