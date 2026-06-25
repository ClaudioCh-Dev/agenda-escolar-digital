import { mapUser } from './mappers';
import { apiFetch, apiUpload } from './client';
import type { UserProfileDto } from './types';
import type { User } from '@/types';

export async function uploadAvatar(
  file: { uri: string; name: string; mimeType: string },
  options?: { onProgress?: (percent: number) => void },
): Promise<User> {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);

  const profile = await apiUpload<UserProfileDto>(
    '/users/me/avatar',
    formData,
    options,
  );
  return mapUser(profile);
}

export async function removeAvatar(): Promise<User> {
  const profile = await apiFetch<UserProfileDto>('/users/me/avatar', {
    method: 'DELETE',
  });
  return mapUser(profile);
}
