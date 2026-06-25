import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ example: '66666666-6666-6666-6666-666666666601' })
  id!: string;

  @ApiProperty({ example: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' })
  senderId!: string;

  @ApiProperty({ example: 'Carlos Padre' })
  senderName!: string;

  @ApiProperty({ example: 'Gracias por el aviso' })
  text!: string;

  @ApiProperty({ example: '2026-06-13T10:30:00.000Z' })
  timestamp!: string;

  @ApiProperty({ example: true })
  isRead!: boolean;
}

export class ConversationResponseDto {
  @ApiProperty({ example: '55555555-5555-5555-5555-555555555501' })
  id!: string;

  @ApiProperty({ example: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' })
  participantId!: string;

  @ApiProperty({ example: 'Carlos Padre' })
  participantName!: string;

  @ApiProperty({ example: 'padre' })
  participantRole!: string;

  @ApiProperty({ example: 'CP' })
  participantInitials!: string;

  @ApiProperty({ example: '#3B82F6' })
  participantColor!: string;

  @ApiProperty({ example: 'Gracias por el aviso' })
  lastMessage!: string;

  @ApiProperty({ example: '2026-06-13T10:30:00.000Z' })
  lastTimestamp!: string;

  @ApiProperty({ example: 0 })
  unreadCount!: number;

  @ApiProperty({ type: [MessageResponseDto] })
  messages!: MessageResponseDto[];
}
