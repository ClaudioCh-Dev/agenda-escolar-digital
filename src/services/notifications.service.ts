import type { AppNotification } from '@/types';
import { USE_MOCK } from '@/constants/config';
import * as notificationsApi from './api/notifications.api';
import * as notificationsMock from './mocks/notifications.mock';

export async function listNotifications(): Promise<AppNotification[]> {
  return USE_MOCK
    ? notificationsMock.listNotifications()
    : notificationsApi.listNotifications();
}

export async function markAsRead(id: string): Promise<void> {
  return USE_MOCK ? notificationsMock.markAsRead(id) : notificationsApi.markAsRead(id);
}

export async function markAllAsRead(): Promise<void> {
  return USE_MOCK
    ? notificationsMock.markAllAsRead()
    : notificationsApi.markAllAsRead();
}

export async function getUnreadCount(): Promise<number> {
  return USE_MOCK
    ? notificationsMock.getUnreadCount()
    : notificationsApi.getUnreadCount();
}
