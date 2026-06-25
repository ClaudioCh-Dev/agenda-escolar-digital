import type { Conversation, Message } from '@/types';
import { apiFetch } from './client';
import { mapConversation } from './mappers';
import type { ConversationResponseDto, MessageResponseDto } from './types';
import type { MessageSender } from '../chat.service';

export async function listConversations(): Promise<Conversation[]> {
  const data = await apiFetch<ConversationResponseDto[]>('/conversations');
  return data.map(mapConversation);
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const data = await apiFetch<MessageResponseDto[]>(
    `/conversations/${conversationId}/messages`,
  );
  return data;
}

export async function sendMessage(
  conversationId: string,
  text: string,
  _sender: MessageSender,
): Promise<Message> {
  return apiFetch<MessageResponseDto>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await apiFetch<null>(`/conversations/${conversationId}/read`, { method: 'PATCH' });
}
