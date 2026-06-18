import type { Conversation, Message } from '@/types';
import { notImplemented } from './client';
import type { MessageSender } from '../chat.service';

export async function listConversations(): Promise<Conversation[]> {
  notImplemented('GET /conversations');
}

export async function getMessages(_conversationId: string): Promise<Message[]> {
  notImplemented('GET /conversations/:id/messages');
}

export async function sendMessage(
  _conversationId: string,
  _text: string,
  _sender: MessageSender,
): Promise<Message> {
  notImplemented('POST /conversations/:id/messages');
}

export async function markConversationRead(_conversationId: string): Promise<void> {
  notImplemented('PATCH /conversations/:id/read');
}
