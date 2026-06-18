import type { Conversation, Message } from '@/types';
import { mockStore } from './store';

export async function listConversations(): Promise<Conversation[]> {
  return JSON.parse(JSON.stringify(mockStore.conversations));
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const conv = mockStore.conversations.find(c => c.id === conversationId);
  return conv?.messages ?? [];
}

export async function sendMessage(conversationId: string, text: string, sender: { id: string; name: string }): Promise<Message> {
  const msg: Message = {
    id: `msg-${Date.now()}`,
    senderId: sender.id,
    senderName: sender.name.split(' ')[0],
    text,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  mockStore.conversations = mockStore.conversations.map(c => {
    if (c.id !== conversationId) return c;
    return { ...c, messages: [...c.messages, msg], lastMessage: text, lastTimestamp: msg.timestamp };
  });
  return msg;
}

export async function markConversationRead(_conversationId: string): Promise<void> {
  // noop in mock v1
}
