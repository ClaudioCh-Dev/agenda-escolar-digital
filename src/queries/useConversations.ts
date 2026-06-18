import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listConversations, sendMessage } from '@/services/chat.service';
import { queryKeys } from './keys';
import { useAuthStore } from '@/store/authStore';

export function useConversations() {
  const user = useAuthStore(s => s.user);

  return useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => listConversations(),
    enabled: !!user,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: (params: { convId: string; text: string }) => {
      if (!user) throw new Error('Not authenticated');
      return sendMessage(params.convId, params.text, { id: user.id, name: user.name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}
