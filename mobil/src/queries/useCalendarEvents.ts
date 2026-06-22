import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateCalendarEventDto, UpdateCalendarEventDto } from '@/types';
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '@/services/calendar.service';
import { queryKeys } from './keys';
import { useAuthStore } from '@/store/authStore';

export function useCalendarEvents() {
  const user = useAuthStore(s => s.user);

  return useQuery({
    queryKey: queryKeys.calendar,
    queryFn: () => listEvents(),
    enabled: !!user,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCalendarEventDto) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar });
    },
  });
}

export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: UpdateCalendarEventDto }) =>
      updateEvent(params.id, params.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar });
    },
  });
}

export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendar });
    },
  });
}
