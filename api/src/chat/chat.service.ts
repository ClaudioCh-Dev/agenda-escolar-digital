import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import {
  buildInitials,
  resolvePrimaryRole,
} from '../shared/access/access.utils';
import { ForbiddenException } from '../shared/exception/forbidden.exception';
import { NotFoundException } from '../shared/exception/not-found.exception';
import { domainLog } from '../shared/logging';
import {
  ConversationResponseDto,
  MessageResponseDto,
} from './dto/chat-response.dto';
import { ConversationEntity } from './entities/conversation.entity';
import { MessageEntity } from './entities/message.entity';

const PARTICIPANT_COLOR = '#6366F1';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationsRepository: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messagesRepository: Repository<MessageEntity>,
  ) {}

  async listConversations(
    auth: AuthenticatedUser,
  ): Promise<ConversationResponseDto[]> {
    const conversations = await this.conversationsRepository.find({
      where: [{ assistantId: auth.userId }, { participantId: auth.userId }],
      relations: {
        assistant: { userRoles: { role: true } },
        participant: { userRoles: { role: true } },
      },
      order: { lastMessageAt: 'DESC' },
    });

    const results: ConversationResponseDto[] = [];

    for (const conversation of conversations) {
      const other =
        conversation.assistantId === auth.userId
          ? conversation.participant
          : conversation.assistant;
      const otherRoles = other.userRoles?.map((ur) => ur.role.code) ?? [];
      const unreadCount = await this.messagesRepository.count({
        where: {
          conversationId: conversation.id,
          isRead: false,
          senderId:
            conversation.assistantId === auth.userId
              ? conversation.participantId
              : conversation.assistantId,
        },
      });

      results.push({
        id: conversation.id,
        participantId: other.id,
        participantName: other.name,
        participantRole: resolvePrimaryRole(otherRoles),
        participantInitials: buildInitials(other.name),
        participantColor: PARTICIPANT_COLOR,
        lastMessage: conversation.lastMessagePreview ?? '',
        lastTimestamp:
          conversation.lastMessageAt?.toISOString() ??
          conversation.createdAt.toISOString(),
        unreadCount,
        messages: [],
      });
    }

    return results;
  }

  async getMessages(
    auth: AuthenticatedUser,
    conversationId: string,
  ): Promise<MessageResponseDto[]> {
    const conversation = await this.findConversationOrThrow(conversationId);
    this.assertParticipant(auth.userId, conversation);

    const messages = await this.messagesRepository.find({
      where: { conversationId },
      relations: { sender: true },
      order: { createdAt: 'ASC' },
    });

    return messages.map((message) => this.toMessageDto(message));
  }

  async sendMessage(
    auth: AuthenticatedUser,
    conversationId: string,
    text: string,
  ): Promise<MessageResponseDto> {
    const conversation = await this.findConversationOrThrow(conversationId);
    this.assertParticipant(auth.userId, conversation);

    const message = await this.messagesRepository.save(
      this.messagesRepository.create({
        conversationId,
        senderId: auth.userId,
        text,
      }),
    );

    conversation.lastMessagePreview = text;
    conversation.lastMessageAt = new Date();
    await this.conversationsRepository.save(conversation);

    const saved = await this.messagesRepository.findOne({
      where: { id: message.id },
      relations: { sender: true },
    });

    this.logger.log(
      domainLog({
        action: 'chat.send',
        userId: auth.userId,
        conversationId,
        module: 'chat',
      }),
    );

    return this.toMessageDto(saved!);
  }

  async markConversationRead(
    auth: AuthenticatedUser,
    conversationId: string,
  ): Promise<void> {
    const conversation = await this.findConversationOrThrow(conversationId);
    this.assertParticipant(auth.userId, conversation);

    await this.messagesRepository
      .createQueryBuilder()
      .update(MessageEntity)
      .set({ isRead: true })
      .where('conversation_id = :conversationId', { conversationId })
      .andWhere('sender_id != :userId', { userId: auth.userId })
      .andWhere('is_read = false')
      .execute();
  }

  private assertParticipant(
    userId: string,
    conversation: ConversationEntity,
  ): void {
    if (
      conversation.assistantId !== userId &&
      conversation.participantId !== userId
    ) {
      throw new ForbiddenException();
    }
  }

  private async findConversationOrThrow(
    id: string,
  ): Promise<ConversationEntity> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id },
      relations: {
        assistant: { userRoles: { role: true } },
        participant: { userRoles: { role: true } },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  private toMessageDto(message: MessageEntity): MessageResponseDto {
    return {
      id: message.id,
      senderId: message.senderId,
      senderName: message.sender?.name ?? '',
      text: message.text,
      timestamp: message.createdAt.toISOString(),
      isRead: message.isRead,
    };
  }
}
