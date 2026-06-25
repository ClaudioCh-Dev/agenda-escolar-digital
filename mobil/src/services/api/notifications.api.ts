import type { AppNotification } from '@/types';
import { apiFetch } from './client';
import { mapNotification } from './mappers';
import type { NotificationResponseDto } from './types';

export async function listNotifications(): Promise<AppNotification[]> {
  const data = await apiFetch<NotificationResponseDto[]>('/notifications');
  return data.map(mapNotification);
}

export async function markAsRead(id: string): Promise<void> {
  await apiFetch<null>(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllAsRead(): Promise<void> {
  await apiFetch<null>('/notifications/read-all', { method: 'PATCH' });
}

export async function getUnreadCount(): Promise<number> {
  const data = await apiFetch<{ count: number }>('/notifications/unread-count');
  return data.count;
}
