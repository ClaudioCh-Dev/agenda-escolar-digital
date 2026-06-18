import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markAsRead, markAllAsRead } from '@/services/notifications.service';
import { queryKeys } from './keys';
import { useAuthStore } from '@/store/authStore';

export function useNotifications() {
  const user = useAuthStore(s => s.user);

  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: () => listNotifications(),
    enabled: !!user,
  });
}

export function useUnreadNotificationsCount() {
  const { data: notifications = [] } = useNotifications();
  return useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}
