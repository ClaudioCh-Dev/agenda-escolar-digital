import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequirePermission } from '../iam/decorators/require-permission.decorator';
import { ApiSuccess } from '../shared';
import { ChatService } from './chat.service';
import {
  ConversationResponseDto,
  MessageResponseDto,
} from './dto/chat-response.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @RequirePermission('chat.read')
  async list(
    @CurrentUser() auth: AuthenticatedUser,
  ): Promise<ApiSuccess<ConversationResponseDto[]>> {
    return new ApiSuccess(await this.chatService.listConversations(auth));
  }

  @Get(':id/messages')
  @RequirePermission('chat.read')
  async getMessages(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<MessageResponseDto[]>> {
    return new ApiSuccess(await this.chatService.getMessages(auth, id));
  }

  @Post(':id/messages')
  @RequirePermission('chat.send')
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
  async markRead(
    @CurrentUser() auth: AuthenticatedUser,
    @Param('id') id: string,
  ): Promise<ApiSuccess<null>> {
    await this.chatService.markConversationRead(auth, id);
    return new ApiSuccess(null);
  }
}
