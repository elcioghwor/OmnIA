import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
} from '@nestjs/common';

import type { Response } from 'express';
import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ConversationService } from '../conversation/conversation.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly conversationService: ConversationService,
  ) { }

  @Post()
  async chat(@Body() dto: ChatRequestDto) {
    const response = await this.chatService.chat(dto);

    return {
      success: true,
      response,
    };
  }

  @Post('stream')
  async stream(
    @Body() dto: ChatRequestDto,
    @Res() res: Response,
  ): Promise<void> {

    res.status(200);

    res.setHeader(
      'Content-Type',
      'text/event-stream; charset=utf-8',
    );

    res.setHeader(
      'Cache-Control',
      'no-cache, no-transform',
    );

    res.setHeader(
      'Connection',
      'keep-alive',
    );

    res.setHeader(
      'X-Accel-Buffering',
      'no',
    );

    res.flushHeaders();

    try {

      const conversationId =
        await this.chatService.stream(
          dto,
          (chunk) => {
            res.write(
              `data: ${JSON.stringify({
                type: 'token',
                content: chunk,
              })}\n\n`,
            );
          },
        );

      res.write(
        `data: ${JSON.stringify({
          type: 'conversation',
          conversationId,
        })}\n\n`,
      );

      res.write(
        `data: ${JSON.stringify({
          type: 'done',
        })}\n\n`,
      );

    } catch (error) {

      console.error(
        'Erro durante o streaming:',
        error,
      );

      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message:
            'Erro ao processar a mensagem.',
        })}\n\n`,
      );

    } finally {

      res.end();
    }
  }

  /*temporario*/

  @Get('conversation')
  async createConversation() {
    return this.conversationService.create(
      'Nova conversa',
    );
  }

  @Get('conversation/:id/messages')
  async getMessages(
    @Param('id') id: string,
  ) {
    return this.conversationService.getMessages(
      Number(id),
    );
  }


}