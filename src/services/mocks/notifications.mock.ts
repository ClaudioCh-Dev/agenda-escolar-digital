import type { AppNotification } from '@/types';
import { mockStore } from './store';

export async function listNotifications(): Promise<AppNotification[]> {
  return [...mockStore.notifications];
}

export async function markAsRead(id: string): Promise<void> {
  mockStore.notifications = mockStore.notifications.map(n =>
    n.id === id ? { ...n, isRead: true } : n,
  );
}

export async function markAllAsRead(): Promise<void> {
  mockStore.notifications = mockStore.notifications.map(n => ({ ...n, isRead: true }));
}

export async function getUnreadCount(): Promise<number> {
  return mockStore.notifications.filter(n => !n.isRead).length;
}
