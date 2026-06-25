import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateEntryDto, UpdateEntryDto } from '@/types';
import {
  listEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  confirmEntryRead,
} from '@/services/entries.service';
import {
  uploadAttachmentToEntry,
  type PickedAttachmentFile,
} from '@/services/api/attachments.api';
import { queryKeys } from './keys';
import { useAuthStore } from '@/store/authStore';

export function useEntries() {
  const user = useAuthStore(s => s.user);

  return useQuery({
    queryKey: queryKeys.entries,
    queryFn: () => listEntries(),
    enabled: !!user,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: (params: { data: CreateEntryDto; sendNotification?: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      return createEntry(params.data, {
        authorName: user.name,
        authorRole: user.role,
        sendNotification: params.sendNotification,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string; data: UpdateEntryDto; sendNotification?: boolean }) =>
      updateEntry(params.id, params.data, { sendNotification: params.sendNotification }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries });
    },
  });
}

export function useConfirmEntryRead() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: (entryId: string) => {
      if (!user) throw new Error('Not authenticated');
      return confirmEntryRead(entryId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries });
    },
  });
}

export function useUploadEntryAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      entryId: string;
      file: PickedAttachmentFile;
      onProgress?: (percent: number) => void;
    }) => uploadAttachmentToEntry(params.entryId, params.file, { onProgress: params.onProgress }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries });
    },
  });
}
