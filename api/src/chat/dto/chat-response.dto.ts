export class MessageResponseDto {
  id!: string;
  senderId!: string;
  senderName!: string;
  text!: string;
  timestamp!: string;
  isRead!: boolean;
}

export class ConversationResponseDto {
  id!: string;
  participantId!: string;
  participantName!: string;
  participantRole!: string;
  participantInitials!: string;
  participantColor!: string;
  lastMessage!: string;
  lastTimestamp!: string;
  unreadCount!: number;
  messages!: MessageResponseDto[];
}
