import type { AppNotification } from '@/types';
import { notImplemented } from './client';

export async function listNotifications(): Promise<AppNotification[]> {
  notImplemented('GET /notifications');
}

export async function markAsRead(_id: string): Promise<void> {
  notImplemented('PATCH /notifications/:id/read');
}

export async function markAllAsRead(): Promise<void> {
  notImplemented('PATCH /notifications/read-all');
}

export async function getUnreadCount(): Promise<number> {
  notImplemented('GET /notifications/unread-count');
}
