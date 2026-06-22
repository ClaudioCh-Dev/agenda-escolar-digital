import type { Conversation, Message } from '@/types';
import { USE_MOCK } from '@/constants/config';
import * as chatApi from './api/chat.api';
import * as chatMock from './mocks/chat.mock';

export interface MessageSender {
  id: string;
  name: string;
}

export async function listConversations(): Promise<Conversation[]> {
  return USE_MOCK ? chatMock.listConversations() : chatApi.listConversations();
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return USE_MOCK ? chatMock.getMessages(conversationId) : chatApi.getMessages(conversationId);
}

export async function sendMessage(
  conversationId: string,
  text: string,
  sender: MessageSender,
): Promise<Message> {
  return USE_MOCK
    ? chatMock.sendMessage(conversationId, text, sender)
    : chatApi.sendMessage(conversationId, text, sender);
}

export async function markConversationRead(conversationId: string): Promise<void> {
  return USE_MOCK
    ? chatMock.markConversationRead(conversationId)
    : chatApi.markConversationRead(conversationId);
}
