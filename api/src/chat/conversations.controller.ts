import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import {
  ApiEnvelopeCreated,
  ApiEnvelopeNullOk,
  ApiEnvelopeOk,
  ApiNotFoundError,
  ApiProtectedErrors,
} from '../shared/swagger';
import {
  CONVERSATION_EXAMPLE,
  MESSAGE_EXAMPLE,
} from '../shared/swagger/examples';
import { ChatService } from './chat.service';
import {
  ConversationResponseDto,
  MessageResponseDto,
} from './dto/chat-response.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @RequirePermission('chat.read')
  @ApiOperation({
    summary: 'Listar conversaciones',
    description: 'Permiso: chat.read',
  })
  @ApiEnvelopeOk(ConversationResponseDto, {
    isArray: true,
    example: [CONVERSATION_EXAMPLE],
  })
  @ApiProtectedErrors()
  async list(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<ConversationResponseDto[]>> {
    return new ApiSuccess(await this.chatService.listConversations(auth));
  }

  @Get(':id/messages')
  @RequirePermission('chat.read')
  @ApiParam({ name: 'id', example: '55555555-5555-5555-5555-555555555501' })
  @ApiOperation({ summary: 'Mensajes de una conversación' })
  @ApiEnvelopeOk(MessageResponseDto, {
    isArray: true,
    example: [MESSAGE_EXAMPLE],
  })
  @ApiNotFoundError('Conversación no encontrada')
  @ApiProtectedErrors()
  async getMessages(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<MessageResponseDto[]>> {
    return new ApiSuccess(await this.chatService.getMessages(auth, id));
  }

  @Post(':id/messages')
  @RequirePermission('chat.send')
  @ApiParam({ name: 'id', example: '55555555-5555-5555-5555-555555555501' })
  @ApiOperation({
    summary: 'Enviar mensaje',
    description: 'Permiso: chat.send',
  })
  @ApiEnvelopeCreated(MessageResponseDto, { example: MESSAGE_EXAMPLE })
  @ApiNotFoundError('Conversación no encontrada')
  @ApiProtectedErrors()
  async sendMessage(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
  ): Promise<ApiSuccess<MessageResponseDto>> {
    return new ApiSuccess(
      await this.chatService.sendMessage(auth, id, dto.text),
    );
  }

  @Patch(':id/read')
  @RequirePermission('chat.read')
  @ApiParam({ name: 'id', example: '55555555-5555-5555-5555-555555555501' })
  @ApiOperation({ summary: 'Marcar conversación como leída' })
  @ApiEnvelopeNullOk('Conversación marcada como leída')
  @ApiNotFoundError('Conversación no encontrada')
  @ApiProtectedErrors()
  async markRead(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.chatService.markConversationRead(auth, id);
    return new ApiSuccess(null);
  }
}
